/*
  WAV mono 16-bit, în ambele sensuri.

  Există separat de `lib/rhythm/lanes/track.ts` (care are propriul scriitor
  inline) pentru un motiv care nu e de stil: la tobe avem nevoie și de CITIRE.
  Mostrele din `assets/drums/` sunt PCM simplu, deci le decodăm în JS și nu mai
  atingem expo-av pentru ele, un decodor nativ ar da `AudioBuffer`-uri pe care
  nu le putem adună eșantion cu eșantion, iar adunarea e tot ce face randarea.
*/

export const SAMPLE_RATE = 44_100

/**
 * Citește un WAV mono, 16-bit, în `Float32Array` cu valori în -1…1.
 *
 * Merge pe chunk-uri, nu pe offsetul fix 44: ffmpeg scrie uneori un `LIST`
 * înainte de `data`, iar un decodor care presupune 44 ar citi metadate ca sunet.
 */
export function decodeWav(bytes: Uint8Array): Float32Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const text = (offset: number) =>
    String.fromCharCode(...[0, 1, 2, 3].map((index) => view.getUint8(offset + index)))
  if (text(0) !== 'RIFF' || text(8) !== 'WAVE') throw new Error('nu e un fișier WAV')

  let bitsPerSample = 16
  let channels = 1
  let offset = 12
  while (offset + 8 <= view.byteLength) {
    const id = text(offset)
    const size = view.getUint32(offset + 4, true)
    if (id === 'fmt ') {
      channels = view.getUint16(offset + 10, true)
      bitsPerSample = view.getUint16(offset + 22, true)
    } else if (id === 'data') {
      if (bitsPerSample !== 16) throw new Error(`se așteptau 16 biți, sunt ${bitsPerSample}`)
      if (channels !== 1) throw new Error(`se aștepta mono, sunt ${channels} canale`)
      const count = Math.floor(size / 2)
      const samples = new Float32Array(count)
      const start = bytes.byteOffset + offset + 8
      /*
        Calea rapidă: eșantioanele citite direct ca `Int16Array`, nu câte un apel
        `getInt16` pe eșantion. Pe telefon (Hermes, fără JIT) apelul pe eșantion
        e ce costă, și aici sunt ~1,5 milioane de eșantioane la încărcarea
        kitului. Cere începutul aliniat la doi octeți, ceea ce un WAV corect are
        mereu (chunk-urile sunt pe octeți pari); altfel rămâne calea veche.
        Little-endian e și WAV-ul, și orice telefon.
      */
      if (start % 2 === 0) {
        const pcm = new Int16Array(bytes.buffer, start, count)
        for (let index = 0; index < count; index += 1) samples[index] = pcm[index]! / 0x8000
        return samples
      }
      for (let index = 0; index < count; index += 1) {
        samples[index] = view.getInt16(offset + 8 + index * 2, true) / 0x8000
      }
      return samples
    }
    // Chunk-urile sunt aliniate pe doi octeți; unul de lungime impară are un pad.
    offset += 8 + size + (size % 2)
  }
  throw new Error('fără chunk `data`')
}

/** Scrie eșantioanele ca WAV mono 16-bit. Valorile din afara -1…1 se retează. */
export function encodeWav(samples: Float32Array): Uint8Array {
  const count = samples.length
  const bytes = new Uint8Array(44 + count * 2)
  const view = new DataView(bytes.buffer)
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + count * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, count * 2, true)
  for (let index = 0; index < count; index += 1) {
    // Rotunjit, nu trunchiat: `setInt16` taie spre zero, iar asta ar adăuga o
    // eroare sistematică de până la un bit pe fiecare eșantion, un zgomot slab,
    // dar corelat cu semnalul, deci audibil pe cozile de cinele.
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, samples[index] ?? 0)) * 0x7fff), true)
  }
  return bytes
}
