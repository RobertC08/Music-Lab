/**
 * Modelul de notatie folosit de cheat sheet si de jocul de citire.
 *
 * Un token e un simbol scris (o nota, un grup legat sau o pauza). Fiecare
 * ocupa o durata masurata in saisprezecimi si spune la ce momente se canta -
 * asta face legatura dintre ce se vede pe portativ si ce se bate cu degetul.
 */

export type RhythmToken =
  | 'half'
  | 'halfRest'
  | 'quarter'
  | 'quarterRest'
  | 'dottedQuarter'
  | 'eighth'
  | 'eighthRest'
  | 'dottedEighth'
  | 'eighthPair'
  | 'sixteenth'
  | 'sixteenthGroup'
  | 'tripletEighths'
  | 'sextoletSixteenths'
  | 'tiedQuarters'
  | 'tiedEighthQuarter'

/**
 * Unitatea de masura interna. 48 de pasi pe masura, adica 12 pe timp, e cel
 * mai mic numar divizibil si cu 4 (saisprezecimi) si cu 3 (triolete) - deci
 * si diviziunea binara si cea ternara incap pe aceeasi grila, fara fractii.
 */
export const TICKS_PER_BEAT = 12
/**
 * Lungimea unei masuri de 4/4. Masurile cu alt numar de timpi se scriu ca
 * `TICKS_PER_BEAT * beatsPerBar` - de aceea functiile care despart pe masuri
 * primesc lungimea ca parametru, nu o citesc de aici.
 */
export const TICKS_PER_BAR = TICKS_PER_BEAT * 4

interface TokenShape {
  /** Durata totala, in saisprezecimi. */
  span: number
  /** La ce saisprezecimi din durata proprie se aude o lovitura. */
  hits: number[]
  label: string
}

const shapes: Record<RhythmToken, TokenShape> = {
  half: { span: 2 * TICKS_PER_BEAT, hits: [0], label: 'doime' },
  halfRest: { span: 2 * TICKS_PER_BEAT, hits: [], label: 'pauză de doime' },
  quarter: { span: TICKS_PER_BEAT, hits: [0], label: 'pătrime' },
  quarterRest: { span: TICKS_PER_BEAT, hits: [], label: 'pauză de pătrime' },
  // Punctul adauga jumatate din durata notei: o patrime punctata tine un timp
  // si jumatate.
  dottedQuarter: { span: TICKS_PER_BEAT * 1.5, hits: [0], label: 'pătrime punctată' },
  eighth: { span: TICKS_PER_BEAT / 2, hits: [0], label: 'optime' },
  eighthRest: { span: TICKS_PER_BEAT / 2, hits: [], label: 'pauză de optime' },
  dottedEighth: { span: TICKS_PER_BEAT * 0.75, hits: [0], label: 'optime punctată' },
  eighthPair: {
    span: TICKS_PER_BEAT,
    hits: [0, TICKS_PER_BEAT / 2],
    label: 'două optimi',
  },
  sixteenth: { span: TICKS_PER_BEAT / 4, hits: [0], label: 'șaisprezecime' },
  sixteenthGroup: {
    span: TICKS_PER_BEAT,
    hits: [0, TICKS_PER_BEAT / 4, TICKS_PER_BEAT / 2, (TICKS_PER_BEAT * 3) / 4],
    label: 'patru șaisprezecimi',
  },
  // Trioletul: trei note egale pe un singur timp. Aici se vede de ce grila are
  // 12 pasi pe timp - impartirea in trei iese exacta.
  tripletEighths: {
    span: TICKS_PER_BEAT,
    hits: [0, TICKS_PER_BEAT / 3, (TICKS_PER_BEAT * 2) / 3],
    label: 'triolet de optimi',
  },
  // Sextoletul: sase note egale pe un timp - doua triolete lipite, sau un
  // triolet cu fiecare nota injumatatita. Pe grila de 12 pasi pe timp iese
  // tot exact: fiecare nota tine doi pasi.
  sextoletSixteenths: {
    span: TICKS_PER_BEAT,
    hits: [0, 1, 2, 3, 4, 5].map((index) => (TICKS_PER_BEAT * index) / 6),
    label: 'sextolet de șaisprezecimi',
  },
  // Notele legate: se vad doua capete, dar se ataca doar primul. Durata lor
  // insumata e ce trebuie tinut.
  tiedQuarters: { span: 2 * TICKS_PER_BEAT, hits: [0], label: 'două pătrimi legate' },
  tiedEighthQuarter: {
    span: TICKS_PER_BEAT * 1.5,
    hits: [0],
    label: 'optime legată de pătrime',
  },
}

export function tokenSpan(token: RhythmToken) {
  return shapes[token].span
}

export function tokenLabel(token: RhythmToken) {
  return shapes[token].label
}

export function tokenHitCount(token: RhythmToken) {
  return shapes[token].hits.length
}

/** Durata totala a unui sir de tokeni, in saisprezecimi. */
export function totalSpan(tokens: RhythmToken[]) {
  return tokens.reduce((sum, token) => sum + shapes[token].span, 0)
}

/** Un sir e valid doar daca umple masuri intregi. */
export function isCompleteBars(tokens: RhythmToken[], ticksPerBar = TICKS_PER_BAR) {
  const span = totalSpan(tokens)
  return span > 0 && span % ticksPerBar === 0
}

/**
 * Transforma notatia in pattern-ul pe care il asteapta motorul de runda: un
 * flag per saisprezecime. Asta e puntea dintre ce citeste elevul si ce se
 * masoara cand bate.
 */
export function tokensToPattern(tokens: RhythmToken[]): boolean[] {
  const pattern: boolean[] = Array.from({ length: totalSpan(tokens) }, () => false)
  let cursor = 0
  tokens.forEach((token) => {
    const shape = shapes[token]
    shape.hits.forEach((offset) => {
      pattern[cursor + offset] = true
    })
    cursor += shape.span
  })
  return pattern
}

/** Unde incepe fiecare token, in saisprezecimi de la inceputul sirului. */
export function tokenStarts(tokens: RhythmToken[]) {
  const starts: number[] = []
  let cursor = 0
  tokens.forEach((token) => {
    starts.push(cursor)
    cursor += shapes[token].span
  })
  return starts
}

/** Imparte sirul pe masuri, pentru randare cu bare despartitoare. */
export function splitIntoBars(
  tokens: RhythmToken[],
  ticksPerBar = TICKS_PER_BAR,
): RhythmToken[][] {
  const bars: RhythmToken[][] = []
  let current: RhythmToken[] = []
  let filled = 0
  tokens.forEach((token) => {
    current.push(token)
    filled += shapes[token].span
    if (filled >= ticksPerBar) {
      bars.push(current)
      current = []
      filled = 0
    }
  })
  if (current.length) bars.push(current)
  return bars
}

/** Ierarhia verdictelor, de la cel mai bun la cel mai slab. */
const judgementRank = ['perfect', 'good', 'early', 'late', 'miss'] as const
export type TokenJudgement = (typeof judgementRank)[number]

/**
 * Imparte verdictele loviturilor pe tokeni, ca sa putem colora notatia.
 *
 * Verdictele vin ca sir plat, in ordinea tintelor; un token consuma exact
 * atatea cate lovituri are. Un token care iese cu mai multe verdicte primeste
 * pe cel mai slab - daca o singura saisprezecime din patru a fost ratata,
 * grupul nu e „in regula".
 */
export function judgementsByToken(
  tokens: RhythmToken[],
  judgements: TokenJudgement[],
): (TokenJudgement | null)[] {
  return groupByToken(tokens, judgements).map((slice) => {
    if (!slice || !slice.length) return null
    return slice.reduce((worst, current) =>
      judgementRank.indexOf(current) > judgementRank.indexOf(worst) ? current : worst,
    )
  })
}

/**
 * Imparte un sir de valori per lovitura pe tokeni: fiecare token primeste
 * exact atatea valori cate lovituri are, iar pauzele primesc null.
 */
export function groupByToken<T>(tokens: RhythmToken[], values: T[]): (T[] | null)[] {
  let cursor = 0
  return tokens.map((token) => {
    const count = shapes[token].hits.length
    if (count === 0) return null
    const slice = values.slice(cursor, cursor + count)
    cursor += count
    return slice
  })
}

export interface NotatedEvent {
  /** Pozitia atacului, in saisprezecimi de la inceputul sirului. */
  step: number
  /** Cat tine nota scrisa, in saisprezecimi. */
  durationSteps: number
}

/**
 * Desfasoara notatia in evenimente cu durata, nu doar cu moment de atac.
 *
 * Fara durata, o doime si o patrime urmata de pauza produc acelasi sir de
 * atacuri - deci notatia ar promite o distinctie pe care jocul nu o poate
 * verifica. O nota tine pana la urmatorul atac din acelasi token, iar ultima
 * pana la capatul tokenului.
 */
export function tokensToEvents(tokens: RhythmToken[]): NotatedEvent[] {
  const events: NotatedEvent[] = []
  let cursor = 0
  tokens.forEach((token) => {
    const shape = shapes[token]
    shape.hits.forEach((offset, index) => {
      const nextOffset = shape.hits[index + 1] ?? shape.span
      events.push({ step: cursor + offset, durationSteps: nextOffset - offset })
    })
    cursor += shape.span
  })
  return events
}

/**
 * Durata unui pattern dat ca atacuri, cand nu avem notatia: fiecare nota tine
 * pana la urmatorul atac. E aproximarea corecta pentru pattern-uri generate.
 */
export function durationsFromPattern(pattern: boolean[]): number[] {
  const onsets = pattern.flatMap((isHit, index) => (isHit ? [index] : []))
  return onsets.map((step, index) => (onsets[index + 1] ?? pattern.length) - step)
}
