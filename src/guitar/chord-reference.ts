import { resolveBase, type ChordBase, type ChordExtension, type RootChoice } from './chord-builder'
import { decodeFret, type Barre, type ChordShape } from './chords'
import reference from './data/chords-db.json'
import type { GuitarString } from './tuning'

/*
  Dicționarul de acorduri: pozițiile pe care le folosesc chitariștii.

  Sursa e chords-db (David Rubert, licență MIT, github.com/tombatossals/chords-db;
  licența e în `data/CHORDS-DB-LICENSE`), convertită de
  `scripts/build-chords-db.py`: 3270 de poziții, pe 12 tonici și 70 de tipuri.

  De ce: generatorul căuta formele singur (`voicings.ts`), iar unele ieșeau
  corecte ca note, dar ciudate de cântat, forme pe care nu le folosește
  nimeni. Acum generatorul arată întâi pozițiile din dicționar și caută singur
  doar ce dicționarul nu are, marcat ca atare pe ecran.

  Pozițiile din dicționar trec oricum prin `validateChordShape` (notele
  acordului, mâna care poate), cu inversiunile permise: în dicționar, un Do
  major cu Sol în bas, pe tasta 5, e o formă obișnuită.
*/

type Entry = [frets: string, fingers: string, barreFret: number]
// JSON-ul e generat de script și verificat de teste; TypeScript îl vede ca tablouri generice.
const chords = (reference as unknown as { chords: Record<string, Record<string, Entry[]>> }).chords

/**
 * Tipul din dicționar pentru o combinație din generator, sau `null` dacă
 * dicționarul n-o are. Cheia: tipul de bază și extensiile, sortate.
 */
const SUFFIXES: Record<string, string> = {
  'power|': '5',
  'dim|': 'dim',
  'dim|7': 'dim7',
  'aug|': 'aug',
  'aug|7': 'aug7',
  'aug|7,9': 'aug9',
  'aug|maj7': 'maj7#5',
  'sus2|': 'sus2',
  'sus2|maj7': 'maj7sus2',
  'sus4|': 'sus4',
  'sus4|7': '7sus4',
  'major|': 'major',
  'major|6': '6',
  'major|6,9': '69',
  'major|9': 'add9',
  'major|11': 'add11',
  'major|7': '7',
  'major|7,b5': '7b5',
  'major|7,9': '9',
  'major|7,9,b5': '9b5',
  'major|7,b9': '7b9',
  'major|#9,7': '7#9',
  'major|11,7': '11',
  'major|#11,7,9': '9#11',
  'major|13,7': '13',
  'major|maj7': 'maj7',
  'major|b5,maj7': 'maj7b5',
  'major|9,maj7': 'maj9',
  'major|11,maj7': 'maj11',
  'major|13,maj7': 'maj13',
  'minor|': 'minor',
  'minor|6': 'm6',
  'minor|6,9': 'm69',
  'minor|9': 'madd9',
  'minor|7': 'm7',
  'minor|7,b5': 'm7b5',
  'minor|7,9': 'm9',
  'minor|11,7': 'm11',
  'minor|maj7': 'mmaj7',
  'minor|b5,maj7': 'mmaj7b5',
  'minor|9,maj7': 'mmaj9',
  'minor|11,maj7': 'mmaj11',
}

/** Cheile tabelului, pentru teste: fiecare trebuie să fie în forma sortată pe care o caută `referenceSuffix`. */
export const referenceSuffixKeys = () => Object.keys(SUFFIXES)

export function referenceSuffix(base: ChordBase, extensions: readonly ChordExtension[]): string | null {
  const resolved = resolveBase(base, extensions)
  return SUFFIXES[`${resolved.base}|${[...resolved.extensions].sort().join(',')}`] ?? null
}

/** Barré-ul unei poziții: coardele apăsate cu degetul 1 pe tasta barré-ului. */
function barreOf(frets: string, fingers: string, barreFret: number): Barre | undefined {
  if (!barreFret) return undefined
  const strings: GuitarString[] = []
  for (let index = 0; index < 6; index += 1) {
    const char = frets[index]!
    if (char !== 'x' && decodeFret(char) === barreFret && fingers[index] === '1') strings.push((6 - index) as GuitarString)
  }
  if (strings.length < 2) return undefined
  return { fret: barreFret, from: Math.max(...strings) as GuitarString, to: Math.min(...strings) as GuitarString }
}

/** Pozițiile din dicționar, ca forme de acord, în ordinea din dicționar (de jos în sus pe gât). */
export function referenceShapes(root: RootChoice, suffix: string, symbol: string): ChordShape[] {
  const entries = chords[root]?.[suffix] ?? []
  return entries.map(([frets, fingers, barreFret]) => ({
    id: `ref-${root}-${suffix}-${frets}`,
    symbol,
    frets,
    fingers,
    barre: barreOf(frets, fingers, barreFret),
  }))
}

/** Toate tonicile și tipurile din dicționar (pentru teste). */
export const referenceIndex = () =>
  Object.entries(chords).flatMap(([root, bySuffix]) => Object.keys(bySuffix).map((suffix) => ({ root, suffix })))
