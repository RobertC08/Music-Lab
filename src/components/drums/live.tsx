import type { ReactNode } from 'react'
import type { DrumPlan } from '@/lib/drums/plan'
import type { Playhead, StepCursor } from '@/lib/drums/playhead'
import { useCursor, useSoundingPieces } from '@/lib/drums/use-playhead'
import { KitDrawing } from './theory/KitDiagram'

/*
  Legăturile dintre ceasul redării (`playhead.ts`) și desenele care nu se
  abonează singure.

  Ecranul care le conține nu se mai redesenează în timpul redării; doar aceste
  învelitori mici, și doar când se schimbă ce arată: pasul (o dată pe pas) sau
  piesele lovite (o dată pe lovitură).
*/

/** Dă copilului măsura și pasul curente; redesenează o dată pe pas. */
export function WithCursor({
  cursor,
  children,
}: {
  cursor: StepCursor | undefined
  children: (bar: number, step: number) => ReactNode
}) {
  const { bar, step } = useCursor(cursor)
  return <>{children(bar, step)}</>
}

/** Desenul setului, aprins după ce sună acum. Redesenează o dată pe lovitură. */
export function LiveKitDrawing({
  playhead,
  plan,
  enabled,
  compact,
}: {
  playhead: Playhead | undefined
  plan: DrumPlan
  /** Fals: nimic aprins (tobe oprite, notație ascunsă, numărătoare). */
  enabled: boolean
  compact?: boolean
}) {
  const lit = useSoundingPieces(playhead, plan, enabled)
  return <KitDrawing lit={lit} compact={compact} />
}
