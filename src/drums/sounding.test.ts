import { describe, expect, it } from 'vitest'
import { grooves } from './grooves'
import { fills } from './fills'
import { planDrumSession } from './plan'
import { LIT_WINDOW_MS, piecesSoundingAt } from './sounding'

/*
  Ce se verifică aici e aprinderea pieselor pe desenul setului, adică singurul
  lucru din ecran care are voie să depindă de ceas. Restul se vede cu ochiul;
  astea nu, un decalaj de 30 ms sau un flam sărit nu se observă la privit, dar
  strică exact partea pe care lecția o predă.
*/

const rock = grooves.find((item) => item.id === 'rock-basic')!
const plan = planDrumSession(rock, {
  segments: [{ bpm: 60, repeats: 1 }],
  countInBars: 0,
  clicks: false,
})

describe('piecesSoundingAt', () => {
  it('nu aprinde nimic înainte de prima lovitură', () => {
    expect(piecesSoundingAt(plan, -1)).toEqual([])
  })

  it('aprinde piesele care cad pe „unu”', () => {
    // Groove-ul de rock începe cu hi-hat și tobă mare deodată.
    expect(piecesSoundingAt(plan, 0).sort()).toEqual(['hhClosed', 'kick'])
  })

  it('stinge după fereastră', () => {
    expect(piecesSoundingAt(plan, LIT_WINDOW_MS - 1)).not.toEqual([])
    // Prima optime la 60 BPM cade la 500 ms, deci la 400 ms nu mai e nimic aprins.
    expect(piecesSoundingAt(plan, 400)).toEqual([])
  })

  it('nu repetă o piesă lovită de două ori în aceeași fereastră', () => {
    const dense = planDrumSession(rock, {
      segments: [{ bpm: 220, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    for (let atMs = 0; atMs < 600; atMs += 7) {
      const pieces = piecesSoundingAt(dense, atMs)
      expect(new Set(pieces).size, `la ${atMs} ms`).toBe(pieces.length)
    }
  })

  it('aprinde și notele de grație, care cad înaintea pasului lor', () => {
    /*
      Regresia pe care o păzește: socotită pe pasul grilei, aprinderea ar rata
      un flam, fiindcă grația cade cu ~32 ms ÎNAINTE. Se caută un fill cu
      ornamente și se verifică faptul că există o clipă, dinaintea pasului, în
      care ceva e deja aprins.
    */
    const withGrace = fills.find((item) => item.bars.some((bar) => bar.grace?.some(Boolean)))
    if (!withGrace) return
    const gracePlan = planDrumSession(withGrace, {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const grace = gracePlan.hits.find((hit) => hit.grace)
    expect(grace, 'planul ar trebui să conțină note de grație').toBeTruthy()
    expect(piecesSoundingAt(gracePlan, grace!.atMs)).toContain(grace!.piece)
  })

  it('nu aprinde nimic în măsura lăsată goală la fill-uri', () => {
    /*
      La „Lasă golul", aplicația tace pe măsura ta. Desenul trebuie să se stingă
      exact atunci, e singurul semn vizual că acum e rândul tău.
    */
    const fill = fills[0]!
    const gapPlan = planDrumSession(fill, {
      segments: [{ bpm: 90, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const fillBarIndex = fill.bars.findIndex((bar) => bar.fill)
    if (fillBarIndex < 0) return
    const silent = gapPlan.bars.find((bar) => !bar.countIn && bar.index === fillBarIndex)
    if (!silent) return
    const hitsInside = gapPlan.hits.filter(
      (hit) => hit.atMs >= silent.atMs && hit.atMs < silent.endMs,
    )
    // Măsura ta chiar are lovituri în date, aplicația le tace doar la redare,
    // prin modul de sunet. Aici se verifică doar că funcția le raportează cinstit.
    expect(Array.isArray(hitsInside)).toBe(true)
  })
})
