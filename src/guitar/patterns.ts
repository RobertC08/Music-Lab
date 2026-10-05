import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { MAX_BPM } from './changes'
import { alignedCycle, BEATS_PER_BAR, type FingerPlan, type StepsPerBeat, type TabNote } from './finger-exercises'
import type { NoteSetFamily } from './scales'

/*
  Exercițiile de game și arpegii: un pattern aplicat pe notele unei poziții.

  Un pattern e o CELULĂ de indici, mutată cu câte o notă în sus pe notele
  poziției, ordonate de la grav la acut:

    celula [0, 2, 1, 3] pe notele 1 2 3 4 5 6 ...
    -> 1 3 2 4 | 2 4 3 5 | 3 5 4 6 | ...

  Celula se oprește când ar ieși din poziție. În jos e aceeași regulă pe notele
  luate de sus în jos. Un exercițiu nou e o linie în `scaleExercises`, pentru
  orice gamă, orice poziție, orice tonalitate; arpegiile folosesc aceleași
  exerciții (`for`) pe notele lor.

  Ce nu e aici: tempoul, direcția, subdiviziunea. Sunt setările sesiunii.
*/

export type Direction = 'up' | 'down' | 'upDown' | 'continuous'
export const DIRECTIONS: readonly Direction[] = ['up', 'down', 'upDown', 'continuous']
export const SUBDIVISIONS: readonly StepsPerBeat[] = [1, 2, 3, 4]

export interface PatternExercise {
  id: string
  level: 1 | 2 | 3 | 4 | 5
  title: LocalizedText
  /** Indicii celulei, de la nota de pornire: [0] = gama simplă, [0, 2] = terțe. */
  cell: readonly number[]
  for: NoteSetFamily | 'both'
  defaultBpm: number
  defaultSubdivision: StepsPerBeat
}

export const MIN_BPM = 30

export const scaleExercises: readonly PatternExercise[] = [
  {
    id: 'simple',
    level: 1,
    title: { ro: 'Gama simplă', en: 'Straight scale' },
    cell: [0],
    for: 'both',
    defaultBpm: 60,
    defaultSubdivision: 1,
  },
  {
    id: 'groups3',
    level: 2,
    title: { ro: 'Grupuri de trei', en: 'Groups of three' },
    cell: [0, 1, 2],
    for: 'scale',
    defaultBpm: 60,
    defaultSubdivision: 3,
  },
  {
    id: 'groups4',
    level: 2,
    title: { ro: 'Grupuri de patru', en: 'Groups of four' },
    cell: [0, 1, 2, 3],
    for: 'scale',
    defaultBpm: 60,
    defaultSubdivision: 2,
  },
  {
    id: 'pattern1324',
    level: 3,
    title: { ro: 'Pattern 1-3-2-4', en: 'Pattern 1-3-2-4' },
    cell: [0, 2, 1, 3],
    for: 'scale',
    defaultBpm: 60,
    defaultSubdivision: 2,
  },
  {
    id: 'thirds',
    level: 4,
    title: { ro: 'Terțe', en: 'Thirds' },
    cell: [0, 2],
    for: 'scale',
    defaultBpm: 60,
    defaultSubdivision: 2,
  },
  {
    id: 'sequence123432',
    level: 5,
    title: { ro: 'Secvența 1-2-3-4-3-2', en: 'Sequence 1-2-3-4-3-2' },
    cell: [0, 1, 2, 3, 2, 1],
    for: 'scale',
    defaultBpm: 60,
    defaultSubdivision: 3,
  },
]

export const exercisesFor = (family: NoteSetFamily) =>
  scaleExercises.filter((exercise) => exercise.for === family || exercise.for === 'both')

/** Celula mutată pe toată lista: 1 3 2 4 | 2 4 3 5 | ... */
function walk<T>(notes: readonly T[], cell: readonly number[]): T[] {
  const reach = Math.max(...cell)
  const out: T[] = []
  for (let start = 0; start + reach < notes.length; start += 1) {
    for (const offset of cell) out.push(notes[start + offset]!)
  }
  return out
}

/** Lipește două jumătăți fără nota de la îmbinare cântată de două ori. */
const join = <T>(first: T[], second: T[]) => (first.at(-1) === second[0] ? [...first, ...second.slice(1)] : [...first, ...second])

/**
 * Un ciclu al exercițiului, pe notele poziției (de la grav la acut).
 *
 * - `up`: în sus; `down`: în jos;
 * - `upDown`: în sus, apoi în jos, cu vârful o singură dată; la reluare,
 *   nota de jos se cântă din nou (capăt de frază);
 * - `continuous`: la fel, dar fără capete: la reluare, nota de jos nu se
 *   repetă, deci gama curge fără oprire.
 */
export function exerciseCycle<T>(notes: readonly T[], cell: readonly number[], direction: Direction): T[] {
  const up = walk(notes, cell)
  const down = walk([...notes].reverse(), cell)
  if (direction === 'up') return up
  if (direction === 'down') return down
  const both = join(up, down)
  if (direction === 'continuous' && both.length > 1 && both.at(-1) === both[0]) return both.slice(0, -1)
  return both
}

/** Cât ține o sesiune: ciclul se repetă cam un minut (ca la exercițiile pentru degete). */
const TARGET_MS = 60_000

/**
 * Planul de timp, în aceeași formă ca la exercițiile pentru degete, ca să se
 * folosească aceeași pistă audio și aceeași tabulatură.
 *
 * Fiecare notă cade pe un pas: o notă pe timp la pătrimi, două la optimi și
 * așa mai departe; ciclul se completează cu pauze până la capăt de măsură
 * (`alignedCycle`), ca reluarea să cadă pe „unu". Înainte, o măsură de numărat.
 */
export function planPattern(notes: TabNote[], bpm: number, stepsPerBeat: StepsPerBeat, repeats?: number): FingerPlan {
  const tempo = Math.min(MAX_BPM, Math.max(MIN_BPM, bpm))
  const stepMs = 60_000 / tempo / stepsPerBeat
  const cycle = alignedCycle(notes, stepsPerBeat)
  const count = repeats ?? Math.max(1, Math.round(TARGET_MS / (cycle.length * stepMs)))
  const countInSteps = BEATS_PER_BAR * stepsPerBeat
  const totalSteps = countInSteps + count * cycle.length
  return { bpm: tempo, stepsPerBeat, stepMs, notes: cycle, countInSteps, repeats: count, totalSteps, durationMs: totalSteps * stepMs }
}
