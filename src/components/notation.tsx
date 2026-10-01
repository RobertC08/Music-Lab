import { Fragment } from 'react'
import { Text, View } from 'react-native'
import Svg, { Circle, Ellipse, Path, Rect, Text as SvgText } from 'react-native-svg'
import { colors, font } from '../theme'

/**
 * Simboluri muzicale desenate, nu font: un font muzical nu e garantat pe
 * Android si pe web, iar simbolurile astea sunt continutul lectiei, nu
 * decoratie - daca nu se randeaza, lectia nu mai are obiect.
 */

export type NoteKind =
  | 'half'
  | 'halfRest'
  | 'quarter'
  | 'eighth'
  | 'eighthPair'
  | 'sixteenthGroup'
  | 'quarterRest'
  | 'eighthRest'
  | 'tiedQuarters'
  | 'tiedEighthQuarter'
  | 'dottedQuarter'
  | 'dottedEighth'
  | 'sixteenth'
  | 'tripletEighths'
  | 'sextoletSixteenths'

const STEM_TOP = 7
const HEAD_Y = 37

function NoteHead({ x, color, scale = 1 }: { x: number; color: string; scale?: number }) {
  // Rotatia se scrie ca transform SVG, nu prin `rotation`/`origin`: acelea
  // ajung pe web ca proprietati DOM invalide si umplu consola de avertismente.
  return (
    <Ellipse
      cx={x}
      cy={HEAD_Y}
      rx={7 * scale}
      ry={5.1 * scale}
      fill={color}
      transform={`rotate(-22 ${x} ${HEAD_Y})`}
    />
  )
}

function Stem({ x, color }: { x: number; color: string }) {
  return <Rect x={x - 1} y={STEM_TOP} width={2.2} height={HEAD_Y - STEM_TOP} fill={color} />
}

/** Distanta de la centrul capului de nota pana la codita. */
const STEM_OFFSET = 6.2

export function NoteSymbol({
  kind,
  height = 52,
  color = colors.ink,
}: {
  kind: NoteKind
  height?: number
  color?: string
}) {
  if (kind === 'half') {
    const width = 26
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        {/* Capul gol e ce deosebeste doimea de patrime. */}
        <Ellipse
          cx={9}
          cy={HEAD_Y}
          rx={6.4}
          ry={4.6}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          transform={`rotate(-22 9 ${HEAD_Y})`}
        />
        <Stem x={9 + STEM_OFFSET} color={color} />
      </Svg>
    )
  }

  if (kind === 'halfRest') {
    const width = 26
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <Rect x={5} y={26} width={16} height={2} fill={color} opacity={0.35} />
        {/* Pauza de doime sta deasupra liniei; cea de patrime, dedesubt. */}
        <Rect x={7} y={20} width={12} height={6} fill={color} />
      </Svg>
    )
  }

  if (kind === 'eighth') {
    const width = 26
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <NoteHead x={9} color={color} />
        <Stem x={9 + STEM_OFFSET} color={color} />
        {/* Steguletul optimii singure. */}
        <Path
          d={`M${9 + STEM_OFFSET + 1} ${STEM_TOP} C21 12 21 16 17 20`}
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    )
  }

  if (kind === 'quarter') {
    const width = 26
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <NoteHead x={9} color={color} />
        <Stem x={9 + STEM_OFFSET} color={color} />
      </Svg>
    )
  }

  if (kind === 'eighthPair') {
    const width = 46
    const first = 9
    const second = 31
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <NoteHead x={first} color={color} />
        <NoteHead x={second} color={color} />
        <Stem x={first + STEM_OFFSET} color={color} />
        <Stem x={second + STEM_OFFSET} color={color} />
        {/* Bara care leaga cele doua optimi. */}
        <Rect
          x={first + STEM_OFFSET - 1}
          y={STEM_TOP}
          width={second - first + 2.2}
          height={4.6}
          fill={color}
        />
      </Svg>
    )
  }

  if (kind === 'sixteenthGroup') {
    const width = 82
    const positions = [9, 27, 45, 63]
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        {positions.map((x) => (
          <Fragment key={x}>
            <NoteHead x={x} color={color} />
            <Stem x={x + STEM_OFFSET} color={color} />
          </Fragment>
        ))}
        {/* Doua bare: asta distinge saisprezecimea de optime. */}
        <Rect
          x={positions[0]! + STEM_OFFSET - 1}
          y={STEM_TOP}
          width={positions[3]! - positions[0]! + 2.2}
          height={4.2}
          fill={color}
        />
        <Rect
          x={positions[0]! + STEM_OFFSET - 1}
          y={STEM_TOP + 7}
          width={positions[3]! - positions[0]! + 2.2}
          height={4.2}
          fill={color}
        />
      </Svg>
    )
  }

  if (kind === 'dottedQuarter' || kind === 'dottedEighth') {
    const width = 32
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <NoteHead x={9} color={color} />
        <Stem x={9 + STEM_OFFSET} color={color} />
        {kind === 'dottedEighth' ? (
          <Path
            d={`M${9 + STEM_OFFSET + 1} ${STEM_TOP} C21 12 21 16 17 20`}
            stroke={color}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {/* Punctul, la dreapta capului: adauga jumatate din durata notei. */}
        <Circle cx={23} cy={HEAD_Y - 3} r={2.6} fill={color} />
      </Svg>
    )
  }

  if (kind === 'sixteenth') {
    const width = 26
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <NoteHead x={9} color={color} />
        <Stem x={9 + STEM_OFFSET} color={color} />
        {/* Doua steaguri: saisprezecimea singura. */}
        <Path
          d={`M${9 + STEM_OFFSET + 1} ${STEM_TOP} C21 12 21 16 17 20`}
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={`M${9 + STEM_OFFSET + 1} ${STEM_TOP + 7} C21 19 21 23 17 27`}
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    )
  }

  if (kind === 'tripletEighths') {
    const width = 64
    const positions = [9, 27, 45]
    // Codite mai scurte decat la celelalte grupuri, ca cifra 3 sa incapa
    // deasupra barei fara sa iasa din caseta. E si practica de gravura:
    // cand un numar de grup sta deasupra, coditele se scurteaza.
    const stemTop = 16
    const beamHeight = 4.4
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        {positions.map((x) => (
          <Fragment key={x}>
            <NoteHead x={x} color={color} />
            <Rect
              x={x + STEM_OFFSET - 1}
              y={stemTop}
              width={2.2}
              height={HEAD_Y - stemTop}
              fill={color}
            />
          </Fragment>
        ))}
        <Rect
          x={positions[0]! + STEM_OFFSET - 1}
          y={stemTop}
          width={positions[2]! - positions[0]! + 2.2}
          height={beamHeight}
          fill={color}
        />
        {/* Cifra 3 deasupra barei: fara ea, grupul ar parea trei optimi. */}
        <SvgText
          x={width / 2}
          y={stemTop - 3}
          fill={color}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          3
        </SvgText>
      </Svg>
    )
  }

  if (kind === 'sextoletSixteenths') {
    const width = 92
    // Sase note pe latimea unui timp: distanta dintre ele e mai mica decat la
    // grupul de saisprezecimi, altfel simbolul ar iesi de doua ori mai lat
    // decat vecinii lui si ar minti despre durata.
    const positions = [9, 23, 37, 51, 65, 79]
    // Capete mai mici: la sase note pe latimea unui timp, capetele normale se
    // ating intre ele si grupul devine o pata. Gravura face la fel.
    const headScale = 0.8
    const stemX = STEM_OFFSET * headScale
    const stemTop = 16
    const beamHeight = 4.2
    const first = positions[0]!
    const last = positions[positions.length - 1]!
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        {positions.map((x) => (
          <Fragment key={x}>
            <NoteHead x={x} color={color} scale={headScale} />
            <Rect
              x={x + stemX - 1}
              y={stemTop}
              width={2}
              height={HEAD_Y - stemTop}
              fill={color}
            />
          </Fragment>
        ))}
        {/* Doua bare, ca la saisprezecimi: sextoletul e tot o subdiviziune de
            saisprezecime, doar ca sase intra unde altfel intrau patru. */}
        <Rect
          x={first + stemX - 1}
          y={stemTop}
          width={last - first + 2}
          height={beamHeight}
          fill={color}
        />
        <Rect
          x={first + stemX - 1}
          y={stemTop + 6.6}
          width={last - first + 2}
          height={beamHeight}
          fill={color}
        />
        {/* Cifra 6: fara ea, grupul s-ar citi ca sase saisprezecimi obisnuite,
            adica un timp si jumatate. */}
        <SvgText
          x={width / 2}
          y={stemTop - 3}
          fill={color}
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          6
        </SvgText>
      </Svg>
    )
  }

  if (kind === 'tiedQuarters' || kind === 'tiedEighthQuarter') {
    const width = 54
    const first = 10
    const second = 36
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <NoteHead x={first} color={color} />
        <NoteHead x={second} color={color} />
        <Stem x={first + STEM_OFFSET} color={color} />
        <Stem x={second + STEM_OFFSET} color={color} />
        {kind === 'tiedEighthQuarter' ? (
          // Prima e optime, deci are steagul ei.
          <Path
            d={`M${first + STEM_OFFSET + 1} ${STEM_TOP} C22 12 22 16 18 20`}
            stroke={color}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {/* Arcul: semnul ca a doua nota nu se ataca, ci prelungeste prima. */}
        {/* Arcul sta in caseta: cu grosimea lui, un varf la 51.5 ar fi iesit. */}
        <Path
          d={`M${first} 44 Q${(first + second) / 2} 49.5 ${second} 44`}
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    )
  }

  if (kind === 'quarterRest') {
    const width = 26
    return (
      <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
        <Path
          d="M9 9 L17 18 L10 26 L17 34"
          stroke={color}
          strokeWidth={3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M17 34 C11 32 8 36 11.5 41"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    )
  }

  // eighthRest
  const width = 26
  return (
    <Svg width={(height * width) / 52} height={height} viewBox={`0 0 ${width} 52`}>
      <Path
        d="M16 17 L10 36"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={11.5} cy={18.5} r={4} fill={color} />
      <Path d="M11.5 14.5 C15 13.5 17 15 16.5 17.5" stroke={color} strokeWidth={2.4} fill="none" />
    </Svg>
  )
}

/** Simbolul plus eticheta lui, asa cum apare in lectie. */
export function NoteCard({
  kind,
  name,
  duration,
  color = colors.ink,
}: {
  kind: NoteKind
  name: string
  duration: string
  color?: string
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 108,
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
      }}
    >
      <View style={{ height: 52, justifyContent: 'center' }}>
        <NoteSymbol kind={kind} color={color} />
      </View>
      <Text
        style={{
          fontFamily: font,
          fontSize: 15,
          fontWeight: '800',
          color: colors.ink,
          textAlign: 'center',
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontFamily: font,
          fontSize: 13,
          lineHeight: 17,
          color: colors.muted,
          textAlign: 'center',
        }}
      >
        {duration}
      </Text>
    </View>
  )
}

export interface BeatGridCell {
  /** Cati pasi ocupa celula: 2 = patrime, 1 = optime la 8 pasi pe masura. */
  span: number
  /** Silaba de numarat afisata sub celula. */
  count: string
  /** Celula plina = se canta, goala = pauza. */
  filled: boolean
  accent?: boolean
}

/**
 * Grila de durate: latimea fiecarei celule e proportionala cu durata ei.
 * Asezata sub notatie, face legatura dintre simbol si timp.
 *
 * Cu `secondary`, deseneaza un al doilea rand pe aceeasi grila. Asa se vede
 * un poliritm: doua fluxuri masurate cu aceeasi unitate, unul sub altul -
 * altfel „trei peste doi" ramane o formula, nu o imagine.
 */
export function BeatGrid({
  cells,
  secondary,
  label,
  secondaryLabel,
  accentColor,
  secondaryColor = colors.muted,
  showCounts = true,
}: {
  cells: BeatGridCell[]
  /** Al doilea flux, pe aceeasi grila si la aceeasi latime. */
  secondary?: BeatGridCell[]
  /** Eticheta randului principal, cand sunt doua si trebuie deosebite. */
  label?: string
  secondaryLabel?: string
  accentColor: string
  secondaryColor?: string
  showCounts?: boolean
}) {
  const total = cells.reduce((sum, cell) => sum + cell.span, 0)
  return (
    <View style={{ gap: 6 }}>
      {label ? <RowLabel text={label} color={colors.ink} /> : null}
      <View style={{ flexDirection: 'row', gap: 4, height: 46 }}>
        {cells.map((cell, index) => (
          <View
            key={index}
            style={{
              flex: cell.span / total,
              borderRadius: 10,
              borderWidth: cell.filled ? 0 : 1.5,
              borderColor: colors.border,
              borderStyle: cell.filled ? 'solid' : 'dashed',
              backgroundColor: cell.filled
                ? cell.accent
                  ? colors.ink
                  : accentColor
                : '#FFFFFF',
            }}
          />
        ))}
      </View>
      {showCounts ? (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {cells.map((cell, index) => (
            <View key={index} style={{ flex: cell.span / total, alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  fontWeight: cell.accent ? '900' : '700',
                  color: cell.accent ? colors.ink : colors.muted,
                }}
              >
                {cell.count}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {secondary ? (
        <View style={{ gap: 6, marginTop: 6 }}>
          {secondaryLabel ? <RowLabel text={secondaryLabel} color={secondaryColor} /> : null}
          {/*
            Acelasi `total` ca randul de sus: latimile trebuie sa se
            suprapuna exact, altfel imaginea ar minti despre unde cad notele.
          */}
          <View style={{ flexDirection: 'row', gap: 4, height: 32 }}>
            {secondary.map((cell, index) => (
              <View
                key={index}
                style={{
                  flex: cell.span / total,
                  borderRadius: 10,
                  borderWidth: cell.filled ? 0 : 1.5,
                  borderColor: colors.border,
                  borderStyle: cell.filled ? 'solid' : 'dashed',
                  backgroundColor: cell.filled ? secondaryColor : '#FFFFFF',
                  opacity: cell.filled ? 0.6 : 1,
                }}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}

/** Eticheta unui rand de grila, cand sunt doua si trebuie deosebite. */
function RowLabel({ text, color }: { text: string; color: string }) {
  return (
    <Text
      style={{
        fontFamily: font,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.6,
        color,
      }}
    >
      {text}
    </Text>
  )
}
