import { describe, expect, it } from 'vitest'
import type { Bar } from './exercise'
import { fills } from './fills'
import { grooves } from './grooves'
import { collapseBars, displayBarsOf } from './notation-bars'
import { rudiments } from './rudiments'

const bar = (snare: string, fill = false): Bar => ({
  lanes: { snare: [...snare].map((c) => (c === 'x' ? 'normal' : null)) },
  ...(fill ? { fill: true } : {}),
})

describe('strângerea măsurilor desenate', () => {
  it('strânge măsurile identice care vin una după alta', () => {
    const out = collapseBars([bar('x...'), bar('x...'), bar('..x.')])
    expect(out).toHaveLength(2)
    expect(out[0]!.sourceBars).toEqual([0, 1])
    expect(out[1]!.sourceBars).toEqual([2])
  })

  it('NU strânge măsuri identice despărțite de alta', () => {
    // Altfel s-ar pierde ordinea: A B A nu e același lucru cu A×2 B.
    const out = collapseBars([bar('x...'), bar('..x.'), bar('x...')])
    expect(out.map((item) => item.sourceBars)).toEqual([[0], [1], [2]])
  })

  it('nu strânge două măsuri care diferă printr-un singur pas', () => {
    expect(collapseBars([bar('x...'), bar('x..x')])).toHaveLength(2)
  })

  it('ține cont de marcajul de fill, nu doar de lovituri', () => {
    // Aceleași lovituri, dar una e măsura ta: desenate la fel, ar fi o minciună.
    expect(collapseBars([bar('x...'), bar('x...', true)])).toHaveLength(2)
  })

  it('păstrează fiecare măsură a exercițiului exact o dată', () => {
    for (const exercise of [...rudiments, ...grooves, ...fills]) {
      const seen = displayBarsOf(exercise).flatMap((item) => item.sourceBars)
      expect(seen, exercise.id).toEqual(exercise.bars.map((_, index) => index))
    }
  })

  it('scurtează fill-urile de la patru măsuri desenate la trei', () => {
    // Cele două măsuri de groove din mijloc sunt identice, desenate amândouă,
    // ocupau ecranul pe care trebuie să-l citești fără să derulezi.
    for (const exercise of fills) {
      expect(exercise.bars, exercise.id).toHaveLength(4)
      expect(displayBarsOf(exercise), exercise.id).toHaveLength(3)
    }
  })

  it('strânge bossa nova la o singură măsură desenată', () => {
    const bossa = grooves.find((item) => item.id === 'latin-bossa')!
    expect(bossa.bars).toHaveLength(2)
    expect(displayBarsOf(bossa)).toHaveLength(1)
    expect(displayBarsOf(bossa)[0]!.sourceBars).toEqual([0, 1])
  })
})
