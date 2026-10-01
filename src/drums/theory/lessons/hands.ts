import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { snareDemo } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 2, Mâinile, ca sistem.

  Șase lecții: ce e un rudiment, cele două cărămizi (singles și doubles),
  diddle-urile, ornamentele, cele trei înălțimi ale bățului, și rolls-urile cu
  felul în care se ajunge la ele.

  Tot ce e aici se bate pe TOBA MICĂ și se citește pe rândul de mâini
  (`showSticking`), nu pe grilă. Nu e economie de desen: la un double stroke
  roll și la un single stroke roll grila desenează exact același rând de opt
  pătrate, adică ascunde fix deosebirea pe care o predă etapa. Rândul de mâini
  o arată, și arată și accentele și ornamentele, care la rudimente sunt
  jumătate din figură.

  ABATERI DE LA PLAN (`references/curriculum.md`, Etapa 2), scrise aici ca să nu
  pară scăpări:

  1. **„Sticking-ul și de ce contează" nu are lecție separată.** Un rudiment E
     un sticking: un pattern de mâini scurt. O lecție despre ce e un rudiment
     urmată de una despre ce e sticking-ul ar fi spus același lucru de două ori,
     a doua oară fără nimic nou de ascultat. Noțiunea și termenul intră în prima
     lecție, acolo unde elevul oricum întreabă „de ce scrie R acolo?".

  2. **„Familiile" s-au despărțit în trei lecții**, nu una. Singles, doubles,
     diddles, flams și drags într-o singură lecție ar fi însemnat cinci noțiuni
     cu câte un exemplu fiecare, adică un catalog. Despărțite, fiecare lecție
     are o propoziție a ei: cele două cărămizi · ce se întâmplă când o mână
     lovește de două ori · ce se întâmplă când a doua mână vine înainte.

  3. **Open-close-open a intrat în lecția de rolls**, nu înaintea ei. E felul în
     care se ajunge la un roll, nu o noțiune care stă singură: predată separat,
     ar fi fost un sfat de exersare fără ce să exersezi.

  CE NU SE POATE CÂNTA, și se predă citit: **buzz roll-ul**. Kitul are o singură
  mostră de tobă mică, iar un buzz e tocmai sunetul bățului care sare de mai
  multe ori în fața tobei, nu un șir de lovituri dese. Un exemplu care ar reda
  lovituri separate în locul lui ar preda exact pe dos. Lecția o spune pe față,
  aceeași alegere ca la cross-stick și rimshot în Etapa 1.

  CE NU E AICI, deși ar fi fost tentant: **niciun groove**. Rudimentele ajung în
  muzică prin fill-uri și prin orchestrare, iar amândouă presupun Etapa
  „Groove-ul". Un groove strecurat aici ar fi arătat frumos și ar fi cerut
  elevului trei lucruri nepredate. Ce poate face elevul cu etapa asta, imediat,
  e modulul de practică Rudimente: acolo chiar bate, iar aplicația ține timpul.
*/

/** Pătrimi și optimi pe toba mică: capătul de sus e ce rămâne controlabil. */
const EIGHTHS = { min: 50, max: 140, suggested: 76 }
/**
 * Șaisprezecimi: patru pași pe timp.
 *
 * La `max`, două lovituri vecine ale aceleiași mâini cad la `60000 / max / 4`
 * ms una de alta, iar validarea respinge sub 90 ms (`MIN_HAND_GAP_MS`), adică
 * orice peste 166 BPM. 110 lasă 136 ms, și nu e limita brațului, ci a învățării:
 * un double stroke exersat mai repede decât poate fi controlat se învață greșit.
 */
const SIXTEENTHS = { min: 45, max: 110, suggested: 64 }
/** Triolete: trei pași pe timp, deci mai lejer la mână decât șaisprezecimile. */
const TRIPLETS = { min: 45, max: 108, suggested: 60 }
/** Ornamentele se judecă după cât de lat sună, nu după viteză: tempo mic. */
const GRACE = { min: 45, max: 120, suggested: 70 }

export const handsLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'ce-e-un-rudiment',
    stage: 'hands',
    title: { ro: 'Ce e un rudiment', en: 'What a rudiment is' },
    goal: {
      ro: 'Înțelegi ce e un rudiment, de ce se scrie cu R și L și de ce contează cu ce mână lovești.',
      en: 'Understand what a rudiment is, why it is written with R and L, and why it matters which hand strikes.',
    },
    /*
      Optimile, nu mai mult: primul exemplu din lecție are două lovituri pe timp
      și atât are nevoie. Șaisprezecimile se cer abia în lecția următoare, unde
      chiar apar.
    */
    requiresRhythmLesson: 'optimea',
    sections: [
      {
        id: 'cele-doua-maini',
        heading: { ro: 'Ai două mâini, nu una', en: 'You have two hands, not one' },
        body: {
          ro: 'Pe toba mică, aceeași notă poate fi lovită cu dreapta sau cu stânga, iar mâna care tocmai a lovit decide ce poți lovi după. Un **rudiment** e o ordine scurtă de mâini care se repetă: cărămida din care se fac fill-urile și groove-urile.',
          en: 'On a snare, the same note can be struck with the right or the left, and the hand that just struck decides what you can play next. A **rudiment** is a short order of hands that repeats: the brick fills and grooves are built from.',
        },
        example: {
          caption: {
            ro: 'Opt lovituri, mâinile alternând: dreapta, stânga, dreapta, stânga. Urmărește rândul de sub buton.',
            en: 'Eight strokes, hands alternating: right, left, right, left. Follow the row under the button.',
          },
          bpm: 76,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-single',
            bars: [{ sticking: 'RLRLRLRL' }],
            tempo: EIGHTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Rudiment', en: 'Rudiment' },
            meaning: {
              ro: 'Un pattern scurt de mâini, care se repetă. Cărămida din care se fac figurile mai lungi.',
              en: 'A short, repeating pattern of hands. The brick longer figures are built from.',
            },
          },
        ],
      },
      {
        id: 'r-si-l',
        heading: { ro: 'R și L, literele de pe partituri', en: 'R and L, the letters on the page' },
        body: {
          ro: 'Mâinile se scriu **R** (dreapta) și **L** (stânga), ca în orice metodă de tobe. În aplicație dreapta e roșie, stânga albastră. Șirul de litere e **sticking-ul**: aceeași măsură, cu alte mâini, e alt exercițiu.',
          en: 'Hands are written **R** (right) and **L** (left), as in every drum method. In the app the right hand is red, the left blue. The string of letters is the **sticking**: the same bar with different hands is a different exercise.',
        },
        example: {
          caption: {
            ro: 'Patru pătrimi, câte o lovitură pe timp: R, L, R, L.',
            en: 'Four quarter notes, one stroke per beat: R, L, R, L.',
          },
          bpm: 60,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-patrimi',
            bars: [{ sticking: 'RLRL' }],
            tempo: { min: 45, max: 140, suggested: 60 },
          }),
        },
        terms: [
          {
            term: { ro: 'Sticking', en: 'Sticking' },
            meaning: {
              ro: 'Ce mână face fiecare lovitură. Se scrie cu R și L, deasupra sau dedesubtul notelor.',
              en: 'Which hand plays each stroke. Written with R and L, above or below the notes.',
            },
          },
        ],
      },
      {
        id: 'de-ce-conteaza-mana',
        heading: { ro: 'Același ritm, alte mâini', en: 'Same rhythm, different hands' },
        body: {
          ro: 'Același ritm, dar fiecare mână lovește de două ori: R R L L. La tempo mic nu contează; la tempo mare, sticking-ul decide dacă poți sau nu. De aceea se scrie: îți spune unde ajung mâinile la capătul măsurii.',
          en: 'The same rhythm, but each hand strikes twice: R R L L. Slowly it makes no difference; at speed, the sticking decides whether you can play it at all. That is why it is written down: it tells you where your hands end up at the end of the bar.',
        },
        example: {
          caption: {
            ro: 'Aceleași opt optimi, dar fiecare mână lovește de două ori: R R L L.',
            en: 'The same eight eighth notes, but each hand strikes twice: R R L L.',
          },
          bpm: 76,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-rrll',
            bars: [{ sticking: 'RRLLRRLL' }],
            tempo: EIGHTHS,
          }),
        },
      },
      {
        id: 'mana-slaba',
        heading: { ro: 'Mâna slabă sună mai încet', en: 'The weak hand sounds quieter' },
        body: {
          ro: 'Una dintre mâini sună mereu mai slab la început. Se repară exersând **pornit cu mâna slabă**. Regula pentru toată etapa: orice rudiment se exersează pe ambele părți.',
          en: 'One hand always sounds weaker at the start. You fix it by practising **led with the weak hand**. The rule for this whole stage: every rudiment gets practised on both sides.',
        },
        example: {
          caption: {
            ro: 'Aceleași optimi alternate, dar pornite cu stânga: L, R, L, R.',
            en: 'The same alternating eighth notes, but led with the left: L, R, L, R.',
          },
          bpm: 76,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-stanga-in-fata',
            bars: [{ sticking: 'LRLRLRLR' }],
            tempo: EIGHTHS,
          }),
        },
      },
      {
        id: 'cum-se-exerseaza',
        heading: { ro: 'Încet, ca să înveți repede', en: 'Slowly, so you learn fast' },
        body: {
          ro: '**Încet, cu metronom.** Ce nu se aude la tempo mic nu dispare la tempo mare, doar nu mai ai timp să-l observi. Un pad e ideal; merge și o pernă. În aplicație bați la **Rudimente**: fără scor, aplicația ține timpul, arată figura și numără.',
          en: '**Slowly, with a metronome.** What you cannot hear slowly does not go away at speed, you just stop noticing it. A pad is ideal; a cushion works too. In the app you play in **Rudiments**: no score, the app keeps time, shows the figure and counts.',
        },
      },
    ],
  },

  {
    id: 'singles-si-doubles',
    stage: 'hands',
    title: { ro: 'Singles și doubles', en: 'Singles and doubles' },
    goal: {
      ro: 'Înveți cele două cărămizi din care e făcut orice rudiment: o lovitură pe mână și două lovituri pe mână.',
      en: 'Learn the two bricks every rudiment is made of: one stroke per hand and two strokes per hand.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'single-stroke-roll',
        heading: { ro: 'Single stroke roll', en: 'Single stroke roll' },
        body: {
          ro: 'Mâinile alternează: **R L R L**. Numele rudimentelor nu se traduc, sunt aceleași în toate metodele. Accentul de pe fiecare timp te ajută să nu pierzi pulsul.',
          en: 'The hands alternate: **R L R L**. Rudiment names are not translated, they are the same in every method. The accent on each beat keeps you from losing the pulse.',
        },
        example: {
          caption: {
            ro: 'Șaisprezecimi alternate, cu accent pe fiecare timp: R L R L, și așa mai departe.',
            en: 'Alternating sixteenth notes with an accent on every beat: R L R L, and on it goes.',
          },
          bpm: 72,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-single-16',
            bars: [{ sticking: 'RLRLRLRLRLRLRLRL', accents: 'x...x...x...x...' }],
            tempo: { min: 45, max: 110, suggested: 72 },
          }),
        },
        terms: [
          {
            term: { ro: 'Single stroke roll', en: 'Single stroke roll' },
            meaning: {
              ro: 'Lovituri alternate, una cu fiecare mână: R L R L.',
              en: 'Alternating strokes, one with each hand: R L R L.',
            },
          },
        ],
      },
      {
        id: 'double-stroke-roll',
        heading: { ro: 'Double stroke roll', en: 'Double stroke roll' },
        body: {
          ro: 'Fiecare mână lovește de două ori: **R R L L**. A doua lovitură **nu se conduce, se lasă să sară**: bățul revine singur, tu doar îl prinzi. Ține bățul între degetul mare și arătător; strâns în pumn, nu mai sare.',
          en: 'Each hand strikes twice: **R R L L**. The second stroke **is not driven, it bounces**: the stick comes back on its own, you just catch it. Hold the stick between thumb and index finger; squeezed in a fist, it will not bounce.',
        },
        example: {
          caption: {
            ro: 'Optimi, fiecare mână de două ori: R R L L. Tempo mic, ca să auzi dacă cele două sunt egale.',
            en: 'Eighth notes, each hand twice: R R L L. Slow, so you can hear whether the two are even.',
          },
          bpm: 72,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-double',
            bars: [{ sticking: 'RRLLRRLL' }],
            tempo: EIGHTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Double stroke roll', en: 'Double stroke roll' },
            meaning: {
              ro: 'Câte două lovituri cu fiecare mână: R R L L. A doua se lasă să sară, nu se conduce.',
              en: 'Two strokes with each hand: R R L L. The second one is left to bounce, not driven.',
            },
          },
        ],
      },
      {
        id: 'a-doua-lovitura',
        heading: { ro: 'Cum știi că e un double adevărat', en: 'How you know it is a real double' },
        body: {
          ro: 'Verifică un singur lucru: **cele patru lovituri sunt egale?** De obicei a doua e mai slabă. Nu lovi mai tare: **ridică bățul mai sus la prima**, energia pentru amândouă vine de acolo.',
          en: 'Check one thing: **are all four strokes equal?** The second is usually weaker. Do not hit harder: **lift the stick higher on the first**, the energy for both comes from there.',
        },
        example: {
          caption: {
            ro: 'Același R R L L, și mai încet: patru lovituri egale, nu două tari și două moi.',
            en: 'The same R R L L, slower still: four equal strokes, not two loud and two soft.',
          },
          bpm: 54,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-double-incet',
            bars: [{ sticking: 'RRLLRRLL' }],
            tempo: { min: 45, max: 140, suggested: 54 },
          }),
        },
      },
      {
        id: 'doubles-pe-saisprezecimi',
        heading: { ro: 'Aceeași figură, de două ori mai des', en: 'The same figure, twice as dense' },
        body: {
          ro: 'Pe șaisprezecimi: patru lovituri pe timp, dar doar **două mișcări**. Aici săritura devine necesară: brațul nu poate conduce egal atâtea lovituri.',
          en: 'In sixteenths: four strokes per beat, but only **two movements**. This is where the bounce becomes necessary: the arm cannot drive that many strokes evenly.',
        },
        example: {
          caption: {
            ro: 'Doubles pe șaisprezecimi, cu accent pe fiecare timp: R R L L, de patru ori.',
            en: 'Doubles in sixteenth notes, accented on every beat: R R L L, four times over.',
          },
          bpm: 60,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-double-16',
            bars: [{ sticking: 'RRLLRRLLRRLLRRLL', accents: 'x...x...x...x...' }],
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'de-ce-astea-doua',
        heading: { ro: 'De ce astea două, înaintea tuturor', en: 'Why these two come first' },
        body: {
          ro: 'Aproape toate rudimentele sunt făcute din singles și doubles: paradiddle-ul, flam tap-ul, rolls-urile. **Un double stroke curat deschide mai mult decât zece rudimente învățate pe jumătate.** Exersează-le zilnic, chiar și după ce treci mai departe.',
          en: 'Nearly every rudiment is made of singles and doubles: the paradiddle, the flam tap, the rolls. **One clean double stroke opens more doors than ten rudiments half learned.** Practise them daily, even after you move on.',
        },
      },
    ],
  },

  {
    id: 'paradiddle-si-familia',
    stage: 'hands',
    title: { ro: 'Diddle-urile și paradiddle', en: 'Diddles and the paradiddle' },
    goal: {
      ro: 'Înveți ce e un diddle și cum se amestecă singles cu doubles în familia paradiddle.',
      en: 'Learn what a diddle is and how singles and doubles mix in the paradiddle family.',
    },
    /*
      Trioletele: double paradiddle și paradiddle-diddle se scriu pe douăsprezece
      pași, adică trei pe timp. Fără lecția de la Ritm, lecția asta ar începe să
      explice ce e un triolet, exact ce nu are voie să facă.
    */
    requiresRhythmLesson: 'triolet',
    sections: [
      {
        id: 'ce-e-un-diddle',
        heading: { ro: 'Ce e un diddle', en: 'What a diddle is' },
        body: {
          ro: 'Un **diddle** e o pereche de lovituri cu aceeași mână, într-o figură în care restul alternează. Numele se citesc ca ritmul lor: spune figura cu voce tare înainte s-o cânți.',
          en: 'A **diddle** is a pair of strokes with the same hand, inside a figure where the rest alternate. The names read like their rhythm: say the figure out loud before you play it.',
        },
        terms: [
          {
            term: { ro: 'Diddle', en: 'Diddle' },
            meaning: {
              ro: 'Două lovituri cu aceeași mână, înăuntrul unei figuri în care restul alternează.',
              en: 'Two strokes with the same hand, inside a figure where the rest alternate.',
            },
          },
        ],
      },
      {
        id: 'paradiddle',
        heading: { ro: 'Paradiddle', en: 'Paradiddle' },
        body: {
          ro: '**R L R R, L R L L**: trei lovituri alternate și un diddle. Accentul cade pe prima lovitură din grup. Spune-l odată cu el: *pa-ra-did-dle*.',
          en: '**R L R R, L R L L**: three alternating strokes and a diddle. The accent falls on the first stroke of each group. Say it along: *pa-ra-did-dle*.',
        },
        example: {
          caption: {
            ro: 'Paradiddle pe optimi, accent pe prima lovitură a fiecărui grup: R L R R, L R L L.',
            en: 'Paradiddle in eighth notes, accent on the first stroke of each group: R L R R, L R L L.',
          },
          bpm: 72,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-paradiddle',
            bars: [{ sticking: 'RLRRLRLL', accents: 'x...x...' }],
            tempo: EIGHTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Paradiddle', en: 'Paradiddle' },
            meaning: {
              ro: 'R L R R, apoi L R L L: trei lovituri alternate și o pereche cu aceeași mână.',
              en: 'R L R R, then L R L L: three alternating strokes and a pair with the same hand.',
            },
          },
        ],
      },
      {
        id: 'de-ce-e-util',
        heading: { ro: 'La ce bun diddle-ul de la final', en: 'What the diddle at the end is for' },
        body: {
          ro: 'Diddle-ul de la final **schimbă mâna care conduce**, așa că accentul cade pe rând pe dreapta și pe stânga. Pe set, mâna care conduce poate merge pe tom sau pe cinel: un fill gata făcut.',
          en: 'The diddle at the end **switches the leading hand**, so the accent falls on the right and the left in turn. On the kit, the leading hand can move to a tom or a cymbal: a ready-made fill.',
        },
      },
      {
        id: 'pe-saisprezecimi',
        heading: { ro: 'Paradiddle pe șaisprezecimi', en: 'Paradiddle in sixteenth notes' },
        body: {
          ro: 'Așa îl găsești scris de obicei: un paradiddle pe fiecare timp. Atenție la diddle: cade unde ai cel mai puțin timp, deci acolo apare graba.',
          en: 'This is how you usually see it written: one paradiddle per beat. Watch the diddle: it lands where you have the least time, so that is where rushing shows up.',
        },
        example: {
          caption: {
            ro: 'Un paradiddle pe fiecare timp, patru într-o măsură, accentul pe timp.',
            en: 'One paradiddle per beat, four to a bar, accented on the beat.',
          },
          bpm: 64,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-paradiddle-16',
            bars: [{ sticking: 'RLRRLRLLRLRRLRLL', accents: 'x...x...x...x...' }],
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'double-paradiddle',
        heading: { ro: 'Double paradiddle', en: 'Double paradiddle' },
        body: {
          ro: '**R L R L R R**, apoi L R L R L L: șase lovituri, deci pe triolete. Îl folosești mai ales în muzica ternară: shuffle, blues, vals.',
          en: '**R L R L R R**, then L R L R L L: six strokes, so it sits on triplets. You use it mostly in triplet-based music: shuffle, blues, waltz.',
        },
        example: {
          caption: {
            ro: 'Double paradiddle pe triolete: R L R L R R, apoi L R L R L L.',
            en: 'Double paradiddle in triplets: R L R L R R, then L R L R L L.',
          },
          bpm: 60,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-double-paradiddle',
            bars: [{ sticking: 'RLRLRRLRLRLL', accents: 'x.....x.....' }],
            tempo: TRIPLETS,
          }),
        },
      },
      {
        id: 'paradiddle-diddle',
        heading: { ro: 'Paradiddle-diddle', en: 'Paradiddle-diddle' },
        body: {
          ro: '**R L R R L L**: două perechi la final, deci **mâna care conduce nu se schimbă**. De aceea e preferat pentru fill-uri rapide pe tomuri. Exersează-l și pornit cu stânga.',
          en: '**R L R R L L**: two pairs at the end, so **the leading hand never changes**. That is why it is a favourite for fast fills around the toms. Practise it led with the left too.',
        },
        example: {
          caption: {
            ro: 'Paradiddle-diddle: R L R R L L, repetat, cu dreapta conducând de fiecare dată.',
            en: 'Paradiddle-diddle: R L R R L L, repeated, with the right leading every time.',
          },
          bpm: 58,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-paradiddle-diddle',
            bars: [{ sticking: 'RLRRLLRLRRLL', accents: 'x.....x.....' }],
            tempo: { min: 45, max: 104, suggested: 58 },
          }),
        },
      },
    ],
  },

  {
    id: 'flam-si-drag',
    stage: 'hands',
    title: { ro: 'Flam și drag', en: 'Flam and drag' },
    goal: {
      ro: 'Înveți ornamentele: notele mici dinaintea loviturii, care o fac mai lată, nu mai devreme.',
      en: 'Learn the ornaments: the small notes before a stroke that make it wider, not earlier.',
    },
    sections: [
      {
        id: 'ce-e-un-flam',
        heading: { ro: 'O lovitură mai lată', en: 'A wider stroke' },
        body: {
          ro: 'Un **flam** e o lovitură precedată de o **notă de grație** foarte slabă, cu cealaltă mână. Cad atât de aproape încât auzi **o singură lovitură, mai lată**. În aplicație, grația e litera mică de deasupra celulei.',
          en: 'A **flam** is a stroke preceded by a very soft **grace note** with the other hand. They land so close together that you hear **one wider stroke**. In the app, the grace is the small letter above the cell.',
        },
        example: {
          caption: {
            ro: 'Patru flam-uri pe pătrimi, mâinile alternând. Litera mică de deasupra e grația.',
            en: 'Four flams on quarter notes, hands alternating. The small letter above is the grace note.',
          },
          bpm: 70,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-flam',
            bars: [{ sticking: 'RLRL', grace: 'ffff' }],
            tempo: GRACE,
          }),
        },
        terms: [
          {
            term: { ro: 'Flam', en: 'Flam' },
            meaning: {
              ro: 'O notă de grație imediat înaintea loviturii, cu cealaltă mână. Se aude ca o lovitură lată.',
              en: 'One grace note immediately before the stroke, with the other hand. It sounds like one wide stroke.',
            },
          },
          {
            term: { ro: 'Notă de grație', en: 'Grace note' },
            meaning: {
              ro: 'Lovitura foarte slabă dinaintea celei principale. Nu are durată proprie: nu ocupă loc în măsură.',
              en: 'The very soft stroke before the main one. It has no duration of its own: it takes up no room in the bar.',
            },
          },
        ],
      },
      {
        id: 'nu-e-o-subdiviziune',
        heading: { ro: 'Un gest, nu o subdiviziune', en: 'A gesture, not a subdivision' },
        body: {
          ro: 'Flam-ul nu înseamnă două note ritmice. Distanța dintre grație și lovitură e un gest de vreo 30 ms și **rămâne aceeași la orice tempo**. Ascultă: mai încet, dar flam-ul e la fel de lat.',
          en: 'A flam is not two rhythmic notes. The gap between grace and stroke is a gesture of about 30 ms and **stays the same at any tempo**. Listen: slower, but the flam is just as wide.',
        },
        example: {
          caption: {
            ro: 'Aceleași flam-uri, mult mai încet. Lățimea lor nu s-a schimbat deloc.',
            en: 'The same flams, much slower. Their width has not changed at all.',
          },
          bpm: 50,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-flam-incet',
            bars: [{ sticking: 'RLRL', grace: 'ffff' }],
            tempo: { min: 45, max: 120, suggested: 50 },
          }),
        },
      },
      {
        id: 'inaltimile-la-flam',
        heading: { ro: 'Cum iese un flam curat', en: 'How a flam comes out clean' },
        body: {
          ro: 'Secretul: **două bețe la înălțimi diferite**, grația de jos, lovitura de sus, pornite deodată. Sună ca două lovituri egale? Bețele erau la aceeași înălțime. Exersează-l și pornit cu stânga.',
          en: 'The secret: **two sticks at different heights**, the grace from low, the stroke from high, set off together. Sounds like two equal strokes? The sticks started at the same height. Practise it led with the left too.',
        },
        example: {
          caption: {
            ro: 'Flam-uri pornite cu stânga: lovitura principală e L, grația e R.',
            en: 'Flams led with the left: the main stroke is L, the grace is R.',
          },
          bpm: 66,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-flam-stanga',
            bars: [{ sticking: 'LRLR', grace: 'ffff' }],
            tempo: GRACE,
          }),
        },
      },
      {
        id: 'flam-tap',
        heading: { ro: 'Flam tap', en: 'Flam tap' },
        body: {
          ro: 'Un flam, apoi o lovitură mică cu **aceeași mână**, apoi la fel pe cealaltă parte: un flam peste un double. Diferența de volum din fiecare pereche face figura.',
          en: 'A flam, then a small stroke with **the same hand**, then the same on the other side: a flam on top of a double. The volume difference inside each pair is what makes the figure.',
        },
        example: {
          caption: {
            ro: 'Flam tap: flam accentuat, apoi o lovitură mică cu aceeași mână, și la fel pe stânga.',
            en: 'Flam tap: accented flam, then a small stroke with the same hand, and the same on the left.',
          },
          bpm: 60,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-flam-tap',
            bars: [{ sticking: 'RRLLRRLL', accents: 'x.x.x.x.', grace: 'f.f.f.f.' }],
            tempo: { min: 45, max: 104, suggested: 60 },
          }),
        },
      },
      {
        id: 'drag',
        heading: { ro: 'Drag', en: 'Drag' },
        body: {
          ro: 'Ca flam-ul, dar cu **două** note de grație, din săritura bățului. Flam-ul e o lovitură lată; drag-ul e o lovitură cu coadă. Se învață după double stroke roll.',
          en: 'Like the flam, but with **two** grace notes, taken off the bounce. A flam is a wide stroke; a drag is a stroke with a tail. Learn it after the double stroke roll.',
        },
        example: {
          caption: {
            ro: 'Drag pe pătrimi: două grații înaintea fiecărei lovituri. Deasupra celulei sunt două litere.',
            en: 'Drag on quarter notes: two graces before each stroke. Two letters sit above the cell.',
          },
          bpm: 58,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-drag',
            bars: [{ sticking: 'RLRL', grace: 'dddd' }],
            tempo: { min: 45, max: 100, suggested: 58 },
          }),
        },
        terms: [
          {
            term: { ro: 'Drag', en: 'Drag' },
            meaning: {
              ro: 'Două note de grație înaintea loviturii principale, din săritura bățului.',
              en: 'Two grace notes before the main stroke, taken off the bounce of the stick.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'inaltimile-batului',
    stage: 'hands',
    title: { ro: 'Accent, tap, ghost note', en: 'Accent, tap, ghost note' },
    goal: {
      ro: 'Înveți cele trei înălțimi ale bățului și de ce volumul vine din înălțime, nu din forță.',
      en: 'Learn the three stick heights and why volume comes from height, not from force.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'volumul-vine-din-inaltime',
        heading: { ro: 'Volumul vine din înălțime', en: 'Volume comes from height' },
        body: {
          ro: 'Volumul vine din înălțimea de la care pornește bățul, nu din forță: **nu lovi mai tare, ridică mai sus.** Trei înălțimi: sus pentru **accent**, jos pentru lovitura normală (**tap**), aproape lipit de tobă pentru **ghost note**.',
          en: 'Volume comes from how high the stick starts, not from force: **do not hit harder, lift higher.** Three heights: high for an **accent**, low for the ordinary stroke (**tap**), almost touching the head for a **ghost note**.',
        },
      },
      {
        id: 'accentul',
        heading: { ro: 'Accentul', en: 'The accent' },
        body: {
          ro: 'Accentul face dintr-un șir de lovituri o măsură. Greul nu e să-l faci, ci **să cobori imediat după**: un băț rămas sus face și următoarea lovitură accent.',
          en: 'An accent turns a run of strokes into a bar. The hard part is not playing it but **getting back down straight after**: a stick left high makes the next stroke an accent too.',
        },
        example: {
          caption: {
            ro: 'Optimi alternate, accent pe timpii unu și trei. Același ritm, dar cu formă.',
            en: 'Alternating eighth notes, accents on beats one and three. The same rhythm, but with shape.',
          },
          bpm: 76,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-accent',
            bars: [{ sticking: 'RLRLRLRL', accents: 'x...x...' }],
            tempo: EIGHTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Accent', en: 'Accent' },
            meaning: {
              ro: 'Lovitura scoasă în față, bățul pornit de sus. Se scrie cu un unghi deasupra notei.',
              en: 'The stroke pushed forward, stick started from high up. Written as a wedge above the note.',
            },
          },
          {
            term: { ro: 'Tap', en: 'Tap' },
            meaning: {
              ro: 'Lovitura obișnuită, pornită de jos. Nu se marchează: e nivelul de bază față de care se măsoară restul.',
              en: 'The ordinary stroke, started low. It gets no mark: it is the baseline the rest is measured against.',
            },
          },
        ],
      },
      {
        id: 'ghost-note',
        heading: { ro: 'Ghost note', en: 'Ghost note' },
        body: {
          ro: 'Ghost note-ul nu e o lovitură mai încet, e o umbră: dacă se aude ca notă, e prea tare; dacă nu se simte deloc, e prea încet. În aplicație se scrie în paranteze.',
          en: 'A ghost note is not a quieter stroke, it is a shadow: if it sounds like a note it is too loud; if you cannot feel it at all, too soft. In the app it is written in brackets.',
        },
        example: {
          caption: {
            ro: 'Optimi alternate: timpii se aud, contratimpii sunt ghost notes, abia simțite.',
            en: 'Alternating eighth notes: the beats sound, the off-beats are ghost notes, barely felt.',
          },
          bpm: 72,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-ghost',
            bars: [{ sticking: 'RLRLRLRL', ghosts: '.o.o.o.o' }],
            tempo: EIGHTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Ghost note', en: 'Ghost note' },
            meaning: {
              ro: 'Lovitură foarte slabă, care se simte ca pulsație, nu se aude ca notă. Se scrie în paranteze.',
              en: 'A very soft stroke, felt as pulsation rather than heard as a note. Written in brackets.',
            },
          },
        ],
      },
      {
        id: 'cele-trei-impreuna',
        heading: { ro: 'Cele trei, în aceeași măsură', en: 'All three in one bar' },
        body: {
          ro: 'Accent pe timp, două ghost notes, o lovitură normală. Trebuie să auzi **trei niveluri distincte**. Dacă ghost-urile sună ca tap-urile, bățul nu coboară destul după accent.',
          en: 'Accent on the beat, two ghost notes, one ordinary stroke. You should hear **three distinct levels**. If the ghosts sound like the taps, the stick is not coming down far enough after the accent.',
        },
        example: {
          caption: {
            ro: 'Accent pe timp, două ghost notes după el, o lovitură normală înainte de următorul.',
            en: 'Accent on the beat, two ghost notes after it, one ordinary stroke before the next.',
          },
          bpm: 66,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-trei-inaltimi',
            bars: [
              {
                sticking: 'RLRLRLRLRLRLRLRL',
                accents: 'x...x...x...x...',
                ghosts: '.oo..oo..oo..oo.',
              },
            ],
            tempo: { min: 45, max: 110, suggested: 66 },
          }),
        },
      },
      {
        id: 'accentul-pe-mana-slaba',
        heading: { ro: 'Accentul pe mâna slabă', en: 'The accent on your weak hand' },
        body: {
          ro: 'Aceeași figură pornită cu stânga: acum mâna slabă face accentele. Exersează partea asta până când **cele două părți sună la fel**.',
          en: 'The same figure led with the left: now the weak hand plays the accents. Practise this side until **both sides sound the same**.',
        },
        example: {
          caption: {
            ro: 'Aceeași figură pornită cu stânga: accentul cade pe mâna slabă.',
            en: 'The same figure led with the left: the accent lands on the weak hand.',
          },
          bpm: 66,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-accent-stanga',
            bars: [
              {
                sticking: 'LRLRLRLRLRLRLRLR',
                accents: 'x...x...x...x...',
                ghosts: '.oo..oo..oo..oo.',
              },
            ],
            tempo: { min: 45, max: 110, suggested: 66 },
          }),
        },
      },
    ],
  },

  {
    id: 'rolls',
    stage: 'hands',
    title: { ro: 'Rolls și open-close-open', en: 'Rolls and open-close-open' },
    goal: {
      ro: 'Înveți cum se ajunge la lovituri foarte dese și ce sunt rolls-urile de cinci, șapte și nouă lovituri.',
      en: 'Learn how you get to very dense strokes, and what the five, seven and nine stroke rolls are.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'open-close-open',
        heading: { ro: 'Open-close-open', en: 'Open-close-open' },
        body: {
          ro: 'Metoda standard pentru orice rudiment: **pornești încet, accelerezi treptat cât poți controla, apoi încetinești la fel, fără oprire.** Pe drum, tehnica trece singură de la braț la încheietură și săritură. Dacă la coborâre sună mai rău decât la urcare, ai urcat prea mult.',
          en: 'The standard way to practise any rudiment: **start slowly, speed up gradually as far as you can control, then slow back down, without stopping.** On the way, the technique shifts on its own from arm to wrist and bounce. If the way down sounds worse than the way up, you went too far.',
        },
        example: {
          caption: {
            ro: 'Capătul „open": doubles pe optimi, foarte încet. De aici se urcă.',
            en: 'The "open" end: doubles in eighth notes, very slowly. This is where you climb from.',
          },
          bpm: 60,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-open',
            bars: [{ sticking: 'RRLLRRLL' }],
            tempo: { min: 45, max: 140, suggested: 60 },
          }),
        },
        terms: [
          {
            term: { ro: 'Open-close-open', en: 'Open-close-open' },
            meaning: {
              ro: 'Exersarea unui rudiment de la foarte încet la cât de repede poți și înapoi, fără oprire.',
              en: 'Practising a rudiment from very slow to as fast as you can and back, without stopping.',
            },
          },
        ],
      },
      {
        id: 'ce-e-un-roll',
        heading: { ro: 'Ce e un roll', en: 'What a roll is' },
        body: {
          ro: 'O tobă nu poate ține sunetul, așa că un sunet lung se face din **lovituri atât de dese încât nu le mai numeri**. Ăsta e un roll. Doubles pe șaisprezecimi sunt baza lui.',
          en: 'A drum cannot sustain, so a long sound is made of **strokes so dense you stop counting them**. That is a roll. Doubles in sixteenths are its foundation.',
        },
        example: {
          caption: {
            ro: 'Doubles pe șaisprezecimi, aproape de tempoul real: de aici începe să sune continuu.',
            en: 'Doubles in sixteenth notes, close to a real tempo: this is where it starts to sound continuous.',
          },
          bpm: 100,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-roll-dens',
            bars: [{ sticking: 'RRLLRRLLRRLLRRLL' }],
            tempo: { min: 45, max: 110, suggested: 100 },
          }),
        },
        terms: [
          {
            term: { ro: 'Roll', en: 'Roll' },
            meaning: {
              ro: 'Lovituri atât de dese încât se aud continuu. La tobe, singurul fel de a susține un sunet.',
              en: 'Strokes dense enough to sound continuous. On drums, the only way to sustain a sound.',
            },
          },
        ],
      },
      {
        id: 'five-stroke-roll',
        heading: { ro: 'Five stroke roll', en: 'Five stroke roll' },
        body: {
          ro: 'Rolls-urile cu număr se numără pe lovituri: **R R L L R**, două perechi și un accent la final. E un accent cu pornire, nu un roll scurt.',
          en: 'Numbered rolls are counted in strokes: **R R L L R**, two pairs and an accent at the end. It is an accent with a run-up, not a short roll.',
        },
        example: {
          caption: {
            ro: 'Five stroke roll: R R L L și accentul pe R, apoi aceeași figură pornită cu stânga.',
            en: 'Five stroke roll: R R L L and the accent on R, then the same figure led with the left.',
          },
          bpm: 66,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-five-stroke',
            bars: [{ sticking: 'RRLLR...LLRRL...', accents: '....x.......x...' }],
            tempo: { min: 45, max: 110, suggested: 66 },
          }),
        },
      },
      {
        id: 'seven-stroke-roll',
        heading: { ro: 'Seven stroke roll', en: 'Seven stroke roll' },
        body: {
          ro: '**R R L L R R L**: trei perechi și accentul. Regula pentru toate: perechi, apoi o lovitură. Numărul din nume îți spune câte.',
          en: '**R R L L R R L**: three pairs and the accent. The rule for all of them: pairs, then one stroke. The number in the name tells you how many.',
        },
        example: {
          caption: {
            ro: 'Seven stroke roll: trei perechi și accentul, apoi la fel pornit cu stânga.',
            en: 'Seven stroke roll: three pairs and the accent, then the same led with the left.',
          },
          bpm: 66,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-seven-stroke',
            bars: [{ sticking: 'RRLLRRL.LLRRLLR.', accents: '......x.......x.' }],
            tempo: { min: 45, max: 110, suggested: 66 },
          }),
        },
      },
      {
        id: 'nine-stroke-roll',
        heading: { ro: 'Nine stroke roll', en: 'Nine stroke roll' },
        body: {
          ro: '**R R L L R R L L R**: patru perechi pe doi timpi, accentul pe al treilea. Numără perechile, nu loviturile: unu, doi, trei, patru, accent.',
          en: '**R R L L R R L L R**: four pairs over two beats, the accent on the third. Count the pairs, not the strokes: one, two, three, four, accent.',
        },
        example: {
          caption: {
            ro: 'Nine stroke roll, o măsură pornită cu dreapta și una cu stânga: patru perechi și accentul.',
            en: 'Nine stroke roll, one bar led with the right and one with the left: four pairs and the accent.',
          },
          bpm: 66,
          showSticking: true,
          showGrid: false,
          exercise: snareDemo({
            id: 'demo-maini-nine-stroke',
            bars: [
              { sticking: 'RRLLRRLLR.......', accents: '........x.......' },
              { sticking: 'LLRRLLRRL.......', accents: '........x.......' },
            ],
            tempo: { min: 45, max: 110, suggested: 66 },
          }),
        },
      },
      {
        id: 'buzz-roll',
        heading: { ro: 'Buzz roll', en: 'Buzz roll' },
        body: {
          ro: 'Bățul e presat ușor în tobă și lăsat să sară de mai multe ori; cele două mâini se suprapun și sună continuu. Nu are un număr de lovituri. **Aplicația nu-l poate cânta**: n-are mostră pentru el.',
          en: 'The stick is pressed lightly into the head and left to bounce several times; the two hands overlap and it sounds continuous. It has no stroke count. **The app cannot play it**: it has no sample for it.',
        },
        terms: [
          {
            term: { ro: 'Buzz roll', en: 'Buzz roll' },
            meaning: {
              ro: 'Bățul presat în fața tobei și lăsat să sară de mai multe ori. Numit și multiple bounce roll.',
              en: 'The stick pressed into the head and left to bounce several times. Also called a multiple bounce roll.',
            },
          },
        ],
      },
    ],
  },
]
