import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import {
  DISCO_OCTAVES_BASS,
  EIGHTHS_BASS,
  ONE_DROP_BASS,
  SELEKT_BASS,
  TUMBAO_BASS,
} from '../lessons/musician'
import type { DrumQuiz, MarkGridQuestion, QuizQuestion } from '../quiz'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard } from './helpers'

/*
  Etapa 7, Muzician.

  Etapa e despre ascultat trupa, deci întrebările de bas se aud CU bas: liniile
  din lecție (funk, disco, reggae, latin, rock), sintetizate sub tobe. Fiecare
  întrebare de bas folosește altă linie, ca să nu se învețe o singură relație.
*/

const BACKBEAT = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
const LOCKED = { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.....x.x.....x.' }

/** Pune o linie de bas sub o întrebare: în exemplul ascultat sau sub grila de marcat. */
function withBass(question: QuizQuestion<LocalizedText>, bass: MarkGridQuestion['bass']) {
  if (question.kind === 'markGrid') return { ...question, bass }
  return question.media ? { ...question, media: { ...question.media, bass } } : question
}

export const musicianQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-basistul',
    stage: 'musician',
    lessonId: 'basistul',
    questions: [
      choice(
        'cand-sincopeaza',
        L(
          'Basul sincopează. Ce face toba mare?',
          'The bass syncopates. What does the bass drum do?',
        ),
        opts(
          ['Rămâne pe 1 și 3, ca reper', 'Stays on 1 and 3, as a reference'],
          ['Sincopează și ea, pe aceleași note', 'Syncopates too, on the same notes'],
          ['Tace', 'Goes silent'],
          ['Cântă opusul basului', 'Plays the opposite of the bass'],
        ),
        1,
        L(
          'Pe aceleași note: toba mare și basul sună ca un singur instrument când cad împreună.',
          'On the same notes: bass drum and bass sound like one instrument when they land together.',
        ),
      ),
      withBass(
        listenChoice(
          'disco',
          L(
            'Ascultă basul și toba mare. Cum își împart timpul?',
            'Listen to the bass and the bass drum. How do they share the time?',
          ),
          bar(
            'q-mus-b-disco',
            8,
            { hhClosed: 'x.x.x.x.', hhOpen: '.x.x.x.x', snare: '..x...x.', kick: 'x.x.x.x.' },
            { bpm: 112 },
          ),
          opts(
            ['Toba mare dublează fiecare notă de bas', 'The bass drum doubles every bass note'],
            [
              'Toba mare cu nota de jos pe timp, basul sus pe „și”',
              'The bass drum with the low note on the beat, the bass up high on the "and"',
            ],
            ['Toba mare doar pe „unu”', 'The bass drum only on one'],
          ),
          1,
          L(
            'Octavele de disco: nota de jos odată cu toba mare, pe fiecare timp; cea de sus pe „și”, odată cu fusul deschis.',
            'Disco octaves: the low note with the bass drum, on every beat; the high one on the "and", with the open hi-hat.',
          ),
        ),
        DISCO_OCTAVES_BASS,
      ),
      withBass(
        markHeard(
          'one-drop',
          L(
            'Reggae one drop: ascultă basul și pune toba mare. Fusul și lovitura pe ramă sunt scrise.',
            'One drop reggae: listen to the bass and place the bass drum. The hi-hat and rim click are written in.',
          ),
          bar(
            'q-mus-b-drop',
            16,
            {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              rimClick: '........x.......',
              kick: '........x.......',
            },
            { bpm: 76 },
          ),
          ['hhClosed', 'rimClick', 'kick'],
          ['hhClosed', 'rimClick'],
          L(
            'O singură lovitură, pe 3, odată cu rama. „Unu” rămâne gol: basul pornește abia după el.',
            'A single stroke, on 3, with the rim. One stays empty: the bass only starts after it.',
          ),
        ),
        ONE_DROP_BASS,
      ),
      choice(
        'basul-egal',
        L(
          'Basul cântă optimi egale, ca un motor. Ce face toba mare?',
          'The bass plays even eighths, like an engine. What does the bass drum do?',
        ),
        opts(
          ['Le dublează pe toate', 'Doubles every one'],
          ['Cântă șaisprezecimi peste ele', 'Plays sixteenths over them'],
          ['Stă pe 1 și 3 și îl lasă să curgă', 'Sits on 1 and 3 and lets it flow'],
          ['Tace', 'Goes silent'],
        ),
        2,
        L(
          'Pe 1 și 3. Două instrumente care bat aceleași optimi se acoperă unul pe altul.',
          'On 1 and 3. Two instruments hammering the same eighths cover each other.',
        ),
      ),
      choice(
        'nu-auzi',
        L(
          'Nu auzi ce cântă basistul. Ce faci?',
          'You cannot hear what the bass player is doing. What do you do?',
        ),
        opts(
          [
            'Cânți toba mare pe 1 și 3: nu încurcă niciodată',
            'Play the bass drum on 1 and 3: it never gets in the way',
          ],
          ['Cânți mai multe note, ca să acoperi', 'Play more notes, to cover it'],
          ['Te oprești până îl auzi', 'Stop until you hear him'],
          ['Cânți dublă', 'Play double bass'],
        ),
        0,
        L(
          'Mai puțin: o notă lipsă e mai bună decât una peste a lui.',
          'Less: a missing note is better than one on top of his.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-dinamica-in-aranjament',
    stage: 'musician',
    lessonId: 'dinamica-in-aranjament',
    questions: [
      choice(
        'refren-mare',
        L(
          'Ca refrenul să sune mare, ce trebuie să fie strofa?',
          'For the chorus to sound big, what must the verse be?',
        ),
        opts(
          ['La fel de tare', 'Just as loud'],
          ['Mai rapidă', 'Faster'],
          ['Mică: mai încet, mai rar', 'Small: softer, sparser'],
          ['Fără tobe', 'Without drums'],
        ),
        2,
        L(
          'Mică. Refrenul sună mare doar prin comparație cu ce a fost înainte.',
          'Small. The chorus only sounds big compared with what came before.',
        ),
      ),
      listenChoice(
        'ce-se-schimba',
        L(
          'Ascultă două măsuri. Ce se schimbă la a doua?',
          'Listen to two bars. What changes in the second?',
        ),
        bar(
          'q-mus-d-two',
          8,
          { hhClosed: 'oooooooo', crossStick: '..x...x.', kick: 'x.......' },
          {
            bpm: 92,
            extraBars: [
              { crash: 'X.......', ride: '.xxxxxxx', snare: '..x...x.', kick: 'x..xx...' },
            ],
          },
        ),
        opts(
          ['Doar tempoul', 'Only the tempo'],
          [
            'Strofa trece în refren: crash, ride, toba mică în locul cross-stick-ului',
            'The verse turns into the chorus: crash, ride, snare instead of cross-stick',
          ],
          ['Nimic', 'Nothing'],
          ['Toba mare dispare', 'The bass drum disappears'],
        ),
        1,
        L(
          'Același tempo, altă energie: crash la intrare, ride, toba mică plină și toba mare mai deasă.',
          'Same tempo, different energy: a crash on entry, the ride, a full snare and a busier bass drum.',
        ),
      ),
      choice(
        'prea-devreme',
        L(
          'De ce nu cânți primul refren cât de tare poți?',
          'Why not play the first chorus as loud as you can?',
        ),
        opts(
          ['Ca să nu obosești', 'So you do not tire'],
          ['Ca finalul să aibă unde să crească', 'So the ending has room to grow'],
          ['Fiindcă e interzis', 'Because it is forbidden'],
          ['Ca să nu se rupă pielea', 'So the head does not break'],
        ),
        1,
        L(
          'Ca ultimul refren să poată fi mai mare. Păstrează ceva pentru final.',
          'So the last chorus can be bigger. Save something for the end.',
        ),
      ),
      pickHeard(
        'crestere',
        L('Ascultă cele patru măsuri. Care grilă e?', 'Listen to the four bars. Which grid is it?'),
        bar(
          'q-mus-d-build',
          8,
          { hhClosed: 'oooooooo', snare: '..x...x.', kick: 'x.......' },
          {
            bpm: 92,
            extraBars: [
              { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
              { hhClosed: 'XxXxXxXx', snare: '..X...X.', kick: 'x..xx...' },
            ],
          },
        ),
        [
          bar(
            'q-mus-d-build-a',
            8,
            { hhClosed: 'XxXxXxXx', snare: '..X...X.', kick: 'x..xx...' },
            {
              bpm: 92,
              extraBars: [
                { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
                { hhClosed: 'oooooooo', snare: '..x...x.', kick: 'x.......' },
              ],
            },
          ),
          bar(
            'q-mus-d-build-b',
            8,
            { hhClosed: 'oooooooo', snare: '..x...x.', kick: 'x.......' },
            {
              bpm: 92,
              extraBars: [
                { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
                { hhClosed: 'XxXxXxXx', snare: '..X...X.', kick: 'x..xx...' },
              ],
            },
          ),
        ],
        1,
        L(
          'De la încet la tare, câte un pas pe măsură. A e aceeași creștere, dar întoarsă: de la tare la încet.',
          'From soft to loud, one step per bar. A is the same build backwards: loud to soft.',
        ),
      ),
      choice(
        'volumul-potrivit',
        L(
          'După ce îți dai seama că volumul tău e potrivit?',
          'How do you tell your volume is right?',
        ),
        opts(
          ['După cum sună setul', 'By how the kit sounds'],
          ['După cât de tare lovești', 'By how hard you hit'],
          ['După metronom', 'By the metronome'],
          ['Dacă auzi vocea limpede', 'If you can hear the vocal clearly'],
        ),
        3,
        L(
          'După voce: dacă n-o mai auzi limpede, ești prea tare, oricât de bine ar suna tobele.',
          'By the vocal: if you cannot hear it clearly, you are too loud, however good the drums sound.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-clicul',
    stage: 'musician',
    lessonId: 'clicul',
    questions: [
      choice(
        'ingroapa',
        L('Ce înseamnă să „îngropi” clicul?', 'What does it mean to "bury" the click?'),
        opts(
          ['Să-l dai mai încet', 'To turn it down'],
          [
            'Să lovești exact pe el, încât dispare sub lovitura ta',
            'To hit exactly on it, so it vanishes under your stroke',
          ],
          ['Să cânți fără el', 'To play without it'],
          ['Să-l pui doar pe „unu”', 'To put it on one only'],
        ),
        1,
        L(
          'Exact pe el: dispare. Dacă îl auzi separat, ești înainte sau în urmă.',
          'Exactly on it: it disappears. If you hear it separately, you are ahead or behind.',
        ),
      ),
      choice(
        'treptele',
        L(
          'În ce ordine rărești clicul când exersezi?',
          'In what order do you thin out the click when practising?',
        ),
        opts(
          [
            'Pe fiecare timp, apoi pe 2 și 4, apoi o dată pe măsură',
            'Every beat, then 2 and 4, then once a bar',
          ],
          ['O dată pe măsură, apoi pe fiecare timp', 'Once a bar, then every beat'],
          ['Doar pe 2 și 4, mereu', 'Only on 2 and 4, always'],
          ['Pe optimi, apoi pe șaisprezecimi', 'On eighths, then sixteenths'],
        ),
        0,
        L(
          'Cu cât bate mai rar, cu atât ții tu mai mult timpul.',
          'The less it plays, the more of the time you hold.',
        ),
      ),
      choice(
        'tempo-mic',
        L(
          'De ce o baladă la 60 e mai greu de ținut decât un rock la 120?',
          'Why is a ballad at 60 harder to hold than rock at 120?',
        ),
        opts(
          ['Fiindcă e mai încet', 'Because it is quieter'],
          ['Fiindcă are mai puține note', 'Because it has fewer notes'],
          [
            'Fiindcă între clicuri e mult spațiu în care te poți pierde',
            'Because there is so much space between clicks to get lost in',
          ],
          ['Nu e mai greu', 'It is not harder'],
        ),
        2,
        L(
          'Spațiul dintre clicuri. Umple-l în cap, numărând optimile.',
          'The space between clicks. Fill it in your head, counting the eighths.',
        ),
      ),
      choice(
        'unde-fuge',
        L('Unde grăbești de obicei cu clicul?', 'Where do you usually rush with a click?'),
        opts(
          ['La părțile încete', 'In the quiet parts'],
          ['La fill-uri și la părțile tari', 'In fills and loud parts'],
          ['La început', 'At the start'],
          ['Niciodată', 'Never'],
        ),
        1,
        L(
          'La fill-uri și la părțile tari. La cele încete, de obicei încetinești.',
          'In fills and loud parts. In quiet ones you usually drag.',
        ),
      ),
      markHeard(
        'balada',
        L(
          'Balada cu clicul pe fiecare timp: marchează cross-stick-ul. Restul e scris.',
          'The ballad with the click on every beat: mark the cross-stick. The rest is written in.',
        ),
        bar(
          'q-mus-c-ballad',
          8,
          { hhClosed: 'xxxxxxxx', crossStick: '..x...x.', kick: 'x...x...' },
          { bpm: 60 },
        ),
        ['hhClosed', 'crossStick', 'kick'],
        ['hhClosed', 'kick'],
        L(
          'Pe 2 și 4, exact pe clic: acolo trebuie să dispară.',
          'On 2 and 4, exactly on the click: that is where it should vanish.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-chart-ul',
    stage: 'musician',
    lessonId: 'chart-ul',
    questions: [
      choice(
        'ce-arata',
        L('Ce arată un chart de tobe?', 'What does a drum chart show?'),
        opts(
          ['Fiecare notă pe care o cânți', 'Every note you play'],
          ['Doar tempoul', 'Only the tempo'],
          [
            'Forma piesei, măsurile și loviturile importante',
            'The song’s form, the bars and the important hits',
          ],
          ['Doar fill-urile', 'Only the fills'],
        ),
        2,
        L(
          'Forma, câte măsuri, unde sunt stops și fill-uri. Notă cu notă îl completezi tu.',
          'The form, how many bars, where the stops and fills are. Note by note is up to you.',
        ),
      ),
      choice(
        'barele-oblice',
        L(
          'Ce înseamnă barele oblice (/ / / /) într-o măsură de chart?',
          'What do slashes (/ / / /) in a chart bar mean?',
        ),
        opts(
          ['Pauză', 'Rest'],
          ['Cântă groove-ul', 'Play the groove'],
          ['Cântă un fill', 'Play a fill'],
          ['Repetă de patru ori', 'Repeat four times'],
        ),
        1,
        L(
          'Cântă groove-ul: o bară pe fiecare timp, fără să-ți spună ce anume.',
          'Play the groove: one slash per beat, without saying exactly what.',
        ),
      ),
      choice(
        'procent',
        L('Ce înseamnă semnul % într-o măsură?', 'What does a % sign in a bar mean?'),
        opts(
          ['Repetă măsura de dinainte', 'Repeat the previous bar'],
          ['Cântă mai încet', 'Play softer'],
          ['Sari la final', 'Jump to the end'],
          ['Jumătate de tempo', 'Half tempo'],
        ),
        0,
        L('Repetă măsura de dinainte, exact la fel.', 'Repeat the previous bar, exactly the same.'),
      ),
      markHeard(
        'loviturile-trupei',
        L(
          'Măsura cu loviturile trupei: marchează crash-ul și toba mare.',
          'The bar with the band hits: mark the crash and the bass drum.',
        ),
        bar('q-mus-ch-hits', 8, { crash: 'X..X..X.', kick: 'x..x..x.' }, { bpm: 96 }),
        ['crash', 'kick'],
        [],
        L(
          'Pe „unu”, pe „doi-și” și pe „patru”: crash și toba mare deodată, ca toată trupa.',
          'On one, on the "and" of 2 and on four: crash and bass drum together, like the whole band.',
        ),
      ),
      choice(
        'citeste-inainte',
        L(
          'Unde stau ochii când cânți după un chart?',
          'Where are your eyes when you play from a chart?',
        ),
        opts(
          ['Pe măsura pe care o cânți', 'On the bar you are playing'],
          ['Pe tobe', 'On the drums'],
          ['Pe dirijor', 'On the conductor'],
          ['Cu o măsură înainte', 'One bar ahead'],
        ),
        3,
        L(
          'Cu o măsură înainte: altfel ajungi prea târziu la loviturile trupei.',
          'One bar ahead: otherwise you reach the band hits too late.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-transcrierea',
    stage: 'musician',
    lessonId: 'transcrierea',
    questions: [
      choice(
        'ordinea',
        L(
          'În ce ordine asculți o piesă ca s-o transcrii?',
          'In what order do you listen to a song to transcribe it?',
        ),
        opts(
          ['Totul deodată', 'Everything at once'],
          [
            'Întâi toba mare și toba mică, apoi cinelele',
            'Bass drum and snare first, then the cymbals',
          ],
          ['Întâi cinelele, apoi tobele', 'Cymbals first, then the drums'],
          ['Doar fill-urile', 'Only the fills'],
        ),
        1,
        L(
          'O piesă o dată: întâi toba mare și toba mică, scheletul, apoi cinelele.',
          'One piece at a time: bass drum and snare first, the skeleton, then the cymbals.',
        ),
      ),
      markHeard(
        'transcrie-groove',
        L(
          'Transcrie toba mică și toba mare. Fusul e scris.',
          'Transcribe the snare and the bass drum. The hi-hat is written in.',
        ),
        bar(
          'q-mus-t-groove',
          8,
          { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..x...x.', kick: 'x..xx.x.' },
          { bpm: 80 },
        ),
        ['hhOpen', 'hhClosed', 'snare', 'kick'],
        ['hhOpen', 'hhClosed'],
        L(
          'Toba mică pe 2 și 4; toba mare pe 1, „doi-și”, 3 și 4.',
          'Snare on 2 and 4; bass drum on 1, the "and" of 2, 3 and 4.',
        ),
      ),
      markHeard(
        'transcrie-fill',
        L(
          'Transcrie fill-ul pe tomuri. Toba mică și toba mare sunt scrise.',
          'Transcribe the fill on the toms. Snare and bass drum are written in.',
        ),
        bar(
          'q-mus-t-fill',
          8,
          {
            snare: 'xx......',
            tom: '..xx....',
            mid: '....xx..',
            floor: '......xx',
            kick: 'x.......',
          },
          { bpm: 80 },
        ),
        ['snare', 'tom', 'mid', 'floor', 'kick'],
        ['snare', 'kick'],
        L(
          'Câte două optimi pe fiecare tom, coborând: tomul 1 pe timpul 2, tomul 2 pe 3, cazanul pe 4.',
          'Two eighths on each tom, stepping down: the high tom on beat 2, the mid on 3, the floor tom on 4.',
        ),
      ),
      choice(
        'ghost',
        L(
          'Nu poți auzi ghost notes-urile dintr-o înregistrare. Ce faci?',
          'You cannot hear the ghost notes in a recording. What do you do?',
        ),
        opts(
          ['Le inventezi', 'Make them up'],
          ['Le sari', 'Skip them'],
          [
            'Cobori tempoul și asculți doar toba mică',
            'Slow it down and listen to the snare alone',
          ],
          ['Dai volumul mai tare', 'Turn the volume up'],
        ),
        2,
        L(
          'Mai încet, doar toba mică: la viteză mică, umbrele devin note.',
          'Slower, snare only: slowed down, the shadows become notes.',
        ),
      ),
      choice(
        'verifica',
        L('Cum știi că o transcriere e corectă?', 'How do you know a transcription is right?'),
        opts(
          [
            'O cânți peste înregistrare și se potrivește',
            'You play it along with the recording and it fits',
          ],
          ['Arată bine pe hârtie', 'It looks right on paper'],
          ['Are multe note', 'It has lots of notes'],
          ['A durat mult', 'It took a long time'],
        ),
        0,
        L(
          'Cânt-o peste înregistrare. Unde te împiedici, acolo e greșeala.',
          'Play it along with the recording. Where you stumble, that is where the mistake is.',
        ),
      ),
    ],
  },

  {
    id: 'review-musician',
    stage: 'musician',
    questions: [
      withBass(
        markHeard(
          'r-bas',
          L(
            'Pune toba mare pe notele basului. Fusul și toba mică sunt scrise.',
            'Put the bass drum on the bass notes. Hi-hat and snare are written in.',
          ),
          bar('q-mus-r-bass', 16, { ...LOCKED, kick: 'x.....x.x.......' }, { bpm: 84 }),
          ['hhClosed', 'snare', 'kick'],
          ['hhClosed', 'snare'],
          L(
            'Pe Re-ul de pe „unu”, Fa-ul de pe „doi-și” și Re-ul de pe 3: notele pe care se sprijină linia.',
            'On the D on one, the F on the "and" of 2 and the D on 3: the notes the line leans on.',
          ),
        ),
        SELEKT_BASS,
      ),
      withBass(
        pickHeard(
          'r-bas-egal',
          L(
            'Basul cântă optimi egale. Care grilă e toba ce-l lasă să curgă?',
            'The bass plays even eighths. Which grid is the drumming that lets it flow?',
          ),
          bar('q-mus-r-eight', 8, BACKBEAT, { bpm: 100 }),
          [
            bar('q-mus-r-eight-a', 8, { ...BACKBEAT, kick: 'xxxxxxxx' }, { bpm: 100 }),
            bar('q-mus-r-eight-b', 8, BACKBEAT, { bpm: 100 }),
            bar('q-mus-r-eight-c', 8, { ...BACKBEAT, kick: 'x.x.x.x.' }, { bpm: 100 }),
          ],
          1,
          L(
            'Toba mare pe 1 și 3, sub basul pe optimi. A îl dublează pe toate optimile și îl acoperă.',
            'Bass drum on 1 and 3, under the eighth-note bass. A doubles every eighth and covers it.',
          ),
        ),
        EIGHTHS_BASS,
      ),
      choice(
        'r-strofa',
        L(
          'Cum ții strofa jos, ca refrenul să sune mare?',
          'How do you keep the verse down, so the chorus sounds big?',
        ),
        opts(
          ['Cross-stick, fus încet, toba mare rară', 'Cross-stick, soft hi-hat, sparse bass drum'],
          ['Crash pe fiecare timp', 'A crash on every beat'],
          ['Tempo mai mic', 'A slower tempo'],
          ['Fill-uri multe', 'Lots of fills'],
        ),
        0,
        L(
          'Mai puțin și mai încet: cross-stick, fus abia atins, toba mare rară.',
          'Less and softer: cross-stick, a barely-touched hi-hat, a sparse bass drum.',
        ),
      ),
      choice(
        'r-clic-unu',
        L(
          'Clicul bate doar pe „unu”. Cine ține ceilalți trei timpi?',
          'The click plays only on one. Who holds the other three beats?',
        ),
        opts(
          ['Clicul', 'The click'],
          ['Basistul', 'The bass player'],
          ['Tu', 'You'],
          ['Nimeni', 'Nobody'],
        ),
        2,
        L(
          'Tu. E ultima treaptă din metodă, cea mai apropiată de o trupă adevărată.',
          'You. It is the last step of the method, the closest to a real band.',
        ),
      ),
      choice(
        'r-auzi-clicul',
        L(
          'Auzi clicul separat de lovitura ta. Ce înseamnă?',
          'You hear the click separately from your stroke. What does it mean?',
        ),
        opts(
          ['E perfect', 'It is perfect'],
          ['Clicul e prea tare', 'The click is too loud'],
          ['Ești înainte sau în urmă', 'You are ahead or behind'],
          ['Tempoul e greșit', 'The tempo is wrong'],
        ),
        2,
        L(
          'Ești pe lângă. Pe clic, lovitura ta îl acoperă și dispare.',
          'You are off. On the click, your stroke covers it and it disappears.',
        ),
      ),
      markHeard(
        'r-stop-chart',
        L(
          'Pe chart, o măsură cu un singur semn pe „unu”: un stop. Marchează-l.',
          'On the chart, a bar with one mark on one: a stop. Mark it.',
        ),
        bar('q-mus-r-stop', 8, { crash: 'X.......', kick: 'x.......' }, { bpm: 96 }),
        ['crash', 'kick'],
        [],
        L(
          'Crash și toba mare pe „unu”, apoi liniște până la capătul măsurii.',
          'Crash and bass drum on one, then silence until the end of the bar.',
        ),
      ),
      choice(
        'r-ds',
        L('Ce înseamnă D.S. pe un chart?', 'What does D.S. mean on a chart?'),
        opts(
          ['Dublu, mai repede', 'Double, faster'],
          ['Întoarce-te la semnul segno', 'Go back to the segno sign'],
          ['Doar snare', 'Snare only'],
          ['Sfârșitul piesei', 'The end of the song'],
        ),
        1,
        L(
          'Întoarce-te la semnul segno și cântă de acolo, până la Coda.',
          'Go back to the segno sign and play from there, up to the Coda.',
        ),
      ),
      markHeard(
        'r-transcrie',
        L(
          'Transcrie toba mare. Fusul și toba mică sunt scrise.',
          'Transcribe the bass drum. Hi-hat and snare are written in.',
        ),
        bar(
          'q-mus-r-trans',
          16,
          { hhClosed: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', kick: 'x.....x...x..x..' },
          { bpm: 72 },
        ),
        ['hhClosed', 'snare', 'kick'],
        ['hhClosed', 'snare'],
        L(
          'Pe 1, „doi-și”, „trei-și” și „patru-e”. Ultima e o șaisprezecime: între două lovituri de fus.',
          'On 1, the "and" of 2, the "and" of 3 and the "e" of 4. The last is a sixteenth: between two hi-hat strokes.',
        ),
      ),
      listenChoice(
        'r-strofa-sau-refren',
        L('Sună a strofă sau a refren?', 'Does this sound like a verse or a chorus?'),
        bar(
          'q-mus-r-verse',
          8,
          { hhClosed: 'oooooooo', crossStick: '..x...x.', kick: 'x.......' },
          { bpm: 92 },
        ),
        opts(['Strofă', 'Verse'], ['Refren', 'Chorus']),
        0,
        L(
          'Strofă: cross-stick, fus încet, toba mare rară. Lasă loc vocii.',
          'Verse: cross-stick, soft hi-hat, sparse bass drum. It leaves room for the vocal.',
        ),
      ),
      withBass(
        markHeard(
          'r-tumbao',
          L(
            'Tumbao de salsa: basul anticipă. Pune toba mare pe notele lui. Talanga și rama sunt scrise.',
            'Salsa tumbao: the bass anticipates. Put the bass drum on its notes. The cowbell and rim are written in.',
          ),
          bar(
            'q-mus-r-tumbao',
            16,
            { cowbell: 'x...x...x...x...', rimClick: 'x.....x.....x...', kick: '......x.....x...' },
            { bpm: 88 },
          ),
          ['cowbell', 'rimClick', 'kick'],
          ['cowbell', 'rimClick'],
          L(
            'Pe „doi-și” și pe 4, exact unde intră basul. Nimic pe „unu”: legătura e pe anticipări.',
            'On the "and" of 2 and on 4, exactly where the bass comes in. Nothing on one: the link is on the anticipations.',
          ),
        ),
        TUMBAO_BASS,
      ),
      choice(
        'r-transcrie-unde',
        L(
          'Cânți transcrierea peste înregistrare și te împiedici într-un loc. Ce e, de obicei, acolo?',
          'You play your transcription along with the recording and stumble at one spot. What is usually there?',
        ),
        opts(
          ['O notă pusă pe „și” în loc de „a”', 'A note on the "and" instead of the "a"'],
          ['Un tempo greșit', 'A wrong tempo'],
          ['O piesă greșită de set', 'A wrong piece of the kit'],
          ['Nimic, e normal să te împiedici', 'Nothing, stumbling is normal'],
        ),
        0,
        L(
          'O notă pe subdiviziunea greșită, de cele mai multe ori „și” în loc de „a”.',
          'A note on the wrong subdivision, most often the "and" instead of the "a".',
        ),
      ),
    ],
  },
]
