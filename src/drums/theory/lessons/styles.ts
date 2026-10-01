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
    ],
  },
]
