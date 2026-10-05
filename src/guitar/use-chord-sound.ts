import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioPlayer, type AudioPlayer } from 'expo-audio'
import { loadPaused } from '../audio/load-paused'
import { enablePlaybackAudioMode } from '../audio/session'
import type { ChordShape } from './chords'
import { chordTrackUri } from './chord-track'

/*
  Demonstrația unui acord, cu un singur player.

  La tobe fiecare piesă are playerul ei, fiindcă sunt nouă și se ating în
  orice ordine (`use-piece-sound.ts`). Aici sunt zeci de acorduri, deci un
  player per acord nu se poate. Se folosește un singur player, încărcat cu
  acordul ales ÎN MOMENTUL în care e ales (`prepare`, din atingerea pe card), și
  încălzit atunci, fără volum. Până apasă cineva „Ascultă", elementul media e
  deja cald: fără încălzire, prima apăsare plătea sute de milisecunde
  (măsurat la tobe, 437-1075 ms).

  Regula de la tobe rămâne: `play()` și încălzirea se cheamă SINCRON, în
  handler-ul de atingere. Dintr-un `useEffect`, pe web contextul audio rămâne
  suspendat și nu se aude nimic.
*/

const WARMUP_MS = 150

/*
  expo-audio se comandă scriind proprietăți pe player. Regula
  `react-hooks/immutability` presupune că tot ce iese dintr-un hook e imuabil și
  ar marca fiecare scriere; scrierea stă aici, în afara hook-ului, cu motivul
  spus o dată (aceeași situație ca în `src/drums/theory/use-piece-sound.ts`).
*/
function setVolume(player: AudioPlayer, volume: number) {
  player.volume = volume
}

export function useChordSound() {
  const player = useAudioPlayer()
  const loaded = useRef<string | null>(null)
  const warm = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stop = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(
    () => () => {
      if (warm.current) clearTimeout(warm.current)
      if (stop.current) clearTimeout(stop.current)
    },
    [],
  )

  /** Încarcă și încălzește acordul. Se cheamă din atingerea care îl alege. */
  const prepare = useCallback(
    (shape: ChordShape) => {
      const uri = chordTrackUri(shape)
      if (loaded.current === uri) return
      try {
        loadPaused(player, { uri })
        loaded.current = uri
        setVolume(player, 0)
        player.play()
      } catch {
        return
      }
      if (warm.current) clearTimeout(warm.current)
      warm.current = setTimeout(() => {
        warm.current = null
        try {
          player.pause()
          void player
            .seekTo(0)
            .then(() => setVolume(player, 1))
            .catch(() => setVolume(player, 1))
        } catch {
          // Fără încălzire, prima apăsare e doar mai lentă.
        }
      }, WARMUP_MS)
    },
    [player],
  )

  /*
    Redarea, fără să înceapă de două ori.

    `seekTo` e asincron: chemat după `play()`, derularea ajunge DUPĂ ce sunetul a
    pornit și îl trage înapoi la zero, deci se aude un început, o întrerupere și
    încă un început. Exact asta se întâmpla la prima apăsare pe un acord neales
    înainte (în generator): încălzirea pornea fără volum, apoi `play` dădea
    volumul și cerea derularea, care sosea cu întârziere.

    Acum se derulează doar când chiar e nevoie (playerul a cântat deja ceva),
    iar pornirea vine abia după ce derularea s-a terminat. Un acord abia
    încărcat e deja la zero, deci pornește direct, în aceeași atingere.
  */
  const play = useCallback(
    (shape: ChordShape) => {
      if (warm.current) {
        clearTimeout(warm.current)
        warm.current = null
      }
      const uri = chordTrackUri(shape)
      try {
        if (loaded.current !== uri) {
          loadPaused(player, { uri })
          loaded.current = uri
          setVolume(player, 1)
          player.play()
        } else if (player.playing || player.currentTime > 0.02) {
          player.pause()
          setVolume(player, 1)
          void player
            .seekTo(0)
            .then(() => player.play())
            .catch(() => {
              // Playerul s-a schimbat între timp; următoarea apăsare îl reia.
            })
        } else {
          setVolume(player, 1)
          player.play()
        }
      } catch {
        return
      }
      setPlaying(true)
      if (stop.current) clearTimeout(stop.current)
      stop.current = setTimeout(() => setPlaying(false), 5000)
      void enablePlaybackAudioMode().catch(() => {
        // Fără sesiunea audio configurată redarea merge; doar fundalul nu.
      })
    },
    [player],
  )

  const silence = useCallback(() => {
    if (warm.current) clearTimeout(warm.current)
    if (stop.current) clearTimeout(stop.current)
    try {
      player.pause()
      setVolume(player, 1)
    } catch {
      // Nimic de oprit.
    }
    setPlaying(false)
  }, [player])

  /*
    Pregătirea în fundal: sunetul formelor de pe ecran se randează din timp, câte
    una pe tick, ca ecranul să rămână liber între ele. La „Ascultă" rămân doar
    încărcarea fișierului deja scris și pornirea. Fără asta, pe telefon toată
    sinteza, codarea și scrierea se întâmplau chiar în atingere.
  */
  const queue = useRef<ChordShape[]>([])
  const pump = useRef<ReturnType<typeof setTimeout> | null>(null)
  const preload = useCallback((shapes: readonly ChordShape[]) => {
    queue.current = [...shapes]
    if (pump.current) return
    const step = () => {
      const shape = queue.current.shift()
      if (!shape) {
        pump.current = null
        return
      }
      try {
        chordTrackUri(shape)
      } catch {
        // O formă care nu se poate randa se randează la apăsare, sau deloc.
      }
      pump.current = setTimeout(step, 16)
    }
    pump.current = setTimeout(step, 50)
  }, [])
  useEffect(
    () => () => {
      queue.current = []
      if (pump.current) clearTimeout(pump.current)
    },
    [],
  )

  return { prepare, preload, play, silence, playing }
}
