import { passed, type DrumQuiz } from './quiz'
import type { DrumStageId, DrumTheory } from './types'

/*
  Progresul pe hartă, din scorurile la quiz-uri.

  Regula: o lecție e „trecută” (verde pe hartă) doar după ce i-ai trecut quiz-ul
  (80%). Citirea lecției nu contează: o poți deschide oricând și de câte ori
  vrei, verdele spune doar că ai dovedit că ai înțeles-o. O etapă e terminată
  când toate lecțiile ei sunt trecute ȘI recapitularea etapei e trecută.

  Nimic de aici nu blochează nimic. E doar ce se colorează.

  Pur: intră manualul și scorurile, ies booleene. Același lucru îl va folosi
  harta din aplicație.
*/

/** Cel mai bun scor la fiecare quiz, după id-ul quiz-ului. */
export type QuizScores = Record<string, { score: number; total: number }>

const quizPassed = (quiz: DrumQuiz | undefined, scores: QuizScores) => {
  const best = quiz ? scores[quiz.id] : undefined
  return best ? passed(best.score, best.total) : false
}

/** Lecția e trecută: are quiz și quiz-ul e trecut. */
export function lessonPassed(theory: DrumTheory, scores: QuizScores, lessonId: string): boolean {
  return quizPassed(
    theory.quizzes?.find((quiz) => quiz.lessonId === lessonId),
    scores,
  )
}

export interface StageProgress {
  passedLessons: number
  totalLessons: number
  reviewPassed: boolean
  /** Toate lecțiile trecute și recapitularea trecută. */
  complete: boolean
}

export function stageProgress(
  theory: DrumTheory,
  scores: QuizScores,
  stage: DrumStageId,
): StageProgress {
  const lessons = theory.lessons.filter((lesson) => lesson.stage === stage)
  const passedLessons = lessons.filter((lesson) => lessonPassed(theory, scores, lesson.id)).length
  const review = theory.quizzes?.find((quiz) => quiz.stage === stage && !quiz.lessonId)
  const reviewPassed = review ? quizPassed(review, scores) : true
  return {
    passedLessons,
    totalLessons: lessons.length,
    reviewPassed,
    complete: lessons.length > 0 && passedLessons === lessons.length && reviewPassed,
  }
}
