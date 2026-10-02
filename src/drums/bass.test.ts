import { describe, expect, it } from 'vitest'
import { placeBass, validateBassLine, type BassLine } from './bass'
import { demoExercise } from './theory/bars'
import { planDrumSession } from './plan'
import { drumTrackKey, renderDrumTrack } from './render'
import { testKit } from './test-kit'
import { SAMPLE_RATE } from './wav'

const line: BassLine = {
  bars: [
    [
      { step: 0, length: 4, pitch: 38 },
      { step: 8, length: 1, pitch: 36 },
    ],
  ],
}

const exercise = demoExercise({
  id: 'test-bas',
  stepsPerBar: 16,
  rows: { kick: 'x.......x.......' },
  tempo: { min: 60, max: 120, suggested: 90 },
})

describe('basul de sub exemple', () => {
  it('cade pe pașii exercițiului, după numărătoare, la tempoul ales', () => {
    const plan = planDrumSession(exercise, {
      segments: [{ bpm: 60, repeats: 2 }],
      countInBars: 1,
      clicks: false,
    })
    const placed = placeBass(plan, line)
    // Numărătoarea ține o măsură de 4 s la 60 BPM; un pas e 250 ms.
    expect(placed.map((note) => note.atMs)).toEqual([4000, 6000, 8000, 10000])
    expect(placed[0]!.durationMs).toBe(1000)
  })

  it('se aude în pistă, chiar cu tobele oprite', () => {
    const plan = planDrumSession(exercise, {
      segments: [{ bpm: 90, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const silent = renderDrumTrack(plan, { samples: testKit, hits: false, clicks: false })
    const withBass = renderDrumTrack(plan, {
      samples: testKit,
      hits: false,
      clicks: false,
      bass: line,
    })
    expect(silent.peak).toBe(0)
    expect(withBass.peak).toBeGreaterThan(0.05)
    expect(withBass.peak).toBeLessThan(1)
    expect(withBass.samples.length).toBeGreaterThanOrEqual(
      Math.round((plan.totalMs / 1000) * SAMPLE_RATE),
    )
  })

  it('schimbă cheia de cache, altfel o pistă fără bas ar fi servită cu bas', () => {
    const plan = planDrumSession(exercise, { segments: [{ bpm: 90, repeats: 1 }], countInBars: 0 })
    const moved: BassLine = {
      bars: [
        [
          { step: 0, length: 4, pitch: 38 },
          { step: 9, length: 1, pitch: 36 },
        ],
      ],
    }
    const keys = new Set([
      drumTrackKey(plan, 'kit', {}),
      drumTrackKey(plan, 'kit', { bass: line }),
      drumTrackKey(plan, 'kit', { bass: moved }),
    ])
    expect(keys.size).toBe(3)
  })

  it('prinde notele în afara măsurii, suprapuse sau prea înalte', () => {
    expect(validateBassLine(line, 16)).toEqual([])
    const broken: BassLine = {
      bars: [
        [
          { step: 0, length: 4, pitch: 38 },
          { step: 2, length: 1, pitch: 38 },
          { step: 16, length: 1, pitch: 38 },
          { step: 5, length: 1, pitch: 72 },
        ],
      ],
    }
    expect(validateBassLine(broken, 16)).toHaveLength(3)
  })
})
