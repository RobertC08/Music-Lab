import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { parseNote, spellLetter, spellSolfege, type ChordSpec, type SpelledNote } from './chords'
import { pitchClass } from './tuning'

/*
  Generatorul de acorduri: din tonică, tip și extensii, acordul complet.

  Ce iese de aici e teorie, nu chitară: simbolul (`C9`, `Cm7♭5`, `C6/9`),
  numele în ambele limbi, formula pe trepte (1 3 5 ♭7 9) și notele scrise
  corect. Formele de pe gât le caută `voicings.ts`, pe `spec`.

  Combinațiile care n-au sens (septimă mică și mare deodată, nonă mărită peste
  terța mică, extensii pe un power chord) nu se pot alege: `allowedExtensions`
  spune ce rămâne activ, iar `toggleExtension` scoate ce se exclude reciproc.
  Așa ecranul nu are nicio regulă de teorie în el.
*/

/**
 * Tipul de bază. `dominant` e majorul cu septimă mică (C7): pe slider are locul
 * lui, fiindcă „Major" + „7" nu se găsea și se confunda cu maj7. Intern se
 * rezolvă în `major` + `7` (`resolveBase`).
 */
export type ChordBase = 'major' | 'minor' | 'dominant' | 'sus2' | 'sus4' | 'dim' | 'aug' | 'power'

export type ChordExtension = '6' | '7' | 'maj7' | '9' | '11' | '13' | 'b5' | '#5' | 'b9' | '#9' | '#11'

export const CHORD_BASES: readonly ChordBase[] = ['major', 'minor', 'dominant', 'sus2', 'sus4', 'dim', 'aug', 'power']

/** Extensiile, în ordinea de pe ecran: întâi cele naturale, apoi alterațiile. */
export const NATURAL_EXTENSIONS: readonly ChordExtension[] = ['6', '7', 'maj7', '9', '11', '13']
export const ALTERED_EXTENSIONS: readonly ChordExtension[] = ['b5', '#5', 'b9', '#9', '#11']

/** Tonicile de ales, scrise cum apar cel mai des în caietele de acorduri. */
export const ROOT_CHOICES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const
export type RootChoice = (typeof ROOT_CHOICES)[number]

export interface ChordRecipe {
  root: RootChoice
  base: ChordBase
  extensions: readonly ChordExtension[]
}

export const BASE_NAMES: Record<ChordBase, LocalizedText> = {
  major: { ro: 'Major', en: 'Major' },
  minor: { ro: 'Minor', en: 'Minor' },
  dominant: { ro: 'Dominant (7)', en: 'Dominant (7)' },
  sus2: { ro: 'Sus2', en: 'Sus2' },
  sus4: { ro: 'Sus4', en: 'Sus4' },
  dim: { ro: 'Micșorat', en: 'Diminished' },
  aug: { ro: 'Mărit', en: 'Augmented' },
  power: { ro: 'Power chord', en: 'Power chord' },
}

/** Eticheta de pe butonul extensiei. */
export const EXTENSION_LABELS: Record<ChordExtension, string> = {
  '6': '6',
  '7': '7',
  maj7: 'maj7',
  '9': '9',
  '11': '11',
  '13': '13',
  b5: '♭5',
  '#5': '♯5',
  b9: '♭9',
  '#9': '♯9',
  '#11': '♯11',
}

const EXTENSION_NAMES: Record<ChordExtension, LocalizedText> = {
  '6': { ro: 'sextă', en: 'sixth' },
  '7': { ro: 'septimă mică', en: 'minor seventh' },
  maj7: { ro: 'septimă mare', en: 'major seventh' },
  '9': { ro: 'nonă', en: 'ninth' },
  '11': { ro: 'undecimă', en: 'eleventh' },
  '13': { ro: 'terțdecimă', en: 'thirteenth' },
  b5: { ro: 'cvintă micșorată', en: 'flat five' },
  '#5': { ro: 'cvintă mărită', en: 'sharp five' },
  b9: { ro: 'nonă micșorată', en: 'flat nine' },
  '#9': { ro: 'nonă mărită', en: 'sharp nine' },
  '#11': { ro: 'undecimă mărită', en: 'sharp eleven' },
}

const BASE_DESCRIPTIONS: Record<ChordBase, LocalizedText> = {
  major: { ro: 'major', en: 'major' },
  dominant: { ro: 'dominant', en: 'dominant seventh' },
  minor: { ro: 'minor', en: 'minor' },
  sus2: { ro: 'sus2', en: 'sus2' },
  sus4: { ro: 'sus4', en: 'sus4' },
  dim: { ro: 'micșorat', en: 'diminished' },
  aug: { ro: 'mărit', en: 'augmented' },
  power: { ro: 'power chord', en: 'power chord' },
}

// ---------------------------------------------------------------------------
// Ce se poate alege
// ---------------------------------------------------------------------------

/** Perechile care se exclud: alegi una, cealaltă se scoate. */
const EXCLUSIVE: [ChordExtension, ChordExtension][] = [
  ['7', 'maj7'],
  ['6', '7'],
  ['6', 'maj7'],
  ['9', 'b9'],
  ['9', '#9'],
  ['11', '#11'],
  ['b5', '#5'],
]

/** Ce e implicit în dominant și deci nu se mai alege separat. */
const DOMINANT_IMPLIED: readonly ChordExtension[] = ['7', 'maj7', '6']

/** `dominant` -> `major` + `7`; restul, neschimbate. */
export function resolveBase(
  base: ChordBase,
  extensions: readonly ChordExtension[],
): { base: Exclude<ChordBase, 'dominant'>; extensions: ChordExtension[] } {
  if (base !== 'dominant') return { base, extensions: [...extensions] }
  return { base: 'major', extensions: [...extensions.filter((item) => !DOMINANT_IMPLIED.includes(item)), '7'] }
}

/** Extensiile care au nevoie de o septimă ca să aibă un nume obișnuit. */
const NEED_SEVENTH: readonly ChordExtension[] = ['13', 'b9', '#9', '#11']

/**
 * Ce extensii au sens pe tipul ăsta, cu ce e deja ales.
 *
 * Regulile sunt ale numelor de acorduri, nu ale chitarei: un `C13` fără
 * septimă e de fapt `C6`, o nonă mărită peste o terță mică e chiar terța mică,
 * un acord micșorat cu septimă e `dim7`.
 */
export function allowedExtensions(base: ChordBase, selected: readonly ChordExtension[]): Set<ChordExtension> {
  if (base === 'dominant') {
    const allowed = allowedExtensions('major', resolveBase(base, selected).extensions)
    for (const item of DOMINANT_IMPLIED) allowed.delete(item)
    return allowed
  }
  const all = new Set<ChordExtension>([...NATURAL_EXTENSIONS, ...ALTERED_EXTENSIONS])
  const hasSeventh = selected.includes('7') || selected.includes('maj7')
  const drop = (...items: ChordExtension[]) => items.forEach((item) => all.delete(item))

  switch (base) {
    case 'power':
      return new Set()
    case 'dim':
      return new Set<ChordExtension>(['7'])
    case 'aug':
      drop('6', 'b5', '#5', '13', '11', '#11')
      break
    case 'minor':
      drop('#9', '#5')
      if (!selected.includes('7')) drop('b5')
      break
    case 'sus2':
      drop('9', 'b9', '#9', '#11', 'b5', '#5')
      break
    case 'sus4':
      drop('11', '#11', '#9', 'b5', '#5')
      break
    case 'major':
      drop('#5')
      break
  }
  if (!hasSeventh) for (const item of NEED_SEVENTH) all.delete(item)
  return all
}

/**
 * Apasă pe o extensie: o adaugă (scoțând ce se exclude cu ea) sau o scoate.
 * La final rămân doar extensiile permise, ca o septimă scoasă să ia cu ea
 * nona mărită care depindea de ea.
 */
export function toggleExtension(
  base: ChordBase,
  selected: readonly ChordExtension[],
  extension: ChordExtension,
): ChordExtension[] {
  let next: ChordExtension[]
  if (selected.includes(extension)) {
    next = selected.filter((item) => item !== extension)
  } else {
    const excluded = new Set(
      EXCLUSIVE.flatMap(([a, b]) => (a === extension ? [b] : b === extension ? [a] : [])),
    )
    next = [...selected.filter((item) => !excluded.has(item)), extension]
  }
  return normalizeExtensions(base, next)
}

/** Scoate, repetat, ce nu mai e permis (o eliminare poate dezactiva altceva). */
export function normalizeExtensions(base: ChordBase, selected: readonly ChordExtension[]): ChordExtension[] {
  let current = base === 'dominant' ? selected.filter((item) => !DOMINANT_IMPLIED.includes(item)) : [...selected]
  for (;;) {
    const allowed = allowedExtensions(base, current)
    const next = current.filter((item) => allowed.has(item))
    if (next.length === current.length) return next
    current = next
  }
}

// ---------------------------------------------------------------------------
// Acordul
// ---------------------------------------------------------------------------

/** O treaptă: semitonuri peste tonică, litere (pentru scris) și eticheta din formulă. */
interface Degree {
  semitones: number
  letters: number
  label: string
  /** Peste octavă (9, 11, 13): în formulă vine după septimă. */
  compound?: boolean
}

const D = {
  root: { semitones: 0, letters: 0, label: '1' },
  b9: { semitones: 1, letters: 1, label: '♭9', compound: true },
  second: { semitones: 2, letters: 1, label: '2' },
  ninth: { semitones: 2, letters: 1, label: '9', compound: true },
  // Ca în bibliotecă (Mi7♯9 cu Sol): nona mărită scrisă ca terță mică.
  sharp9: { semitones: 3, letters: 2, label: '♯9', compound: true },
  minorThird: { semitones: 3, letters: 2, label: '♭3' },
  majorThird: { semitones: 4, letters: 2, label: '3' },
  fourth: { semitones: 5, letters: 3, label: '4' },
  eleventh: { semitones: 5, letters: 3, label: '11', compound: true },
  sharp11: { semitones: 6, letters: 3, label: '♯11', compound: true },
  flatFifth: { semitones: 6, letters: 4, label: '♭5' },
  fifth: { semitones: 7, letters: 4, label: '5' },
  sharpFifth: { semitones: 8, letters: 4, label: '♯5' },
  sixth: { semitones: 9, letters: 5, label: '6' },
  thirteenth: { semitones: 9, letters: 5, label: '13', compound: true },
  dimSeventh: { semitones: 9, letters: 6, label: '𝄫7' },
  minorSeventh: { semitones: 10, letters: 6, label: '♭7' },
  majorSeventh: { semitones: 11, letters: 6, label: '7' },
} satisfies Record<string, Degree>

export interface BuiltTone {
  label: string
  note: string
  noteRo: string
  pc: number
  /** Se poate omite pe chitară fără ca acordul să-și schimbe numele. */
  optional: boolean
}

export interface BuiltChord {
  /** Simbolul de pe ecran, cu ♯ și ♭: `C♯m7♭5`. */
  symbol: string
  name: LocalizedText
  /** Treptele, în ordine: 1 ♭3 5 ♭7 9. */
  tones: BuiltTone[]
  spec: ChordSpec
}

export function buildChord(input: ChordRecipe): BuiltChord {
  const resolved = resolveBase(input.base, input.extensions)
  const recipe = { root: input.root, base: resolved.base, extensions: resolved.extensions }
  const root = parseNote(recipe.root)!
  const extensions = new Set(normalizeExtensions(recipe.base, recipe.extensions))
  const has = (item: ChordExtension) => extensions.has(item)
  const seventh = has('7') || has('maj7')

  const degrees: (Degree & { optional: boolean })[] = []
  const add = (degree: Degree, optional = false) => degrees.push({ ...degree, optional })

  add(D.root)
  // Terța, sau ce o înlocuiește.
  if (recipe.base === 'minor' || recipe.base === 'dim') add(D.minorThird)
  else if (recipe.base === 'sus2') add(D.second)
  else if (recipe.base === 'sus4') add(D.fourth)
  else if (recipe.base !== 'power') add(D.majorThird)
  // Cvinta: obligatorie doar când e alterată sau e toată ideea acordului.
  if (recipe.base === 'dim' || has('b5')) add(D.flatFifth)
  else if (recipe.base === 'aug' || has('#5')) add(D.sharpFifth)
  else add(D.fifth, recipe.base !== 'power')
  if (has('6')) add(D.sixth)
  if (recipe.base === 'dim' && has('7')) add(D.dimSeventh)
  else if (has('7')) add(D.minorSeventh)
  else if (has('maj7')) add(D.majorSeventh)
  if (has('b9')) add(D.b9)
  if (has('9')) add(D.ninth)
  // Nona e subînțeleasă într-un 11 sau 13 cu septimă, dar se poate lăsa afară.
  else if (seventh && (has('11') || has('13')) && !has('b9') && !has('#9')) add(D.ninth, true)
  if (has('#9')) add(D.sharp9)
  if (has('11')) add(D.eleventh)
  if (has('#11')) add(D.sharp11)
  if (has('13')) add(D.thirteenth)

  const ordered = [...degrees].sort(
    (a, b) => (a.compound ? 7 : 0) + a.letters - ((b.compound ? 7 : 0) + b.letters) || a.semitones - b.semitones,
  )
  const tones = ordered.map((degree): BuiltTone => {
    const note: SpelledNote = {
      letter: (root.letter + degree.letters) % 7,
      pc: pitchClass(root.pc + degree.semitones),
    }
    return {
      label: degree.label,
      note: spellLetter(note),
      noteRo: spellSolfege(note),
      pc: note.pc,
      optional: degree.optional,
    }
  })

  return {
    symbol: symbolOf(recipe.root, recipe.base, extensions),
    name: nameOf(root, recipe.base, extensions),
    tones,
    spec: {
      root,
      tones: tones.map((tone) => ({ pc: tone.pc, spelled: tone.note, optional: tone.optional })),
    },
  }
}

/** Simbolul, după convențiile din caietele de acorduri. */
function symbolOf(rootChoice: RootChoice, base: ChordBase, extensions: Set<ChordExtension>): string {
  const has = (item: ChordExtension) => extensions.has(item)
  const root = rootChoice.replace('#', '♯').replace('b', '♭')
  if (base === 'power') return `${root}5`
  if (base === 'dim') return `${root}${has('7') ? 'dim7' : 'dim'}`

  const minor = base === 'minor' ? 'm' : ''
  const sus = base === 'sus2' ? 'sus2' : base === 'sus4' ? 'sus4' : ''
  const alterations: string[] = []
  if (has('b5')) alterations.push('♭5')
  if (has('#5') || (base === 'aug' && (has('7') || has('maj7')))) alterations.push('♯5')
  if (has('b9')) alterations.push('♭9')
  if (has('#9')) alterations.push('♯9')
  if (has('#11')) alterations.push('♯11')

  let head: string
  if (has('7') || has('maj7')) {
    const top = has('13') ? '13' : has('11') ? '11' : has('9') ? '9' : '7'
    if (has('maj7')) head = minor ? `m(maj${top})` : `maj${top}`
    else head = `${minor}${top}`
  } else if (has('6')) {
    head = `${minor}6${has('9') ? '/9' : ''}${has('11') ? 'add11' : ''}`
  } else {
    const adds = [has('9') ? 'add9' : '', has('11') ? 'add11' : ''].filter(Boolean).join('')
    head = `${minor}${adds}`
  }

  if (base === 'aug' && !has('7') && !has('maj7')) return `${root}aug${head.replace(/^m/, '')}`
  const tail = alterations.join('')
  // O alterație pe un trison simplu se scrie în paranteză: C(♭5).
  const altered = tail && head === minor ? `(${tail})` : tail
  return `${root}${head}${sus}${altered}`
}

function joinNames(parts: string[], and: string): string {
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} ${and} ${parts[parts.length - 1]}`
}

/** „Do minor, cu septimă mică și nonă". */
function nameOf(root: SpelledNote, base: ChordBase, extensions: Set<ChordExtension>): LocalizedText {
  const order: ChordExtension[] = ['6', '7', 'maj7', 'b5', '#5', 'b9', '9', '#9', '11', '#11', '13']
  // Major cu septimă mică e acordul dominant: „Do dominant, cu nonă", nu „Do major, cu septimă mică și nonă".
  const dominant = base === 'major' && extensions.has('7')
  const named: ChordBase = dominant ? 'dominant' : base
  const chosen = order.filter((item) => extensions.has(item) && !(dominant && item === '7'))
  const describe = (language: 'ro' | 'en') => {
    const names = chosen.map((item) =>
      base === 'dim' && item === '7'
        ? language === 'ro'
          ? 'septimă micșorată'
          : 'diminished seventh'
        : EXTENSION_NAMES[item][language],
    )
    const head =
      language === 'ro'
        ? `${spellSolfege(root)} ${BASE_DESCRIPTIONS[named].ro}`
        : `${spellLetter(root)} ${BASE_DESCRIPTIONS[named].en}`
    if (!names.length) return head
    return language === 'ro'
      ? `${head}, cu ${joinNames(names, 'și')}`
      : `${head}, with ${joinNames(names, 'and')}`
  }
  return { ro: describe('ro'), en: describe('en') }
}

// ---------------------------------------------------------------------------
// Variantele pentru slidere
// ---------------------------------------------------------------------------

/*
  Pe ecran, extensiile și alterațiile se aleg cu câte un slider, deci câte o
  singură valoare: variante gata combinate, în ordinea în care se învață. Pe
  slider apar doar variantele care au sens pentru tipul (și extensiile) alese,
  după aceleași reguli ca la alegerea una câte una.
*/

export interface ExtensionPreset {
  id: string
  /** Eticheta de pe slider. */
  label: string
  extensions: readonly ChordExtension[]
}

export const EXTENSION_PRESETS: readonly ExtensionPreset[] = [
  { id: 'none', label: '—', extensions: [] },
  { id: '6', label: '6', extensions: ['6'] },
  { id: '6/9', label: '6/9', extensions: ['6', '9'] },
  { id: 'add9', label: 'add9', extensions: ['9'] },
  { id: 'add11', label: 'add11', extensions: ['11'] },
  { id: '7', label: '7', extensions: ['7'] },
  { id: '9', label: '9', extensions: ['7', '9'] },
  { id: '11', label: '11', extensions: ['7', '11'] },
  { id: '13', label: '13', extensions: ['7', '13'] },
  { id: 'maj7', label: 'maj7', extensions: ['maj7'] },
  { id: 'maj9', label: 'maj9', extensions: ['maj7', '9'] },
  { id: 'maj13', label: 'maj13', extensions: ['maj7', '13'] },
]

export const ALTERATION_PRESETS: readonly ExtensionPreset[] = [
  { id: 'none', label: '—', extensions: [] },
  { id: 'b5', label: '♭5', extensions: ['b5'] },
  { id: '#5', label: '♯5', extensions: ['#5'] },
  { id: 'b9', label: '♭9', extensions: ['b9'] },
  { id: '#9', label: '♯9', extensions: ['#9'] },
  { id: '#11', label: '♯11', extensions: ['#11'] },
  { id: 'b5b9', label: '♭5♭9', extensions: ['b5', 'b9'] },
  { id: '#5#9', label: '♯5♯9', extensions: ['#5', '#9'] },
  { id: 'b9#9', label: '♭9♯9', extensions: ['b9', '#9'] },
]

/** O combinație e validă dacă nimic din ea nu se exclude și totul e permis pe tipul ăsta. */
export function isValidCombination(base: ChordBase, extensions: readonly ChordExtension[]): boolean {
  if (base === 'dominant') {
    if (extensions.some((item) => DOMINANT_IMPLIED.includes(item))) return false
    return isValidCombination('major', resolveBase(base, extensions).extensions)
  }
  if (EXCLUSIVE.some(([a, b]) => extensions.includes(a) && extensions.includes(b))) return false
  return normalizeExtensions(base, extensions).length === extensions.length
}

/** Variantele de extensii care au sens pe tipul ăsta. „—" e mereu acolo. */
/** Extensiile peste dominant: septima e deja acolo. */
export const DOMINANT_PRESETS: readonly ExtensionPreset[] = [
  { id: 'none', label: '—', extensions: [] },
  { id: 'dom9', label: '9', extensions: ['9'] },
  { id: 'dom11', label: '11', extensions: ['11'] },
  { id: 'dom13', label: '13', extensions: ['13'] },
]

/**
 * Variantele de extensii care au sens pe tipul ăsta. „—" e mereu acolo.
 * Pe Major nu mai apar cele cu septimă mică (7, 9, 11, 13): ele sunt pe
 * Dominant, ca același acord să nu fie în două locuri.
 */
export function extensionPresetsFor(base: ChordBase): ExtensionPreset[] {
  if (base === 'dominant') return DOMINANT_PRESETS.filter((preset) => isValidCombination(base, preset.extensions))
  return EXTENSION_PRESETS.filter(
    (preset) => isValidCombination(base, preset.extensions) && !(base === 'major' && preset.extensions.includes('7')),
  )
}

/** Variantele de alterații care se pot pune peste tipul și extensiile alese. */
export function alterationPresetsFor(base: ChordBase, extensions: readonly ChordExtension[]): ExtensionPreset[] {
  return ALTERATION_PRESETS.filter((preset) => isValidCombination(base, [...extensions, ...preset.extensions]))
}
