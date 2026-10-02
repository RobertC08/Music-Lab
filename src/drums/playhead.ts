import type { DrumPlan, PlannedBar } from './plan'
import { piecesSoundingAt } from './sounding'

/*
  Poziția din pistă, ținută în afara stării React.

  Poziția se citește la fiecare cadru (~60 de ori pe secundă). Ținută ca stare,
  fiecare citire redesena tot ecranul, deși grila se schimbă doar la fiecare
  pas, desenul setului doar la fiecare lovitură, iar numărul măsurii o dată pe
  măsură. Aici poziția stă într-un obiect simplu care își anunță abonații; fiecare
  bucată de interfață își calculează din ea doar valoarea de care are nevoie
  (pasul aprins, piesele lovite), iar React o redesenează doar când acea valoare
  se schimbă (`useSyncExternalStore`, în `use-playhead.ts`).

  Pur: nimic din React, deci se testează în Node.
*/

export interface Playhead {
  subscribe: (listener: () => void) => () => void
  /** Poziția în pistă, în ms; `-1` cât timp nu cântă nimic. */
  position: () => number
}

export interface PlayheadSource extends Playhead {
  set: (positionMs: number) => void
}

export function createPlayhead(): PlayheadSource {
  let position = -1
  const listeners = new Set<() => void>()
  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    position: () => position,
    set(next) {
      if (next === position) return
      position = next
      for (const listener of listeners) listener()
    },
  }
}

/** Măsura în care cade un moment, sau `null`. Caută întâi lângă ultima găsită. */
export function barFinder(plan: DrumPlan) {
  let last = 0
  return (positionMs: number): PlannedBar | null => {
    if (positionMs < 0) return null
    const { bars } = plan
    const near = bars[last]
    if (near && positionMs >= near.atMs && positionMs < near.endMs) return near
    const next = bars[last + 1]
    if (next && positionMs >= next.atMs && positionMs < next.endMs) {
      last += 1
      return next
    }
    const index = bars.findIndex((bar) => positionMs >= bar.atMs && positionMs < bar.endMs)
    if (index < 0) return null
    last = index
    return bars[index]!
  }
}

/**
 * Cursorul: măsura de afișat și pasul care se aude, codate într-un singur număr,
 * ca să poată fi comparate dintr-o privire (`bar * CURSOR_STRIDE + step`, sau
 * `-1` când nu se aude nimic de arătat).
 */
export const CURSOR_STRIDE = 10_000

export interface StepCursor {
  subscribe: (listener: () => void) => () => void
  get: () => number
}

export const decodeCursor = (value: number) =>
  value < 0
    ? { bar: -1, step: -1 }
    : { bar: Math.floor(value / CURSOR_STRIDE), step: value % CURSOR_STRIDE }

/**
 * Din poziție, cursorul. `toBar` spune ce măsură din NOTAȚIE corespunde unei
 * măsuri din plan (`-1` = nimic de aprins, de exemplu numărătoarea).
 *
 * Rezultatul se ține minte pe poziție: sute de celule îl cer la fiecare cadru,
 * iar căutarea măsurii s-ar repeta degeaba.
 */
export function stepCursor(
  playhead: Playhead,
  plan: DrumPlan,
  toBar: (bar: PlannedBar) => number,
): StepCursor {
  const find = barFinder(plan)
  let lastPosition = Number.NaN
  let lastValue = -1
  return {
    subscribe: playhead.subscribe,
    get() {
      const position = playhead.position()
      if (position === lastPosition) return lastValue
      lastPosition = position
      const bar = find(position)
      const display = bar ? toBar(bar) : -1
      lastValue =
        !bar || display < 0
          ? -1
          : display * CURSOR_STRIDE +
            Math.min(bar.stepsPerBar - 1, Math.floor((position - bar.atMs) / bar.stepMs))
      return lastValue
    },
  }
}

/** Piesele care sună acum, ca un șir (comparabil), ținut minte pe poziție. */
export function soundingKey(playhead: Playhead, plan: DrumPlan) {
  let lastPosition = Number.NaN
  let lastKey = ''
  return () => {
    const position = playhead.position()
    if (position === lastPosition) return lastKey
    lastPosition = position
    lastKey = position < 0 ? '' : piecesSoundingAt(plan, position).join(',')
    return lastKey
  }
}
