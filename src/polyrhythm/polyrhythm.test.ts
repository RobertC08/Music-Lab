import { describe, expect, it } from 'vitest'
import {
  POLYRHYTHM_LEVEL_COUNT,
  PULSE_SOUND,
  commonGrid,
  generatePolyrhythm,
  polyrhythmHands,
  polyrhythmLevelForAdaptive,
  polyrhythmLevelsSource,
  polyrhythmRoundForLevel,
  streamPositions,
} from './patterns'
import { planPolyrhythmTrack, polyrhythmSounds } from './track'
import { renderLaneWav } from '../lanes/track'
import { scoreLanes } from '../lanes/score'

/*
  `lanes/build-track` nu se importă aici, nici în testele celorlalte jocuri:
  trage `react-native` după el, iar vitest nu poate parsa Flow. Ce ține de
  cache-ul pistei se verifică prin datele din care se face cheia.
*/

/*
  Datele astea sunt scrise de mână (rapoartele și intervalele de tempo), iar o
  greșeală în ele nu dă eroare de compilare, strică jocul. Testele verifică
  fiecare nivel, la fiecare tempo din intervalul lui, nu un exemplu.
*/

const LEVELS = Array.from({ length: POLYRHYTHM_LEVEL_COUNT }, (_, index) => index + 1)
/** Seed-uri diferite pe același nivel: hazardul nu are voie să producă date invalide. */
const SEEDS = Array.from({ length: 24 }, (_, index) => index * 7919 + 1)

const pulseHandOf = (round: { crossHand: 'left' | 'right' }) =>
  round.crossHand === 'left' ? 'right' : 'left'

/** Nivelurile la care pulsul se aude dar nu se bate (mecanica lecției 18). */
const SOLO_LEVELS = LEVELS.filter((level) => polyrhythmLevelsSource[level - 1]!.solo)
const DUET_LEVELS = LEVELS.filter((level) => !polyrhythmLevelsSource[level - 1]!.solo)
/** Un nivel cu amândouă mâinile de bătut, pentru testele de scor. */
const DUET = DUET_LEVELS[0]!

describe('grila comună', () => {
  it('e cel mai mic număr de pași în care intră amândouă fluxurile', () => {
    expect(commonGrid(3, 2)).toBe(6)
    expect(commonGrid(3, 4)).toBe(12)
    expect(commonGrid(5, 4)).toBe(20)
    expect(commonGrid(5, 3)).toBe(15)
    // Nu produsul, când fluxurile au un divizor comun.
    expect(commonGrid(4, 2)).toBe(4)
  })

  it('așază 3 contra 2 exact pe pozițiile pe care le predă lecția', () => {
    // Lecția 18: „fluxul de trei cade pe 1, 3 și 5; cel de doi pe 1 și 4”.
    expect(streamPositions(3, 6)).toEqual([1, 3, 5])
    expect(streamPositions(2, 6)).toEqual([1, 4])
  })

  it('așază 3 contra 4 pe pozițiile din lecție', () => {
    // „trei pe 1, 5 și 9; patru pe 1, 4, 7 și 10”.
    expect(streamPositions(3, 12)).toEqual([1, 5, 9])
    expect(streamPositions(4, 12)).toEqual([1, 4, 7, 10])
  })
})

describe('nivelurile', () => {
  it('acoperă 1…100 fără gol și fără să sară peste vreun nivel', () => {
    const seen = new Set(
      Array.from({ length: 100 }, (_, index) => polyrhythmLevelForAdaptive(index + 1)),
    )
    expect([...seen].sort((left, right) => left - right)).toEqual(LEVELS)
  })

  it('începe cu un nivel de intrare, cu o singură mână', () => {
    // Primul contact cu poliritmul nu poate fi cu două mâini deodată.
    expect(polyrhythmLevelsSource[0]!.solo).toBe(true)
    expect(SOLO_LEVELS).toEqual([1])
  })

  it('are rapoarte cu numere care nu se cuprind unul pe altul', () => {
    for (const source of polyrhythmLevelsSource) {
      for (const [cross, pulse] of source.ratios) {
        expect(cross, source.id).not.toBe(pulse)
        // Un raport ca 4 contra 2 nu e poliritm: al doilea flux intră în primul.
        expect(cross % pulse, `${source.id}: ${cross} contra ${pulse}`).not.toBe(0)
        expect(pulse % cross, `${source.id}: ${cross} contra ${pulse}`).not.toBe(0)
      }
    }
  })
})

describe('fiecare rundă generată', () => {
  for (const level of LEVELS) {
    const source = polyrhythmLevelsSource[level - 1]!

    it(`nivelul ${level} (${source.id}) produce două fluxuri egale, pe grila comună`, () => {
      for (const seed of SEEDS) {
        const round = generatePolyrhythm(level, seed)
        const where = `${source.id}, seed ${seed}`
        const pulseHand = pulseHandOf(round)

        // Grila e chiar cea comună, altfel o notă ar cădea între pași.
        expect(round.stepsPerBar, where).toBe(commonGrid(round.crossCount, round.pulseCount))
        // Pulsul e un flux, nu un al treilea reper.
        expect(round.beatsPerBar, where).toBe(round.pulseCount)
        // Pașii pe timp trebuie să fie întregi: motorul împarte fix.
        expect(round.stepsPerBar % round.beatsPerBar, where).toBe(0)

        // Fiecare mână are exact câte note scrie raportul, pe fiecare măsură.
        const bars = round.lanes[round.crossHand].length / round.stepsPerBar
        expect(Number.isInteger(bars), where).toBe(true)
        expect(round.lanes[round.crossHand].filter(Boolean).length, where).toBe(
          round.crossCount * bars,
        )
        // La nivelul de intrare pulsul nu se bate: e în acompaniament, nu în ținte.
        const pulseSteps = round.solo
          ? round.backing?.[PULSE_SOUND] ?? []
          : round.lanes[pulseHand]
        expect(pulseSteps.filter(Boolean).length, where).toBe(round.pulseCount * bars)
        if (round.solo) expect(round.lanes[pulseHand].filter(Boolean).length, where).toBe(0)

        // Ambele fluxuri au aceeași lungime, altfel banda și scorul s-ar decala.
        expect(round.lanes.left.length, where).toBe(round.lanes.right.length)

        // Notele fiecărui flux sunt egal distanțate, un poliritm inegal nu e poliritm.
        for (const hand of polyrhythmHands) {
          const steps = round.lanes[hand]
            .map((hit, step) => (hit ? step : -1))
            .filter((step) => step >= 0)
          const gaps = steps.slice(1).map((step, index) => step - steps[index]!)
          expect(new Set(gaps).size, `${where}, ${hand}`).toBeLessThanOrEqual(1)
        }

        // Tempoul rămâne în intervalul declarat al nivelului.
        expect(round.bpm, where).toBeGreaterThanOrEqual(source.bpm[0])
        expect(round.bpm, where).toBeLessThanOrEqual(source.bpm[1])
      }
    })

    it(`nivelul ${level} (${source.id}) se atinge doar pe „unu”`, () => {
      for (const seed of SEEDS) {
        const round = generatePolyrhythm(level, seed)
        const pulseHand = pulseHandOf(round)
        // Fluxul pulsului: bătut la nivelurile normale, doar auzit la cel de intrare.
        const pulseSteps = round.solo
          ? round.backing?.[PULSE_SOUND] ?? []
          : round.lanes[pulseHand]
        const shared = round.lanes[round.crossHand]
          .map((hit, step) => (hit && pulseSteps[step] ? step : -1))
          .filter((step) => step >= 0)
        // Singurele poziții comune sunt începuturile de măsură.
        expect(shared.every((step) => step % round.stepsPerBar === 0), `${source.id}, seed ${seed}`).toBe(true)
        expect(shared.length, `${source.id}, seed ${seed}`).toBe(
          round.lanes[round.crossHand].length / round.stepsPerBar,
        )
      }
    })

    it(`nivelul ${level} (${source.id}) nu cere două lovituri la mai puțin de 90 ms`, () => {
      /*
        Pragul din restul modulului: sub 90 ms nu mai e ritm, e dexteritate.

        Loviturile SIMULTANE nu intră la socoteală: pe „unu” cele două fluxuri
        cad împreună prin definiție, iar două mâini care lovesc odată nu cer
        dexteritate. Se măsoară distanța dintre atacuri distincte, atât în
        aceeași mână, cât și între mâini, unde fluxurile se apropie cel mai mult
        (la un raport a:b, cel mai aproape ajung la o măsură supra lcm(a,b)).
      */
      for (const seed of SEEDS) {
        const round = generatePolyrhythm(level, seed)
        // Cazul cel mai strâns e la tempoul cel mai mare al nivelului.
        const fastest = { ...round, bpm: source.bpm[1] }
        const layout = planPolyrhythmTrack(fastest)
        const where = `${source.id}, seed ${seed}, ${source.bpm[1]} BPM`

        const closestAmong = (times: number[]) => {
          const sorted = [...times].sort((left, right) => left - right)
          const gaps = sorted.slice(1).map((at, index) => at - sorted[index]!)
          const distinct = gaps.filter((gap) => gap > 0.001)
          return distinct.length ? Math.min(...distinct) : Infinity
        }

        for (const hand of polyrhythmHands) {
          expect(closestAmong(layout.laneTargetsMs[hand]), `${where}, ${hand}`).toBeGreaterThanOrEqual(90)
        }
        expect(
          closestAmong(polyrhythmHands.flatMap((hand) => layout.laneTargetsMs[hand])),
          where,
        ).toBeGreaterThanOrEqual(90)
      }
    })
  }
})

describe('pista', () => {
  it('dă fluxurilor sunete diferite, ca să nu se topească pe „unu”', () => {
    for (const level of LEVELS) {
      for (const seed of SEEDS.slice(0, 6)) {
        const round = generatePolyrhythm(level, seed)
        const sounds = polyrhythmSounds(round)
        expect(sounds.left, `nivel ${level}, seed ${seed}`).not.toBe(sounds.right)
      }
    }
  })

  it('pune al doilea flux exact cu o cvintă mai jos', () => {
    /*
      Nu se verifică numele vocilor, ci SUNETUL: se randează fiecare voce
      singură și se numără trecerile prin zero, care dau frecvența. Cvinta e
      singurul motiv pentru care alegerea asta există, dacă cineva schimbă
      într-o zi tonurile, aici trebuie să pice, nu în urechea unui elev.
    */
    const SAMPLE_RATE = 44_100
    const frequencyOf = (sound: 'tone' | 'toneFifthBelow') => {
      const wav = renderLaneWav([{ atMs: 0, voice: sound }], 120)
      const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength)
      const count = (wav.length - 44) / 2
      // Doar începutul notei: spre coadă, amplitudinea scade în zgomotul de cuantizare.
      const window = Math.min(count, Math.floor(SAMPLE_RATE * 0.05))
      let crossings = 0
      let previous = view.getInt16(44, true)
      for (let index = 1; index < window; index += 1) {
        const value = view.getInt16(44 + index * 2, true)
        if ((previous < 0 && value >= 0) || (previous >= 0 && value < 0)) crossings += 1
        previous = value
      }
      return (crossings / 2 / (window / SAMPLE_RATE))
    }
    const high = frequencyOf('tone')
    const low = frequencyOf('toneFifthBelow')
    expect(high).toBeGreaterThan(420)
    expect(high).toBeLessThan(460)
    // Cvinta perfectă: raportul 3:2.
    expect(high / low).toBeGreaterThan(1.44)
    expect(high / low).toBeLessThan(1.56)
  })

  it('leagă sunetul de flux, nu de mână', () => {
    // Aceeași mână primește alt sunet când ține celălalt flux.
    const rounds = SEEDS.map((seed) => generatePolyrhythm(10, seed))
    const crossLeft = rounds.find((round) => round.crossHand === 'left')
    const crossRight = rounds.find((round) => round.crossHand === 'right')
    expect(crossLeft, 'nivelul 10 trebuie să producă și runde cu stânga pe fluxul de peste puls').toBeDefined()
    expect(crossRight, 'și runde cu dreapta').toBeDefined()
    expect(polyrhythmSounds(crossLeft!).left).toBe(polyrhythmSounds(crossRight!).right)
  })

  it('nu dă două runde cu mâinile schimbate aceeași pistă din cache', () => {
    /*
      Cheia pistei (`laneTrackKey`) se face din pașii fiecărei voci, în ordinea
      vocilor, nu din sunete. Dacă cele două runde ar avea aceiași pași pe
      aceleași mâini, ar primi același WAV, iar una din ele s-ar auzi cu
      fluxurile inversate față de ce arată ecranul. Aici se cere exact ce intră
      în cheie: pașii pe mână diferă.
    */
    const rounds = SEEDS.map((seed) => generatePolyrhythm(DUET, seed))
    const left = rounds.find((round) => round.crossHand === 'left')!
    const right = rounds.find((round) => round.crossHand === 'right')!
    const asKey = (round: (typeof rounds)[number]) =>
      polyrhythmHands.map((hand) => round.lanes[hand].map((hit) => (hit ? '1' : '0')).join('')).join('-')
    expect(asKey(left)).not.toBe(asKey(right))
  })

  it('pune numărătoarea fix pe fluxul de sprijin', () => {
    for (const level of LEVELS) {
      const round = generatePolyrhythm(level, 12_345)
      const layout = planPolyrhythmTrack(round)
      const pulseHand = pulseHandOf(round)
      const beatMs = 60_000 / round.bpm
      // Fiecare notă a fluxului de sprijin cade pe un timp întreg. Distanța se
      // ia la cel mai apropiat timp în ambele sensuri: în virgulă mobilă,
      // restul unei împărțiri exacte poate ieși aproape egal cu împărțitorul.
      for (const at of layout.laneTargetsMs[pulseHand]) {
        const rest = (at - layout.responseStartMs) % beatMs
        expect(Math.min(rest, beatMs - rest), `nivel ${level}`).toBeLessThan(0.001)
      }
    }
  })

  it('nu ține fluxul care trece peste pe timpii întregi', () => {
    // Dacă ar cădea tot pe timpi, n-ar mai fi poliritm, ar fi același ritm.
    for (const level of LEVELS) {
      const round = generatePolyrhythm(level, 12_345)
      const layout = planPolyrhythmTrack(round)
      const beatMs = 60_000 / round.bpm
      const offBeat = layout.laneTargetsMs[round.crossHand].filter((at) => {
        const rest = (at - layout.responseStartMs) % beatMs
        return Math.min(rest, beatMs - rest) > 1
      })
      expect(offBeat.length, `nivel ${level}`).toBeGreaterThan(0)
    }
  })

  it('nu foloseşte acompaniament la nivelurile cu două mâini', () => {
    // Acolo amândouă fluxurile sunt ale tale, deci n-are ce să nu se puncteze.
    for (const level of DUET_LEVELS) {
      expect(generatePolyrhythm(level, 999).backing, `nivel ${level}`).toBeUndefined()
    }
  })

  it('pune pulsul în acompaniament la nivelul de intrare, cu sunetul lui', () => {
    for (const level of SOLO_LEVELS) {
      for (const seed of SEEDS.slice(0, 6)) {
        const round = generatePolyrhythm(level, seed)
        const where = `nivel ${level}, seed ${seed}`
        const held = round.backing?.[PULSE_SOUND]
        expect(held, where).toBeDefined()
        expect(held!.filter(Boolean).length, where).toBe(
          round.pulseCount * (round.lanes[round.crossHand].length / round.stepsPerBar),
        )
        // Acompaniamentul e singura voce în plus: nimic altceva nu sună pe lângă.
        expect(Object.keys(round.backing!), where).toEqual([PULSE_SOUND])
      }
    }
  })

  it('face acompaniamentul să continue și în fereastra de răspuns', () => {
    /*
      Partea care contează, la fel ca la lecție: fără ea n-ar exista poliritm,
      ci un ritm ciudat bătut singur. Se cere pe pista randată, nu pe date.
    */
    const round = generatePolyrhythm(SOLO_LEVELS[0]!, 7)
    const layout = planPolyrhythmTrack(round)
    const heldNotes = (round.backing?.[PULSE_SOUND] ?? []).filter(Boolean).length
    const sounding = layout.events.filter((event) => event.voice === PULSE_SOUND)
    const duringResponse = sounding.filter((event) => event.atMs >= layout.responseStartMs)
    expect(heldNotes).toBeGreaterThan(0)
    expect(duringResponse.length).toBe(heldNotes)
  })

  it('nu lasă nimic de bătut pe mâna pulsului, la nivelul de intrare', () => {
    // Altfel padul ei ar cere lovituri care nu se aud nicăieri.
    for (const level of SOLO_LEVELS) {
      const round = generatePolyrhythm(level, 3)
      const layout = planPolyrhythmTrack(round)
      expect(layout.laneTargetsMs[pulseHandOf(round)], `nivel ${level}`).toEqual([])
      expect(layout.laneTargetsMs[round.crossHand].length, `nivel ${level}`).toBeGreaterThan(0)
    }
  })
})

describe('scorul', () => {
  it('punctează fiecare mână separat', () => {
    const round = generatePolyrhythm(DUET, 42)
    const layout = planPolyrhythmTrack(round)
    const pulseHand = pulseHandOf(round)
    // O mână bate perfect, cealaltă nu bate deloc.
    const taps = layout.laneTargetsMs[round.crossHand].map((atMs) => ({
      atMs,
      voice: round.crossHand,
    }))
    const scored = scoreLanes(polyrhythmHands, layout.laneTargetsMs, taps, layout.stepMs)
    expect(scored.laneScores[round.crossHand]).toBeGreaterThan(90)
    expect(scored.laneScores[pulseHand]).toBe(0)
    // Scorul rundei stă între ele, nu ia doar mâna bună.
    expect(scored.score).toBeGreaterThan(0)
    expect(scored.score).toBeLessThan(90)
  })

  it('numără ca bătaie greșită o notă bătută cu mâna cealaltă', () => {
    const round = generatePolyrhythm(DUET, 42)
    const layout = planPolyrhythmTrack(round)
    const pulseHand = pulseHandOf(round)
    // Fluxul de sprijin, bătut corect la timp, dar cu mâna care ține celălalt flux.
    const taps = layout.laneTargetsMs[pulseHand].map((atMs) => ({ atMs, voice: round.crossHand }))
    const scored = scoreLanes(polyrhythmHands, layout.laneTargetsMs, taps, layout.stepMs)
    expect(scored.laneScores[pulseHand]).toBe(0)
    expect(scored.extraTaps).toBeGreaterThan(0)
  })

  it('dă scor mare când amândouă mâinile bat la timp', () => {
    for (const level of LEVELS) {
      const round = generatePolyrhythm(level, 4_242)
      const layout = planPolyrhythmTrack(round)
      const taps = polyrhythmHands.flatMap((hand) =>
        layout.laneTargetsMs[hand].map((atMs) => ({ atMs, voice: hand })),
      )
      const scored = scoreLanes(polyrhythmHands, layout.laneTargetsMs, taps, layout.stepMs)
      expect(scored.score, `nivel ${level}`).toBeGreaterThan(90)
      expect(scored.strayTaps, `nivel ${level}`).toBe(0)
    }
  })
})

describe('runda pe nivel adaptiv', () => {
  it('dă aceeași rundă pentru același nivel și aceeași încercare', () => {
    expect(polyrhythmRoundForLevel(37, 2)).toEqual(polyrhythmRoundForLevel(37, 2))
  })

  it('dă altă variantă la încercarea următoare', () => {
    const first = polyrhythmRoundForLevel(37, 0)
    const second = polyrhythmRoundForLevel(37, 1)
    expect(first.seed).not.toBe(second.seed)
  })

  it('scrie etapa și pasul, pentru ecran', () => {
    const round = polyrhythmRoundForLevel(41)
    expect(round.stage).toBe(3)
    expect(round.step).toBe(1)
    expect(round.polyrhythmLevel).toBeGreaterThanOrEqual(1)
    expect(round.polyrhythmLevel).toBeLessThanOrEqual(POLYRHYTHM_LEVEL_COUNT)
  })
})
