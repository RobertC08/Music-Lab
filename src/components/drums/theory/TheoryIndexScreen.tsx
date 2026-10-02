import { useEffect } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, ChevronRight, ListChecks } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { loadKit } from '@/lib/drums/kit'
import {
  passed,
  quizForLesson,
  reviewForStage,
  type DrumQuiz,
  type DrumTheory,
  type DrumTheoryLesson,
} from '@/lib/drums/theory'

import { lessonPassed, stageProgress, type QuizScores } from '@/lib/drums/theory/progress'

export type { QuizScores }

/** Verdele hărții: lecție cu quiz trecut, etapă terminată. */
const PASSED = '#1E8E5A'
const PASSED_SOFT = '#EAF6EF'

/*
  Intrarea în manual, deocamdată o listă, nu harta.

  Harta (roadmap-ul cu etape strânse/desfășurate și stările nodurilor) e Etapa C
  din PLAN-TEORIE-TOBE.md și înlocuiește ecranul ăsta. Până atunci lista arată
  ONEST cât conținut există: etapele scrise apar cu lecțiile lor, cele goale apar
  ca ce sunt, o linie cu numele etapei și nimic sub ea. E diferența dintre un
  drum care se vede scurt și unul care se lungește sub picioarele cuiva care
  tocmai l-a terminat.

  Conținutul intră ca parametru, nu se citește din store: așa ecranul e același
  în aplicație (unde limba vine din profilul local) și în sandbox (unde vine din
  i18n), și se mută dintr-o parte în alta cu un `cp`.
*/
export function TheoryIndexScreen({
  theory,
  scores = {},
  onOpenLesson,
  onOpenQuiz,
  onExit,
}: {
  theory: DrumTheory
  scores?: QuizScores
  onOpenLesson: (lesson: DrumTheoryLesson) => void
  onOpenQuiz?: (quiz: DrumQuiz) => void
  onExit: () => void
}) {
  const { t } = useTranslation()

  /*
    Mostrele kitului se încarcă de aici, de pe listă, nu abia din lecție. Cât
    citești lista și alegi, se încarcă în fundal, iar lecția le găsește gata.
    Încărcarea e una singură (`loadKit` o ține minte), deci lecția care o cere
    din nou nu mai face nimic. O eroare aici nu contează: lecția reîncearcă și
    o arată ea.
  */
  useEffect(() => {
    loadKit().catch(() => {})
  }, [])

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: publicColors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={onExit}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: 23,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? '#F1F3F4' : 'transparent',
            })}
          >
            <ArrowLeft size={22} color={publicColors.ink} />
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>
            {t('drums.theoryTitle')}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>
            {t('drums.theoryIntro')}
          </Text>
        </View>

        {theory.stages.map((stage) => {
          const lessons = theory.lessons.filter((lesson) => lesson.stage === stage.id)
          const review = reviewForStage(theory, stage.id)
          const reviewScore = review ? scores[review.id] : undefined
          const progress = stageProgress(theory, scores, stage.id)
          return (
            <View key={stage.id} style={{ gap: 8 }}>
              {/*
                Numele etapei și cât din ea e trecut. Verde abia când toate
                quiz-urile lecțiilor și recapitularea sunt trecute.
              */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: '800',
                    letterSpacing: 1.1,
                    textTransform: 'uppercase',
                    color: progress.complete ? PASSED : stage.accent,
                  }}
                >
                  {stage.title}
                </Text>
                {progress.totalLessons > 0 ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      backgroundColor: progress.complete ? PASSED : '#F1F3F4',
                    }}
                  >
                    {progress.complete ? <Check size={12} color="#FFFFFF" /> : null}
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: progress.complete ? '#FFFFFF' : publicColors.muted,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {progress.complete
                        ? t('drums.theoryStageDone')
                        : t('drums.theoryStageProgress', {
                            done: progress.passedLessons,
                            total: progress.totalLessons,
                          })}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
                {stage.subtitle}
              </Text>
              {lessons.length === 0 ? (
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: publicColors.muted,
                    fontStyle: 'italic',
                  }}
                >
                  {t('drums.theorySoon')}
                </Text>
              ) : (
                lessons.map((lesson, position) => {
                  /*
                    Verde doar cu quiz-ul trecut. Lecția se deschide oricum:
                    verdele e progres, nu poartă.
                  */
                  const done = lessonPassed(theory, scores, lesson.id)
                  return (
                    <Pressable
                      key={lesson.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${lesson.title}. ${lesson.goal}${done ? `. ${t('drums.theoryLessonPassed')}` : ''}`}
                      onPress={() => onOpenLesson(lesson)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: done ? PASSED : stage.border,
                        backgroundColor: pressed
                          ? stage.soft
                          : done
                            ? PASSED_SOFT
                            : publicColors.card,
                        padding: 16,
                      })}
                    >
                      {/* Nodul hărții: numărul lecției, sau bifa când quiz-ul e trecut. */}
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: done ? 0 : 2,
                          borderColor: stage.border,
                          backgroundColor: done ? PASSED : publicColors.card,
                        }}
                      >
                        {done ? (
                          <Check size={16} color="#FFFFFF" />
                        ) : (
                          <Text style={{ fontSize: 13, fontWeight: '900', color: stage.accent }}>
                            {position + 1}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: publicColors.ink }}>
                          {lesson.title}
                        </Text>
                        <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
                          {lesson.goal}
                        </Text>
                        <QuizBadge
                          quiz={quizForLesson(theory, lesson.id)}
                          scores={scores}
                          accent={stage.accent}
                        />
                      </View>
                      <ChevronRight size={20} color={publicColors.muted} />
                    </Pressable>
                  )
                })
              )}
              {/*
                Recapitularea, după ultima lecție a etapei: vine la capătul
                drumului, nu înainte, fiindcă întreabă din toate lecțiile.
              */}
              {review && onOpenQuiz ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onOpenQuiz(review)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderStyle: progress.reviewPassed && reviewScore ? 'solid' : 'dashed',
                    borderColor: progress.reviewPassed && reviewScore ? PASSED : stage.accent,
                    backgroundColor: pressed
                      ? stage.soft
                      : progress.reviewPassed && reviewScore
                        ? PASSED_SOFT
                        : publicColors.card,
                    padding: 16,
                  })}
                >
                  <ListChecks size={22} color={stage.accent} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: publicColors.ink }}>
                      {t('drums.quizReviewCta')}
                    </Text>
                    <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
                      {reviewScore
                        ? t('drums.quizBest', reviewScore)
                        : t('drums.quizReviewHint', { count: review.questions.length })}
                    </Text>
                  </View>
                  {reviewScore && passed(reviewScore.score, reviewScore.total) ? (
                    <Check size={20} color="#1E8E5A" />
                  ) : (
                    <ChevronRight size={20} color={publicColors.muted} />
                  )}
                </Pressable>
              ) : null}
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

/** Starea quiz-ului de sub o lecție: cel mai bun scor, sau nimic până îl faci. */
function QuizBadge({
  quiz,
  scores,
  accent,
}: {
  quiz: DrumQuiz | null
  scores: QuizScores
  accent: string
}) {
  const { t } = useTranslation()
  const best = quiz ? scores[quiz.id] : undefined
  if (!best) return null
  const ok = passed(best.score, best.total)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
      {ok ? <Check size={14} color="#1E8E5A" /> : null}
      <Text style={{ fontSize: 12, fontWeight: '800', color: ok ? '#1E8E5A' : accent }}>
        {t('drums.quizBest', best)}
      </Text>
    </View>
  )
}
