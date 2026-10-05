import { GUITAR_RATE as SAMPLE_RATE } from './pluck'
import type { GuitarString } from './tuning'

/*
  Chitara din mostre, cu articulații: nota ciupită, hammer-on, pull-off, trilul.

  Alternativă la sinteza Karplus-Strong din `pluck.ts`, care la legato sună ca o
  coardă ciupită din nou, mai încet. Aici legato-ul se face ca pe o chitară
  adevărată:

  - O notă legată (hammer-on, pull-off) CONTINUĂ coarda care vibrează deja. Nu
    pornește mostra de la început, ci din punctul care corespunde timpului
    scurs de la lovitura de pană (`age`): timbrul și energia sunt ale unei
    corzi care sună de atât timp, nu ale uneia proaspăt lovite.
  - Hammer-on: atac foarte moale (degetul apasă, pana nu lovește) și un mic
    zgomot de deget pe tastieră (`thump`).
  - Pull-off: degetul ciupește puțin coarda când se ridică, deci păstrează o
    fracțiune din atacul mostrei (`transientBlend`) și e ceva mai slab ca
    hammer-on-ul.
  - Trilul: un lanț legato între două note; variații mici de timp și volum,
    început și sfârșit ușor diferite de mijloc, fără derivă de tempo.
  - Nota de dinainte pe aceeași coardă nu se taie: se stinge exponențial cât
    intră cea nouă (`crossfade`), mai scurt la legato, mai lung la notele
    ciupite. La final, o stingere naturală, nu un fade liniar identic peste tot.
  - Variație: dacă o notă are mai multe mostre, se alternează (round-robin,
    niciodată aceeași de două ori la rând); cu o singură mostră, variații
    aproape imperceptibile de volum (±3%), înălțime (±2,5 cenți) și timp.

  Toată „umanizarea" e cu sămânță: aceeași sesiune sună la fel de fiecare dată,
  deci pistele din cache rămân valabile, iar testele sunt deterministe.

  Împărțit în două: `planPhrase` decide parametrii fiecărei note (pur, testat),
  `mixVoices` îi aplică pe mostre.

  ---

  PARAMETRII DE REALISM, toți mai jos, în `ARTICULATION`:
  - cât de tare e nota legată față de cea ciupită: `hammerLevel`, `pullLevel`,
    plus pierderea de energie la fiecare notă legată din lanț: `slurDecay`;
  - cât de moale e atacul: `hammerAttackMs`, `pullAttackMs`,
    `pullTransientBlend`, `hammerThump`;
  - umanizarea (timp, volum, înălțime): `HUMANIZE`;
  - forma trilului: `TRILL`. Viteza trilului vine din exercițiu (subdiviziune și
    tempo), nu de aici: aici e doar cât de „uman" e.
*/

/** Mostrele: una sau mai multe variante pe notă (MIDI). */
export type SampleBank = ReadonlyMap<number, readonly Float32Array[]>

export type Articulation = 'pick' | 'hammer' | 'pull'

export const ARTICULATION = {
  /** Volumul unei note din hammer-on, față de nota ciupită care a pornit lanțul. */
  hammerLevel: 0.84,
  /** Pull-off-ul: puțin mai slab decât hammer-on-ul. */
  pullLevel: 0.76,
  /** Fiecare notă legată în plus din lanț pierde puțină energie (doar primele, vezi `slurDecaySteps`; la tril, deloc). */
  slurDecay: 0.97,
  slurDecaySteps: 3,
  /**
   * Cât de „bătrână" poate fi coarda pentru o notă legată: după atât, mostra nu
   * se mai citește mai adânc. La tril e mai puțin, fiindcă fiecare hammer-on dă
   * energie nouă corzii; altfel un tril lung s-ar stinge pe drum.
   */
  maxAgeMs: 700,
  trillMaxAgeMs: 220,
  /** Atacul notei din hammer-on: foarte scurt, fără tranzient. */
  hammerAttackMs: 2.5,
  /** Atacul pull-off-ului: și mai scurt, cu o urmă de tranzient. */
  pullAttackMs: 1.2,
  /** Cât din atacul mostrei se păstrează la pull-off (degetul ciupește ușor coarda). */
  pullTransientBlend: 0.16,
  /** Zgomotul degetului care lovește tastiera la hammer-on, față de volumul notei. */
  hammerThump: 0.05,
  /** Cel mai devreme punct din mostră de la care pornește o notă legată (sare peste atacul penei). */
  hammerMinSkipMs: 28,
  pullMinSkipMs: 16,
  /** Stingerea notei de dinainte pe aceeași coardă: scurtă la legato, mai lungă după o notă ciupită. */
  legatoCrossfadeMs: 10,
  pickReleaseMs: 35,
  /** Stingerea naturală, când nu mai vine nimic pe coardă. */
  naturalReleaseMs: 140,
} as const

export const HUMANIZE = {
  /** Abaterea maximă de timp, în ms, pe tipuri; limitată și la un procent din pas, ca la viteze mari să rămână mică. */
  pickMs: 4,
  hammerMs: 5,
  pullMs: 4,
  /** Procentul maxim din durata pasului. */
  stepFraction: 0.05,
  /** Tendința: hammer-on-ul cade puțin după (degetul are drum de parcurs), pull-off-ul puțin înainte. */
  hammerBias: 0.3,
  pullBias: -0.2,
  /** Variația de volum (±). */
  gain: 0.03,
  /** Variația de înălțime, în cenți (±), când nota are o singură mostră. */
  cents: 2.5,
} as const

export const TRILL = {
  /** De la câte note legate între două înălțimi se socotește tril. */
  minNotes: 4,
  /** Variația de volum în mijlocul trilului (±). */
  gain: 0.06,
  /** Timpul: mai strâns decât la notele obișnuite, ca viteza să rămână constantă. */
  stepFraction: 0.04,
  maxMs: 3,
  /** Prima notă legată, puțin mai tare; ultimele două, puțin mai slabe. */
  firstBoost: 1.05,
  tailLevel: 0.9,
  /** Cât variază punctul din mostră de unde pornește o notă din tril. */
  offsetJitterMs: 35,
} as const

export interface PhraseNote {
  /** Momentul nominal, în eșantioane. */
  time: number
  pitch: number
  string: GuitarString
  articulation: Articulation
  /** Volumul de bază al unei note ciupite (accentele vin de aici). */
  velocity: number
  /** Cât poate suna cel mult, dacă nu o oprește următoarea notă pe coardă. */
  maxLength: number
  /** Durata pasului, ca umanizarea să se raporteze la viteză. */
  stepLength: number
}

/** O notă, cu tot ce trebuie ca să fie pusă din mostră. */
export interface Voice {
  index: number
  pitch: number
  /** Momentul real (cu umanizarea), în eșantioane. */
  start: number
  /** De unde se citește mostra, în eșantioane. */
  offset: number
  /** Viteza de citire (1 = neschimbat; ±câțiva cenți). */
  rate: number
  variant: number
  gain: number
  attack: number
  transientBlend: number
  thump: number
  /** Unde începe stingerea și cât ține. */
  releaseAt: number
  release: number
  articulation: Articulation
  trill: boolean
}

const ms = (value: number) => (value / 1000) * SAMPLE_RATE

/** Un generator mic, cu sămânță, deterministic. */
function random(seed: number) {
  let state = seed >>> 0 || 0x9e3779b9
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** -1…1, mai des aproape de 0 (suma a două uniforme): abaterile mari sunt rare, ca la mână. */
const spread = (next: () => number) => next() + next() - 1

/**
 * Parametrii fiecărei note. Pur: aceeași frază și aceeași sămânță dau mereu
 * același rezultat.
 */
export function planPhrase(notes: readonly PhraseNote[], seed: number, variantsOf: (pitch: number) => number = () => 1): Voice[] {
  const next = random(seed)
  const order = notes.map((_, index) => index).sort((a, b) => notes[a]!.time - notes[b]!.time || a - b)

  // Lanțurile legato, pe coardă: nota ciupită care pornește lanțul, și poziția în lanț.
  const chainOf = new Map<number, { head: number; position: number; members: number[] }>()
  const lastOnString = new Map<GuitarString, number>()
  for (const index of order) {
    const note = notes[index]!
    const previous = lastOnString.get(note.string)
    if (note.articulation !== 'pick' && previous !== undefined && chainOf.has(previous)) {
      const chain = chainOf.get(previous)!
      chain.members.push(index)
      chainOf.set(index, { ...chain, position: chain.members.length - 1 })
    } else {
      chainOf.set(index, { head: index, position: 0, members: [index] })
    }
    lastOnString.set(note.string, index)
  }
  // `members` e același tablou pentru tot lanțul; un tril alternează între exact două înălțimi.
  const isTrill = (members: number[]) => {
    if (members.length < TRILL.minNotes) return false
    const pitches = new Set(members.map((member) => notes[member]!.pitch))
    if (pitches.size !== 2) return false
    return members.every((member, position) => position === 0 || notes[member]!.pitch !== notes[members[position - 1]!]!.pitch)
  }

  const voices: Voice[] = []
  const starts = new Map<number, number>()
  const lastRate = new Map<number, number>()
  const roundRobin = new Map<number, number>()

  for (const index of order) {
    const note = notes[index]!
    const chain = chainOf.get(index)!
    const members = chainOf.get(chain.head)!.members
    const trill = isTrill(members)
    const head = notes[chain.head]!

    // Timpul: abatere mică, cu tendința articulației; nicio derivă (abaterea nu se cumulează).
    let limit: number
    let bias = 0
    if (trill && note.articulation !== 'pick') {
      limit = Math.min(ms(TRILL.maxMs), note.stepLength * TRILL.stepFraction)
    } else {
      const base = note.articulation === 'hammer' ? HUMANIZE.hammerMs : note.articulation === 'pull' ? HUMANIZE.pullMs : HUMANIZE.pickMs
      limit = Math.min(ms(base), note.stepLength * HUMANIZE.stepFraction)
      bias = note.articulation === 'hammer' ? HUMANIZE.hammerBias : note.articulation === 'pull' ? HUMANIZE.pullBias : 0
    }
    let start = Math.round(note.time + limit * (bias + (1 - Math.abs(bias)) * spread(next)))
    // Nu înaintea notei de dinainte de pe aceeași coardă.
    const previousOnString = chain.position > 0 ? starts.get(members[chain.position - 1]!) : undefined
    if (previousOnString !== undefined) start = Math.max(start, previousOnString + Math.round(note.stepLength * 0.3))
    start = Math.max(0, start)
    starts.set(index, start)

    // Volumul.
    let gain = note.velocity * (1 + HUMANIZE.gain * spread(next))
    if (note.articulation !== 'pick') {
      const level = note.articulation === 'hammer' ? ARTICULATION.hammerLevel : ARTICULATION.pullLevel
      gain = head.velocity * level
      if (!trill) gain *= ARTICULATION.slurDecay ** Math.min(chain.position - 1, ARTICULATION.slurDecaySteps)
      if (trill) {
        gain *= 1 + TRILL.gain * spread(next)
        if (chain.position === 1) gain *= TRILL.firstBoost
        if (chain.position >= members.length - 2) gain *= TRILL.tailLevel
      } else {
        gain *= 1 + HUMANIZE.gain * spread(next)
      }
    }

    // De unde se citește mostra: nota legată continuă coarda, deci de la „vârsta" lanțului.
    let age = Math.min(start - (starts.get(chain.head) ?? start), ms(trill ? ARTICULATION.trillMaxAgeMs : ARTICULATION.maxAgeMs))
    // În tril, notele ajung la plafon și ar porni toate din același punct al mostrei:
    // un pas mic, diferit la fiecare, ca două note la fel să nu fie identice ca undă.
    if (trill && note.articulation !== 'pick') age -= next() * ms(TRILL.offsetJitterMs)
    const offset =
      note.articulation === 'pick'
        ? 0
        : Math.max(ms(note.articulation === 'hammer' ? ARTICULATION.hammerMinSkipMs : ARTICULATION.pullMinSkipMs), age)

    // Variantele: round-robin dacă sunt mai multe; altfel câțiva cenți, niciodată exact ca data trecută.
    const count = Math.max(1, variantsOf(note.pitch))
    const variant = (roundRobin.get(note.pitch) ?? 0) % count
    roundRobin.set(note.pitch, variant + 1)
    let cents = count > 1 ? 0 : HUMANIZE.cents * spread(next)
    const previousCents = lastRate.get(note.pitch)
    if (count === 1 && previousCents !== undefined && Math.abs(cents - previousCents) < 0.6) {
      cents = previousCents + (cents >= previousCents ? 0.8 : -0.8)
      cents = Math.max(-HUMANIZE.cents, Math.min(HUMANIZE.cents, cents))
    }
    lastRate.set(note.pitch, cents)

    voices.push({
      index,
      pitch: note.pitch,
      start,
      offset: Math.round(offset),
      rate: 2 ** (cents / 1200),
      variant,
      gain,
      attack: Math.round(
        ms(note.articulation === 'hammer' ? ARTICULATION.hammerAttackMs : note.articulation === 'pull' ? ARTICULATION.pullAttackMs : 0),
      ),
      transientBlend: note.articulation === 'pull' ? ARTICULATION.pullTransientBlend : 0,
      thump: note.articulation === 'hammer' ? ARTICULATION.hammerThump : 0,
      releaseAt: start + note.maxLength,
      release: Math.round(ms(ARTICULATION.naturalReleaseMs)),
      articulation: note.articulation,
      trill,
    })
  }

  // Stingerea: o notă se oprește când vine următoarea pe aceeași coardă, cu un crossfade.
  const byString = new Map<GuitarString, Voice[]>()
  for (const voice of voices) {
    const string = notes[voice.index]!.string
    if (!byString.has(string)) byString.set(string, [])
    byString.get(string)!.push(voice)
  }
  for (const list of byString.values()) {
    list.sort((a, b) => a.start - b.start)
    for (let position = 0; position + 1 < list.length; position += 1) {
      const current = list[position]!
      const following = list[position + 1]!
      if (following.start >= current.releaseAt) continue
      const fade = Math.round(ms(following.articulation === 'pick' ? ARTICULATION.pickReleaseMs : ARTICULATION.legatoCrossfadeMs))
      current.releaseAt = following.start
      current.release = fade
    }
  }
  return voices.sort((a, b) => a.start - b.start)
}

/** Zgomotul degetului pe tastieră: scurt, înfundat. */
const thumpNoise = (() => {
  const out = new Float32Array(Math.round(ms(9)))
  const next = random(4242)
  let smooth = 0
  for (let index = 0; index < out.length; index += 1) {
    smooth += 0.18 * (next() * 2 - 1 - smooth)
    out[index] = smooth * Math.exp(-index / ms(2.5))
  }
  return out
})()

/** Pune vocile din mostre în `out`. Mostrele lipsă (în afara gamei) se sar. */
export function mixVoices(out: Float32Array, bank: SampleBank, voices: readonly Voice[]) {
  for (const voice of voices) {
    const variants = bank.get(voice.pitch)
    if (!variants || variants.length === 0) continue
    const source = variants[voice.variant % variants.length]!
    // Durata: până la capătul stingerii, sau cât ține mostra.
    const end = Math.min(out.length, voice.releaseAt + voice.release)
    const available = Math.floor((source.length - 2 - voice.offset) / voice.rate)
    const length = Math.min(end - voice.start, available)
    if (length <= 0) continue

    for (let index = 0; index < length; index += 1) {
      const position = voice.offset + index * voice.rate
      const whole = Math.floor(position)
      const fraction = position - whole
      let value = source[whole]! * (1 - fraction) + source[whole + 1]! * fraction

      // Atacul: o curbă sinusoidală scurtă, nu o rampă liniară.
      if (index < voice.attack) value *= Math.sin(((index / voice.attack) * Math.PI) / 2) ** 2

      // Pull-off: o urmă din atacul mostrei, ca degetul care ciupește coarda când se ridică.
      if (voice.transientBlend > 0 && index < source.length - 1) {
        const attackWindow = ms(14)
        if (index < attackWindow) value += source[index]! * voice.transientBlend * (1 - index / attackWindow)
      }

      // Stingerea: exponențială, de la `releaseAt`.
      const sample = voice.start + index
      if (sample >= voice.releaseAt) {
        const x = (sample - voice.releaseAt) / Math.max(1, voice.release)
        value *= x >= 1 ? 0 : Math.exp(-4.5 * x) * (1 - x)
      }
      out[sample]! += value * voice.gain
    }

    if (voice.thump > 0) {
      const scale = voice.thump * voice.gain
      for (let index = 0; index < thumpNoise.length && voice.start + index < out.length; index += 1) {
        out[voice.start + index]! += thumpNoise[index]! * scale
      }
    }
  }
}

/** Fraza întreagă, din note: plan + mixare. */
export function renderPhrase(out: Float32Array, bank: SampleBank, notes: readonly PhraseNote[], seed: number) {
  const voices = planPhrase(notes, seed, (pitch) => bank.get(pitch)?.length ?? 1)
  mixVoices(out, bank, voices)
  return voices
}
