import type { Bar } from './exercise'

/*
  Grila comună pentru subdiviziuni amestecate în aceeași măsură.

  Un exercițiu are UN singur `stepsPerBar`: șaisprezecimile stau pe 16 pași,
  trioletele pe 12. Un fill care trece din șaisprezecimi în triolete sau în
  sextolete nu încape pe niciuna. Pe 12 pași pe timp încap toate:

    optime        din 6 în 6     (2 pe timp)
    triolet       din 4 în 4     (3 pe timp)
    șaisprezecime din 3 în 3     (4 pe timp)
    sextolet      din 2 în 2     (6 pe timp)

  Planul și randarea nu află nimic nou: pașii sunt tot egali, doar mai mulți.
  Ce se schimbă e DESENUL: 48 de pătrate pe o măsură n-ar încăpea pe telefon și
  nici nu s-ar citi, deci grila desenează fiecare timp cu subdiviziunea pe care
  o folosește cu adevărat (`beatDivisions`).

  Datele se scriu pe timpi, despărțiți de `|`, fiecare timp cu lungimea
  subdiviziunii lui: `'Xxxx|xxx|xxxxxx|x.'` = șaisprezecimi, triolet, sextolet,
  optimi. Un timp gol se scrie `.`.
*/

export const MIXED_STEPS_PER_BEAT = 12

/** Subdiviziunile care încap exact în 12. */
const DIVISIONS = [1, 2, 3, 4, 6, 12] as const

/**
 * Un rând scris pe timpi, întins pe grila de 12 pe timp.
 *
 * Aruncă dacă un timp are o lungime care nu încape în 12 sau dacă rândul n-are
 * numărul cerut de timpi: o greșeală de tipar aici ar muta lovituri pe pași
 * greșiți fără niciun alt semn.
 */
export function beatsRow(row: string, beatsPerBar = 4): string {
  const beats = row.split('|')
  if (beats.length !== beatsPerBar) {
    throw new Error(`„${row}”: ${beats.length} timpi, nu ${beatsPerBar}`)
  }
  return beats
    .map((beat) => {
      if (!DIVISIONS.includes(beat.length as (typeof DIVISIONS)[number])) {
        throw new Error(
          `„${beat}”: ${beat.length} note pe timp nu încap în ${MIXED_STEPS_PER_BEAT}`,
        )
      }
      const spacing = MIXED_STEPS_PER_BEAT / beat.length
      const out = Array<string>(MIXED_STEPS_PER_BEAT).fill('.')
      for (let index = 0; index < beat.length; index += 1) out[index * spacing] = beat[index]!
      return out.join('')
    })
    .join('')
}

/**
 * Un rând scris pe o grilă dreaptă (8, 12 sau 16 pași pe măsură de 4 timpi),
 * întins pe grila comună. Pentru groove-ul de sub fill.
 */
export function evenRow(row: string, beatsPerBar = 4): string {
  const perBeat = row.length / beatsPerBar
  const beats: string[] = []
  for (let beat = 0; beat < beatsPerBar; beat += 1) {
    beats.push(row.slice(beat * perBeat, (beat + 1) * perBeat))
  }
  return beatsRow(beats.join('|'), beatsPerBar)
}

/**
 * Câte celule desenează grila pe fiecare timp: cea mai mică subdiviziune care
 * cuprinde toate loviturile din timpul ăla, pe toate piesele, dar cel puțin 2.
 *
 * Toate piesele împart aceeași împărțire pe un timp, altfel coloanele nu s-ar
 * mai alinia: ce cade deodată trebuie să stea unul sub altul.
 */
export function beatDivisions(bar: Bar, stepsPerBar: number, beatsPerBar: number): number[] {
  const perBeat = stepsPerBar / beatsPerBar
  const lanes = Object.values(bar.lanes)
  return Array.from({ length: beatsPerBar }, (_, beat) => {
    const offsets: number[] = []
    for (const lane of lanes) {
      for (let offset = 0; offset < perBeat; offset += 1) {
        if (lane?.[beat * perBeat + offset]) offsets.push(offset)
      }
    }
    const found =
      DIVISIONS.find(
        (division) =>
          perBeat % division === 0 &&
          offsets.every((offset) => offset % (perBeat / division) === 0),
      ) ?? perBeat
    // Cel puțin două celule: o singură celulă ar arăta ca o pătrime lungă, iar
    // un timp gol sau cu o lovitură pe „unu” nu e o notă care ține tot timpul.
    return Math.max(2, found)
  })
}
