import type { Bar, DrumExercise, Hit, KitPiece, Vocabulary } from './exercise'
import { beatsRow, evenRow, MIXED_STEPS_PER_BEAT } from './mixed-grid'

/*
  Fill-uri avansate: subdiviziuni amestecate în aceeași măsură.

  Aceeași formă ca la fill-urile de bază (`fills.ts`): trei măsuri de groove, a
  patra e a ta, cu crash pe „unu” la întoarcere. Diferența e în măsura de fill:
  aici trece din șaisprezecimi în triolete sau sextolete, intră pe contratimp,
  aduce fusul și toba mare în fill. Pentru asta toate stau pe grila comună de 12
  pași pe timp (`mixed-grid.ts`), iar fill-ul se scrie pe timpi:

    'Xxxx|xxx|xxxxxx|x.'  =  șaisprezecimi | triolet | sextolet | optimi

  Ordinea urcă: întâi o singură trecere între două subdiviziuni, apoi sextolete,
  apoi intrări pe contratimp, apoi picioarele în fill, apoi totul la un loc.

  Tempourile maxime nu sunt rotunde: sextoletele pe aceeași piesă cad la
  60000 / tempo / 6 ms, iar regula de 90 ms (`MIN_HAND_GAP_MS`) le oprește pe
  la 110 BPM. Un fill care cere mai mult are tempoul greșit, nu notele.
*/

export const advancedFillVocabulary: Vocabulary = {
  pieces: [
    'kick',
    'snare',
    'hhClosed',
    'hhOpen',
    'hhFoot',
    'tom',
    'mid',
    'floor',
    'crash',
    'rimshot',
  ],
  hits: ['ghost', 'normal', 'accent'],
  stepsPerBeat: [MIXED_STEPS_PER_BEAT],
}

const STEPS = MIXED_STEPS_PER_BEAT * 4

function lanesOf(rows: Partial<Record<KitPiece, string>>): Bar['lanes'] {
  const lanes: Bar['lanes'] = {}
  for (const [piece, row] of Object.entries(rows) as [KitPiece, string][]) {
    if (row.length !== STEPS) throw new Error(`${piece}: ${row.length} pași, nu ${STEPS}`)
    lanes[piece] = [...row].map((character): Hit | null =>
      character === 'X'
        ? 'accent'
        : character === 'o'
          ? 'ghost'
          : character === 'x'
            ? 'normal'
            : null,
    )
  }
  return lanes
}

/** Groove-ul de sub fill, același ca la fill-urile de bază, întins pe grila comună. */
const GROOVE = {
  hhClosed: evenRow('XxxxXxxxXxxxXxxx'),
  snare: evenRow('....X.......X...'),
  kick: evenRow('X.......X.X.....'),
}
const LANDING = {
  ...GROOVE,
  hhClosed: evenRow('.xxxXxxxXxxxXxxx'),
  crash: evenRow('X...............'),
}

interface AdvancedFillSource {
  id: string
  /** Cheia textelor: `drums.afill_<key>` și `drums.afill_<key>_how`. */
  key: string
  /** Măsura de fill, scrisă pe timpi (`beatsRow`). */
  fill: Partial<Record<KitPiece, string>>
  tempo: { min: number; max: number; suggested: number }
  requires?: string[]
}

const sources: AdvancedFillSource[] = [
  {
    id: 'afill-16-to-triplets',
    key: '16_to_triplets',
    // Șaisprezecimi pe toba mică doi timpi, apoi triolete pe tomuri: grila se lărgește la mijloc.
    fill: {
      snare: 'Xxxx|Xxxx|.|.',
      tom: '..|..|Xxx|...',
      floor: '..|..|...|Xxx',
      kick: 'x.|..|x..|...',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
  },
  {
    id: 'afill-triplets-to-16',
    key: 'triplets_to_16',
    // Invers: triolete întâi, apoi grila se strânge pe șaisprezecimi.
    fill: {
      snare: 'Xxx|Xxx|..|..',
      tom: '..|..|Xxxx|..',
      floor: '..|..|..|Xxxx',
      kick: 'x..|...|x...|....',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['afill-16-to-triplets'],
  },
  {
    id: 'afill-alternating-grids',
    key: 'alternating_grids',
    // Pe rând: șaisprezecimi, triolet, șaisprezecimi, triolet, pe piese diferite.
    fill: {
      snare: 'Xxxx|...|....|...',
      tom: '....|Xxx|....|...',
      mid: '....|...|Xxxx|...',
      floor: '....|...|....|Xxx',
      kick: 'x...|x..|x...|x..',
    },
    tempo: { min: 60, max: 116, suggested: 80 },
    requires: ['afill-triplets-to-16'],
  },
  {
    id: 'afill-sextuplets-snare',
    key: 'sextuplets_snare',
    // Groove pe timpii 1-2, apoi sextolete pe toba mică, accent pe începutul fiecărui grup.
    fill: {
      hhClosed: 'Xxxx|Xxxx|.|.',
      snare: '....|X...|Xxxxxx|Xxxxxx',
      kick: 'X...|..X.|x.....|x.....',
    },
    tempo: { min: 56, max: 100, suggested: 72 },
    requires: ['afill-alternating-grids'],
  },
  {
    id: 'afill-sextuplets-around',
    key: 'sextuplets_around',
    // Câte un sextolet pe fiecare piesă, de sus în jos: toba mică, tom 1, tom 2, cazan.
    fill: {
      snare: 'Xxxxxx|.|.|.',
      tom: '.|Xxxxxx|.|.',
      mid: '.|.|Xxxxxx|.',
      floor: '.|.|.|Xxxxxx',
      kick: 'x.|x.|x.|x.',
    },
    tempo: { min: 56, max: 96, suggested: 70 },
    requires: ['afill-sextuplets-snare'],
  },
  {
    id: 'afill-sextuplet-accents',
    key: 'sextuplet_accents',
    // Sextolete în care accentele (1 și 4 din șase) se mută pe tomuri: două grupuri de trei pe timp.
    fill: {
      snare: '.oo.oo|.oo.oo|.oo.oo|.oo.oo',
      tom: 'X..X..|X..X..|......|......',
      floor: '......|......|X..X..|X..X..',
      kick: 'x.....|x.....|x.....|x.....',
    },
    tempo: { min: 56, max: 100, suggested: 70 },
    requires: ['afill-sextuplets-snare'],
  },
  {
    id: 'afill-sextuplet-rlk',
    key: 'sextuplet_rlk',
    // Mână, mână, picior în sextolete: R L K R L K, cu mâinile coborând pe tomuri.
    fill: {
      snare: 'xx.xx.|......|......|......',
      tom: '......|xx.xx.|......|......',
      mid: '......|......|xx.xx.|......',
      floor: '......|......|......|xx.xx.',
      kick: '..x..x|..x..x|..x..x|..x..x',
    },
    tempo: { min: 56, max: 96, suggested: 68 },
    requires: ['afill-sextuplets-around'],
  },
  {
    id: 'afill-entry-on-e',
    key: 'entry_on_e',
    // Groove pe 1-2, fill-ul intră pe „trei-e”, nu pe 3: prima notă lipsește dinadins.
    fill: {
      hhClosed: 'Xxxx|Xxxx|x...|.',
      snare: '....|X...|.xxx|....',
      tom: '....|....|....|xx..',
      floor: '....|....|....|..xx',
      kick: 'X...|..X.|x...|....',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['afill-16-to-triplets'],
  },
  {
    id: 'afill-entry-on-and',
    key: 'entry_on_and',
    // Intrare pe „trei-și”, două șaisprezecimi, apoi un triolet pe tomuri pe timpul 4.
    fill: {
      hhClosed: 'Xxxx|Xxxx|x...|...',
      snare: '....|X...|..xx|...',
      tom: '....|....|....|Xx.',
      floor: '....|....|....|..x',
      kick: 'X...|..X.|x...|...',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['afill-entry-on-e'],
  },
  {
    id: 'afill-offbeat-hits',
    key: 'offbeat_hits',
    // Șaisprezecimi rupte de două lovituri de crash cu toba mare: pe „doi-și” și pe 4.
    fill: {
      snare: 'xxxx|xx..|xxxx|....',
      crash: '....|..X.|....|X...',
      kick: '....|..x.|....|x...',
    },
    tempo: { min: 60, max: 116, suggested: 84 },
    requires: ['afill-entry-on-and'],
  },
  {
    id: 'afill-hihat-in-fill',
    key: 'hihat_in_fill',
    // Fusul nu tace: piciorul îl închide pe 3 și 4, iar pe „patru-și” se deschide, cu mâna.
    fill: {
      hhClosed: 'Xxxx|Xxxx|....|....',
      snare: '....|X...|Xxxx|xx..',
      hhOpen: '....|....|....|..X.',
      hhFoot: '....|....|x...|x...',
      kick: 'X...|..X.|....|...x',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['afill-entry-on-and'],
  },
  {
    id: 'afill-sextuplet-hihat',
    key: 'sextuplet_hihat',
    // Sextolete între fus și toba mică, apoi șaisprezecimi pe tomuri.
    fill: {
      hhClosed: 'x.x.x.|x.x.x.|....|....',
      snare: '.x.x.x|.x.x.x|....|....',
      tom: '......|......|Xxxx|....',
      floor: '......|......|....|Xxxx',
      kick: 'x.....|x.....|x...|x...',
    },
    tempo: { min: 56, max: 110, suggested: 72 },
    requires: ['afill-hihat-in-fill', 'afill-sextuplets-snare'],
  },
  {
    id: 'afill-triplet-rlk',
    key: 'triplet_rlk',
    // Mână, mână, picior pe triolete trei timpi, apoi șaisprezecimi pe cazan pe timpul 4.
    fill: {
      tom: 'x..|...|x..|....',
      floor: '...|x..|...|XxXx',
      snare: '.x.|.x.|.x.|....',
      kick: '..x|..x|..x|x...',
    },
    tempo: { min: 60, max: 120, suggested: 80 },
    requires: ['afill-alternating-grids'],
  },
  {
    id: 'afill-linear-three-over-four',
    key: 'linear_three_over_four',
    /*
      Grupuri de trei (mână, mână, picior) pe șaisprezecimi: grupul nu se
      potrivește cu timpul, deci accentele se plimbă peste bară. Trei peste patru.
    */
    fill: {
      tom: 'x..x|..x.|....|....',
      floor: '....|....|.x..|x..x',
      snare: '.x..|x..x|..x.|.x..',
      kick: '..x.|.x..|x..x|..x.',
    },
    tempo: { min: 60, max: 116, suggested: 80 },
    requires: ['afill-triplet-rlk'],
  },
  {
    id: 'afill-paradiddle-toms',
    key: 'paradiddle_toms',
    // Paradiddle pe șaisprezecimi trei timpi (dreapta pe tomuri, stânga pe toba mică), apoi un sextolet pe toba mică spre crash.
    fill: {
      tom: 'x.xx|.x..|....|....',
      floor: '....|....|x.xx|......',
      snare: '.x..|x.xx|.x..|ooxxxX',
      kick: 'x...|x...|x...|x.....',
    },
    tempo: { min: 60, max: 104, suggested: 80 },
    requires: ['afill-16-to-triplets'],
  },
  {
    id: 'afill-rimshot-accents',
    key: 'rimshot_accents',
    // Șaisprezecimi cu accentele pe rimshot, pe contratimp, iar pe timpul 4 un triolet: rimshot, tobă mică, rimshot.
    fill: {
      snare: 'xx.x|xx.x|xx.x|.x.',
      rimshot: '..X.|..X.|..X.|X.X',
      kick: 'x...|x...|x...|x..',
    },
    tempo: { min: 60, max: 116, suggested: 88 },
    requires: ['afill-entry-on-and'],
  },
  {
    id: 'afill-ghost-funk',
    key: 'ghost_funk',
    // Fill de funk pe toba mică: ghost notes și accente pe șaisprezecimi, cu toba mare între ele, iar timpul 4 e o rafală de sextolet.
    fill: {
      snare: 'oXoo|oXoX|XooX|ooooxX',
      kick: 'x...|..x.|....|......',
    },
    tempo: { min: 60, max: 104, suggested: 80 },
    requires: ['afill-rimshot-accents'],
  },
  {
    id: 'afill-quarter-triplets',
    key: 'quarter_triplets',
    // Șaisprezecimi doi timpi, apoi trioleți de pătrime pe cazan și toba mare: trei peste doi timpi.
    fill: {
      snare: 'xxxx|xxxx|.|.',
      floor: '..|..|x.x|.x.',
      kick: 'x.|..|x.x|.x.',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['afill-linear-three-over-four'],
  },
  {
    id: 'afill-rhythmic-ritard',
    key: 'rhythmic_ritard',
    // Frânare fără să schimbi tempoul: sextolete, șaisprezecimi, triolete, optimi, coborând pe set.
    fill: {
      snare: 'Xxxxxx|.|.|.',
      tom: '.|Xxxx|.|.',
      mid: '.|.|Xxx|.',
      floor: '.|.|.|Xx',
      kick: 'x.|x.|x.|x.',
    },
    tempo: { min: 56, max: 96, suggested: 72 },
    requires: ['afill-sextuplets-around'],
  },
  {
    id: 'afill-everything',
    key: 'everything',
    /*
      Totul la un loc: șaisprezecimi pe toba mică, un sextolet pe tomuri, un
      triolet pe cazan cu toba mare, apoi o lovitură de crash pe „patru-și”.
    */
    fill: {
      snare: 'Xxxx|......|...|..',
      tom: '....|Xx.Xx.|...|..',
      mid: '....|..x..x|...|..',
      floor: '....|......|Xxx|..',
      crash: '....|......|...|.X',
      kick: 'x...|......|x.x|.x',
    },
    tempo: { min: 56, max: 100, suggested: 72 },
    requires: ['afill-rhythmic-ritard', 'afill-offbeat-hits'],
  },
]

export const advancedFills: DrumExercise[] = sources.map((source) => {
  const fillRows = Object.fromEntries(
    Object.entries(source.fill).map(([piece, row]) => [piece, beatsRow(row)]),
  ) as Partial<Record<KitPiece, string>>
  return {
    id: source.id,
    kind: 'fill',
    stepsPerBar: STEPS,
    beatsPerBar: 4,
    bars: [
      { lanes: lanesOf(LANDING) },
      { lanes: lanesOf(GROOVE) },
      { lanes: lanesOf(GROOVE) },
      { lanes: lanesOf(fillRows), fill: true },
    ],
    tempo: source.tempo,
    ...(source.requires ? { requires: source.requires } : {}),
  }
})

const keyById = new Map(sources.map((source) => [source.id, source.key]))

/** Cheile de traducere ale unui fill avansat. Textul nu stă în date. */
export function advancedFillText(id: string) {
  const key = keyById.get(id)
  if (!key) throw new Error(`fill avansat necunoscut: ${id}`)
  return { titleKey: `drums.afill_${key}`, howToKey: `drums.afill_${key}_how` }
}

export const advancedFillById = (id: string) => advancedFills.find((exercise) => exercise.id === id)
