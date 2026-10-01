import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight, LockKeyhole, Minus, Plus, Square, Play } from 'lucide-react-native'
import { ConditionalKeepAwake } from '@/components/system/conditional-keep-awake'
import { publicColors } from '@/components/public-practice/ui'
import { missingFor, unlockedIn } from '@/lib/drums/catalogue'
import { MAX_BPM, type DrumExercise } from '@/lib/drums/exercise'
import { kitIfLoaded, loadKit } from '@/lib/drums/kit'
import { steadyMode, type PracticeMode } from '@/lib/drums/modes'
import { nextExerciseChange, planDrumMedley } from '@/lib/drums/plan'
import { buildSessionTrack } from '@/lib/drums/session-track'
import { piecesSoundingAt } from '@/lib/drums/sounding'
import { usePracticeSession } from '@/lib/drums/use-practice-session'
import { KitDrawing } from '@/components/drums/theory/KitDiagram'
import { useGuestStore } from '@/lib/guest/store'

/*
  Însoțitorul de practică pentru tobe, ecranul, o singură dată.

  Tu bați pe pad sau pe set; aplicația ține metronomul, arată ce se cântă și
  numără. Nu există scor, și asta e o decizie, nu o lipsă: fără microfon,
  aplicația NU știe ce ai bătut, iar un punctaj inventat ar fi minciuna pe care
  brief-ul o interzice. Se ține doar ce se poate verifica, că ai dus sesiunea
  până la capăt, și la ce tempo (PLAN-TOBE.md §5).

  Rudimentele și groove-urile NU sunt două ecrane. Diferă catalogul de exerciții
  și felul în care se desenează notația, atât. Restul (deblocarea, tempoul,
  durata, ceasul, recordul) e același, deci stă aici o singură dată. E aceeași
  formă ca `LaneGameConfig` din modulul Ritm, care a ținut patru jocuri pe un
  singur ecran.
*/

/**
 * Un mod de sunet: ce cântă aplicația cât exersezi.
 *
 * Nu e o listă fixă, fiindcă nu înseamnă același lucru peste tot: la rudimente și
 * groove-uri alegerea e între „ți-l cântă” și „îl ții singur”, la fill-uri apare
 * golul, aplicația ține groove-ul și tace exact pe măsura ta.
 */
export interface SoundMode {
  id: string
  labelKey: string
  hits?: boolean
  gap?: boolean
}

/** Alegerea obișnuită: cu tobe, sau doar metronomul. */
export const DEFAULT_SOUND_MODES: SoundMode[] = [
  { id: 'full', labelKey: 'drums.withDrums' },
  { id: 'bare', labelKey: 'drums.metronomeOnly', hits: false },
]

export interface PracticeCatalogue {
  /** Pentru cheia de wake lock și pentru depanare. */
  id: string
  titleKey: string
  introKey: string
  /** „Alege un rudiment” / „Alege un groove”: eticheta listei și a butonului de întoarcere. */
  pickKey: string
  exercises: readonly DrumExercise[]
  /** Cheile de text ale unui exercițiu. Textul nu stă în date. */
  textOf: (id: string) => { titleKey: string; howToKey: string }
  /** Modurile de sunet oferite. Primul e cel implicit. */
  soundModes?: SoundMode[]
  /** Modurile de sesiune oferite. Primul e cel implicit; lipsă = doar cel obișnuit. */
  modes?: PracticeMode[]
  /**
   * Desenul setului deasupra notației, cu piesele aprinzându-se pe măsură ce
   * aplicația le cântă.
   *
   * Pornit la groove-uri și la fill-uri, unde contează CE piesă se lovește.
   * Oprit la rudimente: acolo totul se bate pe toba mică, iar ce se citește e
   * MÂNA, un desen cu o singură piesă aprinsă tot timpul n-ar spune nimic și
   * ar lua ecran de care rândul de mâini chiar are nevoie.
   */
  showKit?: boolean
  /** Notația: rândul de mâini la rudimente, grila de piese la groove-uri. */
  renderNotation: (props: {
    exercise: DrumExercise
    activeBar: number
    activeStep: number
    /** Fals în timpul sesiunii: explicațiile de sub notație nu mai au cui folosi. */
    showHint: boolean
  }) => ReactNode
}

/**
 * Duratele de sesiune. `Infinity` = fără limită: sesiunea se reia în buclă și
 * ține până o oprești tu.
 *
 * Nu e un plafon ridicat, e altceva: peste 90 de secunde nu se mai poate randa
 * un singur fișier (vezi `MAX_SESSION_MS`), deci „fără limită” înseamnă o buclă,
 * reluată nativ de player. Consecința e că bucla n-are numărătoare, ea s-ar
 * auzi la fiecare reluare.
 */
const DURATIONS = [30, 60, 90, Infinity] as const

/** FNV-1a, ca `seedForLevel` din `lib/guest/adaptive-levels.ts`. */
function hashOf(value: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
/** Spațiul dintre blocurile sesiunii. Intră în socoteala desenului (vezi `Runner`). */
const SESSION_GAP = 10

const TEMPO_STEP = 1

export function PracticeScreen({
  catalogue,
  onExit,
}: {
  catalogue: PracticeCatalogue
  onExit: () => void
}) {
  const { t } = useTranslation()
  /*
    Doar dacă mostrele sunt gata, nu mostrele însele: pasate ca proprietate,
    cei ~6 MB de eșantioane blocau iPhone-ul secunde întregi la montarea
    componentei, în modul de dezvoltare. Vezi `kitReady` în
    `components/drums/theory/LessonScreen.tsx`.
  */
  const [kitReady, setKitReady] = useState(() => kitIfLoaded() !== null)
  const [kitError, setKitError] = useState(false)
  /** Cât ecran are de umplut sesiunea. Se măsoară la prima așezare. */
  const [viewportHeight, setViewportHeight] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const progress = useGuestStore((state) => state.drumProgress)
  const completed = useMemo(() => Object.keys(progress?.exercises ?? {}), [progress])
  const open = useMemo(
    () => new Set(unlockedIn(catalogue.exercises, completed).map((item) => item.id)),
    [catalogue.exercises, completed],
  )

  useEffect(() => {
    let alive = true
    loadKit()
      .then(() => {
        if (alive) setKitReady(true)
      })
      .catch(() => {
        if (alive) setKitError(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const selected = selectedId
    ? catalogue.exercises.find((item) => item.id === selectedId)
    : undefined
  /*
    Memorat, nu filtrat în JSX: un tablou nou la fiecare redesenare ar reface
    planul sesiunii de fiecare dată, iar ce atârnă de identitatea planului (vezi
    `use-practice-session.ts`) s-ar declanșa degeaba.
  */
  const pool = useMemo(
    () => catalogue.exercises.filter((item) => open.has(item.id)),
    [catalogue.exercises, open],
  )

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: publicColors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        /*
          Înălțimea utilă a ecranului, ca desenul setului să fie pornit doar
          unde chiar încape (vezi `Runner`). Măsurată pe ScrollView-ul
          dinăuntru, nu pe fereastră: bara de sistem și SafeArea mănâncă din ea,
          iar diferența e chiar cât un desen.
        */
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 16,
          paddingTop: 4,
          // Ecranul unui exercițiu trebuie să încapă întreg: acolo derulezi cu
          // bețele în mâini, ceea ce nu se poate. Lista are nevoie de aer la
          // capăt, exercițiul nu.
          paddingBottom: selected ? 6 : 48,
          gap: selected ? 10 : 16,
        }}
      >
        <View style={{ minHeight: selected ? 40 : 52, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => (selected ? setSelectedId(null) : onExit())}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: 23,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? '#F1F3F4' : 'transparent',
            })}
          >
            <ArrowLeft size={22} color={publicColors.ink} />
          </Pressable>
        </View>

        {/*
          Capul de modul („Rudimente” + intro) dispare cât timp ești într-un
          exercițiu: acolo titlul e al exercițiului, iar repetarea numelui de
          modul mânca o treime din ecran fără să spună nimic nou.
        */}
        {selected ? null : (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>
              {t(catalogue.titleKey)}
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>
              {t(catalogue.introKey)}
            </Text>
          </View>
        )}

        {selected ? (
          kitReady ? (
            <Runner
              key={selected.id}
              catalogue={catalogue}
              exercise={selected}
              pool={pool}
              viewportHeight={viewportHeight}
              onDone={() => setSelectedId(null)}
            />
          ) : (
            <Note text={kitError ? t('common.errorGeneric') : t('common.loading')} />
          )
        ) : (
          <>
            <Note text={t('drums.noScore')} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1.1,
                color: publicColors.muted,
                textTransform: 'uppercase',
              }}
            >
              {t(catalogue.pickKey)}
            </Text>
            <View style={{ gap: 8 }}>
              {catalogue.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  catalogue={catalogue}
                  exercise={exercise}
                  unlocked={open.has(exercise.id)}
                  bestTempo={progress?.exercises?.[exercise.id]?.bestTempo ?? 0}
                  completedIds={completed}
                  onPress={() => setSelectedId(exercise.id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function Note({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: '#F7F8F9',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: publicColors.border,
      }}
    >
      <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>{text}</Text>
    </View>
  )
}

function ExerciseCard({
  catalogue,
  exercise,
  unlocked,
  bestTempo,
  completedIds,
  onPress,
}: {
  catalogue: PracticeCatalogue
  exercise: DrumExercise
  unlocked: boolean
  bestTempo: number
  completedIds: string[]
  onPress: () => void
}) {
  const { t } = useTranslation()
  const { titleKey } = catalogue.textOf(exercise.id)
  // Ce lipsește se scrie cu numele exercițiilor, nu cu id-urile: „Termină întâi
  // Lovituri duble” spune unde să te duci, „double-stroke-roll” nu.
  const missing = missingFor(exercise, completedIds)
    .map((id) => t(catalogue.textOf(id).titleKey))
    .join(', ')

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !unlocked }}
      disabled={!unlocked}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: publicColors.border,
        backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
        padding: 14,
        opacity: unlocked ? 1 : 0.55,
      })}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: publicColors.ink }}>
          {t(titleKey)}
        </Text>
        <Text style={{ fontSize: 13, color: publicColors.muted }}>
          {unlocked
            ? bestTempo
              ? `${bestTempo} BPM`
              : `${exercise.tempo.min}–${exercise.tempo.max} BPM`
            : t('drums.locked', { list: missing })}
        </Text>
      </View>
      {unlocked ? (
        <ChevronRight size={20} color={publicColors.muted} />
      ) : (
        <LockKeyhole size={18} color={publicColors.muted} />
      )}
    </Pressable>
  )
}

function Runner({
  catalogue,
  exercise,
  pool,
  viewportHeight,
  onDone,
}: {
  catalogue: PracticeCatalogue
  exercise: DrumExercise
  pool: readonly DrumExercise[]
  /** Cât ecran e de folosit, măsurat. `0` cât timp nu s-a măsurat încă. */
  viewportHeight: number
  onDone: () => void
}) {
  const { t } = useTranslation()
  const { titleKey, howToKey } = catalogue.textOf(exercise.id)
  const [bpm, setBpm] = useState(exercise.tempo.suggested)
  const [seconds, setSeconds] = useState<number>(60)
  /*
    Întâi îl auzi, pe urmă îl ții singur, iar a doua parte e cea care arată dacă
    l-ai învățat. Fără microfon, aplicația nu poate verifica asta; dar tu poți,
    fiindcă dacă te-ai pierdut o auzi pe „unu”.
  */
  const sounds = catalogue.soundModes ?? DEFAULT_SOUND_MODES
  const [soundId, setSoundId] = useState(sounds[0]!.id)
  const sound = sounds.find((item) => item.id === soundId) ?? sounds[0]!

  const modes = catalogue.modes ?? [steadyMode]
  const [modeId, setModeId] = useState(modes[0]!.id)
  const mode = modes.find((item) => item.id === modeId) ?? modes[0]!
  /*
    Sămânța se schimbă la fiecare reluare, ca o ruletă să nu dea de două ori la
    rând aceeași ordine, dar rămâne o sămânță, deci sesiunea e reproductibilă
    dacă ceva iese prost și trebuie înțeles.
  */
  const [attempt, setAttempt] = useState(0)
  const seed = useMemo(() => hashOf(`${exercise.id}:${mode.id}:${attempt}`), [exercise.id, mode.id, attempt])

  const items = useMemo(
    () => mode.build({ exercise, pool, bpm, seconds, seed }),
    [mode, exercise, pool, bpm, seconds, seed],
  )
  /* Exercițiile care chiar sună, inclusiv cele generate (fill-urile inventate). */
  const playedById = useMemo(
    () => new Map(items.map((item) => [item.exercise.id, item.exercise])),
    [items],
  )
  const completeDrumSession = useGuestStore((state) => state.completeDrumSession)
  const addSession = useGuestStore((state) => state.addSession)

  const endless = seconds === Infinity
  const plan = useMemo(
    () => planDrumMedley(items, endless ? { loop: true, countInBars: 0 } : {}),
    [items, endless],
  )
  /*
    Pista NU se randează aici, ci la apăsarea pe Pornește.

    Randată la fiecare redesenare, o apăsare pe „+” costa toată sesiunea: 5,3 MB
    de WAV pentru 60 s, construiți și codați în același cadru cu atingerea, de
    acolo venea lag-ul la schimbarea tempoului. Planul rămâne calculat imediat,
    fiindcă e ieftin și fiindcă notația de pe ecran se uită la el.
  */
  const prepare = useCallback(
    // Mostrele din încărcător, la apăsare; `Runner` se montează doar după ce sunt gata.
    () =>
      buildSessionTrack(plan, {
        samples: kitIfLoaded()!,
        hits: sound.hits,
        gap: sound.gap,
        loop: endless,
      }),
    [plan, sound.hits, sound.gap, endless],
  )

  const record = (bpmPlayed: number, seconds: number) => {
    completeDrumSession(exercise.id, bpmPlayed, seconds)
    addSession({
      durationSeconds: seconds,
      // Sursă proprie: o sesiune de tobe nu e practică liberă (are exercițiu,
      // tempo și durată alese) și nu e joc (n-are scor). Dacă baza n-a primit
      // încă migrația, `lib/guest/sync.ts` o coboară la `free` la trimitere.
      source: 'drums',
      title: t(titleKey),
    })
  }

  const session = usePracticeSession(plan, prepare, (finished) => {
    /*
      Se salvează DOAR la capăt, și cu tempoul chiar cântat (`peakBpm`), nu cu cel
      cerut: dacă plafonul de durată a tăiat trepte, cel cerut n-a sunat niciodată.
    */
    record(finished.peakBpm, Math.round(finished.totalMs / 1000))
  })

  /*
    Oprirea contează doar la „ține cât poți”: acolo întrebarea CHIAR e cât ai
    ținut, deci oprirea nu e un eșec, e rezultatul. În rest, o sesiune oprită la
    mijloc nu spune nimic despre tempoul pe care îl poți ține, și atunci nu se
    salvează, ca să nu apară un record pe care nu l-ai făcut.
  */
  const MIN_RECORDED_MS = 10_000
  /*
    Ce s-a salvat la oprire, dacă s-a salvat ceva.

    Se ține ca să nu mint pe ecranul de final: „nu s-a pierdut nimic, dar nici nu
    s-a salvat” e adevărat când oprești o sesiune cu durată, acolo tempoul chiar
    n-a fost dus până la capăt. La „fără limită” și la „ține cât poți”, oprirea E
    sfârșitul, sesiunea S-A salvat, și atunci mesajul celălalt ar fi fals.
  */
  const [savedOnStop, setSavedOnStop] = useState<{ seconds: number; bpm: number } | null>(null)
  const stop = () => {
    const elapsed = session.elapsedMs
    session.stop()
    if ((mode.recordOnStop || endless) && session.phase === 'playing' && elapsed >= MIN_RECORDED_MS) {
      const seconds = Math.round(elapsed / 1000)
      record(bpm, seconds)
      setSavedOnStop({ seconds, bpm })
    }
  }

  const playing = session.phase === 'playing'
  const bar = session.bar
  // Poziția ÎN pistă, nu cât ai cântat: în buclă, a doua reluare trece prin
  // aceleași măsuri.
  const activeStep =
    bar && !bar.countIn ? Math.floor((session.positionMs - bar.atMs) / bar.stepMs) : -1
  /*
    Piesele care sună acum, pentru desenul setului.

    Nu se aprinde nimic cât timp tobele sunt oprite („Doar metronom"): planul le
    conține în continuare, fiindcă el descrie ce SE CÂNTĂ, nu ce se aude, dar
    un desen care arată lovituri pe care urechea nu le primește ar fi tocmai
    felul de a te sprijini pe care modul ăsta îl ia înadins.

    Nici în numărătoare: acolo se aud doar click-uri.
  */
  const litPieces = useMemo(
    () =>
      playing && sound.hits !== false && bar && !bar.countIn
        ? piecesSoundingAt(plan, session.positionMs)
        : [],
    [playing, sound.hits, bar, plan, session.positionMs],
  )
  const musicalBars = plan.bars.filter((candidate) => !candidate.countIn).length
  /*
    Numărul măsurii vine din plan (`musicalIndex`), nu dintr-o aritmetică pe
    indici: într-un medley, măsurile n-au toate aceeași lungime și nici același
    exercițiu, deci nimic nu se mai poate socoti din poziția în listă.
  */
  const barNumber = bar && !bar.countIn ? bar.musicalIndex + 1 : 0
  const sounding = (bar && playedById.get(bar.exerciseId)) ?? exercise
  /*
    Titlul unui exercițiu din sesiune. Nu orice id are unul: modul „fill-uri
    inventate” generează un exercițiu propriu (`<id>-creative`), care nu e în
    catalog, pentru el rămâne titlul celui ales, fiindcă din el e făcut.
  */
  const titleOf = (id: string) =>
    catalogue.exercises.some((item) => item.id === id)
      ? t(catalogue.textOf(id).titleKey)
      : t(titleKey)
  /*
    Ce urmează, arătat ÎNAINTE să înceapă.

    La schimbarea de stil și la ruletă, groove-ul se schimbă din mers. Văzut abia
    când a început, prima măsură e pierdută, te uiți la ea în loc s-o cânți. Se
    arată cu tot cu notație, nu doar cu numele: „Shuffle” nu-ți spune ce cade pe
    ce timp, grila da. Sesiunea e planificată întreagă înainte de primul sunet
    (mobile/CLAUDE.md §4), deci aplicația chiar știe ce urmează.
  */
  const upcoming = useMemo(() => {
    if (!playing || !bar) return null
    const change = nextExerciseChange(plan, bar.index)
    const next = change && playedById.get(change.exerciseId)
    return next ? { exercise: next, barsUntil: change!.barsUntil } : null
  }, [playing, bar, plan, playedById])
  const beatNumber = bar
    ? Math.min(bar.beatsPerBar, Math.floor((session.positionMs - bar.atMs) / (60_000 / bar.bpm)) + 1)
    : 1
  /** Cât ai cântat, scris ca mm:ss. Are rost doar când sesiunea n-are capăt. */
  const playedClock = `${Math.floor(session.elapsedMs / 60_000)}:${String(
    Math.floor((session.elapsedMs % 60_000) / 1000),
  ).padStart(2, '0')}`

  const idle = session.phase === 'idle'

  /*
    Desenul setului se pornește doar unde chiar încape.

    Regula ecranelor de practică e că nu se derulează în timpul sesiunii: cânți
    cu bețele în mâini și telefonul sprijinit. Desenul e un plus, notația nu,
    deci când nu intră amândouă, cade desenul.

    Pragul nu e ghicit și nu e o înălțime de telefon scrisă în cod: se compară
    ce a măsurat ecranul cu ce a măsurat desenul. Un fill de șapte rânduri pe
    trei măsuri și unul de patru cer lucruri diferite, iar un prag fix ar
    greși pe amândouă.

    Socoteala nu oscilează, fiindcă `fără desen` nu depinde de decizia curentă:
    când desenul e pornit, i se scade propria înălțime.
  */
  const [kitHeight, setKitHeight] = useState(0)
  const [withoutKit, setWithoutKit] = useState(0)
  const kitBlock = kitHeight > 0 ? kitHeight + SESSION_GAP : 0
  const roomForKit =
    viewportHeight === 0 || withoutKit === 0 || kitBlock === 0
      ? true
      : viewportHeight - withoutKit >= kitBlock
  const showKit = catalogue.showKit === true && roomForKit
  /*
    Ce se măsoară e înălțimea FĂRĂ desen, nu cea cu tot.

    Scăderea se face chiar aici, în handler, iar `showKit` de care se folosește e
    cel din randarea pe care tocmai a măsurat-o, `onLayout` se cheamă după ea.
    Așa nu mai e nevoie de o a doua stare care să țină minte ce s-a desenat, iar
    socoteala nu se poate lega în buclă: `withoutKit` nu depinde de decizie.
  */
  const measure = (height: number) => setWithoutKit(height - (showKit ? kitBlock : 0))

  return (
    <View
      style={{ gap: SESSION_GAP }}
      onLayout={(event) => measure(event.nativeEvent.layout.height)}
    >
      <ConditionalKeepAwake enabled={playing} tag={`drums-${catalogue.id}`} />

      {/*
        Titlul și butonul mare stau pe același rând, sus.

        Nu e doar economie de spațiu: butonul e lucrul pe care îl atingi cu
        telefonul sprijinit de fotoliu, cu bețele în mâini. Jos, sub trei rânduri
        de opțiuni, ajungea să fie ultimul lucru de pe ecran, și primul care
        dispărea sub linia de derulare.
      */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: publicColors.ink }}>
            {t(titleKey)}
          </Text>
          {idle ? (
            <Text style={{ fontSize: 12, lineHeight: 16, color: publicColors.muted }}>
              {t(howToKey)}
            </Text>
          ) : null}
        </View>
        {session.phase === 'done' || session.phase === 'stopped' ? null : (
          <RoundAction
            icon={
              playing ? (
                <Square size={20} color="#FFFFFF" />
              ) : (
                <Play size={22} color="#FFFFFF" />
              )
            }
            label={t(playing ? 'drums.stop' : 'drums.start')}
            tone={playing ? '#C8442E' : publicColors.ink}
            onPress={playing ? stop : session.start}
          />
        )}
      </View>

      {/*
        Setul, deasupra notației, cu piesele aprinse pe măsură ce sună.

        Arată CE se cântă; notația de dedesubt arată CÂND. Pentru cineva care
        încă nu citește grila din prima, desenul e singura legătură dintre
        rândurile de pătrate și instrumentul din fața lui.

        Se stinge singur în măsura lăsată goală la fill-uri și în „Doar
        metronom", acolo aplicația chiar nu cântă nimic, și e cinstit ca
        desenul să tacă odată cu ea. E și cel mai clar semn că acum e rândul tău.
      */}
      {showKit ? (
        <View onLayout={(event) => setKitHeight(event.nativeEvent.layout.height)}>
          <KitDrawing lit={litPieces} compact />
        </View>
      ) : null}

      {/*
        Notația urmează măsura care SUNĂ, nu exercițiul ales: într-o ruletă sau la
        schimbarea de stil, altfel ai citi un groove și ai auzi altul.
      */}
      {catalogue.renderNotation({
        exercise: sounding,
        activeBar: bar && !bar.countIn ? bar.exerciseBar : -1,
        activeStep,
        // Explicațiile stau doar înainte de start: în timpul sesiunii nu mai e
        // nimic de citit acolo, doar de urmărit.
        showHint: idle,
      })}

      {idle ? (
        <>
          {/*
            Peste intervalul recomandat se poate urca, dar se și scrie. Limita
            din date rămâne adevărată, acolo se verifică regula de 90 ms dintre
            două lovituri ale aceleiași mâini, iar aplicația nu e examinator:
            îți spune unde ești, nu te oprește.
          */}
          <Stepper
            label={t('drums.tempo')}
            value={`${bpm} BPM`}
            onDown={() => setBpm((value) => Math.max(exercise.tempo.min, value - TEMPO_STEP))}
            onUp={() => setBpm((value) => Math.min(MAX_BPM, value + TEMPO_STEP))}
            downDisabled={bpm <= exercise.tempo.min}
            upDisabled={bpm >= MAX_BPM}
            note={
              bpm > exercise.tempo.max
                ? t('drums.aboveRange', { max: exercise.tempo.max })
                : undefined
            }
          />
          {modes.length > 1 ? (
            <View style={{ gap: 4 }}>
              <Label text={t('drums.mode')} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {modes.map((option) => (
                  <Choice
                    key={option.id}
                    label={t(option.labelKey)}
                    selected={option.id === modeId}
                    onPress={() => setModeId(option.id)}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 11, lineHeight: 15, color: publicColors.muted }}>
                {t(mode.howToKey)}
              </Text>
            </View>
          ) : null}
          {/*
            La „ține cât poți”, durata nu se alege: ar fi o contradicție să ceri
            asta și să spui dinainte cât ține.
          */}
          {mode.fixedDuration ? null : (
            <View style={{ gap: 4 }}>
              <Label text={t('drums.duration')} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DURATIONS.map((option) => (
                  <Choice
                    key={option}
                    label={option === Infinity ? t('drums.endless') : `${option}s`}
                    selected={seconds === option}
                    onPress={() => setSeconds(option)}
                  />
                ))}
              </View>
            </View>
          )}
          <View style={{ gap: 4 }}>
            <Label text={t('drums.sound')} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {sounds.map((option) => (
                <Choice
                  key={option.id}
                  label={t(option.labelKey)}
                  selected={option.id === soundId}
                  onPress={() => setSoundId(option.id)}
                />
              ))}
            </View>
          </View>
        </>
      ) : null}

      {playing ? (
        <>
          <View
            style={{
              alignItems: 'center',
              gap: 2,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: publicColors.border,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: publicColors.muted }}>
              {bar?.countIn
                ? t('drums.countIn')
                : endless
                  ? /*
                      Fără limită, „măsura 7 din 20” ar minți de două ori: nu e
                      din 20, și la a doua reluare ar arăta iar 7. Ce contează
                      acolo e cât ai ținut.
                    */
                    t('drums.playedFor', { clock: playedClock })
                  : t('drums.barOf', { current: Math.max(1, barNumber), total: musicalBars })}
            </Text>
            {/*
              Într-un medley se scrie ce sună ACUM. Fără asta, ai citi în capul
              paginii „Paradiddle” în timp ce ruleta cântă altceva.
            */}
            {sounding.id !== exercise.id ? (
              <Text style={{ fontSize: 14, fontWeight: '800', color: publicColors.ink }}>
                {titleOf(sounding.id)}
              </Text>
            ) : null}
            <Text style={{ fontSize: 28, lineHeight: 32, fontWeight: '900', color: publicColors.ink }}>
              {beatNumber}
            </Text>
            {/*
              Tempoul care SUNĂ, nu cel ales. La scara de tempo cele două diferă
              chiar în asta constă modul, iar afișat cel ales, urcarea ar fi
              invizibilă și modul ar părea stricat.
            */}
            <Text style={{ fontSize: 12, color: publicColors.muted }}>{bar?.bpm ?? bpm} BPM</Text>
          </View>

          {upcoming ? (
            <View
              style={{
                gap: 6,
                padding: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: publicColors.border,
                backgroundColor: '#F7F8F9',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    letterSpacing: 1,
                    color: publicColors.muted,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('drums.upNext')}
                </Text>
                <Text
                  style={{ flex: 1, fontSize: 14, fontWeight: '800', color: publicColors.ink }}
                  numberOfLines={1}
                >
                  {titleOf(upcoming.exercise.id)}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: publicColors.muted }}>
                  {t('drums.upNextIn', { count: upcoming.barsUntil })}
                </Text>
              </View>
              {/*
                Notația celui care urmează, stinsă: se citește cu coada ochiului,
                cât timp mâinile sunt încă pe groove-ul curent. Fără cursor și
                fără explicații, acolo nu se cântă încă nimic.
              */}
              <View style={{ opacity: 0.55 }}>
                {catalogue.renderNotation({
                  exercise: upcoming.exercise,
                  activeBar: -1,
                  activeStep: -1,
                  showHint: false,
                })}
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {session.phase === 'done' || session.phase === 'stopped' ? (
        <View style={{ gap: 10 }}>
          <View
            style={{
              gap: 4,
              padding: 12,
              borderRadius: 14,
              borderWidth: 2,
              borderColor:
                session.phase === 'done' || savedOnStop ? publicColors.green : publicColors.border,
              backgroundColor: session.phase === 'done' || savedOnStop ? '#EAF6EF' : '#F7F8F9',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: publicColors.ink }}>
              {t(
                session.phase === 'done' || savedOnStop ? 'drums.finished' : 'drums.stopped',
              )}
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: publicColors.muted }}>
              {session.phase === 'done'
                ? t('drums.finishedBody', { bpm: plan.peakBpm })
                : savedOnStop
                  ? t('drums.heldBody', {
                      clock: `${Math.floor(savedOnStop.seconds / 60)}:${String(
                        savedOnStop.seconds % 60,
                      ).padStart(2, '0')}`,
                      bpm: savedOnStop.bpm,
                    })
                  : t('drums.stoppedBody')}
            </Text>
          </View>
          <BigButton
            label={t('drums.again')}
            onPress={() => {
              // Sămânță nouă: o ruletă reluată nu dă aceeași ordine.
              setAttempt((value) => value + 1)
              setSavedOnStop(null)
              session.reset()
            }}
          />
          <BigButton label={t(catalogue.pickKey)} onPress={onDone} tone={publicColors.border} inkOnLight />
        </View>
      ) : null}
    </View>
  )
}

/** Butonul mare de pornire/oprire, rotund, din capul ecranului. */
function RoundAction({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: ReactNode
  label: string
  tone: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tone,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
    </Pressable>
  )
}

/** Un buton dintr-un rând de opțiuni: durata, sunetul. */
function Choice({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? publicColors.green : publicColors.border,
        backgroundColor: selected ? '#EAF6EF' : publicColors.card,
      }}
    >
      {/*
        `alignItems` centrează cutia textului, nu rândurile dinăuntru: la o
        etichetă care se rupe pe două rânduri („Scara de tempo”), al doilea
        rămânea lipit la stânga.
      */}
      <Text
        style={{ fontSize: 13, fontWeight: '700', textAlign: 'center', color: publicColors.ink }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function Label({ text }: { text: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.1,
        color: publicColors.muted,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </Text>
  )
}

function Stepper({
  label,
  value,
  onDown,
  onUp,
  downDisabled,
  upDisabled,
  note,
}: {
  label: string
  value: string
  onDown: () => void
  onUp: () => void
  downDisabled: boolean
  upDisabled: boolean
  /** Scris sub tempo când ai ieșit din intervalul recomandat. */
  note?: string
}) {
  return (
    <View style={{ gap: 4 }}>
      <Label text={label} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <RoundButton icon={<Minus size={20} color={publicColors.ink} />} onPress={onDown} disabled={downDisabled} />
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: '800',
            color: publicColors.ink,
          }}
        >
          {value}
        </Text>
        <RoundButton icon={<Plus size={20} color={publicColors.ink} />} onPress={onUp} disabled={upDisabled} />
      </View>
      {note ? (
        <Text style={{ fontSize: 11, lineHeight: 15, color: '#C8442E' }}>{note}</Text>
      ) : null}
    </View>
  )
}

function RoundButton({
  icon,
  onPress,
  disabled,
}: {
  icon: React.ReactNode
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
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

function BigButton({
  icon,
  label,
  onPress,
  tone = publicColors.ink,
  inkOnLight = false,
}: {
  icon?: React.ReactNode
  label: string
  onPress: () => void
  tone?: string
  inkOnLight?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 54,
        borderRadius: 16,
        backgroundColor: tone,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
      <Text
        style={{ fontSize: 16, fontWeight: '800', color: inkOnLight ? publicColors.ink : '#FFFFFF' }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
