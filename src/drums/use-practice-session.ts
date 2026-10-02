import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { loadPaused } from '../audio/load-paused'
import { enablePlaybackAudioMode } from '../audio/session'
import type { DrumPlan, PlannedBar } from './plan'
import { barFinder, createPlayhead, type Playhead } from './playhead'
import type { SessionTrack } from './session-track'

/*
  Redarea unei sesiuni de practică.

  Ceasul e poziția din fișierul audio (`player.currentTime`), nu ceasul de sistem
  și nici un timer: toată sesiunea e un singur WAV, pornit cu un singur `play()`.
  Motivul e scris în mobile/CLAUDE.md §4 și a fost plătit o dată, un metronom cu
  `setTimeout` a dus la respingerea build-ului 48, fiindcă iOS suspendă JS-ul în
  fundal, iar între două click-uri nu se reda nimic.

  De aceea hook-ul ăsta nu programează nimic. Doar citește unde s-a ajuns în
  fișier și spune ce măsură se aude.
*/

export type PracticePhase = 'idle' | 'playing' | 'done' | 'stopped'

export interface PracticeSession {
  phase: PracticePhase
  /**
   * Cât ai cântat, în ms. Zero cât timp nu s-a pornit.
   *
   * Într-o sesiune în buclă crește peste durata pistei: bucla se reia, timpul
   * tău nu. E ce se arată pe ecran la „fără limită”, și tot el se salvează.
   */
  elapsedMs: number
  /**
   * Unde ești ÎN pistă, ca ceas la care te abonezi (`playhead.ts`), nu ca
   * stare: citită la fiecare cadru, ca stare ar redesena tot ecranul de 60 de
   * ori pe secundă. Componentele care au nevoie de pas sau de piesele lovite se
   * abonează la el (`use-playhead.ts`).
   */
  playhead: Playhead
  /** Timpul cântat, exact, la momentul cererii. `elapsedMs` e rotunjit la secundă. */
  elapsed: () => number
  /** Măsura care se aude acum, sau `null` înainte de start și după final. Se schimbă o dată pe măsură. */
  bar: PlannedBar | null
  start: () => void
  /** Oprire cerută de utilizator: sesiunea NU se socotește terminată. */
  stop: () => void
  reset: () => void
}

/**
 * @param prepare Randează pista sesiunii. Se cheamă la APĂSARE, nu la fiecare
 * redesenare, vezi comentariul de mai jos.
 */
export function usePracticeSession(
  plan: DrumPlan,
  prepare: () => SessionTrack,
  onComplete?: (plan: DrumPlan) => void,
): PracticeSession {
  const player = useAudioPlayer()
  const [phase, setPhase] = useState<PracticePhase>('idle')
  /*
    Timpul cântat se arată la secundă, deci starea se schimbă o dată pe secundă;
    valoarea exactă stă în ref, pentru cine o cere (salvarea la oprire).
  */
  const [elapsedMs, setElapsedMs] = useState(0)
  const elapsedRef = useRef(0)
  const [playhead] = useState(createPlayhead)
  const [barIndex, setBarIndex] = useState(-1)
  const findBar = useMemo(() => barFinder(plan), [plan])
  /*
    Bucla trece prin zero fără să anunțe: `currentTime` sare înapoi, atât. Se
    numără reluările, ca timpul tău să crească în continuare, altfel un exercițiu
    ținut zece minute ar arăta mereu sub un minut și n-ar salva nimic.
  */
  const cycles = useRef(0)
  const lastPosition = useRef(0)
  const frame = useRef<number | null>(null)
  const started = useRef(false)
  const completed = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  /*
    Pista se randează la apăsare, nu la fiecare redesenare.

    Randată dintr-o dependență de tempo, o sesiune de 60 s înseamnă 5,3 MB de
    WAV construiți, codați și dați playerului, la FIECARE apăsare pe „+”, în
    același cadru cu atingerea. De acolo venea lag-ul la schimbarea tempoului, și
    tot de acolo veneau fișierele de cache scrise pentru tempouri prin care doar
    ai trecut. Aici se ține doar rezultatul ultimei porniri.
  */
  const prepareRef = useRef(prepare)
  prepareRef.current = prepare
  const trackRef = useRef<SessionTrack | null>(null)
  const loadedUri = useRef<string | null>(null)

  const stopLoop = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [])

  /*
    Planul s-a schimbat (alt tempo, alt mod, alt exercițiu): sesiunea de dinainte
    nu mai are ce reprezenta, deci se resetează. Altfel un „Pornește” ar continua
    de unde rămăsese cealaltă.

    Se compară CONȚINUTUL, nu obiectul. Planul e recalculat la fiecare redesenare
    a ecranului, deci pe identitate efectul ăsta ar porni și când nu s-a schimbat
    nimic, adică ar opri sesiunea care tocmai cântă, la prima redesenare venită
    din altă parte. Înainte, comparația se făcea pe adresa pistei, care ieșea
    dintr-un cache pe conținut; de aia nu se vedea.
  */
  const planKey = `${plan.exerciseId}|${plan.totalMs}|${plan.peakBpm}|${plan.bars.length}|${plan.hits.length}`
  useEffect(() => {
    stopLoop()
    started.current = false
    completed.current = false
    cycles.current = 0
    lastPosition.current = 0
    setPhase('idle')
    setElapsedMs(0)
    elapsedRef.current = 0
    playhead.set(-1)
    setBarIndex(-1)
  }, [planKey, stopLoop, playhead])

  useEffect(() => stopLoop, [stopLoop])

  const tickRef = useRef<() => void>(() => {})
  const schedule = useCallback(() => {
    frame.current = requestAnimationFrame(() => tickRef.current())
  }, [])

  const tick = useCallback(() => {
    const audioMs = player.currentTime * 1000
    if (!started.current) {
      // Până când fișierul chiar începe să curgă, poziția e 0 și nu spune nimic.
      if (audioMs <= 0) {
        schedule()
        return
      }
      started.current = true
    }
    const cycleMs = trackRef.current?.durationMs ?? plan.totalMs
    if (plan.loop) {
      // Un salt înapoi înseamnă că s-a reluat. Pragul e larg dinadins: poziția
      // e citită la fiecare cadru, deci o scădere reală e de ordinul unei pistei
      // întregi, nu al unei zecimi de secundă.
      if (audioMs + 250 < lastPosition.current) cycles.current += 1
      lastPosition.current = audioMs
    }
    playhead.set(audioMs)
    const elapsed = plan.loop ? cycles.current * cycleMs + audioMs : audioMs
    elapsedRef.current = elapsed
    // Starea se atinge doar când se schimbă ce se arată: secunda, măsura.
    setElapsedMs((current) =>
      Math.floor(current / 1000) === Math.floor(elapsed / 1000) ? current : elapsed,
    )
    const bar = findBar(audioMs)
    const index = bar ? bar.index : -1
    setBarIndex((current) => (current === index ? current : index))

    if (!plan.loop && !completed.current && audioMs >= plan.totalMs) {
      completed.current = true
      setPhase('done')
      onCompleteRef.current?.(plan)
    }
    /*
      Sfârșitul muzical și sfârșitul pistei nu sunt același moment: pista ține mai
      mult, cât să se stingă coada ultimei lovituri. Deci se anunță „terminat” la
      sfârșitul muzical, dar redarea se lasă să curgă până la capăt, oprită
      acolo, ultima lovitură s-ar tăia și s-ar auzi ca un defect.
    */
    if (!plan.loop && audioMs >= cycleMs) {
      stopLoop()
      try {
        player.pause()
      } catch {
        // Playerul poate fi deja oprit.
      }
      return
    }
    schedule()
  }, [plan, player, schedule, stopLoop, playhead, findBar])
  tickRef.current = tick

  const start = useCallback(() => {
    stopLoop()
    started.current = false
    completed.current = false
    cycles.current = 0
    lastPosition.current = 0
    setElapsedMs(0)
    elapsedRef.current = 0
    playhead.set(-1)
    setBarIndex(-1)
    setPhase('playing')
    /*
      Redarea pornește SINCRON, în același tick cu apăsarea.

      Un `await` înaintea lui `play()` mută apelul într-un microtask, iar browserul
      nu-l mai socotește pornit de utilizator: contextul audio rămâne suspendat,
      poziția stă la zero, iar ecranul îngheață pe „Numărătoare” fără nicio eroare
      și fără nimic în consolă. Pe telefon nu se vede, acolo nu există regula de
      autoplay, deci ar fi trecut mai departe nevăzut.

      Sesiunea audio se configurează după, fără `await`: e pornită oricum de la
      montarea aplicației (`app/_layout.tsx`, vezi mobile/CLAUDE.md §4), deci aici e
      doar o asigurare, nu ceva de care redarea să atârne.
    */
    try {
      /*
        Randarea se întâmplă AICI, sincron, în același tick cu apăsarea.

        Sincron, nu într-un `await`: contextul audio de pe web rămâne pornit de
        utilizator doar cât ține sarcina curentă, iar un `await` înaintea lui
        `play()` l-ar lăsa suspendat, ecranul ar îngheța pe „Numărătoare” fără
        nicio eroare. Munca lungă nu strică asta; trecerea la alt tick, da.
      */
      const track = prepareRef.current()
      trackRef.current = track
      if (loadedUri.current === track.uri) {
        player.seekTo(0)
      } else {
        // Oprit explicit înainte de `replace`: pe Android un player care a cântat
        // până la capăt pornește singur la înlocuire (vezi `loadPaused`).
        loadPaused(player, { uri: track.uri })
        loadedUri.current = track.uri
      }
      /*
        Bucla se cere DUPĂ ce sursa e încărcată, nu înainte.

        `replace()` aruncă elementul media și face altul (expo-audio, web și
        nativ deopotrivă), deci orice setare dinainte se pierde odată cu el.
        Pusă înainte, sesiunea „fără limită” se oprea tăcut la capătul primului
        ciclu, ceasul rămânea înțepenit la 1:26 și nimic nu se plângea.

        Și tot bucla playerului, nu una făcută din JS: cu ecranul blocat, un
        `seek` la capăt n-ar mai apuca să se întâmple (mobile/CLAUDE.md §4).
      */
      player.loop = plan.loop === true
      player.play()
    } catch {
      setPhase('idle')
      return
    }
    schedule()
    void enablePlaybackAudioMode().catch(() => {
      // Fără sesiunea audio configurată redarea merge, doar că nu ține aplicația
      // vie în fundal. Nu e motiv să oprim ce deja sună.
    })
  }, [plan.loop, player, schedule, stopLoop, playhead])

  const stop = useCallback(() => {
    stopLoop()
    try {
      player.pause()
    } catch {
      // Deja oprit.
    }
    // Nimic nu mai cântă, deci nimic nu mai stă aprins.
    playhead.set(-1)
    // Doar dacă n-a ajuns la capăt: altfel „Oprește” ar șterge o sesiune reușită.
    setPhase(completed.current ? 'done' : 'stopped')
  }, [player, stopLoop, playhead])

  const reset = useCallback(() => {
    stopLoop()
    started.current = false
    completed.current = false
    cycles.current = 0
    lastPosition.current = 0
    setElapsedMs(0)
    elapsedRef.current = 0
    playhead.set(-1)
    setBarIndex(-1)
    setPhase('idle')
    try {
      player.pause()
      player.seekTo(0)
    } catch {
      // Deja oprit.
    }
  }, [player, stopLoop, playhead])

  // Măsura se caută după poziția ÎN pistă, nu după cât ai cântat: în buclă, a
  // doua reluare are aceleași măsuri, nu unele noi.
  const bar =
    (phase === 'playing' || phase === 'done') && barIndex >= 0 ? (plan.bars[barIndex] ?? null) : null
  const elapsed = useCallback(() => elapsedRef.current, [])

  return { phase, elapsedMs, playhead, elapsed, bar, start, stop, reset }
}
