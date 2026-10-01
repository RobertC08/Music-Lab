import type { Bar, DrumExercise, GrooveStyle, Hit, KitPiece, Vocabulary } from './exercise'

/*
  Groove-urile, ca date. Aceleași reguli ca la rudimente: niciun import din UI,
  niciun audio, iar `tempo.max` e valoarea la care testele verifică dacă groove-ul
  rămâne posibil de cântat.

  Deosebirea față de rudimente nu e în format, ci în ce se citește: acolo conta
  MÂNA fiecărei lovituri, aici contează CE PIESĂ se lovește și cum se așază
  piesele una peste alta. De aceea groove-urile n-au sticking, la un groove de
  rock, mâna care ține hi-hat-ul nu e o alegere, e singura posibilă, iar a o scrie
  ar sugera că există ceva de decis.
*/

/**
 * Ce are voie să folosească un groove.
 *
 * Toate cele opt piese, fiindcă asta ESTE un set de tobe. Ce mărginește
 * dificultatea aici nu e paleta de piese, ci diviziunea: pătrimile și optimile
 * sunt de învățat, șaisprezecimile și trioletele sunt de exersat.
 */
export const grooveVocabulary: Vocabulary = {
  // Plus fusul cu piciorul (jazz) și cross-stick-ul (bossa), din DRSKit.
  pieces: ['kick', 'snare', 'hhClosed', 'hhOpen', 'tom', 'floor', 'crash', 'ride', 'hhFoot', 'crossStick'],
  hits: ['ghost', 'normal', 'accent'],
  stepsPerBeat: [2, 3, 4],
}

/**
 * O măsură de set, scrisă ca un rând pe piesă, un caracter pe pas.
 *
 * Rândurile stau unul sub altul exact ca pe portativ: ce e aliniat pe verticală
 * se lovește deodată. O greșeală de tipar se vede cu ochiul, fiindcă rândurile nu
 * se mai potrivesc; ce nu se vede, prinde validarea.
 *
 *   'x' = lovitură normală    'X' = accent    'o' = ghost note    '.' = pauză
 */
function grooveBar(rows: Partial<Record<KitPiece, string>>): Bar {
  const lanes: Bar['lanes'] = {}
  for (const [piece, row] of Object.entries(rows) as [KitPiece, string][]) {
    lanes[piece] = [...row].map((character): Hit | null =>
      character === 'X' ? 'accent' : character === 'o' ? 'ghost' : character === 'x' ? 'normal' : null,
    )
  }
  return { lanes }
}

interface GrooveSource {
  id: string
  style: GrooveStyle
  titleKey: string
  howToKey: string
  stepsPerBar: number
  bars: Bar[]
  tempo: { min: number; max: number; suggested: number }
  requires?: string[]
}

/*
  Nouă groove-uri, în ordinea în care se învață.

  Ordinea nu e după stil, ci după cât de departe cade lovitura de puls: întâi tot
  ce stă pe optimi drepte, apoi sincopele, apoi trioletele. Un elev care știe rock
  poate cânta metal în aceeași zi; până la funk cu ghost notes e alt drum.
*/
const sources: GrooveSource[] = [
  {
    id: 'rock-basic',
    style: 'rock',
    titleKey: 'drums.grv_rock_basic',
    howToKey: 'drums.grv_rock_basic_how',
    stepsPerBar: 8,
    bars: [
      grooveBar({
        hhClosed: 'XxXxXxXx',
        snare: '....X...',
        kick: 'X...X...',
      }),
    ],
    tempo: { min: 60, max: 140, suggested: 90 },
  },
  {
    id: 'rock-backbeat',
    style: 'rock',
    titleKey: 'drums.grv_rock_backbeat',
    howToKey: 'drums.grv_rock_backbeat_how',
    stepsPerBar: 8,
    bars: [
      grooveBar({
        hhClosed: 'XxXxXxXx',
        snare: '..X...X.',
        kick: 'X..X.X..',
      }),
    ],
    tempo: { min: 60, max: 140, suggested: 92 },
    requires: ['rock-basic'],
  },
  {
    id: 'rock-open-hat',
    style: 'rock',
    titleKey: 'drums.grv_rock_open_hat',
    howToKey: 'drums.grv_rock_open_hat_how',
    stepsPerBar: 8,
    bars: [
      grooveBar({
        hhClosed: 'XxXxXxX.',
        hhOpen: '.......X',
        snare: '..X...X.',
        kick: 'X..X.X..',
      }),
    ],
    tempo: { min: 60, max: 132, suggested: 92 },
    requires: ['rock-backbeat'],
  },
  {
    id: 'metal-driving',
    style: 'metal',
    titleKey: 'drums.grv_metal',
    howToKey: 'drums.grv_metal_how',
    stepsPerBar: 8,
    bars: [
      grooveBar({
        // Toate loviturile pe stratul normal, niciuna pe accent: ostinato-ul de
        // metal e egal, iar ride-ul se adună singur, coada lui ține 1,6 s, deci
        // la optimi sună cinci lovituri deodată. Scris cu accente, cum era
        // înainte, acoperea toba mică.
        ride: 'xxxxxxxx',
        snare: '..X...X.',
        kick: 'XX..XX..',
      }),
    ],
    tempo: { min: 70, max: 150, suggested: 100 },
    requires: ['rock-backbeat'],
  },
  {
    id: 'rock-sixteenth-hats',
    style: 'rock',
    titleKey: 'drums.grv_rock_sixteenths',
    howToKey: 'drums.grv_rock_sixteenths_how',
    stepsPerBar: 16,
    bars: [
      grooveBar({
        hhClosed: 'XxxxXxxxXxxxXxxx',
        snare: '....X.......X...',
        kick: 'X.......X.X.....',
      }),
    ],
    // Hi-hat în șaisprezecimi cu o mână: peste ~110 se cântă cu două mâini, ceea
    // ce e alt exercițiu. Maximul e ales de aici, nu de la limita fizică.
    tempo: { min: 55, max: 110, suggested: 76 },
    requires: ['rock-backbeat'],
  },
  {
    id: 'funk-ghost',
    style: 'funk',
    titleKey: 'drums.grv_funk_ghost',
    howToKey: 'drums.grv_funk_ghost_how',
    stepsPerBar: 16,
    bars: [
      grooveBar({
        hhClosed: 'XxxxXxxxXxxxXxxx',
        // Ghost note-urile SUNT groove-ul aici: scoase, rămâne un rock leneș.
        snare: '..o.X..o..o.X...',
        kick: 'X..X....X..X..X.',
      }),
    ],
    tempo: { min: 55, max: 108, suggested: 84 },
    requires: ['rock-sixteenth-hats'],
  },
  {
    id: 'funk-syncopated',
    style: 'funk',
    titleKey: 'drums.grv_funk_sync',
    howToKey: 'drums.grv_funk_sync_how',
    stepsPerBar: 16,
    bars: [
      grooveBar({
        hhClosed: 'X.x.X.x.X.x.X.x.',
        snare: '....X...o...X..o',
        kick: 'X..X..X...X.X...',
      }),
    ],
    tempo: { min: 55, max: 104, suggested: 82 },
    requires: ['funk-ghost'],
  },
  {
    id: 'shuffle-basic',
    style: 'shuffle',
    titleKey: 'drums.grv_shuffle',
    howToKey: 'drums.grv_shuffle_how',
    // Triolete: 3 pași pe timp. Shuffle înseamnă prima și a treia, fără mijloc.
    stepsPerBar: 12,
    bars: [
      grooveBar({
        hhClosed: 'X.xX.xX.xX.x',
        snare: '...X.....X..',
        kick: 'X.....X.....',
      }),
    ],
    tempo: { min: 55, max: 120, suggested: 80 },
    requires: ['rock-backbeat'],
  },
  {
    id: 'jazz-ride',
    style: 'jazz',
    titleKey: 'drums.grv_jazz',
    howToKey: 'drums.grv_jazz_how',
    stepsPerBar: 12,
    bars: [
      grooveBar({
        // Ritmul de ride: ta, ta-ta, cu a treia trioletă, nu cu optimea dreaptă.
        // Cu dinamică, nu doar cu accente: apăsare pe 2 și 4, timpii tari 1 și 3
        // normali, nota de legătură ca ghost note. Așa se cântă, și tot așa
        // ride-ul nu mai acoperă hi-hat-ul de la picior.
        ride: 'x..X.ox..X.o',
        // Fusul cu piciorul, pe 2 și 4: mostra lui din DRSKit, nu fusul lovit
        // cu bățul, care sună altfel (un „ț" mai ascuțit, nu un „ciac" închis).
        hhFoot: '...X.....X..',
      }),
    ],
    tempo: { min: 60, max: 130, suggested: 88 },
    requires: ['shuffle-basic'],
  },
  {
    id: 'latin-bossa',
    style: 'latin',
    titleKey: 'drums.grv_bossa',
    howToKey: 'drums.grv_bossa_how',
    stepsPerBar: 16,
    bars: [
      grooveBar({
        hhClosed: 'X.x.X.x.X.x.X.x.',
        // Clave pe cross-stick, cum se cântă, nu ghost note pe toba mică.
        crossStick: '..x..x..x...x.x.',
        kick: 'X..X..X.X..X..X.',
      }),
      grooveBar({
        hhClosed: 'X.x.X.x.X.x.X.x.',
        crossStick: '..x..x..x...x.x.',
        kick: 'X..X..X.X..X..X.',
      }),
    ],
    tempo: { min: 60, max: 120, suggested: 84 },
    requires: ['funk-ghost'],
  },
]

export const grooves: DrumExercise[] = sources.map((source) => ({
  id: source.id,
  kind: 'groove',
  style: source.style,
  stepsPerBar: source.stepsPerBar,
  beatsPerBar: 4,
  bars: source.bars,
  tempo: source.tempo,
  ...(source.requires ? { requires: source.requires } : {}),
}))

const textById = new Map(sources.map((source) => [source.id, source]))

/** Cheile de traducere ale unui groove. Textul nu stă în date. */
export function grooveText(id: string) {
  const source = textById.get(id)
  if (!source) throw new Error(`groove necunoscut: ${id}`)
  return { titleKey: source.titleKey, howToKey: source.howToKey }
}

export const grooveById = (id: string) => grooves.find((exercise) => exercise.id === id)

/** Stilurile prezente în catalog, în ordinea primei apariții. */
export const grooveStyles: GrooveStyle[] = [
  ...new Set(sources.map((source) => source.style)),
]
