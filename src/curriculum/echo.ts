import { TICKS_PER_BEAT } from '../game/notation-tokens'
import type { EchoLevel } from '../game/rhythm'

/**
 * Nivelurile jocului Rhythm Echo: auzi pattern-ul, apoi il repeti.
 *
 * Spre deosebire de jocul de citire, aici pattern-urile sunt generate la
 * fiecare sesiune - altfel s-ar invata pe de rost. Ce e declarat aici sunt
 * REGULILE din care se genereaza, iar cea care conteaza e `subdivisions`:
 * schemele de impartire a unui timp care au voie sa apara.
 *
 * Fara ele, un generator pe grila de 48 ar pune note pe pasul 5 sau 7 - pozitii
 * care nu sunt nici binare, nici ternare, deci nici nu se pot scrie, nici nu
 * se pot bate. Cu ele, fiecare timp e ori patrime, ori optimi, ori
 * saisprezecimi, ori triolet, ori sextolet - exact ce s-a predat la lectii.
 */

/** Offset-urile dintr-un timp de patrime, pe grila de 12 pasi. */
const QUARTER = [0]
const EIGHTHS = [0, 6]
const OFFBEAT = [6]
const SIXTEENTHS = [0, 3, 6, 9]
const SIXTEENTH_OFFBEATS = [3, 9]
const TRIPLET = [0, 4, 8]
const SEXTOLET = [0, 2, 4, 6, 8, 10]

/** Offset-urile dintr-un timp de patrime punctata (18 pasi), pentru 6/8. */
const COMPOUND_EIGHTHS = [0, 6, 12]
const COMPOUND_LONG_SHORT = [0, 12]
const COMPOUND_SIXTEENTHS = [0, 3, 6, 9, 12, 15]

const simpleBar = (beats: number) => TICKS_PER_BEAT * beats

export const echoLevels: EchoLevel[] = [
  {
    level: 1,
    title: 'Pătrimi',
    description: 'O notă pe fiecare timp, sau tăcere.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 1,
    subdivisions: [QUARTER],
    density: 0.62,
    bpm: [76, 104],
  },
  {
    level: 2,
    title: 'Optimi',
    description: 'Două note pe un timp, printre pătrimi.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 1,
    subdivisions: [QUARTER, EIGHTHS, EIGHTHS],
    density: 0.44,
    groupChance: 0.3,
    bpm: [80, 110],
  },
  {
    level: 3,
    title: 'Optimi, două măsuri',
    description: 'Același vocabular, dar de ținut minte mai mult.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, EIGHTHS],
    density: 0.4,
    groupChance: 0.26,
    bpm: [84, 116],
  },
  {
    level: 4,
    title: 'Contratimp',
    description: 'Note care intră între timpi, nu pe ei.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, OFFBEAT, OFFBEAT],
    density: 0.44,
    groupChance: 0.3,
    bpm: [80, 112],
  },
  {
    level: 5,
    title: 'Șaisprezecimi',
    description: 'Patru note pe un timp. Tempoul scade, densitatea crește.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 1,
    subdivisions: [QUARTER, EIGHTHS, SIXTEENTHS],
    density: 0.38,
    groupChance: 0.34,
    bpm: [60, 84],
  },
  {
    level: 6,
    title: 'Șaisprezecimi, două măsuri',
    description: 'Treci de la dens la rar fără să grăbești.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, SIXTEENTHS],
    density: 0.36,
    groupChance: 0.3,
    bpm: [62, 88],
  },
  {
    level: 7,
    title: 'Sincopă',
    description: 'Timpul tare rămâne gol, accentul alunecă.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, OFFBEAT, SIXTEENTHS, SIXTEENTH_OFFBEATS],
    density: 0.38,
    groupChance: 0.28,
    bpm: [64, 90],
  },
  {
    level: 8,
    title: 'Triolete',
    description: 'Trei note egale pe un timp.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 1,
    subdivisions: [QUARTER, EIGHTHS, TRIPLET, TRIPLET],
    density: 0.38,
    groupChance: 0.42,
    bpm: [54, 78],
  },
  {
    level: 9,
    title: 'Binar și ternar',
    description: 'Trioletul lângă grupul de șaisprezecimi, în aceeași măsură.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, SIXTEENTHS, TRIPLET],
    density: 0.34,
    groupChance: 0.38,
    bpm: [52, 74],
  },
  {
    level: 10,
    title: 'Sextolete',
    description: 'Șase pe un timp. Rar, dar dens.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 1,
    subdivisions: [QUARTER, TRIPLET, SEXTOLET],
    density: 0.3,
    groupChance: 0.46,
    bpm: [44, 62],
  },
  {
    level: 11,
    title: 'Măsura de 2/4',
    description: 'Bara cade de două ori mai des. Patru măsuri scurte.',
    stepsPerBar: simpleBar(2),
    beatsPerBar: 2,
    bars: 4,
    subdivisions: [QUARTER, EIGHTHS, SIXTEENTHS],
    density: 0.4,
    groupChance: 0.3,
    bpm: [84, 120],
  },
  {
    level: 12,
    title: 'Măsura de 3/4',
    description: 'Trei timpi pe măsură, două măsuri.',
    stepsPerBar: simpleBar(3),
    beatsPerBar: 3,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, SIXTEENTHS],
    density: 0.42,
    groupChance: 0.3,
    bpm: [88, 126],
  },
  {
    level: 13,
    title: 'Măsura de 6/8',
    description: 'Doi timpi mari, fiecare de trei optimi.',
    // 36 de pasi, doi timpi: 18 pe timp, adica o patrime punctata.
    stepsPerBar: TICKS_PER_BEAT * 3,
    beatsPerBar: 2,
    bars: 2,
    subdivisions: [COMPOUND_LONG_SHORT, COMPOUND_EIGHTHS, COMPOUND_EIGHTHS, COMPOUND_SIXTEENTHS],
    density: 0.4,
    groupChance: 0.34,
    bpm: [48, 70],
  },
  {
    level: 14,
    title: 'Totul la un loc',
    description: 'Tot ce s-a predat, amestecat.',
    stepsPerBar: simpleBar(4),
    beatsPerBar: 4,
    bars: 2,
    subdivisions: [QUARTER, EIGHTHS, OFFBEAT, SIXTEENTHS, SIXTEENTH_OFFBEATS, TRIPLET, SEXTOLET],
    density: 0.32,
    groupChance: 0.34,
    bpm: [46, 70],
  },
]
