import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { beatsRow, evenRow } from '../../mixed-grid'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 6, Avansat.

  Opt lecții: independența, linear playing, deplasarea, măsurile impare,
  poliritmul pe set, modulația metrică, tehnica de dublu bas și măturile.

  Fiecare lecție e o scară, nu o definiție: noțiunea, apoi aceeași noțiune un
  pas mai departe, apoi felul în care se exersează, cu greșeala tipică numită
  acolo unde apare. Exemplele de exersat au „Cânți tu” (`playAlong`): tobele
  tac, clicul rămâne, iar grila arată ce trebuia să cadă unde.

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

/*
  Fill-urile avansate stau pe grila comună de 12 pași pe timp (`mixed-grid.ts`),
  ca șaisprezecimile, trioletele și sextoletele să încapă în aceeași măsură. Se
  scriu pe timpi, despărțiți de `|`; groove-ul de dinainte se întinde cu `evenRow`.
  Exemplele arată portativul și grila, una sub alta: portativul scrie fiecare timp
  în subdiviziunea lui, cu cifra 3 sau 6 deasupra (`staff.ts`, `divisions`).
*/
const MIXED_GROOVE = {
  hhClosed: evenRow('XxxxXxxxXxxxXxxx'),
  snare: evenRow('....X.......X...'),
  // „Trei-și” normal, nu accentuat: fusul de deasupra lui e normal (vezi `mixedFill`).
  kick: evenRow('X.......X.x.....'),
}
/*
  Măsura de fill, întinsă pe grila comună. Un accent pe un pas se aplică tuturor
  loviturilor de pe el: portativul desenează accentul o singură dată, deasupra
  codiței, deci o coloană cu un accent și o lovitură normală s-ar citi greșit
  (vezi antetul din `notation.ts` și testul din `staff.test.ts`).
*/
const mixedFill = (rows: Record<string, string>) => {
  const expanded = Object.entries(rows).map(([piece, row]) => [piece, beatsRow(row)] as const)
  const accented = new Set<number>()
  for (const [, row] of expanded) [...row].forEach((c, step) => c === 'X' && accented.add(step))
  return Object.fromEntries(
    expanded.map(([piece, row]) => [
      piece,
      [...row].map((c, step) => (c === 'x' && accented.has(step) ? 'X' : c)).join(''),
    ]),
  )
}
const MIXED_TEMPO = { min: 50, max: 96, suggested: 72 }

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
        example: {
          caption: {
            ro: 'Fusul și toba mică rămân la fel în toate cele patru măsuri: ele sunt ostinato-ul. Se mișcă doar toba mare: pe 1 și 3, apoi se adaugă „doi-și”, apoi „trei-și”, apoi amândouă. Ascultă, apoi apasă „Cânți tu” și ia măsurile pe rând, încet.',
            en: 'Hi-hat and snare stay the same in all four bars: they are the ostinato. Only the bass drum moves: on 1 and 3, then the "and" of 2 comes in, then the "and" of 3, then both. Listen, then press "You play" and take the bars one at a time, slowly.',
          },
          bpm: 70,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-independenta-pasi',
            stepsPerBar: 8,
            /*
              8 pași:   0 1 2 3 4 5 6 7
              timp:     1 & 2 & 3 & 4 &
              Fusul pe toate optimile, toba mică pe 2 și 4 (pașii 2, 6), neschimbate.
              Toba mare: 1, 3 · + „doi-și” (pasul 3) · + „trei-și” (pasul 5) · ambele.
            */
            rows: ROCK,
            extraBars: [
              { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xx...' },
              { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x...xx..' },
              { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xxx..' },
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'alt-ostinato',
        heading: { ro: 'Alt ostinato, de la capăt', en: 'A new ostinato, from the top' },
        body: {
          ro: 'Acum ostinato-ul e de jazz: ride pe optimi, fusul cu piciorul pe 2 și 4, toba mare pe 1 și 3. Peste el, toba mică se mută pe rând. Greșeala tipică: ostinato-ul cedează primul, fiindcă e cel la care nu te mai uiți. Dacă ride-ul se rupe când se mută toba mică, întoarce-te o măsură.',
          en: 'Now the ostinato is a jazz one: ride on eighths, foot hi-hat on 2 and 4, bass drum on 1 and 3. Over it, the snare moves one step at a time. The typical slip: the ostinato gives way first, because it is the part you stop watching. If the ride breaks when the snare moves, go back a bar.',
        },
        example: {
          caption: {
            ro: 'Toba mică pe 2 și 4, apoi pe „doi-și” și „patru-și”, apoi pe „unu-și” și „trei-și”, apoi pe toți „și”-ii. Restul nu se mișcă.',
            en: 'Snare on 2 and 4, then on the "and" of 2 and 4, then on the "and" of 1 and 3, then on every "and". Nothing else moves.',
          },
          bpm: 72,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-independenta-jazz',
            stepsPerBar: 8,
            /*
              8 pași:  0 1 2 3 4 5 6 7  =  1 & 2 & 3 & 4 &
              Toba mică: 2,6 · 3,7 · 1,5 · 1,3,5,7.
            */
            rows: { ride: 'xxxxxxxx', hhFoot: '..x...x.', snare: '..x...x.', kick: 'x...x...' },
            extraBars: [
              { ride: 'xxxxxxxx', hhFoot: '..x...x.', snare: '...x...x', kick: 'x...x...' },
              { ride: 'xxxxxxxx', hhFoot: '..x...x.', snare: '.x...x..', kick: 'x...x...' },
              { ride: 'xxxxxxxx', hhFoot: '..x...x.', snare: '.x.x.x.x', kick: 'x...x...' },
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'piciorul-stang',
        heading: { ro: 'Al patrulea membru: piciorul stâng', en: 'The fourth limb: the left foot' },
        body: {
          ro: 'Până acum piciorul stâng a stat pe pedala fusului, închis. Acum lucrează: fusul cu piciorul pe fiecare timp, sub ride, toba mare și toba mică. Patru membre, patru fluxuri. Pornește cu piciorul singur peste ride, abia apoi pune restul.',
          en: 'So far the left foot has rested on the hi-hat pedal, closed. Now it works: the foot hi-hat on every beat, under the ride, bass drum and snare. Four limbs, four streams. Start with the foot alone under the ride, only then add the rest.',
        },
        example: {
          caption: {
            ro: 'Ride pe optimi, fusul cu piciorul pe fiecare timp, toba mare pe 1 și 3, toba mică pe 2 și 4.',
            en: 'Ride in eighths, foot hi-hat on every beat, bass drum on 1 and 3, snare on 2 and 4.',
          },
          bpm: 72,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-independenta-picior',
            stepsPerBar: 8,
            rows: { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...', hhFoot: 'x.x.x.x.' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'masoara-progresul',
        heading: { ro: 'Cum îți măsori progresul', en: 'How to measure your progress' },
        body: {
          ro: 'Aplicația nu te aude, deci progresul îl măsori tu: notează tempoul la care fiecare treaptă merge de trei ori la rând fără să se clatine ostinato-ul. A doua zi pornești cu 4 BPM sub el și urci. Când o treaptă merge la tempoul piesei, treci la următoarea.',
          en: 'The app cannot hear you, so you measure progress yourself: note the tempo at which each step runs three times in a row without the ostinato wavering. The next day, start 4 BPM below it and climb. When a step runs at the song’s tempo, move to the next one.',
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
      {
        id: 'grupul-de-trei',
        heading: { ro: 'Cărămida: grupul de trei', en: 'The building block: groups of three' },
        body: {
          ro: 'Orice groove linear e făcut din grupuri mici, repetate. Cel mai simplu are trei note: mâna dreaptă pe fus, stânga pe toba mică, apoi piciorul. Pe triolete, fiecare timp e exact un grup.',
          en: 'Every linear groove is built from small groups, repeated. The simplest has three notes: right hand on the hi-hat, left on the snare, then the foot. On triplets, every beat is exactly one group.',
        },
        example: {
          caption: {
            ro: 'Pe fiecare timp: fus, tobă mică, tobă mare. Spune-l întâi cu voce tare, „ți-ța-bum”, apoi apasă „Cânți tu”.',
            en: 'On every beat: hi-hat, snare, bass drum. Say it out loud first, "tss-ka-boom", then press "You play".',
          },
          bpm: 66,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-linear-trei',
            // 12 pași, 3 pe timp: fusul pe 0, 3, 6, 9; toba mică pe 1, 4, 7, 10; toba mare pe 2, 5, 8, 11.
            stepsPerBar: 12,
            rows: { hhClosed: 'x..x..x..x..', snare: '.x..x..x..x.', kick: '..x..x..x..x' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'grupul-de-patru',
        heading: { ro: 'Grupul de patru, cu backbeat', en: 'The group of four, with a backbeat' },
        body: {
          ro: 'Pe șaisprezecimi, grupul are patru note: mână, mână, picior, picior. Ca să sune a groove, nu a exercițiu, toba mică e tare pe 2 și 4 și foarte încet în rest. Greșeala tipică: din obișnuință, fusul și toba mare cad deodată pe „unu”. Aici nu au voie: uită-te la grilă, nicio coloană n-are două pătrate.',
          en: 'On sixteenths the group has four notes: hand, hand, foot, foot. To sound like a groove rather than an exercise, the snare is loud on 2 and 4 and very soft elsewhere. The typical slip: out of habit, hi-hat and bass drum land together on one. Here they must not: look at the grid, no column has two squares.',
        },
        example: {
          caption: {
            ro: 'Fusul pe 1 și 3, toba mică tare pe 2 și 4 și ghost în rest, toba mare de câte două ori.',
            en: 'Hi-hat on 1 and 3, snare loud on 2 and 4 and ghosted elsewhere, bass drum in pairs.',
          },
          bpm: 64,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-linear-patru',
            /*
              16 pași, o singură piesă pe pas:
              fus    0, 8
              mică   1, 5, 9, 13 ghost; 4, 12 tare (timpii 2 și 4)
              mare   2, 3, 6, 7, 10, 11, 14, 15
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.......x.......',
              snare: '.o..Xo...o..Xo..',
              kick: '..xx..xx..xx..xx',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'cum-exersezi-linear',
        heading: { ro: 'Cum îl exersezi', en: 'How to practise it' },
        body: {
          ro: 'Linear playing sună fluid doar dacă fiecare notă are același volum, în afară de cele marcate. Exersează grupul singur, în buclă, până nu mai trebuie să te gândești ce urmează, abia apoi pune grupuri unul după altul. Și încet: un pattern linear grăbit se aude ca o rostogolire, nu ca un groove.',
          en: 'Linear playing only sounds fluid if every note has the same volume, apart from the marked ones. Practise one group on its own, looping, until you stop thinking about what comes next, then chain groups together. And slowly: a rushed linear pattern sounds like a tumble, not a groove.',
        },
      },
      {
        id: 'linear-pe-tomuri',
        heading: { ro: 'Linear pe tomuri: un fill', en: 'Linear on the toms: a fill' },
        body: {
          ro: 'Mută mâna dreaptă de pe fus pe tomuri și grupul de trei devine un fill: tom, tobă mică, tobă mare, apoi cazan, tobă mică, tobă mare. Sună ca un fill mare, deși mâinile fac exact ce au făcut în groove.',
          en: 'Move the right hand from the hi-hat to the toms and the group of three becomes a fill: tom, snare, bass drum, then floor tom, snare, bass drum. It sounds like a big fill, though the hands do exactly what they did in the groove.',
        },
        example: {
          caption: {
            ro: 'Grupul de trei pe triolete, cu dreapta alternând tomul 1 și cazanul.',
            en: 'The group of three on triplets, the right hand alternating high tom and floor tom.',
          },
          bpm: 66,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-linear-tomuri',
            /*
              12 pași, o piesă pe pas. Pe fiecare timp: mâna dreaptă (tom pe 1 și 3,
              cazan pe 2 și 4), toba mică, toba mare.
            */
            stepsPerBar: 12,
            rows: { tom: 'x.....x.....', floor: '...x.....x..', snare: '.x..x..x..x.', kick: '..x..x..x..x' },
            tempo: SIXTEENTHS,
          }),
        },
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
      {
        id: 'mai-devreme',
        heading: { ro: 'Același groove, mai devreme', en: 'The same groove, earlier' },
        body: {
          ro: 'Deplasarea merge în ambele sensuri. Mutat cu o optime mai devreme, toba mare ajunge pe „patru-și”, chiar înainte de „unu”, și urechea o ia drept un „unu” nou, venit prea repede.',
          en: 'Displacement works both ways. Moved one eighth earlier, the bass drum lands on the "and" of 4, just before one, and the ear takes it for a new one that came too soon.',
        },
        example: {
          caption: {
            ro: 'O măsură normală, apoi toba mare pe „doi-și” și „patru-și”, toba mică pe „unu-și” și „trei-și”.',
            en: 'One normal bar, then bass drum on the "and" of 2 and 4, snare on the "and" of 1 and 3.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-av-deplasare-devreme',
            // Totul cu un pas mai devreme: toba mare 0, 4 -> 7, 3; toba mică 2, 6 -> 1, 5.
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [{ hhClosed: ROCK.hhClosed, snare: '.x...x..', kick: '...x...x' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'cu-o-saisprezecime',
        heading: { ro: 'Cu o șaisprezecime', en: 'By one sixteenth' },
        body: {
          ro: 'Pasul următor e mai mic: groove-ul mutat cu o singură șaisprezecime. Acum nicio notă de tobă nu mai cade nici pe timp, nici pe „și”, ci pe „e”. Sună mai neliniștit decât deplasarea cu o optime, tocmai fiindcă e mai aproape de timp.',
          en: 'The next step is smaller: the groove moved by a single sixteenth. Now no drum note lands on the beat or on the "and", only on the "e". It sounds more restless than the eighth-note shift, precisely because it sits closer to the beat.',
        },
        example: {
          caption: {
            ro: 'O măsură normală, apoi toba mare pe „unu-e” și „trei-e”, toba mică pe „doi-e” și „patru-e”. Fusul pe optimi rămâne pe loc.',
            en: 'One normal bar, then bass drum on the "e" of 1 and 3, snare on the "e" of 2 and 4. The eighth-note hi-hat stays put.',
          },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-av-deplasare-16',
            // 16 pași: toba mare 0, 8 -> 1, 9; toba mică 4, 12 -> 5, 13.
            stepsPerBar: 16,
            rows: { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' },
            extraBars: [
              { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '.....x.......x..', kick: '.x.......x......' },
            ],
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'nu-pierde-unu',
        heading: { ro: 'Nu pierde „unu”-l', en: 'Do not lose beat one' },
        body: {
          ro: 'Greșeala tipică: după două măsuri mutate, urechea acceptă noul „unu” și te întorci la groove-ul normal decalat. Aici clicul bate doar pe „unu”: două măsuri mutate între două normale. Dacă ultima măsură nu începe odată cu clicul, ai mutat și „unu”-l, nu doar groove-ul.',
          en: 'The typical slip: after two shifted bars, the ear accepts the new one and you return to the normal groove displaced. Here the click plays only on one: two shifted bars between two normal ones. If the last bar does not start with the click, you moved beat one too, not just the groove.',
        },
        example: {
          caption: {
            ro: 'Normal, mutat cu o optime, mutat, normal. Clicul doar pe „unu”. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Normal, shifted by an eighth, shifted, normal. Click on one only. Listen, then press "You play".',
          },
          bpm: 80,
          click: [[1]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-deplasare-exersat',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [
              { hhClosed: ROCK.hhClosed, snare: '...x...x', kick: '.x...x..' },
              { hhClosed: ROCK.hhClosed, snare: '...x...x', kick: '.x...x..' },
              ROCK,
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'unde-o-folosesti',
        heading: { ro: 'Unde o folosești', en: 'Where you use it' },
        body: {
          ro: 'Deplasarea e un efect, nu un groove de ținut toată piesa. Apare o măsură sau două, de obicei înaintea unui refren sau ca să scoată din amorțeală o strofă lungă. Trupa trebuie să știe că vine: o deplasare-surpriză sună ca o greșeală, chiar dacă e cântată perfect.',
          en: 'Displacement is an effect, not a groove to hold for a whole song. It shows up for a bar or two, usually before a chorus or to wake up a long verse. The band has to know it is coming: a surprise displacement sounds like a mistake, even when played perfectly.',
        },
      },
    ],
  },

  {
    id: 'fill-uri-avansate',
    stage: 'advanced',
    title: { ro: 'Fill-uri avansate', en: 'Advanced fills' },
    goal: {
      ro: 'Combini în același fill șaisprezecimi, triolete și sextolete, intri pe contratimp și aduci picioarele în fill.',
      en: 'Combine sixteenths, triplets and sextuplets in one fill, enter off the beat and bring your feet into the fill.',
    },
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'doua-grile',
        heading: { ro: 'Două grile în aceeași măsură', en: 'Two grids in one bar' },
        body: {
          ro: 'Până acum un fill stătea pe o singură grilă: optimi, șaisprezecimi sau triolete. Un fill avansat schimbă grila la mijloc: doi timpi de șaisprezecimi, apoi triolete. Pe grilă se vede: timpii 1 și 2 au patru pătrate, timpii 3 și 4 trei, mai late. Greșeala tipică: trioletele ies ca șaisprezecimi cu o notă lipsă. Numără schimbarea: „unu-e-și-a, doi-e-și-a, trei-tri-o-let”.',
          en: 'Until now a fill sat on one grid: eighths, sixteenths or triplets. An advanced fill changes grid halfway: two beats of sixteenths, then triplets. The grid shows it: beats 1 and 2 have four squares, beats 3 and 4 three wider ones. The typical slip: the triplets come out as sixteenths with a note missing. Count the change: "one-e-and-a, two-e-and-a, three-trip-let".',
        },
        example: {
          caption: {
            ro: 'O măsură de groove, apoi fill-ul: șaisprezecimi pe toba mică, triolete pe tomuri.',
            en: 'One bar of groove, then the fill: sixteenths on the snare, triplets on the toms.',
          },
          bpm: 76,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-doua-grile',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({ snare: 'Xxxx|Xxxx|.|.', tom: '..|..|Xxx|...', floor: '..|..|...|Xxx', kick: 'x.|..|x..|...' }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
      },
      {
        id: 'sextolete',
        heading: { ro: 'Sextoletele', en: 'Sextuplets' },
        body: {
          ro: 'Un **sextolet** pune șase note egale într-un timp: două triolete lipite, sau un triolet de șaisprezecimi. Se cântă alternat, R L R L R L, cu accent pe prima. Dus de pe o tobă pe alta, câte un timp pe fiecare, sună ca o cascadă, deși mâinile fac același lucru tot timpul.',
          en: 'A **sextuplet** puts six even notes in one beat: two triplets glued together, or a sixteenth-note triplet. Played alternating, R L R L R L, with the accent on the first. Moved from drum to drum, one beat on each, it sounds like a waterfall, though the hands do the same thing throughout.',
        },
        example: {
          caption: {
            ro: 'Câte un sextolet pe fiecare tobă: toba mică, tomul 1, tomul 2, cazanul.',
            en: 'One sextuplet on each drum: snare, high tom, mid tom, floor tom.',
          },
          bpm: 66,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-sextolete',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({ snare: 'Xxxxxx|.|.|.', tom: '.|Xxxxxx|.|.', mid: '.|.|Xxxxxx|.', floor: '.|.|.|Xxxxxx', kick: 'x.|x.|x.|x.' }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
        terms: [
          {
            term: { ro: 'Sextolet', en: 'Sextuplet' },
            meaning: {
              ro: 'Șase note egale într-un timp. Se scrie cu cifra 6 deasupra grupului.',
              en: 'Six even notes in one beat. Written with a 6 above the group.',
            },
          },
        ],
      },
      {
        id: 'intrare-pe-contratimp',
        heading: { ro: 'Intrarea pe contratimp', en: 'Entering off the beat' },
        body: {
          ro: 'Un fill nu trebuie să înceapă pe timp. Pornit pe „trei-e”, cu o șaisprezecime mai târziu, sună ca și cum ar sări în piesă din mers. Prima notă lipsește dinadins: golul de pe „trei” face intrarea să se audă. Greșeala tipică e să umpli golul din reflex.',
          en: 'A fill does not have to start on the beat. Started on the "e" of 3, one sixteenth late, it sounds as if it jumps into the song on the move. The first note is missing on purpose: the hole on 3 is what makes the entry heard. The typical slip is filling the hole by reflex.',
        },
        example: {
          caption: {
            ro: 'Groove pe timpii 1-2, fill-ul intră pe „trei-e” și coboară pe tomuri.',
            en: 'Groove on beats 1-2, the fill enters on the "e" of 3 and steps down the toms.',
          },
          bpm: 76,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-contratimp',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({
                hhClosed: 'Xxxx|Xxxx|x...|.',
                snare: '....|X...|.xxx|....',
                tom: '....|....|....|xx..',
                floor: '....|....|....|..xx',
                kick: 'X...|..X.|x...|....',
              }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
      },
      {
        id: 'picioarele-in-fill',
        heading: { ro: 'Picioarele în fill', en: 'The feet inside the fill' },
        body: {
          ro: 'Un fill nu e doar al mâinilor. Cu toba mare în el, mână, mână, picior, aceleași șase note pe timp sună de două ori mai mari, iar mâinile au timp să se mute pe tomul următor. Sună mult mai repede decât e: fiecare mână lovește doar de două ori pe timp.',
          en: 'A fill does not belong only to the hands. With the bass drum inside it, hand, hand, foot, the same six notes per beat sound twice as big, and the hands have time to move to the next tom. It sounds far faster than it is: each hand strikes only twice per beat.',
        },
        example: {
          caption: {
            ro: 'R L K, R L K în sextolete, cu mâinile coborând de pe toba mică pe cazan.',
            en: 'R L K, R L K in sextuplets, the hands stepping down from snare to floor tom.',
          },
          bpm: 64,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-picioare',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({
                snare: 'xx.xx.|......|......|......',
                tom: '......|xx.xx.|......|......',
                mid: '......|......|xx.xx.|......',
                floor: '......|......|......|xx.xx.',
                kick: '..x..x|..x..x|..x..x|..x..x',
              }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
      },
      {
        id: 'fusul-in-fill',
        heading: { ro: 'Fusul nu tace', en: 'The hi-hat does not go quiet' },
        body: {
          ro: 'Când mâinile pleacă de pe fus, fusul poate continua cu piciorul: îl închizi pe timpi, sub fill, și pulsul nu se pierde. Iar pe „patru-și”, mâna îl poate deschide o clipă, ca o respirație înaintea crash-ului.',
          en: 'When the hands leave the hi-hat, the hi-hat can carry on with the foot: you close it on the beats, under the fill, and the pulse is not lost. And on the "and" of 4, the hand can open it for a moment, like a breath before the crash.',
        },
        example: {
          caption: {
            ro: 'Fusul cu piciorul pe 3 și 4 sub toba mică, apoi deschis pe „patru-și”.',
            en: 'Foot hi-hat on 3 and 4 under the snare, then opened on the "and" of 4.',
          },
          bpm: 76,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-fus',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({
                hhClosed: 'Xxxx|Xxxx|....|....',
                snare: '....|X...|Xxxx|xx..',
                hhOpen: '....|....|....|..X.',
                hhFoot: '....|....|x...|x...',
                kick: 'X...|..X.|....|...x',
              }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
      },
      {
        id: 'franare-ritmica',
        heading: { ro: 'Frânare fără să schimbi tempoul', en: 'Braking without changing tempo' },
        body: {
          ro: 'Dacă fiecare timp are mai puține note decât cel dinainte (sextolet, șaisprezecimi, triolet, optimi), fill-ul pare că încetinește, deși tempoul stă pe loc. E o frână ritmică: trupa aude că vine ceva, iar „unu”-l de după cade exact unde trebuie.',
          en: 'If each beat has fewer notes than the one before (sextuplet, sixteenths, triplet, eighths), the fill seems to slow down, though the tempo stands still. It is a rhythmic brake: the band hears something coming, and the one after it lands exactly where it should.',
        },
        example: {
          caption: {
            ro: 'Șase, patru, trei, două note pe timp, coborând pe set.',
            en: 'Six, four, three, two notes per beat, stepping down the kit.',
          },
          bpm: 66,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-franare',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({ snare: 'Xxxxxx|.|.|.', tom: '.|Xxxx|.|.', mid: '.|.|Xxx|.', floor: '.|.|.|Xx', kick: 'x.|x.|x.|x.' }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
      },
      {
        id: 'cum-exersezi-fill-avansat',
        heading: { ro: 'Cum le exersezi', en: 'How to practise them' },
        body: {
          ro: 'Un timp pe rând. Cântă întâi doar timpul cu schimbarea, în buclă, cu clicul, până trecerea de la o grilă la alta nu te mai surprinde; abia apoi pune-l în măsură. Toate cele 20 de fill-uri avansate sunt în **Fill-uri avansate**, la practică: aplicația cântă trei măsuri de groove și tace pe a patra, care e a ta.',
          en: 'One beat at a time. First play only the beat with the change, looping, with the click, until the switch from one grid to the other no longer surprises you; only then put it in the bar. All 20 advanced fills are in **Advanced fills**, under practice: the app plays three bars of groove and goes quiet on the fourth, which is yours.',
        },
        example: {
          caption: {
            ro: 'Groove, apoi fill-ul cu șaisprezecimi și triolete, cu clicul pe fiecare timp. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Groove, then the sixteenths-and-triplets fill, with the click on every beat. Listen, then press "You play".',
          },
          bpm: 70,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          showStaff: true,
          exercise: demoExercise({
            id: 'demo-av-fill-exersat',
            stepsPerBar: 48,
            rows: MIXED_GROOVE,
            extraBars: [
              mixedFill({ snare: 'Xxxx|Xxxx|.|.', tom: '..|..|Xxx|...', floor: '..|..|...|Xxx', kick: 'x.|..|x..|...' }),
            ],
            tempo: MIXED_TEMPO,
          }),
        },
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
          playAlong: true,
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
          playAlong: true,
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
      {
        id: 'cinci-ca-doi-trei',
        heading: { ro: '5/4 invers: 2+3', en: '5/4 the other way: 2+3' },
        body: {
          ro: 'Aceiași cinci timpi se pot grupa și **2+3**: „unu-doi, unu-doi-trei”. Numărul de timpi nu se schimbă, se schimbă unde cade greutatea. Ascultă-le una după alta: 3+2 pare că se grăbește la final, 2+3 pare că se lungește.',
          en: 'The same five beats can also be grouped **2+3**: "one-two, one-two-three". The number of beats does not change, where the weight falls does. Listen to them one after the other: 3+2 seems to hurry at the end, 2+3 seems to stretch.',
        },
        example: {
          caption: { ro: '5/4 ca 2+3: toba mare pe 1 și 3, toba mică pe 2 și 5.', en: '5/4 as 2+3: bass drum on 1 and 3, snare on 2 and 5.' },
          bpm: 100,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-cinci-2-3',
            // 10 pași, 2 pe timp. Grupele încep pe 0 și 4 (timpii 1 și 3); toba mică pe 2 și 8 (timpii 2 și 5).
            stepsPerBar: 10,
            beatsPerBar: 5,
            rows: { hhClosed: 'xxxxxxxxxx', snare: '..x.....x.', kick: 'x...x.....' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'sapte-ca-trei-doi-doi',
        heading: { ro: '7/8 invers: 3+2+2', en: '7/8 the other way: 3+2+2' },
        body: {
          ro: 'Și 7/8 are mai multe grupări. Cu **3+2+2** grupul lung vine primul: „unu-doi-trei, unu-doi, unu-doi”. Greșeala tipică la măsurile impare: adaugi pe nesimțite o optime, ca să iasă o măsură „normală”. Numără grupele cu voce tare, nu până la șapte.',
          en: '7/8 has more than one grouping too. With **3+2+2** the long group comes first: "one-two-three, one-two, one-two". The typical slip with odd meters: you quietly add an eighth to make a "normal" bar. Count the groups out loud, not up to seven.',
        },
        example: {
          caption: { ro: '7/8 ca 3+2+2: toba mare pe primul și pe ultimul grup, toba mică pe al doilea.', en: '7/8 as 3+2+2: bass drum on the first and last group, snare on the second.' },
          bpm: 180,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-sapte-3-2-2',
            // 7 pași, timpul e optimea. Grupele încep pe 0, 3, 5.
            stepsPerBar: 7,
            beatsPerBar: 7,
            rows: { hhClosed: 'xxxxxxx', snare: '...x...', kick: 'x....x.' },
            tempo: { min: 100, max: 240, suggested: 180 },
          }),
        },
      },
      {
        id: 'exerseaza-impare',
        heading: { ro: 'Exersează: clicul pe grupe', en: 'Practise: the click on the groups' },
        body: {
          ro: 'Clicul bate doar începutul fiecărei grupe din 7/8, 2+2+3: pe 1, 3 și 5. Așa îl auzi cum se numără, nu ca șapte bătăi egale. Când grupele nu te mai surprind, lasă clicul doar pe „unu”.',
          en: 'The click marks only the start of each group of the 7/8, 2+2+3: on 1, 3 and 5. That way you hear it the way it is counted, not as seven even clicks. When the groups stop surprising you, leave the click on one only.',
        },
        example: {
          caption: {
            ro: '7/8 ca 2+2+3, clicul pe începutul grupelor. Ascultă, apoi apasă „Cânți tu”.',
            en: '7/8 as 2+2+3, the click on the group starts. Listen, then press "You play".',
          },
          bpm: 168,
          click: [[1, 3, 5]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-sapte-exersat',
            stepsPerBar: 7,
            beatsPerBar: 7,
            rows: { hhClosed: 'xxxxxxx', snare: '..x....', kick: 'x...x..' },
            tempo: { min: 100, max: 240, suggested: 168 },
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
      {
        id: 'poliritm-in-groove',
        heading: { ro: 'Poliritmul într-un groove', en: 'Polyrhythm inside a groove' },
        body: {
          ro: 'Într-o piesă, poliritmul stă de obicei peste un groove normal. Ride-ul cântă trei pe fiecare doi timpi, adică trioleți de pătrime, iar toba mare și toba mică rămân pe timpi. Greșeala tipică: ride-ul trage groove-ul după el și toba mică ajunge pe o notă de ride. Ține backbeat-ul neclintit și lasă ride-ul să plutească deasupra.',
          en: 'In a song, a polyrhythm usually sits over a normal groove. The ride plays three across every two beats, quarter-note triplets, while bass drum and snare stay on the beats. The typical slip: the ride drags the groove along and the snare ends up on a ride note. Keep the backbeat rock steady and let the ride float on top.',
        },
        example: {
          caption: {
            ro: 'Ride-ul trei pe doi timpi, toba mare pe 1 și 3, toba mică pe 2 și 4.',
            en: 'Ride three across two beats, bass drum on 1 and 3, snare on 2 and 4.',
          },
          bpm: 66,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-3-2-groove',
            // 12 pași, 3 pe timp. Ride din doi în doi (6 pe măsură = 3 pe doi timpi); toba mare 0, 6; toba mică 3, 9.
            stepsPerBar: 12,
            rows: { ride: 'x.x.x.x.x.x.', snare: '...x.....x..', kick: 'x.....x.....' },
            tempo: { min: 40, max: 110, suggested: 66 },
          }),
        },
      },
      {
        id: 'exerseaza-poliritm',
        heading: { ro: 'Exersează: o mână, apoi cealaltă', en: 'Practise: one hand, then the other' },
        body: {
          ro: 'Cu clicul pe cei doi timpi, cântă întâi doar toba mare, pe clic. Apoi doar ride-ul, trei pe aceiași doi timpi. Abia apoi amândouă. Spune grila comună cu voce tare, „unu-doi-trei-patru-cinci-șase”: ride-ul cade pe 1, 3, 5, toba mare pe 1 și 4.',
          en: 'With the click on the two beats, first play only the bass drum, on the click. Then only the ride, three across the same two beats. Only then both. Say the shared grid out loud, "one-two-three-four-five-six": the ride lands on 1, 3, 5, the bass drum on 1 and 4.',
        },
        example: {
          caption: {
            ro: '3 contra 2, cu clicul pe cei doi timpi. Ascultă, apoi apasă „Cânți tu”.',
            en: '3 against 2, with the click on the two beats. Listen, then press "You play".',
          },
          bpm: 56,
          click: [[1, 2]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-3-2-exersat',
            stepsPerBar: 6,
            beatsPerBar: 2,
            rows: { ride: 'x.x.x.', kick: 'x..x..' },
            tempo: { min: 40, max: 120, suggested: 56 },
          }),
        },
      },
      {
        id: 'unde-apare-poliritmul',
        heading: { ro: 'Unde îl auzi', en: 'Where you hear it' },
        body: {
          ro: 'Trei contra doi e peste tot în muzica afro-cubană și africană: clopotul în 12/8 peste un puls în patru, din etapa Stiluri, e chiar asta. În rock și metal apare ca efect, o figură de trei repetată peste măsuri de patru, până se întâlnesc iar pe „unu”.',
          en: 'Three against two is everywhere in Afro-Cuban and African music: the 12/8 bell over a pulse in four, from the Styles stage, is exactly that. In rock and metal it shows up as an effect, a figure of three repeated over bars of four, until they meet again on one.',
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
      {
        id: 'tempoul-nou',
        heading: { ro: 'Unde ajungi', en: 'Where you land' },
        body: {
          ro: 'Trei trioleți pe doi timpi înseamnă că fiecare triolet ține două treimi dintr-un timp. Luați ca timpi noi, tempoul devine 72 × 1,5 = 108 BPM. După modulație, același groove de rock se cântă în noul tempo, iar trioleții de dinainte sunt acum pătrimile.',
          en: 'Three triplets across two beats means each triplet is two thirds of a beat. Taken as the new beats, the tempo becomes 72 × 1.5 = 108 BPM. After the modulation the same rock groove is played in the new tempo, and the earlier triplets are now the quarter notes.',
        },
        example: {
          caption: {
            ro: 'Groove-ul de după modulație, la 108 BPM. Ascultă-l imediat după exemplul de dinainte: pătrimile de aici au durata trioleților de acolo.',
            en: 'The groove after the modulation, at 108 BPM. Listen to it right after the previous example: the quarter notes here last as long as the triplets there.',
          },
          bpm: 108,
          exercise: demoExercise({
            id: 'demo-av-modulatie-dupa',
            stepsPerBar: 8,
            rows: ROCK,
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'cum-exersezi-modulatia',
        heading: { ro: 'Cum o exersezi', en: 'How to practise it' },
        body: {
          ro: 'Pornește metronomul pe primul exemplu și cântă cu el: două măsuri normale, două cu trioleți. Abia când trioleții ies egali, fără să-i numeri, încearcă să-i auzi ca timpi. Greșeala tipică: trioleții se strâng spre timpul următor și devin optimi. Numără-i „unu-doi-trei” pe grila de dedesubt, nu pe ei înșiși.',
          en: 'Turn on the metronome on the first example and play along: two normal bars, two with triplets. Only once the triplets come out even without counting, try to hear them as beats. The typical slip: the triplets bunch towards the next beat and turn into eighths. Count them "one-two-three" on the grid underneath, not on themselves.',
        },
      },
      {
        id: 'alte-rapoarte',
        heading: { ro: 'Și alte rapoarte', en: 'Other ratios too' },
        body: {
          ro: 'Trioleții de pătrime dau ×1,5, dar mecanismul merge cu orice subdiviziune. Dacă **optimea cu punct** devine noul timp, tempoul crește cu o treime: 72 → 96. Dacă optimea dreaptă devine trioletul noului timp, tempoul scade cu o treime: 72 → 48. Regula: noul timp e o subdiviziune veche, iar tempoul se schimbă exact cât raportul dintre ele.',
          en: 'Quarter-note triplets give ×1.5, but the mechanism works with any subdivision. If the **dotted eighth** becomes the new beat, the tempo rises by a third: 72 → 96. If a straight eighth becomes the new beat’s triplet, the tempo drops by a third: 72 → 48. The rule: the new beat is an old subdivision, and the tempo changes exactly by the ratio between them.',
        },
      },
      {
        id: 'pulsul-ascuns',
        heading: { ro: 'Pulsul ascuns în accente', en: 'The pulse hidden in the accents' },
        body: {
          ro: 'Înainte de modulație, pulsul nou se aude deja, ascuns în accente. Aici fusul cântă șaisprezecimi accentuate din trei în trei: accentele sunt optimi cu punct. Ascultă doar accentele și o să simți un tempo mai rapid peste cel de dedesubt.',
          en: 'Before the modulation, the new pulse can already be heard, hidden in the accents. Here the hi-hat plays sixteenths accented every three: the accents are dotted eighths. Listen to the accents only and you will feel a faster tempo over the one underneath.',
        },
        example: {
          caption: {
            ro: 'Fusul pe șaisprezecimi, accentuat din trei în trei; toba mare și toba mică pe timpi.',
            en: 'Hi-hat in sixteenths, accented every three; bass drum and snare on the beats.',
          },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-av-puls-ascuns',
            // 16 pași: accente pe 0, 3, 6, 9, 12, 15, adică din trei în trei șaisprezecimi.
            stepsPerBar: 16,
            rows: { hhClosed: 'XxxXxxXxxXxxXxxX', snare: '....x.......x...', kick: 'x.......x.......' },
            tempo: SIXTEENTHS,
          }),
        },
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
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-dubla',
            stepsPerBar: 16,
            rows: { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'in-trepte',
        heading: { ro: 'În trepte, nu dintr-odată', en: 'In steps, not all at once' },
        body: {
          ro: 'Șaisprezecimile continue nu se învață direct. Întâi optimi alternate, apoi o rafală de șaisprezecimi pe primii doi timpi, apoi toată măsura. Greșeala tipică: piciorul drept sună tare, stângul abia se aude, și rafala șchiopătează. Dacă o auzi, rămâi la treapta de dinainte.',
          en: 'Continuous sixteenths are not learned head-on. First alternating eighths, then a burst of sixteenths on the first two beats, then the whole bar. The typical slip: the right foot is loud, the left barely heard, and the burst limps. If you hear it, stay on the step before.',
        },
        example: {
          caption: {
            ro: 'Optimi, apoi șaisprezecimi pe 1 și 2 și optimi pe 3 și 4, apoi șaisprezecimi pe toată măsura.',
            en: 'Eighths, then sixteenths on 1 and 2 and eighths on 3 and 4, then sixteenths for the whole bar.',
          },
          bpm: 66,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-dubla-trepte',
            // 16 pași, 4 pe timp. Măsura 2: pașii 0-7 toți, apoi 8, 10, 12, 14.
            stepsPerBar: 16,
            rows: { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.x.x.x.x.x.x.x.' },
            extraBars: [
              { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxx.x.x.x.' },
              { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
            ],
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
      {
        id: 'triolete-pe-picioare',
        heading: { ro: 'Triolete pe picioare', en: 'Triplets on the feet' },
        body: {
          ro: 'Pe triolete, picioarele nu mai pornesc mereu cu dreptul: trei lovituri pe timp înseamnă că fiecare timp începe cu alt picior. E exercițiul care repară piciorul slab, fiindcă îl pune pe „unu” la fiecare doi timpi.',
          en: 'On triplets, the feet no longer always start with the right: three strokes per beat means each beat starts with a different foot. It is the exercise that fixes the weak foot, because it puts it on the beat every other beat.',
        },
        example: {
          caption: {
            ro: 'Toba mare pe triolete, fusul pe timpi, toba mică pe 2 și 4.',
            en: 'Bass drum on triplets, hi-hat on the beats, snare on 2 and 4.',
          },
          bpm: 64,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-dubla-triolete',
            stepsPerBar: 12,
            rows: { hhClosed: 'x..x..x..x..', snare: '...x.....x..', kick: 'xxxxxxxxxxxx' },
            tempo: { min: 40, max: 120, suggested: 64 },
          }),
        },
      },
      {
        id: 'picior-slab-in-fata',
        heading: { ro: 'Piciorul slab în față', en: 'The weak foot in front' },
        body: {
          ro: 'Ca la rudimente, unde mâna slabă pornește figura, și la dublă piciorul stâng trebuie să conducă uneori. Exersează rafalele pornind cu stângul: „stâng-drept-stâng-drept”. Dacă a doua lovitură din fiecare pereche sună mai slab, pedala stângă e reglată altfel decât dreapta sau glezna stângă încă nu face toată mișcarea.',
          en: 'As with rudiments, where the weak hand leads the figure, in double bass the left foot has to lead sometimes. Practise the bursts starting with the left: "left-right-left-right". If the second stroke of every pair sounds weaker, the left pedal is set up differently from the right, or the left ankle is not yet doing the whole movement.',
        },
        example: {
          caption: {
            ro: 'Rafale de câte un timp pe 1 și 3, de pornit cu piciorul stâng. Ascultă, apoi apasă „Cânți tu”.',
            en: 'One-beat bursts on 1 and 3, to be led with the left foot. Listen, then press "You play".',
          },
          bpm: 60,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-dubla-stang',
            stepsPerBar: 16,
            rows: { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxx....xxxx....' },
            tempo: SIXTEENTHS,
          }),
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
      {
        id: 'balada',
        heading: { ro: 'Balada', en: 'The ballad' },
        body: {
          ro: 'Pe o baladă lentă, măturile țin locul întregului groove. Mătura cântă pe fiecare timp, apăsată pe 2 și 4, toba mare abia se atinge pe 1 și 3, iar fusul cu piciorul închide pe 2 și 4. Greșeala tipică: mătura lovită ca un băț. Lasă firele să cadă pe tobă, nu le arunca.',
          en: 'In a slow ballad, the brushes carry the whole groove. The brush plays every beat, leaning on 2 and 4, the bass drum is barely touched on 1 and 3, and the foot hi-hat closes on 2 and 4. The typical slip: hitting the brush like a stick. Let the wires drop onto the drum, do not throw them.',
        },
        example: {
          caption: {
            ro: 'Mătura pe pătrimi, apăsată pe 2 și 4; toba mare ușor pe 1 și 3; fusul cu piciorul pe 2 și 4.',
            en: 'Brush on quarter notes, leaning on 2 and 4; bass drum light on 1 and 3; foot hi-hat on 2 and 4.',
          },
          bpm: 60,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-av-matura-balada',
            // 8 pași, 2 pe timp: mătura pe 0, 2, 4, 6, apăsată pe 2 și 6 (timpii 2 și 4).
            stepsPerBar: 8,
            rows: { brush: 'x.X.x.X.', hhFoot: '..x...x.', kick: 'o...o...' },
            tempo: { min: 50, max: 120, suggested: 60 },
          }),
        },
      },
      {
        id: 'bossa-cu-maturi',
        heading: { ro: 'Bossa cu mături', en: 'Bossa with brushes' },
        body: {
          ro: 'Măturile nu sunt doar pentru jazz. Bossa nova cântată cu mătura pe toba mică, pe optimi, cu toba mare de bossa dedesubt, sună și mai moale decât cu bețe: e felul în care se cântă în cluburi mici.',
          en: 'Brushes are not only for jazz. Bossa nova played with a brush on the snare, in eighths, over the bossa bass drum, sounds even softer than with sticks: it is how it is played in small clubs.',
        },
        example: {
          caption: {
            ro: 'Mătura pe optimi, toba mare pe 1, „doi-și”, 3 și „patru-și”.',
            en: 'Brush in eighths, bass drum on 1, the "and" of 2, 3 and the "and" of 4.',
          },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-av-matura-bossa',
            stepsPerBar: 8,
            rows: { brush: 'xxxxxxxx', kick: 'x..xx..x' },
            tempo: { min: 50, max: 140, suggested: 80 },
          }),
        },
      },
      {
        id: 'cum-exersezi-maturile',
        heading: { ro: 'Cum exersezi mișcarea', en: 'How to practise the sweep' },
        body: {
          ro: 'Mișcarea în cerc a mâinii stângi se exersează fără set: pe o carte sau pe o foaie de hârtie pusă pe masă, care face același „șșș” ca fața tobei. Un cerc pe fiecare doi timpi, continuu, fără oprire la capăt. Abia când cercul merge singur, adaugi mâna dreaptă.',
          en: 'The left hand’s circular sweep is practised without the kit: on a book or a sheet of paper on a table, which makes the same "shhh" as the drum head. One circle every two beats, continuous, with no stop at the end. Only once the circle runs by itself do you add the right hand.',
        },
      },
    ],
  },
]
