import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 7, Muzician, nu doar toboșar.

  Cinci lecții: basistul, dinamica în aranjament, clicul, chart-ul și
  transcrierea. Etapa e mai mult despre ascultare decât despre tehnică, deci
  are mai puține exemple: clicul și chart-ul nu au ce reda, iar un exemplu
  fără rost ar fi doar decor.
*/

const GROOVE = { min: 50, max: 140, suggested: 92 }
const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }

export const musicianLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'basistul',
    stage: 'musician',
    title: { ro: 'Tu și basistul', en: 'You and the bass player' },
    goal: {
      ro: 'Legi toba mare de linia de bas.',
      en: 'Lock the bass drum to the bass line.',
    },
    sections: [
      {
        id: 'un-singur-instrument',
        heading: { ro: 'Un singur instrument', en: 'One instrument' },
        body: {
          ro: 'Toba mare și basul sună ca un singur instrument când cad împreună. Ascultă linia de bas și pune toba mare pe aceleași note: dacă el sincopează, sincopezi și tu.',
          en: 'Bass drum and bass sound like one instrument when they land together. Listen to the bass line and put the bass drum on the same notes: if it syncopates, so do you.',
        },
        example: {
          caption: {
            ro: 'Toba mare pe 1, „doi-și”, „trei-și”: cum ar cânta o linie de bas.',
            en: 'Bass drum on 1, the "and" of 2, the "and" of 3: as a bass line might go.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-muz-basist',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x..x.x..' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'mai-putin',
        heading: { ro: 'Când nu știi, cântă mai puțin', en: 'When in doubt, play less' },
        body: {
          ro: 'Dacă nu auzi ce face basul, toba mare pe 1 și 3 nu încurcă niciodată. Mai bine o notă lipsă decât una peste a lui.',
          en: 'If you cannot hear what the bass is doing, a bass drum on 1 and 3 never gets in the way. Better a missing note than one on top of his.',
        },
      },
    ],
  },

  {
    id: 'dinamica-in-aranjament',
    stage: 'musician',
    title: { ro: 'Dinamica în aranjament', en: 'Dynamics in the arrangement' },
    goal: {
      ro: 'Construiești piesa: încet unde trebuie, tare unde trebuie.',
      en: 'Build the song: soft where it should be, loud where it should be.',
    },
    sections: [
      {
        id: 'creste',
        heading: { ro: 'Piesa crește', en: 'The song grows' },
        body: {
          ro: 'Strofa e mai încet, refrenul mai tare. Toba e cea care duce trupa dintr-una în alta: mai puține note și lovituri mici, apoi accente, crash și ride.',
          en: 'The verse is softer, the chorus louder. The drums carry the band from one to the other: fewer notes and small strokes, then accents, crash and ride.',
        },
        example: {
          caption: {
            ro: 'O măsură de strofă, încet; apoi refrenul, cu accente.',
            en: 'One bar of verse, soft; then the chorus, with accents.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-muz-dinamica',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x.......' },
            extraBars: [{ crash: 'X.......', ride: '.xXxXxXx', snare: '..X...X.', kick: 'X..XX...' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'nu-prea-devreme',
        heading: { ro: 'Nu ajunge la maxim prea devreme', en: 'Do not peak too early' },
        body: {
          ro: 'Dacă primul refren e cât de tare poți, finalul n-are unde să crească. Păstrează ceva pentru ultimul refren.',
          en: 'If the first chorus is as loud as you can go, the ending has nowhere to grow. Save something for the last chorus.',
        },
      },
    ],
  },

  {
    id: 'clicul',
    stage: 'musician',
    title: { ro: 'Cântatul cu clic', en: 'Playing with a click' },
    goal: {
      ro: 'Cânți cu metronomul fără să te lupți cu el.',
      en: 'Play with the metronome without fighting it.',
    },
    sections: [
      {
        id: 'clicul-te-arata',
        heading: { ro: 'Clicul îți arată unde ești', en: 'The click shows you where you are' },
        body: {
          ro: 'Clicul nu te încurcă, îți arată unde ești. Începe cu el pe fiecare timp, apoi doar pe 2 și 4, apoi o dată pe măsură: cu cât bate mai rar, cu atât ții tu mai mult timpul.',
          en: 'The click does not throw you off, it shows you where you are. Start with it on every beat, then only on 2 and 4, then once a bar: the less it plays, the more of the time you hold.',
        },
      },
      {
        id: 'ingroapa-clicul',
        heading: { ro: 'Îngroapă clicul', en: 'Bury the click' },
        body: {
          ro: 'Când lovești exact pe clic, el dispare sub lovitura ta. Dacă îl auzi separat, ești înainte sau în urmă.',
          en: 'When you hit exactly on the click, it disappears under your stroke. If you hear it separately, you are ahead or behind.',
        },
      },
    ],
  },

  {
    id: 'chart-ul',
    stage: 'musician',
    title: { ro: 'Cum citești un chart', en: 'How to read a chart' },
    goal: {
      ro: 'Citești forma unei piese de pe un chart de tobe.',
      en: 'Read the form of a song from a drum chart.',
    },
    sections: [
      {
        id: 'chart-forma',
        heading: { ro: 'Chart-ul arată forma', en: 'A chart shows the form' },
        body: {
          ro: 'Un **chart** de tobe nu scrie fiecare notă. Arată părțile piesei, câte măsuri are fiecare și unde sunt stops și fill-uri. Barele oblice înseamnă „cântă groove-ul”.',
          en: 'A drum **chart** does not write out every note. It shows the parts of the song, how many bars each has, and where the stops and fills are. Slashes mean "play the groove".',
        },
        terms: [
          {
            term: { ro: 'Chart', en: 'Chart' },
            meaning: {
              ro: 'Partitura scurtă a unei piese: forma, măsurile și loviturile importante, nu fiecare notă.',
              en: 'The short score of a song: the form, the bars and the important hits, not every note.',
            },
          },
        ],
      },
      {
        id: 'kicks',
        heading: { ro: 'Loviturile trupei', en: 'The band hits' },
        body: {
          ro: 'Notele scrise deasupra barelor sunt loviturile întregii trupe. Le prinzi cu crash și toba mare, iar în rest ții groove-ul.',
          en: 'Notes written above the slashes are the hits the whole band plays. You catch them with crash and bass drum, and keep the groove the rest of the time.',
        },
      },
    ],
  },

  {
    id: 'transcrierea',
    stage: 'musician',
    title: { ro: 'Transcriere: cum asculți o piesă', en: 'Transcription: how to listen to a song' },
    goal: {
      ro: 'Scoți după ureche ce cântă toboșarul dintr-o piesă.',
      en: 'Work out by ear what the drummer plays on a record.',
    },
    sections: [
      {
        id: 'pe-rand',
        heading: { ro: 'O piesă o dată', en: 'One piece at a time' },
        body: {
          ro: 'Ascultă de mai multe ori, de fiecare dată după altă piesă: întâi toba mare și toba mică, apoi cinelele. Încearcă să-l scrii pe exemplul de mai jos înainte să te uiți la grilă.',
          en: 'Listen several times, following a different piece each time: first bass drum and snare, then the cymbals. Try writing down the example below before you look at the grid.',
        },
        example: {
          caption: { ro: 'Ascultă, scrie, apoi verifică pe grilă.', en: 'Listen, write it down, then check the grid.' },
          bpm: 88,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-muz-transcriere',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..x...x.', kick: 'x..xx.x.' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'incet-si-pe-timpi',
        heading: { ro: 'Încet și pe timpi', en: 'Slowly, and by the beat' },
        body: {
          ro: 'Încetinește piesa dacă poți, numără cu voce tare și scrie pe timpi, nu notă cu notă. Ce poți rosti, poți scrie.',
          en: 'Slow the song down if you can, count out loud and write by the beat, not note by note. What you can say, you can write.',
        },
      },
    ],
  },
]
