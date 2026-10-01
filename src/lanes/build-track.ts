import { Platform } from 'react-native'
import { File, Paths } from 'expo-file-system'
import {
  planLaneTrack,
  renderLaneWav,
  type DrumSound,
  type LanePattern,
  type LaneTrackLayout,
  type LaneTrackOptions,
} from './track'

/** Pista unei runde pe voci, ca fișier local (sau blob pe web), cu cache pe cheie. `track.ts` rămâne pur și testabil. */
const uriCache = new Map<string, string>()

/** Cheia fișierului: tot ce schimbă sunetul. Versiunea intră în ea, ca un sunet nou să nu rămână în cache. */
export function laneTrackKey<V extends string>(
  prefix: string,
  pattern: LanePattern<V>,
  voices: readonly V[],
  options: LaneTrackOptions = {},
) {
  const lanes = voices.map((voice) => pattern.lanes[voice].map((hit) => (hit ? '1' : '0')).join('')).join('-')
  const flags = (steps: boolean[]) => steps.map((hit) => (hit ? '1' : '0')).join('')
  const accents = pattern.accents ? `-a${flags(pattern.accents)}` : ''
  const backing = pattern.backing
    ? `-b${Object.entries(pattern.backing)
        .map(([sound, steps]) => `${sound[0]}${flags(steps ?? [])}`)
        .join('')}`
    : ''
  const silent = options.playPattern === false ? '-r' : ''
  return `${prefix}-v1-${pattern.bpm}-${pattern.stepsPerBar}-${pattern.beatsPerBar}-${lanes}${accents}${backing}${silent}`
}

/**
 * Numele fișierului din cache: prefixul plus un hash al cheii. Cheia întreagă
 * (cu groove-ul de acompaniament) trece de 255 de caractere, iar Android
 * refuză atunci să creeze fișierul.
 */
export function laneTrackFileName(prefix: string, key: string) {
  let hash = 2_166_136_261
  let second = 0x9e3779b9
  for (let index = 0; index < key.length; index += 1) {
    const code = key.charCodeAt(index)
    hash = Math.imul(hash ^ code, 16_777_619)
    second = Math.imul(second ^ code, 2_246_822_519)
  }
  const hex = (value: number) => (value >>> 0).toString(16).padStart(8, '0')
  return `${prefix}-${hex(hash)}${hex(second)}-${key.length}.wav`
}

export function buildLaneTrack<V extends string>(
  prefix: string,
  pattern: LanePattern<V>,
  voices: readonly V[],
  sounds: Record<V, DrumSound>,
  options: LaneTrackOptions = {},
): { uri: string; layout: LaneTrackLayout<V> } {
  const { events, ...layout } = planLaneTrack(pattern, voices, sounds, options)
  const key = laneTrackKey(prefix, pattern, voices, options)
  const cached = uriCache.get(key)
  if (cached) return { uri: cached, layout }
  const wav = renderLaneWav(events, layout.totalMs)
  if (Platform.OS === 'web') {
    const uri = URL.createObjectURL(new Blob([wav as BlobPart], { type: 'audio/wav' }))
    uriCache.set(key, uri)
    return { uri, layout }
  }
  const file = new File(Paths.cache, laneTrackFileName(prefix, key))
  if (!file.exists) {
    file.create({ intermediates: true })
    file.write(wav)
  }
  uriCache.set(key, file.uri)
  return { uri: file.uri, layout }
}
