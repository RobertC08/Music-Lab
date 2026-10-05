import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { letterName, pitchAt, pitchClass, STRINGS_LOW_TO_HIGH, type GuitarString } from './tuning'

/*
  Acordurile: forma pe gât, ce note are un simbol și verificarea dintre ele.

  O formă de acord se scrie ca în orice bibliotecă de acorduri, DE LA COARDA 6
  LA COARDA 1: Do major e `x32010`. Citit invers, același șir dă un acord care nu
  există, iar compilatorul nu are de unde să știe. De aceea fiecare formă trece
  prin `validateChordShape`, care calculează notele și le compară cu simbolul.
  E garda pe care `validateExercise` o ține la tobe.
*/

/** Pentru ce chitară contează. Etichetă și notiță, nu filtru. */
export type GuitarInstrument = 'both' | 'electric' | 'acoustic'

export interface Barre {
  fret: number
  /** Coarda de unde pornește barré-ul (cea mai groasă). */
  from: GuitarString
  /** Coarda unde se termină (cea mai subțire). */
  to: GuitarString
}

export interface ChordShape {
  /** Stabil: intră în progres și în trimiterile din lecții. */
  id: string
  /** Simbolul internațional, ASCII: `F#m`, `Bb`, `C/G`. Pe ecran, cu ♯ și ♭. */
  symbol: string
  /**
   * Șase caractere, de la coarda 6 la coarda 1: `x` = nu se cântă, cifră =
   * tasta, iar `a`-`f` = tastele 10-15 (`encodeFret`), ca forma să rămână un
   * șir de șase caractere și pe pozițiile înalte din dicționar.
   */
  frets: string
  /** Degetele, la fel: `1`-`4`, `T` degetul mare, `-` coardă goală, `x` coardă care nu se cântă. */
  fingers: string
  barre?: Barre
  /** Permite o deschidere de 5 taste în loc de 4, pentru întinderi cunoscute. */
  stretch?: boolean
  instrument?: GuitarInstrument
  /** Un sfat scurt, sub diagramă. */
  tip?: LocalizedText
}

export interface ChordLevel {
  id: string
  title: LocalizedText
  summary: LocalizedText
  /** Notița de instrument a nivelului, dacă diferă ceva între acustică și electrică. */
  instrumentNote?: LocalizedText
  accent: string
  soft: string
  chords: ChordShape[]
}

// ---------------------------------------------------------------------------
// Simbolul: ce note are acordul
// ---------------------------------------------------------------------------

/**
 * O treaptă a acordului: câte semitonuri peste tonică și câte litere (pentru
 * scris corect: în Fa minor e La♭, nu Sol♯). `optional` = se poate omite din
 * formă fără ca acordul să-și schimbe numele (cvinta perfectă, de obicei).
 */
interface Tone {
  semitones: number
  letters: number
  optional?: boolean
}

const ROOT: Tone = { semitones: 0, letters: 0 }
const MAJOR_THIRD: Tone = { semitones: 4, letters: 2 }
const MINOR_THIRD: Tone = { semitones: 3, letters: 2 }
const FIFTH: Tone = { semitones: 7, letters: 4, optional: true }
const MINOR_SEVENTH: Tone = { semitones: 10, letters: 6 }
const MAJOR_SEVENTH: Tone = { semitones: 11, letters: 6 }
const NINTH: Tone = { semitones: 2, letters: 1 }
const SIXTH: Tone = { semitones: 9, letters: 5 }

/*
  Calitățile folosite în bibliotecă. O calitate nouă se adaugă aici, cu numele
  ei în ambele limbi; un simbol cu o calitate necunoscută e respins de test.

  `7#9` scrie nona mărită ca terță mică (Sol într-un Mi7♯9, nu Fa dublu diez):
  așa o numesc chitariștii, și așa o caută cine citește diagrama.
*/
const QUALITIES: Record<string, { tones: Tone[]; name: LocalizedText }> = {
  '': { tones: [ROOT, MAJOR_THIRD, FIFTH], name: { ro: 'major', en: 'major' } },
  m: { tones: [ROOT, MINOR_THIRD, FIFTH], name: { ro: 'minor', en: 'minor' } },
  '7': { tones: [ROOT, MAJOR_THIRD, FIFTH, MINOR_SEVENTH], name: { ro: 'șapte', en: 'seven' } },
  maj7: { tones: [ROOT, MAJOR_THIRD, FIFTH, MAJOR_SEVENTH], name: { ro: 'major șapte', en: 'major seven' } },
  m7: { tones: [ROOT, MINOR_THIRD, FIFTH, MINOR_SEVENTH], name: { ro: 'minor șapte', en: 'minor seven' } },
  '5': { tones: [ROOT, { semitones: 7, letters: 4 }], name: { ro: 'cinci (power chord)', en: 'five (power chord)' } },
  sus2: { tones: [ROOT, NINTH, { semitones: 7, letters: 4 }], name: { ro: 'sus doi', en: 'sus two' } },
  sus4: {
    tones: [ROOT, { semitones: 5, letters: 3 }, { semitones: 7, letters: 4 }],
    name: { ro: 'sus patru', en: 'sus four' },
  },
  '7sus4': {
    tones: [ROOT, { semitones: 5, letters: 3 }, FIFTH, MINOR_SEVENTH],
    name: { ro: 'șapte sus patru', en: 'seven sus four' },
  },
  add9: { tones: [ROOT, MAJOR_THIRD, FIFTH, NINTH], name: { ro: 'add nouă', en: 'add nine' } },
  '6': { tones: [ROOT, MAJOR_THIRD, FIFTH, SIXTH], name: { ro: 'șase', en: 'six' } },
  m6: { tones: [ROOT, MINOR_THIRD, FIFTH, SIXTH], name: { ro: 'minor șase', en: 'minor six' } },
  dim: {
    tones: [ROOT, MINOR_THIRD, { semitones: 6, letters: 4 }],
    name: { ro: 'micșorat', en: 'diminished' },
  },
  dim7: {
    tones: [ROOT, MINOR_THIRD, { semitones: 6, letters: 4 }, { semitones: 9, letters: 6 }],
    name: { ro: 'micșorat șapte', en: 'diminished seven' },
  },
  aug: {
    tones: [ROOT, MAJOR_THIRD, { semitones: 8, letters: 4 }],
    name: { ro: 'mărit', en: 'augmented' },
  },
  m7b5: {
    tones: [ROOT, MINOR_THIRD, { semitones: 6, letters: 4 }, MINOR_SEVENTH],
    name: { ro: 'minor șapte cu cvinta micșorată', en: 'minor seven flat five' },
  },
  '9': { tones: [ROOT, MAJOR_THIRD, FIFTH, MINOR_SEVENTH, NINTH], name: { ro: 'nouă', en: 'nine' } },
  m9: { tones: [ROOT, MINOR_THIRD, FIFTH, MINOR_SEVENTH, NINTH], name: { ro: 'minor nouă', en: 'minor nine' } },
  '7#9': {
    tones: [ROOT, MAJOR_THIRD, FIFTH, MINOR_SEVENTH, { semitones: 3, letters: 2 }],
    name: { ro: 'șapte diez nouă', en: 'seven sharp nine' },
  },
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11] as const
const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const

/** O notă scrisă: litera (0 = C … 6 = B) și înălțimea (0-11). */
export interface SpelledNote {
  letter: number
  pc: number
}

export function parseNote(text: string): SpelledNote | null {
  const match = /^([A-G])(#|b)?$/.exec(text)
  if (!match) return null
  const letter = LETTERS.indexOf(match[1] as (typeof LETTERS)[number])
  const shift = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0
  return { letter, pc: pitchClass(NATURAL_PC[letter]! + shift) }
}

/** Litera și alterația unei note scrise: cu ♯/♭, dublele cu 𝄪/𝄫. */
function accidental(note: SpelledNote): string {
  const shift = ((note.pc - NATURAL_PC[note.letter]! + 18) % 12) - 6
  return shift === 0 ? '' : shift === 1 ? '♯' : shift === -1 ? '♭' : shift === 2 ? '𝄪' : '𝄫'
}

export const spellLetter = (note: SpelledNote) => `${LETTERS[note.letter]}${accidental(note)}`
export const spellSolfege = (note: SpelledNote) => `${SOLFEGE[note.letter]}${accidental(note)}`

/**
 * Ce note are un acord, oricum ar fi fost descris: dintr-un simbol din
 * bibliotecă (`parseSymbol`) sau construit în generator (`chord-builder.ts`).
 * Verificarea și desenul lucrează pe asta, nu pe simbol.
 */
export interface ChordSpec {
  root: SpelledNote
  /** Nota din bas a unui slash chord (`C/G`). */
  bass?: SpelledNote
  tones: { pc: number; spelled: string; optional: boolean }[]
}

export interface ParsedSymbol extends ChordSpec {
  quality: string
}

export function parseSymbol(symbol: string): ParsedSymbol | null {
  const match = /^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/.exec(symbol)
  if (!match) return null
  const root = parseNote(match[1]!)
  const quality = QUALITIES[match[2]!]
  if (!root || !quality) return null
  const bass = match[3] ? parseNote(match[3]) : undefined
  if (bass === null) return null
  return {
    root,
    quality: match[2]!,
    bass,
    tones: quality.tones.map((tone) => {
      const spelled = {
        letter: (root.letter + tone.letters) % 7,
        pc: pitchClass(root.pc + tone.semitones),
      }
      return { pc: spelled.pc, spelled: spellLetter(spelled), optional: tone.optional ?? false }
    }),
  }
}

/** Simbolul de pe ecran: `F#m` → `F♯m`, `Bb` → `B♭`, `m7b5` → `m7♭5`. */
export function displaySymbol(symbol: string): string {
  return symbol.replace(/#/g, '♯').replace(/([A-G0-9])b/g, '$1♭')
}

/** „Do major", „Fa♯ minor", „Do major cu Sol în bas". */
export function chordName(symbol: string, language: 'ro' | 'en'): string {
  const parsed = parseSymbol(symbol)
  if (!parsed) return symbol
  const quality = QUALITIES[parsed.quality]!.name[language]
  if (language === 'ro') {
    const base = `${spellSolfege(parsed.root)} ${quality}`
    return parsed.bass ? `${base} cu ${spellSolfege(parsed.bass)} în bas` : base
  }
  const base = `${spellLetter(parsed.root)} ${quality}`
  return parsed.bass ? `${base} over ${spellLetter(parsed.bass)}` : base
}

/** Tasta ca un caracter: 0-9, apoi a-f pentru 10-15. */
export const encodeFret = (fret: number) => (fret < 10 ? String(fret) : String.fromCharCode(87 + fret))
/** Inversul lui `encodeFret`. */
export const decodeFret = (char: string) => (/[a-f]/.test(char) ? char.charCodeAt(0) - 87 : Number(char))

// ---------------------------------------------------------------------------
// Forma: ce sună pe fiecare coardă
// ---------------------------------------------------------------------------

export interface SoundingString {
  string: GuitarString
  /** `null` = coarda nu se cântă. */
  fret: number | null
  /** `null` pentru coardă goală sau care nu se cântă. */
  finger: string | null
  pitch: number | null
  /** Numele notei, scris după acord (La♭ în Fa minor), sau `null`. */
  note: string | null
  isRoot: boolean
}

export interface ChordAnalysis {
  strings: SoundingString[]
  /** Prima tastă desenată: 1 lângă prag, altfel tasta celui mai jos deget. */
  baseFret: number
  /** Câte taste trebuie desenate ca să încapă toată forma (minim 4). */
  fretsShown: number
}

/** Caracterele formei, coardă cu coardă, de la 6 la 1. */
function columns(shape: ChordShape) {
  return STRINGS_LOW_TO_HIGH.map((string, index) => ({
    string,
    fretChar: shape.frets[index] ?? '?',
    fingerChar: shape.fingers[index] ?? '?',
  }))
}

export function analyzeChord(shape: ChordShape, spec?: ChordSpec): ChordAnalysis {
  const parsed = spec ?? parseSymbol(shape.symbol)
  const strings = columns(shape).map(({ string, fretChar, fingerChar }): SoundingString => {
    if (fretChar === 'x') return { string, fret: null, finger: null, pitch: null, note: null, isRoot: false }
    const fret = decodeFret(fretChar)
    const pitch = pitchAt(string, fret)
    const pc = pitchClass(pitch)
    const tone = parsed?.tones.find((candidate) => candidate.pc === pc)
    const bassNote = parsed?.bass && parsed.bass.pc === pc ? spellLetter(parsed.bass) : null
    return {
      string,
      fret,
      finger: fret > 0 && /[1-4T]/.test(fingerChar) ? fingerChar : null,
      pitch,
      note: tone?.spelled ?? bassNote ?? letterName(pc),
      isRoot: parsed ? pc === parsed.root.pc : false,
    }
  })
  const fretted = strings.map((entry) => entry.fret).filter((fret): fret is number => fret !== null && fret > 0)
  const highest = fretted.length ? Math.max(...fretted) : 0
  const lowest = fretted.length ? Math.min(...fretted) : 1
  const baseFret = highest <= 4 ? 1 : lowest
  return { strings, baseFret, fretsShown: Math.max(4, highest - baseFret + 1) }
}

// ---------------------------------------------------------------------------
// Validarea
// ---------------------------------------------------------------------------

/** Deschiderea maximă a mâinii, în taste, de la cel mai jos la cel mai sus deget. */
const MAX_SPAN = 4
const MAX_SPAN_STRETCH = 5

/**
 * Tot ce e greșit la o formă, în cuvinte. Listă goală = forma e bună.
 *
 * Verifică trei lucruri, în ordinea în care ar greși cineva care scrie de mână:
 *
 * 1. Șirurile au forma bună (șase caractere, degete pe toate coardele apăsate).
 * 2. **Notele sunt ale acordului**: fiecare notă care sună e în simbol, toate
 *    notele obligatorii ale simbolului sună, iar basul e tonica (sau nota de
 *    după `/`). Asta prinde forma citită invers și cifra greșită.
 * 3. **Mâna poate**: cel mult patru degete, deschidere de cel mult patru taste,
 *    degetele cresc odată cu tasta, un deget pe mai multe coarde doar pe
 *    aceeași tastă, barré-ul acoperă coarde apăsate.
 */
export interface ValidateOptions {
  /**
   * Basul poate fi orice notă a acordului, nu doar tonica: pentru pozițiile din
   * dicționar, unde inversiunile sunt forme obișnuite (Do major cu Sol în bas,
   * pe tasta 5). În bibliotecă și în formele căutate, tonica rămâne în bas.
   */
  inversions?: boolean
}

export function validateChordShape(shape: ChordShape, spec?: ChordSpec, options: ValidateOptions = {}): string[] {
  const problems: string[] = []
  const at = `${shape.id} (${shape.symbol})`

  if (shape.frets.length !== 6) problems.push(`${at}: frets are ${shape.frets.length} caractere, nu 6`)
  if (shape.fingers.length !== 6) problems.push(`${at}: fingers are ${shape.fingers.length} caractere, nu 6`)
  if (problems.length) return problems

  const parsed = spec ?? parseSymbol(shape.symbol)
  if (!parsed) return [`${at}: simbol necunoscut`]

  for (const { string, fretChar, fingerChar } of columns(shape)) {
    const here = `${at}, coarda ${string}`
    if (fretChar === 'x') {
      if (fingerChar !== 'x') problems.push(`${here}: coarda nu se cântă, dar are degetul „${fingerChar}”`)
    } else if (!/^[0-9a-f]$/.test(fretChar)) {
      problems.push(`${here}: tasta „${fretChar}” nu e validă`)
    } else if (fretChar === '0') {
      if (fingerChar !== '-') problems.push(`${here}: coardă goală cu degetul „${fingerChar}”`)
    } else if (!/^[1-4T]$/.test(fingerChar)) {
      problems.push(`${here}: tasta ${fretChar} fără deget`)
    }
  }
  if (problems.length) return problems

  const { strings } = analyzeChord(shape, parsed)
  const sounding = strings.filter((entry) => entry.pitch !== null)
  if (sounding.length < 2) problems.push(`${at}: sună mai puțin de două coarde`)

  // 2. Notele.
  const allowed = new Set(parsed.tones.map((tone) => tone.pc))
  if (parsed.bass) allowed.add(parsed.bass.pc)
  for (const entry of sounding) {
    const pc = pitchClass(entry.pitch!)
    if (!allowed.has(pc)) {
      problems.push(`${at}: coarda ${entry.string} dă ${letterName(pc)}, care nu e în ${shape.symbol}`)
    }
  }
  const present = new Set(sounding.map((entry) => pitchClass(entry.pitch!)))
  for (const tone of parsed.tones) {
    if (!tone.optional && !present.has(tone.pc)) problems.push(`${at}: lipsește ${tone.spelled}`)
  }
  const bass = sounding[0]
  const expectedBass = parsed.bass ?? parsed.root
  if (bass && !options.inversions && pitchClass(bass.pitch!) !== expectedBass.pc) {
    problems.push(`${at}: basul e ${letterName(pitchClass(bass.pitch!))}, nu ${spellLetter(expectedBass)}`)
  }

  // 3. Mâna.
  const pressed = strings.filter((entry) => entry.fret !== null && entry.fret > 0)
  const fingersUsed = new Set(pressed.map((entry) => entry.finger).filter((finger) => finger !== 'T'))
  if (fingersUsed.size > 4) problems.push(`${at}: cere ${fingersUsed.size} degete`)

  if (pressed.length) {
    const frets = pressed.map((entry) => entry.fret!)
    const span = Math.max(...frets) - Math.min(...frets) + 1
    const limit = shape.stretch ? MAX_SPAN_STRETCH : MAX_SPAN
    if (span > limit) problems.push(`${at}: deschidere de ${span} taste (maxim ${limit})`)
  }

  const fingerFret = new Map<string, number>()
  for (const entry of pressed) {
    if (entry.finger === 'T') continue
    const seen = fingerFret.get(entry.finger!)
    if (seen !== undefined && seen !== entry.fret) {
      problems.push(`${at}: degetul ${entry.finger} e pus pe tastele ${seen} și ${entry.fret}`)
    }
    fingerFret.set(entry.finger!, entry.fret!)
  }
  for (const a of pressed) {
    for (const b of pressed) {
      if (a.finger === 'T' || b.finger === 'T') continue
      if (a.fret! < b.fret! && Number(a.finger) > Number(b.finger)) {
        problems.push(
          `${at}: degetul ${a.finger} (tasta ${a.fret}) stă sub degetul ${b.finger} (tasta ${b.fret})`,
        )
      }
    }
  }

  if (shape.barre) {
    const { fret, from, to } = shape.barre
    if (from <= to) problems.push(`${at}: barré-ul merge de la coarda groasă la cea subțire (from > to)`)
    for (const entry of strings) {
      if (entry.string > from || entry.string < to) continue
      // O coardă amortizată sub barré e o formă reală (degetul culcat o atinge și o
      // amortizează, ca în C6 `8xa9a8`); o coardă GOALĂ sub barré e imposibilă.
      if (entry.fret !== null && entry.fret < fret) {
        problems.push(`${at}: barré pe tasta ${fret}, dar coarda ${entry.string} nu e apăsată acolo sau mai sus`)
      }
      if (entry.fret === fret && entry.finger !== '1') {
        problems.push(`${at}: pe barré, coarda ${entry.string} trebuie să aibă degetul 1`)
      }
    }
  }

  return problems
}

export function validateChordLevels(levels: readonly ChordLevel[]): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  for (const level of levels) {
    if (level.chords.length === 0) problems.push(`${level.id}: nivel fără acorduri`)
    for (const chord of level.chords) {
      if (ids.has(chord.id)) problems.push(`${chord.id}: id repetat`)
      ids.add(chord.id)
      problems.push(...validateChordShape(chord))
    }
  }
  return problems
}
