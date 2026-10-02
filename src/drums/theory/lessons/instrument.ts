import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 0, Instrumentul.

  Deocamdată o singură lecție, dinadins: PLAN-TEORIE-TOBE.md §8 A cere să vedem
  formatul pe un telefon înainte să scriem cincizeci de lecții în el. Restul
  etapei (bețele și priza, poziția, pedala, cum sună fiecare piesă pe rând) vine
  la Etapa D, când forma s-a dovedit.

  Lecția asta acoperă un gol care există azi în aplicație: un începător deschide
  „Groove-uri", vede o grilă cu șapte rânduri și trebuie să ghicească ce e un
  hi-hat. Modulele de practică PRESUPUN deja lecția asta.

  Exemplele sunt toate la tempo mic și pe pătrimi sau optimi. Nu e o simplificare
  pedagogică, e chiar subiectul: aici nu se învață niciun ritm, ci se ascultă cum
  sună o piesă. Un exemplu rapid ar muta atenția de la timbru la ritm.
*/

const SLOW = { min: 50, max: 120, suggested: 72 }

export const instrumentLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'setul-si-piesele',
    stage: 'instrument',
    title: { ro: 'Setul și piesele', en: 'The kit and its pieces' },
    goal: {
      ro: 'Afli din ce e făcut un set de tobe și recunoști fiecare piesă după cum sună.',
      en: 'Learn what a drum kit is made of, and recognise each piece by its sound.',
    },
    sections: [
      {
        id: 'ce-e-un-set',
        heading: { ro: 'Un set, nu un instrument', en: 'A kit, not an instrument' },
        // Diagrama chiar aici, în prima secțiune: tot restul lecției numește
        // piese, iar un nume fără un loc pe desen nu se reține.
        visual: 'kit',
        body: {
          ro: 'Un set de tobe e un grup de instrumente cântate de un singur om: tobe lovite cu bețele, cinele de alamă și o tobă mare cântată cu piciorul. Atinge o piesă pe desen ca s-o auzi. În aplicație le vezi mereu în aceeași ordine: cinelele sus, toba mare jos, ca pe partitură.',
          en: 'A drum kit is a group of instruments played by one person: drums struck with sticks, brass cymbals, and a bass drum played with the foot. Tap a piece on the diagram to hear it. Throughout the app they always appear in the same order: cymbals on top, bass drum at the bottom, as on written music.',
        },
        terms: [
          {
            term: { ro: 'Set (kit)', en: 'Kit' },
            meaning: {
              ro: 'Ansamblul de tobe și cinele cântat de o singură persoană.',
              en: 'The collection of drums and cymbals played by a single person.',
            },
          },
        ],
      },
      {
        id: 'toba-mare',
        heading: { ro: 'Toba mare', en: 'The bass drum' },
        body: {
          ro: 'Cea mai mare tobă și singura cântată cu piciorul, printr-o pedală. E vocea cea mai joasă a setului: pulsul pe care se așază tot restul.',
          en: 'The biggest drum, and the only one played with the foot, through a pedal. It is the lowest voice of the kit: the pulse everything else sits on.',
        },
        example: {
          caption: {
            ro: 'Patru lovituri de tobă mare, una pe fiecare timp.',
            en: 'Four bass drum strokes, one on each beat.',
          },
          bpm: 72,
          showKit: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-kick',
            stepsPerBar: 4,
            rows: { kick: 'xxxx' },
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Tobă mare (kick)', en: 'Bass drum (kick)' },
            meaning: {
              ro: 'Toba de la picior, cântată cu pedala. Vocea cea mai joasă.',
              en: 'The foot-played drum, struck with a pedal. The lowest voice.',
            },
          },
        ],
      },
      {
        id: 'toba-mica',
        heading: { ro: 'Toba mică', en: 'The snare drum' },
        body: {
          ro: 'Toba din fața ta, cea mai tare din set. Arcul de sârme de dedesubt îi dă sunetul aspru, de pocnet. În aproape toată muzica pe care o asculți, toba mică cade pe timpii 2 și 4: ăsta e **backbeat-ul**.',
          en: 'The drum right in front of you, and the loudest in the kit. The wires underneath give it its sharp crack. In nearly all the music you hear, the snare lands on beats 2 and 4: that is the **backbeat**.',
        },
        example: {
          caption: {
            ro: 'Toba mare pe 1 și 3, toba mică pe 2 și 4.',
            en: 'Bass drum on 1 and 3, snare on 2 and 4.',
          },
          bpm: 72,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-snare',
            stepsPerBar: 4,
            rows: { snare: '.x.x', kick: 'x.x.' },
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Tobă mică (snare)', en: 'Snare drum' },
            meaning: {
              ro: 'Toba din față, cu arc de sârme sub fața de jos. Cea mai tare.',
              en: 'The front drum, with a coil of wires under its bottom head. The loudest.',
            },
          },
          {
            term: { ro: 'Backbeat', en: 'Backbeat' },
            meaning: {
              ro: 'Toba mică pe timpii 2 și 4, sunetul care ține muzica populară.',
              en: 'The snare on beats 2 and 4, the sound that carries popular music.',
            },
          },
        ],
      },
      {
        id: 'hi-hat',
        heading: { ro: 'Fusul', en: 'The hi-hat' },
        body: {
          ro: 'Două cinele mici față în față, închise sau deschise dintr-o pedală. În română îi spunem **fus**, în engleză și pe partituri **hi-hat**. Închis sună scurt, deschis sună lung. Fusul ține timpul, de aceea se aude cel mai des.',
          en: 'Two small cymbals facing each other, opened and closed by a pedal. Closed it gives a short tick, open a long wash. The hi-hat keeps the time, which is why you hear it most often.',
        },
        example: {
          caption: {
            ro: 'Opt lovituri de fus închis, câte două pe fiecare timp.',
            en: 'Eight closed hi-hat strokes, two on each beat.',
          },
          bpm: 72,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-hihat',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx' },
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Fus (hi-hat)', en: 'Hi-hat' },
            meaning: {
              ro: 'Două cinele pe un stativ cu pedală. Închis: scurt. Deschis: lung.',
              en: 'Two cymbals on a pedal stand. Closed: short. Open: long.',
            },
          },
        ],
      },
      {
        id: 'tomurile',
        heading: { ro: 'Tomurile', en: 'The toms' },
        body: {
          ro: 'Tobe fără arc, din ce în ce mai joase: **tomul 1**, **tomul 2** și **cazanul** (floor tom), cel mare, pe picioare, în dreapta ta. Nu țin timpul: dau culoare, mai ales în fill-uri.',
          en: 'Drums without snares, each lower than the last: the high tom, the mid tom and the floor tom, the big one on legs to your right. They do not keep time: they add colour, mostly in fills.',
        },
        example: {
          caption: {
            ro: 'Toba mică, apoi tomul 1, tomul 2 și cazanul, de la cel mai înalt la cel mai jos.',
            en: 'The snare, then the three toms, from the highest to the lowest.',
          },
          bpm: 72,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-toms',
            stepsPerBar: 4,
            rows: { snare: 'x...', tom: '.x..', mid: '..x.', floor: '...x' },
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Tom', en: 'Tom' },
            meaning: {
              ro: 'Tobă fără arc, folosită pentru culoare și pentru fill-uri.',
              en: 'A drum without snares, used for colour and for fills.',
            },
          },
          {
            term: { ro: 'Cazan (floor tom)', en: 'Floor tom' },
            meaning: {
              ro: 'Tomul cel mai mare și mai jos, așezat pe propriile picioare.',
              en: 'The largest and lowest tom, standing on its own legs.',
            },
          },
        ],
      },
      {
        id: 'cinelele',
        heading: { ro: 'Crash și ride', en: 'Crash and ride' },
        body: {
          ro: '**Crash-ul** se lovește rar și tare, ca punctuație: începutul unui refren, capătul unui fill. **Ride-ul** se lovește des, ca fusul, dar sună mai deschis; în jazz e piesa principală.',
          en: 'The **crash** is struck rarely and hard, as punctuation: the start of a chorus, the end of a fill. The **ride** is struck often, like the hi-hat, but sounds more open; in jazz it is the main piece.',
        },
        example: {
          caption: {
            ro: 'Un crash pe „unu", apoi ride-ul ținând timpul.',
            en: 'A crash on beat one, then the ride keeping time.',
          },
          bpm: 72,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-cymbals',
            stepsPerBar: 8,
            rows: { crash: 'x.......', ride: '..xxxxxx', kick: 'x...x...' },
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Crash', en: 'Crash' },
            meaning: {
              ro: 'Cinel lovit rar și tare, ca semn de punctuație.',
              en: 'A cymbal struck rarely and hard, as punctuation.',
            },
          },
          {
            term: { ro: 'Ride', en: 'Ride' },
            meaning: {
              ro: 'Cinel lovit des, care ține timpul în locul hi-hat-ului.',
              en: 'A cymbal struck often, keeping time in place of the hi-hat.',
            },
          },
        ],
      },
      {
        id: 'toate-impreuna',
        heading: { ro: 'Toate împreună', en: 'All together' },
        body: {
          ro: 'Fusul ține timpul, toba mare stă pe 1 și 3, toba mică pe 2 și 4. Ăsta e groove-ul de rock, și aproape tot ce urmează e o variantă a acestor trei roluri.',
          en: 'The hi-hat keeps time, the bass drum sits on 1 and 3, the snare on 2 and 4. This is the rock groove, and nearly everything that follows is a variation on these three roles.',
        },
        example: {
          caption: {
            ro: 'Groove-ul de rock, cu toate cele trei roluri deodată.',
            en: 'The rock groove, with all three roles at once.',
          },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-rock',
            stepsPerBar: 8,
            /*
              Toba mică pe 2 și 4, nu pe 3.

              Prima variantă a copiat `rock-basic` din `grooves.ts`, unde toba
              mică era atunci pe 3, iar textul de deasupra spune „pe 2 și 4".
              Grila a arătat contradicția pe ecran, la 375×812, imediat ce s-a
              deschis lecția. Între timp și `rock-basic` a trecut pe 2 și 4, dar
              exemplul rămâne scris aici: o lecție nu se sprijină pe un
              exercițiu de practică care se poate schimba sub ea.
            */
            rows: {
              hhClosed: 'XxXxXxXx',
              snare: '..X...X.',
              kick: 'X...X...',
            },
            tempo: { min: 50, max: 140, suggested: 84 },
          }),
        },
      },
    ],
  },
]
