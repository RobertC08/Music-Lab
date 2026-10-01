import { unlockedIn } from './catalogue'
import type { Bar, DrumExercise, Vocabulary } from './exercise'
import { snareBar } from './snare-bar'

/*
  Rudimentele, ca date. Niciun import din UI, niciun audio.

  Ordinea listei e ordinea în care se învață, iar `requires` o face obligatorie:
  un rudiment se deschide când cele de care depinde au fost duse la capăt măcar o
  dată. Nu există nivel numeric și nu există scor, aplicația nu poate verifica ce
  ai bătut pe padul tău, deci nu se preface că o face (PLAN-TOBE.md §5).

  Intervalele de tempo nu sunt decorative: `tempo.max` e valoarea la care testele
  verifică dacă rudimentul rămâne fizic posibil (90 ms între loviturile aceleiași
  mâini). Un interval întins prea sus n-ar da nicio eroare la compilare, dar ar
  cere un tremolo.
*/

/** Ce are voie să folosească un rudiment. Toate se bat pe toba mică. */
export const rudimentVocabulary: Vocabulary = {
  pieces: ['snare'],
  hits: ['ghost', 'normal', 'accent'],
  // Pătrimi, optimi, triolete, șaisprezecimi. Nimic mai mărunt: peste atât,
  // rudimentul nu se mai citește de pe ecran, iar ochiul nu ține pasul.
  stepsPerBeat: [1, 2, 3, 4],
}

interface RudimentSource {
  id: string
  /** Cheile de traducere; textul stă în `lib/i18n`, nu aici. */
  titleKey: string
  howToKey: string
  stepsPerBar: number
  bars: Bar[]
  tempo: { min: number; max: number; suggested: number }
  requires?: string[]
}

/*
  Cele zece rudimente, în ordinea în care se învață.

  `tempo.max` e alegerea cu cele mai multe consecințe din fișier, și nu e luată
  din limita fizică, ci din ce e util: un rudiment exersat mai repede decât poate
  fi controlat se învață greșit. De aceea maximele scad pe măsură ce figura se
  îndesește, deși regula de 90 ms ar permite mult mai mult.
*/
const sources: RudimentSource[] = [
  {
    id: 'single-stroke-roll',
    titleKey: 'drums.rud_single_stroke',
    howToKey: 'drums.rud_single_stroke_how',
    stepsPerBar: 8,
    bars: [snareBar('RLRLRLRL')],
    tempo: { min: 50, max: 160, suggested: 80 },
  },
  {
    id: 'double-stroke-roll',
    titleKey: 'drums.rud_double_stroke',
    howToKey: 'drums.rud_double_stroke_how',
    stepsPerBar: 8,
    bars: [snareBar('RRLLRRLL')],
    tempo: { min: 50, max: 140, suggested: 72 },
    requires: ['single-stroke-roll'],
  },
  {
    id: 'single-stroke-triplets',
    titleKey: 'drums.rud_triplets',
    howToKey: 'drums.rud_triplets_how',
    stepsPerBar: 12,
    /*
      O singură măsură e de ajuns: cu trei lovituri pe timp și mâinile alternând,
      fiecare timp începe de la sine cu cealaltă mână (R L R | L R L | …), iar
      bucla se închide curat, ultima lovitură e L, prima e R. O a doua măsură
      „cu stânga în față” ar pune două L unul lângă altul peste bară și ar rupe
      exact alternanța pentru care se exersează figura.
    */
    bars: [snareBar('RLRLRLRLRLRL')],
    tempo: { min: 45, max: 120, suggested: 66 },
    requires: ['single-stroke-roll'],
  },
  {
    id: 'single-stroke-sixteenths',
    titleKey: 'drums.rud_single_sixteenths',
    howToKey: 'drums.rud_single_sixteenths_how',
    stepsPerBar: 16,
    bars: [snareBar('RLRLRLRLRLRLRLRL', { accents: 'x...x...x...x...' })],
    tempo: { min: 50, max: 120, suggested: 70 },
    requires: ['single-stroke-roll'],
  },
  {
    id: 'double-stroke-sixteenths',
    titleKey: 'drums.rud_double_sixteenths',
    howToKey: 'drums.rud_double_sixteenths_how',
    stepsPerBar: 16,
    bars: [snareBar('RRLLRRLLRRLLRRLL', { accents: 'x...x...x...x...' })],
    tempo: { min: 45, max: 110, suggested: 62 },
    requires: ['double-stroke-roll', 'single-stroke-sixteenths'],
  },
  {
    id: 'paradiddle',
    titleKey: 'drums.rud_paradiddle',
    howToKey: 'drums.rud_paradiddle_how',
    stepsPerBar: 16,
    // Accentul pe prima lovitură a fiecărui grup: fără el, paradiddle-ul se aude
    // ca un șir de patru, și atunci nu se mai simte unde începe figura.
    bars: [snareBar('RLRRLRLLRLRRLRLL', { accents: 'x...x...x...x...' })],
    tempo: { min: 45, max: 110, suggested: 64 },
    requires: ['single-stroke-sixteenths'],
  },
  {
    id: 'double-paradiddle',
    titleKey: 'drums.rud_double_paradiddle',
    howToKey: 'drums.rud_double_paradiddle_how',
    stepsPerBar: 12,
    bars: [snareBar('RLRLRRLRLRLL', { accents: 'x.....x.....' })],
    tempo: { min: 45, max: 108, suggested: 60 },
    requires: ['paradiddle', 'single-stroke-triplets'],
  },
  {
    id: 'paradiddle-diddle',
    titleKey: 'drums.rud_paradiddle_diddle',
    howToKey: 'drums.rud_paradiddle_diddle_how',
    stepsPerBar: 12,
    bars: [snareBar('RLRRLLRLRRLL', { accents: 'x.....x.....' })],
    tempo: { min: 45, max: 104, suggested: 58 },
    requires: ['double-paradiddle'],
  },
  {
    id: 'flam',
    titleKey: 'drums.rud_flam',
    howToKey: 'drums.rud_flam_how',
    stepsPerBar: 4,
    // Pătrimi: la un flam contează lățimea sunetului, nu viteza. Pe pătrimi ai
    // timp să auzi dacă cele două bețe au căzut prea aproape sau prea departe.
    bars: [snareBar('RLRL', { grace: 'ffff' })],
    tempo: { min: 50, max: 120, suggested: 70 },
    requires: ['single-stroke-roll'],
  },
  {
    id: 'flam-tap',
    titleKey: 'drums.rud_flam_tap',
    howToKey: 'drums.rud_flam_tap_how',
    stepsPerBar: 8,
    // Flam, apoi o lovitură cu ACEEAȘI mână, apoi la fel cu cealaltă.
    bars: [snareBar('RRLLRRLL', { accents: 'x.x.x.x.', grace: 'f.f.f.f.' })],
    tempo: { min: 45, max: 104, suggested: 60 },
    requires: ['flam', 'double-stroke-roll'],
  },
  {
    id: 'drag',
    titleKey: 'drums.rud_drag',
    howToKey: 'drums.rud_drag_how',
    stepsPerBar: 4,
    bars: [snareBar('RLRL', { grace: 'dddd' })],
    tempo: { min: 45, max: 100, suggested: 60 },
    requires: ['flam', 'double-stroke-roll'],
  },
]

export const rudiments: DrumExercise[] = sources.map((source) => ({
  id: source.id,
  kind: 'rudiment',
  stepsPerBar: source.stepsPerBar,
  beatsPerBar: 4,
  bars: source.bars,
  tempo: source.tempo,
  ...(source.requires ? { requires: source.requires } : {}),
}))

const textById = new Map(sources.map((source) => [source.id, source]))

/** Cheile de traducere ale unui rudiment. Textul nu stă în date. */
export function rudimentText(id: string) {
  const source = textById.get(id)
  if (!source) throw new Error(`rudiment necunoscut: ${id}`)
  return { titleKey: source.titleKey, howToKey: source.howToKey }
}

export const rudimentById = (id: string) => rudiments.find((exercise) => exercise.id === id)

/*
  Deblocarea e comună tuturor catalogurilor (`catalogue.ts`); aici rămâne doar
  legarea ei de lista de rudimente, ca apelantul să nu care catalogul cu el.
*/
export const unlockedRudiments = (completed: readonly string[]) => unlockedIn(rudiments, completed)

export { missingFor } from './catalogue'
