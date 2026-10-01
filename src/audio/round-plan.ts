import { durationsFromPattern } from '../game/notation-tokens'

/**
 * Randeaza intreaga runda (count-in, pattern, bare de raspuns) intr-un singur
 * WAV. Redarea devine un singur `play()`, deci nu mai exista timere JS intre
 * beat-uri si nici drift acumulat - jitter-ul masurat pe bancul de test
 * dispare din lantul audio.
 *
 * Ce ramane necompensat este latenta de iesire a placii/difuzorului, care e
 * constanta pe un device dat. Aceea se corecteaza statistic la scor.
 */

const SAMPLE_RATE = 44_100

export interface RoundTrackSpec {
  bpm: number
  /** Cati pasi are o masura (8 = optimi in 4/4). */
  stepsPerBar: number
  /**
   * Cati timpi are o masura. Implicit 4, adica 4/4. Doar asta deosebeste
   * masura de 2/4 de cea de 4/4: pasii raman la fel de lungi, se schimba
   * unde cade bara si, cu ea, accentul.
   */
  beatsPerBar?: number
  /** Pattern-ul, un flag per pas, pe toata lungimea lui. */
  pattern: boolean[]
  /**
   * Durata fiecarei note, in pasi, in ordinea atacurilor. Lipsa ei inseamna
   * ca fiecare nota tine pana la urmatorul atac.
   */
  patternDurations?: number[]
  /** Masuri de metronom inainte de pattern. */
  countInBars: number
  /**
   * Masuri de metronom intre pattern si randul utilizatorului. Fara ele se
   * intra rece imediat dupa ultima lovitura auzita, ceea ce face jocul mai
   * greu decat ar trebui: creierul are nevoie de o masura ca sa aseze
   * pattern-ul inainte de a-l reproduce.
   */
  prepBars: number
  /**
   * Cand e fals, pattern-ul nu se aude inainte de randul utilizatorului -
   * ramane doar metronomul. Asa se citeste de pe notatie, nu dupa ureche.
   */
  playPattern?: boolean
  /**
   * Un al doilea flux, pe aceeasi grila, care se aude dar NU se bate: nu
   * intra in tinte si nu se puncteaza. Continua si in fereastra de raspuns,
   * fiindca tocmai impotriva lui se bate - asa se exerseaza poliritmul, o
   * mana pe fiecare flux, fara a cere doua zone de atingere.
   */
  backingPattern?: boolean[]
  /**
   * Cine e in prim-plan.
   * - `pattern`: notele domina. Asa se invata un ritm dupa ureche.
   * - `grid`: metronomul e mai tare si notele mai discrete. Asa se aude
   *   *unde cade* fiecare nota fata de timpi - ce conteaza la rezolvare si
   *   la contratimp.
   */
  emphasis?: 'pattern' | 'grid'
}

export interface RoundTrackLayout {
  /** Durata unui pas, in ms. */
  stepMs: number
  /** Momentul in care incepe redarea pattern-ului, de la t=0 al fisierului. */
  patternStartMs: number
  /** Momentul in care incepe numaratoarea dinaintea randului utilizatorului. */
  prepStartMs: number
  /** Momentul in care utilizatorul trebuie sa inceapa sa bata. */
  responseStartMs: number
  /** Momentele tinta pentru loviturile utilizatorului, in ms de la t=0. */
  targetTimesMs: number[]
  /** Cat tine fiecare nota, in ms, aliniat cu `targetTimesMs`. */
  targetDurationsMs: number[]
  /** Durata totala a fisierului, in ms. */
  totalMs: number
}

type Voice = 'accent' | 'quarter' | 'hit' | 'backing'

interface ScheduledVoice {
  atMs: number
  voice: Voice
  /**
   * Cat tine nota. Cand lipseste, vocea suna percutiv, cu stingerea ei
   * proprie. Cand e data, tonul se sustine - o doime trebuie sa se auda
   * lunga, altfel notatia promite o durata pe care sunetul nu o arata.
   */
  durationMs?: number
}

interface VoiceSpec {
  frequency: number
  decay: number
  gain: number
  /**
   * Cat dureaza atacul, in secunde. Un atac foarte scurt pe o sinusoida nu da
   * o nota, ci un pocnet: tranzitoriul acopera tot spectrul si suna strident.
   * Click-urile de metronom au voie sa fie seci; notele nu.
   */
  attack: number
}

/** Parametrii fiecarei voci: frecventa, durata si amplitudine. */
const voicesByEmphasis: Record<'pattern' | 'grid', Record<Voice, VoiceSpec>> = {
  pattern: {
    // Click-ul de „unu", cel mai inalt si mai scurt.
    accent: { frequency: 1_760, decay: 0.045, gain: 0.62, attack: 0.0012 },
    // Patrimile de referinta: grila, dar audibila.
    quarter: { frequency: 1_100, decay: 0.035, gain: 0.34, attack: 0.0012 },
    // Nota: mai joasa, mai lunga si cu atac moale - sa sune a instrument, nu
    // a semnal de test.
    hit: { frequency: 440, decay: 0.13, gain: 0.42, attack: 0.007 },
    // Fluxul celalalt: cu o cvinta mai jos, ca urechea sa-l tina separat de
    // al tau. Daca ar avea aceeasi frecventa, cele doua s-ar topi intr-unul
    // singur exact cand se suprapun - adica unde e toata lectia.
    backing: { frequency: 294, decay: 0.15, gain: 0.34, attack: 0.008 },
  },
  grid: {
    accent: { frequency: 1_760, decay: 0.05, gain: 0.85, attack: 0.0012 },
    quarter: { frequency: 1_100, decay: 0.04, gain: 0.58, attack: 0.0012 },
    hit: { frequency: 440, decay: 0.13, gain: 0.3, attack: 0.007 },
    backing: { frequency: 294, decay: 0.15, gain: 0.3, attack: 0.008 },
  },
}

export function planRoundTrack(spec: RoundTrackSpec): RoundTrackLayout & { events: ScheduledVoice[] } {
  const beatMs = 60_000 / spec.bpm
  const beatsPerBar = spec.beatsPerBar ?? 4
  // Un pas e o subdiviziune a patrimii: 8 pasi pe masura => optimi in 4/4.
  const stepsPerBeat = spec.stepsPerBar / beatsPerBar
  const stepMs = beatMs / stepsPerBeat
  const barMs = beatMs * beatsPerBar

  const playPattern = spec.playPattern !== false
  const patternBars = Math.ceil(spec.pattern.length / spec.stepsPerBar)
  const patternStartMs = spec.countInBars * barMs
  const patternMs = patternBars * barMs
  // Fara audiere, faza de ascultare are durata zero si se trece direct la
  // numaratoarea dinaintea raspunsului.
  const prepStartMs = patternStartMs + (playPattern ? patternMs : 0)
  const responseStartMs = prepStartMs + spec.prepBars * barMs
  // O masura de coada dupa raspuns, ca ultima lovitura sa aiba unde „respira".
  const totalMs = responseStartMs + patternMs + beatMs

  const events: ScheduledVoice[] = []

  // Count-in: cate un click pe fiecare timp al masurii, cu accent pe „unu".
  // Numarul de click-uri urmeaza `beatsPerBar`: patru intr-o masura de 2/4
  // ar depasi bara si s-ar auzi peste ce urmeaza.
  for (let bar = 0; bar < spec.countInBars; bar += 1) {
    for (let beat = 0; beat < beatsPerBar; beat += 1) {
      events.push({
        atMs: bar * barMs + beat * beatMs,
        voice: beat === 0 ? 'accent' : 'quarter',
      })
    }
  }

  // Pattern: patrimile raman ca grila sub el, loviturile sunt in prim-plan.
  if (playPattern) {
    for (let bar = 0; bar < patternBars; bar += 1) {
      for (let beat = 0; beat < beatsPerBar; beat += 1) {
        events.push({
          atMs: patternStartMs + bar * barMs + beat * beatMs,
          voice: beat === 0 ? 'accent' : 'quarter',
        })
      }
    }
  }
  const targetTimesMs: number[] = []
  spec.pattern.forEach((isHit, step) => {
    if (!isHit) return
    if (playPattern) {
      const durationSteps = spec.patternDurations?.[targetTimesMs.length]
      events.push({
        atMs: patternStartMs + step * stepMs,
        voice: 'hit',
        // Doar cand notatia spune cat tine nota; altfel ramane percutiv.
        durationMs: durationSteps ? durationSteps * stepMs : undefined,
      })
    }
    // Aceeasi pozitie, in fereastra de raspuns, e ce trebuie reprodus.
    targetTimesMs.push(responseStartMs + step * stepMs)
  })

  // Fluxul care se aude dar nu se bate. Sta si sub pattern la ascultare, si
  // sub raspuns: fara el in fereastra de raspuns nu ar exista poliritm, ci
  // doar un ritm ciudat batut singur.
  spec.backingPattern?.forEach((isHit, step) => {
    if (!isHit) return
    if (playPattern) {
      events.push({ atMs: patternStartMs + step * stepMs, voice: 'backing' })
    }
    events.push({ atMs: responseStartMs + step * stepMs, voice: 'backing' })
  })

  // Numaratoarea dinaintea randului utilizatorului: aceleasi patrimi, ca sa
  // stie exact pe ce „unu" intra.
  for (let bar = 0; bar < spec.prepBars; bar += 1) {
    for (let beat = 0; beat < beatsPerBar; beat += 1) {
      events.push({
        atMs: prepStartMs + bar * barMs + beat * beatMs,
        voice: beat === 0 ? 'accent' : 'quarter',
      })
    }
  }

  // Barele de raspuns: doar grila, fara pattern - utilizatorul il pune el.
  for (let bar = 0; bar < patternBars; bar += 1) {
    for (let beat = 0; beat < beatsPerBar; beat += 1) {
      events.push({
        atMs: responseStartMs + bar * barMs + beat * beatMs,
        voice: beat === 0 ? 'accent' : 'quarter',
      })
    }
  }

  const fallbackDurations = durationsFromPattern(spec.pattern)
  const targetDurationsMs = targetTimesMs.map(
    (_, index) => (spec.patternDurations?.[index] ?? fallbackDurations[index] ?? 1) * stepMs,
  )

  return {
    stepMs,
    patternStartMs,
    prepStartMs,
    responseStartMs,
    targetTimesMs,
    targetDurationsMs,
    totalMs,
    events,
  }
}

export function renderWav(
  events: ScheduledVoice[],
  totalMs: number,
  emphasis: 'pattern' | 'grid' = 'pattern',
) {
  const voices = voicesByEmphasis[emphasis]
  const sampleCount = Math.ceil((totalMs / 1000) * SAMPLE_RATE)
  const samples = new Float32Array(sampleCount)

  events.forEach(({ atMs, voice, durationMs }) => {
    const { frequency, decay, gain, attack: attackSeconds } = voices[voice]
    const startSample = Math.floor((atMs / 1000) * SAMPLE_RATE)
    // O nota sustinuta se opreste putin inaintea urmatoarei, ca sa se auda
    // doua note, nu una singura lunga.
    const sustainSeconds = durationMs ? (durationMs / 1000) * 0.92 : null
    const lengthSeconds = sustainSeconds ?? decay * 3
    const length = Math.min(Math.ceil(lengthSeconds * SAMPLE_RATE), sampleCount - startSample)
    const releaseSeconds = 0.05

    for (let index = 0; index < length; index += 1) {
      const time = index / SAMPLE_RATE
      const attack = Math.min(1, time / attackSeconds)
      let envelope: number
      if (sustainSeconds === null) {
        envelope = attack * Math.exp(-time / decay)
      } else {
        // Corp sustinut, cu o stingere lenta, apoi o coada scurta la final.
        const body = 0.35 + 0.65 * Math.exp(-time / (sustainSeconds * 1.6))
        const remaining = sustainSeconds - time
        const release = remaining < releaseSeconds ? Math.max(0, remaining / releaseSeconds) : 1
        envelope = attack * body * release
      }
      const value = Math.sin(2 * Math.PI * frequency * time) * envelope * gain
      samples[startSample + index] = (samples[startSample + index] ?? 0) + value
    }
  })

  const bytes = new Uint8Array(44 + sampleCount * 2)
  const view = new DataView(bytes.buffer)
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, sampleCount * 2, true)
  for (let index = 0; index < sampleCount; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0))
    view.setInt16(44 + index * 2, clamped * 0x7fff, true)
  }
  return bytes
}
