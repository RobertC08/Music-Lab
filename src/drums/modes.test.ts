import { describe, expect, it } from 'vitest'
import { fills } from './fills'
import { grooves } from './grooves'
import {
  LADDER_STEP,
  creativeFillsMode,
  genreSwitchMode,
  ladderMode,
  rouletteMode,
  steadyMode,
  survivalMode,
  type ModeInput,
} from './modes'
import { MAX_BPM } from './exercise'
import { MAX_SESSION_MS, nextExerciseChange, planDrumMedley } from './plan'
import { rudiments } from './rudiments'

const inputFor = (overrides: Partial<ModeInput> = {}): ModeInput => ({
  exercise: rudiments[0]!,
  pool: rudiments,
  bpm: 80,
  seconds: 60,
  seed: 1234,
  ...overrides,
})

const planOf = (items: ReturnType<typeof steadyMode.build>) => planDrumMedley(items)

describe('modurile de sesiune', () => {
  it('încap toate în plafon, la orice tempo din interval', () => {
    const modes = [steadyMode, ladderMode, rouletteMode, survivalMode]
    for (const mode of modes) {
      for (const exercise of rudiments) {
        for (const bpm of [exercise.tempo.min, exercise.tempo.suggested, exercise.tempo.max]) {
          const plan = planOf(mode.build(inputFor({ exercise, bpm, seconds: 90 })))
          expect(plan.totalMs, `${mode.id}/${exercise.id}@${bpm}`).toBeLessThanOrEqual(
            MAX_SESSION_MS + 1,
          )
          expect(plan.cappedFromMs, `${mode.id}/${exercise.id}@${bpm}`).toBeUndefined()
        }
      }
    }
  })

  it('scara urcă tempoul și nu trece peste maximul exercițiului', () => {
    const exercise = rudiments[0]!
    const plan = planOf(ladderMode.build(inputFor({ exercise, bpm: 80, seconds: 90 })))
    const tempos = [...new Set(plan.bars.filter((bar) => !bar.countIn).map((bar) => bar.bpm))]
    expect(tempos.length).toBeGreaterThan(1)
    expect(tempos).toEqual([...tempos].sort((a, b) => a - b))
    expect(tempos[0]).toBe(80)
    expect(tempos.at(-1)!).toBeLessThanOrEqual(exercise.tempo.max)
    expect(tempos[1]! - tempos[0]!).toBe(LADDER_STEP)
    // Recordul e ultimul tempo chiar cântat, nu cel cerut.
    expect(plan.peakBpm).toBe(tempos.at(-1))
  })

  it('scara nu sare nicio treaptă', () => {
    const plan = planOf(ladderMode.build(inputFor({ bpm: 60, seconds: 90 })))
    const tempos = [...new Set(plan.bars.filter((bar) => !bar.countIn).map((bar) => bar.bpm))]
    for (let index = 1; index < tempos.length; index += 1) {
      expect(tempos[index]! - tempos[index - 1]!).toBe(LADDER_STEP)
    }
  })

  it('ruleta începe cu exercițiul ales, apoi schimbă', () => {
    // Altfel ai apăsa pe „Paradiddle” și ai auzi altceva.
    const exercise = rudiments[4]!
    const plan = planOf(rouletteMode.build(inputFor({ exercise, seconds: 90 })))
    expect(plan.exerciseIds[0]).toBe(exercise.id)
    expect(plan.exerciseIds.length).toBeGreaterThan(1)
  })

  it('ruleta nu repetă același exercițiu la rând', () => {
    const plan = planOf(rouletteMode.build(inputFor({ seconds: 90 })))
    for (let index = 1; index < plan.exerciseIds.length; index += 1) {
      expect(plan.exerciseIds[index]).not.toBe(plan.exerciseIds[index - 1])
    }
  })

  it('ruleta e reproductibilă: aceeași sămânță, aceeași sesiune', () => {
    const one = planOf(rouletteMode.build(inputFor({ seed: 7, seconds: 90 })))
    const two = planOf(rouletteMode.build(inputFor({ seed: 7, seconds: 90 })))
    const other = planOf(rouletteMode.build(inputFor({ seed: 8, seconds: 90 })))
    expect(one.exerciseIds).toEqual(two.exerciseIds)
    expect(one.exerciseIds.length + other.exerciseIds.length).toBeGreaterThan(2)
  })

  it('ruleta nu scoate niciodată ceva nedeblocat', () => {
    const pool = rudiments.slice(0, 3)
    const plan = planOf(rouletteMode.build(inputFor({ pool, seconds: 90 })))
    const allowed = new Set(pool.map((item) => item.id))
    for (const id of plan.exerciseIds) expect(allowed, id).toContain(id)
  })

  it('schimbarea de stil chiar schimbă stilul', () => {
    const plan = planOf(
      genreSwitchMode.build(inputFor({ exercise: grooves[0]!, pool: grooves, seconds: 90 })),
    )
    const styleOf = (id: string) => grooves.find((item) => item.id === id)!.style
    expect(plan.exerciseIds.length).toBeGreaterThan(1)
    for (let index = 1; index < plan.exerciseIds.length; index += 1) {
      expect(styleOf(plan.exerciseIds[index]!), plan.exerciseIds[index]).not.toBe(
        styleOf(plan.exerciseIds[index - 1]!),
      )
    }
  })

  it('rezistența ține până la plafon și își ia recordul la oprire', () => {
    const plan = planOf(survivalMode.build(inputFor({ exercise: grooves[0]!, seconds: 30 })))
    // Durata cerută nu contează: modul o stabilește singur.
    expect(plan.totalMs).toBeGreaterThan(80_000)
    expect(plan.totalMs).toBeLessThanOrEqual(MAX_SESSION_MS + 1)
    expect(survivalMode.recordOnStop).toBe(true)
    expect(survivalMode.fixedDuration).toBe(true)
  })

  it('fill-urile inventate golesc măsura ta, dar o lasă marcată', () => {
    const exercise = fills[0]!
    const items = creativeFillsMode.build(inputFor({ exercise, pool: fills, seconds: 60 }))
    const blank = items[0]!.exercise
    const fillBar = blank.bars.find((bar) => bar.fill)!
    expect(Object.keys(fillBar.lanes)).toHaveLength(0)
    // Groove-ul de dinainte rămâne neatins: altfel n-ai peste ce să inventezi.
    expect(blank.bars[1]).toEqual(exercise.bars[1])
    const plan = planOf(items)
    const fillBars = plan.bars.filter((bar) => bar.fill)
    expect(fillBars.length).toBeGreaterThan(1)
    for (const bar of fillBars) {
      expect(plan.hits.filter((hit) => hit.bar === bar.index)).toHaveLength(0)
    }
  })

  it('fiecare mod dă cel puțin o trecere, chiar și cu durata minimă', () => {
    for (const mode of [steadyMode, ladderMode, rouletteMode, genreSwitchMode, creativeFillsMode]) {
      const items = mode.build(inputFor({ exercise: fills[0]!, pool: fills, seconds: 5, bpm: 60 }))
      expect(items.length, mode.id).toBeGreaterThan(0)
      expect(() => planOf(items), mode.id).not.toThrow()
    }
  })
})

describe('tempoul peste intervalul recomandat', () => {
  it('urcă scara până la plafonul aplicației, nu până la recomandare', () => {
    /*
      Pornit PESTE intervalul exercițiului, `for (step = bpm; step <= tempo.max)`
      nu făcea nicio treaptă, iar modul părea stricat exact la tempourile pentru
      care fusese ales. Recomandarea rămâne recomandare; plafonul e `MAX_BPM`.
    */
    const exercise = rudiments[0]!
    const above = exercise.tempo.max + 20
    const items = ladderMode.build(inputFor({ exercise, bpm: above, seconds: 90 }))
    expect(items.length).toBeGreaterThan(1)
    expect(items[0]!.bpm).toBe(above)
    expect(items[items.length - 1]!.bpm).toBeGreaterThan(above)
    expect(items.every((item) => item.bpm <= MAX_BPM)).toBe(true)
    // Și tot încape în plafonul de durată, ca orice sesiune.
    expect(planOf(items).totalMs).toBeLessThanOrEqual(MAX_SESSION_MS + 1)
  })

  it('urcă doar până la recomandare, dacă ai pornit sub ea', () => {
    const exercise = rudiments[0]!
    const items = ladderMode.build(inputFor({ exercise, bpm: exercise.tempo.min, seconds: 90 }))
    expect(items.every((item) => item.bpm <= exercise.tempo.max)).toBe(true)
  })
})

describe('ce urmează, arătat înainte', () => {
  const medley = () =>
    planOf(
      genreSwitchMode.build(inputFor({ exercise: grooves[0]!, pool: grooves, seconds: 90 })),
    )

  it('găsește schimbarea, nu trecerea: același groove repetat nu e „ce urmează"', () => {
    const plan = medley()
    const first = plan.bars.find((bar) => !bar.countIn)!
    const change = nextExerciseChange(plan, first.index)
    expect(change).not.toBeNull()
    expect(change!.exerciseId).not.toBe(first.exerciseId)
    // Tot ce e între ele e ACELAȘI exercițiu: dacă am fi întors prima măsură a
    // trecerii următoare, sfatul ar fi fost „urmează” ceva ce deja se cântă.
    for (let index = first.index; index < change!.barIndex; index += 1) {
      expect(plan.bars[index]!.exerciseId).toBe(first.exerciseId)
    }
    expect(plan.bars[change!.barIndex]!.atMs).toBe(change!.atMs)
  })

  it('numără în măsuri cântate, nu în măsuri de plan', () => {
    const plan = medley()
    const first = plan.bars.find((bar) => !bar.countIn)!
    const change = nextExerciseChange(plan, first.index)!
    const target = plan.bars[change.barIndex]!
    expect(change.barsUntil).toBe(target.musicalIndex - first.musicalIndex)
    // Cerut de pe numărătoare, numărul rămâne același: numărătoarea nu se pune
    // la socoteală, altfel „peste 2 măsuri" n-ar fi peste două măsuri cântate.
    const countIn = plan.bars.find((bar) => bar.countIn)
    if (countIn) {
      expect(nextExerciseChange(plan, countIn.index)!.barsUntil).toBe(target.musicalIndex)
    }
  })

  it('nu inventează nimic când sesiunea are un singur exercițiu', () => {
    const plan = planOf(steadyMode.build(inputFor({ exercise: grooves[0]!, pool: grooves })))
    expect(nextExerciseChange(plan, 0)).toBeNull()
    expect(nextExerciseChange(plan, plan.bars.length - 1)).toBeNull()
  })

  it('tace la ultima bucată, când nu mai urmează nimic', () => {
    const plan = medley()
    expect(nextExerciseChange(plan, plan.bars.length - 1)).toBeNull()
  })
})
