import {
  GRACE_SPACING_MS,
  onsetsOf,
  type DrumExercise,
  type Hit,
  type KitPiece,
  type Stick,
} from './exercise'

/*
  Exercițiu + tempo + durată  ->  lista de lovituri, în milisecunde.

  Logică pură: nicio dependență de React, de audio sau de mostre. Tot ce urmează
  în sesiune se știe dinainte, inclusiv urcările de tempo, ceea ce e chiar
  condiția ca sesiunea să încapă într-un singur WAV (mobile/CLAUDE.md §4,
  PLAN-TOBE.md §3). Nu există timere JS între bătăi, deci nu există drift
  acumulat; dacă ceva ar trebui decis „la momentul respectiv”, nu încape aici, și
  atunci nu încape nici în model.
*/

/** O porțiune de sesiune la un tempo fix: exercițiul rulat `repeats` ori. */
export interface TempoSegment {
  bpm: number
  /** Câte treceri complete prin măsurile exercițiului. */
  repeats: number
}

export interface SessionOptions {
  segments: readonly TempoSegment[]
  /** Măsuri de numărătoare înainte de orice. Cerute explicit în brief. */
  countInBars?: number
  /** Metronomul pe pătrimi. Implicit pornit: el e rostul unui însoțitor. */
  clicks?: boolean
}

export interface PlannedHit {
  atMs: number
  piece: KitPiece
  hit: Hit
  stick: Stick | null
  /** Indexul măsurii din sesiune (numărătoarea inclusă), nu din exercițiu. */
  bar: number
  step: number
  /**
   * Notă de grație, nu lovitură pe pas. Cade înaintea pasului ei, deci timpul îi
   * poate fi și negativ față de începutul măsurii. Nu se numără ca lovitură nici
   * pe ecran, nici în progres.
   */
  grace?: true
}

export interface PlannedClick {
  atMs: number
  /** Prima bătaie a măsurii se aude mai sus și mai tare. */
  accent: boolean
  bar: number
  beat: number
}

export interface PlannedBar {
  index: number
  /** Ce exercițiu se cântă aici. Diferă de la o măsură la alta într-un medley. */
  exerciseId: string
  stepsPerBar: number
  beatsPerBar: number
  atMs: number
  endMs: number
  bpm: number
  stepMs: number
  countIn: boolean
  /** A câta măsură cântată e, fără numărătoare; `-1` la numărătoare. */
  musicalIndex: number
  fill: boolean
  /** Care măsură din exercițiu e; `-1` la numărătoare. */
  exerciseBar: number
  /** A câta trecere prin exercițiu; `-1` la numărătoare. */
  repeat: number
}

export interface DrumPlan {
  /** Primul exercițiu. Într-un medley, restul se citesc din `bars`. */
  exerciseId: string
  stepsPerBar: number
  beatsPerBar: number
  /** Toate exercițiile care se cântă, în ordine, fără repetări consecutive. */
  exerciseIds: string[]
  bars: PlannedBar[]
  hits: PlannedHit[]
  clicks: PlannedClick[]
  /**
   * Sfârșitul muzical al sesiunii. Randarea poate depăși valoarea asta, ca să
   * lase un crash să se stingă, vezi `render.ts`.
   */
  totalMs: number
  /** Cel mai mare tempo atins. Recordul personal se ia de aici (§5). */
  peakBpm: number
  /** Setat când plafonul de durată a tăiat repetări; valoarea e cea cerută. */
  cappedFromMs?: number
  /** Sesiunea se reia în buclă și nu se termină singură. Vezi `MedleyOptions`. */
  loop?: true
}

/**
 * Plafonul de durată al unei sesiuni.
 *
 * Nu e o limită muzicală, e una de memorie: 60 s mono 16-bit la 44,1 kHz sunt
 * 5,3 MB, iar 3 minute ar fi 15,9 MB, într-un `Float32Array` în timpul
 * randării, de patru ori atât. Provocările lungi se compun din mai multe
 * reprize. Cifra exactă se coboară dacă un telefon vechi spune altceva.
 */
export const MAX_SESSION_MS = 90_000

/*
  Toleranța cu care se compară durata cu plafonul.

  Timpii se adună măsură după măsură, în virgulă mobilă: 18 măsuri la 72 BPM dau
  60000.000000000015 ms, nu 60000. Fără toleranță, o sesiune care încape exact ar
  fi tăiată de o eroare de a cincisprezecea zecimală, și simptomul ar fi „la
  unele tempouri lipsește ultima trecere”, ceea ce nu duce nimeni la virgula
  mobilă.
*/
const CAP_TOLERANCE_MS = 1e-6

const DEFAULT_COUNT_IN_BARS = 1

/** O bucată de medley: un exercițiu, la un tempo, de atâtea ori. */
export interface MedleyItem {
  exercise: DrumExercise
  bpm: number
  /** Câte treceri complete prin măsurile exercițiului. */
  repeats: number
}

export interface MedleyOptions {
  countInBars?: number
  clicks?: boolean
  /**
   * Sesiunea se reia în buclă, deci nu are sfârșit.
   *
   * Bucla o face PLAYERUL, nativ, nu JS-ul: un `seek` la capăt ar fi o acțiune
   * care trebuie să se întâmple exact atunci, iar cu ecranul blocat iOS suspendă
   * JS-ul și sunetul s-ar opri acolo (mobile/CLAUDE.md §4). Redarea în buclă e
   * fix ce face și metronomul din `lib/audio/metronome-engine.ts`, din același
   * motiv.
   *
   * Consecința pe care trebuie s-o știi: bucla nu are numărătoare. Ea s-ar auzi
   * la FIECARE reluare, iar o măsură de click la fiecare ciclu nu e numărătoare,
   * e o gaură în groove.
   */
  loop?: boolean
}

/**
 * Sesiunea, planificată de la cap la coadă, inclusiv schimbările de exercițiu.
 *
 * Asta e forma generală; o sesiune cu un singur exercițiu (`planDrumSession`) e
 * doar cazul în care toate bucățile au același exercițiu. Modurile din Etapa 6
 *, scara de tempo, ruleta, schimbarea de stil, sunt liste de bucăți, nu
 * motoare noi: totul se știe dinainte, deci totul încape în același WAV
 * (mobile/CLAUDE.md §4).
 */
export function planDrumMedley(items: readonly MedleyItem[], options: MedleyOptions = {}): DrumPlan {
  const usable = items.filter((item) => item.repeats > 0 && item.bpm > 0)
  if (usable.length === 0) throw new Error('sesiune fără nicio repetare')
  const countInBars = options.countInBars ?? DEFAULT_COUNT_IN_BARS
  const withClicks = options.clicks !== false

  const bars: PlannedBar[] = []
  const hits: PlannedHit[] = []
  const clicks: PlannedClick[] = []
  let atMs = 0
  let peakBpm = 0
  let requestedMs: number | undefined
  let musical = 0

  const passMsOf = (item: MedleyItem) =>
    (60_000 / item.bpm) * item.exercise.beatsPerBar * item.exercise.bars.length

  const pushBar = (exercise: DrumExercise, bpm: number, exerciseBar: number, repeat: number) => {
    const beatMs = 60_000 / bpm
    const barMs = beatMs * exercise.beatsPerBar
    const index = bars.length
    const countIn = exerciseBar < 0
    const bar: PlannedBar = {
      index,
      exerciseId: exercise.id,
      stepsPerBar: exercise.stepsPerBar,
      beatsPerBar: exercise.beatsPerBar,
      atMs,
      endMs: atMs + barMs,
      bpm,
      stepMs: beatMs / (exercise.stepsPerBar / exercise.beatsPerBar),
      countIn,
      musicalIndex: countIn ? -1 : musical,
      fill: !countIn && (exercise.bars[exerciseBar]?.fill ?? false),
      exerciseBar,
      repeat,
    }
    if (!countIn) musical += 1
    bars.push(bar)
    if (withClicks) {
      for (let beat = 0; beat < exercise.beatsPerBar; beat += 1) {
        clicks.push({ atMs: atMs + beat * beatMs, accent: beat === 0, bar: index, beat })
      }
    }
    atMs = bar.endMs
    return bar
  }

  const first = usable[0]!
  for (let bar = 0; bar < countInBars; bar += 1) pushBar(first.exercise, first.bpm, -1, -1)

  /*
    Cât ar ține sesiunea cerută, dacă plafonul n-ar exista. Se calculează
    dinainte, ca mesajul să spună ce s-a cerut, nu ce a mai încăput.
  */
  const requested = atMs + usable.reduce((total, item) => total + passMsOf(item) * item.repeats, 0)

  let repeat = 0
  let capped = false
  for (const item of usable) {
    if (capped) break
    const onsets = onsetsOf(item.exercise)
    for (let pass = 0; pass < item.repeats; pass += 1) {
      /*
        Plafonul taie trecere întreagă, nu măsură: o sesiune oprită în mijlocul
        unui paradiddle se termină pe mâna greșită, iar ultimul lucru exersat
        rămâne o greșeală. Și taie de la capăt încolo, nu sare peste o trecere ca
        să încapă una mai scurtă de mai târziu, fiindcă o scară de tempo cu o
        treaptă lipsă nu mai e o scară.
      */
      if (atMs + passMsOf(item) > MAX_SESSION_MS + CAP_TOLERANCE_MS) {
        capped = true
        requestedMs = requested
        break
      }
      item.exercise.bars.forEach((_, exerciseBar) => {
        const bar = pushBar(item.exercise, item.bpm, exerciseBar, repeat)
        for (const onset of onsets) {
          if (onset.bar !== exerciseBar) continue
          const hitMs = bar.atMs + onset.step * bar.stepMs
          /*
            Grațiile, înaintea loviturii, la distanță fixă în ms, nu pe pași.
            Ultima cade la 32 ms înaintea loviturii, cea dinaintea ei la 64.
          */
          if (onset.grace) {
            for (let index = 0; index < onset.grace.strokes; index += 1) {
              const before = (onset.grace.strokes - index) * GRACE_SPACING_MS
              hits.push({
                atMs: hitMs - before,
                piece: onset.piece,
                hit: 'ghost',
                stick: onset.grace.stick,
                bar: bar.index,
                step: onset.step,
                grace: true,
              })
            }
          }
          hits.push({
            atMs: hitMs,
            piece: onset.piece,
            hit: onset.hit,
            stick: onset.stick,
            bar: bar.index,
            step: onset.step,
          })
        }
      })
      // Tempoul se socotește atins doar după o trecere chiar cântată: recordul
      // personal se citește din `peakBpm`, și n-are ce căuta acolo o treaptă
      // pe care plafonul a tăiat-o înainte să sune.
      peakBpm = Math.max(peakBpm, item.bpm)
      repeat += 1
    }
  }

  if (repeat === 0) {
    throw new Error(`o singură trecere depășește plafonul de ${MAX_SESSION_MS} ms`)
  }

  hits.sort((left, right) => left.atMs - right.atMs)
  const played = bars.filter((bar) => !bar.countIn)
  return {
    exerciseId: first.exercise.id,
    stepsPerBar: first.exercise.stepsPerBar,
    beatsPerBar: first.exercise.beatsPerBar,
    // Fără repetări consecutive: într-o ruletă de 12 treceri ne interesează ce
    // exerciții au sunat și în ce ordine, nu de câte ori la rând.
    exerciseIds: played
      .map((bar) => bar.exerciseId)
      .filter((id, index, all) => id !== all[index - 1]),
    bars,
    hits,
    clicks,
    totalMs: atMs,
    peakBpm,
    ...(requestedMs === undefined ? {} : { cappedFromMs: requestedMs }),
    ...(options.loop ? { loop: true as const } : {}),
  }
}

/** Următoarea schimbare de exercițiu dintr-o sesiune. */
export interface NextExerciseChange {
  exerciseId: string
  /** Indexul în `plan.bars` al măsurii de la care se cântă altceva. */
  barIndex: number
  /** Câte măsuri mai sunt până acolo, socotind-o pe cea curentă ca una. */
  barsUntil: number
  atMs: number
}

/**
 * Ce urmează după măsura care sună acum, sau `null`, dacă nu se mai schimbă
 * nimic.
 *
 * Există pentru ecran, nu pentru sunet: într-o ruletă sau la schimbarea de stil,
 * groove-ul se schimbă din mers, iar dacă îl vezi abia când a început, prima
 * măsură e pierdută, te uiți la ea în loc s-o cânți. Aplicația ȘTIE ce urmează
 * (toată sesiunea e planificată înainte de primul sunet), deci n-are niciun
 * motiv să te lase surprins.
 *
 * Se caută prima măsură cu alt exercițiu decât cel curent, nu prima bucată din
 * plan: într-un medley același exercițiu ține mai multe treceri la rând, iar
 * „urmează” înseamnă schimbarea, nu trecerea.
 */
export function nextExerciseChange(plan: DrumPlan, fromIndex: number): NextExerciseChange | null {
  const current = plan.bars[fromIndex]
  // Înainte de start și pe numărătoare, referința e primul exercițiu cântat.
  const currentId = current?.exerciseId ?? plan.exerciseId
  const from = Math.max(-1, fromIndex)
  for (let index = from + 1; index < plan.bars.length; index += 1) {
    const bar = plan.bars[index]!
    if (bar.exerciseId === currentId) continue
    return {
      exerciseId: bar.exerciseId,
      barIndex: index,
      // Numărătoarea nu se pune la socoteală: „peste 2 măsuri” trebuie să
      // însemne două măsuri cântate, altfel numărul nu se potrivește cu ce vezi.
      barsUntil: bar.musicalIndex - Math.max(0, current?.musicalIndex ?? 0),
      atMs: bar.atMs,
    }
  }
  return null
}

/** O sesiune cu un singur exercițiu: cazul obișnuit, peste `planDrumMedley`. */
export function planDrumSession(exercise: DrumExercise, options: SessionOptions): DrumPlan {
  return planDrumMedley(
    options.segments.map((segment) => ({ exercise, bpm: segment.bpm, repeats: segment.repeats })),
    { countInBars: options.countInBars, clicks: options.clicks },
  )
}

/** Câte treceri încap într-o durată dorită, la un tempo fix. Minimum una. */
export function segmentsForDuration(
  exercise: DrumExercise,
  bpm: number,
  targetMs: number,
  countInBars = DEFAULT_COUNT_IN_BARS,
): TempoSegment[] {
  const barMs = (60_000 / bpm) * exercise.beatsPerBar
  const passMs = barMs * exercise.bars.length
  const usable = Math.min(targetMs, MAX_SESSION_MS) - countInBars * barMs
  return [{ bpm, repeats: Math.max(1, Math.floor(usable / passMs)) }]
}

export interface LadderOptions {
  from: number
  to: number
  /** Cu cât urcă tempoul la fiecare treaptă. */
  step: number
  /** Câte treceri se fac la fiecare treaptă înainte de a urca. */
  repeatsPerStep: number
}

/**
 * Scara de tempo (Rudiment Ladder): urcă din `from` în `to`.
 *
 * Toate treptele se știu dinainte, deci intră în același WAV. Asta e diferența
 * practică față de un metronom cu timere: acolo, o schimbare de tempo la mijloc
 * ar cere repornirea redării, adică exact golul în care iOS suspendă JS-ul.
 */
export function ladderSegments(options: LadderOptions): TempoSegment[] {
  const { from, to, step, repeatsPerStep } = options
  if (step <= 0) throw new Error('treapta scării trebuie să fie pozitivă')
  const segments: TempoSegment[] = []
  for (let bpm = from; bpm <= to; bpm += step) segments.push({ bpm, repeats: repeatsPerStep })
  if (segments.length === 0) segments.push({ bpm: from, repeats: repeatsPerStep })
  return segments
}

/** Bătaia pe care cade un moment, pentru numărătoarea de pe ecran. */
export function beatAt(plan: DrumPlan, atMs: number): { bar: number; beat: number } | null {
  const bar = plan.bars.find((candidate) => atMs >= candidate.atMs && atMs < candidate.endMs)
  if (!bar) return null
  const beatMs = 60_000 / bar.bpm
  return { bar: bar.index, beat: Math.floor((atMs - bar.atMs) / beatMs) }
}
