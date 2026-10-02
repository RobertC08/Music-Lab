import { describe, expect, it } from 'vitest'
import { planDrumSession } from './plan'
import { createPlayhead, decodeCursor, soundingKey, stepCursor } from './playhead'
import { grooveById } from './grooves'

const rock = grooveById('rock-basic')!
// 60 BPM, 8 pași pe măsură: un pas = 500 ms, o măsură = 4 s. O măsură de numărătoare.
const plan = planDrumSession(rock, { segments: [{ bpm: 60, repeats: 2 }], countInBars: 1 })

describe('ceasul redării', () => {
  it('anunță abonații doar când poziția chiar se schimbă', () => {
    const playhead = createPlayhead()
    let calls = 0
    const unsubscribe = playhead.subscribe(() => (calls += 1))
    playhead.set(100)
    playhead.set(100)
    playhead.set(200)
    unsubscribe()
    playhead.set(300)
    expect(calls).toBe(2)
    expect(playhead.position()).toBe(300)
  })
})

describe('cursorul', () => {
  const playhead = createPlayhead()
  const cursor = stepCursor(playhead, plan, (bar) => (bar.countIn ? -1 : bar.exerciseBar))

  it('nu aprinde nimic înainte de start și în numărătoare', () => {
    expect(cursor.get()).toBe(-1)
    playhead.set(1_000)
    expect(cursor.get()).toBe(-1)
  })

  it('dă măsura notației și pasul care se aude', () => {
    // A doua măsură din plan (prima muzicală) începe la 4 s; la 5,6 s suntem pe pasul 3.
    playhead.set(5_600)
    expect(decodeCursor(cursor.get())).toEqual({ bar: 0, step: 3 })
    // În a doua trecere, aceeași măsură a notației.
    playhead.set(8_100)
    expect(decodeCursor(cursor.get())).toEqual({ bar: 0, step: 0 })
  })

  it('se stinge când redarea se oprește', () => {
    playhead.set(-1)
    expect(cursor.get()).toBe(-1)
  })
})

describe('piesele care sună', () => {
  it('se citesc din ceas, ca șir comparabil', () => {
    const playhead = createPlayhead()
    const read = soundingKey(playhead, plan)
    expect(read()).toBe('')
    // Pe „unu” din prima măsură muzicală: fus și tobă mare.
    playhead.set(4_010)
    expect(read().split(',').sort()).toEqual(['hhClosed', 'kick'])
  })
})
