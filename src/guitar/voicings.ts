import {
  alterationPresetsFor,
  buildChord,
  CHORD_BASES,
  extensionPresetsFor,
  type ChordBase,
  type ChordExtension,
  type ChordRecipe,
  type ExtensionPreset,
  type RootChoice,
} from './chord-builder'
import { chordLevels } from './chord-library'
import { referenceShapes, referenceSuffix } from './chord-reference'
import { analyzeChord, decodeFret, parseSymbol, validateChordShape, type ChordShape, type ChordSpec } from './chords'
import type { GuitarString } from './tuning'

/*
  Formele unui acord din generator: DOAR din dicționarul de acorduri.

  O versiune anterioară căuta singură forme pe gât pentru combinațiile pe care
  dicționarul nu le are; ieșeau corecte ca note, dar unele erau forme pe care
  nu le folosește nimeni. Decizia (Robert, 2026-10-05): generatorul păstrează
  doar combinațiile care există în dicționar, cu pozițiile de acolo. Ce nu are
  forme în dicționar nici nu se poate alege (`availableExtensions`,
  `availableAlterations`).

  Pozițiile trec oricum prin `validateChordShape` (dicționarul are câteva
  greșeli), cu inversiunile permise. Când o poziție e chiar forma din
  bibliotecă, se ia digitația scrisă de mână de acolo.
*/

export interface Voicing {
  shape: ChordShape
  /** Coarda din bas. */
  bassString: GuitarString
  /** Nota din bas, dacă nu e tonica (inversiune). */
  bassNote?: string
  /** Cea mai joasă tastă apăsată, 0 dacă sunt doar coarde goale. */
  position: number
  /** Forma e și în biblioteca aplicației (digitația vine de acolo). */
  fromLibrary: boolean
}

const libraryShapes = chordLevels.flatMap((level) => level.chords)

function sameChord(shape: ChordShape, spec: ChordSpec) {
  const parsed = parseSymbol(shape.symbol)
  if (!parsed || parsed.root.pc !== spec.root.pc) return false
  const a = new Set(parsed.tones.map((tone) => tone.pc))
  const b = new Set(spec.tones.map((tone) => tone.pc))
  return a.size === b.size && [...a].every((pc) => b.has(pc))
}

/** Pozițiile din dicționar care trec verificarea, de jos în sus pe gât. */
export function chordVoicings(recipe: ChordRecipe, spec: ChordSpec, symbol: string): Voicing[] {
  const suffix = referenceSuffix(recipe.base, recipe.extensions)
  if (!suffix) return []
  const out: Voicing[] = []
  for (const candidate of referenceShapes(recipe.root, suffix, symbol)) {
    const library = libraryShapes.find((shape) => shape.frets === candidate.frets && sameChord(shape, spec))
    const shape: ChordShape = library
      ? { ...candidate, fingers: library.fingers, barre: library.barre, tip: library.tip }
      : candidate
    if (validateChordShape(shape, spec, { inversions: true }).length) continue
    const bass = analyzeChord(shape, spec).strings.find((entry) => entry.pitch !== null)!
    const pressed = [...shape.frets].filter((char) => char !== 'x' && char !== '0').map(decodeFret)
    out.push({
      shape,
      bassString: bass.string,
      bassNote: bass.isRoot ? undefined : bass.note ?? undefined,
      position: pressed.length ? Math.min(...pressed) : 0,
      fromLibrary: !!library,
    })
  }
  return out
}

/*
  Ce se poate alege: o combinație e pe slider doar dacă dicționarul are măcar o
  formă validă pentru ea, pe tonica aleasă. Rezultatul se ține minte: sliderele
  întreabă de zeci de ori pe redesenare.
*/
const availability = new Map<string, boolean>()

export function hasVoicings(root: RootChoice, base: ChordBase, extensions: readonly ChordExtension[]): boolean {
  const key = `${root}|${base}|${[...extensions].sort().join(',')}`
  const cached = availability.get(key)
  if (cached !== undefined) return cached
  const built = buildChord({ root, base, extensions })
  const found = chordVoicings({ root, base, extensions }, built.spec, built.symbol).length > 0
  availability.set(key, found)
  return found
}

/** Tipurile de bază care au forme în dicționar pe tonica asta. */
export function availableBases(root: RootChoice): ChordBase[] {
  return CHORD_BASES.filter((base) => hasVoicings(root, base, []))
}

/** Extensiile (fără alterații) care au forme în dicționar. */
export function availableExtensions(root: RootChoice, base: ChordBase): ExtensionPreset[] {
  return extensionPresetsFor(base).filter((preset) => hasVoicings(root, base, preset.extensions))
}

/** Alterațiile care, puse peste extensia aleasă, au forme în dicționar. „—" e primul, dacă există. */
export function availableAlterations(
  root: RootChoice,
  base: ChordBase,
  extensions: readonly ChordExtension[],
): ExtensionPreset[] {
  return alterationPresetsFor(base, extensions).filter((preset) =>
    hasVoicings(root, base, [...extensions, ...preset.extensions]),
  )
}
