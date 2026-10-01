/**
 * Sunetul de bucurie de la o rundă reușită: un arpegiu major urcător (Do, Mi,
 * Sol, Do) care se strânge într-un acord ținut. E generat în cod, ca notele din
 * jocuri, deci nu cere fișier nou în aplicație și ajunge prin OTA.
 */
export const CELEBRATION_SAMPLE_RATE = 44_100

/** Nota și momentul în care intră, în secunde de la început. */
const NOTES: readonly { midi: number; at: number; gain: number }[] = [
  { midi: 72, at: 0, gain: 0.9 },
  { midi: 76, at: 0.085, gain: 0.85 },
  { midi: 79, at: 0.17, gain: 0.85 },
  { midi: 84, at: 0.255, gain: 1 },
]
/** Momentele notelor, în milisecunde: haptica de reușită le urmează, ca vibrația să urce odată cu sunetul. */
export const CELEBRATION_NOTE_ONSETS_MS: readonly number[] = NOTES.map((note) => Math.round(note.at * 1000))
const DURATION_SECONDS = 1.25
const PEAK = 0.82

const frequencyOf = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/** Timbru de clopoțel: fundamentala și două armonice care se sting mai repede. */
function bell(time: number, frequency: number) {
  const phase = 2 * Math.PI * frequency * time
  const attack = Math.min(1, time / 0.006)
  return attack * (
    Math.sin(phase) * Math.exp(-time * 3.2)
    + 0.35 * Math.sin(phase * 2) * Math.exp(-time * 5.5)
    + 0.12 * Math.sin(phase * 3) * Math.exp(-time * 8)
  )
}

export function renderCelebrationSamples() {
  const count = Math.floor(CELEBRATION_SAMPLE_RATE * DURATION_SECONDS)
  const samples = new Float32Array(count)
  for (let index = 0; index < count; index += 1) {
    const time = index / CELEBRATION_SAMPLE_RATE
    let value = 0
    for (const note of NOTES) {
      if (time >= note.at) value += note.gain * bell(time - note.at, frequencyOf(note.midi))
    }
    // Ultimii 80 ms coboară la zero, ca să nu se audă un clic la final.
    const tail = Math.min(1, (DURATION_SECONDS - time) / 0.08)
    samples[index] = value * tail
  }
  let max = 0
  for (const value of samples) max = Math.max(max, Math.abs(value))
  const scale = max > 0 ? PEAK / max : 0
  for (let index = 0; index < count; index += 1) samples[index] = samples[index]! * scale
  return samples
}

export function createCelebrationWav() {
  const samples = renderCelebrationSamples()
  const bytes = new Uint8Array(44 + samples.length * 2)
  const view = new DataView(bytes.buffer)
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, CELEBRATION_SAMPLE_RATE, true)
  view.setUint32(28, CELEBRATION_SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((value, index) => {
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, value)) * 0x7fff), true)
  })
  return bytes
}
