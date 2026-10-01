import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { colors, font, rhythmTheme } from '../theme'
import { Badge, Card, PageTitle, Pill, PrimaryButton, StatRow } from '../components/ui'
import {
  PatternStrip,
  PhaseBanner,
  RoundResult,
  ScorePills,
  SkipButton,
  TapPad,
} from '../components/rhythm-round-ui'
import { useRhythmRound } from '../game/useRhythmRound'
import { generatePattern, summarizeSession } from '../game/rhythm'
import { echoLevels } from '../curriculum/echo'

const ROUNDS_PER_SESSION = 20

export function RhythmEchoGame({ onExit }: { onExit: () => void }) {
  const [levelIndex, setLevelIndex] = useState(1)
  const [roundIndex, setRoundIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  /**
   * Sesiunea intra in seed, ca cele cinci runde sa fie altele de fiecare data.
   * Fara asta, acelasi nivel ar da mereu aceleasi pattern-uri si ar antrena
   * memoria, nu auzul.
   */
  const [sessionSeed, setSessionSeed] = useState(() => Math.floor(Math.random() * 1_000_000))

  const level = echoLevels[levelIndex]!
  const { steps, stepsPerBar, beatsPerBar, bpm } = useMemo(
    () =>
      generatePattern(
        level,
        (level.level * 7919 + roundIndex * 104_729 + sessionSeed) >>> 0,
      ),
    [level, roundIndex, sessionSeed],
  )
  const round = useRhythmRound({ pattern: steps, stepsPerBar, beatsPerBar, bpm })

  const [recordedFor, setRecordedFor] = useState<number | null>(null)
  if (round.result && recordedFor !== roundIndex) {
    setRecordedFor(roundIndex)
    setScores((current) => [...current, round.result!.score])
  }

  const session = useMemo(() => summarizeSession(scores), [scores])

  const nextRound = useCallback(() => {
    if (roundIndex + 1 >= ROUNDS_PER_SESSION) {
      setFinished(true)
      return
    }
    setRoundIndex((value) => value + 1)
    round.reset()
  }, [round, roundIndex])

  const retryRound = useCallback(() => {
    // Reluarea inlocuieste ultimul scor, nu adauga unul nou.
    setScores((current) => current.slice(0, -1))
    setRecordedFor(null)
    round.reset()
  }, [round])

  const restart = useCallback(() => {
    setScores([])
    setRecordedFor(null)
    setRoundIndex(0)
    setFinished(false)
    setSessionSeed(Math.floor(Math.random() * 1_000_000))
    round.reset()
  }, [round])

  const changeLevel = useCallback(
    (value: number) => {
      setLevelIndex(value)
      setScores([])
      setRecordedFor(null)
      setRoundIndex(0)
      setFinished(false)
      round.reset()
    },
    [round],
  )

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
          label={`Runda ${Math.min(roundIndex + 1, ROUNDS_PER_SESSION)} / ${ROUNDS_PER_SESSION}`}
          color="#A94F00"
          background={colors.orangeSoft}
        />
      </View>

      <PageTitle
        eyebrow={`Nivel ${level.level} · ${level.title} · ${bpm} BPM`}
        title="Rhythm Echo"
        subtitle="Ascultă pattern-ul, apoi bate-l înapoi după numărătoare."
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
            {echoLevels.map((item, index) => (
              <Pill
                key={item.level}
                label={`${item.level}`}
                selected={index === levelIndex}
                onPress={() => changeLevel(index)}
              />
            ))}
          </View>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            {level.title}, {level.description}
          </Text>
        </View>
      ) : null}

      {finished ? (
        <View style={{ gap: 14 }}>
          <Card style={{ gap: 10 }}>
            <Text style={{ fontFamily: font, fontSize: 22, fontWeight: '900', color: colors.ink }}>
              Sesiune încheiată
            </Text>
            <StatRow label="Nivel" value={`${level.level} · ${level.title}`} />
            <StatRow label="Scor mediu" value={`${session.average}`} />
            <StatRow label="Cea mai bună rundă" value={`${session.best}`} />
          </Card>
          <PrimaryButton label="Încă o sesiune" onPress={restart} />
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
          <PatternStrip
            pattern={steps}
            stepsPerBar={stepsPerBar}
            beatsPerBar={beatsPerBar}
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
                O măsură de numărat, apoi auzi pattern-ul. Urmează încă o măsură de
                numărat, şi abia apoi baţi.
              </Text>
              <PrimaryButton label="Pornește runda" onPress={round.start} />
            </View>
          ) : null}

          {round.phase !== 'ready' && round.phase !== 'result' ? (
            <View style={{ gap: 10 }}>
              <TapPad
                phase={round.phase}
                countInBeat={round.countInBeat}
                beatsPerBar={beatsPerBar}
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
                roundIndex + 1 >= ROUNDS_PER_SESSION ? 'Vezi rezultatul' : 'Runda următoare'
              }
              onRetry={retryRound}
              onNext={nextRound}
            />
          ) : null}
        </View>
      )}

      <ScorePills scores={scores} />
    </ScrollView>
  )
}
