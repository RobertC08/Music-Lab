import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { curriculumLanguage, pick } from '@/lib/rhythm/curriculum/localized'
import { runToEnd } from '@/lib/guitar/changes-track'
import { hasWav, storeWav, wavUri } from '@/lib/guitar/chord-track'
import { displaySymbol } from '@/lib/guitar/chords'
import {
  chordOf,
  fingerLevels,
  fingerPositionAt,
  planFinger,
  soundingNotes,
  type FingerExercise,
  type FingerLevel,
  type StepsPerBeat,
} from '@/lib/guitar/finger-exercises'
import { fingerTrackKey, renderFingerTrackSampledSteps, renderFingerTrackSteps } from '@/lib/guitar/finger-track'
import { runInSlices, type SlicedJob } from '@/lib/guitar/slices'
import { GUITAR_VOICE, useGuitarSamples } from '@/lib/guitar/guitar-samples'
import { usePracticeTrack } from '@/lib/guitar/use-practice-track'
import { encodeGuitarWavSteps } from '@/lib/guitar/wav'
import { ChordDiagram } from '../ChordDiagram'
import { BackButton, SessionBar, StartBar, TempoControl, ToggleRow } from '../practice-controls'
import { TabRow } from '../TabStaff'

/*
  Însoțitorul pentru degete: exerciții de tehnică în tabulatură.

  Lista: nivelurile, totul deschis. Practica: toată tabulatura exercițiului, pe
  rânduri, cu nota care sună aprinsă. Rândurile stau pe loc, iar nota aprinsă
  coboară de pe un rând pe următorul, ca la citit; ecranul se derulează singur,
  ca rândul curent să rămână sus, cu următoarele sub el. Setările: tempo,
  poziția (unde pe gât), subdiviziunea, metronomul, demonstrația.

  Fără scor: aplicația nu aude chitara. Ce poate face e să-ți spună ce să
  asculți: fiecare notă clară, toate egale, niciuna peste alta.
*/

export function FingerPracticeScreen({
  levels = fingerLevels,
  mirrored = false,
  onExit,
}: {
  levels?: FingerLevel[]
  mirrored?: boolean
  onExit: () => void
}) {
  const [selected, setSelected] = useState<{ exercise: FingerExercise; level: FingerLevel } | null>(null)
  if (selected) {
    return (
      <FingerPractice
        key={selected.exercise.id}
        exercise={selected.exercise}
        level={selected.level}
        mirrored={mirrored}
        onExit={() => setSelected(null)}
      />
    )
  }
  return <FingerList levels={levels} onOpen={(exercise, level) => setSelected({ exercise, level })} onExit={onExit} />
}

function FingerList({
  levels,
  onOpen,
  onExit,
}: {
  levels: FingerLevel[]
  onOpen: (exercise: FingerExercise, level: FingerLevel) => void
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
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>{t('guitar.fingerTitle')}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.fingerIntro')}</Text>
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
                  <Text style={{ fontSize: 16, fontWeight: '800', color: publicColors.ink }}>{pick(exercise.title, language)}</Text>
                  <Text style={{ fontSize: 13, color: publicColors.muted }}>
                    {t(`guitar.stepsPerBeat_${exercise.subdivisions[0]}`)} · {exercise.tempo.suggested} BPM
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

/** Cât loc rămâne deasupra rândului curent când ecranul se derulează singur. */
const SCROLL_MARGIN = 90

/** Câte note pe rând: doi timpi la șaisprezecimi și triolete, patru la optimi, opt la pătrimi. */
const notesPerRow = (subdivision: StepsPerBeat) => (subdivision === 1 ? 8 : subdivision === 2 ? 8 : 2 * subdivision)

function FingerPractice({
  exercise,
  level,
  mirrored,
  onExit,
}: {
  exercise: FingerExercise
  level: FingerLevel
  mirrored: boolean
  onExit: () => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  const { width } = useWindowDimensions()
  const [bpm, setBpm] = useState(exercise.tempo.suggested)
  const [position, setPosition] = useState(exercise.position?.suggested ?? 0)
  const [subdivision, setSubdivision] = useState<StepsPerBeat>(exercise.subdivisions[0]!)
  const [metronome, setMetronome] = useState(true)
  const [demo, setDemo] = useState(true)
  const session = usePracticeTrack()
  // Mostrele de chitară (nylon): se încarcă la intrare; până atunci, sinteza.
  const bank = useGuitarSamples()

  /*
    Planul și rândurile se calculează o dată pe setări, nu la fiecare notă: cu
    toată tabulatura pe ecran, un plan nou la fiecare notă ar fi redesenat toate
    rândurile de câteva ori pe secundă (memo-ul rândurilor compară notele).
  */
  const plan = useMemo(() => planFinger(exercise, bpm, subdivision, position), [exercise, bpm, subdivision, position])
  const playing = session.phase === 'playing'
  const at = playing && session.unit >= 0 ? fingerPositionAt(plan, Math.min(session.unit, plan.totalSteps - 1)) : null
  const active = at ? at.noteIndex : -1

  const perRow = notesPerRow(subdivision)
  const rowNotes = useMemo(() => {
    const out = []
    for (let start = 0; start < plan.notes.length; start += perRow) out.push(plan.notes.slice(start, start + perRow))
    return out
  }, [plan, perRow])
  const rows = rowNotes.length
  const currentRow = active >= 0 ? Math.floor(active / perRow) : 0

  /*
    Derularea automată: când nota aprinsă trece pe rândul următor, ecranul
    coboară cât să-l aducă sus. Pozițiile rândurilor se măsoară la așezare
    (`onLayout`), nu se calculează: înălțimea unui rând depinde de ecran.
  */
  const scroll = useRef<ScrollView>(null)
  const tabTop = useRef(0)
  const rowTops = useRef<number[]>([])
  useEffect(() => {
    if (!playing) return
    const y = tabTop.current + (rowTops.current[currentRow] ?? 0) - SCROLL_MARGIN
    scroll.current?.scrollTo({ y: Math.max(0, y), animated: true })
  }, [currentRow, playing])

  // Pe o pauză, acordul e cel al ultimei note cântate.
  let currentIndex = active >= 0 ? active : 0
  while (currentIndex > 0 && plan.notes[currentIndex] === null) currentIndex -= 1
  const current = plan.notes[currentIndex] ?? null
  const chord = chordOf(current)
  // Acordul care urmează: prima notă din ciclu (după cea curentă) pe alt acord.
  const nextChord = (() => {
    if (!current?.chord) return undefined
    for (let offset = 1; offset < plan.notes.length; offset += 1) {
      const candidate = plan.notes[(currentIndex + offset) % plan.notes.length]
      if (candidate?.chord && candidate.chord !== current.chord) return chordOf(candidate)
    }
    return undefined
  })()
  const isPicking = !exercise.position

  const options = { metronome, demo }
  const trackKey = fingerTrackKey(exercise.id, position, plan, options, bank ? GUITAR_VOICE : 'synth')
  /** Din mostre (nylon, cu articulații: hammer-on, pull-off, tril), dacă s-au încărcat; altfel sinteză. */
  const renderSteps = (target: typeof plan, settings: typeof options) =>
    bank ? renderFingerTrackSampledSteps(target, bank, { ...settings, seed: 1 }) : renderFingerTrackSteps(target, settings)
  const prepareTrack = () => ({
    uri: wavUri(trackKey, () => runToEnd(renderSteps(plan, options)), 'finger'),
    unitMs: plan.stepMs,
    durationMs: plan.durationMs,
  })
  const start = () => session.start(prepareTrack)

  // Pista se pregătește în fundal, pe felii, după o pauză în reglaj (ca la ceilalți însoțitori).
  const pending = useRef({ plan, options, renderSteps })
  useEffect(() => {
    pending.current = { plan, options, renderSteps }
  })
  useEffect(() => {
    if (playing || hasWav(trackKey)) return
    let job: SlicedJob<Uint8Array> | null = null
    const timer = setTimeout(() => {
      const { plan: target, options: settings, renderSteps: render } = pending.current
      job = runInSlices(
        (function* () {
          const samples = yield* render(target, settings)
          return yield* encodeGuitarWavSteps(samples)
        })(),
      )
      job.promise
        .then((wav) => {
          if (wav) storeWav(trackKey, wav, 'finger')
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
  const totalNotes = plan.repeats * soundingNotes(plan.notes)

  /*
    Două ecrane, ca la tobe: setările, apoi exercițiul. „Pornește" deschide
    ecranul exercițiului și pornește sunetul în aceeași atingere (pe web,
    redarea trebuie să plece chiar din gest).
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

  const tab = (rowsShown: number, live: boolean) => (
    <View
      onLayout={(event) => {
        if (live) tabTop.current = event.nativeEvent.layout.y
      }}
      style={{ paddingVertical: 12, paddingHorizontal: 8, borderRadius: 20, backgroundColor: level.soft, gap: 6 }}
    >
      {live ? (
        <View style={{ height: 20, alignItems: 'center', justifyContent: 'center' }}>
          {at?.countIn ? (
            <Text style={{ fontSize: 15, fontWeight: '900', color: level.accent }}>
              {t('guitar.getReady')} · {at.countIn}
            </Text>
          ) : (
            <Text style={{ fontSize: 12, fontWeight: '700', color: publicColors.muted }}>
              {t('guitar.tabRow', { current: currentRow + 1, total: rows })}
            </Text>
          )}
        </View>
      ) : null}
      {/* Nota aprinsă se dă doar rândului ei, ca restul să nu se redeseneze. */}
      {Array.from({ length: rowsShown }, (_, row) => (
        <View
          key={row}
          onLayout={(event) => {
            if (live) rowTops.current[row] = event.nativeEvent.layout.y
          }}
          style={{ opacity: live && playing && row !== currentRow ? 0.55 : 1 }}
        >
          <TabRow
            notes={rowNotes[row]!}
            slots={perRow}
            firstIndex={row * perRow}
            stepsPerBeat={subdivision}
            active={live && row === currentRow ? active : -1}
            width={contentWidth - 16}
            accent={level.accent}
          />
        </View>
      ))}
      <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted, textAlign: 'center', paddingHorizontal: 8 }}>
        {isPicking ? t('guitar.tabLegendPluck') : t('guitar.tabLegend')}
      </Text>
    </View>
  )

  const chordHint = chord ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: publicColors.muted }}>{t('guitar.holdChord')}</Text>
      <Text style={{ fontSize: 28, fontWeight: '900', color: publicColors.ink }}>{displaySymbol(chord.symbol)}</Text>
      <ChordDiagram shape={chord} width={96} mirrored={mirrored} accent={level.accent} />
    </View>
  ) : null

  if (view === 'session') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
        <SessionBar
          playing={playing}
          title={pick(exercise.title, language)}
          subtitle={`${bpm} BPM · ${t(`guitar.stepsPerBeat_${subdivision}`)}${exercise.position ? ` · ${t('guitar.genFret', { fret: position })}` : ''}`}
          onStop={session.stop}
          onAgain={start}
          onSettings={toSettings}
        />
        {/*
          Acordul ținut stă într-o bandă FIXĂ, sub bara de sus, nu în pagina
          care se derulează: altfel, la derularea automată spre rândul curent de
          tabulatură, acordul ieșea din ecran exact când trebuia citit.
        */}
        {chord ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: publicColors.border,
              backgroundColor: level.soft,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: publicColors.muted, textTransform: 'uppercase' }}>
                {t('guitar.holdChord')}
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: publicColors.ink }}>{displaySymbol(chord.symbol)}</Text>
            </View>
            <ChordDiagram shape={chord} width={78} mirrored={mirrored} accent={level.accent} />
            {nextChord ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.6 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: publicColors.muted, textTransform: 'uppercase' }}>
                    {t('guitar.next')}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: publicColors.ink }}>{displaySymbol(nextChord.symbol)}</Text>
                </View>
                <ChordDiagram shape={nextChord} width={54} mirrored={mirrored} accent={level.accent} />
              </View>
            ) : null}
          </View>
        ) : null}
        <ScrollView
          ref={scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: '100%',
            maxWidth: 680,
            alignSelf: 'center',
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 48,
            gap: 16,
          }}
        >
          {session.phase === 'done' ? (
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: '#EAF6EF' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.green, textAlign: 'center' }}>
                {t('guitar.fingerDone', { count: totalNotes, bpm })}
              </Text>
            </View>
          ) : null}
          {tab(rows, true)}
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
            {pick(level.title, language)}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: publicColors.ink }}>{pick(exercise.title, language)}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{pick(exercise.tip, language)}</Text>
        </View>

        <View style={{ gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: publicColors.border }}>
          <TempoControl
            label={t('guitar.tempo')}
            value={bpm}
            min={exercise.tempo.min}
            max={exercise.tempo.max}
            disabled={false}
            onCommit={setBpm}
          />
          {exercise.position ? (
            <TempoControl
              label={t('guitar.position')}
              unit=""
              value={position}
              min={exercise.position.min}
              max={exercise.position.max}
              disabled={false}
              onCommit={setPosition}
            />
          ) : null}
          {exercise.subdivisions.length > 1 ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{t('guitar.subdivision')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[...exercise.subdivisions].sort((a, b) => a - b).map((choice) => {
                  const chosen = choice === subdivision
                  return (
                    <Pressable
                      key={choice}
                      accessibilityRole="button"
                      accessibilityState={{ selected: chosen }}
                      onPress={() => setSubdivision(choice)}
                      style={{
                        paddingHorizontal: 14,
                        height: 38,
                        justifyContent: 'center',
                        borderRadius: 19,
                        borderWidth: 1.5,
                        borderColor: chosen ? level.accent : publicColors.border,
                        backgroundColor: chosen ? level.accent : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: chosen ? '#FFFFFF' : publicColors.ink }}>
                        {t(`guitar.stepsPerBeat_${choice}`)}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ) : null}
          <ToggleRow label={t('guitar.metronome')} value={metronome} disabled={false} onChange={setMetronome} />
          <ToggleRow label={t('guitar.fingerDemo')} value={demo} disabled={false} onChange={setDemo} />
        </View>

        {/* Previzualizarea: primele rânduri, ca să vezi ce urmează înainte de pornire. */}
        {chordHint}
        {tab(Math.min(2, rows), false)}
      </ScrollView>
      <StartBar label={t('guitar.start')} onPress={begin} />
    </SafeAreaView>
  )
}
