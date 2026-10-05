import { memo, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { curriculumLanguage, pick } from '@/lib/rhythm/curriculum/localized'
import { hasWav, storeWav, wavUri } from '@/lib/guitar/chord-track'
import { runToEnd } from '@/lib/guitar/changes-track'
import { displaySymbol } from '@/lib/guitar/chords'
import { runInSlices, type SlicedJob } from '@/lib/guitar/slices'
import { renderStrumTrackSteps, strumTrackKey } from '@/lib/guitar/strum-track'
import {
  BEATS_PER_BAR,
  countLabel,
  handDirection,
  planStrum,
  strumLevels,
  strumPositionAt,
  STRUM_PROGRESSIONS,
  type StepsPerBeat,
  type StrumExercise,
  type StrumLevel,
  type StrumStep,
} from '@/lib/guitar/strums'
import { useGuitarSamples } from '@/lib/guitar/guitar-samples'
import { usePracticeTrack } from '@/lib/guitar/use-practice-track'
import { encodeGuitarWavSteps } from '@/lib/guitar/wav'
import { ChordDiagram } from '../ChordDiagram'
import { BackButton, SessionBar, StartBar, TempoControl, ToggleRow } from '../practice-controls'

/*
  Însoțitorul de strumming.

  Lista: nivelurile, cu modelul scris direct pe rând (↓ · ↓↑ · ↑↓↑), totul
  deschis. Practica: grila modelului, cu pasul curent aprins și numărătoarea
  sub fiecare pas; acordul de acum și cel care urmează, dacă se cântă pe
  acorduri; setările.

  Pe grilă, loviturile ratate apar ca săgeți gri: mâna trece și pe acolo, doar
  că pe lângă corzi. E tot rostul modelului și nu trebuie să dispară din desen.

  Fără scor: aplicația nu aude chitara (skill-ul `predare-chitara`).
*/

export function StrumPracticeScreen({
  levels = strumLevels,
  mirrored = false,
  onExit,
}: {
  levels?: StrumLevel[]
  mirrored?: boolean
  onExit: () => void
}) {
  const [selected, setSelected] = useState<{ exercise: StrumExercise; level: StrumLevel } | null>(null)
  if (selected) {
    return (
      <StrumPractice
        key={selected.exercise.id}
        exercise={selected.exercise}
        level={selected.level}
        mirrored={mirrored}
        onExit={() => setSelected(null)}
      />
    )
  }
  return <StrumList levels={levels} onOpen={(exercise, level) => setSelected({ exercise, level })} onExit={onExit} />
}

/** Modelul ca text, pe timpi: „↓· ↓↑ ·↑ ↓↑". */
function patternText(exercise: StrumExercise): string {
  const glyph: Record<StrumStep, string> = { D: '↓', U: '↑', A: '↓', B: '↑', x: '✕', '.': '·', '-': '–' }
  const beats: string[] = []
  for (let step = 0; step < exercise.pattern.length; step += exercise.stepsPerBeat) {
    beats.push(
      [...exercise.pattern.slice(step, step + exercise.stepsPerBeat)].map((char) => glyph[char as StrumStep]).join(''),
    )
  }
  return beats.join(' ')
}

function StrumList({
  levels,
  onOpen,
  onExit,
}: {
  levels: StrumLevel[]
  onOpen: (exercise: StrumExercise, level: StrumLevel) => void
  onExit: () => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 48,
          gap: 18,
        }}
      >
        <BackButton onPress={onExit} />
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>{t('guitar.strumTitle')}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.strumIntro')}</Text>
        </View>
        {levels.map((level, index) => (
          <View key={level.id} style={{ gap: 8 }}>
            <Text
              style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', color: level.accent }}
            >
              {t('guitar.level', { number: index + 1 })} · {pick(level.title, language)}
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: publicColors.muted }}>{pick(level.summary, language)}</Text>
            {level.exercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                accessibilityRole="button"
                onPress={() => onOpen(exercise, level)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: publicColors.border,
                  backgroundColor: pressed ? level.soft : publicColors.card,
                })}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: publicColors.ink }}>
                    {pick(exercise.title, language)}
                  </Text>
                  <Text style={{ fontSize: 16, letterSpacing: 1, color: level.accent, fontWeight: '700' }}>
                    {patternText(exercise)}
                  </Text>
                  <Text style={{ fontSize: 13, color: publicColors.muted }}>
                    {t(`guitar.stepsPerBeat_${exercise.stepsPerBeat}`)} · {exercise.tempo.suggested} BPM
                  </Text>
                </View>
                <ChevronRight size={20} color={publicColors.muted} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

function StrumPractice({
  exercise,
  level,
  mirrored,
  onExit,
}: {
  exercise: StrumExercise
  level: StrumLevel
  mirrored: boolean
  onExit: () => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  const { width } = useWindowDimensions()
  const [bpm, setBpm] = useState(exercise.tempo.suggested)
  const [metronome, setMetronome] = useState(true)
  const [demo, setDemo] = useState(true)
  const [progressionId, setProgressionId] = useState(exercise.progression)
  const session = usePracticeTrack()
  // Mostrele de chitară (nylon): se încarcă la intrare; până atunci, sinteza.
  const bank = useGuitarSamples()

  const plan = planStrum(exercise, bpm, progressionId)
  const playing = session.phase === 'playing'
  const position = playing && session.unit >= 0 ? strumPositionAt(plan, Math.min(session.unit, plan.totalSteps - 1)) : null
  const withChords = plan.chords.length > 0
  const chordIndex = position && position.chordIndex >= 0 ? position.chordIndex : 0
  const current = withChords ? plan.chords[chordIndex]! : null
  const next = withChords ? plan.chords[(chordIndex + 1) % plan.chords.length]! : null
  const barsPlayed = plan.repeats * (plan.pattern.length / (exercise.stepsPerBeat * BEATS_PER_BAR))

  const options = { metronome, demo, bank }
  const trackKey = strumTrackKey(exercise.id, progressionId, plan, options)
  const prepareTrack = () => ({
    uri: wavUri(trackKey, () => runToEnd(renderStrumTrackSteps(plan, options)), 'strum'),
    unitMs: plan.stepMs,
    durationMs: plan.durationMs,
  })
  const start = () => session.start(prepareTrack)

  /*
    Pista se pregătește în fundal, pe felii, după o pauză în reglaj, și se
    anulează la orice schimbare: la fel ca la schimbările de acorduri, ca
    butoanele de tempo să rămână ușoare și „Pornește" să nu aștepte.
  */
  const pending = useRef({ plan, options })
  useEffect(() => {
    pending.current = { plan, options }
  })
  useEffect(() => {
    if (playing || hasWav(trackKey)) return
    let job: SlicedJob<Uint8Array> | null = null
    const timer = setTimeout(() => {
      const { plan: target, options: settings } = pending.current
      job = runInSlices(
        (function* () {
          const samples = yield* renderStrumTrackSteps(target, settings)
          return yield* encodeGuitarWavSteps(samples)
        })(),
      )
      job.promise
        .then((wav) => {
          if (wav) storeWav(trackKey, wav, 'strum')
        })
        .catch(() => {
          // Se randează la pornire.
        })
    }, 900)
    return () => {
      clearTimeout(timer)
      job?.cancel()
    }
  }, [trackKey, playing])

  const contentWidth = Math.min(width, 680) - 40
  const diagram = Math.min(130, Math.round(contentWidth * 0.34))
  const smallDiagram = Math.min(90, Math.round(contentWidth * 0.24))

  /*
    Două ecrane, ca la tobe: setările, apoi exercițiul. „Pornește" deschide
    ecranul exercițiului și pornește sunetul în aceeași atingere.
  */
  const [view, setView] = useState<'setup' | 'session'>('setup')
  const begin = () => {
    setView('session')
    start()
  }
  const toSettings = () => {
    session.stop()
    setView('setup')
  }

  const grid = (live: boolean) => (
    <View style={{ padding: 14, borderRadius: 24, backgroundColor: level.soft, gap: 10 }}>
      {live ? (
        <View style={{ height: 24, alignItems: 'center', justifyContent: 'center' }}>
          {position?.countIn ? (
            <Text style={{ fontSize: 18, fontWeight: '900', color: level.accent }}>
              {t('guitar.getReady')} · {position.countIn}
            </Text>
          ) : position ? (
            <Text style={{ fontSize: 13, fontWeight: '700', color: publicColors.muted }}>
              {t('guitar.barCount', { count: position.bar + 1 })}
            </Text>
          ) : null}
        </View>
      ) : null}
      <PatternGrid
        pattern={exercise.pattern}
        stepsPerBeat={exercise.stepsPerBeat}
        active={live && position ? position.patternStep : -1}
        accent={level.accent}
        width={contentWidth - 28}
      />
      <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted, textAlign: 'center' }}>
        {t('guitar.strumLegend')}
      </Text>
    </View>
  )

  const chords =
    current && next ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 34, fontWeight: '900', color: publicColors.ink }}>{displaySymbol(current.symbol)}</Text>
          <ChordDiagram shape={current} width={diagram} mirrored={mirrored} accent={level.accent} />
        </View>
        {plan.chords.length > 1 ? (
          <View style={{ alignItems: 'center', opacity: 0.75 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: publicColors.muted, textTransform: 'uppercase' }}>
              {t('guitar.next')}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: publicColors.ink }}>{displaySymbol(next.symbol)}</Text>
            <ChordDiagram shape={next} width={smallDiagram} mirrored={mirrored} accent={level.accent} />
          </View>
        ) : null}
      </View>
    ) : (
      <Text style={{ fontSize: 14, lineHeight: 20, color: publicColors.muted, textAlign: 'center' }}>
        {t('guitar.muteHint')}
      </Text>
    )

  if (view === 'session') {
    const progressionLabel = pick(STRUM_PROGRESSIONS.find((item) => item.id === progressionId)!.label, language)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
        <SessionBar
          playing={playing}
          title={pick(exercise.title, language)}
          subtitle={`${bpm} BPM · ${progressionLabel}`}
          onStop={session.stop}
          onAgain={start}
          onSettings={toSettings}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: '100%',
            maxWidth: 680,
            alignSelf: 'center',
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 48,
            gap: 18,
          }}
        >
          {session.phase === 'done' ? (
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: '#EAF6EF' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.green, textAlign: 'center' }}>
                {t('guitar.strumDone', { count: barsPlayed, bpm })}
              </Text>
            </View>
          ) : null}
          {grid(true)}
          {chords}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <BackButton onPress={onExit} />
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', color: level.accent }}>
            {pick(level.title, language)} · {t(`guitar.stepsPerBeat_${exercise.stepsPerBeat}`)}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: publicColors.ink }}>{pick(exercise.title, language)}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{pick(exercise.tip, language)}</Text>
        </View>

        {grid(false)}

        <View style={{ gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: publicColors.border }}>
          <TempoControl
            label={t('guitar.tempo')}
            value={bpm}
            min={exercise.tempo.min}
            max={exercise.tempo.max}
            disabled={false}
            onCommit={setBpm}
          />
          <ToggleRow label={t('guitar.metronome')} value={metronome} disabled={false} onChange={setMetronome} />
          <ToggleRow label={t('guitar.demo')} value={demo} disabled={false} onChange={setDemo} />
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{t('guitar.playOn')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {STRUM_PROGRESSIONS.map((progression) => {
                const chosen = progression.id === progressionId
                return (
                  <Pressable
                    key={progression.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: chosen }}
                    onPress={() => setProgressionId(progression.id)}
                    style={{
                      paddingHorizontal: 12,
                      height: 38,
                      justifyContent: 'center',
                      borderRadius: 19,
                      borderWidth: 1.5,
                      borderColor: chosen ? level.accent : publicColors.border,
                      backgroundColor: chosen ? level.accent : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: chosen ? '#FFFFFF' : publicColors.ink }}>
                      {pick(progression.label, language)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </View>
        {chords}
      </ScrollView>
      <StartBar label={t('guitar.start')} onPress={begin} />
    </SafeAreaView>
  )
}

/**
 * Grila: un rând pe măsură la optimi, două la șaisprezecimi și triolete, ca
 * pașii să rămână destul de lați pe telefon. Pașii unui timp stau grupați.
 */
const PatternGrid = memo(function PatternGrid({
  pattern,
  stepsPerBeat,
  active,
  accent,
  width,
}: {
  pattern: string
  stepsPerBeat: StepsPerBeat
  active: number
  accent: string
  width: number
}) {
  const beatsPerRow = stepsPerBeat === 2 ? 4 : 2
  const stepsPerRow = beatsPerRow * stepsPerBeat
  const gap = 8
  const cell = Math.floor((width - gap * (beatsPerRow - 1)) / stepsPerRow)
  const rows: number[][] = []
  for (let start = 0; start < pattern.length; start += stepsPerRow) {
    rows.push(Array.from({ length: Math.min(stepsPerRow, pattern.length - start) }, (_, offset) => start + offset))
  }

  return (
    <View style={{ gap: 10, alignItems: 'center' }}>
      {rows.map((row) => (
        <View key={row[0]} style={{ flexDirection: 'row', gap }}>
          {Array.from({ length: beatsPerRow }, (_, beat) => (
            <View key={beat} style={{ flexDirection: 'row' }}>
              {row.slice(beat * stepsPerBeat, (beat + 1) * stepsPerBeat).map((step) => (
                <StepCell
                  key={step}
                  char={pattern[step] as StrumStep}
                  direction={handDirection(step, stepsPerBeat)}
                  label={countLabel(step, stepsPerBeat)}
                  active={step === active}
                  accent={accent}
                  width={cell}
                />
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
})

function StepCell({
  char,
  direction,
  label,
  active,
  accent,
  width,
}: {
  char: StrumStep
  direction: 'down' | 'up' | 'none'
  label: string
  active: boolean
  accent: string
  width: number
}) {
  const stroke = char === 'D' || char === 'U' || char === 'A' || char === 'B'
  const accented = char === 'A' || char === 'B'
  const glyph =
    char === 'x'
      ? '✕'
      : char === '-'
        ? '–'
        : direction === 'none'
          ? '·'
          : direction === 'down'
            ? '↓'
            : '↑'
  const color = active ? '#FFFFFF' : stroke || char === 'x' ? (accented ? accent : publicColors.ink) : '#B7BDC2'
  return (
    <View
      style={{
        width,
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: active ? accent : 'transparent',
      }}
    >
      <Text style={{ fontSize: accented ? 26 : 22, fontWeight: accented ? '900' : stroke ? '700' : '400', color }}>
        {glyph}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: label.length === 1 && /\d/.test(label) ? '800' : '500',
          color: active ? '#FFFFFF' : publicColors.muted,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
