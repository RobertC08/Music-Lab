import type { RoundScore } from './rhythm'

/*
  Verdictul unei runde de ritm, în vocabularul ecranelor de joc din aplicație
  (RoundFeedbackCard): reușită sau „mai încearcă”, plus un singur sfat. Sfatul
  alege cea mai mare problemă a rundei, în ordinea în care se repară: întâi
  loviturile lipsă sau în plus, apoi ținerea notelor, apoi tendința pulsului.
*/

/** De la acest scor runda e reușită: confetti, sunet de bucurie, mai departe. */
export const RHYTHM_SUCCESS_SCORE = 70
export const RHYTHM_EXCELLENT_SCORE = 90

export type RhythmFeedbackCode =
  | 'excellent'
  | 'good'
  | 'missed'
  | 'extra'
  | 'holds'
  | 'rushing'
  | 'dragging'
  | 'uneven'

export interface RhythmRoundFeedback {
  code: RhythmFeedbackCode
  tone: 'success' | 'support'
  shouldRetry: boolean
  /** Câte lovituri privește sfatul (ratate, în plus, ținute greșit). */
  count: number
}

export interface RhythmRoundStats {
  total: number
  perfect: number
  missed: number
  extra: number
  wrongHolds: number
  /** Note a căror durată s-a judecat (doar unde notația o scrie). */
  scoredHolds: number
  meanAbsErrorMs: number
}

export function rhythmRoundStats(result: RoundScore): RhythmRoundStats {
  const hits = result.hits
  return {
    total: hits.length,
    perfect: hits.filter((hit) => hit.judgement === 'perfect').length,
    missed: hits.filter((hit) => hit.judgement === 'miss').length,
    extra: result.extraTaps,
    wrongHolds: hits.filter(
      (hit) => hit.holdJudgement === 'short' || hit.holdJudgement === 'long',
    ).length,
    // O notă ratată nu are cum să fie „ținută corect”, deci nu intră la numărat.
    scoredHolds: hits.filter((hit) => hit.expectedHoldMs !== null && hit.tapMs !== null).length,
    meanAbsErrorMs: Math.round(result.meanAbsErrorMs),
  }
}

export function rhythmRoundFeedback(result: RoundScore): RhythmRoundFeedback {
  if (result.score >= RHYTHM_EXCELLENT_SCORE)
    return { code: 'excellent', tone: 'success', shouldRetry: false, count: 0 }
  if (result.score >= RHYTHM_SUCCESS_SCORE)
    return { code: 'good', tone: 'success', shouldRetry: false, count: 0 }
  const stats = rhythmRoundStats(result)
  const support = (code: RhythmFeedbackCode, count = 0): RhythmRoundFeedback => ({
    code,
    tone: 'support',
    shouldRetry: true,
    count,
  })
  if (stats.missed > 0 && stats.missed >= stats.extra) return support('missed', stats.missed)
  if (stats.extra > 0) return support('extra', stats.extra)
  if (stats.wrongHolds > 0) return support('holds', stats.wrongHolds)
  if (result.tendency === 'rushing') return support('rushing')
  if (result.tendency === 'dragging') return support('dragging')
  return support('uneven')
}
