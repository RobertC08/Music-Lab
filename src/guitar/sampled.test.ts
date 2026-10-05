import { describe, expect, it } from 'vitest'
import { GUITAR_RATE } from './pluck'
import { ARTICULATION, HUMANIZE, mixVoices, planPhrase, TRILL, type PhraseNote, type SampleBank } from './sampled'

const ms = (value: number) => Math.round((value / 1000) * GUITAR_RATE)

/** Mostre de test: un ton care se stinge, cu un atac zgomotos în primele 10 ms (ca pana). */
function testBank(): SampleBank {
  const bank = new Map<number, Float32Array[]>()
  for (let pitch = 40; pitch < 80; pitch += 1) {
    const frequency = 440 * 2 ** ((pitch - 69) / 12)
    const out = new Float32Array(ms(2500))
    let state = pitch
    for (let index = 0; index < out.length; index += 1) {
      state = (state * 1103515245 + 12345) & 0x7fffffff
      const noise = index < ms(10) ? ((state / 0x7fffffff) * 2 - 1) * (1 - index / ms(10)) : 0
      out[index] = (0.5 * Math.sin((2 * Math.PI * frequency * index) / GUITAR_RATE) + noise) * Math.exp(-index / ms(900))
    }
    bank.set(pitch, [out])
  }
  return bank
}

const step = ms(125)
const note = (index: number, pitch: number, articulation: PhraseNote['articulation'], string: PhraseNote['string'] = 3): PhraseNote => ({
  time: ms(200) + index * step,
  pitch,
  string,
  articulation,
  velocity: 0.8,
  maxLength: step * 2,
  stepLength: step,
})

/** Un tril: o notă ciupită, apoi hammer-on și pull-off alternate. */
const trill = (length: number) =>
  Array.from({ length }, (_, index) => note(index, index % 2 === 0 ? 57 : 59, index === 0 ? 'pick' : index % 2 === 1 ? 'hammer' : 'pull'))

describe('planul articulațiilor', () => {
  it('e determinist: aceeași sămânță, același rezultat; altă sămânță, altă interpretare', () => {
    expect(planPhrase(trill(12), 7)).toEqual(planPhrase(trill(12), 7))
    expect(planPhrase(trill(12), 7)).not.toEqual(planPhrase(trill(12), 8))
  })

  it('nota legată continuă coarda: mostra se citește de la timpul scurs de la pană', () => {
    const [pick, hammer] = planPhrase([note(0, 57, 'pick'), note(4, 59, 'hammer')], 1)
    expect(pick!.offset).toBe(0)
    // Aproximativ patru pași mai târziu (cu umanizarea), deci ~500 ms în mostră.
    expect(Math.abs(hammer!.offset - 4 * step)).toBeLessThan(ms(10))
  })

  it('un hammer-on imediat după pană sare totuși peste atacul penei', () => {
    const [, hammer] = planPhrase([note(0, 57, 'pick'), { ...note(0, 59, 'hammer'), time: note(0, 57, 'pick').time + ms(5) }], 1)
    expect(hammer!.offset).toBeGreaterThanOrEqual(ms(ARTICULATION.hammerMinSkipMs) - 1)
  })

  it('hammer-on și pull-off: mai încete decât nota ciupită și diferite între ele', () => {
    const [pick, hammer, pull] = planPhrase([note(0, 57, 'pick'), note(1, 59, 'hammer'), note(2, 57, 'pull')], 3)
    expect(hammer!.gain).toBeLessThan(pick!.gain)
    expect(pull!.gain).toBeLessThan(hammer!.gain)
    expect(hammer!.thump).toBeGreaterThan(0)
    expect(hammer!.transientBlend).toBe(0)
    expect(pull!.transientBlend).toBeGreaterThan(0)
    expect(pull!.thump).toBe(0)
  })

  it('umanizarea timpului rămâne mică și fără derivă', () => {
    const notes = Array.from({ length: 64 }, (_, index) => note(index, 50 + (index % 4), 'pick', ((index % 6) + 1) as PhraseNote['string']))
    const voices = planPhrase(notes, 11)
    const deviations = voices.map((voice) => voice.start - notes[voice.index]!.time)
    const limit = Math.min(ms(HUMANIZE.pickMs), step * HUMANIZE.stepFraction)
    for (const deviation of deviations) expect(Math.abs(deviation)).toBeLessThanOrEqual(limit + 1)
    // Media aproape de zero: nu grăbește, nu întârzie.
    const mean = deviations.reduce((sum, value) => sum + value, 0) / deviations.length
    expect(Math.abs(mean)).toBeLessThan(limit / 3)
    expect(new Set(deviations).size).toBeGreaterThan(10)
  })

  it('trilul: recunoscut, volume variate dar strânse, început și sfârșit diferite, înălțimi niciodată identice la rând', () => {
    const voices = planPhrase(trill(16), 5)
    expect(voices.slice(1).every((voice) => voice.trill)).toBe(true)
    const middle = voices.slice(2, -2).map((voice) => voice.gain)
    expect(new Set(middle.map((gain) => gain.toFixed(4))).size).toBeGreaterThan(5)
    const average = middle.reduce((sum, value) => sum + value, 0) / middle.length
    for (const gain of middle) expect(Math.abs(gain / average - 1)).toBeLessThan(0.2)
    expect(voices.at(-1)!.gain).toBeLessThan(average)
    // Aceeași notă, două redări la rând: rata (cenții) diferă.
    const byPitch = new Map<number, number[]>()
    for (const voice of voices) byPitch.set(voice.pitch, [...(byPitch.get(voice.pitch) ?? []), voice.rate])
    for (const rates of byPitch.values()) {
      rates.forEach((rate, position) => position > 0 && expect(rate).not.toBe(rates[position - 1]))
      for (const rate of rates) expect(Math.abs(1200 * Math.log2(rate))).toBeLessThanOrEqual(HUMANIZE.cents + 0.01)
    }
    // Timpul trilului: abateri mai mici decât la notele obișnuite.
    const limit = Math.min(ms(TRILL.maxMs), step * TRILL.stepFraction)
    for (const voice of voices.slice(1)) {
      const nominal = trill(16)[voice.index]!.time
      expect(Math.abs(voice.start - nominal)).toBeLessThanOrEqual(limit + 1)
    }
  })

  it('cu mai multe mostre pe notă: round-robin, niciodată aceeași de două ori la rând', () => {
    const notes = Array.from({ length: 8 }, (_, index) => note(index, 57, 'pick'))
    const voices = planPhrase(notes, 2, () => 3)
    voices.forEach((voice, position) => position > 0 && expect(voice.variant).not.toBe(voices[position - 1]!.variant))
    expect(voices.every((voice) => voice.rate === 1)).toBe(true)
  })

  it('nota de dinainte pe aceeași coardă se stinge când intră următoarea; pe alte coarde, nu', () => {
    const voices = planPhrase([note(0, 57, 'pick', 3), note(1, 59, 'hammer', 3), note(1, 64, 'pick', 1)], 4)
    const first = voices.find((voice) => voice.index === 0)!
    const hammer = voices.find((voice) => voice.index === 1)!
    expect(first.releaseAt).toBe(hammer.start)
    expect(first.release).toBe(Math.round((ARTICULATION.legatoCrossfadeMs / 1000) * GUITAR_RATE))
  })
})

describe('mixarea', () => {
  const bank = testBank()
  const render = (notes: PhraseNote[]) => {
    const out = new Float32Array(ms(1500))
    const voices = planPhrase(notes, 9)
    mixVoices(out, bank, voices)
    return { out, voices }
  }
  const peakNear = (out: Float32Array, at: number, width: number) => {
    let peak = 0
    for (let index = at; index < at + width; index += 1) peak = Math.max(peak, Math.abs(out[index] ?? 0))
    return peak
  }

  it('atacul: nota ciupită are tranzient, hammer-on-ul aproape deloc, pull-off-ul puțin', () => {
    const pick = render([note(0, 57, 'pick')])
    const hammer = render([note(0, 57, 'pick'), note(4, 59, 'hammer')])
    const pull = render([note(0, 59, 'pick'), note(4, 57, 'pull')])
    const onset = (result: { voices: { start: number; index: number }[] }, index: number) => result.voices.find((voice) => voice.index === index)!.start
    // Raportul vârf în primele 4 ms / vârf între 20 și 40 ms: cât de „lovit" e începutul.
    const sharpness = (out: Float32Array, at: number) => peakNear(out, at, ms(4)) / Math.max(1e-6, peakNear(out, at + ms(20), ms(20)))
    const pickSharp = sharpness(pick.out, onset(pick, 0))
    const hammerSharp = sharpness(hammer.out, onset(hammer, 1))
    const pullSharp = sharpness(pull.out, onset(pull, 1))
    expect(hammerSharp).toBeLessThan(pickSharp)
    expect(pullSharp).toBeLessThan(pickSharp)
    expect(pullSharp).toBeGreaterThan(hammerSharp * 0.9)
  })

  it('fără pocnituri la trecerea legato: nicio săritură bruscă între eșantioane', () => {
    const { out, voices } = render(trill(8))
    let worst = 0
    for (const voice of voices.slice(1)) {
      for (let index = voice.start - ms(3); index < voice.start + ms(3); index += 1) {
        worst = Math.max(worst, Math.abs(out[index + 1]! - out[index]!))
      }
    }
    // Mostrele de test au amplitudine ~0,5: o săritură peste 0,25 ar fi un clic audibil.
    expect(worst).toBeLessThan(0.25)
    expect(out.every((value) => Number.isFinite(value))).toBe(true)
  })
})
