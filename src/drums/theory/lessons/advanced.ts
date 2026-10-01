import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 6, Avansat.

  Opt lecții: independența, linear playing, deplasarea, măsurile impare,
  poliritmul pe set, modulația metrică, tehnica de dublu bas și măturile.

  Poliritmul ca noțiune de timp e lecția 18 din Ritm și se TRIMITE acolo
  (`requiresRhythmLesson`); aici doar se pune pe set.

  Măturile se aud ca LOVITURI (mostra din DRSKit). Mișcarea în cerc, sunetul
  continuu de dedesubt, nu: pentru ea n-avem mostră, și lecția o spune.

  Măsurile impare folosesc `beatsPerBar` 5 și 7. La 7/8 timpul E optimea
  (7 pași, 7 timpi), deci tempoul exemplului e în optimi pe minut.
*/

const GROOVE = { min: 50, max: 140, suggested: 88 }
const SIXTEENTHS = { min: 50, max: 110, suggested: 72 }
const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }

export const advancedLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'independenta',
    stage: 'advanced',
    title: { ro: 'Independența pe ostinato', en: 'Independence over an ostinato' },
    goal: {
      ro: 'Muți un membru liber în timp ce ceilalți rămân fixi.',
      en: 'Move one limb freely while the others stay fixed.',
    },
    sections: [
      {
        id: 'un-membru-liber',
        heading: { ro: 'Un singur membru se mișcă', en: 'Only one limb moves' },
        body: {
          ro: '**Independența** înseamnă că fiecare membru face altceva fără să-i încurce pe ceilalți. Ține fusul și toba mare fixe și mută doar toba mică.',
          en: '**Independence** means each limb does something different without tripping up the others. Keep the hi-hat and bass drum fixed, and move only the snare.',
        },
        example: {
          caption: { ro: 'Fusul și toba mare la fel; toba mică se mută în a doua măsură.', en: 'Hi-hat and bass drum the same; the snare moves in the second bar.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-av-independenta',
            stepsPerBar: 8,
            rows: ROCK,
            // Toba mică: 2, „trei-și”, „patru-și” (pașii 2, 5, 7).
            extraBars: [{ hhClosed: ROCK.hhClosed, snare: '..x..x.x', kick: ROCK.kick }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Independență', en: 'Independence' },
            meaning: {
              ro: 'Fiecare membru face altceva, în același timp, fără să-i tragă pe ceilalți după el.',
              en: 'Each limb doing something different at the same time, without dragging the others along.',
            },
          },
        ],
      },
      {
        id: 'cum-exersezi-independenta',
        heading: { ro: 'Cum exersezi', en: 'How to practise' },
        body: {
          ro: 'Un membru nou o dată, încet. Când merge fără să te gândești, schimbi ostinato-ul și o iei de la capăt.',
          en: 'One new limb at a time, slowly. When it runs without thinking, change the ostinato and start again.',
        },
      },
    ],
  },

  {
    id: 'linear',
    stage: 'advanced',
    title: { ro: 'Linear playing', en: 'Linear playing' },
    goal: {
      ro: 'Cânți un groove în care nicio lovitură nu cade odată cu alta.',
      en: 'Play a groove where no two strokes land together.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'nimic-deodata',
        heading: { ro: 'Nimic deodată', en: 'Nothing at once' },
        body: {
          ro: 'În **linear playing**, pe fiecare pas lovește o singură piesă. Uită-te la grilă: nicio coloană n-are două pătrate pline. Sună fluid, ca o singură linie.',
          en: 'In **linear playing**, only one piece strikes on each step. Look at the grid: no column has two filled squares. It sounds fluid, like a single line.',
        },
        example: {
          caption: { ro: 'Un groove linear pe șaisprezecimi.', en: 'A linear sixteenth-note groove.' },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-av-linear',
            /*
              16 pași, câte o piesă pe pas:
              kick  0, 3, 7, 9, 14
              snare 4, 12 (timpii 2 și 4)
              hat   restul
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: '.xx..xx.x.xx.x.x',
              snare: '....X.......X...',
              kick: 'x..x...x.x....x.',
            },
            tempo: SIXTEENTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Linear playing', en: 'Linear playing' },
            meaning: {
              ro: 'Un groove în care două piese nu cad niciodată pe același pas.',
              en: 'A groove where two pieces never land on the same step.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'deplasarea',
    stage: 'advanced',
    title: { ro: 'Deplasarea', en: 'Displacement' },
    goal: {
      ro: 'Muți un groove pe contratimp și nu pierzi „unu”-l.',
      en: 'Shift a groove onto the off-beat without losing beat one.',
    },
    sections: [
      {
        id: 'groove-mutat',
        heading: { ro: 'Același groove, mai târziu', en: 'The same groove, later' },
        body: {
          ro: '**Deplasarea** mută un groove cu o optime mai târziu. Notele sunt aceleași, dar cad pe contratimp, iar urechea crede că s-a mutat „unu”. Fusul rămâne pe loc, ca să ai reperul.',
          en: '**Displacement** shifts a groove one eighth later. The notes are the same, but they land on the off-beats and the ear thinks beat one has moved. The hi-hat stays put, so you keep your bearings.',
        },
        example: {
          caption: {
            ro: 'O măsură normală, apoi toba mare și toba mică mutate cu o optime.',
            en: 'One normal bar, then bass drum and snare moved one eighth later.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-av-deplasare',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [{ hhClosed: ROCK.hhClosed, snare: '...x...x', kick: '.x...x..' }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Deplasare (displacement)', en: 'Displacement' },
            meaning: {
              ro: 'Același groove mutat cu o subdiviziune mai devreme sau mai târziu.',
              en: 'The same groove moved one subdivision earlier or later.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'masuri-impare',
    stage: 'advanced',
    title: { ro: 'Măsuri impare: 5/4 și 7/8', en: 'Odd meters: 5/4 and 7/8' },
    goal: {
      ro: 'Numeri și cânți măsuri de cinci și de șapte, pe grupe de doi și trei.',
      en: 'Count and play bars of five and seven, in groups of two and three.',
    },
    requiresRhythmLesson: 'masura-3-4',
    sections: [
      {
        id: 'cinci-patrimi',
        heading: { ro: '5/4', en: '5/4' },
        body: {
          ro: 'Cinci timpi nu se numără la rând, ci în grupe: **3+2**, „unu-doi-trei, unu-doi”. Toba mare marchează începutul fiecărui grup.',
          en: 'Five beats are not counted straight through but in groups: **3+2**, "one-two-three, one-two". The bass drum marks the start of each group.',
        },
        example: {
          caption: { ro: '5/4 ca 3+2: toba mare pe 1 și 4, toba mică pe 3 și 5.', en: '5/4 as 3+2: bass drum on 1 and 4, snare on 3 and 5.' },
          bpm: 100,
          exercise: demoExercise({
            id: 'demo-av-cinci',
            // 10 pași, 5 timpi -> 2 pe timp. Toba mare pe 0 și 6 (timpii 1 și 4).
            stepsPerBar: 10,
            beatsPerBar: 5,
            rows: { hhClosed: 'xxxxxxxxxx', snare: '....x...x.', kick: 'x.....x...' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'sapte-optimi',
        heading: { ro: '7/8', en: '7/8' },
        body: {
          ro: 'La 7/8 numeri optimi, în grupe de **2+2+3**: „unu-doi, unu-doi, unu-doi-trei”. Toba mare pe primul și al treilea grup, toba mică pe al doilea.',
          en: 'In 7/8 you count eighths, in groups of **2+2+3**: "one-two, one-two, one-two-three". Bass drum on the first and third group, snare on the second.',
        },
        example: {
          caption: { ro: '7/8 ca 2+2+3.', en: '7/8 as 2+2+3.' },
          bpm: 180,
          exercise: demoExercise({
            id: 'demo-av-sapte',
            // 7 pași, 7 timpi: timpul e optimea. Grupele încep pe 0, 2, 4.
            stepsPerBar: 7,
            beatsPerBar: 7,
            rows: { hhClosed: 'xxxxxxx', snare: '..x....', kick: 'x...x..' },
            tempo: { min: 100, max: 240, suggested: 180 },
          }),
        },
      },
    ],
  },

  {
    id: 'poliritm-pe-set',
    stage: 'advanced',
    title: { ro: 'Poliritm pe set', en: 'Polyrhythm on the kit' },
    goal: {
      ro: 'Pui pe set poliritmul învățat la Ritm: două fluxuri pe două piese.',
      en: 'Put the polyrhythm from Rhythm onto the kit: two streams on two pieces.',
    },
    requiresRhythmLesson: 'poliritm',
    sections: [
      {
        id: 'trei-contra-doi',
        heading: { ro: '3 contra 2', en: '3 against 2' },
        body: {
          ro: 'Poliritmul se învață la Ritm; aici îl pui pe set. Ride-ul cântă trei, toba mare două, în același timp. Se întâlnesc doar pe „unu”.',
          en: 'Polyrhythm is learned in Rhythm; here you put it on the kit. The ride plays three, the bass drum two, at the same time. They meet only on one.',
        },
        example: {
          caption: { ro: 'Ride-ul trei, toba mare două.', en: 'Ride three, bass drum two.' },
          bpm: 60,
          exercise: demoExercise({
            id: 'demo-av-3-2',
            // 6 pași, 2 timpi: grila comună. Ride pe 0, 2, 4; toba mare pe 0, 3.
            stepsPerBar: 6,
            beatsPerBar: 2,
            rows: { ride: 'x.x.x.', kick: 'x..x..' },
            tempo: { min: 40, max: 120, suggested: 60 },
          }),
        },
      },
      {
        id: 'patru-contra-trei',
        heading: { ro: '4 contra 3', en: '4 against 3' },
        body: {
          ro: 'Ride-ul patru, toba mare trei. Numără grila comună, douăsprezece părți, ca la Ritm, până când le simți separat.',
          en: 'Ride four, bass drum three. Count the shared grid, twelve parts, as in Rhythm, until you can feel them separately.',
        },
        example: {
          caption: { ro: 'Ride-ul patru, toba mare trei.', en: 'Ride four, bass drum three.' },
          bpm: 60,
          exercise: demoExercise({
            id: 'demo-av-4-3',
            // 12 pași, 3 timpi. Ride pe 0, 3, 6, 9; toba mare pe 0, 4, 8.
            stepsPerBar: 12,
            beatsPerBar: 3,
            rows: { ride: 'x..x..x..x..', kick: 'x...x...x...' },
            tempo: { min: 40, max: 100, suggested: 60 },
          }),
        },
      },
    ],
  },

  {
    id: 'modulatia-metrica',
    stage: 'advanced',
    title: { ro: 'Modulația metrică', en: 'Metric modulation' },
    goal: {
      ro: 'Înțelegi cum o subdiviziune devine noul puls.',
      en: 'Understand how a subdivision becomes the new pulse.',
    },
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'pulsul-nou',
        heading: { ro: 'Pulsul nou', en: 'The new pulse' },
        body: {
          ro: '**Modulația metrică** ia o subdiviziune și o face noul puls. În a doua măsură fusul cântă trei pe doi timpi; dacă îi simți pe ei ca timpi, tempoul a crescut cu jumătate.',
          en: '**Metric modulation** takes a subdivision and makes it the new pulse. In the second bar the hi-hat plays three across two beats; feel those as the beats and the tempo has gone up by half.',
        },
        example: {
          caption: {
            ro: 'Fusul pe timpi, apoi trioleți de pătrime, cu același backbeat.',
            en: 'Hi-hat on the beats, then quarter-note triplets, with the same backbeat.',
          },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-av-modulatie',
            // 12 pași, 3 pe timp. Măsura 2: fusul din doi în doi pași = trioleți de pătrime.
            stepsPerBar: 12,
            rows: { hhClosed: 'x..x..x..x..', snare: '...x.....x..', kick: 'x.....x.....' },
            extraBars: [{ hhClosed: 'x.x.x.x.x.x.', snare: '...x.....x..', kick: 'x.....x.....' }],
            tempo: { min: 50, max: 120, suggested: 72 },
          }),
        },
        terms: [
          {
            term: { ro: 'Modulație metrică', en: 'Metric modulation' },
            meaning: {
              ro: 'Schimbarea tempoului prin luarea unei subdiviziuni ca puls nou.',
              en: 'Changing tempo by taking a subdivision as the new pulse.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'tehnica-dubla',
    stage: 'advanced',
    title: { ro: 'Tehnica de dublu bas', en: 'Double bass technique' },
    goal: {
      ro: 'Alternezi picioarele egal, ca mâinile la single stroke.',
      en: 'Alternate your feet evenly, like hands in a single stroke roll.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'picioare-alternate',
        heading: { ro: 'Dreptul, stângul', en: 'Right, left' },
        body: {
          ro: 'Șaisprezecimile pe toba mare se cântă alternând picioarele, ca un single stroke. Piciorul stâng e aproape mereu cel slab: exersează pornind și cu el.',
          en: 'Sixteenths on the bass drum are played by alternating feet, like a single stroke. The left foot is almost always the weak one: practise starting with it too.',
        },
        example: {
          caption: { ro: 'Toba mare pe șaisprezecimi, backbeat deasupra.', en: 'Bass drum in sixteenths, backbeat on top.' },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-av-dubla',
            stepsPerBar: 16,
            rows: { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'calcai',
        heading: { ro: 'Călcâiul sus sau jos', en: 'Heel up or heel down' },
        body: {
          ro: 'Cu **călcâiul jos** ai control și volum mic; cu **călcâiul sus** ai forță și viteză. Pentru dublă rapidă, călcâiul e sus, iar mișcarea vine din gleznă.',
          en: 'With the **heel down** you get control and less volume; with the **heel up** you get power and speed. For fast double bass the heel is up and the movement comes from the ankle.',
        },
      },
    ],
  },

  {
    id: 'maturi',
    stage: 'advanced',
    title: { ro: 'Mături', en: 'Brushes' },
    goal: {
      ro: 'Afli ce sunt măturile și când se folosesc.',
      en: 'Learn what brushes are and when they are used.',
    },
    sections: [
      {
        id: 'ce-sunt-maturile',
        heading: { ro: 'Bețe care mătură', en: 'Sticks that sweep' },
        body: {
          ro: '**Măturile** sunt bețe cu fire subțiri de metal, pentru jazz și balade. Lovite, sună moale și scurt; ascultă diferența față de toba mică lovită cu bățul.',
          en: '**Brushes** are sticks with thin metal wires, for jazz and ballads. Struck, they sound soft and short; listen to the difference from a snare hit with a stick.',
        },
        example: {
          caption: {
            ro: 'Patru lovituri cu bățul, apoi patru cu mătura.',
            en: 'Four strokes with a stick, then four with a brush.',
          },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-av-matura-vs-bat',
            stepsPerBar: 4,
            rows: { snare: 'xxxx' },
            extraBars: [{ brush: 'xxxx' }],
            tempo: { min: 50, max: 120, suggested: 72 },
          }),
        },
        terms: [
          {
            term: { ro: 'Mături (brushes)', en: 'Brushes' },
            meaning: {
              ro: 'Bețe cu fire de metal, care se mătură pe tobă pentru un sunet moale și continuu.',
              en: 'Sticks with metal wires, swept across the drum for a soft, continuous sound.',
            },
          },
        ],
      },
      {
        id: 'cum-se-canta',
        heading: { ro: 'O mână mătură, cealaltă bate', en: 'One hand sweeps, the other taps' },
        body: {
          ro: 'De obicei mâna stângă mătură în cerc, ținând timpul, iar dreapta bate ritmul de ride pe toba mică. Mișcarea în cerc nu se aude aici, n-avem mostră pentru ea; se aude mâna dreaptă, cu fusul cu piciorul pe 2 și 4.',
          en: 'Usually the left hand sweeps in circles, keeping time, while the right taps the ride pattern on the snare. The circular sweep is not heard here, we have no sample for it; you hear the right hand, with the foot hi-hat on 2 and 4.',
        },
        example: {
          caption: {
            ro: 'Ritmul de ride cântat cu mătura pe toba mică, fusul cu piciorul pe 2 și 4.',
            en: 'The ride pattern played with a brush on the snare, foot hi-hat on 2 and 4.',
          },
          bpm: 100,
          exercise: demoExercise({
            id: 'demo-av-matura-jazz',
            // 12 pași, 3 pe timp: „ding, ding-da" pe mătură, accent pe 2 și 4.
            stepsPerBar: 12,
            rows: { brush: 'x..X.xx..X.x', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
            tempo: { min: 60, max: 160, suggested: 100 },
          }),
        },
      },
    ],
  },
]
