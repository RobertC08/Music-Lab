import type { HapticKind } from '../../haptics/haptic-patterns'
import type { RoundTrackLayout } from '../audio/round-plan'

export interface HapticCue {
  /** Unic pe rundă: bucla vibrează o singură dată pentru fiecare cheie. */
  key: string
  /** Momentul din pistă în care cade bătaia. */
  atMs: number
  kind: HapticKind
}

/**
 * Ce se simte în palmă la o poziție din pistă, după vocabularul haptic al
 * jocurilor: `accent` pe „unu” și `tick` pe ceilalți timpi, la numărătoare și
 * la măsura de pregătire; la exemplu, loviturile pattern-ului (prima e
 * accentul), iar pauzele rămân fără vibrație. În fereastra de răspuns nu
 * vibrează nimic în afară de bătăile jucătorului (`tap`, în hook).
 *
 * „Unu” vine după `beatsPerBar`: în 2/4 accentul cade din doi în doi timpi, în
 * 6/8 (doi timpi de pătrime punctată) tot din doi în doi.
 */
export function hapticCueAt(
  layout: Pick<
    RoundTrackLayout,
    'patternStartMs' | 'prepStartMs' | 'responseStartMs' | 'targetTimesMs'
  >,
  bpm: number,
  audioMs: number,
  beatsPerBar = 4,
): HapticCue | null {
  if (!(audioMs >= 0) || !(bpm > 0)) return null
  const beatMs = 60_000 / bpm
  const beatCue = (prefix: string, startMs: number): HapticCue => {
    const index = Math.floor((audioMs - startMs) / beatMs)
    return {
      key: `${prefix}${index}`,
      atMs: startMs + index * beatMs,
      kind: index % Math.max(1, beatsPerBar) === 0 ? 'accent' : 'tick',
    }
  }
  if (audioMs < layout.patternStartMs) return beatCue('count-', 0)
  if (audioMs < layout.prepStartMs) {
    const offset = layout.responseStartMs - layout.patternStartMs
    let last = -1
    for (let index = 0; index < layout.targetTimesMs.length; index += 1) {
      if (layout.targetTimesMs[index]! - offset <= audioMs) last = index
      else break
    }
    if (last < 0) return null
    return {
      key: `hit-${last}`,
      atMs: layout.targetTimesMs[last]! - offset,
      kind: last === 0 ? 'accent' : 'tick',
    }
  }
  if (audioMs < layout.responseStartMs) return beatCue('prep-', layout.prepStartMs)
  return null
}
