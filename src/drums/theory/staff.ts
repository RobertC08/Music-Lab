import type { Hit, KitPiece } from '../exercise'

/*
  Portativul de tobe, partea care se poate socoti.

  Desenul e în `components/drums/theory/DrumStaff.tsx`; aici stau pozițiile,
  geometria și traducerea unei măsuri în note și pauze. Despărțirea e aceeași ca
  la `kit-keys.ts` față de `kit.ts`, și din același motiv: componenta importă
  react-native-svg, adică sintaxă Flow, pe care vitest nu o poate citi. Un test
  peste ce se desenează ar trage tot RN după el și n-ar putea rula.

  Iar aici chiar e ceva de testat. Pozițiile sunt CONȚINUT, dacă toba mică
  alunecă o linie, lecția predă o minciună și nimic nu se plânge, iar regula
  de durată din `writtenSteps` e exact ce predă lecția despre notație.
*/

/**
 * Unde stă fiecare piesă pe portativ, în jumătăți de spațiu de la linia de jos.
 *
 * `0` e linia de jos, `1` spațiul de deasupra ei, …, `8` linia de sus. Peste `8`
 * se iese din portativ: `9` e spațiul de deasupra, `10` cere linie
 * suplimentară.
 *
 * Pozițiile sunt convenția larg folosită (`references/terminologie.md`).
 * Notația de tobe nu e complet standardizată, dar trei lucruri sunt constante
 * peste tot: tobele au cap rotund, cinelele ×, iar ce sună mai înalt stă mai
 * sus. Singura excepție de la a treia e **toba mică**, care sună mai ascuțit
 * decât tomurile și totuși stă sub ele, convenție, nu logică, și lecția o
 * spune pe față în loc s-o ascundă.
 *
 * Ordinea de aici, ordinea rândurilor din grilă (`groove-grid.tsx`) și ordinea
 * din datele de groove sunt aceeași. Nu se schimbă una fără celelalte.
 */
export const STAFF_POSITION: Record<KitPiece, number> = {
  kick: 1,
  floor: 3,
  snare: 5,
  mid: 6,
  tom: 7,
  ride: 8,
  hhClosed: 9,
  hhOpen: 9,
  crash: 10,
  /*
    Loviturile din DRSKit stau pe pozițiile pieselor pe care cad; le deosebește
    capul de notă, nu locul. Cross-stick-ul e × pe spațiul tobei mici (de aceea
    lecția spune că ×-ul nu înseamnă mereu cinel), clopotul e romb pe linia
    ride-ului, mătura e cap rotund pe toba mică. Fusul cu piciorul e × SUB
    portativ, în spațiul de sub linia de jos: acolo îl scrie orice chart de jazz.
  */
  crossStick: 5,
  brush: 5,
  rideBell: 8,
  hhFoot: -1,
}

/** Cinelele se scriu cu ×, tobele cu cap rotund. Cross-stick-ul e și el ×. */
export const CROSS_HEADS: readonly KitPiece[] = ['hhClosed', 'hhOpen', 'ride', 'crash', 'crossStick', 'hhFoot']

/** Clopotul ride-ului: cap în formă de romb, ca să nu se confunde cu ride-ul. */
export const DIAMOND_HEADS: readonly KitPiece[] = ['rideBell']

/** Piesele de la cea mai joasă la cea mai înaltă, ordinea cheii portativului. */
export const LOW_TO_HIGH: readonly KitPiece[] = [
  'kick',
  'floor',
  'snare',
  'mid',
  'tom',
  'ride',
  'hhClosed',
  'crash',
]

/*
  Geometria, în unități de viewBox. Un spațiu de portativ = 8; restul se scoate
  din el, ca desenul să rămână proporțional dacă i se schimbă mărimea.
*/
export const SP = 8
const HALF = SP / 2
/**
 * Loc deasupra portativului: linia suplimentară a crash-ului, codițele, și
 * semnele care stau peste ele, accentul și cifra de triolet.
 *
 * A crescut de la 30 după ce cifra 3 a shuffle-ului a ieșit tăiată de marginea
 * de sus: ride-ul stă pe linia de sus, codița lui ajungea la limită, iar cifra
 * se desena deasupra ei, adică în afara desenului.
 */
export const PAD_TOP = 38
export const STAFF_H = SP * 4
export const STAFF_TOP = PAD_TOP
export const STAFF_BOTTOM = PAD_TOP + STAFF_H
/** Loc dedesubt: numerele timpilor. */
export const PAD_BOTTOM = 20
export const STAFF_HEIGHT = STAFF_BOTTOM + PAD_BOTTOM
/** Lățimea capului portativului: cheia neutră și indicația de măsură. */
export const HEAD_W = 30

export const yOf = (position: number) => STAFF_BOTTOM - position * HALF

/** Raza capului de notă. Elipsa e înclinată ca la tipar, nu un cerc. */
export const HEAD_RX = 5
export const HEAD_RY = 3.6
/** Cât de lungă e codița, măsurat de la capul cel mai de sus al coloanei. */
export const STEM_LEN = 26
export const BEAM_H = 3
export const BEAM_GAP = 5

/** Lățimea unei bare frânte, cioturul unei note singure de pe un nivel. */
export const BEAM_STUB = 6

/** O lovitură dintr-o coloană: ce piesă, cât de tare. */
export interface StaffHit {
  piece: KitPiece
  hit: Hit
}

export interface StaffNote {
  step: number
  pieces: StaffHit[]
  /**
   * Coloana are cel puțin un accent.
   *
   * Accentul se desenează o dată, deasupra codiței, nu lângă fiecare cap: pe un
   * portativ cu o singură voce n-ar fi mai limpede, ar fi doar mai aglomerat.
   * Consecința e că o coloană cu un accent și o lovitură normală se scrie ca
   * accentuată, de aceea exemplele accentuează o singură piesă pe coloană, iar
   * un test o verifică.
   */
  accented: boolean
  /** Câte bare cere durata scrisă: 0 = pătrime, 1 = optime, 2 = șaisprezecime. */
  beams: number
  stemTop: number
  /**
   * Nota intră într-un grup legat cu bare.
   *
   * Contează la desen pentru un singur lucru: o notă legată NU primește steag.
   * Bara ține locul steagurilor, iar amândouă ar fi o greșeală de tipar.
   */
  beamed: boolean
}

export interface StaffRest {
  step: number
  beams: number
}

/**
 * O bucată de bară de grupare, pe un nivel.
 *
 * Nivelul 1 e bara de jos (optimi), nivelul 2 cea de deasupra ei
 * (șaisprezecimi). Fiecare nivel are propriile bucăți, fiindcă într-un timp pot
 * sta laolaltă valori diferite, vezi `beamSegments`.
 */
export interface StaffBeam {
  /** Pasul de unde începe bucata. */
  from: number
  /** Pasul unde se termină. Egal cu `from` la un ciot. */
  to: number
  /** 1 = prima bară, 2 = a doua, … */
  level: number
  /**
   * Ciot: bucata ține de o singură notă și se desenează scurtă, într-o parte.
   * `null` la o bară adevărată, întinsă între două note.
   */
  stub: 'left' | 'right' | null
  /** Cifra de deasupra grupului, când timpul nu se împarte în două. Doar pe nivelul 1. */
  tuplet: number
  /** Înălțimea la care se termină codițele grupului. */
  stemTop: number
}

/**
 * Note, pauze și bare, ținute separat.
 *
 * Nu dintr-un gust pentru liste curate: barele se desenează după toate capetele
 * de notă, ca să nu treacă pe sub codițele următoare.
 */
export interface StaffBarLayout {
  notes: StaffNote[]
  rests: StaffRest[]
  beams: StaffBeam[]
}

/**
 * Cât ține, SCRIS, o lovitură care începe la pasul `step`.
 *
 * Aici stă singura regulă a fișierului care nu e evidentă, și e chiar ce predă
 * lecția: **o tobă nu poate ține sunetul.** O pătrime și o optime sună identic
 * pe o tobă mică; ce le deosebește e doar când vine următoarea lovitură. Deci
 * durata scrisă a unei note nu e o proprietate a ei, ci distanța până la
 * următoarea, sau până la capătul timpului, fiindcă dincolo de el gruparea se
 * rupe oricum.
 *
 * Consecința practică: 'x.x.' pe pătrimi se scrie ca două pătrimi și două
 * pauze, nu ca patru optimi cu pauze printre ele. A doua variantă ar fi tot
 * corectă ca sunet și ilizibilă ca partitură.
 */
export function writtenSteps(
  columns: readonly unknown[][],
  step: number,
  stepsPerBeat: number,
): number {
  const beatEnd = (Math.floor(step / stepsPerBeat) + 1) * stepsPerBeat
  for (let next = step + 1; next < beatEnd; next += 1) {
    if (columns[next]!.length > 0) return next - step
  }
  return beatEnd - step
}

/**
 * Câte bare cere o durată de `steps` pași, într-un timp împărțit în
 * `stepsPerBeat`.
 *
 * Fără punct și fără valori mai lungi de un timp: manualul n-are nevoie de ele,
 * iar o pătrime cu punct scrisă greșit e mai rea decât una nescrisă. Dacă apare
 * nevoia, aici se adaugă, cu un test care compară durata scrisă cu cea sunată.
 */
export function beamsFor(steps: number, stepsPerBeat: number): number {
  const part = steps / stepsPerBeat
  if (part >= 1) return 0
  // Ternarul se scrie cu o singură bară, ca optimile: trei optimi pe un timp, cu
  // cifra 3 deasupra. Raportul (o treime) ar cădea altfel la două bare.
  if (stepsPerBeat % 3 === 0 && part >= 1 / 3) return 1
  if (part >= 0.5) return 1
  if (part >= 0.25) return 2
  return 3
}

/**
 * Barele unui grup, nivel cu nivel.
 *
 * Funcția asta există dintr-un bug văzut pe ecran, nu dintr-o cerință: un timp
 * poate ține laolaltă valori diferite, o optime urmată de două șaisprezecimi e
 * cel mai obișnuit lucru dintr-un groove de funk. Prima variantă desena o
 * singură bară, cea a PRIMEI note, peste tot grupul; pe ecran ieșeau trei
 * optimi, adică o măsură care se citea altfel decât suna. Niciun test n-o
 * prindea: exercițiul era valid, iar grila îl desena corect.
 *
 * Regula adevărată, și ce face funcția: **bara de jos merge de la prima la
 * ultima notă a grupului; fiecare bară de deasupra acoperă doar notele care o
 * cer.** Când o notă cere un nivel pe care vecinele nu-l cer, primește un ciot,
 * bara frântă, orientată spre notele dinaintea ei.
 */
export function beamSegments(
  group: readonly { step: number; beams: number }[],
  options: { tuplet: number; stemTop: number },
): StaffBeam[] {
  if (group.length < 2) return []
  const segments: StaffBeam[] = []
  const deepest = Math.max(...group.map((note) => note.beams))

  for (let level = 1; level <= deepest; level += 1) {
    let start: number | null = null
    for (let index = 0; index <= group.length; index += 1) {
      const covered = index < group.length && group[index]!.beams >= level
      if (covered && start === null) start = index
      if (!covered && start !== null) {
        const last = index - 1
        if (last > start) {
          segments.push({
            from: group[start]!.step,
            to: group[last]!.step,
            level,
            stub: null,
            tuplet: level === 1 ? options.tuplet : 0,
            stemTop: options.stemTop,
          })
        } else {
          /*
            O singură notă pe nivelul ăsta: se desenează un ciot, nu o bară.
            Orientat spre stânga când are ceva înaintea ei, așa se tipărește, și
            așa ochiul îl citește ca „ține de grupul dinainte", nu ca începutul
            altui grup.
          */
          segments.push({
            from: group[start]!.step,
            to: group[start]!.step,
            level,
            stub: start > 0 ? 'left' : 'right',
            tuplet: 0,
            stemTop: options.stemTop,
          })
        }
        start = null
      }
    }
  }
  return segments
}

/**
 * O măsură, tradusă în note, pauze și bare gata de desenat.
 *
 * Grupurile se leagă **numai înăuntrul unui timp**. E regula care face
 * diferența dintre o partitură care se citește și una care nu: bara peste
 * granița de timp ascunde exact ce caută ochiul, adică unde cade pulsul.
 */
export function layOutStaffBar(columns: StaffHit[][], stepsPerBeat: number): StaffBarLayout {
  const notes: StaffNote[] = []
  const rests: StaffRest[] = []
  const beams: StaffBeam[] = []
  const beatCount = Math.ceil(columns.length / stepsPerBeat)

  for (let beat = 0; beat < beatCount; beat += 1) {
    const start = beat * stepsPerBeat
    const end = Math.min(start + stepsPerBeat, columns.length)
    const filled: number[] = []
    for (let step = start; step < end; step += 1) if (columns[step]!.length > 0) filled.push(step)

    if (filled.length === 0) {
      rests.push({ step: start, beams: 0 })
      continue
    }

    // Pauza de dinaintea primei lovituri din timp. După ea nu mai e nevoie de
    // niciuna: golul dintre două lovituri intră în durata scrisă a celei
    // dinainte (`writtenSteps`).
    if (filled[0]! > start) {
      rests.push({ step: start, beams: beamsFor(filled[0]! - start, stepsPerBeat) })
    }

    /*
      Codițele unui grup se termină la aceeași înălțime, altfel bara ar fi
      strâmbă. Înălțimea o dă nota cea mai de sus din tot grupul, de asta se
      calculează o dată, aici, nu pe fiecare notă.
    */
    const highest = Math.min(
      ...filled.flatMap((step) => columns[step]!.map(({ piece }) => yOf(STAFF_POSITION[piece]))),
    )
    /*
      Codița urcă cu `STEM_LEN` peste capul cel mai de sus, dar nu iese din
      desen: un crash stă pe linie suplimentară, iar codița lui ar ajunge peste
      marginea viewBox-ului.

      Podeaua nu e lipită de 0, ci lasă loc pentru ce se desenează DEASUPRA
      codiței: accentul (6 unități mai sus) și cifra de triolet (3, plus corpul
      literei). 14 le cuprinde pe amândouă, cu marjă.
    */
    const stemTop = Math.max(14, Math.min(highest - STEM_LEN, STAFF_TOP - 4))

    const beamed = filled.length > 1 && stepsPerBeat > 1
    const group = filled.map((step) => ({
      step,
      beams: beamsFor(writtenSteps(columns, step, stepsPerBeat), stepsPerBeat),
    }))

    if (beamed) {
      /*
        Cifra se pune pe ORICE grup dintr-un timp ternar, nu doar pe cel plin.

        Un shuffle are două note din trei, iar prima variantă cerea toate trei,
        deci shuffle-ul, adică exact figura pentru care există cifra, ieșea fără
        ea. Pe hârtie, paranteza de triolet acoperă timpul chiar și când o notă
        lipsește; noi desenăm doar cifra, dar tot acolo.
      */
      const tuplet = stepsPerBeat % 3 === 0 ? 3 : 0
      beams.push(...beamSegments(group, { tuplet, stemTop }))
    }

    for (const note of group) {
      notes.push({
        step: note.step,
        pieces: columns[note.step]!,
        accented: columns[note.step]!.some((entry) => entry.hit === 'accent'),
        beams: note.beams,
        stemTop,
        beamed,
      })
    }
  }

  return { notes, rests, beams }
}
