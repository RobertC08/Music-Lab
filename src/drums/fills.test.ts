import { describe, expect, it } from 'vitest'
import { missingFor, unlockedByProgress, unlockedIn } from './catalogue'
import { onsetsOf, validateExercise, type KitPiece } from './exercise'
import { fillById, fillText, fillVocabulary, fills } from './fills'
import { allSampleKeys } from './kit-keys'
import { planDrumSession, segmentsForDuration } from './plan'
import { drumTrackKey, renderDrumTrack } from './render'
import { SAMPLE_RATE } from './wav'
import { testKit } from './test-kit'

const kit = testKit

function rms(samples: Float32Array, fromMs: number, toMs: number) {
  const from = Math.max(0, Math.round((fromMs / 1000) * SAMPLE_RATE))
  const to = Math.min(samples.length, Math.round((toMs / 1000) * SAMPLE_RATE))
  let sum = 0
  for (let index = from; index < to; index += 1) sum += samples[index]! ** 2
  return to > from ? Math.sqrt(sum / (to - from)) : 0
}

describe('catalogul de fill-uri', () => {
  it('trece validarea, fiecare, față de vocabularul lui', () => {
    for (const exercise of fills) {
      expect(validateExercise(exercise, fillVocabulary), exercise.id).toEqual([])
    }
  })

  it('are patru măsuri, din care exact ultima e fill', () => {
    for (const exercise of fills) {
      expect(exercise.bars, exercise.id).toHaveLength(4)
      expect(exercise.bars.map((bar) => bar.fill === true), exercise.id).toEqual([
        false,
        false,
        false,
        true,
      ])
    }
  })

  it('pune cinelul de aterizare pe „unu”, în prima măsură', () => {
    /*
      În buclă, „unu”-ul primei măsuri cade imediat după fill-ul tău. Fără cinelul
      ăla, reintrarea n-ar avea margine, iar reintrarea e chiar ce se exersează.
    */
    for (const exercise of fills) {
      const crash = onsetsOf(exercise).filter((onset) => onset.piece === 'crash')
      expect(crash, exercise.id).toHaveLength(1)
      expect(crash[0], exercise.id).toMatchObject({ bar: 0, step: 0 })
    }
  })

  it('coboară pe tobe în ordinea înălțimii, nu la întâmplare', () => {
    /*
      Scara are sens doar dacă tobele vin în ordine: mică → tom → mijloc → podea.
      Ordinea e cea a înălțimilor măsurate la extragere (Tom1 ~95 Hz, Tom3 ~69,
      Tom4 ~52), deci un fill care sare peste mijloc sau urcă înapoi n-ar mai fi
      o coborâre. Testul ține ordinea, nu notele.
    */
    const order: KitPiece[] = ['snare', 'tom', 'mid', 'floor']
    for (const id of ['fill-descending', 'fill-staircase', 'fill-snare-burst', 'fill-triplets']) {
      const exercise = fillById(id)!
      const fillBar = exercise.bars[exercise.bars.length - 1]!
      const firstStepOf = (piece: KitPiece) =>
        (fillBar.lanes[piece] ?? []).findIndex((hit) => hit !== null)
      const used = order.filter((piece) => firstStepOf(piece) >= 0)
      expect(used, id).toEqual(order)
      const steps = used.map(firstStepOf)
      expect([...steps].sort((left, right) => left - right), id).toEqual(steps)
    }
  })

  it('scrie fill-ul de triolete pe grila lui, nu pe cea dreaptă', () => {
    const exercise = fillById('fill-triplets')!
    expect(exercise.stepsPerBar / exercise.beatsPerBar).toBe(3)
    // Toate celelalte rămân pe șaisprezecimi.
    for (const other of fills.filter((item) => item.id !== 'fill-triplets')) {
      expect(other.stepsPerBar / other.beatsPerBar, other.id).toBe(4)
    }
  })

  it('ține groove-ul identic pe măsurile dinaintea fill-ului', () => {
    /*
      Dacă groove-ul s-ar schimba odată cu fill-ul, n-ai ști care te-a încurcat.

      „Identic” se judecă pe grilă, nu pe tot catalogul: fill-ul în triolete are
      12 pași pe măsură, deci nu poate sta peste un groove scris în 16. Are
      groove-ul lui, de shuffle, dar tot unul singur, pentru toate exercițiile
      cu aceeași grilă.
    */
    const grooveOf = (exercise: (typeof fills)[number], barIndex: number) =>
      JSON.stringify(exercise.bars[barIndex]!.lanes)
    const reference = new Map<number, string>()
    for (const exercise of fills) {
      expect(grooveOf(exercise, 1), exercise.id).toEqual(grooveOf(exercise, 2))
      const known = reference.get(exercise.stepsPerBar)
      if (known === undefined) reference.set(exercise.stepsPerBar, grooveOf(exercise, 1))
      else expect(grooveOf(exercise, 1), exercise.id).toEqual(known)
    }
    // Grilele rămân puține: 16 pentru aproape tot, 12 pentru triolete.
    expect([...reference.keys()].sort()).toEqual([12, 16])
  })

  it('are id-uri distincte, text și un lanț de deblocare care nu se rupe', () => {
    const position = new Map(fills.map((exercise, index) => [exercise.id, index]))
    expect(position.size).toBe(fills.length)
    for (const exercise of fills) {
      expect(fillText(exercise.id).titleKey, exercise.id).toMatch(/^drums\./)
      for (const required of exercise.requires ?? []) {
        expect(position.get(required)!, `${exercise.id} -> ${required}`).toBeLessThan(
          position.get(exercise.id)!,
        )
      }
    }
    const done: string[] = []
    for (const exercise of fills) {
      expect(
        unlockedByProgress(fills, done).map((item) => item.id),
        exercise.id,
      ).toContain(exercise.id)
      done.push(exercise.id)
    }
    expect(unlockedByProgress(fills, [])).toHaveLength(1)
    // Azi însă poarta e oprită: toate sunt deschise de la început.
    expect(unlockedIn(fills, [])).toHaveLength(fills.length)
  })

  it('spune ce mai lipsește pentru un fill blocat', () => {
    expect(missingFor(fillById('fill-toms')!, [])).toEqual(['fill-last-beat'])
    expect(missingFor(fillById('fill-toms')!, ['fill-last-beat'])).toEqual([])
  })

  it('coboară pe set în fill-urile lungi, cum se cântă', () => {
    // Toba mică, apoi tomul, apoi tomul de podea, niciodată invers.
    for (const id of ['fill-full-bar', 'fill-sixteenths', 'fill-offbeat']) {
      const exercise = fillById(id)!
      const order = ['snare', 'tom', 'floor']
      const lastOf = (piece: string) =>
        Math.max(
          ...onsetsOf(exercise)
            .filter((onset) => onset.bar === 3 && onset.piece === piece)
            .map((onset) => onset.step),
          -1,
        )
      const firstOf = (piece: string) =>
        Math.min(
          ...onsetsOf(exercise)
            .filter((onset) => onset.bar === 3 && onset.piece === piece)
            .map((onset) => onset.step),
          Number.POSITIVE_INFINITY,
        )
      for (let index = 1; index < order.length; index += 1) {
        expect(firstOf(order[index]!), `${id}: ${order[index]}`).toBeGreaterThan(
          lastOf(order[index - 1]!),
        )
      }
    }
  })
})

describe('golul', () => {
  const planFor = (id: string, bpm = 80) =>
    planDrumSession(fillById(id)!, { segments: [{ bpm, repeats: 1 }], countInBars: 0 })

  it('tace pe măsura de fill și cântă pe celelalte', () => {
    const plan = planFor('fill-full-bar')
    const gapped = renderDrumTrack(plan, { samples: kit, clicks: false, gap: true })
    const full = renderDrumTrack(plan, { samples: kit, clicks: false })
    const fillBar = plan.bars.find((bar) => bar.fill)!
    const grooveBar = plan.bars[1]!

    // Pe măsura de groove se aude la fel în ambele variante.
    expect(rms(gapped.samples, grooveBar.atMs, grooveBar.endMs)).toBeCloseTo(
      rms(full.samples, grooveBar.atMs, grooveBar.endMs),
      6,
    )
    // Pe măsura ta, în varianta cu gol, e liniște.
    expect(rms(gapped.samples, fillBar.atMs, fillBar.endMs)).toBeLessThan(0.001)
    expect(rms(full.samples, fillBar.atMs, fillBar.endMs)).toBeGreaterThan(0.02)
  })

  it('păstrează metronomul în gol, ca să ai pe ce te sprijini', () => {
    /*
      Golul înseamnă „fără tobe”, nu „fără nimic”. Fără click-uri, măsura ta ar fi
      tăcere completă și n-ai avea cum să știi unde ești, exact ce trebuie evitat.
    */
    const plan = planFor('fill-full-bar')
    const gapped = renderDrumTrack(plan, { samples: kit, gap: true })
    const fillBar = plan.bars.find((bar) => bar.fill)!
    const beatMs = 60_000 / fillBar.bpm
    expect(rms(gapped.samples, fillBar.atMs, fillBar.atMs + 40)).toBeGreaterThan(0.005)
    expect(rms(gapped.samples, fillBar.atMs + beatMs, fillBar.atMs + beatMs + 40)).toBeGreaterThan(0.005)
    // Iar între click-uri rămâne tăcere: nicio tobă nu a scăpat în gol.
    expect(rms(gapped.samples, fillBar.atMs + beatMs / 2, fillBar.atMs + beatMs / 2 + 60)).toBeLessThan(0.001)
  })

  it('reintră cu cinelul imediat după gol', () => {
    // Marginea de la capătul golului: dacă ai grăbit, te calci pe ea.
    const plan = planDrumSession(fillById('fill-full-bar')!, {
      segments: [{ bpm: 80, repeats: 2 }],
      countInBars: 0,
    })
    const gapped = renderDrumTrack(plan, { samples: kit, clicks: false, gap: true })
    const fillBar = plan.bars.find((bar) => bar.fill)!
    const landing = plan.bars.find((bar) => bar.index > fillBar.index && bar.exerciseBar === 0)!
    expect(rms(gapped.samples, landing.atMs, landing.atMs + 60)).toBeGreaterThan(0.05)
  })

  it('dă o cheie de cache diferită cu și fără gol', () => {
    /*
      Se verifică CHEIA, nu sunetul.

      Prima variantă a testului compara vârful celor două piste, și trecea din
      întâmplare doar acolo unde cea mai tare lovitură cădea în gol. La `fill-toms`
      cea mai tare e cinelul de aterizare, care stă în afara golului, deci vârful
      ieșea identic deși pistele sunt diferite. Capcana plătită în modulul Ritm e
      exact asta: un parametru uitat din cheie, și două variante primesc același
      WAV, iar un test pe sunet ar fi ratat-o.
    */
    const plan = planFor('fill-toms')
    const key = (gap: boolean) => drumTrackKey(plan, 'muldjord', { gap })
    expect(key(true)).not.toBe(key(false))
    expect(key(true)).toBe(drumTrackKey(plan, 'muldjord', { gap: true }))
  })
})

describe('fill-urile, randate', () => {
  it('folosesc numai mostre care există în kit', () => {
    for (const exercise of fills) {
      const plan = planDrumSession(exercise, {
        segments: [{ bpm: exercise.tempo.suggested, repeats: 1 }],
      })
      for (const hit of plan.hits) {
        expect(allSampleKeys, exercise.id).toContain(`${hit.piece}-${hit.hit}`)
      }
      expect(() => renderDrumTrack(plan, { samples: kit }), exercise.id).not.toThrow()
    }
  })

  it('o sesiune de 60 s încape în plafon la orice fill', () => {
    for (const exercise of fills) {
      const segments = segmentsForDuration(exercise, exercise.tempo.suggested, 60_000)
      const plan = planDrumSession(exercise, { segments })
      expect(plan.cappedFromMs, exercise.id).toBeUndefined()
      expect(plan.totalMs, exercise.id).toBeLessThanOrEqual(60_001)
      // Și trece de cel puțin două ori prin structură: un singur fill într-o
      // sesiune n-ar fi exercițiu, ar fi o demonstrație.
      expect(plan.bars.filter((bar) => bar.fill).length, exercise.id).toBeGreaterThan(1)
    }
  })
})
