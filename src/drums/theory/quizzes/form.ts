import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard } from './helpers'

/*
  Etapa 4, Forma piesei.

  Forma e despre CÂND: în ce măsură vine fill-ul, unde intră trupa după stop,
  unde e „unu”. De aceea exemplele ascultate au mai multe măsuri, iar grila de
  completat cere o singură măsură din ele: măsura care contează.
*/

const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
const ROCK_CRASH = { crash: 'x.......', hhClosed: '.xxxxxxx', snare: '..x...x.', kick: 'x...x...' }
const OPEN_END = { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..x...x.', kick: 'x...x...' }
const FILL_34 = {
  hhClosed: 'xxxx....',
  snare: '..x.xx..',
  tom: '......x.',
  floor: '.......x',
  kick: 'x.......',
}
const STOP = { crash: 'x.......', snare: 'x.......', kick: 'x.......' }

/*
  Groove-urile de fundal, variate ca în lecții: întrebarea e despre formă, iar
  forma trebuie recunoscută peste orice groove, nu doar peste rock pe 1 și 3.
*/
const PUSH = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' }
const PUSH_CRASH = { ...PUSH, crash: 'x.......', hhClosed: '.xxxxxxx' }
const POP = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x..x.' }
const POP_CRASH = { ...POP, crash: 'x.......', hhClosed: '.xxxxxxx' }
const RIDE = { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x.x..' }
const RIDE_CRASH = { ...RIDE, crash: 'x.......', ride: '.xxxxxxx' }
const HALF = { hhClosed: 'xxxxxxxx', snare: '....x...', kick: 'x.....x.' }
const HALF_CRASH = { ...HALF, crash: 'x.......', hhClosed: '.xxxxxxx' }

export const formQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-fraza',
    stage: 'form',
    lessonId: 'fraza',
    questions: [
      choice(
        'cat-de-lunga',
        L('Câte măsuri are de obicei o frază?', 'How many bars does a phrase usually have?'),
        opts(
          ['Una', 'One'],
          ['Trei', 'Three'],
          ['Patru sau opt', 'Four or eight'],
          ['Cinci', 'Five'],
        ),
        2,
        L(
          'Patru sau opt: după patru măsuri, ceva se încheie, chiar dacă nu numeri.',
          'Four or eight: after four bars something closes, even if you are not counting.',
        ),
      ),
      listenChoice(
        'ce-marcheaza-crash',
        L(
          'Ascultă patru măsuri. Ce marchează crash-ul?',
          'Listen to four bars. What does the crash mark?',
        ),
        bar('q-frm-f-phrase', 8, ROCK_CRASH, { bpm: 96, extraBars: [ROCK, ROCK, ROCK] }),
        opts(
          ['Sfârșitul frazei', 'The end of the phrase'],
          ['Începutul frazei', 'The start of the phrase'],
          ['Un fill', 'A fill'],
          ['O schimbare de tempo', 'A tempo change'],
        ),
        1,
        L(
          'Începutul: crash pe „unu” în prima măsură, apoi groove.',
          'The start: a crash on one in the first bar, then groove.',
        ),
      ),
      choice(
        'numaratoarea',
        L(
          'Cum numeri ca să știi mereu în ce măsură a frazei ești?',
          'How do you count so you always know which bar of the phrase you are in?',
        ),
        opts(
          [
            'Primul număr din fiecare măsură e numărul măsurii',
            'The first number of each bar is the bar’s number',
          ],
          ['Numeri până la 16 fără oprire', 'You count to 16 without stopping'],
          ['Numeri doar loviturile de tobă mare', 'You count only the bass drum strokes'],
          ['Nu numeri, asculți vocea', 'You do not count, you listen to the vocal'],
        ),
        0,
        L(
          'Unu-doi-trei-patru, doi-doi-trei-patru, trei-doi-trei-patru, patru-doi-trei-patru.',
          'One-two-three-four, two-two-three-four, three-two-three-four, four-two-three-four.',
        ),
      ),
      pickHeard(
        'unde-se-deschide',
        L('Ascultă fraza. Care grilă e?', 'Listen to the phrase. Which grid is it?'),
        bar('q-frm-f-open', 8, ROCK_CRASH, { bpm: 96, extraBars: [ROCK, ROCK, OPEN_END] }),
        [
          bar('q-frm-f-open-a', 8, ROCK_CRASH, { bpm: 96, extraBars: [OPEN_END, ROCK, ROCK] }),
          bar('q-frm-f-open-b', 8, ROCK, { bpm: 96, extraBars: [ROCK, ROCK, OPEN_END] }),
          bar('q-frm-f-open-c', 8, ROCK_CRASH, { bpm: 96, extraBars: [ROCK, ROCK, OPEN_END] }),
        ],
        2,
        L(
          'Crash în prima măsură, fusul deschis la capătul celei de-a patra. A deschide fusul prea devreme, B n-are crash.',
          'A crash in the first bar, the hi-hat opened at the end of the fourth. A opens the hi-hat too early, B has no crash.',
        ),
      ),
      choice(
        'blues',
        L('Câte măsuri are forma de blues?', 'How many bars does the blues form have?'),
        opts(
          ['Opt', 'Eight'],
          ['Șaisprezece', 'Sixteen'],
          ['Patru', 'Four'],
          ['Douăsprezece', 'Twelve'],
        ),
        3,
        L(
          'Douăsprezece: trei rânduri de câte patru, reluate de la capăt.',
          'Twelve: three lines of four, repeated from the top.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-fill-ul',
    stage: 'form',
    lessonId: 'fill-ul',
    questions: [
      choice(
        'ce-e-fill',
        L('Ce e un fill?', 'What is a fill?'),
        opts(
          ['Un groove mai rapid', 'A faster groove'],
          ['Tot ce nu e groove-ul', 'Anything that is not the groove'],
          ['Doar lovituri pe tomuri', 'Only tom strokes'],
          ['Un crash', 'A crash'],
        ),
        1,
        L(
          'Tot ce nu e groove-ul, de obicei la capăt de frază, ca să împingă spre următoarea.',
          'Anything that is not the groove, usually at the end of a phrase, to push into the next one.',
        ),
      ),
      choice(
        'greseala',
        L('Care e cea mai comună greșeală la fill-uri?', 'What is the most common fill mistake?'),
        opts(
          ['Prea încet', 'Too quiet'],
          ['Prea puține lovituri', 'Too few strokes'],
          ['Grăbești și ajungi pe „unu” prea devreme', 'You rush and reach one too early'],
          ['Crash-ul pe „unu”', 'The crash on one'],
        ),
        2,
        L(
          'Graba: fill-ul pare un moment liber, dar are exact lungimea măsurii. Numără-l cu voce tare.',
          'Rushing: the fill feels like free time, but it is exactly a bar long. Count it out loud.',
        ),
      ),
      listenChoice(
        'in-ce-masura',
        L('Ascultă. În ce măsură e fill-ul?', 'Listen. Which bar is the fill in?'),
        bar('q-frm-fl-where', 8, PUSH_CRASH, { bpm: 92, extraBars: [PUSH, PUSH, FILL_34] }),
        opts(
          ['Prima', 'The first'],
          ['A doua', 'The second'],
          ['A treia', 'The third'],
          ['A patra', 'The fourth'],
        ),
        3,
        L(
          'A patra: ultima măsură din frază, locul firesc al unui fill.',
          'The fourth: the last bar of the phrase, the natural place for a fill.',
        ),
      ),
      markHeard(
        'marcheaza-fill',
        L(
          'Ascultă măsura de fill. Marchează tomul 1 și cazanul; restul e scris.',
          'Listen to the fill bar. Mark the high tom and the floor tom; the rest is written in.',
        ),
        bar('q-frm-fl-mark', 8, FILL_34, { bpm: 84 }),
        ['hhClosed', 'snare', 'tom', 'floor', 'kick'],
        ['hhClosed', 'snare', 'kick'],
        L(
          'Tomul pe „patru”, cazanul pe „patru-și”: fill-ul coboară spre „unu”.',
          'The high tom on four, the floor tom on the "and" of four: the fill steps down towards one.',
        ),
      ),
      choice(
        'lungimea',
        L(
          'Cât de lung e un fill față de măsura pe care o înlocuiește?',
          'How long is a fill compared with the bar it replaces?',
        ),
        opts(
          ['Puțin mai scurt', 'A little shorter'],
          ['Cât vrei tu', 'As long as you like'],
          ['Exact la fel', 'Exactly the same'],
          ['Puțin mai lung', 'A little longer'],
        ),
        2,
        L(
          'Exact la fel. Fill-ul nu oprește timpul, îl umple.',
          'Exactly the same. A fill does not stop time, it fills it.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-partile-piesei',
    stage: 'form',
    lessonId: 'partile-piesei',
    questions: [
      choice(
        'strofa',
        L('Ce face toba de obicei în strofă?', 'What do the drums usually do in the verse?'),
        opts(
          [
            'Ține un groove simplu, ca să lase loc vocii',
            'Keep a simple groove, to leave room for the vocal',
          ],
          ['Cântă cel mai tare', 'Play loudest'],
          ['Face fill-uri continue', 'Play constant fills'],
          ['Tace', 'Stay silent'],
        ),
        0,
        L(
          'Un groove simplu, pe fus: strofa e a textului.',
          'A simple groove, on the hi-hat: the verse belongs to the lyrics.',
        ),
      ),
      listenChoice(
        'strofa-sau-refren',
        L(
          'Ascultă. Sună a strofă sau a refren?',
          'Listen. Does this sound like a verse or a chorus?',
        ),
        bar(
          'q-frm-p-chorus',
          8,
          { crash: 'x.......', ride: '.xxxxxxx', snare: '..x...x.', kick: 'x..xx...' },
          { bpm: 92 },
        ),
        opts(['Strofă', 'Verse'], ['Refren', 'Chorus']),
        1,
        L(
          'Refren: crash la intrare, ride în loc de fus, toba mare mai deasă.',
          'Chorus: a crash on entry, ride instead of hi-hat, a busier bass drum.',
        ),
      ),
      choice(
        'bridge',
        L('Ce e un bridge?', 'What is a bridge?'),
        opts(
          ['Un fill lung', 'A long fill'],
          ['A doua strofă', 'The second verse'],
          ['Intro-ul piesei', 'The song’s intro'],
          [
            'O parte diferită, de obicei o singură dată, înaintea ultimului refren',
            'A different part, usually once, before the last chorus',
          ],
        ),
        3,
        L(
          'O parte nouă, o singură dată, de obicei înaintea ultimului refren.',
          'A new part, played once, usually before the last chorus.',
        ),
      ),
      pickHeard(
        'finalul',
        L('Ascultă finalul. Care grilă e?', 'Listen to the ending. Which grid is it?'),
        bar('q-frm-p-end', 8, ROCK, {
          bpm: 92,
          extraBars: [{ crash: 'x.......', kick: 'x.......' }],
        }),
        [
          bar('q-frm-p-end-a', 8, ROCK, {
            bpm: 92,
            extraBars: [{ crash: '....x...', kick: '....x...' }],
          }),
          bar('q-frm-p-end-b', 8, ROCK, {
            bpm: 92,
            extraBars: [{ crash: 'x.......', kick: 'x.......' }],
          }),
          bar('q-frm-p-end-c', 8, ROCK, {
            bpm: 92,
            extraBars: [{ snare: 'x.......', kick: 'x.......' }],
          }),
        ],
        1,
        L(
          'Crash și toba mare pe „unu”, toată trupa deodată. A lovește pe 3, C n-are crash.',
          'Crash and bass drum on one, the whole band together. A hits on 3, C has no crash.',
        ),
      ),
      markHeard(
        'cresterea',
        L(
          'Măsura de creștere spre refren: marchează toba mare. Toba mică e scrisă.',
          'The build-up bar into the chorus: mark the bass drum. The snare is written in.',
        ),
        bar('q-frm-p-build', 8, { snare: 'ooxxxxXX', kick: 'x.x.x.x.' }, { bpm: 88 }),
        ['snare', 'kick'],
        ['snare'],
        L(
          'Pe fiecare timp, ca un puls care împinge, sub toba mică pe optimi tot mai tare.',
          'On every beat, like a pushing pulse, under the snare on ever louder eighths.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-stops-si-intrari',
    stage: 'form',
    lessonId: 'stops-si-intrari',
    questions: [
      choice(
        'stop',
        L('În timpul unui stop, ce se întâmplă cu timpul?', 'During a stop, what happens to time?'),
        opts(
          ['Se oprește și el', 'It stops too'],
          ['Merge mai departe: doar sunetul se oprește', 'It carries on: only the sound stops'],
          ['Încetinește', 'It slows down'],
          ['Se dublează', 'It doubles'],
        ),
        1,
        L(
          'Merge mai departe. De aceea numeri pauza, nu aștepți să auzi pe altcineva.',
          'It carries on. That is why you count the rest instead of waiting to hear someone else.',
        ),
      ),
      choice(
        'break',
        L('Ce e un break?', 'What is a break?'),
        opts(
          ['O pauză de câteva minute', 'A pause of a few minutes'],
          ['Toată trupa lovește odată', 'The whole band hits at once'],
          [
            'Unul sau mai multe măsuri în care cântă un singur instrument',
            'One or more bars where a single instrument plays',
          ],
          ['Un fill pe crash', 'A fill on the crash'],
        ),
        2,
        L(
          'Un instrument cântă singur, restul tac. Dacă e al tău, are lungimea măsurilor pe care le înlocuiește.',
          'One instrument plays alone, the rest stop. If it is yours, it lasts as long as the bars it replaces.',
        ),
      ),
      listenChoice(
        'intrarea-dupa-stop',
        L(
          'Ascultă. După stop, pe ce timp reintră groove-ul?',
          'Listen. After the stop, on which beat does the groove come back in?',
        ),
        bar('q-frm-s-back', 8, POP, { bpm: 92, extraBars: [STOP, POP_CRASH] }),
        opts(
          ['Pe 2', 'On 2'],
          ['Pe „patru-și”', 'On the "and" of 4'],
          ['Pe 3', 'On 3'],
          ['Pe „unu”', 'On one'],
        ),
        3,
        L(
          'Pe „unu”, cu crash. Între stop și intrare e restul măsurii, numărat în liniște.',
          'On one, with a crash. Between the stop and the entry is the rest of the bar, counted in silence.',
        ),
      ),
      pickHeard(
        'unde-e-stopul',
        L('Ascultă. Care grilă e?', 'Listen. Which grid is it?'),
        bar('q-frm-s-pick', 8, POP, { bpm: 92, extraBars: [STOP, POP_CRASH] }),
        [
          bar('q-frm-s-pick-a', 8, POP, { bpm: 92, extraBars: [STOP, POP_CRASH] }),
          bar('q-frm-s-pick-b', 8, POP, { bpm: 92, extraBars: [POP, POP_CRASH] }),
          bar('q-frm-s-pick-c', 8, POP, {
            bpm: 92,
            extraBars: [{ crash: '....x...', snare: '....x...', kick: '....x...' }, POP_CRASH],
          }),
        ],
        0,
        L(
          'Stop pe „unu” în măsura a doua, apoi liniște până la intrare. În C, stop-ul vine pe 3.',
          'A stop on one in bar two, then silence until the entry. In C the stop comes on 3.',
        ),
      ),
      choice(
        'numaratoarea',
        L(
          'Pornești piesa cu „unu, doi, trei, patru” pe fus. Ce tempo are numărătoarea?',
          'You count the song in with "one, two, three, four" on the hi-hat. What tempo is the count?',
        ),
        opts(
          ['Mai lent, ca să fie clar', 'Slower, to be clear'],
          ['Tempoul piesei', 'The song’s tempo'],
          ['Mai rapid, ca să energizeze', 'Faster, to energise'],
          ['Nu contează', 'It does not matter'],
        ),
        1,
        L(
          'Exact tempoul piesei: trupa intră pe el. Gândește-l înainte să începi.',
          'Exactly the song’s tempo: the band comes in on it. Think it through before you start.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-unde-e-unu',
    stage: 'form',
    lessonId: 'unde-e-unu',
    questions: [
      choice(
        'pe-unu',
        L('Ce cade de obicei pe „unu”?', 'What usually lands on one?'),
        opts(
          ['Toba mică', 'The snare'],
          ['Fusul deschis', 'The open hi-hat'],
          ['Toba mare și crash-ul', 'The bass drum and the crash'],
          ['Nimic', 'Nothing'],
        ),
        2,
        L(
          'Toba mare și, la început de frază, crash-ul. Toba mică e pe 2 și 4.',
          'The bass drum and, at the start of a phrase, the crash. The snare is on 2 and 4.',
        ),
      ),
      choice(
        'cum-gasesti',
        L(
          'Intri peste o piesă care a început deja. Cum găsești „unu”?',
          'You join a song already playing. How do you find one?',
        ),
        opts(
          [
            'Cauți toba mică pe 2 și 4; timpul dinaintea ei e „unu”',
            'Find the snare on 2 and 4; the beat before it is one',
          ],
          ['Aștepți un fill', 'Wait for a fill'],
          ['Pornești de unde vrei', 'Start wherever you like'],
          ['Numeri loviturile de fus', 'Count the hi-hat strokes'],
        ),
        0,
        L(
          'Backbeat-ul e cel mai ușor de auzit. Timpul dinaintea lui e „unu”; crash-ul de la început de frază confirmă.',
          'The backbeat is the easiest thing to hear. The beat before it is one; the phrase-start crash confirms.',
        ),
      ),
      choice(
        'anacruza',
        L('Ce e o anacruză?', 'What is a pickup?'),
        opts(
          ['Primul „unu” al piesei', 'The first beat one of the song'],
          ['Un fill de final', 'An ending fill'],
          ['O măsură de liniște', 'A bar of silence'],
          ['Notele de dinaintea primei măsuri întregi', 'The notes before the first full bar'],
        ),
        3,
        L(
          'Notele de dinainte. „Unu” e unde intră toată trupa, nu unde ai lovit tu prima dată.',
          'The notes before. One is where the whole band comes in, not where you first struck.',
        ),
      ),
      listenChoice(
        'unde-e-unu-aici',
        L('Ascultă. Unde e primul „unu”?', 'Listen. Where is the first one?'),
        bar('q-frm-u-pickup', 8, { snare: '......xx' }, { bpm: 92, extraBars: [RIDE_CRASH] }),
        opts(
          ['Pe prima lovitură de tobă mică', 'On the first snare stroke'],
          ['Pe a doua lovitură de tobă mică', 'On the second snare stroke'],
          ['Pe crash', 'On the crash'],
          ['Pe prima lovitură de fus', 'On the first hi-hat stroke'],
        ),
        2,
        L(
          'Pe crash: cele două lovituri de tobă mică sunt anacruza, pe „patru” și „patru-și”.',
          'On the crash: the two snare strokes are the pickup, on four and the "and" of four.',
        ),
      ),
      markHeard(
        'fara-unu',
        L(
          'Marchează toba mare. Fusul și toba mică sunt scrise.',
          'Mark the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-frm-u-off',
          8,
          { hhClosed: 'XxXxXxXx', snare: '..x...x.', kick: '.x...x.x' },
          { bpm: 84 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Doar pe contratimpi: „unu-și”, „trei-și”, „patru-și”. „Unu”-l îl ține accentul fusului, nu toba mare.',
          'Only on off-beats: the "and" of 1, 3 and 4. Beat one is held by the hi-hat accent, not the bass drum.',
        ),
      ),
    ],
  },

  {
    id: 'review-form',
    stage: 'form',
    questions: [
      listenChoice(
        'r-cate-masuri',
        L(
          'Câte măsuri are fraza asta, de la un crash la următorul?',
          'How many bars long is this phrase, from one crash to the next?',
        ),
        bar('q-frm-r-len', 8, HALF_CRASH, { bpm: 104, extraBars: [HALF, HALF, HALF] }),
        opts(['Două', 'Two'], ['Trei', 'Three'], ['Patru', 'Four'], ['Opt', 'Eight']),
        2,
        L(
          'Patru: crash-ul revine la fiecare patru măsuri.',
          'Four: the crash comes back every four bars.',
        ),
      ),
      markHeard(
        'r-fill-un-timp',
        L(
          'Ascultă măsura cu fill. Marchează tomurile; restul e scris.',
          'Listen to the fill bar. Mark the toms; the rest is written in.',
        ),
        bar(
          'q-frm-r-fill1',
          8,
          {
            hhClosed: 'xxxxxx..',
            snare: '..x.....',
            tom: '......x.',
            floor: '.......x',
            kick: 'x...x...',
          },
          { bpm: 88 },
        ),
        ['hhClosed', 'snare', 'tom', 'floor', 'kick'],
        ['hhClosed', 'snare', 'kick'],
        L(
          'Doar pe timpul 4: tomul pe „patru”, cazanul pe „patru-și”. Cel mai mic fill.',
          'Only on beat 4: the tom on four, the floor tom on the "and" of four. The smallest fill.',
        ),
      ),
      choice(
        'r-fill-grabit',
        L(
          'După fill, crash-ul tău cade înaintea clicului de pe „unu”. Ce s-a întâmplat?',
          'After the fill, your crash lands before the click on one. What happened?',
        ),
        opts(
          ['Ai întins fill-ul', 'You stretched the fill'],
          ['Ai grăbit fill-ul', 'You rushed the fill'],
          ['Clicul e greșit', 'The click is wrong'],
          ['E corect', 'It is correct'],
        ),
        1,
        L(
          'L-ai grăbit. Dacă ar fi căzut după clic, l-ai fi întins.',
          'You rushed it. Had it landed after the click, you would have stretched it.',
        ),
      ),
      choice(
        'r-refren',
        L('Cum crește toba la intrarea în refren?', 'How do the drums lift into the chorus?'),
        opts(
          [
            'Crash la intrare, ride în loc de fus, toba mare mai deasă',
            'A crash on entry, ride instead of hi-hat, a busier bass drum',
          ],
          ['Tempoul crește', 'The tempo goes up'],
          ['Toba mică trece pe 1 și 3', 'The snare moves to 1 and 3'],
          ['Toba tace', 'The drums drop out'],
        ),
        0,
        L(
          'Crash, ride, toba mare mai deasă: același tempo, mai multă energie.',
          'Crash, ride, a busier bass drum: the same tempo, more energy.',
        ),
      ),
      pickHeard(
        'r-fill-unde',
        L('Ascultă patru măsuri. Care grilă e?', 'Listen to four bars. Which grid is it?'),
        bar('q-frm-r-pick', 8, RIDE_CRASH, { bpm: 92, extraBars: [RIDE, RIDE, FILL_34] }),
        [
          bar('q-frm-r-pick-a', 8, RIDE_CRASH, { bpm: 92, extraBars: [RIDE, FILL_34, RIDE] }),
          bar('q-frm-r-pick-b', 8, RIDE_CRASH, { bpm: 92, extraBars: [FILL_34, RIDE, RIDE] }),
          bar('q-frm-r-pick-c', 8, RIDE_CRASH, { bpm: 92, extraBars: [RIDE, RIDE, FILL_34] }),
        ],
        2,
        L(
          'Fill-ul în a patra măsură, la capăt de frază.',
          'The fill in the fourth bar, at the end of the phrase.',
        ),
      ),
      listenChoice(
        'r-stop',
        L('Ce auzi în a doua măsură?', 'What do you hear in the second bar?'),
        bar('q-frm-r-stop', 8, PUSH, { bpm: 92, extraBars: [STOP, PUSH_CRASH] }),
        opts(
          ['Un fill', 'A fill'],
          ['Un break de tobe', 'A drum break'],
          ['Un stop', 'A stop'],
          ['O anacruză', 'A pickup'],
        ),
        2,
        L(
          'Un stop: o lovitură pe „unu”, cu toată trupa, apoi liniște până la capătul măsurii.',
          'A stop: one stroke on one, with the whole band, then silence to the end of the bar.',
        ),
      ),
      choice(
        'r-strofa',
        L(
          'Partea în care textul se schimbă de fiecare dată e…',
          'The part where the lyrics change every time is the…',
        ),
        opts(
          ['refrenul', 'chorus'],
          ['bridge-ul', 'bridge'],
          ['strofa', 'verse'],
          ['intro-ul', 'intro'],
        ),
        2,
        L('Strofa. Refrenul se repetă la fel.', 'The verse. The chorus repeats the same way.'),
      ),
      markHeard(
        'r-stop-marcheaza',
        L(
          'Măsura de stop: marchează crash-ul, toba mică și toba mare.',
          'The stop bar: mark the crash, the snare and the bass drum.',
        ),
        bar('q-frm-r-stopm', 8, STOP, { bpm: 92 }),
        ['crash', 'snare', 'kick'],
        [],
        L(
          'Toate trei pe „unu”, apoi nimic. Un stop e toată trupa deodată.',
          'All three on one, then nothing. A stop is the whole band at once.',
        ),
      ),
      choice(
        'r-blues',
        L(
          'În blues, unde vine fill-ul cel mai mare?',
          'In a blues, where does the biggest fill go?',
        ),
        opts(
          ['În măsura 1', 'In bar 1'],
          ['În măsura 4', 'In bar 4'],
          ['În măsura 12, când forma se ia de la capăt', 'In bar 12, when the form starts over'],
          ['În măsura 6', 'In bar 6'],
        ),
        2,
        L(
          'În măsura 12: capătul celui de-al treilea rând, înainte ca forma să se reia.',
          'In bar 12: the end of the third line, before the form starts again.',
        ),
      ),
      listenChoice(
        'r-anacruza',
        L(
          'Câte lovituri vin înaintea primului „unu”?',
          'How many strokes come before the first one?',
        ),
        bar('q-frm-r-pick-up', 8, { snare: '......xx' }, { bpm: 92, extraBars: [POP_CRASH] }),
        opts(['Niciuna', 'None'], ['Una', 'One'], ['Două', 'Two'], ['Patru', 'Four']),
        2,
        L(
          'Două: anacruza pe „patru” și „patru-și”, apoi crash pe „unu”.',
          'Two: the pickup on four and the "and" of four, then a crash on one.',
        ),
      ),
      choice(
        'r-break-tau',
        L(
          'Break-ul e al tău. Ce trebuie să ții minte?',
          'The break is yours. What must you remember?',
        ),
        opts(
          ['Poți cânta cât vrei', 'You can play as long as you like'],
          [
            'Are lungimea măsurilor pe care le înlocuiește; trupa reintră pe „unu”',
            'It lasts as long as the bars it replaces; the band re-enters on one',
          ],
          ['Trebuie să fie pe crash', 'It has to be on the crash'],
          ['Se cântă mai încet', 'It is played quieter'],
        ),
        1,
        L(
          'Lungimea e fixă: trupa numără și ea și intră pe „unu”, pe încrederea că ai numărat.',
          'The length is fixed: the band counts too and comes in on one, trusting that you counted.',
        ),
      ),
      markHeard(
        'r-unu-in-fraza',
        L(
          'Prima măsură dintr-o frază: marchează crash-ul și toba mare.',
          'The first bar of a phrase: mark the crash and the bass drum.',
        ),
        bar('q-frm-r-first', 8, ROCK_CRASH, { bpm: 92 }),
        ['crash', 'hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Crash-ul pe „unu”, odată cu toba mare; toba mare și pe 3.',
          'The crash on one, with the bass drum; the bass drum also on 3.',
        ),
      ),
    ],
  },
]
