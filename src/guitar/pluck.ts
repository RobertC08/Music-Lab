import { analyzeChord, type ChordShape } from './chords'

/*
  Coarda ciupită, sintetizată: Karplus-Strong.

  Fără mostre, ca basul de la tobe (`src/drums/bass.ts`): o mostră de chitară ar
  trebui transpusă pe fiecare notă și înregistrată pe două instrumente, iar aici
  contează ce note sună, nu timbrul exact.

  Algoritmul: un zgomot scurt, cât o perioadă a notei, circulă printr-o buclă cu
  întârzierea egală cu perioada. La fiecare trecere, media a două eșantioane
  vecine îl netezește, deci armonicele de sus se sting primele, exact ce face o
  coardă reală. Întârzierea e fracționară (interpolare liniară): rotunjită la
  eșantion, nota de pe coarda 1, tasta 12, ar ieși cu ~10 cenți falsă.
*/

/*
  Rata de eșantionare a chitarei: 44 100 Hz, aceeași ca la tobe.

  A fost o vreme 22 050 Hz, ca să înjumătățească sinteza și fișierele; s-a
  revenit la 44,1 kHz la cererea lui Robert (2026-10-05), pentru sunet. Ce a
  rămas din optimizare nu ține de rată: notele ținute minte, formele ținute
  minte, sunetul pregătit în fundal, codarea pe `Int16Array`.
*/
export const GUITAR_RATE = 44_100
const SAMPLE_RATE = GUITAR_RATE

const frequencyOf = (pitch: number) => 440 * 2 ** ((pitch - 69) / 12)

/** Cât ține sunetul până scade cu 60 dB: corzile groase sună mai mult. */
const decaySeconds = (frequency: number) => Math.min(6, 2.4 + 200 / frequency)

/**
 * Cât de tare e lovitura. Zgomotul de pornire trece printr-un filtru trece-jos
 * cu coeficientul ăsta: mai mic = atac mai moale, „degetul mare", mai mare =
 * „pana".
 */
const BRIGHTNESS = 0.55

/** Cât de tare intră o coardă în mix: șase corzi deodată nu trebuie să satureze. */
const STRING_GAIN = 0.32

/** Un generator pseudo-aleator cu sămânță: același acord sună la fel la fiecare randare. */
function seeded(seed: number) {
  let state = seed >>> 0 || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) / 0xffffffff) * 2 - 1
  }
}

/*
  O notă se calculează o singură dată pe (înălțime, durată) și se refolosește.
  Într-o sesiune de schimbări de acorduri, același Mi gros se ciupește de zeci
  de ori; calculat de fiecare dată, un minut de practică însemna milioane de
  pași de buclă la apăsarea pe „Pornește".
*/
const pluckCache = new Map<string, Float32Array>()

/** O notă ciupită, de `seconds`, gata mixată (câștig și stingere la capăt). */
export function pluckSamples(pitch: number, seconds: number): Float32Array {
  const length = Math.max(1, Math.round(seconds * SAMPLE_RATE))
  const key = `${pitch}:${length}`
  const cached = pluckCache.get(key)
  if (cached) return cached

  const frequency = frequencyOf(pitch)
  const period = SAMPLE_RATE / frequency
  const delay = period - 0.5
  const whole = Math.floor(delay)
  const fraction = delay - whole
  const feedback = 10 ** (-3 / (decaySeconds(frequency) * frequency))

  // Zgomotul de pornire, netezit, fără componentă continuă.
  const random = seeded(pitch * 7919 + 17)
  const burstLength = Math.round(period)
  const burst = new Float32Array(burstLength)
  let smooth = 0
  let mean = 0
  for (let index = 0; index < burstLength; index += 1) {
    smooth += BRIGHTNESS * (random() - smooth)
    burst[index] = smooth
    mean += smooth
  }
  mean /= burstLength

  const y = new Float32Array(length)
  const out = new Float32Array(length)
  let previous = 0
  const fadeLength = Math.min(length, Math.round(0.05 * SAMPLE_RATE))
  const fadeStart = length - fadeLength
  for (let n = 0; n < length; n += 1) {
    const a = n - whole >= 0 ? y[n - whole]! : 0
    const b = n - whole - 1 >= 0 ? y[n - whole - 1]! : 0
    const delayed = (1 - fraction) * a + fraction * b
    const excitation = n < burstLength ? burst[n]! - mean : 0
    y[n] = excitation + feedback * 0.5 * (delayed + previous)
    previous = delayed
    const fade = n > fadeStart ? (length - n) / fadeLength : 1
    out[n] = y[n]! * STRING_GAIN * fade
  }
  pluckCache.set(key, out)
  return out
}

/** Adaugă în `out`, de la `startSample`, o notă ciupită care ține `seconds`. */
export function addPluck(out: Float32Array, startSample: number, pitch: number, seconds: number, gain = 1) {
  const samples = pluckSamples(pitch, seconds)
  const length = Math.min(samples.length, out.length - startSample)
  for (let index = 0; index < length; index += 1) out[startSample + index]! += samples[index]! * gain
}

/** Distanța dintre corzi într-o lovitură: un gest, nu o subdiviziune, deci fixă în ms. */
export const STRUM_SPACING_MS = 14
/** Distanța dintre corzi când acordul se cântă coardă cu coardă. */
export const ARPEGGIO_SPACING_MS = 280
/** Pauza dintre arpegiu și lovitură. */
const GAP_MS = 450
const ARPEGGIO_RING_S = 1.4
const STRUM_RING_S = 2.2

/**
 * Demonstrația unui acord: întâi coardă cu coardă, de la coarda 6 la coarda 1,
 * apoi lovit o dată, în jos.
 *
 * Ordinea e cea din skill: arpegiat, elevul aude fiecare coardă și are
 * criteriul pentru propriul acord (care coardă trebuie să sune); lovit, aude
 * cum sună întreg.
 */
export function renderChordDemo(shape: ChordShape): Float32Array {
  const pitches = analyzeChord(shape)
    .strings.map((entry) => entry.pitch)
    .filter((pitch): pitch is number => pitch !== null)
  const ms = (value: number) => Math.round((value / 1000) * SAMPLE_RATE)

  const strumAt = ms(pitches.length * ARPEGGIO_SPACING_MS + GAP_MS)
  const total = strumAt + ms(pitches.length * STRUM_SPACING_MS) + Math.round(STRUM_RING_S * SAMPLE_RATE)
  const out = new Float32Array(total)

  pitches.forEach((pitch, index) => {
    addPluck(out, ms(index * ARPEGGIO_SPACING_MS), pitch, ARPEGGIO_RING_S)
  })
  pitches.forEach((pitch, index) => {
    addPluck(out, strumAt + ms(index * STRUM_SPACING_MS), pitch, STRUM_RING_S)
  })

  let peak = 0
  for (const value of out) peak = Math.max(peak, Math.abs(value))
  if (peak > 0.85) for (let index = 0; index < out.length; index += 1) out[index]! *= 0.85 / peak
  return out
}
