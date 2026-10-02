import { describe, expect, it } from 'vitest'
import { missingFor, unlockedByProgress, unlockedIn } from './catalogue'
import { onsetsOf, validateExercise, type KitPiece } from './exercise'
import { grooveById, grooveStyles, grooveText, grooveVocabulary, grooves } from './grooves'
import { allSampleKeys } from './kit-keys'
import { planDrumSession, segmentsForDuration } from './plan'
import { renderDrumTrack } from './render'
import { SAMPLE_RATE } from './wav'
import { testKit } from './test-kit'

const kit = testKit

function rms(samples: Float32Array, fromMs: number, toMs: number) {
  const from = Math.max(0, Math.round((fromMs / 1000) * SAMPLE_RATE))
  const to = Math.min(samples.length, Math.round((toMs / 1000) * SAMPLE_RATE))
  let sum = 0
  for (let index = from; index < to; index += 1) sum += samples[index]! ** 2
  return to > from ? Math.sqrt(sum / (to - from)) : 0
}

describe('catalogul de groove-uri', () => {
  it('trece validarea, fiecare, față de vocabularul lui', () => {
    for (const exercise of grooves) {
      expect(validateExercise(exercise, grooveVocabulary), exercise.id).toEqual([])
    }
  })

  it('are id-uri distincte, cerințe care există și nimic din viitor', () => {
    const position = new Map(grooves.map((exercise, index) => [exercise.id, index]))
    expect(position.size).toBe(grooves.length)
    for (const exercise of grooves) {
      for (const required of exercise.requires ?? []) {
        // O cerință care vine mai târziu în listă ar face groove-ul de neatins.
        expect(position.get(required), `${exercise.id} cere ${required}`).toBeDefined()
        expect(position.get(required)!).toBeLessThan(position.get(exercise.id)!)
      }
    }
  })

  it('are stil și text pentru fiecare groove', () => {
    for (const exercise of grooves) {
      expect(exercise.kind, exercise.id).toBe('groove')
      expect(exercise.style, exercise.id).toBeDefined()
      const text = grooveText(exercise.id)
      expect(text.titleKey, exercise.id).toMatch(/^drums\./)
      expect(text.howToKey, exercise.id).toMatch(/^drums\./)
    }
  })

  it('acoperă stilurile cerute în brief', () => {
    for (const style of ['rock', 'funk', 'shuffle', 'jazz', 'latin', 'metal']) {
      expect(grooveStyles, style).toContain(style)
    }
  })

  it('le arată pe toate: poarta e oprită', () => {
    expect(unlockedIn(grooves, [])).toHaveLength(grooves.length)
  })

  it('păstrează regula pe trepte, dacă poarta se pune la loc', () => {
    const open = unlockedByProgress(grooves, [])
    expect(open).toHaveLength(1)
    expect(open[0]!.id).toBe('rock-basic')
    const done: string[] = []
    for (const exercise of grooves) {
      expect(
        unlockedByProgress(grooves, done).map((item) => item.id),
        exercise.id,
      ).toContain(exercise.id)
      done.push(exercise.id)
    }
  })

  it('spune ce mai lipsește pentru un groove blocat', () => {
    expect(missingFor(grooveById('funk-ghost')!, [])).toEqual(['rock-sixteenth-hats'])
    expect(missingFor(grooveById('funk-ghost')!, ['rock-sixteenth-hats'])).toEqual([])
  })

  it('are toba mare și toba mică în fiecare groove care se bate pe set', () => {
    /*
      Excepția e jazz-ul: acolo ride-ul și hi-hat-ul la picior SUNT groove-ul, iar
      toba mică vine din frazare, nu din model. Orice alt groove fără backbeat ar
      fi o greșeală de scriere, nu un stil. Cross-stick-ul și lovitura pe ramă țin
      locul tobei mici: e tot toba mică, lovită altfel (bossa, cha-cha-chá).
    */
    for (const exercise of grooves) {
      if (exercise.id === 'jazz-ride') continue
      const pieces = new Set(onsetsOf(exercise).map((onset) => onset.piece))
      // Toate sunt toba mică, lovită altfel: cross-stick, ramă, rimshot.
      const snareStrokes = ['snare', 'crossStick', 'rimClick', 'rimshot'] as const
      expect(snareStrokes.some((piece) => pieces.has(piece)), exercise.id).toBe(true)
      expect(pieces.has('kick'), exercise.id).toBe(true)
    }
  })

  it('pune backbeat-ul pe 2 și 4 acolo unde stilul îl cere', () => {
    // Fără verificarea asta, un rând mutat cu un pas ar da un groove care sună
    // „aproape bine” și pe care nimeni nu l-ar prinde citind tabelul.
    for (const id of [
      'rock-basic',
      'rock-backbeat',
      'rock-sixteenth-hats',
      'rock-sixteenth-kicks',
      'offbeat-hat',
      'disco-open-hat',
      'disco-sixteenths',
      'disco-syncopated',
      'metal-driving',
      'metal-gallop',
      'metal-double-bass',
    ]) {
      const exercise = grooveById(id)!
      const perBeat = exercise.stepsPerBar / exercise.beatsPerBar
      const snareBeats = onsetsOf(exercise)
        .filter((onset) => onset.piece === 'snare' && onset.hit === 'accent')
        .map((onset) => onset.step / perBeat)
      expect(snareBeats, id).toEqual([1, 3])
    }
  })

  it('folosește ghost note-uri acolo unde ele sunt groove-ul', () => {
    // Bossa nu mai e aici: clave-ul ei se cântă pe cross-stick, nu ca ghost notes.
    for (const id of ['funk-ghost', 'funk-syncopated', 'funk-open-hat', 'shuffle-ghost']) {
      const ghosts = onsetsOf(grooveById(id)!).filter((onset) => onset.hit === 'ghost')
      expect(ghosts.length, id).toBeGreaterThan(1)
    }
  })

  it('lasă mijlocul trioletei gol la shuffle, pe toate nivelurile', () => {
    // Asta e chiar definiția lui: „ta-ta", nu „ta-ta-ta".
    const shuffles = grooves.filter((exercise) => exercise.style === 'shuffle')
    expect(shuffles.length).toBeGreaterThan(1)
    for (const shuffle of shuffles) {
      const middles = onsetsOf(shuffle).filter((onset) => onset.step % 3 === 1)
      expect(middles, shuffle.id).toHaveLength(0)
    }
  })

  it('pune hi-hat-ul de off-beat între timpi, niciodată odată cu toba mare', () => {
    // Asta e tot nivelul: mâna și piciorul alternează. Un rând mutat cu un pas
    // le-ar pune deodată și ar face din off-beat un rock cu hi-hat pe pătrimi.
    const offbeat = grooveById('offbeat-hat')!
    const onsets = onsetsOf(offbeat)
    const hats = onsets.filter((onset) => onset.piece === 'hhClosed').map((onset) => onset.step)
    const kicks = onsets.filter((onset) => onset.piece === 'kick').map((onset) => onset.step)
    expect(hats).toEqual([1, 3, 5, 7])
    expect(kicks).toEqual([0, 2, 4, 6])
  })

  it('deschide hi-hat-ul de disco pe fiecare „și” și îl închide pe timp', () => {
    for (const id of ['disco-open-hat', 'disco-sixteenths', 'disco-syncopated']) {
      const exercise = grooveById(id)!
      const perBeat = exercise.stepsPerBar / exercise.beatsPerBar
      const open = onsetsOf(exercise)
        .filter((onset) => onset.piece === 'hhOpen')
        .map((onset) => onset.step / perBeat)
      expect(open, id).toEqual([0.5, 1.5, 2.5, 3.5])
      const closedOnBeats = onsetsOf(exercise).filter(
        (onset) => onset.piece === 'hhClosed' && onset.step % perBeat === 0,
      )
      expect(closedOnBeats, id).toHaveLength(4)
    }
  })

  it('ține stilurile la un loc în listă, fiecare cu mai multe niveluri', () => {
    // Lista se desenează pe grupuri: un stil rupt în două ar apărea de două ori.
    const seen: string[] = []
    for (const exercise of grooves) {
      if (seen.at(-1) !== exercise.style) {
        expect(seen, exercise.style).not.toContain(exercise.style)
        seen.push(exercise.style!)
      }
    }
    for (const style of ['rock', 'disco', 'metal', 'funk', 'shuffle', 'jazz']) {
      expect(grooves.filter((exercise) => exercise.style === style).length, style).toBeGreaterThan(1)
    }
  })
})

describe('groove-urile, randate', () => {
  it('folosesc numai mostre care există în kit', () => {
    for (const exercise of grooves) {
      const plan = planDrumSession(exercise, {
        segments: [{ bpm: exercise.tempo.suggested, repeats: 1 }],
      })
      for (const hit of plan.hits) {
        expect(allSampleKeys, exercise.id).toContain(`${hit.piece}-${hit.hit}`)
      }
      expect(() => renderDrumTrack(plan, { samples: kit }), exercise.id).not.toThrow()
    }
  })

  it('o sesiune de 60 s încape în plafon la orice groove', () => {
    for (const exercise of grooves) {
      const segments = segmentsForDuration(exercise, exercise.tempo.suggested, 60_000)
      const plan = planDrumSession(exercise, { segments })
      expect(plan.cappedFromMs, exercise.id).toBeUndefined()
      expect(plan.totalMs, exercise.id).toBeLessThanOrEqual(60_001)
    }
  })

  it('ghost note-ul se aude, dar sub backbeat, măsurat pe semnal', () => {
    const exercise = grooveById('funk-ghost')!
    const plan = planDrumSession(exercise, {
      segments: [{ bpm: 80, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    // Doar toba mică: altfel hi-hat-ul și toba mare intră în fereastră și
    // raportul măsurat n-ar mai fi cel dintre ghost note și accent.
    const onlySnare = { ...plan, hits: plan.hits.filter((hit) => hit.piece === 'snare') }
    const { samples } = renderDrumTrack(onlySnare, { samples: kit })
    const ghost = plan.hits.find((hit) => hit.piece === 'snare' && hit.hit === 'ghost')!
    const accent = plan.hits.find((hit) => hit.piece === 'snare' && hit.hit === 'accent')!
    const ghostLevel = rms(samples, ghost.atMs, ghost.atMs + 40)
    const accentLevel = rms(samples, accent.atMs, accent.atMs + 40)
    expect(ghostLevel).toBeGreaterThan(0)
    expect(accentLevel).toBeGreaterThan(ghostLevel * 2)
  })

  it('ostinato-ul de ride nu urcă peste cel de hi-hat, deși coada lui e de 5 ori mai lungă', () => {
    /*
      Regresia care a produs testul: ride-ul suna „mult prea tare" la metal și
      jazz, iar cauza nu era mostra, e la fel de tare ca hi-hat-ul, ci coada.
      Hi-hat-ul închis ține 0,35 s, ride-ul 1,6 s: cântat ca ostinato la optimi,
      ride-ul se suprapune cu el însuși de cinci ori, hi-hat-ul niciodată.

      Măsurat pe RMS-ul întregii piste, nu pe o lovitură: suprapunerea e exact
      ce nu se vede într-o fereastră de 40 ms în jurul unui atac.
    */
    const ostinato = (id: string, piece: KitPiece) => {
      const exercise = grooveById(id)!
      const plan = planDrumSession(exercise, {
        segments: segmentsForDuration(exercise, exercise.tempo.suggested, 20_000, 0),
        countInBars: 0,
        clicks: false,
      })
      const only = { ...plan, hits: plan.hits.filter((hit) => hit.piece === piece) }
      const { samples } = renderDrumTrack(only, { samples: kit, clicks: false })
      return rms(samples, 0, (samples.length / SAMPLE_RATE) * 1000)
    }

    const hats = ostinato('rock-backbeat', 'hhClosed')
    for (const id of ['metal-driving', 'jazz-ride']) {
      const ride = ostinato(id, 'ride')
      // Se aude ca pulsație, e vocea care ține timpul în amândouă.
      expect(ride, id).toBeGreaterThan(hats)
      // Dar nu ajunge la nivelul tobei mici, cum ajunsese la câștig egal.
      expect(ride, id).toBeLessThan(hats * 2)
    }
  })

  it('scrie ride-ul cu dinamică, nu doar cu accente', () => {
    /*
      Jumătate din problema de volum era în date: ambele ostinato-uri erau scrise
      cu „X" pe fiecare pas, deci pe stratul de accent, cel mai tare din kit,
      lucru care la hi-hat nu s-a întâmplat niciodată, fiindcă acolo notația a
      fost de la început „accent pe timp, normal între". Un ostinato întreg de
      accente nu e nici muzical, nici scriere corectă.
    */
    const rideHits = (id: string) =>
      onsetsOf(grooveById(id)!).filter((onset) => onset.piece === 'ride')

    const metal = rideHits('metal-driving')
    expect(metal.length).toBeGreaterThan(0)
    // Metal: toate loviturile egale, asta scrie și instrucțiunea lecției.
    expect(metal.every((onset) => onset.hit === 'normal')).toBe(true)

    const jazz = rideHits('jazz-ride')
    // Jazz: apăsare pe 2 și 4, nota de legătură mai ușoară, trei intensități.
    expect(new Set(jazz.map((onset) => onset.hit))).toEqual(
      new Set(['ghost', 'normal', 'accent']),
    )
  })

  it('modul „doar metronom" tace tobele, dar păstrează click-urile', () => {
    const plan = planDrumSession(grooveById('rock-basic')!, {
      segments: [{ bpm: 90, repeats: 1 }],
      countInBars: 0,
    })
    const full = renderDrumTrack(plan, { samples: kit })
    const bare = renderDrumTrack(plan, { samples: kit, hits: false })
    const beatMs = 60_000 / 90
    // Pe bătaie se aude click-ul în ambele variante.
    expect(rms(bare.samples, 0, 40)).toBeGreaterThan(0.005)
    /*
      Între bătăi, unde groove-ul avea hi-hat, rămâne liniște. Se compară raportul,
      nu o valoare absolută: acolo cade un hi-hat neaccentuat, adică cel mai încet
      sunet din kit, iar un prag fix ales cu ochiul ar fi spus mai mult despre
      pragul ales decât despre ce s-a întâmplat.
    */
    const betweenBare = rms(bare.samples, beatMs / 2, beatMs / 2 + 60)
    const betweenFull = rms(full.samples, beatMs / 2, beatMs / 2 + 60)
    expect(betweenBare).toBeLessThan(0.001)
    expect(betweenFull).toBeGreaterThan(betweenBare * 20)
  })

  it('suprapune piesele care cad pe același pas, nu le înlocuiește', () => {
    // Pe „unu” cad hi-hat și tobă mare deodată. Dacă randarea ar scrie în loc să
    // adune, una dintre ele ar dispărea fără niciun semn.
    const plan = planDrumSession(grooveById('rock-basic')!, {
      segments: [{ bpm: 90, repeats: 1 }],
      countInBars: 0,
      clicks: false,
    })
    const both = renderDrumTrack(plan, { samples: kit })
    const onlyOne = (piece: KitPiece) =>
      renderDrumTrack(
        { ...plan, hits: plan.hits.filter((hit) => hit.piece === piece) },
        { samples: kit },
      )
    const together = rms(both.samples, 0, 50)
    expect(together).toBeGreaterThan(rms(onlyOne('kick').samples, 0, 50))
    expect(together).toBeGreaterThan(rms(onlyOne('hhClosed').samples, 0, 50))
  })
})
