import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 3, Anatomia groove-ului.

  Șapte lecții: cele trei roluri, ostinato-ul, subdiviziunea ca feel, drept și
  shuffle, orchestrarea, dinamica și variația. Textul e scurt dinadins: o
  secțiune spune un lucru, iar exemplul îl arată.

  CE NU SE REPETĂ din Etapa 1: cum se scriu densitățile, shuffle-ul și
  crash-ul. Acolo s-a învățat SCRISUL; aici se învață ce FACE fiecare lucru
  într-un groove. Exemplele stau pe grilă, nu pe portativ (`types.ts`,
  `showStaff`), iar desenul setului apare doar unde întrebarea e „ce piesă?".

  Coordonarea se predă pe perechi, apoi pe toate trei (`curriculum.md`, Etapa 3):
  tobă mare + tobă mică, fus + tobă mică, apoi toate.
*/

/** Optimi: capătul de sus e ce suportă exemplul, nu un număr rotund. */
const GROOVE = { min: 50, max: 140, suggested: 84 }
/** Șaisprezecimi: la 120, două lovituri vecine pe aceeași piesă cad la 125 ms. */
const SIXTEENTHS = { min: 50, max: 120, suggested: 76 }
/** Triolete: peste 120 un shuffle nu mai leagănă, aleargă. */
const TRIPLETS = { min: 50, max: 120, suggested: 80 }

/** Groove-ul de bază, pe optimi. Pornesc de la el aproape toate exemplele. */
const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }

export const grooveLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'cele-trei-roluri',
    stage: 'groove',
    title: { ro: 'Cele trei roluri', en: 'The three roles' },
    goal: {
      ro: 'Afli ce face fiecare piesă într-un groove și le pui împreună, câte două.',
      en: 'Learn what each piece does in a groove, and put them together two at a time.',
    },
    requiresRhythmLesson: 'optimea',
    sections: [
      {
        id: 'backbeat',
        heading: { ro: 'Backbeat-ul', en: 'The backbeat' },
        body: {
          ro: 'Ai bătut vreodată din palme la o piesă? Ai bătut pe 2 și 4. Ăsta e **backbeat-ul**, toba mică, rolul pe care îl recunoaște oricine.',
          en: 'Ever clapped along to a song? You clapped on 2 and 4. That is the **backbeat**, the snare, the role everyone recognises.',
        },
        example: {
          caption: { ro: 'Toba mică pe 2 și 4.', en: 'The snare on 2 and 4.' },
          bpm: 84,
          showKit: true,
          // 8 pași, 2 pe timp: pașii 2 și 6 = timpii 2 și 4.
          exercise: demoExercise({
            id: 'demo-groove-backbeat',
            stepsPerBar: 8,
            rows: { snare: ROCK.snare },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'timpul',
        heading: { ro: 'Timpul', en: 'The time' },
        body: {
          ro: '**Fusul** ține timpul: lovituri egale, de obicei pe optimi. Nu iese în față, dar fără el groove-ul se clatină.',
          en: 'The **hi-hat** keeps time: even strokes, usually eighths. It never stands out, but without it the groove wobbles.',
        },
        example: {
          caption: { ro: 'Fusul pe optimi.', en: 'The hi-hat in eighths.' },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-timpul',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'basul',
        heading: { ro: 'Basul', en: 'The bass' },
        body: {
          ro: '**Toba mare** e partea de jos și de obicei cântă împreună cu basistul. Cel mai simplu: pe 1 și 3.',
          en: 'The **bass drum** is the bottom end, and it usually plays along with the bass player. The simplest version: on 1 and 3.',
        },
        example: {
          caption: { ro: 'Toba mare pe 1 și 3.', en: 'The bass drum on 1 and 3.' },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-basul',
            stepsPerBar: 8,
            rows: { kick: ROCK.kick },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'tobe-in-pereche',
        heading: { ro: 'Întâi câte două', en: 'Two at a time first' },
        body: {
          ro: 'Corpul vrea să lovească totul odată, așa că piesele se leagă pe perechi. Prima: **toba mare cu toba mică**. Cânt-o până merge fără să te gândești.',
          en: 'Your body wants to hit everything at once, so the pieces are joined in pairs. The first: **bass drum and snare**. Play it until it runs without thinking.',
        },
        example: {
          caption: { ro: 'Toba mare pe 1 și 3, toba mică pe 2 și 4.', en: 'Bass drum on 1 and 3, snare on 2 and 4.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-groove-mare-mica',
            stepsPerBar: 8,
            rows: { snare: ROCK.snare, kick: ROCK.kick },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'fus-si-mica',
        heading: { ro: 'Fusul cu toba mică', en: 'Hi-hat and snare' },
        body: {
          ro: 'A doua pereche: fusul pe optimi, toba mică pe 2 și 4. Pe 2 și 4 lovesc ambele mâini deodată.',
          en: 'The second pair: hi-hat in eighths, snare on 2 and 4. On 2 and 4 both hands strike together.',
        },
        example: {
          caption: { ro: 'Fusul pe optimi, toba mică pe 2 și 4.', en: 'Hi-hat in eighths, snare on 2 and 4.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-groove-fus-mica',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'toate-trei',
        heading: { ro: 'Toate trei', en: 'All three' },
        body: {
          ro: 'Abia acum adaugi toba mare. Dacă fusul se oprește când intră piciorul, întoarce-te la perechi, mai încet.',
          en: 'Only now add the bass drum. If the hi-hat stops when the foot comes in, go back to the pairs, slower.',
        },
        example: {
          caption: { ro: 'Groove-ul de rock, cu toate trei rolurile.', en: 'The rock groove, with all three roles.' },
          bpm: 80,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-toate-trei',
            stepsPerBar: 8,
            rows: ROCK,
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'ostinato-ul',
    stage: 'groove',
    title: { ro: 'Ostinato-ul', en: 'The ostinato' },
    goal: {
      ro: 'Ții un flux neschimbat în timp ce restul se mișcă peste el.',
      en: 'Hold one stream steady while everything else moves around it.',
    },
    requiresRhythmLesson: 'optimea',
    sections: [
      {
        id: 'ce-e-ostinato',
        heading: { ro: 'Ce e un ostinato', en: 'What an ostinato is' },
        body: {
          ro: 'Un **ostinato** e un flux care se repetă neschimbat sub restul. De obicei e fusul. Ascultă: în a doua măsură se schimbă toba mare, fusul nu.',
          en: 'An **ostinato** is a stream that repeats unchanged under everything else. Usually it is the hi-hat. Listen: in the second bar the bass drum changes, the hi-hat does not.',
        },
        example: {
          caption: {
            ro: 'Două măsuri: toba mare se schimbă, fusul rămâne la fel.',
            en: 'Two bars: the bass drum changes, the hi-hat stays the same.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-ostinato',
            stepsPerBar: 8,
            rows: ROCK,
            // Toba mare: 1, „doi-și”, „trei-și” (pașii 0, 3, 5).
            extraBars: [{ hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..x.x..' }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Ostinato', en: 'Ostinato' },
            meaning: {
              ro: 'Un flux care se repetă neschimbat sub restul. La tobe, de obicei fusul sau ride-ul.',
              en: 'A stream that repeats unchanged under everything else. On drums, usually the hi-hat or the ride.',
            },
          },
        ],
      },
      {
        id: 'primul-care-cedeaza',
        heading: { ro: 'Primul care cedează', en: 'The first thing to give' },
        body: {
          ro: 'Ostinato-ul cere cea mai puțină atenție, deci se oprește primul când toba mare face ceva nou. Exersează invers: ține fusul și adaugă restul peste el.',
          en: 'The ostinato asks for the least attention, so it is the first thing to stop when the bass drum does something new. Practise the other way round: hold the hi-hat and add the rest on top.',
        },
        example: {
          caption: {
            ro: 'Toba mare pe contratimpi, după „unu”. Fusul nu se oprește.',
            en: 'The bass drum on the off-beats after one. The hi-hat does not stop.',
          },
          bpm: 76,
          exercise: demoExercise({
            id: 'demo-groove-ostinato-greu',
            stepsPerBar: 8,
            // Pașii 0, 3, 5, 7 = 1, „doi-și”, „trei-și”, „patru-și”.
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..x.x.x' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'ostinato-saisprezecimi',
        heading: { ro: 'Un ostinato mai des', en: 'A busier ostinato' },
        body: {
          ro: 'Ostinato-ul poate fi și pe șaisprezecimi, cu o singură mână. E mai greu de ținut: patru lovituri pe timp, iar toba mare se strecoară acum între ele, nu doar lângă ele. Regula rămâne: fusul nu se clatină, orice ar face piciorul.',
          en: 'The ostinato can also be in sixteenths, with one hand. It is harder to hold: four strokes per beat, and the bass drum now slips in between them, not only next to them. The rule stays: the hi-hat does not waver, whatever the foot does.',
        },
        example: {
          caption: {
            ro: 'Fusul pe șaisprezecimi în ambele măsuri; în a doua, toba mare cade și pe „doi-și” și „trei-și”.',
            en: 'Hi-hat in sixteenths in both bars; in the second, the bass drum also lands on the "and" of 2 and 3.',
          },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-groove-ostinato-16',
            // 16 pași. Măsura 2: toba mare 0, 6, 8, 10.
            stepsPerBar: 16,
            rows: { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...', kick: 'x.......x.......' },
            extraBars: [
              { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...', kick: 'x.....x.x.x.....' },
            ],
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'ostinato-pe-ride',
        heading: { ro: 'Ostinato-ul pe ride', en: 'The ostinato on the ride' },
        body: {
          ro: 'Ostinato-ul nu e legat de fus. Mutat pe ride, aceeași mână ține același flux, doar culoarea se schimbă: mai deschis, mai plin. Mâna ta nu trebuie să afle că s-a mutat; doar brațul.',
          en: 'The ostinato is not tied to the hi-hat. Moved to the ride, the same hand keeps the same stream, only the colour changes: more open, fuller. Your hand does not need to know it moved; only your arm does.',
        },
        example: {
          caption: {
            ro: 'Ride pe optimi; toba mare se schimbă în a doua măsură, ride-ul nu.',
            en: 'Ride in eighths; the bass drum changes in the second bar, the ride does not.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-ostinato-ride',
            stepsPerBar: 8,
            rows: { ride: 'xxxxxxxx', snare: ROCK.snare, kick: ROCK.kick },
            extraBars: [{ ride: 'xxxxxxxx', snare: ROCK.snare, kick: 'x..xx..x' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'exerseaza-ostinato',
        heading: { ro: 'Exersează: fusul întâi', en: 'Practise: the hi-hat first' },
        body: {
          ro: 'Pornește cu fusul singur, până merge fără să te gândești. Apoi adaugă toba mică pe 2 și 4. Abia apoi toba mare, câte o lovitură nouă pe măsură, ca în exemplu. Dacă fusul se oprește când intră o lovitură nouă, întoarce-te la măsura de dinainte.',
          en: 'Start with the hi-hat alone, until it runs without thinking. Then add the snare on 2 and 4. Only then the bass drum, one new stroke per bar, as in the example. If the hi-hat stops when a new stroke comes in, go back to the bar before.',
        },
        example: {
          caption: {
            ro: 'Toba mare pe 1 și 3, apoi se adaugă „doi-și”, „trei-și”, „patru-și”, câte una pe măsură. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Bass drum on 1 and 3, then the "and" of 2, 3 and 4 come in, one per bar. Listen, then press "You play".',
          },
          bpm: 72,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-groove-ostinato-trepte',
            // Toba mare: 0,4 · 0,3,4 · 0,3,4,5 · 0,3,4,5,7.
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [
              { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xx...' },
              { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xxx..' },
              { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xxx.x' },
            ],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'subdiviziunea-ca-feel',
    stage: 'groove',
    title: { ro: 'Subdiviziunea ca feel', en: 'Subdivision as feel' },
    goal: {
      ro: 'Simți pe ce grilă stă un groove, chiar și când nu se cântă fiecare pas.',
      en: 'Feel the grid a groove sits on, even when not every step is played.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'feel-de-optimi',
        heading: { ro: 'Feel de optimi', en: 'An eighth-note feel' },
        body: {
          ro: 'În groove-ul de rock tot ce se lovește cade pe un timp sau pe „și”. Grila asta, pe care o simți dedesubt, e **feel-ul** lui.',
          en: 'In the rock groove everything struck falls on a beat or an "and". That grid, the one you sense underneath, is its **feel**.',
        },
        example: {
          caption: { ro: 'Totul pe optimi.', en: 'Everything on eighths.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-feel-optimi',
            stepsPerBar: 8,
            // Toba mare: 1, „doi-și”, 3 (pașii 0, 3, 4).
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xx...' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Feel', en: 'Feel' },
            meaning: {
              ro: 'Subdiviziunea pe care stă un groove, simțită chiar dacă nu se cântă toată.',
              en: 'The subdivision a groove sits on, felt even when not all of it is played.',
            },
          },
        ],
      },
      {
        id: 'feel-de-saisprezecimi',
        heading: { ro: 'Feel de șaisprezecimi', en: 'A sixteenth-note feel' },
        body: {
          ro: 'Fusul bate tot optimi, dar toba mare cade o dată pe ultima șaisprezecime a timpului 2. O singură notă mută tot groove-ul pe șaisprezecimi.',
          en: 'The hi-hat still plays eighths, but the bass drum lands once on the last sixteenth of beat 2. One note moves the whole groove onto sixteenths.',
        },
        example: {
          caption: {
            ro: 'Fusul pe optimi, toba mare și pe „doi-a”.',
            en: 'Hi-hat in eighths, bass drum also on the "a" of 2.',
          },
          bpm: 76,
          exercise: demoExercise({
            id: 'demo-groove-feel-16',
            /*
              16 pași, 4 pe timp.
              kick 'x......x..x.....' = pașii 0, 7, 10 = 1, „doi-a”, „trei-și”
              Pasul 7 e singura șaisprezecime; pasul 10 e o optime.
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '....x.......x...',
              kick: 'x......x..x.....',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'half-time',
        heading: { ro: 'Half-time', en: 'Half-time' },
        body: {
          ro: 'Toba mică doar pe 3, nu pe 2 și 4. Tempoul e același, dar groove-ul se simte de două ori mai lent. Îl auzi des în refrenele de pop și de metal.',
          en: 'The snare only on 3, not on 2 and 4. The tempo is the same, but the groove feels twice as slow. You hear it a lot in pop and metal choruses.',
        },
        example: {
          caption: { ro: 'Fusul pe optimi, toba mare pe 1, toba mică pe 3.', en: 'Hi-hat in eighths, bass drum on 1, snare on 3.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-half-time',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: '....x...', kick: 'x.......' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Half-time', en: 'Half-time' },
            meaning: {
              ro: 'Backbeat-ul o dată pe măsură, pe 3. Același tempo, simțit de două ori mai lent.',
              en: 'The backbeat once a bar, on 3. The same tempo, felt twice as slow.',
            },
          },
        ],
      },
      {
        id: 'feel-de-triolete',
        heading: { ro: 'Feel de triolete', en: 'A triplet feel' },
        body: {
          ro: 'Aceeași tobă mare, aceeași tobă mică, dar fusul bate trei pe timp: grila de dedesubt e acum ternară. Groove-ul nu e mai rapid, se leagănă. E pasul spre shuffle, din lecția următoare.',
          en: 'The same bass drum, the same snare, but the hi-hat plays three per beat: the grid underneath is now in threes. The groove is not faster, it sways. It is the step towards the shuffle, in the next lesson.',
        },
        example: {
          caption: {
            ro: 'Fusul pe triolete, toba mare pe 1 și 3, toba mică pe 2 și 4.',
            en: 'Hi-hat on triplets, bass drum on 1 and 3, snare on 2 and 4.',
          },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-groove-feel-triolete',
            // 12 pași, 3 pe timp. Toba mică 3, 9 (timpii 2 și 4); toba mare 0, 6.
            stepsPerBar: 12,
            rows: { hhClosed: 'xxxxxxxxxxxx', snare: '...x.....x..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'numara-feel-ul',
        heading: { ro: 'Numără feel-ul cu voce tare', en: 'Count the feel out loud' },
        body: {
          ro: 'Ca să știi pe ce feel ești, spune grila cu voce tare în timp ce asculți: „unu-și” la optimi, „unu-e-și-a” la șaisprezecimi, „unu-tri-o-let” la triolete. Feel-ul e cel pe care cade fiecare lovitură fără să te împiedici. Greșeala tipică: o singură notă pe „a” într-un groove de optimi, cântată ca și cum ar fi pe „și”, adică prea devreme.',
          en: 'To know which feel you are in, say the grid out loud while you listen: "one-and" for eighths, "one-e-and-a" for sixteenths, "one-trip-let" for triplets. The feel is the one every stroke lands on without tripping. The typical slip: a single note on the "a" in an eighth-note groove, played as if it were on the "and", that is, too early.',
        },
      },
    ],
  },

  {
    id: 'drept-si-shuffle',
    stage: 'groove',
    title: { ro: 'Drept și shuffle', en: 'Straight and shuffle' },
    goal: {
      ro: 'Auzi același groove drept și legănat: alt mers, nu altă viteză.',
      en: 'Hear the same groove straight and swung: a different walk, not a different speed.',
    },
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'drept',
        heading: { ro: 'Drept', en: 'Straight' },
        body: {
          ro: 'Optimile sunt egale: „unu-și, doi-și”. Ăsta e groove-ul de bază, drept.',
          en: 'The eighths are even: "one-and, two-and". This is the basic groove, straight.',
        },
        example: {
          caption: { ro: 'Groove-ul de rock, drept.', en: 'The rock groove, straight.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-groove-drept',
            stepsPerBar: 8,
            rows: ROCK,
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'leganat',
        heading: { ro: 'Legănat', en: 'Swung' },
        body: {
          ro: 'Aceleași piese, același tempo, dar fiecare „și” vine mai târziu, pe ultima notă din triolet: **lung-scurt**. Groove-ul nu e mai rapid, merge altfel.',
          en: 'Same pieces, same tempo, but every "and" arrives later, on the last note of the triplet: **long-short**. The groove is not faster, it walks differently.',
        },
        example: {
          caption: { ro: 'Același groove, în shuffle.', en: 'The same groove, shuffled.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-groove-shuffle',
            /*
              12 pași, 3 pe timp.
              hat   'x.xx.xx.xx.x' = prima și a treia din fiecare triolet
              snare '...x.....x..' = pașii 3 și 9 = timpii 2 și 4
              kick  'x.....x.....' = pașii 0 și 6 = timpii 1 și 3
            */
            stepsPerBar: 12,
            rows: { hhClosed: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'shuffle-cu-toba-mare',
        heading: { ro: 'Shuffle cu toba mare', en: 'A shuffle with the bass drum' },
        body: {
          ro: 'Și toba mare poate intra în legănare: pe ultima notă a trioletului din timpul 2, chiar înainte de 3. Lovitura asta e cea care dă shuffle-ului de blues mersul lui: dacă o cânți pe o optime dreaptă, groove-ul se rupe în două.',
          en: 'The bass drum can join the swing too: on the last note of the triplet on beat 2, just before 3. That stroke is what gives the blues shuffle its walk: played as a straight eighth, the groove breaks in two.',
        },
        example: {
          caption: {
            ro: 'Shuffle cu toba mare pe 1, pe ultima trioletă din 2 și pe 3.',
            en: 'A shuffle with the bass drum on 1, the last triplet of 2 and on 3.',
          },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-groove-shuffle-mare',
            // 12 pași: toba mare 0, 5, 6. Mijlocul trioletelor (1, 4, 7, 10) gol.
            stepsPerBar: 12,
            rows: { hhClosed: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x....xx.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'exerseaza-shuffle',
        heading: { ro: 'Exersează cu clicul pe 2 și 4', en: 'Practise with the click on 2 and 4' },
        body: {
          ro: 'Clicul pe 2 și 4 e felul în care exersează toboșarii de jazz și de blues: el ține backbeat-ul, tu ții legănarea. Cântă peste el până când toba mică ta îl acoperă și fiecare „și” cade lung-scurt, nu egal.',
          en: 'A click on 2 and 4 is how jazz and blues drummers practise: it holds the backbeat, you hold the swing. Play over it until your snare covers it and every "and" falls long-short, not even.',
        },
        example: {
          caption: {
            ro: 'Shuffle cu clicul doar pe 2 și 4. Ascultă, apoi apasă „Cânți tu”.',
            en: 'A shuffle with the click on 2 and 4 only. Listen, then press "You play".',
          },
          bpm: 76,
          click: [[2, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-groove-shuffle-exersat',
            stepsPerBar: 12,
            rows: { hhClosed: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'ori-ori',
        heading: { ro: 'Ori drept, ori legănat', en: 'Either straight or swung' },
        body: {
          ro: 'Greșeala tipică e un shuffle pe jumătate: nici egal, nici lung-scurt. Alege unul și ține-l. Toată trupa trebuie să cânte la fel, altfel se aude ca o poticnire.',
          en: 'The usual mistake is a half-shuffle: neither even nor long-short. Pick one and keep it. The whole band has to play it the same way, or it sounds like stumbling.',
        },
      },
    ],
  },

  {
    id: 'orchestrarea',
    stage: 'groove',
    title: { ro: 'Orchestrarea', en: 'Orchestration' },
    goal: {
      ro: 'Muți același groove pe alte piese ca să schimbi culoarea, nu ritmul.',
      en: 'Move the same groove onto other pieces to change the colour, not the rhythm.',
    },
    sections: [
      {
        id: 'fus-si-ride',
        heading: { ro: 'Fusul la strofă, ride-ul la refren', en: 'Hi-hat in the verse, ride in the chorus' },
        body: {
          ro: 'Același groove, ținut pe alt cinel. Pe fus e strâns, pe ride e deschis și plin. Intrarea în refren se marchează cu un crash pe „unu”.',
          en: 'The same groove, kept on another cymbal. On the hi-hat it is tight, on the ride it is open and full. The way into the chorus is marked with a crash on beat one.',
        },
        example: {
          caption: {
            ro: 'O măsură pe fus, apoi crash pe „unu” și ride.',
            en: 'One bar on the hi-hat, then a crash on one and the ride.',
          },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-fus-ride',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [{ crash: 'x.......', ride: '.xxxxxxx', snare: ROCK.snare, kick: ROCK.kick }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Orchestrare', en: 'Orchestration' },
            meaning: {
              ro: 'Același ritm mutat pe alte piese ale setului, ca să schimbi culoarea.',
              en: 'The same rhythm moved onto other pieces of the kit to change the colour.',
            },
          },
        ],
      },
      {
        id: 'fus-deschis',
        heading: { ro: 'Fusul deschis pe „și”', en: 'Open hi-hat on the "and"' },
        body: {
          ro: 'Fusul închis pe timpi, deschis pe fiecare „și”, cu toba mare pe toți cei patru timpi. Rolurile rămân aceleași, dar groove-ul capătă suflu: e sunetul de disco. Fusul de pe „și” se mai numește **off-beat**, fiindcă sună între timpi, nu pe ei. În Groove-uri îl găsești pe patru niveluri.',
          en: 'Closed hi-hat on the beats, open on every "and", with the bass drum on all four beats. The roles stay the same, but the groove gets a lift: that is the disco sound. A hi-hat on the "and" is called an **off-beat**, because it sounds between the beats, not on them. Grooves has it in four levels.',
        },
        example: {
          caption: {
            ro: 'Fus închis pe timpi, deschis pe „și”, toba mare pe fiecare timp.',
            en: 'Hi-hat closed on the beats, open on the "and", bass drum on every beat.',
          },
          bpm: 100,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-disco',
            stepsPerBar: 8,
            rows: { hhClosed: 'x.x.x.x.', hhOpen: '.x.x.x.x', snare: ROCK.snare, kick: 'x.x.x.x.' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Off-beat', en: 'Off-beat' },
            meaning: {
              ro: 'Lovitura de pe „și”, între timpi. La disco și dance o ține fusul, deschis sau închis, peste toba mare de pe fiecare timp.',
              en: 'The stroke on the "and", between the beats. In disco and dance music the hi-hat plays it, open or closed, over a bass drum on every beat.',
            },
          },
        ],
      },
      {
        id: 'timpul-pe-cazan',
        heading: { ro: 'Timpul pe cazan', en: 'Time on the floor tom' },
        body: {
          ro: 'Rolul de timp poate trece chiar pe o tobă. Cu optimile pe cazan în loc de fus, același groove sună greu și întunecat.',
          en: 'The time-keeping role can even move onto a drum. With the eighths on the floor tom instead of the hi-hat, the same groove sounds heavy and dark.',
        },
        example: {
          caption: { ro: 'Optimile pe cazan, restul neschimbat.', en: 'The eighths on the floor tom, the rest unchanged.' },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-cazan',
            stepsPerBar: 8,
            rows: { floor: 'xxxxxxxx', snare: ROCK.snare, kick: ROCK.kick },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'clopotul',
        heading: { ro: 'Clopotul ride-ului', en: 'The ride bell' },
        body: {
          ro: 'Ride-ul are două sunete: fața, deschisă și caldă, și **clopotul** din mijloc, ascuțit, care taie prin orice. Pe pătrimi, clopotul ține timpul ca un metronom pe care îl aude toată trupa: îl găsești în refrenele tari de rock și de latin.',
          en: 'The ride has two sounds: the face, open and warm, and the **bell** in the middle, sharp, cutting through anything. On quarter notes, the bell keeps time like a metronome the whole band can hear: you find it in loud rock and Latin choruses.',
        },
        example: {
          caption: {
            ro: 'Clopotul pe pătrimi, toba mare și toba mică ca în groove-ul de rock.',
            en: 'The bell on quarter notes, bass drum and snare as in the rock groove.',
          },
          bpm: 96,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-groove-clopot',
            stepsPerBar: 8,
            rows: { rideBell: 'x.x.x.x.', snare: ROCK.snare, kick: 'x..xx...' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Clopotul ride-ului (bell)', en: 'Ride bell' },
            meaning: {
              ro: 'Cupola din mijlocul ride-ului. Lovită, sună ascuțit și se aude prin toată trupa.',
              en: 'The dome in the middle of the ride. Struck, it sounds sharp and carries through the whole band.',
            },
          },
        ],
      },
      {
        id: 'backbeat-pe-cross-stick',
        heading: { ro: 'Și backbeat-ul se orchestrează', en: 'The backbeat can be orchestrated too' },
        body: {
          ro: 'Nu doar timpul se mută. Backbeat-ul trece de pe toba mică pe cross-stick la strofa unei balade, și înapoi pe toba mică la refren. Rolul rămâne pe 2 și 4; se schimbă doar cât de tare și cât de cald sună.',
          en: 'It is not only the time that moves. The backbeat goes from the snare to the cross-stick in a ballad verse, and back to the snare in the chorus. The role stays on 2 and 4; only how loud and warm it sounds changes.',
        },
        example: {
          caption: {
            ro: 'O măsură cu cross-stick pe 2 și 4, apoi una cu toba mică.',
            en: 'One bar with cross-stick on 2 and 4, then one with the snare.',
          },
          bpm: 76,
          exercise: demoExercise({
            id: 'demo-groove-cross-backbeat',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, crossStick: '..x...x.', kick: ROCK.kick },
            extraBars: [ROCK],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'dinamica-in-groove',
    stage: 'groove',
    title: { ro: 'Dinamica în groove', en: 'Dynamics inside the groove' },
    goal: {
      ro: 'Echilibrezi piesele între ele și folosești accentele și ghost notes ca să dai viață unui groove.',
      en: 'Balance the pieces against each other and use accents and ghost notes to bring a groove to life.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'echilibrul',
        heading: { ro: 'Fusul sub toba mică', en: 'The hi-hat under the snare' },
        body: {
          ro: 'Piesele nu sună la fel de tare. Toba mică și toba mare duc, fusul stă dedesubt. Un fus prea tare acoperă backbeat-ul.',
          en: 'The pieces are not equally loud. Snare and bass drum lead, the hi-hat sits underneath. A hi-hat that is too loud covers the backbeat.',
        },
        example: {
          caption: {
            ro: 'Toba mică și toba mare accentuate, fusul normal.',
            en: 'Snare and bass drum accented, hi-hat normal.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-echilibru',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: '..X...X.', kick: 'X...X...' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'accente-pe-fus',
        heading: { ro: 'Accente pe fus', en: 'Accents on the hi-hat' },
        body: {
          ro: 'Accent pe timpi, „și”-urile mai mici. Același fus, dar pulsul iese în față și groove-ul împinge.',
          en: 'Accents on the beats, the "ands" softer. The same hi-hat, but the pulse comes forward and the groove drives.',
        },
        example: {
          caption: { ro: 'Fusul accentuat pe fiecare timp.', en: 'The hi-hat accented on every beat.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-accent-fus',
            stepsPerBar: 8,
            rows: { hhClosed: 'XxXxXxXx', snare: ROCK.snare, kick: ROCK.kick },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'ghost-in-groove',
        heading: { ro: 'Ghost notes între backbeat-uri', en: 'Ghost notes between backbeats' },
        body: {
          ro: 'Ghost notes pe toba mică umplu spațiul dintre 2 și 4 fără să-l ocupe. Fusul rămâne pe optimi, dar groove-ul se simte în șaisprezecimi: asta e funk-ul.',
          en: 'Ghost notes on the snare fill the space between 2 and 4 without taking it over. The hi-hat stays on eighths, but the groove feels like sixteenths: that is funk.',
        },
        example: {
          caption: {
            ro: 'Backbeat accentuat, ghost notes între, fusul pe optimi.',
            en: 'Accented backbeat, ghost notes in between, hi-hat in eighths.',
          },
          bpm: 76,
          exercise: demoExercise({
            id: 'demo-groove-funk',
            /*
              16 pași, 4 pe timp.
              snare '....X..o.o..X..o' = accent pe 4 și 12 (timpii 2 și 4),
                                       ghost pe 7, 9, 15
              kick  'x.......x.x.....' = 1, 3, „trei-și”
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '....X..o.o..X..o',
              kick: 'x.......x.x.....',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'tare-nu-repede',
        heading: { ro: 'Mai tare nu înseamnă mai repede', en: 'Louder does not mean faster' },
        body: {
          ro: 'Când crește volumul, tempoul tinde să fugă. Exersează același groove o dată încet și o dată tare, la același metronom, ca să le desparți.',
          en: 'When the volume goes up, the tempo tends to run. Practise the same groove once soft and once loud, against the same metronome, to keep the two apart.',
        },
      },
      {
        id: 'incet-si-tare',
        heading: { ro: 'Încearcă: încet, apoi tare', en: 'Try it: soft, then loud' },
        body: {
          ro: 'Două măsuri încet, cu fusul abia atins, două tare, cu fusul accentuat pe timpi. Clicul nu se schimbă. Dacă la măsurile tari ajungi înaintea clicului, ai grăbit: volumul ți-a tras tempoul după el.',
          en: 'Two bars soft, with the hi-hat barely touched, two loud, with the hi-hat accented on the beats. The click does not change. If you get ahead of the click in the loud bars, you rushed: the volume pulled your tempo along.',
        },
        example: {
          caption: {
            ro: 'Două măsuri încet, două tare, același tempo. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Two bars soft, two loud, the same tempo. Listen, then press "You play".',
          },
          bpm: 84,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-groove-incet-tare',
            stepsPerBar: 8,
            rows: { hhClosed: 'oooooooo', snare: '..x...x.', kick: 'x...x...' },
            extraBars: [
              { hhClosed: 'oooooooo', snare: '..x...x.', kick: 'x...x...' },
              { hhClosed: 'XxXxXxXx', snare: '..X...X.', kick: 'X...X...' },
              { hhClosed: 'XxXxXxXx', snare: '..X...X.', kick: 'X...X...' },
            ],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'variatii',
    stage: 'groove',
    title: { ro: 'Cum variezi fără să-l pierzi', en: 'Varying it without losing it' },
    goal: {
      ro: 'Schimbi un groove cât să rămână viu, fără să pierzi backbeat-ul și „unu”-l.',
      en: 'Change a groove enough to keep it alive, without losing the backbeat and beat one.',
    },
    sections: [
      {
        id: 'un-singur-lucru',
        heading: { ro: 'Schimbi un singur lucru', en: 'Change one thing' },
        body: {
          ro: 'O variație schimbă un singur rol, de obicei toba mare, și lasă restul. Backbeat-ul și „unu”-l nu se mută: pe ele se sprijină trupa.',
          en: 'A variation changes one role, usually the bass drum, and leaves the rest. The backbeat and beat one stay put: the band leans on them.',
        },
        example: {
          caption: {
            ro: 'A doua măsură schimbă doar toba mare.',
            en: 'The second bar changes only the bass drum.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-variatie',
            stepsPerBar: 8,
            rows: ROCK,
            // Toba mare: 1, „doi-și”, 3, „patru-și” (pașii 0, 3, 4, 7).
            extraBars: [{ hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..xx..x' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'capat-de-fraza',
        heading: { ro: 'Variația la capăt de frază', en: 'The variation at the end of a phrase' },
        body: {
          ro: 'Locul firesc pentru o variație e ultima măsură dintr-o frază de patru. Aici: o lovitură în plus de tobă mică și fusul deschis, care împing spre măsura următoare.',
          en: 'The natural place for a variation is the last bar of a four-bar phrase. Here: one extra snare stroke and an open hi-hat, pushing into the next bar.',
        },
        example: {
          caption: {
            ro: 'Trei măsuri de groove, a patra cu variație.',
            en: 'Three bars of groove, the fourth with a variation.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-capat-fraza',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [
              ROCK,
              ROCK,
              // Toba mică și pe „patru-și” (pasul 7), fusul deschis tot acolo.
              { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..x...xx', kick: ROCK.kick },
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'variatie-pe-toba-mica',
        heading: { ro: 'Variația pe toba mică', en: 'A snare variation' },
        body: {
          ro: 'Variația poate fi și pe toba mică: o lovitură în plus pe „patru-și”, chiar înaintea lui „unu”. Backbeat-ul de pe 2 și 4 rămâne; nota nouă doar împinge spre măsura următoare. Toba mare nu se mișcă, ca să se audă unde e schimbarea.',
          en: 'The variation can be on the snare too: one extra stroke on the "and" of 4, right before one. The backbeat on 2 and 4 stays; the new note only pushes towards the next bar. The bass drum does not move, so you can hear where the change is.',
        },
        example: {
          caption: {
            ro: 'A doua măsură adaugă toba mică pe „patru-și”.',
            en: 'The second bar adds the snare on the "and" of 4.',
          },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-groove-variatie-mica',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [{ hhClosed: ROCK.hhClosed, snare: '..x...xx', kick: ROCK.kick }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'exerseaza-trei-plus-unu',
        heading: { ro: 'Exersează: trei plus unu', en: 'Practise: three plus one' },
        body: {
          ro: 'Cea mai folosită formă: trei măsuri de groove, a patra cu variația. Numără măsurile, nu doar timpii: „unu-doi-trei-patru, doi-doi-trei-patru…”. Greșeala tipică e variația mutată pe a treia măsură, fiindcă ai pierdut numărătoarea măsurilor.',
          en: 'The most common shape: three bars of groove, the fourth with the variation. Count the bars, not only the beats: "one-two-three-four, two-two-three-four…". The typical slip is the variation drifting to the third bar, because you lost count of the bars.',
        },
        example: {
          caption: {
            ro: 'Trei măsuri de groove, a patra cu toba mare mutată și toba mică pe „patru-și”. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Three bars of groove, the fourth with the bass drum moved and the snare on the "and" of 4. Listen, then press "You play".',
          },
          bpm: 84,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-groove-trei-plus-unu',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [ROCK, ROCK, { hhClosed: ROCK.hhClosed, snare: '..x...xx', kick: 'x..xx...' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'mai-putin',
        heading: { ro: 'Mai puțin e mai mult', en: 'Less is more' },
        body: {
          ro: 'O variație la fiecare măsură nu mai e variație, e un groove nou pe care nu-l poate urma nimeni. Repetiția e cea care face variația să se audă.',
          en: 'A variation in every bar is no longer a variation, it is a new groove nobody can follow. Repetition is what makes the variation heard.',
        },
      },
    ],
  },
]
