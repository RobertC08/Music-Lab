import { describe, expect, it } from 'vitest'
import { GRACE_SPACING_MS, onsetsOf, validateExercise } from './exercise'
import { planDrumSession, segmentsForDuration } from './plan'
import { renderDrumTrack } from './render'
import {
  missingFor,
  rudimentById,
  rudimentText,
  rudimentVocabulary,
  rudiments,
  unlockedRudiments,
} from './rudiments'
import { unlockedByProgress } from './catalogue'
import { SAMPLE_RATE } from './wav'
import { testKit } from './test-kit'
import { allSampleKeys } from './kit-keys'

const kit = testKit

function rms(samples: Float32Array, fromMs: number, toMs: number) {
  const from = Math.max(0, Math.round((fromMs / 1000) * SAMPLE_RATE))
  const to = Math.min(samples.length, Math.round((toMs / 1000) * SAMPLE_RATE))
  let sum = 0
  for (let index = from; index < to; index += 1) sum += samples[index]! ** 2
  return to > from ? Math.sqrt(sum / (to - from)) : 0
}

describe('catalogul de rudimente', () => {
  it('trece validarea, fiecare, față de vocabularul lui', () => {
    // Inclusiv regula de 90 ms la `tempo.max`: un interval de tempo întins prea
    // sus n-ar da nicio eroare de compilare, dar ar cere un tremolo.
    for (const exercise of rudiments) {
      expect(validateExercise(exercise, rudimentVocabulary), exercise.id).toEqual([])
    }
  })

  it('are id-uri distincte și cerințe care există', () => {
    const ids = rudiments.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const exercise of rudiments) {
      for (const required of exercise.requires ?? []) {
        expect(ids, `${exercise.id} cere ${required}`).toContain(required)
      }
    }
  })

  it('nu cere niciodată ceva ce vine mai târziu în listă', () => {
    // Altfel un rudiment ar fi de neatins: cerința lui s-ar deschide după el.
    const position = new Map(rudiments.map((exercise, index) => [exercise.id, index]))
    for (const exercise of rudiments) {
      for (const required of exercise.requires ?? []) {
        expect(position.get(required)!, `${exercise.id} -> ${required}`).toBeLessThan(
          position.get(exercise.id)!,
        )
      }
    }
  })

  it('are text pentru fiecare rudiment', () => {
    for (const exercise of rudiments) {
      const text = rudimentText(exercise.id)
      expect(text.titleKey, exercise.id).toMatch(/^drums\./)
      expect(text.howToKey, exercise.id).toMatch(/^drums\./)
    }
  })

  it('le arată pe toate: poarta e oprită', () => {
    /*
      `LOCK_EXERCISES = false`. Modulul n-are scor și nu verifică nimic, deci
      n-are ce păzi, vezi `catalogue.ts`. Ordinea rămâne cea din listă.
    */
    expect(unlockedRudiments([])).toHaveLength(rudiments.length)
  })

  it('păstrează regula pe trepte, dacă poarta se pune la loc', () => {
    const open = unlockedByProgress(rudiments, [])
    expect(open).toHaveLength(1)
    expect(open[0]!.id).toBe('single-stroke-roll')
  })

  it('deschide restul pe măsură ce se termină cerințele', () => {
    const afterFirst = unlockedByProgress(rudiments, ['single-stroke-roll']).map((exercise) => exercise.id)
    expect(afterFirst).toContain('double-stroke-roll')
    expect(afterFirst).toContain('flam')
    // Flam-tap cere și dublele, nu doar flam-ul.
    expect(afterFirst).not.toContain('flam-tap')
    expect(
      unlockedByProgress(rudiments, ['single-stroke-roll', 'flam']).map((e) => e.id),
    ).not.toContain('flam-tap')
    expect(
      unlockedByProgress(rudiments, ['single-stroke-roll', 'flam', 'double-stroke-roll']).map(
        (e) => e.id,
      ),
    ).toContain('flam-tap')
  })

  it('spune ce mai lipsește pentru un rudiment blocat', () => {
    const flamTap = rudimentById('flam-tap')!
    expect(missingFor(flamTap, ['flam'])).toEqual(['double-stroke-roll'])
    expect(missingFor(flamTap, ['flam', 'double-stroke-roll'])).toEqual([])
  })

  it('toate se deschid dacă se termină totul înaintea lor', () => {
    // Verifică lanțul întreg: niciun rudiment nu rămâne blocat pentru totdeauna.
    const done: string[] = []
    for (const exercise of rudiments) {
      expect(unlockedRudiments(done).map((e) => e.id), exercise.id).toContain(exercise.id)
      done.push(exercise.id)
    }
    expect(unlockedRudiments(done)).toHaveLength(rudiments.length)
  })

  it('alternează mâinile peste bară, nu doar în interiorul măsurii', () => {
    /*
      Bucla închide ultima lovitură peste prima. La simple, două lovituri cu
      aceeași mână peste bară ar rupe exact alternanța pentru care se exersează
      figura, și n-ar apărea la citirea unei singure măsuri.
    */
    for (const id of ['single-stroke-roll', 'single-stroke-triplets', 'single-stroke-sixteenths']) {
      const exercise = rudimentById(id)!
      const sticks = onsetsOf(exercise)
        .filter((onset) => !onset.grace)
        .map((onset) => onset.stick)
      const looped = [...sticks, sticks[0]]
      for (let index = 1; index < looped.length; index += 1) {
        expect(looped[index], `${id}, lovitura ${index + 1}`).not.toBe(looped[index - 1])
      }
    }
  })

  it('pune grațiile cu cealaltă mână decât lovitura principală', () => {
    for (const id of ['flam', 'flam-tap', 'drag']) {
      const withGrace = onsetsOf(rudimentById(id)!).filter((onset) => onset.grace)
      expect(withGrace.length, id).toBeGreaterThan(0)
      for (const onset of withGrace) expect(onset.grace!.stick, id).not.toBe(onset.stick)
    }
  })

  it('un drag are două grații, un flam una', () => {
    const graceCount = (id: string) =>
      onsetsOf(rudimentById(id)!).map((onset) => onset.grace?.strokes ?? 0)
    expect(graceCount('flam')).toEqual([1, 1, 1, 1])
    expect(graceCount('drag')).toEqual([2, 2, 2, 2])
  })
})

describe('rudimentele, randate', () => {
  it('așază grațiile înaintea loviturii, la distanță fixă în ms', () => {
    const flam = rudimentById('flam')!
    const slow = planDrumSession(flam, { segments: [{ bpm: 50, repeats: 1 }], countInBars: 0 })
    const fast = planDrumSession(flam, { segments: [{ bpm: 120, repeats: 1 }], countInBars: 0 })
    const gapOf = (plan: typeof slow) => {
      const main = plan.hits.find((hit) => !hit.grace && hit.step === 1)!
      const grace = plan.hits.find((hit) => hit.grace && hit.step === 1)!
      return main.atMs - grace.atMs
    }
    // Aceeași distanță la ambele tempouri: ornamentul e un gest, nu o subdiviziune.
    expect(gapOf(slow)).toBeCloseTo(GRACE_SPACING_MS, 6)
    expect(gapOf(fast)).toBeCloseTo(GRACE_SPACING_MS, 6)
  })

  it('face grația mai încet decât lovitura, măsurat pe semnal', () => {
    const plan = planDrumSession(rudimentById('flam')!, {
      segments: [{ bpm: 60, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const main = plan.hits.find((hit) => !hit.grace && hit.step === 1)!
    /*
      Ferestrele sunt scurte și lipite de fiecare atac: grația și lovitura sunt la
      32 ms una de alta, deci o fereastră de 60 ms, ca la celelalte teste, le-ar
      prinde pe amândouă și raportul ar ieși ~1.
    */
    const grace = rms(samples, main.atMs - GRACE_SPACING_MS, main.atMs - GRACE_SPACING_MS + 20)
    const stroke = rms(samples, main.atMs, main.atMs + 20)
    expect(grace).toBeGreaterThan(0)
    expect(stroke).toBeGreaterThan(grace * 2)
  })

  it('nu pierde grația de dinaintea primei lovituri a pistei', () => {
    // Fără numărătoare, grația de pe primul pas cade înainte de eșantionul zero.
    const plan = planDrumSession(rudimentById('drag')!, {
      segments: [{ bpm: 60, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    expect(plan.hits[0]!.atMs).toBeLessThan(0)
    const { samples, peak } = renderDrumTrack(plan, { samples: kit })
    expect(peak).toBeGreaterThan(0)
    // Pista începe direct cu ce a mai încăput din ornament, nu cu liniște.
    expect(rms(samples, 0, 10)).toBeGreaterThan(0)
  })

  it('o sesiune de 60 s încape în plafon la orice rudiment, la tempoul sugerat', () => {
    for (const exercise of rudiments) {
      const segments = segmentsForDuration(exercise, exercise.tempo.suggested, 60_000)
      const plan = planDrumSession(exercise, { segments })
      expect(plan.cappedFromMs, exercise.id).toBeUndefined()
      expect(plan.totalMs, exercise.id).toBeGreaterThan(50_000)
      // O milisecundă de toleranță: timpii se adună măsură după măsură, în
      // virgulă mobilă, și o sesiune care încape exact iese cu 1e-14 peste.
      expect(plan.totalMs, exercise.id).toBeLessThanOrEqual(60_001)
    }
  })

  it('folosește numai mostre care există în kit', () => {
    for (const exercise of rudiments) {
      const plan = planDrumSession(exercise, { segments: [{ bpm: exercise.tempo.suggested, repeats: 1 }] })
      for (const hit of plan.hits) {
        expect(allSampleKeys, exercise.id).toContain(`${hit.piece}-${hit.hit}`)
      }
      // Și randarea chiar merge: o mostră lipsă ar arunca, nu ar tăcea.
      expect(() => renderDrumTrack(plan, { samples: kit })).not.toThrow()
    }
  })
})

describe('deblocarea, citită din progresul salvat', () => {
  /*
    Deblocarea citește cheile din `drumProgress.exercises`, adică exact forma
    salvată de `completeDrumSession` și sincronizată cu contul. Testul verifică
    legătura pe forma aceea, nu pe o listă de id-uri scrisă de mână: dacă forma
    salvată se schimbă, aici trebuie să se vadă.
  */
  const progressFor = (ids: string[]) => ({
    exercises: Object.fromEntries(
      ids.map((id) => [id, { completedAt: '2026-09-28T10:00:00Z', bestTempo: 70, longestSeconds: 60 }]),
    ),
  })

  it('citește progresul salvat, chiar dacă azi nu mai închide nimic', () => {
    const openIds = (ids: string[]) =>
      unlockedByProgress(rudiments, Object.keys(progressFor(ids).exercises)).map(
        (exercise) => exercise.id,
      )
    expect(openIds([])).toEqual(['single-stroke-roll'])
    expect(openIds(['single-stroke-roll']).length).toBeGreaterThan(1)
  })

  it('un exercițiu terminat rămâne deschis', () => {
    // Altfel „ai terminat-o” ar închide-o, iar recordul de tempo n-ar mai putea
    // fi bătut niciodată.
    for (const exercise of rudiments) {
      const ids = rudiments.slice(0, rudiments.indexOf(exercise) + 1).map((item) => item.id)
      expect(
        unlockedRudiments(Object.keys(progressFor(ids).exercises)).map((item) => item.id),
        exercise.id,
      ).toContain(exercise.id)
    }
  })
})
