import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Shuffle } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { curriculumLanguage, pick } from '@/lib/rhythm/curriculum/localized'
import {
  changeLevels,
  planChanges,
  positionAt,
  totalChanges,
  type ChangeExercise,
  type ChangeLevel,
} from '@/lib/guitar/changes'
import { changesTrackKey, renderChangesTrack, renderChangesTrackSteps } from '@/lib/guitar/changes-track'
import { runInSlices, type SlicedJob } from '@/lib/guitar/slices'
import { encodeGuitarWavSteps } from '@/lib/guitar/wav'
import { hasWav, storeWav, wavUri } from '@/lib/guitar/chord-track'
import { displaySymbol } from '@/lib/guitar/chords'
import { useGuitarSamples } from '@/lib/guitar/guitar-samples'
import { usePracticeTrack } from '@/lib/guitar/use-practice-track'
import { ChordDiagram } from '../ChordDiagram'
import { BackButton, SessionBar, StartBar, TempoControl, ToggleRow } from '../practice-controls'

/*
  Însoțitorul de practică pentru schimbările de acorduri.

  Lista: nivelurile, ca la bibliotecă, totul deschis. Practica: acordul de acum,
  mare, cu diagrama; acordul care urmează, mic, cu câți timpi mai ai până la el;
  punctele timpilor din acordul curent; seria, cu poziția ta.

  Fără scor, fără verdict: aplicația nu aude chitara. La final spune doar ce
  s-a întâmplat, câte schimbări la ce tempo, nu cât de bine.
*/

export function ChordChangesScreen({
  levels = changeLevels,
  mirrored = false,
  onExit,
}: {
  levels?: ChangeLevel[]
  mirrored?: boolean
  onExit: () => void
}) {
  const [selected, setSelected] = useState<{ exercise: ChangeExercise; level: ChangeLevel } | null>(null)

  if (selected) {
    return (
      <ChangesPractice
        key={selected.exercise.id}
        exercise={selected.exercise}
        level={selected.level}
        mirrored={mirrored}
        onExit={() => setSelected(null)}
      />
    )
  }
  return <ChangesList levels={levels} onOpen={(exercise, level) => setSelected({ exercise, level })} onExit={onExit} />
}

function ChangesList({
  levels,
  onOpen,
  onExit,
}: {
  levels: ChangeLevel[]
  onOpen: (exercise: ChangeExercise, level: ChangeLevel) => void
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
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>{t('guitar.changesTitle')}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.changesIntro')}</Text>
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
                  <Text style={{ fontSize: 13, color: publicColors.muted }}>
                    {t('guitar.beatsPerChord', { count: exercise.beatsPerChord })}
                    {exercise.pool ? ` · ${t('guitar.randomSeries')}` : ''} · {exercise.tempo.suggested} BPM
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


function ChangesPractice({
  exercise,
  level,
  mirrored,
  onExit,
}: {
  exercise: ChangeExercise
  level: ChangeLevel
  mirrored: boolean
  onExit: () => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  const { width } = useWindowDimensions()
  const [bpm, setBpm] = useState(exercise.tempo.suggested)
  const [metronome, setMetronome] = useState(true)
  const [strum, setStrum] = useState(true)
  const [seed, setSeed] = useState(1)
  const session = usePracticeTrack()
  // Mostrele de chitară (nylon): se încarcă la intrare; până atunci, sinteza.
  const bank = useGuitarSamples()

  const plan = planChanges(exercise, bpm, seed)
  const playing = session.phase === 'playing'
  const position = session.unit >= 0 ? positionAt(plan, Math.min(session.unit, plan.totalBeats - 1)) : null
  const chordIndex = position?.chordIndex ?? 0
  const current = plan.sequence[chordIndex]!
  const next = plan.sequence[(chordIndex + 1) % plan.sequence.length]!
  const countIn = playing ? position?.countIn ?? null : null
  const changes = Math.min(position?.changes ?? 0, totalChanges(plan))

  const trackKey = changesTrackKey(exercise.id, seed, plan, { metronome, strum, bank })
  const prepareTrack = () => {
    const options = { metronome, strum, bank }
    return {
      uri: wavUri(trackKey, () => renderChangesTrack(plan, options), 'chord-changes'),
      unitMs: plan.beatMs,
      durationMs: plan.durationMs,
    }
  }
  const start = () => session.start(prepareTrack)

  /*
    Pista se pregătește în fundal, ca la „Pornește" să rămână doar pornirea.

    Pe felii (`runInSlices`), nu dintr-o bucată: un minut de audio randat dintr-o
    bucată ținea firul aplicației ocupat, iar pe telefon butoanele de tempo nu
    mai răspundeau (lag la − / +). Pornește abia după o pauză în reglaj și se
    anulează la orice schimbare nouă: o pistă pentru un tempo prin care doar ai
    trecut nu se termină niciodată.
  */
  const pending = useRef({ plan, options: { metronome, strum, bank } })
  useEffect(() => {
    pending.current = { plan, options: { metronome, strum, bank } }
  })
  useEffect(() => {
    if (playing || hasWav(trackKey)) return
    let job: SlicedJob<Uint8Array> | null = null
    const timer = setTimeout(() => {
      const { plan: target, options } = pending.current
      job = runInSlices(
        (function* () {
          const samples = yield* renderChangesTrackSteps(target, options)
          return yield* encodeGuitarWavSteps(samples)
        })(),
      )
      job.promise
        .then((wav) => {
          if (wav) storeWav(trackKey, wav, 'chord-changes')
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
  const bigDiagram = Math.min(230, Math.round(contentWidth * 0.58))
  const smallDiagram = Math.min(110, Math.round(contentWidth * 0.26))

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

  const series = (live: boolean) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {plan.sequence.map((chord, index) => {
        const active = live && playing && countIn === null && index === chordIndex
        return (
          <View
            key={`${chord.id}-${index}`}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: active ? level.accent : '#F1F3F4',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: active ? '#FFFFFF' : publicColors.ink }}>
              {displaySymbol(chord.symbol)}
            </Text>
          </View>
        )
      })}
    </View>
  )

  if (view === 'session') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
        <SessionBar
          playing={playing}
          title={pick(exercise.title, language)}
          subtitle={`${bpm} BPM · ${t('guitar.beatsPerChord', { count: exercise.beatsPerChord })}`}
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
            gap: 16,
          }}
        >
          {/* Acordul de acum și cel care urmează. */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'stretch',
              gap: 12,
              padding: 16,
              borderRadius: 24,
              backgroundColor: level.soft,
            }}
          >
            <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              {countIn !== null ? (
                <>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: level.accent, textTransform: 'uppercase' }}>
                    {t('guitar.getReady')}
                  </Text>
                  <Text style={{ fontSize: 72, fontWeight: '900', color: publicColors.ink }}>{countIn}</Text>
                  <Text style={{ fontSize: 14, color: publicColors.muted }}>
                    {t('guitar.firstChord')}: {displaySymbol(current.symbol)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 48, fontWeight: '900', color: publicColors.ink }}>{displaySymbol(current.symbol)}</Text>
                  <ChordDiagram shape={current} width={bigDiagram} mirrored={mirrored} accent={level.accent} />
                  <BeatDots
                    count={exercise.beatsPerChord}
                    active={playing && position ? position.beatInChord : -1}
                    accent={level.accent}
                  />
                </>
              )}
            </View>
            <View style={{ width: smallDiagram + 8, alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: publicColors.muted, textTransform: 'uppercase' }}>
                {t('guitar.next')}
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: publicColors.ink }}>
                {displaySymbol((countIn !== null ? current : next).symbol)}
              </Text>
              <ChordDiagram
                shape={countIn !== null ? current : next}
                width={smallDiagram}
                mirrored={mirrored}
                accent={level.accent}
              />
              {playing && position && countIn === null ? (
                <Text style={{ fontSize: 12, color: publicColors.muted, textAlign: 'center' }}>
                  {t('guitar.inBeats', { count: exercise.beatsPerChord - position.beatInChord })}
                </Text>
              ) : null}
            </View>
          </View>

          {series(true)}

          {session.phase === 'done' ? (
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: '#EAF6EF' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.green, textAlign: 'center' }}>
                {t('guitar.changesDone', { count: totalChanges(plan), bpm })}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: publicColors.muted, textAlign: 'center' }}>
              {t('guitar.changesCount', { count: changes, total: totalChanges(plan) })}
            </Text>
          )}
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
            {pick(level.title, language)} · {t('guitar.beatsPerChord', { count: exercise.beatsPerChord })}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: publicColors.ink }}>{pick(exercise.title, language)}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{pick(exercise.tip, language)}</Text>
        </View>

        {/* Previzualizarea: seria și primul acord. */}
        {series(false)}
        <View style={{ alignItems: 'center' }}>
          <ChordDiagram shape={plan.sequence[0]!} width={Math.min(150, bigDiagram)} mirrored={mirrored} accent={level.accent} />
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
          <ToggleRow label={t('guitar.metronome')} value={metronome} disabled={false} onChange={setMetronome} />
          <ToggleRow label={t('guitar.strum')} value={strum} disabled={false} onChange={setStrum} />
          {exercise.pool ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSeed((value) => value + 1)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                height: 44,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: publicColors.border,
                backgroundColor: pressed ? '#F1F3F4' : 'transparent',
              })}
            >
              <Shuffle size={16} color={publicColors.ink} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{t('guitar.newSeries')}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      <StartBar label={t('guitar.start')} onPress={begin} />
    </SafeAreaView>
  )
}

function BeatDots({ count, active, accent }: { count: number; active: number; accent: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingTop: 4 }}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: index === active ? accent : 'transparent',
            borderWidth: 2,
            borderColor: accent,
          }}
        />
      ))}
    </View>
  )
}

