import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import { bar, choice, L, listenChoice, markHeard, opts, pickHeard, ROCK8 } from './helpers'

/*
  Etapa 0, Instrumentul.

  Elevul încă n-a învățat portativul (Etapa 1), deci nicio întrebare nu-l cere.
  Se întreabă prin SUNET: ce piesă auzi, unde cade. Grila apare doar pe pătrimi
  și optimi, cum a apărut și în lecție, sub exemple.
*/

const SLOW = 72

export const instrumentQuizzes: DrumQuiz<LocalizedText>[] = [
  {
    id: 'quiz-setul-si-piesele',
    stage: 'instrument',
    lessonId: 'setul-si-piesele',
    questions: [
      listenChoice(
        'ce-piesa-1',
        L('Ascultă. Ce piesă auzi?', 'Listen. Which piece do you hear?'),
        bar('q-inst-kick', 4, { kick: 'xxxx' }, { bpm: SLOW }),
        opts(
          ['Toba mică', 'Snare'],
          ['Toba mare', 'Bass drum'],
          ['Fusul', 'Hi-hat'],
          ['Crash-ul', 'Crash'],
        ),
        1,
        L(
          'Toba mare: cea mai joasă voce a setului, cântată cu piciorul. Se simte mai mult decât se aude.',
          'The bass drum: the lowest voice of the kit, played with the foot. You feel it as much as you hear it.',
        ),
      ),
      listenChoice(
        'ce-piesa-2',
        L('Și acum?', 'And now?'),
        bar('q-inst-hat', 8, { hhClosed: 'xxxxxxxx' }, { bpm: SLOW }),
        opts(
          ['Toba mică', 'Snare'],
          ['Crash-ul', 'Crash'],
          ['Fusul închis', 'Closed hi-hat'],
          ['Toba mare', 'Bass drum'],
        ),
        2,
        L(
          'Fusul închis: scurt, ascuțit, des. E piesa care ține timpul, de aceea se aude cel mai des.',
          'The closed hi-hat: short, bright, frequent. It is the piece that keeps time, which is why it is heard most.',
        ),
      ),
      choice(
        'backbeat',
        L(
          'Pe ce timpi cade toba mică în aproape toată muzica pe care o asculți?',
          'On which beats does the snare land in nearly all the music you hear?',
        ),
        opts(
          ['Pe 1 și 3', 'On 1 and 3'],
          ['Pe 2 și 4', 'On 2 and 4'],
          ['Pe toți patru', 'On all four'],
          ['Doar pe 1', 'Only on 1'],
        ),
        1,
        L(
          'Pe 2 și 4: backbeat-ul. Sunt timpii pe care bați din palme la un concert.',
          'On 2 and 4: the backbeat. They are the beats you clap on at a gig.',
        ),
      ),
      markHeard(
        'marcheaza-toba-mica',
        L(
          'Ascultă și marchează unde cade toba mică. Toba mare e deja scrisă.',
          'Listen and mark where the snare lands. The bass drum is already written in.',
        ),
        bar('q-inst-backbeat', 4, { snare: '.x.x', kick: 'x.x.' }, { bpm: SLOW }),
        ['snare', 'kick'],
        ['kick'],
        L(
          'Toba mică pe 2 și 4, între loviturile de tobă mare. Una jos, una sus: așa se aude backbeat-ul.',
          'Snare on 2 and 4, between the bass drum strokes. One low, one high: that is how the backbeat sounds.',
        ),
      ),
      choice(
        'punctuatie',
        L(
          'Care cinel se lovește rar și tare, ca punctuație la începutul unui refren?',
          'Which cymbal is struck rarely and hard, as punctuation at the start of a chorus?',
        ),
        opts(
          ['Ride-ul', 'The ride'],
          ['Fusul', 'The hi-hat'],
          ['Crash-ul', 'The crash'],
          ['Niciunul, cinelele țin doar timpul', 'None, cymbals only keep time'],
        ),
        2,
        L(
          'Crash-ul. Ride-ul și fusul se lovesc des și țin timpul; crash-ul marchează un moment.',
          'The crash. The ride and the hi-hat are struck often and keep time; the crash marks a moment.',
        ),
      ),
    ],
  },

  {
    id: 'review-instrument',
    stage: 'instrument',
    questions: [
      listenChoice(
        'r-tomuri',
        L('Ascultă. Ce se aude?', 'Listen. What do you hear?'),
        bar('q-inst-r-toms', 4, { tom: 'x...', mid: '.x..', floor: '..x.' }, { bpm: SLOW }),
        opts(
          ['Toba mică de trei ori', 'The snare three times'],
          ['Cele trei tomuri, de la jos la înalt', 'The three toms, low to high'],
          ['Cele trei tomuri, de la înalt la jos', 'The three toms, high to low'],
          ['Trei cinele diferite', 'Three different cymbals'],
        ),
        2,
        L(
          'Tomul 1, tomul 2, cazanul: fiecare mai jos decât cel dinainte. Ordinea e de la stânga la dreapta, cum stau pe set.',
          'High tom, mid tom, floor tom: each lower than the one before. The order runs left to right, as they sit on the kit.',
        ),
      ),
      listenChoice(
        'r-cazan',
        L(
          'Ce piesă e asta? Atenție, e ușor de confundat.',
          'Which piece is this? Careful, it is easy to mix up.',
        ),
        bar('q-inst-r-floor', 4, { floor: 'xxxx' }, { bpm: SLOW }),
        opts(
          ['Toba mare', 'Bass drum'],
          ['Cazanul', 'Floor tom'],
          ['Toba mică', 'Snare'],
          ['Ride-ul', 'Ride'],
        ),
        1,
        L(
          'Cazanul: jos, dar cu atac de băț și cu o coadă care sună. Toba mare e mai scurtă și mai surdă, o simți mai mult în piept.',
          'The floor tom: low, but with a stick attack and a ringing tail. The bass drum is shorter and duller, felt more in the chest.',
        ),
      ),
      choice(
        'r-picior',
        L(
          'Ce tobă se cântă cu piciorul, printr-o pedală, și e vocea cea mai joasă a setului?',
          'Which drum is played with the foot, through a pedal, and is the lowest voice of the kit?',
        ),
        opts(
          ['Cazanul', 'Floor tom'],
          ['Tomul 2', 'Mid tom'],
          ['Toba mică', 'Snare'],
          ['Toba mare', 'Bass drum'],
        ),
        3,
        L(
          'Toba mare. Cazanul e și el jos, dar se cântă cu bățul.',
          'The bass drum. The floor tom is low too, but it is played with a stick.',
        ),
      ),
      choice(
        'r-arc',
        L('Ce face arcul de sârme de sub toba mică?', 'What do the wires under the snare do?'),
        opts(
          ['Îi dă sunetul aspru, de pocnet', 'They give it its sharp crack'],
          ['O fac să sune mai jos', 'They make it sound lower'],
          ['O închid, ca pedala fusului', 'They close it, like the hi-hat pedal'],
          ['Nimic, sunt doar pentru prindere', 'Nothing, they only hold it in place'],
        ),
        0,
        L(
          'Sârmele vibrează pe fața de jos și transformă bătaia într-un pocnet. Fără ele, toba mică ar suna ca un tom.',
          'The wires buzz against the bottom head and turn the stroke into a crack. Without them, the snare would sound like a tom.',
        ),
      ),
      choice(
        'r-fus-deschis',
        L(
          'Fusul deschis, față de cel închis, sună…',
          'The open hi-hat, compared with the closed one, sounds…',
        ),
        opts(
          ['mai scurt', 'shorter'],
          ['mai jos', 'lower'],
          ['mai lung', 'longer'],
          ['la fel', 'the same'],
        ),
        2,
        L(
          'Mai lung: cinelele nu se mai ating, deci sună liber. Închis, se opresc una pe alta și sunetul e scurt.',
          'Longer: the cymbals no longer touch, so they ring freely. Closed, they stop each other and the sound is short.',
        ),
      ),
      listenChoice(
        'r-ride',
        L(
          'Ascultă. După prima lovitură, ce cinel ține timpul?',
          'Listen. After the first stroke, which cymbal keeps time?',
        ),
        bar(
          'q-inst-r-cymbals',
          8,
          { crash: 'x.......', ride: '..xxxxxx', kick: 'x...x...' },
          { bpm: SLOW },
        ),
        opts(
          ['Crash-ul', 'The crash'],
          ['Ride-ul', 'The ride'],
          ['Fusul închis', 'The closed hi-hat'],
          ['Niciunul', 'Neither'],
        ),
        1,
        L(
          'Ride-ul: se lovește des, ca fusul, dar sună mai deschis. Crash-ul a fost doar prima lovitură, punctuația.',
          'The ride: struck often, like the hi-hat, but more open. The crash was only the first stroke, the punctuation.',
        ),
      ),
      pickHeard(
        'r-rock',
        L(
          'Ascultă groove-ul. Care grilă e ce auzi?',
          'Listen to the groove. Which grid is what you hear?',
        ),
        bar('q-inst-r-rock', 8, ROCK8, { bpm: 84 }),
        [
          bar(
            'q-inst-r-rock-a',
            8,
            { hhClosed: 'xxxxxxxx', snare: 'x...x...', kick: '..x...x.' },
            { bpm: 84 },
          ),
          bar(
            'q-inst-r-rock-b',
            8,
            { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x.x.x.x.' },
            { bpm: 84 },
          ),
          bar(
            'q-inst-r-rock-c',
            8,
            { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
            { bpm: 84 },
          ),
          bar('q-inst-r-rock-d', 8, { snare: '..x...x.', kick: 'x...x...' }, { bpm: 84 }),
        ],
        2,
        L(
          'Fusul pe toate optimile, toba mare pe 1 și 3, toba mică pe 2 și 4: cele trei roluri. Varianta A le inversează pe ultimele două, B pune toba mare pe fiecare timp, D n-are fus.',
          'Hi-hat on every eighth, bass drum on 1 and 3, snare on 2 and 4: the three roles. Option A swaps the last two, B puts the bass drum on every beat, D has no hi-hat.',
        ),
      ),
      markHeard(
        'r-marcheaza-fus',
        L(
          'Marchează fusul. Toba mare și toba mică sunt deja scrise.',
          'Mark the hi-hat. Bass drum and snare are already written in.',
        ),
        bar('q-inst-r-hat', 8, ROCK8, { bpm: SLOW }),
        ['hhClosed', 'snare', 'kick'],
        ['snare', 'kick'],
        L(
          'Pe fiecare optime: două lovituri pe timp. Fusul nu se oprește niciodată, nici când lovesc celelalte.',
          'On every eighth: two strokes per beat. The hi-hat never stops, not even when the others strike.',
        ),
      ),
      choice(
        'r-rol-fus',
        L(
          'Ce rol are fusul în groove-ul de rock?',
          'What is the hi-hat’s role in the rock groove?',
        ),
        opts(
          ['Dă backbeat-ul', 'It gives the backbeat'],
          ['Ține timpul', 'It keeps time'],
          ['Marchează doar „unu”', 'It marks only beat one'],
          ['Face fill-urile', 'It plays the fills'],
        ),
        1,
        L(
          'Ține timpul. Backbeat-ul e al tobei mici, iar pulsul de jos al tobei mari.',
          'It keeps time. The backbeat belongs to the snare, the low pulse to the bass drum.',
        ),
      ),
      markHeard(
        'r-marcheaza-mare',
        L(
          'Marchează toba mare. Toba mică e deja scrisă.',
          'Mark the bass drum. The snare is already written in.',
        ),
        bar('q-inst-r-kick', 4, { snare: '.x.x', kick: 'x.x.' }, { bpm: SLOW }),
        ['snare', 'kick'],
        ['snare'],
        L(
          'Pe 1 și 3, sub backbeat. Jos, sus, jos, sus.',
          'On 1 and 3, under the backbeat. Low, high, low, high.',
        ),
      ),
      listenChoice(
        'r-numara',
        L(
          'Câte lovituri de tobă mare auzi într-o măsură?',
          'How many bass drum strokes do you hear in one bar?',
        ),
        bar('q-inst-r-count', 8, { hhClosed: 'xxxxxxxx', kick: 'x..x..x.' }, { bpm: SLOW }),
        opts(['Două', 'Two'], ['Trei', 'Three'], ['Patru', 'Four'], ['Opt', 'Eight']),
        1,
        L(
          'Trei: pe „unu”, pe „doi-și” și pe „patru”. Fusul te ajută să numeri, câte două lovituri pe timp.',
          'Three: on one, on the "and" of 2 and on four. The hi-hat helps you count, two strokes per beat.',
        ),
      ),
      choice(
        'r-cazan-unde',
        L('Unde stă cazanul pe set?', 'Where does the floor tom sit on the kit?'),
        opts(
          ['În stânga, lângă fus', 'On the left, next to the hi-hat'],
          ['Deasupra tobei mari', 'On top of the bass drum'],
          ['Sub toba mică', 'Under the snare'],
          ['În dreapta, pe picioarele lui', 'On the right, on its own legs'],
        ),
        3,
        L(
          'În dreapta ta, pe picioarele lui. Tomurile 1 și 2 stau deasupra tobei mari.',
          'To your right, on its own legs. The high and mid toms sit above the bass drum.',
        ),
      ),
    ],
  },
]
