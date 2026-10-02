import {
  curriculumLanguage,
  curriculumLanguages,
  type CurriculumLanguage,
  type LocalizedText,
} from '@/lib/rhythm/curriculum/localized'
import { advancedLessons } from './lessons/advanced'
import { formLessons } from './lessons/form'
import { grooveLessons } from './lessons/groove'
import { handsLessons } from './lessons/hands'
import { instrumentLessons } from './lessons/instrument'
import { musicianLessons } from './lessons/musician'
import { notationLessons } from './lessons/notation'
import { stylesLessons } from './lessons/styles'
import { drumQuizzes } from './quizzes'
import { resolveDrumTheory } from './resolve'
import { drumStages } from './stages'
import type { DrumQuiz } from './quiz'
import type { DrumStageId, DrumTheory, DrumTheoryLesson } from './types'

/*
  Punctul de intrare al manualului de tobe, pentru ecrane.

  Aceeași formă ca la ritm (`lib/rhythm/curriculum/index.ts`): conținutul e scris
  o dată, în ro + en, și se rezolvă o singură dată pe limbă. Pentru aceeași limbă
  se întoarce mereu același obiect, deci rezultatul poate intra direct în
  dependințele unui `useMemo`.
*/

/** Sursa, în ordinea etapelor. O etapă nouă își adaugă fișierul aici. */
const source: DrumTheory<LocalizedText> = {
  stages: drumStages,
  lessons: [
    ...instrumentLessons,
    ...notationLessons,
    ...handsLessons,
    ...grooveLessons,
    ...formLessons,
    ...stylesLessons,
    ...advancedLessons,
    ...musicianLessons,
  ],
  quizzes: drumQuizzes,
}

const byLanguage = Object.fromEntries(
  curriculumLanguages.map((language) => [language, resolveDrumTheory(source, language)]),
) as Record<CurriculumLanguage, DrumTheory>

/**
 * Manualul de tobe în limba interfeței. `language` e codul din profilul local
 * (`useGuestStore((state) => state.profile.locale)`): 'ro' dă româna, orice
 * altceva dă engleza.
 */
export function getDrumTheory(language: string): DrumTheory {
  return byLanguage[curriculumLanguage(language)]
}

/** O lecție după id, sau `null`. Ruta primește id-ul din adresă, deci poate greși. */
export function getDrumTheoryLesson(language: string, id: string): DrumTheoryLesson | null {
  return getDrumTheory(language).lessons.find((lesson) => lesson.id === id) ?? null
}

/** Quiz-ul de după o lecție, sau `null` dacă lecția n-are încă unul. */
export function quizForLesson(theory: DrumTheory, lessonId: string): DrumQuiz | null {
  return theory.quizzes?.find((quiz) => quiz.lessonId === lessonId) ?? null
}

/** Quiz-ul recapitulativ al unei etape, sau `null`. */
export function reviewForStage(theory: DrumTheory, stage: DrumStageId): DrumQuiz | null {
  return theory.quizzes?.find((quiz) => quiz.stage === stage && !quiz.lessonId) ?? null
}

/** Sursa netradusă, pentru teste, care verifică ambele limbi deodată. */
export const drumTheorySource = source

export { drumStageIds, validateDrumTheory } from './types'
export { theoryVocabulary, thinClicks } from './bars'
export { lessonPassed, stageProgress } from './progress'
export type { QuizScores, StageProgress } from './progress'
export {
  gradeMarkGrid,
  answerRow,
  checkedRows,
  passed,
  validateQuiz,
  LESSON_QUIZ_LENGTH,
  REVIEW_QUIZ_RANGE,
} from './quiz'
export type {
  DrumQuiz,
  QuizQuestion,
  QuizMedia,
  ChoiceQuestion,
  PickPatternQuestion,
  MarkGridQuestion,
  GridMarks,
  GridGrade,
  CellResult,
} from './quiz'
export type {
  ChartBar,
  DrumExample,
  DrumStage,
  DrumStageId,
  DrumTerm,
  DrumTheory,
  DrumTheoryLesson,
  DrumTheorySection,
  DrumVisual,
} from './types'
