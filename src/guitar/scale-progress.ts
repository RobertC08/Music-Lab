import { MAX_BPM } from './changes'
import type { PatternExercise } from './patterns'

/*
  Progresul la game și arpegii, și pasul următor recomandat.

  Nimic nu se blochează: recomandarea e o sugestie, totul rămâne deschis
  (skill-ul `predare-chitara`). Aplicația nu aude chitara, deci „terminat"
  înseamnă că ai dus sesiunea până la capăt, nu că ai cântat-o bine.

  Progresul se ține pe exercițiu, în poziția și tonalitatea lui: La minor
  pentatonic, poziția 1, grupuri de patru. Direcția și subdiviziunea nu intră
  în cheie: sunt felul în care exersezi același lucru.
*/

export interface PatternProgress {
  bestBpm: number
  attempts: number
  completions: number
  /** ISO. */
  lastPracticedAt: string
  lastSession: { bpm: number; completed: boolean }
}

export interface PatternContext {
  setId: string
  root: number
  position: number
  exerciseId: string
}

export const progressKey = (context: PatternContext) =>
  `${context.setId}:${context.root}:${context.position}:${context.exerciseId}`

/** O încercare (Start). */
export function recordAttempt(previous: PatternProgress | undefined, bpm: number, at: string): PatternProgress {
  return {
    bestBpm: previous?.bestBpm ?? 0,
    attempts: (previous?.attempts ?? 0) + 1,
    completions: previous?.completions ?? 0,
    lastPracticedAt: at,
    lastSession: { bpm, completed: false },
  }
}

/** O sesiune dusă până la capăt. Încercarea s-a numărat deja la pornire. */
export function recordCompletion(previous: PatternProgress | undefined, bpm: number, at: string): PatternProgress {
  return {
    bestBpm: Math.max(previous?.bestBpm ?? 0, bpm),
    attempts: Math.max(1, previous?.attempts ?? 0),
    completions: (previous?.completions ?? 0) + 1,
    lastPracticedAt: at,
    lastSession: { bpm, completed: true },
  }
}

/** Cu cât crește tempoul recomandat. */
export const TEMPO_STEP = 10
/** Peste tempoul de pornire cu atât, exercițiul e „stăpânit" în poziția asta și se trece mai departe. */
export const TEMPO_GOAL_ABOVE_DEFAULT = 30

export type Recommendation =
  | { kind: 'tempo'; bpm: number }
  | { kind: 'position'; position: number }
  | { kind: 'exercise'; exercise: PatternExercise }
  | { kind: 'none' }

/**
 * Ce să încerci după o sesiune terminată.
 *
 * 1. Sub țintă (tempoul de pornire + 30): același exercițiu, cu 10 BPM mai repede.
 * 2. Atins: prima poziție pe care n-ai terminat-o încă, la același exercițiu.
 * 3. Toate pozițiile terminate: exercițiul următor din listă.
 */
export function recommendNext(
  context: PatternContext,
  bpm: number,
  exercise: PatternExercise,
  exercises: readonly PatternExercise[],
  positionCount: number,
  progressOf: (context: PatternContext) => PatternProgress | undefined,
): Recommendation {
  const goal = Math.min(MAX_BPM, exercise.defaultBpm + TEMPO_GOAL_ABOVE_DEFAULT)
  if (bpm < goal) return { kind: 'tempo', bpm: Math.min(goal, bpm + TEMPO_STEP) }
  for (let offset = 1; offset < positionCount; offset += 1) {
    const position = ((context.position - 1 + offset) % positionCount) + 1
    if (!progressOf({ ...context, position })?.completions) return { kind: 'position', position }
  }
  const index = exercises.findIndex((candidate) => candidate.id === exercise.id)
  const next = exercises[index + 1]
  return next ? { kind: 'exercise', exercise: next } : { kind: 'none' }
}
