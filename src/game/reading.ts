import { mulberry32, shuffle } from './random'
import {
  tokenHitCount,
  tokenSpan,
  totalSpan,
  type RhythmToken,
} from './notation-tokens'

/**
 * Generatorul de exercitii pentru jocul de citire.
 *
 * Exercitiile erau inainte scrise de mana, cate cinci pe nivel. La scara la
 * care ne trebuie acum - douazeci pe nivel, pe toate notiunile din curriculum -
 * scrisul de mana ar fi insemnat cateva sute de siruri verificate cu ochiul.
 *
 * Dificultatea ramane insa la fel de controlata ca inainte, fiindca nu se
 * genereaza „orice": fiecare nivel isi declara VOCABULARUL, adica exact ce
 * simboluri au voie sa apara. Vocabularul e dificultatea. Ce alege generatorul
 * dinauntrul lui nu poate depasi nivelul.
 */

export interface ReadingExercise {
  id: string
  tokens: RhythmToken[]
  bpm: number
  /** Ce anume se exerseaza, afisat deasupra notatiei. */
  focus: string
  /** Cat tine o masura, in pasi. Implicit 48, adica 4/4. */
  ticksPerBar: number
  /** Cati timpi are o masura. Implicit 4. */
  beatsPerBar: number
}

export interface ReadingLevelSpec {
  level: number
  title: string
  description: string
  /**
   * Simbolurile care au voie sa apara. Vocabularul e dificultatea.
   *
   * Un simbol scris de mai multe ori apare mai des: alegerea e uniforma peste
   * lista, deci repetarea e felul in care se cantareste. Asa un nivel despre
   * saisprezecimi poate contine si patrimi, fara sa devina un nivel de patrimi.
   */
  vocabulary: RhythmToken[]
  bars: number
  /** Cat tine o masura, in pasi: 48 = 4/4, 24 = 2/4, 36 = 3/4 si 6/8. */
  ticksPerBar: number
  beatsPerBar: number
  /** Marginile intervalului de tempo pentru nivel. */
  bpm: [number, number]
  /**
   * Cand e adevarat, exercitiul poate incepe cu o pauza scurta - intrarea pe
   * contratimp e chiar ce exerseaza nivelurile de sincopa.
   */
  allowRestStart?: boolean
  /** Cate exercitii are nivelul. */
  count: number
}

export interface ReadingLevel {
  level: number
  title: string
  description: string
  exercises: ReadingExercise[]
}

/**
 * Eticheta „ce se exerseaza", dedusa din cel mai greu simbol prezent. Ordinea
 * e de la greu la usor: primul care se potriveste da numele exercitiului.
 */
const focusByToken: [RhythmToken, string][] = [
  ['sextoletSixteenths', 'Sextolet'],
  ['tripletEighths', 'Triolet'],
  ['sixteenthGroup', 'Grup de șaisprezecimi'],
  ['sixteenth', 'Șaisprezecimi izolate'],
  ['dottedEighth', 'Optime punctată'],
  ['dottedQuarter', 'Pătrime punctată'],
  ['tiedQuarters', 'Note legate'],
  ['tiedEighthQuarter', 'Legătură peste timp'],
  ['eighthRest', 'Pauză de optime'],
  ['eighthPair', 'Optimi'],
  ['eighth', 'Optime singură'],
  ['halfRest', 'Pauză de doime'],
  ['quarterRest', 'Pauză de pătrime'],
  ['half', 'Doime'],
  ['quarter', 'Pătrimi'],
]

function focusFor(tokens: RhythmToken[]) {
  const present = new Set(tokens)
  const match = focusByToken.find(([token]) => present.has(token))
  return match ? match[1] : 'Ritm'
}

/**
 * Umple o masura exact, alegand simboluri din vocabular. Poate esua: daca
 * raman trei pasi si cel mai scurt simbol tine sase, nu mai exista nicio
 * alegere buna. Atunci se reia masura de la zero - mai ieftin decat sa
 * cautam inapoi, si oricum se intampla rar.
 */
function fillBar(
  random: () => number,
  vocabulary: RhythmToken[],
  ticksPerBar: number,
  mustOpenWithHit: boolean,
): RhythmToken[] | null {
  const bar: RhythmToken[] = []
  let filled = 0
  while (filled < ticksPerBar) {
    const room = ticksPerBar - filled
    const options = vocabulary.filter((token) => {
      if (tokenSpan(token) > room) return false
      // Prima nota a exercitiului trebuie sa se auda, altfel elevul intra in
      // gol dupa numaratoare si nu stie daca a gresit el sau notatia.
      if (mustOpenWithHit && bar.length === 0 && filled === 0) return tokenHitCount(token) > 0
      return true
    })
    if (!options.length) return null
    const token = options[Math.floor(random() * options.length)]!
    bar.push(token)
    filled += tokenSpan(token)
  }
  return bar
}

/**
 * Tempourile se imprastie peste tot intervalul nivelului, apoi se amesteca.
 * Nu urca de la lent la rapid: un elev care bate corect doar cand tempoul
 * creste previzibil s-a obisnuit cu rampa, nu cu ritmul. E aceeasi regula ca
 * la tempourile din lectii.
 */
function temposFor(spec: ReadingLevelSpec, random: () => number) {
  const [slow, fast] = spec.bpm
  const spread = Array.from({ length: spec.count }, (_, index) =>
    Math.round(slow + ((fast - slow) * index) / Math.max(1, spec.count - 1)),
  )
  return shuffle(spread, random)
}

export function generateReadingExercises(spec: ReadingLevelSpec): ReadingExercise[] {
  // Seed derivat din numarul nivelului: acelasi nivel da mereu aceleasi
  // exercitii, deci progresul si testele au ce sa se agate.
  const random = mulberry32(spec.level * 2_654_435_761)
  const tempos = temposFor(spec, random)
  const exercises: ReadingExercise[] = []
  const seen = new Set<string>()

  let guard = 0
  while (exercises.length < spec.count && guard < spec.count * 200) {
    guard += 1
    const tokens: RhythmToken[] = []
    let failed = false
    for (let bar = 0; bar < spec.bars; bar += 1) {
      const mustOpenWithHit = bar === 0 && !spec.allowRestStart
      let built: RhythmToken[] | null = null
      for (let attempt = 0; attempt < 40 && !built; attempt += 1) {
        built = fillBar(random, spec.vocabulary, spec.ticksPerBar, mustOpenWithHit)
      }
      if (!built) {
        failed = true
        break
      }
      tokens.push(...built)
    }
    if (failed) continue

    // Un exercitiu fara destule note nu e un exercitiu, ci o pauza lunga.
    const hits = tokens.reduce((sum, token) => sum + tokenHitCount(token), 0)
    if (hits < Math.max(3, spec.bars * 2)) continue
    // Prima nota trebuie sa cada in primul timp, altfel se asteapta in gol.
    if (firstHitStep(tokens) >= spec.ticksPerBar / spec.beatsPerBar) continue

    const key = tokens.join('|')
    if (seen.has(key)) continue
    seen.add(key)

    exercises.push({
      id: `r${spec.level}-${exercises.length + 1}`,
      tokens,
      bpm: tempos[exercises.length]!,
      focus: focusFor(tokens),
      ticksPerBar: spec.ticksPerBar,
      beatsPerBar: spec.beatsPerBar,
    })
  }

  return exercises
}

/** La al catelea pas cade prima nota. */
export function firstHitStep(tokens: RhythmToken[]) {
  let cursor = 0
  for (const token of tokens) {
    if (tokenHitCount(token) > 0) return cursor
    cursor += tokenSpan(token)
  }
  return cursor
}

/** Verifica faptul de care depinde totul: sirul umple masuri intregi. */
export function fillsWholeBars(tokens: RhythmToken[], ticksPerBar: number) {
  const span = totalSpan(tokens)
  return span > 0 && span % ticksPerBar === 0
}
