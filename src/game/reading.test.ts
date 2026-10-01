import { describe, expect, it } from 'vitest'
import { readingLevels, readingSpecs } from '../curriculum/reading'
import { generateReadingExercises, fillsWholeBars, firstHitStep } from './reading'
import { tokenSpan, tokensToEvents, tokensToPattern } from './notation-tokens'
import { planRoundTrack } from '../audio/round-plan'

/**
 * Exercitiile de citire sunt generate, nu scrise de mana. Asta muta riscul:
 * nu mai exista greseli de tipar, dar poate exista un generator care produce
 * masuri incomplete sau simboluri care n-au fost predate la nivelul acela.
 * De aceea se verifica fiecare exercitiu din fiecare nivel, nu un esantion.
 */
describe('exercitiile de citire', () => {
  const all = readingSpecs.map((spec) => ({
    spec,
    level: readingLevels.find((item) => item.level === spec.level)!,
  }))

  it('fiecare nivel are exact cate exercitii cere', () => {
    all.forEach(({ spec, level }) => {
      // Un vocabular prea sarac nu poate umple nivelul cu exercitii distincte.
      // Nivelul 1 a patit-o: cu doar patrimi si pauze pe o masura ieseau sapte.
      expect(level.exercises.length, `nivelul ${spec.level}`).toBe(spec.count)
    })
  })

  it('fiecare exercitiu umple masuri intregi', () => {
    all.forEach(({ spec, level }) => {
      level.exercises.forEach((exercise) => {
        expect(
          fillsWholeBars(exercise.tokens, spec.ticksPerBar),
          `${exercise.id}`,
        ).toBe(true)
        expect(exercise.tokens.reduce((sum, token) => sum + tokenSpan(token), 0)).toBe(
          spec.ticksPerBar * spec.bars,
        )
      })
    })
  })

  it('nu apare niciun simbol din afara vocabularului nivelului', () => {
    all.forEach(({ spec, level }) => {
      const allowed = new Set(spec.vocabulary)
      level.exercises.forEach((exercise) => {
        exercise.tokens.forEach((token) => {
          // Asta e tot contractul de dificultate: un nivel nu poate produce
          // ceva mai greu decat ce i s-a dat.
          expect(allowed.has(token), `${exercise.id} are ${token}`).toBe(true)
        })
      })
    })
  })

  it('prima nota cade in primul timp', () => {
    all.forEach(({ spec, level }) => {
      level.exercises.forEach((exercise) => {
        const stepsPerBeat = spec.ticksPerBar / spec.beatsPerBar
        expect(firstHitStep(exercise.tokens), `${exercise.id}`).toBeLessThan(stepsPerBeat)
      })
    })
  })

  it('exercitiile unui nivel sunt distincte', () => {
    all.forEach(({ spec, level }) => {
      const keys = level.exercises.map((exercise) => exercise.tokens.join('|'))
      expect(new Set(keys).size, `nivelul ${spec.level}`).toBe(keys.length)
    })
  })

  it('id-urile sunt unice peste tot jocul', () => {
    const ids = readingLevels.flatMap((level) => level.exercises.map((item) => item.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('generarea e determinista', () => {
    readingSpecs.forEach((spec) => {
      const again = generateReadingExercises(spec)
      const before = readingLevels.find((item) => item.level === spec.level)!.exercises
      expect(again.map((item) => item.tokens.join('|'))).toEqual(
        before.map((item) => item.tokens.join('|')),
      )
    })
  })

  it('tempourile stau in intervalul nivelului si nu urca monoton', () => {
    all.forEach(({ spec, level }) => {
      const tempos = level.exercises.map((exercise) => exercise.bpm)
      tempos.forEach((bpm) => {
        expect(bpm).toBeGreaterThanOrEqual(spec.bpm[0])
        expect(bpm).toBeLessThanOrEqual(spec.bpm[1])
      })
      // Amestecate deliberat: o rampa previzibila antreneaza rampa, nu ritmul.
      const sorted = [...tempos].sort((left, right) => left - right)
      expect(tempos).not.toEqual(sorted)
    })
  })

  it('fiecare exercitiu produce o pista redabila', () => {
    all.forEach(({ spec, level }) => {
      level.exercises.forEach((exercise) => {
        const pattern = tokensToPattern(exercise.tokens)
        const durations = tokensToEvents(exercise.tokens).map((event) => event.durationSteps)
        const plan = planRoundTrack({
          bpm: exercise.bpm,
          stepsPerBar: spec.ticksPerBar,
          beatsPerBar: spec.beatsPerBar,
          pattern,
          patternDurations: durations,
          countInBars: 1,
          prepBars: 1,
          playPattern: false,
        })
        expect(plan.targetTimesMs).toHaveLength(pattern.filter(Boolean).length)
        plan.targetTimesMs.forEach((time) => {
          expect(time).toBeGreaterThanOrEqual(plan.responseStartMs)
          expect(time).toBeLessThan(plan.totalMs)
        })
      })
    })
  })

  it('nicio pereche de note nu ajunge imposibil de batut', () => {
    all.forEach(({ spec, level }) => {
      level.exercises.forEach((exercise) => {
        const beatMs = 60_000 / exercise.bpm
        const stepMs = beatMs / (spec.ticksPerBar / spec.beatsPerBar)
        const onsets = tokensToPattern(exercise.tokens).flatMap((isHit, index) =>
          isHit ? [index] : [],
        )
        onsets.slice(1).forEach((step, index) => {
          const gapMs = (step - onsets[index]!) * stepMs
          expect(gapMs, `${exercise.id} la ${exercise.bpm} BPM`).toBeGreaterThanOrEqual(90)
        })
      })
    })
  })
})
