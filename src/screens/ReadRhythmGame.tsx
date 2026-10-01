import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { colors, font, judgementColors, rhythmTheme } from '../theme'
import { Badge, Card, PageTitle, Pill, PrimaryButton, StatRow } from '../components/ui'
import { RhythmLine, type TokenHold } from '../components/rhythm-line'
import {
  HoldNotice,
  PhaseBanner,
  RoundResult,
  ScorePills,
  SkipButton,
  TapPad,
} from '../components/rhythm-round-ui'
import { useRhythmRound } from '../game/useRhythmRound'
import { summarizeSession } from '../game/rhythm'
import {
  TICKS_PER_BAR,
  groupByToken,
  judgementsByToken,
  tokensToEvents,
  tokensToPattern,
} from '../game/notation-tokens'
import { PatternPreviewButton } from '../components/pattern-preview'
import { readingDemo, readingLevels } from '../curriculum/reading'

/**
 * Jocul de citire: notatia se vede, dar nu se aude nimic in afara de
 * metronom. Elevul traduce singur simbolurile in bataie - exact invers fata
 * de Rhythm Echo, unde aude si imita.
 */
export function ReadRhythmGame({ onExit }: { onExit: () => void }) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  const level = readingLevels[levelIndex]!
  const exercise = level.exercises[exerciseIndex]!
  const total = level.exercises.length

  const pattern = useMemo(() => tokensToPattern(exercise.tokens), [exercise])
  // Duratele scrise: aici stim cat tine fiecare nota, deci putem cere tinerea.
  const patternDurations = useMemo(
    () => tokensToEvents(exercise.tokens).map((event) => event.durationSteps),
    [exercise],
  )
  const round = useRhythmRound({
    pattern,
    // Masura vine din exercitiu, nu e fixata pe 4/4: nivelurile de final sunt
    // in 2/4, 3/4 si 6/8, iar acolo bara si accentul cad altundeva.
    stepsPerBar: exercise.ticksPerBar,
    beatsPerBar: exercise.beatsPerBar,
    bpm: exercise.bpm,
    // Aici e diferenta: pattern-ul nu se aude inainte.
    playPattern: false,
    patternDurations,
  })

  const [recordedFor, setRecordedFor] = useState<string | null>(null)
  if (round.result && recordedFor !== exercise.id) {
    setRecordedFor(exercise.id)
    setScores((current) => [...current, round.result!.score])
  }

  const session = useMemo(() => summarizeSession(scores), [scores])

  const demoPattern = useMemo(() => tokensToPattern(readingDemo.tokens), [])
  const demoDurations = useMemo(
    () => tokensToEvents(readingDemo.tokens).map((event) => event.durationSteps),
    [],
  )

  // Dupa evaluare, fiecare simbol primeste verdictul loviturilor lui.
  const tokenJudgements = useMemo(
    () =>
      round.result
        ? judgementsByToken(
            exercise.tokens,
            round.result.hits.map((hit) => hit.judgement),
          )
        : undefined,
    [exercise.tokens, round.result],
  )

  /**
   * Durata pe simbol: un token primeste verdictul cel mai slab dintre notele
   * lui, iar raportul afisat e cel mai departe de 1 - altfel o doime ciupita
   * ar putea trece neobservata intr-un grup.
   */
  const tokenHolds = useMemo<(TokenHold | null)[] | undefined>(() => {
    if (!round.result) return undefined
    const grouped = groupByToken(exercise.tokens, round.result.hits)
    return grouped.map((slice) => {
      if (!slice) return null
      const scored = slice.filter(
        (hit) => hit.expectedHoldMs !== null && hit.heldMs !== null && hit.holdJudgement !== null,
      )
      if (!scored.length) return null
      const worst = scored.reduce((pick, hit) =>
        Math.abs((hit.heldMs! / hit.expectedHoldMs!) - 1) >
        Math.abs((pick.heldMs! / pick.expectedHoldMs!) - 1)
          ? hit
          : pick,
      )
      return { judgement: worst.holdJudgement!, ratio: worst.heldMs! / worst.expectedHoldMs! }
    })
  }, [exercise.tokens, round.result])

  const next = useCallback(() => {
    if (exerciseIndex + 1 >= total) {
      setFinished(true)
      return
    }
    setExerciseIndex((value) => value + 1)
    round.reset()
  }, [exerciseIndex, round, total])

  const retry = useCallback(() => {
    setScores((current) => current.slice(0, -1))
    setRecordedFor(null)
    round.reset()
  }, [round])

  const changeLevel = useCallback(
    (value: number) => {
      setLevelIndex(value)
      setExerciseIndex(0)
      setScores([])
      setRecordedFor(null)
      setFinished(false)
      round.reset()
    },
    [round],
  )

  const restart = useCallback(() => {
    setExerciseIndex(0)
    setScores([])
    setRecordedFor(null)
    setFinished(false)
    round.reset()
  }, [round])

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        gap: 16,
        width: '100%',
        maxWidth: 620,
        alignSelf: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" onPress={onExit} hitSlop={12}>
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.muted }}>
            ‹ Înapoi
          </Text>
        </Pressable>
        <Badge
          label={`${Math.min(exerciseIndex + 1, total)} / ${total} · ${exercise.bpm} BPM`}
          color="#A94F00"
          background={colors.orangeSoft}
        />
      </View>

      <PageTitle
        eyebrow="Joc · citire"
        title="Citește ritmul"
        subtitle="Nu auzi ritmul dinainte. Îl citești de pe notație și îl baţi peste metronom."
      />

      {round.phase === 'ready' && !finished ? (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: font,
              fontSize: 13,
              fontWeight: '800',
              color: colors.muted,
              letterSpacing: 0.8,
            }}
          >
            NIVEL
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {readingLevels.map((item, index) => (
              <Pill
                key={item.level}
                label={`${item.level}`}
                selected={index === levelIndex}
                onPress={() => changeLevel(index)}
              />
            ))}
          </View>
          <Text style={{ fontFamily: font, fontSize: 14, color: colors.muted }}>
            {level.title}, {level.description}
          </Text>
        </View>
      ) : null}

      {finished ? (
        <View style={{ gap: 14 }}>
          <Card style={{ gap: 10 }}>
            <Text style={{ fontFamily: font, fontSize: 22, fontWeight: '900', color: colors.ink }}>
              {session.average >= 80 ? 'Citești bine' : 'Mai exersează citirea'}
            </Text>
            <StatRow label="Scor mediu" value={`${session.average}`} />
            <StatRow label="Cel mai bun exercițiu" value={`${session.best}`} />
            <StatRow label="Nivel" value={`${level.level} · ${level.title}`} />
          </Card>
          <PrimaryButton label="Încă o dată" onPress={restart} />
          <PrimaryButton label="Înapoi" tone="ghost" onPress={onExit} />
        </View>
      ) : (
        <View
          style={{
            borderRadius: 26,
            backgroundColor: rhythmTheme.soft,
            borderWidth: 1,
            borderColor: rhythmTheme.border,
            padding: 18,
            gap: 16,
          }}
        >
          <PhaseBanner phase={round.phase} countInBeat={round.countInBeat} />

          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: font,
                fontSize: 12,
                fontWeight: '900',
                letterSpacing: 0.6,
                color: colors.muted,
              }}
            >
              {exercise.focus.toUpperCase()}
            </Text>
            <RhythmLine
              tokens={exercise.tokens}
              ticksPerBar={exercise.ticksPerBar}
              judgements={tokenJudgements}
              holds={tokenHolds}
            />
            {round.phase === 'result' ? <JudgementLegend /> : null}
          </View>

          {round.phase === 'ready' ? (
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 15,
                  lineHeight: 22,
                  color: colors.muted,
                  textAlign: 'center',
                }}
              >
                Citește notația de mai sus. Auzi două măsuri de numărat, apoi baţi
                ce scrie, peste metronom.
              </Text>
              {/* Demonstratia sta doar la intrarea in serie: mai departe ar fi
                  in drum, iar cine a vazut-o o data stie deja ce se cere. */}
              {exerciseIndex === 0 ? (
                <DemoCard pattern={demoPattern} durations={demoDurations} />
              ) : null}
              <HoldNotice />
              <PrimaryButton label={`Pornește · ${exercise.bpm} BPM`} onPress={round.start} />
            </View>
          ) : null}

          {round.phase !== 'ready' && round.phase !== 'result' ? (
            <View style={{ gap: 10 }}>
              <TapPad
                phase={round.phase}
                countInBeat={round.countInBeat}
                beatsPerBar={exercise.beatsPerBar}
                taps={round.tapCount}
                total={round.targetCount}
                onPressIn={round.pressIn}
                onPressOut={round.pressOut}
                holding={round.holding}
                idleLabel="Numără în gând"
              />
              {round.canSkip ? (
                <SkipButton label="Sari peste numărătoare" onPress={round.skipToPrep} />
              ) : null}
            </View>
          ) : null}

          {round.phase === 'result' && round.result ? (
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.muted,
                  textAlign: 'center',
                }}
              >
                Ascultă cum trebuia să sune. Metronomul e în față, ca să auzi
                unde cade fiecare notă față de timpi.
              </Text>
              <PatternPreviewButton
                pattern={pattern}
                patternDurations={patternDurations}
                stepsPerBar={exercise.ticksPerBar}
                beatsPerBar={exercise.beatsPerBar}
                bpm={exercise.bpm}
                label="Ascultă rezolvarea"
                emphasis="grid"
              />
            </View>
          ) : null}

          {round.phase === 'result' && round.result ? (
            <RoundResult
              result={round.result}
              nextLabel={exerciseIndex + 1 >= total ? 'Vezi rezultatul' : 'Exercițiul următor'}
              onRetry={retry}
              onNext={next}
            />
          ) : null}
        </View>
      )}

      <ScorePills scores={scores} />
    </ScrollView>
  )
}

/**
 * Exemplul de la inceputul seriei: se vede notatia si se aude cum trebuie sa
 * sune. Metronomul e in fata, ca sa se auda unde cade fiecare nota fata de
 * timpi si cat tine doimea.
 */
function DemoCard({ pattern, durations }: { pattern: boolean[]; durations: number[] }) {
  return (
    <Card style={{ gap: 10, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontFamily: font, fontSize: 13, fontWeight: '900', color: colors.muted }}>
        AȘA ARATĂ ȘI AȘA SUNĂ
      </Text>
      <RhythmLine tokens={readingDemo.tokens} />
      <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
        {readingDemo.caption} Nu e unul dintre exerciții, e doar ca să vezi ce
        se cere.
      </Text>
      <PatternPreviewButton
        pattern={pattern}
        patternDurations={durations}
        stepsPerBar={TICKS_PER_BAR}
        bpm={readingDemo.bpm}
        label="Ascultă exemplul"
        tone="ghost"
        emphasis="grid"
      />
    </Card>
  )
}

/** Ce inseamna culorile de pe notatie, dupa evaluare. */
function JudgementLegend() {
  const items: { color: string; label: string }[] = [
    { color: judgementColors.perfect, label: 'exact' },
    { color: judgementColors.good, label: 'aproape' },
    { color: judgementColors.late, label: 'devreme / târziu' },
    { color: judgementColors.miss, label: 'ratat' },
  ]
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
          <Text style={{ fontFamily: font, fontSize: 12, fontWeight: '700', color: colors.muted }}>
            {item.label}
          </Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <View style={{ width: 16, height: 6, borderRadius: 3, backgroundColor: '#E9EDF0' }} />
        <Text style={{ fontFamily: font, fontSize: 12, fontWeight: '700', color: colors.muted }}>
          banda = cât ai ținut nota
        </Text>
      </View>
    </View>
  )
}
