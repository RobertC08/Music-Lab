import { memo } from 'react'
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg'
import type { PositionNote } from '@/lib/guitar/positions'

/*
  Griful, orizontal, cu notele unei poziții.

  Convenția gâtului văzut din ochii chitaristului, ca tabulatura: coarda 1 (Mi
  subțire) SUS, coarda 6 jos, tastele cresc spre dreapta (skill-ul
  `predare-chitara`, „Reperul vizual"). Cu „Diagrame oglindite" pornit, gâtul se
  întoarce: tastele cresc spre stânga, cum îl vede un stângaci. Coardele rămân
  la locul lor.

  Se desenează doar fereastra poziției, cu o tastă în plus de fiecare parte,
  ca să se vadă unde stă mâna. Lângă tasta 1, apare prăguțul (linia groasă) și
  coloana coardelor goale.

  Trei feluri de puncte:
  - tonica: plină, în culoarea secțiunii, ușor de găsit dintr-o privire;
  - celelalte note: albe, cu contur;
  - nota de cântat acum: mare, închisă la culoare, cu un inel în jur.
*/

const INK = '#121417'
const MUTED = '#5E656D'
const STRING = '#8D949B'
const WIRE = '#C3C8CD'
const WOOD = '#FBF7F1'
const INLAY = '#E7DFD3'
const FONT = 'Geist'
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const INLAYS = [3, 5, 7, 9, 15, 17]

export const noteId = (note: { string: number; fret: number }) => `${note.string}:${note.fret}`

export const Fretboard = memo(function Fretboard({
  notes,
  minFret,
  maxFret,
  width,
  accent,
  mirrored = false,
  active = null,
  label = (note) => note.degree,
}: {
  notes: readonly PositionNote[]
  minFret: number
  maxFret: number
  width: number
  accent: string
  mirrored?: boolean
  /** `noteId` al notei de cântat acum, sau null. */
  active?: string | null
  label?: (note: PositionNote) => string
}) {
  const first = Math.max(1, minFret - 1)
  const last = Math.max(first + 3, maxFret + 1)
  const open = first === 1
  const rowGap = 26
  const top = 16
  const names = 16
  const openColumn = open ? 26 : 0
  const right = 8
  const columns = last - first + 1
  const column = (width - names - openColumn - right) / columns
  const neckLeft = names + openColumn
  const neckRight = width - right
  const bottom = top + rowGap * 5
  const height = bottom + 30

  // În coordonate de dreptaci; oglindirea întoarce doar axa orizontală, nu și textul.
  const flip = (x: number) => (mirrored ? width - x : x)
  const fretX = (fret: number) => (fret === 0 ? names + openColumn / 2 - 2 : neckLeft + column * (fret - first + 0.5))
  const wireX = (wire: number) => neckLeft + column * (wire - first + 1)
  const y = (string: number) => top + (string - 1) * rowGap
  const radius = Math.min(11, column * 0.34, rowGap * 0.44)

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect
        x={Math.min(flip(neckLeft), flip(neckRight))}
        y={top - 8}
        width={neckRight - neckLeft}
        height={bottom - top + 16}
        fill={WOOD}
      />
      {/* Semnele de pe tastatură: un punct la 3, 5, 7, 9, două la 12. */}
      {Array.from({ length: columns }, (_, index) => first + index).map((fret) =>
        fret === 12 ? (
          <G key={fret}>
            <Circle cx={flip(fretX(fret))} cy={y(2) + rowGap / 2} r={4} fill={INLAY} />
            <Circle cx={flip(fretX(fret))} cy={y(4) + rowGap / 2} r={4} fill={INLAY} />
          </G>
        ) : INLAYS.includes(fret) ? (
          <Circle key={fret} cx={flip(fretX(fret))} cy={y(3) + rowGap / 2} r={4} fill={INLAY} />
        ) : null,
      )}
      {/* Prăguțurile; lângă tasta 1, prăguțul de sus, gros. */}
      {open ? <Line x1={flip(neckLeft)} x2={flip(neckLeft)} y1={top - 8} y2={bottom + 8} stroke={INK} strokeWidth={5} /> : null}
      {Array.from({ length: columns + (open ? 0 : 1) }, (_, index) => (open ? first + index : first - 1 + index)).map((wire) => (
        <Line key={wire} x1={flip(wireX(wire))} x2={flip(wireX(wire))} y1={top - 8} y2={bottom + 8} stroke={WIRE} strokeWidth={2} />
      ))}
      {/* Coardele, mai groase spre coarda 6. */}
      {[1, 2, 3, 4, 5, 6].map((string) => (
        <G key={string}>
          <SvgText x={flip(names / 2)} y={y(string) + 4} fontSize={11} fontWeight="700" fill={MUTED} textAnchor="middle" fontFamily={FONT}>
            {STRING_NAMES[string - 1]}
          </SvgText>
          <Line
            x1={flip(open ? names + 4 : neckLeft)}
            x2={flip(neckRight)}
            y1={y(string)}
            y2={y(string)}
            stroke={STRING}
            strokeWidth={0.8 + (string - 1) * 0.3}
          />
        </G>
      ))}
      {/* Numerele tastelor, sub gât. */}
      {Array.from({ length: columns }, (_, index) => first + index).map((fret) => (
        <SvgText
          key={fret}
          x={flip(fretX(fret))}
          y={bottom + 24}
          fontSize={11}
          fontWeight={fret >= minFret && fret <= maxFret ? '800' : '500'}
          fill={fret >= minFret && fret <= maxFret ? INK : MUTED}
          textAnchor="middle"
          fontFamily={FONT}
        >
          {fret}
        </SvgText>
      ))}
      {notes.map((note) => {
        const id = noteId(note)
        const isActive = id === active
        const cx = flip(fretX(note.fret))
        const cy = y(note.string)
        const r = isActive ? radius + 3 : radius
        const fill = isActive ? INK : note.root ? accent : '#FFFFFF'
        const text = isActive || note.root ? '#FFFFFF' : INK
        return (
          <G key={id}>
            {isActive ? <Circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={accent} strokeWidth={2.5} /> : null}
            <Circle cx={cx} cy={cy} r={r} fill={fill} stroke={note.root || isActive ? fill : accent} strokeWidth={1.8} />
            <SvgText x={cx} y={cy + 3.8} fontSize={r > 10 ? 11 : 10} fontWeight="800" fill={text} textAnchor="middle" fontFamily={FONT}>
              {label(note)}
            </SvgText>
          </G>
        )
      })}
    </Svg>
  )
})
