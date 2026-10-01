import { describe, expect, it } from 'vitest'
import {
  TICKS_PER_BAR,
  isCompleteBars,
  splitIntoBars,
  tokenStarts,
  tokensToPattern,
  totalSpan,
  judgementsByToken,
  tokensToEvents,
  groupByToken,
  durationsFromPattern,
  type RhythmToken,
} from './notation-tokens'

/** Pasi per timp, derivat din unitate: testele vorbesc muzical, nu in numere magice. */
const BEAT = TICKS_PER_BAR / 4

/** Indicii la care pattern-ul are atac. */
const onsets = (pattern: boolean[]) => pattern.flatMap((hit, i) => (hit ? [i] : []))

describe('notatie -> pattern', () => {
  it('o masura de patrimi da o lovitura pe fiecare timp', () => {
    const tokens: RhythmToken[] = ['quarter', 'quarter', 'quarter', 'quarter']
    expect(totalSpan(tokens)).toBe(TICKS_PER_BAR)
    const pattern = tokensToPattern(tokens)
    expect(pattern).toHaveLength(TICKS_PER_BAR)
    expect(onsets(pattern)).toEqual([0, BEAT, 2 * BEAT, 3 * BEAT])
  })

  it('perechea de optimi bate pe timp si la jumatatea lui', () => {
    expect(onsets(tokensToPattern(['eighthPair']))).toEqual([0, BEAT / 2])
  })

  it('grupul de saisprezecimi bate pe toate cele patru', () => {
    expect(onsets(tokensToPattern(['sixteenthGroup']))).toEqual([
      0,
      BEAT / 4,
      BEAT / 2,
      (BEAT * 3) / 4,
    ])
  })

  it('trioletul imparte timpul in trei parti egale', () => {
    const pattern = tokensToPattern(['tripletEighths'])
    expect(pattern).toHaveLength(BEAT)
    expect(onsets(pattern)).toEqual([0, BEAT / 3, (BEAT * 2) / 3])
    // Cheia: impartirea in trei iese in numere intregi, fara rotunjiri.
    expect(Number.isInteger(BEAT / 3)).toBe(true)
  })

  it('sextoletul imparte timpul in sase parti egale', () => {
    const pattern = tokensToPattern(['sextoletSixteenths'])
    expect(pattern).toHaveLength(BEAT)
    expect(onsets(pattern)).toEqual([0, BEAT / 6, BEAT / 3, BEAT / 2, (BEAT * 2) / 3, (BEAT * 5) / 6])
    // Impartirea in sase iese tot in numere intregi pe grila de 12 pasi.
    expect(Number.isInteger(BEAT / 6)).toBe(true)
  })

  it('sextoletul cade peste trioletul din care vine', () => {
    const sase = onsets(tokensToPattern(['sextoletSixteenths']))
    const trei = onsets(tokensToPattern(['tripletEighths']))
    // Notele impare ale sextoletului coincid cu trioletul: asa il si numeri.
    expect(trei.every((step) => sase.includes(step))).toBe(true)
  })

  it('punctul adauga jumatate din durata notei', () => {
    expect(totalSpan(['dottedQuarter'])).toBe(BEAT * 1.5)
    expect(totalSpan(['dottedEighth'])).toBe(BEAT * 0.75)
    // Patrime punctata plus optime fac exact doi timpi.
    expect(totalSpan(['dottedQuarter', 'eighth'])).toBe(BEAT * 2)
  })

  it('pauzele ocupa durata, dar nu produc lovituri', () => {
    const tokens: RhythmToken[] = ['quarter', 'quarterRest', 'quarter', 'quarterRest']
    const pattern = tokensToPattern(tokens)
    expect(pattern).toHaveLength(TICKS_PER_BAR)
    expect(onsets(pattern)).toEqual([0, 2 * BEAT])
  })

  it('doimea tine jumatate de masura', () => {
    expect(tokensToPattern(['half', 'half'])).toHaveLength(TICKS_PER_BAR)
    expect(onsets(tokensToPattern(['half', 'half']))).toEqual([0, 2 * BEAT])
  })

  it('amesteca valori diferite in aceeasi masura', () => {
    const tokens: RhythmToken[] = ['quarter', 'eighthPair', 'sixteenthGroup', 'quarterRest']
    expect(totalSpan(tokens)).toBe(TICKS_PER_BAR)
    // patrime(1) + doua optimi(2) + patru saisprezecimi(4) + pauza(0)
    expect(onsets(tokensToPattern(tokens))).toHaveLength(7)
    expect(tokenStarts(tokens)).toEqual([0, BEAT, 2 * BEAT, 3 * BEAT])
  })

  it('recunoaste sirurile care nu umplu masuri intregi', () => {
    expect(isCompleteBars(['quarter', 'quarter', 'quarter', 'quarter'])).toBe(true)
    expect(isCompleteBars(['quarter', 'quarter'])).toBe(false)
    expect(isCompleteBars([])).toBe(false)
  })

  it('imparte pe masuri pentru randare', () => {
    const tokens: RhythmToken[] = [
      'quarter', 'quarter', 'quarter', 'quarter',
      'eighthPair', 'eighthPair', 'quarter', 'quarterRest',
    ]
    const bars = splitIntoBars(tokens)
    expect(bars).toHaveLength(2)
    expect(totalSpan(bars[0]!)).toBe(TICKS_PER_BAR)
    expect(totalSpan(bars[1]!)).toBe(TICKS_PER_BAR)
  })
})

describe('verdicte pe tokeni', () => {
  it('pauzele nu primesc verdict', () => {
    const tokens: RhythmToken[] = ['quarter', 'quarterRest', 'quarter', 'quarterRest']
    expect(judgementsByToken(tokens, ['perfect', 'good'])).toEqual([
      'perfect',
      null,
      'good',
      null,
    ])
  })

  it('un grup primeste cel mai slab verdict dintre notele lui', () => {
    const tokens: RhythmToken[] = ['sixteenthGroup', 'quarter']
    const result = judgementsByToken(tokens, ['perfect', 'perfect', 'miss', 'perfect', 'good'])
    expect(result).toEqual(['miss', 'good'])
  })

  it('perechea de optimi consuma exact doua verdicte', () => {
    const tokens: RhythmToken[] = ['eighthPair', 'eighthPair']
    expect(judgementsByToken(tokens, ['perfect', 'late', 'good', 'perfect'])).toEqual([
      'late',
      'good',
    ])
  })

  it('rezista cand lipsesc verdicte', () => {
    const tokens: RhythmToken[] = ['quarter', 'quarter', 'quarter']
    expect(judgementsByToken(tokens, ['perfect'])).toEqual(['perfect', null, null])
  })
})

describe('durate scrise', () => {
  it('doimea tine doi timpi, patrimea unul', () => {
    expect(tokensToEvents(['half', 'quarter', 'quarter'])).toEqual([
      { step: 0, durationSteps: 2 * BEAT },
      { step: 2 * BEAT, durationSteps: BEAT },
      { step: 3 * BEAT, durationSteps: BEAT },
    ])
  })

  it('deosebeste doimea de patrimea urmata de pauza', () => {
    const doime = tokensToEvents(['half'])
    const patrimeCuPauza = tokensToEvents(['quarter', 'quarterRest'])
    // Acelasi atac, durate diferite - exact distinctia care lipsea.
    expect(doime[0]!.step).toBe(patrimeCuPauza[0]!.step)
    expect(doime[0]!.durationSteps).toBe(2 * BEAT)
    expect(patrimeCuPauza[0]!.durationSteps).toBe(BEAT)
  })

  it('notele dintr-un grup tin fiecare cat subdiviziunea lor', () => {
    expect(tokensToEvents(['eighthPair'])).toEqual([
      { step: 0, durationSteps: BEAT / 2 },
      { step: BEAT / 2, durationSteps: BEAT / 2 },
    ])
    expect(tokensToEvents(['sixteenthGroup']).every((e) => e.durationSteps === BEAT / 4)).toBe(
      true,
    )
    expect(tokensToEvents(['tripletEighths']).every((e) => e.durationSteps === BEAT / 3)).toBe(
      true,
    )
    expect(
      tokensToEvents(['sextoletSixteenths']).every((e) => e.durationSteps === BEAT / 6),
    ).toBe(true)
  })

  it('patrimea punctata tine cat o patrime si o optime', () => {
    const [nota] = tokensToEvents(['dottedQuarter', 'eighth'])
    expect(nota!.durationSteps).toBe(BEAT * 1.5)
  })

  it('pentru pattern-uri generate, nota tine pana la urmatorul atac', () => {
    expect(durationsFromPattern([true, false, true, false, false, false, true, false])).toEqual([
      2, 4, 2,
    ])
  })
})

describe('gruparea valorilor pe tokeni', () => {
  it('da fiecarui token exact valorile loviturilor lui', () => {
    const tokens: RhythmToken[] = ['quarter', 'quarterRest', 'eighthPair', 'sixteenthGroup']
    expect(groupByToken(tokens, [1, 2, 3, 4, 5, 6, 7])).toEqual([
      [1],
      null,
      [2, 3],
      [4, 5, 6, 7],
    ])
  })

  it('nu inventeaza valori cand sirul e mai scurt', () => {
    const tokens: RhythmToken[] = ['quarter', 'quarter', 'quarter']
    expect(groupByToken(tokens, ['a'])).toEqual([['a'], [], []])
  })
})
