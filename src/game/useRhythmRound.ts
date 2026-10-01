import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useAudioPlayer } from 'expo-audio'
import { loadPaused } from '../../audio/load-paused'
import { ensurePlaybackEnabled } from '../../audio/session'
import { haptic } from '../../haptics/game-haptics'
import { buildRoundTrack, type RoundTrackLayout } from '../audio/round-track'
import { hapticCueAt } from './haptic-cues'
import { scoreRound, type RoundScore } from './rhythm'

export type RoundPhase = 'ready' | 'countIn' | 'listen' | 'prep' | 'respond' | 'result'

const COUNT_IN_BARS = 1
const PREP_BARS = 1
/**
 * O bataie auzita vibreaza doar daca bucla a prins-o la timp. Dupa o blocare
 * sau un salt, bataile trecute raman fara vibratie, altfel ar veni in rafala.
 */
const HAPTIC_LATE_MS = 90

const now = () => globalThis.performance?.now?.() ?? Date.now()

export interface RhythmRoundSpec {
  pattern: boolean[]
  stepsPerBar: number
  /** Cati timpi are o masura. Implicit 4. */
  beatsPerBar?: number
  bpm: number
  /** Fals pentru jocul de citire: pattern-ul se vede, nu se aude. */
  playPattern?: boolean
  /** Durata fiecarei note in pasi; lipsa ei = pana la urmatorul atac. */
  patternDurations?: number[]
  /** Al doilea flux: se aude, nu se bate, nu se puncteaza. */
  backingPattern?: boolean[]
  /**
   * Chemat o singura data, cand runda s-a terminat si are scor: aici ecranul
   * salveaza rezultatul, porneste sunetul de bucurie si haptica de final.
   */
  onResult?: (result: RoundScore) => void
  /**
   * O pista gata randata (Ecoul groove-ului, cu tobe pe mai multe voci). Cu ea,
   * `pattern` si restul nu mai conteaza pentru audio, doar `bpm` si `beatsPerBar`
   * (pentru numaratoare si haptica).
   */
  track?: { uri: string; layout: RoundTrackLayout }
  /**
   * Scorul rundei, cand bataile vin de pe mai multe pad-uri: primeste fiecare
   * bataie cu padul ei (`lane`, indexul dat la `pressIn`). Fara el, se
   * puncteaza ca o singura linie.
   */
  scoreTaps?: (taps: { atMs: number; lane: number }[], stepMs: number) => RoundScore
}

/**
 * Motorul unei runde de ritm: redare, faze, inregistrarea bataillor si scor.
 * Ceasul rundei este pozitia din fisierul audio, nu ceasul de sistem - `play()`
 * nu produce sunet instantaneu, iar imaginea trebuie sa urmeze sunetul.
 */
export function useRhythmRound({
  pattern,
  stepsPerBar,
  beatsPerBar = 4,
  bpm,
  playPattern = true,
  patternDurations,
  backingPattern,
  onResult,
  track: providedTrack,
  scoreTaps,
}: RhythmRoundSpec) {
  const player = useAudioPlayer()
  useEffect(() => {
    ensurePlaybackEnabled()
  }, [])
  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])
  const [phase, setPhase] = useState<RoundPhase>('ready')
  const [elapsed, setElapsed] = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const [result, setResult] = useState<RoundScore | null>(null)

  const track = useMemo(
    () =>
      providedTrack ??
      buildRoundTrack({
        bpm,
        stepsPerBar,
        beatsPerBar,
        pattern,
        countInBars: COUNT_IN_BARS,
        prepBars: PREP_BARS,
        playPattern,
        patternDurations,
        backingPattern,
      }),
    [backingPattern, beatsPerBar, bpm, pattern, patternDurations, playPattern, providedTrack, stepsPerBar],
  )

  const taps = useRef<number[]>([])
  /** Padul fiecarei batai, aliniat cu `taps` (0 cand e un singur pad). */
  const tapLanes = useRef<number[]>([])
  /** Cat a tinut apasat la fiecare bataie, aliniat cu `taps`. */
  const holds = useRef<number[]>([])
  /** Momentul apasarii in curs, cat timp degetul e jos. */
  const pressedAt = useRef<number | null>(null)
  const [holding, setHolding] = useState(false)
  const frame = useRef<number | null>(null)
  const finished = useRef(false)
  const audioStarted = useRef(false)
  /** Diferenta dintre ceasul audio si cel de sistem, pentru bataile intre cadre. */
  const clockOffsets = useRef<number[]>([])
  /**
   * Unde ne ducem printr-un salt, cat timp `seekTo` inca nu a aterizat.
   * `player.currentTime` mai raporteaza cateva cadre pozitia veche, iar fara
   * asta bucla ar da faza inapoi si ar aduna decalaje de ceas dinainte de salt.
   */
  const seekTarget = useRef<number | null>(null)
  /** Ultima bataie auzita care a vibrat (cheia din `hapticCueAt`). */
  const lastHaptic = useRef('')

  const stopLoop = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [])

  useEffect(() => stopLoop, [stopLoop])

  // Pista se incarca de cum e cunoscuta runda, ca `play()` sa nu mai astepte.
  useEffect(() => {
    try {
      // Oprit: dupa o runda ascultata pana la capat, pe Android pista noua ar porni singura.
      loadPaused(player, { uri: track.uri })
    } catch {
      // Daca playerul nu e gata inca, `start` reincearca oricum.
    }
  }, [player, track.uri])

  /** Pozitia in fisierul audio, estimata pentru momentul exact al atingerii. */
  const audioClockNow = useCallback(() => {
    const offsets = clockOffsets.current
    if (!offsets.length) return player.currentTime * 1000
    const sorted = [...offsets].sort((left, right) => left - right)
    const middle = Math.floor(sorted.length / 2)
    const offset =
      sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
    return now() + offset
  }, [player])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    stopLoop()
    try {
      player.pause()
    } catch {
      // Playerul poate fi deja oprit.
    }
    // O apasare inca in curs la finalul rundei se inchide aici, altfel nota
    // ar aparea ca netinuta desi degetul era jos.
    if (pressedAt.current !== null) {
      holds.current[taps.current.length - 1] = Math.max(0, audioClockNow() - pressedAt.current)
      pressedAt.current = null
      setHolding(false)
    }
    // Durata se judeca doar cand notatia o specifica. La pattern-urile
    // generate, redate ca lovituri de percutie, nu exista „cat tine nota" -
    // ar fi o cerinta inventata.
    const scored = scoreTaps
      ? scoreTaps(
          taps.current.map((atMs, index) => ({ atMs, lane: tapLanes.current[index] ?? 0 })),
          track.layout.stepMs,
        )
      : scoreRound(
          track.layout.targetTimesMs,
          taps.current,
          track.layout.stepMs,
          patternDurations
            ? {
                tapDurationsMs: holds.current,
                targetDurationsMs: track.layout.targetDurationsMs,
              }
            : undefined,
        )
    setResult(scored)
    setPhase('result')
    onResultRef.current?.(scored)
  }, [audioClockNow, patternDurations, player, scoreTaps, stopLoop, track])

  /**
   * Bucla citeste mereu ultima versiune a lui `tick` (prin ref), ca sa nu se
   * refere la ea insasi inainte de a fi declarata.
   */
  const tickRef = useRef<() => void>(() => {})
  const scheduleTick = useCallback(() => {
    frame.current = requestAnimationFrame(() => tickRef.current())
  }, [])

  const tick = useCallback(() => {
    const audioMs = player.currentTime * 1000

    if (!audioStarted.current) {
      if (audioMs <= 0) {
        scheduleTick()
        return
      }
      audioStarted.current = true
    }

    // Saltul e in curs: pozitia raportata e inca cea veche, deci nu o credem.
    if (seekTarget.current !== null) {
      if (audioMs < seekTarget.current - 50) {
        scheduleTick()
        return
      }
      seekTarget.current = null
    }

    const offsets = clockOffsets.current
    offsets.push(audioMs - now())
    if (offsets.length > 12) offsets.shift()

    setElapsed(audioMs)
    // Pulsul auzit se simte si in palma (numaratoarea, exemplul, pregatirea).
    const cue = hapticCueAt(track.layout, bpm, audioMs, beatsPerBar)
    if (cue && cue.key !== lastHaptic.current) {
      lastHaptic.current = cue.key
      if (audioMs - cue.atMs <= HAPTIC_LATE_MS) haptic(cue.kind)
    }
    if (
      audioMs >= track.layout.totalMs ||
      (!player.playing && audioMs >= track.layout.responseStartMs)
    ) {
      finish()
      return
    }
    setPhase(
      audioMs < track.layout.patternStartMs
        ? 'countIn'
        : audioMs < track.layout.prepStartMs
          ? 'listen'
          : audioMs < track.layout.responseStartMs
            ? 'prep'
            : 'respond',
    )
    scheduleTick()
  }, [beatsPerBar, bpm, finish, player, scheduleTick, track])

  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  /**
   * Sare peste numaratoare si peste exemplu, direct la masura de pregatire.
   * Masura aceea nu se sare niciodata: fara ea ai intra la bataie fara puls
   * asezat, iar prima nota ar iesi gresit din cauza pornirii, nu a ritmului.
   */
  const skipToPrep = useCallback(() => {
    if (phase !== 'countIn' && phase !== 'listen') return
    const target = track.layout.prepStartMs
    seekTarget.current = target
    // Pozitia audio sare, deci decalajele stranse pana acum arata spre alt
    // moment din pista. Pastrate, ar deplasa fiecare bataie de dupa salt.
    clockOffsets.current = []
    setElapsed(target)
    setPhase('prep')
    try {
      void Promise.resolve(player.seekTo(target / 1000)).catch(() => {})
    } catch {
      seekTarget.current = null
    }
  }, [phase, player, track])

  const start = useCallback(() => {
    finished.current = false
    audioStarted.current = false
    seekTarget.current = null
    lastHaptic.current = ''
    clockOffsets.current = []
    taps.current = []
    tapLanes.current = []
    holds.current = []
    pressedAt.current = null
    setHolding(false)
    setTapCount(0)
    setResult(null)
    setElapsed(0)
    setPhase('countIn')
    player.replace({ uri: track.uri })
    player.play()
    tickRef.current = tick
    scheduleTick()
  }, [player, scheduleTick, tick, track.uri])

  const reset = useCallback(() => {
    stopLoop()
    // O runda oprita la jumatate (iesire, aplicatia in fundal) nu mai suna.
    try {
      if (player.playing) player.pause()
    } catch {
      // Playerul poate fi deja eliberat.
    }
    finished.current = false
    audioStarted.current = false
    seekTarget.current = null
    lastHaptic.current = ''
    taps.current = []
    tapLanes.current = []
    holds.current = []
    pressedAt.current = null
    setHolding(false)
    setTapCount(0)
    setResult(null)
    setElapsed(0)
    setPhase('ready')
  }, [player, stopLoop])

  // Runda nu continua in fundal: bataile n-ar mai avea cum sa ajunga, iar la
  // intoarcere s-ar judeca o runda pe care n-a jucat-o nimeni. O luam de la capat.
  useEffect(() => {
    if (phase === 'ready' || phase === 'result') return
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') return
      reset()
    })
    return () => subscription.remove()
  }, [phase, reset])

  const pressIn = useCallback((lane = 0) => {
    if (phase !== 'respond' && phase !== 'prep') return
    const at = audioClockNow()
    // O bataie putin inaintea barei de raspuns e fireasca la cine simte pulsul.
    if (at < track.layout.responseStartMs - track.layout.stepMs) return
    taps.current.push(at)
    tapLanes.current.push(typeof lane === 'number' ? lane : 0)
    holds.current.push(0)
    pressedAt.current = at
    setHolding(true)
    setTapCount(taps.current.length)
    // Vocabularul haptic al jocurilor (lib/haptics): `tap` e bataia pe pad.
    haptic('tap')
  }, [audioClockNow, phase, track])

  const pressOut = useCallback(() => {
    if (pressedAt.current === null) return
    const held = Math.max(0, audioClockNow() - pressedAt.current)
    holds.current[taps.current.length - 1] = held
    pressedAt.current = null
    setHolding(false)
  }, [audioClockNow])

  /** Numaratoarea afisata, si la intrare si inaintea randului utilizatorului. */
  const countInBeat = useMemo(() => {
    const beatMs = 60_000 / bpm
    // Numaratoarea tine o masura, deci se opreste la cati timpi are ea: in
    // 2/4 sunt doi, nu patru.
    if (phase === 'countIn') return Math.min(beatsPerBar, Math.floor(elapsed / beatMs) + 1)
    if (phase === 'prep') {
      return Math.min(
        beatsPerBar,
        Math.floor((elapsed - track.layout.prepStartMs) / beatMs) + 1,
      )
    }
    return 0
  }, [beatsPerBar, bpm, elapsed, phase, track.layout.prepStartMs])

  return {
    phase,
    elapsed,
    tapCount,
    result,
    layout: track.layout as RoundTrackLayout,
    targetCount: track.layout.targetTimesMs.length,
    countInBeat,
    holding,
    /** Exista ceva de sarit: numaratoarea sau exemplul, nu si pregatirea. */
    canSkip: phase === 'countIn' || phase === 'listen',
    start,
    reset,
    skipToPrep,
    pressIn,
    pressOut,
  }
}
