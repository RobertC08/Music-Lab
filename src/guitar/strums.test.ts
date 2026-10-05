import { describe, expect, it } from 'vitest'
import { runToEnd } from './changes-track'
import { GUITAR_RATE } from './pluck'
import { renderStrumTrackSteps } from './strum-track'
import {
  countLabel,
  handDirection,
  planStrum,
  strumLevels,
  strumPositionAt,
  STRUM_PROGRESSIONS,
  validateStrumPattern,
  type StrumExercise,
} from './strums'
import { chordById } from './changes'

const exercises = strumLevels.flatMap((level) => level.exercises)
const byId = (id: string) => exercises.find((exercise) => exercise.id === id)!

describe('modelele de strumming', () => {
  it('toate respectă mișcarea mâinii: jos pe pașii de jos, sus pe cei de sus', () => {
    expect(exercises.flatMap(validateStrumPattern)).toEqual([])
  })

  it('id-uri unice, progresii cu acorduri din bibliotecă', () => {
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(exercises.length)
    for (const progression of STRUM_PROGRESSIONS) {
      for (const id of progression.chords) expect(chordById(id), id).toBeDefined()
    }
  })

  it('nivelurile cresc: optimi la început, șaisprezecimi și triolete mai târziu', () => {
    expect(strumLevels[0]!.exercises.every((exercise) => exercise.stepsPerBeat === 2)).toBe(true)
    const first16 = strumLevels.findIndex((level) => level.exercises.some((exercise) => exercise.stepsPerBeat === 4))
    const firstTriplet = strumLevels.findIndex((level) => level.exercises.some((exercise) => exercise.stepsPerBeat === 3))
    expect(first16).toBeGreaterThan(1)
    expect(firstTriplet).toBeGreaterThan(first16)
  })

  it('validarea prinde un model scris greșit', () => {
    const wrong: StrumExercise = { ...byId('folk'), id: 'gresit', pattern: 'DD.U.UDU' }
    expect(validateStrumPattern(wrong).some((problem) => problem.includes('pasul 1 e în jos'))).toBe(true)
    const shuffle: StrumExercise = { ...byId('shuffle-optimi'), id: 'gresit-3', pattern: 'DU.D.UD.UD.U' }
    expect(validateStrumPattern(shuffle).length).toBeGreaterThan(0)
  })

  it('direcția mâinii', () => {
    expect([0, 1, 2, 3].map((step) => handDirection(step, 2))).toEqual(['down', 'up', 'down', 'up'])
    expect([0, 1, 2].map((step) => handDirection(step, 3))).toEqual(['down', 'none', 'up'])
  })

  it('numărătoarea de sub pași', () => {
    expect([0, 1, 2, 3].map((step) => countLabel(step, 2))).toEqual(['1', '&', '2', '&'])
    expect([0, 1, 2, 3, 4].map((step) => countLabel(step, 4))).toEqual(['1', 'e', '&', 'a', '2'])
    expect([0, 1, 2, 3].map((step) => countLabel(step, 3))).toEqual(['1', '&', 'a', '2'])
  })
})

describe('planul', () => {
  it('numărătoare de o măsură, apoi modelul, acordul schimbat pe fiecare măsură', () => {
    const plan = planStrum(byId('folk'), 60, 'g-c-d-c')
    expect(plan.countInSteps).toBe(8)
    expect(strumPositionAt(plan, 0)).toMatchObject({ countIn: 1, patternStep: -1 })
    expect(strumPositionAt(plan, 7)).toMatchObject({ countIn: 4 })
    expect(strumPositionAt(plan, 8)).toMatchObject({ countIn: null, patternStep: 0, chordIndex: 0 })
    expect(strumPositionAt(plan, 8 + 8 + 3)).toMatchObject({ patternStep: 3, bar: 1, chordIndex: 1 })
    expect(plan.durationMs).toBeGreaterThanOrEqual(60_000)
  })

  it('fără acorduri, nu e niciun acord', () => {
    const plan = planStrum(byId('folk'), 60, 'mute')
    expect(plan.chords).toEqual([])
    expect(strumPositionAt(plan, 10).chordIndex).toBe(-1)
  })
})

describe('pista', () => {
  const ms = (value: number) => Math.round((value / 1000) * GUITAR_RATE)
  const energy = (out: Float32Array, from: number, to: number) =>
    out.slice(ms(from), ms(to)).reduce((sum, value) => sum + value * value, 0)

  it('lovitura ratată lasă acordul să sune, pauza îl oprește', () => {
    const plan = planStrum(byId('opriri'), 60, 'em')
    const out = runToEnd(renderStrumTrackSteps(plan, { metronome: false, demo: true }))
    const start = plan.countInSteps * plan.stepMs
    // Pe primii doi timpi se aude chitara; pe timpii 3-4 (pauza), aproape nimic.
    const played = energy(out, start, start + 2 * 2 * plan.stepMs)
    const rest = energy(out, start + 4 * plan.stepMs + 120, start + 8 * plan.stepMs)
    expect(played).toBeGreaterThan(0)
    expect(rest).toBeLessThan(played / 50)
  })

  it('fără demonstrație, după numărătoare doar metronomul', () => {
    const plan = planStrum(byId('folk'), 60, 'g-c-d-c')
    const out = runToEnd(renderStrumTrackSteps(plan, { metronome: false, demo: false }))
    const start = plan.countInSteps * plan.stepMs
    expect(energy(out, 0, 40)).toBeGreaterThan(0)
    expect(energy(out, start + 50, start + 900)).toBe(0)
  })

  it('nu saturează, pe acorduri și fără', () => {
    for (const progression of ['mute', 'am-f-c-g']) {
      const plan = planStrum(byId('16-constant'), 200, progression)
      const out = runToEnd(renderStrumTrackSteps(plan, { metronome: true, demo: true }))
      expect(out.reduce((max, value) => Math.max(max, Math.abs(value)), 0)).toBeLessThanOrEqual(0.9001)
    }
  })
})
