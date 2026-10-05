import { describe, expect, it } from 'vitest'
import { buildChord, ROOT_CHOICES, type ChordBase, type ChordExtension } from './chord-builder'
import { chordLevels } from './chord-library'
import { referenceIndex, referenceShapes, referenceSuffix, referenceSuffixKeys } from './chord-reference'
import { validateChordShape } from './chords'
import { availableAlterations, availableBases, availableExtensions, chordVoicings } from './voicings'

describe('dicționarul de acorduri', () => {
  it('are cele 12 tonici, cu tipurile folosite de generator', () => {
    const index = referenceIndex()
    expect(new Set(index.map((entry) => entry.root)).size).toBe(12)
    expect(index.length).toBeGreaterThan(800)
  })

  it('Do major din dicționar conține forma deschisă, cu digitația din bibliotecă', () => {
    const built = buildChord({ root: 'C', base: 'major', extensions: [] })
    const voicings = chordVoicings({ root: 'C', base: 'major', extensions: [] }, built.spec, built.symbol)
    const open = voicings.find((voicing) => voicing.shape.frets === 'x32010')!
    expect(open.fromLibrary).toBe(true)
    expect(open.shape.fingers).toBe('x32-1-')
  })

  it('o inversiune din dicționar spune ce notă e în bas', () => {
    const built = buildChord({ root: 'C', base: 'major', extensions: [] })
    const voicings = chordVoicings({ root: 'C', base: 'major', extensions: [] }, built.spec, built.symbol)
    const inverted = voicings.find((voicing) => voicing.shape.frets === 'xx5558')!
    expect(inverted.bassNote).toBe('G')
  })

  it('tastele peste 9 se scriu cu litere și se citesc înapoi', () => {
    // C6 pe tasta 8: `8xa9a8` are tasta 10 pe coarda 4 (și coarda 5 amortizată sub barré).
    const high = referenceShapes('C', '6', 'C6').find((shape) => shape.frets === '8xa9a8')
    expect(high).toBeDefined()
    const built = buildChord({ root: 'C', base: 'major', extensions: ['6'] })
    expect(validateChordShape(high!, built.spec, { inversions: true })).toEqual([])
  })

  it('pe slidere apare doar ce are forme în dicționar, și tot ce apare are forme valide', () => {
    let selectable = 0
    for (const root of ROOT_CHOICES) {
      for (const base of availableBases(root)) {
        for (const extension of availableExtensions(root, base)) {
          for (const alteration of availableAlterations(root, base, extension.extensions)) {
            const recipe = { root, base, extensions: [...extension.extensions, ...alteration.extensions] }
            const built = buildChord(recipe)
            expect(referenceSuffix(base, recipe.extensions), built.symbol).not.toBeNull()
            const voicings = chordVoicings(recipe, built.spec, built.symbol)
            expect(voicings.length, built.symbol).toBeGreaterThan(0)
            for (const voicing of voicings) {
              expect(validateChordShape(voicing.shape, built.spec, { inversions: true })).toEqual([])
            }
            selectable += 1
          }
        }
      }
    }
    // Aproximativ 37 de combinații pe tonică, toate cu forme reale.
    expect(selectable).toBeGreaterThan(12 * 30)
  }, 60_000)

  it('cheile tabelului de corespondență sunt în forma sortată (altfel nu se potrivesc niciodată)', () => {
    for (const key of referenceSuffixKeys()) {
      const [, extensions = ''] = key.split('|')
      const sorted = extensions ? extensions.split(',').sort().join(',') : ''
      expect(extensions, key).toBe(sorted)
    }
  })

  it('dominantul cu 11 și add11 au forme din dicționar', () => {
    for (const [base, extensions] of [['dominant', ['11']], ['major', ['11']]] as [ChordBase, ChordExtension[]][]) {
      const built = buildChord({ root: 'C', base, extensions })
      expect(chordVoicings({ root: 'C', base, extensions }, built.spec, built.symbol).length, built.symbol).toBeGreaterThan(0)
    }
  })

  it('combinațiile fără tip în dicționar nu se pot alege', () => {
    // 13♭9 nu e în dicționar: nu apare pe sliderul de alterații peste 13.
    const dom13 = availableAlterations('C', 'dominant', ['13']).map((preset) => preset.id)
    expect(dom13).not.toContain('b9')
    expect(availableExtensions('C', 'dominant').map((preset) => preset.id)).toContain('dom13')
  })

  it('toate acordurile de bază au forme din dicționar, pe toate tonicile', () => {
    const basics: [ChordBase, ChordExtension[]][] = [
      ['major', []],
      ['minor', []],
      ['dominant', []],
      ['minor', ['7']],
      ['major', ['maj7']],
      ['sus4', []],
      ['sus2', []],
      ['power', []],
      ['dim', ['7']],
    ]
    for (const root of ROOT_CHOICES) {
      for (const [base, extensions] of basics) {
        const built = buildChord({ root, base, extensions })
        expect(chordVoicings({ root, base, extensions }, built.spec, built.symbol).length, built.symbol).toBeGreaterThan(0)
      }
    }
  })

  it('formele din bibliotecă sunt, aproape toate, și în dicționar', () => {
    const all = chordLevels.flatMap((level) => level.chords)
    const known = new Set(
      referenceIndex().flatMap(({ root, suffix }) => referenceShapes(root as never, suffix, '').map((shape) => shape.frets)),
    )
    const missing = all.filter((shape) => !known.has(shape.frets)).map((shape) => shape.id)
    // Câteva forme ale bibliotecii (variantele pe patru coarde, „mini") nu sunt în dicționar; restul, da.
    expect(missing.length).toBeLessThan(all.length / 2)
  })
})
