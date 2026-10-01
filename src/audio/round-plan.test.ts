import { describe, expect, it } from 'vitest'
import { planRoundTrack, renderWav } from './round-plan'

const SAMPLE_RATE = 44_100

/** Energia semnalului intre doua momente, citita direct din WAV-ul randat. */
function rmsBetween(wav: Uint8Array, fromMs: number, toMs: number) {
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength)
  const first = Math.floor((fromMs / 1000) * SAMPLE_RATE)
  const last = Math.floor((toMs / 1000) * SAMPLE_RATE)
  let sum = 0
  let count = 0
  for (let index = first; index < last; index += 1) {
    const offset = 44 + index * 2
    if (offset + 1 >= wav.byteLength) break
    const sample = view.getInt16(offset, true) / 0x7fff
    sum += sample * sample
    count += 1
  }
  return count ? Math.sqrt(sum / count) : 0
}

/**
 * Pista contine si click-urile de metronom, pe patrimi (la 60 BPM: 0, 1000,
 * 2000 ms...). Ferestrele de masurare se aleg intre ele, altfel am masura
 * metronomul si am crede ca e nota.
 */
describe('randarea duratelor', () => {
  // O singura nota pe masura, la 60 BPM: un pas de saisprezecime = 250 ms.
  const pattern = [true, ...Array.from({ length: 15 }, () => false)]
  const base = { bpm: 60, stepsPerBar: 16, pattern, countInBars: 0, prepBars: 0 }

  it('fara durate scrise, nota suna percutiv si se stinge repede', () => {
    const plan = planRoundTrack(base)
    const wav = renderWav(plan.events, plan.totalMs)
    const inceput = rmsBetween(wav, 5, 60)
    const maiTarziu = rmsBetween(wav, 500, 900)
    expect(inceput).toBeGreaterThan(0.05)
    // Dupa o jumatate de secunda nu mai trebuie sa se auda nimic din ea.
    expect(maiTarziu).toBeLessThan(0.01)
  })

  it('o doime scrisa se aude pe toata durata ei', () => {
    // 8 saisprezecimi = 2000 ms la 60 BPM.
    const plan = planRoundTrack({ ...base, patternDurations: [8] })
    const wav = renderWav(plan.events, plan.totalMs)
    const inceput = rmsBetween(wav, 5, 60)
    const laJumatate = rmsBetween(wav, 700, 950)
    const spreFinal = rmsBetween(wav, 1600, 1800)
    const dupaFinal = rmsBetween(wav, 2200, 2450)

    expect(inceput).toBeGreaterThan(0.05)
    // Cheia: la mijlocul doimii sunetul e inca prezent.
    expect(laJumatate).toBeGreaterThan(0.05)
    expect(spreFinal).toBeGreaterThan(0.03)
    // Se opreste inaintea notei urmatoare, ca sa nu se lege de ea.
    expect(dupaFinal).toBeLessThan(0.01)
  })

  it('patrimea suna mai scurt decat doimea', () => {
    const wavPatrime = renderWav(
      planRoundTrack({ ...base, patternDurations: [4] }).events,
      planRoundTrack({ ...base, patternDurations: [4] }).totalMs,
    )
    const wavDoime = renderWav(
      planRoundTrack({ ...base, patternDurations: [8] }).events,
      planRoundTrack({ ...base, patternDurations: [8] }).totalMs,
    )
    // La 1200 ms doimea inca suna, patrimea (1000 ms) s-a terminat deja.
    expect(rmsBetween(wavPatrime, 1150, 1300)).toBeLessThan(0.01)
    expect(rmsBetween(wavDoime, 1150, 1300)).toBeGreaterThan(0.03)
  })
})

describe('mixajul dintre metronom si note', () => {
  // Nota cade intre timpi (pasul 2 = 500 ms la 60 BPM), deci ferestrele de
  // masurare nu se suprapun cu click-urile de pe patrimi (0, 1000, 2000...).
  const pattern = [false, false, true, ...Array.from({ length: 13 }, () => false)]
  const base = { bpm: 60, stepsPerBar: 16, pattern, countInBars: 0, prepBars: 0 }
  const plan = planRoundTrack(base)

  const wavPattern = renderWav(plan.events, plan.totalMs, 'pattern')
  const wavGrid = renderWav(plan.events, plan.totalMs, 'grid')

  const metronom = (wav: Uint8Array) => rmsBetween(wav, 1000, 1080)
  const nota = (wav: Uint8Array) => rmsBetween(wav, 500, 580)

  it('pe „grid" metronomul se aude mai tare', () => {
    expect(metronom(wavGrid)).toBeGreaterThan(metronom(wavPattern) * 1.5)
  })

  it('pe „grid" notele se aud mai discret', () => {
    expect(nota(wavGrid)).toBeLessThan(nota(wavPattern))
  })

  it('pe „grid" nota nu mai acopera metronomul', () => {
    const implicit = nota(wavPattern) / metronom(wavPattern)
    const grila = nota(wavGrid) / metronom(wavGrid)
    // Pe mixajul implicit nota conduce, dar discret - nu de cateva ori, cat
    // era inainte, cand suna strident peste metronom.
    expect(implicit).toBeGreaterThan(1.2)
    expect(implicit).toBeLessThan(2.5)
    // Pe grila, raportul se injumatateste: metronomul devine reperul.
    expect(grila).toBeLessThan(implicit / 2)
  })

  it('implicit ramane mixajul cu notele in prim-plan', () => {
    const implicit = renderWav(plan.events, plan.totalMs)
    expect(nota(implicit)).toBeCloseTo(nota(wavPattern), 5)
  })
})

describe('trioletele pe grila de 48', () => {
  it('cele trei note ies exact egale, fara rest de rotunjire', () => {
    // Un triolet de optimi pe primul timp, apoi liniste.
    const pattern = Array.from({ length: 48 }, (_, i) => i === 0 || i === 4 || i === 8)
    const plan = planRoundTrack({
      bpm: 60,
      stepsPerBar: 48,
      pattern,
      countInBars: 0,
      prepBars: 0,
    })
    const [a, b, c] = plan.targetTimesMs
    const primulInterval = b! - a!
    const alDoileaInterval = c! - b!
    // Egale pana la limita virgulei mobile: diferenta ramasa e de ordinul a
    // 10^-12 ms, adica zero pentru orice ureche si orice masuratoare.
    expect(primulInterval).toBeCloseTo(alDoileaInterval, 9)
    // La 60 BPM, un timp e 1000 ms, deci fiecare treime e fix 333.33 ms.
    expect(primulInterval).toBeCloseTo(1000 / 3, 6)
  })

  it('trioletul si saisprezecimile incap pe aceeasi grila', () => {
    // Triolet pe timpul 1, saisprezecimi pe timpul 2.
    const pattern = Array.from(
      { length: 48 },
      (_, i) => [0, 4, 8, 12, 15, 18, 21].includes(i),
    )
    const plan = planRoundTrack({
      bpm: 60,
      stepsPerBar: 48,
      pattern,
      countInBars: 0,
      prepBars: 0,
    })
    const t = plan.targetTimesMs
    // Trei note egale pe primul timp...
    expect(t[1]! - t[0]!).toBeCloseTo(t[2]! - t[1]!, 6)
    // ...si patru note egale pe al doilea, fara ca grila sa se bata cap in cap.
    expect(t[4]! - t[3]!).toBeCloseTo(t[5]! - t[4]!, 6)
    expect(t[5]! - t[4]!).toBeCloseTo(t[6]! - t[5]!, 6)
    expect(t[4]! - t[3]!).toBeCloseTo(250, 6)
  })
})

describe('metronomul in masuri cu alt numar de timpi', () => {
  it('numaratoarea are exact atatea click-uri cati timpi are masura', () => {
    // Regresie: click-urile erau numarate fix pana la 4. Intr-o masura de 2/4
    // ultimele doua cadeau dupa bara, adica peste pattern-ul care urma.
    const plan = planRoundTrack({
      bpm: 60,
      stepsPerBar: 24,
      beatsPerBar: 2,
      pattern: Array.from({ length: 24 }, (_, i) => i === 0),
      countInBars: 1,
      prepBars: 0,
      playPattern: false,
    })
    const inaintaDePattern = plan.events.filter((event) => event.atMs < plan.patternStartMs)
    expect(inaintaDePattern).toHaveLength(2)
    expect(inaintaDePattern.map((event) => event.atMs)).toEqual([0, 1000])
    expect(inaintaDePattern[0]!.voice).toBe('accent')
  })

  it('niciun click nu iese din masura lui, in nicio masura', () => {
    ;([2, 3, 4] as const).forEach((beatsPerBar) => {
      const stepsPerBar = 12 * beatsPerBar
      const plan = planRoundTrack({
        bpm: 90,
        stepsPerBar,
        beatsPerBar,
        pattern: Array.from({ length: stepsPerBar }, (_, i) => i % 12 === 0),
        countInBars: 1,
        prepBars: 1,
      })
      const beatMs = 60_000 / 90
      const barMs = beatMs * beatsPerBar
      const clickuri = plan.events.filter((event) => event.voice !== 'hit')
      clickuri.forEach((event) => {
        // Pozitia click-ului in masura lui: trebuie sa fie un timp intreg,
        // nu un rest ramas dintr-o masura de alta lungime.
        const inBar = event.atMs % barMs
        const beatIndex = inBar / beatMs
        expect(Math.abs(beatIndex - Math.round(beatIndex))).toBeLessThan(1e-6)
        expect(Math.round(beatIndex)).toBeLessThan(beatsPerBar)
      })
      // Accentul cade doar pe „unu".
      clickuri
        .filter((event) => event.voice === 'accent')
        .forEach((event) => expect(event.atMs % barMs).toBeCloseTo(0, 6))
    })
  })
})

describe('sextoletul pe grila de 48', () => {
  it('cele sase note ies egale si umplu exact un timp', () => {
    // Sextolet pe primul timp: cate o nota la fiecare doi pasi.
    const pattern = Array.from({ length: 48 }, (_, i) => i < 12 && i % 2 === 0)
    const plan = planRoundTrack({
      bpm: 60,
      stepsPerBar: 48,
      pattern,
      countInBars: 0,
      prepBars: 0,
    })
    const t = plan.targetTimesMs
    expect(t).toHaveLength(6)
    const intervale = t.slice(1).map((value, index) => value - t[index]!)
    // La 60 BPM un timp e 1000 ms, deci fiecare sesime e fix 166.67 ms.
    intervale.forEach((interval) => expect(interval).toBeCloseTo(1000 / 6, 6))
    // Ultima nota inca incape in primul timp: al doilea incepe la 1000 ms.
    expect(t[5]! - t[0]!).toBeCloseTo((1000 * 5) / 6, 6)
  })

  it('sextoletul si trioletul stau pe aceleasi repere', () => {
    // Sextolet pe timpul 1, triolet pe timpul 2.
    const pattern = Array.from(
      { length: 48 },
      (_, i) => (i < 12 && i % 2 === 0) || [12, 16, 20].includes(i),
    )
    const plan = planRoundTrack({
      bpm: 60,
      stepsPerBar: 48,
      pattern,
      countInBars: 0,
      prepBars: 0,
    })
    const t = plan.targetTimesMs
    // Notele 1, 3 si 5 ale sextoletului cad exact unde ar cadea un triolet:
    // asta e si cheia de numarare din lectie.
    const trioletPeTimpul2 = [t[6]!, t[7]!, t[8]!].map((value) => value - 1000)
    expect(t[0]!).toBeCloseTo(trioletPeTimpul2[0]!, 6)
    expect(t[2]!).toBeCloseTo(trioletPeTimpul2[1]!, 6)
    expect(t[4]!).toBeCloseTo(trioletPeTimpul2[2]!, 6)
  })
})

describe('fluxul care se aude dar nu se bate', () => {
  const treiContraPatru = () =>
    planRoundTrack({
      bpm: 60,
      stepsPerBar: 48,
      pattern: Array.from({ length: 48 }, (_, i) => i % 16 === 0),
      backingPattern: Array.from({ length: 48 }, (_, i) => i % 12 === 0),
      countInBars: 1,
      prepBars: 1,
    })

  it('nu intra in tinte, deci nu se puncteaza', () => {
    const plan = treiContraPatru()
    // Trei tinte, nu sapte: acompaniamentul se aude, dar nu e sarcina.
    expect(plan.targetTimesMs).toHaveLength(3)
    expect(plan.events.filter((event) => event.voice === 'backing')).toHaveLength(8)
  })

  it('continua si in fereastra de raspuns', () => {
    const plan = treiContraPatru()
    const inRaspuns = plan.events.filter(
      (event) => event.voice === 'backing' && event.atMs >= plan.responseStartMs,
    )
    // Fara el aici nu ar exista poliritm, ci un ritm ciudat batut singur.
    expect(inRaspuns).toHaveLength(4)
  })

  it('cele doua fluxuri se intalnesc doar la bara', () => {
    const plan = treiContraPatru()
    const acompaniament = plan.events
      .filter((event) => event.voice === 'backing' && event.atMs >= plan.responseStartMs)
      .map((event) => event.atMs)
    const comune = plan.targetTimesMs.filter((time) =>
      acompaniament.some((other) => Math.abs(other - time) < 1e-6),
    )
    expect(comune).toEqual([plan.responseStartMs])
  })

  it('are voce proprie, ca sa nu se topeasca in fluxul tau', () => {
    const plan = treiContraPatru()
    const voci = new Set(plan.events.map((event) => event.voice))
    expect(voci.has('backing')).toBe(true)
    expect(voci.has('hit')).toBe(true)
  })

  it('se aude cu adevarat in fereastra de raspuns, nu doar in plan', () => {
    // In fereastra de raspuns fluxul tau tace - il bati tu - deci orice
    // sunet de acolo vine din acompaniament sau din metronom.
    const plan = treiContraPatru()
    const wav = renderWav(plan.events, plan.totalMs)
    const start = plan.responseStartMs
    const laNotaDeAcompaniament = rmsBetween(wav, start + 1005, start + 1080)
    // 1700 ms cade intre doua note de acompaniament (1000 si 2000) si intre
    // doua click-uri de metronom: acolo nu are ce suna.
    const inGol = rmsBetween(wav, start + 1700, start + 1800)
    expect(laNotaDeAcompaniament).toBeGreaterThan(inGol * 3)
    expect(inGol).toBeLessThan(0.01)
  })
})

describe('atacul notelor', () => {
  // Nota se pune la jumatatea primului timp (500 ms la 60 BPM), ca sa nu
  // cada peste click-ul de metronom si sa masuram din greseala clickul.
  const pattern = Array.from({ length: 48 }, (_, i) => i === 6)
  const plan = planRoundTrack({
    bpm: 60,
    stepsPerBar: 48,
    pattern,
    countInBars: 0,
    prepBars: 0,
  })
  const wav = renderWav(plan.events, plan.totalMs)

  it('nota nu incepe cu un pocnet', () => {
    // Pe un atac instantaneu, primele milisecunde ajung imediat la amplitudine
    // maxima - exact tranzitoriul care se aude strident. Cu atac moale,
    // inceputul e sensibil mai slab decat corpul notei.
    const primele2ms = rmsBetween(wav, 500, 502)
    const corp = rmsBetween(wav, 512, 530)
    expect(primele2ms).toBeLessThan(corp * 0.6)
  })

  it('click-urile de metronom raman seci', () => {
    // Metronomul are voie sa fie percutiv: el e reperul, nu continutul.
    const clickPlan = planRoundTrack({
      bpm: 60,
      stepsPerBar: 48,
      pattern: Array.from({ length: 48 }, () => false),
      countInBars: 1,
      prepBars: 0,
    })
    const clickWav = renderWav(clickPlan.events, clickPlan.totalMs)
    const primele2ms = rmsBetween(clickWav, 0, 2)
    const corp = rmsBetween(clickWav, 12, 30)
    expect(primele2ms).toBeGreaterThan(corp)
  })
})
