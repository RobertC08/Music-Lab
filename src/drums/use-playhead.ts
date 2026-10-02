import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { KitPiece } from './exercise'
import type { DrumPlan } from './plan'
import { decodeCursor, soundingKey, type Playhead, type StepCursor } from './playhead'

/*
  Abonamentele la poziție (`playhead.ts`), pentru componente.

  Fiecare hook calculează din poziție o valoare simplă (un număr, un boolean, un
  șir). `useSyncExternalStore` o recalculează la fiecare cadru, dar redesenează
  componenta doar când valoarea s-a schimbat. Așa o celulă din grilă se
  redesenează de două ori pe pas (se aprinde, se stinge), nu de 60 de ori pe
  secundă împreună cu tot ecranul.
*/

const noopSubscribe = () => () => {}

/** O valoare derivată din poziție. `select` trebuie să întoarcă un primitiv. */
export function usePlayheadValue<T extends string | number | boolean>(
  playhead: Playhead | undefined,
  select: (positionMs: number) => T,
  fallback: T,
): T {
  const subscribe = playhead?.subscribe ?? noopSubscribe
  const snapshot = () => (playhead ? select(playhead.position()) : fallback)
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/** Măsura și pasul curente. Redesenează o dată pe pas. */
export function useCursor(cursor: StepCursor | undefined) {
  const subscribe = cursor?.subscribe ?? noopSubscribe
  const snapshot = () => (cursor ? cursor.get() : -1)
  const value = useSyncExternalStore(subscribe, snapshot, snapshot)
  return useMemo(() => decodeCursor(value), [value])
}

/**
 * E aprinsă o celulă? Celula ține pașii `[step, step + span)` din măsurile
 * `bars` ale notației. Redesenează doar când se aprinde sau se stinge.
 */
export function useCellActive(
  cursor: StepCursor | undefined,
  bars: readonly number[],
  step: number,
  span: number,
) {
  const subscribe = cursor?.subscribe ?? noopSubscribe
  const snapshot = useCallback(() => {
    if (!cursor) return false
    const value = cursor.get()
    if (value < 0) return false
    const { bar, step: current } = decodeCursor(value)
    return bars.includes(bar) && current >= step && current < step + span
  }, [cursor, bars, step, span])
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/** Piesele care sună acum. Redesenează doar când se schimbă lista. */
export function useSoundingPieces(
  playhead: Playhead | undefined,
  plan: DrumPlan,
  enabled: boolean,
): KitPiece[] {
  const read = useMemo(() => (playhead ? soundingKey(playhead, plan) : null), [playhead, plan])
  const subscribe = playhead?.subscribe ?? noopSubscribe
  const snapshot = () => (enabled && read ? read() : '')
  const key = useSyncExternalStore(subscribe, snapshot, snapshot)
  return useMemo(() => (key ? (key.split(',') as KitPiece[]) : []), [key])
}
