import { analyzeChord, type ChordShape } from './chords'
import { ARPEGGIO_SPACING_MS, GUITAR_RATE as SAMPLE_RATE, STRUM_SPACING_MS } from './pluck'
import { mixVoices, planPhrase, type PhraseNote, type SampleBank } from './sampled'

/*
  Ce cântă chitara din mostre în afară de exercițiile pentru degete (acelea sunt
  în `finger-track.ts`): demonstrația unui acord, loviturile de strumming,
  acordul lovit la schimbări. Toate trec prin `planPhrase` / `mixVoices`, deci au
  aceeași umanizare mică și aceleași stingeri naturale: două lovituri la rând pe
  aceeași coardă nu se taie, se înlănțuie.
*/

const at = (ms: number) => Math.round((ms / 1000) * SAMPLE_RATE)

/** Coardele care sună într-un acord, de la coarda 6 la 1. */
export const soundingStrings = (shape: ChordShape) =>
  analyzeChord(shape)
    .strings.filter((entry) => entry.pitch !== null)
    .map((entry) => ({ string: entry.string, pitch: entry.pitch! }))

export interface StrokeOptions {
  /** Momentul loviturii, în eșantioane. */
  time: number
  down: boolean
  velocity: number
  /** Cât sună, în eșantioane. */
  ring: number
  /** Distanța dintre coarde, în ms. */
  spacingMs?: number
  /** Doar coardele 1-4 (lovitura în sus a mâinii adevărate nu ajunge la basuri). */
  upperOnly?: boolean
}

/** O lovitură peste coardele unui acord, ca note pentru `planPhrase`. */
export function strokeNotes(strings: { string: number; pitch: number }[], options: StrokeOptions): PhraseNote[] {
  const spacing = options.spacingMs ?? STRUM_SPACING_MS
  const chosen = options.upperOnly ? strings.filter((entry) => entry.string <= 4) : strings
  const ordered = options.down ? chosen : [...chosen].reverse()
  return ordered.map((entry, order) => ({
    time: options.time + at(order * spacing),
    pitch: entry.pitch,
    string: entry.string as PhraseNote['string'],
    articulation: 'pick' as const,
    velocity: options.velocity,
    maxLength: options.ring,
    stepLength: options.ring,
  }))
}

/** Pune o frază în `out`, pe felii de câte 24 de note (pentru randarea în fundal). */
export function* mixPhraseSteps(out: Float32Array, bank: SampleBank, notes: PhraseNote[], seed: number): Generator<void, void> {
  const voices = planPhrase(notes, seed, (pitch) => bank.get(pitch)?.length ?? 1)
  for (let from = 0; from < voices.length; from += 24) {
    mixVoices(out, bank, voices.slice(from, from + 24))
    yield
  }
}

const STRUM_RING_MS = 2200
const GAP_MS = 450

/** Demonstrația unui acord din mostre: coardă cu coardă, apoi lovit o dată (ca `renderChordDemo`). */
export function renderChordDemoSampled(shape: ChordShape, bank: SampleBank): Float32Array {
  const strings = soundingStrings(shape)
  const strumAt = at(strings.length * ARPEGGIO_SPACING_MS + GAP_MS)
  const out = new Float32Array(strumAt + at(strings.length * STRUM_SPACING_MS + STRUM_RING_MS + 200))
  const arpeggio: PhraseNote[] = strings.map((entry, order) => ({
    time: at(order * ARPEGGIO_SPACING_MS),
    pitch: entry.pitch,
    string: entry.string as PhraseNote['string'],
    articulation: 'pick',
    velocity: 0.8,
    // Coardă cu coardă, fiecare lăsată să sune până la lovitura de la final.
    maxLength: strumAt - at(order * ARPEGGIO_SPACING_MS),
    stepLength: at(ARPEGGIO_SPACING_MS),
  }))
  const strum = strokeNotes(strings, { time: strumAt, down: true, velocity: 0.75, ring: at(STRUM_RING_MS) })
  const steps = mixPhraseSteps(out, bank, [...arpeggio, ...strum], shape.frets.length * 31 + strings.length)
  while (!steps.next().done) {
    // Toate dintr-o bucată: o demonstrație are câteva secunde.
  }
  let peak = 0
  for (const value of out) peak = Math.max(peak, Math.abs(value))
  if (peak > 0.85) for (let index = 0; index < out.length; index += 1) out[index]! *= 0.85 / peak
  return out
}
