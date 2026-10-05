import { describe, expect, it } from 'vitest'
import { MAX_FRET, scalePositions, type ScalePosition } from './positions'
import { degreeOf, KEYS, noteSetById, noteSetLetters, noteSetTitle, scaleSets } from './scales'
import { pitchClass } from './tuning'

/** Tastele unei poziții, pe coarde, de la 6 la 1: '5 8|5 7|...'. */
const frets = (position: ScalePosition) =>
  [6, 5, 4, 3, 2, 1].map((string) => position.notes.filter((note) => note.string === string).map((note) => note.fret).join(' ')).join('|')

describe('gamele', () => {
  it('notele unei tonalități, scrise cum le scrie un chitarist', () => {
    expect(noteSetLetters(noteSetById('major')!, 0).join(' ')).toBe('C D E F G A B C')
    expect(noteSetLetters(noteSetById('minorPentatonic')!, 9).join(' ')).toBe('A C D E G A')
    expect(noteSetLetters(noteSetById('major')!, 5).join(' ')).toBe('F G A B♭ C D E F')
    expect(noteSetLetters(noteSetById('naturalMinor')!, 2).join(' ')).toBe('D E F G A B♭ C D')
    expect(noteSetLetters(noteSetById('blues')!, 4).join(' ')).toBe('E G A B♭ B D E')
    expect(noteSetLetters(noteSetById('major')!, 1).join(' ')).toBe('D♭ E♭ F G♭ A♭ B♭ C D♭')
    expect(noteSetLetters(noteSetById('major')!, 6).join(' ')).toBe('F♯ G♯ A♯ B C♯ D♯ E♯ F♯')
    expect(noteSetLetters(noteSetById('naturalMinor')!, 8).join(' ')).toBe('G♯ A♯ B C♯ D♯ E F♯ G♯')
    expect(noteSetLetters(noteSetById('naturalMinor')!, 3).join(' ')).toBe('E♭ F G♭ A♭ B♭ C♭ D♭ E♭')
    expect(noteSetLetters(noteSetById('minorPentatonic')!, 1).join(' ')).toBe('C♯ E F♯ G♯ B C♯')
    expect(noteSetLetters(noteSetById('majorPentatonic')!, 10).join(' ')).toBe('B♭ C D F G B♭')
    expect(noteSetLetters(noteSetById('chromatic')!, 9).join(' ')).toBe('A B♭ B C C♯ D D♯ E F F♯ G G♯ A')
    // ♭5 în Mi♭ ar fi Si𝄫: pe desen, La.
    expect(noteSetLetters(noteSetById('blues')!, 3).join(' ')).toBe('E♭ G♭ A♭ A B♭ D♭ E♭')
    expect(noteSetTitle(noteSetById('naturalMinor')!, 1, 'ro')).toBe('Do♯ minor natural')
    expect(noteSetTitle(noteSetById('major')!, 1, 'ro')).toBe('Re♭ major')
    expect(noteSetTitle(noteSetById('minorPentatonic')!, 9, 'ro')).toBe('La minor pentatonic')
    expect(noteSetTitle(noteSetById('major')!, 10, 'en')).toBe('B♭ major')
  })

  it('în orice gamă de șapte note, fiecare literă apare o singură dată', () => {
    for (const set of scaleSets.filter((candidate) => candidate.intervals.length === 7)) {
      for (const { pc } of KEYS) {
        const letters = noteSetLetters(set, pc).slice(0, 7).map((name) => name[0])
        expect(new Set(letters).size, `${set.id} ${pc}`).toBe(7)
      }
    }
  })

  it('fiecare set are câte o treaptă pe interval', () => {
    for (const set of scaleSets) {
      expect(set.degrees.length, set.id).toBe(set.intervals.length)
      expect(set.intervals[0], set.id).toBe(0)
    }
  })
})

describe('pozițiile pe gât', () => {
  it('cutiile pentatonicii La minor sunt cele standard, urcând pe gât', () => {
    const boxes = scalePositions(noteSetById('minorPentatonic')!, 9)
    expect(boxes.map(frets)).toEqual([
      '5 8|5 7|5 7|5 7|5 8|5 8',
      '8 10|7 10|7 10|7 9|8 10|8 10',
      '10 12|10 12|10 12|9 12|10 13|10 12',
      '12 15|12 15|12 14|12 14|13 15|12 15',
      // A cincea ar fi la 14-17, peste ultima mostră: coboară o octavă.
      '3 5|3 5|2 5|2 5|3 5|3 5',
    ])
    expect(boxes[0]!.notes[0]).toMatchObject({ string: 6, fret: 5, root: true, degree: '1', finger: 1 })
  })

  it('Do major, poziția 1: forma CAGED cu tonica pe coarda 6, tasta 8', () => {
    const [first] = scalePositions(noteSetById('major')!, 0)
    expect(frets(first!)).toBe('7 8 10|7 8 10|7 9 10|7 9 10|8 10|7 8 10')
    expect(first!.notes.filter((note) => note.root).map((note) => `${note.string}/${note.fret}`)).toEqual(['6/8', '4/10', '1/8'])
  })

  it('o notă care nu încape în fereastră se ia cu o întindere, nu se sare', () => {
    // La minor natural, poziția 1: Si pe coarda Sol, tasta 4 (arătătorul întins), ca în metode.
    expect(frets(scalePositions(noteSetById('naturalMinor')!, 9)[0]!)).toBe('5 7 8|5 7 8|5 7|4 5 7|5 6 8|5 7 8')
    // Sol major, toate cele cinci poziții CAGED, ca în metode (a cincea, la 12-15: forma poziției deschise, o octavă mai sus).
    expect(scalePositions(noteSetById('major')!, 7).map(frets)).toEqual([
      '2 3 5|2 3 5|2 4 5|2 4 5|3 5|2 3 5',
      '5 7 8|5 7|4 5 7|4 5 7|5 7 8|5 7 8',
      '7 8 10|7 9 10|7 9 10|7 9|7 8 10|7 8 10',
      '10 12|9 10 12|9 10 12|9 11 12|10 12 13|10 12',
      '12 14 15|12 14 15|12 14|11 12 14|12 13 15|12 14 15',
    ])
    // Blues în La, cutia 2: ♭5 pe coarda 6, tasta 11.
    expect(frets(scalePositions(noteSetById('blues')!, 9)[1]!)).toBe('8 10 11|7 10|7 10|7 8 9|8 10|8 10')
  })

  it('blues: pentatonica plus ♭5, la locul ei', () => {
    const [first] = scalePositions(noteSetById('blues')!, 9)
    expect(frets(first!)).toBe('5 8|5 6 7|5 7|5 7 8|5 8|5 8')
    expect(first!.notes.filter((note) => note.degree === '♭5').map((note) => `${note.string}/${note.fret}`)).toEqual(['5/6', '3/8'])
  })

  it('cromatica: toate notele, de la tonică, fără goluri și fără dubluri', () => {
    const [only, ...rest] = scalePositions(noteSetById('chromatic')!, 9)
    expect(rest).toHaveLength(0)
    only!.notes.forEach((note, index) => index > 0 && expect(note.pitch - only!.notes[index - 1]!.pitch).toBe(1))
  })

  it('toate gamele, toate tonalitățile, toate pozițiile: cântabile și corecte', () => {
    for (const set of scaleSets) {
      for (const { pc: root } of KEYS) {
        const positions = scalePositions(set, root)
        expect(positions.length, set.id).toBe(set.positions.kind === 'chromatic' ? 1 : 5)
        for (const position of positions) {
          const where = `${set.id} ${root} poziția ${position.number}`
          const { notes } = position
          // Doar note din gamă, toate treptele prezente.
          for (const note of notes) {
            expect(degreeOf(set, root, note.pitch), where).toBe(note.degree)
            expect(note.root, where).toBe(pitchClass(note.pitch - root) === 0)
          }
          expect(new Set(notes.map((note) => note.degree)).size, where).toBe(set.degrees.length)
          // De la grav la acut, fără dubluri și fără nicio notă a gamei sărită pe drum.
          notes.forEach((note, index) => {
            if (index === 0) return
            const previous = notes[index - 1]!
            expect(note.pitch, where).toBeGreaterThan(previous.pitch)
            for (let between = previous.pitch + 1; between < note.pitch; between += 1) {
              expect(degreeOf(set, root, between), `${where}: lipsește ${between}`).toBeUndefined()
            }
          })
          // Pe gât, în fereastra mâinii, în mostre.
          expect(position.minFret, where).toBeGreaterThanOrEqual(0)
          expect(position.maxFret, where).toBeLessThanOrEqual(MAX_FRET)
          expect(position.maxFret - position.minFret, where).toBeLessThanOrEqual(4)
          for (const note of notes) {
            expect(note.pitch, where).toBeGreaterThanOrEqual(40)
            expect(note.pitch, where).toBeLessThanOrEqual(79)
          }
          // Cel puțin două octave de tonică la game de cinci note și mai mult.
          expect(notes.filter((note) => note.root).length, where).toBeGreaterThanOrEqual(2)
          // Digitația: 0 doar pe coarda goală; pe o coardă, degetele urcă odată cu tastele.
          for (const string of [1, 2, 3, 4, 5, 6]) {
            const onString = notes.filter((note) => note.string === string)
            expect(onString.length, where).toBeLessThanOrEqual(set.positions.kind === 'chromatic' ? 5 : 3)
            for (const note of onString) {
              expect(note.finger === 0, where).toBe(note.fret === 0)
              expect(note.finger, where).toBeLessThanOrEqual(4)
            }
            onString.forEach(
              (note, index) => index > 0 && expect(note.finger, where).toBeGreaterThanOrEqual(onString[index - 1]!.finger),
            )
          }
        }
      }
    }
  })
})
