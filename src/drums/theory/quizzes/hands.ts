import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { snareDemo } from '../bars'
import type { DrumQuiz } from '../quiz'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard } from './helpers'

/*
  Etapa 2, Mâinile.

  Mâna nu se aude: un R și un L pe toba mică sună la fel. Deci sticking-ul se
  întreabă cu variante scrise, iar ce se ASCULTĂ e ce se aude cu adevărat: unde
  cad loviturile, cât de tari sunt, câte sunt într-un roll, cum sună o grație.
  Singura întrebare de grilă cu mâini e paradiddle-ul împărțit pe două piese:
  acolo mâna dreaptă chiar devine un rând al ei.
*/

const tempo = (bpm: number) => ({ min: Math.min(40, bpm), max: bpm, suggested: bpm })

export const handsQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-ce-e-un-rudiment',
    stage: 'hands',
    lessonId: 'ce-e-un-rudiment',
    questions: [
      choice(
        'rudiment',
        L('Ce e un rudiment?', 'What is a rudiment?'),
        opts(
          ['Un tip de tobă', 'A type of drum'],
          ['Un pattern scurt de mâini, care se repetă', 'A short hand pattern that repeats'],
          ['Un groove de rock', 'A rock groove'],
          ['Un semn de pe portativ', 'A sign on the staff'],
        ),
        1,
        L(
          'O ordine scurtă de mâini care se repetă: cărămida din care se fac fill-urile și groove-urile.',
          'A short order of hands that repeats: the brick fills and grooves are built from.',
        ),
      ),
      choice(
        'litera-l',
        L('Ce înseamnă litera L într-un sticking?', 'What does the letter L mean in a sticking?'),
        opts(
          ['Lovitură lungă', 'Long stroke'],
          ['Lent', 'Slow'],
          ['Mâna stângă', 'Left hand'],
          ['Lovitură ușoară', 'Light stroke'],
        ),
        2,
        L(
          'Stânga (left). R e dreapta. În aplicație, dreapta e roșie, stânga albastră.',
          'Left. R is right. In the app, right is red, left is blue.',
        ),
      ),
      choice(
        'de-ce-sticking',
        L(
          'De ce se scrie sticking-ul, dacă ritmul sună la fel?',
          'Why is the sticking written down, if the rhythm sounds the same?',
        ),
        opts(
          ['E doar o preferință, n-are efect', 'It is only a preference, with no effect'],
          ['Arată cât de tare se lovește', 'It shows how hard to hit'],
          ['Arată tempoul', 'It shows the tempo'],
          [
            'La tempo mare, el decide dacă figura se poate cânta',
            'At speed, it decides whether the figure is playable',
          ],
        ),
        3,
        L(
          'La tempo mic nu contează; la tempo mare, mâna care tocmai a lovit decide ce poți lovi după. Sticking-ul îți spune unde ajung mâinile.',
          'At slow tempos it does not matter; at speed, the hand that just struck decides what you can hit next. The sticking tells you where your hands end up.',
        ),
      ),
      choice(
        'mana-slaba',
        L(
          'Mâna ta slabă sună mai încet. Ce faci?',
          'Your weak hand sounds quieter. What do you do?',
        ),
        opts(
          ['Exersezi rudimentele pornind cu ea', 'Practise rudiments leading with it'],
          ['Lovești mai tare cu ea', 'Hit harder with it'],
          ['Cânți doar cu mâna bună', 'Play only with the good hand'],
          ['Nimic, trece singur', 'Nothing, it fixes itself'],
        ),
        0,
        L(
          'O pornești în față. Regula pentru toată etapa: orice rudiment se exersează pe ambele părți.',
          'You put it in front. The rule for the whole stage: every rudiment is practised on both sides.',
        ),
      ),
      pickHeard(
        'cat-de-des',
        L(
          'Ascultă toba mică. Care grilă e ce auzi?',
          'Listen to the snare. Which grid is what you hear?',
        ),
        bar('q-hand-r-8', 16, { snare: 'x.x.x.x.x.x.x.x.' }, { bpm: 72 }),
        [
          bar('q-hand-r-a', 16, { snare: 'x...x...x...x...' }, { bpm: 72 }),
          bar('q-hand-r-b', 16, { snare: 'xxxxxxxxxxxxxxxx' }, { bpm: 72 }),
          bar('q-hand-r-c', 16, { snare: 'x.x.x.x.x.x.x.x.' }, { bpm: 72 }),
        ],
        2,
        L(
          'Optimi: două lovituri pe timp. A are pătrimi, B șaisprezecimi.',
          'Eighths: two strokes per beat. A has quarters, B sixteenths.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-singles-si-doubles',
    stage: 'hands',
    lessonId: 'singles-si-doubles',
    questions: [
      choice(
        'single',
        L('Cum se cântă single stroke roll-ul?', 'How is the single stroke roll played?'),
        opts(
          ['R R L L', 'R R L L'],
          ['R L R L', 'R L R L'],
          ['R L R R', 'R L R R'],
          ['R R R L', 'R R R L'],
        ),
        1,
        L(
          'Mâinile alternează, una cu fiecare mână: R L R L.',
          'The hands alternate, one stroke each: R L R L.',
        ),
      ),
      choice(
        'a-doua',
        L(
          'La double stroke roll, a doua lovitură a fiecărei mâini…',
          'In a double stroke roll, each hand’s second stroke…',
        ),
        opts(
          ['se conduce cu brațul, mai tare', 'is driven by the arm, harder'],
          ['se cântă cu cealaltă mână', 'is played by the other hand'],
          ['se lasă să sară, nu se conduce', 'is allowed to bounce, not driven'],
          ['se sare de tot', 'is skipped entirely'],
        ),
        2,
        L(
          'Se lasă să sară: bățul revine singur, tu doar îl prinzi.',
          'It bounces: the stick comes back by itself, you just catch it.',
        ),
      ),
      choice(
        'egale',
        L('Cum știi că un double stroke e curat?', 'How do you know a double stroke is clean?'),
        opts(
          ['Toate loviturile sunt egale', 'Every stroke is even'],
          ['A doua lovitură e mai tare', 'The second stroke is louder'],
          ['Se aude doar prima', 'Only the first is heard'],
          ['Merge repede', 'It is fast'],
        ),
        0,
        L(
          'Toate egale. De obicei a doua e mai slabă; nu lovi mai tare, ridică bățul mai sus la prima.',
          'All even. Usually the second is weaker; do not hit harder, lift the stick higher for the first.',
        ),
      ),
      pickHeard(
        'accent-pe-timp',
        L('Ascultă. Unde sunt accentele?', 'Listen. Where are the accents?'),
        bar('q-hand-s-acc', 16, { snare: 'XxxxXxxxXxxxXxxx' }, { bpm: 72 }),
        [
          bar('q-hand-s-a', 16, { snare: 'XxXxXxXxXxXxXxXx' }, { bpm: 72 }),
          bar('q-hand-s-b', 16, { snare: 'xxxxxxxxxxxxxxxx' }, { bpm: 72 }),
          bar('q-hand-s-c', 16, { snare: 'XxxxXxxxXxxxXxxx' }, { bpm: 72 }),
        ],
        2,
        L(
          'Un accent pe fiecare timp, adică pe prima din patru. Te ajută să nu pierzi pulsul într-un șir egal de șaisprezecimi.',
          'One accent on every beat, on the first of each four. It keeps you on the pulse in an even run of sixteenths.',
        ),
      ),
      listenChoice(
        'cate-pe-timp',
        L('Câte lovituri auzi pe fiecare timp?', 'How many strokes do you hear on each beat?'),
        bar('q-hand-s-count', 16, { snare: 'XxxxXxxxXxxxXxxx' }, { bpm: 66 }),
        opts(['Două', 'Two'], ['Trei', 'Three'], ['Patru', 'Four'], ['Șase', 'Six']),
        2,
        L(
          'Patru: șaisprezecimi. Ca doubles, sunt patru lovituri, dar doar două mișcări: R R, L L.',
          'Four: sixteenths. As doubles, that is four strokes but only two motions: R R, L L.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-paradiddle-si-familia',
    stage: 'hands',
    lessonId: 'paradiddle-si-familia',
    questions: [
      choice(
        'paradiddle',
        L('Care e sticking-ul paradiddle-ului?', 'What is the paradiddle’s sticking?'),
        opts(
          ['R L R L R L R L', 'R L R L R L R L'],
          ['R R L L R R L L', 'R R L L R R L L'],
          ['R L R R L L', 'R L R R L L'],
          ['R L R R L R L L', 'R L R R L R L L'],
        ),
        3,
        L(
          'R L R R, L R L L: trei lovituri alternate și un diddle, apoi totul oglindit.',
          'R L R R, L R L L: three alternating strokes and a diddle, then all of it mirrored.',
        ),
      ),
      choice(
        'la-ce-diddle',
        L(
          'La ce folosește diddle-ul de la capătul paradiddle-ului?',
          'What is the diddle at the end of the paradiddle for?',
        ),
        opts(
          ['Face figura mai rapidă', 'It makes the figure faster'],
          ['Schimbă mâna care conduce', 'It switches the leading hand'],
          ['Marchează sfârșitul măsurii', 'It marks the end of the bar'],
          ['Înlocuiește accentul', 'It replaces the accent'],
        ),
        1,
        L(
          'Schimbă mâna care conduce: accentul cade pe rând pe dreapta și pe stânga. Pe set, asta mută accentul de pe o piesă pe alta.',
          'It switches the leading hand: the accent falls in turn on the right and the left. On the kit, that moves the accent from piece to piece.',
        ),
      ),
      choice(
        'paradiddle-diddle',
        L(
          'Paradiddle-diddle-ul e R L R R L L. Ce se întâmplă cu mâna care conduce?',
          'The paradiddle-diddle is R L R R L L. What happens to the leading hand?',
        ),
        opts(
          ['Nu se schimbă: dreapta pornește mereu', 'It does not change: the right always leads'],
          ['Se schimbă la fiecare grup', 'It switches on every group'],
          ['Conduce stânga', 'The left leads'],
          ['Conduc amândouă deodată', 'Both lead at once'],
        ),
        0,
        L(
          'Nu se schimbă: cele două perechi de la final aduc dreapta înapoi în față. De aceea e bun pentru fill-uri rapide pe tomuri.',
          'It does not change: the two pairs at the end bring the right back in front. That is why it suits fast tom fills.',
        ),
      ),
      pickHeard(
        'double-paradiddle',
        L(
          'Ascultă un double paradiddle. Care grilă e?',
          'Listen to a double paradiddle. Which grid is it?',
        ),
        bar('q-hand-p-dp', 12, { snare: 'XxxxxxXxxxxx' }, { bpm: 72 }),
        [
          bar('q-hand-p-a', 16, { snare: 'XxxxXxxxXxxxXxxx' }, { bpm: 72 }),
          bar('q-hand-p-b', 12, { snare: 'XxxxxxXxxxxx' }, { bpm: 72 }),
          bar('q-hand-p-c', 12, { snare: 'XxxXxxXxxXxx' }, { bpm: 72 }),
        ],
        1,
        L(
          'Șase lovituri pe grup, pe triolete, deci un accent la fiecare doi timpi. A e un paradiddle pe șaisprezecimi, C un accent pe fiecare timp.',
          'Six strokes per group, on triplets, so one accent every two beats. A is a sixteenth-note paradiddle, C an accent on every beat.',
        ),
      ),
      markHeard(
        'pe-cazan',
        L(
          'Paradiddle cu dreapta pe cazan și stânga pe toba mică. Marchează cazanul; toba mică e scrisă.',
          'A paradiddle with the right hand on the floor tom and the left on the snare. Mark the floor tom; the snare is written in.',
        ),
        bar('q-hand-p-floor', 8, { floor: 'x.xx.x..', snare: '.x..x.xx' }, { bpm: 72 }),
        ['snare', 'floor'],
        ['snare'],
        L(
          'R L R R, L R L L: dreapta pe pașii 1, 3, 4 și 6 ai măsurii. Așa devine un rudiment un fill: mâna dreaptă pe altă piesă.',
          'R L R R, L R L L: the right hand on steps 1, 3, 4 and 6 of the bar. That is how a rudiment becomes a fill: the right hand on another piece.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-flam-si-drag',
    stage: 'hands',
    lessonId: 'flam-si-drag',
    questions: [
      listenChoice(
        'e-flam',
        L('Ascultă. Ce rudiment e?', 'Listen. Which rudiment is it?'),
        snareDemo({
          id: 'q-hand-f-flam',
          bars: [{ sticking: 'RLRL', grace: 'ffff' }],
          tempo: tempo(66),
        }),
        opts(
          ['Lovituri simple', 'Plain strokes'],
          ['Drag', 'Drag'],
          ['Ghost notes', 'Ghost notes'],
          ['Flam', 'Flam'],
        ),
        3,
        L(
          'Flam: fiecare lovitură e lată, cu o grație foarte aproape înainte.',
          'Flam: each stroke is wide, with a grace note just before it.',
        ),
      ),
      listenChoice(
        'e-drag',
        L('Și acum?', 'And now?'),
        snareDemo({
          id: 'q-hand-f-drag',
          bars: [{ sticking: 'RLRL', grace: 'dddd' }],
          tempo: tempo(66),
        }),
        opts(
          ['Flam', 'Flam'],
          ['Drag', 'Drag'],
          ['Double stroke', 'Double stroke'],
          ['Lovituri simple', 'Plain strokes'],
        ),
        1,
        L(
          'Drag: două grații înaintea fiecărei lovituri, o lovitură cu coadă.',
          'Drag: two grace notes before each stroke, a stroke with a tail.',
        ),
      ),
      choice(
        'latimea',
        L(
          'Ce se întâmplă cu distanța dintre grație și lovitură când încetinești?',
          'What happens to the gap between grace note and stroke when you slow down?',
        ),
        opts(
          ['Crește odată cu tempoul', 'It grows with the tempo'],
          ['Devine o optime', 'It becomes an eighth'],
          ['Rămâne aceeași', 'It stays the same'],
          ['Dispare', 'It disappears'],
        ),
        2,
        L(
          'Rămâne aceeași, vreo 30 ms: flam-ul e un gest, nu o subdiviziune. Cântat ca două note ritmice, nu mai e flam.',
          'It stays the same, about 30 ms: a flam is a gesture, not a subdivision. Played as two rhythmic notes, it is no longer a flam.',
        ),
      ),
      choice(
        'flam-curat',
        L(
          'Flam-ul tău sună ca două lovituri egale. De ce?',
          'Your flam sounds like two equal strokes. Why?',
        ),
        opts(
          ['Bețele erau la aceeași înălțime', 'Both sticks were at the same height'],
          ['Ai cântat prea încet', 'You played too slowly'],
          ['Ai folosit mâna greșită', 'You used the wrong hand'],
          ['Toba e prea întinsă', 'The drum is tuned too tight'],
        ),
        0,
        L(
          'Bețele trebuie să pornească de la înălțimi diferite: grația de jos, lovitura de sus.',
          'The sticks must start from different heights: the grace from low, the stroke from high.',
        ),
      ),
      pickHeard(
        'flam-tap',
        L(
          'Ascultă un flam tap. Unde sunt loviturile tari?',
          'Listen to a flam tap. Where are the loud strokes?',
        ),
        snareDemo({
          id: 'q-hand-f-tap',
          bars: [{ sticking: 'RRLLRRLL', accents: 'x.x.x.x.', grace: 'f.f.f.f.' }],
          tempo: tempo(66),
        }),
        [
          bar('q-hand-f-tap-a', 8, { snare: 'xXxXxXxX' }, { bpm: 66 }),
          bar('q-hand-f-tap-b', 8, { snare: 'XxXxXxXx' }, { bpm: 66 }),
          bar('q-hand-f-tap-c', 8, { snare: 'XXXXXXXX' }, { bpm: 66 }),
        ],
        1,
        L(
          'Flam-ul accentuat pe timp, apoi lovitura mică cu aceeași mână: tare-încet, tare-încet. Grila nu desenează grația, doar înălțimea loviturii.',
          'The accented flam on the beat, then the small stroke with the same hand: loud-soft, loud-soft. The grid does not draw the grace, only how hard the stroke is.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-inaltimile-batului',
    stage: 'hands',
    lessonId: 'inaltimile-batului',
    questions: [
      choice(
        'volum',
        L('De unde vine volumul unei lovituri?', 'Where does a stroke’s volume come from?'),
        opts(
          ['Din forța brațului', 'From the arm’s force'],
          ['Din cât de strâns ții bățul', 'From how tightly you grip'],
          ['Din înălțimea de la care pornește bățul', 'From the height the stick starts at'],
          ['Din grosimea bățului', 'From the stick’s thickness'],
        ),
        2,
        L(
          'Din înălțime: nu lovi mai tare, ridică mai sus.',
          'From height: do not hit harder, lift higher.',
        ),
      ),
      choice(
        'dupa-accent',
        L('Care e partea grea a unui accent?', 'What is the hard part of an accent?'),
        opts(
          ['Să cobori bățul imediat după', 'Bringing the stick down right after'],
          ['Să ridici bățul destul de sus', 'Lifting the stick high enough'],
          ['Să lovești exact pe timp', 'Hitting right on the beat'],
          ['Să-l faci cu mâna slabă', 'Doing it with the weak hand'],
        ),
        0,
        L(
          'Să cobori: un băț rămas sus face și lovitura următoare accent.',
          'Coming down: a stick left high turns the next stroke into an accent too.',
        ),
      ),
      listenChoice(
        'cate-niveluri',
        L('Câte niveluri de volum diferite auzi?', 'How many different volume levels do you hear?'),
        bar('q-hand-i-3', 16, { snare: 'XooxXooxXooxXoox' }, { bpm: 66 }),
        opts(['Unul', 'One'], ['Două', 'Two'], ['Trei', 'Three'], ['Patru', 'Four']),
        2,
        L(
          'Trei: accentul pe timp, două ghost notes, o lovitură normală.',
          'Three: the accent on the beat, two ghost notes, one normal stroke.',
        ),
      ),
      pickHeard(
        'trei-niveluri-grila',
        L('Care grilă e ce auzi?', 'Which grid is what you hear?'),
        bar('q-hand-i-g', 16, { snare: 'XooxXooxXooxXoox' }, { bpm: 66 }),
        [
          bar('q-hand-i-a', 16, { snare: 'XxxxXxxxXxxxXxxx' }, { bpm: 66 }),
          bar('q-hand-i-b', 16, { snare: 'XoooXoooXoooXooo' }, { bpm: 66 }),
          bar('q-hand-i-c', 16, { snare: 'XooxXooxXooxXoox' }, { bpm: 66 }),
        ],
        2,
        L(
          'Accent, două ghost notes, o lovitură normală, pe fiecare timp. În A nu sunt ghost notes, în B lipsește lovitura normală.',
          'Accent, two ghost notes, one normal stroke, on every beat. A has no ghost notes, B is missing the normal stroke.',
        ),
      ),
      choice(
        'ghost-prea-tare',
        L(
          'Ghost note-urile tale se aud ca note clare. Ce înseamnă?',
          'Your ghost notes sound like clear notes. What does that mean?',
        ),
        opts(
          ['Sunt corecte', 'They are right'],
          ['Sunt prea încet', 'They are too quiet'],
          ['Sunt pe timpul greșit', 'They are on the wrong beat'],
          ['Sunt prea tari', 'They are too loud'],
        ),
        3,
        L(
          'Prea tari: un ghost note e o umbră care se simte, nu o notă care se aude. Coboară bățul aproape lipit de tobă.',
          'Too loud: a ghost note is a shadow you feel, not a note you hear. Bring the stick right down near the head.',
        ),
      ),
    ],
  },

  {
    id: 'quiz-rolls',
    stage: 'hands',
    lessonId: 'rolls',
    questions: [
      choice(
        'open-close-open',
        L('Ce e metoda open-close-open?', 'What is the open-close-open method?'),
        opts(
          ['Fusul deschis, închis și iar deschis', 'Hi-hat open, closed and open again'],
          [
            'Pornești încet, accelerezi treptat, apoi încetinești fără oprire',
            'Start slow, speed up gradually, then slow down without stopping',
          ],
          ['Cânți tare, încet, tare', 'Play loud, soft, loud'],
          ['Alternezi mâinile la fiecare măsură', 'Swap hands every bar'],
        ),
        1,
        L(
          'Încet, tot mai repede cât controlezi, apoi înapoi la fel. Pe drum, tehnica trece singură de la braț la încheietură.',
          'Slow, faster for as long as you are in control, then back down. Along the way, the technique moves from arm to wrist by itself.',
        ),
      ),
      markHeard(
        'five-stroke',
        L(
          'Ascultă un five stroke roll, de două ori. Marchează loviturile.',
          'Listen to a five stroke roll, twice. Mark the strokes.',
        ),
        bar('q-hand-ro-5', 16, { snare: 'xxxxX...xxxxX...' }, { bpm: 66 }),
        ['snare'],
        [],
        L(
          'Cinci lovituri, apoi liniște: R R L L și accentul. Pe grilă sunt cinci pătrate la rând, de două ori.',
          'Five strokes, then silence: R R L L and the accent. On the grid, five squares in a row, twice.',
        ),
      ),
      choice(
        'seven-stroke',
        L('Cum e făcut un seven stroke roll?', 'How is a seven stroke roll built?'),
        opts(
          ['Șapte lovituri alternate', 'Seven alternating strokes'],
          ['Două perechi și trei accente', 'Two pairs and three accents'],
          ['Trei perechi și o lovitură accentuată', 'Three pairs and one accented stroke'],
          ['Un flam și șase lovituri', 'A flam and six strokes'],
        ),
        2,
        L(
          'Trei perechi și accentul: R R L L R R L. Regula pentru toate: perechi, apoi o lovitură.',
          'Three pairs and the accent: R R L L R R L. The rule for all of them: pairs, then one stroke.',
        ),
      ),
      listenChoice(
        'ce-roll',
        L('Ascultă. Ce roll e?', 'Listen. Which roll is it?'),
        bar('q-hand-ro-9', 16, { snare: 'xxxxxxxxX.......' }, { bpm: 66 }),
        opts(
          ['Five stroke', 'Five stroke'],
          ['Seven stroke', 'Seven stroke'],
          ['Nine stroke', 'Nine stroke'],
          ['Buzz roll', 'Buzz roll'],
        ),
        2,
        L(
          'Nine stroke: patru perechi pe doi timpi și accentul pe al treilea.',
          'Nine stroke: four pairs over two beats and the accent on the third.',
        ),
      ),
      choice(
        'buzz',
        L('Ce e un buzz roll?', 'What is a buzz roll?'),
        opts(
          [
            'Bățul presat în tobă și lăsat să sară de mai multe ori',
            'The stick pressed into the head and left to bounce several times',
          ],
          ['Un roll de nouă lovituri', 'A nine-stroke roll'],
          ['Un roll cântat pe cinel', 'A roll played on a cymbal'],
          ['Doubles pe optimi', 'Doubles on eighths'],
        ),
        0,
        L(
          'Bățul presat ușor și lăsat să sară; cele două mâini se suprapun și sună continuu. N-are un număr de lovituri.',
          'The stick pressed lightly and left to bounce; the two hands overlap and sound continuous. It has no stroke count.',
        ),
      ),
    ],
  },

  {
    id: 'review-hands',
    stage: 'hands',
    questions: [
      choice(
        'r-double',
        L(
          'Care e sticking-ul double stroke roll-ului?',
          'What is the double stroke roll’s sticking?',
        ),
        opts(
          ['R L R L', 'R L R L'],
          ['R R L L', 'R R L L'],
          ['R L R R', 'R L R R'],
          ['R L L R', 'R L L R'],
        ),
        1,
        L(
          'R R L L: fiecare mână de două ori, a doua lovitură din săritură.',
          'R R L L: each hand twice, the second stroke from the bounce.',
        ),
      ),
      choice(
        'r-familia',
        L(
          'Din ce sunt făcute aproape toate rudimentele?',
          'What are nearly all rudiments made of?',
        ),
        opts(
          ['Din flam-uri', 'Flams'],
          ['Din accente', 'Accents'],
          ['Din ghost notes', 'Ghost notes'],
          ['Din singles și doubles', 'Singles and doubles'],
        ),
        3,
        L(
          'Din singles și doubles. De aceea un double stroke curat deschide mai mult decât zece rudimente învățate pe jumătate.',
          'Singles and doubles. That is why a clean double stroke opens more than ten half-learned rudiments.',
        ),
      ),
      markHeard(
        'r-seven',
        L(
          'Ascultă un seven stroke roll, de două ori. Marchează loviturile.',
          'Listen to a seven stroke roll, twice. Mark the strokes.',
        ),
        bar('q-hand-rr-7', 16, { snare: 'xxxxxxX.xxxxxxX.' }, { bpm: 60 }),
        ['snare'],
        [],
        L(
          'Șapte lovituri, apoi o pauză scurtă: trei perechi și accentul. Pe grilă, șapte pătrate la rând, de două ori.',
          'Seven strokes, then a short rest: three pairs and the accent. On the grid, seven squares in a row, twice.',
        ),
      ),
      listenChoice(
        'r-flam-sau-drag',
        L('Ascultă. Flam sau drag?', 'Listen. Flam or drag?'),
        snareDemo({
          id: 'q-hand-rr-drag',
          bars: [{ sticking: 'RLRL', grace: 'dddd' }],
          tempo: tempo(60),
        }),
        opts(['Flam', 'Flam'], ['Drag', 'Drag']),
        1,
        L(
          'Drag: o coadă de două grații înaintea fiecărei lovituri. Flam-ul ar avea una.',
          'Drag: a tail of two grace notes before each stroke. A flam would have one.',
        ),
      ),
      choice(
        'r-paradiddle-mana',
        L(
          'Paradiddle-ul începe cu R. Cu ce mână începe al doilea grup?',
          'The paradiddle starts with R. Which hand starts the second group?',
        ),
        opts(
          ['Tot cu dreapta', 'The right again'],
          ['Cu stânga', 'The left'],
          ['Cu amândouă', 'Both'],
          ['Depinde de tempo', 'It depends on the tempo'],
        ),
        1,
        L(
          'Cu stânga: L R L L. Diddle-ul de la capătul primului grup schimbă mâna.',
          'The left: L R L L. The diddle at the end of the first group switches hands.',
        ),
      ),
      pickHeard(
        'r-accente',
        L('Ascultă. Care grilă e ce auzi?', 'Listen. Which grid is what you hear?'),
        bar('q-hand-rr-acc', 8, { snare: 'XoXoXoXo' }, { bpm: 72 }),
        [
          bar('q-hand-rr-acc-a', 8, { snare: 'XoXoXoXo' }, { bpm: 72 }),
          bar('q-hand-rr-acc-b', 8, { snare: 'oXoXoXoX' }, { bpm: 72 }),
          bar('q-hand-rr-acc-c', 8, { snare: 'XxXxXxXx' }, { bpm: 72 }),
        ],
        0,
        L(
          'Accent pe timp, ghost note pe „și”: tare-umbră, tare-umbră. B le inversează, C are lovituri normale în locul ghost-urilor.',
          'Accent on the beat, ghost note on the "and": loud-shadow, loud-shadow. B swaps them, C has normal strokes instead of ghosts.',
        ),
      ),
      choice(
        'r-triolete',
        L(
          'Pe ce subdiviziune se cântă de obicei double paradiddle-ul, și de ce?',
          'What subdivision is the double paradiddle usually played on, and why?',
        ),
        opts(
          ['Pe optimi, fiindcă are opt lovituri', 'Eighths, because it has eight strokes'],
          ['Pe șaisprezecimi, ca paradiddle-ul', 'Sixteenths, like the paradiddle'],
          ['Pe triolete, fiindcă are șase lovituri', 'Triplets, because it has six strokes'],
          ['Pe pătrimi', 'Quarters'],
        ),
        2,
        L(
          'Pe triolete: șase lovituri umplu exact doi timpi de câte trei. De aceea apare în shuffle și vals.',
          'Triplets: six strokes fill exactly two beats of three. That is why it shows up in shuffles and waltzes.',
        ),
      ),
      markHeard(
        'r-paradiddle-tom',
        L(
          'Paradiddle pe șaisprezecimi, cu dreapta pe tomul 1 și stânga pe toba mică. Marchează tomul.',
          'A sixteenth-note paradiddle, right hand on the high tom, left on the snare. Mark the tom.',
        ),
        bar(
          'q-hand-rr-tom',
          16,
          { tom: 'x.xx.x..x.xx.x..', snare: '.x..x.xx.x..x.xx' },
          { bpm: 60 },
        ),
        ['tom', 'snare'],
        ['snare'],
        L(
          'R L R R L R L L, de două ori: dreapta cade pe pașii 1, 3, 4 și 6 din fiecare grup de opt. Diddle-ul dă două lovituri la rând pe tom.',
          'R L R R L R L L, twice: the right lands on steps 1, 3, 4 and 6 of each group of eight. The diddle gives two strokes in a row on the tom.',
        ),
      ),
      choice(
        'r-volum',
        L('Vrei un accent mai tare. Ce schimbi?', 'You want a louder accent. What do you change?'),
        opts(
          ['Strângi bățul mai tare', 'Grip the stick harder'],
          ['Ridici bățul mai sus', 'Lift the stick higher'],
          ['Lovești din umăr', 'Hit from the shoulder'],
          ['Lovești mai aproape de margine', 'Hit closer to the edge'],
        ),
        1,
        L(
          'Înălțimea: bățul pornit mai de sus. Forța și strânsoarea doar te obosesc.',
          'Height: the stick starting higher. Force and grip only tire you out.',
        ),
      ),
      listenChoice(
        'r-roll-sau-nu',
        L('Ascultă. Ce auzi?', 'Listen. What do you hear?'),
        bar('q-hand-rr-5', 16, { snare: 'xxxxX...xxxxX...' }, { bpm: 66 }),
        opts(
          ['Five stroke roll', 'Five stroke roll'],
          ['Nine stroke roll', 'Nine stroke roll'],
          ['Single stroke roll', 'Single stroke roll'],
          ['Paradiddle', 'Paradiddle'],
        ),
        0,
        L(
          'Five stroke: patru lovituri în perechi și accentul, apoi pauză.',
          'Five stroke: four strokes in pairs and the accent, then a rest.',
        ),
      ),
      choice(
        'r-cum-exersezi',
        L('Cum se exersează orice rudiment nou?', 'How is any new rudiment practised?'),
        opts(
          ['Direct la tempoul piesei', 'Straight at the song’s tempo'],
          ['Doar cu mâna bună în față', 'Only with the good hand leading'],
          ['Încet, cu metronom, pe ambele părți', 'Slowly, with a metronome, on both sides'],
          ['Fără metronom, ca să nu te încurce', 'Without a metronome, so it does not distract'],
        ),
        2,
        L(
          'Încet, cu metronom, pornit și cu dreapta, și cu stânga. Ce nu se aude la tempo mic nu dispare la tempo mare.',
          'Slowly, with a metronome, leading with the right and with the left. What you cannot hear slowly does not vanish at speed.',
        ),
      ),
    ],
  },
]
