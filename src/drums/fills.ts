import type { Bar, DrumExercise, Hit, KitPiece, Vocabulary } from './exercise'

/*
  Fill-uri: trei măsuri de groove, a patra e a ta.

  Formatul e cel de la §2, nu e nevoie de un al patrulea. „Trei măsuri de groove,
  a patra fill” e o listă de patru `Bar`, din care ultima e marcată `fill`. Restul
  face `render.ts`: cu `gap`, aplicația tace exact pe măsura marcată.

  Greutatea unui fill nu e fill-ul, e reintrarea. De aceea fiecare exercițiu are
  cinel pe „unu” din prima măsură: în buclă, cinelul ăla cade imediat după fill-ul
  tău. Dacă ai grăbit, te calci pe el; dacă ai întârziat, apari după el. Aplicația
  nu-ți aude padul, dar golul are lungimea exactă, iar marginile lui se aud.

  Progresia e moștenită de la jocul „Fill-ul la timp”, retras odată cu celelalte
  jocuri pe ecran, unde funcționase: întâi un fill pe ultimul timp, apoi pe
  tomuri, apoi jumătate de măsură, apoi măsura întreagă, apoi pauza dinăuntru,
  apoi șaisprezecimile, apoi intrarea pe contratimp. Ce s-a schimbat e că nu se
  mai punctează nimic.
*/

export const fillVocabulary: Vocabulary = {
  pieces: ['kick', 'snare', 'hhClosed', 'tom', 'mid', 'floor', 'crash'],
  hits: ['ghost', 'normal', 'accent'],
  // 4 = șaisprezecimi (cele mai multe), 3 = triolete (fill-ul de triolete).
  stepsPerBeat: [3, 4],
}

/** Grila obișnuită: 16 pași, adică optimile și șaisprezecimile la un loc. */
const STEPS = 16
/** Grila de triolete: 3 pași pe timp. */
const TRIPLET_STEPS = 12

function barOf(steps: number) {
  return (rows: Partial<Record<KitPiece, string>>, fill = false): Bar => {
    const lanes: Bar['lanes'] = {}
    for (const [piece, row] of Object.entries(rows) as [KitPiece, string][]) {
      if (row.length !== steps) throw new Error(`${piece}: ${row.length} pași, nu ${steps}`)
      lanes[piece] = [...row].map((character): Hit | null =>
        character === 'X' ? 'accent' : character === 'o' ? 'ghost' : character === 'x' ? 'normal' : null,
      )
    }
    return fill ? { lanes, fill: true } : { lanes }
  }
}
const bar = barOf(STEPS)
const tripletBar = barOf(TRIPLET_STEPS)

/*
  Groove-ul de sub fill: același la toate nivelurile.

  Fix dinadins. Dacă s-ar schimba odată cu fill-ul, n-ai ști care dintre cele
  două te-a încurcat, iar ce se exersează aici e fill-ul și reintrarea, nu
  groove-ul, care a fost învățat la Groove Builder.
*/
const GROOVE = {
  hhClosed: 'XxxxXxxxXxxxXxxx',
  snare: '....X.......X...',
  kick: 'X.......X.X.....',
}

/** Prima măsură poartă cinelul de aterizare: în buclă, el cade după fill-ul tău. */
const LANDING = {
  ...GROOVE,
  hhClosed: '.xxxXxxxXxxxXxxx',
  crash: 'X...............',
}

/*
  Varianta de triolete a groove-ului, pentru fill-ul care se cântă în triolete.

  Un exercițiu are o singură grilă: `stepsPerBar` e al lui, nu al măsurii. Deci
  un fill în triolete nu poate sta peste un groove în șaisprezecimi, are nevoie
  de un groove scris tot în 12 pași. E și mai adevărat muzical: triolete peste un
  groove drept se cântă, dar nu se învață așa.
*/
const TRIPLET_GROOVE = {
  hhClosed: 'X.xX.xX.xX.x',
  snare: '...X.....X..',
  kick: 'X.....X.....',
}
const TRIPLET_LANDING = {
  ...TRIPLET_GROOVE,
  hhClosed: '..xX.xX.xX.x',
  crash: 'X...........',
}

interface FillSource {
  id: string
  titleKey: string
  howToKey: string
  /** Doar măsura de fill; groove-ul de dinainte e același peste tot. */
  fill: Partial<Record<KitPiece, string>>
  tempo: { min: number; max: number; suggested: number }
  requires?: string[]
  /** Fill-ul în triolete: alt grilaj, deci și alt groove sub el. */
  triplets?: true
}

const sources: FillSource[] = [
  {
    id: 'fill-last-beat',
    titleKey: 'drums.fill_last_beat',
    howToKey: 'drums.fill_last_beat_how',
    // Groove-ul continuă trei timpi, fill-ul intră abia pe timpul 4.
    fill: {
      hhClosed: 'XxxxXxxxXxxx....',
      snare: '....X.......X.X.',
      kick: 'X.......X.......',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
  },
  {
    id: 'fill-toms',
    titleKey: 'drums.fill_toms',
    howToKey: 'drums.fill_toms_how',
    fill: {
      hhClosed: 'XxxxXxxxXxxx....',
      snare: '....X.......X...',
      tom: '..............X.',
      floor: '...............X',
      kick: 'X.......X.......',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['fill-last-beat'],
  },
  {
    id: 'fill-eighth-toms',
    titleKey: 'drums.fill_eighth_toms',
    howToKey: 'drums.fill_eighth_toms_how',
    // Optimi, jumătate tobă mică, jumătate tom: cel mai simplu fill de o măsură.
    fill: {
      snare: 'X.x.X.x.........',
      tom: '........X.x.X.x.',
    },
    tempo: { min: 60, max: 126, suggested: 88 },
    requires: ['fill-toms'],
  },
  {
    id: 'fill-half-bar',
    titleKey: 'drums.fill_half_bar',
    howToKey: 'drums.fill_half_bar_how',
    fill: {
      hhClosed: 'XxxxXxxx........',
      snare: '....X...X.X.....',
      tom: '............X...',
      floor: '..............X.',
      kick: 'X...............',
    },
    tempo: { min: 60, max: 116, suggested: 82 },
    requires: ['fill-toms'],
  },
  {
    id: 'fill-descending',
    titleKey: 'drums.fill_descending',
    howToKey: 'drums.fill_descending_how',
    /*
      Scara în jos, câte două lovituri pe treaptă: mică → tom → mijloc → podea.
      Cu două tomuri, treapta din mijloc lipsea și scara suna ca o repetiție, de
      aia a intrat tomul de mijloc în kit.
    */
    fill: {
      snare: 'X.x.............',
      tom: '....X.x.........',
      mid: '........X.x.....',
      floor: '............X.x.',
    },
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['fill-eighth-toms'],
  },
  {
    id: 'fill-full-bar',
    titleKey: 'drums.fill_full_bar',
    howToKey: 'drums.fill_full_bar_how',
    fill: {
      snare: 'X.X.X.X.........',
      tom: '........X.X.....',
      floor: '............X.X.',
      kick: '...............x',
    },
    tempo: { min: 60, max: 112, suggested: 80 },
    requires: ['fill-half-bar'],
  },
  {
    id: 'fill-with-rest',
    titleKey: 'drums.fill_with_rest',
    howToKey: 'drums.fill_with_rest_how',
    // O optime lipsește din mijloc. Golul dinăuntru e mai greu decât notele.
    fill: {
      snare: 'X.X.....X.X.....',
      tom: '............X...',
      floor: '..............X.',
      kick: 'X...............',
    },
    tempo: { min: 60, max: 112, suggested: 80 },
    requires: ['fill-full-bar'],
  },
  {
    id: 'fill-kick-hands',
    titleKey: 'drums.fill_kick_hands',
    howToKey: 'drums.fill_kick_hands_how',
    /*
      Mâinile pe optimi, toba mare între ele: fill-ul curge în șaisprezecimi, dar
      fiecare mână bate tot la optime. Piciorul face diferența, și de aia e mai
      greu decât pare scris, nu notele, coordonarea.
    */
    fill: {
      snare: 'X.x.............',
      tom: '....X.x.........',
      mid: '........X.x.....',
      floor: '............X.x.',
      kick: '.x.x.x.x.x.x.x.x',
    },
    tempo: { min: 55, max: 100, suggested: 76 },
    requires: ['fill-full-bar'],
  },
  {
    id: 'fill-sixteenths',
    titleKey: 'drums.fill_sixteenths',
    howToKey: 'drums.fill_sixteenths_how',
    fill: {
      hhClosed: 'XxxxXxxx........',
      snare: '....X...XXXX....',
      tom: '............XX..',
      floor: '..............XX',
      kick: 'X...............',
    },
    tempo: { min: 55, max: 100, suggested: 76 },
    requires: ['fill-with-rest'],
  },
  {
    id: 'fill-staircase',
    titleKey: 'drums.fill_staircase',
    howToKey: 'drums.fill_staircase_how',
    // Patru câte patru, în jos. Fill-ul pe care îl recunoaște oricine.
    fill: {
      snare: 'Xxxx............',
      tom: '....Xxxx........',
      mid: '........Xxxx....',
      floor: '............Xxxx',
    },
    tempo: { min: 55, max: 104, suggested: 78 },
    requires: ['fill-sixteenths'],
  },
  {
    id: 'fill-alternating',
    titleKey: 'drums.fill_alternating',
    howToKey: 'drums.fill_alternating_how',
    // Aceleași șaisprezecimi, dar mâinile sar între piese din două în două.
    fill: {
      snare: 'Xx..Xx..Xx....Xx',
      tom: '..Xx..Xx........',
      floor: '..........XxXx..',
    },
    tempo: { min: 55, max: 100, suggested: 76 },
    requires: ['fill-staircase'],
  },
  {
    id: 'fill-classic-rock',
    titleKey: 'drums.fill_classic_rock',
    howToKey: 'drums.fill_classic_rock_how',
    // Două optimi de tobă mică, apoi șaisprezecimile. Schimbarea de viteză la
    // mijlocul măsurii e tot ce se exersează aici.
    fill: {
      snare: 'X.x.X.x...Xx....',
      tom: '........Xx......',
      floor: '............Xxxx',
    },
    tempo: { min: 55, max: 104, suggested: 80 },
    requires: ['fill-staircase'],
  },
  {
    id: 'fill-snare-burst',
    titleKey: 'drums.fill_snare_burst',
    howToKey: 'drums.fill_snare_burst_how',
    // Opt lovituri de tobă mică, apoi coborârea. Jumătate de măsură pe un singur
    // loc cere mâinile egale: dacă una e mai slabă, se aude imediat.
    fill: {
      snare: 'Xxxxxxxx........',
      tom: '........Xx......',
      mid: '..........Xx....',
      floor: '............Xxxx',
    },
    tempo: { min: 55, max: 96, suggested: 74 },
    requires: ['fill-alternating'],
  },
  {
    id: 'fill-offbeat',
    titleKey: 'drums.fill_offbeat',
    howToKey: 'drums.fill_offbeat_how',
    // Intrarea pe „și” după timpul 3: cea mai grea dintre toate, fiindcă nu e
    // sprijinită de nimic, nu cade nici pe timp, nici la început de măsură.
    fill: {
      hhClosed: 'XxxxXxxxXx......',
      snare: '....X.....XX....',
      tom: '............XX..',
      floor: '..............XX',
      kick: 'X.......X.......',
    },
    tempo: { min: 55, max: 100, suggested: 76 },
    requires: ['fill-sixteenths'],
  },
  {
    id: 'fill-triplets',
    titleKey: 'drums.fill_triplets',
    howToKey: 'drums.fill_triplets_how',
    // Trei pe timp, o treaptă pe timp. Groove-ul de sub el e de shuffle: un fill
    // de triolete peste un groove drept se cântă, dar nu se învață așa.
    triplets: true,
    fill: {
      snare: 'Xxx.........',
      tom: '...Xxx......',
      mid: '......Xxx...',
      floor: '.........Xxx',
    },
    tempo: { min: 55, max: 100, suggested: 76 },
    requires: ['fill-staircase'],
  },
]

export const fills: DrumExercise[] = sources.map((source) => {
  const write = source.triplets ? tripletBar : bar
  const groove = source.triplets ? TRIPLET_GROOVE : GROOVE
  const landing = source.triplets ? TRIPLET_LANDING : LANDING
  return {
    id: source.id,
    kind: 'fill',
    stepsPerBar: source.triplets ? TRIPLET_STEPS : STEPS,
    beatsPerBar: 4,
    // Patru măsuri: aterizarea (cu cinel), două de groove, apoi fill-ul.
    bars: [write(landing), write(groove), write(groove), write(source.fill, true)],
    tempo: source.tempo,
    ...(source.requires ? { requires: source.requires } : {}),
  }
})

const textById = new Map(sources.map((source) => [source.id, source]))

export function fillText(id: string) {
  const source = textById.get(id)
  if (!source) throw new Error(`fill necunoscut: ${id}`)
  return { titleKey: source.titleKey, howToKey: source.howToKey }
}

export const fillById = (id: string) => fills.find((exercise) => exercise.id === id)
