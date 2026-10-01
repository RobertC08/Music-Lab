import type { RoundTrackLayout } from '../audio/round-plan'
import { mulberry32 } from '../game/random'

/*
  Pista unei runde pe mai multe voci (Ecoul groove-ului, Rudimente): numărătoare,
  modelul auzit pe toate vocile,
  o măsură de pregătire, apoi măsurile de răspuns doar cu grila de pătrimi.
  Totul într-un singur WAV, ca la runda de ritm: un singur `play()`, fără
  timere JS între lovituri (mobile/CLAUDE.md §4).

  Sunetele sunt sintetizate, nu mostre: toba mare e o sinusoidă care coboară
  repede în frecvență, toba mică e zgomot cu un ton scurt sub el, hi-hat-ul e
  zgomot filtrat pe înalte, foarte scurt. Zgomotul vine din generatorul
  determinist, deci același groove dă exact același fișier.
*/

const SAMPLE_RATE = 44_100
const COUNT_IN_BARS = 1
const PREP_BARS = 1

/**
 * Sunetul cu care se aude o voce. Primele șase sunt setul de tobe; ultimele
 * două sunt tonurile lecțiilor (`audio/round-plan.ts`), pentru jocurile unde
 * ce contează e ÎNĂLȚIMEA, nu instrumentul: la poliritm, două fluxuri lovite cu
 * același timbru se topesc într-unul exact pe „unu”, adică fix unde e toată
 * noțiunea. `tone` e nota ta, `toneFifthBelow` e cvinta de sub ea, aceeași
 * pereche pe care o folosește lecția 18.
 */
export type DrumSound =
  | 'hihat'
  | 'snare'
  | 'kick'
  | 'tom'
  | 'floor'
  | 'crash'
  | 'tone'
  | 'toneFifthBelow'

export interface LanePattern<V extends string> {
  /** Pași pe măsură: 8 = optimi, 16 = șaisprezecimi în 4/4; 6 = optimi în 3/4 sau 6/8. */
  stepsPerBar: number
  beatsPerBar: number
  bpm: number
  /** Câte un flag pe pas, pe toată lungimea modelului, pentru fiecare voce. */
  lanes: Record<V, boolean[]>
  /**
   * Accentele, câte un flag pe pas. Când lipsesc, toate loviturile sună la fel;
   * când există, loviturile neaccentuate sună mai încet. Pe ecran nu se poate
   * bate cu forță, deci accentul se aude, dar nu se punctează.
   */
  accents?: boolean[]
  /**
   * Un groove care se aude și sub model, și sub răspuns, dar nu se bate și nu
   * se punctează (Fill-ul la timp: groove-ul merge singur, tu intri la fill).
   * Aceeași grilă de pași ca modelul.
   */
  backing?: Partial<Record<DrumSound, boolean[]>>
}

export interface LaneTrackOptions {
  /**
   * Fals la citire: modelul nu se aude înainte, faza de ascultare are durata
   * zero și după numărătoare vine direct măsura de pregătire.
   */
  playPattern?: boolean
}

export interface LaneTrackLayout<V extends string> extends RoundTrackLayout {
  /** Momentele țintă pe fiecare voce, în ms de la t=0. */
  laneTargetsMs: Record<V, number[]>
  barMs: number
  patternBars: number
}

type Voice = 'accent' | 'quarter' | DrumSound

export interface ScheduledVoice {
  atMs: number
  voice: Voice
  /** Cât de tare, 0…1; implicit 1. */
  gain?: number
}

const UNACCENTED_GAIN = 0.5
/** Groove-ul de acompaniament stă sub ce ai de bătut, ca să se audă fill-ul. */
const BACKING_GAIN = 0.55

export function planLaneTrack<V extends string>(
  pattern: LanePattern<V>,
  voices: readonly V[],
  soundOf: Record<V, DrumSound>,
  options: LaneTrackOptions = {},
): LaneTrackLayout<V> & { events: ScheduledVoice[] } {
  const playPattern = options.playPattern !== false
  const beatMs = 60_000 / pattern.bpm
  const stepsPerBeat = pattern.stepsPerBar / pattern.beatsPerBar
  const stepMs = beatMs / stepsPerBeat
  const barMs = beatMs * pattern.beatsPerBar
  const totalSteps = pattern.lanes[voices[0]!].length
  const patternBars = Math.ceil(totalSteps / pattern.stepsPerBar)
  const patternStartMs = COUNT_IN_BARS * barMs
  const patternMs = patternBars * barMs
  const prepStartMs = patternStartMs + (playPattern ? patternMs : 0)
  const responseStartMs = prepStartMs + PREP_BARS * barMs
  const totalMs = responseStartMs + patternMs + beatMs

  const events: ScheduledVoice[] = []
  const grid = (startMs: number, bars: number) => {
    for (let bar = 0; bar < bars; bar += 1) {
      for (let beat = 0; beat < pattern.beatsPerBar; beat += 1) {
        events.push({ atMs: startMs + bar * barMs + beat * beatMs, voice: beat === 0 ? 'accent' : 'quarter' })
      }
    }
  }
  grid(0, COUNT_IN_BARS)
  // Sub groove-ul auzit, pătrimile rămân ca reper, mai încet decât tobele.
  if (playPattern) grid(patternStartMs, patternBars)
  grid(prepStartMs, PREP_BARS)
  grid(responseStartMs, patternBars)

  const laneTargetsMs = {} as Record<V, number[]>
  for (const voice of voices) {
    laneTargetsMs[voice] = []
    pattern.lanes[voice].forEach((isHit, step) => {
      if (!isHit) return
      const gain = pattern.accents ? (pattern.accents[step] ? 1 : UNACCENTED_GAIN) : 1
      if (playPattern) events.push({ atMs: patternStartMs + step * stepMs, voice: soundOf[voice], gain })
      laneTargetsMs[voice].push(responseStartMs + step * stepMs)
    })
  }
  for (const [sound, steps] of Object.entries(pattern.backing ?? {}) as [DrumSound, boolean[]][]) {
    steps.forEach((isHit, step) => {
      if (!isHit) return
      if (playPattern) events.push({ atMs: patternStartMs + step * stepMs, voice: sound, gain: BACKING_GAIN })
      events.push({ atMs: responseStartMs + step * stepMs, voice: sound, gain: BACKING_GAIN })
    })
  }
  // Toate țintele, o singură dată fiecare moment: ceasul haptic și numărul de
  // lovituri al rundei le folosesc fără să știe de voci.
  const targetTimesMs = [...new Set(voices.flatMap((voice) => laneTargetsMs[voice]))].sort((a, b) => a - b)

  return {
    stepMs,
    patternStartMs,
    prepStartMs,
    responseStartMs,
    targetTimesMs,
    targetDurationsMs: targetTimesMs.map(() => stepMs),
    totalMs,
    laneTargetsMs,
    barMs,
    patternBars,
    events,
  }
}

interface ToneSpec { frequency: number; decay: number; gain: number; attack: number }
const tones: Record<'accent' | 'quarter', ToneSpec> = {
  accent: { frequency: 1_760, decay: 0.04, gain: 0.3, attack: 0.0012 },
  quarter: { frequency: 1_100, decay: 0.03, gain: 0.16, attack: 0.0012 },
}

/** Randează un eveniment în tamponul de mostre, adunându-l peste ce e deja. */
function render(samples: Float32Array, startSample: number, voice: Voice, noise: () => number, level = 1) {
  const add = (index: number, value: number) => {
    const at = startSample + index
    if (at < samples.length) samples[at] = (samples[at] ?? 0) + value * level
  }
  if (voice === 'accent' || voice === 'quarter') {
    const { frequency, decay, gain, attack } = tones[voice]
    const length = Math.ceil(decay * 3 * SAMPLE_RATE)
    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      add(index, Math.sin(2 * Math.PI * frequency * time) * Math.min(1, time / attack) * Math.exp(-time / decay) * gain)
    }
    return
  }
  if (voice === 'kick') {
    // Frecvența coboară de la 150 la 45 Hz în primele 90 ms: „bum”, nu „bip”.
    const length = Math.ceil(0.32 * SAMPLE_RATE)
    let phase = 0
    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      const frequency = 45 + 105 * Math.exp(-time / 0.045)
      phase += (2 * Math.PI * frequency) / SAMPLE_RATE
      const envelope = Math.min(1, time / 0.002) * Math.exp(-time / 0.11)
      add(index, Math.sin(phase) * envelope * 0.95)
    }
    return
  }
  if (voice === 'tom' || voice === 'floor') {
    // Ca toba mare, dar mai sus și mai scurt: tomul mic „tong”, tomul mare „dum”.
    const [top, bottom, decay] = voice === 'tom' ? [230, 165, 0.16] : [135, 88, 0.24]
    const length = Math.ceil(decay * 4 * SAMPLE_RATE)
    let phase = 0
    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      const frequency = bottom + (top - bottom) * Math.exp(-time / 0.06)
      phase += (2 * Math.PI * frequency) / SAMPLE_RATE
      const envelope = Math.min(1, time / 0.002) * Math.exp(-time / decay)
      const stick = time < 0.012 ? (noise() * 2 - 1) * Math.exp(-time / 0.004) * 0.25 : 0
      add(index, Math.sin(phase) * envelope * 0.75 + stick)
    }
    return
  }
  if (voice === 'tone' || voice === 'toneFifthBelow') {
    /*
      Tonurile lecțiilor, aceiași parametri ca în `audio/round-plan.ts`: 440 Hz
      pentru fluxul tău, 294 pentru celălalt, o cvintă mai jos. Atacul lung
      (7 ms) nu e o alegere de gust: sub atât, o sinusoidă pornită brusc
      pocnește, iar pocnetul se aude ca un al doilea atac, decalat.
    */
    const [frequency, decay, level, attack] =
      voice === 'tone' ? [440, 0.13, 0.42, 0.007] : [294, 0.15, 0.34, 0.008]
    const length = Math.ceil(decay * 4 * SAMPLE_RATE)
    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      const envelope = Math.min(1, time / attack) * Math.exp(-time / decay)
      add(index, Math.sin(2 * Math.PI * frequency * time) * envelope * level)
    }
    return
  }
  if (voice === 'crash') {
    // Cinelul: zgomot pe înalte, cu stingere lungă, plus puțin zgomot plin pentru corp.
    const length = Math.ceil(1.4 * SAMPLE_RATE)
    let previous = 0
    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      const white = noise() * 2 - 1
      const high = white - previous
      previous = white
      const envelope = Math.min(1, time / 0.003) * Math.exp(-time / 0.42)
      add(index, (high * 0.3 + white * 0.08) * envelope)
    }
    return
  }
  if (voice === 'snare') {
    // Zgomot cu stingere rapidă, plus un ton scurt de 190 Hz care dă corpul.
    const length = Math.ceil(0.22 * SAMPLE_RATE)
    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      const body = Math.sin(2 * Math.PI * 190 * time) * Math.exp(-time / 0.04) * 0.35
      const crack = (noise() * 2 - 1) * Math.exp(-time / 0.07) * 0.5
      add(index, (body + crack) * Math.min(1, time / 0.001))
    }
    return
  }
  // Hi-hat: zgomot derivat (trece doar înaltele), foarte scurt.
  const length = Math.ceil(0.09 * SAMPLE_RATE)
  let previous = 0
  for (let index = 0; index < length; index += 1) {
    const time = index / SAMPLE_RATE
    const white = noise() * 2 - 1
    const high = white - previous
    previous = white
    add(index, high * Math.exp(-time / 0.028) * 0.32)
  }
}

export function renderLaneWav(events: ScheduledVoice[], totalMs: number) {
  const sampleCount = Math.ceil((totalMs / 1000) * SAMPLE_RATE)
  const samples = new Float32Array(sampleCount)
  const noise = mulberry32(0x9e3779b9)
  for (const event of events) {
    render(samples, Math.floor((event.atMs / 1000) * SAMPLE_RATE), event.voice, noise, event.gain ?? 1)
  }

  const bytes = new Uint8Array(44 + sampleCount * 2)
  const view = new DataView(bytes.buffer)
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
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
  view.setUint32(40, sampleCount * 2, true)
  for (let index = 0; index < sampleCount; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0))
    view.setInt16(44 + index * 2, clamped * 0x7fff, true)
  }
  return bytes
}
