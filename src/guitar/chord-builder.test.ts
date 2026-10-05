import { describe, expect, it } from 'vitest'
import {
  allowedExtensions,
  alterationPresetsFor,
  DOMINANT_PRESETS,
  EXTENSION_PRESETS,
  extensionPresetsFor,
  buildChord,
  ROOT_CHOICES,
  toggleExtension,
  type ChordBase,
  type ChordExtension,
} from './chord-builder'

const chord = (root: (typeof ROOT_CHOICES)[number], base: ChordBase, ...extensions: ChordExtension[]) =>
  buildChord({ root, base, extensions })

describe('simbolul și notele', () => {
  it.each([
    [chord('C', 'major'), 'C', 'C E G'],
    [chord('C', 'minor'), 'Cm', 'C E♭ G'],
    [chord('C', 'major', '7'), 'C7', 'C E G B♭'],
    [chord('C', 'major', 'maj7'), 'Cmaj7', 'C E G B'],
    [chord('A', 'minor', '7'), 'Am7', 'A C E G'],
    [chord('C', 'major', '7', '9'), 'C9', 'C E G B♭ D'],
    [chord('D', 'minor', '7', '9'), 'Dm9', 'D F A C E'],
    [chord('F', 'major', 'maj7', '9'), 'Fmaj9', 'F A C E G'],
    [chord('C', 'major', '9'), 'Cadd9', 'C E G D'],
    [chord('C', 'major', '6'), 'C6', 'C E G A'],
    [chord('C', 'major', '6', '9'), 'C6/9', 'C E G A D'],
    [chord('G', 'major', '7', '13'), 'G13', 'G B D F A E'],
    [chord('E', 'major', '7', '#9'), 'E7♯9', 'E G♯ B D G'],
    [chord('B', 'minor', '7', 'b5'), 'Bm7♭5', 'B D F A'],
    [chord('C', 'dim'), 'Cdim', 'C E♭ G♭'],
    [chord('C', 'dim', '7'), 'Cdim7', 'C E♭ G♭ B𝄫'],
    [chord('C', 'aug'), 'Caug', 'C E G♯'],
    [chord('C', 'aug', '7'), 'C7♯5', 'C E G♯ B♭'],
    [chord('A', 'sus4', '7'), 'A7sus4', 'A D E G'],
    [chord('D', 'sus2'), 'Dsus2', 'D E A'],
    [chord('E', 'power'), 'E5', 'E B'],
    [chord('F#', 'minor', '7', '11'), 'F♯m11', 'F♯ A C♯ E G♯ B'],
    [chord('Bb', 'major', '7', 'b9'), 'B♭7♭9', 'B♭ D F A♭ C♭'],
    [chord('C', 'major', 'b5'), 'C(♭5)', 'C E G♭'],
  ])('%#: %s', (built, symbol, notes) => {
    expect(built.symbol).toBe(symbol)
    expect(built.tones.map((tone) => tone.note).join(' ')).toBe(notes)
  })

  it('formula pe trepte', () => {
    expect(chord('C', 'minor', '7', '9').tones.map((tone) => tone.label)).toEqual(['1', '♭3', '5', '♭7', '9'])
  })

  it('numele în română și engleză', () => {
    expect(chord('C', 'minor', '7', '9').name.ro).toBe('Do minor, cu septimă mică și nonă')
    expect(chord('F#', 'major').name.ro).toBe('Fa♯ major')
    expect(chord('Bb', 'major', 'maj7').name.en).toBe('B♭ major, with major seventh')
    expect(chord('C', 'dim', '7').name.ro).toBe('Do micșorat, cu septimă micșorată')
  })
})

describe('ce se poate alege', () => {
  it('septima mică și cea mare se exclud', () => {
    expect(toggleExtension('major', ['7'], 'maj7')).toEqual(['maj7'])
  })

  it('scoasă septima, pleacă și nona mărită care depindea de ea', () => {
    expect(toggleExtension('major', ['7', '#9'], '7')).toEqual([])
  })

  it('power chord nu are extensii, micșoratul doar septima', () => {
    expect(allowedExtensions('power', []).size).toBe(0)
    expect([...allowedExtensions('dim', [])]).toEqual(['7'])
  })

  it('nona mărită nu se poate pe minor (ar fi chiar terța mică)', () => {
    expect(allowedExtensions('minor', ['7']).has('#9')).toBe(false)
  })
})

describe('variantele pentru slidere', () => {
  const ids = (presets: { id: string }[]) => presets.map((preset) => preset.id)

  it('pe major sunt extensiile fără septimă mică; cele cu 7 sunt pe Dominant', () => {
    expect(ids(extensionPresetsFor('major'))).toEqual(['none', '6', '6/9', 'add9', 'add11', 'maj7', 'maj9', 'maj13'])
    expect(ids(extensionPresetsFor('dominant'))).toEqual(['none', 'dom9', 'dom11', 'dom13'])
    expect(EXTENSION_PRESETS.length).toBeGreaterThan(7)
  })

  it('dominantul: C7, C9, C11, C13 și alterațiile peste el', () => {
    const preset = (id: string) => DOMINANT_PRESETS.find((item) => item.id === id)!.extensions
    const symbol = (extensions: ChordExtension[]) => buildChord({ root: 'C', base: 'dominant', extensions }).symbol
    expect(symbol([])).toBe('C7')
    expect(symbol([...preset('dom9')])).toBe('C9')
    expect(symbol([...preset('dom13')])).toBe('C13')
    expect(symbol(['#9'])).toBe('C7♯9')
    expect(symbol(['b9'])).toBe('C7♭9')
    expect(ids(alterationPresetsFor('dominant', []))).toContain('#9')
    expect(buildChord({ root: 'C', base: 'dominant', extensions: ['9'] }).name.ro).toBe('Do dominant, cu nonă')
    expect(buildChord({ root: 'G', base: 'dominant', extensions: [] }).name.ro).toBe('Sol dominant')
  })

  it('micșoratul are doar „—" și 7, power chord-ul doar „—"', () => {
    expect(ids(extensionPresetsFor('dim'))).toEqual(['none', '7'])
    expect(ids(extensionPresetsFor('power'))).toEqual(['none'])
  })

  it('fără septimă, alterațiile care o cer dispar', () => {
    expect(ids(alterationPresetsFor('major', []))).toEqual(['none', 'b5'])
    expect(ids(alterationPresetsFor('major', ['7']))).toContain('#9')
  })

  it('o alterație nu se pune peste extensia cu care se exclude', () => {
    // 9 natural și ♭9 nu stau împreună.
    expect(ids(alterationPresetsFor('major', ['7', '9']))).not.toContain('b9')
    expect(ids(alterationPresetsFor('minor', ['7']))).not.toContain('#9')
  })

  it('o variantă aleasă dă simbolul așteptat', () => {
    const preset = (id: string) => EXTENSION_PRESETS.find((item) => item.id === id)!.extensions
    expect(buildChord({ root: 'C', base: 'minor', extensions: preset('9') }).symbol).toBe('Cm9')
    expect(buildChord({ root: 'F', base: 'major', extensions: preset('maj13') }).symbol).toBe('Fmaj13')
    expect(buildChord({ root: 'C', base: 'major', extensions: preset('6/9') }).symbol).toBe('C6/9')
  })


})
