import { describe, expect, it } from 'vitest'
import { allowedSteps, generatePattern, scoreRound } from './rhythm'
import { echoLevels } from '../curriculum/echo'
import { planRoundTrack } from '../audio/round-plan'

const STEP_MS = 250 // optimi la 120 BPM

describe('scoreRound', () => {
  it('da scor maxim cand fiecare bataie cade exact pe tinta', () => {
    const targets = [0, 500, 750, 1500]
    const result = scoreRound(targets, [...targets], STEP_MS)
    expect(result.score).toBe(100)
    expect(result.hits.every((hit) => hit.judgement === 'perfect')).toBe(true)
    expect(result.extraTaps).toBe(0)
  })

  it('trateaza o intarziere constanta ca latenta, nu ca greseala', () => {
    const targets = [0, 500, 750, 1500]
    const taps = targets.map((value) => value + 60)
    const result = scoreRound(targets, taps, STEP_MS)
    expect(Math.round(result.latencyMs)).toBe(60)
    expect(result.score).toBe(100)
    expect(result.tendency).toBe('steady')
  })

  it('nu pierde loviturile cand device-ul are latenta mare', () => {
    const targets = [0, 500, 1000, 1500]
    // 200 ms e o latenta realista pe Android. Ritmul e perfect uniform, deci
    // scorul trebuie sa ramana maxim, iar decalajul raportat ca atare.
    const taps = targets.map((value) => value + 200)
    const result = scoreRound(targets, taps, STEP_MS)
    expect(result.hits.every((hit) => hit.judgement === 'perfect')).toBe(true)
    expect(Math.round(result.latencyMs)).toBe(200)
    expect(result.score).toBe(100)
  })

  it('penalizeaza neuniformitatea, nu decalajul constant', () => {
    const targets = [0, 500, 1000, 1500]
    // Acelasi decalaj mediu, dar imprastiat: asta e o greseala reala.
    const taps = [200, 560, 1180, 1520]
    const result = scoreRound(targets, taps, STEP_MS)
    expect(result.score).toBeLessThan(100)
  })

  it('o bataie ratata nu decaleaza restul rundei', () => {
    const targets = [0, 500, 1000, 1500]
    // Lipseste a doua bataie; celelalte sunt exacte.
    const taps = [0, 1000, 1500]
    const result = scoreRound(targets, taps, STEP_MS)
    expect(result.hits.map((hit) => hit.judgement)).toEqual([
      'perfect',
      'miss',
      'perfect',
      'perfect',
    ])
    expect(result.extraTaps).toBe(0)
    // Trei din patru lovituri corecte trebuie sa ramana un scor decent.
    expect(result.score).toBeGreaterThan(60)
  })

  it('numara bataile in plus si le penalizeaza', () => {
    const targets = [0, 500]
    const taps = [0, 500, 2000, 2400]
    const result = scoreRound(targets, taps, STEP_MS)
    expect(result.extraTaps).toBe(2)
    expect(result.score).toBeLessThan(100)
    expect(result.score).toBeGreaterThan(0)
  })

  it('detecteaza accelerarea pe parcursul rundei', () => {
    const targets = [0, 400, 800, 1200, 1600, 2000]
    // Intra la timp, apoi o ia inainte tot mai mult.
    const taps = [0, 380, 740, 1080, 1400, 1700]
    const result = scoreRound(targets, taps, STEP_MS)
    expect(result.tendency).toBe('rushing')
  })

  it('nu foloseste aceeasi bataie pentru doua tinte', () => {
    const targets = [0, 250]
    const result = scoreRound(targets, [125], STEP_MS)
    const matched = result.hits.filter((hit) => hit.tapMs !== null)
    expect(matched).toHaveLength(1)
  })

  it('returneaza zero cand nu s-a batut deloc', () => {
    const result = scoreRound([0, 500, 1000], [], STEP_MS)
    expect(result.score).toBe(0)
    expect(result.hits.every((hit) => hit.judgement === 'miss')).toBe(true)
  })
})

describe('generatePattern', () => {
  const seeds = Array.from({ length: 40 }, (_, index) => index * 7919 + 13)

  it('respecta lungimea masurii si intra in primul timp', () => {
    echoLevels.forEach((level) => {
      seeds.forEach((seed) => {
        const pattern = generatePattern(level, seed + level.level)
        expect(pattern.steps).toHaveLength(level.stepsPerBar * level.bars)
        const stepsPerBeat = level.stepsPerBar / level.beatsPerBar
        // Nu cerem nota chiar pe „unu" - nivelurile de contratimp intra intre
        // timpi. Cerem sa se auda ceva in primul timp, ca sa nu se astepte in
        // gol dupa numaratoare.
        expect(pattern.steps.slice(0, stepsPerBeat).some(Boolean)).toBe(true)
      })
    })
  })

  it('nu pune nicio nota in afara subdiviziunilor nivelului', () => {
    echoLevels.forEach((level) => {
      const permise = new Set(allowedSteps(level))
      seeds.forEach((seed) => {
        const { steps } = generatePattern(level, seed + level.level)
        steps.forEach((isHit, index) => {
          if (!isHit) return
          // Asta e regula care face pattern-urile jucabile: pe grila de 48 o
          // nota pe pasul 5 n-ar fi nici binara, nici ternara - nu s-ar putea
          // nici scrie, nici bate.
          expect(permise.has(index), `nivel ${level.level}, pas ${index}`).toBe(true)
        })
      })
    })
  })

  it('are destule lovituri cat sa fie un exercitiu', () => {
    echoLevels.forEach((level) => {
      seeds.forEach((seed) => {
        const { steps } = generatePattern(level, seed + level.level)
        expect(steps.filter(Boolean).length).toBeGreaterThanOrEqual(3)
      })
    })
  })

  it('nivelurile de subdiviziune chiar produc grupuri intregi', () => {
    // Un nivel de triolete care imprastie doua note pe grila de trei nu preda
    // trioletul. Cerem ca macar un timp dintr-un esantion sa sune toata schema.
    const cuGrupuri = echoLevels.filter((level) => (level.groupChance ?? 0) > 0.3)
    expect(cuGrupuri.length).toBeGreaterThan(0)
    cuGrupuri.forEach((level) => {
      const stepsPerBeat = level.stepsPerBar / level.beatsPerBar
      const ceaMaiLunga = level.subdivisions.reduce((best, scheme) =>
        scheme.length > best.length ? scheme : best,
      )
      const gasit = seeds.some((seed) => {
        const { steps } = generatePattern(level, seed + level.level)
        return Array.from({ length: level.beatsPerBar * level.bars }, (_, beat) =>
          ceaMaiLunga.every((offset) => steps[beat * stepsPerBeat + offset]),
        ).some(Boolean)
      })
      expect(gasit, `nivelul ${level.level}`).toBe(true)
    })
  })

  it('nu cere memorat mai mult decat se poate', () => {
    echoLevels.forEach((level) => {
      const totalBeats = level.beatsPerBar * level.bars
      seeds.forEach((seed) => {
        const { steps } = generatePattern(level, seed + level.level)
        // Jocul se joaca din auz: un pattern peste plafon nu mai e ritm, e pata.
        expect(steps.filter(Boolean).length).toBeLessThanOrEqual(
          Math.round(totalBeats * 2.5) + 1,
        )
      })
    })
  })

  it('acelasi seed da acelasi pattern', () => {
    echoLevels.forEach((level) => {
      const first = generatePattern(level, 12_345)
      const second = generatePattern(level, 12_345)
      expect(second.steps).toEqual(first.steps)
      expect(second.bpm).toBe(first.bpm)
    })
  })

  it('tempoul variaza in interiorul nivelului, in intervalul lui', () => {
    echoLevels.forEach((level) => {
      const [slow, fast] = level.bpm
      const tempos = seeds.map((seed) => generatePattern(level, seed).bpm)
      tempos.forEach((bpm) => {
        expect(bpm).toBeGreaterThanOrEqual(slow)
        expect(bpm).toBeLessThanOrEqual(fast)
      })
      // Un singur tempo pe nivel ar antrena o viteza, nu ritmul.
      expect(new Set(tempos).size).toBeGreaterThan(3)
    })
  })

  it('fiecare pattern produce o pista redabila', () => {
    echoLevels.forEach((level) => {
      seeds.slice(0, 8).forEach((seed) => {
        const pattern = generatePattern(level, seed + level.level)
        const plan = planRoundTrack({
          bpm: pattern.bpm,
          stepsPerBar: pattern.stepsPerBar,
          beatsPerBar: pattern.beatsPerBar,
          pattern: pattern.steps,
          countInBars: 1,
          prepBars: 1,
        })
        expect(plan.targetTimesMs).toHaveLength(pattern.steps.filter(Boolean).length)
        plan.targetTimesMs.forEach((time) => {
          expect(time).toBeGreaterThanOrEqual(plan.responseStartMs)
          expect(time).toBeLessThan(plan.totalMs)
        })
      })
    })
  })

  it('doua note vecine nu ajung imposibil de batut', () => {
    echoLevels.forEach((level) => {
      seeds.forEach((seed) => {
        const pattern = generatePattern(level, seed + level.level)
        const beatMs = 60_000 / pattern.bpm
        const stepMs = beatMs / (pattern.stepsPerBar / pattern.beatsPerBar)
        const onsets = pattern.steps.flatMap((isHit, index) => (isHit ? [index] : []))
        onsets.slice(1).forEach((step, index) => {
          const gapMs = (step - onsets[index]!) * stepMs
          // 90 ms intre doua atacuri e deja rapid pe ecran, dar posibil.
          // Sub atat n-ar mai fi ritm, ci dexteritate.
          expect(gapMs, `nivel ${level.level}`).toBeGreaterThanOrEqual(90)
        })
      })
    })
  })
})

describe('durata notelor tinute', () => {
  const targets = [0, 1000, 2000, 3000]
  // Patru note lungi de cate o secunda.
  const targetDurationsMs = [1000, 1000, 1000, 1000]

  it('nu judeca durata daca nu i se dau date despre tinere', () => {
    const result = scoreRound(targets, [...targets], STEP_MS)
    expect(result.hits.every((hit) => hit.holdJudgement === null)).toBe(true)
    expect(result.score).toBe(100)
  })

  it('accepta o tinere apropiata de durata scrisa', () => {
    const result = scoreRound(targets, [...targets], STEP_MS, {
      tapDurationsMs: [950, 1050, 900, 1100],
      targetDurationsMs,
    })
    expect(result.hits.map((hit) => hit.holdJudgement)).toEqual(['ok', 'ok', 'ok', 'ok'])
    expect(result.score).toBe(100)
  })

  it('semnaleaza nota ciupita prea scurt', () => {
    const result = scoreRound(targets, [...targets], STEP_MS, {
      tapDurationsMs: [120, 1000, 1000, 1000],
      targetDurationsMs,
    })
    expect(result.hits[0]!.holdJudgement).toBe('short')
    expect(result.hits[0]!.heldMs).toBe(120)
    expect(result.hits[0]!.expectedHoldMs).toBe(1000)
    // Atacul a fost bun, deci nota nu se pierde cu totul.
    expect(result.score).toBeLessThan(100)
    expect(result.score).toBeGreaterThan(80)
  })

  it('semnaleaza nota tinuta prea mult', () => {
    const result = scoreRound(targets, [...targets], STEP_MS, {
      tapDurationsMs: [1000, 1000, 2400, 1000],
      targetDurationsMs,
    })
    expect(result.hits[2]!.holdJudgement).toBe('long')
  })

  it('nu judeca tinerea la note prea scurte ca sa conteze', () => {
    const shortTargets = [0, 200, 400, 600]
    const result = scoreRound(shortTargets, [...shortTargets], STEP_MS, {
      tapDurationsMs: [20, 20, 20, 20],
      // Note de 200 ms: sub pragul de la care tinerea e verificabila.
      targetDurationsMs: [200, 200, 200, 200],
    })
    expect(result.hits.every((hit) => hit.holdJudgement === null)).toBe(true)
    expect(result.score).toBe(100)
  })

  it('o doime ciupita ca o patrime se vede ca atare', () => {
    // Doime de 2000 ms tinuta doar 900 ms, adica exact greseala pe care
    // jocul nu o putea detecta inainte.
    const result = scoreRound([0], [0], STEP_MS, {
      tapDurationsMs: [900],
      targetDurationsMs: [2000],
    })
    expect(result.hits[0]!.holdJudgement).toBe('short')
  })
})

describe('pragurile urmaresc densitatea notelor, nu grila', () => {
  it('acelasi ritm judecat la fel, indiferent de rezolutia grilei', () => {
    const targets = [0, 500, 1000, 1500]
    const taps = [0, 560, 1000, 1500]
    // Acelasi ritm, notat o data pe optimi (250 ms/pas) si o data pe o grila
    // de trei ori mai fina (83 ms/pas).
    const peOptimi = scoreRound(targets, taps, 250)
    const peGrilaFina = scoreRound(targets, taps, 83)
    expect(peGrilaFina.score).toBe(peOptimi.score)
    expect(peGrilaFina.hits.map((h) => h.judgement)).toEqual(
      peOptimi.hits.map((h) => h.judgement),
    )
  })

  it('note apropiate cer mai multa precizie decat note rare', () => {
    // 150 ms intre note: o abatere de 60 ms nu mai e „exact".
    const dese = scoreRound([0, 150, 300], [0, 60, 300], 150)
    // 1000 ms intre note: aceeasi abatere trece drept exacta.
    const rare = scoreRound([0, 1000, 2000], [0, 1060, 2000], 1000)
    expect(dese.hits[1]!.judgement).not.toBe('perfect')
    expect(rare.hits[1]!.judgement).toBe('perfect')
  })
})
