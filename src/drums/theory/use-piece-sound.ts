import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { loadPaused } from '../../audio/load-paused'
import { enablePlaybackAudioMode } from '../../audio/session'
import { demoExercise } from './bars'
import { basePieces, type BasePiece } from '../exercise'
import { planDrumSession } from '../plan'
import type { KitSamples } from '../render'
import { buildSessionTrack } from '../session-track'

/*
  O singură lovitură dintr-o piesă, la atingere.

  Separat de `usePracticeSession` fiindcă acela e făcut pentru UN plan fix, pe
  care îl resetează când se schimbă. Aici se cere altă piesă la fiecare atingere.

  Regula care rămâne aceeași: **`play()` se cheamă SINCRON, în același tick cu
  atingerea.** Un `await` sau o pornire dintr-un `useEffect` de după o schimbare
  de stare mută apelul în altă sarcină, iar browserul nu-l mai socotește pornit
  de utilizator: contextul audio rămâne suspendat, nu se aude nimic și nu se
  plânge nimeni. Pe telefon n-ar fi vizibil, acolo nu există regula de autoplay
  - deci ar trece nevăzut până în producție.

  ---

  ## De ce un player pe piesă, și nu unul singur

  Prima variantă ținea UN player și îi schimba sursa la fiecare atingere. Măsurat
  în browser, cu `play()` și `load()` instrumentate:

  | atingere            | handler | până pornește sunetul |
  |---------------------|---------|-----------------------|
  | tobă mare, prima    | 1,0 ms  | 19 ms                 |
  | tobă mică, prima    | 1,3 ms  | **437 ms**            |
  | tobă mare, a doua   | 0,9 ms  | 18 ms                 |

  Handler-ul nu era vinovat: randarea WAV e în cache și se termină într-o
  milisecundă. Vinovat era `replace()`. El aruncă elementul media și face altul
  - în log se vedea un `new Audio` la FIECARE atingere, iar `play()` pica pe un
  element cu `readyState=0`, adică fără niciun strop de date încărcat. Browserul
  aștepta blob-ul. Prima atingere a unei piese plătea tot.

  Acum fiecare piesă are playerul ei, încărcat și încălzit o dată la montare. La
  atingere nu se mai schimbă nicio sursă: se derulează la zero și se pornește un
  element deja cald. Măsurat la fel, după reparație:

  | piesă     | până pornește sunetul |
  |-----------|-----------------------|
  | tobă mare | 8,7 ms                |
  | tobă mică | 5,9 ms                |
  | fus       | 7,8 ms                |
  | tom 1     | 6,0 ms                |
  | tom 2     | 8,0 ms                |
  | cazan     | 9,2 ms                |
  | crash     | 10,8 ms               |
  | ride      | 7,6 ms                |

  Toate sub 11 ms, inclusiv prima atingere a fiecărei piese. Costul e un element
  media per piesă, fiecare cu un WAV de ~1 s, nimic față de o secundă de
  așteptare la prima lovitură.

  Efect secundar bun: două piese pot suna suprapus, fiindcă nu mai împart un
  player. Pe un set adevărat, un crash chiar sună peste toba mică.
*/

/** Tempoul e irelevant, o singură lovitură, dar planul cere unul. */
const ONE_HIT_BPM = 60

/** Cât stă piesa aprinsă pe desen după atingere. */
const LIT_MS = 420

/**
 * Cât se lasă fiecare piesă să curgă, fără volum, ca să se decodeze.
 *
 * Destul cât browserul să treacă de la „am metadatele" la „am sunetul", puțin
 * cât o atingere venită imediat după deschiderea lecției să prindă deja volumul
 * înapoi la 1.
 */
const WARMUP_MS = 120

/** Pista de o lovitură a unei piese. Pură: `buildSessionTrack` ține cache-ul. */
function oneHitTrack(piece: BasePiece, samples: KitSamples) {
  const plan = planDrumSession(
    demoExercise({
      id: `piece-${piece}`,
      stepsPerBar: 1,
      beatsPerBar: 1,
      rows: { [piece]: 'x' },
      tempo: { min: ONE_HIT_BPM, max: ONE_HIT_BPM, suggested: ONE_HIT_BPM },
    }),
    { segments: [{ bpm: ONE_HIT_BPM, repeats: 1 }], countInBars: 0, clicks: false },
  )
  return buildSessionTrack(plan, { samples, clicks: false })
}

export function usePieceSound(samples: KitSamples) {
  /*
    Câte un `useAudioPlayer` pe piesă, scrise pe rând.

    Scrise pe rând și nu într-o buclă fiindcă hook-urile cer un număr și o ordine
    fixe la fiecare randare. Lista e oricum fixă: cele nouă piese ale setului.
    Loviturile din DRSKit (cross-stick, fusul cu piciorul, clopotul, mătura) nu
    au player: pe desen nu se ating, se aprind doar în exemple.
  */
  const kick = useAudioPlayer()
  const snare = useAudioPlayer()
  const hhClosed = useAudioPlayer()
  const hhOpen = useAudioPlayer()
  const tom = useAudioPlayer()
  const mid = useAudioPlayer()
  const floor = useAudioPlayer()
  const crash = useAudioPlayer()
  const ride = useAudioPlayer()
  /*
    Harta se memorează pe instanțe, nu se ține într-un ref.

    Un ref scris în timpul randării e chiar ce interzice regula
    `react-hooks/immutability`, și pe bună dreptate. Instanțele întoarse de
    `useAudioPlayer` sunt oricum stabile între randări, deci `useMemo` pe ele dă
    un obiect stabil, exact ce trebuie ca efectul de încărcare să nu se reia și
    ca `play` să nu se refacă la fiecare redesenare.
  */
  const players = useMemo<Record<BasePiece, ReturnType<typeof useAudioPlayer>>>(
    () => ({ kick, snare, hhClosed, hhOpen, tom, mid, floor, crash, ride }),
    [kick, snare, hhClosed, hhOpen, tom, mid, floor, crash, ride],
  )

  const [playing, setPlaying] = useState<BasePiece | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let alive = true
    let warm: ReturnType<typeof setTimeout> | null = null
    void (async () => {
      /*
        Încărcarea, o dată, la montare, PIESĂ CU PIESĂ, cu o pauză între ele.

        Fiecare piesă cere o pistă randată, codată și, pe telefon, scrisă pe
        disc. Făcute toate nouă deodată, în timpul randării (cum erau, într-un
        `useMemo`), țineau firul JS ocupat la intrarea în lecție, iar ecranul
        nu răspundea la atingeri. Cu pauza, o atingere așteaptă cel mult o piesă.

        `loadPaused` oprește explicit înainte de `replace`: pe Android un player
        care a ajuns la capăt pornește singur la înlocuire.
      */
      for (const piece of basePieces) {
        if (!alive) return
        try {
          // Regula vede aici prima comandă dată playerelor; motivul pentru care
          // e un fals pozitiv e scris mai jos, la încălzire.
          // eslint-disable-next-line react-hooks/immutability -- expo-audio se comandă prin mutații
          loadPaused(players[piece], { uri: oneHitTrack(piece, samples).uri })
        } catch {
          // O piesă care nu se încarcă rămâne mută; restul desenului funcționează.
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
      }
      if (!alive) return

      /*
        Încălzirea: fiecare piesă se redă o clipă, fără volum, apoi se oprește.

        Fără ea, `replace()` lasă elementul la `readyState=1`, are metadatele, n-are
        sunetul, iar prima apăsare pe fiecare piesă plătește decodarea. Măsurat:
        1075 ms la toba mică, 175 ms la fus, ~10 ms la toate atingerile de după.
        O jumătate de secundă între deget și sunet nu e un instrument, e un
        formular.

        Volumul se pune pe zero ÎNAINTE de `play()`, nu după: invers, s-ar auzi o
        salvă de nouă lovituri la deschiderea lecției.

        Se poate face aici fiindcă până se montează diagrama utilizatorul a atins
        deja ecranul de două ori, a deschis manualul și a intrat în lecție, deci
        browserul are activare de utilizator și nu refuză redarea.

        `volume` se SCRIE pe player, iar regula `react-hooks/immutability` se
        plânge: ea presupune că valorile care trec prin hook-uri sunt imuabile.
        API-ul expo-audio e însă construit pe mutații, un player se comandă
        scriindu-i proprietățile, deci aici regula dă un fals pozitiv. Aceeași
        situație e deja în `use-practice-session.ts`, la `player.loop`; acolo
        eroarea a rămas nemarcată, ceea ce face lint-ul mai greu de citit. Aici o
        tăiem punctual, cu motivul scris.
      */
      for (const piece of basePieces) {
        try {
          players[piece].volume = 0
          players[piece].play()
        } catch {
          // Fără încălzire, prima atingere e mai lentă. Nimic nu se strică.
        }
      }
      warm = setTimeout(() => {
        for (const piece of basePieces) {
          try {
            const player = players[piece]
            player.pause()
            player.seekTo(0)
            player.volume = 1
          } catch {
            // Idem.
          }
        }
      }, WARMUP_MS)
    })()
    return () => {
      alive = false
      if (warm) clearTimeout(warm)
    }
  }, [players, samples])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const play = useCallback((piece: BasePiece) => {
    const player = players[piece]
    try {
      // Sursa e deja încărcată: rămâne doar derularea la zero și pornirea.
      player.seekTo(0)
      player.play()
    } catch {
      return
    }
    setPlaying(piece)
    /*
      Aprinderea se stinge pe ceas, nu pe sfârșitul pistei: pista ține mai mult
      decât lovitura, fiindcă lasă coada să se stingă. Ținută până la capătul
      fișierului, piesa ar rămâne aprinsă mult după ce urechea a terminat cu ea.
    */
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setPlaying(null), LIT_MS)
    void enablePlaybackAudioMode().catch(() => {
      // Fără sesiunea audio configurată redarea merge; doar fundalul nu.
    })
  }, [players])

  return { play, playing }
}
