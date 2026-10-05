/*
  Munca lungă, pe felii: câțiva milisecunde de lucru, apoi o pauză în care
  aplicația răspunde la atingeri, apoi iar lucru.

  JS-ul aplicației are un singur fir. O randare de un minut de audio, rulată
  dintr-o bucată, îl ține ocupat; pe telefon (Hermes, fără JIT) cât să nu mai
  răspundă butoanele de tempo. Pe felii, aceeași muncă durează puțin mai mult,
  dar nimic nu mai îngheață. Munca vine ca generator (`function*`): fiecare
  `yield` e un loc unde se poate face pauză.
*/

/** Cât lucrează o felie înainte să lase firul liber. */
const BUDGET_MS = 6

export interface SlicedJob<T> {
  /** `null` dacă a fost anulată. */
  promise: Promise<T | null>
  cancel: () => void
}

export function runInSlices<T>(steps: Generator<void, T>, budgetMs = BUDGET_MS): SlicedJob<T> {
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let finish: (value: T | null) => void = () => {}
  const promise = new Promise<T | null>((resolve, reject) => {
    finish = resolve
    const slice = () => {
      if (cancelled) {
        resolve(null)
        return
      }
      const until = Date.now() + budgetMs
      try {
        for (;;) {
          const step = steps.next()
          if (step.done) {
            resolve(step.value)
            return
          }
          if (Date.now() >= until) break
        }
      } catch (error) {
        reject(error)
        return
      }
      timer = setTimeout(slice, 0)
    }
    timer = setTimeout(slice, 0)
  })
  return {
    promise,
    // Anularea răspunde imediat, chiar dacă nicio felie n-a apucat să ruleze.
    cancel: () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      finish(null)
    },
  }
}
