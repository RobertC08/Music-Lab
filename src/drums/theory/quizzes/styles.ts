import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard } from './helpers'

/*
  Etapa 5, Stiluri.

  Întrebarea pe care o pune un toboșar adevărat la un stil e „ce aud?”, deci
  multe întrebări sunt de recunoscut după ureche: ce stil, ce nivel, ce face
  toba mare. Recapitularea are o întrebare pe fiecare stil, după sunet.
*/

const ROCK2 = { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..x...x.', kick: 'x..xx..x' }
const SHUFFLE = { hhClosed: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' }
const FUNK2 = { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '..o.x..o..o.x...', kick: 'x..x....x..x..x.' }
const JAZZ = { ride: 'x..x.xx..x.x', hhFoot: '...x.....x..' }
const BELL = 'x.x.xx.x.x.x'

export const stylesQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-stil-rock',
    stage: 'styles',
    lessonId: 'stil-rock',
    questions: [
      listenChoice(
        'ce-face-mare',
        L('Ascultă. Ce face toba mare?', 'Listen. What is the bass drum doing?'),
        bar('q-sty-r-push', 8, ROCK2, { bpm: 108 }),
        opts(
          ['Doar pe 1 și 3', 'Only on 1 and 3'],
          ['Pe fiecare timp', 'On every beat'],
          ['Împinge pe „doi-și” și „patru-și”', 'It pushes on the "and" of 2 and 4'],
          ['Lipsește', 'It is missing'],
        ),
        2,
        L(
          'Împinge: loviturile de pe „doi-și” și „patru-și” trag spre timpul următor. E nivelul 2.',
          'It pushes: the strokes on the "and" of 2 and 4 pull towards the next beat. That is level 2.',
        ),
      ),
      markHeard(
        'marcheaza-mare',
        L('Marchează toba mare. Restul e scris.', 'Mark the bass drum. The rest is written in.'),
        bar('q-sty-r-mark', 8, ROCK2, { bpm: 96 }),
        ['hhOpen', 'hhClosed', 'snare', 'kick'],
        ['hhOpen', 'hhClosed', 'snare'],
        L(
          'Pe 1, pe „doi-și”, pe 3 și pe „patru-și”.',
          'On 1, the "and" of 2, on 3 and the "and" of 4.',
        ),
      ),
      choice(
        'ce-nu-se-misca',
        L(
          'La nivelul 3, fusul trece pe șaisprezecimi și toba mare se sincopează. Ce nu se mișcă?',
          'At level 3 the hi-hat moves to sixteenths and the bass drum syncopates. What does not move?',
        ),
        opts(
          ['Toba mică de pe 2 și 4', 'The snare on 2 and 4'],
          ['Fusul', 'The hi-hat'],
          ['Toba mare', 'The bass drum'],
          ['Nimic nu rămâne', 'Nothing stays'],
        ),
        0,
        L(
          'Backbeat-ul. În rock, el e ancora, oricât s-ar complica restul.',
          'The backbeat. In rock it is the anchor, however busy the rest gets.',
        ),
      ),
      pickHeard(
        'nivelul-3',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar(
          'q-sty-r-l3',
          16,
          { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '....x.......x...', kick: 'x..x....x.x.....' },
          { bpm: 84 },
        ),
        [
          bar(
            'q-sty-r-l3-a',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x..x....x.x.....' },
            { bpm: 84 },
          ),
          bar(
            'q-sty-r-l3-b',
            16,
            { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 84 },
          ),
          bar(
            'q-sty-r-l3-c',
            16,
            { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '....x.......x...', kick: 'x..x....x.x.....' },
            { bpm: 84 },
          ),
        ],
        2,
        L(
          'Fus pe șaisprezecimi, accentuat pe timpi, și toba mare pe 1, „unu-a”, 3, „trei-și”. A are fusul pe optimi, B toba mare doar pe 1 și 3.',
          'Hi-hat in sixteenths, accented on the beats, and bass drum on 1, the "a" of 1, 3 and the "and" of 3. A has the hi-hat in eighths, B the bass drum only on 1 and 3.',
        ),
      ),
      choice(
        'fus-deschis',
        L(
          'Fusul deschis pe „patru-și” sună ca un zgomot peste toată măsura următoare. De ce?',
          'The hi-hat opened on the "and" of 4 washes over the whole next bar. Why?',
        ),
        opts(
          ['E prea tare', 'It is too loud'],
          ['Nu se închide cu piciorul pe „unu”', 'It is not closed with the foot on one'],
          ['E deschis prea puțin', 'It is opened too little'],
          ['Toba mare e prea încet', 'The bass drum is too quiet'],
        ),
        1,
        L(
          'Nu se închide pe „unu”. Piciorul îl închide exact odată cu toba mare.',
          'It does not close on one. The foot closes it exactly with the bass drum.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-blues-shuffle',
    stage: 'styles',
    lessonId: 'stil-blues-shuffle',
    questions: [
      listenChoice(
        'pe-ce-piesa',
        L(
          'Ascultă shuffle-ul greu. Pe ce cinel e?',
          'Listen to the heavy shuffle. Which cymbal is it on?',
        ),
        bar(
          'q-sty-b-heavy',
          12,
          { ride: 'X.xX.xX.xX.x', snare: '...X.....X..', kick: 'x..x..x..x..' },
          { bpm: 96 },
        ),
        opts(
          ['Fusul', 'Hi-hat'],
          ['Crash', 'Crash'],
          ['Ride', 'Ride'],
          ['Clopotul ride-ului', 'Ride bell'],
        ),
        2,
        L(
          'Pe ride, cu toba mare pe fiecare timp: sună mai greu, ca blues-ul de club.',
          'On the ride, with the bass drum on every beat: heavier, like club blues.',
        ),
      ),
      choice(
        'doisprezece-opt',
        L('Ce se schimbă la blues-ul lent „în 12/8”?', 'What changes in the slow "12/8" blues?'),
        opts(
          ['Se cântă toate trei notele trioletului', 'All three triplet notes are played'],
          ['Măsura are 12 timpi lenți', 'The bar has 12 slow beats'],
          ['Toba mică trece pe 1 și 3', 'The snare moves to 1 and 3'],
          ['Se cântă drept', 'It is played straight'],
        ),
        0,
        L(
          'Toate trei notele trioletului, pe ride: patru grupuri de trei, deci 12/8.',
          'All three triplet notes, on the ride: four groups of three, hence 12/8.',
        ),
      ),
      markHeard(
        'mare-pe-timpi',
        L(
          'Marchează toba mare din shuffle-ul greu. Ride-ul și toba mică sunt scrise.',
          'Mark the bass drum in the heavy shuffle. Ride and snare are written in.',
        ),
        bar(
          'q-sty-b-mark',
          12,
          { ride: 'X.xX.xX.xX.x', snare: '...X.....X..', kick: 'x..x..x..x..' },
          { bpm: 88 },
        ),
        ['ride', 'snare', 'kick'],
        ['ride', 'snare'],
        L(
          'Pe fiecare timp, primul pătrat din fiecare grup de trei.',
          'On every beat, the first square of each group of three.',
        ),
      ),
      pickHeard(
        'shuffle-sau-12-8',
        L('Ascultă ride-ul. Care grilă e?', 'Listen to the ride. Which grid is it?'),
        bar(
          'q-sty-b-128',
          12,
          { ride: 'xxxxxxxxxxxx', snare: '..oX....oX..', kick: 'x.....x.....' },
          { bpm: 58 },
        ),
        [
          bar(
            'q-sty-b-128-a',
            12,
            { ride: 'x.xx.xx.xx.x', snare: '..oX....oX..', kick: 'x.....x.....' },
            { bpm: 58 },
          ),
          bar(
            'q-sty-b-128-b',
            12,
            { ride: 'xxxxxxxxxxxx', snare: '..oX....oX..', kick: 'x.....x.....' },
            { bpm: 58 },
          ),
          bar(
            'q-sty-b-128-c',
            8,
            { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
            { bpm: 58 },
          ),
        ],
        1,
        L(
          'Triolete pline pe ride: blues-ul lent în 12/8. A e shuffle (fără mijloc), C optimi drepte.',
          'Full triplets on the ride: slow 12/8 blues. A is a shuffle (no middle), C straight eighths.',
        ),
      ),
      choice(
        'clic-2-4',
        L(
          'De ce exersează toboșarii de blues cu clicul doar pe 2 și 4?',
          'Why do blues drummers practise with the click on 2 and 4 only?',
        ),
        opts(
          ['Ca să meargă mai repede', 'To go faster'],
          ['Fiindcă metronomul nu poate mai mult', 'Because the metronome cannot do more'],
          [
            'Clicul ține backbeat-ul, ei țin legănarea',
            'The click holds the backbeat, they hold the swing',
          ],
          ['Ca să nu-l audă', 'So they do not hear it'],
        ),
        2,
        L(
          'Clicul ține backbeat-ul; restul timpilor și legănarea sunt ale tale.',
          'The click holds the backbeat; the other beats and the swing are yours.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-funk',
    stage: 'styles',
    lessonId: 'stil-funk',
    questions: [
      choice(
        'primul-pas',
        L('Care e primul pas spre funk?', 'What is the first step towards funk?'),
        opts(
          ['Fusul pe triolete', 'Hi-hat on triplets'],
          ['Toba mică pe 1 și 3', 'Snare on 1 and 3'],
          ['Crash pe fiecare timp', 'Crash on every beat'],
          [
            'Fusul rămâne pe optimi, toba mare trece pe șaisprezecimi',
            'The hi-hat stays in eighths, the bass drum moves to sixteenths',
          ],
        ),
        3,
        L(
          'Toba mare sincopată pe șaisprezecimi, sub un fus încă pe optimi.',
          'A syncopated sixteenth-note bass drum, under a hi-hat still in eighths.',
        ),
      ),
      listenChoice(
        'unu',
        L(
          'Ascultă. Pe ce timp apasă toată trupa?',
          'Listen. Which beat does the whole band lean on?',
        ),
        bar(
          'q-sty-f-one',
          16,
          {
            hhClosed: 'X.x.X.x.X.x.X...',
            hhOpen: '..............x.',
            snare: '....X..o.o..X..o',
            kick: 'X..x..x...x.....',
          },
          { bpm: 92 },
        ),
        opts(['„Unu”', 'One'], ['Doi', 'Two'], ['„Trei-și”', 'The "and" of 3'], ['Patru', 'Four']),
        0,
        L(
          '„Unu”: accentuat de fus și de toba mare. Restul se mișcă în jurul lui.',
          'One: accented by the hi-hat and the bass drum. The rest moves around it.',
        ),
      ),
      markHeard(
        'mare-sincopata',
        L(
          'Marchează toba mare pe grila de șaisprezecimi. Fusul și toba mică sunt scrise.',
          'Mark the bass drum on the sixteenth grid. Hi-hat and snare are written in.',
        ),
        bar(
          'q-sty-f-mark',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x..x....x.x.....' },
          { bpm: 80 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, „unu-a”, 3 și „trei-și”: nota de pe „unu-a” cade între două lovituri de fus.',
          'On 1, the "a" of 1, 3 and the "and" of 3: the note on the "a" of 1 falls between two hi-hat strokes.',
        ),
      ),
      pickHeard(
        'ghost-funk',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar('q-sty-f-ghost', 16, FUNK2, { bpm: 84 }),
        [
          bar('q-sty-f-ghost-a', 16, { ...FUNK2, snare: '....x.......x...' }, { bpm: 84 }),
          bar('q-sty-f-ghost-b', 16, FUNK2, { bpm: 84 }),
          bar('q-sty-f-ghost-c', 16, { ...FUNK2, kick: 'x.......x.......' }, { bpm: 84 }),
        ],
        1,
        L(
          'Ghost notes între backbeat-uri și toba mare sincopată. A n-are ghost notes, C are toba mare dreaptă.',
          'Ghost notes between the backbeats and a syncopated bass drum. A has no ghost notes, C a straight bass drum.',
        ),
      ),
      choice(
        'linear',
        L('Ce înseamnă funk linear?', 'What does linear funk mean?'),
        opts(
          ['Totul pe o singură tobă', 'Everything on one drum'],
          ['Nicio piesă nu cade odată cu alta', 'No two pieces land together'],
          ['Fusul cântă linie continuă', 'The hi-hat plays a continuous line'],
          ['Fără toba mare', 'No bass drum'],
        ),
        1,
        L(
          'Câte o singură piesă pe pas: fus, tobă mică și tobă mare își împart șaisprezecimile.',
          'One piece per step: hi-hat, snare and bass drum share out the sixteenths.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-jazz',
    stage: 'styles',
    lessonId: 'stil-jazz',
    questions: [
      choice(
        'feathering',
        L('Ce e feathering-ul?', 'What is feathering?'),
        opts(
          [
            'Toba mare foarte încet pe fiecare timp: se simte, nu se aude',
            'The bass drum very softly on every beat: felt, not heard',
          ],
          ['Ride-ul lovit cu vârful bățului', 'The ride struck with the stick tip'],
          ['Un roll pe toba mică', 'A roll on the snare'],
          ['Mătura plimbată în cerc', 'The brush swept in circles'],
        ),
        0,
        L(
          'Toba mare abia atinsă pe fiecare timp. Dacă o auzi clar, e prea tare.',
          'The bass drum barely touched on every beat. If you hear it clearly, it is too loud.',
        ),
      ),
      listenChoice(
        'unde-apasa',
        L(
          'Ascultă ride-ul. Pe ce timpi apasă?',
          'Listen to the ride. Which beats does it lean on?',
        ),
        bar('q-sty-j-lean', 12, { ride: 'x..X.xx..X.x', hhFoot: '...x.....x..' }, { bpm: 112 }),
        opts(
          ['Pe 1 și 3', 'On 1 and 3'],
          ['Pe 2 și 4', 'On 2 and 4'],
          ['Pe toți', 'On all four'],
          ['Pe niciunul', 'On none'],
        ),
        1,
        L(
          'Pe 2 și 4, odată cu fusul de la picior. În jazz, greutatea e pe backbeat.',
          'On 2 and 4, together with the foot hi-hat. In jazz, the weight is on the backbeat.',
        ),
      ),
      markHeard(
        'fus-picior',
        L(
          'Marchează fusul cu piciorul. Ride-ul e scris.',
          'Mark the foot hi-hat. The ride is written in.',
        ),
        bar('q-sty-j-foot', 12, JAZZ, { bpm: 104 }),
        ['ride', 'hhFoot'],
        ['ride'],
        L(
          'Pe 2 și 4: primul pătrat din grupurile 2 și 4.',
          'On 2 and 4: the first square of groups 2 and 4.',
        ),
      ),
      choice(
        'comping',
        L('Ce e comping-ul?', 'What is comping?'),
        opts(
          ['Un solo de tobe', 'A drum solo'],
          ['Ride-ul pe triolete pline', 'The ride on full triplets'],
          [
            'Lovituri rare de tobă mică și tobă mare care răspund muzicii',
            'Sparse snare and bass drum strokes answering the music',
          ],
          ['Fusul deschis pe 2 și 4', 'The hi-hat open on 2 and 4'],
        ),
        2,
        L(
          'Răspunsuri rare și încete, sub ride. Ride-ul nu se schimbă deloc.',
          'Sparse, soft answers, under the ride. The ride does not change at all.',
        ),
      ),
      pickHeard(
        'unde-comping',
        L('Ascultă toba mică. Care grilă e?', 'Listen to the snare. Which grid is it?'),
        bar('q-sty-j-comp', 12, { ...JAZZ, snare: '.....x.....x' }, { bpm: 104 }),
        [
          bar('q-sty-j-comp-a', 12, { ...JAZZ, snare: '...x.....x..' }, { bpm: 104 }),
          bar('q-sty-j-comp-b', 12, { ...JAZZ, snare: 'x.....x.....' }, { bpm: 104 }),
          bar('q-sty-j-comp-c', 12, { ...JAZZ, snare: '.....x.....x' }, { bpm: 104 }),
        ],
        2,
        L(
          'Pe „a”-ul dinaintea lui 3 și dinaintea lui „unu”: răspunsuri care împing spre timpul următor.',
          'On the "a" before 3 and before one: answers that push towards the next beat.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-latin',
    stage: 'styles',
    lessonId: 'stil-latin',
    questions: [
      choice(
        'clave',
        L('Ce e clave-ul?', 'What is the clave?'),
        opts(
          ['Un instrument de alamă', 'A brass instrument'],
          [
            'Cinci lovituri pe două măsuri, scheletul muzicii latino',
            'Five strokes over two bars, the skeleton of Latin music',
          ],
          ['Un roll pe tomuri', 'A tom roll'],
          ['Toba mare pe fiecare timp', 'The bass drum on every beat'],
        ),
        1,
        L(
          'Cinci lovituri pe două măsuri: trei într-una, două în cealaltă.',
          'Five strokes over two bars: three in one, two in the other.',
        ),
      ),
      listenChoice(
        'directia',
        L('Ascultă clave-ul. Ce direcție are?', 'Listen to the clave. Which direction is it?'),
        bar(
          'q-sty-l-23',
          8,
          { crossStick: '..x.x...' },
          { bpm: 92, extraBars: [{ crossStick: 'x..x..x.' }] },
        ),
        opts(
          ['3-2: trei, apoi două', '3-2: three, then two'],
          ['2-3: două, apoi trei', '2-3: two, then three'],
        ),
        1,
        L(
          '2-3: două lovituri în prima măsură, trei în a doua.',
          '2-3: two strokes in the first bar, three in the second.',
        ),
      ),
      markHeard(
        'partea-de-trei',
        L(
          'Marchează măsura cu trei lovituri a clave-ului.',
          'Mark the three-stroke bar of the clave.',
        ),
        bar('q-sty-l-three', 8, { crossStick: 'x..x..x.' }, { bpm: 88 }),
        ['crossStick'],
        [],
        L(
          'Pe 1, pe „doi-și” și pe 4: trei-trei-două optimi.',
          'On 1, on the "and" of 2 and on 4: three, three, then two eighths.',
        ),
      ),
      pickHeard(
        'bossa',
        L('Ascultă bossa. Care grilă e?', 'Listen to the bossa. Which grid is it?'),
        bar(
          'q-sty-l-bossa',
          8,
          { hhClosed: 'xxxxxxxx', crossStick: 'x..x..x.', kick: 'x..xx..x' },
          { bpm: 84 },
        ),
        [
          bar(
            'q-sty-l-bossa-a',
            8,
            { hhClosed: 'xxxxxxxx', crossStick: 'x..x..x.', kick: 'x..xx..x' },
            { bpm: 84 },
          ),
          bar(
            'q-sty-l-bossa-b',
            8,
            { hhClosed: 'xxxxxxxx', crossStick: '..x...x.', kick: 'x..xx..x' },
            { bpm: 84 },
          ),
          bar(
            'q-sty-l-bossa-c',
            8,
            { hhClosed: 'xxxxxxxx', crossStick: 'x..x..x.', kick: 'x...x...' },
            { bpm: 84 },
          ),
        ],
        0,
        L(
          'Cross-stick pe partea de trei a clave-ului și toba mare pe 1, „doi-și”, 3, „patru-și”. B are cross-stick-ul de baladă, pe 2 și 4; C toba mare de rock.',
          'Cross-stick on the three side of the clave and bass drum on 1, the "and" of 2, 3 and the "and" of 4. B has the ballad cross-stick, on 2 and 4; C a rock bass drum.',
        ),
      ),
      choice(
        'samba',
        L('Ce face toba mare la samba?', 'What does the bass drum do in samba?'),
        opts(
          ['Lipsește', 'It is missing'],
          ['Cade doar pe „unu”', 'It lands only on one'],
          [
            'Pe fiecare timp, cu o notă scurtă chiar înainte: „ba-bum”',
            'On every beat, with a short note just before: "ba-boom"',
          ],
          ['Pe triolete', 'On triplets'],
        ),
        2,
        L(
          '„Ba-bum” pe fiecare timp, ca toba de bas a școlilor de samba din Brazilia.',
          '"Ba-boom" on every beat, like the bass drum of Brazilian samba schools.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-metal',
    stage: 'styles',
    lessonId: 'stil-metal',
    questions: [
      choice(
        'galop',
        L('Ce e galopul?', 'What is the gallop?'),
        opts(
          [
            'O optime și două șaisprezecimi pe fiecare timp',
            'One eighth and two sixteenths on every beat',
          ],
          ['Șaisprezecimi continue', 'Continuous sixteenths'],
          ['Toba mare pe triolete', 'Bass drum on triplets'],
          ['Crash pe fiecare optime', 'Crash on every eighth'],
        ),
        0,
        L(
          'Lung, scurt-scurt, pe fiecare timp: „ta, ta-ta”.',
          'Long, short-short, on every beat: "da, da-da".',
        ),
      ),
      markHeard(
        'marcheaza-galop',
        L(
          'Marchează toba mare. Crash-ul și toba mică sunt scrise.',
          'Mark the bass drum. Crash and snare are written in.',
        ),
        bar(
          'q-sty-m-gallop',
          16,
          { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.xxx.xxx.xxx.xx' },
          { bpm: 96 },
        ),
        ['crash', 'snare', 'kick'],
        ['crash', 'snare'],
        L(
          'Pe fiecare timp: primul, al treilea și al patrulea pătrat. Al doilea rămâne gol.',
          'On every beat: the first, third and fourth squares. The second stays empty.',
        ),
      ),
      listenChoice(
        'blast',
        L('Ascultă. Ce e?', 'Listen. What is it?'),
        bar(
          'q-sty-m-blast',
          16,
          { ride: 'x.x.x.x.x.x.x.x.', snare: '.x.x.x.x.x.x.x.x', kick: 'x.x.x.x.x.x.x.x.' },
          { bpm: 140 },
        ),
        opts(
          ['Optimi grele', 'Heavy eighths'],
          ['Galop', 'Gallop'],
          ['Dublă continuă', 'Continuous double bass'],
          ['Blast beat', 'Blast beat'],
        ),
        3,
        L(
          'Blast beat: toba mare și ride-ul pe o șaisprezecime, toba mică pe următoarea, fără oprire.',
          'Blast beat: bass drum and ride on one sixteenth, snare on the next, non-stop.',
        ),
      ),
      choice(
        'viteza-dubla',
        L(
          'La dublă continuă, de unde vine viteza?',
          'In continuous double bass, where does the speed come from?',
        ),
        opts(
          ['Din tot piciorul', 'The whole leg'],
          ['Din șold', 'The hip'],
          ['Din gleznă', 'The ankle'],
          ['Din forță', 'Force'],
        ),
        2,
        L(
          'Din gleznă, cu călcâiul sus. Piciorul întreg obosește în câteva măsuri.',
          'From the ankle, heel up. The whole leg tires within a few bars.',
        ),
      ),
      pickHeard(
        'ce-nivel',
        L('Ascultă toba mare. Care grilă e?', 'Listen to the bass drum. Which grid is it?'),
        bar(
          'q-sty-m-dbl',
          16,
          { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
          { bpm: 120 },
        ),
        [
          bar(
            'q-sty-m-dbl-a',
            16,
            { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.x.x.x.x.x.x.x.' },
            { bpm: 120 },
          ),
          bar(
            'q-sty-m-dbl-b',
            16,
            { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.xxx.xxx.xxx.xx' },
            { bpm: 120 },
          ),
          bar(
            'q-sty-m-dbl-c',
            16,
            { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
            { bpm: 120 },
          ),
        ],
        2,
        L(
          'Toate șaisprezecimile: dublă continuă. A sunt optimi, B galop.',
          'Every sixteenth: continuous double bass. A is eighths, B the gallop.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-afro-cuban',
    stage: 'styles',
    lessonId: 'stil-afro-cuban',
    questions: [
      choice(
        'pe-trei',
        L(
          'Pe ce se sprijină muzica afro-cubană din lecție?',
          'What does the Afro-Cuban music in the lesson rest on?',
        ),
        opts(
          ['Pe optimi drepte', 'Straight eighths'],
          ['Pe trei: un tipar în 12/8', 'Threes: a pattern in 12/8'],
          ['Pe șaisprezecimi', 'Sixteenths'],
          ['Pe pătrimi', 'Quarters'],
        ),
        1,
        L(
          'Pe trei: tiparul de clopot e în 12/8, patru grupuri de trei.',
          'On threes: the bell pattern is in 12/8, four groups of three.',
        ),
      ),
      listenChoice(
        'cate-lovituri',
        L(
          'Câte lovituri are tiparul de clopot într-o măsură?',
          'How many strokes does the bell pattern have in one bar?',
        ),
        bar('q-sty-a-count', 12, { rideBell: BELL }, { bpm: 76 }),
        opts(['Cinci', 'Five'], ['Șase', 'Six'], ['Șapte', 'Seven'], ['Opt', 'Eight']),
        2,
        L(
          'Șapte, pe douăsprezece pulsuri. Se învață singur, până îl cânți din memorie.',
          'Seven, over twelve pulses. Learn it alone, until you can play it from memory.',
        ),
      ),
      markHeard(
        'clopotul',
        L('Marchează tiparul de clopot.', 'Mark the bell pattern.'),
        bar('q-sty-a-mark', 12, { rideBell: BELL, kick: 'x..x..x..x..' }, { bpm: 72 }),
        ['rideBell', 'kick'],
        ['kick'],
        L(
          'Pașii 1, 3, 5, 6, 8, 10, 12 din cei 12: lung, lung, scurt, lung, lung, lung, scurt. Toba mare pe timpi te ajută să-l așezi.',
          'Steps 1, 3, 5, 6, 8, 10, 12 out of 12: long, long, short, long, long, long, short. The bass drum on the beats helps you place it.',
        ),
      ),
      choice(
        'greseala-clopot',
        L(
          'Când adaugi toba mică, clopotul pierde o lovitură. De ce?',
          'When you add the snare, the bell drops a stroke. Why?',
        ),
        opts(
          [
            'Clopotul se adaptează pe nesimțite la toba mică',
            'The bell quietly adapts to the snare',
          ],
          ['Toba mică e prea tare', 'The snare is too loud'],
          ['Tempoul e prea mic', 'The tempo is too slow'],
          ['Tiparul e greșit', 'The pattern is wrong'],
        ),
        0,
        L(
          'Două mâini vor să cadă deodată, iar cea care cedează e clopotul. Spune tiparul cu voce tare.',
          'Two hands want to land together, and the one that gives is the bell. Say the pattern out loud.',
        ),
      ),
      pickHeard(
        'nivelul-3',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar(
          'q-sty-a-l3',
          12,
          { rideBell: BELL, snare: '...x.....x..', kick: 'x..x..x..x..' },
          { bpm: 84 },
        ),
        [
          bar('q-sty-a-l3-a', 12, { rideBell: BELL, kick: 'x..x..x..x..' }, { bpm: 84 }),
          bar(
            'q-sty-a-l3-b',
            12,
            { rideBell: BELL, snare: '...x.....x..', kick: 'x..x..x..x..' },
            { bpm: 84 },
          ),
          bar(
            'q-sty-a-l3-c',
            12,
            { rideBell: 'x..x..x..x..', snare: '...x.....x..', kick: 'x..x..x..x..' },
            { bpm: 84 },
          ),
        ],
        1,
        L(
          'Clopotul de șapte lovituri, toba mare pe timpi, toba mică pe 2 și 4. A n-are toba mică, C a pierdut tiparul clopotului.',
          'The seven-stroke bell, bass drum on the beats, snare on 2 and 4. A has no snare, C has lost the bell pattern.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stil-pop',
    stage: 'styles',
    lessonId: 'stil-pop',
    questions: [
      choice(
        'four-floor',
        L('Ce înseamnă „four on the floor”?', 'What does "four on the floor" mean?'),
        opts(
          ['Patru crash-uri pe măsură', 'Four crashes a bar'],
          ['Patru tomuri', 'Four toms'],
          ['Toba mare pe fiecare timp', 'Bass drum on every beat'],
          ['Toba mică pe toți timpii', 'Snare on every beat'],
        ),
        2,
        L(
          'Toba mare pe toți patru timpii, fără să se clatine: pe ea se dansează.',
          'Bass drum on all four beats, without wobbling: people dance to it.',
        ),
      ),
      markHeard(
        'trei-trei-doi',
        L(
          'Marchează toba mare. Fusul și toba mică sunt scrise.',
          'Mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-sty-p-332',
          8,
          { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x..x.' },
          { bpm: 96 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, „doi-și” și 4: trei optimi, trei, apoi două. Mersul 3-3-2.',
          'On 1, the "and" of 2 and 4: three eighths, three, then two. The 3-3-2 walk.',
        ),
      ),
      listenChoice(
        'half-time',
        L('Ascultă. Pe ce timp cade toba mică?', 'Listen. Which beat does the snare land on?'),
        bar(
          'q-sty-p-half',
          16,
          { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '........x.......', kick: 'x......x..x.....' },
          { bpm: 76 },
        ),
        opts(['Pe 2 și 4', 'On 2 and 4'], ['Pe 1', 'On 1'], ['Pe 4', 'On 4'], ['Pe 3', 'On 3']),
        3,
        L(
          'Doar pe 3: half-time. Fusul pe șaisprezecimi ține piesa vie deasupra.',
          'Only on 3: half-time. The sixteenth hi-hat keeps the song alive on top.',
        ),
      ),
      pickHeard(
        'rafala',
        L('Ascultă fusul. Care grilă e?', 'Listen to the hi-hat. Which grid is it?'),
        bar(
          'q-sty-p-burst',
          16,
          { hhClosed: 'x.x.x.x.x.x.xxxx', snare: '........x.......', kick: 'x......x..x.....' },
          { bpm: 76 },
        ),
        [
          bar(
            'q-sty-p-burst-a',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '........x.......', kick: 'x......x..x.....' },
            { bpm: 76 },
          ),
          bar(
            'q-sty-p-burst-b',
            16,
            { hhClosed: 'xxxxx.x.x.x.x.x.', snare: '........x.......', kick: 'x......x..x.....' },
            { bpm: 76 },
          ),
          bar(
            'q-sty-p-burst-c',
            16,
            { hhClosed: 'x.x.x.x.x.x.xxxx', snare: '........x.......', kick: 'x......x..x.....' },
            { bpm: 76 },
          ),
        ],
        2,
        L(
          'Optimi, apoi rafala de șaisprezecimi pe ultimul timp. A n-are rafală, B o are la început.',
          'Eighths, then the sixteenth burst on the last beat. A has no burst, B has it at the start.',
        ),
      ),
      choice(
        'pop-mare-se-clatina',
        L(
          'La four on the floor, toba mare sună mai încet pe 2 și 4. De ce?',
          'In four on the floor, the bass drum sounds quieter on 2 and 4. Why?',
        ),
        opts(
          ['Piciorul așteaptă mâna de pe toba mică', 'The foot waits for the hand on the snare'],
          ['Așa se cântă', 'That is how it is played'],
          ['Toba mică e prea încet', 'The snare is too quiet'],
          ['Tempoul e prea mare', 'The tempo is too high'],
        ),
        0,
        L(
          'Piciorul se leagă de mână și slăbește acolo unde cade odată cu ea. Toba mare trebuie să sune identic pe toți patru.',
          'The foot ties itself to the hand and weakens where they land together. The bass drum has to sound the same on all four.',
        ),
      ),
    ],
  },

  {
    id: 'review-styles',
    stage: 'styles',
    questions: [
      listenChoice(
        'r-stil-1',
        L('Ce stil e?', 'Which style is it?'),
        bar('q-sty-rv-shuffle', 12, SHUFFLE, { bpm: 84 }),
        opts(
          ['Rock', 'Rock'],
          ['Funk', 'Funk'],
          ['Blues shuffle', 'Blues shuffle'],
          ['Bossa nova', 'Bossa nova'],
        ),
        2,
        L(
          'Blues shuffle: lung-scurt pe fiecare timp, backbeat apăsat.',
          'Blues shuffle: long-short on every beat, a heavy backbeat.',
        ),
      ),
      listenChoice(
        'r-stil-2',
        L('Și acesta?', 'And this one?'),
        bar('q-sty-rv-funk', 16, FUNK2, { bpm: 88 }),
        opts(
          ['Funk', 'Funk'],
          ['Metal', 'Metal'],
          ['Jazz', 'Jazz'],
          ['Pop four on the floor', 'Four-on-the-floor pop'],
        ),
        0,
        L(
          'Funk: fus pe șaisprezecimi, ghost notes și toba mare sincopată.',
          'Funk: sixteenth hi-hat, ghost notes and a syncopated bass drum.',
        ),
      ),
      listenChoice(
        'r-stil-3',
        L('Și acesta?', 'And this one?'),
        bar('q-sty-rv-jazz', 12, { ...JAZZ, kick: 'o..o..o..o..' }, { bpm: 120 }),
        opts(
          ['Shuffle', 'Shuffle'],
          ['Jazz', 'Jazz'],
          ['Afro-cuban', 'Afro-Cuban'],
          ['Rock', 'Rock'],
        ),
        1,
        L(
          'Jazz: ride-ul „ding, ding-da”, fusul cu piciorul pe 2 și 4 și feathering pe toba mare.',
          'Jazz: the "ding, ding-da" ride, foot hi-hat on 2 and 4 and feathering on the bass drum.',
        ),
      ),
      listenChoice(
        'r-stil-4',
        L('Și acesta?', 'And this one?'),
        bar(
          'q-sty-rv-bossa',
          8,
          { hhClosed: 'xxxxxxxx', crossStick: 'x..x..x.', kick: 'x..xx..x' },
          {
            bpm: 84,
            extraBars: [{ hhClosed: 'xxxxxxxx', crossStick: '..x.x...', kick: 'x..xx..x' }],
          },
        ),
        opts(['Samba', 'Samba'], ['Rock', 'Rock'], ['Pop', 'Pop'], ['Bossa nova', 'Bossa nova']),
        3,
        L(
          'Bossa nova: moale, cu clave-ul pe cross-stick.',
          'Bossa nova: soft, with the clave on the cross-stick.',
        ),
      ),
      listenChoice(
        'r-stil-5',
        L('Și acesta?', 'And this one?'),
        bar(
          'q-sty-rv-gallop',
          16,
          { crash: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.xxx.xxx.xxx.xx' },
          { bpm: 120 },
        ),
        opts(
          ['Funk', 'Funk'],
          ['Metal: galop', 'Metal: gallop'],
          ['Samba', 'Samba'],
          ['Jazz', 'Jazz'],
        ),
        1,
        L('Metal, galopul pe toba mare dublă.', 'Metal, the gallop on double bass.'),
      ),
      listenChoice(
        'r-stil-6',
        L('Și acesta?', 'And this one?'),
        bar(
          'q-sty-rv-afro',
          12,
          { rideBell: BELL, snare: '...x.....x..', kick: 'x..x..x..x..' },
          { bpm: 84 },
        ),
        opts(
          ['Afro-cuban', 'Afro-Cuban'],
          ['Blues lent', 'Slow blues'],
          ['Jazz', 'Jazz'],
          ['Bossa nova', 'Bossa nova'],
        ),
        0,
        L(
          'Afro-cuban: tiparul de clopot de șapte lovituri în 12/8.',
          'Afro-Cuban: the seven-stroke bell pattern in 12/8.',
        ),
      ),
      listenChoice(
        'r-stil-7',
        L('Și acesta?', 'And this one?'),
        bar(
          'q-sty-rv-pop',
          8,
          { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x.x.x.x.' },
          { bpm: 120 },
        ),
        opts(
          ['Half-time', 'Half-time'],
          ['Shuffle', 'Shuffle'],
          ['Pop: four on the floor', 'Pop: four on the floor'],
          ['Metal: optimi grele', 'Metal: heavy eighths'],
        ),
        2,
        L(
          'Four on the floor: toba mare pe fiecare timp, backbeat pe 2 și 4.',
          'Four on the floor: bass drum on every beat, backbeat on 2 and 4.',
        ),
      ),
      markHeard(
        'r-mare-funk',
        L(
          'Marchează toba mare din funk. Fusul și toba mică sunt scrise.',
          'Mark the funk bass drum. Hi-hat and snare are written in.',
        ),
        bar('q-sty-rv-fk', 16, FUNK2, { bpm: 76 }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, „unu-a”, 3, „trei-a” și „patru-și”.',
          'On 1, the "a" of 1, 3, the "a" of 3 and the "and" of 4.',
        ),
      ),
      markHeard(
        'r-clave',
        L(
          'Marchează măsura cu două lovituri a clave-ului.',
          'Mark the two-stroke bar of the clave.',
        ),
        bar('q-sty-rv-clave2', 8, { crossStick: '..x.x...' }, { bpm: 88 }),
        ['crossStick'],
        [],
        L(
          'Pe 2 și pe 3: partea de două a clave-ului.',
          'On 2 and on 3: the two side of the clave.',
        ),
      ),
      choice(
        'r-ordinea',
        L(
          'În ce ordine sunt stilurile în manual, și după ce criteriu?',
          'In what order are the styles in the handbook, and by what rule?',
        ),
        opts(
          ['După popularitate', 'By popularity'],
          [
            'După cât de departe cade lovitura de puls',
            'By how far the strokes fall from the pulse',
          ],
          ['Istoric, de la cel mai vechi', 'Historically, oldest first'],
          ['Alfabetic', 'Alphabetically'],
        ),
        1,
        L(
          'După cât de departe cade lovitura de puls: optimi drepte, ternar, șaisprezecimi, apoi independență pe mai multe planuri.',
          'By how far strokes fall from the pulse: straight eighths, threes, sixteenths, then independence on several layers.',
        ),
      ),
      pickHeard(
        'r-jazz-sau-shuffle',
        L('Ascultă ride-ul. Care grilă e?', 'Listen to the ride. Which grid is it?'),
        bar('q-sty-rv-ride', 12, JAZZ, { bpm: 108 }),
        [
          bar(
            'q-sty-rv-ride-a',
            12,
            { ride: 'x.xx.xx.xx.x', hhFoot: '...x.....x..' },
            { bpm: 108 },
          ),
          bar('q-sty-rv-ride-b', 12, JAZZ, { bpm: 108 }),
          bar(
            'q-sty-rv-ride-c',
            12,
            { ride: 'xxxxxxxxxxxx', hhFoot: '...x.....x..' },
            { bpm: 108 },
          ),
        ],
        1,
        L(
          '„Ding, ding-da”: simplu pe 1 și 3, lung-scurt pe 2 și 4. A e shuffle pe toți timpii.',
          '"Ding, ding-da": single on 1 and 3, long-short on 2 and 4. A is a shuffle on every beat.',
        ),
      ),
      choice(
        'r-greseala-funk',
        L(
          'Funk-ul tău sună a rock aglomerat. Ce e, probabil, greșit?',
          'Your funk sounds like busy rock. What is probably wrong?',
        ),
        opts(
          ['Ghost notes prea tari', 'Ghost notes too loud'],
          ['Tempoul prea mic', 'Tempo too slow'],
          ['Fusul prea încet', 'Hi-hat too quiet'],
          ['Toba mare prea rară', 'Bass drum too sparse'],
        ),
        0,
        L(
          'Ghost notes prea tari: se aud ca note și acoperă backbeat-ul.',
          'Ghost notes too loud: they sound like notes and cover the backbeat.',
        ),
      ),
    ],
  },
]
