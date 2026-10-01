import { Platform } from 'react-native'
import { File, Paths } from 'expo-file-system'
import { KIT_ID } from './kit'
import type { DrumPlan } from './plan'
import { drumTrackKey, renderDrumTrack, type RenderOptions } from './render'
import { encodeWav } from './wav'

/*
  Planul unei sesiuni -> un fișier local (sau un blob pe web), cu cache pe cheie.

  Același aranjament ca la `lib/rhythm/lanes/build-track.ts`: randarea rămâne
  pură în `render.ts`, iar partea care atinge discul stă aici. Un singur fișier
  pe sesiune, redat cu un singur `play()`, vezi mobile/CLAUDE.md §4.
*/

export interface SessionTrack {
  uri: string
  /** Poate depăși `plan.totalMs`, cât să se stingă coada ultimei lovituri. */
  durationMs: number
}

/*
  Se ține și durata, nu doar adresa: durata iese din randare, iar o sesiune de
  90 s are patru milioane de eșantioane, recalculată la fiecare cerere, cache-ul
  n-ar mai economisi nimic.
*/
const cache = new Map<string, SessionTrack>()

/**
 * Numele fișierului: cheia e deja un hash scurt, dar lungimea rămâne mărginită,
 * fiindcă Android refuză să creeze fișiere cu nume peste 255 de caractere, o
 * limită atinsă deja o dată în modulul Ritm.
 */
const fileNameOf = (key: string) => `${key.slice(0, 200)}.wav`

export function buildSessionTrack(plan: DrumPlan, options: RenderOptions): SessionTrack {
  const key = drumTrackKey(plan, KIT_ID, options)
  const cached = cache.get(key)
  if (cached) return cached

  const rendered = renderDrumTrack(plan, options)
  const wav = encodeWav(rendered.samples)
  const track: SessionTrack = { uri: '', durationMs: rendered.durationMs }

  if (Platform.OS === 'web') {
    track.uri = URL.createObjectURL(new Blob([wav as BlobPart], { type: 'audio/wav' }))
  } else {
    const file = new File(Paths.cache, fileNameOf(key))
    if (!file.exists) {
      file.create({ intermediates: true })
      file.write(wav)
    }
    track.uri = file.uri
  }
  cache.set(key, track)
  return track
}
