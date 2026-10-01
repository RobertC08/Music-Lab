import { useCallback, useSyncExternalStore } from 'react'

/*
  Shim de store pentru sandbox.

  Aplicația folosește zustand cu persistență, sincronizare în cont și încă vreo
  douăzeci de câmpuri. Aici nu ne trebuie niciunul: ecranul de tobe citește doar
  `drumProgress` și scrie prin două acțiuni. Deci shim-ul ține exact atât, în
  memorie, cu aceeași formă de selector — ca fișierul portat să rămână identic.

  Ce NU face, și se vede: nu salvează nimic. La reîncărcarea paginii, deblocările
  se pierd. În sandbox e chiar util — pornești mereu de la primul rudiment și vezi
  lanțul de la capăt.
*/

export interface DrumExerciseProgress {
  completedAt: string
  bestTempo: number
  longestSeconds: number
}

export interface DrumProgress {
  exercises: Record<string, DrumExerciseProgress>
}

interface GuestPracticeSessionInput {
  durationSeconds: number
  source: 'routine' | 'free' | 'game' | 'drums'
  title: string
}

interface State {
  drumProgress: DrumProgress
  completeDrumSession: (exerciseId: string, bpm: number, durationSeconds: number) => void
  addSession: (session: GuestPracticeSessionInput) => void
}

const listeners = new Set<() => void>()

let state: State = {
  drumProgress: { exercises: {} },
  completeDrumSession: (exerciseId, bpm, durationSeconds) => {
    const previous = state.drumProgress.exercises[exerciseId]
    state = {
      ...state,
      drumProgress: {
        exercises: {
          ...state.drumProgress.exercises,
          [exerciseId]: {
            completedAt: previous?.completedAt ?? new Date().toISOString(),
            bestTempo: Math.max(previous?.bestTempo ?? 0, Math.round(bpm)),
            longestSeconds: Math.max(previous?.longestSeconds ?? 0, Math.round(durationSeconds)),
          },
        },
      },
    }
    for (const listener of listeners) listener()
  },
  addSession: (session) => {
    // În aplicație asta intră în istoric și în streak. Aici doar se vede în consolă.
    console.log('[sandbox] sesiune salvată', session)
  },
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useGuestStore<T>(selector: (value: State) => T): T {
  const snapshot = useCallback(() => selector(state), [selector])
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}
