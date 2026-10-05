import { describe, expect, it } from 'vitest'
import { addPluck, GUITAR_RATE, renderChordDemo } from './pluck'

/** Frecvența dominantă, din autocorelație, cu interpolare parabolică pe vârf. */
function estimateFrequency(samples: Float32Array, minHz: number, maxHz: number) {
  const from = Math.floor(GUITAR_RATE / maxHz)
  const to = Math.ceil(GUITAR_RATE / minHz)
  const start = Math.round(0.05 * GUITAR_RATE)
  const window = Math.round(0.2 * GUITAR_RATE)
  const score = (lag: number) => {
    let sum = 0
    for (let index = start; index < start + window; index += 1) sum += samples[index]! * samples[index + lag]!
    return sum
  }
  let best = from
  for (let lag = from; lag <= to; lag += 1) if (score(lag) > score(best)) best = lag
  const [left, mid, right] = [score(best - 1), score(best), score(best + 1)]
  const offset = (0.5 * (left - right)) / (left - 2 * mid + right)
  return GUITAR_RATE / (best + offset)
}

const cents = (measured: number, expected: number) => 1200 * Math.log2(measured / expected)

describe('coarda ciupită', () => {
  it.each([
    [40, 82.41],
    [45, 110],
    [64, 329.63],
    [76, 659.26],
  ])('nota MIDI %i sună la %f Hz, sub 5 cenți abatere', (pitch, hz) => {
    const out = new Float32Array(GUITAR_RATE)
    addPluck(out, 0, pitch, 1)
    expect(Math.abs(cents(estimateFrequency(out, hz * 0.8, hz * 1.25), hz))).toBeLessThan(5)
  })

  it('se stinge: ultima zecime de secundă e mai încet decât prima', () => {
    const out = new Float32Array(GUITAR_RATE * 2)
    addPluck(out, 0, 64, 2)
    const energy = (from: number) =>
      out.slice(from, from + 4410).reduce((sum, value) => sum + value * value, 0)
    expect(energy(out.length - 4410)).toBeLessThan(energy(0) / 10)
  })

  it('demonstrația nu saturează și durează cât arpegiul plus lovitura', () => {
    const out = renderChordDemo({ id: 'C', symbol: 'C', frets: 'x32010', fingers: 'x32-1-' })
    const peak = out.reduce((max, value) => Math.max(max, Math.abs(value)), 0)
    expect(peak).toBeLessThanOrEqual(0.86)
    expect(peak).toBeGreaterThan(0.05)
    expect(out.length / GUITAR_RATE).toBeGreaterThan(3.5)
    expect(out.length / GUITAR_RATE).toBeLessThan(6)
  })
})
