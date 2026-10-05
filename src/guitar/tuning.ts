/*
  Acordajul standard și ce notă iese dintr-o poziție.

  Datele de chitară se scriu în coordonate de instrument, coarda (1-6) și tasta
  (0-24); înălțimea nu se scrie niciodată, se calculează de aici. O notă scrisă
  de două ori, ca poziție și ca înălțime, ajunge să spună două lucruri diferite.

  Coarda 1 e Mi subțire, coarda 6 e Mi gros (vezi skill-ul `predare-chitara`,
  `references/terminologie.md`).
*/

/** Coardele goale, MIDI, de la coarda 1 la coarda 6. */
export const OPEN_STRINGS = [64, 59, 55, 50, 45, 40] as const

export type GuitarString = 1 | 2 | 3 | 4 | 5 | 6

/** Coardele în ordinea în care se scriu formele de acord: de la 6 la 1. */
export const STRINGS_LOW_TO_HIGH: readonly GuitarString[] = [6, 5, 4, 3, 2, 1]

/** Nota MIDI a unei poziții. */
export function pitchAt(string: GuitarString, fret: number): number {
  return OPEN_STRINGS[string - 1]! + fret
}

/** Clasa de înălțime, 0-11, 0 = Do. */
export const pitchClass = (pitch: number) => ((pitch % 12) + 12) % 12

/*
  Numele notelor. Literele sunt pentru desene și simboluri (ca rândul de bas de
  la tobe, `src/drums/bass.ts`); solfegiul e pentru proza românească.

  Diez sau bemol: pe desen, nota se scrie cum o cere acordul (Si♭ într-un Fa
  minor, nu La♯). De aici cele două tabele, alese de `preferFlats`.
*/
const SHARP_LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const
const FLAT_LETTERS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] as const
const SHARP_SOLFEGE = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'] as const
const FLAT_SOLFEGE = ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Sol♭', 'Sol', 'La♭', 'La', 'Si♭', 'Si'] as const

export function letterName(pc: number, preferFlats = false): string {
  return (preferFlats ? FLAT_LETTERS : SHARP_LETTERS)[pitchClass(pc)]!
}

export function solfegeName(pc: number, preferFlats = false): string {
  return (preferFlats ? FLAT_SOLFEGE : SHARP_SOLFEGE)[pitchClass(pc)]!
}
