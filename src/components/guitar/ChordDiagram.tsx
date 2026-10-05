import { memo } from 'react'
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg'
import { analyzeChord, type ChordShape, type ChordSpec } from '@/lib/guitar/chords'
import type { GuitarString } from '@/lib/guitar/tuning'

/*
  Diagrama unui acord (fretbox), desenată.

  Convenția din toate sursele citite (LCM, Werner, Wikibooks): liniile verticale
  sunt coardele, coarda 6 în stânga; liniile orizontale sunt prăguțele, cu
  pragul gros sus când acordul e lângă capul chitarei, altfel numărul tastei de
  start; `o` = coardă goală, `×` = coardă care nu se cântă; în puncte, degetul.

  `mirrored` e comutatorul „Diagrame oglindite (pentru stângaci)": coarda 6 trece
  în dreapta, numărul tastei trece pe partea cealaltă. Datele nu se schimbă,
  doar unde se desenează fiecare coardă.

  Tonica e colorată, pe punct și pe rândul de note: e nota care dă numele
  acordului și, la formele mobile, cea după care se mută forma pe gât.

  `memo`: React Compiler nu e pornit la rulare în sandbox, iar un ecran care se
  redesenează des (tempo, timpi) ar redesena SVG-ul fără motiv. Formele vin din
  bibliotecă sau din cache, deci aceeași formă e același obiect.
*/

const INK = '#121417'
const MUTED = '#5E656D'
const LINE = '#8A9299'
const FONT = 'Geist'

export const ChordDiagram = memo(function ChordDiagram({
  shape,
  width = 120,
  mirrored = false,
  accent = '#FF7A00',
  showNotes = false,
  spec,
}: {
  shape: ChordShape
  width?: number
  mirrored?: boolean
  accent?: string
  /** Rândul cu numele notelor sub diagramă. */
  showNotes?: boolean
  /** Notele acordului, când simbolul nu e unul din bibliotecă (acordurile din generator). */
  spec?: ChordSpec
}) {
  const { strings, baseFret, fretsShown } = analyzeChord(shape, spec)

  const side = width * 0.17
  const stringGap = (width - 2 * side) / 5
  const fretGap = stringGap * 1.3
  const top = stringGap * 1.15
  const gridHeight = fretGap * fretsShown
  const notesHeight = showNotes ? stringGap * 1.2 : stringGap * 0.35
  const height = top + gridHeight + notesHeight
  const dot = stringGap * 0.38

  /** Coloana unei coarde: coarda 6 în stânga, sau în dreapta când e oglindit. */
  const x = (string: GuitarString) => side + (mirrored ? string - 1 : 6 - string) * stringGap
  /** Mijlocul tastei, pe verticală. */
  const y = (fret: number) => top + (fret - baseFret + 0.5) * fretGap

  const barre = shape.barre
  const barreLeft = barre ? Math.min(x(barre.from), x(barre.to)) : 0
  const barreRight = barre ? Math.max(x(barre.from), x(barre.to)) : 0
  const onBarre = (entry: (typeof strings)[number]) =>
    !!barre && entry.fret === barre.fret && entry.string <= barre.from && entry.string >= barre.to
  /*
    Cifra 1 de pe bară se scrie doar dacă nu e deja pe un punct de tonică de pe
    bară: pe barré-urile scurte, cele două cifre ajungeau lipite una de alta.
  */
  const barreLabel = barre && !strings.some((entry) => onBarre(entry) && entry.isRoot)

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Prăguțele, apoi pragul. */}
      {Array.from({ length: fretsShown + 1 }, (_, index) => (
        <Line
          key={`fret-${index}`}
          x1={side}
          x2={side + 5 * stringGap}
          y1={top + index * fretGap}
          y2={top + index * fretGap}
          stroke={LINE}
          strokeWidth={1}
        />
      ))}
      {baseFret === 1 ? (
        <Rect x={side - 1} y={top - stringGap * 0.16} width={5 * stringGap + 2} height={stringGap * 0.18} fill={INK} />
      ) : (
        <SvgText
          x={mirrored ? side + 5 * stringGap + stringGap * 0.45 : side - stringGap * 0.45}
          y={y(baseFret) + stringGap * 0.15}
          fontSize={stringGap * 0.5}
          fontFamily={FONT}
          fontWeight="700"
          fill={MUTED}
          textAnchor={mirrored ? 'start' : 'end'}
        >
          {baseFret}
        </SvgText>
      )}

      {/* Coardele: cele groase, mai groase. */}
      {strings.map((entry) => (
        <Line
          key={`string-${entry.string}`}
          x1={x(entry.string)}
          x2={x(entry.string)}
          y1={top}
          y2={top + gridHeight}
          stroke={entry.fret === null ? '#B7BDC2' : LINE}
          strokeWidth={0.8 + (entry.string - 1) * 0.28}
        />
      ))}

      {/* Deasupra: goală sau nu se cântă. */}
      {strings.map((entry) => {
        const cx = x(entry.string)
        const cy = top - stringGap * 0.6
        const r = stringGap * 0.2
        if (entry.fret === 0) {
          return (
            <Circle
              key={`top-${entry.string}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={entry.isRoot ? accent : INK}
              strokeWidth={1.4}
            />
          )
        }
        if (entry.fret === null) {
          return (
            <SvgText
              key={`top-${entry.string}`}
              x={cx}
              y={cy + r * 0.85}
              fontSize={stringGap * 0.55}
              fontFamily={FONT}
              fontWeight="700"
              fill={MUTED}
              textAnchor="middle"
            >
              ×
            </SvgText>
          )
        }
        return null
      })}

      {/* Barré-ul, sub puncte. */}
      {barre ? (
        <Rect
          x={barreLeft - dot}
          y={y(barre.fret) - dot}
          width={barreRight - barreLeft + 2 * dot}
          height={2 * dot}
          rx={dot}
          fill={INK}
        />
      ) : null}

      {/* Degetele. Pe barré, doar tonica primește un punct propriu, colorat. */}
      {strings.map((entry) => {
        if (entry.fret === null || entry.fret === 0) return null
        if (onBarre(entry) && !entry.isRoot) return null
        const cx = x(entry.string)
        const cy = y(entry.fret)
        return (
          <G key={`dot-${entry.string}`}>
            <Circle cx={cx} cy={cy} r={dot} fill={entry.isRoot ? accent : INK} />
            {entry.finger ? (
              <SvgText
                x={cx}
                y={cy + dot * 0.42}
                fontSize={dot * 1.2}
                fontFamily={FONT}
                fontWeight="800"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                {entry.finger}
              </SvgText>
            ) : null}
          </G>
        )
      })}
      {barre && barreLabel ? (
        <SvgText
          x={(barreLeft + barreRight) / 2}
          y={y(barre.fret) + dot * 0.42}
          fontSize={dot * 1.2}
          fontFamily={FONT}
          fontWeight="800"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          1
        </SvgText>
      ) : null}

      {/* Notele, sub fiecare coardă. */}
      {showNotes
        ? strings.map((entry) =>
            entry.note && entry.fret !== null ? (
              <SvgText
                key={`note-${entry.string}`}
                x={x(entry.string)}
                y={top + gridHeight + stringGap * 0.85}
                fontSize={stringGap * 0.42}
                fontFamily={FONT}
                fontWeight={entry.isRoot ? '800' : '600'}
                fill={entry.isRoot ? accent : MUTED}
                textAnchor="middle"
              >
                {entry.note}
              </SvgText>
            ) : null,
          )
        : null}
    </Svg>
  )
})
