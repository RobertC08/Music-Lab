/*
  Shim de sandbox — vezi `adaptive-levels.ts` de lângă. Din stratul de prezentare
  al jocurilor (`mobile/lib/guest/game-session.ts`) păstrăm doar citirea unui
  nivel ca „etapă · pas", de care depind generatoarele de pattern-uri.
*/

import {
  LEVELS_PER_DIFFICULTY,
  MAX_GAME_LEVEL,
  difficultyForLevel,
  levelWithinDifficulty,
} from './adaptive-levels'

export interface LevelPosition {
  /** Etapa 1…5: o treaptă de dificultate. */
  stage: number
  stageCount: number
  /** Pasul 1…20 din etapă: câte o variație nouă la fiecare rundă reușită. */
  step: number
  stepsPerStage: number
}

export const STAGE_COUNT = Math.ceil(MAX_GAME_LEVEL / LEVELS_PER_DIFFICULTY)

export function levelPosition(level: number): LevelPosition {
  return {
    stage: difficultyForLevel(level),
    stageCount: STAGE_COUNT,
    step: levelWithinDifficulty(level),
    stepsPerStage: LEVELS_PER_DIFFICULTY,
  }
}
