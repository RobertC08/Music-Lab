import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumExercise, KitPiece } from '../../exercise'
import {
  quizPattern,
  type ChoiceQuestion,
  type MarkGridQuestion,
  type PickPatternQuestion,
} from '../quiz'

/*
  Prescurtările cu care se scriu quiz-urile.

  Un quiz de cinci întrebări scris cu obiecte întregi are o sută de rânduri,
  din care întrebarea propriu-zisă e o zecime. Cu astea, fiecare întrebare se
  citește dintr-o privire: ce se întreabă, ce se aude sau se vede, care e
  răspunsul și de ce.
*/

type T = LocalizedText
type Rows = Partial<Record<KitPiece, string>>

/** Un text în ambele limbi. */
export const L = (ro: string, en: string): T => ({ ro, en })

/** O măsură de quiz (vezi `quizPattern`). */
export const bar = quizPattern

/** Variante de răspuns: textul în ambele limbi, pe rând. */
export const opts = (...pairs: [string, string][]): T[] => pairs.map(([ro, en]) => L(ro, en))

/** Întrebare cu variante, fără nimic de ascultat sau de citit. */
export function choice(
  id: string,
  prompt: T,
  options: T[],
  answer: number,
  explain: T,
): ChoiceQuestion<T> {
  return { id, kind: 'choice', prompt, options, answer, explain }
}

/** Întrebare cu variante, după un exemplu ascultat. */
export function listenChoice(
  id: string,
  prompt: T,
  heard: DrumExercise,
  options: T[],
  answer: number,
  explain: T,
): ChoiceQuestion<T> {
  return {
    id,
    kind: 'choice',
    prompt,
    options,
    answer,
    explain,
    media: { exercise: heard, bpm: heard.tempo.suggested, play: true },
  }
}

/** Întrebare cu variante, după o notație citită (grilă sau portativ). */
export function readChoice(
  id: string,
  prompt: T,
  shown: DrumExercise,
  show: 'grid' | 'staff',
  options: T[],
  answer: number,
  explain: T,
): ChoiceQuestion<T> {
  return {
    id,
    kind: 'choice',
    prompt,
    options,
    answer,
    explain,
    media: { exercise: shown, bpm: shown.tempo.suggested, show },
  }
}

/** Marchează pe grilă ce auzi. `given` vin completate. */
export function markHeard(
  id: string,
  prompt: T,
  answer: DrumExercise,
  rows: KitPiece[],
  given: KitPiece[],
  explain: T,
): MarkGridQuestion<T> {
  return {
    id,
    kind: 'markGrid',
    prompt,
    explain,
    answer,
    bpm: answer.tempo.suggested,
    from: 'audio',
    rows,
    given,
  }
}

/** Transcrie pe grilă portativul dat. */
export function markRead(
  id: string,
  prompt: T,
  answer: DrumExercise,
  rows: KitPiece[],
  given: KitPiece[],
  explain: T,
): MarkGridQuestion<T> {
  return {
    id,
    kind: 'markGrid',
    prompt,
    explain,
    answer,
    bpm: answer.tempo.suggested,
    from: 'staff',
    rows,
    given,
  }
}

/** Alege grila (sau portativul) care e ce se aude. */
export function pickHeard(
  id: string,
  prompt: T,
  heard: DrumExercise,
  options: DrumExercise[],
  answer: number,
  explain: T,
  optionsAs: 'grid' | 'staff' = 'grid',
): PickPatternQuestion<T> {
  return {
    id,
    kind: 'pickPattern',
    prompt,
    explain,
    options,
    optionsAs,
    answer,
    media: { exercise: heard, bpm: heard.tempo.suggested, play: true },
  }
}

/** Alege varianta care spune același lucru ca notația arătată, în cealaltă scriere. */
export function pickRead(
  id: string,
  prompt: T,
  shown: DrumExercise,
  show: 'grid' | 'staff',
  options: DrumExercise[],
  answer: number,
  explain: T,
): PickPatternQuestion<T> {
  return {
    id,
    kind: 'pickPattern',
    prompt,
    explain,
    options,
    optionsAs: show === 'grid' ? 'staff' : 'grid',
    answer,
    media: { exercise: shown, bpm: shown.tempo.suggested, show },
  }
}

/** Câteva măsuri care se repetă peste tot. */
export const ROCK8: Rows = { hhClosed: 'xxxxxxxx', snare: '..X...X.', kick: 'x...x...' }
