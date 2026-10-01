import { describe, expect, it } from 'vitest'
import { curriculumLanguages } from '@/lib/rhythm/curriculum/localized'
import { splitBold } from './rich-text'
import { theoryVocabulary } from './bars'
import { drumTheorySource, getDrumTheory, getDrumTheoryLesson } from './index'
import { drumStageIds, validateDrumTheory } from './types'

/*
  Testele manualului de tobe, după modelul celor de la ritm
  (`lib/rhythm/curriculum/rhythm.test.ts` și `localization.test.ts`).

  Ce prind ele e exact ce TypeScript nu poate prinde: o lecție într-o etapă care
  nu există, un exemplu cu tempoul în afara intervalului (cade la randare, în
  fața elevului), o trimitere către o lecție de ritm ștearsă între timp și un
  text rămas într-o singură limbă.
*/

describe('manualul de tobe', () => {
  it('trece validarea, cu exemplele randabile pe kit', () => {
    expect(validateDrumTheory(drumTheorySource, theoryVocabulary)).toEqual([])
  })

  it('are etapele în ordinea din plan, fiecare o singură dată', () => {
    expect(drumTheorySource.stages.map((stage) => stage.id)).toEqual([...drumStageIds])
  })

  it('fiecare lecție stă într-o etapă declarată', () => {
    const stages = new Set(drumTheorySource.stages.map((stage) => stage.id))
    for (const lesson of drumTheorySource.lessons) {
      expect(stages.has(lesson.stage), lesson.id).toBe(true)
    }
  })

  it('fiecare text există în toate limbile conținutului', () => {
    // Nu se compară cu engleza: o traducere egală cu originalul e adesea corectă
    // ("Hi-hat"). Se verifică doar că există și că nu e goală.
    const missing: string[] = []
    const check = (path: string, text: Record<string, string>) => {
      for (const language of curriculumLanguages) {
        if (!text[language]?.trim()) missing.push(`${path} [${language}]`)
      }
    }
    for (const stage of drumTheorySource.stages) {
      check(`${stage.id}.title`, stage.title)
      check(`${stage.id}.subtitle`, stage.subtitle)
    }
    for (const lesson of drumTheorySource.lessons) {
      check(`${lesson.id}.title`, lesson.title)
      check(`${lesson.id}.goal`, lesson.goal)
      for (const section of lesson.sections) {
        const at = `${lesson.id}/${section.id}`
        check(`${at}.heading`, section.heading)
        check(`${at}.body`, section.body)
        if (section.example) check(`${at}.example.caption`, section.example.caption)
        section.terms?.forEach((entry, index) => {
          check(`${at}.terms[${index}].term`, entry.term)
          check(`${at}.terms[${index}].meaning`, entry.meaning)
        })
      }
    }
    expect(missing).toEqual([])
  })

  it('îngroșările din text sunt perechi închise', () => {
    // Un `**` rămas nepereche nu strică nimic vizibil la ritm, dar aici ar lăsa
    // asteriscurile pe ecran: `splitBold` nu le scoate decât în pereche.
    for (const lesson of drumTheorySource.lessons) {
      for (const section of lesson.sections) {
        for (const language of curriculumLanguages) {
          const body = section.body[language]
          expect((body.match(/\*\*/g) ?? []).length % 2, `${lesson.id}/${section.id} [${language}]`).toBe(0)
        }
      }
    }
  })

  it('se rezolvă pe limbă, cu același obiect la fiecare cerere', () => {
    expect(getDrumTheory('ro')).toBe(getDrumTheory('ro-RO'))
    // Orice nu e română cade pe engleză, ca la restul conținutului.
    expect(getDrumTheory('fr')).toBe(getDrumTheory('en'))
    expect(getDrumTheory('ro')).not.toBe(getDrumTheory('en'))
  })

  it('găsește o lecție după id și întoarce null pentru una inexistentă', () => {
    expect(getDrumTheoryLesson('ro', 'setul-si-piesele')?.title).toBe('Setul și piesele')
    expect(getDrumTheoryLesson('en', 'setul-si-piesele')?.title).toBe('The kit and its pieces')
    expect(getDrumTheoryLesson('ro', 'nu-exista')).toBeNull()
  })
})

describe('trimiterile către Ritm', () => {
  /*
    Verificate pe un manual sintetic, nu pe curriculumul de ritm adevărat.

    Nu din comoditate: forma curriculumului diferă între sandbox și aplicație,
    în sandbox e o categorie, în aplicație una pe limbă, iar un test care ar
    importa-o n-ar mai putea fi mutat dintr-o parte în alta cu un `cp`, adică
    exact regula pe care o cere INTEGRARE.md. Aici se verifică GARDA; faptul că
    id-urile chiar există se verifică la prima lecție care trimite undeva, cu
    lista adevărată dată din afară.
  */
  const lesson = drumTheorySource.lessons[0]!

  it('acceptă o trimitere către o lecție care există', () => {
    const theory = {
      stages: drumTheorySource.stages,
      lessons: [{ ...lesson, requiresRhythmLesson: 'triolete' }],
    }
    expect(validateDrumTheory(theory, theoryVocabulary, ['puls', 'triolete'])).toEqual([])
  })

  it('reclamă o trimitere către o lecție ștearsă între timp', () => {
    const theory = {
      stages: drumTheorySource.stages,
      lessons: [{ ...lesson, requiresRhythmLesson: 'nu-mai-exista' }],
    }
    expect(validateDrumTheory(theory, theoryVocabulary, ['puls', 'triolete'])).toEqual([
      `${lesson.id}: trimite la lecția de ritm nu-mai-exista, care nu există`,
    ])
  })

  it('nu verifică nimic dacă nu primește lista de lecții de ritm', () => {
    const theory = {
      stages: drumTheorySource.stages,
      lessons: [{ ...lesson, requiresRhythmLesson: 'nu-mai-exista' }],
    }
    expect(validateDrumTheory(theory, theoryVocabulary)).toEqual([])
  })
})

describe('splitBold', () => {
  it('scoate marcajul și îngroașă doar ce era între asteriscuri', () => {
    expect(splitBold('Un **crash** se lovește rar.')).toEqual([
      { text: 'Un ', bold: false },
      { text: 'crash', bold: true },
      { text: ' se lovește rar.', bold: false },
    ])
  })

  it('lasă textul neatins când nu are marcaje', () => {
    expect(splitBold('Fără nimic îngroșat.')).toEqual([{ text: 'Fără nimic îngroșat.', bold: false }])
  })
})
