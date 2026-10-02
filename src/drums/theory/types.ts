import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { validateBassLine, type BassLine } from '../bass'
import type { DrumQuiz } from './quiz'
import { validateExercise, type DrumExercise, type Vocabulary } from '../exercise'

/*
  Manualul de tobe, ca date. Nimic din UI, niciun audio.

  Forma e luată de la curriculumul de ritm (`lib/rhythm/curriculum/types.ts`),
  pentru că acolo a funcționat: o lecție e un șir de secțiuni, fiecare cu un
  titlu, un text și cel mult un lucru de văzut sau de auzit. Parametrul `Text`
  joacă același rol, `LocalizedText` în sursă, `string` după rezolvare, deci un
  câmp de text nou care nu trece prin `resolve.ts` rămâne `LocalizedText` și nu
  mai compilează.

  Ce NU se ia de la ritm e exercițiul: acolo o lecție se termină cu bătut pe
  ecran și cu scor, aici lecția doar explică. Verificarea înțelegerii (quiz-ul)
  vine separat, în Etapa B din PLAN-TEORIE-TOBE.md §8, și are formatul ei.
*/

/**
 * Cele opt etape ale manualului (PLAN-TEORIE-TOBE.md §4).
 *
 * Nume, nu numere: „Etapa 3" nu-i spune nimănui nimic, „Groove-ul" spune. Id-ul
 * e stabil și intră în progres, deci nu se redenumește ca să sune mai bine.
 */
export const drumStageIds = [
  'instrument',
  'notation',
  'hands',
  'groove',
  'form',
  'styles',
  'advanced',
  'musician',
] as const
export type DrumStageId = (typeof drumStageIds)[number]

export interface DrumStage<Text = string> {
  id: DrumStageId
  title: Text
  /** Ce se învață în etapă, într-o propoziție. Se citește pe hartă. */
  subtitle: Text
  /** Culoarea porțiunii de drum. Etapele se deosebesc la privit, nu la citit. */
  accent: string
  soft: string
  border: string
}

/**
 * Un exemplu ascultabil.
 *
 * Aici stă diferența față de o carte: exemplul nu e o poză, e un exercițiu
 * adevărat, randat pe kitul real (`lib/drums/render.ts`). Nimeni nu înregistrează
 * nimic, orice pattern scris într-o lecție se poate asculta, în orice tempo.
 */
export interface DrumExample<Text = string> {
  caption: Text
  /** Tempoul la care se aude. Trebuie să cadă în intervalul exercițiului. */
  bpm: number
  exercise: DrumExercise
  /**
   * Grila de sub buton. Implicit se desenează.
   *
   * Oprită doar când lecția e despre SUNET, nu despre scris: la „cum sună toba
   * mare", o grilă cu un singur rând nu explică nimic și cere cititorului să
   * descifreze o notație pe care încă n-a învățat-o (aia e Etapa 1).
   */
  showGrid?: boolean
  /**
   * Desenul setului sub buton, cu piesele aprinzându-se pe măsură ce sună.
   *
   * Pentru lecțiile despre instrument, unde prima întrebare e „de unde vine
   * sunetul ăsta?". Grila răspunde CÂND cade lovitura, desenul răspunde PE CE,
   * iar până la Etapa 1 elevul încă nu poate citi un rând de pătrate.
   *
   * Nu se pune peste tot: la o lecție despre subdiviziuni, setul nu adaugă
   * nimic și mai ia un ecran de derulat.
   */
  showKit?: boolean
  /**
   * Rândul de mâini de sub buton: o celulă pe pas, R sau L în ea.
   *
   * Pentru Etapa „Mâinile", unde subiectul chiar E cu ce mână se lovește. Acolo
   * grila ar desena un singur rând de tobă mică, identic la toate exemplele,
   * adică un desen care nu deosebește un paradiddle de un single stroke roll,
   * deși aia e toată lecția. Rândul de mâini o deosebește, și tot el arată
   * accentele și ornamentele, care la rudimente sunt jumătate din figură.
   *
   * Nu se pune nicăieri unde sticking-ul nu e declarat: s-ar desena un șir de
   * puncte.
   */
  showSticking?: boolean
  /**
   * Portativul de sub buton, în locul grilei sau lângă ea.
   *
   * Pentru Etapa 1, unde subiectul chiar E scrisul. Restul manualului rămâne pe
   * grilă: portativul cere să știi deja unde stă fiecare piesă, iar până la
   * lecția care o predă ar fi o notație în plus de descifrat, nu una în plus de
   * înțeles.
   *
   * Pus împreună cu `showGrid`, dă puntea cu care se termină etapa: aceeași
   * măsură, în amândouă, una sub alta.
   */
  showStaff?: boolean
  /**
   * Linia de bas cântată odată cu tobele, pe aceeași grilă (`bass.ts`).
   *
   * Pentru Etapa „Muzician”, unde subiectul e ce face toba mare FAȚĂ de bas.
   * Se desenează și un rând cu notele, deasupra grilei, ca să se vadă unde cad
   * una față de alta, nu doar să se audă.
   */
  bass?: BassLine
  /**
   * Pe ce timpi bate clicul, pe măsură (de la 1). Se reia ciclic peste măsurile
   * exercițiului.
   *
   * Pentru lecția despre clic, unde subiectul chiar E clicul: pe fiecare timp,
   * apoi pe 2 și 4, apoi doar pe „unu”. Cu el setat, metronomul e mereu pornit
   * și comutatorul lui nu se mai arată: un exemplu despre clic fără clic n-ar
   * spune nimic.
   */
  click?: number[][]
  /**
   * Butonul „Cânți tu”: tobele tac, rămân clicul și basul, iar elevul cântă
   * peste ele. Grila și desenul merg mai departe, deci arată ce ar fi trebuit
   * să cadă unde.
   *
   * E partea practică a lecțiilor de ascultare, unde nu există un exercițiu de
   * practică propriu-zis: ai auzit cum sună, acum ții tu.
   */
  playAlong?: boolean
  /**
   * Notația (portativul, grila) pornește ascunsă, sub un buton „Arată notația”,
   * iar desenul setului nu se aprinde până atunci.
   *
   * Pentru transcriere: dacă răspunsul e la vedere, exercițiul de a scrie după
   * ureche devine unul de copiat. Și setul aprins ar fi un răspuns: spune ce
   * piesă sună, adică exact ce trebuie auzit.
   */
  reveal?: boolean
  /**
   * Chart-ul piesei: o intrare pe fiecare măsură a exercițiului, desenată ca pe
   * o partitură de trupă (bare oblice, fill-uri, lovituri), cu măsura care se
   * aude aprinsă.
   */
  chart?: ChartBar<Text>[]
}

/** O măsură de chart, cum o scrie un aranjor, nu cum o cântă toboșarul. */
export interface ChartBar<Text = string> {
  /** Numele părții care începe aici („Strofă”, „Refren”). */
  label?: Text
  /**
   * `groove`, bare oblice: cântă groove-ul.
   * `fill`, măsura de fill.
   * `hits`, loviturile trupei, scrise pe optimi în `hits`.
   */
  kind: 'groove' | 'fill' | 'hits'
  /** Doar la `hits`: opt caractere, `x` unde lovește trupa. */
  hits?: string
}

/**
 * Un desen de care are nevoie secțiunea, numit, nu componentul însuși.
 *
 * Datele rămân date: un `ReactNode` aici ar trage interfața în curriculum și ar
 * face conținutul imposibil de validat într-un test care rulează în Node.
 * Ecranul traduce numele în desen, exact cum traduce `example` în player.
 *
 * `kit`, diagrama setului, cu piesele atingibile (`KitDiagram`).
 * `staff`, cheia portativului: unde stă fiecare piesă (`DrumStaffKey`).
 * `heads`, felurile de lovitură ale tobei mici, ca legendă (`DrumHeadsKey`).
 */
export type DrumVisual = 'kit' | 'staff' | 'heads'

/** Un termen introdus de lecție, cu explicația lui. */
export interface DrumTerm<Text = string> {
  term: Text
  meaning: Text
}

/** Un pas de lecție: se explică ceva și, dacă are sens, se și aude. */
export interface DrumTheorySection<Text = string> {
  id: string
  heading: Text
  body: Text
  example?: DrumExample<Text>
  /** Desenul de deasupra textului, când noțiunea are nevoie de un reper vizual. */
  visual?: DrumVisual
  /** Vocabularul introdus aici. Parte din lecție, nu o listă ținută separat. */
  terms?: DrumTerm<Text>[]
}

export interface DrumTheoryLesson<Text = string> {
  id: string
  stage: DrumStageId
  title: Text
  goal: Text
  /**
   * Lecția de ritm pe care se sprijină asta (PLAN-TEORIE-TOBE.md §1).
   *
   * Ritmul predă *timpul*, tobele predau *instrumentul*. Când o lecție de tobe
   * are nevoie de o noțiune de timp, o trimite acolo, nu o repetă, altfel
   * șaisprezecimile ajung scrise a treia oară și cele două module se contrazic
   * în tăcere după primul an. Un test verifică faptul că id-ul chiar există.
   */
  requiresRhythmLesson?: string
  sections: DrumTheorySection<Text>[]
}

export interface DrumTheory<Text = string> {
  stages: DrumStage<Text>[]
  /** Ordinea din fișier e ordinea de pe hartă. */
  lessons: DrumTheoryLesson<Text>[]
  /**
   * Quiz-urile: unul după fiecare lecție, unul recapitulativ la capătul fiecărei
   * etape (`quiz.ts`). Opțional doar ca manualele sintetice din teste să nu
   * trebuiască să-l scrie.
   */
  quizzes?: DrumQuiz<Text>[]
}

/**
 * Problemele găsite în manual, gata de pus în mesajul unui test. Lista goală
 * înseamnă că e bun.
 *
 * Nimic din ce se verifică aici nu e prins de TypeScript: o lecție într-o etapă
 * care nu există, două secțiuni cu același id sau un exemplu cu tempoul în afara
 * intervalului se compilează perfect și cad abia în fața elevului, ultimul,
 * chiar la randare.
 *
 * @param rhythmLessonIds Id-urile lecțiilor de ritm, ca trimiterile să poată fi
 * verificate. Fără ele, trimiterile nu se verifică.
 */
export function validateDrumTheory(
  theory: DrumTheory<LocalizedText>,
  vocabulary?: Vocabulary,
  rhythmLessonIds?: readonly string[],
): string[] {
  const problems: string[] = []
  const stages = new Set(theory.stages.map((stage) => stage.id))
  const seenStages = new Set<string>()
  for (const stage of theory.stages) {
    if (seenStages.has(stage.id)) problems.push(`etapa ${stage.id}: id repetat`)
    seenStages.add(stage.id)
  }

  const seenLessons = new Set<string>()
  for (const lesson of theory.lessons) {
    const where = (detail: string) => problems.push(`${lesson.id}: ${detail}`)
    if (seenLessons.has(lesson.id)) where('id repetat')
    seenLessons.add(lesson.id)
    if (!stages.has(lesson.stage)) where(`etapa ${lesson.stage} nu există`)
    if (lesson.sections.length === 0) where('fără secțiuni')
    if (lesson.requiresRhythmLesson && rhythmLessonIds) {
      if (!rhythmLessonIds.includes(lesson.requiresRhythmLesson)) {
        where(`trimite la lecția de ritm ${lesson.requiresRhythmLesson}, care nu există`)
      }
    }

    const seenSections = new Set<string>()
    for (const section of lesson.sections) {
      const at = (detail: string) => where(`${section.id}: ${detail}`)
      if (seenSections.has(section.id)) at('id de secțiune repetat')
      seenSections.add(section.id)
      const example = section.example
      if (!example) continue
      for (const problem of validateExercise(example.exercise, vocabulary)) at(problem)
      if (example.bass) {
        for (const problem of validateBassLine(example.bass, example.exercise.stepsPerBar))
          at(problem)
      }
      const { beatsPerBar } = example.exercise
      for (const beats of example.click ?? []) {
        if (beats.some((beat) => !Number.isInteger(beat) || beat < 1 || beat > beatsPerBar)) {
          at(`clicul pe timpii ${beats.join(',')}, în afara măsurii de ${beatsPerBar}`)
        }
      }
      if (example.chart) {
        if (example.chart.length !== example.exercise.bars.length) {
          at(
            `chart-ul are ${example.chart.length} măsuri, exercițiul ${example.exercise.bars.length}`,
          )
        }
        example.chart.forEach((bar, index) => {
          if (bar.kind === 'hits' && !/^[x.]{8}$/.test(bar.hits ?? '')) {
            at(`chart, măsura ${index + 1}: loviturile se scriu pe opt optimi`)
          }
        })
      }
      const { min, max } = example.exercise.tempo
      if (example.bpm < min || example.bpm > max) {
        at(`exemplul se aude la ${example.bpm} BPM, în afara intervalului ${min}-${max}`)
      }
    }
  }
  return problems
}
