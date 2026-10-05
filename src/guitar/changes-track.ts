import { analyzeChord } from './chords'
import { BEATS_PER_BAR, COUNT_IN_BEATS, type ChangesPlan } from './changes'
import { accentClick, CLICK_VERSION, plainClick } from './metronome'
import type { SampleBank } from './sampled'
import { mixPhraseSteps, soundingStrings, strokeNotes } from './sampled-render'
import { addPluck, GUITAR_RATE as SAMPLE_RATE, STRUM_SPACING_MS } from './pluck'

/*
  Pista unei sesiuni de schimbări: un singur WAV, metronom + acorduri.

  Un singur fișier, pornit cu un singur `play()`, ca la tobe (mobile/CLAUDE.md
  §4): un metronom făcut din temporizatoare se oprește când iOS suspendă JS-ul.
  Ecranul nu programează nimic; citește poziția din fișier și de acolo află
  timpul și acordul.

  Numărătoarea (o măsură) are mereu metronom, și cu metronomul oprit: fără ea
  n-ai de unde ști când intri.
*/


/** Cât de tare e chitara față de metronom. */
const STRUM_GAIN = 0.75
/** Cât sună cel mult un acord lovit: la 4 timpi lenți nu trebuie să țină o veșnicie. */
const MAX_RING_S = 2.4
/** Coada de după ultimul timp, cât să se stingă ultimul acord. */
const TAIL_MS = 1_200

export interface ChangesTrackOptions {
  /** Metronomul pe toată sesiunea. Numărătoarea îl are oricum. */
  metronome: boolean
  /** Aplicația lovește acordul la fiecare schimbare. */
  strum: boolean
  /** Mostrele de chitară; lipsă = sinteză. */
  bank?: SampleBank | null
}

/** Câte eșantioane se procesează între două pauze, la normalizare. */
const BLOCK = 100_000

/**
 * Randarea, în pași: se oprește (`yield`) după fiecare acord și după fiecare
 * bloc de eșantioane. Rulată dintr-o bucată (`renderChangesTrack`), e aceeași
 * funcție; rulată pe felii (`runInSlices`), lasă atingerile să treacă printre
 * pași. Un minut de pistă, pe telefon, ocupa firul aplicației cât să nu mai
 * răspundă butoanele de tempo.
 */
export function* renderChangesTrackSteps(
  plan: ChangesPlan,
  options: ChangesTrackOptions,
): Generator<void, Float32Array> {
  const at = (ms: number) => Math.round((ms / 1000) * SAMPLE_RATE)
  const out = new Float32Array(at(plan.durationMs + TAIL_MS))

  const add = (source: Float32Array, start: number) => {
    const length = Math.min(source.length, out.length - start)
    for (let index = 0; index < length; index += 1) out[start + index]! += source[index]!
  }

  for (let beat = 0; beat < plan.totalBeats; beat += 1) {
    if (beat >= COUNT_IN_BEATS && !options.metronome) continue
    add(beat % BEATS_PER_BAR === 0 ? accentClick : plainClick, at(beat * plan.beatMs))
  }
  yield

  if (options.strum && options.bank) {
    // Din mostre: acordul lovit în jos, cu stingeri naturale (`sampled-render.ts`).
    const ring = at(Math.min(MAX_RING_S * 1000, plan.beatsPerChord * plan.beatMs - 40))
    const chords = plan.repeats * plan.sequence.length
    const notes = []
    for (let chord = 0; chord < chords; chord += 1) {
      const shape = plan.sequence[chord % plan.sequence.length]!
      const time = at((COUNT_IN_BEATS + chord * plan.beatsPerChord) * plan.beatMs)
      notes.push(...strokeNotes(soundingStrings(shape), { time, down: true, velocity: STRUM_GAIN, ring }))
    }
    yield* mixPhraseSteps(out, options.bank, notes, plan.bpm * 7 + chords)
  } else if (options.strum) {
    const ringSeconds = Math.min(MAX_RING_S, (plan.beatsPerChord * plan.beatMs - 40) / 1000)
    const chords = plan.repeats * plan.sequence.length
    for (let chord = 0; chord < chords; chord += 1) {
      const shape = plan.sequence[chord % plan.sequence.length]!
      const pitches = analyzeChord(shape)
        .strings.map((entry) => entry.pitch)
        .filter((pitch): pitch is number => pitch !== null)
      const start = at((COUNT_IN_BEATS + chord * plan.beatsPerChord) * plan.beatMs)
      pitches.forEach((pitch, index) => {
        addPluck(out, start + at(index * STRUM_SPACING_MS), pitch, ringSeconds, STRUM_GAIN)
      })
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

/** Toată randarea dintr-o bucată (la „Pornește", când pista nu e gata, și în teste). */
export function renderChangesTrack(plan: ChangesPlan, options: ChangesTrackOptions): Float32Array {
  return runToEnd(renderChangesTrackSteps(plan, options))
}

export function runToEnd<T>(steps: Generator<void, T>): T {
  for (;;) {
    const step = steps.next()
    if (step.done) return step.value
  }
}

/** Cheia pistei: tot ce schimbă sunetul. */
export function changesTrackKey(exerciseId: string, seed: number, plan: ChangesPlan, options: ChangesTrackOptions) {
  return `guitar-changes-v4-c${CLICK_VERSION}-${options.bank ? 'nylon' : 'synth'}-${exerciseId}-${seed}-${plan.bpm}-${options.metronome ? 'm' : '-'}${options.strum ? 's' : '-'}`
}
