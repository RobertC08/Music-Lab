/*
  Shim de sandbox. În aplicație (`mobile/lib/guest/adaptive-levels.ts`) fișierul
  ăsta e motorul de progresie adaptivă: nivel 1…100 per joc, promovare la 80,
  coborâre la 50, salt rapid la 90. Aici păstrăm doar ce cer generatoarele de
  pattern-uri — constantele de nivel și seed-ul determinist — copiate verbatim,
  ca fișierele portate din main să nu fie atinse.

  Ce NU e aici, fiindcă sandbox-ul nu are rezultate salvate: `getAdaptiveLevel`.
  Nivelul îl alegem cu mâna, din UI.
*/

export const MAX_GAME_LEVEL = 100
export const LEVELS_PER_DIFFICULTY = 20

/** Motoarele de joc. Doar cele de ritm: shim-ul nu cunoaște restul aplicației. */
export type GameEngine =
  | 'rhythm_echo'
  | 'groove_echo'
  | 'rudiments'
  | 'groove_read'
  | 'drum_fill'
  | 'polyrhythm'

const clampLevel = (level: number) =>
  Math.max(1, Math.min(MAX_GAME_LEVEL, Math.round(Number.isFinite(level) ? level : 1)))

export function difficultyForLevel(level: number) {
  return Math.min(5, 1 + Math.floor((clampLevel(level) - 1) / LEVELS_PER_DIFFICULTY))
}

export function levelWithinDifficulty(level: number) {
  return ((clampLevel(level) - 1) % LEVELS_PER_DIFFICULTY) + 1
}

export function seedForLevel(engine: GameEngine, level: number, attempt = 0) {
  const input = `${engine}:${clampLevel(level)}:${Math.max(0, Math.round(attempt))}`
  let hash = 2_166_136_261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}
