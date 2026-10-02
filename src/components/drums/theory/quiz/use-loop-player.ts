import { useCallback, useMemo } from 'react'
import type { BassLine } from '@/lib/drums/bass'
import type { DrumExercise } from '@/lib/drums/exercise'
import { kitIfLoaded } from '@/lib/drums/kit'
import { planDrumMedley } from '@/lib/drums/plan'
import { buildSessionTrack } from '@/lib/drums/session-track'
import { stepCursor } from '@/lib/drums/playhead'
import { usePracticeSession } from '@/lib/drums/use-practice-session'

/*
  Un exemplu de quiz, redat în buclă până îl oprești.

  Aceeași mașinărie ca `ExamplePlayer` (un plan, un WAV, un singur `play()`
  pornit sincron la apăsare), fără tot ce are acolo în jur: la quiz nu se schimbă
  tempoul și nu se arată grila, fiindcă grila e chiar răspunsul.
*/

/** Ca la exemple: destule treceri cât reluarea playerului să vină rar. */
const LOOP_TARGET_MS = 20_000

export function useLoopPlayer(
  exercise: DrumExercise,
  bpm: number,
  clicks: boolean,
  bass?: BassLine,
) {
  const plan = useMemo(() => {
    const passMs = (60_000 / bpm) * exercise.beatsPerBar * exercise.bars.length
    const repeats = Math.max(1, Math.floor(LOOP_TARGET_MS / passMs))
    return planDrumMedley([{ exercise, bpm, repeats }], { countInBars: 0, clicks, loop: true })
  }, [exercise, bpm, clicks])
  const prepare = useCallback(
    () => buildSessionTrack(plan, { samples: kitIfLoaded()!, clicks, loop: true, bass }),
    [plan, clicks, bass],
  )
  const session = usePracticeSession(plan, prepare)
  const playing = session.phase === 'playing'
  /*
    Pasul care se aude, ca cursor (`playhead.ts`): grila de completat își aprinde
    singură celula, fără ca întrebarea întreagă să se redeseneze la fiecare cadru.
  */
  const cursor = useMemo(
    () => stepCursor(session.playhead, plan, (bar) => bar.index % exercise.bars.length),
    [session.playhead, plan, exercise.bars.length],
  )
  const { start, stop } = session
  const toggle = useCallback(() => (playing ? stop() : start()), [playing, start, stop])
  return { playing, toggle, stop, cursor }
}
