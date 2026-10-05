#!/usr/bin/env node
/*
  Mostrele de chitară nylon, pentru aplicație: `assets/guitar/nylon/<midi>.wav`.

  Sursa: FluidR3_GM (Frank Wen, licență MIT; Debian, pachetul fluid-soundfont),
  instrumentul „Acoustic Guitar (nylon)", randat notă cu notă în MP3 de
  github.com/gleitz/midi-js-soundfonts.

  Folosire (decodorul MP3 nu e dependență a proiectului, se instalează doar pentru asta):
    npm i --no-save mpg123-decoder@1
    node scripts/build-guitar-samples.mjs

  Ce face, pe fiecare notă MIDI 40-79 (Mi gros, coarda 6 goală, până la Sol,
  tasta 15 pe coarda 1):
  - descarcă MP3-ul și îl decodează (un decodor nou pe fiecare fișier: refolosit
    după `reset()`, dă erori);
  - stereo -> mono; taie liniștea de la început (codorul MP3 adaugă câteva ms);
  - păstrează 1,5 s și le stinge pe ultimele 150 ms, exponențial: notele mai
    lungi decât atât se sting oricum în pistă;
  - normalizează vârful la 0,9 (volumul în mix îl dă `GUITAR_SAMPLE_GAIN`);
  - scrie WAV mono, 16 biți, 44,1 kHz, ce citește `decodeWav`.
*/
import { MPEGDecoder } from 'mpg123-decoder'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'assets/guitar/nylon'
const KEEP_S = 1.5
const FADE_S = 0.15
const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

mkdirSync(OUT, { recursive: true })
for (let midi = 40; midi < 80; midi += 1) {
  const name = `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
  const url = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/${name}.mp3`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  const decoder = new MPEGDecoder()
  await decoder.ready
  const { channelData, sampleRate } = decoder.decode(new Uint8Array(await response.arrayBuffer()))
  decoder.free()
  if (sampleRate !== 44100) throw new Error(`${name}: ${sampleRate} Hz`)

  const left = channelData[0]
  const right = channelData[1] ?? left
  let start = 0
  while (start < left.length && Math.abs((left[start] + right[start]) / 2) < 0.002) start += 1
  start = Math.max(0, start - 20)
  const length = Math.min(left.length - start, Math.round(KEEP_S * sampleRate))
  const mono = new Float32Array(length)
  for (let index = 0; index < length; index += 1) mono[index] = (left[start + index] + right[start + index]) / 2
  const fade = Math.round(FADE_S * sampleRate)
  for (let index = 0; index < fade; index += 1) {
    const x = index / fade
    mono[length - fade + index] *= Math.exp(-4 * x) * (1 - x)
  }
  let peak = 0
  for (const value of mono) peak = Math.max(peak, Math.abs(value))
  for (let index = 0; index < length; index += 1) mono[index] *= 0.9 / peak

  const bytes = new Uint8Array(44 + length * 2)
  const view = new DataView(bytes.buffer)
  const text = (offset, value) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, length * 2, true)
  for (let index = 0; index < length; index += 1) {
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, mono[index])) * 0x7fff), true)
  }
  writeFileSync(`${OUT}/${midi}.wav`, bytes)
}
console.log(`40 de note scrise în ${OUT}`)
