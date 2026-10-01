import { useState } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, font, judgementColors } from './theme'
import type { RoundPhase } from '@/lib/rhythm/game/useRhythmRound'
import type { HitResult } from '@/lib/rhythm/game/rhythm'
import type { LanePattern, LaneTrackLayout } from '@/lib/rhythm/lanes/track'

/** Culorile unei voci: padul, fundalul pal, textul pe pad și padul apăsat. */
export interface LanePalette {
  fill: string
  soft: string
  ink: string
  pressed: string
}

/** Lățimea etichetei de voce din stânga benzii. */
const LABEL_WIDTH = 34

/**
 * Un pad de lovit. Folosește responderul de bază, ca TapPad: `Pressable` pierde
 * loviturile de 25 ms. Cât degetul e jos, padul se întunecă, se strânge puțin
 * și primește chenar gros, ca să simți că ai lovit, și în afara rândului tău.
 */
export function LanePad({
  label,
  palette,
  active,
  warming,
  hint,
  height,
  grow = false,
  onPressIn,
  onPressOut,
}: {
  label: string
  palette: LanePalette
  active: boolean
  warming: boolean
  hint: string | null
  height: number
  /** Într-un rând, padul împarte lățimea cu vecinii; singur, ia toată lățimea. */
  grow?: boolean
  onPressIn: () => void
  onPressOut: () => void
}) {
  const [down, setDown] = useState(false)
  const release = () => {
    setDown(false)
    onPressOut()
  }
  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => false}
      onResponderGrant={() => {
        setDown(true)
        onPressIn()
      }}
      onResponderRelease={release}
      onResponderTerminate={release}
      onResponderTerminationRequest={() => false}
      style={{
        ...(grow ? { flex: 1 } : { width: '100%' }),
        height,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: down ? palette.pressed : active ? palette.fill : warming ? palette.soft : '#FFFFFF',
        borderWidth: down ? 4 : 2,
        borderColor: down ? palette.pressed : active || warming ? palette.fill : colors.border,
        transform: [{ scale: down ? 0.96 : 1 }],
      }}
    >
      <Text
        style={{
          fontFamily: font,
          fontSize: height >= 120 ? 20 : 17,
          fontWeight: '900',
          color: down || active ? palette.ink : colors.ink,
          letterSpacing: -0.3,
        }}
      >
        {label}
      </Text>
      {hint ? (
        <Text
          style={{
            fontFamily: font,
            fontSize: 13,
            fontWeight: '700',
            color: down || active ? palette.ink : colors.muted,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  )
}

/** Textul de pe pad după faza rundei: „Bate acum”, numărătoarea sau „Ascultă…”. */
export function usePadHint(phase: RoundPhase, countInBeat: number) {
  const { t } = useTranslation()
  if (phase === 'respond') return t('rhythm.padNow')
  if (phase === 'prep') return `${countInBeat}`
  return t('rhythm.padListen')
}

/**
 * Banda unei runde pe voci: un rând pe voce, o celulă pe pas, capul de redare
 * la ascultare și la răspuns; la rezultat, fiecare lovitură în culoarea
 * verdictului. Accentele (dacă există) au punctul mai mare.
 */
export function LaneStrip<V extends string>({
  voices,
  pattern,
  labels,
  palettes,
  layout,
  elapsed,
  phase,
  laneHits,
  accessibilityLabel,
  height = 84,
  fromStep = 0,
  quietSteps,
}: {
  voices: readonly V[]
  pattern: LanePattern<V>
  labels: Record<V, string>
  palettes: Record<V, LanePalette>
  layout: LaneTrackLayout<V>
  elapsed: number
  phase: RoundPhase
  laneHits: Record<V, HitResult[]> | null
  accessibilityLabel: string
  height?: number
  /** Primul pas afișat: la Fill-ul la timp banda începe cu măsura fill-ului. */
  fromStep?: number
  /** Pașii pe care merge doar groove-ul de acompaniament: umbriți, nu se bat. */
  quietSteps?: (step: number) => boolean
}) {
  const [width, setWidth] = useState(0)
  const totalSteps = pattern.lanes[voices[0]!].length
  const shownSteps = totalSteps - fromStep
  const durationMs = layout.stepMs * shownSteps
  const windowStartMs =
    (phase === 'respond' ? layout.responseStartMs : phase === 'listen' ? layout.patternStartMs : 0) +
    fromStep * layout.stepMs
  const progress =
    phase === 'respond' || phase === 'listen' ? Math.max(0, Math.min(1, (elapsed - windowStartMs) / durationMs)) : 0
  const gap = 4
  const rowHeight = (height - 2 * gap - (voices.length - 1) * gap) / voices.length
  const stepsPerBeat = pattern.stepsPerBar / pattern.beatsPerBar
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{
        width: '100%',
        height,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        paddingVertical: gap,
        gap,
      }}
    >
      {voices.map((voice) => {
        const palette = palettes[voice]
        let ordinal = -1
        return (
          <View key={voice} style={{ height: rowHeight, flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                width: LABEL_WIDTH,
                textAlign: 'center',
                fontFamily: font,
                fontSize: 10,
                fontWeight: '900',
                color: colors.muted,
                letterSpacing: 0.4,
              }}
            >
              {labels[voice]}
            </Text>
            <View style={{ flex: 1, flexDirection: 'row', height: '100%' }}>
              {pattern.lanes[voice].map((hit, step) => {
                if (hit) ordinal += 1
                if (step < fromStep) return null
                const judgement = hit && laneHits ? laneHits[voice][ordinal]?.judgement : null
                const beatLine = step % stepsPerBeat === 0
                const barLine = step % pattern.stepsPerBar === 0 && step > fromStep
                const accented = pattern.accents?.[step] === true
                const base = Math.max(6, Math.min(rowHeight - 6, 12))
                const dot = accented ? Math.min(rowHeight - 2, base + 4) : base
                return (
                  <View
                    key={step}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderLeftWidth: barLine ? 2 : beatLine ? 1 : 0,
                      borderLeftColor: barLine ? colors.muted : colors.border,
                      backgroundColor: quietSteps?.(step) ? '#F1F2F4' : undefined,
                    }}
                  >
                    {hit ? (
                      <View
                        style={{
                          width: dot,
                          height: dot,
                          borderRadius: dot / 2,
                          backgroundColor: judgement ? judgementColors[judgement] : palette.fill,
                        }}
                      />
                    ) : null}
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
      {progress > 0 && width > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: LABEL_WIDTH + progress * (width - LABEL_WIDTH - 2),
            width: 2,
            backgroundColor: colors.orange,
          }}
        />
      ) : null}
    </View>
  )
}
