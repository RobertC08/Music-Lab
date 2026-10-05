import type { ChordLevel } from './chords'

/*
  Biblioteca de acorduri, pe niveluri.

  Ordinea urmează programele de examen citite pentru skill-ul `predare-chitara`
  (LCM Electric/Acoustic Guitar, Trinity Rock & Pop; vezi
  `references/curriculum.md`): acordurile deschise comune ambelor programe,
  apoi septimele și power chord-urile, culorile deschise (sus, add9, maj7, m7),
  semi-barré-ul, cele două forme de barré și abia apoi acordurile avansate.

  Formele sunt cele standard, pe care le găsești în orice dicționar de acorduri:
  fapte, nu creația cuiva. Fiecare trece prin `validateChordShape` în
  `chord-library.test.ts`, care calculează notele din taste și le compară cu
  simbolul. O formă scrisă invers sau cu o cifră greșită pică acolo.

  Șirurile se citesc de la coarda 6 (Mi gros) la coarda 1 (Mi subțire).
*/

export const chordLevels: ChordLevel[] = [
  {
    id: 'primele',
    title: { ro: 'Primele acorduri', en: 'First chords' },
    summary: {
      ro: 'Acordurile deschise cu care încep toate metodele. Cu ele se cântă sute de piese.',
      en: 'The open chords every method starts with. They are enough for hundreds of songs.',
    },
    accent: '#FF7A00',
    soft: '#FFF1E3',
    chords: [
      {
        id: 'Em',
        symbol: 'Em',
        frets: '022000',
        fingers: '-23---',
        tip: {
          ro: 'Două degete și sună toate cele șase coarde. Cel mai bun prim acord.',
          en: 'Two fingers and all six strings ring. The best first chord.',
        },
      },
      {
        id: 'Am',
        symbol: 'Am',
        frets: 'x02210',
        fingers: 'x-231-',
        tip: {
          ro: 'Aceeași formă ca Mi major, mutată o coardă mai spre coarda 1. Coarda 6 nu se cântă.',
          en: 'The same shape as E major, moved one string over. Leave out string 6.',
        },
      },
      {
        id: 'E',
        symbol: 'E',
        frets: '022100',
        fingers: '-231--',
        tip: {
          ro: 'Față de Mi minor se adaugă un singur deget, pe coarda 3. Exact diferența dintre minor și major.',
          en: 'One finger more than E minor, on string 3. That is the whole difference between minor and major.',
        },
      },
      {
        id: 'A',
        symbol: 'A',
        frets: 'x02220',
        fingers: 'x-123-',
        tip: {
          ro: 'Trei degete pe aceeași tastă, strânse. Coarda 1 trebuie să sune: degetul 3 nu o atinge.',
          en: 'Three fingers squeezed into one fret. String 1 must ring: keep finger 3 off it.',
        },
      },
      {
        id: 'D',
        symbol: 'D',
        frets: 'xx0232',
        fingers: 'xx-132',
        tip: {
          ro: 'Lovești doar patru coarde, de la coarda 4 în jos.',
          en: 'Strum only four strings, from string 4 down.',
        },
      },
      {
        id: 'Dm',
        symbol: 'Dm',
        frets: 'xx0231',
        fingers: 'xx-231',
        tip: {
          ro: 'Ca Re major, cu nota de pe coarda 1 coborâtă o tastă.',
          en: 'Like D major, with the note on string 1 one fret lower.',
        },
      },
      {
        id: 'C',
        symbol: 'C',
        frets: 'x32010',
        fingers: 'x32-1-',
        tip: {
          ro: 'Degetele în scară, de la coarda 5 la coarda 2. Vârfurile arcuite, ca să nu înfunde coarda 3.',
          en: 'Fingers in a staircase from string 5 to string 2. Arch the tips so string 3 rings.',
        },
      },
      {
        id: 'G',
        symbol: 'G',
        frets: '320003',
        fingers: '21---3',
        tip: {
          ro: 'Toate cele șase coarde. O variantă des folosită pune degetele 3, 2 și 4: se trece mai ușor spre Do.',
          en: 'All six strings. A common alternative uses fingers 3, 2 and 4: it moves to C more easily.',
        },
      },
    ],
  },
  {
    id: 'septime-power',
    title: { ro: 'Septime și power chords', en: 'Sevenths and power chords' },
    summary: {
      ro: 'Septimele de dominantă, de la blues la folk, și acordurile de două note ale rock-ului.',
      en: 'Dominant sevenths, from blues to folk, and the two-note chords of rock.',
    },
    instrumentNote: {
      ro: 'Power chord-urile sunt sunetul de bază al chitarei electrice cu distorsiune. Pe acustică sună mai subțire, dar se folosesc la fel.',
      en: 'Power chords are the basic sound of a distorted electric guitar. On acoustic they sound thinner, but they work the same way.',
    },
    accent: '#008C88',
    soft: '#E3F3F2',
    chords: [
      { id: 'E7', symbol: 'E7', frets: '020100', fingers: '-2-1--' },
      { id: 'A7', symbol: 'A7', frets: 'x02020', fingers: 'x-2-3-' },
      { id: 'D7', symbol: 'D7', frets: 'xx0212', fingers: 'xx-213' },
      {
        id: 'B7',
        symbol: 'B7',
        frets: 'x21202',
        fingers: 'x213-4',
        tip: {
          ro: 'Primul acord cu toate patru degetele. Coarda 2 rămâne goală.',
          en: 'The first chord with all four fingers. String 2 stays open.',
        },
      },
      { id: 'G7', symbol: 'G7', frets: '320001', fingers: '32---1' },
      { id: 'C7', symbol: 'C7', frets: 'x32310', fingers: 'x3241-' },
      {
        id: 'E5',
        symbol: 'E5',
        frets: '022xxx',
        fingers: '-12xxx',
        tip: {
          ro: 'Doar trei coarde: tonica, cvinta și tonica de sus. Fără terță, deci nici major, nici minor.',
          en: 'Only three strings: root, fifth and the root again. No third, so neither major nor minor.',
        },
      },
      { id: 'A5', symbol: 'A5', frets: 'x022xx', fingers: 'x-12xx' },
      { id: 'D5', symbol: 'D5', frets: 'xx023x', fingers: 'xx-13x' },
      {
        id: 'G5',
        symbol: 'G5',
        frets: '355xxx',
        fingers: '134xxx',
        tip: {
          ro: 'Formă mobilă: mut-o pe gât și tonica de pe coarda 6 îi dă numele. Pe tasta 5 e La5.',
          en: 'A movable shape: slide it along the neck and the root on string 6 names it. At fret 5 it is A5.',
        },
      },
      { id: 'C5', symbol: 'C5', frets: 'x355xx', fingers: 'x134xx' },
    ],
  },
  {
    id: 'culori',
    title: { ro: 'Culori deschise', en: 'Open colours' },
    summary: {
      ro: 'Acorduri cu o notă în plus sau schimbată: maj7, m7, sus, add9. Același loc pe gât, alt caracter.',
      en: 'Chords with one note added or changed: maj7, m7, sus, add9. Same place on the neck, a different mood.',
    },
    instrumentNote: {
      ro: 'Sunt mai ales sunetul chitarei acustice, unde acompaniamentul rămâne pe acorduri deschise. Pe electrică se cântă la fel.',
      en: 'Mostly the sound of acoustic guitar, where accompaniment stays on open chords. They play the same on electric.',
    },
    accent: '#6547E8',
    soft: '#EEEAFC',
    chords: [
      { id: 'Am7', symbol: 'Am7', frets: 'x02010', fingers: 'x-2-1-' },
      { id: 'Em7', symbol: 'Em7', frets: '022030', fingers: '-23-4-' },
      {
        id: 'Cmaj7',
        symbol: 'Cmaj7',
        frets: 'x32000',
        fingers: 'x32---',
        tip: {
          ro: 'Do major fără degetul 1: coarda 2 goală dă septima mare.',
          en: 'C major without finger 1: the open string 2 is the major seventh.',
        },
      },
      { id: 'Fmaj7', symbol: 'Fmaj7', frets: 'xx3210', fingers: 'xx321-' },
      { id: 'Gmaj7', symbol: 'Gmaj7', frets: '320002', fingers: '32---1' },
      { id: 'Amaj7', symbol: 'Amaj7', frets: 'x02120', fingers: 'x-213-' },
      { id: 'Dmaj7', symbol: 'Dmaj7', frets: 'xx0222', fingers: 'xx-123' },
      { id: 'Asus2', symbol: 'Asus2', frets: 'x02200', fingers: 'x-12--' },
      {
        id: 'Asus4',
        symbol: 'Asus4',
        frets: 'x02230',
        fingers: 'x-123-',
        tip: {
          ro: 'Ascultă-l rezolvându-se în La major: degetul 4 se ridică și tensiunea dispare.',
          en: 'Hear it resolve to A major: lift finger 4 and the tension goes away.',
        },
      },
      { id: 'Dsus2', symbol: 'Dsus2', frets: 'xx0230', fingers: 'xx-13-' },
      { id: 'Dsus4', symbol: 'Dsus4', frets: 'xx0233', fingers: 'xx-134' },
      { id: 'Esus4', symbol: 'Esus4', frets: '022200', fingers: '-234--' },
      { id: 'Cadd9', symbol: 'Cadd9', frets: 'x32033', fingers: 'x21-34' },
    ],
  },
  {
    id: 'semi-barre',
    title: { ro: 'Primul Fa: semi-barré', en: 'The first F: half barre' },
    summary: {
      ro: 'Un deget culcat pe două-trei coarde. Treapta dintre acordurile deschise și barré-ul complet.',
      en: 'One finger laid across two or three strings. The step between open chords and the full barre.',
    },
    accent: '#C2410C',
    soft: '#FDEDE3',
    chords: [
      {
        id: 'Dm7',
        symbol: 'Dm7',
        frets: 'xx0211',
        fingers: 'xx-211',
        barre: { fret: 1, from: 2, to: 1 },
        tip: {
          ro: 'Cel mai mic barré: degetul 1 culcat pe coardele 2 și 1.',
          en: 'The smallest barre: finger 1 laid across strings 2 and 1.',
        },
      },
      {
        id: 'F-mic',
        symbol: 'F',
        frets: 'xx3211',
        fingers: 'xx3211',
        barre: { fret: 1, from: 2, to: 1 },
        tip: {
          ro: 'Fa pe patru coarde. Se cântă în locul barré-ului complet până când acela sună curat.',
          en: 'F on four strings. Play it instead of the full barre until that one rings clean.',
        },
      },
      {
        id: 'Fsus2',
        symbol: 'Fsus2',
        frets: 'xx3011',
        fingers: 'xx3-11',
        barre: { fret: 1, from: 2, to: 1 },
      },
      {
        id: 'F#m-mic',
        symbol: 'F#m',
        frets: 'xx4222',
        fingers: 'xx3111',
        barre: { fret: 2, from: 3, to: 1 },
      },
    ],
  },
  {
    id: 'barre-mi',
    title: { ro: 'Barré pe forma de Mi', en: 'Barre chords, E shape' },
    summary: {
      ro: 'Formele de Mi, Mi minor și Mi7, cu degetul 1 în locul pragului. Tonica e pe coarda 6: unde muți forma, acolo e acordul.',
      en: 'The E, E minor and E7 shapes with finger 1 in place of the nut. The root is on string 6: wherever you move the shape, that is the chord.',
    },
    instrumentNote: {
      ro: 'Pe acustică barré-ul vine mai greu (corzi mai groase, mai departe de grif). E normal să sune pe jumătate săptămâni întregi.',
      en: 'Barre chords take longer on acoustic (heavier strings, higher action). Half-ringing barres for weeks are normal.',
    },
    accent: '#158A52',
    soft: '#E6F4EC',
    chords: [
      {
        id: 'F',
        symbol: 'F',
        frets: '133211',
        fingers: '134211',
        barre: { fret: 1, from: 6, to: 1 },
        tip: {
          ro: 'Degetul 1 apasă cu marginea, ușor rotit, nu cu partea moale. Forța vine din brațul care trage ușor înapoi, nu din degetul mare.',
          en: 'Press with the edge of finger 1, slightly rolled, not the soft pad. The force comes from the arm pulling back gently, not from the thumb.',
        },
      },
      { id: 'Fm', symbol: 'Fm', frets: '133111', fingers: '134111', barre: { fret: 1, from: 6, to: 1 } },
      { id: 'F7', symbol: 'F7', frets: '131211', fingers: '131211', barre: { fret: 1, from: 6, to: 1 } },
      { id: 'Fm7', symbol: 'Fm7', frets: '131111', fingers: '131111', barre: { fret: 1, from: 6, to: 1 } },
      { id: 'G-barre', symbol: 'G', frets: '355433', fingers: '134211', barre: { fret: 3, from: 6, to: 1 } },
      { id: 'Gm', symbol: 'Gm', frets: '355333', fingers: '134111', barre: { fret: 3, from: 6, to: 1 } },
      { id: 'A-barre', symbol: 'A', frets: '577655', fingers: '134211', barre: { fret: 5, from: 6, to: 1 } },
      { id: 'Am-barre', symbol: 'Am', frets: '577555', fingers: '134111', barre: { fret: 5, from: 6, to: 1 } },
    ],
  },
  {
    id: 'barre-la',
    title: { ro: 'Barré pe forma de La', en: 'Barre chords, A shape' },
    summary: {
      ro: 'Formele de La, La minor și La7, mutate pe gât. Tonica e pe coarda 5, iar coarda 6 nu se cântă.',
      en: 'The A, A minor and A7 shapes moved along the neck. The root is on string 5 and string 6 is left out.',
    },
    accent: '#0F6CBD',
    soft: '#E4F0FA',
    chords: [
      {
        id: 'Bb',
        symbol: 'Bb',
        frets: 'x13331',
        fingers: 'x13331',
        barre: { fret: 1, from: 5, to: 1 },
        tip: {
          ro: 'Degetul 3 culcat pe coardele 4, 3 și 2. Dacă înfundă coarda 1, acordul rămâne Si♭, doar cu o notă mai puțin.',
          en: 'Finger 3 laid across strings 4, 3 and 2. If it mutes string 1 the chord is still B♭, just with one note fewer.',
        },
      },
      { id: 'B', symbol: 'B', frets: 'x24442', fingers: 'x13331', barre: { fret: 2, from: 5, to: 1 } },
      { id: 'C-barre', symbol: 'C', frets: 'x35553', fingers: 'x13331', barre: { fret: 3, from: 5, to: 1 } },
      { id: 'Bm', symbol: 'Bm', frets: 'x24432', fingers: 'x13421', barre: { fret: 2, from: 5, to: 1 } },
      { id: 'Cm', symbol: 'Cm', frets: 'x35543', fingers: 'x13421', barre: { fret: 3, from: 5, to: 1 } },
      { id: 'B7-barre', symbol: 'B7', frets: 'x24242', fingers: 'x13141', barre: { fret: 2, from: 5, to: 1 } },
      { id: 'Bm7', symbol: 'Bm7', frets: 'x24232', fingers: 'x13121', barre: { fret: 2, from: 5, to: 1 } },
      { id: 'Cmaj7-barre', symbol: 'Cmaj7', frets: 'x35453', fingers: 'x13241', barre: { fret: 3, from: 5, to: 1 } },
      { id: 'D-barre', symbol: 'D', frets: 'x57775', fingers: 'x13331', barre: { fret: 5, from: 5, to: 1 } },
      { id: 'Dm-barre', symbol: 'Dm', frets: 'x57765', fingers: 'x13421', barre: { fret: 5, from: 5, to: 1 } },
    ],
  },
  {
    id: 'avansate',
    title: { ro: 'Acorduri avansate', en: 'Advanced chords' },
    summary: {
      ro: 'Acorduri de jazz, funk și rock: micșorate, mărite, cu nonă, cu altă notă în bas. Forme mobile, fără coarde goale.',
      en: 'Jazz, funk and rock chords: diminished, augmented, ninths, other notes in the bass. Movable shapes, no open strings.',
    },
    accent: '#B4237A',
    soft: '#FAE6F1',
    chords: [
      { id: 'C6', symbol: 'C6', frets: 'x32210', fingers: 'x4231-' },
      { id: 'Csus4-barre', symbol: 'Csus4', frets: 'x35563', fingers: 'x13341', barre: { fret: 3, from: 5, to: 1 } },
      { id: 'C7sus4', symbol: 'C7sus4', frets: 'x35363', fingers: 'x13141', barre: { fret: 3, from: 5, to: 1 } },
      {
        id: 'C9',
        symbol: 'C9',
        frets: 'x32333',
        fingers: 'x21333',
        tip: {
          ro: 'Degetul 3 culcat pe coardele 3, 2 și 1. Acordul de bază al funk-ului.',
          en: 'Finger 3 laid across strings 3, 2 and 1. The basic funk chord.',
        },
      },
      { id: 'Cm9', symbol: 'Cm9', frets: 'x31333', fingers: 'x21333' },
      {
        id: 'E7#9',
        symbol: 'E7#9',
        frets: '076780',
        fingers: '-2134-',
        instrument: 'electric',
        tip: {
          ro: 'Mi7 cu nona mărită (Sol): terța mare și cea mică în același acord. Sunetul lui Hendrix.',
          en: 'E7 with the sharp nine (G): the major and minor third in one chord. The Hendrix sound.',
        },
      },
      { id: 'Bm7b5', symbol: 'Bm7b5', frets: 'x2323x', fingers: 'x1324x' },
      { id: 'Cdim7', symbol: 'Cdim7', frets: 'x3424x', fingers: 'x2314x' },
      { id: 'Caug', symbol: 'Caug', frets: 'x3211x', fingers: 'x4312x' },
      {
        id: 'C/G',
        symbol: 'C/G',
        frets: '332010',
        fingers: '342-1-',
        tip: {
          ro: 'Do major cu Sol în bas: degetul 3 trece pe coarda 6, iar degetul 4 ia tonica de pe coarda 5. Un slash chord.',
          en: 'C major with G in the bass: finger 3 moves to string 6 and finger 4 takes the root on string 5. A slash chord.',
        },
      },
      { id: 'G/B', symbol: 'G/B', frets: 'x20003', fingers: 'x1---3' },
    ],
  },
]
