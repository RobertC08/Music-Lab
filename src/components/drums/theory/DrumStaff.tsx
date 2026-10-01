import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import { publicColors } from '@/components/public-practice/ui'
import { type Bar, type DrumExercise, type Hit, type KitPiece } from '@/lib/drums/exercise'
import { displayBarsOf } from '@/lib/drums/notation-bars'
import {
  BEAM_GAP,
  BEAM_H,
  BEAM_STUB,
  CROSS_HEADS,
  DIAMOND_HEADS,
  HEAD_RX,
  HEAD_RY,
  HEAD_W,
  LOW_TO_HIGH,
  PAD_BOTTOM,
  SP,
  STAFF_BOTTOM,
  STAFF_H,
  STAFF_HEIGHT,
  STAFF_POSITION,
  STAFF_TOP,
  layOutStaffBar,
  yOf,
  type StaffBeam,
} from '@/lib/drums/theory/staff'

/*
  Portativul de tobe.

  Desenat de mână, ca tot restul notației din modul (`components/notation.tsx`),
  și din același motiv scris acolo: un font muzical nu e garantat pe Android și
  pe web, iar simbolurile astea SUNT conținutul lecției, nu decorul, dacă nu se
  randează, lecția nu mai are obiect.

  Ce desenează: aceleași date ca grila (`groove-grid.tsx`), în cealaltă notație.
  Cele două nu se înlocuiesc, grila e treapta, portativul e destinația, iar
  Etapa 1 din PLAN-TEORIE-TOBE.md se termină exact cu ele două una lângă alta.
  De aceea amândouă primesc `activeStep` din același ceas al pistei: dacă una
  s-ar aprinde cu un pas față de cealaltă, puntea s-ar rupe chiar în lecția care
  o construiește.

  Ce NU face: nu e un gravor de partituri. Nu știe legături, nu știe măsuri
  compuse și nu desenează pauzele exact cum le-ar aranja un editor profesionist.
  Știe atât cât cere un manual de tobe, și atât cât poate fi ținut corect.

  Socoteala, pozițiile, duratele scrise, gruparea, stă în
  `lib/drums/theory/staff.ts`, ca să poată fi testată în Node: un test care ar
  importa fișierul ăsta ar trage react-native-svg după el, adică sintaxă Flow.
  Aici a rămas doar desenul.
*/

export interface DrumStaffProps {
  exercise: DrumExercise
  /** Măsura care se aude acum; `-1` cât timp nu se aude nimic. */
  activeBar?: number
  /** Pasul care se aude acum; `-1` la fel. */
  activeStep?: number
  /** Culoarea etapei, pentru pasul aprins. */
  accent?: string
}

/**
 * Un exercițiu, scris pe portativ.
 *
 * Aceleași măsuri identice se strâng cu „×2" ca la grilă (`collapseBars`): un
 * exemplu de manual se citește dintr-o privire sau nu se citește deloc.
 */
export function DrumStaff({
  exercise,
  activeBar = -1,
  activeStep = -1,
  accent = publicColors.ink,
}: DrumStaffProps) {
  const displayBars = displayBarsOf(exercise)
  return (
    <View style={{ gap: 8 }}>
      {displayBars.map(({ bar, sourceBars }, index) => (
        <StaffBar
          key={index}
          exercise={exercise}
          lanes={bar.lanes}
          repeats={sourceBars.length}
          activeStep={sourceBars.includes(activeBar) ? activeStep : -1}
          accent={accent}
        />
      ))}
    </View>
  )
}

/**
 * Cheia portativului: unde stă fiecare piesă, cu numele dedesubt.
 *
 * Pusă în ordine de la cea mai joasă la cea mai înaltă, nu în ordinea grilei.
 * Așezate așa, notele urcă în trepte de la stânga la dreapta, iar regula pe care
 * lecția o predă, ce sună mai înalt stă mai sus, se vede înainte să fie
 * citită. În ordinea grilei ar fi fost o listă corectă din care nu se învață
 * nimic.
 */
/**
 * Felurile de lovitură ale tobei mici, ca legendă.
 *
 * Toate cinci se scriu pe același loc, spațiul tobei mici, și se deosebesc
 * doar prin cap și prin semnul de deasupra. De aceea legenda le pune una lângă
 * alta: separate, în cinci exemple, nimeni n-ar vedea că diferența e chiar asta.
 *
 * Cross-stick-ul și rimshot-ul nu se aud în aplicație: kitul n-are mostre pentru
 * ele. Deci se predau citite, nu ascultate, iar lecția o spune pe față, un
 * exemplu care ar reda o tobă mică normală în locul lor ar preda greșit tocmai
 * ce încearcă să arate.
 */
export function DrumHeadsKey() {
  const { t } = useTranslation()
  const stepW = 40
  const kinds = ['normal', 'accent', 'ghost', 'crossStick', 'rimshot'] as const
  const width = HEAD_W + kinds.length * stepW + 8
  const top = STAFF_TOP - 16
  const height = STAFF_HEIGHT - top + 14
  const y = yOf(STAFF_POSITION.snare)

  return (
    <Scaled width={width} height={height} top={top}>
      <StaffLines width={width} />
      <NeutralClef />
      {kinds.map((kind, index) => {
        const x = HEAD_W + stepW * index + stepW / 2
        return (
          <G key={kind}>
            {kind === 'crossStick' ? (
              <G>
                <Line
                  x1={x - 4}
                  x2={x + 4}
                  y1={y - 4}
                  y2={y + 4}
                  stroke={publicColors.ink}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Line
                  x1={x - 4}
                  x2={x + 4}
                  y1={y + 4}
                  y2={y - 4}
                  stroke={publicColors.ink}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </G>
            ) : (
              <NoteHead
                piece="snare"
                hit={kind === 'ghost' ? 'ghost' : 'normal'}
                x={x}
                color={publicColors.ink}
              />
            )}
            {/* Rimshot: linia oblică peste cap, convenția cea mai răspândită. */}
            {kind === 'rimshot' ? (
              <Line
                x1={x - 7}
                x2={x + 7}
                y1={y + 6}
                y2={y - 6}
                stroke={publicColors.ink}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            ) : null}
            <Rect x={x + HEAD_RX - 1.6} y={y - 24} width={2} height={24} fill={publicColors.ink} />
            {kind === 'accent' ? (
              <Path
                d={`M${x - 4} ${y - 30} l8 3 l-8 3`}
                stroke={publicColors.ink}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
            <SvgText
              x={x}
              y={STAFF_BOTTOM + PAD_BOTTOM + 8}
              fontSize={7.5}
              fontWeight="700"
              fill={publicColors.muted}
              textAnchor="middle"
            >
              {t(`drums.head_${kind}`)}
            </SvgText>
          </G>
        )
      })}
    </Scaled>
  )
}

export function DrumStaffKey() {
  const { t } = useTranslation()
  const stepW = 26
  const width = HEAD_W + LOW_TO_HIGH.length * stepW + 8
  // Fereastra începe chiar deasupra crash-ului, nu de la zero: în cheie nu sunt
  // codițe, deci locul rezervat lor ar fi rămas gol. Jos, în schimb, e nevoie de
  // mai mult decât la o măsură obișnuită, acolo stau numele pieselor.
  const top = STAFF_TOP - 16
  const height = STAFF_HEIGHT - top + 14

  return (
    <Scaled width={width} height={height} top={top}>
      <StaffLines width={width} />
      <NeutralClef />
      {LOW_TO_HIGH.map((piece, index) => {
        const x = HEAD_W + stepW * index + stepW / 2
        return (
          <G key={piece}>
            <NoteHead piece={piece} x={x} color={publicColors.ink} />
            <SvgText
              x={x}
              y={STAFF_BOTTOM + PAD_BOTTOM + 8}
              fontSize={8}
              fontWeight="700"
              fill={publicColors.muted}
              textAnchor="middle"
            >
              {t(`drums.pieceShort_${piece}`)}
            </SvgText>
          </G>
        )
      })}
    </Scaled>
  )
}

function StaffBar({
  exercise,
  lanes,
  repeats,
  activeStep,
  accent,
}: {
  exercise: DrumExercise
  lanes: Bar['lanes']
  repeats: number
  activeStep: number
  accent: string
}) {
  const { stepsPerBar, beatsPerBar } = exercise
  const stepsPerBeat = stepsPerBar / beatsPerBar
  // Pașii înghesuiți primesc mai puțin loc, dar nu sub lățimea unui cap de notă
  // cu codiță: sub atât, două șaisprezecimi alăturate se ating.
  const stepW = stepsPerBar > 8 ? 15 : 24
  const width = HEAD_W + stepsPerBar * stepW + 10
  const xOf = (step: number) => HEAD_W + stepW * step + stepW / 2

  const columns = Array.from({ length: stepsPerBar }, (_, step) =>
    (Object.keys(lanes) as KitPiece[]).flatMap((piece) => {
      const hit = lanes[piece]?.[step]
      return hit ? [{ piece, hit }] : []
    }),
  )
  const events = layOutStaffBar(columns, stepsPerBeat)

  return (
    <Scaled width={width} height={STAFF_HEIGHT}>
      {/*
        Pasul care se aude, ca fundal, aceeași aprindere ca la grilă și din
        același ceas. Desenat primul, ca să stea sub note.
      */}
      {activeStep >= 0 ? (
        <Rect
          x={xOf(activeStep) - stepW / 2}
          y={STAFF_TOP - 20}
          width={stepW}
          height={STAFF_H + 30}
          rx={5}
          fill={accent}
          opacity={0.12}
        />
      ) : null}

      <StaffLines width={width} />
      <NeutralClef />
      <TimeSignature beats={beatsPerBar} />

      {events.rests.map((event) => (
        <RestGlyph key={`r${event.step}`} x={xOf(event.step)} beams={event.beams} />
      ))}

      {events.notes.map((event) => {
        const lit = event.step === activeStep
        const color = lit ? accent : publicColors.ink
        return (
          <G key={`n${event.step}`}>
            {event.pieces.map(({ piece, hit }) => (
              <NoteHead
                key={piece}
                piece={piece}
                hit={hit}
                x={xOf(event.step)}
                color={color}
              />
            ))}
            <Stem
              x={xOf(event.step)}
              pieces={event.pieces.map((entry) => entry.piece)}
              top={event.stemTop}
              color={color}
              // Steagul se desenează doar pe nota singură: într-un grup, bara
              // ține locul steagurilor, iar amândouă ar fi o greșeală de tipar.
              flags={event.beamed ? 0 : event.beams}
            />
            {/*
              Accentul, deasupra codiței.

              Acolo îl pun cărțile de tobe, și acolo se vede pe o măsură plină.
              Lângă cap, pe partea opusă codiței, ar fi convenția generală de
              notație, dar pe un portativ de tobe capul ăla are des altul
              dedesubt, iar semnul ar ajunge între două note.
            */}
            {event.accented ? (
              <Path
                d={`M${xOf(event.step) - 4} ${event.stemTop - 6} l8 3 l-8 3`}
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
          </G>
        )
      })}

      {events.beams.map((beam, index) => (
        <BeamSegment
          key={`b${beam.level}-${index}`}
          from={xOf(beam.from)}
          to={xOf(beam.to)}
          beam={beam}
        />
      ))}

      <BeatNumbers beats={beatsPerBar} stepsPerBeat={stepsPerBeat} xOf={xOf} />

      {repeats > 1 ? (
        <SvgText
          x={width - 6}
          y={STAFF_TOP - 8}
          fontSize={9}
          fontWeight="800"
          fill={publicColors.muted}
          textAnchor="end"
        >
          ×{repeats}
        </SvgText>
      ) : null}
    </Scaled>
  )
}

/* ---- desenul propriu-zis ---- */

/**
 * SVG-ul, întins pe toată lățimea disponibilă fără să se deformeze.
 *
 * Înălțimea vine din `aspectRatio`, nu dintr-o măsurătoare cu `onLayout`: așa
 * locul e rezervat corect din prima trecere, deci portativul nu apare după ce
 * lecția s-a așezat deja, o săritură de layout sub un text pe care tocmai îl
 * citești e mai supărătoare decât orice câștig de precizie.
 */
function Scaled({
  width,
  height,
  top = 0,
  children,
}: {
  width: number
  height: number
  /**
   * De unde începe fereastra, pe verticală.
   *
   * Portativul rezervă deasupra lui loc de codițe. Cheia n-are codițe, deci
   * decupată de la 0 ar fi o treime spațiu gol, iar desenul s-ar micșora cu
   * atât, pe un telefon, exact cât trebuie ca să nu se mai distingă un × de un
   * cap rotund. Se mută fereastra, nu coordonatele: pozițiile rămân aceleași în
   * amândouă desenele, deci rămân și comparabile.
   */
  top?: number
  children: React.ReactNode
}) {
  return (
    <View style={{ width: '100%', aspectRatio: width / height }}>
      <Svg width="100%" height="100%" viewBox={`0 ${top} ${width} ${height}`}>
        {children}
      </Svg>
    </View>
  )
}

function StaffLines({ width }: { width: number }) {
  return (
    <G>
      {[0, 1, 2, 3, 4].map((line) => (
        <Line
          key={line}
          x1={0}
          x2={width}
          y1={STAFF_TOP + line * SP}
          y2={STAFF_TOP + line * SP}
          stroke={publicColors.border}
          strokeWidth={1.1}
        />
      ))}
      {/* Bara de final: fără ea, portativul pare tăiat de marginea ecranului. */}
      <Line
        x1={width - 1}
        x2={width - 1}
        y1={STAFF_TOP}
        y2={STAFF_BOTTOM}
        stroke={publicColors.border}
        strokeWidth={2}
      />
    </G>
  )
}

/**
 * Clefa neutră: două bare verticale groase.
 *
 * Se pune fiindcă tobele sunt percuție nedeterminată, nu există „do" pe un
 * portativ de tobe, iar o cheie sol sau fa ar promite înălțimi care nu există.
 */
function NeutralClef() {
  const x = 8
  return (
    <G>
      <Rect x={x} y={STAFF_TOP + SP} width={3.2} height={SP * 2} fill={publicColors.ink} />
      <Rect x={x + 6} y={STAFF_TOP + SP} width={3.2} height={SP * 2} fill={publicColors.ink} />
    </G>
  )
}

/** Indicația de măsură. Numitorul e 4 peste tot în manual, deocamdată. */
function TimeSignature({ beats }: { beats: number }) {
  return (
    <G>
      <SvgText
        x={22}
        y={STAFF_TOP + SP * 1.75}
        fontSize={13}
        fontWeight="800"
        fill={publicColors.ink}
        textAnchor="middle"
      >
        {beats}
      </SvgText>
      <SvgText
        x={22}
        y={STAFF_TOP + SP * 3.75}
        fontSize={13}
        fontWeight="800"
        fill={publicColors.ink}
        textAnchor="middle"
      >
        4
      </SvgText>
    </G>
  )
}

function NoteHead({
  piece,
  hit = 'normal',
  x,
  color,
}: {
  piece: KitPiece
  hit?: Hit
  x: number
  color: string
}) {
  const y = yOf(STAFF_POSITION[piece])
  const ledger = STAFF_POSITION[piece] >= 10
  return (
    <G>
      {/*
        Ghost note-ul: capul în paranteze.

        Nu un cap mai mic și nu unul mai palid, parantezele sunt convenția, și
        sunt și singura care se citește la orice mărime. Un cap cu 20% mai mic
        pe un ecran de telefon nu se deosebește de unul normal.
      */}
      {hit === 'ghost' ? (
        <G>
          <Path
            d={`M${x - 7} ${y - 4.5} q-2.2 4.5 0 9`}
            stroke={color}
            strokeWidth={1.3}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M${x + 7} ${y - 4.5} q2.2 4.5 0 9`}
            stroke={color}
            strokeWidth={1.3}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ) : null}
      {/*
        Linia suplimentară a crash-ului: fără ea, nota plutește deasupra.

        Desenată în culoarea NOTEI, nu în cea a portativului. E parte din notă,
        o poziție, nu o linie de portativ, iar în gri deschis se pierdea de
        tot la lățimea unui telefon, adică exact acolo unde e citită.
      */}
      {ledger ? (
        <Line
          // Lată: la ±8 și grosimea capului, linia și ×-ul crash-ului se citeau
          // împreună ca un asterisc, nu ca o notă pe o linie.
          x1={x - HEAD_RX - 6}
          x2={x + HEAD_RX + 6}
          y1={y}
          y2={y}
          stroke={color}
          strokeWidth={1.2}
        />
      ) : null}
      {DIAMOND_HEADS.includes(piece) ? (
        <Path
          d={`M${x} ${y - 4.5} L${x + 4.5} ${y} L${x} ${y + 4.5} L${x - 4.5} ${y} Z`}
          stroke={color}
          strokeWidth={1.6}
          fill="none"
        />
      ) : CROSS_HEADS.includes(piece) ? (
        <G>
          <Line
            x1={x - 4}
            x2={x + 4}
            y1={y - 4}
            y2={y + 4}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Line
            x1={x - 4}
            x2={x + 4}
            y1={y + 4}
            y2={y - 4}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </G>
      ) : (
        <Ellipse
          cx={x}
          cy={y}
          rx={HEAD_RX}
          ry={HEAD_RY}
          fill={color}
          transform={`rotate(-20 ${x} ${y})`}
        />
      )}
      {/* Fusul deschis: cerculețul deasupra ×-ului, convenția standard. */}
      {piece === 'hhOpen' ? (
        <Ellipse
          cx={x}
          cy={y - 8}
          rx={2.6}
          ry={2.6}
          fill="none"
          stroke={color}
          strokeWidth={1.4}
        />
      ) : null}
    </G>
  )
}

/**
 * Codița, plus steagurile când nota stă singură.
 *
 * Una singură pentru toată coloana, pornită de la capul cel mai de jos: pe un
 * portativ de tobe, ce se lovește deodată se scrie pe aceeași codiță. Câte una
 * pe piesă ar arăta ca lovituri separate, adică exact opusul.
 */
function Stem({
  x,
  pieces,
  top,
  color,
  flags,
}: {
  x: number
  pieces: readonly KitPiece[]
  top: number
  color: string
  flags: number
}) {
  const lowest = Math.max(...pieces.map((piece) => yOf(STAFF_POSITION[piece])))
  const stemX = x + HEAD_RX - 0.6
  return (
    <G>
      <Rect x={stemX - 1} y={top} width={2} height={lowest - top} fill={color} />
      {Array.from({ length: flags }, (_, index) => (
        <Path
          key={index}
          d={`M${stemX} ${top + index * BEAM_GAP} c6 3 8 7 7 12`}
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </G>
  )
}

/**
 * O bucată de bară de grupare.
 *
 * Nivelul spune la ce înălțime cade: prima bară pornește de la vârful codițelor,
 * a doua cu `BEAM_GAP` mai jos. Un ciot (`stub`) ține de o singură notă și se
 * desenează scurt, într-o parte, vezi `beamSegments` pentru când și de ce.
 */
function BeamSegment({ from, to, beam }: { from: number; to: number; beam: StaffBeam }) {
  const left = from + HEAD_RX - 1.6
  const y = beam.stemTop + (beam.level - 1) * BEAM_GAP
  // Un ciot pornește sau se termină la codiță; o bară adevărată le leagă pe două.
  const x = beam.stub === 'left' ? left - BEAM_STUB : left
  const width = beam.stub ? BEAM_STUB + 2 : to - from + 2

  return (
    <G>
      <Rect x={x} y={y} width={width} height={BEAM_H} fill={publicColors.ink} />
      {/* Cifra grupului, când timpul nu se împarte în două: triolet, sextolet. */}
      {beam.tuplet > 0 ? (
        <SvgText
          x={left + (to - from) / 2}
          y={y - 3}
          fontSize={8}
          fontWeight="700"
          fontStyle="italic"
          fill={publicColors.muted}
          textAnchor="middle"
        >
          {beam.tuplet}
        </SvgText>
      ) : null}
    </G>
  )
}

function RestGlyph({ x, beams }: { x: number; beams: number }) {
  const y = STAFF_TOP + SP * 1.2
  if (beams === 0) {
    // Pauza de pătrime, aceeași formă ca la ritm (`components/notation.tsx`).
    return (
      <G>
        <Path
          d={`M${x - 3} ${y} L${x + 3} ${y + 6} L${x - 2} ${y + 12} L${x + 3} ${y + 18}`}
          stroke={publicColors.muted}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d={`M${x + 3} ${y + 18} c-4 -1.5 -6 1.5 -3.5 5`}
          stroke={publicColors.muted}
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    )
  }
  // Pauza de optime și de șaisprezecime: același băț, cu unul sau două cârlige.
  return (
    <G>
      <Line
        x1={x + 2.5}
        x2={x - 2}
        y1={y + 2}
        y2={y + 16}
        stroke={publicColors.muted}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {Array.from({ length: beams }, (_, index) => (
        <G key={index}>
          <Ellipse
            cx={x - 1.6}
            cy={y + 3 + index * 5}
            rx={2.5}
            ry={2.5}
            fill={publicColors.muted}
          />
          <Path
            d={`M${x - 1.6} ${y + 0.5 + index * 5} c3 -1 4.6 0.3 4.1 2.5`}
            stroke={publicColors.muted}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ))}
    </G>
  )
}

function BeatNumbers({
  beats,
  stepsPerBeat,
  xOf,
}: {
  beats: number
  stepsPerBeat: number
  xOf: (step: number) => number
}) {
  return (
    <G>
      {Array.from({ length: beats }, (_, beat) => (
        <SvgText
          key={beat}
          x={xOf(beat * stepsPerBeat)}
          y={STAFF_BOTTOM + 15}
          fontSize={8}
          fill={publicColors.muted}
          textAnchor="middle"
        >
          {beat + 1}
        </SvgText>
      ))}
    </G>
  )
}
