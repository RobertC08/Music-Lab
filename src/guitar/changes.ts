import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { chordLevels } from './chord-library'
import type { ChordShape } from './chords'

/*
  Însoțitorul de practică pentru schimbările de acorduri.

  Ce se exersează: mutarea mâinii de pe un acord pe altul la timp. Aplicația
  ține timpul (metronomul), arată acordul de acum și pe cel care urmează, și
  poate cânta ea acordul pe fiecare schimbare. NU aude chitara și nu punctează
  nimic (skill-ul `predare-chitara`): numără doar schimbările trecute.

  Nivelurile cresc pe trei axe, în ordinea din curriculum: întâi perechi de
  acorduri deschise la 4 timpi, apoi progresii întregi, apoi schimbări mai dese
  (2 timpi, apoi pe fiecare timp), apoi barré, apoi serii aleatorii, unde nu
  mai poți memora ordinea și trebuie să citești acordul.

  Acordurile se iau din bibliotecă după id, ca diagrama și digitația să fie
  aceleași peste tot. Un test verifică că toate id-urile există.
*/

export type BeatsPerChord = 1 | 2 | 4

/** Tempoul maxim, la toate exercițiile. Pasul de reglaj e 1 BPM. */
export const MAX_BPM = 200

export interface ChangeExercise {
  id: string
  title: LocalizedText
  /** Ce se exersează și cum, într-o propoziție sau două. */
  tip: LocalizedText
  beatsPerChord: BeatsPerChord
  tempo: { min: number; max: number; suggested: number }
  /** Ordinea acordurilor, id-uri din bibliotecă. Lipsă la cele aleatorii. */
  chords?: string[]
  /** Exercițiu aleatoriu: din ce acorduri se trage seria. */
  pool?: string[]
}

export interface ChangeLevel {
  id: string
  title: LocalizedText
  summary: LocalizedText
  accent: string
  soft: string
  exercises: ChangeExercise[]
}

const libraryById = new Map(chordLevels.flatMap((level) => level.chords).map((chord) => [chord.id, chord]))

export function chordById(id: string): ChordShape | undefined {
  return libraryById.get(id)
}

const OPEN_CHORDS = ['Em', 'Am', 'E', 'A', 'D', 'Dm', 'C', 'G']
const SEVENTHS = ['E7', 'A7', 'D7', 'B7', 'G7', 'C7']
const BARRE = ['F', 'Fm', 'G-barre', 'Gm', 'A-barre', 'Am-barre', 'Bb', 'B', 'C-barre', 'Bm', 'Cm', 'D-barre']
const COLOURS = ['Am7', 'Em7', 'Cmaj7', 'Fmaj7', 'Gmaj7', 'Asus2', 'Asus4', 'Dsus2', 'Dsus4', 'Cadd9']

export const changeLevels: ChangeLevel[] = [
  {
    id: 'perechi',
    title: { ro: 'Primele schimbări', en: 'First changes' },
    summary: {
      ro: 'Două acorduri, câte o măsură fiecare. Patru timpi ca să muți mâna.',
      en: 'Two chords, one bar each. Four beats to move your hand.',
    },
    accent: '#FF7A00',
    soft: '#FFF1E3',
    exercises: [
      {
        id: 'em-am',
        title: { ro: 'Em ↔ Am', en: 'Em ↔ Am' },
        tip: {
          ro: 'Degetele 2 și 3 coboară împreună cu o coardă, iar degetul 1 se adaugă pe coarda 2.',
          en: 'Fingers 2 and 3 move down one string together, and finger 1 joins on string 2.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['Em', 'Am'],
      },
      {
        id: 'am-e',
        title: { ro: 'Am ↔ E', en: 'Am ↔ E' },
        tip: {
          ro: 'Aceeași formă, mutată cu o coardă. Mută toate trei degetele deodată, ca pe o singură piesă.',
          en: 'The same shape, moved one string over. Move all three fingers at once, as one piece.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['Am', 'E'],
      },
      {
        id: 'am-c',
        title: { ro: 'Am ↔ C', en: 'Am ↔ C' },
        tip: {
          ro: 'Degetele 1 și 2 nu se mișcă. Doar degetul 3 sare de pe coarda 3 pe coarda 5.',
          en: 'Fingers 1 and 2 stay put. Only finger 3 jumps from string 3 to string 5.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['Am', 'C'],
      },
      {
        id: 'a-d',
        title: { ro: 'A ↔ D', en: 'A ↔ D' },
        tip: {
          ro: 'Niciun deget comun: ridică mâna puțin și pune forma de Re întreagă, nu deget cu deget.',
          en: 'No shared finger: lift the hand slightly and place the whole D shape, not finger by finger.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['A', 'D'],
      },
      {
        id: 'c-g',
        title: { ro: 'C ↔ G', en: 'C ↔ G' },
        tip: {
          ro: 'Cea mai cântată pereche. Dacă ții Sol cu degetele 3, 2 și 4, degetele 3 și 2 urcă doar cu o coardă.',
          en: 'The most played pair. If you hold G with fingers 3, 2 and 4, fingers 3 and 2 just move up one string.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['C', 'G'],
      },
      {
        id: 'd-g',
        title: { ro: 'D ↔ G', en: 'D ↔ G' },
        tip: {
          ro: 'Mâna trece de pe coardele subțiri pe cele groase. Ține ochii pe coarda 6: acolo cade primul deget de Sol.',
          en: 'The hand crosses from the thin strings to the thick ones. Watch string 6: the first G finger lands there.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['D', 'G'],
      },
    ],
  },
  {
    id: 'progresii',
    title: { ro: 'Progresii', en: 'Progressions' },
    summary: {
      ro: 'Trei-patru acorduri, câte o măsură. Progresiile pe care sunt construite sute de piese.',
      en: 'Three or four chords, one bar each. The progressions hundreds of songs are built on.',
    },
    accent: '#008C88',
    soft: '#E3F3F2',
    exercises: [
      {
        id: 'g-c-d',
        title: { ro: 'G – C – D', en: 'G – C – D' },
        tip: {
          ro: 'I–IV–V în Sol: cele trei acorduri ale unei tonalități majore.',
          en: 'I–IV–V in G: the three main chords of a major key.',
        },
        beatsPerChord: 4,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['G', 'C', 'D', 'C'],
      },
      {
        id: 'a-d-e',
        title: { ro: 'A – D – E', en: 'A – D – E' },
        tip: { ro: 'I–IV–V în La.', en: 'I–IV–V in A.' },
        beatsPerChord: 4,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['A', 'D', 'E', 'D'],
      },
      {
        id: 'g-em-c-d',
        title: { ro: 'G – Em – C – D', en: 'G – Em – C – D' },
        tip: {
          ro: 'I–vi–IV–V, progresia „doo-wop". De la Sol la Mi minor se ridică doar două degete.',
          en: 'I–vi–IV–V, the "doo-wop" progression. From G to E minor only two fingers lift.',
        },
        beatsPerChord: 4,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['G', 'Em', 'C', 'D'],
      },
      {
        id: 'am-dm-e',
        title: { ro: 'Am – Dm – Am – E', en: 'Am – Dm – Am – E' },
        tip: {
          ro: 'i–iv–V în La minor. Mi major de la final cere să te întorci la La minor.',
          en: 'i–iv–V in A minor. The E major at the end pulls you back to A minor.',
        },
        beatsPerChord: 4,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['Am', 'Dm', 'Am', 'E'],
      },
      {
        id: 'c-am-dm-g7',
        title: { ro: 'C – Am – Dm – G7', en: 'C – Am – Dm – G7' },
        tip: {
          ro: 'I–vi–ii–V în Do. Sol7 se rezolvă firesc înapoi în Do.',
          en: 'I–vi–ii–V in C. G7 resolves naturally back to C.',
        },
        beatsPerChord: 4,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['C', 'Am', 'Dm', 'G7'],
      },
    ],
  },
  {
    id: 'doi-timpi',
    title: { ro: 'Mai repede: la 2 timpi', en: 'Faster: every 2 beats' },
    summary: {
      ro: 'Două acorduri pe măsură. Timpul de mutare se înjumătățește.',
      en: 'Two chords per bar. Half the time to move.',
    },
    accent: '#6547E8',
    soft: '#EEEAFC',
    exercises: [
      {
        id: 'g-d-em-c',
        title: { ro: 'G – D – Em – C', en: 'G – D – Em – C' },
        tip: {
          ro: 'I–V–vi–IV, progresia cea mai folosită în pop. Ultima lovitură dinaintea schimbării poate cădea pe coarde goale: e mai bine decât o pauză.',
          en: 'I–V–vi–IV, the most used pop progression. The last strum before a change can hit open strings: better than a gap.',
        },
        beatsPerChord: 2,
        tempo: { min: 50, max: MAX_BPM, suggested: 70 },
        chords: ['G', 'D', 'Em', 'C'],
      },
      {
        id: 'am-f-c-g',
        title: { ro: 'Am – F – C – G', en: 'Am – F – C – G' },
        tip: {
          ro: 'vi–IV–I–V, cu Fa pe patru coarde. Degetul 1 culcat pe coardele 1 și 2.',
          en: 'vi–IV–I–V, with F on four strings. Finger 1 laid across strings 1 and 2.',
        },
        beatsPerChord: 2,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['Am', 'F-mic', 'C', 'G'],
      },
      {
        id: 'blues-e7',
        title: { ro: 'E7 – A7 – B7', en: 'E7 – A7 – B7' },
        tip: {
          ro: 'Cele trei acorduri ale blues-ului în Mi. B7 e cel mai greu: pregătește-l din timp.',
          en: 'The three chords of a blues in E. B7 is the hardest: get ready for it early.',
        },
        beatsPerChord: 2,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['E7', 'A7', 'E7', 'B7'],
      },
      {
        id: 'ii-v-i-g',
        title: { ro: 'Am7 – D7 – Gmaj7 – Cmaj7', en: 'Am7 – D7 – Gmaj7 – Cmaj7' },
        tip: {
          ro: 'ii–V–I–IV în Sol, cu septime: sunetul de jazz și bossa, pe acorduri deschise.',
          en: 'ii–V–I–IV in G with sevenths: the jazz and bossa sound, on open chords.',
        },
        beatsPerChord: 2,
        tempo: { min: 50, max: MAX_BPM, suggested: 66 },
        chords: ['Am7', 'D7', 'Gmaj7', 'Cmaj7'],
      },
    ],
  },
  {
    id: 'barre',
    title: { ro: 'Barré', en: 'Barre chords' },
    summary: {
      ro: 'Schimbări care trec prin barré. Întâi la 4 timpi, apoi la 2.',
      en: 'Changes through barre chords. First every 4 beats, then every 2.',
    },
    accent: '#158A52',
    soft: '#E6F4EC',
    exercises: [
      {
        id: 'f-c',
        title: { ro: 'F ↔ C', en: 'F ↔ C' },
        tip: {
          ro: 'Primul barré într-o progresie. Pune întâi degetul 1 culcat, apoi restul formei.',
          en: 'The first barre in a progression. Lay finger 1 down first, then the rest of the shape.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 56 },
        chords: ['F', 'C'],
      },
      {
        id: 'f-bb-c',
        title: { ro: 'F – Bb – C', en: 'F – B♭ – C' },
        tip: {
          ro: 'I–IV–V în Fa, toate în barré. Fa e pe forma de Mi, Si♭ și Do pe forma de La.',
          en: 'I–IV–V in F, all barre chords. F uses the E shape, B♭ and C the A shape.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 56 },
        chords: ['F', 'Bb', 'C-barre', 'Bb'],
      },
      {
        id: 'bm-g-d-a',
        title: { ro: 'Bm – G – D – A', en: 'Bm – G – D – A' },
        tip: {
          ro: 'vi–IV–I–V în Re, cu Si minor în barré, între acorduri deschise.',
          en: 'vi–IV–I–V in D, with B minor as a barre between open chords.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        chords: ['Bm', 'G', 'D', 'A'],
      },
      {
        id: 'g-c-d-barre',
        title: { ro: 'G – C – D în barré', en: 'G – C – D as barres' },
        tip: {
          ro: 'Aceeași progresie ca la început, numai pe barré: forma se mută, mâna rămâne la fel.',
          en: 'The same progression as at the start, all barres: the shape moves, the hand stays the same.',
        },
        beatsPerChord: 2,
        tempo: { min: 40, max: MAX_BPM, suggested: 56 },
        chords: ['G-barre', 'C-barre', 'D-barre', 'C-barre'],
      },
    ],
  },
  {
    id: 'fiecare-timp',
    title: { ro: 'Pe fiecare timp', en: 'Every beat' },
    summary: {
      ro: 'Un acord pe timp. Aici mâna învață să se mute fără să se gândească.',
      en: 'One chord per beat. This is where the hand learns to move without thinking.',
    },
    accent: '#C2410C',
    soft: '#FDEDE3',
    exercises: [
      {
        id: 'g-c-fast',
        title: { ro: 'G ↔ C, pe timp', en: 'G ↔ C, every beat' },
        tip: {
          ro: 'Începe încet: la 50 BPM ai o secundă întreagă pentru fiecare schimbare.',
          en: 'Start slow: at 50 BPM you have a full second for every change.',
        },
        beatsPerChord: 1,
        tempo: { min: 40, max: MAX_BPM, suggested: 50 },
        chords: ['G', 'C'],
      },
      {
        id: 'am-e-fast',
        title: { ro: 'Am ↔ E, pe timp', en: 'Am ↔ E, every beat' },
        tip: {
          ro: 'Forma se mută cu o coardă la fiecare timp. Degetele nu se depărtează de coarde.',
          en: 'The shape moves one string every beat. Keep the fingers close to the strings.',
        },
        beatsPerChord: 1,
        tempo: { min: 40, max: MAX_BPM, suggested: 50 },
        chords: ['Am', 'E'],
      },
      {
        id: 'd-a-e-fast',
        title: { ro: 'D – A – E – A, pe timp', en: 'D – A – E – A, every beat' },
        tip: {
          ro: 'Trei forme diferite, una pe timp. Dacă nu ajungi, coboară tempoul, nu sări peste acorduri.',
          en: 'Three different shapes, one per beat. If you cannot keep up, lower the tempo rather than skip chords.',
        },
        beatsPerChord: 1,
        tempo: { min: 40, max: MAX_BPM, suggested: 50 },
        chords: ['D', 'A', 'E', 'A'],
      },
    ],
  },
  {
    id: 'aleatoriu',
    title: { ro: 'Aleatoriu', en: 'Random' },
    summary: {
      ro: 'Serii trase la întâmplare: nu mai poți memora ordinea, trebuie să citești acordul care urmează.',
      en: 'Randomly drawn series: you cannot memorise the order, you have to read the next chord.',
    },
    accent: '#B4237A',
    soft: '#FAE6F1',
    exercises: [
      {
        id: 'random-open',
        title: { ro: 'Acorduri deschise', en: 'Open chords' },
        tip: {
          ro: 'Cele opt acorduri de bază, în orice ordine. Uită-te la „urmează" din timp.',
          en: 'The eight basic chords, in any order. Watch "next" early.',
        },
        beatsPerChord: 4,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        pool: OPEN_CHORDS,
      },
      {
        id: 'random-sevenths',
        title: { ro: 'Deschise și septime', en: 'Open chords and sevenths' },
        tip: {
          ro: 'Acordurile de bază amestecate cu septimele. La 2 timpi.',
          en: 'The basic chords mixed with sevenths. Every 2 beats.',
        },
        beatsPerChord: 2,
        tempo: { min: 40, max: MAX_BPM, suggested: 60 },
        pool: [...OPEN_CHORDS, ...SEVENTHS],
      },
      {
        id: 'random-barre',
        title: { ro: 'Barré', en: 'Barre chords' },
        tip: {
          ro: 'Doar barré, pe ambele forme. Caută tonica pe coarda 6 sau 5 înainte să pui forma.',
          en: 'Barre chords only, both shapes. Find the root on string 6 or 5 before placing the shape.',
        },
        beatsPerChord: 2,
        tempo: { min: 40, max: MAX_BPM, suggested: 56 },
        pool: BARRE,
      },
      {
        id: 'random-all',
        title: { ro: 'Tot amestecat', en: 'Everything mixed' },
        tip: {
          ro: 'Deschise, septime, culori și barré, la 2 timpi. Exercițiul de final.',
          en: 'Open, sevenths, colours and barres, every 2 beats. The final exercise.',
        },
        beatsPerChord: 2,
        tempo: { min: 40, max: MAX_BPM, suggested: 56 },
        pool: [...OPEN_CHORDS, ...SEVENTHS, ...COLOURS, ...BARRE],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Seria și planul de timp
// ---------------------------------------------------------------------------

/** Lungimea unei serii aleatorii, înainte de reluare. */
export const RANDOM_LENGTH = 8

/** Un generator cu sămânță: aceeași sămânță dă aceeași serie (reluabilă, testabilă). */
function seeded(seed: number) {
  let state = seed >>> 0 || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x100000000
  }
}

/**
 * Seria de acorduri a unui exercițiu. La cele aleatorii, trasă cu sămânța dată:
 * fără același acord de două ori la rând, nici peste reluare (ultimul diferit de
 * primul), altfel o „schimbare" ar fi o pauză.
 */
export function chordSequence(exercise: ChangeExercise, seed = 1): ChordShape[] {
  if (exercise.chords) return exercise.chords.map((id) => chordById(id)!)
  const pool = exercise.pool ?? []
  const random = seeded(seed)
  const ids: string[] = []
  while (ids.length < RANDOM_LENGTH) {
    const id = pool[Math.floor(random() * pool.length)]!
    const previous = ids[ids.length - 1]
    const closesLoop = ids.length === RANDOM_LENGTH - 1 && id === ids[0]
    if (id !== previous && !closesLoop) ids.push(id)
  }
  return ids.map((id) => chordById(id)!)
}

/** Numărătoarea de dinainte: o măsură, doar metronom. */
export const COUNT_IN_BEATS = 4
export const BEATS_PER_BAR = 4
/** Cât ține o sesiune, cel puțin: seria se repetă până trece de atât. */
const TARGET_MS = 60_000
const MAX_MS = 95_000

export interface ChangesPlan {
  bpm: number
  beatMs: number
  beatsPerChord: BeatsPerChord
  /** O trecere prin serie. */
  sequence: ChordShape[]
  repeats: number
  /** Toți timpii, cu numărătoarea. */
  totalBeats: number
  /** Sfârșitul muzical (fără coada ultimului acord). */
  durationMs: number
}

export function planChanges(exercise: ChangeExercise, bpm: number, seed = 1): ChangesPlan {
  const beatMs = 60_000 / bpm
  const sequence = chordSequence(exercise, seed)
  const cycleBeats = sequence.length * exercise.beatsPerChord
  let repeats = Math.max(2, Math.ceil(TARGET_MS / (cycleBeats * beatMs)))
  while (repeats > 2 && (COUNT_IN_BEATS + repeats * cycleBeats) * beatMs > MAX_MS) repeats -= 1
  const totalBeats = COUNT_IN_BEATS + repeats * cycleBeats
  return {
    bpm,
    beatMs,
    beatsPerChord: exercise.beatsPerChord,
    sequence,
    repeats,
    totalBeats,
    durationMs: totalBeats * beatMs,
  }
}

export interface BeatPosition {
  /** Timpul curent din toată sesiunea, de la 0. */
  beat: number
  /** În numărătoare: 1-4. `null` după ea. */
  countIn: number | null
  /** Al câtelea acord din serie se cântă (în numărătoare: primul, care vine). */
  chordIndex: number
  /** Al câtelea timp din acordul curent, de la 0. */
  beatInChord: number
  /** Câte schimbări s-au făcut până acum (prima intrare nu se socotește). */
  changes: number
}

export function positionAt(plan: ChangesPlan, beat: number): BeatPosition {
  if (beat < COUNT_IN_BEATS) {
    return { beat, countIn: beat + 1, chordIndex: 0, beatInChord: 0, changes: 0 }
  }
  const played = beat - COUNT_IN_BEATS
  const chordNumber = Math.floor(played / plan.beatsPerChord)
  return {
    beat,
    countIn: null,
    chordIndex: chordNumber % plan.sequence.length,
    beatInChord: played % plan.beatsPerChord,
    changes: chordNumber,
  }
}

/** Câte schimbări are toată sesiunea. */
export const totalChanges = (plan: ChangesPlan) =>
  plan.repeats * plan.sequence.length - 1
