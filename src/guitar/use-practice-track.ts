import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { loadPaused } from '../audio/load-paused'
import { enablePlaybackAudioMode } from '../audio/session'

/*
  Redarea unei sesiuni de practică la chitară (schimbări de acorduri, strumming).

  Ceasul e poziția din fișier (`player.currentTime`), nu un temporizator: toată
  sesiunea e un singur WAV, pornit cu un singur `play()` (mobile/CLAUDE.md §4,
  aceeași regulă ca la tobe, `src/drums/use-practice-session.ts`). Hook-ul nu
  programează nimic; la fiecare cadru citește unde a ajuns fișierul și de acolo
  unitatea de timp a exercițiului (timpul la schimbări, pasul grilei la
  strumming). Starea se atinge doar când se schimbă unitatea, nu la fiecare cadru.

  Pornirea e SINCRONĂ în atingere: pista se randează și se pornește în același
  tick, altfel pe web contextul audio rămâne suspendat, fără nicio eroare.
*/

export type PracticePhase = 'idle' | 'playing' | 'done'

export interface PreparedTrack {
  uri: string
  /** Unitatea citită: un timp (schimbări) sau un pas din grilă (strumming). */
  unitMs: number
  /** Sfârșitul muzical: după el sesiunea e „gata", chiar dacă mai sună coada. */
  durationMs: number
}

export function usePracticeTrack() {
  const player = useAudioPlayer()
  const [phase, setPhase] = useState<PracticePhase>('idle')
  /** Unitatea curentă din sesiune (timp sau pas), -1 înainte de pornire. */
  const [unit, setUnit] = useState(-1)
  const [track, setTrack] = useState<PreparedTrack | null>(null)
  /** Crește la fiecare pornire, ca bucla de citire să repornească și la aceeași pistă. */
  const [run, setRun] = useState(0)
  const loaded = useRef<string | null>(null)

  useEffect(() => {
    if (phase !== 'playing' || !track) return
    let frame: number | null = null
    let started = false
    const tick = () => {
      const ms = player.currentTime * 1000
      // Până când fișierul chiar curge, poziția e 0 și nu spune nimic.
      if (!started && ms <= 0) {
        frame = requestAnimationFrame(tick)
        return
      }
      started = true
      const current = Math.floor(ms / track.unitMs)
      setUnit((previous) => (previous === current ? previous : current))
      if (ms >= track.durationMs) {
        setPhase('done')
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [phase, track, run, player])

  const start = useCallback(
    (prepare: () => PreparedTrack) => {
      let next: PreparedTrack
      try {
        next = prepare()
        if (loaded.current === next.uri) {
          // Derularea întâi, pornirea după: `seekTo` e asincron, iar pornit
          // înainte, sunetul ar începe și ar fi tras înapoi la zero.
          player.pause()
          void player
            .seekTo(0)
            .then(() => player.play())
            .catch(() => {})
        } else {
          loadPaused(player, { uri: next.uri })
          loaded.current = next.uri
          player.play()
        }
      } catch {
        return
      }
      setTrack(next)
      setUnit(-1)
      setPhase('playing')
      setRun((value) => value + 1)
      void enablePlaybackAudioMode().catch(() => {
        // Fără sesiunea audio configurată redarea merge; doar fundalul nu.
      })
    },
    [player],
  )

  const stop = useCallback(() => {
    try {
      player.pause()
    } catch {
      // Deja oprit.
    }
    setPhase('idle')
    setUnit(-1)
  }, [player])

  // La ieșirea din ecran, sunetul se oprește.
  useEffect(
    () => () => {
      try {
        player.pause()
      } catch {
        // Playerul e deja eliberat.
      }
    },
    [player],
  )

  return { phase, unit, start, stop }
}
