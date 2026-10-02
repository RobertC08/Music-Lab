import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { advancedFills, advancedFillText, advancedFillVocabulary } from './advanced-fills'
import { footPieces, validateExercise, type KitPiece } from './exercise'
import { beatDivisions, beatsRow, evenRow, MIXED_STEPS_PER_BEAT } from './mixed-grid'
import { planDrumSession } from './plan'
import { renderDrumTrack } from './render'
import { testKit } from './test-kit'

describe('grila comună', () => {
  it('întinde fiecare timp pe 12 pași, după subdiviziunea lui', () => {
    const row = beatsRow('Xxxx|xxx|xxxxxx|x.')
    expect(row).toHaveLength(48)
    const hits = [...row].flatMap((c, i) => (c === '.' ? [] : [i]))
    // Șaisprezecimi din 3 în 3, triolet din 4 în 4, sextolet din 2 în 2, optime pe 0.
    expect(hits).toEqual([0, 3, 6, 9, 12, 16, 20, 24, 26, 28, 30, 32, 34, 36])
  })

  it('refuză un timp care nu încape în 12 și un rând cu prea puțini timpi', () => {
    expect(() => beatsRow('xxxxx|.|.|.')).toThrow()
    expect(() => beatsRow('xxxx|xxxx|xxxx')).toThrow()
  })

  it('întinde un rând drept pe aceeași grilă', () => {
    expect(evenRow('x...x...x...x...')).toBe(beatsRow('x...|x...|x...|x...'))
  })

  it('deduce subdiviziunea fiecărui timp, pentru desen', () => {
    const fill = advancedFills.find((exercise) => exercise.id === 'afill-everything')!
    const bar = fill.bars[3]!
    expect(beatDivisions(bar, fill.stepsPerBar, fill.beatsPerBar)).toEqual([4, 6, 3, 2])
  })
})

describe('fill-urile avansate', () => {
  const i18n = readFileSync(join(__dirname, '../i18n.ts'), 'utf8')

  it('sunt douăzeci', () => {
    expect(advancedFills).toHaveLength(20)
  })

  it('trec validarea, fiecare, față de vocabularul lor', () => {
    for (const exercise of advancedFills) {
      expect(validateExercise(exercise, advancedFillVocabulary), exercise.id).toEqual([])
      expect(exercise.stepsPerBar / exercise.beatsPerBar).toBe(MIXED_STEPS_PER_BEAT)
    }
  })

  it('au trei măsuri de groove și a patra de fill, cu crash-ul de aterizare pe „unu”', () => {
    for (const exercise of advancedFills) {
      expect(
        exercise.bars.map((bar) => Boolean(bar.fill)),
        exercise.id,
      ).toEqual([false, false, false, true])
      expect(exercise.bars[0]!.lanes.crash?.[0], exercise.id).toBeTruthy()
    }
  })

  it('nu cer niciodată unei mâini două piese deodată', () => {
    for (const exercise of advancedFills) {
      exercise.bars.forEach((bar, barIndex) => {
        for (let step = 0; step < exercise.stepsPerBar; step += 1) {
          const byHand = (Object.entries(bar.lanes) as [KitPiece, unknown[]][])
            .filter(([piece, lane]) => lane[step] && !footPieces.includes(piece))
            .map(([piece]) => piece)
          expect(
            byHand.length,
            `${exercise.id} măsura ${barIndex + 1} pasul ${step}: ${byHand}`,
          ).toBeLessThanOrEqual(2)
        }
      })
    }
  })

  it('amestecă subdiviziuni: cele mai multe au cel puțin două feluri în măsura de fill', () => {
    const mixed = advancedFills.filter((exercise) => {
      const divisions = beatDivisions(exercise.bars[3]!, exercise.stepsPerBar, exercise.beatsPerBar)
      return new Set(divisions).size > 1
    })
    expect(mixed.length).toBeGreaterThanOrEqual(12)
  })

  it('au id-uri distincte, texte în ambele limbi și o ordine care nu cere nimic din viitor', () => {
    const seen = new Set<string>()
    for (const exercise of advancedFills) {
      expect(seen.has(exercise.id), exercise.id).toBe(false)
      for (const required of exercise.requires ?? [])
        expect(seen.has(required), `${exercise.id} cere ${required}`).toBe(true)
      seen.add(exercise.id)
      const { titleKey, howToKey } = advancedFillText(exercise.id)
      for (const key of [titleKey, howToKey]) {
        const name = key.replace('drums.', '')
        expect(i18n.split(`    ${name}:`).length - 1, key).toBe(2)
      }
    }
  })

  it('se randează pe kit, cu golul pe măsura de fill', () => {
    for (const exercise of advancedFills) {
      const plan = planDrumSession(exercise, {
        segments: [{ bpm: exercise.tempo.suggested, repeats: 1 }],
        countInBars: 0,
        clicks: false,
      })
      expect(() => renderDrumTrack(plan, { samples: testKit }), exercise.id).not.toThrow()
      expect(
        () => renderDrumTrack(plan, { samples: testKit, gap: true }),
        exercise.id,
      ).not.toThrow()
    }
  })
})
