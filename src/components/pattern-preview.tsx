import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { PrimaryButton } from './ui'
import { buildRoundTrack } from '../audio/round-track'

/**
 * Reda un pattern ca exemplu: o masura de numaratoare, apoi pattern-ul.
 * Folosit si in lectii (exemplul dinaintea exercitiului) si in jocul de
 * citire (rezolvarea corecta, dupa evaluare).
 */
export function PatternPreviewButton({
  pattern,
  patternDurations,
  backingPattern,
  stepsPerBar,
  beatsPerBar = 4,
  bpm,
  label,
  playingLabel = 'Se aude...',
  tone = 'dark',
  emphasis,
}: {
  pattern: boolean[]
  /** Duratele scrise: cu ele, notele lungi se aud lungi. */
  patternDurations?: number[]
  /** Al doilea flux, care se aude sub pattern. */
  backingPattern?: boolean[]
  stepsPerBar: number
  /** Cati timpi are o masura. Implicit 4. */
  beatsPerBar?: number
  bpm: number
  label: string
  playingLabel?: string
  tone?: 'orange' | 'dark' | 'ghost'
  /** `grid` scoate metronomul in fata, pentru cand conteaza unde cade nota. */
  emphasis?: 'pattern' | 'grid'
}) {
  const player = useAudioPlayer()
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const play = useCallback(() => {
    const { uri, layout } = buildRoundTrack({
      bpm,
      stepsPerBar,
      beatsPerBar,
      pattern,
      patternDurations,
      backingPattern,
      countInBars: 1,
      // Nu urmeaza randul nimanui, deci nu e nevoie de numaratoarea de intrare.
      prepBars: 0,
      playPattern: true,
      emphasis,
    })
    player.replace({ uri })
    player.seekTo(0)
    player.play()
    setPlaying(true)
    if (timer.current) clearTimeout(timer.current)
    // Ne oprim la finalul pattern-ului, nu al pistei: barele de raspuns care
    // urmeaza sunt doar metronom si nu au ce arata aici.
    timer.current = setTimeout(() => {
      try {
        player.pause()
      } catch {
        // Playerul poate fi deja oprit.
      }
      setPlaying(false)
    }, layout.responseStartMs + 250)
  }, [backingPattern, beatsPerBar, bpm, emphasis, pattern, patternDurations, player, stepsPerBar])

  return (
    <PrimaryButton
      label={playing ? playingLabel : label}
      tone={tone}
      disabled={playing}
      onPress={play}
    />
  )
}
