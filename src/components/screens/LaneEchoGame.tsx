import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react-native'
import { colors, font, judgementColors } from '../theme'
import type { LanePalette } from '../lane-pads'
import { PhaseBanner, SkipButton } from '../rhythm-round-ui'
import { useRhythmRound, type RoundPhase } from '../../game/useRhythmRound'
import { rhythmRoundFeedback } from '../../game/feedback'
import type { HitResult, RoundScore } from '../../game/rhythm'
import type { LanePattern, LaneTrackLayout } from '../../lanes/track'
import { scoreLanes, type LaneScore } from '../../lanes/score'
import type { GameEngine } from '../../../guest/types'

/*
  GAZDA DE SANDBOX pentru jocurile pe mai multe voci.

  În aplicație, fișierul cu acest nume (`mobile/components/rhythm/screens/LaneEchoGame.tsx`)
  are 677 de linii și e lipit de tot shell-ul ei: rezultate salvate în guest
  store, progresie adaptivă 1…100, recompense, analitice, Tony, rezumat de
  sesiune, confetti, texte pe vârstă. Aici nu avem niciuna din ele și nici nu le
  vrem: sandbox-ul e pentru ritm, nu pentru shell.

  Ce e identic, intenționat, până la ultimul câmp: **contractul**
  `LaneGameConfig`, copiat verbatim din aplicație. Atât cele patru jocuri aduse
  de acolo (Ecoul groove-ului, Rudimente, Citește groove-ul, Fill-ul la timp),
  cât și orice joc nou scris aici sunt doar obiecte de configurare, deci trec
  dintr-o parte în alta cu un `cp`, fără traduceri.

  Ce face gazda asta și nu face cea din aplicație: nivelul se alege cu mâna.
  Fără rezultate salvate nu există nivel adaptiv, iar la o masă de lucru vrei
  oricum să sari direct pe nivelul care te interesează.
*/

export interface LaneRound<V extends string> extends LanePattern<V> {
  stage: number
  step: number
  /** Nivelul din lista jocului (1…10), pentru analitice. */
  subLevel: number
}

export interface LanePadsProps<R> {
  /**
   * Runda curentă. `renderStrip` și `renderGuide` o primeau deja; pad-urile nu,
   * până a fost nevoie: la poliritm, nivelul de intrare are un singur flux de
   * bătut, deci un singur pad, al doilea ar fi o cursă, nu un buton.
   */
  round: R
  phase: RoundPhase
  countInBeat: number
  height: number
  onPressIn: (lane: number) => void
  onPressOut: () => void
}

/** Ce deosebește un joc pe voci de altul: vocile, generatorul, pista și pad-urile. */
export interface LaneGameConfig<V extends string, R extends LaneRound<V>> {
  engine: GameEngine
  voices: readonly V[]
  titleKey: string
  howToKey: string
  icon: LucideIcon
  roundForLevel: (level: number, attempt: number) => R
  levelInfo: (round: R) => { title: { ro: string; en: string }; description: { ro: string; en: string } }
  buildTrack: (round: R) => { uri: string; layout: LaneTrackLayout<V> }
  voiceNames: (t: (key: string) => string) => Record<V, string>
  palettes: Record<V, LanePalette>
  /** Sfatul când o voce rămâne clar în urmă, cu `{{voice}}`. */
  weakVoiceKey: string
  renderPads: (props: LanePadsProps<R>) => ReactNode
  renderStrip: (props: {
    round: R
    layout: LaneTrackLayout<V>
    elapsed: number
    phase: RoundPhase
    laneHits: Record<V, HitResult[]> | null
    compact: boolean
    result: boolean
  }) => ReactNode
  /** Ceva sub bandă, deasupra pad-urilor (mâinile scrise la Rudimente, părțile fill-ului). */
  renderGuide?: (props: {
    round: R
    layout: LaneTrackLayout<V>
    elapsed: number
    phase: RoundPhase
    laneHits: Record<V, HitResult[]> | null
  }) => ReactNode
  /**
   * Citire: modelul nu se aude înainte (pista e randată fără el), iar banda
   * apare deja înainte de start, ca să poată fi citită în ritmul tău.
   */
  reading?: boolean
  /** Cât de înalte sunt pad-urile, din spațiul disponibil și ținta publicului. */
  padHeight: (available: number, tapTarget: { min: number; max: number }, kid: boolean) => number
}

/** Ținta de atingere a adultului din aplicație; aici nu avem public pe vârste. */
const TAP_TARGET = { min: 48, max: 96 }

/** Nivelurile adaptive pe care sare selectorul: câte unul pe fiecare nivel de joc. */
const LEVEL_STEPS = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91]

export function LaneEchoGame<V extends string, R extends LaneRound<V>>({
  config,
  onExit,
}: {
  config: LaneGameConfig<V, R>
  onExit: () => void
}) {
  const { voices } = config
  const { t } = useTranslation()
  const { height: windowHeight } = useWindowDimensions()
  const compact = windowHeight < 720

  const [level, setLevel] = useState(1)
  const [variation, setVariation] = useState(0)
  const [laneScore, setLaneScore] = useState<LaneScore<V> | null>(null)
  const [scores, setScores] = useState<number[]>([])

  const laneRound = useMemo(() => config.roundForLevel(level, variation), [config, level, variation])
  const info = config.levelInfo(laneRound)
  const track = useMemo(() => config.buildTrack(laneRound), [config, laneRound])


  const scoreTaps = useCallback(
    (taps: { atMs: number; lane: number }[], stepMs: number) => {
      const scored = scoreLanes(
        voices,
        track.layout.laneTargetsMs,
        taps.map((tap) => ({ atMs: tap.atMs, voice: voices[tap.lane] ?? voices[0]! })),
        stepMs,
      )
      setLaneScore(scored)
      return scored
    },
    [track, voices],
  )

  const round = useRhythmRound({
    pattern: laneRound.lanes[voices[0]!],
    stepsPerBar: laneRound.stepsPerBar,
    beatsPerBar: laneRound.beatsPerBar,
    bpm: laneRound.bpm,
    track,
    scoreTaps,
    onResult: (result: RoundScore) => setScores((all) => [...all, result.score]),
  })

  const phase = round.phase
  const showStrip = phase !== 'ready' || config.reading === true
  const verdict = round.result ? rhythmRoundFeedback(round.result) : null

  // Vocea clar rămasă în urmă, ca în aplicație: sub celelalte cu 20 de puncte.
  const weakestVoice: V | null = (() => {
    if (!laneScore) return null
    const scored = voices
      .map((voice) => ({ voice, score: laneScore.laneScores[voice] }))
      .filter((entry): entry is { voice: V; score: number } => entry.score !== null)
    if (scored.length < 2) return null
    const sorted = [...scored].sort((left, right) => left.score - right.score)
    return sorted[0]!.score <= sorted[1]!.score - 20 ? sorted[0]!.voice : null
  })()
  const voiceName = config.voiceNames(t)

  const nextRound = () => {
    setLaneScore(null)
    setVariation((value) => value + 1)
    round.reset()
  }

  const selectLevel = (requested: number) => {
    if (phase !== 'ready') return
    setLaneScore(null)
    setLevel(requested)
    setVariation(0)
    round.reset()
  }

  const padHeight = config.padHeight(compact ? 200 : 260, TAP_TARGET, false)
  const Icon = config.icon

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={onExit}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 4, paddingRight: 8 })}
          >
            <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.muted }}>
              ‹ {t('common.back')}
            </Text>
          </Pressable>
          <Icon size={20} color={colors.orange} />
          <Text style={{ flex: 1, fontFamily: font, fontSize: 20, fontWeight: '800', color: colors.ink }}>
            {t(config.titleKey)}
          </Text>
        </View>

        {/* Selectorul de nivel: în sandbox nivelul se alege, nu se câștigă. */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: font, fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted }}>
            {t('common.level')} {level} · {info.title.ro}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {LEVEL_STEPS.map((step, index) => (
              <Pressable
                key={step}
                accessibilityRole="button"
                accessibilityLabel={`${t('common.level')} ${step}`}
                onPress={() => selectLevel(step)}
                style={{
                  minWidth: 36,
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: level === step ? colors.orange : colors.orangeSoft,
                  opacity: phase === 'ready' ? 1 : 0.4,
                }}
              >
                <Text
                  style={{
                    fontFamily: font,
                    fontSize: 13,
                    fontWeight: '800',
                    color: level === step ? '#FFFFFF' : colors.ink,
                  }}
                >
                  {index + 1}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            {info.description.ro}
          </Text>
          <Text style={{ fontFamily: font, fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] }}>
            {laneRound.bpm} BPM · {laneRound.stepsPerBar} pași/măsură · {laneRound.beatsPerBar} timpi
            {scores.length ? ` · runde: ${scores.join(', ')}` : ''}
          </Text>
        </View>

        {phase === 'ready' ? (
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.ink }}>
            {t(config.howToKey)}
          </Text>
        ) : (
          <PhaseBanner phase={phase} countInBeat={round.countInBeat} />
        )}

        {showStrip
          ? config.renderStrip({
              round: laneRound,
              layout: track.layout,
              elapsed: round.elapsed,
              phase,
              laneHits: laneScore?.laneHits ?? null,
              compact,
              result: phase === 'result',
            })
          : null}

        {config.renderGuide?.({
          round: laneRound,
          layout: track.layout,
          elapsed: round.elapsed,
          phase,
          laneHits: laneScore?.laneHits ?? null,
        })}

        {config.renderPads({
          round: laneRound,
          phase,
          countInBeat: round.countInBeat,
          height: padHeight,
          onPressIn: round.pressIn,
          onPressOut: round.pressOut,
        })}

        {round.canSkip ? <SkipButton label={t('common.skip')} onPress={round.skipToPrep} /> : null}

        {phase === 'ready' ? (
          <Pressable
            accessibilityRole="button"
            onPress={round.start}
            style={({ pressed }) => ({
              padding: 16,
              borderRadius: 16,
              alignItems: 'center',
              backgroundColor: colors.ink,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontFamily: font, fontSize: 17, fontWeight: '800', color: '#FFFFFF' }}>
              {t('common.start')}
            </Text>
          </Pressable>
        ) : null}

        {phase === 'result' && round.result ? (
          <View style={{ gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.orangeSoft }}>
            <Text style={{ fontFamily: font, fontSize: 32, fontWeight: '800', color: colors.ink, fontVariant: ['tabular-nums'] }}>
              {round.result.score}
            </Text>
            {/* Aceeași alegere de chei ca în aplicație (`components/rhythm/round-text.ts`). */}
            {verdict ? (
              <Text style={{ fontFamily: font, fontSize: 15, lineHeight: 21, color: colors.ink }}>
                {verdict.code === 'excellent' || verdict.code === 'good'
                  ? t(`play.feedback_${verdict.code}`)
                  : t(`rhythm.feedback_${verdict.code}`, { count: verdict.count })}
              </Text>
            ) : null}

            {/* Scorul pe fiecare voce: de aici se vede care pad a scăpat runda. */}
            {laneScore ? (
              <View style={{ gap: 4 }}>
                {voices.map((voice) => {
                  const value = laneScore.laneScores[voice]
                  return (
                    <Text
                      key={voice}
                      style={{
                        fontFamily: font,
                        fontSize: 14,
                        fontWeight: '700',
                        color: value === null ? colors.muted : value >= 80 ? judgementColors.perfect : colors.ink,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {voiceName[voice]}: {value === null ? '-' : value}
                    </Text>
                  )
                })}
                {laneScore.strayTaps ? (
                  <Text style={{ fontFamily: font, fontSize: 13, color: judgementColors.miss }}>
                    pad greșit: {laneScore.strayTaps}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {weakestVoice ? (
              <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.ink }}>
                {t(config.weakVoiceKey, { voice: voiceName[weakestVoice] })}
              </Text>
            ) : null}

            <Text style={{ fontFamily: font, fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] }}>
              latență ≈ {Math.round(round.result.latencyMs)} ms · eroare medie{' '}
              {Math.round(round.result.meanAbsErrorMs)} ms · {round.result.tendency}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={nextRound}
                style={({ pressed }) => ({
                  flex: 1,
                  padding: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  backgroundColor: colors.ink,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                  {t('common.continue')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setLaneScore(null)
                  round.reset()
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  padding: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
                  încă o dată
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}
