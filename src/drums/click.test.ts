import { describe, expect, it } from 'vitest'
import { accentClick, plainClick } from './click'
import { SAMPLE_RATE } from './wav'

const peak = (out: Float32Array) => out.reduce((max, value) => Math.max(max, Math.abs(value)), 0)
const energy = (out: Float32Array) => out.reduce((sum, value) => sum + value * value, 0)

/** Energia între două frecvențe, dintr-o transformată Fourier directă (clicul e scurt). */
function band(out: Float32Array, from: number, to: number) {
  let sum = 0
  for (let hz = from; hz < to; hz += 50) {
    let re = 0
    let im = 0
    for (let index = 0; index < out.length; index += 1) {
      const angle = (2 * Math.PI * hz * index) / SAMPLE_RATE
      re += out[index]! * Math.cos(angle)
      im -= out[index]! * Math.sin(angle)
    }
    sum += re * re + im * im
  }
  return sum
}

/** Clicul vechi (sinus de 1.100 / 1.760 Hz), ca reper pentru „mai tare". */
function oldClick(accent: boolean) {
  const [frequency, decay, gain] = accent ? [1_760, 0.04, 0.34] : [1_100, 0.03, 0.2]
  const out = new Float32Array(Math.ceil(decay * 3 * SAMPLE_RATE))
  for (let index = 0; index < out.length; index += 1) {
    const time = index / SAMPLE_RATE
    out[index] = Math.sin(2 * Math.PI * frequency * time) * Math.min(1, time / 0.0012) * Math.exp(-time / decay) * gain
  }
  return out
}

describe('clicul de metronom', () => {
  it('e tare, dar nu retează; „unu" e mai tare decât ceilalți timpi', () => {
    expect(peak(accentClick)).toBeCloseTo(0.9, 5)
    expect(peak(plainClick)).toBeCloseTo(0.65, 5)
  })

  it('e mai tare decât clicul vechi în banda în care urechea aude cel mai bine (1,5-5 kHz)', () => {
    expect(band(accentClick, 1_500, 5_000)).toBeGreaterThan(2 * band(oldClick(true), 1_500, 5_000))
    expect(band(plainClick, 1_500, 5_000)).toBeGreaterThan(2 * band(oldClick(false), 1_500, 5_000))
  })

  it('e tăios: mai multă energie peste 1,5 kHz decât sub', () => {
    for (const click of [accentClick, plainClick]) {
      expect(band(click, 1_500, 8_000)).toBeGreaterThan(5 * band(click, 50, 1_500))
    }
  })

  it('e scurt: după 40 ms aproape s-a stins, deci nu acoperă nota de pe timp', () => {
    const after = accentClick.subarray(Math.round(0.04 * SAMPLE_RATE))
    expect(energy(after)).toBeLessThan(0.05 * energy(accentClick))
  })
})
