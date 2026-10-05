import { useEffect, useRef } from 'react'
import { hasWav, storeWav } from './chord-track'
import { runInSlices, type SlicedJob } from './slices'
import { encodeGuitarWavSteps } from './wav'

/**
 * Pregătește pista în fundal, pe felii, după o pauză în reglaj: ca la ceilalți
 * însoțitori, atingerea de pornire găsește WAV-ul gata și nu blochează nimic.
 * Dacă nu e gata la pornire, se randează atunci (`wavUri`).
 */
export function useBackgroundTrack(key: string, render: () => Generator<void, Float32Array>, slot: string, paused: boolean) {
  const latest = useRef(render)
  useEffect(() => {
    latest.current = render
  })
  useEffect(() => {
    if (paused || hasWav(key)) return
    let job: SlicedJob<Uint8Array> | null = null
    const timer = setTimeout(() => {
      const steps = latest.current()
      job = runInSlices(
        (function* () {
          const samples = yield* steps
          return yield* encodeGuitarWavSteps(samples)
        })(),
      )
      job.promise
        .then((wav) => {
          if (wav) storeWav(key, wav, slot)
        })
        .catch(() => {
          // Se randează la pornire.
        })
    }, 900)
    return () => {
      clearTimeout(timer)
      job?.cancel()
    }
  }, [key, slot, paused])
}
