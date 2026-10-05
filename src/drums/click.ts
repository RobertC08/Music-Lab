import { SAMPLE_RATE } from './wav'

/*
  Clicul de metronom, comun tobelor și chitarei. Singurul sunet care nu e o mostră.

  Primul clic era un sinus moale (1.100 / 1.760 Hz) și se pierdea: sub un kit
  de tobe, sub o chitară nylon și mai ales în difuzorul unui telefon, care taie
  tot ce e jos. Ăsta e făcut să taie prin mix, ca un woodblock:
  - frecvențe mai sus (2-3 kHz, unde urechea e cea mai sensibilă), cu un al
    doilea parțial neamonic, ca lemnul lovit, nu ca un ton de telefon;
  - un „tic" de zgomot de 1,5 ms la început, care dă atacul tăios;
  - stingere scurtă (~20 ms): se aude clar, dar nu acoperă nota de pe timp;
  - mai tare decât înainte (vârf 0,9 pe „unu", 0,65 pe ceilalți timpi).

  Orice schimbare aici schimbă pistele randate: cheile lor de cache poartă
  `CLICK_VERSION`, altfel un utilizator vechi ar auzi în continuare clicul vechi.
*/

export const CLICK_VERSION = 2

export const CLICK = {
  accent: { frequency: 2_500, decay: 0.022, peak: 0.9 },
  plain: { frequency: 1_900, decay: 0.018, peak: 0.65 },
  /** Al doilea parțial, ca raport față de fundamentală, și cât de tare e. */
  partial: { ratio: 2.71, level: 0.45 },
  tick: { length: 0.0015, level: 0.6 },
  attack: 0.0003,
} as const

function metronomeClick(accent: boolean): Float32Array {
  const { frequency, decay, peak } = accent ? CLICK.accent : CLICK.plain
  const out = new Float32Array(Math.ceil(decay * 4 * SAMPLE_RATE))
  const tickLength = CLICK.tick.length * SAMPLE_RATE
  let state = accent ? 97 : 53
  let previous = 0
  for (let index = 0; index < out.length; index += 1) {
    const time = index / SAMPLE_RATE
    const phase = 2 * Math.PI * frequency * time
    const tone = Math.sin(phase) + CLICK.partial.level * Math.sin(phase * CLICK.partial.ratio)
    // Zgomot derivat (trece-sus): doar frecvențele înalte, „ticul".
    state = (state * 1103515245 + 12345) & 0x7fffffff
    const noise = (state / 0x7fffffff) * 2 - 1
    const tick = index < tickLength ? (noise - previous) * CLICK.tick.level * (1 - index / tickLength) : 0
    previous = noise
    out[index] = (tone * Math.min(1, time / CLICK.attack) * Math.exp(-time / decay) + tick)
  }
  let max = 0
  for (const value of out) max = Math.max(max, Math.abs(value))
  for (let index = 0; index < out.length; index += 1) out[index]! *= peak / max
  return out
}

export const accentClick = metronomeClick(true)
export const plainClick = metronomeClick(false)
