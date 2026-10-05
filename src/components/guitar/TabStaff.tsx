import { memo } from 'react'
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import type { StepsPerBeat, TabStep } from '@/lib/guitar/finger-exercises'

/*
  Un rând de tabulatură.

  Convenția din toate sursele citite (skill-ul `predare-chitara`,
  `references/terminologie.md`): șase linii, coarda 1 (Mi subțire) SUS, cifrele
  sunt taste, nu degete. Tabulatura nu se oglindește niciodată, nici cu
  comutatorul pentru stângaci.

  Ce tabulatura simplă nu are, adăugăm deasupra și dedesubt, ca să nu fie
  nevoie de portativ:
  - deasupra: degetul mâinii care apasă (1-4) sau, la fingerpicking, al mâinii
    care ciupește (p i m a);
  - dedesubt: pana (⊓ în jos, V în sus) și numărătoarea timpilor, deci ritmul.
  Legato-ul e un arc între cele două note, cu h sau p deasupra.
*/

const INK = '#121417'
const MUTED = '#5E656D'
const LINE = '#9AA1A7'
const FONT = 'Geist'
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']

export const TabRow = memo(function TabRow({
  notes,
  slots,
  firstIndex,
  stepsPerBeat,
  active,
  width,
  accent,
}: {
  notes: TabStep[]
  /** Câte coloane are un rând plin: un rând scurt păstrează aceeași lățime pe notă. */
  slots: number
  /** Indexul primei note din rând, în ciclu: dă numărătoarea și barele. */
  firstIndex: number
  stepsPerBeat: StepsPerBeat
  /** Indexul notei care sună (în ciclu), sau -1. */
  active: number
  width: number
  accent: string
}) {
  const left = 22
  const gap = 12
  // Loc deasupra pentru degete și, pe coarda 1, pentru arcul de legato cu litera lui.
  const top = 40
  const height = top + gap * 5 + 46
  const column = (width - left - 8) / Math.max(1, slots, notes.length)
  const x = (index: number) => left + column * (index + 0.5)
  const y = (string: number) => top + (string - 1) * gap

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Nota care sună: o coloană aprinsă. */}
      {notes.map((_, index) =>
        firstIndex + index === active ? (
          <Rect
            key="active"
            x={x(index) - column / 2 + 1}
            y={2}
            width={column - 2}
            height={height - 4}
            rx={8}
            fill={accent}
            opacity={0.16}
          />
        ) : null,
      )}

      {STRING_NAMES.map((name, index) => (
        <SvgText key={name + index} x={8} y={y(index + 1) + 4} fontSize={10} fontFamily={FONT} fill={MUTED} textAnchor="middle">
          {name}
        </SvgText>
      ))}
      {[1, 2, 3, 4, 5, 6].map((string) => (
        <Line key={string} x1={left} x2={left + column * notes.length} y1={y(string)} y2={y(string)} stroke={LINE} strokeWidth={1} />
      ))}

      {/* Bară la începutul fiecărei măsuri, linie fină la fiecare timp. */}
      {notes.map((_, index) => {
        const absolute = firstIndex + index
        if (absolute % stepsPerBeat !== 0 || index === 0) return null
        const bar = (absolute / stepsPerBeat) % 4 === 0
        const lineX = x(index) - column / 2
        return (
          <Line
            key={`beat-${index}`}
            x1={lineX}
            x2={lineX}
            y1={y(1)}
            y2={y(6)}
            stroke={bar ? INK : LINE}
            strokeWidth={bar ? 1.4 : 0.6}
            opacity={bar ? 0.8 : 0.5}
          />
        )
      })}

      {notes.map((item, index) => {
        const absolute = firstIndex + index
        const isActive = absolute === active
        const cx = x(index)
        const beat = Math.floor(absolute / stepsPerBeat) % 4 + 1
        const position = absolute % stepsPerBeat
        const count = position === 0 ? String(beat) : stepsPerBeat === 4 ? ['', 'e', '&', 'a'][position]! : position === 1 ? '&' : 'a'
        if (!item) {
          // Pauza: o liniuță pe mijlocul portativului, și numărătoarea.
          return (
            <G key={index}>
              <SvgText x={cx} y={y(3.5) + 5} fontSize={14} fontWeight="700" fontFamily={FONT} fill={MUTED} textAnchor="middle">
                –
              </SvgText>
              <SvgText x={cx} y={y(6) + 38} fontSize={11} fontWeight={position === 0 ? '800' : '500'} fontFamily={FONT} fill={MUTED} textAnchor="middle">
                {count}
              </SvgText>
            </G>
          )
        }
        const cy = y(item.string)
        const label = String(item.fret)
        const previous = notes[index - 1]
        return (
          <G key={index}>
            {/* Arcul de legato, de la nota dinainte (dacă e pe același rând). */}
            {item.slur && previous?.string === item.string ? (
              <>
                <Path
                  d={`M ${x(index - 1)} ${cy - 7} Q ${(x(index - 1) + cx) / 2} ${cy - 15} ${cx} ${cy - 7}`}
                  stroke={accent}
                  strokeWidth={1.3}
                  fill="none"
                />
                <SvgText x={(x(index - 1) + cx) / 2} y={cy - 15} fontSize={10} fontWeight="700" fontFamily={FONT} fill={accent} textAnchor="middle">
                  {item.slur}
                </SvgText>
              </>
            ) : item.slur ? (
              <SvgText x={cx - column / 2} y={cy - 9} fontSize={10} fontWeight="700" fontFamily={FONT} fill={accent} textAnchor="middle">
                {item.slur}
              </SvgText>
            ) : null}

            {/* Tasta, pe coardă, cu fond alb ca linia să nu treacă prin cifră. */}
            <Rect x={cx - 4 - label.length * 3.5} y={cy - 7} width={8 + label.length * 7} height={14} fill={isActive ? accent : '#FFFFFF'} rx={3} />
            <SvgText x={cx} y={cy + 4.5} fontSize={13} fontWeight="800" fontFamily={FONT} fill={isActive ? '#FFFFFF' : INK} textAnchor="middle">
              {label}
            </SvgText>

            {/* Deasupra: degetul. */}
            <SvgText x={cx} y={13} fontSize={11} fontWeight="800" fontFamily={FONT} fill={accent} textAnchor="middle">
              {item.pluck ?? (item.finger === 0 ? '0' : String(item.finger))}
            </SvgText>

            {/* Dedesubt: pana, apoi numărătoarea. */}
            {item.pick ? (
              <SvgText x={cx} y={y(6) + 22} fontSize={11} fontWeight="700" fontFamily={FONT} fill={MUTED} textAnchor="middle">
                {item.pick === 'down' ? '⊓' : 'V'}
              </SvgText>
            ) : null}
            <SvgText
              x={cx}
              y={y(6) + 38}
              fontSize={11}
              fontWeight={position === 0 ? '800' : '500'}
              fontFamily={FONT}
              fill={position === 0 ? INK : MUTED}
              textAnchor="middle"
            >
              {count}
            </SvgText>
          </G>
        )
      })}
    </Svg>
  )
})
