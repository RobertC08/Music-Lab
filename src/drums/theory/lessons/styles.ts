import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 5, Stiluri.

  Opt lecții, în ordinea din `curriculum.md`: după cât de departe cade lovitura
  de puls. Întâi optimile drepte (rock), apoi ternarul (blues), șaisprezecimile
  (funk), jazz-ul, latino, metal, afro-cuban și pop-ul modern.

  Fiecare stil are NIVELURI, câte o secțiune pe nivel: întâi groove-ul de bază,
  apoi câte un lucru în plus. Ordinea e cea în care se învață, deci nivelul 3
  presupune că nivelul 2 merge.

  Tempoul exemplelor e cel la care stilul chiar se cântă, unde se poate. Blast
  beat-ul are două niveluri, 140 și 220: sub 140 nu mai sună a blast, iar
  regula de 90 ms între loviturile aceleiași mâini ține până la 240, fiindcă
  fiecare mână lovește din două în două șaisprezecimi.

  Fusul cu piciorul (jazz), cross-stick-ul (clave, bossa) și clopotul ride-ului
  (afro-cuban) vin din DRSKit, fiindcă MuldjordKit nu le are (`lib/drums/kit.ts`).
*/

const GROOVE = { min: 50, max: 140, suggested: 92 }
const SIXTEENTHS = { min: 50, max: 120, suggested: 84 }
const TRIPLETS = { min: 50, max: 120, suggested: 80 }

export const stylesLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'stil-rock',
    stage: 'styles',
    title: { ro: 'Rock', en: 'Rock' },
    goal: {
      ro: 'Trei niveluri de rock: groove-ul de bază, toba mare care împinge, fusul pe șaisprezecimi.',
      en: 'Three levels of rock: the basic groove, the pushing bass drum, sixteenth-note hi-hat.',
    },
    sections: [
      {
        id: 'rock-1',
        heading: { ro: 'Nivelul 1 · Groove-ul de bază', en: 'Level 1 · The basic groove' },
        body: {
          ro: 'Rock-ul stă pe optimi drepte: fusul egal, toba mică apăsată pe 2 și 4, toba mare pe 1 și 3.',
          en: 'Rock sits on straight eighths: an even hi-hat, a hard snare on 2 and 4, bass drum on 1 and 3.',
        },
        example: {
          caption: { ro: 'Fus pe optimi, backbeat accentuat, toba mare pe 1 și 3.', en: 'Hi-hat in eighths, accented backbeat, bass drum on 1 and 3.' },
          bpm: 100,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-stil-rock-1',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..X...X.', kick: 'x...x...' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'rock-2',
        heading: { ro: 'Nivelul 2 · Toba mare care împinge', en: 'Level 2 · The pushing bass drum' },
        body: {
          ro: 'Toba mare pe „doi-și” și pe „patru-și” trage spre timpul următor, iar fusul se deschide pe ultima optime.',
          en: 'Bass drum on the "and" of 2 and of 4 pulls toward the next beat, and the hi-hat opens on the last eighth.',
        },
        example: {
          caption: { ro: 'Toba mare pe 1, „doi-și”, 3, „patru-și”; fus deschis la capăt.', en: 'Bass drum on 1, the "and" of 2, 3, the "and" of 4; open hi-hat at the end.' },
          bpm: 108,
          exercise: demoExercise({
            id: 'demo-stil-rock-2',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..X...X.', kick: 'x..xx..x' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'rock-3',
        heading: { ro: 'Nivelul 3 · Fusul pe șaisprezecimi', en: 'Level 3 · Sixteenth-note hi-hat' },
        body: {
          ro: 'Fusul pe șaisprezecimi, cu o mână, accentuat pe timpi, iar toba mare sincopată. Toba mică nu se mișcă de pe 2 și 4.',
          en: 'Hi-hat in sixteenths with one hand, accented on the beats, and a syncopated bass drum. The snare does not move off 2 and 4.',
        },
        example: {
          caption: { ro: 'Fus pe șaisprezecimi, toba mare pe 1, „unu-a”, 3, „trei-și”.', en: 'Sixteenth hi-hat, bass drum on 1, the "a" of 1, 3, the "and" of 3.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-stil-rock-3',
            stepsPerBar: 16,
            rows: { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '....X.......X...', kick: 'x..x....x.x.....' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'rock-4',
        heading: { ro: 'Nivelul 4 · Refrenul pe ride', en: 'Level 4 · The chorus on the ride' },
        body: {
          ro: 'La refren, rock-ul mută timpul pe ride și deschide toba mare: crash pe „unu”, ride pe optimi, toba mare pe 1, „doi-și”, 3 și „patru-și”, iar backbeat-ul trece pe **rimshot**: fața și cercul lovite deodată, ca să taie prin chitarele distorsionate.',
          en: 'In the chorus, rock moves the time to the ride and opens up the bass drum: crash on one, ride in eighths, bass drum on 1, the "and" of 2, 3 and the "and" of 4, and the backbeat moves to a **rimshot**: head and rim struck together, to cut through the distorted guitars.',
        },
        example: {
          caption: { ro: 'Crash pe „unu”, ride pe optimi, rimshot pe 2 și 4, toba mare care împinge.', en: 'Crash on one, ride in eighths, rimshot on 2 and 4, a pushing bass drum.' },
          bpm: 112,
          exercise: demoExercise({
            id: 'demo-stil-rock-4',
            // Toba mare: pașii 0, 3, 4, 7 = 1, „doi-și”, 3, „patru-și”.
            stepsPerBar: 8,
            rows: { crash: 'x.......', ride: '.xxxxxxx', rimshot: '..x...x.', kick: 'x..xx..x' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'rock-exersat',
        heading: { ro: 'Exersează rock-ul', en: 'Practise the rock' },
        body: {
          ro: 'Cântă nivelul 2 peste exemplu. Greșeala tipică: fusul deschis pe „patru-și” nu se mai închide pe „unu” și sună ca un zgomot peste toată măsura. Închide-l cu piciorul exact odată cu toba mare. În Groove-uri, rock-ul are cinci niveluri de exersat.',
          en: 'Play level 2 over the example. The typical slip: the hi-hat opened on the "and" of 4 does not close on one and washes over the whole bar. Close it with your foot exactly with the bass drum. In Grooves, rock has five levels to practise.',
        },
        example: {
          caption: {
            ro: 'Nivelul 2, cu fusul deschis la capăt. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Level 2, with the hi-hat opened at the end. Listen, then press "You play".',
          },
          bpm: 104,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-rock-exersat',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..X...X.', kick: 'x..xx..x' },
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'stil-blues-shuffle',
    stage: 'styles',
    title: { ro: 'Blues shuffle', en: 'Blues shuffle' },
    goal: {
      ro: 'Trei niveluri de blues: shuffle pe fus, shuffle greu pe ride, blues lent în 12/8.',
      en: 'Three levels of blues: shuffle on the hi-hat, heavy shuffle on the ride, slow blues in 12/8.',
    },
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'shuffle-1',
        heading: { ro: 'Nivelul 1 · Shuffle pe fus', en: 'Level 1 · Shuffle on the hi-hat' },
        body: {
          ro: 'Blues-ul stă pe shuffle: **lung-scurt** pe fiecare timp, accentul pe începutul timpului, backbeat apăsat.',
          en: 'Blues sits on the shuffle: **long-short** on every beat, accented at the start of the beat, with a heavy backbeat.',
        },
        example: {
          caption: { ro: 'Shuffle pe fus, backbeat pe 2 și 4.', en: 'Shuffle on the hi-hat, backbeat on 2 and 4.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-stil-shuffle-1',
            // 12 pași, 3 pe timp: prima și a treia din fiecare triolet.
            stepsPerBar: 12,
            rows: { hhClosed: 'X.xX.xX.xX.x', snare: '...X.....X..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'shuffle-2',
        heading: { ro: 'Nivelul 2 · Shuffle greu', en: 'Level 2 · Heavy shuffle' },
        body: {
          ro: 'Shuffle-ul trece pe ride, iar toba mare cade pe fiecare timp. Sună mai greu, ca blues-ul de club.',
          en: 'The shuffle moves to the ride and the bass drum lands on every beat. It sounds heavier, like club blues.',
        },
        example: {
          caption: { ro: 'Shuffle pe ride, toba mare pe fiecare timp.', en: 'Shuffle on the ride, bass drum on every beat.' },
          bpm: 96,
          exercise: demoExercise({
            id: 'demo-stil-shuffle-2',
            stepsPerBar: 12,
            rows: { ride: 'X.xX.xX.xX.x', snare: '...X.....X..', kick: 'x..x..x..x..' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'blues-lent',
        heading: { ro: 'Nivelul 3 · Blues lent în 12/8', en: 'Level 3 · Slow 12/8 blues' },
        body: {
          ro: 'La tempo mic se cântă toate trei notele trioletului, pe ride: se simte în **12/8**. Un ghost note chiar înaintea backbeat-ului îl face să cadă greu.',
          en: 'At slow tempos all three notes of the triplet are played, on the ride: it feels in **12/8**. A ghost note just before the backbeat makes it land heavy.',
        },
        example: {
          caption: { ro: 'Triolete pe ride, ghost note înaintea lui 2 și 4.', en: 'Triplets on the ride, a ghost note before 2 and 4.' },
          bpm: 58,
          exercise: demoExercise({
            id: 'demo-stil-blues-lent',
            stepsPerBar: 12,
            // Toba mică: ghost pe pașii 2 și 8, backbeat pe 3 și 9.
            rows: { ride: 'XxxXxxXxxXxx', snare: '..oX....oX..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'shuffle-ghost',
        heading: { ro: 'Nivelul 4 · Ghost notes în shuffle', en: 'Level 4 · Ghost notes in the shuffle' },
        body: {
          ro: 'Mâna stângă umple ultima notă a fiecărui triolet cu un ghost note pe toba mică, sub fus. Backbeat-ul rămâne tare; ghost note-urile abia se simt și fac shuffle-ul să se rostogolească.',
          en: 'The left hand fills the last note of each triplet with a ghost note on the snare, under the hi-hat. The backbeat stays loud; the ghost notes are barely felt and make the shuffle roll.',
        },
        example: {
          caption: { ro: 'Shuffle cu ghost notes pe ultima trioletă din fiecare timp.', en: 'A shuffle with ghost notes on the last triplet of every beat.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-stil-shuffle-ghost',
            // Ghost pe pașii 2, 5, 8, 11 (ultima trioletă din fiecare timp); mijlocul (1, 4, 7, 10) gol.
            stepsPerBar: 12,
            rows: { hhClosed: 'X.xX.xX.xX.x', snare: '..oX.o..oX.o', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'shuffle-exersat',
        heading: { ro: 'Exersează shuffle-ul', en: 'Practise the shuffle' },
        body: {
          ro: 'Cu clicul doar pe 2 și 4, ca un toboșar de blues. Greșeala tipică: tripletul pe jumătate, nici egal, nici lung-scurt, mai ales când crește tempoul. Dacă se întâmplă, coboară tempoul până nota scurtă cade din nou târziu.',
          en: 'With the click on 2 and 4 only, like a blues drummer. The typical slip: the half-triplet, neither even nor long-short, especially as the tempo rises. If it happens, bring the tempo down until the short note falls late again.',
        },
        example: {
          caption: {
            ro: 'Nivelul 1, clicul pe 2 și 4. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Level 1, the click on 2 and 4. Listen, then press "You play".',
          },
          bpm: 80,
          click: [[2, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-shuffle-exersat',
            stepsPerBar: 12,
            rows: { hhClosed: 'X.xX.xX.xX.x', snare: '...X.....X..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
      },
    ],
  },

  {
    id: 'stil-funk',
    stage: 'styles',
    title: { ro: 'Funk', en: 'Funk' },
    goal: {
      ro: 'Trei niveluri de funk: toba mare sincopată, ghost notes, apoi totul în jurul lui „unu”.',
      en: 'Three levels of funk: syncopated bass drum, ghost notes, then everything around the one.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'funk-1',
        heading: { ro: 'Nivelul 1 · Toba mare sincopată', en: 'Level 1 · Syncopated bass drum' },
        body: {
          ro: 'Primul pas spre funk: fusul rămâne pe optimi, dar toba mare cade pe șaisprezecimi, între timpi.',
          en: 'The first step into funk: the hi-hat stays on eighths, but the bass drum lands on sixteenths, between the beats.',
        },
        example: {
          caption: { ro: 'Fus pe optimi, toba mare pe 1, „unu-a”, 3, „trei-și”.', en: 'Hi-hat in eighths, bass drum on 1, the "a" of 1, 3, the "and" of 3.' },
          bpm: 88,
          exercise: demoExercise({
            id: 'demo-stil-funk-1',
            stepsPerBar: 16,
            rows: { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....X.......X...', kick: 'x..x....x.x.....' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'funk-2',
        heading: { ro: 'Nivelul 2 · Ghost notes', en: 'Level 2 · Ghost notes' },
        body: {
          ro: 'Fusul pe șaisprezecimi și ghost notes pe toba mică. Golurile dintre note contează cât notele.',
          en: 'Hi-hat in sixteenths and ghost notes on the snare. The gaps between the notes matter as much as the notes.',
        },
        example: {
          caption: { ro: 'Fus pe șaisprezecimi, ghost notes, toba mare sincopată.', en: 'Sixteenth hi-hat, ghost notes, syncopated bass drum.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-stil-funk-2',
            stepsPerBar: 16,
            rows: { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '..o.X..o..o.X...', kick: 'X..X....X..X..X.' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'funk-3',
        heading: { ro: 'Nivelul 3 · În jurul lui „unu”', en: 'Level 3 · Around the one' },
        body: {
          ro: 'Toată trupa apasă pe **„unu”**, restul se mișcă în jur: toba mare pe contratimpi, ghost notes și fusul deschis pe „patru-și”.',
          en: 'The whole band leans on **the one** and the rest moves around it: bass drum on the off-beats, ghost notes, and an open hi-hat on the "and" of 4.',
        },
        example: {
          caption: { ro: '„Unu” accentuat, toba mare sincopată, fus deschis la capăt.', en: 'Accented one, syncopated bass drum, open hi-hat at the end.' },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-stil-funk-3',
            stepsPerBar: 16,
            rows: {
              hhClosed: 'X.x.X.x.X.x.X...',
              hhOpen: '..............x.',
              snare: '....X..o.o..X..o',
              kick: 'X..x..x...x.....',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'funk-linear',
        heading: { ro: 'Nivelul 4 · Funk linear', en: 'Level 4 · Linear funk' },
        body: {
          ro: 'Ultimul pas: nicio piesă nu cade odată cu alta. Fusul, toba mică și toba mare își împart șaisprezecimile, una câte una. E funk-ul cel mai fluid și cel mai greu de ținut drept.',
          en: 'The last step: no two pieces land together. Hi-hat, snare and bass drum share out the sixteenths, one at a time. It is the most fluid funk and the hardest to keep steady.',
        },
        example: {
          caption: { ro: 'Un groove linear: o singură piesă pe fiecare pas.', en: 'A linear groove: a single piece on every step.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-stil-funk-linear',
            // Toba mare 0, 3, 7, 9, 14; toba mică 4, 12; fusul restul. Nicio coloană cu două lovituri.
            stepsPerBar: 16,
            rows: { hhClosed: '.xx..xx.x.xx.x.x', snare: '....X.......X...', kick: 'x..x...x.x....x.' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'funk-exersat',
        heading: { ro: 'Exersează funk-ul', en: 'Practise the funk' },
        body: {
          ro: 'Cântă nivelul 2 peste exemplu. Greșeala tipică: ghost notes prea tari, care se aud ca note și acoperă backbeat-ul. Dacă sună a rock aglomerat, nu a funk, coboară bățul aproape lipit de tobă la fiecare ghost note.',
          en: 'Play level 2 over the example. The typical slip: ghost notes that are too loud, heard as notes, covering the backbeat. If it sounds like busy rock rather than funk, bring the stick right down to the head on every ghost note.',
        },
        example: {
          caption: {
            ro: 'Nivelul 2, ghost notes și fus pe șaisprezecimi. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Level 2, ghost notes and sixteenth hi-hat. Listen, then press "You play".',
          },
          bpm: 80,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-funk-exersat',
            stepsPerBar: 16,
            rows: { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '..o.X..o..o.X...', kick: 'X..X....X..X..X.' },
            tempo: SIXTEENTHS,
          }),
        },
      },
    ],
  },

  {
    id: 'stil-jazz',
    stage: 'styles',
    title: { ro: 'Jazz: ride-ul și comping-ul', en: 'Jazz: the ride and comping' },
    goal: {
      ro: 'Trei niveluri de jazz: ride-ul singur, toba mare abia atinsă, apoi comping-ul.',
      en: 'Three levels of jazz: the ride alone, a barely-touched bass drum, then comping.',
    },
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'jazz-1',
        heading: { ro: 'Nivelul 1 · Ride-ul', en: 'Level 1 · The ride' },
        body: {
          ro: 'Începe cu ride-ul: „ding, ding-da”, apăsat pe 2 și 4, iar dedesubt fusul închis cu piciorul, tot pe 2 și 4.',
          en: 'Start with the ride: "ding, ding-da", leaning on 2 and 4, with the hi-hat closed by the foot underneath, also on 2 and 4.',
        },
        example: {
          caption: { ro: 'Ride-ul de jazz și fusul cu piciorul pe 2 și 4.', en: 'The jazz ride and the foot hi-hat on 2 and 4.' },
          bpm: 120,
          exercise: demoExercise({
            id: 'demo-stil-jazz-1',
            stepsPerBar: 12,
            rows: { ride: 'x..X.xx..X.x', hhFoot: '...x.....x..' },
            tempo: { min: 60, max: 160, suggested: 120 },
          }),
        },
      },
      {
        id: 'jazz-2',
        heading: { ro: 'Nivelul 2 · Toba mare abia atinsă', en: 'Level 2 · A barely-touched bass drum' },
        body: {
          ro: 'Adaugă toba mare foarte încet pe fiecare timp, **feathering**: se simte, nu se aude. Dacă o auzi clar, e prea tare.',
          en: 'Add the bass drum very softly on every beat, **feathering**: felt, not heard. If you hear it clearly, it is too loud.',
        },
        example: {
          caption: { ro: 'Ride-ul și toba mare ghost pe fiecare timp.', en: 'The ride and a ghosted bass drum on every beat.' },
          bpm: 120,
          exercise: demoExercise({
            id: 'demo-stil-jazz-2',
            stepsPerBar: 12,
            rows: { ride: 'x..X.xx..X.x', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
            tempo: { min: 60, max: 160, suggested: 120 },
          }),
        },
        terms: [
          {
            term: { ro: 'Feathering', en: 'Feathering' },
            meaning: {
              ro: 'Toba mare cântată foarte încet pe fiecare timp, ca să se simtă, nu să se audă.',
              en: 'The bass drum played very softly on every beat, to be felt rather than heard.',
            },
          },
        ],
      },
      {
        id: 'jazz-3',
        heading: { ro: 'Nivelul 3 · Comping-ul', en: 'Level 3 · Comping' },
        body: {
          ro: 'Toba mică răspunde rar și încet, pe „a”-ul dinaintea timpilor: asta e **comping-ul**. Ride-ul nu se schimbă deloc.',
          en: 'The snare answers sparsely and softly, on the "a" before the beats: that is **comping**. The ride does not change at all.',
        },
        example: {
          caption: { ro: 'Ride, feathering și toba mică pe „doi-a” și „patru-a”.', en: 'Ride, feathering and snare on the "a" of 2 and of 4.' },
          bpm: 132,
          exercise: demoExercise({
            id: 'demo-stil-jazz-3',
            stepsPerBar: 12,
            rows: {
              ride: 'x..X.xx..X.x',
              hhFoot: '...x.....x..',
              snare: '.....o.....o',
              kick: 'o..o..o..o..',
            },
            tempo: { min: 60, max: 160, suggested: 132 },
          }),
        },
        terms: [
          {
            term: { ro: 'Comping', en: 'Comping' },
            meaning: {
              ro: 'Loviturile rare de tobă mică și tobă mare care răspund muzicii, sub ride.',
              en: 'The sparse snare and bass drum strokes that answer the music, under the ride.',
            },
          },
        ],
      },
      {
        id: 'jazz-maturi',
        heading: { ro: 'Nivelul 4 · Balada cu mături', en: 'Level 4 · The brush ballad' },
        body: {
          ro: 'La baladă, bețele se schimbă pe mături. Ritmul de ride se cântă cu mătura pe toba mică, fusul cu piciorul rămâne pe 2 și 4, iar toba mare abia se atinge.',
          en: 'In a ballad the sticks give way to brushes. The ride pattern is played with a brush on the snare, the foot hi-hat stays on 2 and 4, and the bass drum is barely touched.',
        },
        example: {
          caption: { ro: 'Ritmul de ride pe mătură, fusul cu piciorul pe 2 și 4.', en: 'The ride pattern on a brush, the foot hi-hat on 2 and 4.' },
          bpm: 72,
          exercise: demoExercise({
            id: 'demo-stil-jazz-maturi',
            stepsPerBar: 12,
            rows: { brush: 'x..X.xx..X.x', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
            tempo: { min: 50, max: 140, suggested: 72 },
          }),
        },
      },
      {
        id: 'jazz-exersat',
        heading: { ro: 'Exersează ride-ul', en: 'Practise the ride' },
        body: {
          ro: 'Cu clicul pe 2 și 4, cântă doar ride-ul și fusul cu piciorul. Greșeala tipică: ride-ul ajunge drept, „ding, ding-ding” pe optimi egale, mai ales la tempo mare. Nota scurtă trebuie să cadă târziu, chiar înaintea timpului următor.',
          en: 'With the click on 2 and 4, play only the ride and the foot hi-hat. The typical slip: the ride goes straight, "ding, ding-ding" on even eighths, especially at speed. The short note has to land late, right before the next beat.',
        },
        example: {
          caption: {
            ro: 'Ride-ul și fusul cu piciorul, clicul pe 2 și 4. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Ride and foot hi-hat, the click on 2 and 4. Listen, then press "You play".',
          },
          bpm: 112,
          click: [[2, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-jazz-exersat',
            stepsPerBar: 12,
            rows: { ride: 'x..X.xx..X.x', hhFoot: '...x.....x..' },
            tempo: { min: 60, max: 160, suggested: 112 },
          }),
        },
      },
    ],
  },

  {
    id: 'stil-latin',
    stage: 'styles',
    title: { ro: 'Bossa, samba, clave', en: 'Bossa, samba, clave' },
    goal: {
      ro: 'Trei niveluri latino: clave-ul singur, bossa nova peste el, apoi samba.',
      en: 'Three Latin levels: the clave alone, bossa nova on top of it, then samba.',
    },
    sections: [
      {
        id: 'clave',
        heading: { ro: 'Nivelul 1 · Clave-ul', en: 'Level 1 · The clave' },
        body: {
          ro: '**Clave-ul** e scheletul muzicii latino: cinci lovituri pe două măsuri, trei într-una, două în cealaltă. Pe set se cântă cross-stick.',
          en: 'The **clave** is the backbone of Latin music: five strokes over two bars, three in one, two in the other. On the kit it is played as a cross-stick.',
        },
        example: {
          caption: { ro: 'Clave 3-2: 1, „doi-și”, 4, apoi 2 și 3.', en: 'A 3-2 clave: 1, the "and" of 2, 4, then 2 and 3.' },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-stil-clave',
            stepsPerBar: 8,
            rows: { crossStick: 'x..x..x.' },
            extraBars: [{ crossStick: '..x.x...' }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Clave', en: 'Clave' },
            meaning: {
              ro: 'Tiparul de cinci lovituri pe două măsuri pe care se sprijină muzica latino.',
              en: 'The five-stroke, two-bar pattern Latin music rests on.',
            },
          },
        ],
      },
      {
        id: 'bossa',
        heading: { ro: 'Nivelul 2 · Bossa nova', en: 'Level 2 · Bossa nova' },
        body: {
          ro: 'Bossa nova e încetă și moale: fusul pe optimi, toba mare pe 1, „doi-și”, 3 și „patru-și”, cross-stick pe clave.',
          en: 'Bossa nova is soft and gentle: hi-hat in eighths, bass drum on 1, the "and" of 2, 3 and the "and" of 4, cross-stick on the clave.',
        },
        example: {
          caption: { ro: 'Bossa nova pe două măsuri.', en: 'Bossa nova over two bars.' },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-stil-bossa',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', crossStick: 'x..x..x.', kick: 'x..xx..x' },
            extraBars: [{ hhClosed: 'xxxxxxxx', crossStick: '..x.x...', kick: 'x..xx..x' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'samba',
        heading: { ro: 'Nivelul 3 · Samba', en: 'Level 3 · Samba' },
        body: {
          ro: 'Samba e rapidă și joasă: toba mare pe fiecare timp, cu o notă scurtă chiar înainte, „ba-bum”, ca toba de bas din Brazilia.',
          en: 'Samba is fast and low: the bass drum on every beat with a short note just before it, "ba-boom", like the Brazilian bass drum.',
        },
        example: {
          caption: { ro: 'Toba mare pe fiecare timp și pe „a” dinaintea lui.', en: 'Bass drum on every beat and on the "a" before it.' },
          bpm: 100,
          exercise: demoExercise({
            id: 'demo-stil-samba',
            // 16 pași: toba mare pe 0, 3, 4, 7, 8, 11, 12, 15 = timpii și „a”-urile.
            stepsPerBar: 16,
            rows: { hhClosed: 'x.x.x.x.x.x.x.x.', kick: 'x..xx..xx..xx..x' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'clave-2-3',
        heading: { ro: 'Nivelul 4 · Clave-ul întors: 2-3', en: 'Level 4 · The clave turned round: 2-3' },
        body: {
          ro: 'Clave-ul are o direcție: **3-2** (trei lovituri, apoi două) sau **2-3**. Melodia piesei o alege, iar toboșarul n-o schimbă la mijloc. Ascultă aceleași cinci lovituri, cu măsurile inversate.',
          en: 'The clave has a direction: **3-2** (three strokes, then two) or **2-3**. The song’s melody chooses it, and the drummer does not switch it halfway. Listen to the same five strokes with the bars swapped.',
        },
        example: {
          caption: { ro: 'Clave 2-3: două lovituri în prima măsură, trei în a doua.', en: '2-3 clave: two strokes in the first bar, three in the second.' },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-stil-clave-2-3',
            stepsPerBar: 8,
            rows: { crossStick: '..x.x...' },
            extraBars: [{ crossStick: 'x..x..x.' }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Direcția clave-ului (3-2, 2-3)', en: 'Clave direction (3-2, 2-3)' },
            meaning: {
              ro: 'Ordinea celor două măsuri ale clave-ului. O alege piesa și nu se schimbă pe parcurs.',
              en: 'The order of the clave’s two bars. The song chooses it and it does not change along the way.',
            },
          },
        ],
      },
      {
        id: 'latin-exersat',
        heading: { ro: 'Exersează bossa', en: 'Practise the bossa' },
        body: {
          ro: 'Cântă bossa peste exemplu. Greșeala tipică: toba mare prea tare, ca la rock. Bossa e moale: toba mare se simte ca o bătaie de inimă, iar cross-stick-ul ține clave-ul fără să iasă în față.',
          en: 'Play the bossa over the example. The typical slip: a bass drum that is too loud, as in rock. Bossa is soft: the bass drum is felt like a heartbeat, and the cross-stick keeps the clave without stepping forward.',
        },
        example: {
          caption: {
            ro: 'Bossa nova pe două măsuri. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Bossa nova over two bars. Listen, then press "You play".',
          },
          bpm: 84,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-latin-exersat',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', crossStick: 'x..x..x.', kick: 'x..xx..x' },
            extraBars: [{ hhClosed: 'xxxxxxxx', crossStick: '..x.x...', kick: 'x..xx..x' }],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'stil-metal',
    stage: 'styles',
    title: { ro: 'Metal: dublă și blast', en: 'Metal: double bass and blast' },
    goal: {
      ro: 'Cinci niveluri de metal, de la optimi grele până la blast beat la tempo real.',
      en: 'Five levels of metal, from heavy eighths to a blast beat at real tempo.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'metal-1',
        heading: { ro: 'Nivelul 1 · Optimi grele', en: 'Level 1 · Heavy eighths' },
        body: {
          ro: 'Metalul începe cu toba mare pe toate optimile, crash pe timpi și backbeat. Un singur picior ajunge aici.',
          en: 'Metal starts with the bass drum on every eighth, crash on the beats and a backbeat. One foot is enough here.',
        },
        example: {
          caption: { ro: 'Toba mare pe optimi, crash pe timpi.', en: 'Bass drum in eighths, crash on the beats.' },
          bpm: 120,
          exercise: demoExercise({
            id: 'demo-stil-metal-1',
            stepsPerBar: 8,
            rows: { crash: 'x.x.x.x.', snare: '..x...x.', kick: 'xxxxxxxx' },
            tempo: { min: 60, max: 180, suggested: 120 },
          }),
        },
      },
      {
        id: 'galop',
        heading: { ro: 'Nivelul 2 · Galopul', en: 'Level 2 · The gallop' },
        body: {
          ro: '**Galopul**: o optime și două șaisprezecimi pe fiecare timp, pe toba mare dublă. E ritmul cel mai cunoscut din metal.',
          en: 'The **gallop**: one eighth and two sixteenths on every beat, on double bass. It is the best-known rhythm in metal.',
        },
        example: {
          caption: { ro: 'Galop pe toba mare, crash pe timpi, backbeat.', en: 'Gallop on the bass drum, crash on the beats, backbeat.' },
          bpm: 120,
          exercise: demoExercise({
            id: 'demo-stil-galop',
            stepsPerBar: 16,
            rows: { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.xxx.xxx.xxx.xx' },
            tempo: { min: 60, max: 180, suggested: 120 },
          }),
        },
      },
      {
        id: 'metal-3',
        heading: { ro: 'Nivelul 3 · Dublă continuă', en: 'Level 3 · Continuous double bass' },
        body: {
          ro: 'Toba mare pe toate șaisprezecimile, picioarele alternând, sub un backbeat lent. Viteza vine din gleznă, nu din picior.',
          en: 'The bass drum on every sixteenth, feet alternating, under a slow backbeat. The speed comes from the ankle, not the leg.',
        },
        example: {
          caption: { ro: 'Șaisprezecimi pe toba mare, crash pe timpi.', en: 'Sixteenths on the bass drum, crash on the beats.' },
          bpm: 150,
          exercise: demoExercise({
            id: 'demo-stil-metal-3',
            stepsPerBar: 16,
            rows: { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
            tempo: { min: 60, max: 200, suggested: 150 },
          }),
        },
      },
      {
        id: 'blast-140',
        heading: { ro: 'Nivelul 4 · Blast beat, de exersat', en: 'Level 4 · Blast beat, for practice' },
        body: {
          ro: 'În **blast beat** toba mare și ride-ul cad împreună pe o șaisprezecime, toba mică pe următoarea. La 140 încă auzi alternanța; de aici urci.',
          en: 'In a **blast beat** the bass drum and ride land together on one sixteenth, the snare on the next. At 140 you can still hear the alternation; climb from here.',
        },
        example: {
          caption: { ro: 'Blast beat la 140.', en: 'Blast beat at 140.' },
          bpm: 140,
          exercise: demoExercise({
            id: 'demo-stil-blast-140',
            /*
              16 pași. Toba mare și ride-ul pe pașii pari, toba mică pe cei
              impari: fiecare mână lovește din două în două șaisprezecimi, deci
              la 240 cad la 125 ms una de alta, peste cele 90 cerute.
            */
            stepsPerBar: 16,
            rows: {
              ride: 'x.x.x.x.x.x.x.x.',
              snare: '.x.x.x.x.x.x.x.x',
              kick: 'x.x.x.x.x.x.x.x.',
            },
            tempo: { min: 100, max: 240, suggested: 140 },
          }),
        },
        terms: [
          {
            term: { ro: 'Blast beat', en: 'Blast beat' },
            meaning: {
              ro: 'Tobă mare și tobă mică alternând pe șaisprezecimi foarte rapide, cu cinelul odată cu toba mare.',
              en: 'Bass drum and snare alternating on very fast sixteenths, with the cymbal on the bass drum notes.',
            },
          },
        ],
      },
      {
        id: 'blast-220',
        heading: { ro: 'Nivelul 5 · Blast beat la tempo', en: 'Level 5 · Blast beat at tempo' },
        body: {
          ro: 'Același blast, la 220: așa sună în piese. Nu se mai aud lovituri separate, ci un zid. Urcă spre el treptat, cu metronomul pornit.',
          en: 'The same blast at 220: this is how it sounds on records. You no longer hear separate strokes, just a wall. Work up to it gradually, with the metronome on.',
        },
        example: {
          caption: { ro: 'Blast beat la 220.', en: 'Blast beat at 220.' },
          bpm: 220,
          exercise: demoExercise({
            id: 'demo-stil-blast-220',
            stepsPerBar: 16,
            rows: {
              ride: 'x.x.x.x.x.x.x.x.',
              snare: '.x.x.x.x.x.x.x.x',
              kick: 'x.x.x.x.x.x.x.x.',
            },
            tempo: { min: 100, max: 240, suggested: 220 },
          }),
        },
      },
    ],
  },

  {
    id: 'stil-afro-cuban',
    stage: 'styles',
    title: { ro: 'Afro-cuban', en: 'Afro-Cuban' },
    goal: {
      ro: 'Trei niveluri: clopotul în 12/8 singur, peste toba mare, apoi cu toba mică.',
      en: 'Three levels: the 12/8 bell alone, over the bass drum, then with the snare.',
    },
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'clopot-1',
        heading: { ro: 'Nivelul 1 · Clopotul', en: 'Level 1 · The bell' },
        body: {
          ro: 'Muzica afro-cubană stă pe trei: un tipar de clopot de șapte lovituri în 12/8, pe set cântat pe clopotul ride-ului. Învață-l singur, până îl cânți din memorie.',
          en: 'Afro-Cuban music sits on three: a seven-stroke bell pattern in 12/8, played on the kit on the ride bell. Learn it alone, until you can play it from memory.',
        },
        example: {
          caption: { ro: 'Tiparul de clopot, singur.', en: 'The bell pattern, alone.' },
          bpm: 80,
          exercise: demoExercise({
            id: 'demo-stil-clopot-1',
            // 12 pași, 3 pe timp. Clopotul pe 0, 2, 4, 5, 7, 9, 11.
            stepsPerBar: 12,
            rows: { rideBell: 'x.x.xx.x.x.x' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'clopot-2',
        heading: { ro: 'Nivelul 2 · Peste toba mare', en: 'Level 2 · Over the bass drum' },
        body: {
          ro: 'Adaugă toba mare pe fiecare timp. Clopotul nu se schimbă, dar acum îl simți peste un puls în patru.',
          en: 'Add the bass drum on every beat. The bell does not change, but now you feel it over a pulse in four.',
        },
        example: {
          caption: { ro: 'Clopotul ride-ului, toba mare pe fiecare timp.', en: 'The ride bell, bass drum on every beat.' },
          bpm: 84,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-stil-clopot-2',
            stepsPerBar: 12,
            rows: { rideBell: 'x.x.xx.x.x.x', kick: 'x..x..x..x..' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'clopot-3',
        heading: { ro: 'Nivelul 3 · Cu toba mică', en: 'Level 3 · With the snare' },
        body: {
          ro: 'Toba mică pe 2 și 4, peste clopot și toba mare. Trei membre fac trei lucruri diferite: e independența din etapa Avansat.',
          en: 'The snare on 2 and 4, over the bell and the bass drum. Three limbs doing three different things: the independence of the Advanced stage.',
        },
        example: {
          caption: { ro: 'Clopot, toba mare pe timpi, toba mică pe 2 și 4.', en: 'Bell, bass drum on the beats, snare on 2 and 4.' },
          bpm: 88,
          exercise: demoExercise({
            id: 'demo-stil-clopot-3',
            stepsPerBar: 12,
            rows: { rideBell: 'x.x.xx.x.x.x', snare: '...x.....x..', kick: 'x..x..x..x..' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'clopot-4',
        heading: { ro: 'Nivelul 4 · Și fusul cu piciorul', en: 'Level 4 · And the foot hi-hat' },
        body: {
          ro: 'Al patrulea membru: fusul cu piciorul stâng pe 2 și 4. Acum fiecare membru face altceva, iar clopotul rămâne același de la nivelul 1. Dacă clopotul se schimbă când intră piciorul, întoarce-te un nivel.',
          en: 'The fourth limb: the foot hi-hat on 2 and 4 with the left foot. Now every limb does something different, and the bell is the same as at level 1. If the bell changes when the foot comes in, go back a level.',
        },
        example: {
          caption: { ro: 'Clopot, toba mare pe timpi, toba mică și fusul cu piciorul pe 2 și 4.', en: 'Bell, bass drum on the beats, snare and foot hi-hat on 2 and 4.' },
          bpm: 84,
          exercise: demoExercise({
            id: 'demo-stil-clopot-4',
            stepsPerBar: 12,
            rows: { rideBell: 'x.x.xx.x.x.x', snare: '...x.....x..', kick: 'x..x..x..x..', hhFoot: '...x.....x..' },
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'clopot-talanga',
        heading: { ro: 'Nivelul 5 · Clopotul pe talangă', en: 'Level 5 · The bell on the cowbell' },
        body: {
          ro: 'Tiparul de clopot nu stă doar pe ride. În muzica afro-cubană se cântă de obicei pe **talangă** (cowbell), un clopot de metal prins pe set: sună mai sec și mai tăios decât clopotul ride-ului. Același tipar de șapte lovituri, același loc în măsură, doar alt metal.',
          en: 'The bell pattern does not live only on the ride. In Afro-Cuban music it is usually played on a **cowbell**, a metal bell mounted on the kit: drier and sharper than the ride bell. The same seven-stroke pattern, the same place in the bar, just a different metal.',
        },
        example: {
          caption: {
            ro: 'Tiparul de clopot pe talangă, cu toba mare pe timpi și toba mică pe 2 și 4.',
            en: 'The bell pattern on the cowbell, with bass drum on the beats and snare on 2 and 4.',
          },
          bpm: 84,
          showKit: false,
          exercise: demoExercise({
            id: 'demo-stil-talanga',
            stepsPerBar: 12,
            rows: { cowbell: 'x.x.xx.x.x.x', snare: '...x.....x..', kick: 'x..x..x..x..' },
            tempo: TRIPLETS,
          }),
        },
        terms: [
          {
            term: { ro: 'Talangă (cowbell)', en: 'Cowbell' },
            meaning: {
              ro: 'Un clopot de metal prins pe set. Ține tiparul de clopot în latin și afro-cuban.',
              en: 'A metal bell mounted on the kit. It carries the bell pattern in Latin and Afro-Cuban music.',
            },
          },
        ],
      },
      {
        id: 'afro-exersat',
        heading: { ro: 'Exersează clopotul', en: 'Practise the bell' },
        body: {
          ro: 'Cântă nivelul 3 peste exemplu. Greșeala tipică: clopotul se adaptează pe nesimțite la toba mică și pierde o lovitură, fiindcă două mâini vor să cadă deodată. Spune tiparul clopotului cu voce tare în timp ce cânți.',
          en: 'Play level 3 over the example. The typical slip: the bell quietly adapts to the snare and drops a stroke, because two hands want to land together. Say the bell pattern out loud while you play.',
        },
        example: {
          caption: {
            ro: 'Nivelul 3: clopot, toba mare, toba mică. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Level 3: bell, bass drum, snare. Listen, then press "You play".',
          },
          bpm: 80,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-afro-exersat',
            stepsPerBar: 12,
            rows: { rideBell: 'x.x.xx.x.x.x', snare: '...x.....x..', kick: 'x..x..x..x..' },
            tempo: TRIPLETS,
          }),
        },
      },
    ],
  },

  {
    id: 'stil-pop',
    stage: 'styles',
    title: { ro: 'Pop modern și half-time', en: 'Modern pop and half-time' },
    goal: {
      ro: 'Trei niveluri de pop: four on the floor, toba mare în 3-3-2, half-time.',
      en: 'Three levels of pop: four on the floor, a 3-3-2 bass drum, half-time.',
    },
    sections: [
      {
        id: 'pop-1',
        heading: { ro: 'Nivelul 1 · Four on the floor', en: 'Level 1 · Four on the floor' },
        body: {
          ro: 'Pop-ul de dans pune toba mare pe fiecare timp: **four on the floor**. Simplu, dar nu se clatină deloc, și pe asta se dansează.',
          en: 'Dance pop puts the bass drum on every beat: **four on the floor**. Simple, but it never wavers, and that is what people dance to.',
        },
        example: {
          caption: { ro: 'Toba mare pe fiecare timp, backbeat, fus pe optimi.', en: 'Bass drum on every beat, backbeat, hi-hat in eighths.' },
          bpm: 120,
          exercise: demoExercise({
            id: 'demo-stil-pop-1',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x.x.x.x.' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Four on the floor', en: 'Four on the floor' },
            meaning: { ro: 'Toba mare pe toți cei patru timpi.', en: 'The bass drum on all four beats.' },
          },
        ],
      },
      {
        id: 'pop-2',
        heading: { ro: 'Nivelul 2 · Toba mare în 3-3-2', en: 'Level 2 · A 3-3-2 bass drum' },
        body: {
          ro: 'Toba mare pe 1, „doi-și” și 4: trei optimi, trei, apoi două. E mersul de bază din pop-ul de azi.',
          en: 'Bass drum on 1, the "and" of 2 and 4: three eighths, three, then two. It is the basic walk of today’s pop.',
        },
        example: {
          caption: { ro: 'Toba mare pe 1, „doi-și”, 4.', en: 'Bass drum on 1, the "and" of 2, 4.' },
          bpm: 100,
          exercise: demoExercise({
            id: 'demo-stil-pop-2',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x..x.' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'pop-3',
        heading: { ro: 'Nivelul 3 · Half-time modern', en: 'Level 3 · Modern half-time' },
        body: {
          ro: 'Toba mică doar pe 3, fusul pe șaisprezecimi deasupra. Piesa pare lentă, dar fusul o ține vie: așa sună mult pop și hip-hop de azi.',
          en: 'Snare only on 3, sixteenth hi-hat on top. The song feels slow, but the hi-hat keeps it alive: that is how a lot of today’s pop and hip-hop sounds.',
        },
        example: {
          caption: { ro: 'Toba mică pe 3, fus pe șaisprezecimi.', en: 'Snare on 3, hi-hat in sixteenths.' },
          bpm: 76,
          exercise: demoExercise({
            id: 'demo-stil-half-time',
            stepsPerBar: 16,
            rows: { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '........X.......', kick: 'x......x..x.....' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'pop-4',
        heading: { ro: 'Nivelul 4 · Fusul în rafale', en: 'Level 4 · Hi-hat bursts' },
        body: {
          ro: 'Peste half-time, fusul nu mai merge egal: optimi, apoi o rafală scurtă de șaisprezecimi la capătul măsurii. E semnătura hip-hop-ului și a pop-ului de azi: groove-ul rămâne lent, rafala îl face să tresară.',
          en: 'Over the half-time, the hi-hat is no longer even: eighths, then a short burst of sixteenths at the end of the bar. It is the signature of today’s hip-hop and pop: the groove stays slow, the burst makes it twitch.',
        },
        example: {
          caption: { ro: 'Half-time, fusul pe optimi cu o rafală pe timpul 4.', en: 'Half-time, the hi-hat in eighths with a burst on beat 4.' },
          bpm: 76,
          exercise: demoExercise({
            id: 'demo-stil-pop-4',
            // Fusul pe optimi (pași pari), apoi toată șaisprezecimea pe timpul 4 (12-15). Toba mică doar pe 8.
            stepsPerBar: 16,
            rows: { hhClosed: 'x.x.x.x.x.x.xxxx', snare: '........X.......', kick: 'x......x..x.....' },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'pop-exersat',
        heading: { ro: 'Exersează four on the floor', en: 'Practise four on the floor' },
        body: {
          ro: 'Cântă four on the floor peste exemplu, cu clicul pe fiecare timp. Greșeala tipică: toba mare se clatină pe 2 și 4, unde cade odată cu toba mică, fiindcă piciorul așteaptă mâna. Toba mare trebuie să sune identic pe toți patru timpii.',
          en: 'Play four on the floor over the example, with the click on every beat. The typical slip: the bass drum wobbles on 2 and 4, where it lands with the snare, because the foot waits for the hand. The bass drum has to sound identical on all four beats.',
        },
        example: {
          caption: {
            ro: 'Four on the floor, clicul pe fiecare timp. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Four on the floor, the click on every beat. Listen, then press "You play".',
          },
          bpm: 116,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-stil-pop-exersat',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x.x.x.x.' },
            tempo: GROOVE,
          }),
        },
      },
    ],
  },
]
