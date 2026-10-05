import { describe, expect, it } from 'vitest'
import { BEATS_PER_BAR } from './finger-exercises'
import { exerciseCycle, exercisesFor, planPattern, scaleExercises, SUBDIVISIONS, DIRECTIONS } from './patterns'
import { scalePositions, toTabNote } from './positions'
import { KEYS, scaleSets } from './scales'

const eight = [1, 2, 3, 4, 5, 6, 7, 8]
const cellOf = (id: string) => scaleExercises.find((exercise) => exercise.id === id)!.cell
const text = (notes: number[]) => notes.join('')

describe('pattern-urile', () => {
  it('gama simplă: în sus, în jos, sus și jos cu vârful o singură dată', () => {
    expect(text(exerciseCycle(eight, [0], 'up'))).toBe('12345678')
    expect(text(exerciseCycle(eight, [0], 'down'))).toBe('87654321')
    expect(text(exerciseCycle(eight, [0], 'upDown'))).toBe('123456787654321')
    // Continuu: la reluare, 1 nu se mai cântă de două ori.
    expect(text(exerciseCycle(eight, [0], 'continuous'))).toBe('12345678765432')
  })

  it('grupuri, 1-3-2-4, terțe, secvențe: celula mutată cu câte o notă', () => {
    expect(text(exerciseCycle(eight, cellOf('groups4'), 'up'))).toBe('12342345345645675678')
    expect(text(exerciseCycle(eight, cellOf('pattern1324'), 'up')).slice(0, 12)).toBe('132424353546')
    expect(text(exerciseCycle(eight, cellOf('thirds'), 'up'))).toBe('132435465768')
    expect(text(exerciseCycle(eight, cellOf('thirds'), 'down'))).toBe('867564534231')
    expect(text(exerciseCycle(eight, cellOf('sequence123432'), 'up')).slice(0, 12)).toBe('123432234543')
  })

  it('fiecare exercițiu are un nivel de la 1 la 5 și id unic', () => {
    expect(new Set(scaleExercises.map((exercise) => exercise.id)).size).toBe(scaleExercises.length)
    expect(new Set(exercisesFor('scale').map((exercise) => exercise.level))).toEqual(new Set([1, 2, 3, 4, 5]))
  })
})

describe('planul de timp', () => {
  it('o notă pe pas, ciclul pe măsuri întregi, o măsură de numărat, cam un minut', () => {
    const notes = scalePositions(scaleSets[0]!, 9)[0]!.notes.map(toTabNote)
    for (const subdivision of SUBDIVISIONS) {
      const plan = planPattern(notes, 80, subdivision)
      expect(plan.notes.length % (BEATS_PER_BAR * subdivision)).toBe(0)
      expect(plan.countInSteps).toBe(BEATS_PER_BAR * subdivision)
      expect(plan.stepMs).toBeCloseTo(60_000 / 80 / subdivision)
      expect(plan.durationMs).toBeGreaterThan(30_000)
      expect(plan.durationMs).toBeLessThan(100_000)
    }
    const once = planPattern(notes, 60, 1, 1)
    expect(once.repeats).toBe(1)
    expect(once.durationMs).toBe((4 + once.notes.length) * 1000)
  })

  it('orice exercițiu, pe orice gamă, poziție și direcție, are note', () => {
    for (const set of scaleSets) {
      for (const position of scalePositions(set, KEYS[3]!.pc)) {
        for (const exercise of exercisesFor('scale')) {
          for (const direction of DIRECTIONS) {
            const cycle = exerciseCycle(position.notes, exercise.cell, direction)
            expect(cycle.length, `${set.id} ${exercise.id} ${direction}`).toBeGreaterThan(position.notes.length / 2)
          }
        }
      }
    }
  })
})
