import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { colors, font, rhythmTheme } from '../theme'
import { Badge, Card, PageTitle, PrimaryButton, StatRow } from '../components/ui'
import { BeatGrid, NoteCard } from '../components/notation'
import { DurationStack, RhythmLine } from '../components/rhythm-line'
import {
  HoldNotice,
  PatternStrip,
  PhaseBanner,
  RoundResult,
  ScorePills,
  SkipButton,
  TapPad,
} from '../components/rhythm-round-ui'
import { PatternPreviewButton } from '../components/pattern-preview'
import { useRhythmRound } from '../game/useRhythmRound'
import { summarizeSession } from '../game/rhythm'
import type { Lesson, LessonSection } from '../curriculum/types'

type Stage = 'teach' | 'practice' | 'done'

export function LessonScreen({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const [stage, setStage] = useState<Stage>('teach')
  const [sectionIndex, setSectionIndex] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])

  const totalRounds = lesson.practice.tempos.length
  const pattern = useMemo(
    () => lesson.practice.patterns[roundIndex % lesson.practice.patterns.length]!,
    [lesson, roundIndex],
  )
  const bpm = lesson.practice.tempos[Math.min(roundIndex, totalRounds - 1)]!
  const patternDurations = useMemo(() => {
    const all = lesson.practice.patternDurations
    if (!all) return undefined
    return all[roundIndex % all.length]
  }, [lesson, roundIndex])

  const backingPattern = useMemo(() => {
    const all = lesson.practice.backingPatterns
    if (!all) return undefined
    return all[roundIndex % all.length]
  }, [lesson, roundIndex])

  const patternLabel = lesson.practice.patternLabels
    ? lesson.practice.patternLabels[roundIndex % lesson.practice.patternLabels.length]
    : undefined

  const round = useRhythmRound({
    pattern,
    backingPattern,
    stepsPerBar: lesson.practice.stepsPerBar,
    beatsPerBar: lesson.practice.beatsPerBar,
    bpm,
    patternDurations,
  })

  const session = useMemo(() => summarizeSession(scores), [scores])

  // Scorul se consemneaza o singura data per runda, la prima afisare a lui.
  const [recordedFor, setRecordedFor] = useState<number | null>(null)
  if (round.result && recordedFor !== roundIndex) {
    setRecordedFor(roundIndex)
    setScores((current) => [...current, round.result!.score])
  }

  const nextRound = useCallback(() => {
    if (roundIndex + 1 >= totalRounds) {
      setStage('done')
      return
    }
    setRoundIndex((value) => value + 1)
    round.reset()
  }, [round, roundIndex, totalRounds])

  const retryRound = useCallback(() => {
    // Reluarea nu adauga un scor nou; il inlocuieste pe ultimul.
    setScores((current) => current.slice(0, -1))
    setRecordedFor(null)
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
            ‹ Lecții
          </Text>
        </Pressable>
        {stage === 'practice' ? (
          <Badge
            label={`Runda ${roundIndex + 1} / ${totalRounds} · ${bpm} BPM`}
            color="#A94F00"
            background={colors.orangeSoft}
          />
        ) : null}
      </View>

      <PageTitle eyebrow="Ritm" title={lesson.title} subtitle={lesson.goal} />

      {stage === 'teach' ? (
        <TeachStage
          lesson={lesson}
          sectionIndex={sectionIndex}
          onBack={() => setSectionIndex((value) => Math.max(0, value - 1))}
          onNext={() => {
            if (sectionIndex + 1 < lesson.sections.length) setSectionIndex(sectionIndex + 1)
            else setStage('practice')
          }}
        />
      ) : null}

      {stage === 'practice' ? (
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
          {/* Ce se exerseaza in runda asta. Fara ea, rundele de poliritm arata
              identic si nu se vede care contra care tocmai s-a batut. */}
          {patternLabel ? (
            <Text
              style={{
                fontFamily: font,
                fontSize: 14,
                fontWeight: '900',
                letterSpacing: 0.4,
                color: '#A94F00',
                textAlign: 'center',
              }}
            >
              {patternLabel.toUpperCase()}
            </Text>
          ) : null}
          <PatternStrip
            pattern={pattern}
            backingPattern={backingPattern}
            stepsPerBar={lesson.practice.stepsPerBar}
            beatsPerBar={lesson.practice.beatsPerBar}
            layout={round.layout}
            elapsed={round.elapsed}
            phase={round.phase}
            hits={round.result?.hits ?? null}
          />

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
                {lesson.practice.instruction}
              </Text>
              {/* Doar unde lectia scrie duratele: acolo tinerea chiar se judeca. */}
              {patternDurations ? <HoldNotice /> : null}
              <PrimaryButton label={`Pornește · ${bpm} BPM`} onPress={round.start} />
            </View>
          ) : null}

          {round.phase !== 'ready' && round.phase !== 'result' ? (
            <View style={{ gap: 10 }}>
              <TapPad
                phase={round.phase}
                countInBeat={round.countInBeat}
                beatsPerBar={lesson.practice.beatsPerBar}
                taps={round.tapCount}
                total={round.targetCount}
                onPressIn={round.pressIn}
                onPressOut={round.pressOut}
                holding={round.holding}
              />
              {round.canSkip ? (
                <SkipButton
                  label={round.phase === 'listen' ? 'Sari peste exemplu' : 'Sari peste numărătoare'}
                  onPress={round.skipToPrep}
                />
              ) : null}
            </View>
          ) : null}

          {round.phase === 'result' && round.result ? (
            <RoundResult
              result={round.result}
              nextLabel={
                roundIndex + 1 >= totalRounds ? 'Vezi rezultatul lecției' : 'Runda următoare'
              }
              onRetry={retryRound}
              onNext={nextRound}
            />
          ) : null}
        </View>
      ) : null}

      {stage === 'done' ? (
        <View style={{ gap: 14 }}>
          <Card style={{ gap: 10 }}>
            <Text style={{ fontFamily: font, fontSize: 22, fontWeight: '900', color: colors.ink }}>
              {session.average >= 80
                ? 'Lecție stăpânită'
                : session.average >= 55
                  ? 'Aproape'
                  : 'Mai exersează'}
            </Text>
            <StatRow label="Scor mediu" value={`${session.average}`} />
            <StatRow label="Cea mai bună rundă" value={`${session.best}`} />
            <StatRow label="Tempo-uri exersate" value={lesson.practice.tempos.join(', ')} />
          </Card>
          <PrimaryButton
            label="Reia lecția"
            tone="ghost"
            onPress={() => {
              setScores([])
              setRecordedFor(null)
              setRoundIndex(0)
              setSectionIndex(0)
              setStage('teach')
              round.reset()
            }}
          />
          <PrimaryButton label="Înapoi la lecții" onPress={onExit} />
        </View>
      ) : null}

      {stage === 'practice' ? <ScorePills scores={scores} /> : null}
    </ScrollView>
  )
}

function TeachStage({
  lesson,
  sectionIndex,
  onBack,
  onNext,
}: {
  lesson: Lesson
  sectionIndex: number
  onBack: () => void
  onNext: () => void
}) {
  const section = lesson.sections[sectionIndex]!
  const isLast = sectionIndex + 1 >= lesson.sections.length

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {lesson.sections.map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index <= sectionIndex ? rhythmTheme.accent : colors.border,
            }}
          />
        ))}
      </View>

      <View
        style={{
          borderRadius: 26,
          backgroundColor: rhythmTheme.soft,
          borderWidth: 1,
          borderColor: rhythmTheme.border,
          padding: 20,
          gap: 16,
        }}
      >
        <Text style={{ fontFamily: font, fontSize: 22, fontWeight: '900', color: colors.ink }}>
          {section.heading}
        </Text>
        <Text style={{ fontFamily: font, fontSize: 16, lineHeight: 25, color: '#333A42' }}>
          {section.body}
        </Text>

        {section.notation ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {section.notation.map((item) => (
              <NoteCard
                key={`${item.kind}-${item.name}`}
                kind={item.kind}
                name={item.name}
                duration={item.duration}
              />
            ))}
          </View>
        ) : null}

        {section.rhythmLine ? (
          <RhythmLine
            tokens={section.rhythmLine}
            ticksPerBar={section.rhythmLineTicksPerBar}
          />
        ) : null}

        {section.durationStack ? (
          <DurationStack highlight={section.durationStack} accentColor={rhythmTheme.accent} />
        ) : null}

        {section.grid ? (
          <BeatGrid
            cells={section.grid}
            secondary={section.gridSecondary}
            label={section.gridLabel}
            secondaryLabel={section.gridSecondaryLabel}
            accentColor={rhythmTheme.accent}
          />
        ) : null}

        {section.example ? <ExamplePlayer section={section} /> : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {sectionIndex > 0 ? (
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Înapoi" tone="ghost" onPress={onBack} />
          </View>
        ) : null}
        <View style={{ flex: 2 }}>
          <PrimaryButton label={isLast ? 'Hai să exersăm' : 'Mai departe'} onPress={onNext} />
        </View>
      </View>
    </View>
  )
}

/** Exemplul ascultat inaintea exercitiului. */
function ExamplePlayer({ section }: { section: LessonSection }) {
  const example = section.example!
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: font, fontSize: 14, color: colors.muted }}>{example.caption}</Text>
      <PatternPreviewButton
        pattern={example.steps}
        backingPattern={example.backing}
        stepsPerBar={example.stepsPerBar}
        beatsPerBar={example.beatsPerBar}
        bpm={example.bpm}
        label="Ascultă exemplul"
        emphasis={example.emphasis}
      />
    </View>
  )
}
