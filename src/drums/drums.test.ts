import { describe, expect, it } from 'vitest'
import {
  MIN_HAND_GAP_MS,
  kitPieces,
  onsetsOf,
  validateExercise,
  type Bar,
  type DrumExercise,
  type Vocabulary,
} from './exercise'
import { MAX_SESSION_MS, ladderSegments, planDrumMedley, planDrumSession, segmentsForDuration } from './plan'
import { DEFAULT_MIX, HIT_GAIN, MASTER_GAIN, drumTrackKey, renderDrumTrack, type KitSamples } from './render'
import { SAMPLE_RATE, decodeWav, encodeWav } from './wav'
import { testKit, testManifest } from './test-kit'

/*
  Testele randează pista pe MOSTRELE ADEVĂRATE din `assets/drums/muldjord` (și
  `drsx`, loviturile pe care Muldjord nu le are) și
  măsoară energia semnalului. Nu verifică parametri, verifică sunetul: că o
  lovitură se aude unde scrie, că accentul e mai tare decât ghost note-ul, că
  numărătoarea nu intră peste prima măsură.

  Capcana, plătită deja în modulul Ritm: pista conține și click-urile de
  metronom. O fereastră de măsurare așezată pe o bătaie prinde click-ul și
  „confirmă” o lovitură care nu există. Deci ferestrele se aleg între bătăi, sau
  cu metronomul oprit.
*/

const manifest = testManifest
const kit = testKit

/** Energia medie (RMS) într-o fereastră de timp din pista randată. */
function rms(samples: Float32Array, fromMs: number, toMs: number) {
  const from = Math.max(0, Math.round((fromMs / 1000) * SAMPLE_RATE))
  const to = Math.min(samples.length, Math.round((toMs / 1000) * SAMPLE_RATE))
  let sum = 0
  for (let index = from; index < to; index += 1) sum += samples[index]! ** 2
  return to > from ? Math.sqrt(sum / (to - from)) : 0
}

const steps = (pattern: string, hit: 'ghost' | 'normal' | 'accent' = 'normal') =>
  [...pattern].map((character) => (character === 'x' ? hit : null))

/** Rock la optimi, cu ghost notes pe toba mică: exercițiul de referință. */
const rockGroove: DrumExercise = {
  id: 'rock-basic',
  kind: 'groove',
  style: 'rock',
  stepsPerBar: 16,
  beatsPerBar: 4,
  bars: [
    {
      lanes: {
        hhClosed: [...steps('x.x.x.x.x.x.x.x.')].map((slot, step) =>
          slot ? (step % 4 === 0 ? 'accent' : 'normal') : null,
        ),
        snare: [
          ...steps('....x......x....').map((slot) => (slot ? 'accent' : null)),
        ].map((slot, step) => slot ?? (step === 3 || step === 14 ? 'ghost' : null)),
        kick: steps('x.....x..x......', 'accent'),
      },
    },
  ],
  tempo: { min: 60, max: 120, suggested: 92 },
}

/** Pătrimi pe toba mică: singura piesă, lovituri departe una de alta. */
const snareOnly = (pattern: (Bar['lanes']['snare'])): DrumExercise => ({
  id: 'snare-probe',
  kind: 'rudiment',
  stepsPerBar: 4,
  beatsPerBar: 4,
  bars: [{ lanes: { snare: pattern } }],
  tempo: { min: 50, max: 90, suggested: 80 },
})

describe('validarea exercițiilor', () => {
  const vocabulary: Vocabulary = {
    pieces: ['kick', 'snare', 'hhClosed'],
    hits: ['ghost', 'normal', 'accent'],
    stepsPerBeat: [2, 4],
  }

  it('acceptă groove-ul de referință', () => {
    expect(validateExercise(rockGroove, vocabulary)).toEqual([])
  })

  it('prinde o linie cu un pas lipsă, ce nu prinde TypeScript', () => {
    const broken: DrumExercise = {
      ...rockGroove,
      bars: [{ lanes: { snare: steps('....x......x...') } }],
    }
    expect(validateExercise(broken).join()).toContain('15 pași, nu 16')
  })

  it('prinde o piesă din afara vocabularului', () => {
    const withRide: DrumExercise = {
      ...rockGroove,
      bars: [{ lanes: { ride: steps('x.x.x.x.x.x.x.x.') } }],
    }
    expect(validateExercise(withRide, vocabulary).join()).toContain('ride nu e în vocabular')
  })

  it('prinde o mână pusă pe două piese în același pas', () => {
    const impossible: DrumExercise = {
      ...rockGroove,
      bars: [
        {
          lanes: { snare: steps('x...............'), tom: steps('x...............') },
          sticking: [...'R...............'].map((character) => (character === 'R' ? 'R' : null)),
        },
      ],
    }
    expect(validateExercise(impossible).join()).toContain('o mână pe')
  })

  it('prinde loviturile prea dese pentru o mână, la tempoul maxim', () => {
    const tooFast: DrumExercise = {
      id: 'singles-prea-repede',
      kind: 'rudiment',
      stepsPerBar: 16,
      beatsPerBar: 4,
      // Toate șaisprezecimile cu dreapta: la 200 BPM ies 75 ms între lovituri.
      bars: [
        {
          lanes: { snare: steps('xxxxxxxxxxxxxxxx') },
          sticking: new Array(16).fill('R'),
        },
      ],
      tempo: { min: 60, max: 200, suggested: 100 },
    }
    const problems = validateExercise(tooFast).join()
    expect(problems).toContain('mâna R')
    expect(problems).toContain(String(MIN_HAND_GAP_MS))
  })

  it('verifică și trecerea peste bară, nu doar interiorul măsurilor', () => {
    // Fiecare măsură, luată singură, e curată: o lovitură la început, una la
    // sfârșit. Problema apare doar la buclă, între ultima și prima.
    const acrossBarline: DrumExercise = {
      id: 'peste-bară',
      kind: 'rudiment',
      stepsPerBar: 4,
      beatsPerBar: 1,
      bars: [{ lanes: { snare: steps('x..x') }, sticking: ['R', null, null, 'R'] }],
      tempo: { min: 60, max: 200, suggested: 100 },
    }
    expect(validateExercise(acrossBarline).join()).toContain('mâna R')
  })

  it('numără loviturile în ordinea pașilor', () => {
    const onsets = onsetsOf(rockGroove)
    expect(onsets[0]).toMatchObject({ step: 0, piece: 'hhClosed', hit: 'accent' })
    expect(onsets.filter((onset) => onset.piece === 'snare' && onset.hit === 'ghost')).toHaveLength(2)
  })
})

describe('planificarea sesiunii', () => {
  it('pune numărătoarea înainte de prima lovitură', () => {
    const plan = planDrumSession(rockGroove, { segments: [{ bpm: 90, repeats: 2 }] })
    const barMs = (60_000 / 90) * 4
    expect(plan.bars[0]!.countIn).toBe(true)
    expect(plan.hits[0]!.atMs).toBeCloseTo(barMs, 6)
    expect(plan.clicks.filter((click) => click.bar === 0)).toHaveLength(4)
  })

  it('așază loviturile exact pe pașii lor', () => {
    const plan = planDrumSession(rockGroove, { segments: [{ bpm: 120, repeats: 1 }], countInBars: 0 })
    const stepMs = 60_000 / 120 / 4
    const kicks = plan.hits.filter((hit) => hit.piece === 'kick').map((hit) => hit.atMs)
    expect(kicks).toEqual([0, 6 * stepMs, 9 * stepMs])
  })

  it('acumulează tempoul pe scară, fără drift între trepte', () => {
    const segments = ladderSegments({ from: 60, to: 80, step: 10, repeatsPerStep: 1 })
    const plan = planDrumSession(rockGroove, { segments, countInBars: 0 })
    expect(plan.bars.map((bar) => bar.bpm)).toEqual([60, 70, 80])
    // Fiecare măsură începe exact unde s-a terminat precedenta, la tempoul ei.
    let expected = 0
    for (const bar of plan.bars) {
      expect(bar.atMs).toBeCloseTo(expected, 6)
      expected += (60_000 / bar.bpm) * 4
    }
    expect(plan.totalMs).toBeCloseTo(expected, 6)
    expect(plan.peakBpm).toBe(80)
  })

  it('taie la plafon pe trecere întreagă și spune cât s-a cerut', () => {
    const plan = planDrumSession(rockGroove, { segments: [{ bpm: 60, repeats: 100 }] })
    expect(plan.totalMs).toBeLessThanOrEqual(MAX_SESSION_MS)
    expect(plan.cappedFromMs).toBeGreaterThan(MAX_SESSION_MS)
    // Ultima măsură e o măsură întreagă de exercițiu, nu o bucată.
    expect(plan.bars.at(-1)!.exerciseBar).toBe(rockGroove.bars.length - 1)
  })

  it('nu raportează un tempo pe care plafonul l-a tăiat înainte să sune', () => {
    const segments = ladderSegments({ from: 60, to: 240, step: 2, repeatsPerStep: 8 })
    const plan = planDrumSession(rockGroove, { segments })
    expect(plan.cappedFromMs).toBeDefined()
    expect(plan.peakBpm).toBeLessThan(240)
    expect(plan.bars.at(-1)!.bpm).toBe(plan.peakBpm)
  })

  it('potrivește numărul de repetări pe o durată dorită', () => {
    const segments = segmentsForDuration(rockGroove, 100, 40_000)
    const plan = planDrumSession(rockGroove, { segments })
    expect(plan.totalMs).toBeLessThanOrEqual(40_000)
    expect(plan.totalMs).toBeGreaterThan(38_000)
  })
})

describe('randarea, măsurată pe semnal', () => {
  it('se aude o lovitură acolo unde scrie, și liniște între ele', () => {
    // Pătrimi la 80 BPM: 750 ms pe bătaie, lovituri pe 1 și 3, metronomul oprit.
    const plan = planDrumSession(snareOnly(['normal', null, 'normal', null]), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const beatMs = 60_000 / 80
    const onHit = rms(samples, 0, 60)
    expect(onHit).toBeGreaterThan(0.02)
    // Toba mică se stinge în ~200 ms; la 500 ms trebuie să fie practic liniște.
    expect(rms(samples, 500, 700)).toBeLessThan(onHit / 20)
    // A doua lovitură e pe a treia bătaie, nu pe a doua: pasul e o pătrime aici.
    expect(rms(samples, beatMs, beatMs + 60)).toBeLessThan(onHit / 20)
    expect(rms(samples, 2 * beatMs, 2 * beatMs + 60)).toBeGreaterThan(0.02)
  })

  it('accentul e mai tare decât lovitura normală, iar aceea decât ghost note-ul', () => {
    const plan = planDrumSession(snareOnly(['ghost', 'normal', 'accent', null]), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const beatMs = 60_000 / 80
    const ghost = rms(samples, 0, 60)
    const normal = rms(samples, beatMs, beatMs + 60)
    const accent = rms(samples, 2 * beatMs, 2 * beatMs + 60)
    expect(ghost).toBeGreaterThan(0)
    expect(normal).toBeGreaterThan(ghost * 1.3)
    expect(accent).toBeGreaterThan(normal * 1.3)
  })

  it('ridică ghost note-ul cu corecția de intensitate, nu cu mostra', () => {
    /*
      Ghost note-ul din kit e stratul cel mai încet al setului original, iar pe
      difuzorul unui telefon stătea la limita audibilului. Un decibel (×1,12) îl
      scoate de acolo. Testul compară semnalul randat cu mostra brută: dacă
      cineva scoate `HIT_GAIN` din randare, aici se vede imediat.
    */
    const plan = planDrumSession(snareOnly(['ghost', null, null, null]), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const source = kit['snare-ghost']!
    const expected = source[0]! * DEFAULT_MIX.snare * MASTER_GAIN * HIT_GAIN.ghost
    expect(samples[0]).toBeCloseTo(expected, 8)
    expect(HIT_GAIN.ghost).toBeGreaterThan(1)
    /*
      Corecția nu apropie ghost note-ul de lovitura normală. Pragurile sunt cele
      măsurate pe kit: peste 6 dB (×2) până la lovitura normală și peste 15 dB
      (×5,6) până la accent. Sub ele, ghost note-ul n-ar mai fi o umbră, ar fi o
      notă slabă, iar groove-urile de funk chiar pe diferența asta stau.
    */
    const energy = (layer: string) => {
      const data = kit[`snare-${layer}` as keyof KitSamples]!
      let sum = 0
      for (const value of data) sum += value * value
      return Math.sqrt(sum / data.length)
    }
    const ghostLevel = energy('ghost') * HIT_GAIN.ghost
    expect(energy('normal')).toBeGreaterThan(ghostLevel * 2)
    expect(energy('accent')).toBeGreaterThan(ghostLevel * 5.6)
  })

  it('numărătoarea nu intră peste prima măsură', () => {
    const plan = planDrumSession(snareOnly(['accent', null, null, null]), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 1,
    })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const beatMs = 60_000 / 80
    /*
      Fereastra stă ÎNTRE bătăile numărătorii, tocmai ca să nu prindă click-ul:
      click-urile cad la 0, 750, 1500, 2250 ms, deci 300-700 e curat. Dacă o tobă
      ar fi scăpat în numărătoare, s-ar vedea aici.
    */
    expect(rms(samples, 300, 700)).toBeLessThan(0.001)
    // Iar prima lovitură adevărată e la începutul măsurii următoare.
    expect(rms(samples, 4 * beatMs, 4 * beatMs + 60)).toBeGreaterThan(0.02)
  })

  it('metronomul se aude pe pătrimi, cu primul mai tare', () => {
    const plan = planDrumSession(snareOnly([null, null, null, null]), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
    })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const beatMs = 60_000 / 80
    const first = rms(samples, 0, 40)
    const second = rms(samples, beatMs, beatMs + 40)
    expect(first).toBeGreaterThan(second)
    expect(second).toBeGreaterThan(0.005)
    expect(rms(samples, beatMs / 2, beatMs / 2 + 100)).toBeLessThan(0.001)
  })

  it('un groove dens nu retează', () => {
    const plan = planDrumSession(rockGroove, { segments: [{ bpm: 120, repeats: 4 }] })
    const { peak } = renderDrumTrack(plan, { samples: kit })
    expect(peak).toBeLessThan(1)
    // Și nici nu e atât de jos încât mixul să fie irosit.
    expect(peak).toBeGreaterThan(0.4)
  })

  it('lasă crash-ul să se stingă peste sfârșitul muzical', () => {
    const withCrash: DrumExercise = {
      id: 'crash-final',
      kind: 'fill',
      stepsPerBar: 4,
      beatsPerBar: 4,
      // Crash pe ultima bătaie: coada lui trece peste sfârșitul măsurii.
      bars: [{ lanes: { crash: [null, null, null, 'accent'] } }],
      tempo: { min: 60, max: 120, suggested: 80 },
    }
    const plan = planDrumSession(withCrash, { segments: [{ bpm: 80, repeats: 1 }], countInBars: 0 })
    const rendered = renderDrumTrack(plan, { samples: kit, clicks: false })
    expect(rendered.durationMs).toBeGreaterThan(plan.totalMs)
    // Ultimul eșantion e mic: coada s-a stins, nu a fost tăiată.
    expect(Math.abs(rendered.samples.at(-1)!)).toBeLessThan(0.01)
  })

  it('WAV-ul scris se citește înapoi identic, în limita a 16 biți', () => {
    const plan = planDrumSession(rockGroove, { segments: [{ bpm: 100, repeats: 1 }] })
    const { samples } = renderDrumTrack(plan, { samples: kit })
    const roundTrip = decodeWav(encodeWav(samples))
    expect(roundTrip.length).toBe(samples.length)
    let worst = 0
    for (let index = 0; index < samples.length; index += 1) {
      worst = Math.max(worst, Math.abs(samples[index]! - roundTrip[index]!))
    }
    // Doi biți de toleranță: scrierea scalează cu 0x7fff, citirea împarte la
    // 0x8000, convenția obișnuită, care lasă o nepotrivire de sub un bit.
    expect(worst).toBeLessThan(2 / 0x7fff)
  })

  it('mixul chiar schimbă echilibrul', () => {
    const plan = planDrumSession(rockGroove, { segments: [{ bpm: 100, repeats: 1 }], clicks: false })
    const loud = renderDrumTrack(plan, { samples: kit })
    const quiet = renderDrumTrack(plan, { samples: kit, mix: { kick: 0.2 } })
    // Pe energie, nu pe vârf: vârful pistei e dat de altă piesă decât toba mare,
    // deci coborând-o pe ea vârful ar putea rămâne neschimbat și testul ar minți.
    const energy = (track: { samples: Float32Array }) => rms(track.samples, 0, plan.totalMs)
    expect(energy(quiet)).toBeLessThan(energy(loud) * 0.95)
  })

  it('câștigul general e cel declarat, nu unul normalizat pe sesiune', () => {
    const one = planDrumSession(snareOnly(['accent', null, null, null]), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const dense = planDrumSession(snareOnly(['accent', 'accent', 'accent', 'accent']), {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    // Aceeași lovitură, același vârf: densitatea sesiunii nu schimbă volumul.
    expect(rms(renderDrumTrack(one, { samples: kit }).samples, 0, 60)).toBeCloseTo(
      rms(renderDrumTrack(dense, { samples: kit }).samples, 0, 60),
      6,
    )
    expect(MASTER_GAIN).toBeLessThan(1)
  })
})

describe('sesiunea în buclă', () => {
  /*
    Un cinel pe ultimul timp, nimic altceva: coada lui ține două secunde, deci
    trece cu mult peste capătul măsurii. Exact cazul pe care bucla trebuie să-l
    rezolve, cu toba mică (0,7 s) coada aproape că se stinge singură și nu s-ar
    vedea nimic.
  */
  const crashOnLast: DrumExercise = {
    id: 'crash-probe',
    kind: 'groove',
    stepsPerBar: 4,
    beatsPerBar: 4,
    bars: [{ lanes: { crash: [null, null, null, 'accent'] } }],
    tempo: { min: 50, max: 90, suggested: 80 },
  }
  const loopPlan = () =>
    planDrumMedley([{ exercise: crashOnLast, bpm: 90, repeats: 2 }], {
      loop: true,
      countInBars: 0,
    })

  it('nu are numărătoare și se știe buclă', () => {
    /*
      Numărătoarea s-ar auzi la FIECARE reluare, iar o măsură de click la fiecare
      ciclu nu e numărătoare, e o gaură în groove. De aceea bucla începe direct
      pe „unu”.
    */
    const plan = loopPlan()
    expect(plan.loop).toBe(true)
    expect(plan.bars.some((bar) => bar.countIn)).toBe(false)
  })

  it('se închide exact pe sfârșitul muzical, nu pe coada ultimei lovituri', () => {
    const plan = loopPlan()
    const once = renderDrumTrack(plan, { samples: kit, clicks: false })
    const looped = renderDrumTrack(plan, { samples: kit, clicks: false, loop: true })
    // Fără buclă, pista ține mai mult decât muzica: toba mică se stinge după.
    expect(once.durationMs).toBeGreaterThan(plan.totalMs)
    expect(looped.durationMs).toBeCloseTo(plan.totalMs, 1)
  })

  it('adună coada la început, în loc s-o taie', () => {
    /*
      Lovitura e pe ultimul timp, deci coada ei cade DUPĂ sfârșitul măsurii,
      adică, în buclă, peste începutul reluării. Tăiată, s-ar auzi un pocnet la
      fiecare ciclu; adunată, sună ca la tobe adevărate.
    */
    const plan = loopPlan()
    const once = renderDrumTrack(plan, { samples: kit, clicks: false })
    const looped = renderDrumTrack(plan, { samples: kit, clicks: false, loop: true })
    const head = (samples: Float32Array) => rms(samples, 0, 40)
    // Fără buclă e liniște curată la început (nimic nu sună încă); cu buclă, la
    // aceeași poziție se aude coada cinelului de la capăt, de vreo două ori mai
    // încet decât lovitura însăși, fiindcă se stinge de o secundă și jumătate.
    expect(head(once.samples)).toBeLessThan(1e-6)
    expect(head(looped.samples)).toBeGreaterThan(0.005)
    /*
      Și între două treceri din aceeași pistă, drumul obișnuit la exemplele din
      manual, care pun ~30 s de treceri într-un fișier: coada intră peste
      „unu”-ul trecerii următoare fără nicio cusătură.
    */
    const passMs = plan.totalMs / 2
    expect(rms(looped.samples, passMs, passMs + 40)).toBeGreaterThan(0.005)
  })

  it('are altă cheie de cache decât aceeași sesiune fără buclă', () => {
    const plan = loopPlan()
    const options = { clicks: false }
    expect(drumTrackKey(plan, 'muldjord', { ...options, loop: true })).not.toBe(
      drumTrackKey(plan, 'muldjord', options),
    )
  })
})

describe('cheia de cache', () => {
  const plan = (bpm: number, repeats = 1) =>
    planDrumSession(rockGroove, { segments: [{ bpm, repeats }] })

  it('e aceeași pentru același plan', () => {
    expect(drumTrackKey(plan(100), 'muldjord', {})).toBe(drumTrackKey(plan(100), 'muldjord', {}))
  })

  it('se schimbă la orice lucru care schimbă sunetul', () => {
    const base = drumTrackKey(plan(100), 'muldjord', {})
    expect(drumTrackKey(plan(101), 'muldjord', {})).not.toBe(base)
    expect(drumTrackKey(plan(100, 2), 'muldjord', {})).not.toBe(base)
    expect(drumTrackKey(plan(100), 'muldjord', { clicks: false })).not.toBe(base)
    expect(drumTrackKey(plan(100), 'muldjord', { mix: { kick: 0.5 } })).not.toBe(base)
    expect(drumTrackKey(plan(100), 'drs', {})).not.toBe(base)
  })
})

describe('mostrele din kit', () => {
  it('sunt toate, mono, la 44,1 kHz', () => {
    // Trei straturi pe piesă, niciunul lipsă: o mostră care nu există se vede
    // abia la randare, ca excepție, în mijlocul unei sesiuni.
    expect(manifest.files).toHaveLength(kitPieces.length * 3)
    for (const entry of manifest.files) {
      const samples = kit[`${entry.piece}-${entry.layer}` as keyof KitSamples]
      expect(samples, entry.file).toBeDefined()
      expect(samples!.length).toBeGreaterThan(0.05 * SAMPLE_RATE)
    }
  })

  it('atacă de la primul eșantion, fără tăcere la început', () => {
    /*
      Asta e verificarea care apără groove-ul. O mostră cu tăcere înainte de atac
      întârzie lovitura, și nu uniform: fiecare piesă cu altă cantitate, deci
      ritmul se strâmbă în loc să fie doar deplasat.
    */
    for (const entry of manifest.files) {
      const samples = kit[`${entry.piece}-${entry.layer}` as keyof KitSamples]!
      let peak = 0
      for (const value of samples) peak = Math.max(peak, Math.abs(value))
      let onset = 0
      while (onset < samples.length && Math.abs(samples[onset]!) < peak * 0.02) onset += 1
      expect((onset / SAMPLE_RATE) * 1000, `${entry.file} atacă târziu`).toBeLessThan(2)
    }
  })

  it('păstrează dinamica între straturi, pe toate piesele', () => {
    /*
      Dacă straturile ar fi fost normalizate separat, raportul ar fi ~1 și accentul
      ar suna ca ghost note-ul. Se măsoară pe ENERGIE, nu pe vârf: vârful unei
      lovituri de tobă e un singur eșantion de tranzient și sare de la o lovitură
      la alta fără să însemne nimic, la toba de podea, o alegere de straturi
      făcută pe vârf dădea un accent mai încet decât lovitura normală.
    */
    const energy = (piece: string, layer: string) => {
      const samples = kit[`${piece}-${layer}` as keyof KitSamples]!
      let sum = 0
      for (const value of samples) sum += value * value
      return Math.sqrt(sum / samples.length)
    }
    for (const piece of kitPieces) {
      expect(energy(piece, 'accent'), piece).toBeGreaterThan(energy(piece, 'normal') * 1.15)
      expect(energy(piece, 'normal'), piece).toBeGreaterThan(energy(piece, 'ghost') * 1.15)
    }
  })
})
