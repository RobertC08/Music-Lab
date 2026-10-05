import { Platform } from 'react-native'
import { File, Paths } from 'expo-file-system'
import type { ChordShape } from './chords'
import { GUITAR_VOICE, guitarSamplesIfLoaded } from './guitar-samples'
import { renderChordDemo } from './pluck'
import { renderChordDemoSampled } from './sampled-render'
import { encodeGuitarWav } from './wav'

/*
  Demonstrația unui acord -> un fișier local (sau un blob pe web), cu cache.

  Același aranjament ca `src/drums/session-track.ts`: randarea rămâne pură în
  `pluck.ts`, partea care atinge discul stă aici.
*/

const cache = new Map<string, string>()

const slots = new Map<string, string>()

function forget(key: string) {
  const uri = cache.get(key)
  cache.delete(key)
  if (!uri) return
  try {
    if (Platform.OS === 'web') URL.revokeObjectURL(uri)
    else new File(uri).delete()
  } catch {
    // Un fișier deja șters nu e o problemă.
  }
}

/** Cheia: forma, nu id-ul. Două acorduri cu aceeași formă împart fișierul. */
const keyOf = (shape: ChordShape, voice: string) => `guitar-chord-v4-${voice}-${shape.frets}`

/**
 * Demonstrația unui acord: din mostre (nylon), dacă s-au încărcat; altfel din
 * sinteză. Cheia ține minte sursa, ca o demonstrație sintetizată din cache să nu
 * fie redată după ce mostrele au venit.
 */
export function chordTrackUri(shape: ChordShape): string {
  const bank = guitarSamplesIfLoaded()
  if (bank) return wavUri(keyOf(shape, GUITAR_VOICE), () => renderChordDemoSampled(shape, bank))
  return wavUri(keyOf(shape, 'synth'), () => renderChordDemo(shape))
}

/**
 * Eșantioane -> adresă redabilă, cu cache pe cheie: blob pe web, fișier în cache
 * pe telefon. Randarea se cheamă doar dacă cheia nu e deja în cache.
 */
export function wavUri(key: string, render: () => Float32Array, slot?: string): string {
  const cached = cache.get(key)
  if (cached) return cached
  return storeWav(key, encodeGuitarWav(render()), slot)
}

/** Pista e deja gata (randată în fundal, de exemplu). */
export const hasWav = (key: string) => cache.has(key)

/** Un WAV deja codat -> adresă redabilă, în cache, în slotul dat. */
export function storeWav(key: string, wav: Uint8Array, slot?: string): string {
  const cached = cache.get(key)
  if (cached) return cached
  /*
    Un „slot" ține o singură pistă: pistele de sesiune au ~5 MB fiecare, iar
    fiecare schimbare de tempo ar mai adăuga una în memorie. Pista veche din
    același slot se aruncă înainte să se facă alta.
  */
  if (slot) {
    const previous = slots.get(slot)
    if (previous && previous !== key) forget(previous)
    slots.set(slot, key)
  }

  let uri: string
  if (Platform.OS === 'web') {
    uri = URL.createObjectURL(new Blob([wav as BlobPart], { type: 'audio/wav' }))
  } else {
    const file = new File(Paths.cache, `${key}.wav`)
    if (!file.exists) {
      file.create({ intermediates: true })
      file.write(wav)
    }
    uri = file.uri
  }
  cache.set(key, uri)
  return uri
}
