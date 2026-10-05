import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { letterName, pitchClass } from './tuning'

/*
  Gamele și arpegiile, ca date: un set de note = intervale + cum se așază pe gât.

  Nimic nu se scrie pe tonalitate. O gamă e o listă de intervale față de tonică;
  notele unei tonalități se calculează (`noteSetNotes`), pozițiile pe gât tot
  (`positions.ts`). O gamă nouă e o intrare nouă aici, nu cod nou. Arpegiile
  folosesc exact același tip (`family: 'arpeggio'`), deci același grif, aceleași
  exerciții și aceeași pistă audio.

  Aici e practică, nu teorie: ce e o gamă și de unde vine stă în manual.
*/

export type NoteSetFamily = 'scale' | 'arpeggio'

/**
 * Cum se formează pozițiile pe gât.
 *
 * - `boxes`: cele cinci poziții standard. Scheletul e o pentatonică (`core`),
 *   două note pe coardă, pornind pe coarda 6 de la fiecare treaptă a ei; restul
 *   notelor gamei se adaugă în aceeași fereastră de taste (vezi `positions.ts`).
 *   Așa ies și cutiile pentatonicii, și pozițiile CAGED ale gamei majore și
 *   minore, și blues-ul (pentatonica + ♭5).
 * - `chromatic`: o singură poziție, mobilă, toate notele dintr-o fereastră.
 */
export type PositionRecipe = { kind: 'boxes'; core: readonly number[] } | { kind: 'chromatic' }

export interface NoteSet {
  id: string
  family: NoteSetFamily
  /** Numele fără tonică: „minor pentatonic", „minor pentatonic". */
  name: LocalizedText
  /** Semitonuri față de tonică, crescător, începând cu 0. */
  intervals: readonly number[]
  /** Treapta fiecărui interval, în aceeași ordine: '1', '♭3', '5'... */
  degrees: readonly string[]
  /** Pentru scrierea notelor: o gamă minoră se scrie ca relativa ei majoră. */
  minor: boolean
  positions: PositionRecipe
  /** Pentru mai târziu: seturile înrudite (gamă -> arpegiile ei), după `id`. */
  related?: readonly string[]
}

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9] as const
const MINOR_PENTATONIC = [0, 3, 5, 7, 10] as const

export const scaleSets: readonly NoteSet[] = [
  {
    id: 'minorPentatonic',
    family: 'scale',
    name: { ro: 'minor pentatonic', en: 'minor pentatonic' },
    intervals: MINOR_PENTATONIC,
    degrees: ['1', '♭3', '4', '5', '♭7'],
    minor: true,
    positions: { kind: 'boxes', core: MINOR_PENTATONIC },
  },
  {
    id: 'majorPentatonic',
    family: 'scale',
    name: { ro: 'major pentatonic', en: 'major pentatonic' },
    intervals: MAJOR_PENTATONIC,
    degrees: ['1', '2', '3', '5', '6'],
    minor: false,
    positions: { kind: 'boxes', core: MAJOR_PENTATONIC },
  },
  {
    id: 'major',
    family: 'scale',
    name: { ro: 'major', en: 'major' },
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    minor: false,
    positions: { kind: 'boxes', core: MAJOR_PENTATONIC },
  },
  {
    id: 'naturalMinor',
    family: 'scale',
    name: { ro: 'minor natural', en: 'natural minor' },
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    minor: true,
    positions: { kind: 'boxes', core: MINOR_PENTATONIC },
  },
  {
    id: 'blues',
    family: 'scale',
    name: { ro: 'blues', en: 'blues' },
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', '♭3', '4', '♭5', '5', '♭7'],
    minor: true,
    positions: { kind: 'boxes', core: MINOR_PENTATONIC },
  },
  {
    id: 'chromatic',
    family: 'scale',
    name: { ro: 'cromatic', en: 'chromatic' },
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    degrees: ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'],
    minor: false,
    positions: { kind: 'chromatic' },
  },
]

export const noteSetById = (id: string) => scaleSets.find((set) => set.id === id)

/*
  Scrierea notelor, după treaptă, ca în manuale: fiecare treaptă își păstrează
  litera. A treia notă din Re minor e Fa (treapta ♭3 pe litera a treia de la
  Re), nu Mi♯; ♭5 din blues-ul în Mi e Si♭ (litera cvintei, coborâtă), nu La♯.
  Tonica vine din selector, scrisă cum se folosește: Re♭ major, dar Do♯ minor.
*/

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const
const NATURAL = [0, 2, 4, 5, 7, 9, 11] as const

export interface SpelledKey {
  pc: number
  /** Indicele literei: 0 = C ... 6 = B. */
  letter: number
  /** -1 bemol, 0 becar, 1 diez. */
  accidental: number
}

const spell = (letter: number, accidental: number): SpelledKey => ({
  pc: pitchClass(NATURAL[letter]! + accidental),
  letter,
  accidental,
})

/** Tonalitățile majore: scrierea cu cele mai puține alterații (Re♭, nu Do♯; Fa♯ pentru 6 alterații). */
const MAJOR_KEYS: readonly SpelledKey[] = [
  spell(0, 0), spell(1, -1), spell(1, 0), spell(2, -1), spell(2, 0), spell(3, 0),
  spell(3, 1), spell(4, 0), spell(5, -1), spell(5, 0), spell(6, -1), spell(6, 0),
]
/** Tonalitățile minore: Do♯, Sol♯ minor (nu Re♭, La♭ minor); Mi♭ pentru 6 alterații. */
const MINOR_KEYS: readonly SpelledKey[] = [
  spell(0, 0), spell(0, 1), spell(1, 0), spell(2, -1), spell(2, 0), spell(3, 0),
  spell(3, 1), spell(4, 0), spell(4, 1), spell(5, 0), spell(6, -1), spell(6, 0),
]

/** Cele 12 tonalități ale unui set, în ordinea clasei de înălțime (0 = Do). */
export const keysFor = (set: NoteSet) => (set.minor ? MINOR_KEYS : MAJOR_KEYS)
/** Clasele de înălțime ale tonicilor, pentru teste și iterații. */
export const KEYS: readonly { pc: number }[] = MAJOR_KEYS

const accidentalText = (accidental: number) => (accidental < 0 ? '♭'.repeat(-accidental) : '♯'.repeat(accidental))

export const keyLabel = (key: SpelledKey) => `${LETTERS[key.letter]}${accidentalText(key.accidental)}`

const tonicOf = (set: NoteSet, root: number) => keysFor(set)[pitchClass(root)]!

/** Numele notei (literă), cum se scrie în gama asta: după treapta ei. */
export function noteLetter(set: NoteSet, root: number, pc: number): string {
  const tonic = tonicOf(set, root)
  const degree = degreeOf(set, root, pc)
  if (degree) {
    const letter = (tonic.letter + Number(degree.replace(/[♭♯]/g, '')) - 1) % 7
    let accidental = pitchClass(pc - NATURAL[letter]!)
    if (accidental > 6) accidental -= 12
    // Dublu bemol sau dublu diez (♭5 în Mi♭ ar fi Si𝄫): pe desen, nota enarmonică simplă.
    if (Math.abs(accidental) <= 1) return `${LETTERS[letter]}${accidentalText(accidental)}`
  }
  return letterName(pc, tonic.accidental < 0)
}

/** Notele gamei pe o octavă, cu tonica repetată sus: C D E F G A B C. */
export function noteSetLetters(set: NoteSet, root: number): string[] {
  return [...set.intervals, 12].map((interval) => noteLetter(set, root, root + interval))
}

/** Treapta unei clase de înălțime în set, sau `undefined` dacă nota nu e în set. */
export function degreeOf(set: NoteSet, root: number, pc: number): string | undefined {
  const index = set.intervals.indexOf(pitchClass(pc - root))
  return index < 0 ? undefined : set.degrees[index]
}

/** Numele întreg: „La minor pentatonic" (ro, solfegiu), „A minor pentatonic" (en). */
export function noteSetTitle(set: NoteSet, root: number, language: 'ro' | 'en') {
  const tonic = tonicOf(set, root)
  const name = (language === 'ro' ? SOLFEGE : LETTERS)[tonic.letter]
  return `${name}${accidentalText(tonic.accidental)} ${set.name[language]}`
}
