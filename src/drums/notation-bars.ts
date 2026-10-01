import type { Bar, DrumExercise } from './exercise'

/*
  Măsurile, așa cum se DESENEAZĂ, nu cum se cântă.

  Un exercițiu de fill are patru măsuri, din care două sunt identice: același
  groove, de două ori. Desenate amândouă, ocupă de două ori spațiul și nu spun
  nimic în plus, iar la un ecran de telefon spațiul ăla e diferența dintre „văd
  tot” și „trebuie să derulez în timp ce cânt”.

  Deci măsurile identice care vin una după alta se strâng într-una singură, cu
  marcajul „×2”. Când se cântă, capul de citire intră de fiecare dată în aceeași
  măsură desenată, adică exact ce face și un toboșar care citește o repetiție.
*/

export interface DisplayBar {
  bar: Bar
  /** Indexii din exercițiu pe care îi reprezintă. Mereu cel puțin unul. */
  sourceBars: number[]
}

/*
  Comparația se face pe conținut, serializat.

  Pe identitate de obiect n-ar merge: măsurile vin din fișiere de date unde
  fiecare e scrisă separat, deci două măsuri identice sunt obiecte diferite. Cheia
  cuprinde tot ce se vede pe ecran, loviturile, mâinile, ornamentele și marcajul
  de fill, ca două măsuri care arată la fel să se strângă, iar două care diferă
  printr-un singur ghost note să NU se strângă.
*/
const signatureOf = (bar: Bar) =>
  JSON.stringify([bar.lanes, bar.sticking ?? null, bar.grace ?? null, bar.fill ?? false])

/** Măsurile consecutive identice, strânse într-una. */
export function collapseBars(bars: readonly Bar[]): DisplayBar[] {
  const out: DisplayBar[] = []
  let previous = ''
  bars.forEach((bar, index) => {
    const signature = signatureOf(bar)
    if (out.length && signature === previous) {
      out[out.length - 1]!.sourceBars.push(index)
      return
    }
    out.push({ bar, sourceBars: [index] })
    previous = signature
  })
  return out
}

/** Măsurile desenate ale unui exercițiu. */
export const displayBarsOf = (exercise: DrumExercise) => collapseBars(exercise.bars)
