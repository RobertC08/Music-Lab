import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 1, Notația de tobe.

  Cinci lecții din șase: portativul cu toate capetele de notă, valorile,
  intensitățile și felurile de lovitură, trioletele, apoi dubla și crash-ul.
  Mai lipsește doar ce organizează pagina, bare de repetiție, reprize, semne de
  salt, iar aceea n-are nevoie de urechi.

  ABATERI DE LA PLAN, luate pe rând, după ce fiecare lecție a fost citită pe
  telefon. Se scriu aici ca să nu pară scăpări:

  1. **Cinelele au intrat în prima lecție**, nu într-una separată („Capete de ×
     pentru cinele", PLAN-TEORIE-TOBE.md §6). Fără ×, lecția despre portativ nu
     putea arăta NICIUN groove adevărat, nu există muzică de tobe fără fus, și
     ieșeau exemple care nu semănau cu nimic. Capetele de notă sunt oricum o
     singură noțiune: rotund pentru tobe, × pentru cinele.

  2. **S-a adăugat o lecție despre valori.** Nu repetă Ritmul: acolo se învață
     CÂT ține fiecare valoare, aici doar cum arată pe un portativ de tobe și de
     ce durata scrisă înseamnă altceva la un instrument care nu poate ține
     sunetul.

  3. **S-a adăugat o lecție despre triolete**: tot ca notație, nu ca timp
     (Ritmul o are pe a 11-a). Fără ea nu se putea scrie shuffle-ul, adică
     jumătate din muzica pe care o va cânta elevul.

  4. **Fusul cu piciorul a fost amânat.** (Între timp a primit mostră, din DRSKit,
     și se aude la ride-ul de jazz.) La scrierea lecției kitul n-avea mostră, deci o
     lecție întreagă ar fi fost numai de citit. Se pomenește unde chiar
     contează, la ride-ul de jazz, cu spusul pe față că aici nu se aude.

  CE NU SE POATE CÂNTA, și se predă citit: rimshot-ul. N-are mostră, iar lecția
  o spune deschis. Semnele se învață dintr-o legendă (`visual: 'heads'`).
  Cross-stick-ul are mostră, din DRSKit (bățul pe ramă), deci are și exemplu.

  CE ȘTIE PORTATIVUL, de când există lecția de intensități: accentul (un „>"
  deasupra codiței) și ghost note-ul (capul în paranteze). Accentul ține de toată
  coloana, fiindcă se desenează o dată, deci exemplele nu accentuează o piesă
  dintr-o coloană lăsându-le pe celelalte normale, iar un test o păzește
  (`staff.test.ts`).
*/
/** Lecțiile despre timbru și poziții merg încet: la 140 asculți ritmul, nu piesa. */
const SLOW = { min: 50, max: 120, suggested: 72 }
/** Groove-urile pot urca; capătul e cel pe care exemplul chiar îl suportă. */
const GROOVE = { min: 50, max: 140, suggested: 84 }
/**
 * Șaisprezecimi: patru pași pe timp.
 *
 * Capătul nu e ales din gust. La `max`, două lovituri vecine ale aceleiași mâini
 * cad la `60000 / max / 4` ms una de alta, iar validarea respinge sub 90 ms
 * (`MIN_HAND_GAP_MS`), adică orice peste 166 BPM. 120 lasă 125 ms, plus o
 * margine pentru cine urcă tempoul.
 */
const SIXTEENTHS = { min: 50, max: 120, suggested: 76 }
/**
 * Triolete: trei pași pe timp.
 *
 * La `max`, două lovituri vecine cad la `60000 / max / 3` ms, 166 ms la 120,
 * larg peste cele 90 ms cerute de validare. Capătul e ținut aici nu de braț, ci
 * de ce se aude: peste 120, un shuffle nu mai leagănă, ci aleargă.
 */
const TRIPLETS = { min: 50, max: 120, suggested: 80 }

export const notationLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'portativul-si-pozitiile',
    stage: 'notation',
    title: { ro: 'Portativul și pozițiile', en: 'The staff and the positions' },
    goal: {
      ro: 'Citești pe portativ ce piesă se lovește: cele cinci linii, capetele rotunde ale tobelor și ×-urile cinelelor.',
      en: 'Read which piece is struck from the staff: the five lines, the round noteheads of the drums and the × of the cymbals.',
    },
    /*
      Portativul PRESUPUNE măsura; nu o predă. Fără trimiterea asta, lecția ar
      începe să explice ce e un timp, iar modulul de ritm ar ajunge rescris a
      treia oară (PLAN-TEORIE-TOBE.md §1).
    */
    requiresRhythmLesson: 'masura',
    sections: [
      {
        id: 'de-ce-scris',
        heading: { ro: 'De ce se scriu tobele', en: 'Why drums get written down' },
        body: {
          ro: 'Grila din aplicație e a noastră; portativul e ce găsești în orice carte sau chart de tobe. Amândouă spun același lucru. Notația de tobe nu e complet standardizată, dar trei reguli sunt aceleași peste tot, și cu ele citești orice.',
          en: 'The grid in the app is ours; the staff is what you find in any drum book or chart. Both say the same thing. Drum notation is not fully standardised, but three rules are the same everywhere, and with them you can read anything.',
        },
        terms: [
          {
            term: { ro: 'Portativ', en: 'Staff' },
            meaning: {
              ro: 'Cele cinci linii pe care se scrie muzica. La tobe, fiecare linie și fiecare spațiu înseamnă o piesă a setului.',
              en: 'The five lines music is written on. On drums, each line and each space stands for a piece of the kit.',
            },
          },
        ],
      },
      {
        id: 'cinci-linii',
        heading: { ro: 'Cinci linii și o cheie ciudată', en: 'Five lines and an odd clef' },
        visual: 'staff',
        body: {
          ro: 'Cinci linii; fiecare linie sau spațiu e o piesă a setului. La început stau **două bare verticale**, cheia neutră: tobele n-au înălțimi, deci poziția spune ce piesă lovești, nu ce notă. Regulile: **tobele au cap rotund, cinelele ×**, iar ce sună mai jos stă mai jos.',
          en: 'Five lines; each line or space is a piece of the kit. At the start stand **two vertical bars**, the neutral clef: drums have no pitch, so a position tells you which piece to strike, not which note. The rules: **drums get a round head, cymbals an ×**, and what sounds lower sits lower.',
        },
        terms: [
          {
            term: { ro: 'Cheie neutră', en: 'Neutral clef' },
            meaning: {
              ro: 'Cele două bare verticale de la începutul portativului. Spun că ce urmează e percuție fără înălțimi.',
              en: 'The two vertical bars at the start of the staff. They say that what follows is unpitched percussion.',
            },
          },
        ],
      },
      {
        id: 'sus-jos',
        heading: { ro: 'Ce sună mai jos stă mai jos', en: 'The lower it sounds, the lower it sits' },
        body: {
          ro: '**Ordinea de pe portativ e ordinea sunetului**: cinelele sus, tomurile coborând, toba mare în spațiul de jos. Grila din aplicație folosește aceeași ordine. Ascultă cum coboară notele odată cu sunetul.',
          en: '**The order on the staff is the order of the sound**: cymbals at the top, toms stepping down, bass drum in the bottom space. The grid in the app uses the same order. Listen to the notes go down with the sound.',
        },
        example: {
          caption: {
            ro: 'Tomul 1, tomul 2, cazanul, toba mare: notele coboară odată cu sunetul.',
            en: 'High tom, mid tom, floor tom, bass drum, the notes descend along with the sound.',
          },
          bpm: 66,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-staff-coboara',
            /*
              Pătrimi: un pas pe timp, deci fiecare lovitură e limpede a cui e.
              Pe optimi, patru piese diferite una după alta s-ar auzi ca un fill
              și s-ar citi ca o pată, iar aici nu se învață niciun ritm.
            */
            stepsPerBar: 4,
            rows: { tom: 'x...', mid: '.x..', floor: '..x.', kick: '...x' },
            tempo: SLOW,
          }),
        },
      },
      {
        id: 'toba-mica-la-mijloc',
        heading: { ro: 'Toba mică, la mijloc', en: 'The snare, in the middle' },
        body: {
          ro: 'Excepția: **toba mică stă sub tomuri**, în spațiul din mijloc, deși sună mai ascuțit. E o convenție, aceeași în toate cărțile. Cu toba mare jos și toba mică la mijloc ai cele două poziții din care e făcută majoritatea muzicii.',
          en: 'The exception: **the snare sits below the toms**, in the middle space, even though it sounds brighter. It is a convention, the same in every book. With the bass drum at the bottom and the snare in the middle, you have the two positions most music is built on.',
        },
        example: {
          caption: {
            ro: 'Toba mare pe 1 și 3, toba mică pe 2 și 4, jos și la mijloc.',
            en: 'Bass drum on 1 and 3, snare on 2 and 4, bottom and middle.',
          },
          bpm: 72,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-staff-mare-mica',
            /*
              4 pași, 4 timpi -> un pas pe timp.
              pas:  0  1  2  3
              timp: 1  2  3  4
              kick  x  .  x  .   = timpii 1 și 3
              snare .  x  .  x   = timpii 2 și 4   ✓ backbeat, ca în textul de sus
            */
            stepsPerBar: 4,
            rows: { snare: '.x.x', kick: 'x.x.' },
            tempo: SLOW,
          }),
        },
      },
      {
        id: 'cinelele-cu-x',
        heading: { ro: 'Cinelele, scrise cu ×', en: 'The cymbals, written with ×' },
        body: {
          ro: 'Cinelele se scriu cu **×**, ca să le deosebești dintr-o privire de tobe. Sus de tot: **ride-ul** pe linia de sus, **fusul** deasupra ei, **crash-ul** pe o linie suplimentară. Fusul **deschis** are un cerculeț deasupra ×-ului.',
          en: 'Cymbals are written with an **×**, so you can tell them from drums at a glance. At the top: the **ride** on the top line, the **hi-hat** above it, the **crash** on a ledger line. An **open** hi-hat has a small circle above the ×.',
        },
        example: {
          caption: {
            ro: 'Groove de rock: fusul pe optimi, toba mică pe 2 și 4, toba mare pe 1 și 3.',
            en: 'A rock groove: hi-hat in eighths, snare on 2 and 4, bass drum on 1 and 3.',
          },
          bpm: 84,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-staff-rock',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              pas:   0  1  2  3  4  5  6  7
              timp:  1  &  2  &  3  &  4  &
              hat   'xxxxxxxx' = toate optimile
              snare '..x...x.' = pașii 2 și 6 = timpii 2 și 4   ✓ backbeat
              kick  'x...x...' = pașii 0 și 4 = timpii 1 și 3
            */
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Linie suplimentară', en: 'Ledger line' },
            meaning: {
              ro: 'Linia scurtă desenată deasupra portativului, pentru o notă care nu mai încape pe el. Crash-ul stă pe una.',
              en: 'The short line drawn above the staff for a note that no longer fits on it. The crash sits on one.',
            },
          },
          {
            term: { ro: 'Fus deschis (open hat)', en: 'Open hi-hat' },
            meaning: {
              ro: 'Fusul lăsat depărtat, cu piciorul ridicat. Se scrie cu un cerculeț deasupra ×-ului.',
              en: 'The hi-hat left apart, foot lifted. Written with a small circle above the ×.',
            },
          },
        ],
      },
      {
        id: 'codite-si-bare',
        heading: { ro: 'Codițe, bare și pauze', en: 'Stems, beams and rests' },
        body: {
          ro: '**Codița** e linia de lângă cap; piesele lovite deodată stau pe aceeași codiță. **Bara de grupare** leagă notele scurte dintr-un timp, ca să vezi unde cade pulsul; o notă scurtă singură are **steag**. **Pauza** arată unde nu se lovește nimic.',
          en: 'The **stem** is the line beside the head; pieces struck together share one stem. The **beam** joins the short notes inside a beat, so you can see where the pulse falls; a short note on its own gets a **flag**. A **rest** shows where nothing is struck.',
        },
        example: {
          caption: {
            ro: 'Fus numai pe contratimpi: o bară pe 1, o pauză pe 3 urmată de un steag, iar pe 4 toba mică și toba mare pe aceeași codiță.',
            en: 'Hi-hat on the offbeats only: a beam on 1, a rest on 3 followed by a flag, and on 4 the snare and bass drum sharing one stem.',
          },
          bpm: 80,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-staff-semne',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              pas:   0  1  2  3  4  5  6  7
              timp:  1  &  2  &  3  &  4  &
              hat   '.x.x.x.x' = numai contratimpii
              snare '..x...x.' = pașii 2 și 6 = timpii 2 și 4   ✓ backbeat
              kick  'x.....x.' = pașii 0 și 6 = timpii 1 și 4

              Ce iese, timp cu timp, și de asta e aleasă măsura asta:
                timpul 1 (pașii 0,1): toba mare, apoi fus         -> BARĂ
                timpul 2 (pașii 2,3): toba mică, apoi fus         -> încă o bară
                timpul 3 (pașii 4,5): gol, apoi fus               -> PAUZĂ + STEAG
                timpul 4 (pașii 6,7): mică+mare deodată, apoi fus -> CODIȚĂ COMUNĂ
            */
            stepsPerBar: 8,
            rows: { hhClosed: '.x.x.x.x', snare: '..x...x.', kick: 'x.....x.' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Bară de grupare', en: 'Beam' },
            meaning: {
              ro: 'Linia groasă care leagă notele scurte dintr-un timp, ca pulsul să se vadă.',
              en: 'The thick line joining short notes inside one beat, so the pulse stays visible.',
            },
          },
        ],
      },
      {
        id: 'punte',
        heading: { ro: 'Aceeași măsură, de două ori', en: 'The same bar, twice' },
        body: {
          ro: 'Aceeași măsură pe portativ și în grilă: se aprind în același loc. Ce e aliniat vertical în grilă stă pe aceeași codiță pe portativ, iar pătratul gol e pauză. Fusul deschis are rândul lui în grilă; pe portativ e același × cu cerculeț.',
          en: 'The same bar on the staff and in the grid: they light up in the same place. What lines up vertically in the grid shares a stem on the staff, and an empty square is a rest. The open hi-hat has its own row in the grid; on the staff it is the same × with a circle.',
        },
        example: {
          caption: {
            ro: 'Același groove în amândouă notațiile, cu fusul deschis pe ultima optime.',
            en: 'The same groove in both notations, with an open hi-hat on the last eighth.',
          },
          bpm: 84,
          showStaff: true,
          showGrid: true,
          exercise: demoExercise({
            id: 'demo-staff-punte',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              pas:   0  1  2  3  4  5  6  7
              timp:  1  &  2  &  3  &  4  &
              hat   'xxxxxxx.' = optimile, fără ultima
              open  '.......x' = ultima optime, fusul deschis
              snare '..x...x.' = pașii 2 și 6 = timpii 2 și 4   ✓ backbeat
              kick  'x...x...' = pașii 0 și 4 = timpii 1 și 3
            */
            stepsPerBar: 8,
            rows: {
              hhClosed: 'xxxxxxx.',
              hhOpen: '.......x',
              snare: '..x...x.',
              kick: 'x...x...',
            },
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'valorile-notelor',
    stage: 'notation',
    title: { ro: 'Pătrimi, optimi, șaisprezecimi', en: 'Quarters, eighths, sixteenths' },
    goal: {
      ro: 'Citești cât de des cade lovitura, și înțelegi de ce la tobe durata scrisă înseamnă altceva decât la pian.',
      en: 'Read how often the stroke falls, and see why written duration means something different on drums than on a piano.',
    },
    /*
      Valorile ÎN SINE se învață la Ritm, unde îi trebuie și unui chitarist. Aici
      se învață doar cum arată pe un portativ de tobe și ce înseamnă durata la un
      instrument care nu poate ține sunetul (PLAN-TEORIE-TOBE.md §1).
    */
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'alta-durata',
        heading: { ro: 'Când lovești, nu cât ții', en: 'When you hit, not how long' },
        body: {
          ro: '**O tobă nu poate ține sunetul**: o notă întreagă și o pătrime sună la fel. Deci la tobe durata scrisă spune **când vine următoarea lovitură**, nu cât sună. Un sunet lung se face din lovituri dese: un roll.',
          en: '**A drum cannot sustain**: a whole note and a quarter sound the same. So on drums, written duration says **when the next stroke comes**, not how long it rings. A long sound is made of fast strokes: a roll.',
        },
        example: {
          caption: {
            ro: 'Aceeași tobă mică: o măsură pe pătrimi, apoi una pe optimi.',
            en: 'The same snare drum: one bar in quarters, then one in eighths.',
          },
          bpm: 66,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-val-durata',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              'x.x.x.x.' = pașii 0,2,4,6 = pe fiecare timp -> pătrimi
              'xxxxxxxx' = toți pașii                      -> optimi
            */
            stepsPerBar: 8,
            rows: { snare: 'x.x.x.x.' },
            extraBars: [{ snare: 'xxxxxxxx' }],
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Roll', en: 'Roll' },
            meaning: {
              ro: 'Lovituri atât de dese încât se aud ca un sunet continuu. Singurul fel în care o tobă „ține".',
              en: 'Strokes so close together that they sound continuous. The only way a drum can "hold" anything.',
            },
          },
        ],
      },
      {
        id: 'patrimea-si-optimea',
        heading: { ro: 'Una pe timp, două pe timp', en: 'One a beat, two a beat' },
        body: {
          ro: '**Pătrimea** e o lovitură pe timp. **Optimea** e două pe timp, legate cu o **bară de grupare**. Ascultă: doar fusul se îndesește, de la pătrimi la optimi, și groove-ul se schimbă.',
          en: '**A quarter note** is one stroke per beat. **An eighth** is two per beat, joined by a **beam**. Listen: only the hi-hat gets denser, from quarters to eighths, and the groove changes.',
        },
        example: {
          caption: {
            ro: 'Același groove: fusul pe pătrimi în prima măsură, pe optimi în a doua.',
            en: 'The same groove: hi-hat in quarters in the first bar, in eighths in the second.',
          },
          bpm: 84,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-val-patrimi-optimi',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              măsura 1: hat 'x.x.x.x.' = o lovitură pe timp -> pătrimi
              măsura 2: hat 'xxxxxxxx' = două pe timp       -> optimi, legate două câte două
              snare '..x...x.' = pașii 2 și 6 = timpii 2 și 4, la fel în amândouă  ✓ backbeat
              kick  'x...x...' = pașii 0 și 4 = timpii 1 și 3, la fel în amândouă
            */
            stepsPerBar: 8,
            rows: { hhClosed: 'x.x.x.x.', snare: '..x...x.', kick: 'x...x...' },
            extraBars: [{ hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'saisprezecimea',
        heading: { ro: 'Patru pe timp', en: 'Four a beat' },
        body: {
          ro: '**Șaisprezecimea** împarte timpul în patru și are **două** bare de grupare. Regula de citit: **o bară = optimi, două bare = șaisprezecimi**. La fel la pauze, după cârlige.',
          en: '**A sixteenth** splits the beat into four and has **two** beams. The reading rule: **one beam = eighths, two beams = sixteenths**. Rests work the same way, by their hooks.',
        },
        example: {
          caption: {
            ro: 'Fusul pe șaisprezecimi, patru pe fiecare timp, legate câte patru.',
            en: 'Hi-hat in sixteenths, four to a beat, joined in fours.',
          },
          bpm: 76,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-val-saisprezecimi',
            /*
              16 pași, 4 timpi -> 4 pași pe timp.
              pas:   0  1  2  3 | 4  5  6  7 | 8  9 10 11 | 12 13 14 15
              timp:  1  e  &  a | 2  e  &  a | 3  e  &  a |  4  e  &  a
              snare '....x.......x...' = pașii 4 și 12 = timpii 2 și 4   ✓ backbeat
              kick  'x.......x.......' = pașii 0 și 8  = timpii 1 și 3
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: 'xxxxxxxxxxxxxxxx',
              snare: '....x.......x...',
              kick: 'x.......x.......',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'trei-densitati',
        heading: { ro: 'Același groove, trei densități', en: 'One groove, three densities' },
        body: {
          ro: 'Același schelet, doar fusul se îndesește: pătrimi, optimi, șaisprezecimi. Tempoul nu se schimbă, dar groove-ul se simte tot mai grăbit. Densitatea e o alegere, nu o întrecere.',
          en: 'The same skeleton, only the hi-hat gets denser: quarters, eighths, sixteenths. The tempo does not change, but the groove feels more and more urgent. Density is a choice, not a race.',
        },
        example: {
          caption: {
            ro: 'Aceeași tobă mare și aceeași tobă mică; fusul trece de la pătrimi la optimi și la șaisprezecimi.',
            en: 'The same bass drum and snare throughout; the hi-hat moves from quarters to eighths to sixteenths.',
          },
          bpm: 76,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-val-trei-densitati',
            /*
              16 pași, 4 timpi -> 4 pași pe timp. Toate trei măsurile au același
              schelet; se schimbă numai fusul.
              hat măsura 1 'x...x...x...x...' = pașii 0,4,8,12 -> pătrimi
              hat măsura 2 'x.x.x.x.x.x.x.x.' = din doi în doi -> optimi
              hat măsura 3 'xxxxxxxxxxxxxxxx' = toți pașii     -> șaisprezecimi
              snare '....x.......x...' = timpii 2 și 4   ✓ backbeat
              kick  'x.......x.......' = timpii 1 și 3
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x...x...x...x...',
              snare: '....x.......x...',
              kick: 'x.......x.......',
            },
            extraBars: [
              {
                hhClosed: 'x.x.x.x.x.x.x.x.',
                snare: '....x.......x...',
                kick: 'x.......x.......',
              },
              {
                hhClosed: 'xxxxxxxxxxxxxxxx',
                snare: '....x.......x...',
                kick: 'x.......x.......',
              },
            ],
            tempo: SIXTEENTHS,
          }),
        },
      },
      {
        id: 'pauzele',
        heading: { ro: 'Pauzele au și ele valori', en: 'Rests have values too' },
        body: {
          ro: 'Pauzele au aceleași valori ca notele și se deosebesc după cârlige. La tobe sunt rare: se scriu doar când timpul **începe** gol. Aici: toba mare pe 1, toba mică pe 3, pauze pe 2 și 4.',
          en: 'Rests have the same values as notes and are told apart by their hooks. On drums they are rare: you only write one when the beat **starts** empty. Here: bass drum on 1, snare on 3, rests on 2 and 4.',
        },
        example: {
          caption: {
            ro: 'Half-time: toba mare pe 1, toba mică pe 3, și două pauze de pătrime pe 2 și pe 4.',
            en: 'Half-time: bass drum on 1, snare on 3, and two quarter rests on 2 and 4.',
          },
          bpm: 72,
          showStaff: true,
          showGrid: true,
          exercise: demoExercise({
            id: 'demo-val-pauze',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              kick  'x.......' = pasul 0 = timpul 1
              snare '....x...' = pasul 4 = timpul 3
              timpii 2 (pașii 2,3) și 4 (pașii 6,7) rămân goi -> două pauze de pătrime
            */
            stepsPerBar: 8,
            rows: { kick: 'x.......', snare: '....x...' },
            tempo: SLOW,
          }),
        },
      },
      {
        id: 'citeste-singur',
        heading: { ro: 'Citește singur', en: 'Read it yourself' },
        body: {
          ro: 'Citește măsura **înainte** să apeși: fusul pe optimi, toba mică pe 2 și 4, toba mare pe 1, pe „unu-a”, pe 3 și pe „patru-și”. Apoi ascultă și verifică în grilă.',
          en: 'Read the bar **before** you press play: hi-hat in eighths, snare on 2 and 4, bass drum on 1, on the "a" of 1, on 3 and on the "and" of 4. Then listen and check against the grid.',
        },
        example: {
          caption: {
            ro: 'Un groove cu toba mare sincopată. Citește-l întâi, apoi ascultă-l.',
            en: 'A groove with a syncopated bass drum. Read it first, then listen.',
          },
          bpm: 80,
          showStaff: true,
          showGrid: true,
          exercise: demoExercise({
            id: 'demo-val-citeste',
            /*
              16 pași, 4 timpi -> 4 pași pe timp.
              pas:   0  1  2  3 | 4  5  6  7 | 8  9 10 11 | 12 13 14 15
              timp:  1  e  &  a | 2  e  &  a | 3  e  &  a |  4  e  &  a
              hat   'x.x.x.x.x.x.x.x.' = din doi în doi = optimi
              snare '....x.......x...' = pașii 4 și 12 = timpii 2 și 4   ✓ backbeat
              kick  'x..x....x.....x.' = pașii 0, 3, 8 și 14
                    pasul 0  = timpul 1
                    pasul 3  = „unu-a"    (ultima șaisprezecime a timpului 1)
                    pasul 8  = timpul 3
                    pasul 14 = „patru-și" (a treia șaisprezecime a timpului 4)
              Textul de deasupra numește exact pașii 3 și 14; dacă se mută unul,
              se mută și acolo.
            */
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '....x.......x...',
              kick: 'x..x....x.....x.',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
    ],
  },

  {
    id: 'intensitati',
    stage: 'notation',
    title: { ro: 'Accent, ghost note și feluri de lovitură', en: 'Accents, ghost notes and stroke types' },
    goal: {
      ro: 'Citești cât de tare se lovește și cu ce parte a bățului, semnele care despart un groove viu de unul plat.',
      en: 'Read how hard a stroke is and which part of the stick makes it, the signs that separate a living groove from a flat one.',
    },
    sections: [
      {
        id: 'de-ce-conteaza',
        heading: { ro: 'Aceleași note, alt groove', en: 'Same notes, different groove' },
        body: {
          ro: 'Pe tobe, **cât de tare lovești e jumătate din muzică**. Notația are trei trepte: **accentul** (un „>” deasupra), lovitura normală (fără semn) și **ghost note-ul** (capul în paranteze).',
          en: 'On drums, **how hard you hit is half the music**. Notation has three levels: the **accent** (a „>” above), the normal stroke (no sign) and the **ghost note** (the head in parentheses).',
        },
      },
      {
        id: 'accentul',
        heading: { ro: 'Accentul', en: 'The accent' },
        body: {
          ro: 'Un „>” deasupra notei înseamnă că lovitura iese în față față de cele din jur. Ascultă: opt optimi egale, accent doar pe timpi, și apare pulsul.',
          en: 'A „>” above a note means that stroke stands out from the ones around it. Listen: eight even eighths, accents only on the beats, and a pulse appears.',
        },
        example: {
          caption: {
            ro: 'Opt optimi de fus, cu accent doar pe cei patru timpi.',
            en: 'Eight hi-hat eighths, accented on the four beats only.',
          },
          bpm: 84,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-int-accent',
            /*
              Numai fusul, nimic dedesubt, și nu din sărăcie.

              Accentul se desenează deasupra codiței, deci ține de toată coloana.
              Cu o tobă mare pe „unu", accentul de pe fus ar arăta ca și cum ar
              fi accentuată și ea. Aici fiecare coloană are o singură lovitură,
              deci semnul nu poate fi citit greșit, și e chiar felul în care se
              exersează accentele într-un studiu.

              8 pași, 4 timpi -> 2 pași pe timp.
              'XxXxXxXx' = accent pe pașii 0,2,4,6 = pe timpii 1,2,3,4
            */
            stepsPerBar: 8,
            rows: { hhClosed: 'XxXxXxXx' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Accent', en: 'Accent' },
            meaning: {
              ro: 'Lovitura scoasă în față. Pe partitură, un „>” deasupra notei.',
              en: 'The stroke brought forward. On paper, a „>” above the note.',
            },
          },
        ],
      },
      {
        id: 'ghost-note',
        heading: { ro: 'Ghost note-ul', en: 'The ghost note' },
        body: {
          ro: 'Capul în paranteze e un **ghost note**: se simte ca pulsație, nu se aude ca notă. Nu e o lovitură mai încet, ci o umbră care umple spațiul dintre backbeat-uri fără să le concureze.',
          en: 'A head in parentheses is a **ghost note**: felt as a pulse, not heard as a note. It is not just a quieter stroke but a shadow that fills the space between backbeats without competing with them.',
        },
        example: {
          caption: {
            ro: 'Toba mică singură: ghost note pe 1 și 3, accent pe 2 și 4.',
            en: 'The snare alone: ghost notes on 1 and 3, accents on 2 and 4.',
          },
          bpm: 78,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-int-ghost',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              pas:   0  1  2  3  4  5  6  7
              timp:  1  &  2  &  3  &  4  &
              'o.X.o.X.' = ghost pe 0 și 4 (timpii 1 și 3)
                           accent pe 2 și 6 (timpii 2 și 4)  ✓ backbeat
            */
            stepsPerBar: 8,
            rows: { snare: 'o.X.o.X.' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Ghost note', en: 'Ghost note' },
            meaning: {
              ro: 'Lovitură foarte slabă, care se simte ca pulsație, nu se aude ca notă. Se scrie cu capul în paranteze.',
              en: 'A very soft stroke, felt as a pulse rather than heard as a note. Written with the head in parentheses.',
            },
          },
        ],
      },
      {
        id: 'in-groove',
        heading: { ro: 'Toate trei, într-un groove', en: 'All three, in a groove' },
        body: {
          ro: 'Ghost note-urile stau pe aceeași poziție ca backbeat-ul: aceeași tobă, lovită altfel. **Doar parantezele le deosebesc.** Așa devine un groove de rock unul de funk, fără să se mute nicio notă.',
          en: 'Ghost notes sit in the same position as the backbeat: the same drum, struck differently. **Only the parentheses tell them apart.** That is how a rock groove turns into a funk one without moving a single note.',
        },
        example: {
          caption: {
            ro: 'Groove cu ghost note-uri: fusul pe optimi, backbeat pe 2 și 4, ghost pe 1 și 3.',
            en: 'A groove with ghost notes: hi-hat in eighths, backbeat on 2 and 4, ghosts on 1 and 3.',
          },
          bpm: 84,
          showKit: true,
          showStaff: true,
          showGrid: true,
          exercise: demoExercise({
            id: 'demo-int-groove',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              pas:   0  1  2  3  4  5  6  7
              timp:  1  &  2  &  3  &  4  &
              hat   'xxxxxxxx' = optimile, toate normale
              snare 'o.x.o.x.' = ghost pe 0 și 4 (timpii 1 și 3)
                                 lovitură pe 2 și 6 (timpii 2 și 4)  ✓ backbeat
              kick  'x...x...' = pașii 0 și 4 = timpii 1 și 3

              Fără accente aici, dinadins: coloana 0 are fus + tobă mică + tobă
              mare, iar un accent desenat deasupra ei ar părea că le privește pe
              toate trei. Backbeat-ul iese oricum, fiindcă ghost note-urile din
              jur îl lasă să iasă, ceea ce e chiar ce spune textul.
            */
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: 'o.x.o.x.', kick: 'x...x...' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'feluri-de-lovitura',
        heading: { ro: 'Cross-stick și rimshot', en: 'Cross-stick and rimshot' },
        visual: 'heads',
        body: {
          ro: '**Cross-stick**: bățul culcat pe toba mică, coada lovind cercul; sunet sec, de lemn, folosit în balade. Se scrie cu **×** pe spațiul tobei mici, deci ×-ul nu înseamnă mereu cinel: poziția spune piesa. **Rimshot**: fața și cercul lovite deodată, cel mai tare sunet al tobei mici, scris cu o linie oblică peste cap. Rimshot-ul nu-l putem cânta încă: n-avem mostră pentru el.',
          en: '**Cross-stick**: the stick laid on the snare, its butt striking the rim; a dry, wooden knock, used in ballads. Written as an **×** on the snare space, so an × does not always mean cymbal: the position tells you the piece. **Rimshot**: head and rim struck together, the loudest sound a snare makes, written with a slash through the head. We cannot play the rimshot yet: there is no sample for it.',
        },
        example: {
          caption: {
            ro: 'Groove de baladă: cross-stick pe 2 și 4, ×-ul pe spațiul tobei mici.',
            en: 'A ballad groove: cross-stick on 2 and 4, the × on the snare space.',
          },
          bpm: 72,
          showStaff: true,
          showGrid: true,
          exercise: demoExercise({
            id: 'demo-int-cross-stick',
            // 8 pași: cross-stick pe pașii 2 și 6 = timpii 2 și 4.
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', crossStick: '..x...x.', kick: 'x...x...' },
            tempo: SLOW,
          }),
        },
        terms: [
          {
            term: { ro: 'Cross-stick', en: 'Cross-stick' },
            meaning: {
              ro: 'Bățul culcat pe fața tobei mici, coada lovind cercul. Sunet de lemn. Scris cu × pe spațiul tobei mici.',
              en: 'Stick laid on the head, butt striking the rim. A wooden knock. Written as × on the snare space.',
            },
          },
          {
            term: { ro: 'Rimshot', en: 'Rimshot' },
            meaning: {
              ro: 'Fața tobei și cercul lovite deodată. Cel mai tare sunet al tobei mici.',
              en: 'Head and rim struck at once. The loudest sound a snare makes.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'triolete-si-shuffle',
    stage: 'notation',
    title: { ro: 'Triolete și shuffle', en: 'Triplets and shuffle' },
    goal: {
      ro: 'Citești timpul împărțit în trei, cifra de deasupra barei, shuffle-ul și ride-ul de jazz.',
      en: 'Read the beat split in three, the figure above the beam, the shuffle and the jazz ride.',
    },
    /*
      Trioletul ca noțiune de timp e lecția 11 din Ritm, și acolo rămâne. Aici se
      învață doar cum se scrie pe un portativ de tobe și ce face cu groove-ul.
    */
    requiresRhythmLesson: 'triolete',
    sections: [
      {
        id: 'trei-in-loc-de-doi',
        heading: { ro: 'Trei, în loc de doi', en: 'Three, instead of two' },
        body: {
          ro: '**Trioletul** pune trei note egale într-un timp, în loc de două. Se scrie cu **cifra 3** deasupra grupului. Se simte ca o legănare, nu ca o grabă.',
          en: '**A triplet** puts three equal notes in one beat instead of two. It is written with a **3** above the group. It feels like a sway, not a rush.',
        },
        example: {
          caption: {
            ro: 'Patru triolete, unul pe fiecare timp. Cifra 3 stă deasupra fiecărui grup.',
            en: 'Four triplets, one on each beat. The figure 3 sits above each group.',
          },
          bpm: 76,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-tri-simple',
            /*
              12 pași, 4 timpi -> 3 pași pe timp, adică triolete.
              Toate cele 12 lovite: patru grupuri de câte trei.
            */
            stepsPerBar: 12,
            rows: { snare: 'xxxxxxxxxxxx' },
            tempo: TRIPLETS,
          }),
        },
        terms: [
          {
            term: { ro: 'Triolet', en: 'Triplet' },
            meaning: {
              ro: 'Trei note egale în locul a două. Se scrie cu cifra 3 deasupra grupului.',
              en: 'Three equal notes in the place of two. Written with a 3 above the group.',
            },
          },
        ],
      },
      {
        id: 'shuffle',
        heading: { ro: 'Shuffle: trioletul cu mijlocul scos', en: 'Shuffle: the triplet with its middle removed' },
        body: {
          ro: 'Scoate nota din mijlocul trioletului și rămâne **lung-scurt**: asta e shuffle-ul. Îl auzi în blues și în rock and roll. Aceleași piese ca la rock, alt mers.',
          en: 'Drop the middle note of a triplet and you are left with **long-short**: that is the shuffle. You hear it in blues and rock and roll. The same pieces as rock, a different walk.',
        },
        example: {
          caption: {
            ro: 'Shuffle pe ride: lung-scurt pe fiecare timp, backbeat pe 2 și 4.',
            en: 'A shuffle on the ride: long-short on every beat, backbeat on 2 and 4.',
          },
          bpm: 80,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-tri-shuffle',
            /*
              12 pași, 4 timpi -> 3 pași pe timp.
              pas:   0  1  2 | 3  4  5 | 6  7  8 | 9 10 11
              timp:     1    |    2    |    3    |    4
              ride  'x.xx.xx.xx.x' = prima și a treia din fiecare triolet
                                     = lung-scurt  ✓ shuffle
              snare '...x.....x..' = pașii 3 și 9 = timpii 2 și 4   ✓ backbeat
              kick  'x.....x.....' = pașii 0 și 6 = timpii 1 și 3
            */
            stepsPerBar: 12,
            rows: { ride: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' },
            tempo: TRIPLETS,
          }),
        },
        terms: [
          {
            term: { ro: 'Shuffle', en: 'Shuffle' },
            meaning: {
              ro: 'Trioletul fără nota din mijloc: lung-scurt în loc de egal.',
              en: 'A triplet without its middle note: long-short instead of even.',
            },
          },
        ],
      },
      {
        id: 'ride-ul-de-jazz',
        heading: { ro: 'Ride-ul de jazz', en: 'The jazz ride' },
        body: {
          ro: 'Din shuffle iese **ride-ul de jazz**: ding, ding-da, ding, ding-da. În jazz, ride-ul e piesa principală. Sub el, fusul închis cu piciorul pe 2 și 4, scris cu × sub portativ.',
          en: 'Out of the shuffle comes the **jazz ride**: ding, ding-da, ding, ding-da. In jazz the ride is the main piece. Under it, the hi-hat closed with the foot on 2 and 4, written as an × below the staff.',
        },
        example: {
          caption: {
            ro: 'Ride-ul de jazz, „ding, ding-da", și fusul cu piciorul pe 2 și 4.',
            en: 'The jazz ride, "ding, ding-da", and the foot hi-hat on 2 and 4.',
          },
          bpm: 84,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-tri-jazz',
            /*
              12 pași, 4 timpi -> 3 pași pe timp.
              pas:   0  1  2 | 3  4  5 | 6  7  8 | 9 10 11
              timp:     1    |    2    |    3    |    4
              ride  'x..x.xx..x.x'
                    pasul 0  = timpul 1, simplu
                    pașii 3,5 = timpul 2, lung-scurt
                    pasul 6  = timpul 3, simplu
                    pașii 9,11 = timpul 4, lung-scurt
            */
            stepsPerBar: 12,
            // Fusul cu piciorul pe pașii 3 și 9 = timpii 2 și 4.
            rows: { ride: 'x..x.xx..x.x', hhFoot: '...x.....x..' },
            tempo: TRIPLETS,
          }),
        },
      },
    ],
  },

  {
    id: 'dubla-si-crash',
    stage: 'notation',
    title: { ro: 'Toba mare dublă și crash-ul', en: 'Double bass and the crash' },
    goal: {
      ro: 'Citești o tobă mare deasă, cântată cu două picioare, și crash-ul care marchează unde începe.',
      en: 'Read a dense bass drum played with two feet, and the crash that marks where it starts.',
    },
    requiresRhythmLesson: 'saisprezecimea',
    sections: [
      {
        id: 'aceeasi-linie',
        heading: { ro: 'Un picior sau două, aceeași linie', en: 'One foot or two, the same line' },
        body: {
          ro: '**Dubla** e toba mare cântată cu amândouă picioarele. Pe partitură nu se schimbă nimic: aceeași poziție, același cap. Se schimbă doar densitatea: optimile le duce un picior, șaisprezecimile ținute cer două.',
          en: '**Double bass** is the bass drum played with both feet. Nothing changes on paper: same position, same head. Only the density changes: one foot handles eighths, sustained sixteenths need two.',
        },
        example: {
          caption: {
            ro: 'Aceeași tobă mare: optimi în prima măsură, șaisprezecimi în a doua.',
            en: 'The same bass drum: eighths in the first bar, sixteenths in the second.',
          },
          bpm: 76,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-dubla-densitate',
            /*
              16 pași, 4 timpi -> 4 pași pe timp.
              măsura 1: kick 'x.x.x.x.x.x.x.x.' = din doi în doi -> optimi
              măsura 2: kick 'xxxxxxxxxxxxxxxx' = toți pașii     -> șaisprezecimi
              snare '....x.......x...' = pașii 4 și 12 = timpii 2 și 4  ✓ backbeat
            */
            stepsPerBar: 16,
            rows: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...' },
            extraBars: [{ kick: 'xxxxxxxxxxxxxxxx', snare: '....x.......x...' }],
            tempo: SIXTEENTHS,
          }),
        },
        terms: [
          {
            term: { ro: 'Dublă (double bass)', en: 'Double bass' },
            meaning: {
              ro: 'Toba mare cântată cu amândouă picioarele. Se scrie la fel ca una singură, se schimbă doar cât de dese sunt notele.',
              en: 'The bass drum played with both feet. Written exactly like a single one, only the note density changes.',
            },
          },
        ],
      },
      {
        id: 'crash-ul',
        heading: { ro: 'Crash-ul, ca semn de punctuație', en: 'The crash, as punctuation' },
        body: {
          ro: '**Crash-ul** stă cel mai sus pe portativ, pe linia lui suplimentară. Nu ține timpul: marchează începutul unui refren sau capătul unui fill, aproape mereu pe „unu”, odată cu toba mare. Crash-urile îți arată dintr-o privire unde se schimbă piesa.',
          en: 'The **crash** sits highest on the staff, on its own ledger line. It does not keep time: it marks the start of a chorus or the end of a fill, nearly always on beat one, together with the bass drum. The crashes show you at a glance where the song changes.',
        },
        example: {
          caption: {
            ro: 'Crash pe „unu", odată cu toba mare, apoi fusul ține mai departe.',
            en: 'A crash on beat one, together with the bass drum, then the hi-hat carries on.',
          },
          bpm: 84,
          showKit: true,
          showStaff: true,
          showGrid: false,
          exercise: demoExercise({
            id: 'demo-dubla-crash',
            /*
              8 pași, 4 timpi -> 2 pași pe timp.
              pas:   0  1  2  3  4  5  6  7
              timp:  1  &  2  &  3  &  4  &
              crash 'x.......' = pasul 0 = timpul 1, odată cu toba mare
              hat   '.xxxxxxx' = restul optimilor (pe „unu" e crash-ul)
              snare '..x...x.' = pașii 2 și 6 = timpii 2 și 4   ✓ backbeat
              kick  'x...x...' = pașii 0 și 4 = timpii 1 și 3
            */
            stepsPerBar: 8,
            rows: {
              crash: 'x.......',
              hhClosed: '.xxxxxxx',
              snare: '..x...x.',
              kick: 'x...x...',
            },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'metal',
        heading: { ro: 'Totul odată', en: 'All of it at once' },
        body: {
          ro: 'Totul la un loc: crash pe „unu”, toba mare pe șaisprezecimi, toba mică pe 2 și 4, fusul pe ceilalți timpi. Citește măsura înainte să apeși, după trei repere: crash-ul sus, toba mare jos, backbeat-ul la mijloc.',
          en: 'All of it together: crash on one, bass drum in sixteenths, snare on 2 and 4, hi-hat on the other beats. Read the bar before you press play, by three landmarks: the crash at the top, the bass drum at the bottom, the backbeat in the middle.',
        },
        example: {
          caption: {
            ro: 'Groove de metal: crash pe „unu", dublă pe șaisprezecimi, backbeat pe 2 și 4.',
            en: 'A metal groove: crash on one, double bass in sixteenths, backbeat on 2 and 4.',
          },
          bpm: 80,
          showKit: true,
          showStaff: true,
          showGrid: true,
          exercise: demoExercise({
            id: 'demo-dubla-metal',
            /*
              16 pași, 4 timpi -> 4 pași pe timp.
              pas:   0  1  2  3 | 4  5  6  7 | 8  9 10 11 | 12 13 14 15
              timp:  1  e  &  a | 2  e  &  a | 3  e  &  a |  4  e  &  a
              crash 'x...............' = pasul 0 = timpul 1
              hat   '....x...x...x...' = pașii 4,8,12 = timpii 2,3,4
                                         (pe „unu" sună crash-ul, nu fusul)
              snare '....x.......x...' = pașii 4 și 12 = timpii 2 și 4  ✓ backbeat
              kick  'xxxxxxxxxxxxxxxx' = toate șaisprezecimile = dubla
            */
            stepsPerBar: 16,
            rows: {
              crash: 'x...............',
              hhClosed: '....x...x...x...',
              snare: '....x.......x...',
              kick: 'xxxxxxxxxxxxxxxx',
            },
            tempo: SIXTEENTHS,
          }),
        },
      },
    ],
  },
]
