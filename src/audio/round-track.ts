import { Platform } from 'react-native'
import { File, Paths } from 'expo-file-system'
import { planRoundTrack, renderWav, type RoundTrackLayout, type RoundTrackSpec } from './round-plan'

export { planRoundTrack } from './round-plan'
export type { RoundTrackLayout, RoundTrackSpec } from './round-plan'

const uriCache = new Map<string, string>()

function cacheKey(spec: RoundTrackSpec) {
  return `${spec.bpm}-${spec.stepsPerBar}-${spec.beatsPerBar ?? 4}-${spec.countInBars}-${spec.prepBars}-${spec.playPattern === false ? 'silent' : 'play'}-${(spec.patternDurations ?? []).join('.')}-${spec.emphasis ?? 'pattern'}-${spec.pattern.map((v) => (v ? 1 : 0)).join('')}-${(spec.backingPattern ?? []).map((v) => (v ? 1 : 0)).join('')}`
}

export function buildRoundTrack(spec: RoundTrackSpec): { uri: string; layout: RoundTrackLayout } {
  const plan = planRoundTrack(spec)
  const layout: RoundTrackLayout = {
    stepMs: plan.stepMs,
    patternStartMs: plan.patternStartMs,
    prepStartMs: plan.prepStartMs,
    responseStartMs: plan.responseStartMs,
    targetTimesMs: plan.targetTimesMs,
    targetDurationsMs: plan.targetDurationsMs,
    totalMs: plan.totalMs,
  }

  const key = cacheKey(spec)
  const cached = uriCache.get(key)
  if (cached) return { uri: cached, layout }

  const wav = renderWav(plan.events, plan.totalMs, spec.emphasis ?? 'pattern')

  if (Platform.OS === 'web') {
    const uri = URL.createObjectURL(new Blob([wav as BlobPart], { type: 'audio/wav' }))
    uriCache.set(key, uri)
    return { uri, layout }
  }

  const file = new File(Paths.cache, `musiclab-round-${key}.wav`)
  if (!file.exists) {
    file.create({ intermediates: true })
    file.write(wav)
  }
  uriCache.set(key, file.uri)
  return { uri: file.uri, layout }
}
