import { MAX_GAME_LEVEL, seedForLevel } from '../../guest/adaptive-levels'
import { levelPosition } from '../../guest/game-session'
import { mulberry32 } from '../game/random'
import type { DrumSound, LanePattern } from '../lanes/track'

/*
  Poliritm cu două mâini: ții un flux cu o mână în timp ce celălalt, care nu se
  cuprinde în el, merge cu cealaltă. Lecția 18 predă noțiunea, acolo auzi al
  doilea flux și nu îl bați. Aici îl bați, și fiecare mână se punctează separat.

  MĂSURA E CICLUL. Cele două fluxuri se ating numai pe „unu” și se regăsesc
  abia la bara următoare, deci o măsură = o repetare completă a raportului.
  Nimic din joc nu are înțeles peste graniță.

  GRILA E CEA COMUNĂ, exact cum o predă lecția: cel mai mic număr de pași în
  care intră amândouă fluxurile, adică `lcm(a, b)`. Pentru 3 contra 2 sunt șase
  pași: fluxul de trei cade pe 1, 3, 5 și cel de doi pe 1, 4, aceleași
  poziții pe care le numără lecția. Fără grila comună, un flux ar cădea între
  pași și n-ar putea fi nici scris, nici bătut.

  PULSUL E UNUL DINTRE FLUXURI, nu un al treilea reper. `beatsPerBar` e numărul
  de note al fluxului „de sprijin”, deci metronomul cade exact pe el, iar
  celălalt flux e cel care trece peste. Așa se exersează un poliritm: ții
  pulsul cu o mână și încalci cu cealaltă. Dacă metronomul ar bate altceva
  decât unul dintre fluxuri, ar fi trei ritmuri de urmărit, nu două.

  CARE MÂNĂ ȚINE CE se schimbă de la o rundă la alta. Altfel mâna dominantă ar
  face mereu fluxul greu, iar cealaltă doar pulsul, adică jumătate din
  exercițiu, făcut mereu cu aceeași mână.

  Nu există `backing` aici: la lecție al doilea flux se auzea fiindcă nu era al
  tău. În joc sunt amândouă ale tale, deci amândouă se bat și amândouă se
  punctează. Asta e toată deosebirea dintre lecția 18 și jocul ăsta.
*/

/*
  Sunetele, ca la lecția 18: nota ta și cvinta de sub ea. Stau aici, lângă date,
  nu în `track.ts`, fiindcă nivelul de intrare are nevoie de sunetul pulsului ca
  să-l poată scrie în acompaniament, iar `track.ts` importă fișierul ăsta, deci
  invers n-ar merge.
*/
export const CROSS_SOUND: DrumSound = 'tone'
export const PULSE_SOUND: DrumSound = 'toneFifthBelow'

export const polyrhythmHands = ['left', 'right'] as const
export type PolyrhythmHand = (typeof polyrhythmHands)[number]

export type PolyrhythmPattern = LanePattern<PolyrhythmHand> & {
  /** Câte note are fluxul care trece peste puls, pe măsură. */
  crossCount: number
  /** Câte note are fluxul de sprijin; el cade pe metronom. */
  pulseCount: number
  /** Mâna care ține fluxul de peste puls; cealaltă ține pulsul. */
  crossHand: PolyrhythmHand
  /**
   * Nivelul de intrare: pulsul îl ține aplicația, tu bați doar fluxul care trece
   * peste el, mecanica lecției 18. Fără el, primul contact cu poliritmul e
   * direct cu două mâini, ceea ce nu se poate: un începător nu bate două fluxuri
   * deodată, ține unul și îl aude pe celălalt.
   */
  solo?: boolean
}

export interface PolyrhythmLevelSource {
  id: string
  title: { ro: string; en: string }
  description: { ro: string; en: string }
  bpm: [number, number]
  /** Rapoartele din care se alege, scrise „peste : puls”. */
  ratios: [number, number][]
  /** Pulsul se aude, nu se bate: o singură mână, ca la lecție. */
  solo?: boolean
  /** Două măsuri în loc de una: același raport, ținut mai mult. */
  bars?: number
}

/*
  Tempoul e al PULSULUI, nu al măsurii. La 3 contra 2, pulsul are doi timpi pe
  măsură, deci 50 BPM înseamnă o măsură de 2,4 secunde, nu de 4,8.

  Intervalele sunt joase și urcă foarte încet, iar la rapoartele mari coboară
  din nou: nu viteza e dificultatea aici, ci independența mâinilor. Un 5 contra
  4 la 80 BPM nu e un exercițiu de poliritm, e o pată. Testul verifică pentru
  fiecare nivel, la tempoul lui cel mai mare, că două lovituri vecine nu ajung
  mai aproape de 90 ms una de alta.
*/
export const polyrhythmLevelsSource: PolyrhythmLevelSource[] = [
  {
    id: 'intro-solo',
    title: { ro: 'Trei peste un puls care merge singur', en: 'Three over a pulse that runs itself' },
    description: {
      ro: 'Pulsul îl ține aplicația. Tu bați doar cele trei note, cu o singură mână, ca la lecție.',
      en: 'The app holds the pulse. You tap only the three notes, with one hand, as in the lesson.',
    },
    bpm: [40, 46],
    ratios: [[3, 2]],
    solo: true,
  },
  {
    id: 'three-two',
    title: { ro: '3 contra 2', en: '3 against 2' },
    description: {
      ro: 'Trei note peste două. Grila comună e șesimea: trei cad pe 1·3·5, două pe 1·4.',
      en: 'Three notes over two. The common grid is the sixth: three fall on 1·3·5, two on 1·4.',
    },
    bpm: [44, 52],
    ratios: [[3, 2]],
  },
  {
    id: 'three-two-faster',
    title: { ro: '3 contra 2, mai repede', en: '3 against 2, faster' },
    description: {
      ro: 'Același raport, cu numărătoarea lăsată deoparte.',
      en: 'The same ratio, with the counting left behind.',
    },
    bpm: [52, 62],
    ratios: [[3, 2]],
  },
  {
    id: 'two-three',
    title: { ro: '2 contra 3', en: '2 against 3' },
    description: {
      ro: 'Pulsul în trei, ca la vals, și două note peste el.',
      en: 'The pulse in three, like a waltz, with two notes over it.',
    },
    bpm: [50, 60],
    ratios: [[2, 3]],
  },
  {
    id: 'three-four',
    title: { ro: '3 contra 4', en: '3 against 4' },
    description: {
      ro: 'Grila crește la douăsprezece: trei cad pe 1·5·9, patru pe 1·4·7·10.',
      en: 'The grid grows to twelve: three fall on 1·5·9, four on 1·4·7·10.',
    },
    bpm: [50, 60],
    ratios: [[3, 4]],
  },
  {
    id: 'four-three',
    title: { ro: '4 contra 3', en: '4 against 3' },
    description: {
      ro: 'Aceeași grilă, fluxurile schimbate: patru peste un puls de trei.',
      en: 'The same grid, flows swapped: four over a pulse of three.',
    },
    bpm: [50, 58],
    ratios: [[4, 3]],
  },
  {
    id: 'mixed-simple',
    title: { ro: '3 contra 2 și 3 contra 4', en: '3 against 2 and 3 against 4' },
    description: {
      ro: 'Două măsuri. Raportul nu se schimbă în mijloc, dar nu știi care vine.',
      en: 'Two bars. The ratio does not change halfway, but you do not know which one comes.',
    },
    bpm: [52, 62],
    ratios: [
      [3, 2],
      [3, 4],
      [4, 3],
    ],
    bars: 2,
  },
  {
    id: 'five-four',
    title: { ro: '5 contra 4', en: '5 against 4' },
    description: {
      ro: 'Cinci peste patru: grila are douăzeci de pași și nu se mai poate număra la viteză.',
      en: 'Five over four: the grid has twenty steps and can no longer be counted at speed.',
    },
    bpm: [46, 54],
    ratios: [[5, 4]],
  },
  {
    id: 'four-five',
    title: { ro: '4 contra 5', en: '4 against 5' },
    description: {
      ro: 'Pulsul în cinci, cel mai greu de ținut egal, fiindcă nu se împarte în doi.',
      en: 'The pulse in five, the hardest to keep even, because it does not split in two.',
    },
    bpm: [46, 54],
    ratios: [[4, 5]],
  },
  {
    id: 'five-three',
    title: { ro: '5 contra 3', en: '5 against 3' },
    description: {
      ro: 'Cincisprezece pași, și nicio poziție comună în afară de „unu”.',
      en: 'Fifteen steps, and no shared position other than the one.',
    },
    bpm: [44, 52],
    ratios: [
      [5, 3],
      [3, 5],
    ],
  },
  {
    id: 'everything',
    title: { ro: 'Totul la un loc', en: 'Everything together' },
    description: {
      ro: 'Oricare raport de mai sus, pe două măsuri.',
      en: 'Any ratio from above, over two bars.',
    },
    bpm: [52, 62],
    ratios: [
      [3, 2],
      [2, 3],
      [3, 4],
      [4, 3],
      [5, 4],
      [4, 5],
      [5, 3],
      [3, 5],
    ],
    bars: 2,
  },
]

export const POLYRHYTHM_LEVEL_COUNT = polyrhythmLevelsSource.length

/** Nivelul de poliritm (1…10) pentru un nivel adaptiv (1…100). */
export function polyrhythmLevelForAdaptive(level: number) {
  const clamped = Math.max(1, Math.min(MAX_GAME_LEVEL, Math.round(level) || 1))
  return 1 + Math.floor(((clamped - 1) * POLYRHYTHM_LEVEL_COUNT) / MAX_GAME_LEVEL)
}

export interface PolyrhythmRound extends PolyrhythmPattern {
  polyrhythmLevel: number
  stage: number
  step: number
  seed: number
}

const gcd = (left: number, right: number): number => (right === 0 ? left : gcd(right, left % right))
/** Cel mai mic număr de pași în care intră exact amândouă fluxurile. */
export const commonGrid = (left: number, right: number) => (left * right) / gcd(left, right)

/**
 * Un flux de `count` note egale, pe grila de `stepsPerBar` pași. Fiindcă grila
 * e cea comună, `stepsPerBar / count` e întreg: fiecare notă cade exact pe un
 * pas, niciuna între.
 */
function evenStream(count: number, stepsPerBar: number, bars: number): boolean[] {
  const steps = Array.from({ length: stepsPerBar * bars }, () => false)
  const spacing = stepsPerBar / count
  for (let bar = 0; bar < bars; bar += 1) {
    for (let index = 0; index < count; index += 1) steps[bar * stepsPerBar + index * spacing] = true
  }
  return steps
}

/** Poliritmul unui nivel, generat determinist din seed. */
export function generatePolyrhythm(polyrhythmLevel: number, seed: number): PolyrhythmPattern {
  const random = mulberry32(seed)
  const source =
    polyrhythmLevelsSource[Math.max(1, Math.min(POLYRHYTHM_LEVEL_COUNT, polyrhythmLevel)) - 1]!
  const [low, high] = source.bpm
  const bpm = low + Math.floor(random() * (high - low + 1))
  const [crossCount, pulseCount] = source.ratios[Math.floor(random() * source.ratios.length)]!
  const bars = source.bars ?? 1
  const stepsPerBar = commonGrid(crossCount, pulseCount)
  // Mâna care ia fluxul greu se schimbă de la o rundă la alta.
  const crossHand: PolyrhythmHand = random() < 0.5 ? 'left' : 'right'
  const pulseHand: PolyrhythmHand = crossHand === 'left' ? 'right' : 'left'
  const crossStream = evenStream(crossCount, stepsPerBar, bars)
  const pulseStream = evenStream(pulseCount, stepsPerBar, bars)
  const common = {
    stepsPerBar,
    // Pulsul e un flux, nu un al treilea reper: metronomul cade pe el.
    beatsPerBar: pulseCount,
    bpm,
    crossCount,
    pulseCount,
    crossHand,
  }
  if (source.solo) {
    /*
      Mecanica lecției: pulsul intră în acompaniament, deci se aude și sub model,
      și sub răspuns, partea din urmă e tot ce contează. Fără ea n-ar exista
      poliritm, ci un ritm ciudat bătut singur. Nu intră în ținte, deci nu se
      punctează, iar mâna lui nu are nimic de bătut.
    */
    return {
      ...common,
      solo: true,
      lanes: {
        [crossHand]: crossStream,
        [pulseHand]: crossStream.map(() => false),
      } as Record<PolyrhythmHand, boolean[]>,
      backing: { [PULSE_SOUND]: pulseStream },
    }
  }
  return {
    ...common,
    lanes: {
      [crossHand]: crossStream,
      [pulseHand]: pulseStream,
    } as Record<PolyrhythmHand, boolean[]>,
  }
}

export function polyrhythmRoundForLevel(level: number, attempt = 0): PolyrhythmRound {
  const seed = seedForLevel('polyrhythm', level, attempt)
  const polyrhythmLevel = polyrhythmLevelForAdaptive(level)
  const position = levelPosition(level)
  return {
    ...generatePolyrhythm(polyrhythmLevel, seed),
    polyrhythmLevel,
    stage: position.stage,
    step: position.step,
    seed,
  }
}

/**
 * Pozițiile fiecărui flux pe grila comună, numărate de la 1, cum le scrie
 * lecția („1 · 3 · 5”). Pentru eticheta rundei și pentru ghidul de sub bandă.
 */
export function streamPositions(count: number, stepsPerBar: number): number[] {
  const spacing = stepsPerBar / count
  return Array.from({ length: count }, (_, index) => index * spacing + 1)
}
