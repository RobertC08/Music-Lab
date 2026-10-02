import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import { beatsRow } from '../../mixed-grid'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard } from './helpers'

/*
  Etapa 6, Avansat.

  Fiecare noțiune de aici e o relație între piese (independență, linear,
  poliritm) sau între timp și pattern (deplasare, măsuri impare, modulație).
  Grila e locul în care relația se vede, deci aproape fiecare quiz cere să
  marchezi o piesă față de celelalte, date.
*/

const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
/** O măsură pe grila comună (`mixed-grid.ts`), scrisă pe timpi. */
const mixed = (id: string, rows: Record<string, string>, bpm: number) =>
  bar(
    id,
    48,
    Object.fromEntries(Object.entries(rows).map(([piece, row]) => [piece, beatsRow(row)])),
    { bpm },
  )

const JAZZ_OST = { ride: 'xxxxxxxx', hhFoot: '..x...x.', kick: 'x...x...' }

export const advancedQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-independenta',
    stage: 'advanced',
    lessonId: 'independenta',
    questions: [
      choice(
        'ce-e',
        L('Ce înseamnă independența la tobe?', 'What does independence mean on drums?'),
        opts(
          ['Să cânți fără trupă', 'Playing without a band'],
          [
            'Fiecare membru face altceva fără să-i încurce pe ceilalți',
            'Each limb does something different without tripping the others',
          ],
          ['Să cânți fără metronom', 'Playing without a metronome'],
          ['Să cânți doar cu mâinile', 'Playing with the hands only'],
        ),
        1,
        L(
          'Fiecare membru își ține fluxul, în același timp, fără să-i tragă pe ceilalți după el.',
          'Each limb keeps its own stream, at the same time, without dragging the others along.',
        ),
      ),
      choice(
        'cand-cedeaza',
        L(
          'Ride-ul se rupe de fiecare dată când toba mică se mută. Ce faci?',
          'The ride breaks every time the snare moves. What do you do?',
        ),
        opts(
          ['Te întorci o treaptă și o iei mai încet', 'Go back a step and take it slower'],
          ['Cânți mai repede', 'Play faster'],
          ['Renunți la ride', 'Drop the ride'],
          ['Treci la treapta următoare', 'Move to the next step'],
        ),
        0,
        L(
          'O treaptă înapoi, mai încet. Ostinato-ul cedează primul fiindcă e partea la care nu te mai uiți.',
          'One step back, slower. The ostinato gives first because it is the part you stop watching.',
        ),
      ),
      pickHeard(
        'ce-se-muta',
        L('Ascultă două măsuri. Care grilă e?', 'Listen to two bars. Which grid is it?'),
        bar('q-adv-i-two', 8, ROCK, { bpm: 80, extraBars: [{ ...ROCK, snare: '..x..x.x' }] }),
        [
          bar('q-adv-i-a', 8, ROCK, { bpm: 80, extraBars: [{ ...ROCK, kick: 'x..x.x.x' }] }),
          bar('q-adv-i-b', 8, ROCK, { bpm: 80, extraBars: [{ ...ROCK, snare: '..x..x.x' }] }),
          bar('q-adv-i-c', 8, ROCK, { bpm: 80, extraBars: [{ ...ROCK, hhClosed: 'x.x.x.x.' }] }),
        ],
        1,
        L(
          'Se mută doar toba mică, pe 2, „trei-și” și „patru-și”. Fusul și toba mare stau.',
          'Only the snare moves, to 2, the "and" of 3 and the "and" of 4. Hi-hat and bass drum stay.',
        ),
      ),
      markHeard(
        'mica-peste-jazz',
        L(
          'Peste ostinato-ul de jazz, marchează toba mică. Restul e scris.',
          'Over the jazz ostinato, mark the snare. The rest is written in.',
        ),
        bar('q-adv-i-jazz', 8, { ...JAZZ_OST, snare: '.x...x..' }, { bpm: 72 }),
        ['ride', 'snare', 'kick', 'hhFoot'],
        ['ride', 'kick', 'hhFoot'],
        L(
          'Pe „unu-și” și „trei-și”: între timpi, unde nu cade nimic altceva.',
          'On the "and" of 1 and the "and" of 3: between the beats, where nothing else lands.',
        ),
      ),
      markHeard(
        'piciorul-stang',
        L(
          'Marchează fusul cu piciorul. Restul e scris.',
          'Mark the foot hi-hat. The rest is written in.',
        ),
        bar(
          'q-adv-i-foot',
          8,
          { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...', hhFoot: 'x.x.x.x.' },
          { bpm: 72 },
        ),
        ['ride', 'snare', 'kick', 'hhFoot'],
        ['ride', 'snare', 'kick'],
        L(
          'Pe fiecare timp: al patrulea membru, sub toate celelalte.',
          'On every beat: the fourth limb, under all the others.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-linear',
    stage: 'advanced',
    lessonId: 'linear',
    questions: [
      choice(
        'ce-e',
        L('Ce e linear playing?', 'What is linear playing?'),
        opts(
          [
            'Un groove în care două piese nu cad niciodată pe același pas',
            'A groove where two pieces never land on the same step',
          ],
          ['Un groove cântat doar pe fus', 'A groove played only on the hi-hat'],
          ['Un roll lung', 'A long roll'],
          ['Un groove fără toba mare', 'A groove without bass drum'],
        ),
        0,
        L(
          'O singură piesă pe pas: pe grilă, nicio coloană cu două pătrate.',
          'One piece per step: on the grid, no column with two squares.',
        ),
      ),
      choice(
        'greseala',
        L(
          'Care e greșeala tipică la un groove linear?',
          'What is the typical slip in a linear groove?',
        ),
        opts(
          ['Toba mică prea încet', 'Snare too quiet'],
          ['Prea încet ca tempo', 'Too slow a tempo'],
          [
            'Fusul și toba mare cad deodată, din obișnuință',
            'Hi-hat and bass drum land together, out of habit',
          ],
          ['Prea puține note', 'Too few notes'],
        ),
        2,
        L(
          'Fusul și toba mare deodată pe „unu”: corpul vrea să le sincronizeze. În linear nu au voie.',
          'Hi-hat and bass drum together on one: the body wants to sync them. In linear they must not.',
        ),
      ),
      pickHeard(
        'care-e-linear',
        L(
          'Ascultă grupul de trei. Care grilă e?',
          'Listen to the group of three. Which grid is it?',
        ),
        bar(
          'q-adv-l-three',
          12,
          { hhClosed: 'x..x..x..x..', snare: '.x..x..x..x.', kick: '..x..x..x..x' },
          { bpm: 66 },
        ),
        [
          bar(
            'q-adv-l-three-a',
            12,
            { hhClosed: 'x..x..x..x..', snare: '.x..x..x..x.', kick: 'x..x..x..x..' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-l-three-b',
            12,
            { hhClosed: 'x..x..x..x..', snare: '.x..x..x..x.', kick: '..x..x..x..x' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-l-three-c',
            12,
            { hhClosed: 'xxxxxxxxxxxx', snare: '.x..x..x..x.', kick: '..x..x..x..x' },
            { bpm: 66 },
          ),
        ],
        1,
        L(
          'Fus, tobă mică, tobă mare, pe rând, fără suprapuneri. În A toba mare cade odată cu fusul, în C fusul e peste tot.',
          'Hi-hat, snare, bass drum, in turn, never overlapping. In A the bass drum lands with the hi-hat, in C the hi-hat is everywhere.',
        ),
      ),
      markHeard(
        'grupul-de-patru',
        L(
          'Marchează toba mare din grupul de patru. Fusul și toba mică sunt scrise.',
          'Mark the bass drum in the group of four. Hi-hat and snare are written in.',
        ),
        bar(
          'q-adv-l-four',
          16,
          { hhClosed: 'x.......x.......', snare: '.o..Xo...o..Xo..', kick: '..xx..xx..xx..xx' },
          { bpm: 60 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Câte două, pe ultimele două șaisprezecimi din fiecare timp: mână, mână, picior, picior.',
          'In pairs, on the last two sixteenths of every beat: hand, hand, foot, foot.',
        ),
      ),
      listenChoice(
        'pe-tomuri',
        L('Ascultă. Ce e?', 'Listen. What is it?'),
        bar(
          'q-adv-l-toms',
          12,
          {
            tom: 'x.....x.....',
            floor: '...x.....x..',
            snare: '.x..x..x..x.',
            kick: '..x..x..x..x',
          },
          { bpm: 66 },
        ),
        opts(
          ['Un fill linear pe tomuri', 'A linear fill on the toms'],
          ['Un roll pe toba mică', 'A snare roll'],
          ['Un groove de rock', 'A rock groove'],
          ['Un paradiddle', 'A paradiddle'],
        ),
        0,
        L(
          'Grupul de trei, cu dreapta mutată pe tomuri: tom sau cazan, tobă mică, tobă mare.',
          'The group of three, the right hand moved to the toms: tom or floor tom, snare, bass drum.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-deplasarea',
    stage: 'advanced',
    lessonId: 'deplasarea',
    questions: [
      choice(
        'ce-e',
        L('Ce e deplasarea?', 'What is displacement?'),
        opts(
          ['Un groove nou', 'A new groove'],
          ['O schimbare de tempo', 'A tempo change'],
          [
            'Același groove mutat cu o subdiviziune mai devreme sau mai târziu',
            'The same groove moved one subdivision earlier or later',
          ],
          ['Un fill pe contratimp', 'An off-beat fill'],
        ),
        2,
        L(
          'Aceleași note, mutate: cad pe contratimp, iar urechea crede că s-a mutat „unu”.',
          'The same notes, moved: they land on the off-beats, and the ear thinks one has moved.',
        ),
      ),
      listenChoice(
        'cum-e-mutat',
        L(
          'Ascultă două măsuri. Cum e mutată a doua?',
          'Listen to two bars. How is the second one moved?',
        ),
        bar('q-adv-d-later', 8, ROCK, {
          bpm: 84,
          extraBars: [{ hhClosed: 'xxxxxxxx', snare: '...x...x', kick: '.x...x..' }],
        }),
        opts(
          ['Cu o optime mai devreme', 'One eighth earlier'],
          ['Cu o optime mai târziu', 'One eighth later'],
          ['Cu o șaisprezecime', 'By one sixteenth'],
          ['Nu e mutată', 'It is not moved'],
        ),
        1,
        L(
          'Cu o optime mai târziu: toba mare pe „unu-și”, toba mică pe „doi-și”. Fusul a rămas pe loc.',
          'One eighth later: bass drum on the "and" of 1, snare on the "and" of 2. The hi-hat stayed put.',
        ),
      ),
      markHeard(
        'marcheaza-mutat',
        L(
          'Măsura mutată: marchează toba mică și toba mare. Fusul e scris.',
          'The moved bar: mark the snare and bass drum. The hi-hat is written in.',
        ),
        bar(
          'q-adv-d-mark',
          8,
          { hhClosed: 'xxxxxxxx', snare: '...x...x', kick: '.x...x..' },
          { bpm: 80 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed'],
        L(
          'Totul cu un pas la dreapta: toba mare pe „unu-și” și „trei-și”, toba mică pe „doi-și” și „patru-și”.',
          'Everything one step to the right: bass drum on the "and" of 1 and 3, snare on the "and" of 2 and 4.',
        ),
      ),
      choice(
        'greseala',
        L(
          'După două măsuri mutate, revii la groove-ul normal, dar decalat. Ce s-a întâmplat?',
          'After two moved bars, you go back to the normal groove, but shifted. What happened?',
        ),
        opts(
          ['Ai grăbit tempoul', 'You rushed'],
          ['Ai uitat groove-ul', 'You forgot the groove'],
          ['Fusul s-a oprit', 'The hi-hat stopped'],
          ['Urechea a acceptat noul „unu”', 'Your ear accepted the new one'],
        ),
        3,
        L(
          'Urechea a acceptat noul „unu”. De aceea se exersează cu clicul doar pe „unu”.',
          'Your ear accepted the new one. That is why you practise with the click on one only.',
        ),
      ),
      pickHeard(
        'cu-saisprezecime',
        L('Ascultă măsura mutată. Care grilă e?', 'Listen to the moved bar. Which grid is it?'),
        bar(
          'q-adv-d-16',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '.....x.......x..', kick: '.x.......x......' },
          { bpm: 72 },
        ),
        [
          bar(
            'q-adv-d-16-a',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '.....x.......x..', kick: '.x.......x......' },
            { bpm: 72 },
          ),
          bar(
            'q-adv-d-16-b',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '......x.......x.', kick: '..x.......x.....' },
            { bpm: 72 },
          ),
          bar(
            'q-adv-d-16-c',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
        ],
        0,
        L(
          'Mutat cu o șaisprezecime: toba mare pe „e”, toba mică pe „e”, nimic pe timp sau pe „și”. B e mutat cu o optime, C nu e mutat deloc.',
          'Moved by a sixteenth: bass drum on the "e", snare on the "e", nothing on the beat or the "and". B is moved by an eighth, C not at all.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-fill-uri-avansate',
    stage: 'advanced',
    lessonId: 'fill-uri-avansate',
    questions: [
      choice(
        'sextolet',
        L('Ce e un sextolet?', 'What is a sextuplet?'),
        opts(
          ['Șase timpi într-o măsură', 'Six beats in a bar'],
          ['Șase note egale într-un timp', 'Six even notes in one beat'],
          ['Un fill de șase măsuri', 'A six-bar fill'],
          ['Șase lovituri de tobă mare', 'Six bass drum strokes'],
        ),
        1,
        L(
          'Șase note egale într-un timp: două triolete lipite. Se scrie cu un 6 deasupra.',
          'Six even notes in one beat: two triplets glued together. Written with a 6 above.',
        ),
      ),
      pickHeard(
        'doua-grile',
        L('Ascultă fill-ul. Care grilă e?', 'Listen to the fill. Which grid is it?'),
        mixed(
          'q-adv-af-two',
          {
            snare: 'Xxxx|Xxxx|.|.',
            tom: '..|..|Xxx|...',
            floor: '..|..|...|Xxx',
            kick: 'x.|..|x..|...',
          },
          72,
        ),
        [
          mixed(
            'q-adv-af-two-a',
            {
              snare: 'Xxxx|Xxxx|.|.',
              tom: '..|..|Xxxx|....',
              floor: '..|..|....|Xxxx',
              kick: 'x.|..|x...|....',
            },
            72,
          ),
          mixed(
            'q-adv-af-two-b',
            {
              snare: 'Xxxx|Xxxx|.|.',
              tom: '..|..|Xxx|...',
              floor: '..|..|...|Xxx',
              kick: 'x.|..|x..|...',
            },
            72,
          ),
          mixed(
            'q-adv-af-two-c',
            {
              snare: 'Xxx|Xxx|.|.',
              tom: '..|..|Xxx|...',
              floor: '..|..|...|Xxx',
              kick: 'x..|...|x..|...',
            },
            72,
          ),
        ],
        1,
        L(
          'Șaisprezecimi pe toba mică doi timpi, apoi triolete pe tomuri: patru pătrate, apoi trei mai late. A rămâne pe șaisprezecimi până la capăt, C e numai triolete.',
          'Sixteenths on the snare for two beats, then triplets on the toms: four squares, then three wider ones. A stays on sixteenths to the end, C is all triplets.',
        ),
      ),
      listenChoice(
        'intrarea',
        L(
          'Ascultă. Pe ce cade prima notă de tobă mică a fill-ului?',
          'Listen. Where does the fill’s first snare note fall?',
        ),
        mixed(
          'q-adv-af-entry',
          {
            hhClosed: 'Xxxx|Xxxx|x...|.',
            snare: '....|X...|.xxx|....',
            tom: '....|....|....|xx..',
            floor: '....|....|....|..xx',
            kick: 'X...|..X.|x...|....',
          },
          72,
        ),
        opts(
          ['Pe 3', 'On 3'],
          ['Pe „trei-e”', 'On the "e" of 3'],
          ['Pe „trei-și”', 'On the "and" of 3'],
          ['Pe 4', 'On 4'],
        ),
        1,
        L(
          'Pe „trei-e”, o șaisprezecime după timp: golul de pe 3 e cel care face intrarea să se audă.',
          'On the "e" of 3, one sixteenth after the beat: the hole on 3 is what makes the entry heard.',
        ),
      ),
      pickHeard(
        'franarea',
        L('Ascultă fill-ul. Care grilă e?', 'Listen to the fill. Which grid is it?'),
        mixed(
          'q-adv-af-brake',
          {
            snare: 'Xxxxxx|.|.|.',
            tom: '.|Xxxx|.|.',
            mid: '.|.|Xxx|.',
            floor: '.|.|.|Xx',
            kick: 'x.|x.|x.|x.',
          },
          66,
        ),
        [
          mixed(
            'q-adv-af-brake-a',
            {
              snare: 'Xx|.|.|.',
              tom: '.|Xxx|.|.',
              mid: '.|.|Xxxx|.',
              floor: '.|.|.|Xxxxxx',
              kick: 'x.|x.|x.|x.',
            },
            66,
          ),
          mixed(
            'q-adv-af-brake-b',
            {
              snare: 'Xxxxxx|.|.|.',
              tom: '.|Xxxxxx|.|.',
              mid: '.|.|Xxxxxx|.',
              floor: '.|.|.|Xxxxxx',
              kick: 'x.|x.|x.|x.',
            },
            66,
          ),
          mixed(
            'q-adv-af-brake-c',
            {
              snare: 'Xxxxxx|.|.|.',
              tom: '.|Xxxx|.|.',
              mid: '.|.|Xxx|.',
              floor: '.|.|.|Xx',
              kick: 'x.|x.|x.|x.',
            },
            66,
          ),
        ],
        2,
        L(
          'Șase, patru, trei, două note pe timp: frâna ritmică, la același tempo. A face invers, accelerează; B rămâne pe sextolete.',
          'Six, four, three, two notes per beat: the rhythmic brake, at the same tempo. A does the opposite, speeding up; B stays on sextuplets.',
        ),
      ),
      choice(
        'rlk',
        L(
          'În fill-ul R L K pe sextolete, de câte ori lovește fiecare mână pe un timp?',
          'In the R L K sextuplet fill, how many times does each hand strike per beat?',
        ),
        opts(
          ['O dată', 'Once'],
          ['De trei ori', 'Three times'],
          ['De două ori', 'Twice'],
          ['De șase ori', 'Six times'],
        ),
        2,
        L(
          'De două ori: din șase note pe timp, două sunt ale tobei mari. De aceea sună mult mai repede decât e.',
          'Twice: of the six notes per beat, two belong to the bass drum. That is why it sounds far faster than it is.',
        ),
      ),
    ],
  },
  {
    id: 'quiz-masuri-impare',
    stage: 'advanced',
    lessonId: 'masuri-impare',
    questions: [
      choice(
        'trei-plus-doi',
        L('Ce înseamnă 5/4 numărat ca 3+2?', 'What does 5/4 counted as 3+2 mean?'),
        opts(
          [
            '„Unu-doi-trei, unu-doi”: un grup de trei, apoi unul de doi',
            '"One-two-three, one-two": a group of three, then a group of two',
          ],
          ['Trei măsuri de 2/4', 'Three bars of 2/4'],
          ['Cinci timpi egali, fără grupe', 'Five even beats, no groups'],
          [
            'Trei lovituri de tobă mare și două de tobă mică',
            'Three bass drum and two snare strokes',
          ],
        ),
        0,
        L(
          'Doi pași de numărat, nu cinci: grupul lung, apoi cel scurt. Toba mare marchează începutul fiecăruia.',
          'Two chunks to count, not five: the long group, then the short. The bass drum marks the start of each.',
        ),
      ),
      listenChoice(
        'ce-grupare',
        L('Ascultă 7/8-ul. Cum e grupat?', 'Listen to the 7/8. How is it grouped?'),
        bar(
          'q-adv-m-7',
          7,
          { hhClosed: 'xxxxxxx', snare: '..x....', kick: 'x...x..' },
          { bpm: 180, beatsPerBar: 7 },
        ),
        opts(['3+2+2', '3+2+2'], ['Șapte egale', 'Seven even'], ['2+2+3', '2+2+3'], ['4+3', '4+3']),
        2,
        L(
          '2+2+3: „unu-doi, unu-doi, unu-doi-trei”. Grupul lung vine la capăt.',
          '2+2+3: "one-two, one-two, one-two-three". The long group comes last.',
        ),
      ),
      markHeard(
        'cinci-mare',
        L(
          '5/4 ca 3+2: marchează toba mare. Fusul și toba mică sunt scrise.',
          '5/4 as 3+2: mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-adv-m-5',
          10,
          { hhClosed: 'xxxxxxxxxx', snare: '....x...x.', kick: 'x.....x...' },
          { bpm: 96, beatsPerBar: 5 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1 și pe 4: începutul grupului de trei și al celui de doi.',
          'On 1 and on 4: the start of the three-group and of the two-group.',
        ),
      ),
      choice(
        'greseala',
        L('Care e greșeala tipică la măsurile impare?', 'What is the typical slip in odd meters?'),
        opts(
          ['Prea multe grupe', 'Too many groups'],
          [
            'Adaugi pe nesimțite o optime, ca să iasă o măsură „normală”',
            'You quietly add an eighth to make a "normal" bar',
          ],
          ['Toba mică prea tare', 'Snare too loud'],
          ['Tempoul prea mic', 'Tempo too slow'],
        ),
        1,
        L(
          'O optime în plus, din obișnuință. Numără grupele cu voce tare, nu până la șapte.',
          'One extra eighth, out of habit. Count the groups out loud, not up to seven.',
        ),
      ),
      pickHeard(
        'cinci-cum',
        L('Ascultă 5/4-ul. Care grilă e?', 'Listen to the 5/4. Which grid is it?'),
        bar(
          'q-adv-m-23',
          10,
          { hhClosed: 'xxxxxxxxxx', snare: '..x.....x.', kick: 'x...x.....' },
          { bpm: 100, beatsPerBar: 5 },
        ),
        [
          bar(
            'q-adv-m-23-a',
            10,
            { hhClosed: 'xxxxxxxxxx', snare: '....x...x.', kick: 'x.....x...' },
            { bpm: 100, beatsPerBar: 5 },
          ),
          bar(
            'q-adv-m-23-b',
            10,
            { hhClosed: 'xxxxxxxxxx', snare: '..x.....x.', kick: 'x...x.....' },
            { bpm: 100, beatsPerBar: 5 },
          ),
        ],
        1,
        L(
          '2+3: toba mare pe 1 și 3, toba mică pe 2 și 5. A e gruparea 3+2.',
          '2+3: bass drum on 1 and 3, snare on 2 and 5. A is the 3+2 grouping.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-poliritm-pe-set',
    stage: 'advanced',
    lessonId: 'poliritm-pe-set',
    questions: [
      choice(
        'unde-se-intalnesc',
        L(
          'La 3 contra 2, unde se întâlnesc cele două fluxuri?',
          'In 3 against 2, where do the two streams meet?',
        ),
        opts(
          ['Pe fiecare timp', 'On every beat'],
          ['Niciodată', 'Never'],
          ['Doar pe „unu”', 'Only on one'],
          ['Pe ultima notă', 'On the last note'],
        ),
        2,
        L(
          'Doar pe „unu”. Între, fiecare merge pe grila lui.',
          'Only on one. In between, each runs on its own grid.',
        ),
      ),
      markHeard(
        'ride-trei',
        L(
          '3 contra 2: marchează ride-ul. Toba mare e scrisă.',
          '3 against 2: mark the ride. The bass drum is written in.',
        ),
        bar('q-adv-p-32', 6, { ride: 'x.x.x.', kick: 'x..x..' }, { bpm: 56, beatsPerBar: 2 }),
        ['ride', 'kick'],
        ['kick'],
        L(
          'Pașii 1, 3, 5 din grila comună de șase: trei lovituri egale peste cei doi timpi.',
          'Steps 1, 3, 5 of the shared grid of six: three even strokes across the two beats.',
        ),
      ),
      listenChoice(
        'care-patru',
        L(
          'Ascultă 4 contra 3. Care piesă cântă patru?',
          'Listen to 4 against 3. Which piece plays four?',
        ),
        bar(
          'q-adv-p-43',
          12,
          { ride: 'x..x..x..x..', kick: 'x...x...x...' },
          { bpm: 56, beatsPerBar: 3 },
        ),
        opts(['Toba mare', 'The bass drum'], ['Ride-ul', 'The ride']),
        1,
        L(
          'Ride-ul, din trei în trei pași; toba mare, din patru în patru, cântă trei.',
          'The ride, every three steps; the bass drum, every four, plays three.',
        ),
      ),
      choice(
        'grila-comuna',
        L(
          'Câte părți are grila comună pentru 4 contra 3?',
          'How many parts does the shared grid for 4 against 3 have?',
        ),
        opts(['Șapte', 'Seven'], ['Opt', 'Eight'], ['Douăsprezece', 'Twelve'], ['Șase', 'Six']),
        2,
        L(
          'Douăsprezece: cel mai mic număr care se împarte și la 4, și la 3.',
          'Twelve: the smallest number divisible by both 4 and 3.',
        ),
      ),
      pickHeard(
        'in-groove',
        L(
          'Ascultă ride-ul peste groove. Care grilă e?',
          'Listen to the ride over the groove. Which grid is it?',
        ),
        bar(
          'q-adv-p-g',
          12,
          { ride: 'x.x.x.x.x.x.', snare: '...x.....x..', kick: 'x.....x.....' },
          { bpm: 66 },
        ),
        [
          bar(
            'q-adv-p-g-a',
            12,
            { ride: 'x.x.x.x.x.x.', snare: '...x.....x..', kick: 'x.....x.....' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-p-g-b',
            12,
            { ride: 'x..x..x..x..', snare: '...x.....x..', kick: 'x.....x.....' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-p-g-c',
            12,
            { ride: 'xxxxxxxxxxxx', snare: '...x.....x..', kick: 'x.....x.....' },
            { bpm: 66 },
          ),
        ],
        0,
        L(
          'Trei lovituri pe fiecare doi timpi: trioleți de pătrime peste un groove normal. B e pe timpi, C triolete pline.',
          'Three strokes every two beats: quarter-note triplets over a normal groove. B is on the beats, C full triplets.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-modulatia-metrica',
    stage: 'advanced',
    lessonId: 'modulatia-metrica',
    questions: [
      choice(
        'ce-e',
        L('Ce e modulația metrică?', 'What is metric modulation?'),
        opts(
          ['O schimbare de măsură', 'A change of time signature'],
          [
            'Schimbarea tempoului prin luarea unei subdiviziuni ca puls nou',
            'Changing tempo by taking a subdivision as the new pulse',
          ],
          ['Un fill în alt tempo', 'A fill in another tempo'],
          ['Accelerarea treptată', 'Gradually speeding up'],
        ),
        1,
        L(
          'O subdiviziune veche devine noul timp, iar tempoul se schimbă exact cât raportul dintre ele.',
          'An old subdivision becomes the new beat, and the tempo changes exactly by their ratio.',
        ),
      ),
      choice(
        'trioleti',
        L(
          'La 72 BPM, trioleții de pătrime devin noul timp. Care e tempoul nou?',
          'At 72 BPM, quarter-note triplets become the new beat. What is the new tempo?',
        ),
        opts(['96', '96'], ['144', '144'], ['48', '48'], ['108', '108']),
        3,
        L(
          '108: trei trioleți pe doi timpi, deci de 1,5 ori mai deși. 72 × 1,5 = 108.',
          '108: three triplets across two beats, so 1.5 times as dense. 72 × 1.5 = 108.',
        ),
      ),
      choice(
        'optimea-cu-punct',
        L(
          'La 72 BPM, optimea cu punct devine noul timp. Care e tempoul nou?',
          'At 72 BPM, the dotted eighth becomes the new beat. What is the new tempo?',
        ),
        opts(['96', '96'], ['108', '108'], ['54', '54'], ['144', '144']),
        0,
        L(
          '96: optimea cu punct e trei sferturi dintr-un timp, deci tempoul crește cu o treime.',
          '96: the dotted eighth is three quarters of a beat, so the tempo rises by a third.',
        ),
      ),
      listenChoice(
        'a-doua-masura',
        L(
          'Ascultă. Ce cântă fusul în a doua măsură?',
          'Listen. What does the hi-hat play in the second bar?',
        ),
        bar(
          'q-adv-mm-two',
          12,
          { hhClosed: 'x..x..x..x..', snare: '...x.....x..', kick: 'x.....x.....' },
          {
            bpm: 72,
            extraBars: [{ hhClosed: 'x.x.x.x.x.x.', snare: '...x.....x..', kick: 'x.....x.....' }],
          },
        ),
        opts(
          ['Optimi', 'Eighths'],
          ['Șaisprezecimi', 'Sixteenths'],
          [
            'Trioleți de pătrime: trei pe doi timpi',
            'Quarter-note triplets: three across two beats',
          ],
          ['Tot pătrimi', 'Still quarters'],
        ),
        2,
        L(
          'Trioleți de pătrime. Simțiți ca timpi, ei sunt tempoul nou.',
          'Quarter-note triplets. Felt as beats, they are the new tempo.',
        ),
      ),
      pickHeard(
        'puls-ascuns',
        L(
          'Ascultă accentele fusului. Care grilă e?',
          'Listen to the hi-hat accents. Which grid is it?',
        ),
        bar(
          'q-adv-mm-hid',
          16,
          { hhClosed: 'XxxXxxXxxXxxXxxX', snare: '....x.......x...', kick: 'x.......x.......' },
          { bpm: 72 },
        ),
        [
          bar(
            'q-adv-mm-hid-a',
            16,
            { hhClosed: 'XxxxXxxxXxxxXxxx', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
          bar(
            'q-adv-mm-hid-b',
            16,
            { hhClosed: 'XxXxXxXxXxXxXxXx', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
          bar(
            'q-adv-mm-hid-c',
            16,
            { hhClosed: 'XxxXxxXxxXxxXxxX', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 72 },
          ),
        ],
        2,
        L(
          'Accent din trei în trei șaisprezecimi: optimi cu punct, pulsul ascuns al modulației. A accentuează timpii, B fiecare optime.',
          'An accent every three sixteenths: dotted eighths, the modulation’s hidden pulse. A accents the beats, B every eighth.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-tehnica-dubla',
    stage: 'advanced',
    lessonId: 'tehnica-dubla',
    questions: [
      choice(
        'calcai',
        L('Pentru dublă rapidă, cum stă călcâiul?', 'For fast double bass, where is the heel?'),
        opts(
          ['Jos, lipit de pedală', 'Down, flat on the pedal'],
          ['Sus, mișcarea vine din gleznă', 'Up, the movement comes from the ankle'],
          ['Nu contează', 'It does not matter'],
          ['Pe podea, lângă pedală', 'On the floor, beside the pedal'],
        ),
        1,
        L(
          'Sus: forță și viteză din gleznă. Călcâiul jos dă control și volum mic.',
          'Up: power and speed from the ankle. Heel down gives control and less volume.',
        ),
      ),
      choice(
        'piciorul-slab',
        L(
          'Care picior e aproape mereu cel slab, și cum îl repari?',
          'Which foot is almost always the weak one, and how do you fix it?',
        ),
        opts(
          ['Dreptul; îl odihnești', 'The right; rest it'],
          ['Stângul; exersezi pornind și cu el', 'The left; practise leading with it too'],
          ['Niciunul', 'Neither'],
          ['Stângul; nu-l folosești la dublă', 'The left; leave it out of double bass'],
        ),
        1,
        L(
          'Stângul. Pornit în față, ca mâna slabă la rudimente; trioletele îl pun singure pe timp.',
          'The left. Put it in front, like the weak hand in rudiments; triplets put it on the beat by themselves.',
        ),
      ),
      markHeard(
        'rafala',
        L(
          'Marchează toba mare. Fusul și toba mică sunt scrise.',
          'Mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-adv-t-burst',
          16,
          { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxx.x.x.x.' },
          { bpm: 60 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Șaisprezecimi pe timpii 1 și 2, optimi pe 3 și 4: a doua treaptă spre dubla continuă.',
          'Sixteenths on beats 1 and 2, eighths on 3 and 4: the second step towards continuous double bass.',
        ),
      ),
      listenChoice(
        'ce-subdiviziune',
        L(
          'Ascultă toba mare. Ce subdiviziune e?',
          'Listen to the bass drum. Which subdivision is it?',
        ),
        bar(
          'q-adv-t-tri',
          12,
          { hhClosed: 'x..x..x..x..', snare: '...x.....x..', kick: 'xxxxxxxxxxxx' },
          { bpm: 64 },
        ),
        opts(['Optimi', 'Eighths'], ['Șaisprezecimi', 'Sixteenths'], ['Triolete', 'Triplets']),
        2,
        L(
          'Triolete: trei lovituri pe timp, deci fiecare timp începe cu alt picior.',
          'Triplets: three strokes per beat, so each beat starts with a different foot.',
        ),
      ),
      pickHeard(
        'care-treapta',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar(
          'q-adv-t-step',
          16,
          { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
          { bpm: 66 },
        ),
        [
          bar(
            'q-adv-t-step-a',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.x.x.x.x.x.x.x.' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-t-step-b',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxx.x.x.x.' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-t-step-c',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' },
            { bpm: 66 },
          ),
        ],
        2,
        L(
          'Șaisprezecimi pe toată măsura: treapta a treia. A e prima (optimi), B a doua (rafală).',
          'Sixteenths for the whole bar: the third step. A is the first (eighths), B the second (a burst).',
        ),
      ),
    ],
  },

  {
    id: 'quiz-maturi',
    stage: 'advanced',
    lessonId: 'maturi',
    questions: [
      choice(
        'ce-sunt',
        L('Ce sunt măturile?', 'What are brushes?'),
        opts(
          ['Bețe cu fire subțiri de metal', 'Sticks with thin metal wires'],
          ['Bețe mai groase', 'Thicker sticks'],
          ['Un fel de cinel', 'A kind of cymbal'],
          ['Pedale pentru toba mare', 'Bass drum pedals'],
        ),
        0,
        L(
          'Bețe cu fire de metal, pentru jazz și balade. Lovite sună moale și scurt.',
          'Sticks with metal wires, for jazz and ballads. Struck, they sound soft and short.',
        ),
      ),
      listenChoice(
        'ce-se-schimba',
        L(
          'Ascultă două măsuri. Ce se schimbă în a doua?',
          'Listen to two bars. What changes in the second?',
        ),
        bar('q-adv-b-two', 4, { snare: 'xxxx' }, { bpm: 72, extraBars: [{ brush: 'xxxx' }] }),
        opts(
          ['Tempoul', 'The tempo'],
          ['Toba', 'The drum'],
          ['Bățul devine mătură', 'The stick becomes a brush'],
          ['Nimic', 'Nothing'],
        ),
        2,
        L(
          'Aceeași tobă mică, lovită cu mătura: mai moale, mai scurt, fără pocnet.',
          'The same snare, struck with a brush: softer, shorter, without the crack.',
        ),
      ),
      choice(
        'mainile',
        L(
          'În mod obișnuit, ce face fiecare mână cu măturile?',
          'Usually, what does each hand do with brushes?',
        ),
        opts(
          ['Amândouă bat ritmul de ride', 'Both tap the ride pattern'],
          [
            'Stânga mătură în cerc, dreapta bate ritmul de ride',
            'The left sweeps in circles, the right taps the ride pattern',
          ],
          ['Dreapta mătură, stânga ține fusul', 'The right sweeps, the left keeps the hi-hat'],
          ['Amândouă mătură', 'Both sweep'],
        ),
        1,
        L(
          'Stânga mătură în cerc și ține timpul; dreapta bate ritmul de ride pe toba mică.',
          'The left sweeps in circles and keeps time; the right taps the ride pattern on the snare.',
        ),
      ),
      markHeard(
        'balada',
        L(
          'Balada cu mături: marchează mătura. Restul e scris.',
          'The brush ballad: mark the brush. The rest is written in.',
        ),
        bar(
          'q-adv-b-ballad',
          8,
          { brush: 'x.X.x.X.', hhFoot: '..x...x.', kick: 'o...o...' },
          { bpm: 60 },
        ),
        ['brush', 'kick', 'hhFoot'],
        ['kick', 'hhFoot'],
        L(
          'Pe fiecare timp, apăsată pe 2 și 4. Grila marchează doar unde cade, nu cât de tare.',
          'On every beat, leaning on 2 and 4. The grid marks only where it lands, not how hard.',
        ),
      ),
      pickHeard(
        'jazz-pe-matura',
        L('Ascultă mătura. Care grilă e?', 'Listen to the brush. Which grid is it?'),
        bar(
          'q-adv-b-jazz',
          12,
          { brush: 'x..X.xx..X.x', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
          { bpm: 96 },
        ),
        [
          bar(
            'q-adv-b-jazz-a',
            12,
            { brush: 'x..x..x..x..', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
            { bpm: 96 },
          ),
          bar(
            'q-adv-b-jazz-b',
            12,
            { brush: 'x..X.xx..X.x', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
            { bpm: 96 },
          ),
          bar(
            'q-adv-b-jazz-c',
            12,
            { brush: 'xxxxxxxxxxxx', hhFoot: '...x.....x..', kick: 'o..o..o..o..' },
            { bpm: 96 },
          ),
        ],
        1,
        L(
          'Ritmul de ride cântat cu mătura: „ding, ding-da”. A sunt doar pătrimi, C triolete pline.',
          'The ride pattern played with a brush: "ding, ding-da". A is just quarters, C full triplets.',
        ),
      ),
    ],
  },

  {
    id: 'review-advanced',
    stage: 'advanced',
    questions: [
      markHeard(
        'r-independenta',
        L(
          'Ostinato de rock: marchează toba mică. Restul e scris.',
          'Rock ostinato: mark the snare. The rest is written in.',
        ),
        bar('q-adv-rv-ind', 8, { ...ROCK, snare: '.x.x.x.x' }, { bpm: 72 }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'kick'],
        L(
          'Pe toți „și”-ii: toba mică s-a mutat cu totul pe contratimp, restul nu.',
          'On every "and": the snare has moved entirely onto the off-beat, nothing else has.',
        ),
      ),
      choice(
        'r-linear-regula',
        L(
          'Te uiți la grila unui groove. Cum știi dacă e linear?',
          'You look at a groove’s grid. How do you know if it is linear?',
        ),
        opts(
          ['Are doar două rânduri', 'It has only two rows'],
          ['Nicio coloană n-are două pătrate', 'No column has two squares'],
          ['Are fusul pe șaisprezecimi', 'It has sixteenth-note hi-hat'],
          ['Nu are toba mare', 'It has no bass drum'],
        ),
        1,
        L(
          'Nicio coloană cu două pătrate: o singură piesă pe fiecare pas.',
          'No column with two squares: a single piece on every step.',
        ),
      ),
      listenChoice(
        'r-deplasare',
        L(
          'Ascultă a doua măsură. Ce s-a întâmplat cu groove-ul?',
          'Listen to the second bar. What happened to the groove?',
        ),
        bar('q-adv-rv-dep', 8, ROCK, {
          bpm: 84,
          extraBars: [{ hhClosed: 'xxxxxxxx', snare: '.x...x..', kick: '...x...x' }],
        }),
        opts(
          ['E mutat cu o optime mai devreme', 'It is moved one eighth earlier'],
          ['E mutat cu o optime mai târziu', 'It is moved one eighth later'],
          ['E un groove nou', 'It is a new groove'],
          ['E în half-time', 'It is in half-time'],
        ),
        0,
        L(
          'Cu o optime mai devreme: toba mare pe „doi-și” și „patru-și”, chiar înainte de timpi.',
          'One eighth earlier: bass drum on the "and" of 2 and 4, just before the beats.',
        ),
      ),
      choice(
        'r-sapte',
        L('Cum numeri 7/8 ca 3+2+2?', 'How do you count 7/8 as 3+2+2?'),
        opts(
          ['„Unu-doi, unu-doi, unu-doi-trei”', '"One-two, one-two, one-two-three"'],
          ['„Unu-doi-trei-patru, unu-doi-trei”', '"One-two-three-four, one-two-three"'],
          ['„Unu-doi-trei, unu-doi, unu-doi”', '"One-two-three, one-two, one-two"'],
          ['Până la șapte, la rând', 'Up to seven, straight through'],
        ),
        2,
        L(
          'Grupul lung întâi: „unu-doi-trei, unu-doi, unu-doi”.',
          'The long group first: "one-two-three, one-two, one-two".',
        ),
      ),
      markHeard(
        'r-sapte-mare',
        L(
          '7/8 ca 3+2+2: marchează toba mare. Fusul și toba mică sunt scrise.',
          '7/8 as 3+2+2: mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-adv-rv-7',
          7,
          { hhClosed: 'xxxxxxx', snare: '...x...', kick: 'x....x.' },
          { bpm: 168, beatsPerBar: 7 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe începutul primului și al ultimului grup: pașii 1 și 6. Toba mică pe al doilea grup.',
          'On the start of the first and last groups: steps 1 and 6. The snare on the second group.',
        ),
      ),
      pickHeard(
        'r-poliritm',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar('q-adv-rv-32', 6, { ride: 'x.x.x.', kick: 'x..x..' }, { bpm: 60, beatsPerBar: 2 }),
        [
          bar('q-adv-rv-32-a', 6, { ride: 'x..x..', kick: 'x.x.x.' }, { bpm: 60, beatsPerBar: 2 }),
          bar('q-adv-rv-32-b', 6, { ride: 'x.x.x.', kick: 'x..x..' }, { bpm: 60, beatsPerBar: 2 }),
          bar('q-adv-rv-32-c', 6, { ride: 'xxxxxx', kick: 'x..x..' }, { bpm: 60, beatsPerBar: 2 }),
        ],
        1,
        L(
          'Ride-ul trei, toba mare două. A le inversează: ride-ul două, toba mare trei.',
          'Ride three, bass drum two. A swaps them: ride two, bass drum three.',
        ),
      ),
      choice(
        'r-modulatie',
        L(
          'La 80 BPM, trioleții de pătrime devin noul timp. Tempoul nou e…',
          'At 80 BPM, quarter-note triplets become the new beat. The new tempo is…',
        ),
        opts(['100', '100'], ['120', '120'], ['160', '160'], ['60', '60']),
        1,
        L('120: × 1,5, ca la 72 → 108.', '120: × 1.5, as with 72 → 108.'),
      ),
      markHeard(
        'r-linear-mare',
        L(
          'Grupul de trei linear: marchează toba mare. Restul e scris.',
          'The linear group of three: mark the bass drum. The rest is written in.',
        ),
        bar(
          'q-adv-rv-lin',
          12,
          { hhClosed: 'x..x..x..x..', snare: '.x..x..x..x.', kick: '..x..x..x..x' },
          { bpm: 66 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Ultima notă din fiecare grup de trei: acolo unde nu cade nimic altceva.',
          'The last note of every group of three: where nothing else lands.',
        ),
      ),
      listenChoice(
        'r-matura',
        L('Ce lovește toba mică aici?', 'What is striking the snare here?'),
        bar('q-adv-rv-brush', 8, { brush: 'xxxxxxxx', kick: 'x..xx..x' }, { bpm: 80 }),
        opts(
          ['Bățul', 'A stick'],
          ['Mătura', 'A brush'],
          ['Mâna', 'A hand'],
          ['Cross-stick', 'Cross-stick'],
        ),
        1,
        L(
          'Mătura: sunet moale, scurt, fără pocnetul bățului. Aici, pe bossa.',
          'A brush: a soft, short sound, without the stick’s crack. Here, on a bossa.',
        ),
      ),
      choice(
        'r-progres',
        L(
          'Aplicația nu te aude. Cum știi că o treaptă de independență e învățată?',
          'The app cannot hear you. How do you know an independence step is learned?',
        ),
        opts(
          ['Când ai cântat-o o dată', 'When you have played it once'],
          [
            'Când merge de trei ori la rând fără să se clatine ostinato-ul, la tempoul piesei',
            'When it runs three times in a row without the ostinato wavering, at the song’s tempo',
          ],
          ['Când îți place cum sună', 'When you like how it sounds'],
          ['După o săptămână', 'After a week'],
        ),
        1,
        L(
          'De trei ori la rând, curat, apoi la tempoul piesei. Notează tempoul și urcă de acolo.',
          'Three times in a row, clean, then at the song’s tempo. Note the tempo and climb from there.',
        ),
      ),
      pickHeard(
        'r-dubla',
        L('Ascultă toba mare. Care grilă e?', 'Listen to the bass drum. Which grid is it?'),
        bar(
          'q-adv-rv-dbl',
          16,
          { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxx.x.x.x.' },
          { bpm: 66 },
        ),
        [
          bar(
            'q-adv-rv-dbl-a',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxxxxxxx.x.x.x.' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-rv-dbl-b',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.x.x.x.xxxxxxxx' },
            { bpm: 66 },
          ),
          bar(
            'q-adv-rv-dbl-c',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxx....xxxx....' },
            { bpm: 66 },
          ),
        ],
        0,
        L(
          'Rafala pe primii doi timpi, optimi după. B o pune la capăt, C are rafale scurte pe 1 și 3.',
          'The burst on the first two beats, eighths after. B puts it at the end, C has short bursts on 1 and 3.',
        ),
      ),
      choice(
        'r-cand-deplasare',
        L('Când folosești deplasarea într-o piesă?', 'When do you use displacement in a song?'),
        opts(
          ['Toată piesa', 'For the whole song'],
          [
            'O măsură sau două, ca efect, cu trupa știind că vine',
            'For a bar or two, as an effect, with the band knowing it is coming',
          ],
          ['La fiecare refren, prin surprindere', 'In every chorus, as a surprise'],
          ['Niciodată, e doar un exercițiu', 'Never, it is only an exercise'],
        ),
        1,
        L(
          'Ca efect scurt, știut de toată trupa. O deplasare-surpriză sună ca o greșeală.',
          'As a short effect the whole band knows about. A surprise displacement sounds like a mistake.',
        ),
      ),
    ],
  },
]
