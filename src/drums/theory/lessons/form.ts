import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 4, Forma piesei.

  Cinci lecții: fraza, fill-ul ca punctuație, părțile piesei, stops și intrări,
  unde e „unu". Etapa e despre CÂND se întâmplă lucrurile într-o piesă, nu
  despre ce se cântă, deci exemplele sunt mai lungi (două-patru măsuri) și
  folosesc numai ce s-a predat înainte: groove-ul de rock, crash-ul, tomurile.

  Grila strânge măsurile identice în „×N" (`notation-bars.ts`), așa că o frază
  de patru măsuri încape pe un ecran: se vede doar ce se schimbă.

  Breaks-urile nu au exemplu: un break e trupa care tace, iar aici nu există
  trupă. O măsură goală nici nu trece validarea, și pe drept, n-ar avea ce
  arăta.
*/

/** Toate exemplele stau pe optimi; capătul de sus e ce suportă un fill pe optimi. */
const GROOVE = { min: 50, max: 140, suggested: 92 }

const ROCK = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
/** Prima măsură a unei fraze: crash pe „unu", fusul reia după el. */
const ROCK_CRASH = { crash: 'x.......', hhClosed: '.xxxxxxx', snare: '..x...x.', kick: 'x...x...' }

/*
  Groove-urile de fundal, câte unul pe lecție.

  Forma se predă peste un groove, iar groove-ul nu e subiectul. Dar dacă e mereu
  același rock pe 1 și 3, elevul aude toată etapa o singură măsură și nu află
  că fraza, fill-ul sau stop-ul arată la fel peste orice groove. Deci fiecare
  lecție (și unele secțiuni) primesc altul, din cele învățate deja.
*/
type Groove = Partial<Record<'hhClosed' | 'hhOpen' | 'ride' | 'snare' | 'kick', string>>
/** Toba mare care împinge: 1, „doi-și”, 3. */
const PUSH: Groove = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' }
/** Pop 3-3-2: toba mare pe 1, „doi-și”, 4. */
const POP: Groove = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x..x.' }
/** Pe ride, cu toba mare pe 1, „doi-și”, „trei-și”. */
const RIDE: Groove = { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x.x..' }
/** Disco: fusul deschis pe „și”, toba mare pe fiecare timp. */
const DISCO: Groove = { hhClosed: 'x.x.x.x.', hhOpen: '.x.x.x.x', snare: '..x...x.', kick: 'x.x.x.x.' }
/** Half-time: toba mică doar pe 3. */
const HALF: Groove = { hhClosed: 'xxxxxxxx', snare: '....x...', kick: 'x.....x.' }

/** Prima măsură a frazei: crash pe „unu”, iar cinelul care ține timpul tace acolo. */
function withCrash(groove: Groove): Groove & { crash: string } {
  const out: Groove & { crash: string } = { ...groove, crash: 'x.......' }
  if (groove.hhClosed) out.hhClosed = '.' + groove.hhClosed.slice(1)
  if (groove.ride) out.ride = '.' + groove.ride.slice(1)
  return out
}

/** Ultima măsură a frazei: fusul deschis pe ultima optime, ca semn că vine alta. */
const openEnd = (groove: Groove): Groove => ({
  ...groove,
  hhClosed: (groove.hhClosed ?? 'xxxxxxxx').slice(0, 7) + '.',
  hhOpen: '.......x',
})

export const formLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'fraza',
    stage: 'form',
    title: { ro: 'Fraza de 4 și de 8 măsuri', en: 'Four- and eight-bar phrases' },
    goal: {
      ro: 'Auzi cum se grupează măsurile în fraze și știi mereu în ce măsură ești.',
      en: 'Hear how bars group into phrases, and always know which bar you are in.',
    },
    requiresRhythmLesson: 'masura',
    sections: [
      {
        id: 'ce-e-fraza',
        heading: { ro: 'Măsurile vin în grupe', en: 'Bars come in groups' },
        body: {
          ro: 'Muzica se grupează în **fraze** de 4 sau 8 măsuri. Le auzi fără să le numeri: după patru măsuri ceva se încheie. Crash-ul marchează începutul frazei.',
          en: 'Music groups into **phrases** of 4 or 8 bars. You hear them without counting: after four bars something comes to an end. The crash marks the start of the phrase.',
        },
        example: {
          caption: {
            ro: 'O frază de patru măsuri: crash pe „unu” în prima, apoi trei de groove.',
            en: 'A four-bar phrase: a crash on one in the first, then three bars of groove.',
          },
          bpm: 96,
          exercise: demoExercise({
            id: 'demo-forma-fraza',
            stepsPerBar: 8,
            rows: ROCK_CRASH,
            extraBars: [ROCK, ROCK, ROCK],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Frază', en: 'Phrase' },
            meaning: {
              ro: 'Un grup de măsuri, de obicei 4 sau 8, care se aude ca o unitate.',
              en: 'A group of bars, usually 4 or 8, heard as one unit.',
            },
          },
        ],
      },
      {
        id: 'numara-masurile',
        heading: { ro: 'Numeri și măsurile', en: 'Count the bars too' },
        body: {
          ro: 'Primul număr spune măsura: **unu**-doi-trei-patru, **doi**-doi-trei-patru, **trei**-doi-trei-patru, **patru**-doi-trei-patru. Așa nu te pierzi niciodată în frază.',
          en: 'The first number tells you the bar: **one**-two-three-four, **two**-two-three-four, **three**-two-three-four, **four**-two-three-four. That way you never get lost in the phrase.',
        },
      },
      {
        id: 'fraza-de-opt',
        heading: { ro: 'Fraza de opt', en: 'The eight-bar phrase' },
        body: {
          ro: 'Opt măsuri sunt două jumătăți de patru: prima întreabă, a doua răspunde. Ultima măsură pregătește fraza următoare, de obicei cu o mică schimbare.',
          en: 'Eight bars are two halves of four: the first asks, the second answers. The last bar sets up the next phrase, usually with a small change.',
        },
        example: {
          caption: {
            ro: 'Opt măsuri: crash la început, fusul deschis la capătul celei de-a opta.',
            en: 'Eight bars: a crash at the start, an open hi-hat at the end of the eighth.',
          },
          bpm: 104,
          exercise: demoExercise({
            id: 'demo-forma-fraza-opt',
            stepsPerBar: 8,
            rows: withCrash(PUSH),
            extraBars: [
              PUSH,
              PUSH,
              PUSH,
              PUSH,
              PUSH,
              PUSH,
              openEnd(PUSH),
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'exerseaza-fraza',
        heading: { ro: 'Exersează: cântă fraza', en: 'Practise: play the phrase' },
        body: {
          ro: 'Cântă o frază întreagă: crash pe „unu” în prima măsură, groove în următoarele, iar la capătul celei de-a patra deschizi fusul pe ultima optime, ca semn că vine o frază nouă. Numără primul timp al fiecărei măsuri cu numărul ei: unu, doi, trei, patru.',
          en: 'Play a whole phrase: crash on one in the first bar, groove in the next ones, and at the end of the fourth open the hi-hat on the last eighth, as a sign a new phrase is coming. Count the first beat of each bar with its number: one, two, three, four.',
        },
        example: {
          caption: {
            ro: 'Crash la început, fusul deschis la capătul măsurii a patra. Ascultă, apoi apasă „Cânți tu”.',
            en: 'A crash at the start, the hi-hat opened at the end of bar four. Listen, then press "You play".',
          },
          bpm: 96,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-forma-fraza-exersat',
            stepsPerBar: 8,
            rows: withCrash(POP),
            extraBars: [
              POP,
              POP,
              openEnd(POP),
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'blues-de-doisprezece',
        heading: { ro: 'Douăsprezece măsuri: blues-ul', en: 'Twelve bars: the blues' },
        body: {
          ro: 'Nu toate frazele sunt de patru sau opt. **Blues-ul** are douăsprezece măsuri: trei rânduri de câte patru. Toboșarul marchează începutul cu crash, pune un fill mic la capătul rândurilor unu și doi și un fill mai mare la capătul celui de-al treilea, când forma se ia de la capăt.',
          en: 'Not every phrase is four or eight bars. The **blues** has twelve: three lines of four. The drummer marks the start with a crash, puts a small fill at the end of the first and second lines and a bigger one at the end of the third, when the form starts over.',
        },
        terms: [
          {
            term: { ro: 'Blues de 12 măsuri', en: 'Twelve-bar blues' },
            meaning: {
              ro: 'Forma de blues: trei rânduri de câte patru măsuri, reluate de la capăt.',
              en: 'The blues form: three lines of four bars, repeated from the top.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'fill-ul',
    stage: 'form',
    title: { ro: 'Fill-ul ca punctuație', en: 'The fill as punctuation' },
    goal: {
      ro: 'Pui un fill la capăt de frază și revii la timp pe „unu”.',
      en: 'Place a fill at the end of a phrase and land back on one in time.',
    },
    sections: [
      {
        id: 'ce-e-fill',
        heading: { ro: 'Tot ce nu e groove', en: 'Everything that is not the groove' },
        body: {
          ro: 'Un **fill** e tot ce nu e groove-ul. Vine de obicei în ultima măsură a frazei și împinge piesa spre următoarea, unde aterizezi cu crash pe „unu”.',
          en: 'A **fill** is everything that is not the groove. It usually comes in the last bar of a phrase and pushes the song into the next one, where you land with a crash on one.',
        },
        example: {
          caption: {
            ro: 'Trei măsuri de groove, fill-ul pe tobe în a patra, crash pe „unu” la întoarcere.',
            en: 'Three bars of groove, a fill on the drums in the fourth, a crash on one coming back.',
          },
          bpm: 92,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-forma-fill',
            stepsPerBar: 8,
            rows: withCrash(PUSH),
            extraBars: [
              PUSH,
              PUSH,
              // Fill-ul pe optimi: toba mică pe timpii 1-2, tomul 1 pe 3, cazanul pe 4.
              { snare: 'xxxx....', tom: '....xx..', floor: '......xx', kick: 'x.......' },
            ],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Fill', en: 'Fill' },
            meaning: {
              ro: 'Tot ce se cântă în locul groove-ului, de obicei la capăt de frază.',
              en: 'Whatever is played instead of the groove, usually at the end of a phrase.',
            },
          },
        ],
      },
      {
        id: 'aceeasi-lungime',
        heading: { ro: 'Fill-ul are lungimea unei măsuri', en: 'A fill lasts exactly one bar' },
        body: {
          ro: 'Cea mai comună greșeală la tobe: grăbești la fill și ajungi pe „unu” prea devreme. Fill-ul are exact lungimea măsurii pe care o înlocuiește. Numără-l cu voce tare.',
          en: 'The most common drumming mistake: you rush the fill and land on one too early. A fill is exactly as long as the bar it replaces. Count it out loud.',
        },
      },
      {
        id: 'fill-scurt',
        heading: { ro: 'Un fill scurt e suficient', en: 'A short fill is enough' },
        body: {
          ro: 'Fill-ul nu trebuie să umple toată măsura. Doi timpi ajung: groove pe 1 și 2, fill pe 3 și 4. E mai ușor de cântat la timp și sună mai sigur.',
          en: 'A fill does not have to fill the whole bar. Two beats are enough: groove on 1 and 2, fill on 3 and 4. It is easier to play in time and sounds more confident.',
        },
        example: {
          caption: {
            ro: 'Groove pe primii doi timpi, fill pe ultimii doi.',
            en: 'Groove on the first two beats, fill on the last two.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-fill-scurt',
            stepsPerBar: 8,
            rows: ROCK_CRASH,
            // Pașii 4-7 (timpii 3-4): toba mică, tomul 1, cazanul.
            extraBars: [{ hhClosed: 'xxxx....', snare: '..x.xx..', tom: '......x.', floor: '.......x', kick: 'x.......' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'fill-pe-un-timp',
        heading: { ro: 'Un singur timp', en: 'A single beat' },
        body: {
          ro: 'Cel mai mic fill ține un singur timp: două lovituri pe tomuri, pe „patru” și pe „patru-și”, apoi crash. E primul fill pe care merită să-l stăpânești, fiindcă merge oriunde și nu te poate scoate din timp.',
          en: 'The smallest fill lasts one beat: two strokes on the toms, on four and the "and" of four, then a crash. It is the first fill worth owning, because it fits anywhere and cannot throw you off time.',
        },
        example: {
          caption: {
            ro: 'Trei măsuri de groove, a patra cu fill doar pe timpul 4.',
            en: 'Three bars of groove, the fourth with a fill on beat 4 only.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-fill-un-timp',
            stepsPerBar: 8,
            rows: withCrash(POP),
            // Măsura 4: tomul 1 pe pasul 6, cazanul pe 7.
            extraBars: [POP, POP, { hhClosed: 'xxxxxx..', snare: '..x.....', tom: '......x.', floor: '.......x', kick: 'x...x...' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'exerseaza-fill',
        heading: { ro: 'Exersează: fill-ul la timp', en: 'Practise: the fill on time' },
        body: {
          ro: 'Cântă fraza cu fill-ul pe ultimii doi timpi, cu clicul pe fiecare timp. Spune timpii cu voce tare în fill: „trei-și-patru-și”. Dacă crash-ul tău cade înaintea clicului de pe „unu”, ai grăbit fill-ul; dacă după el, l-ai întins.',
          en: 'Play the phrase with the fill on the last two beats, with the click on every beat. Say the beats out loud during the fill: "three-and-four-and". If your crash lands before the click on one, you rushed the fill; if after it, you stretched it.',
        },
        example: {
          caption: {
            ro: 'Trei măsuri de groove, fill pe timpii 3-4, crash la întoarcere. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Three bars of groove, a fill on beats 3-4, crash on the way back. Listen, then press "You play".',
          },
          bpm: 88,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-forma-fill-exersat',
            stepsPerBar: 8,
            rows: withCrash(RIDE),
            extraBars: [RIDE, RIDE, { hhClosed: 'xxxx....', snare: '..x.xx..', tom: '......x.', floor: '.......x', kick: 'x.......' }],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'partile-piesei',
    stage: 'form',
    title: { ro: 'Intro, strofă, refren', en: 'Intro, verse, chorus' },
    goal: {
      ro: 'Știi ce cântă toba în fiecare parte a unei piese.',
      en: 'Know what the drums play in each part of a song.',
    },
    sections: [
      {
        id: 'strofa',
        heading: { ro: 'Strofa', en: 'The verse' },
        body: {
          ro: '**Strofa** e partea în care se schimbă textul. Toba ține groove-ul simplu, pe fus, ca să lase loc vocii.',
          en: 'The **verse** is the part where the lyrics change. The drums keep the groove simple, on the hi-hat, to leave room for the voice.',
        },
        example: {
          caption: { ro: 'Groove de strofă: fus, backbeat, toba mare doar pe 1.', en: 'A verse groove: hi-hat, backbeat, bass drum only on 1.' },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-strofa',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x.......' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Strofă (verse)', en: 'Verse' },
            meaning: {
              ro: 'Partea în care textul se schimbă de fiecare dată. Groove mai simplu.',
              en: 'The part where the lyrics change each time. A simpler groove.',
            },
          },
        ],
      },
      {
        id: 'refrenul',
        heading: { ro: 'Refrenul', en: 'The chorus' },
        body: {
          ro: '**Refrenul** se repetă la fel și e momentul cel mai plin. Toba crește: crash la intrare, ride în loc de fus, toba mare mai deasă.',
          en: 'The **chorus** repeats the same way and is the fullest moment. The drums grow: a crash on the way in, ride instead of hi-hat, a busier bass drum.',
        },
        example: {
          caption: { ro: 'Groove de refren: crash, ride, toba mare mai deasă.', en: 'A chorus groove: crash, ride, busier bass drum.' },
          bpm: 92,
          showKit: true,
          exercise: demoExercise({
            id: 'demo-forma-refren',
            stepsPerBar: 8,
            // Toba mare: 1, „doi-și”, 3 (pașii 0, 3, 4).
            rows: { crash: 'x.......', ride: '.xxxxxxx', snare: ROCK.snare, kick: 'x..xx...' },
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Refren (chorus)', en: 'Chorus' },
            meaning: {
              ro: 'Partea care se repetă la fel. Momentul cel mai plin al piesei.',
              en: 'The part that repeats unchanged. The fullest moment of the song.',
            },
          },
        ],
      },
      {
        id: 'intro-si-final',
        heading: { ro: 'Intro și final', en: 'Intro and ending' },
        body: {
          ro: 'Intro-ul pregătește piesa: poate fi doar fus, doar tobe sau un fill. Finalul se încheie de obicei cu crash și toba mare pe „unu”, toată trupa deodată.',
          en: 'The intro sets the song up: it can be just hi-hat, just drums, or a fill. The ending usually closes with crash and bass drum on one, the whole band together.',
        },
        example: {
          caption: {
            ro: 'O măsură de groove, apoi finalul: crash și toba mare pe „unu”.',
            en: 'One bar of groove, then the ending: crash and bass drum on one.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-final',
            stepsPerBar: 8,
            rows: ROCK,
            extraBars: [{ crash: 'x.......', kick: 'x.......' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'harta',
        heading: { ro: 'Piesa e o hartă', en: 'A song is a map' },
        body: {
          ro: 'Intro, strofă, refren, strofă, refren, uneori un **bridge**, final. Dacă știi unde ești pe hartă, știi ce să cânți și unde vine următorul fill.',
          en: 'Intro, verse, chorus, verse, chorus, sometimes a **bridge**, ending. If you know where you are on the map, you know what to play and where the next fill goes.',
        },
        terms: [
          {
            term: { ro: 'Bridge', en: 'Bridge' },
            meaning: {
              ro: 'O parte diferită, de obicei o singură dată, înaintea ultimului refren.',
              en: 'A contrasting section, usually played once, before the last chorus.',
            },
          },
        ],
      },
      {
        id: 'cresterea',
        heading: { ro: 'Drumul spre refren', en: 'The road into the chorus' },
        body: {
          ro: 'Între strofă și refren, toba poate construi tensiune într-o singură măsură: toba mică pe fiecare optime, din ce în ce mai tare, cu toba mare pe fiecare timp. Crash-ul de pe „unu” al refrenului descarcă tot ce s-a strâns.',
          en: 'Between verse and chorus, the drums can build tension in a single bar: the snare on every eighth, louder and louder, with the bass drum on every beat. The crash on the chorus’s one releases everything that built up.',
        },
        example: {
          caption: {
            ro: 'Strofa, o măsură de creștere pe toba mică, apoi refrenul cu crash.',
            en: 'The verse, a bar of build-up on the snare, then the chorus with a crash.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-crestere',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'x.......' },
            extraBars: [
              { snare: 'ooxxxxXX', kick: 'x.x.x.x.' },
              { crash: 'x.......', ride: '.xxxxxxx', snare: ROCK.snare, kick: 'x..xx...' },
            ],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'stops-si-intrari',
    stage: 'form',
    title: { ro: 'Stops, breaks, intrări', en: 'Stops, breaks, entries' },
    goal: {
      ro: 'Oprești trupa împreună, ții timpul în liniște și numeri intrarea.',
      en: 'Stop the band together, hold the time through silence, and count the band in.',
    },
    sections: [
      {
        id: 'stop',
        heading: { ro: 'Stop', en: 'The stop' },
        body: {
          ro: 'Un **stop**: toată trupa lovește odată, apoi tace. Timpul nu se oprește, doar sunetul. După stop, toată lumea intră din nou pe „unu”: numără pauza, nu aștepta să auzi pe altcineva.',
          en: 'A **stop**: the whole band hits once together, then goes silent. The time does not stop, only the sound. After the stop everyone comes back in on one: count the rest, do not wait to hear someone else.',
        },
        example: {
          caption: {
            ro: 'O măsură de groove, apoi stop: o lovitură pe „unu” și liniște.',
            en: 'One bar of groove, then a stop: one hit on one and silence.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-stop',
            stepsPerBar: 8,
            rows: POP,
            extraBars: [{ crash: 'x.......', snare: 'x.......', kick: 'x.......' }],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Stop', en: 'Stop' },
            meaning: {
              ro: 'Toată trupa lovește odată și tace, cât timp pulsul merge mai departe.',
              en: 'The whole band hits together and goes silent while the pulse carries on.',
            },
          },
        ],
      },
      {
        id: 'break',
        heading: { ro: 'Break', en: 'The break' },
        body: {
          ro: 'Un **break** e o măsură sau mai multe în care cântă un singur instrument și restul tac. Dacă break-ul e al tobei, cânți singur; dacă nu, ții timpul în cap și intri exact la capăt.',
          en: 'A **break** is one or more bars where a single instrument plays and the rest go quiet. If the break is the drums, you play alone; if not, you keep time in your head and come in exactly at the end.',
        },
      },
      {
        id: 'intrarea',
        heading: { ro: 'Numărătoarea', en: 'The count-in' },
        body: {
          ro: 'Toboșarul pornește piesa: patru lovituri pe fus, „unu, doi, trei, patru”, apoi prima măsură. Tempoul numărătorii e tempoul piesei, deci gândește-l înainte să începi.',
          en: 'The drummer starts the song: four strokes on the hi-hat, "one, two, three, four", then the first bar. The count-in tempo is the song tempo, so settle it before you start.',
        },
        example: {
          caption: {
            ro: 'Patru pătrimi pe fus, apoi crash și groove.',
            en: 'Four quarter notes on the hi-hat, then a crash and the groove.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-numaratoare',
            stepsPerBar: 8,
            rows: { hhClosed: 'x.x.x.x.' },
            extraBars: [withCrash(DISCO)],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'exerseaza-stop',
        heading: { ro: 'Exersează: numără liniștea', en: 'Practise: count the silence' },
        body: {
          ro: 'Groove, stop pe „unu”, o măsură de liniște, apoi intrarea cu crash. Clicul merge mai departe prin liniște: numără-l cu voce tare. Greșeala tipică e intrarea grăbită, fiindcă liniștea pare mai lungă decât e.',
          en: 'Groove, a stop on one, a bar of silence, then the entry with a crash. The click carries on through the silence: count it out loud. The typical slip is a rushed entry, because silence feels longer than it is.',
        },
        example: {
          caption: {
            ro: 'O măsură de groove, stop, apoi intrarea pe „unu”. Ascultă, apoi apasă „Cânți tu”.',
            en: 'One bar of groove, a stop, then the entry on one. Listen, then press "You play".',
          },
          bpm: 92,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-forma-stop-exersat',
            stepsPerBar: 8,
            rows: PUSH,
            extraBars: [{ crash: 'x.......', snare: 'x.......', kick: 'x.......' }, withCrash(PUSH)],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'break-de-tobe',
        heading: { ro: 'Când break-ul e al tău', en: 'When the break is yours' },
        body: {
          ro: 'Într-un break de tobe, trupa tace și tu cânți singur, de obicei o măsură sau două. Nu e un solo liber: are lungimea măsurilor pe care le înlocuiește, iar trupa reintră pe „unu” după el, pe încrederea că l-ai numărat.',
          en: 'In a drum break the band stops and you play alone, usually for a bar or two. It is not a free solo: it has the length of the bars it replaces, and the band comes back in on one after it, trusting that you counted.',
        },
        example: {
          caption: {
            ro: 'Două măsuri de groove, o măsură de break pe tomuri, apoi crash și groove.',
            en: 'Two bars of groove, one bar of break on the toms, then a crash and the groove.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-break',
            stepsPerBar: 8,
            rows: HALF,
            extraBars: [
              HALF,
              { snare: 'x.x.....', tom: '.x..xx..', floor: '...x..xx', kick: 'x...x...' },
              withCrash(HALF),
            ],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'unde-e-unu',
    stage: 'form',
    title: { ro: 'Unde e „unu”', en: 'Where beat one is' },
    goal: {
      ro: 'Găsești „unu”-l într-o piesă și nu-l mai pierzi.',
      en: 'Find beat one in a song and never lose it.',
    },
    sections: [
      {
        id: 'unu-e-tare',
        heading: { ro: '„Unu” e reperul', en: 'One is the landmark' },
        body: {
          ro: '„Unu” e timpul cel mai tare: acolo cade toba mare și crash-ul, acolo începe măsura. Dacă îl pierzi, totul sună deplasat, chiar dacă ritmul e corect.',
          en: 'One is the strongest beat: that is where the bass drum and the crash land, where the bar begins. Lose it and everything sounds shifted, even if the rhythm is right.',
        },
        example: {
          caption: { ro: 'Toba mare accentuată pe „unu”.', en: 'The bass drum accented on one.' },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-unu',
            stepsPerBar: 8,
            rows: { hhClosed: ROCK.hhClosed, snare: ROCK.snare, kick: 'X...x...' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'dupa-backbeat',
        heading: { ro: 'Îl găsești după backbeat', en: 'Find it from the backbeat' },
        body: {
          ro: 'Când intri peste o piesă, caută toba mică: e pe 2 și 4. Timpul dinaintea primei lovituri de tobă mică e „unu”. Crash-ul de la început de frază confirmă.',
          en: 'When you join a song, listen for the snare: it is on 2 and 4. The beat before the first snare hit is one. The crash at the start of a phrase confirms it.',
        },
      },
      {
        id: 'anacruza',
        heading: { ro: 'Piese care încep înainte de „unu”', en: 'Songs that start before one' },
        body: {
          ro: 'Unele piese încep cu câteva lovituri înaintea primei măsuri: o **anacruză**. „Unu” e unde intră toată trupa, nu unde ai lovit tu prima dată.',
          en: 'Some songs start with a few strokes before the first bar: a **pickup**. One is where the whole band comes in, not where you struck first.',
        },
        example: {
          caption: {
            ro: 'Două lovituri de tobă mică pe „patru” și „patru-și”, apoi crash pe „unu”.',
            en: 'Two snare strokes on four and the "and" of four, then a crash on one.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-forma-anacruza',
            stepsPerBar: 8,
            // Pașii 6 și 7 = „patru” și „patru-și”.
            rows: { snare: '......xx' },
            extraBars: [withCrash(RIDE)],
            tempo: GROOVE,
          }),
        },
        terms: [
          {
            term: { ro: 'Anacruză (pickup)', en: 'Pickup' },
            meaning: {
              ro: 'Notele de dinaintea primei măsuri întregi. Nu sunt „unu”.',
              en: 'The notes before the first full bar. They are not beat one.',
            },
          },
        ],
      },
      {
        id: 'cand-toba-mare-lipseste',
        heading: { ro: 'Când toba mare lipsește de pe „unu”', en: 'When the bass drum skips one' },
        body: {
          ro: 'În funk și în reggae, toba mare nu cade mereu pe „unu”. Atunci nu te baza pe ea: caută backbeat-ul pe 2 și 4 și accentul fusului pe timpi. „Unu” e acolo chiar dacă nimic nu-l lovește tare.',
          en: 'In funk and reggae the bass drum does not always land on one. Then do not rely on it: look for the backbeat on 2 and 4 and the hi-hat accent on the beats. One is there even when nothing hits it hard.',
        },
        example: {
          caption: {
            ro: 'Toba mare doar pe contratimpi; „unu”-l îl ține accentul fusului.',
            en: 'The bass drum only on off-beats; the hi-hat accent holds beat one.',
          },
          bpm: 88,
          exercise: demoExercise({
            id: 'demo-forma-fara-unu',
            // Toba mare pe pașii 1, 5, 7: „unu-și”, „trei-și”, „patru-și”.
            stepsPerBar: 8,
            rows: { hhClosed: 'XxXxXxXx', snare: ROCK.snare, kick: '.x...x.x' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'exerseaza-unu',
        heading: { ro: 'Exersează: clicul doar pe „unu”', en: 'Practise: the click on one only' },
        body: {
          ro: 'Cu clicul doar pe „unu”, restul timpilor îi ții tu. E testul cel mai simplu că știi unde ești: dacă după patru măsuri lovitura ta de pe „unu” nu se suprapune cu clicul, te-ai mutat pe drum.',
          en: 'With the click on one only, you hold the other beats yourself. It is the simplest test that you know where you are: if after four bars your stroke on one does not land with the click, you drifted on the way.',
        },
        example: {
          caption: {
            ro: 'Clicul doar pe „unu”, patru măsuri de groove. Ascultă, apoi apasă „Cânți tu”.',
            en: 'The click on one only, four bars of groove. Listen, then press "You play".',
          },
          bpm: 84,
          click: [[1]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-forma-unu-exersat',
            stepsPerBar: 8,
            rows: withCrash(POP),
            extraBars: [POP, POP, POP],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },
]
