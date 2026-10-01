import { describe, expect, it } from 'vitest'
import { categories } from './rhythm'
import { planRoundTrack } from '../audio/round-plan'
import { TICKS_PER_BEAT, isCompleteBars, tokenSpan, totalSpan } from '../game/notation-tokens'

/**
 * Lectiile sunt date scrise de mana, cu pattern-uri notate ca siruri. O
 * greseala de tipar acolo nu da eroare de compilare, dar strica lectia - de
 * aceea le validam ca pe orice alta intrare.
 */
describe('curriculum de ritm', () => {
  const lessons = categories.flatMap((category) => category.lessons)

  it('are lectii cu id unic', () => {
    const ids = lessons.map((lesson) => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('fiecare lectie are cate cinci tempo-uri distincte', () => {
    lessons.forEach((lesson) => {
      expect(lesson.practice.tempos).toHaveLength(5)
      expect(new Set(lesson.practice.tempos).size).toBe(5)
      lesson.practice.tempos.forEach((bpm) => {
        expect(bpm).toBeGreaterThanOrEqual(40)
        expect(bpm).toBeLessThanOrEqual(140)
      })
    })
  })

  it('pattern-urile de exersat umplu masuri intregi si intra din primul timp', () => {
    lessons.forEach((lesson) => {
      const { patterns, stepsPerBar } = lesson.practice
      const beatsPerBar = lesson.practice.beatsPerBar ?? 4
      expect(patterns.length).toBeGreaterThan(0)
      patterns.forEach((steps) => {
        expect(steps.length % stepsPerBar).toBe(0)
        expect(steps.filter(Boolean).length).toBeGreaterThanOrEqual(1)
        // Nu cerem intrarea pe „unu" - lectia de contratimp incepe tocmai
        // intre timpi. Cerem doar ca prima nota sa cada in primul timp, ca
        // elevul sa nu astepte in gol dupa numaratoare.
        const firstHit = steps.indexOf(true)
        expect(firstHit).toBeGreaterThanOrEqual(0)
        expect(firstHit).toBeLessThan(stepsPerBar / beatsPerBar)
      })
    })
  })

  it('exemplele ascultate sunt la randul lor masuri intregi', () => {
    lessons.forEach((lesson) => {
      lesson.sections.forEach((section) => {
        if (!section.example) return
        expect(section.example.steps.length % section.example.stepsPerBar).toBe(0)
        expect(section.example.steps.some(Boolean)).toBe(true)
      })
    })
  })

  it('fiecare lectie explica ceva inainte sa ceara ceva', () => {
    lessons.forEach((lesson) => {
      expect(lesson.sections.length).toBeGreaterThan(0)
      lesson.sections.forEach((section) => {
        expect(section.heading.length).toBeGreaterThan(0)
        expect(section.body.length).toBeGreaterThan(40)
      })
      expect(lesson.practice.instruction.length).toBeGreaterThan(0)
    })
  })

  it('fiecare combinatie pattern/tempo produce o pista redabila', () => {
    lessons.forEach((lesson) => {
      lesson.practice.tempos.forEach((bpm, index) => {
        const pattern = lesson.practice.patterns[index % lesson.practice.patterns.length]!
        const plan = planRoundTrack({
          bpm,
          stepsPerBar: lesson.practice.stepsPerBar,
          beatsPerBar: lesson.practice.beatsPerBar,
          pattern,
          countInBars: 1,
          prepBars: 1,
        })
        expect(plan.targetTimesMs.length).toBe(pattern.filter(Boolean).length)
        expect(plan.totalMs).toBeGreaterThan(plan.responseStartMs)
        // Tintele trebuie sa incapa in fereastra de raspuns.
        plan.targetTimesMs.forEach((time) => {
          expect(time).toBeGreaterThanOrEqual(plan.responseStartMs)
          expect(time).toBeLessThan(plan.totalMs)
        })
      })
    })
  })
})

describe('masurile cu alt numar de timpi', () => {
  const lessons = categories.flatMap((category) => category.lessons)

  it('o masura de 2/4 are jumatate din pasii uneia de 4/4', () => {
    const douaPatru = lessons.find((lesson) => lesson.id === 'masura-2-4')
    expect(douaPatru).toBeDefined()
    expect(douaPatru!.practice.beatsPerBar).toBe(2)
    expect(douaPatru!.practice.stepsPerBar).toBe(TICKS_PER_BEAT * 2)
  })

  it('in 6/8 timpul e patrimea punctata, nu optimea', () => {
    const sase = lessons.find((lesson) => lesson.id === 'masura-6-8')
    expect(sase).toBeDefined()
    // Sase optimi = 36 de pasi, dar doi timpi: 18 pasi de timp, adica exact
    // o patrime punctata. Daca cineva ar scrie `beatsPerBar: 6`, metronomul
    // ar bate sase timpi egali si lectia s-ar contrazice singura.
    expect(sase!.practice.stepsPerBar).toBe(36)
    expect(sase!.practice.beatsPerBar).toBe(2)
    const pasiPeTimp = sase!.practice.stepsPerBar / sase!.practice.beatsPerBar!
    expect(pasiPeTimp).toBe(tokenSpan('dottedQuarter'))
  })

  it('3/4 si 6/8 au masuri la fel de lungi, dar se bat altfel', () => {
    const trei = lessons.find((lesson) => lesson.id === 'masura-3-4')!
    const sase = lessons.find((lesson) => lesson.id === 'masura-6-8')!
    // Aceeasi lungime de masura - asta e chiar lectia: aceleasi sase optimi.
    expect(trei.practice.stepsPerBar).toBe(sase.practice.stepsPerBar)
    // Dar gruparea difera, deci si metronomul.
    expect(trei.practice.beatsPerBar).toBe(3)
    expect(sase.practice.beatsPerBar).toBe(2)

    const comun = { bpm: 60, countInBars: 0, prepBars: 0, playPattern: false } as const
    const pattern = Array.from({ length: 36 }, (_, i) => i % 6 === 0)
    const clickuri = (beatsPerBar: number) =>
      planRoundTrack({ ...comun, stepsPerBar: 36, beatsPerBar, pattern })
        .events.filter((event) => event.voice !== 'hit')
        .map((event) => Math.round(event.atMs))
    // In 3/4 metronomul bate de trei ori pe masura, in 6/8 de doua ori.
    expect(clickuri(3)).toHaveLength(3)
    expect(clickuri(2)).toHaveLength(2)
  })

  it('cele sase optimi din 6/8 ies egale si umplu masura', () => {
    const sase = lessons.find((lesson) => lesson.id === 'masura-6-8')!
    const optimi = sase.practice.patterns[0]!
    const plan = planRoundTrack({
      bpm: 60,
      stepsPerBar: sase.practice.stepsPerBar,
      beatsPerBar: sase.practice.beatsPerBar,
      pattern: optimi,
      countInBars: 1,
      prepBars: 1,
    })
    expect(plan.targetTimesMs).toHaveLength(6)
    const intervale = plan.targetTimesMs
      .slice(1)
      .map((value, index) => value - plan.targetTimesMs[index]!)
    // La 60 de patrimi punctate pe minut, un timp e 1000 ms si o optime 333.33.
    intervale.forEach((interval) => expect(interval).toBeCloseTo(1000 / 3, 6))
  })

  it('patrimea tine la fel in 2/4 si in 4/4 - se muta doar bara', () => {
    // Acelasi sir de patru patrimi, redat o data ca doua masuri de 2/4 si o
    // data ca una de 4/4. Daca `beatsPerBar` ar schimba lungimea pasului,
    // tintele ar iesi la alte momente - si asta ar fi o lectie mincinoasa.
    const pattern = Array.from({ length: 48 }, (_, i) => i % 12 === 0)
    const comun = { bpm: 90, pattern, countInBars: 1, prepBars: 1 } as const
    const douaPatru = planRoundTrack({ ...comun, stepsPerBar: 24, beatsPerBar: 2 })
    const patruPatru = planRoundTrack({ ...comun, stepsPerBar: 48, beatsPerBar: 4 })
    expect(douaPatru.stepMs).toBeCloseTo(patruPatru.stepMs, 9)
    // Numaratoarea de dinainte tine o masura, deci in 2/4 e mai scurta si tot
    // ce urmeaza incepe mai devreme - cu exact doi timpi.
    const unTimpMs = 60_000 / 90
    expect(patruPatru.responseStartMs - douaPatru.responseStartMs).toBeCloseTo(4 * unTimpMs, 6)
    // Distantele dintre tinte raman insa identice: patrimea nu s-a schimbat.
    // Comparam cu toleranta, ca peste tot unde masuram timpi: diferentele
    // ramase sunt de ordinul a 10^-12 ms, adica zero.
    const distante = (times: number[]) => times.slice(1).map((t, i) => t - times[i]!)
    const aDouaPatru = distante(douaPatru.targetTimesMs)
    const aPatruPatru = distante(patruPatru.targetTimesMs)
    expect(aDouaPatru).toHaveLength(aPatruPatru.length)
    aDouaPatru.forEach((value, index) => expect(value).toBeCloseTo(aPatruPatru[index]!, 9))
  })
})

describe('duratele din exercitii', () => {
  const lessons = categories.flatMap((category) => category.lessons)

  it('cand sunt date, exista cate o durata pentru fiecare nota', () => {
    lessons.forEach((lesson) => {
      const { patterns, patternDurations } = lesson.practice
      if (!patternDurations) return
      expect(patternDurations).toHaveLength(patterns.length)
      patterns.forEach((steps, index) => {
        const durations = patternDurations[index]!
        expect(durations).toHaveLength(steps.filter(Boolean).length)
        durations.forEach((value) => expect(value).toBeGreaterThan(0))
      })
    })
  })

  it('duratele umplu masura, fara suprapuneri si fara goluri', () => {
    lessons.forEach((lesson) => {
      const { patterns, patternDurations, stepsPerBar } = lesson.practice
      if (!patternDurations) return
      patterns.forEach((steps, index) => {
        const onsets = steps.flatMap((isHit, step) => (isHit ? [step] : []))
        const durations = patternDurations[index]!
        onsets.forEach((onset, i) => {
          const end = onset + durations[i]!
          const nextOnset = onsets[i + 1] ?? steps.length
          // O nota nu poate depasi inceputul urmatoarei.
          expect(end).toBeLessThanOrEqual(nextOnset)
        })
        // Ultima nota trebuie sa ajunga la capatul masurii sau sa lase pauza.
        expect(onsets[onsets.length - 1]! + durations[durations.length - 1]!).toBeLessThanOrEqual(
          steps.length,
        )
      })
    })
  })

  it('etichetele de runda, unde exista, sunt cate una pentru fiecare pattern', () => {
    lessons.forEach((lesson) => {
      const { patterns, patternLabels } = lesson.practice
      if (!patternLabels) return
      expect(patternLabels, `lectia ${lesson.id}`).toHaveLength(patterns.length)
    })
  })

  it('acompaniamentul, unde exista, sta pe aceeasi grila cu pattern-ul', () => {
    lessons.forEach((lesson) => {
      const { patterns, backingPatterns, stepsPerBar } = lesson.practice
      if (!backingPatterns) return
      expect(backingPatterns).toHaveLength(patterns.length)
      backingPatterns.forEach((steps, index) => {
        expect(steps).toHaveLength(patterns[index]!.length)
        expect(steps.length % stepsPerBar).toBe(0)
        expect(steps.some(Boolean)).toBe(true)
      })
    })
  })

  it('liniile de notatie din lectii umplu masuri intregi', () => {
    lessons.forEach((lesson) => {
      lesson.sections.forEach((section) => {
        if (!section.rhythmLine) return
        const ticksPerBar = section.rhythmLineTicksPerBar ?? TICKS_PER_BEAT * 4
        expect(
          isCompleteBars(section.rhythmLine, ticksPerBar),
          `${lesson.id}/${section.id} are ${totalSpan(section.rhythmLine)} pași`,
        ).toBe(true)
      })
    })
  })

  it('lectia de legato chiar cere tinut peste un timp', () => {
    const legato = lessons.find((lesson) => lesson.id === 'legato')
    expect(legato).toBeDefined()
    const durations = legato!.practice.patternDurations
    expect(durations).toBeDefined()
    // Cel putin o nota tine doi timpi intregi (8 saisprezecimi).
    expect(durations!.some((bar) => bar.some((value) => value >= 8))).toBe(true)
  })
})

describe('poliritmul', () => {
  const lessons = categories.flatMap((category) => category.lessons)
  const poli = lessons.find((lesson) => lesson.id === 'poliritm')

  it('are cate un flux de acompaniament pentru fiecare pattern', () => {
    expect(poli).toBeDefined()
    const { patterns, backingPatterns } = poli!.practice
    expect(backingPatterns).toBeDefined()
    expect(backingPatterns).toHaveLength(patterns.length)
    patterns.forEach((steps, index) => {
      // Aceeasi grila si aceeasi lungime: altfel cele doua fluxuri ar fi
      // scrise in masuri diferite si nu s-ar mai regasi la bara.
      expect(backingPatterns![index]).toHaveLength(steps.length)
    })
  })

  it('cele doua fluxuri se ating doar pe „unu"', () => {
    const { patterns, backingPatterns } = poli!.practice
    patterns.forEach((steps, index) => {
      const acompaniament = backingPatterns![index]!
      const comune = steps.flatMap((isHit, step) =>
        isHit && acompaniament[step] ? [step] : [],
      )
      // Doar inceputurile de masura. Daca s-ar atinge si altundeva, cele doua
      // fluxuri ar avea un divizor comun si n-ar mai fi poliritm.
      comune.forEach((step) => expect(step % poli!.practice.stepsPerBar).toBe(0))
      expect(comune.length).toBe(steps.length / poli!.practice.stepsPerBar)
    })
  })

  it('fiecare runda spune ce fel de poliritm e', () => {
    const { patterns, patternLabels } = poli!.practice
    expect(patternLabels).toBeDefined()
    expect(patternLabels).toHaveLength(patterns.length)
    patternLabels!.forEach((label) => expect(label.length).toBeGreaterThan(0))
  })

  it('eticheta rundei spune chiar raportul care se aude', () => {
    const { patterns, backingPatterns, patternLabels, stepsPerBar } = poli!.practice
    patterns.forEach((steps, index) => {
      const bars = steps.length / stepsPerBar
      const aleTale = steps.filter(Boolean).length / bars
      const aleLui = backingPatterns![index]!.filter(Boolean).length / bars
      // Eticheta incepe cu „<ale tale> contra <ale lui>". Daca cineva schimba
      // pattern-ul fara eticheta, testul prinde minciuna.
      expect(patternLabels![index]).toMatch(new RegExp(`^${aleTale} contra ${aleLui}\\b`))
    })
  })

  it('grila desenata arata acelasi raport ca exemplul ascultat', () => {
    poli!.sections.forEach((section) => {
      if (!section.grid || !section.gridSecondary) return
      expect(section.grid).toHaveLength(section.gridSecondary.length)
      const sus = section.grid.filter((cell) => cell.filled).length
      const jos = section.gridSecondary.filter((cell) => cell.filled).length
      const example = section.example
      expect(example, `${section.id} are grila dar n-are exemplu`).toBeDefined()
      // Imaginea si sunetul trebuie sa spuna acelasi lucru: daca desenul arata
      // 3 peste 2 iar exemplul suna 3 peste 4, lectia se contrazice singura.
      expect(example!.steps.filter(Boolean).length).toBe(sus)
      expect(example!.backing!.filter(Boolean).length).toBe(jos)
    })
  })

  it('nu cere tinut apasat: sunt atacuri, nu durate', () => {
    // Fluxurile sunt note egale de percutie, nu notatie cu durata scrisa.
    // Cerand tinerea, am inventa o sarcina pe care notatia nu o specifica.
    expect(poli!.practice.patternDurations).toBeUndefined()
  })
})

describe('dictionarul din cheat sheet', () => {
  const lessons = categories.flatMap((category) => category.lessons)
  const entries = lessons.flatMap((lesson) =>
    lesson.reference.map((entry) => ({ ...entry, lesson: lesson.id })),
  )

  it('fiecare lectie introduce cel putin o notiune', () => {
    lessons.forEach((lesson) => {
      expect(lesson.reference.length, `lectia ${lesson.id}`).toBeGreaterThan(0)
    })
  })

  it('termenii nu se repeta intre lectii', () => {
    const terms = entries.map((entry) => entry.term.toLowerCase())
    const duplicate = terms.find((term, index) => terms.indexOf(term) !== index)
    expect(duplicate, `termen duplicat: ${duplicate}`).toBeUndefined()
  })

  it('explicatiile sunt propozitii, nu etichete', () => {
    entries.forEach((entry) => {
      expect(entry.term.length, entry.term).toBeGreaterThan(2)
      expect(entry.meaning.length, entry.term).toBeGreaterThan(25)
    })
  })

  it('acopera notiunile predate in lectiile noi', () => {
    const terms = entries.map((entry) => entry.term.toLowerCase())
    // Lectiile 8-11 aduceau notiuni care lipseau din cheat sheet.
    expect(terms).toContain('sincopă')
    expect(terms).toContain('legătură')
    expect(terms).toContain('punct')
    expect(terms).toContain('triolet')
    expect(terms).toContain('sextolet')
    expect(terms).toContain('2/4')
    expect(terms).toContain('3/4')
    expect(terms).toContain('6/8')
    expect(terms).toContain('poliritm')
  })
})
