import {
  pick,
  type CurriculumLanguage,
  type LocalizedText,
} from '@/lib/rhythm/curriculum/localized'
import { validateExercise, type DrumExercise, type KitPiece, type Vocabulary } from '../exercise'
import { validateBassLine, type BassLine } from '../bass'
import { theoryBar } from './bars'
import type { DrumStageId } from './types'

/*
  Quiz-urile manualului: unul de cinci întrebări după fiecare lecție și unul
  recapitulativ, de 10-15, la capătul fiecărei etape.

  Ce se punctează e ÎNȚELEGEREA, nu execuția (vezi skill-ul `predare-tobe`):
  aplicația nu aude setul, dar poate judeca dacă ai recunoscut un shuffle, dacă
  ai citit corect un portativ sau dacă ai marcat pe grilă ce ai auzit. Toate trei
  sunt atingeri pe ecran, deci verificabile.

  Trei feluri de întrebări:

  `choice`       variante de răspuns, cu un exemplu de ascultat sau o notație de
                 citit deasupra, dacă întrebarea are nevoie.
  `pickPattern`  variantele sunt ele însele grile sau portative: „care dintre
                 ele e ce ai auzit?” sau „care grilă e portativul ăsta?”.
  `markGrid`     elevul construiește grila: din ce aude sau din portativul dat.
                 Rândurile `given` vin completate (de obicei fusul), ca exercițiul
                 să fie despre piesa întrebată, nu despre tot groove-ul.

  Datele rămân date, ca la lecții: niciun component, nimic din UI. Ecranul
  traduce felul întrebării în interacțiune.
*/

/** Ce se pune deasupra întrebării: un exemplu de ascultat și/sau o notație de citit. */
export interface QuizMedia {
  exercise: DrumExercise
  bpm: number
  /** Butonul de ascultare. */
  play?: boolean
  /** Notația afișată. Lipsă = nimic de citit, doar de ascultat. */
  show?: 'grid' | 'staff'
  /** O linie de bas sub tobe, pentru întrebările din Etapa „Muzician”. */
  bass?: BassLine
}

interface QuestionBase<Text> {
  id: string
  prompt: Text
  /** De ce e corect răspunsul. Se arată după verificare, oricum ai răspuns. */
  explain: Text
  media?: QuizMedia
}

export interface ChoiceQuestion<Text = string> extends QuestionBase<Text> {
  kind: 'choice'
  options: Text[]
  answer: number
}

export interface PickPatternQuestion<Text = string> extends QuestionBase<Text> {
  kind: 'pickPattern'
  options: DrumExercise[]
  /** Cum se desenează variantele. */
  optionsAs: 'grid' | 'staff'
  answer: number
}

export interface MarkGridQuestion<Text = string> extends QuestionBase<Text> {
  kind: 'markGrid'
  /** Măsura corectă, una singură. Din ea se aude sau se citește întrebarea. */
  answer: DrumExercise
  bpm: number
  /** De unde afli ce trebuie marcat: din sunet sau din portativ. */
  from: 'audio' | 'staff'
  /** Rândurile grilei, în ordinea de desenare. */
  rows: KitPiece[]
  /** Rândurile date gata completate, care nu se verifică. */
  given?: KitPiece[]
  /** O linie de bas sub tobe: „pune toba mare pe notele basului”. */
  bass?: BassLine
}

export type QuizQuestion<Text = string> =
  ChoiceQuestion<Text> | PickPatternQuestion<Text> | MarkGridQuestion<Text>

export interface DrumQuiz<Text = string> {
  id: string
  stage: DrumStageId
  /** Lecția după care vine. Lipsă = quiz-ul recapitulativ al etapei. */
  lessonId?: string
  questions: QuizQuestion<Text>[]
}

/** Câte întrebări are un quiz de lecție și cât poate avea unul recapitulativ. */
export const LESSON_QUIZ_LENGTH = 5
export const REVIEW_QUIZ_RANGE = { min: 10, max: 15 } as const

/** Pragul de trecere: 80%, adică 4 din 5 sau 12 din 15. */
export const PASS_RATIO = 0.8
export const passed = (score: number, total: number) => total > 0 && score / total >= PASS_RATIO

/**
 * O măsură de quiz, scrisă ca rânduri de caractere, ca exemplele din lecții.
 *
 * Tempoul maxim e chiar tempoul la care se aude: regula de 90 ms dintre două
 * lovituri ale aceleiași piese se verifică acolo unde chiar se cântă.
 */
export function quizPattern(
  id: string,
  stepsPerBar: number,
  rows: Partial<Record<KitPiece, string>>,
  options: {
    bpm?: number
    beatsPerBar?: number
    extraBars?: Partial<Record<KitPiece, string>>[]
  } = {},
): DrumExercise {
  const bpm = options.bpm ?? 80
  return {
    id,
    kind: 'demo',
    stepsPerBar,
    beatsPerBar: options.beatsPerBar ?? 4,
    bars: [theoryBar(rows), ...(options.extraBars ?? []).map(theoryBar)],
    tempo: { min: Math.min(40, bpm), max: bpm, suggested: bpm },
  }
}

/* -------------------------------------------------------------------------- */
/* Corectarea grilei                                                           */
/* -------------------------------------------------------------------------- */

/** Ce a marcat elevul: un rând de adevărat/fals pe fiecare piesă de verificat. */
export type GridMarks = Partial<Record<KitPiece, boolean[]>>

export type CellResult = 'hit' | 'missed' | 'extra' | 'empty'

export interface GridGrade {
  correct: boolean
  /** Pe fiecare rând verificat, ce s-a întâmplat pe fiecare pas. */
  cells: Partial<Record<KitPiece, CellResult[]>>
}

/** Unde lovește o piesă în răspuns, indiferent de intensitate. */
export function answerRow(question: MarkGridQuestion<unknown>, piece: KitPiece): boolean[] {
  const lane = question.answer.bars[0]?.lanes[piece] ?? []
  return Array.from({ length: question.answer.stepsPerBar }, (_, step) => Boolean(lane[step]))
}

/** Rândurile pe care elevul chiar le completează. */
export const checkedRows = (question: MarkGridQuestion<unknown>) =>
  question.rows.filter((piece) => !question.given?.includes(piece))

/**
 * Corectează grila marcată.
 *
 * Contează DOAR unde cade lovitura, nu cât de tare: la grila de quiz nu se
 * marchează intensități, iar un accent marcat ca lovitură normală tot a fost
 * auzit corect.
 */
export function gradeMarkGrid(question: MarkGridQuestion<unknown>, marks: GridMarks): GridGrade {
  const cells: GridGrade['cells'] = {}
  let correct = true
  for (const piece of checkedRows(question)) {
    const expected = answerRow(question, piece)
    const marked = marks[piece] ?? []
    cells[piece] = expected.map((should, step) => {
      const did = Boolean(marked[step])
      if (should && did) return 'hit'
      if (should) {
        correct = false
        return 'missed'
      }
      if (did) {
        correct = false
        return 'extra'
      }
      return 'empty'
    })
  }
  return { correct, cells }
}

/* -------------------------------------------------------------------------- */
/* Validare și rezolvare                                                       */
/* -------------------------------------------------------------------------- */

/** Semnătura unei măsuri, ca două variante identice să fie prinse. */
function signature(exercise: DrumExercise) {
  return JSON.stringify([exercise.stepsPerBar, exercise.beatsPerBar, exercise.bars])
}

/**
 * Problemele unui quiz. Lista goală înseamnă că e bun.
 *
 * Ce se verifică aici nu prinde TypeScript: un răspuns care arată spre o
 * variantă inexistentă, două variante identice (deci două răspunsuri corecte),
 * o grilă de marcat în care rândul întrebat e gol, un exemplu care nu se poate
 * reda pe kit.
 */
export function validateQuiz(
  quiz: DrumQuiz<LocalizedText>,
  vocabulary?: Vocabulary,
  lessonIds?: readonly string[],
): string[] {
  const problems: string[] = []
  const at = (detail: string) => problems.push(`${quiz.id}: ${detail}`)
  const count = quiz.questions.length
  if (quiz.lessonId) {
    if (count !== LESSON_QUIZ_LENGTH) at(`are ${count} întrebări, nu ${LESSON_QUIZ_LENGTH}`)
    if (lessonIds && !lessonIds.includes(quiz.lessonId)) at(`lecția ${quiz.lessonId} nu există`)
  } else if (count < REVIEW_QUIZ_RANGE.min || count > REVIEW_QUIZ_RANGE.max) {
    at(`recapitularea are ${count} întrebări, nu ${REVIEW_QUIZ_RANGE.min}-${REVIEW_QUIZ_RANGE.max}`)
  }
  if (!quiz.questions.some((question) => question.kind !== 'choice')) {
    at('nicio întrebare interactivă (grilă sau notație)')
  }

  const seen = new Set<string>()
  for (const question of quiz.questions) {
    const where = (detail: string) => at(`${question.id}: ${detail}`)
    if (seen.has(question.id)) where('id repetat')
    seen.add(question.id)
    const exercises: { exercise: DrumExercise; bpm: number }[] = []
    if (question.media) exercises.push(question.media)

    if (question.kind === 'choice' || question.kind === 'pickPattern') {
      if (question.options.length < 2) where('mai puțin de două variante')
      if (question.answer < 0 || question.answer >= question.options.length) {
        where(`răspunsul ${question.answer} nu e printre variante`)
      }
    }
    if (question.kind === 'choice') {
      const texts = question.options.map((option) => option.ro)
      if (new Set(texts).size !== texts.length) where('două variante cu același text')
    }
    if (question.kind === 'pickPattern') {
      const signatures = question.options.map(signature)
      if (new Set(signatures).size !== signatures.length) where('două variante identice')
      for (const option of question.options) {
        exercises.push({ exercise: option, bpm: option.tempo.suggested })
      }
      if (!question.media) where('variantele de grilă au nevoie de ceva de ascultat sau de citit')
    }
    if (question.kind === 'markGrid') {
      exercises.push({ exercise: question.answer, bpm: question.bpm })
      if (question.answer.bars.length !== 1) where('grila de marcat are o singură măsură')
      const checked = checkedRows(question)
      if (checked.length === 0) where('niciun rând de marcat')
      for (const piece of question.given ?? []) {
        if (!question.rows.includes(piece)) where(`rândul dat ${piece} nu e în grilă`)
      }
      if (!checked.some((piece) => answerRow(question, piece).some(Boolean))) {
        where('rândurile de marcat sunt goale în răspuns')
      }
      const used = Object.entries(question.answer.bars[0]?.lanes ?? {})
        .filter(([, lane]) => lane?.some(Boolean))
        .map(([piece]) => piece as KitPiece)
      for (const piece of used) {
        if (!question.rows.includes(piece)) where(`răspunsul are ${piece}, care nu e în grilă`)
      }
    }

    const bass = question.kind === 'markGrid' ? question.bass : question.media?.bass
    const bassGrid = question.kind === 'markGrid' ? question.answer : question.media?.exercise
    if (bass && bassGrid) {
      for (const problem of validateBassLine(bass, bassGrid.stepsPerBar)) where(problem)
    }

    for (const { exercise, bpm } of exercises) {
      for (const problem of validateExercise(exercise, vocabulary)) where(problem)
      if (bpm < exercise.tempo.min || bpm > exercise.tempo.max) {
        where(`${exercise.id} se aude la ${bpm} BPM, în afara intervalului`)
      }
    }
  }
  return problems
}

export function resolveQuiz(quiz: DrumQuiz<LocalizedText>, language: CurriculumLanguage): DrumQuiz {
  return {
    ...quiz,
    questions: quiz.questions.map((question): QuizQuestion => {
      const base = {
        ...question,
        prompt: pick(question.prompt, language),
        explain: pick(question.explain, language),
      }
      if (question.kind === 'choice') {
        return {
          ...base,
          kind: 'choice',
          options: question.options.map((option) => pick(option, language)),
          answer: question.answer,
        }
      }
      return base as QuizQuestion
    }),
  }
}
