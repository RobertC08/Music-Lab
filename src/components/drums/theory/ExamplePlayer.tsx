import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Hand, Minus, Play, Plus, RotateCcw, Square, Timer } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { BassRow } from '@/components/drums/bass-row'
import { GrooveGrid } from '@/components/drums/groove-grid'
import { StickingRow } from '@/components/drums/sticking-row'
import { MAX_BPM } from '@/lib/drums/exercise'
import { planDrumMedley } from '@/lib/drums/plan'
import { buildSessionTrack } from '@/lib/drums/session-track'
import { stepCursor } from '@/lib/drums/playhead'
import { usePracticeSession } from '@/lib/drums/use-practice-session'
import { kitIfLoaded } from '@/lib/drums/kit'
import { thinClicks, type DrumExample } from '@/lib/drums/theory'
import { haptic } from '@/lib/haptics/game-haptics'
import { ChartView } from './ChartView'
import { DrumStaff } from './DrumStaff'
import { LiveKitDrawing, WithCursor } from '@/components/drums/live'

/*
  Exemplul ascultabil dintr-o lecție de manual.

  Nu e o sesiune de practică și nu se poartă ca una: fără numărătoare, iar
  exemplul se reia în buclă până îl oprești. Numărătoarea există ca să poți
  intra peste ce cântă aplicația; aici doar asculți, iar o măsură de click
  înaintea fiecărui exemplu ar transforma șapte exemple în șapte așteptări.

  Bucla o face playerul, nativ, ca la modul fără limită din practică
  (`planDrumMedley` cu `loop`). Pista NU e o singură trecere prin exercițiu, ci
  atâtea treceri cât încap în ~30 s (`LOOP_TARGET_MS`), din același motiv ca la
  practică: playerul face o mică pauză la fiecare reluare, mai ales în browser,
  iar la o pistă de o măsură pauza aia cădea la fiecare repetare, exact unde un
  fus deschis sau un crash de final trebuie să sune peste „unu”-ul următor.
  Înăuntrul pistei trecerile se leagă fără nicio cusătură, iar la capătul ei
  coada ultimei lovituri se adună peste început (`render.ts`), deci și singura
  reluare rămasă e muzicală.

  Metronomul e la alegere, oprit implicit. Pornit, se aude sub exemplu, nu
  înaintea lui: ajută unde contează unde cade pulsul (shuffle, 7/8, poliritm)
  și la cine vrea să bată peste exemplu.

  Dedesubt, aceeași mașinărie ca la practică, `planDrumMedley`, `buildSessionTrack`,
  `usePracticeSession`, deci și aceleași două reguli, câștigate scump:
  randarea se face SINCRON la apăsare (altfel contextul audio de pe web rămâne
  suspendat), și toată redarea e un singur WAV pornit cu un singur `play()`
  (mobile/CLAUDE.md §4).
*/

/**
 * Cât de lungă e pista unui exemplu, cel mult. Destul de lungă încât reluarea
 * playerului să vină rar, destul de scurtă încât randarea la apăsare să rămână
 * instantanee: o pistă de 90 s, cât are practica, ar întârzia sunetul.
 */
const LOOP_TARGET_MS = 30_000

/**
 * Pasul butoanelor de tempo. Doi, nu unul: la exemple tempoul se caută cu
 * urechea, iar o diferență de un BPM nu se aude; cu doi, zece apăsări fac deja
 * o diferență pe care o simți.
 */
const TEMPO_STEP = 2

/** Câte treceri prin exercițiu încap în pistă, la tempoul dat. Măcar una. */
function passesFor(example: DrumExample, bpm: number) {
  const { exercise } = example
  const passMs = (60_000 / bpm) * exercise.beatsPerBar * exercise.bars.length
  return Math.max(1, Math.floor(LOOP_TARGET_MS / passMs))
}

export function ExamplePlayer({
  example,
  accent,
  metronome,
  onToggleMetronome,
}: {
  example: DrumExample
  accent: string
  /**
   * Click-ul sub exemplu. Starea stă în ecranul lecției, nu aici: pornit o dată,
   * rămâne pornit la exemplele următoare, cum se așteaptă cine l-a pornit.
   */
  metronome: boolean
  onToggleMetronome: () => void
}) {
  const { t } = useTranslation()
  /*
    Tempoul exemplului, reglabil. Pornește de la cel ales de lecție și rămâne al
    exemplului: la secțiunea următoare se pornește iar de la tempoul ei.

    Limitele sunt cele de la practică: în jos până la capătul de jos al
    exercițiului, în sus până la plafonul aplicației (`MAX_BPM`), cu o notă când
    ai trecut de intervalul recomandat. Aplicația îți spune unde ești, nu te
    oprește. Metronomul nu cere nimic separat: click-urile sunt randate în
    aceeași pistă, din același plan, deci merg mereu după tempoul ales.
  */
  const [bpm, setBpm] = useState(example.bpm)
  /*
    Un exemplu cu clicul scris (`example.click`) îl are mereu pornit, iar
    comutatorul nu se arată: lecția e despre clic.
  */
  const clicks = example.click ? true : metronome
  // „Cânți tu”: tobele tac, clicul și basul rămân.
  const [selfPlay, setSelfPlay] = useState(false)
  const [revealed, setRevealed] = useState(!example.reveal)
  const plan = useMemo(
    () => {
      const planned = planDrumMedley(
        [{ exercise: example.exercise, bpm, repeats: passesFor(example, bpm) }],
        { countInBars: 0, clicks, loop: true },
      )
      return example.click ? thinClicks(planned, example.click) : planned
    },
    /*
      `selfPlay` nu schimbă planul, dar intră în dependențe dinadins: un plan nou
      e semnalul la care sesiunea se resetează și exemplul repornește (`replan`),
      cu tobele oprite sau pornite.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [example, bpm, clicks, selfPlay],
  )
  /*
    Randarea intră ca funcție, nu ca pistă gata făcută: altfel s-ar construi și
    s-ar coda WAV-ul la fiecare redesenare a lecției, nu la apăsare. Aceeași
    greșeală a produs lag-ul la schimbarea tempoului în practică.
  */
  const prepare = useCallback(
    /*
      Mostrele se iau din încărcător aici, la apăsare, nu vin ca proprietate:
      vezi `kitReady` în `LessonScreen.tsx`. Exemplul se desenează doar după ce
      sunt gata, deci aici nu pot lipsi.
    */
    () =>
      buildSessionTrack(plan, {
        samples: kitIfLoaded()!,
        clicks,
        loop: true,
        bass: example.bass,
        hits: !selfPlay,
      }),
    [plan, clicks, example.bass, selfPlay],
  )
  const session = usePracticeSession(plan, prepare)
  const playing = session.phase === 'playing'

  /*
    Schimbarea tempoului sau a metronomului din mers: exemplul repornește singur
    cu noul plan, nu se oprește. Pista e un singur WAV randat la pornire, deci
    nu se poate modifica din mers; se randează alta. Pornirea se face după ce
    noul plan a ajuns în sesiune (efectul de mai jos rulează după cel care o
    resetează), altfel ar porni tot pista veche.
  */
  const restart = useRef(false)
  const { start } = session
  useEffect(() => {
    if (!restart.current) return
    restart.current = false
    start()
  }, [plan, start])
  const replan = (change: () => void) => {
    haptic('light')
    if (playing) {
      session.stop()
      restart.current = true
    }
    change()
  }

  /*
    Măsura și pasul care se aud, ca cursor la care se abonează desenele
    (`playhead.ts`). Ecranul ăsta nu se mai redesenează la fiecare cadru: doar
    celulele care se aprind și se sting, și desenul setului la fiecare lovitură.
  */
  const cursor = useMemo(
    () => stepCursor(session.playhead, plan, (bar) => bar.index % example.exercise.bars.length),
    [session.playhead, plan, example.exercise.bars.length],
  )

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? t('drums.theoryStopExample') : t('drums.theoryPlayExample')}
          onPress={() => {
            haptic('light')
            if (playing) session.stop()
            else session.start()
          }}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: accent,
            backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
            paddingHorizontal: 18,
          })}
        >
          {playing ? <Square size={18} color={accent} /> : <Play size={18} color={accent} />}
          <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>
            {playing ? t('drums.theoryStopExample') : t('drums.theoryPlayExample')}
          </Text>
        </Pressable>

        {/*
          Comutatorul de metronom. Din mers, exemplul repornește cu sau fără
          click (`replan`), nu se oprește.
        */}
        {example.click ? null : (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: metronome }}
            accessibilityLabel={t('drums.theoryMetronome')}
            onPress={() => replan(onToggleMetronome)}
            style={({ pressed }) => ({
              minHeight: 52,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: metronome ? accent : publicColors.border,
              backgroundColor: metronome ? accent : pressed ? '#F7F8F9' : publicColors.card,
              paddingHorizontal: 14,
            })}
          >
            <Timer size={18} color={metronome ? '#FFFFFF' : publicColors.muted} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '800',
                color: metronome ? '#FFFFFF' : publicColors.muted,
              }}
            >
              {t('drums.theoryMetronome')}
            </Text>
          </Pressable>
        )}
      </View>

      {example.playAlong ? (
        <View style={{ gap: 6 }}>
          <Toggle
            on={selfPlay}
            accent={accent}
            label={t('drums.theoryPlayAlong')}
            icon={<Hand size={18} color={selfPlay ? '#FFFFFF' : publicColors.muted} />}
            onPress={() => replan(() => setSelfPlay((value) => !value))}
          />
          {selfPlay ? (
            <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted }}>
              {t('drums.theoryPlayAlongHint')}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TempoButton
          label={t('drums.theoryTempoSlower')}
          icon={<Minus size={18} color={publicColors.ink} />}
          disabled={bpm <= example.exercise.tempo.min}
          onPress={() =>
            replan(() => setBpm(Math.max(example.exercise.tempo.min, bpm - TEMPO_STEP)))
          }
        />
        <Text
          accessibilityLabel={`${t('drums.tempo')}: ${bpm} BPM`}
          style={{
            minWidth: 76,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '800',
            color: publicColors.ink,
            fontVariant: ['tabular-nums'],
          }}
        >
          {bpm} BPM
        </Text>
        <TempoButton
          label={t('drums.theoryTempoFaster')}
          icon={<Plus size={18} color={publicColors.ink} />}
          disabled={bpm >= MAX_BPM}
          onPress={() => replan(() => setBpm(Math.min(MAX_BPM, bpm + TEMPO_STEP)))}
        />
        {bpm !== example.bpm ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('drums.theoryTempoReset', { bpm: example.bpm })}
            onPress={() => replan(() => setBpm(example.bpm))}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <RotateCcw size={14} color={publicColors.muted} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: publicColors.muted }}>
              {example.bpm}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {bpm > example.exercise.tempo.max ? (
        <Text style={{ fontSize: 11, lineHeight: 15, color: '#C8442E' }}>
          {t('drums.aboveRange', { max: example.exercise.tempo.max })}
        </Text>
      ) : null}

      <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
        {example.caption}
      </Text>

      {/*
        Setul deasupra grilei, când exemplul îl cere.

        Cele două arată lucruri diferite și de asta stau amândouă: desenul spune
        CE piesă sună, grila spune CÂND. La lecțiile despre instrument, prima
        întrebare e „de unde vine sunetul ăsta?", iar un rând de pătrate n-o
        poate răspunde pentru cineva care încă n-a învățat notația.

        Desenul e `KitDrawing`, nu `KitDiagram`: aici nu se atinge nimic, iar
        varianta interactivă ar porni nouă playere sub fiecare exemplu.
      */}
      {example.showKit ? (
        <LiveKitDrawing playhead={session.playhead} plan={plan} enabled={playing && revealed} />
      ) : null}

      {example.chart ? (
        <WithCursor cursor={cursor}>
          {(bar) => <ChartView chart={example.chart!} activeBar={bar} accent={accent} />}
        </WithCursor>
      ) : null}

      {/*
        La transcriere, notația stă ascunsă până o ceri: la vedere, scrisul după
        ureche ar deveni copiat.
      */}
      {example.reveal ? (
        <View style={{ gap: 6 }}>
          {revealed ? null : (
            <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted }}>
              {t('drums.theoryRevealHint')}
            </Text>
          )}
          <Toggle
            on={revealed}
            accent={accent}
            label={revealed ? t('drums.theoryHideNotation') : t('drums.theoryRevealNotation')}
            icon={
              revealed ? (
                <EyeOff size={18} color="#FFFFFF" />
              ) : (
                <Eye size={18} color={publicColors.muted} />
              )
            }
            onPress={() => {
              haptic('light')
              setRevealed((value) => !value)
            }}
          />
        </View>
      ) : null}

      {/*
        Portativul, când lecția e despre scris.

        Primește ACELAȘI `activeStep` ca grila, din același ceas al pistei. Dacă
        s-ar aprinde cu un pas diferență, s-ar rupe exact puntea pe care Etapa 1
        o construiește: elevul trebuie să vadă că cele două desene spun același
        lucru, nu să le compare.
      */}
      {example.showStaff && revealed ? (
        <WithCursor cursor={cursor}>
          {(bar, step) => (
            <DrumStaff exercise={example.exercise} activeBar={bar} activeStep={step} accent={accent} />
          )}
        </WithCursor>
      ) : null}

      {/*
        Rândul de mâini, când lecția e despre ele.

        Primește același `activeStep` ca grila și ca portativul, din același ceas
        al pistei: la un double stroke roll, singurul lucru care se vede e CARE
        celulă se aprinde, iar un pas diferență ar arăta mâna greșită exact
        acolo unde elevul se uită.
      */}
      {example.showSticking && revealed ? (
        <WithCursor cursor={cursor}>
          {(bar, step) => (
            <StickingRow
              exercise={example.exercise}
              activeBar={bar}
              activeStep={step}
              showHint={!playing}
            />
          )}
        </WithCursor>
      ) : null}

      {/*
        Basul deasupra grilei, pe aceleași coloane: nota de bas și toba mare de
        pe același pas stau una sub alta.
      */}
      {example.bass ? (
        <WithCursor cursor={cursor}>
          {(bar, step) => (
            <BassRow
              line={example.bass!}
              stepsPerBar={example.exercise.stepsPerBar}
              beatsPerBar={example.exercise.beatsPerBar}
              activeBar={bar}
              activeStep={step}
            />
          )}
        </WithCursor>
      ) : null}

      {example.showGrid === false || !revealed ? null : (
        <GrooveGrid exercise={example.exercise} cursor={cursor} showHint={false} />
      )}
    </View>
  )
}

/** Un comutator lat, la fel ca cel de metronom: plin când e pornit. */
function Toggle({
  on,
  accent,
  label,
  icon,
  onPress,
}: {
  on: boolean
  accent: string
  label: string
  icon: React.ReactNode
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: on ? accent : publicColors.border,
        backgroundColor: on ? accent : pressed ? '#F7F8F9' : publicColors.card,
        paddingHorizontal: 14,
      })}
    >
      {icon}
      <Text style={{ fontSize: 14, fontWeight: '800', color: on ? '#FFFFFF' : publicColors.muted }}>
        {label}
      </Text>
    </Pressable>
  )
}

/** Un buton rotund de tempo, „−” sau „+”. */
function TempoButton({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string
  icon: React.ReactNode
  disabled: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: publicColors.border,
        backgroundColor: pressed ? '#F1F3F4' : publicColors.card,
        opacity: disabled ? 0.4 : 1,
      })}
    >
      {icon}
    </Pressable>
  )
}
