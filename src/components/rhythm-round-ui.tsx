import { Pressable, Text, View } from 'react-native'
import { colors, font, judgementColors, rhythmTheme } from '../theme'
import { Card, PrimaryButton, StatRow } from './ui'
import type { RoundPhase } from '../game/useRhythmRound'
import type { RoundScore } from '../game/rhythm'
import type { RoundTrackLayout } from '../audio/round-plan'

export function PhaseBanner({ phase, countInBeat }: { phase: RoundPhase; countInBeat: number }) {
  const label =
    phase === 'ready'
      ? 'Gata de start'
      : phase === 'countIn'
        ? `Numărătoare · ${countInBeat}`
        : phase === 'listen'
          ? 'Ascultă'
          : phase === 'prep'
            ? `Pregătește-te · ${countInBeat}`
            : phase === 'respond'
              ? 'Rândul tău'
              : 'Rezultat'
  const tone = phase === 'respond' || phase === 'prep' ? rhythmTheme.accent : colors.ink
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: rhythmTheme.border,
        }}
      >
        <Text
          style={{
            fontFamily: font,
            fontSize: 13,
            fontWeight: '900',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: tone,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  )
}

/**
 * Banda pattern-ului: pozitiile tinta, capul de redare si, dupa evaluare,
 * abaterea fiecarei batai.
 */
export function PatternStrip({
  pattern,
  backingPattern,
  stepsPerBar,
  beatsPerBar = 4,
  layout,
  elapsed,
  phase,
  hits,
  revealPattern = true,
}: {
  pattern: boolean[]
  /** Fluxul care se aude dar nu se bate; se deseneaza sub al tau. */
  backingPattern?: boolean[]
  stepsPerBar: number
  /** Cati timpi are o masura: de el depind liniile de timp desenate. */
  beatsPerBar?: number
  layout: RoundTrackLayout
  elapsed: number
  phase: RoundPhase
  hits: RoundScore['hits'] | null
  /** Cand e fals, pattern-ul ramane ascuns pana la rezultat. */
  revealPattern?: boolean
}) {
  const totalSteps = pattern.length
  // Banda arata exact pasii pattern-ului, deci capul de redare se raporteaza
  // la durata lor, nu la durata intregii piste.
  const patternDurationMs = layout.stepMs * totalSteps
  const windowStartMs =
    phase === 'respond' ? layout.responseStartMs : phase === 'listen' ? layout.patternStartMs : 0
  const progress =
    phase === 'respond' || phase === 'listen'
      ? Math.max(0, Math.min(1, (elapsed - windowStartMs) / patternDurationMs))
      : 0
  const visible = revealPattern || phase === 'result'

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          height: 74,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: rhythmTheme.border,
          overflow: 'hidden',
          justifyContent: 'center',
        }}
      >
        {phase === 'listen' || phase === 'respond' ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${progress * 100}%`,
              width: 2,
              backgroundColor: phase === 'respond' ? rhythmTheme.accent : colors.muted,
              opacity: 0.8,
            }}
          />
        ) : null}

        {/*
          Marcajele se aseaza pe pozitia lor in timp, nu cate o celula per pas.
          Grila interna are 48 de pasi pe masura ca sa incapa si trioletele;
          48 de celule ar fi un zid de dreptunghiuri de 10 px.
        */}
        <View style={{ position: 'absolute', left: 10, right: 10, top: 0, bottom: 0 }}>
          {Array.from({ length: totalSteps }, (_, step) => {
            const isBarLine = step % stepsPerBar === 0
            const isBeat = step % (stepsPerBar / beatsPerBar) === 0
            if (!isBarLine && !isBeat) return null
            return (
              <View
                key={`line-${step}`}
                style={{
                  position: 'absolute',
                  left: `${(step / totalSteps) * 100}%`,
                  top: 9,
                  bottom: 9,
                  width: isBarLine ? 2 : 1,
                  backgroundColor: isBarLine ? rhythmTheme.border : '#EFEFEF',
                }}
              />
            )
          })}
          {backingPattern?.map((isHit, step) => {
            if (!isHit) return null
            // Sub linia ta, mai mic si sters: e reperul, nu sarcina. Se vede
            // si inainte de rezultat, fiindca el se aude oricum.
            return (
              <View
                key={`backing-${step}`}
                style={{
                  position: 'absolute',
                  left: `${(step / totalSteps) * 100}%`,
                  top: 52,
                  marginLeft: -5,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.muted,
                  opacity: 0.5,
                }}
              />
            )
          })}
          {pattern.map((isHit, step) => {
            if (!isHit || !visible) return null
            return (
              <View
                key={`hit-${step}`}
                style={{
                  position: 'absolute',
                  left: `${(step / totalSteps) * 100}%`,
                  top: backingPattern ? 20 : 29,
                  marginLeft: -8,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: rhythmTheme.accent,
                }}
              />
            )
          })}
        </View>
      </View>

      {hits ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {hits.map((hit, index) => (
            <View
              key={index}
              style={{
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: `${judgementColors[hit.judgement]}18`,
              }}
            >
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  fontWeight: '800',
                  color: judgementColors[hit.judgement],
                  fontVariant: ['tabular-nums'],
                }}
              >
                {hit.errorMs === null
                  ? 'ratat'
                  : `${hit.errorMs > 0 ? '+' : ''}${Math.round(hit.errorMs)}`}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontFamily: font, fontSize: 12, color: colors.muted, textAlign: 'center' }}>
          {totalSteps / stepsPerBar === 1 ? '1 măsură' : `${totalSteps / stepsPerBar} măsuri`} ·{' '}
          {pattern.filter(Boolean).length} lovituri
        </Text>
      )}
    </View>
  )
}

export function TapPad({
  phase,
  countInBeat,
  beatsPerBar = 4,
  taps,
  total,
  onPressIn,
  onPressOut,
  holding = false,
  idleLabel = 'Ascultă...',
}: {
  phase: RoundPhase
  countInBeat: number
  /** Cati timpi are masura: de el depinde de la cat porneste numaratoarea. */
  beatsPerBar?: number
  taps: number
  total: number
  onPressIn: () => void
  onPressOut: () => void
  /** Degetul e jos acum: padul arata ca nota e sustinuta. */
  holding?: boolean
  /** Ce scrie pe pad inainte sa inceapa randul. La citire nu e nimic de ascultat. */
  idleLabel?: string
}) {
  const active = phase === 'respond'
  const warming = phase === 'prep'
  const label = active
    ? holding
      ? 'Ține...'
      : 'Bate acum'
    : warming
      ? `${beatsPerBar - countInBeat + 1}`
      : idleLabel
  return (
    /**
     * Padul foloseste responderul de baza, nu `Pressable`: masina de stari a
     * lui `Pressable` pierde loviturile foarte scurte, iar o bataie de deget
     * poate dura 25 ms. Aici apasarea si ridicarea ajung direct.
     */
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel="Bate ritmul"
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => false}
      onResponderGrant={onPressIn}
      onResponderRelease={onPressOut}
      onResponderTerminate={onPressOut}
      onResponderTerminationRequest={() => false}
      style={{
        height: 132,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: active
          ? holding
            ? '#E06A00'
            : rhythmTheme.accent
          : warming
            ? '#FFE7CC'
            : '#FFFFFF',
        borderWidth: 2,
        borderColor: active || warming ? rhythmTheme.accent : rhythmTheme.border,
      }}
    >
      <Text
        style={{
          fontFamily: font,
          fontSize: warming ? 40 : 20,
          fontWeight: '900',
          color: active ? '#FFFFFF' : warming ? '#A94F00' : colors.muted,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: font,
          fontSize: 14,
          fontWeight: '700',
          color: active ? '#FFFFFF' : colors.muted,
          opacity: 0.85,
        }}
      >
        {taps} / {total}
      </Text>
    </View>
  )
}

/**
 * Sare peste numaratoare si peste exemplu. Nu e un buton principal: cine il
 * apasa stie deja ce vrea, iar la prima trecere exemplul trebuie ascultat.
 */
export function SkipButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        alignSelf: 'center',
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 16,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: font,
          fontSize: 14,
          fontWeight: '800',
          color: colors.muted,
          textDecorationLine: 'underline',
        }}
      >
        {label} ›
      </Text>
    </Pressable>
  )
}

/**
 * Atentionarea despre tinut, inainte de rulare. Se arata doar unde durata
 * chiar se judeca - altfel ar cere ceva ce scorul nu masoara.
 */
export function HoldNotice() {
  return (
    <View style={{ borderRadius: 14, padding: 12, backgroundColor: '#FFF3E0', gap: 3 }}>
      <Text style={{ fontFamily: font, fontSize: 14, fontWeight: '800', color: '#A94F00' }}>
        Atenție: contează și cât ții nota
      </Text>
      <Text style={{ fontFamily: font, fontSize: 13, lineHeight: 19, color: '#7A4A12' }}>
        Nu e destul să nimerești momentul. Ține degetul apăsat cât ține nota
        scrisă și ridică-l la timp: o doime durează doi timpi, o pătrime unul.
      </Text>
    </View>
  )
}

export function RoundResult({
  result,
  nextLabel,
  onRetry,
  onNext,
}: {
  result: RoundScore
  nextLabel: string
  onRetry: () => void
  onNext: () => void
}) {
  const tendencyLabel =
    result.tendency === 'rushing'
      ? 'Ai accelerat spre final'
      : result.tendency === 'dragging'
        ? 'Ai încetinit spre final'
        : 'Puls stabil'
  const missed = result.hits.filter((hit) => hit.judgement === 'miss').length
  const perfect = result.hits.filter((hit) => hit.judgement === 'perfect').length
  const tooShort = result.hits.filter((hit) => hit.holdJudgement === 'short').length
  const tooLong = result.hits.filter((hit) => hit.holdJudgement === 'long').length
  // O nota ratata nu are cum sa fie „tinuta corect", deci nu intra la numarat.
  const scoredHolds = result.hits.filter(
    (hit) => hit.expectedHoldMs !== null && hit.tapMs !== null,
  ).length

  return (
    <View style={{ gap: 14 }}>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Text
          style={{
            fontFamily: font,
            fontSize: 52,
            lineHeight: 58,
            fontWeight: '900',
            letterSpacing: -2,
            color: result.score >= 80 ? colors.green : result.score >= 55 ? '#A94F00' : '#B3261E',
          }}
        >
          {result.score}
        </Text>
        <Text style={{ fontFamily: font, fontSize: 15, fontWeight: '700', color: colors.muted }}>
          {tendencyLabel}
        </Text>
      </View>

      <Card style={{ gap: 8 }}>
        <StatRow label="Lovituri exacte" value={`${perfect} / ${result.hits.length}`} />
        <StatRow label="Ratate" value={`${missed}`} accent={missed ? '#B3261E' : undefined} />
        <StatRow
          label="Bătăi în plus"
          value={`${result.extraTaps}`}
          accent={result.extraTaps ? '#B3261E' : undefined}
        />
        <StatRow label="Abatere medie" value={`${Math.round(result.meanAbsErrorMs)} ms`} />
        {scoredHolds ? (
          <StatRow
            label="Note ținute corect"
            value={`${scoredHolds - tooShort - tooLong} / ${scoredHolds}`}
            accent={tooShort + tooLong ? '#A94F00' : undefined}
          />
        ) : null}
      </Card>

      {tooShort || tooLong ? (
        <View
          style={{
            borderRadius: 14,
            padding: 12,
            backgroundColor: '#FFF3E0',
            gap: 3,
          }}
        >
          <Text style={{ fontFamily: font, fontSize: 14, fontWeight: '800', color: '#A94F00' }}>
            {tooShort && tooLong
              ? 'Unele note prea scurte, altele prea lungi'
              : tooShort
                ? `${tooShort === 1 ? 'O notă a fost ciupită' : `${tooShort} note au fost ciupite`} prea scurt`
                : `${tooLong === 1 ? 'O notă a fost ținută' : `${tooLong} note au fost ținute`} prea mult`}
          </Text>
          <Text style={{ fontFamily: font, fontSize: 13, lineHeight: 19, color: '#7A4A12' }}>
            Ține degetul apăsat exact cât ține nota scrisă. O doime durează doi
            timpi, nu unul.
          </Text>
        </View>
      ) : null}

      <PrimaryButton label={nextLabel} onPress={onNext} />
      <PrimaryButton label="Mai încearcă o dată" tone="ghost" onPress={onRetry} />
    </View>
  )
}

export function ScorePills({ scores }: { scores: number[] }) {
  if (!scores.length) return null
  return (
    <Card style={{ gap: 8 }}>
      <Text style={{ fontFamily: font, fontSize: 13, fontWeight: '800', color: colors.muted }}>
        RUNDE
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {scores.map((value, index) => (
          <View
            key={index}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: value >= 80 ? '#E8F4ED' : value >= 55 ? '#FFF3E0' : '#FDECEB',
            }}
          >
            <Text
              style={{
                fontFamily: font,
                fontSize: 14,
                fontWeight: '800',
                color: value >= 80 ? colors.green : value >= 55 ? '#A94F00' : '#B3261E',
              }}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  )
}
