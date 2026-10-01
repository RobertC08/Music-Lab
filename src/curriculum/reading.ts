import { TICKS_PER_BEAT, type RhythmToken } from '../game/notation-tokens'
import {
  generateReadingExercises,
  type ReadingLevel,
  type ReadingLevelSpec,
} from '../game/reading'

export type { ReadingExercise, ReadingLevel } from '../game/reading'

/**
 * Nivelurile jocului de citire. Aici nimic nu se aude inainte: se citeste de
 * pe notatie si se bate peste metronom.
 *
 * Fiecare nivel isi declara vocabularul - exact ce simboluri au voie sa apara -
 * si generatorul compune din el masuri intregi. Vocabularul e dificultatea:
 * un nivel nu poate produce ceva mai greu decat ce i s-a dat.
 *
 * Ordinea urmeaza curriculumul de lectii, ca sa nu apara un simbol inainte sa
 * fi fost predat.
 */

/** O masura de `beats` patrimi, in pasi. */
const bar = (beats: number) => TICKS_PER_BEAT * beats
/** Masura de 6/8: sase optimi, adica doi timpi de patrime punctata. */
const SIX_EIGHT_BAR = TICKS_PER_BEAT * 3

const EXERCISES_PER_LEVEL = 20

/**
 * Demonstratia de la inceputul unei serii: se vede notatia si se aude cum
 * trebuie sa iasa. Nu e niciunul dintre exercitii - daca ar fi, primul
 * exercitiu s-ar rezolva din auz, adica exact ce jocul nu vrea. Rolul ei e
 * sa arate ca o doime se aude lunga, nu ca o patrime urmata de tacere.
 */
export const readingDemo = {
  tokens: ['quarter', 'quarter', 'half'] as RhythmToken[],
  bpm: 66,
  caption: 'Două pătrimi, apoi o doime ținută doi timpi.',
}

export const readingSpecs: ReadingLevelSpec[] = [
  {
    level: 1,
    title: 'Pătrimi și pauze',
    description: 'O notă pe fiecare timp, cu tăceri pe alocuri.',
    // Doua masuri, nu una: cu doar patrimi si pauze, o singura masura nu are
    // destule combinatii distincte ca sa umple un nivel de douazeci.
    vocabulary: ['quarter', 'quarter', 'quarter', 'quarterRest'],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [72, 104],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 2,
    title: 'Doimi și pauze lungi',
    description: 'Note ținute peste doi timpi, printre pătrimi.',
    vocabulary: ['half', 'halfRest', 'quarter', 'quarter', 'quarterRest'],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [76, 112],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 3,
    title: 'Optimi',
    description: 'Două note pe un timp, amestecate cu pătrimi.',
    vocabulary: ['eighthPair', 'eighthPair', 'quarter', 'quarter', 'quarterRest', 'half'],
    bars: 1,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [72, 108],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 4,
    title: 'Optimi pe două măsuri',
    description: 'Același vocabular, dar trebuie ținut mai mult.',
    vocabulary: ['eighthPair', 'eighthPair', 'quarter', 'quarterRest', 'half', 'eighth', 'eighthRest'],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [76, 116],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 5,
    title: 'Contratimp',
    description: 'Intri între timpi, nu pe ei.',
    vocabulary: ['eighthRest', 'eighth', 'eighth', 'eighthPair', 'quarter', 'quarterRest'],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [70, 104],
    allowRestStart: true,
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 6,
    title: 'Șaisprezecimi',
    description: 'Patru note pe un timp. Mai bine rar și egal.',
    vocabulary: ['sixteenthGroup', 'sixteenthGroup', 'eighthPair', 'quarter', 'quarterRest', 'half'],
    bars: 1,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [58, 88],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 7,
    title: 'Șaisprezecimi pe două măsuri',
    description: 'Treci de la dens la rar fără să grăbești.',
    vocabulary: [
      'sixteenthGroup',
      'eighthPair',
      'eighthPair',
      'quarter',
      'quarterRest',
      'eighth',
      'eighthRest',
      'half',
    ],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [60, 92],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 8,
    title: 'Punctul',
    description: 'O notă care ține o dată și jumătate.',
    vocabulary: [
      'dottedQuarter',
      'eighth',
      'dottedEighth',
      'sixteenth',
      'quarter',
      'quarter',
      'eighthPair',
    ],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [58, 90],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 9,
    title: 'Legături',
    description: 'Al doilea cap nu se atacă, se ține.',
    vocabulary: [
      'tiedQuarters',
      'tiedEighthQuarter',
      'eighth',
      'quarter',
      'quarter',
      'eighthPair',
      'half',
    ],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [56, 88],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 10,
    title: 'Triolete',
    description: 'Trei note egale pe un timp, printre valori binare.',
    vocabulary: ['tripletEighths', 'tripletEighths', 'quarter', 'quarterRest', 'eighthPair', 'half'],
    bars: 1,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [52, 78],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 11,
    title: 'Binar și ternar',
    description: 'Trioletul și grupul de șaisprezecimi, în aceeași măsură.',
    vocabulary: [
      'tripletEighths',
      'sixteenthGroup',
      'eighthPair',
      'quarter',
      'quarterRest',
      'half',
    ],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [50, 74],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 12,
    title: 'Sextolete',
    description: 'Șase pe un timp, lângă trei și lângă patru.',
    vocabulary: [
      'sextoletSixteenths',
      'tripletEighths',
      'sixteenthGroup',
      'quarter',
      'quarterRest',
      'eighthPair',
    ],
    bars: 1,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [44, 64],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 13,
    title: 'Măsura de 2/4',
    description: 'Bara cade de două ori mai des. Patru măsuri scurte.',
    vocabulary: ['quarter', 'quarter', 'eighthPair', 'quarterRest', 'sixteenthGroup', 'eighth', 'eighthRest'],
    bars: 4,
    ticksPerBar: bar(2),
    beatsPerBar: 2,
    bpm: [80, 120],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 14,
    title: 'Măsura de 3/4',
    description: 'Trei timpi pe măsură, numără „unu-doi-trei".',
    vocabulary: [
      'quarter',
      'quarter',
      'eighthPair',
      'quarterRest',
      'half',
      'dottedQuarter',
      'eighth',
    ],
    bars: 2,
    ticksPerBar: bar(3),
    beatsPerBar: 3,
    bpm: [84, 126],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 15,
    title: 'Măsura de 6/8',
    description: 'Doi timpi mari, fiecare de trei optimi. Tempoul e pe timpul mare.',
    vocabulary: ['eighth', 'eighth', 'eighthRest', 'quarter', 'dottedQuarter'],
    bars: 2,
    ticksPerBar: SIX_EIGHT_BAR,
    beatsPerBar: 2,
    bpm: [48, 72],
    count: EXERCISES_PER_LEVEL,
  },
  {
    level: 16,
    title: 'Totul la un loc',
    description: 'Tot ce s-a predat, în aceeași măsură.',
    vocabulary: [
      'quarter',
      'quarterRest',
      'eighthPair',
      'eighth',
      'eighthRest',
      'sixteenthGroup',
      'tripletEighths',
      'dottedQuarter',
      'dottedEighth',
      'sixteenth',
      'tiedEighthQuarter',
      'half',
    ],
    bars: 2,
    ticksPerBar: bar(4),
    beatsPerBar: 4,
    bpm: [48, 80],
    allowRestStart: true,
    count: EXERCISES_PER_LEVEL,
  },
]

export const readingLevels: ReadingLevel[] = readingSpecs.map((spec) => ({
  level: spec.level,
  title: spec.title,
  description: spec.description,
  exercises: generateReadingExercises(spec),
}))
