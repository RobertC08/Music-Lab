import type { FingerPlan } from './finger-exercises'
import { renderFingerTrackSampledSteps, renderFingerTrackSteps, type FingerTrackOptions } from './finger-track'
import { CLICK_VERSION } from './metronome'
import type { Direction } from './patterns'
import type { SampleBank } from './sampled'

/*
  Pista unei game sau a unui arpegiu: aceeași randare ca la exercițiile pentru
  degete (metronom + notele, din mostre nylon sau din sinteză). Doar cheia e a
  ei, ca două exerciții diferite să nu primească niciodată același WAV.
*/

export interface PatternTrackId {
  setId: string
  root: number
  position: number
  /** Exercițiul, sau 'preview' pentru „Ascultă". */
  exerciseId: string
  direction: Direction
}

export function patternTrackKey(id: PatternTrackId, plan: FingerPlan, options: FingerTrackOptions, voice: string) {
  return [
    `guitar-pattern-v1-c${CLICK_VERSION}`,
    voice,
    id.setId,
    id.root,
    id.position,
    id.exerciseId,
    id.direction,
    plan.stepsPerBeat,
    plan.bpm,
    plan.repeats,
    `${options.metronome ? 'm' : '-'}${options.demo ? 'd' : '-'}`,
  ].join('-')
}

/** Din mostre (nylon), dacă s-au încărcat; altfel sinteză. */
export const renderPatternTrackSteps = (plan: FingerPlan, options: FingerTrackOptions, bank: SampleBank | null) =>
  bank ? renderFingerTrackSampledSteps(plan, bank, { ...options, seed: 1 }) : renderFingerTrackSteps(plan, options)
