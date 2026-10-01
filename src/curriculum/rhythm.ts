import { rhythmTheme } from '../theme'
import {
  TICKS_PER_BAR,
  tokensToEvents,
  tokensToPattern,
  type RhythmToken,
} from '../game/notation-tokens'
import type { BeatGridCell } from '../components/notation'
import type { Category, Lesson } from './types'

/**
 * Exercitiile scrise ca notatie, nu ca sir de atacuri: asa durata fiecarei
 * note vine din acelasi loc ca simbolul desenat, si nu pot ajunge sa se
 * contrazica.
 */
/** Pattern-ul unui sir de tokeni, pentru exemplele ascultate. */
function buildSteps(tokens: RhythmToken[]) {
  return tokensToPattern(tokens)
}

/** Numarul de pasi dintr-o masura cu `beats` patrimi. */
const stepsPerBarOf = (beats: number) => (TICKS_PER_BAR / 4) * beats

/**
 * Masura de 6/8: sase optimi, adica doi timpi de patrime punctata. Nu iese din
 * `stepsPerBarOf`, fiindca acolo timpul e patrimea - aici e patrimea punctata.
 */
const sixEightBar = (TICKS_PER_BAR / 8) * 6

/**
 * Un flux de `count` note egale pe o masura. Poliritmul nu se poate scrie cu
 * tokenii nostri - 3 contra 4 nu are un simbol - dar pe grila de 48 iese
 * exact: 48 se imparte si la 2, si la 3, si la 4.
 */
function evenStream(count: number, bars = 1): boolean[] {
  const total = TICKS_PER_BAR * bars
  const spacing = TICKS_PER_BAR / count
  if (!Number.isInteger(spacing)) {
    throw new Error(`${count} note pe masura nu incap exact pe grila de ${TICKS_PER_BAR}`)
  }
  return Array.from({ length: total }, (_, step) => step % spacing === 0)
}

function practiceFromTokens(bars: RhythmToken[][]) {
  return {
    patterns: bars.map(tokensToPattern),
    patternDurations: bars.map((tokens) =>
      tokensToEvents(tokens).map((event) => event.durationSteps),
    ),
  }
}

/**
 * Curriculumul de ritm. Fiecare lectie urmeaza acelasi contract: se explica
 * un singur concept, se arata notatia alaturi de grila de durate, se asculta
 * un exemplu, apoi se exerseaza acelasi lucru la cinci tempo-uri diferite.
 *
 * Tempo-urile variaza deliberat: un elev care bate corect doar la 80 BPM nu a
 * inteles conceptul, ci a memorat o viteza.
 */

/** Pattern scris pe optimi: „x" = se canta, „-" = pauza. */
const eighths = (text: string) =>
  text
    .replace(/\s/g, '')
    .split('')
    .map((character) => character === 'x')

/** Pattern scris pe saisprezecimi, cu aceeasi conventie. */
const sixteenths = eighths

const pulse: Lesson = {
  id: 'puls',
  title: 'Pulsul',
  goal: 'Să simți bătaia regulată care stă sub orice piesă.',
  reference: [
    {
      term: 'Timp',
      meaning:
        'O singură bătaie a pulsului. Toți timpii vin la distanță egală.',
    },
    {
      term: 'Tempo (BPM)',
      meaning:
        'Câți timpi intră într-un minut. 60 BPM = un timp pe secundă.',
    },
  ],
  sections: [
    {
      id: 'ce-e-pulsul',
      heading: 'Ce este un timp',
      body:
        'Orice muzică are o bătaie regulată dedesubt, ca pașii când mergi sau ca bătăile inimii. ' +
        'O singură astfel de bătaie se numește TIMP. Timpii vin mereu la distanță egală, nu se grăbesc și nu rămân în urmă.',
      grid: [
        { span: 1, count: '1', filled: true, accent: true },
        { span: 1, count: '2', filled: true },
        { span: 1, count: '3', filled: true },
        { span: 1, count: '4', filled: true },
      ],
    },
    {
      id: 'tempo',
      heading: 'Tempoul',
      body:
        'Timpii pot fi rari sau deși. Viteza lor se numește TEMPO și se măsoară în bătăi pe minut (BPM). ' +
        'La 60 BPM ai un timp pe secundă. La 120 BPM, doi. Pulsul rămâne regulat oricare ar fi tempoul.',
      example: {
        steps: eighths('x-x-x-x-'),
        stepsPerBar: 8,
        bpm: 80,
        caption: 'Patru timpi la 80 BPM',
      },
    },
  ],
  practice: {
    instruction: 'Bate pe fiecare timp. Ascultă întâi, apoi intră după numărătoare.',
    stepsPerBar: 8,
    patterns: [eighths('x-x-x-x-')],
    tempos: [60, 76, 92, 108, 66],
  },
}

const measure: Lesson = {
  id: 'masura',
  title: 'Măsura',
  goal: 'Să auzi unde începe fiecare grup de timpi.',
  reference: [
    {
      term: 'Măsură',
      meaning:
        'Un grup de timpi, despărțit prin bare verticale.',
    },
    {
      term: '4/4',
      meaning:
        'Cifra de sus: câți timpi are măsura. Cea de jos: ce notă ține un timp.',
    },
    {
      term: 'Timp tare',
      meaning:
        'Primul timp al măsurii, cel pe care îl simți mai apăsat.',
    },
  ],
  sections: [
    {
      id: 'grupare',
      heading: 'Timpii se grupează',
      body:
        'Timpii nu curg la nesfârșit fără formă: se strâng în grupuri egale, numite MĂSURI. ' +
        'Cel mai des, o măsură are patru timpi. Primul timp din măsură se simte mai apăsat, de aceea îl numim timp tare.',
      grid: [
        { span: 1, count: '1', filled: true, accent: true },
        { span: 1, count: '2', filled: true },
        { span: 1, count: '3', filled: true },
        { span: 1, count: '4', filled: true },
      ],
    },
    {
      id: 'patru-patrimi',
      heading: 'Măsura de 4/4',
      body:
        'Când o măsură are patru timpi, iar fiecare timp valorează o pătrime, scriem 4/4. ' +
        'Cifra de sus spune câți timpi are măsura, cea de jos ce fel de notă ține un timp. E cea mai folosită măsură din muzică.',
      example: {
        steps: eighths('x-x-x-x-x-x-x-x-'),
        stepsPerBar: 8,
        bpm: 84,
        caption: 'Două măsuri de 4/4, ascultă accentul de pe „unu"',
      },
    },
  ],
  practice: {
    instruction: 'Bate doar pe primul timp al fiecărei măsuri.',
    stepsPerBar: 8,
    patterns: [eighths('x-------x-------')],
    tempos: [66, 80, 94, 104, 72],
  },
}

const quarter: Lesson = {
  id: 'patrimea',
  title: 'Pătrimea',
  goal: 'Să recunoști nota care ține exact un timp.',
  reference: [
    {
      term: 'Pătrime',
      meaning:
        'Nota care ține exact un timp. Patru încap într-o măsură de 4/4.',
    },
    {
      term: 'Pauză',
      meaning:
        'Tăcere cu durată. Timpul curge mai departe, numeri în gând.',
    },
  ],
  sections: [
    {
      id: 'simbol',
      heading: 'Nota de pătrime',
      body:
        'PĂTRIMEA este nota care ține exact un timp. Se scrie cu capul plin și o codiță. ' +
        'Într-o măsură de 4/4 încap patru pătrimi, de aici îi vine și numele: fiecare e un sfert din măsură.',
      notation: [{ kind: 'quarter', name: 'Pătrime', duration: 'ține 1 timp' }],
      durationStack: 'quarter',
    },
    {
      id: 'pauza',
      heading: 'Pauza de pătrime',
      body:
        'Tăcerea are și ea durată. PAUZA DE PĂTRIME ține tot un timp, dar în care nu cânți. ' +
        'Timpul curge mai departe, numeri în gând, chiar dacă nu se aude nimic.',
      notation: [
        { kind: 'quarter', name: 'Pătrime', duration: 'un timp cântat' },
        { kind: 'quarterRest', name: 'Pauză de pătrime', duration: 'un timp tăcut' },
      ],
      grid: [
        { span: 1, count: '1', filled: true, accent: true },
        { span: 1, count: '2', filled: false },
        { span: 1, count: '3', filled: true },
        { span: 1, count: '4', filled: false },
      ],
      example: {
        steps: eighths('x---x---'),
        stepsPerBar: 8,
        bpm: 80,
        caption: 'Pătrime, pauză, pătrime, pauză',
      },
    },
  ],
  practice: {
    instruction: 'Bate pătrimile. Unde e pauză, numeri în gând, dar nu baţi.',
    stepsPerBar: 8,
    patterns: [eighths('x-x-x---'), eighths('x---x-x-'), eighths('x-x---x-')],
    tempos: [64, 78, 90, 100, 70],
  },
}

const eighth: Lesson = {
  id: 'optimea',
  title: 'Optimea',
  goal: 'Să împarți timpul în două părți egale.',
  reference: [
    {
      term: 'Optime',
      meaning:
        'Jumătate de timp. Două optimi fac cât o pătrime.',
    },
    {
      term: 'Subdiviziune',
      meaning:
        'Împărțirea unui timp în părți egale: două, trei sau patru.',
    },
  ],
  sections: [
    {
      id: 'doua-pe-timp',
      heading: 'Două note pe un timp',
      body:
        'Dacă împarți un timp în două părți egale, obții două OPTIMI. ' +
        'Se scriu cu o bară care le leagă. Două optimi fac împreună cât o pătrime.',
      notation: [
        { kind: 'quarter', name: 'Pătrime', duration: '1 timp' },
        { kind: 'eighthPair', name: 'Două optimi', duration: 'tot 1 timp' },
      ],
    },
    {
      id: 'cum-numeri',
      heading: 'Cum numeri optimile',
      body:
        'Ca să le ții în frâu, numeri cu „și" între timpi: unu-și, doi-și, trei-și, patru-și. ' +
        'Cifra cade pe timp, „și" cade exact la jumătatea lui.',
      durationStack: 'eighth',
      example: {
        steps: eighths('xxxxxxxx'),
        stepsPerBar: 8,
        bpm: 76,
        caption: 'Opt optimi, de două ori mai dese decât pătrimile',
      },
    },
  ],
  practice: {
    instruction: 'Amestec de pătrimi și optimi. Numără „unu-și doi-și" în gând.',
    stepsPerBar: 8,
    patterns: [eighths('xxx-x-x-'), eighths('x-xxx-xx'), eighths('xxx-xxx-')],
    tempos: [62, 74, 86, 96, 68],
  },
}

const sixteenth: Lesson = {
  id: 'saisprezecimea',
  title: 'Șaisprezecimea',
  goal: 'Să împarți timpul în patru și să rămâi egal.',
  reference: [
    {
      term: 'Șaisprezecime',
      meaning:
        'Un sfert de timp. Patru încap într-o pătrime, numărate „unu-e-și-a”.',
    },
  ],
  sections: [
    {
      id: 'patru-pe-timp',
      heading: 'Patru note pe un timp',
      body:
        'Împarte timpul în patru părți egale și ai patru ȘAISPREZECIMI. ' +
        'Se scriu cu două bare care le leagă, a doua bară e semnul că sunt de două ori mai dese decât optimile.',
      notation: [
        { kind: 'quarter', name: 'Pătrime', duration: '1 timp' },
        { kind: 'eighthPair', name: 'Optimi', duration: '2 pe timp' },
        { kind: 'sixteenthGroup', name: 'Șaisprezecimi', duration: '4 pe timp' },
      ],
    },
    {
      id: 'cum-numeri-16',
      heading: 'Cum le numeri',
      body:
        'Pentru șaisprezecimi se numără „unu-e-și-a". Cifra cade pe timp, „și" la jumătate, ' +
        'iar „e" și „a" umplu sferturile rămase. Spune-le cu voce tare înainte să le baţi.',
      durationStack: 'sixteenth',
      example: {
        steps: sixteenths('xxxxxxxx--------'),
        stepsPerBar: 16,
        bpm: 66,
        caption: 'Două grupuri de șaisprezecimi, apoi liniște',
      },
    },
  ],
  practice: {
    instruction: 'Ține-le egale. Mai bine mai rar și curat decât repede și inegal.',
    stepsPerBar: 16,
    patterns: [
      sixteenths('xxxx----xxxx----'),
      sixteenths('x-x-xxxxx-x-----'),
      sixteenths('xxxxx---x-x-x---'),
    ],
    tempos: [54, 62, 70, 78, 58],
  },
}

const combinations: Lesson = {
  id: 'combinatii',
  title: 'Combinații de subdiviziuni',
  goal: 'Să treci curat de la o valoare la alta, în aceeași măsură.',
  reference: [
    {
      term: 'Densitate',
      meaning:
        'Câte note intră pe un timp. Se schimbă de la un timp la altul; pulsul nu.',
    },
  ],
  sections: [
    {
      id: 'in-aceeasi-masura',
      heading: 'Toate pe același puls',
      body:
        'Până acum ai exersat fiecare valoare separat. În muzică ele apar amestecate: ' +
        'o pătrime, apoi două optimi, apoi patru șaisprezecimi, toate peste același puls, care nu se schimbă.',
      rhythmLine: ['quarter', 'eighthPair', 'sixteenthGroup', 'quarterRest'],
    },
    {
      id: 'greseala-tipica',
      heading: 'Unde se greșește',
      body:
        'Greșeala obișnuită nu e la notele dese, ci la trecerea dintre ele: după un grup rapid, ' +
        'pătrimea care urmează e scurtată din inerție. Pulsul rămâne același, doar densitatea se schimbă.',
      example: {
        steps: sixteenths('x---x-x-xxxxx---'),
        stepsPerBar: 16,
        bpm: 66,
        caption: 'Pătrime, două optimi, patru șaisprezecimi, pătrime',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Ține pulsul constant. Densitatea se schimbă, viteza timpilor nu.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['quarter', 'eighthPair', 'sixteenthGroup', 'quarter'],
      ['sixteenthGroup', 'quarter', 'eighthPair', 'quarter'],
      ['eighthPair', 'sixteenthGroup', 'quarter', 'quarterRest'],
    ]),
    tempos: [56, 66, 76, 86, 60],
  },
}

const offbeat: Lesson = {
  id: 'contratimp',
  title: 'Contratimpul',
  goal: 'Să cânți între timpi, nu doar pe ei.',
  reference: [
    {
      term: 'Contratimp',
      meaning:
        'Exact jumătatea unui timp, „și”-ul din numărătoare.',
    },
  ],
  sections: [
    {
      id: 'unde-cade',
      heading: 'Unde cade contratimpul',
      body:
        'Până acum ai bătut pe timpi: unu, doi, trei, patru. Dar între ei există un loc la fel de important. ' +
        'CONTRATIMPUL este exact jumătatea unui timp, acolo unde spui „și" când numeri „unu-și doi-și".',
      durationStack: 'eighth',
    },
    {
      id: 'cum-suna',
      heading: 'Cum se simte',
      body:
        'Metronomul continuă să bată timpii. Tu cânți între ei. La început pare că ești în întârziere, nu ești: ' +
        'ești exact la mijloc. Numără cu voce tare și cântă doar pe „și".',
      example: {
        steps: eighths('-x-x-x-x'),
        stepsPerBar: 8,
        bpm: 70,
        caption: 'Doar contratimpii, peste metronomul care bate timpii',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Bate între bătăile metronomului. Numără „unu-și" și intră pe „și".',
    stepsPerBar: 8,
    patterns: [eighths('-x-x-x-x'), eighths('x--x--x-'), eighths('-x-x-x--')],
    tempos: [58, 70, 82, 92, 64],
  },
}

const syncopation: Lesson = {
  id: 'sincopa',
  title: 'Sincopa',
  goal: 'Să simți accentul care cade unde nu îl aștepți.',
  reference: [
    {
      term: 'Sincopă',
      meaning:
        'Nota intră pe contratimp și ține peste timpul tare, care rămâne fără atac.',
    },
  ],
  sections: [
    {
      id: 'ce-e-sincopa',
      heading: 'Ce este o sincopă',
      body:
        'SINCOPA apare când o notă intră pe contratimp și ține peste timpul tare care urmează. ' +
        'Rezultatul: timpul tare rămâne fără atac. Muzica pare că „trage" înainte, de aici senzația de balans.',
      durationStack: 'eighth',
    },
    {
      id: 'cum-o-recunosti',
      heading: 'Cum o recunoști',
      body:
        'Caută locul unde ar trebui să fie o notă pe timp și nu e. Dacă nota dinaintea lui a intrat pe „și", ' +
        'ai o sincopă. Ascultă exemplul: pe „trei" nu se aude nimic, fiindcă nota a intrat pe „și" de la doi.',
      grid: [
        { span: 1, count: '1', filled: true, accent: true },
        { span: 1, count: 'și', filled: false },
        { span: 1, count: '2', filled: false },
        { span: 1, count: 'și', filled: true },
        { span: 1, count: '3', filled: false },
        { span: 1, count: 'și', filled: false },
        { span: 1, count: '4', filled: true },
        { span: 1, count: 'și', filled: false },
      ],
      example: {
        steps: eighths('x--x--x-'),
        stepsPerBar: 8,
        bpm: 74,
        caption: 'Unu, „și" de la doi, patru, timpul trei rămâne gol',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Atenție la timpul rămas gol. Numără în gând tot, dar bate doar unde e notă.',
    stepsPerBar: 8,
    patterns: [eighths('x--x--x-'), eighths('x-x--x--'), eighths('x--x-x--')],
    tempos: [60, 72, 84, 94, 66],
  },
}

const legato: Lesson = {
  id: 'legato',
  title: 'Legarea ritmurilor',
  goal: 'Să ții o notă peste timp, fără să o ataci din nou.',
  reference: [
    {
      term: 'Legătură',
      meaning:
        'Arc care unește două note: ataci doar prima, a doua o prelungește.',
    },
  ],
  sections: [
    {
      id: 'ce-e-legatura',
      heading: 'Arcul care unește două note',
      body:
        'Când două note de aceeași înălțime sunt unite printr-un arc, ele devin o singură notă lungă. ' +
        'Ataci doar prima; a doua nu se cântă separat, doar prelungește sunetul.',
      rhythmLine: ['tiedQuarters', 'quarter', 'quarter'],
    },
    {
      id: 'de-ce-exista',
      heading: 'De ce nu scriem direct o notă lungă',
      body:
        'Pentru că durata trece peste o bară de măsură sau peste un timp tare, iar notația trebuie să arate ' +
        'unde cad timpii. Legătura păstrează măsura lizibilă și, în același timp, sunetul continuu.',
      rhythmLine: ['quarter', 'tiedEighthQuarter', 'eighthPair', 'eighth'],
      example: {
        steps: sixteenths('x-------x---x---'),
        stepsPerBar: 16,
        bpm: 70,
        caption: 'Două pătrimi legate, apoi două pătrimi normale',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Ține degetul apăsat pe toată durata legăturii. Nu ridica pe timpul din mijloc.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['tiedQuarters', 'quarter', 'quarter'],
      ['quarter', 'tiedEighthQuarter', 'eighthPair', 'eighth'],
      ['quarter', 'quarter', 'tiedQuarters'],
    ]),
    tempos: [60, 70, 80, 90, 64],
  },
}

const dotted: Lesson = {
  id: 'punctul',
  title: 'Punctul',
  goal: 'Să citești o notă care ține o dată și jumătate.',
  reference: [
    {
      term: 'Punct',
      meaning:
        'Pus după o notă, îi adaugă jumătate din propria durată.',
    },
  ],
  sections: [
    {
      id: 'ce-face-punctul',
      heading: 'Punctul adaugă jumătate',
      body:
        'Un punct pus după o notă îi adaugă jumătate din propria durată. ' +
        'O pătrime ține un timp, deci o PĂTRIME PUNCTATĂ ține un timp și jumătate. ' +
        'O optime ține o jumătate de timp, deci o OPTIME PUNCTATĂ ține trei sferturi.',
      notation: [
        { kind: 'quarter', name: 'Pătrime', duration: '1 timp' },
        { kind: 'dottedQuarter', name: 'Pătrime punctată', duration: '1 timp și jumătate' },
        { kind: 'dottedEighth', name: 'Optime punctată', duration: '¾ de timp' },
      ],
    },
    {
      id: 'figura-clasica',
      heading: 'Pătrime punctată și optime',
      body:
        'Cea mai întâlnită figură cu punct: o pătrime punctată urmată de o optime. ' +
        'Împreună fac doi timpi. Optimea cade pe contratimpul celui de-al doilea timp, de aceea figura sună deja puțin sincopat.',
      rhythmLine: ['dottedQuarter', 'eighth', 'quarter', 'quarter'],
      example: {
        steps: buildSteps(['dottedQuarter', 'eighth', 'quarter', 'quarter']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 66,
        caption: 'Pătrime punctată, optime, apoi două pătrimi',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Ține pătrimea punctată un timp și jumătate. Optimea vine imediat după.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['dottedQuarter', 'eighth', 'quarter', 'quarter'],
      ['quarter', 'dottedQuarter', 'eighth', 'quarter'],
      ['dottedEighth', 'sixteenth', 'quarter', 'eighthPair', 'quarter'],
    ]),
    tempos: [58, 68, 78, 88, 62],
  },
}

const triplet: Lesson = {
  id: 'triolet',
  title: 'Trioletul',
  goal: 'Să împarți un timp în trei părți egale.',
  reference: [
    {
      term: 'Triolet',
      meaning:
        'Trei note egale pe un timp, unde altfel ar intra două. Marcat cu cifra 3.',
    },
  ],
  sections: [
    {
      id: 'trei-in-loc-de-doua',
      heading: 'Trei în locul a două',
      body:
        'Până acum ai împărțit timpul în două sau în patru. TRIOLETUL îl împarte în TREI părți egale. ' +
        'Cifra 3 deasupra grupului e semnul că nu sunt optimi obișnuite: trei note intră în spațiul a două.',
      notation: [
        { kind: 'eighthPair', name: 'Două optimi', duration: '2 pe timp' },
        { kind: 'tripletEighths', name: 'Triolet', duration: '3 pe timp' },
        { kind: 'sixteenthGroup', name: 'Șaisprezecimi', duration: '4 pe timp' },
      ],
    },
    {
      id: 'cum-numeri',
      heading: 'Cum îl numeri',
      body:
        'Pentru triolet nu merge „unu-și": ai nevoie de trei silabe. Folosește „u-nu-le, do-i-le" ' +
        'sau pur și simplu „tri-o-let". Important e ca cele trei să fie perfect egale, nu două rapide și una lungă.',
      rhythmLine: ['tripletEighths', 'quarter', 'tripletEighths', 'quarter'],
      example: {
        steps: buildSteps(['tripletEighths', 'quarter', 'tripletEighths', 'quarter']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 60,
        caption: 'Triolet, pătrime, triolet, pătrime, ascultă egalitatea celor trei',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Cele trei note trebuie să fie egale între ele. Mai bine rar și egal.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['tripletEighths', 'quarter', 'tripletEighths', 'quarter'],
      ['quarter', 'tripletEighths', 'quarter', 'tripletEighths'],
      ['tripletEighths', 'tripletEighths', 'quarter', 'quarterRest'],
    ]),
    tempos: [50, 58, 66, 74, 54],
  },
}

const sextolet: Lesson = {
  id: 'sextolet',
  title: 'Sextoletul',
  goal: 'Să împarți un timp în șase părți egale.',
  reference: [
    {
      term: 'Sextolet',
      meaning:
        'Șase note egale pe un timp, adică două triolete lipite. Marcat cu cifra 6.',
    },
  ],
  sections: [
    {
      id: 'sase-pe-timp',
      heading: 'Șase pe un singur timp',
      body:
        'Trioletul împarte timpul în trei. SEXTOLETUL îl împarte în ȘASE, fiecare notă a trioletului ' +
        'ruptă în două. Cifra 6 deasupra grupului spune că nu sunt șase șaisprezecimi obișnuite: ' +
        'acelea ar ține un timp și jumătate, sextoletul ține exact un timp.',
      notation: [
        { kind: 'tripletEighths', name: 'Triolet', duration: '3 pe timp' },
        { kind: 'sixteenthGroup', name: 'Șaisprezecimi', duration: '4 pe timp' },
        { kind: 'sextoletSixteenths', name: 'Sextolet', duration: '6 pe timp' },
      ],
    },
    {
      id: 'cum-il-numeri',
      heading: 'Numără-l ca două triolete',
      body:
        'Nu încerca să numeri până la șase: la viteza asta nu ai timp. Gândește-l ca DOUĂ TRIOLETE ' +
        'una după alta, „tri-o-let tri-o-let", și simte accentul pe prima din fiecare grup de trei. ' +
        'Așa cele șase rămân egale, în loc să se înghesuie spre final.',
      rhythmLine: ['sextoletSixteenths', 'quarter', 'sextoletSixteenths', 'quarter'],
      example: {
        steps: buildSteps(['sextoletSixteenths', 'quarter', 'sextoletSixteenths', 'quarter']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 48,
        caption: 'Sextolet, pătrime, sextolet, pătrime, ascultă cele două grupe de trei',
        emphasis: 'grid',
      },
    },
    {
      id: 'langa-triolet',
      heading: 'Lângă trioletul din care vine',
      body:
        'Cel mai clar se aude comparat direct: un triolet, apoi un sextolet pe timpul următor. ' +
        'Pulsul nu se schimbă, numărul de note se dublează. Dacă sextoletul îți iese doar puțin mai ' +
        'rapid decât trioletul, nu l-ai împărțit în șase, l-ai grăbit.',
      rhythmLine: ['tripletEighths', 'sextoletSixteenths', 'quarter', 'quarterRest'],
      example: {
        steps: buildSteps(['tripletEighths', 'sextoletSixteenths', 'quarter', 'quarterRest']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 46,
        caption: 'Trei, apoi șase, pe același puls',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Cele șase trebuie să fie egale. Simte-le ca două triolete lipite, nu ca o rafală.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['sextoletSixteenths', 'quarter', 'sextoletSixteenths', 'quarter'],
      ['quarter', 'sextoletSixteenths', 'quarter', 'sextoletSixteenths'],
      ['tripletEighths', 'sextoletSixteenths', 'quarter', 'quarterRest'],
    ]),
    tempos: [42, 48, 54, 60, 45],
  },
}

const twoFour: Lesson = {
  id: 'masura-2-4',
  title: 'Măsura de 2/4',
  goal: 'Să simți pulsul grupat câte doi, nu câte patru.',
  reference: [
    {
      term: '2/4',
      meaning:
        'Două pătrimi într-o măsură. Bara cade de două ori mai des decât în 4/4.',
    },
    {
      term: 'Timp slab',
      meaning:
        'Timpul care urmează după cel tare și se simte mai ușor decât el.',
    },
  ],
  sections: [
    {
      id: 'doi-timpi',
      heading: 'Doi timpi într-o măsură',
      body:
        'Cifra de sus a măsurii spune câți timpi intră între două bare. Până acum a fost 4. ' +
        'În 2/4 sunt DOI: tare, slab, și gata, bara se închide. Pătrimea rămâne exact cât era, ' +
        'pulsul merge la fel de repede. Se schimbă doar cât de des revine accentul.',
      notation: [
        { kind: 'quarter', name: 'Timp tare', duration: '„unu"' },
        { kind: 'quarter', name: 'Timp slab', duration: '„doi"' },
      ],
    },
    {
      id: 'acelasi-puls',
      heading: 'Același puls, bară de două ori mai des',
      body:
        'Numără „unu-doi, unu-doi" în loc de „unu-doi-trei-patru". Bătaia nu se schimbă, ' +
        'dar accentul cade acum pe fiecare al doilea timp. Așa merge un marș: pas stâng, pas drept, ' +
        'și de la capăt.',
      rhythmLine: ['quarter', 'quarter', 'eighthPair', 'quarter', 'quarter', 'eighthPair'],
      rhythmLineTicksPerBar: stepsPerBarOf(2),
      example: {
        steps: buildSteps(['quarter', 'quarter', 'eighthPair', 'quarter', 'quarter', 'eighthPair']),
        stepsPerBar: stepsPerBarOf(2),
        beatsPerBar: 2,
        bpm: 84,
        caption: 'Trei măsuri de 2/4, ascultă cât de des revine accentul',
        emphasis: 'grid',
      },
    },
    {
      id: 'unde-cade-accentul',
      heading: 'De ce contează unde cade bara',
      body:
        'Același șir de opt pătrimi sună altfel scris în 4/4 față de 2/4: nu notele diferă, ci ' +
        'accentele. În 4/4 se apasă din patru în patru, în 2/4 din doi în doi. De aceea măsura nu e ' +
        'o formalitate de pe hârtie, e chiar felul în care se simte piesa.',
      rhythmLine: ['quarter', 'eighthPair', 'quarter', 'eighthPair'],
      rhythmLineTicksPerBar: stepsPerBarOf(2),
      example: {
        steps: buildSteps(['quarter', 'eighthPair', 'quarter', 'eighthPair']),
        stepsPerBar: stepsPerBarOf(2),
        beatsPerBar: 2,
        bpm: 92,
        caption: 'Pătrime, două optimi, de două ori, fiecare în măsura ei',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Numără „unu-doi" și simte accentul pe „unu". Bara vine după fiecare doi timpi.',
    stepsPerBar: stepsPerBarOf(2),
    beatsPerBar: 2,
    ...practiceFromTokens([
      ['quarter', 'quarter', 'eighthPair', 'quarter'],
      ['quarter', 'eighthPair', 'eighthPair', 'quarter'],
      ['eighthPair', 'quarter', 'quarter', 'sixteenthGroup'],
    ]),
    tempos: [72, 84, 96, 108, 78],
  },
}

const threeFour: Lesson = {
  id: 'masura-3-4',
  title: 'Măsura de 3/4',
  goal: 'Să simți pulsul grupat câte trei, măsura valsului.',
  reference: [
    {
      term: '3/4',
      meaning:
        'Trei pătrimi într-o măsură. Un timp tare urmat de doi slabi, apoi de la capăt.',
    },
    {
      term: 'Vals',
      meaning:
        'Dansul scris în 3/4, cu accentul apăsat pe primul din cei trei timpi.',
    },
  ],
  sections: [
    {
      id: 'trei-timpi',
      heading: 'Trei timpi într-o măsură',
      body:
        'În 3/4 numeri „unu-doi-trei" și te întorci. Accentul cade pe „unu", iar „doi" și „trei" ' +
        'rămân ușori, de aici legănarea pe care o auzi în orice vals. Pătrimea e aceeași ca peste tot; ' +
        'doar bara s-a mutat.',
      rhythmLine: ['quarter', 'quarter', 'quarter', 'quarter', 'eighthPair', 'quarter'],
      rhythmLineTicksPerBar: stepsPerBarOf(3),
      example: {
        steps: buildSteps(['quarter', 'quarter', 'quarter', 'quarter', 'eighthPair', 'quarter']),
        stepsPerBar: stepsPerBarOf(3),
        beatsPerBar: 3,
        bpm: 96,
        caption: 'Două măsuri de 3/4, numără „unu-doi-trei"',
        emphasis: 'grid',
      },
    },
    {
      id: 'doime-si-patrime',
      heading: 'Doimea umple două treimi din măsură',
      body:
        'În 3/4 o doime plus o pătrime fac exact o măsură. E figura care dă valsul: o notă lungă pe „unu", ' +
        'ținută peste „doi", și una scurtă pe „trei". Ascult-o alături de trei pătrimi egale și vei auzi ' +
        'de ce una se leagănă și cealaltă merge.',
      rhythmLine: ['half', 'quarter', 'quarter', 'quarter', 'quarter'],
      rhythmLineTicksPerBar: stepsPerBarOf(3),
      example: {
        steps: buildSteps(['half', 'quarter', 'quarter', 'quarter', 'quarter']),
        stepsPerBar: stepsPerBarOf(3),
        beatsPerBar: 3,
        bpm: 100,
        caption: 'Doime și pătrime, apoi trei pătrimi egale',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Numără „unu-doi-trei" și apasă pe „unu". Bara vine după fiecare trei timpi.',
    stepsPerBar: stepsPerBarOf(3),
    beatsPerBar: 3,
    ...practiceFromTokens([
      ['quarter', 'quarter', 'quarter', 'quarter', 'eighthPair', 'quarter'],
      ['half', 'quarter', 'quarter', 'quarter', 'quarter'],
      ['quarter', 'eighthPair', 'quarter', 'dottedQuarter', 'eighth', 'quarter'],
    ]),
    tempos: [88, 100, 112, 124, 94],
  },
}

const sixEight: Lesson = {
  id: 'masura-6-8',
  title: 'Măsura de 6/8',
  goal: 'Să simți doi timpi mari, fiecare împărțit în trei.',
  reference: [
    {
      term: '6/8',
      meaning:
        'Șase optimi într-o măsură, grupate câte trei. Se simt doi timpi, nu șase.',
    },
    {
      term: 'Măsură compusă',
      meaning:
        'Măsura în care timpul se împarte în trei, nu în două. Timpul e pătrimea punctată.',
    },
  ],
  sections: [
    {
      id: 'doi-timpi-mari',
      heading: 'Șase optimi, dar doi timpi',
      body:
        'În 6/8 măsura are șase optimi, dar nu le numeri pe toate șase ca timpi. Se grupează CÂTE TREI, ' +
        'și fiecare grup e un timp. Timpul nu mai e pătrimea, ci PĂTRIMEA PUNCTATĂ, care ține exact trei ' +
        'optimi. De aceea 6/8 se numește măsură compusă: timpul însuși se împarte în trei.',
      notation: [
        { kind: 'dottedQuarter', name: 'Un timp', duration: '3 optimi' },
        { kind: 'eighth', name: 'O subdiviziune', duration: 'o treime de timp' },
      ],
    },
    {
      id: 'cum-il-numeri',
      heading: 'Cum îl numeri',
      body:
        'Numără „unu-doi-trei, doi-doi-trei", prima cifră din fiecare grup e timpul, restul sunt ' +
        'subdiviziunile lui. Accentul mare cade pe primul grup, unul mai mic pe al doilea. Dacă numeri ' +
        'șase timpi egali, ai pierdut tocmai ce deosebește 6/8 de orice altceva.',
      rhythmLine: ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
      rhythmLineTicksPerBar: sixEightBar,
      example: {
        steps: buildSteps(['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth']),
        stepsPerBar: sixEightBar,
        beatsPerBar: 2,
        bpm: 58,
        caption: 'Șase optimi egale, metronomul bate doar cei doi timpi',
        emphasis: 'grid',
      },
    },
    {
      id: 'fata-de-trei-patru',
      heading: 'Aceleași șase optimi, altă măsură',
      body:
        'O măsură de 3/4 are tot șase optimi. Diferența nu e în note, e în GRUPARE: 3/4 le ia două câte ' +
        'două, în trei timpi; 6/8 le ia trei câte trei, în doi timpi. Aceleași note, alt metronom, și ' +
        'piesa sună cu totul altfel.',
      rhythmLine: ['quarter', 'eighth', 'quarter', 'eighth'],
      rhythmLineTicksPerBar: sixEightBar,
      example: {
        steps: buildSteps(['quarter', 'eighth', 'quarter', 'eighth']),
        stepsPerBar: sixEightBar,
        beatsPerBar: 2,
        bpm: 62,
        caption: 'Lung-scurt, lung-scurt, legănarea tipică de 6/8',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction:
      'Numără „unu-doi-trei, doi-doi-trei". Tempoul e dat pe timpul mare, adică pe pătrimea punctată.',
    stepsPerBar: sixEightBar,
    beatsPerBar: 2,
    ...practiceFromTokens([
      ['eighth', 'eighth', 'eighth', 'eighth', 'eighth', 'eighth'],
      ['quarter', 'eighth', 'quarter', 'eighth'],
      ['dottedQuarter', 'eighth', 'eighth', 'eighth'],
    ]),
    tempos: [50, 58, 66, 74, 54],
  },
}

const mixed: Lesson = {
  id: 'ritmuri-mixte',
  title: 'Ritmuri mixte',
  goal: 'Să treci fără poticnire între toate valorile învățate.',
  reference: [
    {
      term: 'Grupare pe timpi',
      meaning:
        'Notele scurte se leagă cu bară în interiorul unui timp, ca ochiul să vadă unde cade fiecare timp.',
    },
  ],
  sections: [
    {
      id: 'toate-la-un-loc',
      heading: 'Toate valorile în aceeași măsură',
      body:
        'Până acum fiecare lecție a exersat o singură valoare. Acum vin împreună: o pătrime, două optimi, ' +
        'patru șaisprezecimi, un triolet, fiecare grup ocupă exact un timp, dar se împarte altfel. ' +
        'Greutatea nu mai e într-o valoare anume, ci în TRECEREA de la una la alta fără să se clatine pulsul.',
      rhythmLine: ['quarter', 'eighthPair', 'sixteenthGroup', 'tripletEighths'],
      example: {
        steps: buildSteps(['quarter', 'eighthPair', 'sixteenthGroup', 'tripletEighths']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 60,
        caption: 'Unu, două, patru, trei, altă împărțire pe fiecare timp',
        emphasis: 'grid',
      },
    },
    {
      id: 'unde-se-clatina',
      heading: 'Unde se clatină de obicei',
      body:
        'Cel mai des se greșește la ieșirea dintr-un grup dens: după patru șaisprezecimi, pătrimea care ' +
        'urmează vine prea devreme, fiindcă degetul a rămas în viteza dinainte. Ține minte că pulsul nu ' +
        's-a schimbat niciodată, doar câte note ai pus peste el.',
      rhythmLine: ['sixteenthGroup', 'quarter', 'eighthPair', 'quarter'],
      example: {
        steps: buildSteps(['sixteenthGroup', 'quarter', 'eighthPair', 'quarter']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 66,
        caption: 'Dens, apoi rar, ascultă că pătrimea nu vine mai devreme',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Ține pulsul constant. Când se schimbă împărțirea, timpul rămâne la fel de lung.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['quarter', 'eighthPair', 'sixteenthGroup', 'tripletEighths'],
      ['sixteenthGroup', 'quarter', 'eighthPair', 'quarter'],
      ['dottedQuarter', 'eighth', 'tripletEighths', 'quarter'],
      ['half', 'eighthPair', 'sixteenthGroup'],
    ]),
    tempos: [54, 62, 70, 78, 58],
  },
}

const complex: Lesson = {
  id: 'ritmuri-complexe',
  title: 'Ritmuri complexe',
  goal: 'Să ții pulsul când timpul tare e tăcut sau legat.',
  reference: [
    {
      term: 'Pauză pe timpul tare',
      meaning:
        'Timpul tare rămâne tăcut. Nu dispare, îl simți din context și îl numeri în gând.',
    },
  ],
  sections: [
    {
      id: 'tacere-pe-unu',
      heading: 'Când „unu" nu se aude',
      body:
        'Cel mai greu lucru din ritm nu e o valoare anume, ci să ții pulsul când nimic nu-l marchează. ' +
        'O pauză pe timp nu înseamnă că timpul a dispărut: îl numeri în gând, la fel de apăsat, ' +
        'și intri exact pe contratimpul de după.',
      rhythmLine: ['eighthRest', 'eighth', 'quarter', 'eighthRest', 'eighth', 'quarter'],
      example: {
        steps: buildSteps(['eighthRest', 'eighth', 'quarter', 'eighthRest', 'eighth', 'quarter']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 62,
        caption: '„Unu" și „trei" sunt tăcuți, intri pe contratimpul de după',
        emphasis: 'grid',
      },
    },
    {
      id: 'legat-peste-bara',
      heading: 'Legat peste timp, peste pauză, peste tot',
      body:
        'Adaugă legăturile și devine și mai alunecos: o notă atacată pe contratimp și ținută peste ' +
        'timpul următor face ca accentul scris să nu mai coincidă cu niciun timp. Asta e sincopa în forma ' +
        'ei cea mai densă, și e chiar limbajul obișnuit al muzicii moderne.',
      rhythmLine: ['eighth', 'tiedEighthQuarter', 'quarter', 'eighthPair'],
      example: {
        steps: buildSteps(['eighth', 'tiedEighthQuarter', 'quarter', 'eighthPair']),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 60,
        caption: 'Optime, apoi o notă legată care trece peste timpul doi',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction: 'Numără cu voce tare timpii care lipsesc. Pauza se numără, nu se sare.',
    stepsPerBar: TICKS_PER_BAR,
    ...practiceFromTokens([
      ['eighthRest', 'eighth', 'quarter', 'eighthRest', 'eighth', 'quarter'],
      ['eighth', 'tiedEighthQuarter', 'quarter', 'eighthPair'],
      ['sixteenthGroup', 'eighthRest', 'eighth', 'quarter', 'eighthPair'],
    ]),
    tempos: [52, 60, 68, 76, 56],
  },
}

/**
 * Un rand de grila comuna: `units` celule egale, pline acolo unde cade una
 * dintre cele `count` note. Asa se vede ca „trei peste doi" nu e o formula,
 * ci doua fluxuri masurate cu acelasi rigla.
 */
function streamCells(units: number, count: number): BeatGridCell[] {
  const every = units / count
  return Array.from({ length: units }, (_, index) => ({
    span: 1,
    count: `${index + 1}`,
    filled: index % every === 0,
    accent: index === 0,
  }))
}

const polyrhythm: Lesson = {
  id: 'poliritm',
  title: 'Poliritm',
  goal: 'Să ții un ritm în timp ce altul, care nu se potrivește cu el, merge alături.',
  reference: [
    {
      term: 'Poliritm',
      meaning:
        'Două ritmuri care împart aceeași măsură în numere care nu se cuprind unul pe altul.',
    },
    {
      term: '3 contra 2',
      meaning:
        'Trei note egale peste două. Se ating doar la început, apoi se despart și se regăsesc la bară.',
    },
    {
      term: 'Grilă comună',
      meaning:
        'Cea mai mică unitate în care intră exact amândouă fluxurile. Pentru 3 contra 2 e șesimea.',
    },
  ],
  sections: [
    {
      id: 'ce-e-poliritmul',
      heading: 'Două împărțiri care nu se potrivesc',
      body:
        'Până acum ai împărțit măsura într-un singur fel odată. POLIRITMUL suprapune două împărțiri ' +
        'care nu se cuprind una pe alta. „3 CONTRA 2" înseamnă: cineva împarte măsura în trei părți ' +
        'egale, altcineva în două, în același timp, peste același puls. Niciuna nu e greșită și niciuna ' +
        'nu se poate număra prin cealaltă. Se ating doar la început.',
      example: {
        steps: evenStream(3),
        backing: evenStream(2),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 50,
        caption: '3 contra 2, nota ta e cea ascuțită, cealaltă e mai joasă',
        emphasis: 'grid',
      },
    },
    {
      id: 'grila-comuna',
      heading: 'Secretul: numără o grilă comună',
      body:
        'Nu încerca să simți direct „trei peste doi", caută întâi cea mai mică unitate în care intră ' +
        'exact amândouă. Pentru 3 și 2, aceea e ȘESIMEA: numeri șase părți egale, repede și fără accent. ' +
        'Fluxul tău de trei cade pe 1, 3 și 5. Celălalt, de două, cade pe 1 și 4. Atât e tot poliritmul, ' +
        'o singură numărătoare, două citiri ale ei.',
      grid: streamCells(6, 3),
      gridSecondary: streamCells(6, 2),
      gridLabel: 'TU, TREI, PE 1 · 3 · 5',
      gridSecondaryLabel: 'CELĂLALT, DOI, PE 1 · 4',
      example: {
        steps: evenStream(3),
        backing: evenStream(2),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 44,
        caption: 'Același 3 contra 2, mai rar, numără șesimile în gând',
        emphasis: 'grid',
      },
    },
    {
      id: 'trei-contra-patru',
      heading: '3 contra 4 se numără la fel, dar pe 12',
      body:
        'Metoda nu se schimbă, doar grila crește. Pentru 3 și 4, cea mai mică unitate comună e A ' +
        'DOUĂSPREZECEA parte: fluxul tău de trei cade pe 1, 5 și 9, iar cel de patru pe 1, 4, 7 și 10. ' +
        'Douăsprezece părți sunt prea multe ca să le numeri cu voce tare la viteză, dar e de ajuns să ' +
        'le numeri o dată rar, ca să simți unde se apropie cele două și unde se depărtează.',
      grid: streamCells(12, 3),
      gridSecondary: streamCells(12, 4),
      gridLabel: 'TU, TREI, PE 1 · 5 · 9',
      gridSecondaryLabel: 'CELĂLALT, PATRU, PE 1 · 4 · 7 · 10',
      example: {
        steps: evenStream(3),
        backing: evenStream(4),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 50,
        caption: '3 contra 4, tu ești cel de trei',
        emphasis: 'grid',
      },
    },
    {
      id: 'apoi-lasa-numaratoarea',
      heading: 'Apoi lasă numărătoarea',
      body:
        'Grila comună e schela, nu clădirea. După ce ai simțit o dată unde cad notele, LASĂ numărătoarea ' +
        'și ține doar fluxul tău, egal, ca și cum celălalt n-ar exista. Greșeala tipică e să încerci să ' +
        'urmărești ambele deodată: nu se poate, și te pierzi din amândouă. Celălalt devine fundal, îl ' +
        'auzi, dar nu îl numeri.',
      example: {
        steps: evenStream(3),
        backing: evenStream(4),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 54,
        caption: 'Ține cele trei egale și lasă-l pe celălalt să treacă pe lângă tine',
        emphasis: 'grid',
      },
    },
    {
      id: 'se-regasesc-la-bara',
      heading: 'Se regăsesc exact la bară',
      body:
        'Oricât de mult par să se depărteze, cele două fluxuri cad împreună pe „unu"-ul fiecărei măsuri ' +
        'și numai acolo. Bara e singurul punct sigur. Dacă te pierzi, nu încerca să prinzi nota următoare ' +
        'din celălalt flux, așteaptă bara și intră de acolo.',
      example: {
        steps: evenStream(3, 2),
        backing: evenStream(4, 2),
        stepsPerBar: TICKS_PER_BAR,
        bpm: 54,
        caption: 'Două măsuri, se ating doar la începutul fiecăreia',
        emphasis: 'grid',
      },
    },
  ],
  practice: {
    instruction:
      'Bate doar fluxul tău, egal. Celălalt se aude sub tine și nu trebuie urmărit, vă întâlniți la bară.',
    stepsPerBar: TICKS_PER_BAR,
    patterns: [evenStream(3), evenStream(3), evenStream(3, 2), evenStream(4)],
    backingPatterns: [evenStream(2), evenStream(4), evenStream(4, 2), evenStream(3)],
    patternLabels: [
      '3 contra 2 · tu ții trei',
      '3 contra 4 · tu ții trei',
      '3 contra 4 · două măsuri',
      '4 contra 3 · tu ții patru',
    ],
    tempos: [46, 52, 58, 64, 49],
  },
}

export const rhythmCategory: Category = {
  id: 'ritm',
  title: 'Ritm',
  subtitle: 'Pulsul, măsura și valorile de note.',
  cover: 'rhythm',
  accent: rhythmTheme.accent,
  soft: rhythmTheme.soft,
  border: rhythmTheme.border,
  lessons: [
    pulse,
    measure,
    quarter,
    eighth,
    sixteenth,
    combinations,
    offbeat,
    syncopation,
    legato,
    dotted,
    triplet,
    sextolet,
    twoFour,
    threeFour,
    sixEight,
    mixed,
    complex,
    polyrhythm,
  ],
}

export const categories: Category[] = [rhythmCategory]
