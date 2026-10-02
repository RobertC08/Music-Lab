import { describe, expect, it } from 'vitest'
import { planDrumMedley } from '../plan'
import { demoExercise, thinClicks } from './bars'

const bar = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
const exercise = demoExercise({
  id: 'test-clic-rar',
  stepsPerBar: 8,
  rows: bar,
  extraBars: [bar, bar],
  tempo: { min: 60, max: 120, suggested: 60 },
})

describe('clicul rărit din lecția despre clic', () => {
  it('lasă doar timpii ceruți pe fiecare măsură și păstrează numărătoarea', () => {
    const plan = planDrumMedley([{ exercise, bpm: 60, repeats: 2 }], { countInBars: 1 })
    const thinned = thinClicks(plan, [[1, 2, 3, 4], [2, 4], [1]])
    const beatsIn = (index: number) =>
      thinned.clicks.filter((click) => click.bar === index).map((click) => click.beat + 1)
    expect(beatsIn(0)).toEqual([1, 2, 3, 4])
    expect(beatsIn(1)).toEqual([1, 2, 3, 4])
    expect(beatsIn(2)).toEqual([2, 4])
    expect(beatsIn(3)).toEqual([1])
    // A doua trecere reia tiparul de la capăt.
    expect(beatsIn(4)).toEqual([1, 2, 3, 4])
    expect(beatsIn(5)).toEqual([2, 4])
    expect(thinned.hits).toBe(plan.hits)
  })
})
