import { mulberry32 } from '../rhythm/game/random'
import { MAX_BPM, type DrumExercise } from './exercise'
import { MAX_SESSION_MS, type MedleyItem } from './plan'

/*
  Modurile de sesiune.

  Toate sunt variații de PLANIFICARE peste motorul de la Etapa 1, nu motoare noi.
  Fiecare primește un exercițiu, un tempo și o durată și întoarce lista de bucăți
  pe care `planDrumMedley` le pune cap la cap. Nimic nu se decide în timpul
  sesiunii, fiindcă nimic NU POATE fi decis atunci: toată sesiunea e un singur
  WAV, randat înainte de primul sunet (mobile/CLAUDE.md §4).

  Consecința e reală și merită spusă: un mod care ar avea nevoie să reacționeze
  la ce cânți nu se poate construi așa. Nu e o limitare a modurilor de mai jos, e
  limita tuturor modurilor posibile cât timp aplicația nu aude nimic.
*/

export interface ModeInput {
  exercise: DrumExercise
  /**
   * Exercițiile deschise din catalog. Ruleta și schimbarea de stil aleg de aici,
   * deci nu pot scoate niciodată ceva ce nu a fost încă deblocat.
   */
  pool: readonly DrumExercise[]
  bpm: number
  seconds: number
  /** Aceeași sămânță dă aceeași sesiune: un mod aleator rămâne reproductibil. */
  seed: number
}

export interface PracticeMode {
  id: string
  labelKey: string
  howToKey: string
  build: (input: ModeInput) => MedleyItem[]
  /**
   * Recordul se ia și la oprire, nu doar la final.
   *
   * Doar la Rezistență: acolo întrebarea E cât ai ținut, deci oprirea nu e un
   * eșec, e rezultatul. Peste tot altundeva, o sesiune oprită la mijloc nu spune
   * nimic despre tempoul pe care îl poți ține, și nu se salvează.
   */
  recordOnStop?: boolean
  /** Durata nu se alege: modul o stabilește singur. */
  fixedDuration?: boolean
}

const barMsOf = (exercise: DrumExercise, bpm: number) => (60_000 / bpm) * exercise.beatsPerBar
const passMsOf = (exercise: DrumExercise, bpm: number) => barMsOf(exercise, bpm) * exercise.bars.length

/** Câte treceri încap în durata cerută, lăsând loc numărătorii. Minimum una. */
function passesFor(exercise: DrumExercise, bpm: number, targetMs: number) {
  const usable = Math.min(targetMs, MAX_SESSION_MS) - barMsOf(exercise, bpm)
  return Math.max(1, Math.floor(usable / passMsOf(exercise, bpm)))
}

/** Cu cât urcă tempoul la fiecare treaptă a scării. */
export const LADDER_STEP = 4

/** Același exercițiu, același tempo, până la capăt. Modul obișnuit. */
export const steadyMode: PracticeMode = {
  id: 'steady',
  labelKey: 'drums.mode_steady',
  howToKey: 'drums.mode_steady_how',
  build: ({ exercise, bpm, seconds }) => [
    { exercise, bpm, repeats: passesFor(exercise, bpm, seconds * 1000) },
  ],
}

/**
 * Scara: tempoul urcă treaptă cu treaptă, de la cel ales până unde se termină
 * durata sau intervalul exercițiului.
 *
 * Toate treptele se știu dinainte, deci intră în același WAV. Asta e diferența
 * practică față de un metronom cu timere: acolo, o schimbare de tempo la mijloc
 * ar cere repornirea redării, adică exact golul în care iOS suspendă JS-ul.
 */
export const ladderMode: PracticeMode = {
  id: 'ladder',
  labelKey: 'drums.mode_ladder',
  howToKey: 'drums.mode_ladder_how',
  build: ({ exercise, bpm, seconds }) => {
    const items: MedleyItem[] = []
    const budget = Math.min(seconds * 1000, MAX_SESSION_MS) - barMsOf(exercise, bpm)
    // Două treceri pe treaptă: una singură nu ajunge ca să simți tempoul nou.
    const repeats = 2
    let used = 0
    /*
      Scara urcă până la capătul intervalului recomandat. Dacă ai pornit deja
      peste el, ai voie, vezi `MAX_BPM`, recomandarea nu mai are ce spune, deci
      urcă până la plafonul aplicației. Altfel bucla n-ar face nicio treaptă și
      modul ar părea stricat exact la tempourile pentru care l-ai ales.
    */
    const ceiling = bpm > exercise.tempo.max ? MAX_BPM : exercise.tempo.max
    for (let step = bpm; step <= ceiling; step += LADDER_STEP) {
      const cost = passMsOf(exercise, step) * repeats
      if (used + cost > budget) break
      items.push({ exercise, bpm: step, repeats })
      used += cost
    }
    // Chiar dacă nu încape nici prima treaptă întreagă, sesiunea are ce cânta.
    return items.length ? items : [{ exercise, bpm, repeats: 1 }]
  },
}

/**
 * Ruleta: exercițiul se schimbă din mers, dintre cele deblocate.
 *
 * Exercițiul ales pe ecran intră primul, altfel ai apăsa pe „Paradiddle” și ai
 * auzi altceva. Pe urmă vin altele, fără să se repete unul după altul.
 */
export const rouletteMode: PracticeMode = {
  id: 'roulette',
  labelKey: 'drums.mode_roulette',
  howToKey: 'drums.mode_roulette_how',
  build: (input) => pickSequence(input, () => true),
}

/**
 * Schimbarea de stil: ca ruleta, dar caută de fiecare dată ALT stil.
 *
 * Greutatea nu e groove-ul, e trecerea: să treci din rock în shuffle fără să
 * pierzi pulsul. De aceea alegerea preferă un stil diferit de cel dinainte, și
 * cade înapoi pe orice groove doar dacă nu găsește.
 */
export const genreSwitchMode: PracticeMode = {
  id: 'genre',
  labelKey: 'drums.mode_genre',
  howToKey: 'drums.mode_genre_how',
  build: (input) => pickSequence(input, (candidate, previous) => candidate.style !== previous.style),
}

function pickSequence(
  { exercise, pool, bpm, seconds, seed }: ModeInput,
  prefers: (candidate: DrumExercise, previous: DrumExercise) => boolean,
): MedleyItem[] {
  const random = mulberry32(seed)
  const budget = Math.min(seconds * 1000, MAX_SESSION_MS) - barMsOf(exercise, bpm)
  // Două treceri prin fiecare, altfel schimbarea vine înainte să te așezi în ea.
  const repeats = 2
  const items: MedleyItem[] = []
  let previous = exercise
  let used = 0

  while (true) {
    const cost = passMsOf(previous, bpm) * repeats
    if (used + cost > budget) break
    items.push({ exercise: previous, bpm, repeats })
    used += cost

    const others = pool.filter((candidate) => candidate.id !== previous.id)
    if (others.length === 0) break
    const preferred = others.filter((candidate) => prefers(candidate, previous))
    const choices = preferred.length ? preferred : others
    previous = choices[Math.floor(random() * choices.length)]!
  }
  return items.length ? items : [{ exercise, bpm, repeats: 1 }]
}

/**
 * Rezistență: același groove, cât ține plafonul. Se oprește când oprești tu.
 *
 * E singurul mod în care oprirea nu înseamnă eșec, întrebarea chiar E cât ai
 * ținut. De aceea `recordOnStop`, și de aceea durata nu se alege: ar fi o
 * contradicție să ceri „ține cât poți” și să spui dinainte cât.
 */
export const survivalMode: PracticeMode = {
  id: 'survival',
  labelKey: 'drums.mode_survival',
  howToKey: 'drums.mode_survival_how',
  recordOnStop: true,
  fixedDuration: true,
  build: ({ exercise, bpm }) => [
    { exercise, bpm, repeats: passesFor(exercise, bpm, MAX_SESSION_MS) },
  ],
}

/**
 * Fill-uri inventate: groove-ul rămâne, măsura ta se golește.
 *
 * Nu se schimbă planificarea, ci exercițiul: ultima măsură rămâne marcată `fill`
 * (deci `render.ts` tace acolo) dar fără nicio lovitură scrisă. Pe ecran nu mai
 * ai ce citi în măsura ta, și ăsta e tot rostul, inventezi.
 */
export const creativeFillsMode: PracticeMode = {
  id: 'creative',
  labelKey: 'drums.mode_creative',
  howToKey: 'drums.mode_creative_how',
  build: ({ exercise, bpm, seconds }) => {
    const blank: DrumExercise = {
      ...exercise,
      id: `${exercise.id}-creative`,
      bars: exercise.bars.map((bar) => (bar.fill ? { lanes: {}, fill: true } : bar)),
    }
    return [{ exercise: blank, bpm, repeats: passesFor(blank, bpm, seconds * 1000) }]
  },
}
