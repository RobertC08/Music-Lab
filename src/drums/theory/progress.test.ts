import { describe, expect, it } from 'vitest'
import { getDrumTheory } from './index'
import { lessonPassed, stageProgress, type QuizScores } from './progress'

const theory = getDrumTheory('ro')
const lessons = theory.lessons.filter((lesson) => lesson.stage === 'notation')
const quizOf = (lessonId: string) => theory.quizzes!.find((quiz) => quiz.lessonId === lessonId)!
const review = theory.quizzes!.find((quiz) => quiz.stage === 'notation' && !quiz.lessonId)!

describe('progresul pe hartă', () => {
  it('o lecție e verde doar cu quiz-ul trecut, nu doar făcut', () => {
    const lesson = lessons[0]!.id
    expect(lessonPassed(theory, {}, lesson)).toBe(false)
    expect(lessonPassed(theory, { [quizOf(lesson).id]: { score: 3, total: 5 } }, lesson)).toBe(
      false,
    )
    expect(lessonPassed(theory, { [quizOf(lesson).id]: { score: 4, total: 5 } }, lesson)).toBe(true)
  })

  it('etapa e terminată doar cu toate lecțiile și recapitularea trecute', () => {
    const allLessons: QuizScores = Object.fromEntries(
      lessons.map((lesson) => [quizOf(lesson.id).id, { score: 5, total: 5 }]),
    )
    const partial = stageProgress(theory, allLessons, 'notation')
    expect(partial).toMatchObject({
      passedLessons: lessons.length,
      reviewPassed: false,
      complete: false,
    })
    const full = stageProgress(
      theory,
      {
        ...allLessons,
        [review.id]: { score: review.questions.length, total: review.questions.length },
      },
      'notation',
    )
    expect(full.complete).toBe(true)
  })
})
