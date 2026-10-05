import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Play, Square } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { useGuestStore } from '@/lib/guest/store'
import { curriculumLanguage, pick } from '@/lib/rhythm/curriculum/localized'
import { runToEnd } from '@/lib/guitar/changes-track'
import { wavUri } from '@/lib/guitar/chord-track'
import { BEATS_PER_BAR, fingerPositionAt, type FingerPlan, type StepsPerBeat } from '@/lib/guitar/finger-exercises'
import { GUITAR_VOICE, useGuitarSamples } from '@/lib/guitar/guitar-samples'
import { DIRECTIONS, exerciseCycle, exercisesFor, MIN_BPM, planPattern, SUBDIVISIONS, type Direction } from '@/lib/guitar/patterns'
import { MAX_BPM } from '@/lib/guitar/changes'
import { scalePositions, toTabNote, type PositionNote } from '@/lib/guitar/positions'
import { progressKey, recommendNext, type PatternContext, type Recommendation } from '@/lib/guitar/scale-progress'
import { patternTrackKey, renderPatternTrackSteps } from '@/lib/guitar/scale-track'
import { keyLabel, keysFor, noteLetter, noteSetLetters, noteSetTitle, scaleSets, type NoteSet } from '@/lib/guitar/scales'
import { useBackgroundTrack } from '@/lib/guitar/use-background-track'
import { usePracticeTrack } from '@/lib/guitar/use-practice-track'
import { Fretboard, noteId } from '../Fretboard'
import { BackButton, SessionBar, StartBar, TempoControl, ToggleRow } from '../practice-controls'
import { SnapSlider } from '../SnapSlider'
import { TabRow } from '../TabStaff'

/*
  Însoțitorul pentru game (și, cu aceeași mecanică, pentru arpegii).

  Drumul: gama -> tonalitatea -> poziția -> exercițiul -> tempo -> Exersează.
  Totul pe un singur ecran de setări, cu griful mereu la vedere; „Ascultă"
  cântă gama o dată, sus și jos, fără să schimbe ecranul. „Exersează" deschide
  ecranul exercițiului: griful sus, cu nota de cântat aprinsă, timpii măsurii,
  tabulatura rândului curent și a celui următor.

  Fără scor: aplicația nu aude chitara. Ce ține e ce poate ști: că ai pornit și
  că ai dus sesiunea până la capăt, la ce tempo. Din asta recomandă pasul
  următor (`scale-progress.ts`), fără să blocheze nimic.
*/

const ACCENT = '#008C88'
const SOFT = '#E3F3F2'

/** Câte note pe rândul de tabulatură: două măsuri la pătrimi, una la optimi, doi timpi mai sus. */
/** Cât loc rămâne deasupra rândului curent când tabulatura se derulează singură. */
const TAB_SCROLL_MARGIN = 8

const notesPerRow = (subdivision: StepsPerBeat) => (subdivision <= 2 ? 8 : 2 * subdivision)

export function ScalePracticeScreen({
  sets = scaleSets,
  mirrored = false,
  onExit,
}: {
  sets?: readonly NoteSet[]
  mirrored?: boolean
  onExit: () => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width, 680) - 40

  // Alegerea: gama, tonalitatea, poziția, exercițiul.
  const [setId, setSetId] = useState(sets[0]!.id)
  const [root, setRoot] = useState(9)
  const [positionIndex, setPositionIndex] = useState(0)
  const set = sets.find((candidate) => candidate.id === setId) ?? sets[0]!
  const exercises = useMemo(() => exercisesFor(set.family), [set.family])
  const [exerciseId, setExerciseId] = useState(exercises[0]!.id)
  const exercise = exercises.find((candidate) => candidate.id === exerciseId) ?? exercises[0]!

  // Setările sesiunii.
  const [bpm, setBpm] = useState(exercise.defaultBpm)
  /** Crește când tempoul se schimbă din afara controlului (alt exercițiu, o recomandare), ca acesta să-l afișeze. */
  const [tempoEpoch, setTempoEpoch] = useState(0)
  const [subdivision, setSubdivision] = useState<StepsPerBeat>(exercise.defaultSubdivision)
  const [direction, setDirection] = useState<Direction>('upDown')
  const [metronome, setMetronome] = useState(true)
  const [demo, setDemo] = useState(true)
  const [labels, setLabels] = useState<'degree' | 'note'>('degree')
  const [view, setView] = useState<'setup' | 'session'>('setup')

  const positions = useMemo(() => scalePositions(set, root), [set, root])
  const position = positions[Math.min(positionIndex, positions.length - 1)]!
  const context: PatternContext = { setId: set.id, root, position: position.number, exerciseId: exercise.id }

  const progress = useGuestStore((state) => state.guitarPatternProgress)
  const startGuitarPattern = useGuestStore((state) => state.startGuitarPattern)
  const completeGuitarPattern = useGuestStore((state) => state.completeGuitarPattern)
  const progressOf = (target: PatternContext) => progress.exercises[progressKey(target)]

  const bank = useGuitarSamples()
  const voice = bank ? GUITAR_VOICE : 'synth'
  const session = usePracticeTrack()
  const preview = usePracticeTrack()

  /*
    Planurile se calculează o dată pe setări, nu la fiecare notă: griful și
    rândurile de tabulatură compară notele, iar un plan nou la fiecare pas le-ar
    redesena pe toate.
  */
  const plan = useMemo(
    () => planPattern(exerciseCycle(position.notes, exercise.cell, direction).map(toTabNote), bpm, subdivision),
    [position, exercise, direction, bpm, subdivision],
  )
  // „Ascultă": gama simplă, o dată sus și jos, o notă pe timp.
  const previewPlan = useMemo(
    () => planPattern(exerciseCycle(position.notes, [0], 'upDown').map(toTabNote), bpm, 1, 1),
    [position, bpm],
  )
  const options = { metronome, demo }
  const previewOptions = { metronome, demo: true }
  const trackId = { setId: set.id, root, position: position.number, direction }
  const trackKey = patternTrackKey({ ...trackId, exerciseId: exercise.id }, plan, options, voice)
  const previewKey = patternTrackKey({ ...trackId, exerciseId: 'preview', direction: 'upDown' }, previewPlan, previewOptions, voice)
  const busy = session.phase === 'playing' || preview.phase === 'playing'
  useBackgroundTrack(trackKey, () => renderPatternTrackSteps(plan, options, bank), 'pattern', busy)
  useBackgroundTrack(previewKey, () => renderPatternTrackSteps(previewPlan, previewOptions, bank), 'pattern-preview', busy)

  const startSession = () => {
    preview.stop()
    session.start(() => ({
      uri: wavUri(trackKey, () => runToEnd(renderPatternTrackSteps(plan, options, bank)), 'pattern'),
      unitMs: plan.stepMs,
      durationMs: plan.durationMs,
    }))
    startGuitarPattern(progressKey(context), plan.bpm)
  }
  const togglePreview = () => {
    if (preview.phase === 'playing') {
      preview.stop()
      return
    }
    preview.start(() => ({
      uri: wavUri(previewKey, () => runToEnd(renderPatternTrackSteps(previewPlan, previewOptions, bank)), 'pattern-preview'),
      unitMs: previewPlan.stepMs,
      durationMs: previewPlan.durationMs,
    }))
  }

  // Sesiunea dusă până la capăt se trece în progres, o singură dată.
  const recorded = useRef(false)
  const completedKey = progressKey(context)
  useEffect(() => {
    if (session.phase === 'playing') recorded.current = false
    if (session.phase === 'done' && !recorded.current) {
      recorded.current = true
      completeGuitarPattern(completedKey, plan.bpm)
    }
  }, [session.phase, completeGuitarPattern, completedKey, plan.bpm])

  // Orice schimbare de alegere oprește ce sună: pista veche nu mai e ce se vede.
  const stopAll = () => {
    session.stop()
    preview.stop()
  }
  const chooseSet = (id: string) => {
    stopAll()
    setSetId(id)
    setPositionIndex(0)
  }
  const chooseKey = (value: string) => {
    stopAll()
    setRoot(Number(value))
  }
  const choosePosition = (delta: number) => {
    stopAll()
    setPositionIndex((current) => (Math.min(current, positions.length - 1) + delta + positions.length) % positions.length)
  }
  const applyTempo = (value: number) => {
    setBpm(value)
    setTempoEpoch((epoch) => epoch + 1)
  }
  const chooseExercise = (id: string) => {
    const next = exercises.find((candidate) => candidate.id === id)!
    stopAll()
    setExerciseId(id)
    setSubdivision(next.defaultSubdivision)
    applyTempo(progressOf({ ...context, exerciseId: id })?.lastSession.bpm ?? next.defaultBpm)
  }
  const applyRecommendation = (recommendation: Recommendation) => {
    stopAll()
    if (recommendation.kind === 'tempo') applyTempo(recommendation.bpm)
    if (recommendation.kind === 'position') setPositionIndex(recommendation.position - 1)
    if (recommendation.kind === 'exercise') chooseExercise(recommendation.exercise.id)
    setView('setup')
  }

  const label = useCallback(
    (note: PositionNote) => (labels === 'degree' ? note.degree : noteLetter(set, root, note.pitch)),
    [labels, set, root],
  )
  const title = noteSetTitle(set, root, language)
  const positionLabel =
    positions.length > 1
      ? `${t('guitar.scalePosition', { number: position.number })} · ${t('guitar.scaleFrets', { from: position.minFret, to: position.maxFret })}`
      : `${t('guitar.scaleOnePosition')} · ${t('guitar.scaleFrets', { from: position.minFret, to: position.maxFret })}`

  if (view === 'session') {
    return (
      <PatternSession
        plan={plan}
        phase={session.phase}
        unit={session.unit}
        title={`${title} · ${t('guitar.scalePosition', { number: position.number })}`}
        subtitle={`${pick(exercise.title, language)} · ${plan.bpm} BPM · ${t(`guitar.notesPerBeat_${subdivision}`)} · ${t(`guitar.direction_${direction}`)}`}
        notes={position.notes}
        minFret={position.minFret}
        maxFret={position.maxFret}
        width={contentWidth}
        mirrored={mirrored}
        label={label}
        recommendation={
          session.phase === 'done'
            ? recommendNext(context, plan.bpm, exercise, exercises, positions.length, progressOf)
            : null
        }
        best={progressOf(context)?.bestBpm ?? 0}
        onStop={session.stop}
        onAgain={startSession}
        onSettings={() => {
          session.stop()
          setView('setup')
        }}
        onRecommendation={applyRecommendation}
      />
    )
  }

  const previewAt =
    preview.phase === 'playing' && preview.unit >= 0
      ? fingerPositionAt(previewPlan, Math.min(preview.unit, previewPlan.totalSteps - 1))
      : null
  const previewNote = previewAt && previewAt.noteIndex >= 0 ? previewPlan.notes[previewAt.noteIndex] : null

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
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>{t('guitar.scalesTitle')}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.scalesIntro')}</Text>
        </View>

        <View style={{ gap: 10 }}>
          <SnapSlider
            label={t('guitar.scaleType')}
            options={sets.map((candidate) => ({ value: candidate.id, label: pick(candidate.name, language) }))}
            value={set.id}
            onChange={chooseSet}
            itemWidth={176}
            accent={ACCENT}
          />
          <SnapSlider
            label={t('guitar.scaleKey')}
            options={keysFor(set).map((key) => ({ value: String(key.pc), label: keyLabel(key) }))}
            value={String(root)}
            onChange={chooseKey}
            itemWidth={58}
            accent={ACCENT}
          />
        </View>

        {/* Gama aleasă: numele, notele, poziția și griful. */}
        <View style={{ gap: 12, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 20, backgroundColor: SOFT }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: publicColors.ink }}>{title}</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: publicColors.muted, letterSpacing: 0.5 }}>
              {noteSetLetters(set, root).join(' – ')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {positions.length > 1 ? (
              <ArrowButton label={t('guitar.previousPosition')} onPress={() => choosePosition(-1)}>
                <ChevronLeft size={20} color={publicColors.ink} />
              </ArrowButton>
            ) : null}
            <Text style={{ flexShrink: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', color: publicColors.ink }}>
              {positionLabel}
            </Text>
            {positions.length > 1 ? (
              <ArrowButton label={t('guitar.nextPosition')} onPress={() => choosePosition(1)}>
                <ChevronRight size={20} color={publicColors.ink} />
              </ArrowButton>
            ) : null}
          </View>
          <Fretboard
            notes={position.notes}
            minFret={position.minFret}
            maxFret={position.maxFret}
            width={contentWidth - 20}
            accent={ACCENT}
            mirrored={mirrored}
            active={previewNote ? noteId(previewNote) : null}
            label={label}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 4 }}>
            <Text style={{ flex: 1, fontSize: 12, lineHeight: 17, color: publicColors.muted }}>
              {t('guitar.rootLegend', { note: noteLetter(set, root, root) })}
            </Text>
            <Chips
              options={[
                { value: 'degree', label: t('guitar.labelsDegrees') },
                { value: 'note', label: t('guitar.labelsNotes') },
              ]}
              value={labels}
              onChange={setLabels}
              small
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={togglePreview}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 46,
              borderRadius: 23,
              borderWidth: 1.5,
              borderColor: ACCENT,
              backgroundColor: pressed ? '#FFFFFF' : 'transparent',
            })}
          >
            {preview.phase === 'playing' ? <Square size={14} color={ACCENT} fill={ACCENT} /> : <Play size={16} color={ACCENT} fill={ACCENT} />}
            <Text style={{ fontSize: 15, fontWeight: '800', color: ACCENT }}>
              {preview.phase === 'playing' ? t('guitar.stop') : t('guitar.listen')}
            </Text>
          </Pressable>
          <Text style={{ fontSize: 12, color: publicColors.muted, textAlign: 'center' }}>{t('guitar.scaleListenHint')}</Text>
        </View>

        {/* Exercițiile, pe niveluri, cu progresul fiecăruia în poziția asta. */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>{t('guitar.exercise')}</Text>
          {exercises.map((candidate) => {
            const chosen = candidate.id === exercise.id
            const record = progressOf({ ...context, exerciseId: candidate.id })
            return (
              <Pressable
                key={candidate.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: chosen }}
                onPress={() => chooseExercise(candidate.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  borderWidth: chosen ? 2 : 1,
                  borderColor: chosen ? ACCENT : publicColors.border,
                  backgroundColor: chosen || pressed ? SOFT : publicColors.card,
                })}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: chosen ? ACCENT : '#F1F3F4',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '900', color: chosen ? '#FFFFFF' : publicColors.muted }}>
                    {candidate.level}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>{pick(candidate.title, language)}</Text>
                  <Text style={{ fontSize: 12, color: publicColors.muted }}>
                    {record
                      ? `${record.bestBpm > 0 ? `${t('guitar.bestBpm', { bpm: record.bestBpm })} · ` : ''}${t('guitar.completions', { done: record.completions, tries: record.attempts })}`
                      : t('guitar.notTried')}
                  </Text>
                </View>
              </Pressable>
            )
          })}
          {progressOf(context) ? (
            <Text style={{ fontSize: 12, color: publicColors.muted }}>
              {t('guitar.lastPractice', {
                date: new Date(progressOf(context)!.lastPracticedAt).toLocaleDateString(i18n.language),
                bpm: progressOf(context)!.lastSession.bpm,
              })}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 14, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: publicColors.border }}>
          <TempoControl
            key={`${exercise.id}:${tempoEpoch}`}
            label={t('guitar.tempo')}
            value={bpm}
            min={MIN_BPM}
            max={MAX_BPM}
            disabled={false}
            onCommit={setBpm}
          />
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{t('guitar.subdivision')}</Text>
            <Chips
              options={SUBDIVISIONS.map((choice) => ({ value: choice, label: t(`guitar.notesPerBeat_${choice}`) }))}
              value={subdivision}
              onChange={setSubdivision}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{t('guitar.direction')}</Text>
            <Chips
              options={DIRECTIONS.map((choice) => ({ value: choice, label: t(`guitar.direction_${choice}`) }))}
              value={direction}
              onChange={setDirection}
            />
          </View>
          <ToggleRow label={t('guitar.metronome')} value={metronome} disabled={false} onChange={setMetronome} />
          <ToggleRow label={t('guitar.fingerDemo')} value={demo} disabled={false} onChange={setDemo} />
        </View>
      </ScrollView>
      <StartBar
        label={t('guitar.practice')}
        onPress={() => {
          setView('session')
          startSession()
        }}
      />
    </SafeAreaView>
  )
}

function PatternSession({
  plan,
  phase,
  unit,
  title,
  subtitle,
  notes,
  minFret,
  maxFret,
  width,
  mirrored,
  label,
  recommendation,
  best,
  onStop,
  onAgain,
  onSettings,
  onRecommendation,
}: {
  plan: FingerPlan
  phase: 'idle' | 'playing' | 'done'
  unit: number
  title: string
  subtitle: string
  notes: readonly PositionNote[]
  minFret: number
  maxFret: number
  width: number
  mirrored: boolean
  label: (note: PositionNote) => string
  recommendation: Recommendation | null
  best: number
  onStop: () => void
  onAgain: () => void
  onSettings: () => void
  onRecommendation: (recommendation: Recommendation) => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  const playing = phase === 'playing'
  const at = playing && unit >= 0 ? fingerPositionAt(plan, Math.min(unit, plan.totalSteps - 1)) : null
  // Pe o pauză (completarea măsurii), rămâne aprinsă ultima notă cântată.
  let index = at ? at.noteIndex : -1
  while (index > 0 && plan.notes[index] === null) index -= 1
  const current = index >= 0 ? plan.notes[index] : null
  const beat = playing && unit >= 0 ? Math.floor(unit / plan.stepsPerBeat) % BEATS_PER_BAR : -1
  const round = at && !at.countIn ? Math.floor((unit - plan.countInSteps) / plan.notes.length) + 1 : null

  const perRow = notesPerRow(plan.stepsPerBeat)
  const rowNotes = useMemo(() => {
    const out = []
    for (let start = 0; start < plan.notes.length; start += perRow) out.push(plan.notes.slice(start, start + perRow))
    return out
  }, [plan, perRow])
  const row = at && at.noteIndex >= 0 ? Math.floor(at.noteIndex / perRow) : 0
  const currentNote = current ? notes.find((note) => note.string === current.string && note.fret === current.fret) : undefined

  const recommendationText = (() => {
    if (!recommendation) return null
    if (recommendation.kind === 'tempo') return t('guitar.recommendTempo', { bpm: recommendation.bpm })
    if (recommendation.kind === 'position') return t('guitar.recommendPosition', { number: recommendation.position })
    if (recommendation.kind === 'exercise') return t('guitar.recommendExercise', { name: pick(recommendation.exercise.title, language) })
    return t('guitar.recommendNone')
  })()

  /*
    Derularea automată, ca la exercițiile pentru degete: când nota aprinsă trece
    pe rândul următor, tabulatura urcă până îl aduce sus. Griful nu se
    derulează: stă fixat deasupra, ca gama să rămână mereu la vedere. Pozițiile
    rândurilor se măsoară la așezare (`onLayout`): înălțimea depinde de ecran.
  */
  const scroll = useRef<ScrollView>(null)
  const rowTops = useRef<number[]>([])
  const tabTop = useRef(0)
  useEffect(() => {
    if (phase === 'done') {
      scroll.current?.scrollTo({ y: 0, animated: true })
      return
    }
    if (!playing) return
    const y = tabTop.current + (rowTops.current[row] ?? 0) - TAB_SCROLL_MARGIN
    scroll.current?.scrollTo({ y: Math.max(0, y), animated: true })
  }, [row, playing, phase])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
      <SessionBar playing={playing} title={title} subtitle={subtitle} onStop={onStop} onAgain={onAgain} onSettings={onSettings} />
      {/* Partea fixă: timpii, nota de cântat și griful. */}
      <View
        style={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 10,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: publicColors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 40 }}>
          {/* Timpii măsurii: „unu" mai mare; în numărătoare, portocaliu. */}
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {Array.from({ length: BEATS_PER_BAR }, (_, dot) => (
                <View
                  key={dot}
                  style={{
                    width: dot === 0 ? 20 : 16,
                    height: dot === 0 ? 20 : 16,
                    borderRadius: 10,
                    backgroundColor: dot === beat ? (at?.countIn ? publicColors.orange : ACCENT) : '#E4E7EA',
                  }}
                />
              ))}
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: publicColors.muted }}>
              {round
                ? `${t('guitar.cycleProgress', { current: Math.min(round, plan.repeats), total: plan.repeats })} · ${t('guitar.tabRow', { current: row + 1, total: rowNotes.length })}`
                : ' '}
            </Text>
          </View>
          {at?.countIn ? (
            <Text style={{ fontSize: 17, fontWeight: '900', color: publicColors.orange }}>
              {t('guitar.getReady')} · {at.countIn}
            </Text>
          ) : currentNote ? (
            <Text style={{ fontSize: 26, fontWeight: '900', color: publicColors.ink }}>
              {label(currentNote)}
              <Text style={{ fontSize: 13, fontWeight: '700', color: publicColors.muted }}>
                {`  ${t('guitar.stringFret', { string: currentNote.string, fret: currentNote.fret })}`}
              </Text>
            </Text>
          ) : null}
        </View>
        <View style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 20, backgroundColor: SOFT }}>
          <Fretboard
            notes={notes}
            minFret={minFret}
            maxFret={maxFret}
            width={width - 20}
            accent={ACCENT}
            mirrored={mirrored}
            active={current ? noteId(current) : null}
            label={label}
          />
        </View>
      </View>

      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 48,
          gap: 14,
        }}
      >
        {phase === 'done' ? (
          <View style={{ gap: 10, padding: 16, borderRadius: 16, backgroundColor: '#EAF6EF' }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: publicColors.green, textAlign: 'center' }}>
              {t('guitar.patternDone', { bpm: plan.bpm })}
            </Text>
            {best > 0 ? (
              <Text style={{ fontSize: 13, color: publicColors.muted, textAlign: 'center' }}>{t('guitar.bestBpm', { bpm: best })}</Text>
            ) : null}
            {recommendationText ? (
              <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink, textAlign: 'center' }}>{recommendationText}</Text>
            ) : null}
            {recommendation && recommendation.kind !== 'none' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onRecommendation(recommendation)}
                style={({ pressed }) => ({
                  alignSelf: 'center',
                  paddingHorizontal: 18,
                  height: 42,
                  justifyContent: 'center',
                  borderRadius: 21,
                  backgroundColor: pressed ? '#0B6F6C' : ACCENT,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>{t('guitar.recommendApply')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Toată tabulatura exercițiului, pe rânduri; rândul curent e plin, celelalte estompate. */}
        <View
          onLayout={(event) => {
            tabTop.current = event.nativeEvent.layout.y
          }}
          style={{ gap: 4, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 20, borderWidth: 1, borderColor: publicColors.border }}
        >
          {/* Nota aprinsă se dă doar rândului ei, ca restul să nu se redeseneze. */}
          {rowNotes.map((items, shown) => (
            <View
              key={shown}
              onLayout={(event) => {
                rowTops.current[shown] = event.nativeEvent.layout.y
              }}
              style={{ opacity: playing && shown !== row ? 0.5 : 1 }}
            >
              <TabRow
                notes={items}
                slots={perRow}
                firstIndex={shown * perRow}
                stepsPerBeat={plan.stepsPerBeat}
                active={shown === row && at ? at.noteIndex : -1}
                width={width - 16}
                accent={ACCENT}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function ArrowButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: publicColors.border,
        backgroundColor: pressed ? '#FFFFFF' : 'transparent',
      })}
    >
      {children}
    </Pressable>
  )
}

function Chips<T extends string | number>({
  options,
  value,
  onChange,
  small = false,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  small?: boolean
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: small ? 6 : 8 }}>
      {options.map((option) => {
        const chosen = option.value === value
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: chosen }}
            onPress={() => onChange(option.value)}
            style={{
              paddingHorizontal: small ? 10 : 14,
              height: small ? 30 : 38,
              justifyContent: 'center',
              borderRadius: small ? 15 : 19,
              borderWidth: 1.5,
              borderColor: chosen ? ACCENT : publicColors.border,
              backgroundColor: chosen ? ACCENT : 'transparent',
            }}
          >
            <Text style={{ fontSize: small ? 12 : 14, fontWeight: '700', color: chosen ? '#FFFFFF' : publicColors.ink }}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
