import type { DrumExercise } from './exercise'

/*
  Deblocarea, comună tuturor catalogurilor de exerciții.

  Nu există nivel numeric și nu există scor, aplicația nu poate verifica ce ai
  bătut pe padul tău, deci tot ce știe sigur e că ai terminat sau n-ai terminat
  (PLAN-TOBE.md §5). Exact de aceea poarta a și căzut: vezi `LOCK_EXERCISES`.
*/

/**
 * Deblocarea pe rând, OPRITĂ (29 sept.).
 *
 * Toate exercițiile sunt deschise de la început. Motivul e că modulul nu e un
 * joc: n-are scor, n-are eșec și nu verifică nimic, deci nu are nici ce să
 * păzească. Un toboșar care știe deja paradiddle n-are de ce să treacă prin
 * lovituri simple ca să ajungă la el, iar unul care nu știe o află singur în
 * zece secunde, fiindcă exercițiul se aude.
 *
 * `requires` rămâne în date și rămâne valid: e ordinea recomandată, cea pe care
 * o arată lista de sus în jos și pe care testele o verifică. Doar poarta a
 * dispărut, nu drumul. Întors pe `true`, treptele revin fără altă modificare.
 */
export const LOCK_EXERCISES = false

/**
 * Exercițiile deschise, dat fiind ce a fost terminat.
 *
 * Cu poarta oprită, toate. Regula de dinainte e păstrată dedesubt.
 */
export function unlockedIn(
  exercises: readonly DrumExercise[],
  completed: readonly string[],
): DrumExercise[] {
  return LOCK_EXERCISES ? unlockedByProgress(exercises, completed) : [...exercises]
}

/**
 * Regula pe trepte: un exercițiu se deschide când TOT ce cere el a fost dus la
 * capăt măcar o dată.
 *
 * Primul din listă e mereu deschis, fiindcă altfel n-ar exista de unde începe.
 * Un exercițiu terminat rămâne deschis: „ai reușit” nu poate să însemne „gata,
 * nu mai intri”, altfel recordul de tempo n-ar mai putea fi bătut niciodată.
 */
export function unlockedByProgress(
  exercises: readonly DrumExercise[],
  completed: readonly string[],
): DrumExercise[] {
  const done = new Set(completed)
  return exercises.filter(
    (exercise) => !exercise.requires?.length || exercise.requires.every((id) => done.has(id)),
  )
}

/** Ce mai trebuie terminat ca să se deschidă exercițiul. Gol = e deschis. */
export function missingFor(exercise: DrumExercise, completed: readonly string[]): string[] {
  const done = new Set(completed)
  return (exercise.requires ?? []).filter((id) => !done.has(id))
}
