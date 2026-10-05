import { describe, expect, it } from 'vitest'
import { runToEnd } from './changes-track'
import {
  alignedCycle,
  BEATS_PER_BAR,
  fingerLevels,
  fingerPositionAt,
  planFinger,
  soundingNotes,
  validateFingerCycle,
  type FingerExercise,
} from './finger-exercises'
import { renderFingerTrackSteps } from './finger-track'
import { GUITAR_RATE } from './pluck'
import { pitchAt, pitchClass } from './tuning'

const exercises = fingerLevels.flatMap((level) => level.exercises)
const byId = (id: string) => exercises.find((exercise) => exercise.id === id)!
const positions = (exercise: FingerExercise) =>
  exercise.position
    ? Array.from({ length: exercise.position.max - exercise.position.min + 1 }, (_, index) => exercise.position!.min + index)
    : [0]

describe('exercițiile pentru degete', () => {
  it('toate sunt valide, în toate pozițiile permise', () => {
    const problems = exercises.flatMap((exercise) => positions(exercise).flatMap((position) => validateFingerCycle(exercise, position)))
    expect(problems).toEqual([])
  })

  it('id-uri unice, poziția și tempoul sugerate în interval', () => {
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(exercises.length)
    for (const exercise of exercises) {
      const { min, max, suggested } = exercise.tempo
      expect(min <= suggested && suggested <= max, exercise.id).toBe(true)
      if (exercise.position) {
        expect(exercise.position.min <= exercise.position.suggested && exercise.position.suggested <= exercise.position.max).toBe(true)
      }
    }
  })

  it('păianjenul: 1-2-3-4 pe fiecare coardă, un deget pe tastă', () => {
    const notes = byId('cromatica').build(5)
    expect(notes.slice(0, 5).map((item) => [item.string, item.fret, item.finger])).toEqual([
      [6, 5, 1],
      [6, 6, 2],
      [6, 7, 3],
      [6, 8, 4],
      [5, 5, 1],
    ])
    expect(notes.slice(0, 4).map((item) => item.pick)).toEqual(['down', 'up', 'down', 'up'])
  })

  it('pentatonica pe tasta 5 e La minor pentatonic', () => {
    const names = new Set(byId('pentatonica').build(5).map((item) => pitchClass(pitchAt(item.string, item.fret))))
    expect([...names].sort((a, b) => a - b)).toEqual([0, 2, 4, 7, 9]) // C D E G A
  })

  it('gama majoră: din poziția 7 e Do major, din poziția 2 Sol major (tonica sub degetul 2)', () => {
    const root = (position: number) => {
      const first = byId('majora').build(position)[0]!
      return pitchClass(pitchAt(first.string, first.fret))
    }
    expect(root(7)).toBe(0) // Do
    expect(root(2)).toBe(7) // Sol
  })

  it('legato: o notă lovită, restul legate pe aceeași coardă', () => {
    const notes = byId('legato-cromatic').build(5)
    expect(notes.slice(0, 4).map((item) => item.slur ?? '-')).toEqual(['-', 'h', 'h', 'h'])
    expect(notes[0]!.pick).toBe('down')
    expect(notes[1]!.pick).toBeUndefined()
  })

  it('validarea prinde un deget greșit și un hammer-on în jos', () => {
    const bad: FingerExercise = {
      ...byId('cromatica'),
      id: 'gresit',
      build: (position) => [
        { string: 6, fret: position, finger: 1, pick: 'down' },
        { string: 6, fret: position + 1, finger: 3, pick: 'up' },
        { string: 6, fret: position, finger: 1, slur: 'h' },
        { string: 6, fret: position + 2, finger: 3, pick: 'down' },
      ],
    }
    const problems = validateFingerCycle(bad, 5)
    expect(problems.some((problem) => problem.includes('degetul 3 pe tasta 6'))).toBe(true)
    expect(problems.some((problem) => problem.includes('hammer-on în jos'))).toBe(true)
  })
})

describe('ciclul aliniat la măsură', () => {
  it('pentru orice exercițiu și orice subdiviziune, ciclul umple măsuri întregi', () => {
    for (const exercise of exercises) {
      for (const subdivision of exercise.subdivisions) {
        const plan = planFinger(exercise, 60, subdivision, exercise.position?.suggested ?? 0)
        expect(plan.notes.length % (BEATS_PER_BAR * subdivision), `${exercise.id} @${subdivision}`).toBe(0)
      }
    }
  })

  it('gama majoră la șaisprezecimi: 28 de note și un timp de pauză', () => {
    const cycle = alignedCycle(byId('majora').build(7), 4)
    expect(cycle).toHaveLength(32)
    expect(soundingNotes(cycle)).toBe(28)
    expect(cycle.slice(28)).toEqual([null, null, null, null])
  })

  it('pentatonica la șaisprezecimi: cântată de două ori, fără pauze', () => {
    const cycle = alignedCycle(byId('pentatonica').build(5), 4)
    expect(cycle).toHaveLength(48)
    expect(soundingNotes(cycle)).toBe(48)
  })
})

describe('planul și pista', () => {
  it('numărătoarea, apoi notele ciclului, în buclă', () => {
    const plan = planFinger(byId('cromatica'), 60, 4, 5)
    expect(plan.countInSteps).toBe(16)
    expect(fingerPositionAt(plan, 3)).toEqual({ countIn: 1, noteIndex: -1 })
    expect(fingerPositionAt(plan, 16)).toEqual({ countIn: null, noteIndex: 0 })
    expect(fingerPositionAt(plan, 16 + 48 + 2)).toEqual({ countIn: null, noteIndex: 2 })
    expect(plan.durationMs).toBeGreaterThanOrEqual(60_000)
  })

  it('pista: prima notă cade după numărătoare, nu saturează', () => {
    const plan = planFinger(byId('pentatonica'), 90, 2, 5)
    const out = runToEnd(renderFingerTrackSteps(plan, { metronome: false, demo: true }))
    const at = (ms: number) => Math.round((ms / 1000) * GUITAR_RATE)
    const energy = (from: number, to: number) => out.slice(at(from), at(to)).reduce((sum, value) => sum + value * value, 0)
    const entry = plan.countInSteps * plan.stepMs
    expect(energy(entry - 300, entry - 20)).toBe(0)
    expect(energy(entry + 10, entry + 200)).toBeGreaterThan(0)
    expect(out.reduce((max, value) => Math.max(max, Math.abs(value)), 0)).toBeLessThanOrEqual(0.9001)
  })
})
