import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { chordById, MAX_BPM } from './changes'
import type { ChordShape } from './chords'

/*
  Însoțitorul de strumming: un model de lovituri, pe acorduri sau pe corzi
  amortizate, cu metronom.

  Ideea pe care stă tot (skill-ul `predare-chitara`, Etapa „Ritmul"): mâna care
  ciupește se mișcă tot timpul, jos-sus, ca un pendul; modelul se face din
  loviturile pe care le RATEAZĂ. De aceea un model se scrie ca grila de la tobe,
  un caracter pe pas, și de aceea direcția nu se alege: o dă poziția pe grilă.

    'D' în jos            'U' în sus
    'A' accent în jos     'B' accent în sus
    'x' chuck: lovitură amortizată, fără notă (direcția o dă tot poziția)
    '.' ratat: mâna trece pe lângă corzi, acordul sună mai departe
    '-' pauză: coardele se amortizează, nu mai sună nimic

  La optimi și șaisprezecimi, pașii pari sunt în jos și cei impari în sus. La
  triolete (shuffle), primul pas din fiecare grup de trei e în jos, al treilea
  în sus, iar cel din mijloc nu se lovește. `validateStrumPattern` verifică asta:
  un `U` pe un pas „de jos" e aproape sigur o greșeală de scris.

  Aplicația nu aude chitara și nu punctează nimic: ține timpul, arată modelul și
  poate să-l cânte.
*/

export type StrumStep = 'D' | 'U' | 'A' | 'B' | 'x' | '.' | '-'

/** Pași pe timp: 2 = optimi, 4 = șaisprezecimi, 3 = triolete (shuffle). */
export type StepsPerBeat = 2 | 3 | 4

export interface StrumExercise {
  id: string
  title: LocalizedText
  tip: LocalizedText
  stepsPerBeat: StepsPerBeat
  /** Toată măsura (sau două), un caracter pe pas. */
  pattern: string
  tempo: { min: number; max: number; suggested: number }
  /** Progresia cu care se deschide exercițiul (id din `STRUM_PROGRESSIONS`). */
  progression: string
}

export interface StrumLevel {
  id: string
  title: LocalizedText
  summary: LocalizedText
  accent: string
  soft: string
  exercises: StrumExercise[]
}

export interface StrumProgression {
  id: string
  label: LocalizedText
  /** Un acord pe măsură, id-uri din bibliotecă. Gol = corzi amortizate. */
  chords: string[]
}

export const BEATS_PER_BAR = 4

/** Pe ce să cânți modelul. Prima variantă e fără acorduri: doar mâna. */
export const STRUM_PROGRESSIONS: StrumProgression[] = [
  { id: 'mute', label: { ro: 'Fără acorduri', en: 'No chords' }, chords: [] },
  { id: 'em', label: { ro: 'Em', en: 'Em' }, chords: ['Em'] },
  { id: 'g-c-d-c', label: { ro: 'G – C – D – C', en: 'G – C – D – C' }, chords: ['G', 'C', 'D', 'C'] },
  { id: 'em-c-g-d', label: { ro: 'Em – C – G – D', en: 'Em – C – G – D' }, chords: ['Em', 'C', 'G', 'D'] },
  { id: 'am-f-c-g', label: { ro: 'Am – F – C – G', en: 'Am – F – C – G' }, chords: ['Am', 'F-mic', 'C', 'G'] },
  { id: 'e-a-b7-a', label: { ro: 'E – A – B7 – A', en: 'E – A – B7 – A' }, chords: ['E', 'A', 'B7', 'A'] },
]

const tempo = (min: number, suggested: number) => ({ min, max: MAX_BPM, suggested })

export const strumLevels: StrumLevel[] = [
  {
    id: 'primii-pasi',
    title: { ro: 'Primii pași', en: 'First steps' },
    summary: {
      ro: 'Pătrimi, apoi optimi. Mâna învață mișcarea de pendul care nu se oprește.',
      en: 'Quarters, then eighths. The hand learns the pendulum motion that never stops.',
    },
    accent: '#FF7A00',
    soft: '#FFF1E3',
    exercises: [
      {
        id: 'patrimi',
        title: { ro: 'Pătrimi în jos', en: 'Quarter downstrokes' },
        tip: {
          ro: 'O lovitură în jos pe fiecare timp. Între ele, mâna urcă oricum, doar că pe lângă corzi.',
          en: 'One downstroke on every beat. In between, the hand still comes up, just missing the strings.',
        },
        stepsPerBeat: 2,
        pattern: 'D.D.D.D.',
        tempo: tempo(40, 70),
        progression: 'em',
      },
      {
        id: 'optimi',
        title: { ro: 'Optimi jos-sus', en: 'Eighths, down-up' },
        tip: {
          ro: 'Jos pe timp, sus pe „și". Aceeași mișcare ca la pătrimi, doar că acum și urcarea atinge corzile.',
          en: 'Down on the beat, up on the "and". The same motion as quarters, except the upstroke now hits the strings too.',
        },
        stepsPerBeat: 2,
        pattern: 'DUDUDUDU',
        tempo: tempo(40, 66),
        progression: 'em',
      },
      {
        id: 'sus-pe-4',
        title: { ro: 'Pătrimi cu „și" pe 4', en: 'Quarters with the "and" of 4' },
        tip: {
          ro: 'Ultima lovitură, în sus, e și momentul în care mâna care apasă pleacă spre acordul următor.',
          en: 'The last stroke, an upstroke, is also when the fretting hand leaves for the next chord.',
        },
        stepsPerBeat: 2,
        pattern: 'D.D.D.DU',
        tempo: tempo(40, 66),
        progression: 'g-c-d-c',
      },
    ],
  },
  {
    id: 'ratate',
    title: { ro: 'Lovituri ratate', en: 'Missed strokes' },
    summary: {
      ro: 'Modelele adevărate: aceeași mișcare jos-sus, cu unele lovituri lăsate să treacă pe lângă corzi.',
      en: 'Real patterns: the same down-up motion, with some strokes passing the strings.',
    },
    accent: '#008C88',
    soft: '#E3F3F2',
    exercises: [
      {
        id: 'folk',
        title: { ro: 'Modelul folk', en: 'The folk pattern' },
        tip: {
          ro: '↓ · ↓↑ · ↑↓↑. Pe 3 mâna coboară fără să atingă: e lovitura ratată care face modelul.',
          en: '↓ · ↓↑ · ↑↓↑. On 3 the hand comes down without touching: that missed stroke is what makes the pattern.',
        },
        stepsPerBeat: 2,
        pattern: 'D.DU.UDU',
        tempo: tempo(40, 70),
        progression: 'g-c-d-c',
      },
      {
        id: 'rock-optimi',
        title: { ro: 'Jumătate pătrimi, jumătate optimi', en: 'Half quarters, half eighths' },
        tip: {
          ro: 'Timpii 1 și 2 doar în jos, 3 și 4 jos-sus. Mâna nu-și schimbă viteza, doar ce atinge.',
          en: 'Beats 1 and 2 down only, 3 and 4 down-up. The hand keeps its speed, only what it hits changes.',
        },
        stepsPerBeat: 2,
        pattern: 'D.D.DUDU',
        tempo: tempo(40, 72),
        progression: 'em-c-g-d',
      },
      {
        id: 'pop-optimi',
        title: { ro: 'Pop: jos, apoi optimi', en: 'Pop: down, then eighths' },
        tip: {
          ro: 'Primul timp singur, restul jos-sus. O variantă des întâlnită pe progresiile de patru acorduri.',
          en: 'The first beat alone, the rest down-up. A common choice over four-chord progressions.',
        },
        stepsPerBeat: 2,
        pattern: 'D.DUDUDU',
        tempo: tempo(40, 72),
        progression: 'am-f-c-g',
      },
    ],
  },
  {
    id: 'accente',
    title: { ro: 'Accente și chuck', en: 'Accents and chucks' },
    summary: {
      ro: 'Același model, dar nu toate loviturile sunt egale: unele mai tari, unele amortizate.',
      en: 'The same pattern, but not every stroke is equal: some louder, some muted.',
    },
    accent: '#6547E8',
    soft: '#EEEAFC',
    exercises: [
      {
        id: 'accent-2-4',
        title: { ro: 'Accent pe 2 și 4', en: 'Accent on 2 and 4' },
        tip: {
          ro: 'Optimi jos-sus, cu timpii 2 și 4 mai tari: backbeat-ul tobei mici, cântat pe chitară.',
          en: 'Down-up eighths with beats 2 and 4 louder: the snare backbeat, played on guitar.',
        },
        stepsPerBeat: 2,
        pattern: 'DUAUDUAU',
        tempo: tempo(40, 76),
        progression: 'g-c-d-c',
      },
      {
        id: 'chuck-2-4',
        title: { ro: 'Chuck pe 2 și 4', en: 'Chuck on 2 and 4' },
        tip: {
          ro: 'Pe 2 și 4 palma sau degetele mâinii care apasă amortizează corzile chiar în lovitură: se aude un „ciac", nu un acord.',
          en: 'On 2 and 4 the palm or the fretting fingers mute the strings right as you strike: you hear a "chk", not a chord.',
        },
        stepsPerBeat: 2,
        pattern: 'D.xUD.xU',
        tempo: tempo(40, 80),
        progression: 'am-f-c-g',
      },
      {
        id: 'folk-chuck',
        title: { ro: 'Folk cu chuck', en: 'Folk with a chuck' },
        tip: {
          ro: 'Modelul folk, cu lovitura de pe 2 amortizată. Sunetul de chitară acustică din pop.',
          en: 'The folk pattern with the stroke on 2 muted. The acoustic pop sound.',
        },
        stepsPerBeat: 2,
        pattern: 'D.xU.UxU',
        tempo: tempo(40, 80),
        progression: 'em-c-g-d',
      },
    ],
  },
  {
    id: 'saisprezecimi',
    title: { ro: 'Șaisprezecimi', en: 'Sixteenths' },
    summary: {
      ro: 'Patru pași pe timp: mâna se mișcă de două ori mai repede, iar tempoul scade.',
      en: 'Four steps per beat: the hand moves twice as fast, and the tempo drops.',
    },
    accent: '#158A52',
    soft: '#E6F4EC',
    exercises: [
      {
        id: '16-constant',
        title: { ro: 'Șaisprezecimi constante', en: 'Steady sixteenths' },
        tip: {
          ro: 'Toate loviturile, jos-sus. Încet: la 60 BPM sunt patru lovituri pe secundă.',
          en: 'Every stroke, down-up. Slowly: at 60 BPM that is four strokes a second.',
        },
        stepsPerBeat: 4,
        pattern: 'DUDUDUDUDUDUDUDU',
        tempo: tempo(40, 56),
        progression: 'em',
      },
      {
        id: '16-pop',
        title: { ro: 'Pop pe șaisprezecimi', en: 'Pop sixteenths' },
        tip: {
          ro: 'Mâna merge pe șaisprezecimi, dar atinge corzile rar. Numără „1 e și a" ca să știi unde ești.',
          en: 'The hand moves in sixteenths but hits rarely. Count "1 e and a" to know where you are.',
        },
        stepsPerBeat: 4,
        pattern: 'D..UD.DU.UDU.UDU',
        tempo: tempo(40, 60),
        progression: 'am-f-c-g',
      },
      {
        id: 'funk',
        title: { ro: 'Funk cu chuck', en: 'Funk with chucks' },
        tip: {
          ro: 'Chuck pe 2 și 4, șaisprezecimi în jur. Mâna care apasă slăbește apăsarea pe chuck, nu se ridică.',
          en: 'Chucks on 2 and 4, sixteenths around them. The fretting hand eases off on the chuck, it does not lift.',
        },
        stepsPerBeat: 4,
        pattern: 'D.DUx.DUD.DUx.DU',
        tempo: tempo(40, 60),
        progression: 'em',
      },
    ],
  },
  {
    id: 'sincope',
    title: { ro: 'Sincope', en: 'Syncopation' },
    summary: {
      ro: 'Lovituri pe „și" care trec peste timp. Modelul nu mai cade unde te aștepți.',
      en: 'Strokes on the "and" that tie over the beat. The pattern stops landing where you expect.',
    },
    accent: '#C2410C',
    soft: '#FDEDE3',
    exercises: [
      {
        id: 'sincopa-3',
        title: { ro: 'Peste timpul 3', en: 'Over beat 3' },
        tip: {
          ro: 'Lovitura de pe „2 și" ține peste 3. Pe 3 mâna coboară pe lângă corzi.',
          en: 'The stroke on "2 and" rings over 3. On 3 the hand comes down past the strings.',
        },
        stepsPerBeat: 2,
        pattern: 'D.DU.U.U',
        tempo: tempo(40, 70),
        progression: 'g-c-d-c',
      },
      {
        id: 'fara-unu',
        title: { ro: 'Fără „unu"', en: 'Without the "one"' },
        tip: {
          ro: 'Modelul începe pe „1 și", în sus. Pe 1 mâna coboară în gol: ține-o în mișcare, altfel urcarea vine târziu.',
          en: 'The pattern starts on "1 and", going up. On 1 the hand swings down through the air: keep it moving, or the upstroke comes late.',
        },
        stepsPerBeat: 2,
        pattern: '.UDU.UDU',
        tempo: tempo(40, 66),
        progression: 'em-c-g-d',
      },
      {
        id: 'reggae',
        title: { ro: 'Reggae: doar pe „și"', en: 'Reggae: only on the "and"' },
        tip: {
          ro: 'Lovituri scurte, în sus, doar pe contratimp. Pe timp, mâna coboară în gol.',
          en: 'Short upstrokes, only on the offbeat. On the beat, the hand goes down through the air.',
        },
        stepsPerBeat: 2,
        pattern: '.B-B.B-B',
        tempo: tempo(40, 72),
        progression: 'am-f-c-g',
      },
      {
        id: '16-sincopat',
        title: { ro: 'Sincope pe șaisprezecimi', en: 'Sixteenth syncopation' },
        tip: {
          ro: 'Lovituri pe „a" și pe „și", aproape niciuna pe timp. Numără cu voce tare prima dată.',
          en: 'Strokes on the "a" and the "and", almost none on the beat. Count out loud the first time.',
        },
        stepsPerBeat: 4,
        pattern: 'D..U..DU..DU.UDU',
        tempo: tempo(40, 56),
        progression: 'e-a-b7-a',
      },
    ],
  },
  {
    id: 'shuffle',
    title: { ro: 'Shuffle', en: 'Shuffle' },
    summary: {
      ro: 'Pe triolete: „lung-scurt" în loc de egal. Sunetul blues-ului.',
      en: 'On triplets: "long-short" instead of even. The sound of the blues.',
    },
    accent: '#0F6CBD',
    soft: '#E4F0FA',
    exercises: [
      {
        id: 'shuffle-optimi',
        title: { ro: 'Optimi shuffle', en: 'Shuffle eighths' },
        tip: {
          ro: 'Jos pe timp, sus pe ultima treime: „lung-scurt". Mâna rămâne în mișcare, doar mai legănat.',
          en: 'Down on the beat, up on the last third: "long-short". The hand keeps moving, only with more swing.',
        },
        stepsPerBeat: 3,
        pattern: 'D.UD.UD.UD.U',
        tempo: tempo(40, 70),
        progression: 'e-a-b7-a',
      },
      {
        id: 'shuffle-ratat',
        title: { ro: 'Shuffle cu lovituri ratate', en: 'Shuffle with missed strokes' },
        tip: {
          ro: 'Pe 2 și 4 doar lovitura de jos. Lasă acordul să sune până la timpul următor.',
          en: 'On 2 and 4, only the downstroke. Let the chord ring until the next beat.',
        },
        stepsPerBeat: 3,
        pattern: 'D.UD..D.UD..',
        tempo: tempo(40, 70),
        progression: 'e-a-b7-a',
      },
    ],
  },
  {
    id: 'pauze',
    title: { ro: 'Pauze și opriri', en: 'Rests and stops' },
    summary: {
      ro: 'Două măsuri, cu tăceri în ele: coardele se amortizează, iar mâna continuă să numere.',
      en: 'Two bars with silences: the strings are muted, and the hand keeps counting.',
    },
    accent: '#B4237A',
    soft: '#FAE6F1',
    exercises: [
      {
        id: 'pauza-pe-3-4',
        title: { ro: 'Pauză pe 3 și 4', en: 'Rest on 3 and 4' },
        tip: {
          ro: 'O măsură cântată, una cu pauză la jumătate. În pauză, mâna care apasă slăbește apăsarea, iar cea care ciupește continuă să se miște.',
          en: 'One bar played, one with a rest halfway. In the rest, the fretting hand eases off and the strumming hand keeps moving.',
        },
        stepsPerBeat: 2,
        pattern: 'D.DU.UDUD.DU----',
        tempo: tempo(40, 70),
        progression: 'g-c-d-c',
      },
      {
        id: 'opriri',
        title: { ro: 'Două timpi da, doi nu', en: 'Two beats on, two off' },
        tip: {
          ro: 'Cântat, tăcere, cântat, tăcere. Intrarea după pauză cade exact pe „1": ascultă metronomul.',
          en: 'Play, silence, play, silence. The entry after the rest lands exactly on "1": listen to the click.',
        },
        stepsPerBeat: 2,
        pattern: 'DUDU----DUDU----',
        tempo: tempo(40, 76),
        progression: 'em-c-g-d',
      },
      {
        id: 'stop-time',
        title: { ro: 'Stop-time', en: 'Stop-time' },
        tip: {
          ro: 'O lovitură scurtă pe 1, apoi tăcere, două măsuri. Restul timpului îl ține doar metronomul, și tu.',
          en: 'One short hit on 1, then silence, for two bars. The rest of the time is kept by the click, and by you.',
        },
        stepsPerBeat: 2,
        pattern: 'A-------A---D.DU',
        tempo: tempo(40, 80),
        progression: 'e-a-b7-a',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Validarea
// ---------------------------------------------------------------------------

const DOWN: ReadonlySet<StrumStep> = new Set(['D', 'A'])
const UP: ReadonlySet<StrumStep> = new Set(['U', 'B'])
const STEP_CHARS: ReadonlySet<string> = new Set(['D', 'U', 'A', 'B', 'x', '.', '-'])

/** Direcția mâinii pe un pas: `down`, `up`, sau `none` (mijlocul trioletului). */
export function handDirection(step: number, stepsPerBeat: StepsPerBeat): 'down' | 'up' | 'none' {
  if (stepsPerBeat === 3) {
    const position = step % 3
    return position === 0 ? 'down' : position === 2 ? 'up' : 'none'
  }
  return step % 2 === 0 ? 'down' : 'up'
}

export function validateStrumPattern(exercise: StrumExercise): string[] {
  const problems: string[] = []
  const at = exercise.id
  const barSteps = exercise.stepsPerBeat * BEATS_PER_BAR
  if (exercise.pattern.length % barSteps !== 0) {
    problems.push(`${at}: ${exercise.pattern.length} pași, nu un multiplu de ${barSteps}`)
  }
  ;[...exercise.pattern].forEach((char, step) => {
    if (!STEP_CHARS.has(char)) {
      problems.push(`${at}: pasul ${step} are „${char}"`)
      return
    }
    const direction = handDirection(step, exercise.stepsPerBeat)
    if (DOWN.has(char as StrumStep) && direction !== 'down') problems.push(`${at}: pasul ${step} e în jos, dar mâna urcă acolo`)
    if (UP.has(char as StrumStep) && direction !== 'up') problems.push(`${at}: pasul ${step} e în sus, dar mâna coboară acolo`)
    if (char === 'x' && direction === 'none') problems.push(`${at}: chuck pe mijlocul trioletului`)
  })
  if (![...exercise.pattern].some((char) => char !== '.' && char !== '-')) problems.push(`${at}: nicio lovitură`)
  const { min, max, suggested } = exercise.tempo
  if (!(min <= suggested && suggested <= max)) problems.push(`${at}: tempo sugerat în afara intervalului`)
  if (!STRUM_PROGRESSIONS.some((progression) => progression.id === exercise.progression)) {
    problems.push(`${at}: progresia „${exercise.progression}" nu există`)
  }
  return problems
}

// ---------------------------------------------------------------------------
// Planul de timp
// ---------------------------------------------------------------------------

export const COUNT_IN_BEATS = 4
const TARGET_MS = 60_000

export interface StrumPlan {
  bpm: number
  stepsPerBeat: StepsPerBeat
  stepMs: number
  /** Modelul, ca listă de pași. */
  pattern: StrumStep[]
  /** Pași de numărătoare (o măsură), înaintea modelului. */
  countInSteps: number
  /** De câte ori se cântă modelul. */
  repeats: number
  totalSteps: number
  durationMs: number
  /** Acordul pe fiecare măsură, în ordine, ciclic. Gol = corzi amortizate. */
  chords: ChordShape[]
}

export function planStrum(exercise: StrumExercise, bpm: number, progressionId: string): StrumPlan {
  const stepMs = 60_000 / bpm / exercise.stepsPerBeat
  const pattern = [...exercise.pattern] as StrumStep[]
  const patternMs = pattern.length * stepMs
  const repeats = Math.max(2, Math.ceil(TARGET_MS / patternMs))
  const countInSteps = COUNT_IN_BEATS * exercise.stepsPerBeat
  const totalSteps = countInSteps + repeats * pattern.length
  const progression = STRUM_PROGRESSIONS.find((item) => item.id === progressionId) ?? STRUM_PROGRESSIONS[0]!
  return {
    bpm,
    stepsPerBeat: exercise.stepsPerBeat,
    stepMs,
    pattern,
    countInSteps,
    repeats,
    totalSteps,
    durationMs: totalSteps * stepMs,
    chords: progression.chords.map((id) => chordById(id)!),
  }
}

export interface StrumPosition {
  /** În numărătoare: timpul 1-4; `null` după. */
  countIn: number | null
  /** Pasul din model (0 … lungime-1), sau -1 în numărătoare. */
  patternStep: number
  /** Măsura din toată sesiunea (de la 0), după numărătoare. */
  bar: number
  /** Indexul acordului curent în progresie, sau -1 fără acorduri. */
  chordIndex: number
}

export function strumPositionAt(plan: StrumPlan, step: number): StrumPosition {
  const barSteps = plan.stepsPerBeat * BEATS_PER_BAR
  if (step < plan.countInSteps) {
    return { countIn: Math.floor(step / plan.stepsPerBeat) + 1, patternStep: -1, bar: -1, chordIndex: plan.chords.length ? 0 : -1 }
  }
  const played = step - plan.countInSteps
  const bar = Math.floor(played / barSteps)
  return {
    countIn: null,
    patternStep: played % plan.pattern.length,
    bar,
    chordIndex: plan.chords.length ? bar % plan.chords.length : -1,
  }
}

/** Ce se numără sub fiecare pas: „1 & 2 &", „1 e & a", „1 & a". */
export function countLabel(step: number, stepsPerBeat: StepsPerBeat): string {
  const beat = Math.floor(step / stepsPerBeat) % BEATS_PER_BAR + 1
  const position = step % stepsPerBeat
  if (position === 0) return String(beat)
  if (stepsPerBeat === 2) return '&'
  if (stepsPerBeat === 4) return ['', 'e', '&', 'a'][position]!
  return ['', '&', 'a'][position]!
}
