import { describe, expect, it } from 'vitest'
import { theoryVocabulary } from './bars'
import { drumTheorySource } from './index'
import {
  gradeMarkGrid,
  LESSON_QUIZ_LENGTH,
  passed,
  quizPattern,
  REVIEW_QUIZ_RANGE,
  validateQuiz,
  type DrumQuiz,
  type MarkGridQuestion,
} from './quiz'
import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import { curriculumLanguages } from '@/lib/rhythm/curriculum/localized'

const text = (value: string): LocalizedText => ({ ro: value, en: value })

const rock = quizPattern('test-rock', 8, {
  hhClosed: 'xxxxxxxx',
  snare: '..X...X.',
  kick: 'x...x...',
})

const markSnare: MarkGridQuestion<LocalizedText> = {
  id: 'mark',
  kind: 'markGrid',
  prompt: text('Marchează toba mică.'),
  explain: text('Pe 2 și 4.'),
  answer: rock,
  bpm: 80,
  from: 'audio',
  rows: ['hhClosed', 'snare', 'kick'],
  given: ['hhClosed', 'kick'],
}

describe('corectarea grilei', () => {
  it('trece doar când rândul întrebat e exact ce se cântă', () => {
    const right = gradeMarkGrid(markSnare, {
      snare: [false, false, true, false, false, false, true, false],
    })
    expect(right.correct).toBe(true)
    expect(right.cells.snare?.filter((cell) => cell === 'hit')).toHaveLength(2)
    // Rândurile date nu se corectează.
    expect(right.cells.hhClosed).toBeUndefined()
  })

  it('spune ce lipsește și ce e în plus', () => {
    const wrong = gradeMarkGrid(markSnare, {
      snare: [false, false, false, false, true, false, true, false],
    })
    expect(wrong.correct).toBe(false)
    expect(wrong.cells.snare?.[2]).toBe('missed')
    expect(wrong.cells.snare?.[4]).toBe('extra')
    expect(wrong.cells.snare?.[6]).toBe('hit')
  })

  it('ignoră intensitatea: un accent marcat e un accent auzit', () => {
    const grade = gradeMarkGrid(markSnare, {
      snare: [, , true, , , , true] as boolean[],
    })
    expect(grade.correct).toBe(true)
  })
})

describe('pragul de trecere', () => {
  it('cere 80%', () => {
    expect(passed(4, 5)).toBe(true)
    expect(passed(3, 5)).toBe(false)
    expect(passed(12, 15)).toBe(true)
    expect(passed(11, 15)).toBe(false)
    expect(passed(0, 0)).toBe(false)
  })
})

describe('validarea unui quiz', () => {
  const choice = (id: string, answer = 0) => ({
    id,
    kind: 'choice' as const,
    prompt: text('?'),
    explain: text('!'),
    options: [text('a'), text('b')],
    answer,
  })
  const quiz = (questions: DrumQuiz<LocalizedText>['questions']): DrumQuiz<LocalizedText> => ({
    id: 'q',
    stage: 'instrument',
    lessonId: 'setul-si-piesele',
    questions,
  })

  it('acceptă un quiz corect', () => {
    expect(
      validateQuiz(
        quiz([choice('a'), choice('b'), choice('c'), choice('d'), markSnare]),
        theoryVocabulary,
      ),
    ).toEqual([])
  })

  it('prinde lungimea greșită, răspunsul inexistent și lipsa interacțiunii', () => {
    const problems = validateQuiz(quiz([choice('a', 5), choice('b')]), theoryVocabulary)
    expect(problems).toContain('q: are 2 întrebări, nu 5')
    expect(problems).toContain('q: a: răspunsul 5 nu e printre variante')
    expect(problems).toContain('q: nicio întrebare interactivă (grilă sau notație)')
  })

  it('prinde o grilă în care rândul de marcat e gol', () => {
    const empty = {
      ...markSnare,
      rows: ['hhClosed', 'snare', 'kick', 'crash'] as MarkGridQuestion['rows'],
      given: ['hhClosed', 'snare', 'kick'] as MarkGridQuestion['rows'],
    }
    expect(
      validateQuiz(
        quiz([choice('a'), choice('b'), choice('c'), choice('d'), empty]),
        theoryVocabulary,
      ),
    ).toContain('q: mark: rândurile de marcat sunt goale în răspuns')
  })
})

describe('quiz-urile manualului', () => {
  const quizzes = drumTheorySource.quizzes ?? []
  const lessonIds = drumTheorySource.lessons.map((lesson) => lesson.id)

  it('trec validarea, toate', () => {
    expect(quizzes.flatMap((quiz) => validateQuiz(quiz, theoryVocabulary, lessonIds))).toEqual([])
  })

  it(`fiecare lecție are un quiz de ${LESSON_QUIZ_LENGTH} întrebări`, () => {
    const missing = lessonIds.filter((id) => !quizzes.some((quiz) => quiz.lessonId === id))
    expect(missing).toEqual([])
  })

  it(`fiecare etapă are o recapitulare de ${REVIEW_QUIZ_RANGE.min}-${REVIEW_QUIZ_RANGE.max} întrebări`, () => {
    const missing = drumTheorySource.stages
      .map((stage) => stage.id)
      .filter((stage) => !quizzes.some((quiz) => quiz.stage === stage && !quiz.lessonId))
    expect(missing).toEqual([])
  })

  it('quiz-ul unei lecții stă în etapa lecției, iar id-urile sunt unice', () => {
    const ids = quizzes.map((quiz) => quiz.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const quiz of quizzes) {
      if (!quiz.lessonId) continue
      const lesson = drumTheorySource.lessons.find((item) => item.id === quiz.lessonId)
      expect(lesson?.stage, quiz.id).toBe(quiz.stage)
    }
  })

  it('fiecare text există în ambele limbi', () => {
    const missing: string[] = []
    const check = (path: string, value: LocalizedText) => {
      for (const language of curriculumLanguages)
        if (!value[language]?.trim()) missing.push(`${path} [${language}]`)
    }
    for (const quiz of quizzes) {
      for (const question of quiz.questions) {
        const at = `${quiz.id}/${question.id}`
        check(`${at}.prompt`, question.prompt)
        check(`${at}.explain`, question.explain)
        if (question.kind === 'choice')
          question.options.forEach((option, index) => check(`${at}.options[${index}]`, option))
      }
    }
    expect(missing).toEqual([])
  })

  it('răspunsurile corecte nu stau mereu pe aceeași poziție', () => {
    // Altfel quiz-ul se trece apăsând mereu „A”.
    for (const quiz of quizzes) {
      const answers = quiz.questions.flatMap((question) =>
        'answer' in question && typeof question.answer === 'number' ? [question.answer] : [],
      )
      if (answers.length >= 3) expect(new Set(answers).size, quiz.id).toBeGreaterThan(1)
    }
  })
})
