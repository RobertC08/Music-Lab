import { describe, expect, it } from 'vitest'
import { chordLevels } from './chord-library'
import { analyzeChord, chordName, displaySymbol, parseSymbol, validateChordLevels, validateChordShape } from './chords'

describe('biblioteca de acorduri', () => {
  it('toate formele sunt acordurile pe care le numesc și se pot cânta', () => {
    expect(validateChordLevels(chordLevels)).toEqual([])
  })

  it('are niveluri cu id-uri unice', () => {
    const ids = chordLevels.map((level) => level.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('primul nivel are acordurile deschise comune programelor LCM', () => {
    const first = chordLevels[0]!.chords.map((chord) => chord.symbol)
    for (const symbol of ['C', 'G', 'D', 'Am', 'Em', 'Dm', 'A', 'E']) expect(first).toContain(symbol)
  })

  it('barré-ul complet vine după primele acorduri, septime și semi-barré', () => {
    const fullBarre = chordLevels.findIndex((level) =>
      level.chords.some((chord) => chord.barre && chord.barre.from - chord.barre.to >= 4),
    )
    const halfBarre = chordLevels.findIndex((level) => level.id === 'semi-barre')
    expect(halfBarre).toBeGreaterThan(0)
    expect(fullBarre).toBeGreaterThan(halfBarre)
  })
})

describe('validarea prinde greșelile de scris', () => {
  it('Do major citit invers nu mai e Do major', () => {
    const problems = validateChordShape({ id: 'C-invers', symbol: 'C', frets: '01023x', fingers: '-1-23x' })
    expect(problems.some((problem) => problem.includes('nu e în C'))).toBe(true)
  })

  it('o terță lipsă e semnalată', () => {
    // Fără coardele 2 și 1, La minor rămâne fără Do: nu mai e minor, e un power chord.
    const missing = validateChordShape({ id: 'Am-gol', symbol: 'Am', frets: 'x022xx', fingers: 'x-12xx' })
    expect(missing.some((problem) => problem.includes('lipsește C'))).toBe(true)
  })

  it('basul greșit e semnalat', () => {
    const problems = validateChordShape({ id: 'C-bas-E', symbol: 'C', frets: '032010', fingers: '-32-1-' })
    expect(problems.some((problem) => problem.includes('basul e E'))).toBe(true)
  })

  it('o deschidere imposibilă e respinsă', () => {
    const problems = validateChordShape({ id: 'intins', symbol: 'G5', frets: '3x0xx8', fingers: '1x-xx4' })
    expect(problems.some((problem) => problem.includes('deschidere'))).toBe(true)
  })

  it('degetele încrucișate sunt respinse', () => {
    const problems = validateChordShape({ id: 'C-incrucisat', symbol: 'C', frets: 'x32010', fingers: 'x13-2-' })
    expect(problems.some((problem) => problem.includes('stă sub'))).toBe(true)
  })

  it('un barré peste o coardă goală e respins', () => {
    const problems = validateChordShape({
      id: 'F-gresit',
      symbol: 'F',
      frets: '133210',
      fingers: '13421-',
      barre: { fret: 1, from: 6, to: 1 },
    })
    expect(problems.some((problem) => problem.includes('barré pe tasta 1'))).toBe(true)
  })
})

describe('numele și notele', () => {
  it('scrie notele după acord: La♭ în Fa minor, nu Sol♯', () => {
    const fm = chordLevels.flatMap((level) => level.chords).find((chord) => chord.id === 'Fm')!
    const notes = analyzeChord(fm).strings.map((entry) => entry.note)
    expect(notes).toEqual(['F', 'C', 'F', 'A♭', 'C', 'F'])
  })

  it('numele în română și engleză', () => {
    expect(chordName('F#m', 'ro')).toBe('Fa♯ minor')
    expect(chordName('Bb', 'en')).toBe('B♭ major')
    expect(chordName('C/G', 'ro')).toBe('Do major cu Sol în bas')
    expect(chordName('Bm7b5', 'ro')).toBe('Si minor șapte cu cvinta micșorată')
  })

  it('simbolul de pe ecran', () => {
    expect(displaySymbol('F#m')).toBe('F♯m')
    expect(displaySymbol('Bb')).toBe('B♭')
    expect(displaySymbol('Bm7b5')).toBe('Bm7♭5')
    expect(displaySymbol('E7#9')).toBe('E7♯9')
  })

  it('un simbol necunoscut nu se parsează', () => {
    expect(parseSymbol('Cmaj13#11')).toBeNull()
  })

  it('desenul pornește de la prag sau de la primul deget', () => {
    const all = chordLevels.flatMap((level) => level.chords)
    expect(analyzeChord(all.find((chord) => chord.id === 'C')!).baseFret).toBe(1)
    expect(analyzeChord(all.find((chord) => chord.id === 'A-barre')!).baseFret).toBe(5)
    expect(analyzeChord(all.find((chord) => chord.id === 'E7#9')!).baseFret).toBe(6)
  })
})
