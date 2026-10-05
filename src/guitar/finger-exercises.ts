import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { chordById, MAX_BPM } from './changes'
import { decodeFret, type ChordShape } from './chords'
import { pitchAt, pitchClass, type GuitarString } from './tuning'

/*
  Însoțitorul pentru degete: exerciții de tehnică, scrise în tabulatură.

  Exercițiile nu se scriu notă cu notă, ci se GENEREAZĂ dintr-o regulă („1-2-3-4
  pe fiecare coardă, de la tasta X"). Așa același exercițiu se poate muta în
  orice poziție: mai sus pe gât tastele sunt mai înguste și întinderile mai
  ușoare, mai jos sunt mai grele. Toate sunt exercițiile standard ale oricărei
  metode (cromatica, permutările, legato-ul, gamele în poziție, arpegiile
  p-i-m-a), nu exercițiile cuiva anume.

  Ce se verifică (`validateFingerCycle`, testat pe toate pozițiile):
  - coardele și tastele există;
  - un deget pe tastă: pe aceeași coardă, diferența de taste e diferența de
    degete (degetul 1 pe tasta 5 => degetul 3 pe tasta 7);
  - legato-ul (h, p) e pe aceeași coardă ca nota de dinainte, în sus la
    hammer-on, în jos la pull-off;
  - pana alternează strict, jos-sus, iar ciclul se reia tot pe „jos";
  - gamele chiar au notele gamei.

  Aplicația nu aude chitara: ține timpul, arată tabulatura și cântă exercițiul.
  Fără scor (skill-ul `predare-chitara`).
*/

export type FretFinger = 0 | 1 | 2 | 3 | 4
export type PluckFinger = 'p' | 'i' | 'm' | 'a'
/** Note pe timp: 1 = pătrimi, 2 = optimi, 3 = triolete, 4 = șaisprezecimi. */
export type StepsPerBeat = 1 | 2 | 3 | 4

export interface TabNote {
  string: GuitarString
  fret: number
  /** Degetul mâinii care apasă (0 = coardă goală). */
  finger: FretFinger
  /** Degetul mâinii care ciupește, la fingerpicking. */
  pluck?: PluckFinger
  /** Direcția penei, la notele lovite cu pana. */
  pick?: 'down' | 'up'
  /** Nota vine din legato de la nota dinainte: hammer-on sau pull-off. */
  slur?: 'h' | 'p'
  /** Acordul ținut (fingerpicking), id din bibliotecă. */
  chord?: string
}

export interface FingerExercise {
  id: string
  title: LocalizedText
  tip: LocalizedText
  /** Subdiviziunile permise; prima e cea implicită. */
  subdivisions: StepsPerBeat[]
  /** Poziția (tasta degetului 1), dacă exercițiul se poate muta. `null` = fix (pe acorduri). */
  position: { min: number; max: number; suggested: number } | null
  tempo: { min: number; max: number; suggested: number }
  /** Ce se verifică în plus: notele gamei. */
  scale?: 'minorPentatonic' | 'major'
  /** Un ciclu al exercițiului, la poziția dată. */
  build: (position: number) => TabNote[]
}

export interface FingerLevel {
  id: string
  title: LocalizedText
  summary: LocalizedText
  accent: string
  soft: string
  exercises: FingerExercise[]
}

// ---------------------------------------------------------------------------
// Generatoarele
// ---------------------------------------------------------------------------

const LOW_TO_HIGH: GuitarString[] = [6, 5, 4, 3, 2, 1]
const HIGH_TO_LOW: GuitarString[] = [1, 2, 3, 4, 5, 6]

const note = (string: GuitarString, position: number, finger: Exclude<FretFinger, 0>): TabNote => ({
  string,
  fret: position + finger - 1,
  finger,
})

/** Un șir de degete pe fiecare coardă, urcând de la 6 la 1, apoi coborând înapoi cu șirul inversat. */
function upAndDown(order: Exclude<FretFinger, 0>[], position: number, strings = LOW_TO_HIGH): TabNote[] {
  const up = strings.flatMap((string) => order.map((finger) => note(string, position, finger)))
  const down = [...strings].reverse().flatMap((string) => [...order].reverse().map((finger) => note(string, position, finger)))
  return [...up, ...down]
}

/** Pana alternativă strictă pe notele lovite (cele fără legato), începând în jos. */
function alternatePicking(notes: TabNote[]): TabNote[] {
  let down = true
  return notes.map((item) => {
    if (item.slur) return item
    const picked: TabNote = { ...item, pick: down ? 'down' : 'up' }
    down = !down
    return picked
  })
}

/** Pentatonica minoră, cutia 1: tonica pe coarda 6, degetul 1 pe tonică. */
function minorPentatonic(position: number): TabNote[] {
  const offsets: Record<GuitarString, number[]> = { 6: [0, 3], 5: [0, 2], 4: [0, 2], 3: [0, 2], 2: [0, 3], 1: [0, 3] }
  const finger = (offset: number) => (offset === 0 ? 1 : offset === 2 ? 3 : 4) as Exclude<FretFinger, 0>
  const up = LOW_TO_HIGH.flatMap((string) =>
    offsets[string].map((offset) => ({ string, fret: position + offset, finger: finger(offset) })),
  )
  return [...up, ...[...up].reverse()]
}

/**
 * Gama majoră pe două octave, într-o singură poziție: tonica pe coarda 6 cu
 * degetul 2, un deget pe tastă (degetul 1 pe `position`). Urcă două octave și
 * coboară fără să repete capetele, ca reluarea să curgă.
 */
function majorScale(position: number): TabNote[] {
  const offsets: Record<GuitarString, number[]> = {
    6: [1, 3],
    5: [0, 1, 3],
    4: [0, 2, 3],
    3: [0, 2, 3],
    2: [1, 3],
    1: [0, 1],
  }
  const up = LOW_TO_HIGH.flatMap((string) =>
    offsets[string].map((offset) => ({ string, fret: position + offset, finger: (offset + 1) as Exclude<FretFinger, 0> })),
  )
  return [...up, ...[...up].reverse().slice(1, -1)]
}

/** Legato pe fiecare coardă: o notă lovită, restul din hammer-on (în sus) sau pull-off (în jos). */
function legatoRun(order: Exclude<FretFinger, 0>[], position: number): TabNote[] {
  const group = (string: GuitarString, fingers: Exclude<FretFinger, 0>[], slur: 'h' | 'p') =>
    fingers.map((finger, index) => ({ ...note(string, position, finger), slur: index === 0 ? undefined : slur }))
  const up = LOW_TO_HIGH.flatMap((string) => group(string, order, 'h'))
  const down = HIGH_TO_LOW.flatMap((string) => group(string, [...order].reverse(), 'p'))
  return [...up, ...down]
}

/** Trilul: o notă lovită, apoi hammer-on și pull-off alternate, pe aceeași coardă. */
function trill(strings: GuitarString[], low: Exclude<FretFinger, 0>, high: Exclude<FretFinger, 0>, position: number, length: number) {
  return strings.flatMap((string) =>
    Array.from({ length }, (_, index) => ({
      ...note(string, position, index % 2 === 0 ? low : high),
      slur: index === 0 ? undefined : index % 2 === 1 ? ('h' as const) : ('p' as const),
    })),
  )
}

/** Fingerpicking pe acorduri: fiecare deget al mâinii drepte pe coarda lui, notele din forma acordului. */
function picking(chords: string[], fingers: PluckFinger[], repeats: number, bass: GuitarString[] = [5]): TabNote[] {
  const stringFor: Record<Exclude<PluckFinger, 'p'>, GuitarString> = { i: 3, m: 2, a: 1 }
  return chords.flatMap((id) => {
    const shape = chordById(id)!
    let bassIndex = 0
    return Array.from({ length: repeats }).flatMap(() =>
      fingers.map((pluck) => {
        const string = pluck === 'p' ? bass[bassIndex++ % bass.length]! : stringFor[pluck]
        const fretChar = shape.frets[6 - string]!
        const fret = decodeFret(fretChar)
        const fingerChar = shape.fingers[6 - string]!
        const finger = (fret === 0 ? 0 : Number(fingerChar)) as FretFinger
        return { string, fret, finger, pluck, chord: id }
      }),
    )
  })
}

// ---------------------------------------------------------------------------
// Nivelurile
// ---------------------------------------------------------------------------

const tempo = (min: number, suggested: number) => ({ min, max: MAX_BPM, suggested })
const movable = (suggested: number, min = 1, max = 12) => ({ min, max, suggested })

export const fingerLevels: FingerLevel[] = [
  {
    id: 'primul-contact',
    title: { ro: 'Primul contact', en: 'First contact' },
    summary: {
      ro: 'Un deget pe tastă, pe o singură coardă. Fiecare notă trebuie să sune clar, nu să zbârnâie.',
      en: 'One finger per fret, on a single string. Every note should ring clearly, not buzz.',
    },
    accent: '#FF7A00',
    soft: '#FFF1E3',
    exercises: [
      {
        id: 'o-coarda',
        title: { ro: '1-2-3-4 pe coarda 1', en: '1-2-3-4 on string 1' },
        tip: {
          ro: 'Degetele stau deasupra tastelor lor tot timpul. Când pui degetul 4, degetele 1-3 pot rămâne apăsate.',
          en: 'The fingers hover over their frets the whole time. When finger 4 goes down, fingers 1-3 can stay pressed.',
        },
        subdivisions: [2, 4, 1],
        position: movable(5),
        tempo: tempo(40, 60),
        build: (position) =>
          alternatePicking([...([1, 2, 3, 4] as const).map((finger) => note(1, position, finger)), ...([4, 3, 2, 1] as const).map((finger) => note(1, position, finger))]),
      },
      {
        id: 'coarda-6',
        title: { ro: '1-2-3-4 pe coarda 6', en: '1-2-3-4 on string 6' },
        tip: {
          ro: 'Coarda groasă cere apăsare puțin mai fermă. Degetul mare rămâne în spatele gâtului, în dreptul degetului 2.',
          en: 'The thick string needs slightly firmer pressure. The thumb stays behind the neck, opposite finger 2.',
        },
        subdivisions: [2, 4, 1],
        position: movable(5),
        tempo: tempo(40, 60),
        build: (position) =>
          alternatePicking([...([1, 2, 3, 4] as const).map((finger) => note(6, position, finger)), ...([4, 3, 2, 1] as const).map((finger) => note(6, position, finger))]),
      },
    ],
  },
  {
    id: 'paianjenul',
    title: { ro: 'Păianjenul', en: 'The spider' },
    summary: {
      ro: '1-2-3-4 pe toate coardele, urcând și coborând. Exercițiul cu care încep aproape toate rutinele de încălzire.',
      en: '1-2-3-4 across all strings, up and down. The exercise almost every warm-up routine starts with.',
    },
    accent: '#008C88',
    soft: '#E3F3F2',
    exercises: [
      {
        id: 'cromatica',
        title: { ro: 'Cromatica pe toate coardele', en: 'Chromatic across all strings' },
        tip: {
          ro: 'Urcă 1-2-3-4 pe fiecare coardă, apoi coboară 4-3-2-1. Pana alternează strict, jos-sus, chiar și la trecerea pe altă coardă.',
          en: 'Go up 1-2-3-4 on each string, then down 4-3-2-1. The pick alternates strictly, down-up, even when crossing strings.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 60),
        build: (position) => alternatePicking(upAndDown([1, 2, 3, 4], position)),
      },
      {
        id: 'diagonala',
        title: { ro: 'Diagonala', en: 'The diagonal' },
        tip: {
          ro: 'La fiecare coardă nouă, mâna urcă o tastă. Mută toată mâna odată, cu degetul mare, nu doar degetele.',
          en: 'On every new string the hand moves up one fret. Shift the whole hand at once, thumb included, not just the fingers.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(3, 1, 7),
        tempo: tempo(40, 56),
        build: (position) => {
          const up = LOW_TO_HIGH.flatMap((string, index) =>
            ([1, 2, 3, 4] as const).map((finger) => note(string, position + index, finger)),
          )
          return alternatePicking([...up, ...[...up].reverse()])
        },
      },
    ],
  },
  {
    id: 'permutari',
    title: { ro: 'Permutări', en: 'Permutations' },
    summary: {
      ro: 'Aceleași patru degete, în altă ordine. Fiecare ordine cere altă pereche de degete să lucreze independent.',
      en: 'The same four fingers in a different order. Each order makes a different pair of fingers work independently.',
    },
    accent: '#6547E8',
    soft: '#EEEAFC',
    exercises: [
      {
        id: 'perm-1324',
        title: { ro: '1-3-2-4', en: '1-3-2-4' },
        tip: {
          ro: 'Degetul 3 sare peste 2, apoi revine. Ține degetele aproape de coarde, nu le ridica sus.',
          en: 'Finger 3 skips over 2, then comes back. Keep the fingers close to the strings, do not lift them high.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 56),
        build: (position) => alternatePicking(upAndDown([1, 3, 2, 4], position)),
      },
      {
        id: 'perm-1423',
        title: { ro: '1-4-2-3', en: '1-4-2-3' },
        tip: {
          ro: 'Cea mai grea pentru degetul 4: întinderea de la 1 la 4, apoi revenirea la 2.',
          en: 'The hardest for finger 4: the stretch from 1 to 4, then back to 2.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 52),
        build: (position) => alternatePicking(upAndDown([1, 4, 2, 3], position)),
      },
      {
        id: 'perm-2413',
        title: { ro: '2-4-1-3', en: '2-4-1-3' },
        tip: {
          ro: 'Nu începe cu degetul 1, deci mâna nu are „ancoră". Poziția rămâne aceeași: degetul 1 stă tot pe tasta lui.',
          en: 'It does not start with finger 1, so the hand has no anchor. The position stays the same: finger 1 still owns its fret.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 52),
        build: (position) => alternatePicking(upAndDown([2, 4, 1, 3], position)),
      },
    ],
  },
  {
    id: 'independenta',
    title: { ro: 'Independență și întinderi', en: 'Independence and stretches' },
    summary: {
      ro: 'Degetul 4 lucrează cu fiecare dintre celelalte. Mai jos pe gât tastele sunt mai late: întinderea crește.',
      en: 'Finger 4 works with each of the others. Lower on the neck the frets are wider: the stretch grows.',
    },
    accent: '#158A52',
    soft: '#E6F4EC',
    exercises: [
      {
        id: 'unu-patru',
        title: { ro: '1-4', en: '1-4' },
        tip: {
          ro: 'Doar degetele 1 și 4, pe fiecare coardă. Degetele 2 și 3 rămân deasupra tastelor lor, gata să fie folosite.',
          en: 'Only fingers 1 and 4, on every string. Fingers 2 and 3 hover over their frets, ready.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 56),
        build: (position) => alternatePicking(upAndDown([1, 4, 1, 4], position)),
      },
      {
        id: 'patru-cu-toate',
        title: { ro: '1-4-3-4-2-4', en: '1-4-3-4-2-4' },
        tip: {
          ro: 'Degetul 4 revine după fiecare alt deget. Rămâne curbat și cade pe vârf.',
          en: 'Finger 4 comes back after every other finger. Keep it curved and land on the tip.',
        },
        subdivisions: [3, 2, 4, 1],
        position: movable(5),
        tempo: tempo(40, 52),
        build: (position) => alternatePicking(upAndDown([1, 4, 3, 4, 2, 4], position)),
      },
      {
        id: 'intindere-jos',
        title: { ro: 'Cromatica jos pe gât', en: 'Chromatic low on the neck' },
        tip: {
          ro: 'Aceeași cromatică, din poziția 1, unde tastele sunt cele mai late. Dacă doare încheietura, urcă poziția și revino mai târziu.',
          en: 'The same chromatic, from position 1, where the frets are widest. If the wrist hurts, move up and come back later.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(1, 1, 5),
        tempo: tempo(40, 52),
        build: (position) => alternatePicking(upAndDown([1, 2, 3, 4], position)),
      },
    ],
  },
  {
    id: 'pana',
    title: { ro: 'Pana: alternare și sărituri', en: 'Picking: alternation and skips' },
    summary: {
      ro: 'Mâna care lovește: jos-sus strict, și peste o coardă sărită. Mâna care apasă rămâne simplă.',
      en: 'The picking hand: strict down-up, and across a skipped string. The fretting hand stays simple.',
    },
    accent: '#C2410C',
    soft: '#FDEDE3',
    exercises: [
      {
        id: 'sarit-coarde',
        title: { ro: 'Sărit de coarde', en: 'String skipping' },
        tip: {
          ro: '1-2-3-4 pe coardele 6 și 4, apoi 5 și 3, și tot așa. Pana trece peste coarda din mijloc fără s-o atingă.',
          en: '1-2-3-4 on strings 6 and 4, then 5 and 3, and so on. The pick passes the middle string without touching it.',
        },
        subdivisions: [4, 2, 1],
        position: movable(5),
        tempo: tempo(40, 52),
        build: (position) => {
          const strings: GuitarString[] = [6, 4, 5, 3, 4, 2, 3, 1]
          const up = strings.flatMap((string) => ([1, 2, 3, 4] as const).map((finger) => note(string, position, finger)))
          const down = [...strings].reverse().flatMap((string) => ([4, 3, 2, 1] as const).map((finger) => note(string, position, finger)))
          return alternatePicking([...up, ...down])
        },
      },
      {
        id: 'doua-pe-coarda',
        title: { ro: 'Două note pe coardă', en: 'Two notes per string' },
        tip: {
          ro: 'La două note pe coardă, trecerea pe coarda următoare cade mereu pe aceeași direcție a penei. Ascultă dacă notele rămân egale.',
          en: 'With two notes per string, the string change always falls on the same pick direction. Listen for even notes.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 60),
        build: (position) => alternatePicking(upAndDown([1, 3], position)),
      },
    ],
  },
  {
    id: 'legato',
    title: { ro: 'Legato', en: 'Legato' },
    summary: {
      ro: 'Hammer-on și pull-off: o singură notă lovită, restul din mâna care apasă. Notele legate trebuie să sune cât cea lovită.',
      en: 'Hammer-ons and pull-offs: one picked note, the rest from the fretting hand. The slurred notes should be as loud as the picked one.',
    },
    accent: '#0F6CBD',
    soft: '#E4F0FA',
    exercises: [
      {
        id: 'hammer-pull-1-3',
        title: { ro: 'Hammer-on și pull-off 1-3', en: 'Hammer-on and pull-off 1-3' },
        tip: {
          ro: 'În sus, degetul 3 cade ca un ciocan, aproape de prăguț. În jos, degetul 3 trage coarda puțin în lateral când se ridică.',
          en: 'Going up, finger 3 lands like a hammer, close to the fret. Going down, finger 3 flicks the string slightly sideways as it lifts.',
        },
        subdivisions: [2, 4, 3, 1],
        position: movable(5),
        tempo: tempo(40, 66),
        build: (position) => alternatePicking(legatoRun([1, 3], position)),
      },
      {
        id: 'legato-cromatic',
        title: { ro: 'Legato pe patru degete', en: 'Four-finger legato' },
        tip: {
          ro: 'O notă lovită pe coardă, apoi trei hammer-on. La coborâre, trei pull-off. Degetele 1-3 rămân apăsate cât lucrează cele de deasupra.',
          en: 'One picked note per string, then three hammer-ons. Coming down, three pull-offs. Fingers 1-3 stay down while the ones above work.',
        },
        subdivisions: [4, 2, 3, 1],
        position: movable(5),
        tempo: tempo(40, 56),
        build: (position) => alternatePicking(legatoRun([1, 2, 3, 4], position)),
      },
      {
        id: 'tril',
        title: { ro: 'Trilul 1-3', en: 'The 1-3 trill' },
        tip: {
          ro: 'Lovești o dată, apoi doar hammer-on și pull-off, cât mai egal. Degetul 1 nu se mișcă deloc.',
          en: 'Pick once, then only hammer-ons and pull-offs, as even as you can. Finger 1 does not move at all.',
        },
        subdivisions: [4, 3, 2, 1],
        position: movable(5),
        tempo: tempo(40, 60),
        build: (position) => alternatePicking(trill([3, 2], 1, 3, position, 12)),
      },
    ],
  },
  {
    id: 'game',
    title: { ro: 'Game în poziție', en: 'Scales in position' },
    summary: {
      ro: 'Gamele pe care se construiesc solo-urile, într-o singură poziție, un deget pe tastă.',
      en: 'The scales solos are built on, in a single position, one finger per fret.',
    },
    accent: '#B4237A',
    soft: '#FAE6F1',
    exercises: [
      {
        id: 'pentatonica',
        title: { ro: 'Pentatonica minoră', en: 'Minor pentatonic' },
        tip: {
          ro: 'Cutia 1: tonica pe coarda 6, sub degetul 1. Pe tasta 5 e La minor pentatonic. Spune notele cu voce tare.',
          en: 'Box 1: the root on string 6, under finger 1. At fret 5 it is A minor pentatonic. Say the notes out loud.',
        },
        subdivisions: [2, 4, 3, 1],
        position: movable(5, 1, 12),
        tempo: tempo(40, 66),
        scale: 'minorPentatonic',
        build: (position) => alternatePicking(minorPentatonic(position)),
      },
      {
        id: 'majora',
        title: { ro: 'Gama majoră, două octave', en: 'Major scale, two octaves' },
        tip: {
          ro: 'Tonica pe coarda 6, sub degetul 2: din poziția 7 iese Do major, din poziția 2 Sol major. Urcă și coboară fără să te oprești pe capete.',
          en: 'The root on string 6, under finger 2: position 7 gives C major, position 2 G major. Go up and down without stopping at the ends.',
        },
        subdivisions: [4, 2, 1],
        position: movable(7, 1, 12),
        tempo: tempo(40, 60),
        scale: 'major',
        build: (position) => alternatePicking(majorScale(position)),
      },
    ],
  },
  {
    id: 'mana-dreapta',
    title: { ro: 'Mâna dreaptă: p-i-m-a', en: 'Picking hand: p-i-m-a' },
    summary: {
      ro: 'Fingerpicking pe acorduri: degetul mare pe bas, i-m-a pe coardele 3-2-1. Mâna care apasă ține doar acordul.',
      en: 'Fingerpicking over chords: the thumb on the bass, i-m-a on strings 3-2-1. The fretting hand just holds the chord.',
    },
    accent: '#7C5A12',
    soft: '#F5EEDF',
    exercises: [
      {
        id: 'pim',
        title: { ro: 'p-i-m', en: 'p-i-m' },
        tip: {
          ro: 'Degetul mare pe coarda 5, i pe 3, m pe 2. Mâna stă pe loc; se mișcă doar degetele, spre palmă.',
          en: 'Thumb on string 5, i on 3, m on 2. The hand stays still; only the fingers move, towards the palm.',
        },
        subdivisions: [3, 1],
        position: null,
        tempo: tempo(40, 66),
        build: () => picking(['C', 'Am'], ['p', 'i', 'm'], 4),
      },
      {
        id: 'pima',
        title: { ro: 'p-i-m-a', en: 'p-i-m-a' },
        tip: {
          ro: 'Un deget pe coardă: p pe 5, i pe 3, m pe 2, a pe 1. Degetul mare stă în fața celorlalte, nu sub ele.',
          en: 'One finger per string: p on 5, i on 3, m on 2, a on 1. The thumb stays ahead of the fingers, not under them.',
        },
        subdivisions: [4, 1],
        position: null,
        tempo: tempo(40, 60),
        build: () => picking(['C', 'Am'], ['p', 'i', 'm', 'a'], 4),
      },
      {
        id: 'pamimi',
        title: { ro: 'p-a-m-i, în jos', en: 'p-a-m-i, downwards' },
        tip: {
          ro: 'Arpegiul invers: după bas, de la coarda 1 spre 3. Degetul a e cel mai slab; ascultă dacă sună cât celelalte.',
          en: 'The reverse arpeggio: after the bass, from string 1 to 3. The a finger is the weakest; listen whether it is as loud as the others.',
        },
        subdivisions: [4, 1],
        position: null,
        tempo: tempo(40, 60),
        build: () => picking(['C', 'Am'], ['p', 'a', 'm', 'i'], 4),
      },
      {
        id: 'bas-alternativ',
        title: { ro: 'Basul alternativ', en: 'Alternating bass' },
        tip: {
          ro: 'Degetul mare alternează între coardele 5 și 4, pe fiecare timp; m și i cântă între ele. Baza stilului fingerstyle folk.',
          en: 'The thumb alternates between strings 5 and 4 on every beat; m and i play in between. The base of folk fingerstyle.',
        },
        subdivisions: [2, 1],
        position: null,
        tempo: tempo(40, 66),
        build: () => picking(['C', 'Am'], ['p', 'm', 'p', 'i'], 2, [5, 4]),
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Validarea
// ---------------------------------------------------------------------------

const SCALE_STEPS = { minorPentatonic: [0, 3, 5, 7, 10], major: [0, 2, 4, 5, 7, 9, 11] } as const

/** Tonica gamei: la pentatonică sub degetul 1, la majoră sub degetul 2, pe coarda 6. */
function scaleRoot(exercise: FingerExercise, position: number) {
  return pitchClass(pitchAt(6, exercise.scale === 'major' ? position + 1 : position))
}

export function validateFingerCycle(exercise: FingerExercise, position: number): string[] {
  const problems: string[] = []
  const at = `${exercise.id} @${position}`
  const notes = exercise.build(position)
  if (notes.length === 0) return [`${at}: nicio notă`]

  for (const subdivision of exercise.subdivisions) {
    if (notes.length % subdivision !== 0) problems.push(`${at}: ${notes.length} note nu se împart la ${subdivision} pe timp`)
  }

  notes.forEach((item, index) => {
    const here = `${at}, nota ${index}`
    if (item.string < 1 || item.string > 6) problems.push(`${here}: coarda ${item.string}`)
    if (!Number.isInteger(item.fret) || item.fret < 0 || item.fret > 15) problems.push(`${here}: tasta ${item.fret}`)
    if (item.fret === 0 && item.finger !== 0) problems.push(`${here}: coardă goală cu degetul ${item.finger}`)
    if (item.fret > 0 && item.finger === 0) problems.push(`${here}: tasta ${item.fret} fără deget`)

    const previous = notes[index - 1]
    if (item.slur) {
      if (!previous) problems.push(`${here}: ciclul începe cu legato`)
      else if (previous.string !== item.string) problems.push(`${here}: legato pe altă coardă`)
      else if (item.slur === 'h' && item.fret <= previous.fret) problems.push(`${here}: hammer-on în jos`)
      else if (item.slur === 'p' && item.fret >= previous.fret) problems.push(`${here}: pull-off în sus`)
    }
    // Un deget pe tastă: pe aceeași coardă, diferența de taste e diferența de degete.
    if (previous && previous.string === item.string && previous.finger > 0 && item.finger > 0 && !item.pluck) {
      if (item.fret - previous.fret !== item.finger - previous.finger) {
        problems.push(`${here}: degetul ${item.finger} pe tasta ${item.fret} după degetul ${previous.finger} pe tasta ${previous.fret}`)
      }
    }
  })

  // Pana alternează strict, iar ciclul se reia tot pe „jos".
  const picks = notes.filter((item) => item.pick).map((item) => item.pick)
  picks.forEach((pick, index) => {
    if (pick !== (index % 2 === 0 ? 'down' : 'up')) problems.push(`${at}: pana nu alternează la lovitura ${index}`)
  })
  if (picks.length % 2 !== 0) problems.push(`${at}: număr impar de lovituri, ciclul următor ar începe în sus`)
  if (!exercise.position && notes.some((item) => !item.pluck)) problems.push(`${at}: exercițiu fix fără p-i-m-a`)

  if (exercise.scale) {
    const root = scaleRoot(exercise, position)
    const allowed = new Set(SCALE_STEPS[exercise.scale].map((step) => (root + step) % 12))
    for (const item of notes) {
      if (!allowed.has(pitchClass(pitchAt(item.string, item.fret)))) {
        problems.push(`${at}: coarda ${item.string} tasta ${item.fret} nu e în gamă`)
      }
    }
    const used = new Set(notes.map((item) => pitchClass(pitchAt(item.string, item.fret))))
    if (used.size !== allowed.size) problems.push(`${at}: lipsesc note din gamă`)
  }
  return problems
}

// ---------------------------------------------------------------------------
// Planul de timp
// ---------------------------------------------------------------------------

export const BEATS_PER_BAR = 4
const TARGET_MS = 60_000

/** Un pas din ciclul cântat: o notă, sau `null` pentru pauză (completarea până la capăt de măsură). */
export type TabStep = TabNote | null

/**
 * Ciclul cântat, aliniat la măsură.

 * Un ciclu care nu se termină la capăt de măsură (gama majoră are 28 de note,
 * adică 7 timpi la șaisprezecimi) ar relua exercițiul la mijlocul măsurii:
 * numărătoarea de sub tabulatură n-ar mai cădea pe metronom, iar ultimul rând
 * ar rămâne cu câteva note. Așa că: dacă ciclul, cântat de două ori, umple
 * exact măsuri întregi, se cântă de două ori; altfel se completează cu pauze
 * până la capătul măsurii.
 */
export function alignedCycle(notes: TabNote[], stepsPerBeat: StepsPerBeat): TabStep[] {
  const bar = BEATS_PER_BAR * stepsPerBeat
  if (notes.length % bar === 0) return notes
  if ((notes.length * 2) % bar === 0) return [...notes, ...notes]
  const padded = Math.ceil(notes.length / bar) * bar
  return [...notes, ...Array.from({ length: padded - notes.length }, (): TabStep => null)]
}

export interface FingerPlan {
  bpm: number
  stepsPerBeat: StepsPerBeat
  stepMs: number
  /** Ciclul cântat, aliniat la măsură (`alignedCycle`); `null` = pauză. */
  notes: TabStep[]
  countInSteps: number
  repeats: number
  totalSteps: number
  durationMs: number
}

export function planFinger(exercise: FingerExercise, bpm: number, stepsPerBeat: StepsPerBeat, position: number): FingerPlan {
  const stepMs = 60_000 / bpm / stepsPerBeat
  const notes = alignedCycle(exercise.build(position), stepsPerBeat)
  const repeats = Math.max(2, Math.ceil(TARGET_MS / (notes.length * stepMs)))
  const countInSteps = BEATS_PER_BAR * stepsPerBeat
  const totalSteps = countInSteps + repeats * notes.length
  return { bpm, stepsPerBeat, stepMs, notes, countInSteps, repeats, totalSteps, durationMs: totalSteps * stepMs }
}

export interface FingerPosition {
  countIn: number | null
  /** Nota din ciclu, sau -1 în numărătoare. */
  noteIndex: number
}

export function fingerPositionAt(plan: FingerPlan, step: number): FingerPosition {
  if (step < plan.countInSteps) return { countIn: Math.floor(step / plan.stepsPerBeat) + 1, noteIndex: -1 }
  return { countIn: null, noteIndex: (step - plan.countInSteps) % plan.notes.length }
}

/** Acordul ținut la o notă, pentru fingerpicking. */
export const chordOf = (item: TabStep): ChordShape | undefined => (item?.chord ? chordById(item.chord) : undefined)

/** Câte note se cântă într-un ciclu (fără pauze). */
export const soundingNotes = (notes: readonly TabStep[]) => notes.filter((item) => item !== null).length
