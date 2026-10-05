import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { decodeWav } from '@/lib/drums/wav'
import { changeLevels, chordById, planChanges } from './changes'
import { changesTrackKey, renderChangesTrackSteps, runToEnd } from './changes-track'
import { fingerLevels, planFinger } from './finger-exercises'
import { fingerTrackKey, renderFingerTrackSampledSteps } from './finger-track'
import { GUITAR_RATE } from './pluck'
import type { SampleBank } from './sampled'
import { renderChordDemoSampled } from './sampled-render'
import { planStrum, strumLevels } from './strums'
import { renderStrumTrackSteps, strumTrackKey } from './strum-track'

const DIR = 'assets/guitar/nylon'

/** Mostrele adevărate, citite cum le citește aplicația (`decodeWav`), cu același câștig. */
function bank(): SampleBank {
  const map = new Map<number, Float32Array[]>()
  for (let pitch = 40; pitch < 80; pitch += 1) {
    const samples = decodeWav(new Uint8Array(readFileSync(`${DIR}/${pitch}.wav`)))
    for (let index = 0; index < samples.length; index += 1) samples[index]! *= 0.55
    map.set(pitch, [samples])
  }
  return map
}

const peak = (out: Float32Array) => out.reduce((max, value) => Math.max(max, Math.abs(value)), 0)
const rms = (out: Float32Array) => Math.sqrt(out.reduce((sum, value) => sum + value * value, 0) / out.length)

/** Frecvența dominantă, din autocorelație (ca în `pluck.test.ts`). */
function estimate(samples: Float32Array, hz: number) {
  const from = Math.floor(GUITAR_RATE / (hz * 1.25))
  const to = Math.ceil(GUITAR_RATE / (hz * 0.8))
  const start = Math.round(0.1 * GUITAR_RATE)
  const window = Math.round(0.3 * GUITAR_RATE)
  const score = (lag: number) => {
    let sum = 0
    for (let index = start; index < start + window; index += 1) sum += samples[index]! * samples[index + lag]!
    return sum
  }
  let best = from
  for (let lag = from; lag <= to; lag += 1) if (score(lag) > score(best)) best = lag
  const [l, m, r] = [score(best - 1), score(best), score(best + 1)]
  return GUITAR_RATE / (best + (0.5 * (l - r)) / (l - 2 * m + r))
}

describe('mostrele de chitară nylon', () => {
  const samples = bank()

  it('sunt toate cele 40 de note, cu credit și licență', () => {
    for (let pitch = 40; pitch < 80; pitch += 1) expect(existsSync(`${DIR}/${pitch}.wav`), String(pitch)).toBe(true)
    const credit = JSON.parse(readFileSync(`${DIR}/kit.json`, 'utf8'))
    expect(credit.license).toBe('MIT')
    expect(readFileSync(`${DIR}/CREDITS.md`, 'utf8')).toContain('Frank Wen')
  })

  it('fiecare notă e chiar nota ei (sub 15 cenți)', () => {
    for (const pitch of [40, 45, 50, 55, 59, 64, 69, 76]) {
      const hz = 440 * 2 ** ((pitch - 69) / 12)
      const cents = 1200 * Math.log2(estimate(samples.get(pitch)![0]!, hz) / hz)
      expect(Math.abs(cents), String(pitch)).toBeLessThan(15)
    }
  })

  it('demonstrația unui acord din mostre se aude și nu distorsionează', () => {
    const out = renderChordDemoSampled(chordById('C')!, samples)
    expect(rms(out)).toBeGreaterThan(0.02)
    expect(peak(out)).toBeLessThanOrEqual(0.851)
  })

  it('pistele însoțitorilor, din mostre: se aud, nu distorsionează, cheie separată de sinteză', () => {
    const changes = planChanges(changeLevels[0]!.exercises[0]!, 90)
    const changesOut = runToEnd(renderChangesTrackSteps(changes, { metronome: false, strum: true, bank: samples }))
    expect(rms(changesOut)).toBeGreaterThan(0.01)
    expect(peak(changesOut)).toBeLessThanOrEqual(0.9001)
    expect(changesTrackKey('x', 1, changes, { metronome: true, strum: true, bank: samples })).not.toBe(
      changesTrackKey('x', 1, changes, { metronome: true, strum: true }),
    )

    for (const progression of ['g-c-d-c', 'mute']) {
      const strum = planStrum(strumLevels[1]!.exercises[0]!, 90, progression)
      const strumOut = runToEnd(renderStrumTrackSteps(strum, { metronome: false, demo: true, bank: samples }))
      expect(rms(strumOut), progression).toBeGreaterThan(0.005)
      expect(peak(strumOut), progression).toBeLessThanOrEqual(0.9001)
    }
    const strum = planStrum(strumLevels[1]!.exercises[0]!, 90, 'em')
    expect(strumTrackKey('x', 'em', strum, { metronome: true, demo: true, bank: samples })).not.toBe(
      strumTrackKey('x', 'em', strum, { metronome: true, demo: true }),
    )

    const tril = fingerLevels.flatMap((level) => level.exercises).find((exercise) => exercise.id === 'tril')!
    const finger = planFinger(tril, 80, 4, 5)
    const fingerOut = runToEnd(renderFingerTrackSampledSteps(finger, samples, { metronome: false, demo: true }))
    expect(rms(fingerOut)).toBeGreaterThan(0.01)
    expect(peak(fingerOut)).toBeLessThanOrEqual(0.9001)
    expect(fingerTrackKey('tril', 5, finger, { metronome: true, demo: true }, 'nylon')).not.toBe(
      fingerTrackKey('tril', 5, finger, { metronome: true, demo: true }),
    )
  }, 60_000)
})
