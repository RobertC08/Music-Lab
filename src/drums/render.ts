import { BASS_GAIN, bassVoice, placeBass, type BassLine } from './bass'
import type { Hit, KitPiece } from './exercise'
import type { DrumPlan } from './plan'
import { accentClick, CLICK_VERSION, plainClick } from './click'
import { SAMPLE_RATE, encodeWav } from './wav'

/*
  Lista de lovituri  ->  un singur WAV.

  Randarea e adunare de eșantioane: fiecare lovitură e o mostră reală, copiată
  peste tamponul comun la poziția ei. Nimic aici nu decide ce se cântă sau când,
  asta a decis `plan.ts`. Funcția e pură și nu atinge nici expo-av, nici
  filesystem-ul: mostrele intră ca argument, deci testele o pot rula în Node pe
  mostrele adevărate din `assets/drums/`.
*/

export type SampleKey = `${KitPiece}-${Hit}`
export type KitSamples = Readonly<Record<SampleKey, Float32Array>>

/**
 * Cât de tare intră fiecare piesă în mix.
 *
 * Valorile sunt cele alese la ureche pe comparația de kituri, nu calculate:
 * mostrele păstrează dinamica originală a setului (un singur câștig pe tot
 * kitul, vezi `scripts/build-drum-kit.mjs`), deci raportul dintre piese e treaba
 * mixului, nu a extragerii. Hi-hat-ul și ride-ul stau jos pentru că sunt cele
 * mai dese: la volum egal, ele acoperă toba mică.
 *
 * Ride-ul stă mai jos decât hi-hat-ul, deși mostra lui nu e mai tare: hi-hat-ul
 * închis ține 0,35 s, ride-ul 1,6 s. Cântat ca ostinato la optimi, fiecare
 * lovitură de ride sună încă atunci când au căzut alte cinci peste ea, deci se
 * adună, la același câștig, ostinato-ul de ride se măsura de 3,5 ori mai tare
 * decât cel de hi-hat, adică la nivelul tobei mici. De aici valoarea mică: ea
 * compensează coada, nu mostra. (Măsurat pe RMS-ul pistei randate, per piesă;
 * un test ține raportul.)
 */
export const DEFAULT_MIX: Record<KitPiece, number> = {
  kick: 1,
  snare: 0.92,
  hhClosed: 0.6,
  hhOpen: 0.6,
  tom: 0.85,
  mid: 0.85,
  floor: 0.85,
  crash: 0.7,
  ride: 0.38,
  /*
    Loviturile din DRSKit, potrivite pe nivelul măsurat al mostrelor normale
    față de cele din Muldjord. Cross-stick-ul rămâne ~5 dB sub toba mică, cât e
    și pe un set adevărat: se folosește tocmai unde backbeat-ul ar fi prea tare.
    Fusul cu piciorul sub fusul cu bățul. Clopotul ride-ului are atac tare și
    coadă lungă, ca ride-ul, deci aceeași grijă la ostinato.
  */
  crossStick: 1.1,
  hhFoot: 0.45,
  rideBell: 0.6,
  brush: 1,
  /*
    Din VCSL. Rimshot-ul e cel mai tare sunet al tobei mici și așa rămâne;
    cowbell-ul stă sub backbeat, iar lovitura pe ramă puțin peste cross-stick,
    fiindcă e un sunet mai scurt și mai sec.
  */
  cowbell: 0.7,
  rimshot: 0.95,
  rimClick: 1.1,
}

/**
 * Corecția pe trepte de intensitate, peste dinamica mostrelor.
 *
 * Diferența dintre ghost, normal și accent vine din straturile înregistrate, nu
 * se sintetizează aici, și nu trebuie. Dar straturile sunt luate din setul
 * original la cuantile fixe, iar ghost note-ul cel mai încet din set e mai
 * încet decât ghost note-ul dintr-un groove de funk: acolo el trebuie *auzit*
 * ca pulsație, nu doar bănuit. Un decibel îl scoate din pragul de audibilitate
 * pe difuzorul unui telefon, fără să-l apropie de lovitura normală: la tobă
 * mică rămân ~8 dB până la ea și ~18 dB până la accent. Un test le ține.
 */
export const HIT_GAIN: Record<Hit, number> = {
  ghost: 1.12,
  normal: 1,
  accent: 1,
}

/**
 * Câștigul general, fix.
 *
 * Fix, nu normalizat pe sesiune: dacă fiecare sesiune ar fi adusă la același
 * vârf, un exercițiu rar ar suna la fel de tare ca unul dens, iar utilizatorul
 * ar auzi volumul schimbându-se între exerciții fără să fi atins nimic. E exact
 * greșeala pe care extragerea a evitat-o la nivel de straturi, la o scară mai
 * mare. Valoarea ține un groove dens sub retezare; un test o verifică.
 */
export const MASTER_GAIN = 0.62

export interface RenderOptions {
  samples: KitSamples
  mix?: Partial<Record<KitPiece, number>>
  /** Metronomul. Implicit se aude, dacă planul l-a programat. */
  clicks?: boolean
  clickGain?: number
  /**
   * Tobele. Implicit se aud, aplicația cântă exercițiul, tu cânți peste.
   *
   * Oprite, rămâne doar metronomul: ai auzit groove-ul, acum îl ții singur. E
   * diferența dintre a urma și a ști, și e singurul mod în care aplicația poate
   * verifica ceva fără microfon, dacă te-ai pierdut, o auzi tu, pe „unu”.
   */
  hits?: boolean
  /**
   * Pista se va relua în buclă, deci se închide exact pe sfârșitul muzical.
   *
   * Două lucruri, nu unul. Întâi, lungimea: o pistă normală ține mai mult decât
   * muzica, cât să se stingă coada ultimei lovituri, într-o buclă, coada aia ar
   * fi o pauză la fiecare reluare, adică o șchiopătare pe „unu”. Apoi coada
   * însăși: nu se taie, se ADUNĂ la început, acolo unde ar fi căzut oricum dacă
   * sesiunea ar fi continuat. Un cinel lovit pe ultima măsură se stinge peste
   * prima, exact ca la tobe adevărate.
   */
  loop?: boolean
  /**
   * Golul: pe măsurile marcate `fill`, aplicația tace, tu le umpli.
   *
   * Asta e toată mecanica lui „Fill the Gap”, și e singurul fel în care se poate
   * verifica ceva fără microfon. Nu aplicația verifică: tu. Groove-ul se oprește
   * exact cât ține măsura ta și reintră pe „unu” cu cinelul, deci dacă ai grăbit
   * sau ai întârziat, o auzi, te calci pe cinel, sau apari după el.
   */
  gap?: boolean
  /**
   * Linia de bas de sub exemplu (`bass.ts`). Se aude și cu tobele oprite: atunci
   * ține ea locul trupei, iar tu legi toba mare de ea.
   */
  bass?: BassLine
}

export interface RenderedTrack {
  samples: Float32Array
  /** Poate depăși `plan.totalMs`: un crash de la final are voie să se stingă. */
  durationMs: number
  /** Vârful absolut înainte de retezare. Peste 1 înseamnă că s-a retezat. */
  peak: number
}

export function renderDrumTrack(plan: DrumPlan, options: RenderOptions): RenderedTrack {
  const mix = { ...DEFAULT_MIX, ...options.mix }
  const withClicks = options.clicks !== false
  const withHits = options.hits !== false
  const fillBars = options.gap
    ? new Set(plan.bars.filter((bar) => bar.fill).map((bar) => bar.index))
    : null
  const clickGain = options.clickGain ?? 1

  interface Placement {
    at: number
    source: Float32Array
    gain: number
  }
  const placements: Placement[] = []
  const sampleAt = (atMs: number) => Math.round((atMs / 1000) * SAMPLE_RATE)

  const audible = withHits
    ? fillBars
      ? plan.hits.filter((hit) => !fillBars.has(hit.bar))
      : plan.hits
    : []
  for (const hit of audible) {
    const key: SampleKey = `${hit.piece}-${hit.hit}`
    const source = options.samples[key]
    // Mostra lipsă e o eroare de kit, nu o lovitură de sărit: dacă tacem aici,
    // exercițiul se aude incomplet și nimeni nu știe de ce.
    if (!source) throw new Error(`lipsește mostra ${key}`)
    placements.push({ at: sampleAt(hit.atMs), source, gain: mix[hit.piece] * HIT_GAIN[hit.hit] })
  }
  if (withClicks) {
    for (const click of plan.clicks) {
      placements.push({
        at: sampleAt(click.atMs),
        source: click.accent ? accentClick : plainClick,
        gain: clickGain,
      })
    }
  }

  if (options.bass) {
    for (const note of placeBass(plan, options.bass)) {
      placements.push({
        at: sampleAt(note.atMs),
        source: bassVoice(note.pitch, note.durationMs),
        gain: BASS_GAIN,
      })
    }
  }

  /*
    Lungimea tamponului e dictată de ce se aude ultimul, nu de ultima bătaie.
    Tăiat la `totalMs`, un crash pe măsura finală s-ar opri brusc, și un sunet
    retezat la mijloc pocnește, deci s-ar auzi ca un defect, nu ca un final.
  */
  const musicalEnd = sampleAt(plan.totalMs)
  const audibleEnd = placements.reduce((end, item) => Math.max(end, item.at + item.source.length), 0)
  const looping = options.loop === true
  const length = looping ? musicalEnd : Math.max(musicalEnd, audibleEnd)
  const samples = new Float32Array(length)

  for (const { at, source, gain } of placements) {
    const total = gain * MASTER_GAIN
    /*
      `at` poate fi negativ: o notă de grație stă 32 ms înaintea loviturii ei, iar
      dacă lovitura e chiar pe primul eșantion al pistei, grația ar cădea înainte
      de început. Fără buclă se scrie doar partea care încape, un TypedArray
      ignoră în liniște scrierile în afara lui, deci altfel ornamentul ar dispărea
      fără niciun semn. Cu buclă, ce iese pe la un capăt intră pe celălalt, deci
      și grația dinaintea lui „unu” se aude: vine de la sfârșitul buclei.
    */
    if (looping) {
      for (let index = 0; index < source.length; index += 1) {
        const position = (((at + index) % length) + length) % length
        samples[position]! += source[index]! * total
      }
      continue
    }
    const from = Math.max(0, -at)
    const span = Math.min(source.length, length - at)
    for (let index = from; index < span; index += 1) {
      samples[at + index]! += source[index]! * total
    }
  }

  let peak = 0
  for (let index = 0; index < length; index += 1) peak = Math.max(peak, Math.abs(samples[index]!))
  return { samples, durationMs: (length / SAMPLE_RATE) * 1000, peak }
}

export function renderDrumWav(plan: DrumPlan, options: RenderOptions): Uint8Array {
  return encodeWav(renderDrumTrack(plan, options).samples)
}

/**
 * Cheia de cache a unei piste.
 *
 * Se calculează din planul întreg, nu din parametrii care l-au produs. Varianta
 * cu parametri a fost plătită o dată în modulul Ritm: dacă unul lipsește din
 * cheie, două exerciții diferite primesc același WAV, iar simptomul apare mult
 * mai târziu și arată ca o eroare de conținut. Pe planul întreg nu se poate uita
 * nimic, dacă sună altfel, e în plan, deci e în cheie.
 */
export function drumTrackKey(
  plan: DrumPlan,
  kitId: string,
  options: Pick<RenderOptions, 'mix' | 'clicks' | 'hits' | 'gap' | 'loop' | 'bass'>,
) {
  const parts = [
    kitId,
    plan.exerciseId,
    options.clicks === false ? 'mute' : `click${CLICK_VERSION}`,
    options.hits === false ? 'nodrums' : 'drums',
    options.gap ? 'gap' : 'full',
    options.loop ? 'loop' : 'once',
    Object.entries({ ...DEFAULT_MIX, ...options.mix })
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([piece, gain]) => `${piece}:${gain}`)
      .join(','),
    // Și corecția pe intensități: fișierele randate rămân în cache-ul de pe disc
    // peste actualizări de aplicație, deci orice câștig care schimbă sunetul
    // trebuie să schimbe și cheia, altfel un utilizator vechi ar auzi în
    // continuare mixul vechi, iar bug-ul ar fi de negăsit.
    Object.entries(HIT_GAIN)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([level, gain]) => `${level}:${gain}`)
      .join(','),
    plan.totalMs.toFixed(2),
    // Basul intră cu notele lui, nu cu un nume: o notă mutată e altă pistă.
    options.bass
      ? `bass:${BASS_GAIN}:${options.bass.bars
          .map((notes) => notes.map((note) => `${note.step}+${note.length}=${note.pitch}`).join(','))
          .join(';')}`
      : 'nobass',
    plan.hits.map((hit) => `${hit.atMs.toFixed(2)}${hit.piece}${hit.hit}`).join('|'),
    plan.clicks.map((click) => `${click.atMs.toFixed(2)}${click.accent ? 'A' : 'p'}`).join('|'),
  ].join('/')

  // FNV-1a, la fel ca `seedForLevel` din `lib/guest/adaptive-levels.ts`.
  let hash = 0x811c9dc5
  for (let index = 0; index < parts.length; index += 1) {
    hash ^= parts.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `drums-${(hash >>> 0).toString(36)}`
}
