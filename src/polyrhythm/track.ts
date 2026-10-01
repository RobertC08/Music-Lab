import { planLaneTrack, renderLaneWav, type DrumSound, type LaneTrackLayout } from '../lanes/track'
import {
  CROSS_SOUND,
  PULSE_SOUND,
  polyrhythmHands,
  type PolyrhythmHand,
  type PolyrhythmPattern,
} from './patterns'

/** Pista poliritmului: un sunet pentru fluxul de sprijin, altul pentru cel care trece peste. */
export type PolyrhythmTrackLayout = LaneTrackLayout<PolyrhythmHand>

/*
  ACELEAȘI SUNETE CA LECȚIA 18, nu tobe. Lecția pune fluxul tău la 440 Hz și pe
  celălalt cu o cvintă mai jos, la 294, iar asta nu e o alegere de culoare, e
  singurul lucru care ține cele două fluxuri separate în ureche acolo unde se
  suprapun, adică pe „unu”, adică fix unde e toată noțiunea. Cu două tobe
  diferite se aud două instrumente; cu două înălțimi se aud două voci, și
  poți urmări una fără să o pierzi pe cealaltă.

  Trecerea de la lecție la joc nu mai schimbă, deci, ce auzi: se schimbă doar
  cine bate a doua voce, aplicația sau mâna ta.

  Sunetul urmează FLUXUL, nu mâna: nota de sus e mereu fluxul care trece peste,
  cvinta de jos e mereu pulsul. Când mâinile se schimbă între runde, se schimbă
  și padul de pe care vine fiecare sunet, ceea ce e tot ideea: auzi că ai
  trecut de partea cealaltă.

  Perechea de sunete stă în `patterns.ts`, lângă date: nivelul de intrare are
  nevoie de sunetul pulsului ca să-l scrie în acompaniament, iar fișierul ăsta
  îl importă pe acela, invers n-ar merge.
*/

/** Ce sunet are fiecare mână în runda asta, după cine ține fluxul de peste puls. */
export function polyrhythmSounds(pattern: PolyrhythmPattern): Record<PolyrhythmHand, DrumSound> {
  const pulseHand: PolyrhythmHand = pattern.crossHand === 'left' ? 'right' : 'left'
  return {
    [pattern.crossHand]: CROSS_SOUND,
    [pulseHand]: PULSE_SOUND,
  } as Record<PolyrhythmHand, DrumSound>
}

export function planPolyrhythmTrack(pattern: PolyrhythmPattern) {
  return planLaneTrack(pattern, polyrhythmHands, polyrhythmSounds(pattern))
}

export const renderPolyrhythmWav = renderLaneWav
