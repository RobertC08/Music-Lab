import { analyzeChord, type ChordShape } from './chords'
import { accentClick, CLICK_VERSION, plainClick } from './metronome'
import type { SampleBank } from './sampled'
import { mixPhraseSteps, soundingStrings, strokeNotes } from './sampled-render'
import { addPluck, GUITAR_RATE as SAMPLE_RATE } from './pluck'
import { BEATS_PER_BAR, type StrumPlan, type StrumStep } from './strums'

/*
  Pista unei sesiuni de strumming: un singur WAV, metronom + modelul cântat.

  Aceeași regulă ca la schimbări (`changes-track.ts`): un fișier, pornit o
  dată; ecranul citește poziția din el. Randarea e în pași (`yield`), ca să se
  poată face pe felii în fundal fără să blocheze atingerile.

  Cum sună o lovitură:
  - în jos: toate coardele acordului, de la cea groasă la cea subțire;
  - în sus: doar coardele subțiri (1-4), de la 1 spre 4, mai încet: așa lovește
    și mâna adevărată, care la urcare nu ajunge până la basuri;
  - accentul: mai tare;
  - chuck: un „ciac" fără notă, care oprește și acordul de dinainte;
  - acordul sună până la următoarea lovitură, chuck sau pauză; lovitura ratată
    („.") îl lasă să sune mai departe, pauza („-") îl oprește.
  Fără acorduri, fiecare lovitură e un sunet scurt de coarde amortizate.
*/

export interface StrumTrackOptions {
  metronome: boolean
  /** Aplicația cântă modelul. Oprit, rămâne doar metronomul (și numărătoarea). */
  demo: boolean
  /** Mostrele de chitară; lipsă = sinteză. */
  bank?: SampleBank | null
}

const DOWN_SPACING_MS = 12
const UP_SPACING_MS = 9
const MAX_RING_S = 1.8
const MIN_RING_S = 0.06
const GAIN: Record<'D' | 'U' | 'A' | 'B', number> = { D: 0.62, U: 0.42, A: 0.95, B: 0.66 }
const OPEN_STRINGS_LOW_TO_HIGH = [40, 45, 50, 55, 59, 64]
const TAIL_MS = 1_500
const BLOCK = 100_000

/** Un „ciac": zgomot scurt, filtrat, care se stinge repede. Determinist. */
const chuck = (() => {
  const out = new Float32Array(Math.round(0.045 * SAMPLE_RATE))
  let state = 12345
  let smooth = 0
  for (let index = 0; index < out.length; index += 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    const noise = (state / 0x7fffffff) * 2 - 1
    smooth += 0.35 * (noise - smooth)
    out[index] = smooth * Math.exp(-index / (0.012 * SAMPLE_RATE)) * 0.55
  }
  return out
})()

const sounding = (shape: ChordShape) =>
  analyzeChord(shape)
    .strings.filter((entry) => entry.pitch !== null)
    .map((entry) => ({ string: entry.string, pitch: entry.pitch! }))

const isStroke = (step: StrumStep) => step === 'D' || step === 'U' || step === 'A' || step === 'B'
/** Ce oprește sunetul acordului de dinainte. */
const stopsRing = (step: StrumStep) => isStroke(step) || step === 'x' || step === '-'

export function* renderStrumTrackSteps(plan: StrumPlan, options: StrumTrackOptions): Generator<void, Float32Array> {
  const at = (ms: number) => Math.round((ms / 1000) * SAMPLE_RATE)
  const out = new Float32Array(at(plan.durationMs + TAIL_MS))
  const add = (source: Float32Array, start: number, gain = 1) => {
    const length = Math.min(source.length, out.length - start)
    for (let index = 0; index < length; index += 1) out[start + index]! += source[index]! * gain
  }

  // Metronomul: pe timpi, mai tare pe „unu". Numărătoarea îl are mereu.
  const totalBeats = Math.ceil(plan.totalSteps / plan.stepsPerBeat)
  const countInBeats = plan.countInSteps / plan.stepsPerBeat
  for (let beat = 0; beat < totalBeats; beat += 1) {
    if (beat >= countInBeats && !options.metronome) continue
    add(beat % BEATS_PER_BAR === 0 ? accentClick : plainClick, at(beat * plan.stepsPerBeat * plan.stepMs))
  }
  yield

  if (options.demo && options.bank) {
    /*
      Din mostre. Aceleași reguli ca mai jos (în jos toate coardele, în sus doar
      1-4 și mai încet, sună până la următoarea lovitură, chuck sau pauză), dar
      loviturile la rând pe aceeași coardă se înlănțuie natural (`planPhrase`).
      Fără acorduri: o atingere scurtă pe coardele goale, plus „ciacul".
    */
    const barSteps = plan.stepsPerBeat * BEATS_PER_BAR
    const steps = plan.repeats * plan.pattern.length
    const stepAt = (index: number) => plan.pattern[index % plan.pattern.length]!
    const muted = OPEN_STRINGS_LOW_TO_HIGH.map((pitch, order) => ({ string: 6 - order, pitch }))
    const notes = []
    for (let index = 0; index < steps; index += 1) {
      const step = stepAt(index)
      const start = at((plan.countInSteps + index) * plan.stepMs)
      if (step === 'x') {
        add(chuck, start)
        continue
      }
      if (!isStroke(step)) continue
      const down = step === 'D' || step === 'A'
      let next = index + 1
      while (next < steps && !stopsRing(stepAt(next))) next += 1
      const ring = at(Math.max(MIN_RING_S, Math.min(MAX_RING_S, ((next - index) * plan.stepMs) / 1000)) * 1000)
      const velocity = GAIN[step as 'D' | 'U' | 'A' | 'B'] * 1.15
      if (plan.chords.length === 0) {
        notes.push(...strokeNotes(muted, { time: start, down, velocity: velocity * 0.7, ring: at(50), upperOnly: !down, spacingMs: down ? DOWN_SPACING_MS : UP_SPACING_MS }))
        add(chuck, start, velocity * 0.9)
      } else {
        const shape = plan.chords[Math.floor(index / barSteps) % plan.chords.length]!
        notes.push(
          ...strokeNotes(soundingStrings(shape), {
            time: start,
            down,
            velocity,
            ring,
            upperOnly: !down,
            spacingMs: down ? DOWN_SPACING_MS : UP_SPACING_MS,
          }),
        )
      }
    }
    yield* mixPhraseSteps(out, options.bank, notes, plan.bpm * 13 + steps)
  } else if (options.demo) {
    const barSteps = plan.stepsPerBeat * BEATS_PER_BAR
    const steps = plan.repeats * plan.pattern.length
    const stepAt = (index: number) => plan.pattern[index % plan.pattern.length]!
    for (let index = 0; index < steps; index += 1) {
      const step = stepAt(index)
      if (!isStroke(step) && step !== 'x') continue
      const start = at((plan.countInSteps + index) * plan.stepMs)

      if (step === 'x') {
        add(chuck, start)
        continue
      }
      const gain = GAIN[step as 'D' | 'U' | 'A' | 'B']
      const down = step === 'D' || step === 'A'

      // Cât sună: până la următorul lucru care oprește sunetul.
      let next = index + 1
      while (next < steps && !stopsRing(stepAt(next))) next += 1
      const ringSeconds = Math.max(MIN_RING_S, Math.min(MAX_RING_S, ((next - index) * plan.stepMs) / 1000))

      if (plan.chords.length === 0) {
        // Corzi amortizate: o atingere scurtă pe fiecare coardă goală, plus „ciacul".
        const pitches = down ? OPEN_STRINGS_LOW_TO_HIGH : [...OPEN_STRINGS_LOW_TO_HIGH].reverse().slice(0, 4)
        pitches.forEach((pitch, order) => {
          addPluck(out, start + at(order * (down ? DOWN_SPACING_MS : UP_SPACING_MS)), pitch, 0.05, gain * 0.7)
        })
        add(chuck, start, gain * 0.9)
      } else {
        const bar = Math.floor(index / barSteps)
        const strings = sounding(plan.chords[bar % plan.chords.length]!)
        const struck = down ? strings : strings.filter((entry) => entry.string <= 4).reverse()
        struck.forEach((entry, order) => {
          addPluck(out, start + at(order * (down ? DOWN_SPACING_MS : UP_SPACING_MS)), entry.pitch, ringSeconds, gain)
        })
      }
      if (index % 4 === 3) yield
    }
  }

  let peak = 0
  for (let from = 0; from < out.length; from += BLOCK) {
    const to = Math.min(out.length, from + BLOCK)
    for (let index = from; index < to; index += 1) peak = Math.max(peak, Math.abs(out[index]!))
    yield
  }
  if (peak > 0.9) {
    const gain = 0.9 / peak
    for (let from = 0; from < out.length; from += BLOCK) {
      const to = Math.min(out.length, from + BLOCK)
      for (let index = from; index < to; index += 1) out[index]! *= gain
      yield
    }
  }
  return out
}

export function strumTrackKey(exerciseId: string, progressionId: string, plan: StrumPlan, options: StrumTrackOptions) {
  return `guitar-strum-v2-c${CLICK_VERSION}-${options.bank ? 'nylon' : 'synth'}-${exerciseId}-${progressionId}-${plan.bpm}-${options.metronome ? 'm' : '-'}${options.demo ? 'd' : '-'}`
}
