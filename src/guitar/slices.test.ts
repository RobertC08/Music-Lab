import { describe, expect, it } from 'vitest'
import { runInSlices } from './slices'
import { changeLevels, planChanges } from './changes'
import { renderChangesTrack, renderChangesTrackSteps } from './changes-track'
import { encodeGuitarWav, encodeGuitarWavSteps } from './wav'

describe('lucrul pe felii', () => {
  it('dă exact aceeași pistă ca randarea dintr-o bucată', async () => {
    const plan = planChanges(changeLevels[1]!.exercises[0]!, 90)
    const options = { metronome: true, strum: true }
    const job = runInSlices(
      (function* () {
        const samples = yield* renderChangesTrackSteps(plan, options)
        return yield* encodeGuitarWavSteps(samples)
      })(),
    )
    const sliced = await job.promise
    expect(Buffer.compare(Buffer.from(sliced!), Buffer.from(encodeGuitarWav(renderChangesTrack(plan, options))))).toBe(0)
  })

  it('anulată, nu mai termină', async () => {
    let finished = false
    const job = runInSlices(
      (function* () {
        for (let index = 0; index < 1000; index += 1) yield
        finished = true
        return 1
      })(),
      0,
    )
    job.cancel()
    expect(await job.promise).toBeNull()
    expect(finished).toBe(false)
  })

  it('lasă firul liber între felii', async () => {
    let ticks = 0
    const ticker = setInterval(() => (ticks += 1), 0)
    const job = runInSlices(
      (function* () {
        for (let index = 0; index < 40; index += 1) {
          const until = Date.now() + 2
          while (Date.now() < until) {
            // muncă
          }
          yield
        }
        return 'gata'
      })(),
      4,
    )
    expect(await job.promise).toBe('gata')
    clearInterval(ticker)
    expect(ticks).toBeGreaterThan(5)
  })
})
