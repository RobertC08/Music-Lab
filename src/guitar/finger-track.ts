import { BEATS_PER_BAR, type FingerPlan } from './finger-exercises'
import { accentClick, CLICK_VERSION, plainClick } from './metronome'
import { addPluck, GUITAR_RATE as SAMPLE_RATE } from './pluck'
import { mixVoices, planPhrase, type PhraseNote, type SampleBank } from './sampled'
import { pitchAt } from './tuning'

/*
  Pista unei sesiuni de exerciții pentru degete: metronom + notele exercițiului.

  Ca la ceilalți însoțitori: un singur WAV, randat în pași (`yield`), ca să se
  poată pregăti pe felii în fundal.

  Cum sună notele:
  - o notă ține până vine următoarea pe aceeași coardă (o coardă cântă o singură
    notă), dar cel mult doi pași: la exercițiile de degete, degetul care se
    ridică oprește nota, iar notele lăsate să sune peste celelalte ar transforma
    o cromatică în ceață;
  - la fingerpicking, notele sună mai mult (până la schimbarea acordului sau
    următoarea notă pe coardă): acolo chiar asta se urmărește;
  - legato-ul (h, p) e mai încet decât nota lovită, ca la o chitară adevărată;
  - primul pas al fiecărui timp are un mic accent, ca să se audă timpul.
*/

export interface FingerTrackOptions {
  metronome: boolean
  /** Aplicația cântă exercițiul. Oprit, rămâne doar metronomul (și numărătoarea). */
  demo: boolean
}

const PICKED_GAIN = 0.7
const SLUR_GAIN = 0.5
const BEAT_ACCENT = 1.2
const MAX_RING_STEPS = 2
const MAX_RING_S = 1.6
const TAIL_MS = 1_500
const BLOCK = 100_000

export function* renderFingerTrackSteps(plan: FingerPlan, options: FingerTrackOptions): Generator<void, Float32Array> {
  const at = (ms: number) => Math.round((ms / 1000) * SAMPLE_RATE)
  const out = new Float32Array(at(plan.durationMs + TAIL_MS))
  const add = (source: Float32Array, start: number) => {
    const length = Math.min(source.length, out.length - start)
    for (let index = 0; index < length; index += 1) out[start + index]! += source[index]!
  }

  const totalBeats = Math.ceil(plan.totalSteps / plan.stepsPerBeat)
  for (let beat = 0; beat < totalBeats; beat += 1) {
    if (beat >= BEATS_PER_BAR && !options.metronome) continue
    add(beat % BEATS_PER_BAR === 0 ? accentClick : plainClick, at(beat * plan.stepsPerBeat * plan.stepMs))
  }
  yield

  if (options.demo) {
    const count = plan.repeats * plan.notes.length
    const noteAt = (index: number) => plan.notes[index % plan.notes.length]!
    for (let index = 0; index < count; index += 1) {
      const item = noteAt(index)
      if (!item) continue
      const step = plan.countInSteps + index
      // Până la următoarea notă pe aceeași coardă (sau schimbarea acordului).
      let next = index + 1
      while (next < count) {
        const other = noteAt(next)
        if (other && (other.string === item.string || other.chord !== item.chord)) break
        next += 1
      }
      const limitSteps = item.pluck ? next - index : Math.min(next - index, MAX_RING_STEPS)
      const ringSeconds = Math.min(MAX_RING_S, (limitSteps * plan.stepMs) / 1000)
      const gain = (item.slur ? SLUR_GAIN : PICKED_GAIN) * (step % plan.stepsPerBeat === 0 ? BEAT_ACCENT : 1)
      addPluck(out, at(step * plan.stepMs), pitchAt(item.string, item.fret), Math.max(0.06, ringSeconds), gain)
      if (index % 16 === 15) yield
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

export function fingerTrackKey(
  exerciseId: string,
  position: number,
  plan: FingerPlan,
  options: FingerTrackOptions,
  /** Sursa sunetului: 'nylon' (mostre) sau 'synth'. */
  voice = 'synth',
) {
  return `guitar-finger-v2-c${CLICK_VERSION}-${voice}-${exerciseId}-${position}-${plan.stepsPerBeat}-${plan.bpm}-${options.metronome ? 'm' : '-'}${options.demo ? 'd' : '-'}`
}

/*
  Aceeași pistă, cântată din mostre, cu articulațiile din `sampled.ts`: nota
  legată continuă coarda (hammer-on, pull-off), trilul are variații mici,
  stingerile sunt naturale. Metronomul și numărătoarea sunt aceleași.
*/
export interface SampledFingerOptions extends FingerTrackOptions {
  /** Sămânța umanizării: aceeași sămânță, aceeași interpretare. */
  seed?: number
}

/** Cât sună cel mult o notă la exercițiile de degete (degetul se ridică), în pași. */
const SAMPLED_MAX_STEPS = 2

export function* renderFingerTrackSampledSteps(
  plan: FingerPlan,
  bank: SampleBank,
  options: SampledFingerOptions,
): Generator<void, Float32Array> {
  const at = (ms: number) => Math.round((ms / 1000) * SAMPLE_RATE)
  const out = new Float32Array(at(plan.durationMs + TAIL_MS))
  const add = (source: Float32Array, start: number) => {
    const length = Math.min(source.length, out.length - start)
    for (let index = 0; index < length; index += 1) out[start + index]! += source[index]!
  }
  const totalBeats = Math.ceil(plan.totalSteps / plan.stepsPerBeat)
  for (let beat = 0; beat < totalBeats; beat += 1) {
    if (beat >= BEATS_PER_BAR && !options.metronome) continue
    add(beat % BEATS_PER_BAR === 0 ? accentClick : plainClick, at(beat * plan.stepsPerBeat * plan.stepMs))
  }
  yield

  if (options.demo) {
    const count = plan.repeats * plan.notes.length
    const stepLength = at(plan.stepMs)
    const notes: PhraseNote[] = []
    for (let index = 0; index < count; index += 1) {
      const item = plan.notes[index % plan.notes.length]
      if (!item) continue
      const step = plan.countInSteps + index
      notes.push({
        time: at(step * plan.stepMs),
        pitch: pitchAt(item.string, item.fret),
        string: item.string,
        articulation: item.slur === 'h' ? 'hammer' : item.slur === 'p' ? 'pull' : 'pick',
        velocity: SAMPLED_PICK_GAIN * (step % plan.stepsPerBeat === 0 ? BEAT_ACCENT : 1),
        maxLength: item.pluck ? at(MAX_RING_S * 1000) : Math.max(at(150), stepLength * SAMPLED_MAX_STEPS),
        stepLength,
      })
    }
    const voices = planPhrase(notes, options.seed ?? 1, (pitch) => bank.get(pitch)?.length ?? 1)
    for (let from = 0; from < voices.length; from += 16) {
      mixVoices(out, bank, voices.slice(from, from + 16))
      yield
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

/** Volumul de bază al unei note ciupite din mostre (mostrele sunt normalizate la ~0,5). */
const SAMPLED_PICK_GAIN = 0.8
