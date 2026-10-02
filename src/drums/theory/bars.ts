import { kitPieces, type Bar, type DrumExercise, type Hit, type KitPiece, type Vocabulary } from '../exercise'
import { snareBar } from '../snare-bar'
import type { DrumPlan } from '../plan'

/*
  Măsurile exemplelor din manual, scrise ca rânduri de caractere.

  Aceeași convenție ca la groove-uri (`lib/drums/grooves.ts`) și din același
  motiv: rândurile stau unul sub altul exact ca pe portativ, deci ce e aliniat pe
  verticală se lovește deodată, iar o greșeală de tipar se vede cu ochiul liber
  fiindcă rândurile nu se mai potrivesc.

  Helper-ul e scris încă o dată aici, nu importat din `grooves.ts`, fiindcă acolo
  e privat și așa trebuie să rămână: datele groove-urilor nu au de ce să devină o
  bibliotecă pentru manual. Dacă ajung să fie trei copii, atunci se mută.
*/

/**
 * Ce are voie să folosească un exemplu de manual: tot kitul, toate intensitățile.
 *
 * Larg, spre deosebire de vocabularele de practică, și nu din neglijență. Acolo
 * vocabularul E dificultatea: un nivel nu poate produce ceva mai greu decât ce i
 * s-a dat. Aici nu există nivel și nu se cere nimeni să cânte nimic; un exemplu
 * arată ce EXISTĂ, iar un manual care n-ar avea voie să pomenească tomul mediu
 * până la o anumită lecție ar fi un manual prost. Ce rămâne verificat e ce chiar
 * poate strica ceva: diviziunile admise și regula de 90 ms dintre lovituri.
 */
export const theoryVocabulary: Vocabulary = {
  pieces: kitPieces,
  hits: ['ghost', 'normal', 'accent'],
  // 12: grila comună a subdiviziunilor amestecate (`mixed-grid.ts`), pentru fill-urile avansate.
  stepsPerBeat: [1, 2, 3, 4, 12],
}

/**
 *   'x' = lovitură normală    'X' = accent    'o' = ghost note    '.' = pauză
 */
export function theoryBar(rows: Partial<Record<KitPiece, string>>): Bar {
  const lanes: Bar['lanes'] = {}
  for (const [piece, row] of Object.entries(rows) as [KitPiece, string][]) {
    lanes[piece] = [...row].map((character): Hit | null =>
      character === 'X' ? 'accent' : character === 'o' ? 'ghost' : character === 'x' ? 'normal' : null,
    )
  }
  return { lanes }
}

/**
 * Un exemplu de manual dintr-o singură măsură.
 *
 * Intervalul de tempo e larg dinadins și nu se alege pe exemplu: exemplul se
 * aude la `bpm`-ul cerut de lecție, iar intervalul e doar ce validarea are
 * nevoie ca să verifice regula de 90 ms dintre două lovituri ale aceleiași
 * mâini (`MIN_HAND_GAP_MS`). Capătul de sus e cel pe care exemplul chiar l-ar
 * suporta, nu unul rotund.
 */
export function demoExercise(options: {
  id: string
  stepsPerBar: number
  rows: Partial<Record<KitPiece, string>>
  /** Măsuri suplimentare, când exemplul are nevoie de mai mult de una. */
  extraBars?: Partial<Record<KitPiece, string>>[]
  beatsPerBar?: number
  tempo: { min: number; max: number; suggested: number }
}): DrumExercise {
  return {
    id: options.id,
    kind: 'demo',
    stepsPerBar: options.stepsPerBar,
    beatsPerBar: options.beatsPerBar ?? 4,
    bars: [theoryBar(options.rows), ...(options.extraBars ?? []).map(theoryBar)],
    tempo: options.tempo,
  }
}

/**
 * Un exemplu de manual bătut numai pe toba mică, scris pe mâini.
 *
 * Etapa „Mâinile" nu are nevoie de piese: tot ce predă e CU CE mână, în ce
 * ordine și cât de tare. Un exemplu scris cu `demoExercise` ar fi cerut un rând
 * de `'xxxx'` pe tobă mică, identic la toate, plus sticking-ul pe lângă, adică
 * exact informația care contează, scrisă cel mai departe de ochi.
 *
 * Măsurile se scriu ca șiruri paralele (`snare-bar.ts`), aceeași convenție ca
 * la rudimentele de practică, deci un rudiment poate fi citat într-o lecție
 * fără să fie rescris în alt format.
 */
export function snareDemo(options: {
  id: string
  /** Măsurile, una pe intrare: sticking-ul și, opțional, marcajele lui. */
  bars: { sticking: string; accents?: string; ghosts?: string; grace?: string }[]
  beatsPerBar?: number
  tempo: { min: number; max: number; suggested: number }
}): DrumExercise {
  const first = options.bars[0]
  if (!first) throw new Error(`${options.id}: exemplu fără măsuri`)
  return {
    id: options.id,
    kind: 'demo',
    stepsPerBar: first.sticking.length,
    beatsPerBar: options.beatsPerBar ?? 4,
    bars: options.bars.map(({ sticking, ...marks }) => snareBar(sticking, marks)),
    tempo: options.tempo,
  }
}

/**
 * Clicul rărit: din toate pătrimile planificate rămân doar timpii ceruți pe
 * fiecare măsură a exercițiului (de la 1), reluați ciclic.
 *
 * Se lucrează pe plan, nu în randare: cheia de cache se face din clicurile
 * planului, deci un clic rărit e altă pistă fără nimic în plus.
 */
export function thinClicks(plan: DrumPlan, beatsByBar: readonly (readonly number[])[]): DrumPlan {
  if (beatsByBar.length === 0) return plan
  return {
    ...plan,
    clicks: plan.clicks.filter((click) => {
      const bar = plan.bars[click.bar]
      if (!bar || bar.exerciseBar < 0) return true
      return beatsByBar[bar.exerciseBar % beatsByBar.length]!.includes(click.beat + 1)
    }),
  }
}
