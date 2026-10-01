import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, font, judgementColors } from './theme'
import { LanePad, LaneStrip, usePadHint, type LanePalette } from './lane-pads'
import { PatternPreviewButton } from './pattern-preview'
import type { RoundPhase } from '@/lib/rhythm/game/useRhythmRound'
import type { HitResult } from '@/lib/rhythm/game/rhythm'
import type { LaneTrackLayout } from '@/lib/rhythm/lanes/track'
import {
  PULSE_SOUND,
  polyrhythmHands,
  streamPositions,
  type PolyrhythmHand,
  type PolyrhythmPattern,
} from '@/lib/rhythm/polyrhythm/patterns'

/** Aceleași culori de mână ca la Rudimente: stânga albastră, dreapta roșie. */
export const polyrhythmHandColors: Record<PolyrhythmHand, LanePalette> = {
  left: { fill: '#3E66B3', soft: '#EDF3FF', ink: '#FFFFFF', pressed: '#24427E' },
  right: { fill: '#C8442E', soft: '#FDEEEA', ink: '#FFFFFF', pressed: '#8E2A19' },
}

export const handIndex = (hand: PolyrhythmHand) => polyrhythmHands.indexOf(hand)

/** Vocea pe care o ține aplicația: gri, ca să nu se citească drept a ta. */
const HELD_BY_APP: LanePalette = {
  fill: '#9AA1A9',
  soft: '#F1F2F4',
  ink: '#FFFFFF',
  pressed: '#6F767E',
}

const pulseHandOf = (pattern: PolyrhythmPattern): PolyrhythmHand =>
  pattern.crossHand === 'left' ? 'right' : 'left'

/** Câte note ține mâna asta în runda curentă. */
export const countForHand = (pattern: PolyrhythmPattern, hand: PolyrhythmHand) =>
  hand === pattern.crossHand ? pattern.crossCount : pattern.pulseCount

/**
 * Două pad-uri, ca la Rudimente: stânga e mâna stângă, dreapta e cea dreaptă.
 * Pad-urile nu spun câte note ține fiecare mână, asta se schimbă de la o
 * rundă la alta și o scrie ghidul de deasupra lor (`RatioLabel` și
 * `CommonGrid`), care primește runda. Contractul jocurilor pe voci nu dă runda
 * pad-urilor, și nu merită schimbat pentru atât.
 */
export function PolyrhythmPads({
  round,
  phase,
  countInBeat,
  height,
  onPressIn,
  onPressOut,
}: {
  round: PolyrhythmPattern
  phase: RoundPhase
  countInBeat: number
  height: number
  onPressIn: (lane: number) => void
  onPressOut: () => void
}) {
  const { t } = useTranslation()
  const active = phase === 'respond'
  const warming = phase === 'prep'
  const hint = usePadHint(phase, countInBeat)
  /*
    La nivelul de intrare se desenează UN SINGUR pad. Al doilea ar fi o cursă:
    mâna lui nu are nimic de bătut, deci orice atingere acolo ar fi numărată ca
    lovitură în plus, adică exact nivelul cel mai ușor te-ar pedepsi pentru că
    ai încercat să ții și pulsul.
  */
  const hands = round.solo ? [round.crossHand] : polyrhythmHands
  return (
    <View style={{ width: '100%', flexDirection: 'row', gap: 10 }}>
      {hands.map((hand) => (
        <LanePad
          key={hand}
          grow
          label={t(hand === 'left' ? 'rhythm.rudimentLeft' : 'rhythm.rudimentRight')}
          palette={polyrhythmHandColors[hand]}
          active={active}
          warming={warming}
          hint={hint}
          height={height}
          onPressIn={() => onPressIn(handIndex(hand))}
          onPressOut={onPressOut}
        />
      ))}
    </View>
  )
}

/**
 * GRILA COMUNĂ, desenată, metoda pe care o predă lecția 18, nu o decorație.
 * Un rând pe flux, peste aceeași unitate, cu pozițiile scrise („1 · 3 · 5”).
 * Asta e singurul mod în care un începător poate găsi un poliritm: nu
 * „simte-l”, ci numără cea mai mică unitate în care intră amândouă.
 *
 * Sub grilă scrie raportul rundei și care mână ține ce. Fără rândul acela,
 * toate rundele arată la fel și nu se vede care contra care s-a bătut.
 */
export function CommonGrid({ pattern }: { pattern: PolyrhythmPattern }) {
  const { t } = useTranslation()
  const pulseHand = pulseHandOf(pattern)
  const rows = [
    { hand: pattern.crossHand, count: pattern.crossCount, pulse: false },
    { hand: pulseHand, count: pattern.pulseCount, pulse: true },
  ]
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontFamily: font,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: colors.muted,
        }}
      >
        {t('rhythm.polyrhythmGridHeading', { steps: pattern.stepsPerBar })}
      </Text>
      {pattern.solo ? (
        <Text style={{ fontFamily: font, fontSize: 13, lineHeight: 19, color: colors.ink }}>
          {t('rhythm.polyrhythmSoloNote')}
        </Text>
      ) : null}
      {rows.map(({ hand, count, pulse }) => {
        const positions = new Set(streamPositions(count, pattern.stepsPerBar))
        const palette = pulse && pattern.solo ? HELD_BY_APP : polyrhythmHandColors[hand]
        return (
          <View key={hand} style={{ gap: 3 }}>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {Array.from({ length: pattern.stepsPerBar }, (_, index) => {
                const on = positions.has(index + 1)
                return (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 16,
                      borderRadius: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? palette.fill : palette.soft,
                    }}
                  >
                    {on ? (
                      <Text style={{ fontFamily: font, fontSize: 9, fontWeight: '900', color: palette.ink }}>
                        {index + 1}
                      </Text>
                    ) : null}
                  </View>
                )
              })}
            </View>
            <Text style={{ fontFamily: font, fontSize: 11, fontWeight: '700', color: palette.fill }}>
              {t(
                pulse
                  ? pattern.solo
                    ? 'rhythm.polyrhythmRowHeld'
                    : 'rhythm.polyrhythmRowPulse'
                  : 'rhythm.polyrhythmRowCross',
                {
                  hand: t(hand === 'left' ? 'rhythm.rudimentLeft' : 'rhythm.rudimentRight'),
                  count,
                  positions: streamPositions(count, pattern.stepsPerBar).join(' · '),
                },
              )}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

/**
 * DEMONSTRAȚIA DE LA ÎNCEPUT, înainte de prima rundă.
 *
 * Fără ea, jocul îți spune CE să faci („trei peste două”) dar nu CUM, iar
 * „cum” e singurul lucru care contează la un poliritm: nu îl simți, îl numeri
 * pe grila comună. Așa îl predă lecția 18, așa trebuie să intre și în joc.
 *
 * Patru ascultări, în ordinea în care se învață:
 *   1. grila singură, auzi în câte părți egale se taie măsura;
 *   2. fluxul tău peste ea, auzi pe care părți cazi;
 *   3. celălalt flux, la fel, separat;
 *   4. amândouă, abia acum se aude raportul.
 *
 * Sunt aceleași sunete ca la joc și la lecție, deci ce auzi aici e exact ce vei
 * auzi în rundă.
 */
export function CountingDemo({ pattern }: { pattern: PolyrhythmPattern }) {
  const { t } = useTranslation()
  const pulseHand = pulseHandOf(pattern)
  const steps = pattern.stepsPerBar
  const crossSteps = streamPositions(pattern.crossCount, steps)
  const pulseSteps = streamPositions(pattern.pulseCount, steps)
  const on = (positions: number[]) =>
    Array.from({ length: steps }, (_, index) => positions.includes(index + 1))

  /*
    Tempoul demonstrației e plafonat: la 5 contra 4 grila are douăzeci de părți,
    iar în tempoul rundei nu le poți număra. Lecția spune exact asta, e de
    ajuns să le numeri o dată RAR, ca să simți unde se apropie fluxurile.
  */
  const bpm = Math.min(pattern.bpm, 52)
  const commonProps = { stepsPerBar: steps, beatsPerBar: pattern.beatsPerBar, bpm, tone: 'ghost' as const }

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontFamily: font,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: colors.muted,
        }}
      >
        {t('rhythm.polyrhythmDemoHeading')}
      </Text>

      {/*
        Numărătoarea: fiecare parte a grilei, numerotată. Numerele sunt colorate
        pe fluxuri, altfel „3 și 5 sunt ale mele, 4 e al lui, 1 e al amândurora”
        nu se vede, și tocmai asta e de văzut.
      */}
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: steps }, (_, index) => {
          const isCross = crossSteps.includes(index + 1)
          const isPulse = pulseSteps.includes(index + 1)
          const crossPalette = polyrhythmHandColors[pattern.crossHand]
          const pulsePalette = pattern.solo ? HELD_BY_APP : polyrhythmHandColors[pulseHand]
          const both = isCross && isPulse
          const owner = isCross ? crossPalette : isPulse ? pulsePalette : null
          return (
            <View
              key={index}
              style={{
                flex: 1,
                height: 22,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                // „Unu” e singurul loc unde cad împreună: plin, ca să sară în ochi.
                backgroundColor: both ? colors.ink : owner ? owner.soft : '#F6F7F8',
                borderWidth: owner && !both ? 1.5 : 0,
                borderColor: owner ? owner.fill : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: '800',
                  color: both ? '#FFFFFF' : owner ? owner.fill : '#C3C8CD',
                }}
              >
                {index + 1}
              </Text>
            </View>
          )
        })}
      </View>
      <Text style={{ fontFamily: font, fontSize: 12, lineHeight: 17, color: colors.muted }}>
        {t('rhythm.polyrhythmDemoCountNote', { steps })}
      </Text>

      <PatternPreviewButton
        {...commonProps}
        pattern={on(Array.from({ length: steps }, (_, index) => index + 1))}
        label={t('rhythm.polyrhythmDemoGrid', { steps })}
        playingLabel={t('rhythm.polyrhythmDemoPlaying')}
      />
      <PatternPreviewButton
        {...commonProps}
        pattern={on(crossSteps)}
        emphasis="grid"
        label={t('rhythm.polyrhythmDemoCross', { positions: crossSteps.join(' · ') })}
        playingLabel={t('rhythm.polyrhythmDemoPlaying')}
      />
      <PatternPreviewButton
        {...commonProps}
        pattern={on(pulseSteps)}
        emphasis="grid"
        label={t(pattern.solo ? 'rhythm.polyrhythmDemoHeld' : 'rhythm.polyrhythmDemoPulse', {
          positions: pulseSteps.join(' · '),
        })}
        playingLabel={t('rhythm.polyrhythmDemoPlaying')}
      />
      {/* Amândouă: fluxul tău sus, celălalt pe vocea de acompaniament, ca la lecție. */}
      <PatternPreviewButton
        {...commonProps}
        pattern={on(crossSteps)}
        backingPattern={on(pulseSteps)}
        label={t('rhythm.polyrhythmDemoBoth', {
          cross: pattern.crossCount,
          pulse: pattern.pulseCount,
        })}
        playingLabel={t('rhythm.polyrhythmDemoPlaying')}
        tone="dark"
      />
      <Text style={{ fontFamily: font, fontSize: 12, lineHeight: 17, color: colors.muted }}>
        {t('rhythm.polyrhythmDemoHandsNote', {
          hand: t(pattern.crossHand === 'left' ? 'rhythm.rudimentLeft' : 'rhythm.rudimentRight'),
          other: t(pulseHand === 'left' ? 'rhythm.rudimentLeft' : 'rhythm.rudimentRight'),
        })}
      </Text>
    </View>
  )
}

/** Raportul rundei, scris: „3 contra 2 · dreapta ține trei”. */
export function RatioLabel({ pattern }: { pattern: PolyrhythmPattern }) {
  const { t } = useTranslation()
  return (
    <Text style={{ fontFamily: font, fontSize: 15, fontWeight: '800', color: colors.ink }}>
      {t('rhythm.polyrhythmRatio', { cross: pattern.crossCount, pulse: pattern.pulseCount })}
      {' · '}
      <Text style={{ color: polyrhythmHandColors[pattern.crossHand].fill }}>
        {t('rhythm.polyrhythmHolds', {
          hand: t(pattern.crossHand === 'left' ? 'rhythm.rudimentLeft' : 'rhythm.rudimentRight'),
          count: pattern.crossCount,
        })}
      </Text>
    </Text>
  )
}

/**
 * Cât s-a nimerit pe fiecare mână, la rezultat. La poliritm nu e de ajuns
 * scorul total: un 70 poate însemna două mâini mediocre sau una perfectă și
 * una pierdută, iar ce ai de exersat mai departe e cu totul altceva.
 */
export function PolyrhythmStrip({
  pattern,
  layout,
  elapsed,
  phase,
  laneHits,
  height = 70,
}: {
  pattern: PolyrhythmPattern
  layout: LaneTrackLayout<PolyrhythmHand>
  elapsed: number
  phase: RoundPhase
  laneHits: Record<PolyrhythmHand, HitResult[]> | null
  height?: number
}) {
  const { t } = useTranslation()
  const pulseHand = pulseHandOf(pattern)
  /*
    La nivelul de intrare, rândul pulsului ar fi gol, deși pulsul se AUDE. Un
    rând gol sub un sunet care merge e mai rău decât niciun rând: pare că s-a
    stricat ceva. Îl desenăm din acompaniament, în gri, ca să se vadă că sună
    și că nu e al tău.
  */
  const held = pattern.solo ? pattern.backing?.[PULSE_SOUND] : undefined
  const shown = held
    ? { ...pattern, lanes: { ...pattern.lanes, [pulseHand]: held } }
    : pattern
  const palettes = held
    ? { ...polyrhythmHandColors, [pulseHand]: HELD_BY_APP }
    : polyrhythmHandColors
  return (
    <LaneStrip
      voices={polyrhythmHands}
      pattern={shown}
      labels={{
        left: t('rhythm.rudimentLeftShort'),
        right: t('rhythm.rudimentRightShort'),
      }}
      palettes={palettes}
      layout={layout}
      elapsed={elapsed}
      phase={phase}
      laneHits={laneHits}
      accessibilityLabel={t('rhythm.polyrhythmStripAccessibility', {
        cross: pattern.crossCount,
        pulse: pattern.pulseCount,
      })}
      height={height}
    />
  )
}

/**
 * Unde s-au atins de fapt cele două fluxuri: doar pe „unu”. Se desenează la
 * rezultat, ca reper, dacă ai ratat bara, ai ratat singurul punct sigur.
 */
export function MeetingPoints({
  pattern,
  laneHits,
}: {
  pattern: PolyrhythmPattern
  laneHits: Record<PolyrhythmHand, HitResult[]> | null
}) {
  const { t } = useTranslation()
  if (!laneHits) return null
  const bars = pattern.lanes[pattern.crossHand].length / pattern.stepsPerBar
  const pulseHand = pulseHandOf(pattern)
  // Prima notă a fiecărei măsuri, pe fiecare flux: acolo cad împreună.
  const downbeats = Array.from({ length: bars }, (_, bar) => {
    const cross = laneHits[pattern.crossHand][bar * pattern.crossCount]?.judgement ?? null
    const pulse = laneHits[pulseHand][bar * pattern.pulseCount]?.judgement ?? null
    return { bar, cross, pulse }
  })
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: font, fontSize: 12, fontWeight: '800', color: colors.muted }}>
        {t('rhythm.polyrhythmMeetingHeading')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {downbeats.map(({ bar, cross, pulse }) => {
          const both = cross === 'perfect' && pulse === 'perfect'
          const either = cross && pulse
          return (
            <View
              key={bar}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: both
                  ? judgementColors.perfect
                  : either
                    ? colors.orangeSoft
                    : judgementColors.miss,
              }}
            >
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  fontWeight: '800',
                  color: both || !either ? '#FFFFFF' : colors.ink,
                }}
              >
                {t('rhythm.polyrhythmBar', { number: bar + 1 })}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
