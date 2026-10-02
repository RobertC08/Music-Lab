import { beatsRow, MIXED_STEPS_PER_BEAT } from '../mixed-grid'
import { describe, expect, it } from 'vitest'
import { kitPieces, type KitPiece } from '../exercise'
import { theoryBar } from './bars'
import { drumTheorySource } from './index'
import {
  CROSS_HEADS,
  LOW_TO_HIGH,
  STAFF_POSITION,
  beamsFor,
  layOutStaffBar,
  writtenSteps,
  type StaffHit,
} from './staff'

/*
  Portativul, verificat ca date, nu ca desen.

  Ce se apără aici nu e felul în care arată, ci ce spune. O poziție alunecată cu
  o linie e o lecție care predă o minciună, iar nimic altceva nu se plânge:
  TypeScript vede un număr, testele de conținut văd un exemplu valid, și doar
  cineva care știe deja notația ar prinde greșeala uitându-se la ecran, adică
  exact cine nu citește lecția.
*/

/** Coloanele unei măsuri, ca `DrumStaff` le construiește din `lanes`. */
function columnsOf(rows: Partial<Record<KitPiece, string>>, steps: number): StaffHit[][] {
  const { lanes } = theoryBar(rows)
  return Array.from({ length: steps }, (_, step) =>
    (Object.keys(lanes) as KitPiece[]).flatMap((piece) => {
      const hit = lanes[piece]?.[step]
      return hit ? [{ piece, hit }] : []
    }),
  )
}

describe('pozițiile pe portativ', () => {
  it('acoperă tot kitul, fiecare piesă cu locul ei', () => {
    for (const piece of kitPieces) {
      expect(STAFF_POSITION[piece], piece).toBeTypeOf('number')
    }
  })

  it('ține tobele în portativ și cinelele sus', () => {
    // Sub 0 sau peste 10 s-ar desena cu linii suplimentare pe care lecția nu le
    // predă. Singura excepție e fusul cu piciorul, chiar sub linia de jos
    // (poziția -1, fără linie suplimentară), unde îl scrie orice chart de jazz.
    for (const piece of kitPieces) {
      if (piece === 'hhFoot') continue
      expect(STAFF_POSITION[piece], piece).toBeGreaterThanOrEqual(0)
      expect(STAFF_POSITION[piece], piece).toBeLessThanOrEqual(10)
    }
    expect(STAFF_POSITION.hhFoot).toBe(-1)
    // ×-ul de pe toba mică (cross-stick) și cel de sub portativ (fusul cu
    // piciorul) nu sunt cinele: ×-ul spune alt fel de lovitură, poziția spune piesa.
    // Lovitura pe ramă e tot ×, tot pe toba mică, deosebită de cross-stick prin cerc.
    const notCymbals = ['crossStick', 'hhFoot', 'rimClick']
    for (const cymbal of CROSS_HEADS.filter((piece) => !notCymbals.includes(piece))) {
      expect(STAFF_POSITION[cymbal], cymbal).toBeGreaterThanOrEqual(STAFF_POSITION.tom)
    }
    expect(STAFF_POSITION.crossStick).toBe(STAFF_POSITION.snare)
    expect(STAFF_POSITION.rimClick).toBe(STAFF_POSITION.snare)
    expect(STAFF_POSITION.rimshot).toBe(STAFF_POSITION.snare)
  })

  it('urcă odată cu sunetul la tobe: mare, cazan, tom 2, tom 1', () => {
    // Regula pe care o predă secțiunea „Ce sună mai jos stă mai jos". Dacă se
    // strică, exemplul cu tomurile care coboară arată invers decât spune textul.
    expect(STAFF_POSITION.kick).toBeLessThan(STAFF_POSITION.floor)
    expect(STAFF_POSITION.floor).toBeLessThan(STAFF_POSITION.mid)
    expect(STAFF_POSITION.mid).toBeLessThan(STAFF_POSITION.tom)
  })

  it('ține toba mică sub tomuri, excepția pe care lecția o spune pe față', () => {
    expect(STAFF_POSITION.snare).toBeLessThan(STAFF_POSITION.mid)
    expect(STAFF_POSITION.snare).toBeGreaterThan(STAFF_POSITION.floor)
  })

  it('scrie fusul deschis în același loc ca pe cel închis', () => {
    // E aceeași piesă, cântată altfel: cerculețul o deosebește, nu poziția.
    expect(STAFF_POSITION.hhOpen).toBe(STAFF_POSITION.hhClosed)
  })

  it('are cheia în ordine strict crescătoare', () => {
    const positions = LOW_TO_HIGH.map((piece) => STAFF_POSITION[piece])
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(new Set(positions).size).toBe(positions.length)
  })
})

describe('durata scrisă', () => {
  it('ține nota până la lovitura următoare din același timp', () => {
    // 'x.x.' pe pătrimi: un pas pe timp, deci fiecare lovitură umple timpul ei.
    const columns = columnsOf({ kick: 'x.x.' }, 4)
    expect(writtenSteps(columns, 0, 1)).toBe(1)
    expect(writtenSteps(columns, 2, 1)).toBe(1)
  })

  it('nu trece peste granița timpului', () => {
    // Optimi, o singură lovitură pe timpul 1: ține un timp întreg, nu doi.
    const columns = columnsOf({ snare: 'x.......' }, 8)
    expect(writtenSteps(columns, 0, 2)).toBe(2)
  })

  it('se scurtează când urmează altă lovitură în același timp', () => {
    const columns = columnsOf({ snare: 'xx......' }, 8)
    expect(writtenSteps(columns, 0, 2)).toBe(1)
  })

  it('traduce durata în bare: pătrime, optime, șaisprezecime', () => {
    expect(beamsFor(2, 2)).toBe(0)
    expect(beamsFor(1, 2)).toBe(1)
    expect(beamsFor(4, 4)).toBe(0)
    expect(beamsFor(2, 4)).toBe(1)
    expect(beamsFor(1, 4)).toBe(2)
  })

  it('scrie trioletele cu o singură bară, nu cu două', () => {
    // O optime de triolet e a treia parte dintr-un timp. Pe raport curat ar cădea
    // la două bare, adică ar arăta ca șaisprezecimi.
    expect(beamsFor(1, 3)).toBe(1)
  })
})

describe('așezarea unei măsuri', () => {
  it('scrie pătrimi și pauze, nu optimi cu goluri', () => {
    // Exact contrastul din lecție: 'x.x.' pe pătrimi e „lovitură, pauză".
    const layout = layOutStaffBar(columnsOf({ kick: 'x.x.' }, 4), 1)
    expect(layout.notes.map((note) => note.step)).toEqual([0, 2])
    expect(layout.notes.every((note) => note.beams === 0)).toBe(true)
    expect(layout.rests.map((rest) => rest.step)).toEqual([1, 3])
  })

  it('pune o singură codiță pe ce se lovește deodată', () => {
    const layout = layOutStaffBar(columnsOf({ snare: 'x...', kick: 'x...' }, 4), 1)
    expect(layout.notes).toHaveLength(1)
    expect(layout.notes[0]!.pieces.map((entry) => entry.piece).sort()).toEqual(['kick', 'snare'])
  })

  it('leagă cu bară numai înăuntrul unui timp', () => {
    // Optimi peste tot: patru bare de câte două, nu una singură peste opt.
    const layout = layOutStaffBar(columnsOf({ snare: 'xxxxxxxx' }, 8), 2)
    expect(layout.beams.map((beam) => [beam.from, beam.to, beam.level])).toEqual([
      [0, 1, 1],
      [2, 3, 1],
      [4, 5, 1],
      [6, 7, 1],
    ])
  })

  it('pune două bare peste șaisprezecimi, legate câte patru', () => {
    const layout = layOutStaffBar(columnsOf({ hhClosed: 'xxxxxxxxxxxxxxxx' }, 16), 4)
    const first = layout.beams.filter((beam) => beam.from === 0)
    expect(first.map((beam) => [beam.level, beam.to])).toEqual([
      [1, 3],
      [2, 3],
    ])
  })

  it('nu întinde bara a doua peste notele care n-o cer', () => {
    /*
      Cazul care a scăpat prima dată, și se vede numai pe ecran: un timp cu o
      optime urmată de două șaisprezecimi. Bara de jos ține tot grupul, cea de
      sus doar ultimele două, altfel măsura se citește ca trei optimi, adică
      altceva decât sună.

      pas:   0  1  2  3   (4 pași pe timp)
      hat    x  .  x  .   -> optime pe 0, optime pe 2
      kick   x  .  .  x   -> șaisprezecime pe 3
      Filled: 0 (8), 2 (16-ime, fiindcă urmează 3), 3 (16-ime).
    */
    const layout = layOutStaffBar(columnsOf({ hhClosed: 'x.x.', kick: 'x..x' }, 4), 4)
    expect(layout.notes.map((note) => [note.step, note.beams])).toEqual([
      [0, 1],
      [2, 2],
      [3, 2],
    ])
    expect(layout.beams.map((beam) => [beam.level, beam.from, beam.to, beam.stub])).toEqual([
      [1, 0, 3, null],
      [2, 2, 3, null],
    ])
  })

  it('desenează cioturi când o notă cere un nivel pe care vecinele nu-l cer', () => {
    /*
      pas:   0  1  2  3   (4 pași pe timp)
      snare  x  x  .  x
      pasul 0 -> următoarea lovitură cade la 1, deci e o șaisprezecime
      pasul 1 -> următoarea la 3, deci o optime
      pasul 3 -> ține până la capătul timpului, deci o șaisprezecime

      Bara de jos leagă tot grupul; pe cea de sus rămân două note izolate,
      fiecare cu ciotul ei, spre dreapta la prima din grup, spre stânga la
      celelalte, ca ochiul să vadă de ce grup ține.
    */
    const layout = layOutStaffBar(columnsOf({ snare: 'xx.x' }, 4), 4)
    expect(layout.notes.map((note) => [note.step, note.beams])).toEqual([
      [0, 2],
      [1, 1],
      [3, 2],
    ])
    expect(layout.beams.map((beam) => [beam.level, beam.from, beam.stub])).toEqual([
      [1, 0, null],
      [2, 0, 'right'],
      [2, 3, 'left'],
    ])
  })

  it('lasă nota singură dintr-un timp fără bară, primește steag', () => {
    const layout = layOutStaffBar(columnsOf({ snare: '...x....' }, 8), 2)
    const note = layout.notes.find((entry) => entry.step === 3)!
    expect(note.beamed).toBe(false)
    expect(note.beams).toBe(1)
    // Pauza de optime dinaintea ei, pe primul pas al timpului. Timpii 1, 3 și 4
    // rămân goi de tot, deci primesc câte o pauză de pătrime.
    expect(layout.rests).toEqual([
      { step: 0, beams: 0 },
      { step: 2, beams: 1 },
      { step: 4, beams: 0 },
      { step: 6, beams: 0 },
    ])
  })

  it('pune o pauză de pătrime pe timpul rămas gol', () => {
    const layout = layOutStaffBar(columnsOf({ snare: 'xx......' }, 8), 2)
    expect(layout.rests).toEqual([
      { step: 2, beams: 0 },
      { step: 4, beams: 0 },
      { step: 6, beams: 0 },
    ])
  })

  it('termină codițele unui grup la aceeași înălțime', () => {
    // Altfel bara de grupare ar ieși strâmbă: tomul 1 stă mai sus decât toba mare.
    const layout = layOutStaffBar(columnsOf({ tom: 'x.......', kick: '.x......' }, 8), 2)
    expect(new Set(layout.notes.map((note) => note.stemTop)).size).toBe(1)
  })
})


describe('exemplele care se desenează pe portativ', () => {
  const withStaff = drumTheorySource.lessons.flatMap((lesson) =>
    lesson.sections
      .filter((section) => section.example?.showStaff)
      .map((section) => ({ at: `${lesson.id}/${section.id}`, example: section.example! })),
  )

  it('sunt destule cât să merite garda', () => {
    expect(withStaff.length).toBeGreaterThan(5)
  })

  it('nu pun accent pe o coloană unde nu se aplică tuturor loviturilor', () => {
    /*
      Accentul se desenează o dată, deasupra codiței, deci ține de toată coloana
      - pe un portativ cu o singură voce nici nu se poate altfel. Prin urmare o
      coloană în care o piesă e accentuată și alta nu se DESENEAZĂ ca și cum ar
      fi accentuate amândouă, iar elevul citește altceva decât sună.

      Nu se vede nici la citit, nici la ascultat: grila desenează corect fiecare
      intensitate, iar urechea aude ce trebuie. Doar portativul minte. De aceea
      exemplele se scriu cu accentele pe coloane omogene, de obicei o piesă
      singură, ca într-un studiu de accente.

      Când `DrumStaff` va ști două voci (mâinile sus, picioarele jos), regula
      asta se restrânge la o voce, nu dispare.
    */
    const offenders: string[] = []
    for (const { at, example } of withStaff) {
      for (const bar of example.exercise.bars) {
        const entries = Object.entries(bar.lanes) as [string, (string | null)[] | undefined][]
        for (let step = 0; step < example.exercise.stepsPerBar; step += 1) {
          const column = entries
            .map(([piece, slots]) => ({ piece, hit: slots?.[step] }))
            .filter((entry) => entry.hit)
          if (!column.some((entry) => entry.hit === 'accent')) continue
          if (column.every((entry) => entry.hit === 'accent')) continue
          offenders.push(`${at} pasul ${step}: ${column.map((e) => `${e.piece}=${e.hit}`).join(', ')}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('nu cer un tempo la care validarea ar respinge loviturile prea dese', () => {
    // Regula de 90 ms se verifică oricum în `theory.test.ts`; aici se prinde
    // cazul în care cineva urcă `bpm` fără să urce și `tempo.max`.
    for (const { at, example } of withStaff) {
      expect(example.bpm, at).toBeLessThanOrEqual(example.exercise.tempo.max)
      expect(example.bpm, at).toBeGreaterThanOrEqual(example.exercise.tempo.min)
    }
  })
})

describe('lecția despre valori', () => {
  const lesson = drumTheorySource.lessons.find((entry) => entry.id === 'valorile-notelor')!

  it('trimite la lecția de ritm care predă șaisprezecimile', () => {
    // Ritmul predă valorile; tobele predau doar cum arată pe portativ. Fără
    // trimitere, lecția ar începe să le explice singură.
    expect(lesson.requiresRhythmLesson).toBe('saisprezecimea')
  })

  it('chiar scrie toate cele trei valori, nu doar le numește', () => {
    /*
      Se numără barele de grupare ieșite din așezare, nu pașii din date. Nu e
      același lucru: fusul pe pătrimi din „Trei densități" e scris pe o grilă de
      șaisprezecimi, cu trei pași goi după fiecare lovitură, pe pași ar arăta ca
      șaisprezecimi, pe portativ e o pătrime. Diferența e chiar ce predă lecția.
    */
    const beams = new Set<number>()
    for (const section of lesson.sections) {
      const exercise = section.example?.exercise
      if (!exercise) continue
      const stepsPerBeat = exercise.stepsPerBar / exercise.beatsPerBar
      for (const bar of exercise.bars) {
        const columns = Array.from({ length: exercise.stepsPerBar }, (_, step) =>
          (Object.keys(bar.lanes) as KitPiece[]).flatMap((piece) => {
            const hit = bar.lanes[piece]?.[step]
            return hit ? [{ piece, hit }] : []
          }),
        )
        for (const note of layOutStaffBar(columns, stepsPerBeat).notes) beams.add(note.beams)
      }
    }
    expect(beams.has(0), 'pătrimi').toBe(true)
    expect(beams.has(1), 'optimi').toBe(true)
    expect(beams.has(2), 'șaisprezecimi').toBe(true)
  })
})

describe('portativul pe grila amestecată', () => {
  // Timpul 1 șaisprezecimi, 2 triolet, 3 sextolet, 4 optimi, pe toba mică.
  const row = beatsRow('xxxx|xxx|xxxxxx|xx')
  const columns = [...row].map((character) =>
    character === 'x' ? [{ piece: 'snare' as const, hit: 'normal' as const }] : [],
  )
  const layout = layOutStaffBar(columns, MIXED_STEPS_PER_BEAT, [4, 3, 6, 2])
  const beamsOn = (beat: number) =>
    layout.notes
      .filter((note) => Math.floor(note.step / MIXED_STEPS_PER_BEAT) === beat)
      .map((note) => note.beams)
  const tupletOn = (beat: number) =>
    layout.beams.find(
      (beam) => beam.level === 1 && Math.floor(beam.from / MIXED_STEPS_PER_BEAT) === beat,
    )?.tuplet

  it('scrie fiecare timp în subdiviziunea lui', () => {
    expect(beamsOn(0)).toEqual([2, 2, 2, 2])
    expect(beamsOn(1)).toEqual([1, 1, 1])
    expect(beamsOn(2)).toEqual([2, 2, 2, 2, 2, 2])
    expect(beamsOn(3)).toEqual([1, 1])
  })

  it('pune cifra de tuplet doar pe timpii care o cer', () => {
    expect(tupletOn(0)).toBe(0)
    expect(tupletOn(1)).toBe(3)
    expect(tupletOn(2)).toBe(6)
    expect(tupletOn(3)).toBe(0)
  })
})
