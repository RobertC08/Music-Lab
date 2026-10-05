import { describe, expect, it } from 'vitest'
import {
  changeLevels,
  chordById,
  chordSequence,
  COUNT_IN_BEATS,
  planChanges,
  positionAt,
  RANDOM_LENGTH,
  totalChanges,
} from './changes'
import { renderChangesTrack } from './changes-track'
import { GUITAR_RATE } from './pluck'

const exercises = changeLevels.flatMap((level) => level.exercises)
const byId = (id: string) => exercises.find((exercise) => exercise.id === id)!

describe('exercițiile de schimbări', () => {
  it('toate acordurile există în bibliotecă', () => {
    for (const exercise of exercises) {
      for (const id of [...(exercise.chords ?? []), ...(exercise.pool ?? [])]) {
        expect(chordById(id), `${exercise.id}: ${id}`).toBeDefined()
      }
    }
  })

  it('id-uri unice, tempo sugerat în interval, fie serie fixă, fie aleatorie', () => {
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(exercises.length)
    for (const exercise of exercises) {
      const { min, max, suggested } = exercise.tempo
      expect(min <= suggested && suggested <= max, exercise.id).toBe(true)
      expect(!!exercise.chords !== !!exercise.pool, exercise.id).toBe(true)
    }
  })

  it('o serie fixă nu are același acord de două ori la rând, nici peste reluare', () => {
    for (const exercise of exercises.filter((item) => item.chords)) {
      const ids = exercise.chords!
      ids.forEach((id, index) => expect(id, exercise.id).not.toBe(ids[(index + 1) % ids.length]))
    }
  })

  it('nivelurile cresc: întâi 4 timpi, schimbările pe fiecare timp spre final', () => {
    expect(changeLevels[0]!.exercises.every((exercise) => exercise.beatsPerChord === 4)).toBe(true)
    const firstFast = changeLevels.findIndex((level) => level.exercises.some((item) => item.beatsPerChord === 1))
    expect(firstFast).toBeGreaterThan(1)
  })
})

describe('seria aleatorie', () => {
  const exercise = byId('random-open')

  it('aceeași sămânță dă aceeași serie, alta dă alta', () => {
    const ids = (seed: number) => chordSequence(exercise, seed).map((chord) => chord.id).join(' ')
    expect(ids(7)).toBe(ids(7))
    expect(ids(7)).not.toBe(ids(8))
  })

  it('fără repetiții la rând, nici peste reluare, doar din bazin', () => {
    for (let seed = 1; seed < 200; seed += 1) {
      const ids = chordSequence(exercise, seed).map((chord) => chord.id)
      expect(ids).toHaveLength(RANDOM_LENGTH)
      ids.forEach((id, index) => {
        expect(exercise.pool).toContain(id)
        expect(id).not.toBe(ids[(index + 1) % ids.length])
      })
    }
  })
})

describe('planul de timp', () => {
  it('numărătoarea, apoi acordurile pe timpii lor', () => {
    const plan = planChanges(byId('g-c-d'), 60)
    expect(positionAt(plan, 0)).toMatchObject({ countIn: 1, chordIndex: 0, changes: 0 })
    expect(positionAt(plan, 3)).toMatchObject({ countIn: 4 })
    expect(positionAt(plan, COUNT_IN_BEATS)).toMatchObject({ countIn: null, chordIndex: 0, beatInChord: 0, changes: 0 })
    expect(positionAt(plan, COUNT_IN_BEATS + 5)).toMatchObject({ chordIndex: 1, beatInChord: 1, changes: 1 })
    // După o trecere prin serie (4 acorduri × 4 timpi) se reia de la primul.
    expect(positionAt(plan, COUNT_IN_BEATS + 16)).toMatchObject({ chordIndex: 0, changes: 4 })
  })

  it('o sesiune ține cel puțin un minut și cel mult ~95 s', () => {
    for (const exercise of exercises) {
      for (const bpm of [exercise.tempo.min, exercise.tempo.max]) {
        const plan = planChanges(exercise, bpm)
        expect(plan.durationMs, `${exercise.id} @${bpm}`).toBeGreaterThanOrEqual(60_000)
        expect(plan.durationMs, `${exercise.id} @${bpm}`).toBeLessThanOrEqual(95_000 + plan.beatMs * 16)
        expect(plan.repeats).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('numără schimbările', () => {
    const plan = planChanges(byId('em-am'), 60)
    expect(totalChanges(plan)).toBe(plan.repeats * 2 - 1)
  })
})

describe('pista', () => {
  const plan = planChanges(byId('em-am'), 120)
  const sample = (ms: number) => Math.round((ms / 1000) * GUITAR_RATE)
  const energy = (out: Float32Array, fromMs: number, toMs: number) =>
    out.slice(sample(fromMs), sample(toMs)).reduce((sum, value) => sum + value * value, 0)

  it('numărătoarea se aude și fără metronom', () => {
    const out = renderChangesTrack(plan, { metronome: false, strum: false })
    expect(energy(out, 0, 30)).toBeGreaterThan(0)
    // După numărătoare, fără metronom și fără chitară: liniște.
    expect(energy(out, COUNT_IN_BEATS * plan.beatMs + 100, COUNT_IN_BEATS * plan.beatMs + 400)).toBe(0)
  })

  it('metronomul bate pe fiecare timp, mai tare pe „unu"', () => {
    const out = renderChangesTrack(plan, { metronome: true, strum: false })
    const beat = (index: number) => energy(out, index * plan.beatMs, index * plan.beatMs + 40)
    expect(beat(4)).toBeGreaterThan(beat(5))
    expect(beat(5)).toBeGreaterThan(0)
  })

  it('chitara intră pe prima schimbare, nu în numărătoare', () => {
    const out = renderChangesTrack(plan, { metronome: false, strum: true })
    const entry = COUNT_IN_BEATS * plan.beatMs
    expect(energy(out, entry + 50, entry + 300)).toBeGreaterThan(0)
    expect(energy(out, plan.beatMs + 100, plan.beatMs + 400)).toBe(0)
  })

  it('nu saturează', () => {
    const out = renderChangesTrack(planChanges(byId('random-all'), 110, 3), { metronome: true, strum: true })
    expect(out.reduce((max, value) => Math.max(max, Math.abs(value)), 0)).toBeLessThanOrEqual(0.9001)
  })
})
