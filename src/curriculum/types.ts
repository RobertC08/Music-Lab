import type { BeatGridCell, NoteKind } from '../components/notation'
import type { RhythmToken } from '../game/notation-tokens'

/** Un simbol afisat in lectie, cu numele si durata lui. */
export interface NotationItem {
  kind: NoteKind
  name: string
  duration: string
}

/** Un pattern care poate fi ascultat ca exemplu sau exersat. */
export interface PatternSpec {
  steps: boolean[]
  /** Al doilea flux, care se aude sub pattern fara sa fie o sarcina. */
  backing?: boolean[]
  stepsPerBar: number
  /** Cati timpi are o masura. Implicit 4, adica 4/4. */
  beatsPerBar?: number
}

/** Un pas de lectie: se explica ceva, se arata, eventual se si asculta. */
export interface LessonSection {
  id: string
  heading: string
  body: string
  notation?: NotationItem[]
  grid?: BeatGridCell[]
  /**
   * Al doilea rand de grila, pe aceeasi unitate: pentru poliritm, fluxul care
   * se aude sub al tau.
   */
  gridSecondary?: BeatGridCell[]
  /** Etichetele celor doua randuri, cand grila are doua. */
  gridLabel?: string
  gridSecondaryLabel?: string
  /**
   * Stiva de comparatie: aceeasi masura in patrimi, optimi si saisprezecimi.
   * Randul indicat ramane clar, celelalte se estompeaza - fara comparatie,
   * o grila izolata nu arata ca latimea inseamna durata.
   */
  durationStack?: 'quarter' | 'eighth' | 'sixteenth'
  /** O linie de notatie reala, cand lectia e despre cum arata ritmul scris. */
  rhythmLine?: RhythmToken[]
  /** Cat tine o masura din linia de mai sus, in pasi. Implicit 48, adica 4/4. */
  rhythmLineTicksPerBar?: number
  /** Exemplul pe care elevul il asculta inainte sa exerseze. */
  example?: PatternSpec & {
    bpm: number
    caption: string
    /** `grid` cand lectia e despre *unde* cade nota, nu despre ce nota e. */
    emphasis?: 'pattern' | 'grid'
  }
}

export interface LessonPractice {
  instruction: string
  stepsPerBar: number
  /**
   * Cati timpi are o masura. Implicit 4. Schimba unde cade bara si accentul,
   * nu lungimea pasilor - o patrime ramane o patrime in orice masura.
   */
  beatsPerBar?: number
  /** Pattern-ul exersat; daca sunt mai multe, se rotesc pe runde. */
  patterns: boolean[][]
  /**
   * Durata fiecarei note din fiecare pattern, in pasi. Prezenta ei face ca
   * exercitiul sa ceara si tinerea apasata, nu doar atacul - necesar la
   * lectiile despre durata, cum e legarea ritmurilor.
   */
  patternDurations?: number[][]
  /**
   * Fluxul care se aude sub fiecare pattern fara sa se bata, aliniat cu
   * `patterns`. Cu el, exercitiul cere un ritm impotriva altuia - poliritm -
   * fara a avea nevoie de o a doua zona de atingere.
   */
  backingPatterns?: boolean[][]
  /**
   * Ce exerseaza fiecare pattern, aliniat cu `patterns`. La poliritm spune
   * care contra care - fara asta, rundele arata la fel si elevul nu stie ce
   * anume tocmai a batut.
   */
  patternLabels?: string[]
  /** Cate un tempo pentru fiecare runda. Lungimea da numarul de runde. */
  tempos: number[]
}

/** O intrare de dictionar pe care o introduce o lectie. */
export interface ReferenceEntry {
  term: string
  meaning: string
}

export interface Lesson {
  id: string
  title: string
  goal: string
  /**
   * Notiunile pe care le introduce lectia, asa cum apar in cheat sheet.
   * Sunt parte din lectie, nu o lista separata: altfel cheat sheet-ul ramane
   * in urma de fiecare data cand adaugam o lectie.
   */
  reference: ReferenceEntry[]
  sections: LessonSection[]
  practice: LessonPractice
}

export interface Category {
  id: string
  title: string
  subtitle: string
  /** Cheia imaginii de card, rezolvata in ecranul de categorii. */
  cover: 'rhythm'
  accent: string
  soft: string
  border: string
  lessons: Lesson[]
}
