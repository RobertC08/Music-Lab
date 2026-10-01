import { scoreRound, type HitResult, type RoundScore } from '../game/rhythm'

export interface LaneTap<V extends string> {
  atMs: number
  voice: V
}

export interface LaneScore<V extends string> extends RoundScore {
  /** Scorul fiecărei voci; null la vocile fără lovituri de reprodus. */
  laneScores: Record<V, number | null>
  /** Verdictele fiecărei voci, în ordinea țintelor ei. */
  laneHits: Record<V, HitResult[]>
  /** Bătăi pe o voce care nu avea nimic de reprodus (padul greșit). */
  strayTaps: number
}

/**
 * Scorul unei runde pe mai multe voci (groove, rudimente): fiecare voce se punctează separat, cu motorul rundei de
 * ritm (latența constantă se scade pe fiecare voce), apoi se combină după
 * numărul de lovituri. O bătaie pe un pad care nu avea nimic de bătut e o
 * bătaie în plus, la fel ca una în plus pe padul corect.
 */
export function scoreLanes<V extends string>(
  voices: readonly V[],
  laneTargetsMs: Record<V, number[]>,
  taps: LaneTap<V>[],
  stepMs: number,
): LaneScore<V> {
  const laneScores = {} as Record<V, number | null>
  const laneHits = {} as Record<V, HitResult[]>
  const perLane: { voice: V; score: RoundScore; weight: number }[] = []
  let strayTaps = 0
  for (const voice of voices) {
    const targets = laneTargetsMs[voice]
    const tapTimes = taps.filter((tap) => tap.voice === voice).map((tap) => tap.atMs)
    if (!targets.length) {
      laneScores[voice] = null
      laneHits[voice] = []
      strayTaps += tapTimes.length
      continue
    }
    const score = scoreRound(targets, tapTimes, stepMs)
    laneScores[voice] = score.score
    laneHits[voice] = score.hits
    perLane.push({ voice, score, weight: targets.length })
  }

  const totalWeight = perLane.reduce((sum, lane) => sum + lane.weight, 0) || 1
  const weighted = (pickValue: (score: RoundScore) => number) =>
    perLane.reduce((sum, lane) => sum + pickValue(lane.score) * lane.weight, 0) / totalWeight
  const base = weighted((score) => score.score) / 100
  // Padul greșit se penalizează ca o bătaie în plus, dar nu poate singur duce runda la zero.
  const penalty = Math.min(0.35, strayTaps * 0.12)
  const score = Math.max(0, Math.min(100, Math.round((base - penalty) * 100)))

  const hits = perLane.flatMap((lane) => lane.score.hits).sort((left, right) => left.targetMs - right.targetMs)
  const tendencies = { rushing: 0, dragging: 0, steady: 0 }
  for (const lane of perLane) tendencies[lane.score.tendency] += lane.weight
  const tendency =
    tendencies.rushing > tendencies.steady && tendencies.rushing >= tendencies.dragging
      ? 'rushing'
      : tendencies.dragging > tendencies.steady
        ? 'dragging'
        : 'steady'

  return {
    score,
    hits,
    extraTaps: perLane.reduce((sum, lane) => sum + lane.score.extraTaps, 0) + strayTaps,
    latencyMs: perLane.length ? weighted((value) => value.latencyMs) : 0,
    meanAbsErrorMs: perLane.length ? weighted((value) => value.meanAbsErrorMs) : 0,
    tendency,
    laneScores,
    laneHits,
    strayTaps,
  }
}
