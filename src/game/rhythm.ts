import { mulberry32 } from './random'

export type Judgement = 'perfect' | 'good' | 'early' | 'late' | 'miss'

export type HoldJudgement = 'ok' | 'short' | 'long'

export interface HitResult {
  /** Momentul tinta, in ms de la inceputul redarii. */
  targetMs: number
  /** Momentul in care a batut utilizatorul, null daca a ratat lovitura. */
  tapMs: number | null
  /** Eroare cu semn dupa compensarea latentei: negativ = devreme. */
  errorMs: number | null
  judgement: Judgement
  /**
   * Verdictul duratei, doar pentru notele suficient de lungi cat sa fie
   * verificabile. Null cand nota e prea scurta ca tinerea sa conteze.
   */
  holdJudgement: HoldJudgement | null
  /** Cat a tinut utilizatorul apasat, in ms. */
  heldMs: number | null
  /** Cat ar fi trebuit sa tina, conform notatiei. */
  expectedHoldMs: number | null
}

/**
 * Sub pragul asta, tinerea apasata nu mai e o abilitate muzicala, ci una de
 * dexteritate: pe ecran, o optime rapida nu poate fi tinuta cu precizie. Deci
 * la note scurte se judeca doar atacul, ca la percutie.
 */
export const MIN_SCORED_HOLD_MS = 400

export interface HoldInput {
  /** Cat a tinut apasat fiecare bataie, aliniat cu `tapTimesMs`. */
  tapDurationsMs: number[]
  /** Cat tine fiecare nota scrisa, aliniat cu `targetTimesMs`. */
  targetDurationsMs: number[]
  minScoredHoldMs?: number
}

export interface RoundScore {
  /** Scor 0-100 pentru runda. */
  score: number
  hits: HitResult[]
  /** Batai care nu s-au potrivit cu nicio tinta. */
  extraTaps: number
  /** Latenta constanta estimata si scazuta din erori. */
  latencyMs: number
  /** Eroarea absoluta medie, dupa compensare. */
  meanAbsErrorMs: number
  /** Tendinta generala, utila ca feedback: grabit / intarziat / stabil. */
  tendency: 'rushing' | 'dragging' | 'steady'
}

/**
 * Praguri de verdict, in ms. Sunt deliberat largi: pe telefon, intre atingerea
 * ecranului si inregistrarea ei se pierd deja zeci de ms, iar un joc care cere
 * precizie de studio nu e un joc, e o frustrare. Un muzician bun sta oricum
 * sub 30 ms, deci „perfect" ramane o distinctie reala.
 */
const PERFECT_MS = 75
const GOOD_MS = 150

export interface RhythmPattern {
  steps: boolean[]
  stepsPerBar: number
  beatsPerBar: number
  bars: number
  bpm: number
}

export interface EchoLevel {
  level: number
  title: string
  description: string
  /** Cati pasi are o masura. */
  stepsPerBar: number
  /** Cati timpi are o masura: 4 in 4/4, 2 in 6/8 (timpul e patrimea punctata). */
  beatsPerBar: number
  bars: number
  /**
   * Schemele de impartire a unui timp care au voie sa apara, ca offset-uri in
   * pasi de la inceputul timpului. Fiecare timp primeste una dintre ele, deci
   * notele nu pot cadea in afara unei subdiviziuni predate. O schema scrisa de
   * mai multe ori apare mai des.
   */
  subdivisions: number[][]
  /** Cat de probabil e ca o pozitie permisa sa primeasca o nota. */
  density: number
  /**
   * Cat de probabil e ca un timp sa sune INTREAGA lui schema, nu note razlete
   * din ea. Fara asta, un nivel de sextolete ar imprastia doua note pe grila
   * de sase si nu s-ar auzi niciodata un sextolet - adica exact ce vine sa
   * exerseze. Zero inseamna „numai densitate".
   */
  groupChance?: number
  /** Marginile intervalului de tempo pentru nivel. */
  bpm: [number, number]
}

/**
 * Genereaza un pattern jucabil pentru un nivel.
 *
 * Regula care conteaza: notele nu se aseaza oriunde pe grila, ci doar pe
 * offset-urile uneia dintre schemele nivelului. Un generator care ar alege
 * liber pe grila de 48 ar produce pozitii care nu sunt nici binare, nici
 * ternare - imposibil de scris si imposibil de batut.
 *
 * Pattern-ul incepe mereu pe „unu", ca elevul sa stie de unde se numara.
 */
export function generatePattern(level: EchoLevel, seed: number): RhythmPattern {
  const random = mulberry32(seed)
  const stepsPerBeat = level.stepsPerBar / level.beatsPerBar
  const totalBeats = level.beatsPerBar * level.bars
  const total = level.stepsPerBar * level.bars

  const steps: boolean[] = Array.from({ length: total }, () => false)

  for (let beat = 0; beat < totalBeats; beat += 1) {
    const scheme = level.subdivisions[Math.floor(random() * level.subdivisions.length)]!
    const beatStart = beat * stepsPerBeat
    const isDownbeat = beat % level.beatsPerBar === 0
    // Un timp „plin" suna toata schema lui: asa se aude un triolet ca triolet,
    // nu ca doua note cazute intamplator pe o grila de trei.
    const wholeGroup = random() < (level.groupChance ?? 0)
    scheme.forEach((offset) => {
      if (wholeGroup) {
        steps[beatStart + offset] = true
        return
      }
      // Primul timp al primei masuri se aude intotdeauna, daca schema lui are
      // o nota chiar la inceput.
      if (beat === 0 && offset === 0) {
        steps[beatStart] = true
        return
      }
      // Inceputul unui timp e mai probabil decat interiorul lui: asa pattern-ul
      // pastreaza un contur metric si nu iese o rafala uniforma.
      const weight =
        offset === 0 ? level.density + 0.2 : level.density - (isDownbeat ? 0.04 : 0.08)
      if (random() < weight) steps[beatStart + offset] = true
    })
  }

  // Daca schema primului timp nu incepe pe „unu" (nivelurile de contratimp),
  // pattern-ul ar porni in gol. Punem nota acolo unde schema chiar permite.
  if (!steps.some(Boolean) || !hasEarlyHit(steps, stepsPerBeat)) {
    const firstScheme = level.subdivisions[0]!
    steps[firstScheme[0]!] = true
  }

  // Un pattern prea sarac nu e un exercitiu. Completam tot pe pozitii permise.
  const minimum = Math.max(3, Math.round(totalBeats * 0.8))
  const allowed = allowedSteps(level)
  let guard = 0
  while (steps.filter(Boolean).length < minimum && guard < total * 6) {
    const candidate = allowed[Math.floor(random() * allowed.length)]!
    steps[candidate] = true
    guard += 1
  }

  // ...si nici prea bogat. Aici pattern-ul se tine minte, nu se citeste: patru
  // timpi plini de sextolete sunt douazeci si patru de note, adica o pata pe
  // care nimeni nu o poate reproduce din auz. Taiem de la contratimpi, ca sa
  // ramana conturul metric.
  const maximum = Math.round(totalBeats * 2.5) + 1
  guard = 0
  while (steps.filter(Boolean).length > maximum && guard < total * 6) {
    guard += 1
    const onsets = steps.flatMap((isHit, index) => (isHit ? [index] : []))
    const removable = onsets.filter((step) => step > 0 && step % stepsPerBeat !== 0)
    const pool = removable.length ? removable : onsets.filter((step) => step > 0)
    if (!pool.length) break
    steps[pool[Math.floor(random() * pool.length)]!] = false
  }

  return {
    steps,
    stepsPerBar: level.stepsPerBar,
    beatsPerBar: level.beatsPerBar,
    bars: level.bars,
    bpm: bpmForRound(level, random),
  }
}

/** Prima nota trebuie sa cada in primul timp, altfel se asteapta in gol. */
function hasEarlyHit(steps: boolean[], stepsPerBeat: number) {
  return steps.slice(0, stepsPerBeat).some(Boolean)
}

/** Toate pozitiile pe care schemele nivelului le permit, pe tot pattern-ul. */
export function allowedSteps(level: EchoLevel) {
  const stepsPerBeat = level.stepsPerBar / level.beatsPerBar
  const offsets = new Set(level.subdivisions.flat())
  const positions: number[] = []
  for (let beat = 0; beat < level.beatsPerBar * level.bars; beat += 1) {
    offsets.forEach((offset) => positions.push(beat * stepsPerBeat + offset))
  }
  return positions.sort((left, right) => left - right)
}

/**
 * Tempoul se alege din intervalul nivelului la fiecare runda, nu o data pe
 * nivel. Un elev care bate corect doar la un singur tempo a memorat o viteza,
 * nu a inteles ritmul - aceeasi regula ca la tempourile din lectii.
 */
function bpmForRound(level: EchoLevel, random: () => number) {
  const [slow, fast] = level.bpm
  // Pas de 2 BPM: diferentele mai mici nu se simt, dar umplu afisajul.
  const steps = Math.max(1, Math.round((fast - slow) / 2))
  return slow + Math.floor(random() * (steps + 1)) * 2
}

/** Mediana, folosita ca estimator robust pentru latenta constanta. */
function median(values: number[]) {
  if (!values.length) return 0
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

/**
 * Aliniaza bataile cu tintele pastrand ordinea, prin programare dinamica.
 *
 * Varianta simpla - „pentru fiecare tinta ia cea mai apropiata bataie libera"
 * - se rupe cand o tinta inhata o bataie care apartinea de fapt celei
 * urmatoare: restul rundei se decaleaza si latenta iese prost estimata.
 * Aici alegem alinierea cu cost total minim, unde o tinta neacoperita si o
 * bataie in plus au fiecare un cost fix, iar o potrivire costa cat abaterea.
 *
 * `offsetMs` deplaseaza tintele inainte de aliniere, ca sa putem repeta
 * calculul dupa ce stim cat e decalajul constant.
 */
function matchTaps(
  targetTimesMs: number[],
  tapTimesMs: number[],
  windowMs: number,
  offsetMs: number,
) {
  const targetCount = targetTimesMs.length
  const tapCount = tapTimesMs.length
  const missCost = windowMs
  const extraCost = windowMs * 0.8

  const cost: number[][] = Array.from({ length: targetCount + 1 }, () =>
    new Array<number>(tapCount + 1).fill(0),
  )
  // 0 = potrivire, 1 = tinta ratata, 2 = bataie in plus
  const move: number[][] = Array.from({ length: targetCount + 1 }, () =>
    new Array<number>(tapCount + 1).fill(0),
  )

  for (let i = 1; i <= targetCount; i += 1) {
    cost[i]![0] = cost[i - 1]![0]! + missCost
    move[i]![0] = 1
  }
  for (let j = 1; j <= tapCount; j += 1) {
    cost[0]![j] = cost[0]![j - 1]! + extraCost
    move[0]![j] = 2
  }

  for (let i = 1; i <= targetCount; i += 1) {
    for (let j = 1; j <= tapCount; j += 1) {
      const distance = Math.abs(tapTimesMs[j - 1]! - (targetTimesMs[i - 1]! + offsetMs))
      const matched = distance <= windowMs ? cost[i - 1]![j - 1]! + distance : Infinity
      const missed = cost[i - 1]![j]! + missCost
      const extra = cost[i]![j - 1]! + extraCost
      const best = Math.min(matched, missed, extra)
      cost[i]![j] = best
      move[i]![j] = best === matched ? 0 : best === missed ? 1 : 2
    }
  }

  const pairs: { targetMs: number; tapMs: number | null; rawErrorMs: number | null }[] = Array.from(
    { length: targetCount },
    (_, index) => ({ targetMs: targetTimesMs[index]!, tapMs: null, rawErrorMs: null }),
  )
  let usedCount = 0
  let i = targetCount
  let j = tapCount
  while (i > 0 || j > 0) {
    const step = move[i]![j]!
    if (step === 0 && i > 0 && j > 0) {
      pairs[i - 1] = {
        targetMs: targetTimesMs[i - 1]!,
        tapMs: tapTimesMs[j - 1]!,
        rawErrorMs: tapTimesMs[j - 1]! - targetTimesMs[i - 1]!,
      }
      usedCount += 1
      i -= 1
      j -= 1
    } else if (step === 1 && i > 0) {
      i -= 1
    } else {
      j -= 1
    }
  }

  return { pairs, usedCount }
}

export function scoreRound(
  targetTimesMs: number[],
  tapTimesMs: number[],
  stepMs: number,
  hold?: HoldInput,
): RoundScore {
  // Cat de strans trebuie sa fie utilizatorul depinde de cat de apropiate sunt
  // notele intre ele, nu de rezolutia grilei pe care e scris ritmul. Aceeasi
  // melodie notata pe saisprezecimi sau pe patruzecisiopti e la fel de grea;
  // doar distanta dintre atacuri conteaza.
  const spacings = targetTimesMs
    .slice(1)
    .map((value, index) => value - targetTimesMs[index]!)
    .filter((value) => value > 0)
  const resolutionMs = spacings.length ? Math.min(...spacings) : stepMs

  // Pragurile se stramteaza odata cu subdiviziunea: o marja buna pentru
  // patrimi ar acoperi doua saisprezecimi vecine si ar face lectia inutila.
  const perfectMs = Math.max(45, Math.min(PERFECT_MS, resolutionMs * 0.35))
  const goodMs = Math.max(90, Math.min(GOOD_MS, resolutionMs * 0.7))
  // Fereastra de judecata: larga, dar nu atat cat o bataie sa poata fi luata
  // drept a vecinei. Potrivirea merge tinta cu tinta, in ordine, si fiecare
  // bataie se consuma o singura data, deci suprapunerea usoara e sigura.
  const windowMs = Math.max(goodMs, Math.min(280, resolutionMs * 0.6))

  // Prima trecere, cu fereastra larga: nu judecam nimic, doar aflam cat de
  // deplasate sunt bataile in ansamblu. Fara pasul asta, un device cu 200 ms
  // latenta ar iesi din fereastra la fiecare lovitura si ar primi zero,
  // desi ritmul a fost corect.
  const probeWindowMs = Math.max(windowMs, Math.min(400, resolutionMs * 1.2))
  const probe = matchTaps(targetTimesMs, tapTimesMs, probeWindowMs, 0)
  const probeErrors = probe.pairs
    .map((pair) => pair.rawErrorMs)
    .filter((value): value is number => value !== null)

  // Decalajul constant: latenta de iesire audio plus felul in care sta
  // utilizatorul fata de click. Il raportam intreg, nu il plafonam.
  const latencyMs = median(probeErrors)

  // A doua trecere, pe tinte deplasate: acum judecam uniformitatea, adica
  // exact ce inseamna „ai reprodus ritmul corect".
  const { pairs, usedCount } = matchTaps(targetTimesMs, tapTimesMs, windowMs, latencyMs)

  const minHold = hold?.minScoredHoldMs ?? MIN_SCORED_HOLD_MS
  const tapIndexOf = new Map(tapTimesMs.map((value, index) => [value, index]))

  const hits: HitResult[] = pairs.map(({ targetMs, tapMs, rawErrorMs }, targetIndex) => {
    const expectedHoldMs = hold?.targetDurationsMs[targetIndex] ?? null
    const scoresHold = expectedHoldMs !== null && expectedHoldMs >= minHold
    if (tapMs === null || rawErrorMs === null) {
      return {
        targetMs,
        tapMs: null,
        errorMs: null,
        judgement: 'miss' as const,
        holdJudgement: null,
        heldMs: null,
        expectedHoldMs: scoresHold ? expectedHoldMs : null,
      }
    }
    const errorMs = rawErrorMs - latencyMs
    const absolute = Math.abs(errorMs)
    const judgement: Judgement =
      absolute <= perfectMs
        ? 'perfect'
        : absolute <= goodMs
          ? 'good'
          : errorMs < 0
            ? 'early'
            : 'late'

    const tapIndex = tapIndexOf.get(tapMs)
    const heldMs =
      hold && tapIndex !== undefined ? (hold.tapDurationsMs[tapIndex] ?? null) : null
    let holdJudgement: HoldJudgement | null = null
    if (scoresHold && heldMs !== null && expectedHoldMs) {
      const ratio = heldMs / expectedHoldMs
      // Toleranta e larga: intentia conteaza, nu milisecunda de ridicare.
      holdJudgement = ratio < 0.55 ? 'short' : ratio > 1.65 ? 'long' : 'ok'
    }

    return {
      targetMs,
      tapMs,
      errorMs,
      judgement,
      holdJudgement,
      heldMs,
      expectedHoldMs: scoresHold ? expectedHoldMs : null,
    }
  })

  const matchedErrors = hits
    .map((hit) => hit.errorMs)
    .filter((value): value is number => value !== null)
  const meanAbsErrorMs = matchedErrors.length
    ? matchedErrors.reduce((sum, value) => sum + Math.abs(value), 0) / matchedErrors.length
    : 0
  // Dupa ce am scazut decalajul constant, media erorilor e aproape zero prin
  // constructie. Ce ramane interesant e daca utilizatorul accelereaza sau
  // incetineste pe parcursul rundei, deci comparam prima jumatate cu a doua.
  const half = Math.floor(matchedErrors.length / 2)
  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
  const drift =
    matchedErrors.length >= 4
      ? average(matchedErrors.slice(matchedErrors.length - half)) - average(matchedErrors.slice(0, half))
      : 0

  const extraTaps = tapTimesMs.length - usedCount

  // Fiecare lovitura valoreaza la fel; precizia in fereastra da partial credit.
  const perHit = hits.map((hit) => {
    if (hit.errorMs === null) return 0
    const absolute = Math.abs(hit.errorMs)
    const onset =
      absolute <= perfectMs ? 1 : absolute <= goodMs ? 0.8 : Math.max(0.3, 1 - absolute / windowMs)
    // Atacul ramane principal; durata gresita taie din nota, nu o anuleaza.
    const duration = hit.holdJudgement === null || hit.holdJudgement === 'ok' ? 1 : 0.6
    return onset * duration
  })
  const base = perHit.reduce((sum, value) => sum + value, 0) / Math.max(1, hits.length)
  // Bataile in plus se penalizeaza, dar nu pot singure duce runda la zero.
  const penalty = Math.min(0.35, extraTaps * 0.12)
  const score = Math.max(0, Math.min(100, Math.round((base - penalty) * 100)))

  return {
    score,
    hits,
    extraTaps,
    latencyMs,
    meanAbsErrorMs,
    tendency: drift < -30 ? 'rushing' : drift > 30 ? 'dragging' : 'steady',
  }
}

export function summarizeSession(scores: number[]) {
  if (!scores.length) return { average: 0, best: 0 }
  return {
    average: Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length),
    best: Math.max(...scores),
  }
}
