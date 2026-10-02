import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { BassLine } from '../../bass'
import { demoExercise } from '../bars'
import type { DrumTheoryLesson } from '../types'

/*
  Etapa 7, Muzician, nu doar toboșar.

  Cinci lecții: basistul, dinamica în aranjament, clicul, chart-ul și
  transcrierea. Etapa e mai mult despre ascultare decât despre tehnică, deci
  partea practică e tot ascultare: „Cânți tu” oprește tobele și lasă clicul și
  basul, chart-ul se urmărește măsură cu măsură, iar la transcriere portativul
  stă ascuns până scrii ce ai auzit. Portativ, nu grilă: transcrierea se scrie
  pe partitură, iar la etapa asta elevul o citește de mult (Etapa 1).
*/

const GROOVE = { min: 50, max: 140, suggested: 92 }

/*
  Linia de bas a lecției „Tu și basistul”, pe șaisprezecimi.

  Luată dintr-un MIDI transcris după o buclă funk de bas și tobe, la 90 BPM, în
  domeniul public (CC0): „Give it LOOP BASS & DRUMS 90 BPM” de johntrap,
  Freesound 614195. Fișierul și proveniența stau în `assets/bass/`.

  MIDI-ul e scos din audio, deci nu e pe grilă: notele cad cu câteva milisecunde
  pe lângă pas, iar a doua trecere e scurtată de detecție. Aici e cuantizat pe
  prima și a treia trecere, care se potrivesc între ele: Re ținut pe „unu”, Fa
  pe „doi” și pe „doi-și”, apoi coborârea cromatică Re, Do♯, Do, Do♯ înapoi spre
  Re-ul de pe „unu”. Primul Fa e detectat pe „doi-e”, o șaisprezecime după timp;
  e pus pe „doi” intenționat, ca să se citească și să se cânte mai ușor.
*/
export const SELEKT_BASS: BassLine = {
  bars: [
    [
      { step: 0, length: 4, pitch: 38 },
      { step: 4, length: 1, pitch: 41 },
      { step: 6, length: 1, pitch: 41 },
      { step: 8, length: 1, pitch: 38 },
      { step: 10, length: 1, pitch: 37 },
      { step: 12, length: 1, pitch: 36 },
      { step: 14, length: 1, pitch: 37 },
    ],
  ],
}
const BASS_TEMPO = { min: 60, max: 120, suggested: 90 }

/** O linie de bas de rock: La grav pe toate optimile, ca un motor. */
export const EIGHTHS_BASS: BassLine = {
  bars: [Array.from({ length: 8 }, (_, step) => ({ step, length: 1, pitch: 33 }))],
}

/*
  Liniile de bas scrise aici, sintetizate sub tobe (`bass.ts`). Fiecare arată
  ALTĂ relație între bas și toba mare, nu aceeași linie cu alt ritm:

  BOOGIE         shuffle de blues: basul merge, toba mare stă pe 1 și 3.
  DISCO_OCTAVES  disco: toba mare cu nota de jos, fusul deschis cu octava.
  ONE_DROP       reggae: „unu” gol pentru amândoi, toba mare pe 3.
  TUMBAO         latin: basul anticipă pe „doi-și” și pe 4, toba mare la fel.
  LONG_808       hip-hop: note lungi, toba mare marchează începutul fiecăreia.

  Note: 28 = Mi grav (E1), 33 = La (A1), 40 = Mi (E2), 43 = Sol (G2).
*/
const note = (step: number, length: number, pitch: number) => ({ step, length, pitch })

/** Boogie pe Mi, pe triolete: 1-3-5-6 al acordului, lung-scurt pe fiecare timp. */
export const BOOGIE_BASS: BassLine = {
  bars: [[note(0, 2, 40), note(2, 1, 40), note(3, 2, 44), note(5, 1, 44), note(6, 2, 47), note(8, 1, 47), note(9, 2, 49), note(11, 1, 47)]],
}

/** Octavele de disco: jos pe timp, sus pe „și”. Mi, apoi La. */
export const DISCO_OCTAVES_BASS: BassLine = {
  bars: [[note(0, 1, 40), note(1, 1, 52), note(2, 1, 40), note(3, 1, 52), note(4, 1, 45), note(5, 1, 57), note(6, 1, 45), note(7, 1, 57)]],
}

/** Reggae one drop pe Sol: nimic pe „unu”, linia pornește pe „unu-și”. */
export const ONE_DROP_BASS: BassLine = {
  bars: [[note(2, 2, 43), note(4, 1, 47), note(6, 2, 50), note(10, 1, 48), note(12, 2, 47), note(14, 2, 45)]],
}

/** Tumbao pe Do: anticipat, pe „doi-și” și pe 4, ținut peste bară. */
export const TUMBAO_BASS: BassLine = {
  bars: [[note(6, 6, 36), note(12, 4, 43)]],
}

/** Note lungi, joase, de hip-hop, pe Fa: fiecare pornește odată cu toba mare. */
export const LONG_808_BASS: BassLine = {
  bars: [[note(0, 6, 29), note(7, 3, 29), note(10, 4, 32), note(14, 2, 36)]],
}

const BACKBEAT = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' }
/*
  Alte groove-uri de fundal, ca exercițiile de clic, chart și transcriere să nu
  fie toate peste același rock pe 1 și 3.
*/
const POP_332 = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x..x.' }
const RIDE_GROOVE = { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x..x.x..' }
const DISCO_GROOVE = { hhClosed: 'x.x.x.x.', hhOpen: '.x.x.x.x', snare: '..x...x.', kick: 'x.x.x.x.' }
const PUSH_GROOVE = { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' }
const HALF_TIME = { hhClosed: 'xxxxxxxx', snare: '....x...', kick: 'x.....x.' }
const TRIPLET_TEMPO = { min: 50, max: 120, suggested: 80 }
const CHORUS = { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x..xx...' }
const CHART_TEMPO = { min: 70, max: 130, suggested: 100 }

export const musicianLessons: DrumTheoryLesson<LocalizedText>[] = [
  {
    id: 'basistul',
    stage: 'musician',
    title: { ro: 'Tu și basistul', en: 'You and the bass player' },
    goal: {
      ro: 'Legi toba mare de linia de bas.',
      en: 'Lock the bass drum to the bass line.',
    },
    sections: [
      {
        id: 'un-singur-instrument',
        heading: { ro: 'Un singur instrument', en: 'One instrument' },
        body: {
          ro: 'Toba mare și basul sună ca un singur instrument când cad împreună. Ascultă linia de bas și pune toba mare pe aceleași note: dacă el sincopează, sincopezi și tu.',
          en: 'Bass drum and bass sound like one instrument when they land together. Listen to the bass line and put the bass drum on the same notes: if it syncopates, so do you.',
        },
        example: {
          caption: {
            ro: 'Basul cântă Re pe „unu”, Fa pe „doi” și „doi-și”, Re pe „trei”, iar Do♯ pe „patru-și” îl duce înapoi spre „unu”. Toba mare cade pe aceleași patru note.',
            en: 'The bass plays D on "one", F on "two" and the "and" of 2, D on "three", and the C♯ on the "and" of 4 leads back to "one". The bass drum lands on those same four notes.',
          },
          bpm: 90,
          bass: SELEKT_BASS,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-basist',
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '....x.......x...',
              kick: 'x.....x.x.....x.',
            },
            tempo: BASS_TEMPO,
          }),
        },
      },
      {
        id: 'mai-putin',
        heading: { ro: 'Când nu știi, cântă mai puțin', en: 'When in doubt, play less' },
        body: {
          ro: 'Dacă nu auzi ce face basul, toba mare pe 1 și 3 nu încurcă niciodată. Mai bine o notă lipsă decât una peste a lui.',
          en: 'If you cannot hear what the bass is doing, a bass drum on 1 and 3 never gets in the way. Better a missing note than one on top of his.',
        },
        example: {
          caption: {
            ro: 'Un boogie de blues: basul merge notă după notă, pe shuffle. Toba mare nu-l urmărește, stă pe 1 și 3, și nimic nu se bate cap în cap.',
            en: 'A blues boogie: the bass walks note by note, on a shuffle. The bass drum does not chase it, it stays on 1 and 3, and nothing clashes.',
          },
          bpm: 84,
          bass: BOOGIE_BASS,
          exercise: demoExercise({
            id: 'demo-muz-basist-simplu',
            // 12 pași: shuffle pe fus, toba mare pe 0 și 6 (timpii 1 și 3).
            stepsPerBar: 12,
            rows: { hhClosed: 'x.xx.xx.xx.x', snare: '...x.....x..', kick: 'x.....x.....' },
            tempo: TRIPLET_TEMPO,
          }),
        },
      },
      {
        id: 'basul-pe-optimi',
        heading: { ro: 'Când basul cântă egal', en: 'When the bass plays straight' },
        body: {
          ro: 'Nu orice linie de bas cere sincope. Când basul cântă optimi egale, ca un motor, toba mare nu-l dublează: stă pe 1 și 3 și îl lasă să curgă. Două instrumente care bat aceleași optimi se acoperă unul pe altul.',
          en: 'Not every bass line calls for syncopation. When the bass plays even eighths, like an engine, the bass drum does not double it: it sits on 1 and 3 and lets it flow. Two instruments hammering the same eighths cover each other.',
        },
        example: {
          caption: {
            ro: 'Basul pe toate optimile, toba mare doar pe 1 și 3.',
            en: 'The bass on every eighth, the bass drum only on 1 and 3.',
          },
          bpm: 100,
          bass: EIGHTHS_BASS,
          exercise: demoExercise({
            id: 'demo-muz-bas-optimi',
            stepsPerBar: 8,
            rows: BACKBEAT,
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'basul-in-octave',
        heading: { ro: 'Disco: își împart timpul', en: 'Disco: they share the time' },
        body: {
          ro: 'La disco, basul sare între două octave: nota de jos pe timp, cea de sus pe „și”. Toba mare cade cu nota de jos, pe toți patru timpii, iar fusul deschis cu nota de sus. Nu se dublează: își împart optimile între ei, jos-sus, jos-sus.',
          en: 'In disco the bass jumps between two octaves: the low note on the beat, the high one on the "and". The bass drum lands with the low note, on all four beats, and the open hi-hat with the high one. They do not double each other: they split the eighths between them, low-high, low-high.',
        },
        example: {
          caption: {
            ro: 'Basul în octave pe Mi și La; toba mare pe fiecare timp, fusul deschis pe fiecare „și”.',
            en: 'The bass in octaves on E and A; bass drum on every beat, open hi-hat on every "and".',
          },
          bpm: 112,
          bass: DISCO_OCTAVES_BASS,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-bas-disco',
            stepsPerBar: 8,
            rows: { hhClosed: 'x.x.x.x.', hhOpen: '.x.x.x.x', snare: '..x...x.', kick: 'x.x.x.x.' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'one-drop',
        heading: { ro: 'Reggae: „unu” lăsat gol', en: 'Reggae: one left empty' },
        body: {
          ro: 'În reggae-ul **one drop**, „unu” e gol: nici basul, nici toba mare nu cad pe el. Toba mare cade abia pe 3, odată cu lovitura pe ramă, iar basul pornește după „unu” și se plimbă în jur. Pentru un toboșar de rock e greu: piciorul vrea „unu”-l. Lasă-l gol.',
          en: 'In **one drop** reggae, one is empty: neither the bass nor the bass drum lands on it. The bass drum comes only on 3, with the rim click, and the bass starts after one and wanders around it. For a rock drummer it is hard: the foot wants beat one. Leave it empty.',
        },
        example: {
          caption: {
            ro: 'Basul pornește pe „unu-și”; toba mare și lovitura pe ramă doar pe 3.',
            en: 'The bass starts on the "and" of 1; bass drum and rim click only on 3.',
          },
          bpm: 76,
          bass: ONE_DROP_BASS,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-bas-one-drop',
            // 16 pași: toba mare și rama pe pasul 8 (timpul 3), nimic pe 0.
            stepsPerBar: 16,
            rows: { hhClosed: 'x.x.x.x.x.x.x.x.', rimClick: '........x.......', kick: '........x.......' },
            tempo: BASS_TEMPO,
          }),
        },
        terms: [
          {
            term: { ro: 'One drop', en: 'One drop' },
            meaning: {
              ro: 'Groove-ul de reggae în care „unu” e gol, iar toba mare și toba mică (sau rama) cad împreună pe 3.',
              en: 'The reggae groove where one is left empty, and bass drum and snare (or rim) land together on 3.',
            },
          },
        ],
      },
      {
        id: 'basul-anticipat',
        heading: { ro: 'Latin: basul vine înainte', en: 'Latin: the bass comes early' },
        body: {
          ro: 'În salsa, basul cântă **tumbao**: nu cade pe „unu”, ci înainte de timpi, pe „doi-și” și pe 4, și ține nota peste bară. Toba mare îl prinde exact acolo, pe aceleași două lovituri, iar talanga ține timpii deasupra. Aici legătura cu basul nu e pe „unu”, e pe anticipări.',
          en: 'In salsa the bass plays **tumbao**: it does not land on one, but ahead of the beats, on the "and" of 2 and on 4, holding the note across the bar line. The bass drum catches it right there, on the same two strokes, while the cowbell keeps the beats on top. Here the link with the bass is not on one, it is on the anticipations.',
        },
        example: {
          caption: {
            ro: 'Basul pe „doi-și” și pe 4; toba mare la fel; talanga pe timpi, clave-ul pe ramă.',
            en: 'The bass on the "and" of 2 and on 4; the bass drum the same; cowbell on the beats, the clave on the rim.',
          },
          bpm: 92,
          bass: TUMBAO_BASS,
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-bas-tumbao',
            // 16 pași: toba mare pe 6 și 12 (bombo și ponche); clave 3 pe 0, 6, 12.
            stepsPerBar: 16,
            rows: { cowbell: 'x...x...x...x...', rimClick: 'x.....x.....x...', kick: '......x.....x...' },
            tempo: BASS_TEMPO,
          }),
        },
        terms: [
          {
            term: { ro: 'Tumbao', en: 'Tumbao' },
            meaning: {
              ro: 'Linia de bas din salsa, care anticipă timpii: pe „doi-și” și pe 4, ținută peste bară.',
              en: 'The salsa bass line that anticipates the beats: on the "and" of 2 and on 4, held across the bar line.',
            },
          },
        ],
      },
      {
        id: 'gaseste-toba-mare',
        heading: { ro: 'Exersează: găsește toba mare după bas', en: 'Practise: find the bass drum from the bass' },
        body: {
          ro: 'O linie de hip-hop, cu note lungi și joase. Apasă „Cânți tu”, ascultă doar basul și clicul și pune toba mare pe începutul fiecărei note: acolo pornește sunetul, iar toba mare îi dă atacul pe care basul lung nu-l are. Abia apoi arată notația și compară.',
          en: 'A hip-hop line, with long, low notes. Press "You play", listen only to the bass and the click, and put the bass drum on the start of every note: that is where the sound begins, and the bass drum gives it the attack a long bass note lacks. Only then show the notation and compare.',
        },
        example: {
          caption: {
            ro: 'Basul lung pe Fa; toba mare e ascunsă până o arăți.',
            en: 'The long bass on F; the bass drum is hidden until you show it.',
          },
          bpm: 80,
          bass: LONG_808_BASS,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          reveal: true,
          exercise: demoExercise({
            id: 'demo-muz-gaseste-mare',
            // Toba mare pe 0, 7, 10, 14: exact începuturile notelor de bas. Toba mică doar pe 3.
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '........x.......',
              kick: 'x......x..x...x.',
            },
            tempo: BASS_TEMPO,
          }),
        },
      },
      {
        id: 'cand-basul-tace',
        heading: { ro: 'Când basul tace', en: 'When the bass drops out' },
        body: {
          ro: 'La un intro sau la un break, basul uneori tace. Atunci toba mare duce singură partea de jos, dar nu umple golul cu tot ce cânta basul: păstrează doar loviturile de pe timpii tari, ca trupa să nu piardă „unu”-l. Când basul revine, revii și tu la notele lui.',
          en: 'In an intro or a break, the bass sometimes drops out. Then the bass drum carries the low end alone, but it does not fill the gap with everything the bass was playing: keep only the strokes on the strong beats, so the band does not lose beat one. When the bass comes back, so do you, to its notes.',
        },
      },
    ],
  },

  {
    id: 'dinamica-in-aranjament',
    stage: 'musician',
    title: { ro: 'Dinamica în aranjament', en: 'Dynamics in the arrangement' },
    goal: {
      ro: 'Construiești piesa: încet unde trebuie, tare unde trebuie.',
      en: 'Build the song: soft where it should be, loud where it should be.',
    },
    sections: [
      {
        id: 'creste',
        heading: { ro: 'Piesa crește', en: 'The song grows' },
        body: {
          ro: 'Strofa e mai încet, refrenul mai tare. Toba e cea care duce trupa dintr-una în alta: mai puține note și lovituri mici, apoi accente, crash și ride.',
          en: 'The verse is softer, the chorus louder. The drums carry the band from one to the other: fewer notes and small strokes, then accents, crash and ride.',
        },
        example: {
          caption: {
            ro: 'O măsură de strofă, încet; apoi refrenul, cu accente.',
            en: 'One bar of verse, soft; then the chorus, with accents.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-muz-dinamica',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x.......' },
            extraBars: [{ crash: 'X.......', ride: '.xXxXxXx', snare: '..X...X.', kick: 'X..XX...' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'nu-prea-devreme',
        heading: { ro: 'Nu ajunge la maxim prea devreme', en: 'Do not peak too early' },
        body: {
          ro: 'Dacă primul refren e cât de tare poți, finalul n-are unde să crească. Păstrează ceva pentru ultimul refren.',
          en: 'If the first chorus is as loud as you can go, the ending has nowhere to grow. Save something for the last chorus.',
        },
      },
      {
        id: 'strofa-jos',
        heading: { ro: 'Strofa, ținută jos', en: 'The verse, kept down' },
        body: {
          ro: 'Ca refrenul să sune mare, strofa trebuie să fie mică. Cross-stick în locul tobei mici, fusul abia atins, toba mare rară: lași loc vocii. Ascultă diferența dintre o măsură de strofă așa și una de refren.',
          en: 'For the chorus to sound big, the verse has to be small. Cross-stick instead of the snare, a barely-touched hi-hat, a sparse bass drum: you leave room for the vocal. Hear the difference between a verse bar like this and a chorus bar.',
        },
        example: {
          caption: {
            ro: 'Strofa: cross-stick, fus încet. Refrenul: crash, ride, toba mică plină.',
            en: 'The verse: cross-stick, soft hi-hat. The chorus: crash, ride, full snare.',
          },
          bpm: 92,
          exercise: demoExercise({
            id: 'demo-muz-strofa-jos',
            stepsPerBar: 8,
            rows: { hhClosed: 'oooooooo', crossStick: '..x...x.', kick: 'x.......' },
            extraBars: [{ ...CHORUS, crash: 'X.......', ride: '.xxxxxxx' }],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'crestere-pe-patru',
        heading: { ro: 'Exersează: o creștere pe patru măsuri', en: 'Practise: a build over four bars' },
        body: {
          ro: 'Patru măsuri, fiecare puțin mai plină decât cea de dinainte: fusul încet, apoi fusul normal, apoi toba mare mai deasă, apoi ride-ul. Clicul nu se schimbă. Greșeala tipică: tempoul crește odată cu volumul.',
          en: 'Four bars, each a little fuller than the last: soft hi-hat, then normal hi-hat, then a busier bass drum, then the ride. The click does not change. The typical slip: the tempo rises along with the volume.',
        },
        example: {
          caption: {
            ro: 'Patru măsuri care cresc, fără să grăbească. Ascultă, apoi apasă „Cânți tu”.',
            en: 'Four bars that build, without rushing. Listen, then press "You play".',
          },
          bpm: 92,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-crestere',
            stepsPerBar: 8,
            rows: { hhClosed: 'oooooooo', snare: '..x...x.', kick: 'x.......' },
            extraBars: [
              { hhClosed: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' },
              { hhClosed: 'XxXxXxXx', snare: '..X...X.', kick: 'x..xx...' },
              { ride: 'XxXxXxXx', snare: '..X...X.', kick: 'x..xx..x' },
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'asculta-vocea',
        heading: { ro: 'Ascultă vocea, nu tobele', en: 'Listen to the vocal, not the drums' },
        body: {
          ro: 'Volumul potrivit nu se găsește uitându-te la tobe, ci ascultând vocea. Dacă n-o mai auzi limpede, cânți prea tare, oricât de bine ar suna setul. Într-o sală mică, chiar și refrenul se cântă cu o treaptă sub cât poți.',
          en: 'The right volume is not found by looking at the drums, but by listening to the vocal. If you cannot hear it clearly any more, you are too loud, however good the kit sounds. In a small room, even the chorus is played a notch below what you can.',
        },
      },
    ],
  },

  {
    id: 'clicul',
    stage: 'musician',
    title: { ro: 'Cântatul cu clic', en: 'Playing with a click' },
    goal: {
      ro: 'Cânți cu metronomul fără să te lupți cu el.',
      en: 'Play with the metronome without fighting it.',
    },
    sections: [
      {
        id: 'clicul-te-arata',
        heading: { ro: 'Clicul îți arată unde ești', en: 'The click shows you where you are' },
        body: {
          ro: 'Clicul nu te încurcă, îți arată unde ești. Începe cu el pe fiecare timp, apoi doar pe 2 și 4, apoi o dată pe măsură: cu cât bate mai rar, cu atât ții tu mai mult timpul.',
          en: 'The click does not throw you off, it shows you where you are. Start with it on every beat, then only on 2 and 4, then once a bar: the less it plays, the more of the time you hold.',
        },
        example: {
          caption: {
            ro: 'Patru măsuri: clicul pe fiecare timp, apoi doar pe 2 și 4, apoi doar pe „unu”, de două ori. Ascultă o dată, apoi apasă „Cânți tu” și ține tu groove-ul cât clicul se rărește.',
            en: 'Four bars: the click on every beat, then only on 2 and 4, then only on "one", twice. Listen once, then press "You play" and hold the groove yourself while the click thins out.',
          },
          bpm: 80,
          click: [[1, 2, 3, 4], [2, 4], [1], [1]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-clic-rar',
            stepsPerBar: 8,
            rows: POP_332,
            extraBars: [POP_332, POP_332, POP_332],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'ingroapa-clicul',
        heading: { ro: 'Îngroapă clicul', en: 'Bury the click' },
        body: {
          ro: 'Când lovești exact pe clic, el dispare sub lovitura ta. Dacă îl auzi separat, ești înainte sau în urmă.',
          en: 'When you hit exactly on the click, it disappears under your stroke. If you hear it separately, you are ahead or behind.',
        },
        example: {
          caption: {
            ro: 'Toba mare și toba mică cad fix pe clic, așa că aproape nu-l mai auzi. Apasă „Cânți tu” și bate pătrimi pe toba mică până când clicul dispare și sub loviturile tale.',
            en: 'Bass drum and snare land right on the click, so you can barely hear it. Press "You play" and play quarter notes on the snare until the click disappears under your strokes too.',
          },
          bpm: 72,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-clic-ingropat',
            stepsPerBar: 4,
            rows: { hhClosed: 'xxxx', snare: '.x.x', kick: 'x.x.' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'tempo-mic',
        heading: { ro: 'La tempo mic e mai greu', en: 'Slow is harder' },
        body: {
          ro: 'Paradoxul clicului: o baladă la 60 e mai greu de ținut decât un rock la 120, fiindcă între clicuri e mult spațiu în care te poți pierde. Umple spațiul în cap: numără optimile, „unu-și-doi-și”, chiar dacă nu le cânți.',
          en: 'The click paradox: a ballad at 60 is harder to hold than rock at 120, because there is so much space between clicks to get lost in. Fill the space in your head: count the eighths, "one-and-two-and", even if you do not play them.',
        },
        example: {
          caption: {
            ro: 'O baladă la 60, cu cross-stick și clicul pe fiecare timp. Ascultă, apoi apasă „Cânți tu”.',
            en: 'A ballad at 60, with cross-stick and the click on every beat. Listen, then press "You play".',
          },
          bpm: 60,
          click: [[1, 2, 3, 4]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-clic-lent',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxxx', crossStick: '..x...x.', kick: 'x...x...' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'greseli-cu-clicul',
        heading: { ro: 'Unde fuge timpul', en: 'Where the time runs away' },
        body: {
          ro: 'Cu clicul, greșelile ies mereu în aceleași locuri: grăbești la fill-uri și la părțile tari, încetinești la cele încete. Când le știi, le aștepți. Și nu urmări clicul: dacă aștepți să-l auzi ca să lovești, ești deja în urmă. Cântă cu el, nu după el.',
          en: 'With a click, mistakes always surface in the same places: you rush the fills and the loud parts, you drag the quiet ones. Once you know them, you expect them. And do not chase the click: if you wait to hear it before striking, you are already late. Play with it, not after it.',
        },
      },
      {
        id: 'clic-pe-unu',
        heading: { ro: 'Ultima treaptă: o dată pe măsură', en: 'The last step: once a bar' },
        body: {
          ro: 'Când clicul bate doar pe „unu”, tu ții celelalte trei timpi. E ultima treaptă din metodă și cea mai apropiată de o trupă adevărată, unde nimeni nu-ți bate timpul. Dacă după patru măsuri „unu”-l tău cade pe clic, timpul e al tău.',
          en: 'When the click marks only one, you hold the other three beats. It is the last step of the method and the closest to a real band, where nobody keeps time for you. If after four bars your one lands on the click, the time is yours.',
        },
        example: {
          caption: {
            ro: 'Clicul doar pe „unu”, patru măsuri. Ascultă, apoi apasă „Cânți tu”.',
            en: 'The click on one only, four bars. Listen, then press "You play".',
          },
          bpm: 90,
          click: [[1]],
          playAlong: true,
          exercise: demoExercise({
            id: 'demo-muz-clic-unu',
            stepsPerBar: 8,
            rows: RIDE_GROOVE,
            extraBars: [RIDE_GROOVE, RIDE_GROOVE, RIDE_GROOVE],
            tempo: GROOVE,
          }),
        },
      },
    ],
  },

  {
    id: 'chart-ul',
    stage: 'musician',
    title: { ro: 'Cum citești un chart', en: 'How to read a chart' },
    goal: {
      ro: 'Citești forma unei piese de pe un chart de tobe.',
      en: 'Read the form of a song from a drum chart.',
    },
    sections: [
      {
        id: 'chart-forma',
        heading: { ro: 'Chart-ul arată forma', en: 'A chart shows the form' },
        body: {
          ro: 'Un **chart** de tobe nu scrie fiecare notă. Arată părțile piesei, câte măsuri are fiecare și unde sunt stops și fill-uri. Barele oblice înseamnă „cântă groove-ul”.',
          en: 'A drum **chart** does not write out every note. It shows the parts of the song, how many bars each has, and where the stops and fills are. Slashes mean "play the groove".',
        },
        example: {
          caption: {
            ro: 'Un chart de opt măsuri: trei de strofă, un fill, trei de refren și loviturile trupei la final. Urmărește măsura aprinsă cât asculți, apoi apasă „Cânți tu” și cântă piesa citind doar chart-ul.',
            en: 'An eight-bar chart: three bars of verse, a fill, three bars of chorus and the band hits at the end. Follow the lit bar while you listen, then press "You play" and play the song reading only the chart.',
          },
          bpm: 100,
          showGrid: false,
          playAlong: true,
          chart: [
            { kind: 'groove', label: { ro: 'Strofă', en: 'Verse' } },
            { kind: 'groove' },
            { kind: 'groove' },
            { kind: 'fill' },
            { kind: 'groove', label: { ro: 'Refren', en: 'Chorus' } },
            { kind: 'groove' },
            { kind: 'groove' },
            { kind: 'hits', hits: 'x..x....' },
          ],
          exercise: demoExercise({
            id: 'demo-muz-chart',
            stepsPerBar: 8,
            rows: BACKBEAT,
            extraBars: [
              BACKBEAT,
              BACKBEAT,
              { hhClosed: 'xxxx....', snare: '..x.xx..', tom: '......x.', floor: '.......x', kick: 'x.......' },
              { ...CHORUS, crash: 'X.......', ride: '.xxxxxxx' },
              CHORUS,
              CHORUS,
              { crash: 'X..X....', kick: 'x..x....' },
            ],
            tempo: CHART_TEMPO,
          }),
        },
        terms: [
          {
            term: { ro: 'Chart', en: 'Chart' },
            meaning: {
              ro: 'Partitura scurtă a unei piese: forma, măsurile și loviturile importante, nu fiecare notă.',
              en: 'The short score of a song: the form, the bars and the important hits, not every note.',
            },
          },
        ],
      },
      {
        id: 'kicks',
        heading: { ro: 'Loviturile trupei', en: 'The band hits' },
        body: {
          ro: 'Notele scrise deasupra barelor sunt loviturile întregii trupe. Le prinzi cu crash și toba mare, iar în rest ții groove-ul.',
          en: 'Notes written above the slashes are the hits the whole band plays. You catch them with crash and bass drum, and keep the groove the rest of the time.',
        },
        example: {
          caption: {
            ro: 'O măsură de groove, apoi trei lovituri ale trupei: pe „unu”, pe „doi-și” și pe „patru”. Pe chart sunt doar trei semne; pe grilă vezi cum le prinzi: crash și toba mare deodată.',
            en: 'One bar of groove, then three band hits: on "one", the "and" of 2 and "four". The chart shows just three marks; the grid shows how you catch them: crash and bass drum together.',
          },
          bpm: 100,
          playAlong: true,
          chart: [{ kind: 'groove' }, { kind: 'hits', hits: 'x..x..x.' }],
          exercise: demoExercise({
            id: 'demo-muz-kicks',
            stepsPerBar: 8,
            rows: PUSH_GROOVE,
            extraBars: [{ crash: 'X..X..X.', kick: 'x..x..x.' }],
            tempo: CHART_TEMPO,
          }),
        },
      },
      {
        id: 'semne-de-repetitie',
        heading: { ro: 'Semnele care scurtează chart-ul', en: 'The signs that shorten a chart' },
        body: {
          ro: 'Un chart încape pe o pagină fiindcă nu scrie nimic de două ori. **Bara de repetiție** (două puncte lângă o bară dublă) spune „de la capăt”; **%** spune „repetă măsura de dinainte”; un **×4** deasupra spune de câte ori. **D.S.** te trimite înapoi la semnul **segno**, iar **Coda** (⊕) la final. Citește-le înainte să numeri.',
          en: 'A chart fits on one page because it writes nothing twice. The **repeat bar** (two dots by a double bar) means "from the top"; **%** means "repeat the previous bar"; a **×4** above says how many times. **D.S.** sends you back to the **segno** sign, and **Coda** (⊕) to the ending. Read them before you count.',
        },
        terms: [
          {
            term: { ro: 'Semn de repetiție (%)', en: 'Repeat sign (%)' },
            meaning: {
              ro: 'Repetă măsura de dinainte, exact la fel.',
              en: 'Repeat the previous bar, exactly the same.',
            },
          },
          {
            term: { ro: 'D.S. și Coda', en: 'D.S. and Coda' },
            meaning: {
              ro: 'D.S.: întoarce-te la semnul segno. Coda (⊕): sari la final când ajungi la semnul ei.',
              en: 'D.S.: go back to the segno sign. Coda (⊕): jump to the ending when you reach its sign.',
            },
          },
        ],
      },
      {
        id: 'chart-cu-stop',
        heading: { ro: 'Exersează: stop și fill pe chart', en: 'Practise: a stop and a fill on a chart' },
        body: {
          ro: 'Patru măsuri: două de groove, un stop pe „unu” (o singură lovitură scrisă, restul pauză), apoi un fill. Citește chart-ul, nu grila: pe chart nu scrie ce cânți în fill, doar că vine.',
          en: 'Four bars: two of groove, a stop on one (a single hit written, the rest a rest), then a fill. Read the chart, not the grid: the chart does not say what to play in the fill, only that it is coming.',
        },
        example: {
          caption: {
            ro: 'Groove, groove, stop, fill. Ascultă, apoi apasă „Cânți tu” și citește doar chart-ul.',
            en: 'Groove, groove, stop, fill. Listen, then press "You play" and read only the chart.',
          },
          bpm: 96,
          showGrid: false,
          playAlong: true,
          click: [[1, 2, 3, 4]],
          chart: [
            { kind: 'groove' },
            { kind: 'groove' },
            { kind: 'hits', hits: 'x.......' },
            { kind: 'fill' },
          ],
          exercise: demoExercise({
            id: 'demo-muz-chart-stop',
            stepsPerBar: 8,
            rows: DISCO_GROOVE,
            extraBars: [
              DISCO_GROOVE,
              { crash: 'X.......', kick: 'x.......' },
              { snare: 'xxxx....', tom: '....xx..', floor: '......xx', kick: 'x.......' },
            ],
            tempo: CHART_TEMPO,
          }),
        },
      },
      {
        id: 'citeste-inainte',
        heading: { ro: 'Citește cu o măsură înainte', en: 'Read one bar ahead' },
        body: {
          ro: 'Cine citește măsura pe care o cântă ajunge mereu prea târziu la loviturile trupei. Ochii stau cu o măsură înainte: cât cânți groove-ul, citești ce urmează. La început pare imposibil; după câteva charturi, e singurul fel în care se mai poate.',
          en: 'Whoever reads the bar they are playing always arrives too late for the band hits. Your eyes stay one bar ahead: while you play the groove, you read what comes next. At first it seems impossible; after a few charts, it is the only way that works.',
        },
      },
    ],
  },

  {
    id: 'transcrierea',
    stage: 'musician',
    title: { ro: 'Transcriere: cum asculți o piesă', en: 'Transcription: how to listen to a song' },
    goal: {
      ro: 'Scoți după ureche ce cântă toboșarul dintr-o piesă.',
      en: 'Work out by ear what the drummer plays on a record.',
    },
    sections: [
      {
        id: 'pe-rand',
        heading: { ro: 'O piesă o dată', en: 'One piece at a time' },
        body: {
          ro: 'Ascultă de mai multe ori, de fiecare dată după altă piesă: întâi toba mare și toba mică, apoi cinelele. Încearcă să-l scrii pe portativ, pe exemplul de mai jos, înainte să te uiți la notație.',
          en: 'Listen several times, following a different piece each time: first bass drum and snare, then the cymbals. Try writing the example below on the staff before you look at the notation.',
        },
        example: {
          caption: {
            ro: 'Ascultă, scrie pe portativ, apoi verifică. Întâi toba mare și toba mică, abia apoi cinelele.',
            en: 'Listen, write it on the staff, then check. Bass drum and snare first, the cymbals after.',
          },
          bpm: 88,
          showKit: true,
          showStaff: true,
          showGrid: false,
          reveal: true,
          exercise: demoExercise({
            id: 'demo-muz-transcriere',
            stepsPerBar: 8,
            rows: { hhClosed: 'xxxxxxx.', hhOpen: '.......x', snare: '..x...x.', kick: 'x..xx.x.' },
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'incet-si-pe-timpi',
        heading: { ro: 'Încet și pe timpi', en: 'Slowly, and by the beat' },
        body: {
          ro: 'Încetinește piesa dacă poți, numără cu voce tare și scrie pe timpi, nu notă cu notă. Ce poți rosti, poți scrie.',
          en: 'Slow the song down if you can, count out loud and write by the beat, not note by note. What you can say, you can write.',
        },
        example: {
          caption: {
            ro: 'Alt groove, cu toba mare pe șaisprezecimi. Coboară tempoul cu „−”, numără „1-e-și-a” și scrie timp cu timp. Apoi arată notația și verifică.',
            en: 'Another groove, with the bass drum on sixteenths. Bring the tempo down with "−", count "1-e-and-a" and write it beat by beat. Then show the notation and check.',
          },
          bpm: 76,
          showStaff: true,
          showGrid: false,
          reveal: true,
          exercise: demoExercise({
            id: 'demo-muz-transcriere-incet',
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '....x.......x...',
              kick: 'x.....x...x..x..',
            },
            tempo: { min: 50, max: 110, suggested: 76 },
          }),
        },
      },
      {
        id: 'transcrie-un-fill',
        heading: { ro: 'Transcrie un fill', en: 'Transcribe a fill' },
        body: {
          ro: 'Fill-urile sunt mai ușor de transcris decât par: ascultă întâi pe ce tobe cade, de sus în jos, apoi numără câte lovituri sunt pe fiecare timp. Aici: trei măsuri de groove și o măsură de fill. Scrie doar fill-ul.',
          en: 'Fills are easier to transcribe than they seem: first hear which drums it lands on, top to bottom, then count the strokes on each beat. Here: three bars of groove and one bar of fill. Write down only the fill.',
        },
        example: {
          caption: {
            ro: 'Scrie fill-ul pe portativ, apoi arată notația și verifică.',
            en: 'Write the fill on the staff, then show the notation and check.',
          },
          bpm: 84,
          showStaff: true,
          showGrid: false,
          reveal: true,
          exercise: demoExercise({
            id: 'demo-muz-transcrie-fill',
            stepsPerBar: 8,
            rows: HALF_TIME,
            extraBars: [
              HALF_TIME,
              HALF_TIME,
              { snare: 'xx......', tom: '..xx....', mid: '....xx..', floor: '......xx', kick: 'x.......' },
            ],
            tempo: GROOVE,
          }),
        },
      },
      {
        id: 'transcrie-ghost',
        heading: { ro: 'Notele care abia se aud', en: 'The notes you can barely hear' },
        body: {
          ro: 'Ghost notes sunt cel mai greu de transcris, fiindcă se simt mai mult decât se aud. Ascultă de mai multe ori doar toba mică și întreabă-te între ce și ce cade fiecare umbră. Coboară tempoul: la viteză mică, umbrele devin note.',
          en: 'Ghost notes are the hardest to transcribe, because they are felt more than heard. Listen several times to the snare alone and ask yourself what each shadow falls between. Bring the tempo down: slowed, the shadows become notes.',
        },
        example: {
          caption: {
            ro: 'Un groove de funk cu ghost notes. Scrie toba mică, apoi verifică.',
            en: 'A funk groove with ghost notes. Write the snare, then check.',
          },
          bpm: 72,
          showStaff: true,
          showGrid: false,
          reveal: true,
          exercise: demoExercise({
            id: 'demo-muz-transcrie-ghost',
            stepsPerBar: 16,
            rows: {
              hhClosed: 'x.x.x.x.x.x.x.x.',
              snare: '..o.x..o.o..x...',
              kick: 'x..x....x.......',
            },
            tempo: { min: 50, max: 110, suggested: 72 },
          }),
        },
      },
      {
        id: 'verifica-pe-set',
        heading: { ro: 'Verifică pe instrument', en: 'Check it on the instrument' },
        body: {
          ro: 'Ultimul pas al oricărei transcrieri: cântă ce ai scris peste înregistrare. Dacă se potrivește, ai terminat. Dacă undeva te împiedici, acolo e greșeala: de obicei o notă pusă pe „și” în loc de „a”, sau o lovitură de tobă mare scăpată sub un crash.',
          en: 'The last step of any transcription: play what you wrote along with the recording. If it fits, you are done. If you stumble somewhere, that is where the mistake is: usually a note put on the "and" instead of the "a", or a bass drum stroke lost under a crash.',
        },
      },
    ],
  },
]
