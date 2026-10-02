import type { DrumPlan } from './plan'
import { SAMPLE_RATE } from './wav'

/*
  O linie de bas sub un exemplu de manual.

  La lecțiile din Etapa „Muzician” toba mare se leagă de bas, iar un exemplu fără
  bas cere elevului să-și imagineze jumătate din ce se predă. Linia se scrie pe
  aceiași pași ca exercițiul și se randează în ACEEAȘI pistă, din același plan:
  un al doilea player ar aduce înapoi exact desincronizarea pe care pista unică
  a eliminat-o (mobile/CLAUDE.md §4).

  Basul nu are mostre: e sintetizat, ca click-ul de metronom. O mostră de bas
  ar trebui transpusă pe fiecare notă, iar aici contează unde cade nota, nu
  timbrul. Armonicele sunt ținute sus intenționat: fundamentala unui Re grav e
  73 Hz, sub ce reproduce difuzorul unui telefon, deci fără ele nota s-ar
  ghici, nu s-ar auzi.
*/

export interface BassNote {
  /** Pasul din măsură, pe grila exercițiului. */
  step: number
  /** Cât ține, în pași. */
  length: number
  /** Nota MIDI: 36 = Do grav (C2). */
  pitch: number
}

export interface BassLine {
  /** Măsurile, una pe intrare. Se reiau ciclic peste măsurile exercițiului. */
  bars: BassNote[][]
}

/** Câștigul basului în mix, la ureche, față de toba mare (1). */
export const BASS_GAIN = 0.55

const RELEASE_S = 0.04
const ATTACK_S = 0.004
/** Armonicele, cu amplitudinea lor. Fiecare se stinge mai repede decât cea de sub ea. */
const PARTIALS = [1, 0.62, 0.34, 0.18, 0.08] as const

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const

/** Numele notei, fără octavă: e ce se scrie pe rândul de bas. */
export const noteName = (pitch: number) => NOTE_NAMES[((pitch % 12) + 12) % 12]!

const frequencyOf = (pitch: number) => 440 * 2 ** ((pitch - 69) / 12)

const voiceCache = new Map<string, Float32Array>()

/** O notă de bas sintetizată: atac scurt, coadă care scade, eliberare fără pocnet. */
export function bassVoice(pitch: number, durationMs: number): Float32Array {
  const key = `${pitch}:${durationMs.toFixed(1)}`
  const cached = voiceCache.get(key)
  if (cached) return cached

  const held = durationMs / 1000
  const length = Math.ceil((held + RELEASE_S) * SAMPLE_RATE)
  const out = new Float32Array(length)
  const frequency = frequencyOf(pitch)
  for (let index = 0; index < length; index += 1) {
    const time = index / SAMPLE_RATE
    const attack = Math.min(1, time / ATTACK_S)
    const release = time <= held ? 1 : Math.max(0, 1 - (time - held) / RELEASE_S)
    let value = 0
    PARTIALS.forEach((amplitude, partial) => {
      const decay = 0.9 / (partial + 1)
      value +=
        Math.sin(2 * Math.PI * frequency * (partial + 1) * time) *
        amplitude *
        Math.exp(-time / decay)
    })
    out[index] = (value / 1.6) * attack * release
  }
  voiceCache.set(key, out)
  return out
}

export interface PlacedBassNote {
  atMs: number
  durationMs: number
  pitch: number
}

/**
 * Notele de bas ale unei sesiuni, în milisecunde.
 *
 * Merg pe măsurile planului, deci urmează tempoul ales și sar peste
 * numărătoare, exact ca loviturile.
 */
export function placeBass(plan: DrumPlan, line: BassLine): PlacedBassNote[] {
  if (line.bars.length === 0) return []
  const placed: PlacedBassNote[] = []
  for (const bar of plan.bars) {
    if (bar.countIn || bar.exerciseBar < 0) continue
    const notes = line.bars[bar.exerciseBar % line.bars.length]!
    for (const note of notes) {
      placed.push({
        atMs: bar.atMs + note.step * bar.stepMs,
        durationMs: note.length * bar.stepMs,
        pitch: note.pitch,
      })
    }
  }
  return placed
}

/** Problemele unei linii de bas față de grila exercițiului. Lista goală e bună. */
export function validateBassLine(line: BassLine, stepsPerBar: number): string[] {
  const problems: string[] = []
  if (line.bars.length === 0) problems.push('basul n-are nicio măsură')
  line.bars.forEach((notes, barIndex) => {
    let end = 0
    for (const note of [...notes].sort((left, right) => left.step - right.step)) {
      const at = `basul, măsura ${barIndex + 1}, pasul ${note.step}`
      if (!Number.isInteger(note.step) || note.step < 0 || note.step >= stepsPerBar) {
        problems.push(`${at}: în afara măsurii de ${stepsPerBar} pași`)
      }
      if (note.length <= 0) problems.push(`${at}: lungime ${note.length}`)
      if (note.step < end) problems.push(`${at}: se suprapune peste nota de dinainte`)
      if (note.pitch < 24 || note.pitch > 60) problems.push(`${at}: nota ${note.pitch} nu e de bas`)
      end = note.step + note.length
    }
  })
  return problems
}
