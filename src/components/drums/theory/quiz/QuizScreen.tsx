import { useEffect, useMemo, useState } from 'react'
import { Animated, Easing, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, ListChecks, Play, RotateCcw, Square, X } from 'lucide-react-native'
import { GrooveGrid } from '@/components/drums/groove-grid'
import { PrimaryButton, publicColors } from '@/components/public-practice/ui'
import type { BassLine } from '@/lib/drums/bass'
import type { DrumExercise, KitPiece } from '@/lib/drums/exercise'
import { kitIfLoaded, loadKit } from '@/lib/drums/kit'
import {
  gradeMarkGrid,
  passed,
  type DrumQuiz,
  type DrumStage,
  type GridGrade,
  type GridMarks,
  type MarkGridQuestion,
  type QuizQuestion,
} from '@/lib/drums/theory'
import { haptic } from '@/lib/haptics/game-haptics'
import { DrumStaff } from '../DrumStaff'
import { MarkGrid } from './MarkGrid'
import { useLoopPlayer } from './use-loop-player'

/*
  Quiz-ul manualului, în trei faze.

  1. Răspunzi. Nimic nu-ți spune dacă e bine: alegi, treci mai departe, te poți
     întoarce să schimbi. Un verdict după fiecare întrebare transformă quiz-ul
     în ghicit cu corectură, iar a doua jumătate se răspunde după cum a mers
     prima, nu după ce știi.
  2. Rezultatul, la final, animat: scorul urcă, apoi câte un punct pe
     întrebare, verde sau roșu.
  3. Recapitularea: deschizi oricare întrebare, sau doar pe cele greșite, cu
     răspunsul tău, cel corect și explicația. Explicația se arată și la cele
     corecte: un răspuns ghicit corect e tot un lucru neînțeles.

  Ce se punctează e doar ce poate fi verificat pe ecran: ce ai ales și ce ai
  marcat pe grilă. Execuția pe instrument rămâne a practicii, unde nu se
  punctează nimic (skill-ul `predare-tobe`, prima regulă).
*/

const RIGHT = '#1E8E5A'
const WRONG = '#C8442E'

/** Driverul nativ nu există pe web; acolo animațiile merg pe JS. */
const NATIVE = Platform.OS !== 'web'

/** Ce a răspuns elevul: varianta aleasă, grila marcată, sau nimic încă. */
type Answer = number | GridMarks | null

function isCorrect(question: QuizQuestion, answer: Answer): boolean {
  if (question.kind === 'markGrid') {
    return gradeMarkGrid(question, (answer as GridMarks | null) ?? {}).correct
  }
  return answer === question.answer
}

type Phase =
  { kind: 'quiz' } | { kind: 'result' } | { kind: 'review'; at: number; onlyWrong: boolean }

export function DrumQuizScreen({
  quiz,
  title,
  stage,
  onExit,
  onFinish,
}: {
  quiz: DrumQuiz
  title: string
  stage: DrumStage
  onExit: () => void
  /** Scorul, la fiecare terminare. Cine îl ține minte decide ce face cu el. */
  onFinish: (score: number, total: number) => void
}) {
  const { t } = useTranslation()
  const total = quiz.questions.length
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>(() => quiz.questions.map(() => null))
  const [phase, setPhase] = useState<Phase>({ kind: 'quiz' })
  // Mostrele, ca la lecție: întrebările care se ascultă au nevoie de ele.
  const [kitReady, setKitReady] = useState(() => kitIfLoaded() !== null)
  const [kitError, setKitError] = useState(false)
  useEffect(() => {
    let alive = true
    loadKit()
      .then(() => alive && setKitReady(true))
      .catch(() => alive && setKitError(true))
    return () => {
      alive = false
    }
  }, [])

  const results = useMemo(
    () =>
      quiz.questions.map((question, position) => isCorrect(question, answers[position] ?? null)),
    [quiz, answers],
  )
  const score = results.filter(Boolean).length
  const wrongIndexes = results.flatMap((ok, position) => (ok ? [] : [position]))

  const question = quiz.questions[index]!
  const answer = answers[index] ?? null
  const isLast = index + 1 >= total
  const canGoOn = question.kind === 'markGrid' || answer !== null

  const setAnswer = (value: Answer) =>
    setAnswers((current) => current.map((item, position) => (position === index ? value : item)))

  const finish = () => {
    setPhase({ kind: 'result' })
    onFinish(score, total)
  }

  const restart = () => {
    setAnswers(quiz.questions.map(() => null))
    setIndex(0)
    setPhase({ kind: 'quiz' })
  }

  /** Ce întrebări se parcurg în recapitulare: toate, sau doar cele greșite. */
  const reviewList =
    phase.kind === 'review' && phase.onlyWrong ? wrongIndexes : quiz.questions.map((_, i) => i)
  const reviewPosition = phase.kind === 'review' ? reviewList.indexOf(phase.at) : -1

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: publicColors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        key={
          phase.kind === 'quiz' ? `q${index}` : phase.kind === 'review' ? `r${phase.at}` : 'result'
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
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
          <View style={{ flex: 1 }} />
          {phase.kind === 'result' ? null : (
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: publicColors.muted,
                fontVariant: ['tabular-nums'],
              }}
            >
              {(phase.kind === 'review' ? phase.at : index) + 1}/{total}
            </Text>
          )}
        </View>

        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.1,
              textTransform: 'uppercase',
              color: stage.accent,
            }}
          >
            {stage.title}
          </Text>
          <Text
            accessibilityRole="header"
            style={{ fontSize: 24, lineHeight: 30, fontWeight: '800', color: publicColors.ink }}
          >
            {title}
          </Text>
        </View>

        {!kitReady ? (
          <Text style={{ fontSize: 13, color: publicColors.muted }}>
            {kitError ? t('common.errorGeneric') : t('common.loading')}
          </Text>
        ) : phase.kind === 'result' ? (
          <Result
            results={results}
            accent={stage.accent}
            onOpen={(at) => setPhase({ kind: 'review', at, onlyWrong: false })}
            onReviewWrong={() =>
              setPhase({ kind: 'review', at: wrongIndexes[0] ?? 0, onlyWrong: true })
            }
            onReviewAll={() => setPhase({ kind: 'review', at: 0, onlyWrong: false })}
            onRetry={() => {
              haptic('light')
              restart()
            }}
            onExit={onExit}
          />
        ) : phase.kind === 'review' ? (
          <>
            <ProgressDots
              results={results}
              current={phase.at}
              accent={stage.accent}
              reveal
              onPress={(at) => setPhase({ kind: 'review', at, onlyWrong: phase.onlyWrong })}
            />
            <QuestionCard
              key={`review-${phase.at}`}
              question={quiz.questions[phase.at]!}
              stage={stage}
              answer={answers[phase.at] ?? null}
              review
            />
            <NavRow
              backLabel={t('common.back')}
              onBack={
                reviewPosition > 0
                  ? () => setPhase({ ...phase, at: reviewList[reviewPosition - 1]! })
                  : undefined
              }
              nextLabel={
                reviewPosition + 1 < reviewList.length
                  ? t('drums.quizNext')
                  : t('drums.quizBackToResult')
              }
              onNext={() =>
                reviewPosition + 1 < reviewList.length
                  ? setPhase({ ...phase, at: reviewList[reviewPosition + 1]! })
                  : setPhase({ kind: 'result' })
              }
            />
          </>
        ) : (
          <>
            <ProgressDots results={null} current={index} answers={answers} accent={stage.accent} />
            <QuestionCard
              key={`${quiz.id}-${index}`}
              question={question}
              stage={stage}
              answer={answer}
              onChange={setAnswer}
            />
            <NavRow
              backLabel={t('common.back')}
              onBack={index > 0 ? () => setIndex(index - 1) : undefined}
              nextLabel={isLast ? t('drums.quizFinish') : t('drums.quizNext')}
              nextDisabled={!canGoOn}
              onNext={() => {
                haptic('light')
                if (isLast) finish()
                else setIndex(index + 1)
              }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/**
 * Bara de sus, câte un segment pe întrebare.
 *
 * În timpul quiz-ului spune doar CE AI RĂSPUNS (plin) și unde ești (mai înalt),
 * nu dacă e bine: verdictul e al finalului. În recapitulare devine verde și
 * roșu, și fiecare segment se poate atinge.
 */
function ProgressDots({
  results,
  answers,
  current,
  accent,
  reveal = false,
  onPress,
}: {
  results: boolean[] | null
  answers?: Answer[]
  current: number
  accent: string
  reveal?: boolean
  onPress?: (at: number) => void
}) {
  const count = results?.length ?? answers?.length ?? 0
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: count }, (_, position) => {
        const answered = answers ? answers[position] !== null : true
        const color =
          reveal && results
            ? results[position]
              ? RIGHT
              : WRONG
            : answered || position === current
              ? accent
              : publicColors.border
        return (
          <Pressable
            key={position}
            disabled={!onPress}
            onPress={() => onPress?.(position)}
            hitSlop={8}
            style={{
              flex: 1,
              height: position === current ? 8 : 4,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
        )
      })}
    </View>
  )
}

function NavRow({
  backLabel,
  onBack,
  nextLabel,
  nextDisabled = false,
  onNext,
}: {
  backLabel: string
  onBack?: () => void
  nextLabel: string
  nextDisabled?: boolean
  onNext: () => void
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={() => {
            haptic('light')
            onBack()
          }}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 56,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: publicColors.border,
            backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
          })}
        >
          <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>
            {backLabel}
          </Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 2 }}>
        <PrimaryButton label={nextLabel} disabled={nextDisabled} onPress={onNext} />
      </View>
    </View>
  )
}

/**
 * Rezultatul, animat.
 *
 * Întâi cardul apare, apoi scorul urcă de la zero, apoi câte un punct pe
 * întrebare, verde sau roșu, unul după altul: vezi nu doar cât, ci și unde. La
 * trecere, o mică explozie de puncte colorate pornește din scor. Punctele se
 * ating: deschid întrebarea respectivă.
 */
function Result({
  results,
  accent,
  onOpen,
  onReviewWrong,
  onReviewAll,
  onRetry,
  onExit,
}: {
  results: boolean[]
  accent: string
  onOpen: (at: number) => void
  onReviewWrong: () => void
  onReviewAll: () => void
  onRetry: () => void
  onExit: () => void
}) {
  const { t } = useTranslation()
  const total = results.length
  const score = results.filter(Boolean).length
  const ok = passed(score, total)
  const perfect = score === total
  const need = Math.ceil(total * 0.8)

  const [appear] = useState(() => new Animated.Value(0))
  const [counter] = useState(() => new Animated.Value(0))
  const [dots] = useState(() => results.map(() => new Animated.Value(0)))
  const [burst] = useState(() => new Animated.Value(0))
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const id = counter.addListener(({ value }) => setShown(Math.round(value)))
    Animated.sequence([
      Animated.spring(appear, { toValue: 1, friction: 6, tension: 70, useNativeDriver: NATIVE }),
      Animated.timing(counter, {
        toValue: score,
        duration: 350 + score * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.stagger(
        70,
        dots.map((dot) =>
          Animated.spring(dot, { toValue: 1, friction: 5, tension: 120, useNativeDriver: NATIVE }),
        ),
      ),
    ]).start(() => {
      haptic(ok ? 'success' : 'warning')
      if (ok) {
        Animated.timing(burst, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVE,
        }).start()
      }
    })
    return () => counter.removeListener(id)
  }, [appear, counter, dots, burst, score, ok])

  const tone = ok ? RIGHT : accent

  return (
    <View style={{ gap: 14 }}>
      <Animated.View
        style={{
          borderRadius: 24,
          borderWidth: 2,
          borderColor: tone,
          backgroundColor: publicColors.card,
          paddingVertical: 26,
          paddingHorizontal: 20,
          alignItems: 'center',
          gap: 14,
          opacity: appear,
          transform: [
            { scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
          ],
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {ok ? <Burst progress={burst} /> : null}
          <Text
            style={{
              fontSize: 56,
              fontWeight: '900',
              color: tone,
              fontVariant: ['tabular-nums'],
            }}
          >
            {shown}/{total}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {results.map((right, position) => (
            <Pressable
              key={position}
              accessibilityRole="button"
              accessibilityLabel={`${position + 1}: ${right ? t('drums.quizCorrect') : t('drums.quizWrong')}`}
              onPress={() => onOpen(position)}
              hitSlop={4}
            >
              <Animated.View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: right ? RIGHT : WRONG,
                  opacity: dots[position],
                  transform: [{ scale: dots[position]! }],
                }}
              >
                {right ? <Check size={16} color="#FFFFFF" /> : <X size={16} color="#FFFFFF" />}
              </Animated.View>
            </Pressable>
          ))}
        </View>

        <Text
          style={{ fontSize: 15, lineHeight: 22, textAlign: 'center', color: publicColors.ink }}
        >
          {perfect
            ? t('drums.quizPerfect')
            : ok
              ? t('drums.quizPassed')
              : t('drums.quizFailed', { need, total })}
        </Text>
      </Animated.View>

      {score < total ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptic('light')
            onReviewWrong()
          }}
          style={({ pressed }) => ({
            minHeight: 52,
            flexDirection: 'row',
            gap: 8,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: WRONG,
            backgroundColor: pressed ? '#FDEEEA' : publicColors.card,
          })}
        >
          <X size={16} color={WRONG} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: WRONG }}>
            {t('drums.quizReviewWrong', { count: total - score })}
          </Text>
        </Pressable>
      ) : null}
      <SecondaryButton
        icon={<ListChecks size={16} color={publicColors.ink} />}
        label={t('drums.quizReviewAll')}
        onPress={onReviewAll}
      />
      <PrimaryButton label={t('drums.quizBack')} onPress={onExit} />
      <SecondaryButton
        icon={<RotateCcw size={16} color={publicColors.ink} />}
        label={t('drums.quizRetry')}
        onPress={onRetry}
      />
    </View>
  )
}

/** Explozia de la trecere: puncte colorate care pleacă din scor și se sting. */
const BURST_COLORS = ['#1E8E5A', '#FF7A00', '#7A5AF8', '#0E9F9A', '#C8442E', '#D97706']

function Burst({ progress }: { progress: Animated.Value }) {
  const pieces = 14
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: 0, height: 0 }}>
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2
        const distance = 70 + (i % 3) * 18
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: i % 2 ? 8 : 10,
              height: i % 2 ? 8 : 10,
              borderRadius: 5,
              left: -5,
              top: -5,
              backgroundColor: BURST_COLORS[i % BURST_COLORS.length],
              opacity: progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(angle) * distance],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(angle) * distance * 0.6],
                  }),
                },
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.2] }) },
              ],
            }}
          />
        )
      })}
    </View>
  )
}

function SecondaryButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic('light')
        onPress()
      }}
      style={({ pressed }) => ({
        minHeight: 52,
        flexDirection: 'row',
        gap: 8,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: publicColors.border,
        backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
      })}
    >
      {icon}
      <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>{label}</Text>
    </Pressable>
  )
}

/**
 * O întrebare. Controlată: răspunsul stă în ecranul quiz-ului, ca să rămână
 * când te întorci la ea și ca recapitularea să-l poată arăta.
 *
 * `review`: nimic nu se mai atinge; se arată verdictul, răspunsul corect și
 * explicația.
 */
function QuestionCard({
  question,
  stage,
  answer,
  onChange,
  review = false,
}: {
  question: QuizQuestion
  stage: DrumStage
  answer: Answer
  onChange?: (answer: Answer) => void
  review?: boolean
}) {
  const { t } = useTranslation()
  const selected = typeof answer === 'number' ? answer : null
  const marks: GridMarks = (answer && typeof answer === 'object' ? answer : {}) as GridMarks
  const grade: GridGrade | null =
    review && question.kind === 'markGrid' ? gradeMarkGrid(question, marks) : null
  const correct = review ? isCorrect(question, answer) : false

  const choose = (index: number) => {
    haptic('light')
    onChange?.(index)
  }

  const toggle = (piece: KitPiece, step: number) => {
    haptic('light')
    const row = [...(marks[piece] ?? [])]
    row[step] = !row[step]
    onChange?.({ ...marks, [piece]: row })
  }

  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: stage.soft,
        borderWidth: review ? 2 : 1,
        borderColor: review ? (correct ? RIGHT : WRONG) : stage.border,
        padding: 18,
        gap: 14,
      }}
    >
      <Text style={{ fontSize: 17, lineHeight: 24, fontWeight: '800', color: publicColors.ink }}>
        {question.prompt}
      </Text>

      {question.media ? (
        <View style={{ gap: 10 }}>
          {question.media.play ? (
            <ListenButton
              exercise={question.media.exercise}
              bpm={question.media.bpm}
              bass={question.media.bass}
              accent={stage.accent}
            />
          ) : null}
          {question.media.show === 'grid' ? (
            <GrooveGrid exercise={question.media.exercise} showHint={false} />
          ) : question.media.show === 'staff' ? (
            <DrumStaff exercise={question.media.exercise} accent={stage.accent} />
          ) : null}
        </View>
      ) : null}

      {question.kind === 'choice' ? (
        <View style={{ gap: 8 }}>
          {question.options.map((option, index) => (
            <OptionCard
              key={index}
              index={index}
              selected={selected === index}
              checked={review}
              isAnswer={question.answer === index}
              accent={stage.accent}
              onPress={() => choose(index)}
            >
              <Text style={{ flex: 1, fontSize: 15, lineHeight: 21, color: publicColors.ink }}>
                {option}
              </Text>
            </OptionCard>
          ))}
        </View>
      ) : null}

      {question.kind === 'pickPattern' ? (
        <View style={{ gap: 8 }}>
          {question.options.map((option, index) => (
            <OptionCard
              key={index}
              index={index}
              selected={selected === index}
              checked={review}
              isAnswer={question.answer === index}
              accent={stage.accent}
              onPress={() => choose(index)}
            >
              <View style={{ flex: 1 }}>
                {question.optionsAs === 'grid' ? (
                  <GrooveGrid exercise={option} showHint={false} />
                ) : (
                  <DrumStaff exercise={option} />
                )}
              </View>
            </OptionCard>
          ))}
        </View>
      ) : null}

      {question.kind === 'markGrid' ? (
        <MarkGridBlock
          question={question}
          marks={marks}
          grade={grade}
          checked={review}
          accent={stage.accent}
          onToggle={toggle}
        />
      ) : null}

      {review ? (
        <View
          style={{
            borderRadius: 14,
            borderWidth: 2,
            borderColor: correct ? RIGHT : WRONG,
            backgroundColor: publicColors.card,
            padding: 14,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {correct ? <Check size={18} color={RIGHT} /> : <X size={18} color={WRONG} />}
            <Text style={{ fontSize: 15, fontWeight: '900', color: correct ? RIGHT : WRONG }}>
              {correct
                ? t('drums.quizCorrect')
                : answer === null
                  ? t('drums.quizNoAnswer')
                  : t('drums.quizWrong')}
            </Text>
          </View>
          <Text style={{ fontSize: 14, lineHeight: 20, color: publicColors.ink }}>
            {question.explain}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

/**
 * Grila de completat, cu ce trebuie ca să afli răspunsul: butonul de ascultare
 * (și pasul care se aude, aprins pe grilă) sau portativul de citit.
 */
function MarkGridBlock({
  question,
  marks,
  grade,
  checked,
  accent,
  onToggle,
}: {
  question: MarkGridQuestion
  marks: GridMarks
  grade: GridGrade | null
  checked: boolean
  accent: string
  onToggle: (piece: KitPiece, step: number) => void
}) {
  const { t } = useTranslation()
  /*
    La întrebările din sunet, metronomul e pornit: fără el, „pe ce pas a căzut?"
    devine „unde e unu?", adică altă întrebare. La cele din portativ, ascultarea
    apare abia după verificare, altfel ar fi un al doilea răspuns.
  */
  const fromAudio = question.from === 'audio'
  const player = useLoopPlayer(question.answer, question.bpm, fromAudio, question.bass)
  return (
    <View style={{ gap: 10 }}>
      {question.from === 'staff' ? <DrumStaff exercise={question.answer} accent={accent} /> : null}
      {fromAudio || checked ? (
        <ListenToggle playing={player.playing} accent={accent} onPress={player.toggle} />
      ) : null}
      {checked ? null : (
        <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted }}>
          {t('drums.quizMarkHint')}
        </Text>
      )}
      <MarkGrid
        question={question}
        marks={marks}
        onToggle={onToggle}
        grade={grade}
        cursor={player.cursor}
      />
      {checked && grade && !grade.correct ? (
        <Text style={{ fontSize: 11, lineHeight: 15, color: publicColors.muted }}>
          {t('drums.quizGridLegend')}
        </Text>
      ) : null}
    </View>
  )
}

function ListenButton({
  exercise,
  bpm,
  bass,
  accent,
}: {
  exercise: DrumExercise
  bpm: number
  bass?: BassLine
  accent: string
}) {
  const player = useLoopPlayer(exercise, bpm, false, bass)
  return <ListenToggle playing={player.playing} accent={accent} onPress={player.toggle} />
}

function ListenToggle({
  playing,
  accent,
  onPress,
}: {
  playing: boolean
  accent: string
  onPress: () => void
}) {
  const { t } = useTranslation()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic('light')
        onPress()
      }}
      style={({ pressed }) => ({
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: accent,
        backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
      })}
    >
      {playing ? <Square size={16} color={accent} /> : <Play size={16} color={accent} />}
      <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>
        {playing ? t('drums.theoryStopExample') : t('drums.theoryPlayExample')}
      </Text>
    </Pressable>
  )
}

function OptionCard({
  index,
  selected,
  checked,
  isAnswer,
  accent,
  onPress,
  children,
}: {
  index: number
  selected: boolean
  checked: boolean
  isAnswer: boolean
  accent: string
  onPress: () => void
  children: React.ReactNode
}) {
  /*
    După verificare: răspunsul corect se colorează verde oricum, iar alegerea
    greșită roșu. Așa vezi și unde ai greșit, și care era varianta bună.
  */
  const border = checked
    ? isAnswer
      ? RIGHT
      : selected
        ? WRONG
        : publicColors.border
    : selected
      ? accent
      : publicColors.border
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: checked }}
      disabled={checked}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: border,
        backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
        padding: 12,
      })}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected || (checked && isAnswer) ? border : '#F1F3F4',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '900',
            color: selected || (checked && isAnswer) ? '#FFFFFF' : publicColors.muted,
          }}
        >
          {String.fromCharCode(65 + index)}
        </Text>
      </View>
      {children}
    </Pressable>
  )
}
