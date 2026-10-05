import { describe, expect, it } from 'vitest'
import { scaleExercises } from './patterns'
import { progressKey, recommendNext, recordAttempt, recordCompletion, type PatternContext, type PatternProgress } from './scale-progress'

const context: PatternContext = { setId: 'minorPentatonic', root: 9, position: 1, exerciseId: 'simple' }
const simple = scaleExercises[0]!

describe('progresul', () => {
  it('încercări, terminări, cel mai bun tempo, ultima sesiune', () => {
    let progress = recordAttempt(undefined, 60, 'a')
    progress = recordCompletion(progress, 60, 'b')
    progress = recordAttempt(progress, 80, 'c')
    expect(progress).toEqual({ bestBpm: 60, attempts: 2, completions: 1, lastPracticedAt: 'c', lastSession: { bpm: 80, completed: false } })
    progress = recordCompletion(progress, 80, 'd')
    expect(progress).toMatchObject({ bestBpm: 80, attempts: 2, completions: 2, lastSession: { bpm: 80, completed: true } })
  })

  it('recomandarea: întâi tempoul, apoi poziția următoare, apoi exercițiul următor', () => {
    const store = new Map<string, PatternProgress>()
    const progressOf = (target: PatternContext) => store.get(progressKey(target))
    expect(recommendNext(context, 60, simple, scaleExercises, 5, progressOf)).toEqual({ kind: 'tempo', bpm: 70 })
    expect(recommendNext(context, 85, simple, scaleExercises, 5, progressOf)).toEqual({ kind: 'tempo', bpm: 90 })
    expect(recommendNext(context, 90, simple, scaleExercises, 5, progressOf)).toEqual({ kind: 'position', position: 2 })
    store.set(progressKey({ ...context, position: 2 }), recordCompletion(undefined, 60, 'x'))
    expect(recommendNext(context, 90, simple, scaleExercises, 5, progressOf)).toEqual({ kind: 'position', position: 3 })
    for (const position of [3, 4, 5]) store.set(progressKey({ ...context, position }), recordCompletion(undefined, 60, 'x'))
    expect(recommendNext(context, 90, simple, scaleExercises, 5, progressOf)).toMatchObject({ kind: 'exercise', exercise: { id: scaleExercises[1]!.id } })
    // Cromatica are o singură poziție: direct exercițiul următor.
    expect(recommendNext(context, 120, simple, scaleExercises, 1, progressOf).kind).toBe('exercise')
    expect(recommendNext(context, 120, scaleExercises.at(-1)!, scaleExercises, 1, progressOf).kind).toBe('none')
  })
})
