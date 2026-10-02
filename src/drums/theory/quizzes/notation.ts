import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import {
  bar,
  choice,
  L,
  listenChoice,
  markHeard,
  markRead,
  opts,
  pickHeard,
  pickRead,
  readChoice,
} from './helpers'

/*
  Etapa 1, Notația.

  Aici apar primele întrebări de CITIT: portativul arătat, grila de ales sau de
  completat. Măsurile arătate pe portativ n-au accente pe o singură piesă dintr-o
  coloană: portativul desenează accentul o dată pe toată coloana (vezi antetul
  din `lessons/notation.ts`), deci un accent parțial s-ar citi greșit.
*/

const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }

export const notationQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-portativul-si-pozitiile',
    stage: 'notation',
    lessonId: 'portativul-si-pozitiile',
    questions: [
      choice(
        'x-cap',
        L(
          'Ce înseamnă, de obicei, un cap de notă desenat ca ×?',
          'What does a notehead drawn as an × usually mean?',
        ),
        opts(
          ['O tobă', 'A drum'],
          ['Un cinel', 'A cymbal'],
          ['O pauză', 'A rest'],
          ['Un accent', 'An accent'],
        ),
        1,
        L(
          'Un cinel: fus, ride sau crash. Tobele au capete rotunde. Poziția pe portativ spune care cinel.',
          'A cymbal: hi-hat, ride or crash. Drums have round heads. The position on the staff tells you which cymbal.',
        ),
      ),
      choice(
        'unde-toba-mare',
        L('Unde stă toba mare pe portativ?', 'Where does the bass drum sit on the staff?'),
        opts(
          ['Pe linia de sus', 'On the top line'],
          ['În spațiul din mijloc', 'In the middle space'],
          ['Pe o linie suplimentară', 'On a ledger line'],
          ['În spațiul de jos', 'In the bottom space'],
        ),
        3,
        L(
          'În spațiul de jos: sună cel mai jos, deci stă cel mai jos. Toba mică e în spațiul din mijloc.',
          'In the bottom space: it sounds lowest, so it sits lowest. The snare is in the middle space.',
        ),
      ),
      pickRead(
        'portativ-in-grila',
        L(
          'Care grilă spune același lucru ca portativul?',
          'Which grid says the same thing as the staff?',
        ),
        bar('q-not-p-rock', 8, { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' }),
        'staff',
        [
          bar('q-not-p-a', 8, { hhClosed: 'xxxxxxxx', snare: 'x..xx...', kick: '..x...x.' }),
          bar('q-not-p-b', 8, { hhClosed: 'x.x.x.x.', snare: '..x...x.', kick: 'x..xx...' }),
          bar('q-not-p-c', 8, { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' }),
          bar('q-not-p-d', 8, { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }),
        ],
        2,
        L(
          'Fusul pe toate optimile, toba mică pe 2 și 4, toba mare pe 1, pe „doi-și” și pe 3. A inversează toba mare cu toba mică, B are fusul pe pătrimi, D a pierdut nota de pe „doi-și”.',
          'Hi-hat on every eighth, snare on 2 and 4, bass drum on 1, the "and" of 2 and 3. A swaps bass drum and snare, B has the hi-hat on quarters, D has lost the note on the "and" of 2.',
        ),
      ),
      markRead(
        'transcrie',
        L(
          'Transcrie pe grilă toba mică și toba mare de pe portativ. Fusul e deja scris.',
          'Transcribe the snare and bass drum from the staff onto the grid. The hi-hat is already written in.',
        ),
        bar('q-not-p-transcrie', 8, { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x.x.' }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed'],
        L(
          'Toba mică în spațiul din mijloc, pe 2 și 4. Toba mare în spațiul de jos, pe 1, pe 3 și pe „trei-și”.',
          'Snare in the middle space, on 2 and 4. Bass drum in the bottom space, on 1, on 3 and on the "and" of 3.',
        ),
      ),
      choice(
        'aceeasi-codita',
        L(
          'Două capete de notă pe aceeași codiță înseamnă că piesele…',
          'Two noteheads on the same stem mean the pieces are…',
        ),
        opts(
          ['se lovesc una după alta', 'struck one after the other'],
          ['sunt accentuate', 'accented'],
          ['se lovesc deodată', 'struck together'],
          ['sunt pe aceeași tobă', 'on the same drum'],
        ),
        2,
        L(
          'Se lovesc deodată, ca o coloană în grilă. De obicei e fusul cu toba mare sau cu toba mică.',
          'Struck together, like one column on the grid. Usually the hi-hat with the bass drum or the snare.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-valorile-notelor',
    stage: 'notation',
    lessonId: 'valorile-notelor',
    questions: [
      choice(
        'durata',
        L(
          'La tobe, durata scrisă a unei note îți spune…',
          'On drums, the written length of a note tells you…',
        ),
        opts(
          ['cât sună lovitura', 'how long the stroke rings'],
          ['când vine lovitura următoare', 'when the next stroke comes'],
          ['cât de tare lovești', 'how hard to hit'],
          ['pe ce tobă lovești', 'which drum to hit'],
        ),
        1,
        L(
          'Când vine următoarea: o tobă nu poate ține sunetul, deci o pătrime și o notă întreagă sună la fel. Diferă doar pauza până la lovitura următoare.',
          'When the next one comes: a drum cannot sustain, so a quarter and a whole note sound the same. Only the gap before the next stroke differs.',
        ),
      ),
      readChoice(
        'ce-valori',
        L(
          'Ce valori are fusul pe acest portativ?',
          'What note values does the hi-hat have on this staff?',
        ),
        bar('q-not-v-quarters', 4, { hhClosed: 'xxxx', snare: '.x.x', kick: 'x.x.' }),
        'staff',
        opts(
          ['Pătrimi', 'Quarters'],
          ['Optimi', 'Eighths'],
          ['Șaisprezecimi', 'Sixteenths'],
          ['Triolete', 'Triplets'],
        ),
        0,
        L(
          'Pătrimi: o notă pe timp, fără bare de grupare. Optimile ar fi legate câte două cu o bară.',
          'Quarters: one note per beat, with no beams. Eighths would be joined in pairs by one beam.',
        ),
      ),
      choice(
        'bare',
        L('Câte bare de grupare leagă șaisprezecimile?', 'How many beams join sixteenth notes?'),
        opts(['Una', 'One'], ['Niciuna', 'None'], ['Trei', 'Three'], ['Două', 'Two']),
        3,
        L(
          'Două. Regula: o bară înseamnă optimi, două bare înseamnă șaisprezecimi.',
          'Two. The rule: one beam means eighths, two beams mean sixteenths.',
        ),
      ),
      pickHeard(
        'cat-de-des',
        L(
          'Ascultă fusul. Care grilă e ce auzi?',
          'Listen to the hi-hat. Which grid is what you hear?',
        ),
        bar(
          'q-not-v-16',
          16,
          { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...', kick: 'x.......x.......' },
          { bpm: 76 },
        ),
        [
          bar(
            'q-not-v-a',
            16,
            { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 76 },
          ),
          bar(
            'q-not-v-b',
            16,
            { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 76 },
          ),
          bar(
            'q-not-v-c',
            16,
            { hhClosed: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...', kick: 'x.......x.......' },
            { bpm: 76 },
          ),
        ],
        2,
        L(
          'Șaisprezecimi: patru lovituri de fus pe fiecare timp. A sunt pătrimi, B optimi; toba mare și toba mică sunt aceleași în toate trei.',
          'Sixteenths: four hi-hat strokes on every beat. A is quarters, B eighths; bass drum and snare are the same in all three.',
        ),
      ),
      markHeard(
        'patrimi-sau-optimi',
        L(
          'Marchează fusul. Atenție: pătrimi sau optimi?',
          'Mark the hi-hat. Careful: quarters or eighths?',
        ),
        bar(
          'q-not-v-mark',
          8,
          { hhClosed: 'x.x.x.x.', snare: '..x...x.', kick: 'x...x...' },
          { bpm: 76 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['snare', 'kick'],
        L(
          'Pătrimi: o lovitură pe timp, pe 1, 2, 3 și 4. Pe „și” fusul tace, deci groove-ul sună mai rar.',
          'Quarters: one stroke a beat, on 1, 2, 3 and 4. On the "and" the hi-hat is silent, so the groove sounds sparser.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-intensitati',
    stage: 'notation',
    lessonId: 'intensitati',
    questions: [
      choice(
        'semnul-accent',
        L('Ce înseamnă un „>” deasupra notei?', 'What does a ">" above a note mean?'),
        opts(
          ['Accent: lovitura iese în față', 'Accent: the stroke stands out'],
          ['Ghost note', 'Ghost note'],
          ['Repetă măsura', 'Repeat the bar'],
          ['Pauză', 'Rest'],
        ),
        0,
        L(
          'Accent: lovitura iese în față față de cele din jur.',
          'Accent: the stroke stands out from those around it.',
        ),
      ),
      choice(
        'semnul-ghost',
        L('Cum se scrie un ghost note?', 'How is a ghost note written?'),
        opts(
          ['Cu × în loc de cap rotund', 'With an × instead of a round head'],
          ['Cu un cerculeț deasupra', 'With a small circle above'],
          ['Cu capul în paranteze', 'With the head in brackets'],
          ['Cu două bare', 'With two beams'],
        ),
        2,
        L(
          'Capul în paranteze. Cerculețul deasupra e fusul deschis, iar × e un cinel sau cross-stick-ul.',
          'The head in brackets. A circle above is the open hi-hat, and an × is a cymbal or the cross-stick.',
        ),
      ),
      listenChoice(
        'unde-accentele',
        L('Ascultă fusul. Unde sunt accentele?', 'Listen to the hi-hat. Where are the accents?'),
        bar('q-not-i-off', 8, { hhClosed: 'xXxXxXxX' }, { bpm: 76 }),
        opts(
          ['Pe timpi', 'On the beats'],
          ['Pe „și”', 'On the "and"'],
          ['Pe toate optimile', 'On every eighth'],
          ['Nicăieri', 'Nowhere'],
        ),
        1,
        L(
          'Pe „și”, între timpi. Accentele pe contratimp dau un mers săltat, ca la disco sau la ska.',
          'On the "and", between the beats. Off-beat accents give a bouncy feel, as in disco or ska.',
        ),
      ),
      pickHeard(
        'ghosturi',
        L(
          'Ascultă toba mică. Care grilă e ce auzi?',
          'Listen to the snare. Which grid is what you hear?',
        ),
        bar(
          'q-not-i-g',
          8,
          { hhClosed: 'xxxxxxxx', snare: 'o.X.o.X.', kick: 'x...x...' },
          { bpm: 76 },
        ),
        [
          bar(
            'q-not-i-g-a',
            8,
            { hhClosed: 'xxxxxxxx', snare: '..X...X.', kick: 'x...x...' },
            { bpm: 76 },
          ),
          bar(
            'q-not-i-g-b',
            8,
            { hhClosed: 'xxxxxxxx', snare: 'o.X.o.X.', kick: 'x...x...' },
            { bpm: 76 },
          ),
          bar(
            'q-not-i-g-c',
            8,
            { hhClosed: 'xxxxxxxx', snare: 'X.X.X.X.', kick: 'x...x...' },
            { bpm: 76 },
          ),
        ],
        1,
        L(
          'Backbeat-ul tare pe 2 și 4, iar pe 1 și 3 câte un ghost note, abia auzit. În C, loviturile de pe 1 și 3 ar fi la fel de tari ca backbeat-ul.',
          'A loud backbeat on 2 and 4, with a barely heard ghost note on 1 and 3. In C the strokes on 1 and 3 would be as loud as the backbeat.',
        ),
      ),
      listenChoice(
        'cross-stick',
        L(
          'Ascultă sunetul de pe 2 și 4. Ce lovitură e?',
          'Listen to the sound on 2 and 4. Which stroke is it?',
        ),
        bar(
          'q-not-i-cross',
          8,
          { hhClosed: 'xxxxxxxx', crossStick: '..x...x.', kick: 'x...x...' },
          { bpm: 72 },
        ),
        opts(
          ['Lovitură normală de tobă mică', 'A normal snare stroke'],
          ['Ghost note', 'Ghost note'],
          ['Accent', 'Accent'],
          ['Cross-stick', 'Cross-stick'],
        ),
        3,
        L(
          'Cross-stick: bățul culcat pe toba mică, coada lovind cercul. Sunet sec, de lemn, de baladă.',
          'Cross-stick: the stick laid on the snare, its butt striking the rim. A dry, woody ballad sound.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-triolete-si-shuffle',
    stage: 'notation',
    lessonId: 'triolete-si-shuffle',
    questions: [
      choice(
        'cifra-3',
        L(
          'Ce înseamnă cifra 3 deasupra unui grup de note?',
          'What does a 3 above a group of notes mean?',
        ),
        opts(
          ['Trei note egale în locul a două', 'Three equal notes in the place of two'],
          ['Repetă de trei ori', 'Repeat three times'],
          ['Al treilea timp', 'The third beat'],
          ['Trei timpi pe măsură', 'Three beats per bar'],
        ),
        0,
        L(
          'Un triolet: trei note egale într-un timp, în loc de două.',
          'A triplet: three equal notes in one beat, instead of two.',
        ),
      ),
      choice(
        'ce-e-shuffle',
        L('Shuffle-ul e trioletul…', 'The shuffle is the triplet…'),
        opts(
          ['cu ultima notă scoasă', 'with its last note removed'],
          ['cu nota din mijloc scoasă', 'with its middle note removed'],
          ['cu toate trei accentuate', 'with all three accented'],
          ['cântat de două ori mai repede', 'played twice as fast'],
        ),
        1,
        L(
          'Cu mijlocul scos: rămâne lung-scurt, lung-scurt.',
          'With the middle removed: long-short, long-short is what remains.',
        ),
      ),
      listenChoice(
        'drept-sau-leganat',
        L('Ascultă ride-ul. Cum merge?', 'Listen to the ride. How does it move?'),
        bar(
          'q-not-t-shuffle',
          12,
          { ride: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' },
          { bpm: 80 },
        ),
        opts(
          ['Drept: optimi egale', 'Straight: even eighths'],
          ['Triolete pline: trei egale pe timp', 'Full triplets: three even per beat'],
          ['Shuffle: lung-scurt', 'Shuffle: long-short'],
          ['Șaisprezecimi', 'Sixteenths'],
        ),
        2,
        L(
          'Shuffle: prima și a treia notă din fiecare triolet, deci lung-scurt. Optimile drepte ar fi egale între ele.',
          'Shuffle: the first and third note of each triplet, so long-short. Straight eighths would be even.',
        ),
      ),
      markHeard(
        'marcheaza-shuffle',
        L(
          'Marchează ride-ul pe grila de triolete. Toba mică și toba mare sunt scrise.',
          'Mark the ride on the triplet grid. Snare and bass drum are written in.',
        ),
        bar(
          'q-not-t-mark',
          12,
          { ride: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' },
          { bpm: 72 },
        ),
        ['ride', 'snare', 'kick'],
        ['snare', 'kick'],
        L(
          'Pe fiecare timp, primul și al treilea pătrat din cei trei. Mijlocul rămâne gol: asta face shuffle-ul.',
          'On every beat, the first and third of the three squares. The middle stays empty: that is what makes it a shuffle.',
        ),
      ),
      pickRead(
        'ride-jazz',
        L('Care grilă e portativul ăsta?', 'Which grid is this staff?'),
        bar('q-not-t-jazz', 12, { ride: 'x..x.xx..x.x', hhFoot: '...x.....x..' }, { bpm: 84 }),
        'staff',
        [
          bar('q-not-t-jazz-a', 12, { ride: 'x.xx.xx.xx.x', hhFoot: '...x.....x..' }, { bpm: 84 }),
          bar('q-not-t-jazz-b', 12, { ride: 'x..x.xx..x.x', hhFoot: '...x.....x..' }, { bpm: 84 }),
          bar('q-not-t-jazz-c', 12, { ride: 'xxxxxxxxxxxx', hhFoot: '...x.....x..' }, { bpm: 84 }),
        ],
        1,
        L(
          'Ride-ul de jazz: „ding” pe 1 și 3, „ding-da” pe 2 și 4, cu fusul de la picior pe 2 și 4. A e shuffle pe toți timpii, C triolete pline.',
          'The jazz ride: "ding" on 1 and 3, "ding-da" on 2 and 4, with the foot hi-hat on 2 and 4. A is a shuffle on every beat, C full triplets.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-dubla-si-crash',
    stage: 'notation',
    lessonId: 'dubla-si-crash',
    questions: [
      choice(
        'cum-se-scrie-dubla',
        L(
          'Cum se scrie dubla pe portativ, față de toba mare cântată cu un singur picior?',
          'How is double bass written on the staff, compared with a bass drum played by one foot?',
        ),
        opts(
          ['Pe altă linie', 'On a different line'],
          ['Cu × în loc de cap rotund', 'With an × instead of a round head'],
          ['Cu două capete pe codiță', 'With two heads on the stem'],
          ['La fel, doar notele sunt mai dese', 'The same, only the notes are denser'],
        ),
        3,
        L(
          'La fel: aceeași poziție, același cap. Se schimbă doar densitatea.',
          'The same: same position, same head. Only the density changes.',
        ),
      ),
      choice(
        'unde-crash',
        L('Unde stă crash-ul pe portativ?', 'Where does the crash sit on the staff?'),
        opts(
          ['Pe o linie suplimentară, sus de tot', 'On a ledger line, at the very top'],
          ['În spațiul de jos', 'In the bottom space'],
          ['Pe linia din mijloc', 'On the middle line'],
          ['Sub portativ', 'Below the staff'],
        ),
        0,
        L(
          'Sus de tot, pe linia lui suplimentară, cu ×.',
          'At the very top, on its own ledger line, with an ×.',
        ),
      ),
      listenChoice(
        'pe-ce-timp-crash',
        L('Ascultă. Pe ce timp cade crash-ul?', 'Listen. On which beat does the crash land?'),
        bar(
          'q-not-d-crash',
          8,
          { crash: 'x.......', hhClosed: '.xxxxxxx', snare: '..x...x.', kick: 'x...x...' },
          { bpm: 84 },
        ),
        opts(['Pe 2', 'On 2'], ['Pe 1', 'On 1'], ['Pe 4', 'On 4'], ['Pe 3', 'On 3']),
        1,
        L(
          'Pe „unu”, odată cu toba mare: locul obișnuit al crash-ului.',
          'On one, together with the bass drum: the crash’s usual place.',
        ),
      ),
      markHeard(
        'rafale',
        L(
          'Marchează toba mare. Fusul și toba mică sunt scrise.',
          'Mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-not-d-burst',
          16,
          { hhClosed: 'x...x...x...x...', snare: '....x.......x...', kick: 'xxxx....xxxx....' },
          { bpm: 70 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Două rafale de șaisprezecimi: tot timpul 1 și tot timpul 3. Pe 2 și 4 toba mare tace, acolo e backbeat-ul.',
          'Two sixteenth-note bursts: all of beat 1 and all of beat 3. On 2 and 4 the bass drum rests, that is where the backbeat is.',
        ),
      ),
      pickRead(
        'densitate',
        L('Care grilă e portativul ăsta?', 'Which grid is this staff?'),
        bar('q-not-d-dens', 16, { snare: '....x.......x...', kick: 'x.x.x.x.x.x.x.x.' }),
        'staff',
        [
          bar('q-not-d-dens-a', 16, { snare: '....x.......x...', kick: 'xxxxxxxxxxxxxxxx' }),
          bar('q-not-d-dens-b', 16, { snare: '....x.......x...', kick: 'x...x...x...x...' }),
          bar('q-not-d-dens-c', 16, { snare: '....x.......x...', kick: 'x.x.x.x.x.x.x.x.' }),
        ],
        2,
        L(
          'Optimi pe toba mare: note legate câte două, cu o singură bară. Două bare ar fi fost șaisprezecimi (A); fără bare, pătrimi (B).',
          'Eighths on the bass drum: notes joined in pairs by a single beam. Two beams would be sixteenths (A); no beams, quarters (B).',
        ),
      ),
    ],
  },

  {
    id: 'review-notation',
    stage: 'notation',
    questions: [
      choice(
        'r-toba-mica',
        L('Unde stă toba mică pe portativ?', 'Where does the snare sit on the staff?'),
        opts(
          ['În spațiul de jos', 'In the bottom space'],
          ['În spațiul din mijloc', 'In the middle space'],
          ['Pe linia de sus', 'On the top line'],
          ['Deasupra portativului', 'Above the staff'],
        ),
        1,
        L(
          'În spațiul din mijloc, sub tomuri, deși sună mai ascuțit decât ele. E convenția din toate cărțile.',
          'In the middle space, below the toms, even though it sounds higher. It is the convention in every book.',
        ),
      ),
      choice(
        'r-x-pe-mica',
        L('Un × pe spațiul tobei mici înseamnă…', 'An × in the snare’s space means…'),
        opts(
          ['un cinel', 'a cymbal'],
          ['un ghost note', 'a ghost note'],
          ['o pauză', 'a rest'],
          ['cross-stick', 'cross-stick'],
        ),
        3,
        L(
          'Cross-stick. ×-ul nu înseamnă mereu cinel: poziția spune piesa.',
          'Cross-stick. An × does not always mean a cymbal: the position tells you the piece.',
        ),
      ),
      pickRead(
        'r-funk',
        L('Care grilă e portativul ăsta?', 'Which grid is this staff?'),
        bar('q-not-r-funk', 16, {
          hhClosed: 'x.x.x.x.x.x.x.x.',
          snare: '..o.x..o..o.x...',
          kick: 'x..x....x..x....',
        }),
        'staff',
        [
          bar('q-not-r-funk-a', 16, {
            hhClosed: 'x.x.x.x.x.x.x.x.',
            snare: '....x.......x...',
            kick: 'x..x....x..x....',
          }),
          bar('q-not-r-funk-b', 16, {
            hhClosed: 'x.x.x.x.x.x.x.x.',
            snare: '..o.x..o..o.x...',
            kick: 'x..x....x..x....',
          }),
          bar('q-not-r-funk-c', 16, {
            hhClosed: 'x.x.x.x.x.x.x.x.',
            snare: '..o.x..o..o.x...',
            kick: 'x.......x.......',
          }),
        ],
        1,
        L(
          'Ghost note-urile, capetele în paranteze, sunt în B. A le-a pierdut, C a pierdut toba mare de pe „unu-a” și „trei-a”.',
          'The ghost notes, the bracketed heads, are in B. A has lost them, C has lost the bass drum on the "a" of 1 and 3.',
        ),
      ),
      markRead(
        'r-transcrie-16',
        L(
          'Transcrie toba mare de pe portativ. Fusul și toba mică sunt scrise.',
          'Transcribe the bass drum from the staff. Hi-hat and snare are written in.',
        ),
        bar('q-not-r-t16', 16, {
          hhClosed: 'x.x.x.x.x.x.x.x.',
          snare: '....x.......x...',
          kick: 'x......xx.x.....',
        }),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Toba mare pe 1, pe „doi-a” (chiar înainte de 3), pe 3 și pe „trei-și”. Nota de pe „doi-a” e o șaisprezecime: are steag sau două bare.',
          'Bass drum on 1, on the "a" of 2 (just before 3), on 3 and on the "and" of 3. The note on the "a" of 2 is a sixteenth: it has a flag or two beams.',
        ),
      ),
      markHeard(
        'r-half-time',
        L(
          'Marchează toba mică. Fusul și toba mare sunt scrise.',
          'Mark the snare. Hi-hat and bass drum are written in.',
        ),
        bar(
          'q-not-r-half',
          8,
          { hhClosed: 'xxxxxxxx', snare: '....x...', kick: 'x.......' },
          { bpm: 76 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'kick'],
        L(
          'O singură lovitură, pe 3. E half-time: backbeat-ul vine o dată pe măsură, deci groove-ul sună de două ori mai lent, la același tempo.',
          'A single stroke, on 3. That is half-time: the backbeat comes once a bar, so the groove sounds half as fast at the same tempo.',
        ),
      ),
      listenChoice(
        'r-valoare-fus',
        L('Ce valori cântă fusul?', 'What note values is the hi-hat playing?'),
        bar('q-not-r-v', 8, ROCK, { bpm: 80 }),
        opts(
          ['Pătrimi', 'Quarters'],
          ['Șaisprezecimi', 'Sixteenths'],
          ['Optimi', 'Eighths'],
          ['Triolete', 'Triplets'],
        ),
        2,
        L('Optimi: două lovituri pe timp, egale.', 'Eighths: two even strokes per beat.'),
      ),
      choice(
        'r-o-bara',
        L('O notă de tobă cu o singură bară de grupare e…', 'A drum note with a single beam is…'),
        opts(
          ['o pătrime', 'a quarter'],
          ['o optime', 'an eighth'],
          ['o șaisprezecime', 'a sixteenth'],
          ['un triolet', 'a triplet'],
        ),
        1,
        L(
          'O optime. Două bare ar fi șaisprezecimi, iar un 3 deasupra ar face din grup un triolet.',
          'An eighth. Two beams would be sixteenths, and a 3 above would make the group a triplet.',
        ),
      ),
      pickHeard(
        'r-trei-feluri',
        L('Ascultă. Care grilă e ce auzi?', 'Listen. Which grid is what you hear?'),
        bar('q-not-r-tri', 12, { snare: 'xxxxxxxxxxxx' }, { bpm: 72 }),
        [
          bar('q-not-r-tri-a', 12, { snare: 'x.xx.xx.xx.x' }, { bpm: 72 }),
          bar('q-not-r-tri-b', 12, { snare: 'x..x..x..x..' }, { bpm: 72 }),
          bar('q-not-r-tri-c', 12, { snare: 'xxxxxxxxxxxx' }, { bpm: 72 }),
        ],
        2,
        L(
          'Triolete pline: trei note egale pe fiecare timp. A e shuffle (lung-scurt), B pătrimi.',
          'Full triplets: three even notes on every beat. A is a shuffle (long-short), B quarters.',
        ),
      ),
      choice(
        'r-fus-deschis',
        L('Cum se scrie fusul deschis?', 'How is the open hi-hat written?'),
        opts(
          ['Cu capul în paranteze', 'With the head in brackets'],
          ['Cu un „>” deasupra', 'With a ">" above'],
          ['Cu un cerculeț deasupra ×-ului', 'With a small circle above the ×'],
          ['Sub portativ', 'Below the staff'],
        ),
        2,
        L(
          'Cu un cerculeț deasupra ×-ului. Fusul închis cu piciorul se scrie sub portativ.',
          'With a small circle above the ×. The hi-hat closed with the foot is written below the staff.',
        ),
      ),
      readChoice(
        'r-cate-mare',
        L(
          'Câte lovituri de tobă mare sunt în măsura asta?',
          'How many bass drum strokes are in this bar?',
        ),
        bar('q-not-r-count', 8, { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x.xx.' }),
        'staff',
        opts(['Două', 'Two'], ['Trei', 'Three'], ['Patru', 'Four'], ['Cinci', 'Five']),
        2,
        L(
          'Patru: pe 1, pe „doi-și”, pe „trei-și” și pe 4. Caută capetele din spațiul de jos.',
          'Four: on 1, on the "and" of 2, on the "and" of 3 and on 4. Look for the heads in the bottom space.',
        ),
      ),
      listenChoice(
        'r-ghost-sau-accent',
        L(
          'Ascultă toba mică. Ce auzi pe 1 și 3?',
          'Listen to the snare. What do you hear on 1 and 3?',
        ),
        bar('q-not-r-ghost', 4, { snare: 'oXoX' }, { bpm: 72 }),
        opts(
          ['Accente', 'Accents'],
          ['Ghost notes', 'Ghost notes'],
          ['Cross-stick', 'Cross-stick'],
          ['Nimic, pauze', 'Nothing, rests'],
        ),
        1,
        L(
          'Ghost notes: abia se aud, ca o umbră înaintea backbeat-ului de pe 2 și 4.',
          'Ghost notes: barely audible, like a shadow before the backbeat on 2 and 4.',
        ),
      ),
      markHeard(
        'r-crash',
        L(
          'Marchează crash-ul și toba mare. Fusul și toba mică sunt scrise.',
          'Mark the crash and the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-not-r-crash',
          8,
          { crash: 'x.......', hhClosed: '.xxxxxxx', snare: '..x...x.', kick: 'x...x...' },
          { bpm: 80 },
        ),
        ['crash', 'hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Crash-ul pe „unu”, odată cu toba mare; toba mare apoi și pe 3.',
          'The crash on one, together with the bass drum; the bass drum then also on 3.',
        ),
      ),
      choice(
        'r-pauze',
        L(
          'Când scrie un toboșar o pauză pe portativ?',
          'When does a drummer write a rest on the staff?',
        ),
        opts(
          ['După fiecare lovitură', 'After every stroke'],
          ['Când un timp începe gol', 'When a beat starts empty'],
          ['Doar la sfârșitul piesei', 'Only at the end of the piece'],
          ['Niciodată, la tobe nu există pauze', 'Never, drums have no rests'],
        ),
        1,
        L(
          'Când timpul începe gol. Restul golurilor le spun valorile notelor: o pătrime urmată de nimic e deja o pauză până la lovitura următoare.',
          'When the beat starts empty. The other gaps are told by the note values: a quarter followed by nothing is already a gap until the next stroke.',
        ),
      ),
      pickRead(
        'r-grila-in-portativ',
        L(
          'Care portativ spune același lucru ca grila?',
          'Which staff says the same thing as the grid?',
        ),
        bar('q-not-r-g2s', 8, {
          hhClosed: 'xxxxxxx.',
          hhOpen: '.......x',
          snare: '..x...x.',
          kick: 'x...x...',
        }),
        'grid',
        [
          bar('q-not-r-g2s-a', 8, { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }),
          bar('q-not-r-g2s-b', 8, {
            hhClosed: 'xxxxxxx.',
            hhOpen: '.......x',
            snare: '..x...x.',
            kick: 'x...x...',
          }),
          bar('q-not-r-g2s-c', 8, {
            hhClosed: '.xxxxxxx',
            hhOpen: 'x.......',
            snare: '..x...x.',
            kick: 'x...x...',
          }),
        ],
        1,
        L(
          'Fusul deschis pe ultima optime, scris cu cerculeț deasupra ×-ului. A n-are fus deschis, C îl pune pe „unu”.',
          'The open hi-hat on the last eighth, written with a circle above the ×. A has no open hi-hat, C puts it on one.',
        ),
      ),
      listenChoice(
        'r-rimshot',
        L(
          'Ascultă sunetul de pe 2 și 4. Ce lovitură e?',
          'Listen to the sound on 2 and 4. Which stroke is it?',
        ),
        bar(
          'q-not-r-rim',
          8,
          { hhClosed: 'xxxxxxxx', rimshot: '..x...x.', kick: 'x...x...' },
          { bpm: 80 },
        ),
        opts(
          ['Lovitura pe ramă', 'Rim click'],
          ['Cross-stick', 'Cross-stick'],
          ['Rimshot', 'Rimshot'],
          ['Ghost note', 'Ghost note'],
        ),
        2,
        L(
          'Rimshot: fața și cercul lovite deodată, cel mai tare și mai tăios sunet al tobei mici. Lovitura pe ramă și cross-stick-ul ar fi un „tic” sec, fără pocnet.',
          'Rimshot: head and rim struck together, the loudest, sharpest sound the snare makes. A rim click or cross-stick would be a dry "tick", with no crack.',
        ),
      ),
    ],
  },
]
