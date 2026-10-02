/*
  Formatul unui exercițiu de tobe, date pure, fără nimic din UI și fără audio.

  Un exercițiu descrie CE se cântă, nu cum se aude și nici cât ține o sesiune.
  Tempoul, numărul de repetări și numărătoarea sunt decizii de sesiune și stau
  în `plan.ts`; aici e doar partitura și intervalul în care are sens.

  Rudimentele, groove-urile și fill-urile intră toate în același format. Dacă la
  un moment dat pare că unul are nevoie de un al doilea format, întrebarea e ce
  anume nu încape, până acum, nimic (PLAN-TOBE.md §2, §4).
*/

/**
 * Piesele setului. Fiecare cere trei mostre.
 *
 * Primele nouă vin din MuldjordKit. Ultimele patru sunt LOVITURI, nu piese noi
 * ale setului, și vin din DRSKit, fiindcă Muldjord nu le are: cross-stick-ul și
 * mătura se cântă pe toba mică, fusul cu piciorul e același fus, clopotul e
 * același ride. Au totuși câte o cheie proprie, fiindcă sună altfel și se scriu
 * altfel; pe desenul setului se aprinde piesa pe care cad (`soundsOn`).
 */
export const basePieces = [
  'kick',
  'snare',
  'hhClosed',
  'hhOpen',
  'tom',
  'mid',
  'floor',
  'crash',
  'ride',
] as const
/** O piesă a setului propriu-zis, cea pe care o vezi pe desen și o poți atinge. */
export type BasePiece = (typeof basePieces)[number]

export const kitPieces = [
  ...basePieces,
  'crossStick',
  'hhFoot',
  'rideBell',
  'brush',
  // Din VCSL (CC0): `assets/drums/vcsl/`, `scripts/build-vcsl-pieces.py`.
  'cowbell',
  'rimshot',
  'rimClick',
] as const
export type KitPiece = (typeof kitPieces)[number]

/**
 * Ce se cântă cu piciorul. Nu intră în socoteala mâinilor: nici la regula de
 * 90 ms, nici la „o mână pe două piese deodată".
 */
export const footPieces: readonly KitPiece[] = ['kick', 'hhFoot']

/**
 * Pe ce piesă din desen cade fiecare lovitură.
 *
 * Fusul deschis cade pe fus: e aceeași piesă, cântată altfel, și pe desen nu
 * apare de două ori. Înainte de harta asta, o lovitură de fus deschis nu aprindea
 * nimic, deci desenul tăcea exact pe nota care face un groove de disco.
 */
/**
 * Ce se poate aprinde pe desenul setului: piesele de bază, plus talanga, care e
 * un instrument separat (prins pe toba mare), nu un fel de a lovi altă piesă.
 */
export type DrawnPiece = BasePiece | 'cowbell'

export const soundsOn: Record<KitPiece, DrawnPiece> = {
  kick: 'kick',
  snare: 'snare',
  hhClosed: 'hhClosed',
  hhOpen: 'hhClosed',
  tom: 'tom',
  mid: 'mid',
  floor: 'floor',
  crash: 'crash',
  ride: 'ride',
  crossStick: 'snare',
  hhFoot: 'hhClosed',
  rideBell: 'ride',
  brush: 'snare',
  // Talanga are locul ei pe desen, prinsă pe cercul tobei mari.
  cowbell: 'cowbell',
  rimshot: 'snare',
  rimClick: 'snare',
}

/**
 * Cât de tare se lovește. Trei trepte, nu un boolean cu accente pe alături:
 * ghost note-urile sunt cerute explicit, iar un ghost note nu e „o lovitură
 * neaccentuată”, e o treaptă proprie, se aude ca o umbră, nu ca o notă slabă.
 */
export const hitLevels = ['ghost', 'normal', 'accent'] as const
export type Hit = (typeof hitLevels)[number]

/** Mâna. Contează la rudimente, unde sticking-ul E exercițiul. */
export type Stick = 'L' | 'R'

export type GrooveStyle = 'rock' | 'disco' | 'funk' | 'shuffle' | 'jazz' | 'latin' | 'metal'

/**
 * Un ornament: notele de grație dinaintea loviturii principale.
 *
 * Notele de grație NU stau pe grilă, și asta nu e o scăpare a modelului, e
 * definiția lor. Un flam se aude ca o singură lovitură lată, nu ca două note
 * ritmice; distanța dintre grație și lovitura principală e un gest fizic, de vreo
 * 30 ms, și rămâne aceeași la 60 și la 160 BPM. Dacă ar fi pusă pe grilă, ar urma
 * tempoul, iar la tempo mic flam-ul s-ar auzi ca două lovituri separate.
 */
export interface GraceNote {
  /** Câte note de grație: 1 = flam, 2 = drag. */
  strokes: number
  /** Cu ce mână se fac. Mereu cealaltă decât lovitura principală. */
  stick: Stick
}

export interface Bar {
  /** Câte un slot pe pas, pe fiecare piesă folosită; `null` = nu se lovește. */
  lanes: Partial<Record<KitPiece, (Hit | null)[]>>
  /**
   * Mâna fiecărei lovituri, unde contează. Un `null` pe un pas cu lovitură
   * înseamnă „nu se prescrie” (picior, sau liber), nu „greșeală”.
   */
  sticking?: (Stick | null)[]
  /** Ornamentele, câte unul pe pas. Vezi `GraceNote`. */
  grace?: (GraceNote | null)[]
  /** Măsura de fill. La „Fill the Gap”, ultima din patru. */
  fill?: boolean
}

export interface DrumExercise {
  id: string
  /**
   * `demo` e exemplul dintr-o lecție de manual, nu ceva de exersat: se ascultă,
   * nu intră în niciun catalog și n-are deblocare. Are nevoie de o valoare
   * proprie fiindcă altfel ar trebui să mintă, un exemplu de cinci lovituri de
   * tobă mare nu e nici rudiment, nici groove, iar `groove` i-ar cere și un stil.
   */
  kind: 'rudiment' | 'groove' | 'fill' | 'demo'
  /** Doar la groove-uri. */
  style?: GrooveStyle
  /** Pași pe măsură: 16 = șaisprezecimi în 4/4, 12 = triolete de optimi. */
  stepsPerBar: number
  beatsPerBar: number
  bars: Bar[]
  /** Intervalul în care exercițiul are sens; utilizatorul alege în el. */
  tempo: { min: number; max: number; suggested: number }
  /** Ce trebuie dus la capăt înainte. Deblocarea merge pe astea, nu pe scor. */
  requires?: string[]
}

/**
 * Ce are voie să apară la un nivel. Vocabularul *e* dificultatea: un nivel nu
 * poate produce ceva mai greu decât ce i s-a dat. Regula vine din „Citește
 * ritmul”, unde a înlocuit câteva sute de șiruri scrise de mână.
 */
export interface Vocabulary {
  pieces: readonly KitPiece[]
  hits: readonly Hit[]
  /** Diviziunile admise pe bătaie: 2 = optimi, 3 = triolete, 4 = șaisprezecimi. */
  stepsPerBeat: readonly number[]
}

/**
 * Cel mai scurt interval, în ms, între două lovituri ale ACELEIAȘI mâini.
 *
 * Pragul e cel din modulul Ritm, dar aici are alt motiv: acolo, sub 90 ms nu mai
 * era ritm, era dexteritate de atins pe ecran; aici e limita brațului. Un
 * exercițiu care cere mai des decât atât la tempoul lui maxim are tempoul
 * greșit, nu partitura.
 */
export const MIN_HAND_GAP_MS = 90

/**
 * Plafonul de tempo al aplicației, nu al exercițiului.
 *
 * Fiecare exercițiu are intervalul lui (`tempo.min`-`tempo.max`), care e o
 * RECOMANDARE și rămâne una adevărată: validarea și scara de tempo se uită la
 * el, iar regula de 90 ms dintre două lovituri ale aceleiași mâini se verifică
 * exact acolo. Șaisprezecimi la 240 chiar nu se pot bate cu o mână, și n-are
 * rost să pretindem altceva în date.
 *
 * Dar un însoțitor de practică nu e un examinator. Cine vrea să treacă peste
 * recomandare, fiindcă are tehnică, fiindcă cântă altceva peste, fiindcă așa
 * vrea, poate urca până aici. Ecranul spune când ai ieșit din interval; nu te
 * oprește.
 */
export const MAX_BPM = 240

/**
 * Distanța dintre o notă de grație și lovitura principală, în ms.
 *
 * Fixă, nu socotită din tempo: un ornament e un gest, nu o subdiviziune. Peste
 * ~45 ms flam-ul se aude ca două lovituri; sub ~20 ms se topește într-una și
 * dispare. 32 ms stă la mijloc și ține și la drag, unde grațiile sunt două.
 */
export const GRACE_SPACING_MS = 32

export interface Onset {
  step: number
  bar: number
  piece: KitPiece
  hit: Hit
  stick: Stick | null
  grace: GraceNote | null
}

/** Toate loviturile unui exercițiu, în ordinea pașilor. */
export function onsetsOf(exercise: DrumExercise): Onset[] {
  const onsets: Onset[] = []
  exercise.bars.forEach((bar, barIndex) => {
    for (let step = 0; step < exercise.stepsPerBar; step += 1) {
      for (const [piece, slots] of Object.entries(bar.lanes) as [KitPiece, (Hit | null)[]][]) {
        const hit = slots[step]
        if (!hit) continue
        onsets.push({
          step,
          bar: barIndex,
          piece,
          hit,
          stick: bar.sticking?.[step] ?? null,
          grace: bar.grace?.[step] ?? null,
        })
      }
    }
  })
  return onsets
}

/**
 * Verifică un exercițiu și întoarce problemele găsite, gata de pus în mesajul
 * unui test. Lista goală înseamnă că e bun.
 *
 * Nimic din asta nu e prins de TypeScript: o linie cu 15 pași în loc de 16 se
 * compilează perfect și strică exercițiul. La ritm, testele de curriculum au
 * prins deja două măsuri incomplete exact așa.
 */
export function validateExercise(exercise: DrumExercise, vocabulary?: Vocabulary): string[] {
  const problems: string[] = []
  const where = (detail: string) => `${exercise.id}: ${detail}`
  const { stepsPerBar, beatsPerBar } = exercise

  if (beatsPerBar <= 0 || stepsPerBar <= 0) problems.push(where('pași sau bătăi nepozitive'))
  else if (stepsPerBar % beatsPerBar !== 0) {
    problems.push(where(`${stepsPerBar} pași nu se împart în ${beatsPerBar} bătăi`))
  }
  if (exercise.bars.length === 0) problems.push(where('fără măsuri'))
  if (exercise.tempo.min > exercise.tempo.max) problems.push(where('tempo.min peste tempo.max'))
  if (exercise.tempo.suggested < exercise.tempo.min || exercise.tempo.suggested > exercise.tempo.max) {
    problems.push(where('tempo.suggested în afara intervalului'))
  }
  if (exercise.kind === 'groove' && !exercise.style) problems.push(where('groove fără stil'))
  if (exercise.kind !== 'groove' && exercise.style) problems.push(where('stil pe ceva ce nu e groove'))

  exercise.bars.forEach((bar, index) => {
    const at = (detail: string) => problems.push(where(`măsura ${index + 1}: ${detail}`))
    if (Object.keys(bar.lanes).length === 0) at('nicio piesă')
    for (const [piece, slots] of Object.entries(bar.lanes) as [KitPiece, (Hit | null)[]][]) {
      if (slots.length !== stepsPerBar) at(`${piece} are ${slots.length} pași, nu ${stepsPerBar}`)
      if (vocabulary && !vocabulary.pieces.includes(piece)) at(`${piece} nu e în vocabular`)
      for (const hit of slots) {
        if (hit && vocabulary && !vocabulary.hits.includes(hit)) at(`intensitatea ${hit} nu e în vocabular`)
      }
    }
    if (bar.grace) {
      if (bar.grace.length !== stepsPerBar) at(`ornamente cu ${bar.grace.length} pași, nu ${stepsPerBar}`)
      bar.grace.forEach((grace, step) => {
        if (!grace) return
        const struck = (Object.entries(bar.lanes) as [KitPiece, (Hit | null)[]][]).some(
          ([piece, slots]) => !footPieces.includes(piece) && slots[step],
        )
        if (!struck) at(`pasul ${step + 1}: ornament fără lovitură principală`)
        if (grace.strokes < 1 || grace.strokes > 2) at(`pasul ${step + 1}: ${grace.strokes} note de grație`)
        // Grațiile se fac cu cealaltă mână; altfel e o bătaie dublă, nu un ornament.
        const main = bar.sticking?.[step]
        if (main && main === grace.stick) at(`pasul ${step + 1}: ornament cu aceeași mână ca lovitura`)
      })
    }
    if (bar.sticking) {
      if (bar.sticking.length !== stepsPerBar) at(`sticking cu ${bar.sticking.length} pași, nu ${stepsPerBar}`)
      for (let step = 0; step < stepsPerBar; step += 1) {
        if (!bar.sticking[step]) continue
        const struck = (Object.entries(bar.lanes) as [KitPiece, (Hit | null)[]][])
          .filter(([, slots]) => slots[step])
          .map(([piece]) => piece)
        // Toba mare și fusul cu piciorul nu intră în socoteala mâinilor.
        const byHand = struck.filter((piece) => !footPieces.includes(piece))
        if (byHand.length > 1) at(`pasul ${step + 1}: o mână pe ${byHand.join(' + ')}`)
      }
    }
  })

  if (vocabulary && beatsPerBar > 0 && !vocabulary.stepsPerBeat.includes(stepsPerBar / beatsPerBar)) {
    problems.push(where(`${stepsPerBar / beatsPerBar} pași pe bătaie nu e în vocabular`))
  }

  problems.push(...handGapProblems(exercise))
  return problems
}

/**
 * Loviturile prea dese pentru o mână, la tempoul maxim al exercițiului.
 *
 * Când sticking-ul e declarat, se măsoară pe mână, singura măsurătoare
 * adevărată. Când nu e, se măsoară pe piesă: un tom nu se bate de două ori în
 * 90 ms cu un singur braț, iar un exercițiu care o cere fără să spună cum se
 * împarte între mâini nu e încă un exercițiu.
 *
 * Notele de grație nu intră în socoteală, fiindcă nu sunt evenimente ritmice: cele
 * două grații ale unui drag se fac cu aceeași mână la ~32 ms una de alta, dar ca
 * o săltare a bețișorului, nu ca două lovituri conduse separat. Regula de 90 ms
 * măsoară cât de des poate fi CONDUS un braț, iar un ornament nu e condus.
 */
function handGapProblems(exercise: DrumExercise): string[] {
  if (exercise.beatsPerBar <= 0 || exercise.stepsPerBar <= 0) return []
  const stepMs = 60_000 / exercise.tempo.max / (exercise.stepsPerBar / exercise.beatsPerBar)
  const problems: string[] = []
  /*
    Măsurile se repetă în buclă, deci ultima se leagă de prima: parcurgem două
    treceri, altfel trecerea peste bară, locul unde se strică cel mai des un
    sticking, scapă neverificată.
  */
  const doubled = [...exercise.bars, ...exercise.bars]
  const streams = new Map<string, number[]>()
  doubled.forEach((bar, barIndex) => {
    for (let step = 0; step < exercise.stepsPerBar; step += 1) {
      const atMs = (barIndex * exercise.stepsPerBar + step) * stepMs
      for (const [piece, slots] of Object.entries(bar.lanes) as [KitPiece, (Hit | null)[]][]) {
        if (!slots[step]) continue
        if (footPieces.includes(piece)) continue
        const stick = bar.sticking?.[step]
        const key = stick ? `mâna ${stick}` : piece
        const stream = streams.get(key) ?? []
        stream.push(atMs)
        streams.set(key, stream)
      }
    }
  })
  for (const [key, times] of streams) {
    for (let index = 1; index < times.length; index += 1) {
      const gap = times[index]! - times[index - 1]!
      if (gap < MIN_HAND_GAP_MS - 0.001) {
        problems.push(
          `${exercise.id}: ${key}, ${gap.toFixed(0)} ms între lovituri la ${exercise.tempo.max} BPM` +
            ` (minimul e ${MIN_HAND_GAP_MS})`,
        )
        break
      }
    }
  }
  return problems
}
