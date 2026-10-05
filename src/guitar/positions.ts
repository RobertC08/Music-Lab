import type { FretFinger, TabNote } from './finger-exercises'
import type { NoteSet } from './scales'
import { degreeOf } from './scales'
import { OPEN_STRINGS, pitchAt, pitchClass, type GuitarString } from './tuning'

/*
  Pozițiile unei game pe gât, calculate, nu scrise.

  Scheletul e o pentatonică (`NoteSet.positions.core`): pornind pe coarda 6 de
  la treapta k, câte două note pe coardă, crescător, până la coarda 1. Așa ies
  exact cele cinci cutii standard ale pentatonicii (cutia 1 a lui La minor,
  tastele 5-8; cutia 2, tastele 7-10...). Fereastra de taste a cutiei e
  fereastra poziției.

  Notele care lipsesc din pentatonică (la gama majoră 4 și 7, la minoră 2 și ♭6,
  la blues ♭5) intră în aceeași fereastră, fiecare pe coarda unde păstrează
  ordinea notelor de la grav la acut. Dacă încape pe două coarde, merge pe cea
  cu mai puține note (la egalitate, pe cea mai groasă). O notă din mijlocul
  gamei care nu încape deloc în fereastră se ia cu o întindere de o tastă.
  Rezultatul sunt cele cinci poziții CAGED ale gamei majore și minore; testul
  le verifică pe toate tonalitățile, inclusiv că nicio notă a gamei nu lipsește
  dintre două note vecine ale poziției.

  Tonalitatea doar mută forma: tonica pe coarda 6 e la tasta (tonică - Mi).
  Pozițiile urcă pe gât în ordine (la La minor: 5-8, 7-10, 9-13, 12-15), iar
  una care ar trece de tasta 15 coboară o octavă: mostrele de chitară ajung
  până la tasta 15 pe coarda 1 (`MAX_FRET`). Una care ar ieși sub tasta 0 urcă.

  Digitația: un deget pe tastă, pe fiecare coardă, cu ancora la începutul
  ferestrei; o coardă care trece de patru taste mută ancora (întinderea e la
  degetul 1, ca în metodele clasice).
*/

export interface PositionNote {
  string: GuitarString
  fret: number
  pitch: number
  /** Treapta în gamă: '1', '♭3'... */
  degree: string
  root: boolean
  finger: FretFinger
}

export interface ScalePosition {
  /** 1, 2, 3... */
  number: number
  /** Notele, de la grav la acut (ordinea în care se cântă gama în sus). */
  notes: PositionNote[]
  /** Fereastra de taste, ca să se știe ce parte din gât se desenează. */
  minFret: number
  maxFret: number
}

const STRINGS_LOW_TO_HIGH: GuitarString[] = [6, 5, 4, 3, 2, 1]
const fretOn = (string: GuitarString, pitch: number) => pitch - OPEN_STRINGS[string - 1]!
/** Tasta tonicii pe coarda 6 (Mi gros), 0-11. */
const rootFret = (root: number) => pitchClass(root - 4)

type Placed = { string: GuitarString; pitch: number }

/** Cutia pentatonică k: două note pe coardă, de la treapta k pe coarda 6. */
function pentatonicBox(core: readonly number[], root: number, k: number): Placed[] {
  const start = pitchAt(6, rootFret(root) + core[k]!)
  const pitches: number[] = []
  for (let index = 0; index < 12; index += 1) {
    const octave = Math.floor((k + index) / core.length)
    pitches.push(start - core[k]! + core[(k + index) % core.length]! + 12 * octave)
  }
  return pitches.map((pitch, index) => ({ string: STRINGS_LOW_TO_HIGH[Math.floor(index / 2)]!, pitch }))
}

/** Adaugă notele care lipsesc din schelet (vezi comentariul de sus). */
function fill(base: Placed[], wanted: readonly number[], root: number, minFret: number, maxFret: number): Placed[] {
  const placed = [...base]
  const count = (string: GuitarString) => placed.filter((other) => other.string === string).length
  // Ordinea de la grav la acut: tot ce e pe coardele mai groase e mai jos, tot ce e pe cele subțiri, mai sus.
  const keepsOrder = (string: GuitarString, pitch: number) =>
    placed.every((other) => (other.string > string ? other.pitch < pitch : other.string < string ? other.pitch > pitch : true))
  const candidates = (pitch: number, from: number, to: number) =>
    STRINGS_LOW_TO_HIGH.filter((string) => {
      const fret = fretOn(string, pitch)
      return fret >= from && fret <= to && keepsOrder(string, pitch)
    })

  // 1. În fereastra cutiei, inclusiv sub prima notă și peste ultima.
  for (let pitch = pitchAt(6, minFret); pitch <= pitchAt(1, maxFret); pitch += 1) {
    if (!wanted.includes(pitchClass(pitch - root))) continue
    const options = candidates(pitch, minFret, maxFret)
    if (options.length === 0) continue
    // `options` e de la groasă la subțire: la egalitate rămâne cea mai groasă.
    placed.push({ string: options.reduce((chosen, string) => (count(string) < count(chosen) ? string : chosen)), pitch })
  }

  /*
    2. O notă din mijlocul gamei care nu încape în fereastră nu se sare: se ia
    cu o întindere de o tastă: forma cât mai îngustă, apoi coarda pe care mâna
    se lărgește cel mai puțin. Așa
    cântă și metodele Si-ul din La minor, poziția 1: coarda Sol, tasta 4, cu
    arătătorul întins (fereastra 5-8 nu-l are pe nicio coardă).
  */
  const lowest = Math.min(...placed.map((note) => note.pitch))
  const highest = Math.max(...placed.map((note) => note.pitch))
  for (let pitch = lowest + 1; pitch < highest; pitch += 1) {
    if (!wanted.includes(pitchClass(pitch - root)) || placed.some((note) => note.pitch === pitch)) continue
    const options = candidates(pitch, minFret - 1, maxFret + 1).filter((string) => fretOn(string, pitch) >= 0)
    if (options.length === 0) continue
    const frets = placed.map((note) => fretOn(note.string, note.pitch))
    const span = (string: GuitarString) =>
      Math.max(...frets, fretOn(string, pitch)) - Math.min(...frets, fretOn(string, pitch))
    // Pe coarda ei, nota nouă lărgește mâna cât mai puțin (Sol: 4 5 7, nu Re: 5 7 9).
    const reach = (string: GuitarString) => {
      const onString = [...placed.filter((note) => note.string === string).map((note) => fretOn(string, note.pitch)), fretOn(string, pitch)]
      return Math.max(...onString) - Math.min(...onString)
    }
    const rank = (string: GuitarString) => [span(string), reach(string), count(string)]
    /** Prima diferență decide; la egalitate peste tot rămâne cea aleasă (cea mai groasă). */
    const better = (string: GuitarString, chosen: GuitarString) => {
      const [a, b] = [rank(string), rank(chosen)]
      const index = a.findIndex((value, at) => value !== b[at])
      return index >= 0 && a[index]! < b[index]!
    }
    const best = options.reduce((chosen, string) => (better(string, chosen) ? string : chosen))
    placed.push({ string: best, pitch })
  }
  return placed
}

/** Cele cinci cutii standard (sau poziția cromatică), înainte de digitație. */
function rawPositions(set: NoteSet, root: number): Placed[][] {
  if (set.positions.kind === 'chromatic') {
    // Toate notele de la tonica de pe coarda 6, cinci taste pe coardă (patru pe Sol,
    // unde coarda următoare e la o terță mare, nu la o cvartă).
    const base = rootFret(root)
    const placed: Placed[] = []
    let pitch = pitchAt(6, base)
    for (const string of STRINGS_LOW_TO_HIGH) {
      const last = string === 1 ? pitchAt(1, base + 4) : pitchAt((string - 1) as GuitarString, base) - 1
      for (; pitch <= last; pitch += 1) placed.push({ string, pitch })
    }
    return [placed]
  }
  const { core } = set.positions
  const wanted = set.intervals.filter((interval) => !core.includes(interval))
  return core.map((_, k) => {
    const box = pentatonicBox(core, root, k)
    const frets = box.map((note) => fretOn(note.string, note.pitch))
    return fill(box, wanted, root, Math.min(...frets), Math.max(...frets))
  })
}

/** Cea mai sus tastă folosită: Mi subțire pe tasta 15 e cea mai înaltă mostră (MIDI 79). */
export const MAX_FRET = 15

/** Mută o formă cu o octavă, ca să încapă între tastele 0 și `MAX_FRET`. */
function normalize(notes: Placed[]): Placed[] {
  const frets = notes.map((note) => fretOn(note.string, note.pitch))
  const shift = Math.min(...frets) < 0 ? 12 : Math.max(...frets) > MAX_FRET ? -12 : 0
  return notes.map((note) => ({ ...note, pitch: note.pitch + shift }))
}

function finger(fret: number, stringFrets: number[], windowMin: number): FretFinger {
  if (fret === 0) return 0
  const anchor = Math.max(1, windowMin, Math.max(...stringFrets) - 3)
  return Math.min(4, Math.max(1, fret - anchor + 1)) as FretFinger
}

/** Pozițiile unui set de note în tonalitatea dată (`root` = clasa tonicii, 0 = Do). */
export function scalePositions(set: NoteSet, root: number): ScalePosition[] {
  return rawPositions(set, pitchClass(root)).map((raw, index) => {
    const placed = normalize(raw).sort((a, b) => a.pitch - b.pitch)
    const frets = placed.map((note) => fretOn(note.string, note.pitch))
    const minFret = Math.min(...frets)
    const maxFret = Math.max(...frets)
    const notes = placed.map((note): PositionNote => {
      const fret = fretOn(note.string, note.pitch)
      const onString = placed.filter((other) => other.string === note.string).map((other) => fretOn(other.string, other.pitch))
      return {
        string: note.string,
        fret,
        pitch: note.pitch,
        degree: degreeOf(set, root, note.pitch) ?? '?',
        root: pitchClass(note.pitch - root) === 0,
        finger: finger(fret, onString, minFret),
      }
    })
    return { number: index + 1, notes, minFret, maxFret }
  })
}

/** O notă de poziție ca notă de tabulatură, pentru planul de timp și pista audio. */
export const toTabNote = (note: PositionNote): TabNote => ({ string: note.string, fret: note.fret, finger: note.finger })
