import { GUITAR_RATE } from './pluck'

/**
 * WAV mono 16-bit la rata chitarei (`GUITAR_RATE`). Separat de `encodeWav` de la
 * tobe: modulul de tobe rămâne neatins (se sincronizează cu ToneTrack fișier cu
 * fișier), iar aici scrierea e pe `Int16Array`, mai rapidă pe Hermes.
 */
export function encodeGuitarWav(samples: Float32Array): Uint8Array {
  const steps = encodeGuitarWavSteps(samples)
  for (;;) {
    const step = steps.next()
    if (step.done) return step.value
  }
}

/** Codarea, în pași de câte un bloc, ca randarea (`renderChangesTrackSteps`). */
export function* encodeGuitarWavSteps(samples: Float32Array): Generator<void, Uint8Array> {
  const count = samples.length
  const bytes = new Uint8Array(44 + count * 2)
  const view = new DataView(bytes.buffer)
  const text = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
  }
  text(0, 'RIFF')
  view.setUint32(4, 36 + count * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, GUITAR_RATE, true)
  view.setUint32(28, GUITAR_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, count * 2, true)
  // Un Int16Array scris direct, nu `setInt16` pe eșantion: pe Hermes apelul pe
  // eșantion e ce costă.
  const pcm = new Int16Array(bytes.buffer, 44, count)
  for (let from = 0; from < count; from += 200_000) {
    const to = Math.min(count, from + 200_000)
    for (let index = from; index < to; index += 1) {
      pcm[index] = Math.round(Math.max(-1, Math.min(1, samples[index]!)) * 0x7fff)
    }
    yield
  }
  return bytes
}
