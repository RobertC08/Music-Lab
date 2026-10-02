import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard } from './helpers'

/*
  Etapa 3, Anatomia groove-ului.

  Lecțiile de aici sunt despre ce FACE fiecare piesă, deci și întrebările sunt
  mai ales de ascultat: ce rol lipsește, ce s-a schimbat, pe ce feel ești. Grila
  de completat cere de fiecare dată o singură piesă, cu restul dat: exact
  coordonarea pe perechi predată în prima lecție.
*/

const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
const SHUFFLE = { hhClosed: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' }

export const grooveQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-cele-trei-roluri',
    stage: 'groove',
    lessonId: 'cele-trei-roluri',
    questions: [
      choice(
        'rolul-tobei-mari',
        L('Ce rol are toba mare într-un groove?', 'What role does the bass drum have in a groove?'),
        opts(
          ['Ține timpul', 'It keeps time'],
          ['Dă backbeat-ul', 'It gives the backbeat'],
          ['E pulsul de jos, basul', 'It is the low pulse, the bass'],
          ['Doar culoare', 'Only colour'],
        ),
        2,
        L(
          'Basul: pulsul de jos pe care se sprijină restul. Timpul e al fusului, backbeat-ul al tobei mici.',
          'The bass: the low pulse everything rests on. Time belongs to the hi-hat, the backbeat to the snare.',
        ),
      ),
      listenChoice(
        'ce-lipseste',
        L('Ascultă. Ce rol lipsește?', 'Listen. Which role is missing?'),
        bar('q-grv-r-pair', 8, { snare: '..x...x.', kick: 'x...x...' }, { bpm: 84 }),
        opts(
          ['Backbeat-ul', 'The backbeat'],
          ['Basul', 'The bass'],
          ['Niciunul', 'None'],
          ['Timpul: fusul', 'Time: the hi-hat'],
        ),
        3,
        L(
          'Timpul: se aud doar toba mare și toba mică, fără fus. E prima pereche din coordonare.',
          'Time: you only hear bass drum and snare, no hi-hat. It is the first pair in coordination.',
        ),
      ),
      markHeard(
        'perechea',
        L(
          'Marchează toba mică și toba mare. Nimic nu e dat.',
          'Mark the snare and the bass drum. Nothing is given.',
        ),
        bar('q-grv-r-mark', 8, { snare: '..x...x.', kick: 'x..xx...' }, { bpm: 80 }),
        ['snare', 'kick'],
        [],
        L(
          'Toba mică pe 2 și 4. Toba mare pe 1, pe „doi-și” și pe 3: lovitura de pe „doi-și” e cea care dă mers.',
          'Snare on 2 and 4. Bass drum on 1, on the "and" of 2 and on 3: the stroke on the "and" of 2 is what gives it motion.',
        ),
      ),
      choice(
        'ordinea',
        L(
          'În ce ordine se pun rolurile împreună când înveți?',
          'In what order are the roles put together when learning?',
        ),
        opts(
          ['Toate trei deodată, de la început', 'All three at once, from the start'],
          [
            'Tobă mare + tobă mică, apoi fus + tobă mică, apoi toate trei',
            'Bass drum + snare, then hi-hat + snare, then all three',
          ],
          ['Fusul singur o lună, apoi restul', 'The hi-hat alone for a month, then the rest'],
          ['Întâi fill-urile, apoi groove-ul', 'Fills first, then the groove'],
        ),
        1,
        L(
          'Pe perechi, apoi toate trei. Corpul vrea să lovească totul odată cu mâna dominantă; perechile îl învață să despartă.',
          'In pairs, then all three. The body wants to hit everything along with the dominant hand; the pairs teach it to separate.',
        ),
      ),
      markHeard(
        'adauga-fusul',
        L(
          'Marchează fusul. Toba mare și toba mică sunt scrise.',
          'Mark the hi-hat. Bass drum and snare are written in.',
        ),
        bar(
          'q-grv-r-hat',
          8,
          { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' },
          { bpm: 80 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['snare', 'kick'],
        L(
          'Pe fiecare optime, fără pauză: fusul ține timpul și peste toba mare, și peste toba mică.',
          'On every eighth, without a break: the hi-hat keeps time over both the bass drum and the snare.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-ostinato-ul',
    stage: 'groove',
    lessonId: 'ostinato-ul',
    questions: [
      choice(
        'ce-e',
        L('Ce e un ostinato?', 'What is an ostinato?'),
        opts(
          ['Un fill scurt', 'A short fill'],
          ['Un accent pe „unu”', 'An accent on one'],
          [
            'Un flux care se repetă neschimbat sub restul',
            'A stream repeating unchanged under the rest',
          ],
          ['O schimbare de tempo', 'A tempo change'],
        ),
        2,
        L(
          'Un flux neschimbat sub restul. La tobe, de obicei fusul sau ride-ul.',
          'A steady stream under everything else. On drums, usually the hi-hat or the ride.',
        ),
      ),
      choice(
        'cedeaza',
        L(
          'Toba mare face ceva nou. Ce se oprește, de obicei, primul?',
          'The bass drum does something new. What usually stops first?',
        ),
        opts(
          ['Toba mică', 'The snare'],
          ['Ostinato-ul de pe fus', 'The hi-hat ostinato'],
          ['Toba mare', 'The bass drum'],
          ['Nimic', 'Nothing'],
        ),
        1,
        L(
          'Ostinato-ul: e partea la care nu te mai uiți. De aceea se exersează invers: fusul întâi, restul peste el.',
          'The ostinato: it is the part you stop watching. That is why you practise the other way round: hi-hat first, the rest on top.',
        ),
      ),
      pickHeard(
        'ce-s-a-schimbat',
        L(
          'Ascultă două măsuri. Care grilă e ce auzi?',
          'Listen to two bars. Which grid is what you hear?',
        ),
        bar('q-grv-o-two', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, kick: 'x..x.x..' }] }),
        [
          bar('q-grv-o-a', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, hhClosed: 'x.x.x.x.' }] }),
          bar('q-grv-o-b', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, snare: '...x...x' }] }),
          bar('q-grv-o-c', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, kick: 'x..x.x..' }] }),
        ],
        2,
        L(
          'În a doua măsură se schimbă doar toba mare; fusul și toba mică rămân. Asta înseamnă ostinato: ce e dedesubt nu se mișcă.',
          'In the second bar only the bass drum changes; hi-hat and snare stay. That is what ostinato means: what is underneath does not move.',
        ),
      ),
      markHeard(
        'toba-mare-noua',
        L(
          'Marchează toba mare. Fusul și toba mică sunt scrise.',
          'Mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar('q-grv-o-kick', 8, { ...ROCK, kick: 'x..x.x.x' }, { bpm: 76 }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, apoi pe „doi-și”, „trei-și” și „patru-și”: toată pe contratimpi după „unu”.',
          'On 1, then on the "and" of 2, 3 and 4: all on off-beats after one.',
        ),
      ),
      listenChoice(
        'pe-ce-piesa',
        L('Pe ce piesă e ostinato-ul aici?', 'Which piece carries the ostinato here?'),
        bar(
          'q-grv-o-ride',
          8,
          { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx..x' },
          { bpm: 84 },
        ),
        opts(
          ['Pe fus', 'The hi-hat'],
          ['Pe ride', 'The ride'],
          ['Pe toba mică', 'The snare'],
          ['Pe cazan', 'The floor tom'],
        ),
        1,
        L(
          'Pe ride: aceeași mână, același flux, altă culoare, mai deschisă.',
          'On the ride: same hand, same stream, a different, more open colour.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-subdiviziunea-ca-feel',
    stage: 'groove',
    lessonId: 'subdiviziunea-ca-feel',
    questions: [
      listenChoice(
        'ce-feel',
        L(
          'Fusul bate optimi. Pe ce feel e groove-ul?',
          'The hi-hat plays eighths. What feel is the groove in?',
        ),
        bar(
          'q-grv-s-16',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x......xx.......' },
          { bpm: 76 },
        ),
        opts(
          ['Optimi', 'Eighths'],
          ['Triolete', 'Triplets'],
          ['Șaisprezecimi', 'Sixteenths'],
          ['Pătrimi', 'Quarters'],
        ),
        2,
        L(
          'Șaisprezecimi: toba mare cade o dată pe „doi-a”, între optimile fusului. O singură notă mută tot groove-ul pe grila mai deasă.',
          'Sixteenths: the bass drum lands once on the "a" of 2, between the hi-hat’s eighths. One note moves the whole groove onto the finer grid.',
        ),
      ),
      choice(
        'half-time',
        L('Ce face un groove half-time?', 'What does a half-time groove do?'),
        opts(
          ['Înjumătățește tempoul metronomului', 'Halves the metronome tempo'],
          [
            'Pune toba mică doar pe 3: același tempo, simțit de două ori mai lent',
            'Puts the snare only on 3: same tempo, felt twice as slow',
          ],
          ['Cântă doar jumătate din măsură', 'Plays only half the bar'],
          ['Scoate toba mare', 'Removes the bass drum'],
        ),
        1,
        L(
          'Toba mică o dată pe măsură, pe 3. Tempoul rămâne; se schimbă cât de des vine backbeat-ul.',
          'The snare once a bar, on 3. The tempo stays; how often the backbeat comes changes.',
        ),
      ),
      markHeard(
        'marcheaza-half-time',
        L(
          'Marchează toba mică. Fusul și toba mare sunt scrise.',
          'Mark the snare. Hi-hat and bass drum are written in.',
        ),
        bar(
          'q-grv-s-half',
          8,
          { hhClosed: 'xxxxxxxx', snare: '....x...', kick: 'x.......' },
          { bpm: 84 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'kick'],
        L('O singură lovitură, pe 3: half-time.', 'A single stroke, on 3: half-time.'),
      ),
      pickHeard(
        'triolete',
        L(
          'Ascultă fusul. Care grilă e ce auzi?',
          'Listen to the hi-hat. Which grid is what you hear?',
        ),
        bar(
          'q-grv-s-tri',
          12,
          { hhClosed: 'xxxxxxxxxxxx', snare: '...x.....x..', kick: 'x.....x.....' },
          { bpm: 72 },
        ),
        [
          bar(
            'q-grv-s-tri-a',
            8,
            { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
            { bpm: 72 },
          ),
          bar(
            'q-grv-s-tri-b',
            12,
            { hhClosed: 'xxxxxxxxxxxx', snare: '...x.....x..', kick: 'x.....x.....' },
            { bpm: 72 },
          ),
          bar(
            'q-grv-s-tri-c',
            16,
            { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
        ],
        1,
        L(
          'Trei lovituri de fus pe timp: feel de triolete. A e pe optimi, C pe șaisprezecimi.',
          'Three hi-hat strokes per beat: a triplet feel. A is in eighths, C in sixteenths.',
        ),
      ),
      markHeard(
        'nota-pe-a',
        L(
          'Marchează toba mare pe grila de șaisprezecimi. Fusul și toba mică sunt scrise.',
          'Mark the bass drum on the sixteenth grid. Hi-hat and snare are written in.',
        ),
        bar(
          'q-grv-s-mark16',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x......xx.x.....' },
          { bpm: 72 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, pe „doi-a”, pe 3 și pe „trei-și”. Nota de pe „doi-a” cade între două lovituri de fus: acolo se simte șaisprezecimea.',
          'On 1, the "a" of 2, on 3 and the "and" of 3. The note on the "a" of 2 falls between two hi-hat strokes: that is where you feel the sixteenth.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-drept-si-shuffle',
    stage: 'groove',
    lessonId: 'drept-si-shuffle',
    questions: [
      listenChoice(
        'leganat',
        L('Ascultă. Drept sau legănat?', 'Listen. Straight or swung?'),
        bar('q-grv-d-sh', 12, SHUFFLE, { bpm: 80 }),
        opts(
          ['Drept: optimi egale', 'Straight: even eighths'],
          ['Legănat: lung-scurt', 'Swung: long-short'],
        ),
        1,
        L(
          'Legănat: fiecare „și” vine târziu, pe ultima notă din triolet.',
          'Swung: every "and" comes late, on the last note of the triplet.',
        ),
      ),
      listenChoice(
        'drept',
        L('Și acesta?', 'And this one?'),
        bar('q-grv-d-st', 8, ROCK, { bpm: 80 }),
        opts(
          ['Drept: optimi egale', 'Straight: even eighths'],
          ['Legănat: lung-scurt', 'Swung: long-short'],
        ),
        0,
        L('Drept: „unu-și, doi-și”, egale între ele.', 'Straight: "one-and, two-and", even.'),
      ),
      choice(
        'jumatate',
        L('Care e greșeala tipică la shuffle?', 'What is the typical shuffle mistake?'),
        opts(
          [
            'Un shuffle pe jumătate: nici egal, nici lung-scurt',
            'A half-shuffle: neither even nor long-short',
          ],
          ['Prea tare', 'Too loud'],
          ['Toba mică pe 2 și 4', 'The snare on 2 and 4'],
          ['Prea multe triolete', 'Too many triplets'],
        ),
        0,
        L(
          'Un shuffle pe jumătate se aude ca o poticnire. Alege unul și ține-l, toată trupa la fel.',
          'A half-shuffle sounds like stumbling. Pick one and keep it, the whole band the same.',
        ),
      ),
      markHeard(
        'marcheaza-legănarea',
        L(
          'Marchează fusul pe grila de triolete. Toba mică și toba mare sunt scrise.',
          'Mark the hi-hat on the triplet grid. Snare and bass drum are written in.',
        ),
        bar('q-grv-d-mark', 12, SHUFFLE, { bpm: 76 }),
        ['hhClosed', 'snare', 'kick'],
        ['snare', 'kick'],
        L(
          'Primul și al treilea pătrat din fiecare grup de trei. Mijlocul gol face lung-scurt.',
          'The first and third square of every group of three. The empty middle makes long-short.',
        ),
      ),
      pickHeard(
        'toba-mare-leganata',
        L('Ascultă toba mare. Care grilă e?', 'Listen to the bass drum. Which grid is it?'),
        bar('q-grv-d-kick', 12, { ...SHUFFLE, kick: 'x....xx.....' }, { bpm: 80 }),
        [
          bar('q-grv-d-kick-a', 12, { ...SHUFFLE, kick: 'x.....x.....' }, { bpm: 80 }),
          bar('q-grv-d-kick-b', 12, { ...SHUFFLE, kick: 'x...x.x.....' }, { bpm: 80 }),
          bar('q-grv-d-kick-c', 12, { ...SHUFFLE, kick: 'x....xx.....' }, { bpm: 80 }),
        ],
        2,
        L(
          'Toba mare pe 1, pe ultima trioletă din 2 și pe 3. B pune nota din 2 pe mijlocul trioletului, care la shuffle rămâne gol.',
          'Bass drum on 1, the last triplet of 2 and on 3. B puts the note in 2 on the middle of the triplet, which stays empty in a shuffle.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-orchestrarea',
    stage: 'groove',
    lessonId: 'orchestrarea',
    questions: [
      listenChoice(
        'strofa-refren',
        L(
          'Ascultă două măsuri. Ce se schimbă în a doua?',
          'Listen to two bars. What changes in the second?',
        ),
        bar('q-grv-or-two', 8, ROCK, {
          bpm: 84,
          extraBars: [{ crash: 'x.......', ride: '.xxxxxxx', snare: '..x...x.', kick: 'x...x...' }],
        }),
        opts(
          ['Toba mare cântă alt ritm', 'The bass drum plays another rhythm'],
          ['Tempoul crește', 'The tempo goes up'],
          [
            'Timpul trece de pe fus pe ride, cu un crash pe „unu”',
            'Time moves from hi-hat to ride, with a crash on one',
          ],
          ['Backbeat-ul se mută pe 1 și 3', 'The backbeat moves to 1 and 3'],
        ),
        2,
        L(
          'Ritmul e același; doar piesa care ține timpul se schimbă. Asta e orchestrarea.',
          'The rhythm is the same; only the piece keeping time changes. That is orchestration.',
        ),
      ),
      choice(
        'off-beat',
        L('Ce e off-beat-ul?', 'What is the off-beat?'),
        opts(
          ['Lovitura de pe „și”, între timpi', 'The stroke on the "and", between the beats'],
          ['O lovitură ratată', 'A missed stroke'],
          ['Toba mare pe „unu”', 'The bass drum on one'],
          ['Un crash la capăt de frază', 'A crash at the end of a phrase'],
        ),
        0,
        L(
          'Lovitura de pe „și”. La disco o ține fusul, de obicei deschis, peste toba mare pe fiecare timp.',
          'The stroke on the "and". In disco the hi-hat plays it, usually open, over a bass drum on every beat.',
        ),
      ),
      markHeard(
        'disco',
        L(
          'Marchează fusul deschis. Restul e scris.',
          'Mark the open hi-hat. The rest is written in.',
        ),
        bar(
          'q-grv-or-disco',
          8,
          { hhClosed: 'x.x.x.x.', hhOpen: '.x.x.x.x', snare: '..x...x.', kick: 'x.x.x.x.' },
          { bpm: 100 },
        ),
        ['hhOpen', 'hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare', 'kick'],
        L(
          'Pe fiecare „și”: off-beat-ul de disco. Pe timpi fusul e închis, odată cu toba mare.',
          'On every "and": the disco off-beat. On the beats the hi-hat is closed, with the bass drum.',
        ),
      ),
      listenChoice(
        'timp-pe-cazan',
        L('Pe ce piesă e ținut timpul aici?', 'Which piece keeps time here?'),
        bar(
          'q-grv-or-floor',
          8,
          { floor: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
          { bpm: 84 },
        ),
        opts(
          ['Pe fus', 'The hi-hat'],
          ['Pe ride', 'The ride'],
          ['Pe tomul 1', 'The high tom'],
          ['Pe cazan', 'The floor tom'],
        ),
        3,
        L(
          'Pe cazan: același groove, greu și întunecat. Rolul de timp poate trece chiar pe o tobă.',
          'On the floor tom: the same groove, heavy and dark. The time role can even move onto a drum.',
        ),
      ),
      pickHeard(
        'clopot',
        L('Ascultă cinelul. Care grilă e?', 'Listen to the cymbal. Which grid is it?'),
        bar(
          'q-grv-or-bell',
          8,
          { rideBell: 'x.x.x.x.', snare: '..x...x.', kick: 'x..xx...' },
          { bpm: 96 },
        ),
        [
          bar(
            'q-grv-or-bell-a',
            8,
            { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' },
            { bpm: 96 },
          ),
          bar(
            'q-grv-or-bell-b',
            8,
            { rideBell: 'x.x.x.x.', snare: '..x...x.', kick: 'x..xx...' },
            { bpm: 96 },
          ),
          bar(
            'q-grv-or-bell-c',
            8,
            { hhClosed: 'x.x.x.x.', snare: '..x...x.', kick: 'x..xx...' },
            { bpm: 96 },
          ),
        ],
        1,
        L(
          'Clopotul ride-ului pe pătrimi: ascuțit, ca un metronom. A e fața ride-ului pe optimi, C fusul pe pătrimi.',
          'The ride bell on quarters: sharp, like a metronome. A is the ride’s face in eighths, C the hi-hat on quarters.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-dinamica-in-groove',
    stage: 'groove',
    lessonId: 'dinamica-in-groove',
    questions: [
      choice(
        'cine-sta-dedesubt',
        L(
          'Care piesă stă dedesubt, ca volum, într-un groove de rock?',
          'Which piece sits underneath, volume-wise, in a rock groove?',
        ),
        opts(
          ['Toba mică', 'The snare'],
          ['Toba mare', 'The bass drum'],
          ['Fusul', 'The hi-hat'],
          ['Toate la fel', 'All equal'],
        ),
        2,
        L(
          'Fusul. Toba mică și toba mare duc; un fus prea tare acoperă backbeat-ul.',
          'The hi-hat. Snare and bass drum lead; a hi-hat that is too loud covers the backbeat.',
        ),
      ),
      pickHeard(
        'accente-fus',
        L('Ascultă fusul. Care grilă e?', 'Listen to the hi-hat. Which grid is it?'),
        bar(
          'q-grv-dy-acc',
          8,
          { hhClosed: 'XxXxXxXx', snare: '..x...x.', kick: 'x...x...' },
          { bpm: 84 },
        ),
        [
          bar(
            'q-grv-dy-acc-a',
            8,
            { hhClosed: 'XxXxXxXx', snare: '..x...x.', kick: 'x...x...' },
            { bpm: 84 },
          ),
          bar(
            'q-grv-dy-acc-b',
            8,
            { hhClosed: 'xXxXxXxX', snare: '..x...x.', kick: 'x...x...' },
            { bpm: 84 },
          ),
          bar(
            'q-grv-dy-acc-c',
            8,
            { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
            { bpm: 84 },
          ),
        ],
        0,
        L(
          'Accent pe timpi, „și”-urile mai mici: pulsul iese în față și groove-ul împinge.',
          'Accents on the beats, smaller "and"s: the pulse comes forward and the groove pushes.',
        ),
      ),
      choice(
        'tare-repede',
        L(
          'Ce tinde să se întâmple când cânți mai tare?',
          'What tends to happen when you play louder?',
        ),
        opts(
          ['Tempoul încetinește', 'The tempo slows'],
          ['Tempoul fuge înainte', 'The tempo runs ahead'],
          ['Nimic', 'Nothing'],
          ['Fusul se oprește', 'The hi-hat stops'],
        ),
        1,
        L(
          'Tempoul fuge: tare și repede se leagă în corp. Exersează același groove încet și tare, la același clic.',
          'The tempo runs: loud and fast are linked in the body. Practise the same groove soft and loud, against the same click.',
        ),
      ),
      markHeard(
        'ghosturi-funk',
        L(
          'Marchează toba mică, cu tot cu ghost notes. Fusul și toba mare sunt scrise.',
          'Mark the snare, ghost notes included. Hi-hat and bass drum are written in.',
        ),
        bar(
          'q-grv-dy-funk',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....X..o.o..X...', kick: 'x.......x.......' },
          { bpm: 68 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'kick'],
        L(
          'Backbeat-ul pe 2 și 4, plus două ghost notes între: pe „doi-a” și pe „trei-e”. Se simt mai mult decât se aud; grila le marchează la fel ca pe celelalte.',
          'The backbeat on 2 and 4, plus two ghost notes between: on the "a" of 2 and the "e" of 3. They are felt more than heard; the grid marks them like the others.',
        ),
      ),
      listenChoice(
        'ce-e-intre',
        L(
          'Ce auzi pe toba mică, între backbeat-uri?',
          'What do you hear on the snare, between the backbeats?',
        ),
        bar(
          'q-grv-dy-ghost',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '..o.X..o..o.X..o', kick: 'x.......x.......' },
          { bpm: 72 },
        ),
        opts(
          ['Nimic', 'Nothing'],
          ['Alte backbeat-uri', 'More backbeats'],
          ['Cross-stick', 'Cross-stick'],
          ['Ghost notes', 'Ghost notes'],
        ),
        3,
        L(
          'Ghost notes: umplu spațiul dintre 2 și 4 fără să-l ocupe. Asta face din rock funk.',
          'Ghost notes: they fill the space between 2 and 4 without taking it over. That turns rock into funk.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-variatii',
    stage: 'groove',
    lessonId: 'variatii',
    questions: [
      choice(
        'ce-schimba',
        L('O variație bună schimbă…', 'A good variation changes…'),
        opts(
          ['tot groove-ul', 'the whole groove'],
          ['un singur rol, de obicei toba mare', 'a single role, usually the bass drum'],
          ['tempoul', 'the tempo'],
          ['backbeat-ul', 'the backbeat'],
        ),
        1,
        L(
          'Un singur rol. Restul rămâne, ca schimbarea să se audă.',
          'A single role. The rest stays, so the change can be heard.',
        ),
      ),
      choice(
        'unde',
        L('Unde e locul firesc pentru o variație?', 'Where is the natural place for a variation?'),
        opts(
          ['În prima măsură a piesei', 'In the first bar of the song'],
          ['În fiecare măsură', 'In every bar'],
          ['În ultima măsură dintr-o frază de patru', 'In the last bar of a four-bar phrase'],
          ['Oriunde, la întâmplare', 'Anywhere, at random'],
        ),
        2,
        L(
          'La capăt de frază: împinge spre măsura următoare. Repetiția dinainte o face să se audă.',
          'At the end of a phrase: it pushes into the next bar. The repetition before it makes it heard.',
        ),
      ),
      pickHeard(
        'care-variatie',
        L('Ascultă două măsuri. Care grilă e?', 'Listen to two bars. Which grid is it?'),
        bar('q-grv-v-two', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, kick: 'x..xx..x' }] }),
        [
          bar('q-grv-v-a', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, kick: 'x..xx..x' }] }),
          bar('q-grv-v-b', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, snare: '.x...x..' }] }),
          bar('q-grv-v-c', 8, ROCK, { bpm: 84, extraBars: [{ ...ROCK, hhClosed: 'xxxxxx..' }] }),
        ],
        0,
        L(
          'Se schimbă doar toba mare. În B s-ar fi mutat backbeat-ul, adică exact ce o variație nu mută.',
          'Only the bass drum changes. In B the backbeat would have moved, which is exactly what a variation does not move.',
        ),
      ),
      markHeard(
        'variatie-mica',
        L(
          'Marchează toba mică. Fusul și toba mare sunt scrise.',
          'Mark the snare. Hi-hat and bass drum are written in.',
        ),
        bar('q-grv-v-snare', 8, { ...ROCK, snare: '..x...xx' }, { bpm: 80 }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'kick'],
        L(
          'Pe 2 și 4, plus una pe „patru-și”, chiar înainte de „unu”: variația care împinge.',
          'On 2 and 4, plus one on the "and" of 4, right before one: the variation that pushes.',
        ),
      ),
      choice(
        'ce-nu-se-muta',
        L('Ce NU se mută într-o variație?', 'What does NOT move in a variation?'),
        opts(
          ['Toba mare', 'The bass drum'],
          ['Fusul deschis', 'The open hi-hat'],
          ['Ghost notes', 'Ghost notes'],
          ['Backbeat-ul și „unu”-l', 'The backbeat and beat one'],
        ),
        3,
        L(
          'Backbeat-ul și „unu”-l: pe ele se sprijină trupa.',
          'The backbeat and beat one: the band leans on them.',
        ),
      ),
    ],
  },

  {
    id: 'review-groove',
    stage: 'groove',
    questions: [
      choice(
        'r-roluri',
        L('Care sunt cele trei roluri dintr-un groove?', 'What are the three roles in a groove?'),
        opts(
          ['Timpul, backbeat-ul, basul', 'Time, backbeat, bass'],
          ['Ritmul, melodia, armonia', 'Rhythm, melody, harmony'],
          ['Fill-ul, groove-ul, crash-ul', 'Fill, groove, crash'],
          ['Tare, mediu, încet', 'Loud, medium, soft'],
        ),
        0,
        L(
          'Timpul (fusul), backbeat-ul (toba mică), basul (toba mare).',
          'Time (hi-hat), backbeat (snare), bass (bass drum).',
        ),
      ),
      markHeard(
        'r-mare',
        L(
          'Marchează toba mare. Fusul și toba mică sunt scrise.',
          'Mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar('q-grv-rv-kick', 8, { ...ROCK, kick: 'x..x.xx.' }, { bpm: 80 }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, pe „doi-și”, pe „trei-și” și pe 4.',
          'On 1, on the "and" of 2, the "and" of 3 and on 4.',
        ),
      ),
      listenChoice(
        'r-half',
        L(
          'Cum se simte groove-ul ăsta, față de unul de rock la același tempo?',
          'How does this groove feel, compared with a rock groove at the same tempo?',
        ),
        bar(
          'q-grv-rv-half',
          8,
          { hhClosed: 'xxxxxxxx', snare: '....x...', kick: 'x.......' },
          { bpm: 84 },
        ),
        opts(
          ['De două ori mai rapid', 'Twice as fast'],
          ['La fel', 'The same'],
          ['De două ori mai lent', 'Twice as slow'],
          ['Legănat', 'Swung'],
        ),
        2,
        L(
          'De două ori mai lent: half-time, toba mică doar pe 3.',
          'Twice as slow: half-time, the snare only on 3.',
        ),
      ),
      pickHeard(
        'r-feel',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar('q-grv-rv-sh', 12, SHUFFLE, { bpm: 80 }),
        [
          bar('q-grv-rv-sh-a', 12, { ...SHUFFLE, hhClosed: 'xxxxxxxxxxxx' }, { bpm: 80 }),
          bar('q-grv-rv-sh-b', 8, ROCK, { bpm: 80 }),
          bar('q-grv-rv-sh-c', 12, SHUFFLE, { bpm: 80 }),
        ],
        2,
        L(
          'Shuffle: lung-scurt pe fiecare timp. A are triolete pline, B optimi drepte.',
          'Shuffle: long-short on every beat. A has full triplets, B straight eighths.',
        ),
      ),
      choice(
        'r-ostinato',
        L(
          'Cum exersezi ca ostinato-ul să nu cedeze?',
          'How do you practise so the ostinato does not give way?',
        ),
        opts(
          [
            'Ții fusul întâi și adaugi restul peste el',
            'Hold the hi-hat first and add the rest on top',
          ],
          [
            'Înveți toba mare întâi, apoi pui fusul',
            'Learn the bass drum first, then add the hi-hat',
          ],
          ['Cânți mai repede', 'Play faster'],
          ['Scoți fusul de tot', 'Drop the hi-hat altogether'],
        ),
        0,
        L(
          'Fusul întâi, restul peste el. Altfel fusul e primul care se oprește.',
          'Hi-hat first, the rest on top. Otherwise the hi-hat is the first thing to stop.',
        ),
      ),
      markHeard(
        'r-shuffle-mare',
        L(
          'Marchează toba mare pe grila de triolete. Fusul și toba mică sunt scrise.',
          'Mark the bass drum on the triplet grid. Hi-hat and snare are written in.',
        ),
        bar('q-grv-rv-shk', 12, { ...SHUFFLE, kick: 'x....xx.....' }, { bpm: 76 }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, pe ultima trioletă din 2 și pe 3: toba mare intră și ea în legănare.',
          'On 1, the last triplet of 2 and on 3: the bass drum joins the swing.',
        ),
      ),
      listenChoice(
        'r-orchestrare',
        L('Ce piesă ține timpul aici?', 'Which piece keeps time here?'),
        bar(
          'q-grv-rv-ride',
          8,
          { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
          { bpm: 84 },
        ),
        opts(
          ['Fusul închis', 'Closed hi-hat'],
          ['Ride-ul', 'The ride'],
          ['Cazanul', 'The floor tom'],
          ['Crash-ul', 'The crash'],
        ),
        1,
        L(
          'Ride-ul: mai deschis și mai plin decât fusul. Se folosește des la refren.',
          'The ride: more open and fuller than the hi-hat. Often used in the chorus.',
        ),
      ),
      markHeard(
        'r-off-beat',
        L(
          'Marchează fusul închis: aici e doar pe „și”. Toba mică și toba mare sunt scrise.',
          'Mark the closed hi-hat: here it is only on the "and". Snare and bass drum are written in.',
        ),
        bar(
          'q-grv-rv-off',
          8,
          { hhClosed: '.x.x.x.x', snare: '..x...x.', kick: 'x.x.x.x.' },
          { bpm: 110 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['snare', 'kick'],
        L(
          'Pe fiecare „și”, între loviturile de tobă mare: off-beat-ul de dance.',
          'On every "and", between the bass drum strokes: the dance off-beat.',
        ),
      ),
      choice(
        'r-fus-tare',
        L(
          'Fusul e mai tare decât toba mică. Ce se pierde?',
          'The hi-hat is louder than the snare. What gets lost?',
        ),
        opts(
          ['Tempoul', 'The tempo'],
          ['Backbeat-ul', 'The backbeat'],
          ['Toba mare', 'The bass drum'],
          ['Nimic', 'Nothing'],
        ),
        1,
        L(
          'Backbeat-ul: un fus prea tare îl acoperă. Toba mică și toba mare duc, fusul stă dedesubt.',
          'The backbeat: a hi-hat that is too loud covers it. Snare and bass drum lead, the hi-hat sits under.',
        ),
      ),
      pickHeard(
        'r-ghost',
        L('Ascultă toba mică. Care grilă e?', 'Listen to the snare. Which grid is it?'),
        bar(
          'q-grv-rv-g',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....X..o.o..X...', kick: 'x.......x.......' },
          { bpm: 72 },
        ),
        [
          bar(
            'q-grv-rv-g-a',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....X.......X...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
          bar(
            'q-grv-rv-g-b',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....X..o.o..X...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
          bar(
            'q-grv-rv-g-c',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....X..X.X..X...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
        ],
        1,
        L(
          'Două ghost notes între backbeat-uri, abia auzite. În C ar fi la fel de tari ca backbeat-ul, în A lipsesc.',
          'Two ghost notes between the backbeats, barely heard. In C they would be as loud as the backbeat, in A they are missing.',
        ),
      ),
      choice(
        'r-frază',
        L(
          'Cântai trei măsuri de groove și una de variație. Variația ți-a ieșit pe a treia măsură. Ce s-a întâmplat?',
          'You were playing three bars of groove and one of variation. Your variation landed on the third bar. What happened?',
        ),
        opts(
          ['Ai grăbit tempoul', 'You rushed the tempo'],
          ['Ai pierdut numărătoarea măsurilor', 'You lost count of the bars'],
          ['Variația era prea grea', 'The variation was too hard'],
          ['Nimic, e corect', 'Nothing, it is correct'],
        ),
        1,
        L(
          'Ai pierdut numărătoarea măsurilor. Numără și măsurile, nu doar timpii: „unu-doi-trei-patru, doi-doi-trei-patru”.',
          'You lost count of the bars. Count the bars too, not just the beats: "one-two-three-four, two-two-three-four".',
        ),
      ),
      listenChoice(
        'r-cross',
        L(
          'Ascultă prima măsură. Ce ține backbeat-ul?',
          'Listen to the first bar. What carries the backbeat?',
        ),
        bar(
          'q-grv-rv-cross',
          8,
          { hhClosed: 'xxxxxxxx', crossStick: '..x...x.', kick: 'x...x...' },
          { bpm: 76 },
        ),
        opts(
          ['Toba mică', 'The snare'],
          ['Toba mare', 'The bass drum'],
          ['Cross-stick-ul', 'The cross-stick'],
          ['Cazanul', 'The floor tom'],
        ),
        2,
        L(
          'Cross-stick-ul: același rol, pe 2 și 4, dar mai cald și mai încet. Se folosește la strofa unei balade.',
          'The cross-stick: the same role, on 2 and 4, but warmer and quieter. Used in a ballad verse.',
        ),
      ),
    ],
  },
]
