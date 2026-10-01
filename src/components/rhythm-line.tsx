import { Text, View } from 'react-native'
import { colors, font, judgementColors } from '../theme'
import { NoteSymbol, type NoteKind } from './notation'
import type { HoldJudgement } from '../game/rhythm'
import {
  TICKS_PER_BAR,
  splitIntoBars,
  tokenSpan,
  type RhythmToken,
  type TokenJudgement,
} from '../game/notation-tokens'

export interface TokenHold {
  judgement: HoldJudgement
  /** Cat s-a tinut, impartit la cat trebuia. 1 = exact. */
  ratio: number
}

/** Fiecare token are un simbol scris; numele coincid cu cele din NoteSymbol. */
const symbolFor: Record<RhythmToken, NoteKind> = {
  half: 'half',
  halfRest: 'halfRest',
  quarter: 'quarter',
  quarterRest: 'quarterRest',
  eighth: 'eighth',
  eighthRest: 'eighthRest',
  eighthPair: 'eighthPair',
  sixteenthGroup: 'sixteenthGroup',
  tiedQuarters: 'tiedQuarters',
  tiedEighthQuarter: 'tiedEighthQuarter',
  dottedQuarter: 'dottedQuarter',
  dottedEighth: 'dottedEighth',
  sixteenth: 'sixteenth',
  tripletEighths: 'tripletEighths',
  sextoletSixteenths: 'sextoletSixteenths',
}

/**
 * Randeaza notatia pe o linie, cu bare de masura. Latimea fiecarui simbol e
 * proportionala cu durata lui - asa se vede, nu doar se citeste, ca doimea
 * tine cat doua patrimi.
 */
export function RhythmLine({
  tokens,
  ticksPerBar = TICKS_PER_BAR,
  height = 44,
  highlightIndex,
  judgements,
  holds,
  color = colors.ink,
}: {
  tokens: RhythmToken[]
  /**
   * Cat tine o masura, in saisprezecimi. Implicit 48, adica 4/4. Se da ca
   * lungime, nu ca numar de timpi, fiindca in masurile compuse timpul nu e
   * patrimea: in 6/8 masura are 36 de pasi, dar doi timpi.
   */
  ticksPerBar?: number
  height?: number
  /** Tokenul curent, cand linia insoteste o redare. */
  highlightIndex?: number
  /**
   * Verdictul fiecarui simbol, dupa evaluare. Coloreaza notatia insasi, ca
   * elevul sa vada pe care simbol a gresit - nu doar ca a gresit.
   */
  judgements?: (TokenJudgement | null)[]
  /**
   * Cat a tinut elevul fiecare nota, raportat la durata scrisa. Culoarea
   * simbolului spune doar daca atacul a cazut la timp; banda de dedesubt
   * spune daca nota a fost tinuta cat trebuia - altfel o doime ciupita
   * arata identic cu una cantata corect.
   */
  holds?: (TokenHold | null)[]
  color?: string
}) {
  const bars = splitIntoBars(tokens, ticksPerBar)
  let offset = 0

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 6,
        gap: 6,
      }}
    >
      {bars.map((bar, barIndex) => {
        const barStart = offset
        offset += bar.length
        return (
          <View
            key={barIndex}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              borderLeftWidth: barIndex === 0 ? 0 : 2,
              borderLeftColor: colors.border,
              paddingLeft: barIndex === 0 ? 0 : 6,
            }}
          >
            {bar.map((token, index) => {
              const globalIndex = barStart + index
              const active = highlightIndex === globalIndex
              const verdict = judgements?.[globalIndex] ?? null
              const verdictColor = verdict ? judgementColors[verdict] : null
              const hold = holds?.[globalIndex] ?? null
              return (
                <View
                  key={`${token}-${index}`}
                  style={{
                    flex: tokenSpan(token) / ticksPerBar,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingVertical: 4,
                    paddingHorizontal: 2,
                    borderRadius: 8,
                    backgroundColor: verdictColor
                      ? `${verdictColor}1A`
                      : active
                        ? '#FFE7CC'
                        : 'transparent',
                  }}
                >
                  <NoteSymbol
                    kind={symbolFor[token]}
                    height={height}
                    color={verdictColor ?? color}
                  />
                  {hold ? <HoldBar hold={hold} /> : null}
                </View>
              )
            })}
          </View>
        )
      })}
    </View>
  )
}

/**
 * Banda de durata: sina arata cat trebuia tinuta nota, umplutura cat s-a
 * tinut efectiv. O nota ciupita se vede ca o umplutura scurta, una tinuta
 * prea mult depaseste sina.
 */
function HoldBar({ hold }: { hold: TokenHold }) {
  const ok = hold.judgement === 'ok'
  const barColor = ok ? judgementColors.perfect : judgementColors.late
  const fill = Math.max(0.04, Math.min(1, hold.ratio))
  const overflows = hold.ratio > 1.02
  return (
    <View style={{ width: '100%', marginTop: 5, gap: 2, alignItems: 'center' }}>
      <View
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          backgroundColor: '#E9EDF0',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${fill * 100}%`,
            height: '100%',
            borderRadius: 3,
            backgroundColor: barColor,
          }}
        />
      </View>
      {!ok ? (
        <Text
          numberOfLines={1}
          style={{ fontFamily: font, fontSize: 10, fontWeight: '800', color: barColor }}
        >
          {overflows ? 'prea lung' : 'prea scurt'}
        </Text>
      ) : null}
    </View>
  )
}

interface StackRow {
  label: string
  /** Cate celule egale are randul: 4 = patrimi, 8 = optimi, 16 = saisprezecimi. */
  cells: number
  counts: string[]
  dim?: boolean
}

/**
 * Stiva de durate: aceeasi masura impartita in patrimi, optimi si
 * saisprezecimi, una sub alta si la aceeasi latime.
 *
 * Grila izolata dintr-o singura lectie nu spunea nimic - patru dreptunghiuri
 * identice nu arata ca latimea inseamna durata. Comparatia e lectia.
 */
export function DurationStack({
  highlight,
  accentColor,
}: {
  /** Randul scos in evidenta; celelalte raman estompate. */
  highlight: 'quarter' | 'eighth' | 'sixteenth'
  accentColor: string
}) {
  const rows: StackRow[] = [
    {
      label: 'PĂTRIMI',
      cells: 4,
      counts: ['1', '2', '3', '4'],
      dim: highlight !== 'quarter',
    },
    {
      label: 'OPTIMI',
      cells: 8,
      counts: ['1', 'și', '2', 'și', '3', 'și', '4', 'și'],
      dim: highlight !== 'eighth',
    },
    {
      label: 'ȘAISPREZECIMI',
      cells: 16,
      counts: ['1', 'e', 'și', 'a', '2', 'e', 'și', 'a', '3', 'e', 'și', 'a', '4', 'e', 'și', 'a'],
      dim: highlight !== 'sixteenth',
    },
  ]

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: font, fontSize: 13, fontWeight: '800', color: colors.muted }}>
        O MĂSURĂ DE 4/4, ÎMPĂRȚITĂ ÎN TREI FELURI
      </Text>
      {rows.map((row) => (
        <View key={row.label} style={{ gap: 5, opacity: row.dim ? 0.38 : 1 }}>
          <Text
            style={{
              fontFamily: font,
              fontSize: 11,
              fontWeight: '900',
              letterSpacing: 0.6,
              color: row.dim ? colors.muted : colors.ink,
            }}
          >
            {row.label}
          </Text>
          <View style={{ flexDirection: 'row', gap: 3, height: row.dim ? 22 : 30 }}>
            {Array.from({ length: row.cells }, (_, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  borderRadius: 6,
                  backgroundColor: index === 0 ? colors.ink : accentColor,
                }}
              />
            ))}
          </View>
          {!row.dim ? (
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {row.counts.map((count, index) => (
                <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: font,
                      fontSize: row.cells > 8 ? 10 : 12,
                      fontWeight: index === 0 ? '900' : '700',
                      color: index === 0 ? colors.ink : colors.muted,
                    }}
                  >
                    {count}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.ink }} />
        <Text style={{ fontFamily: font, fontSize: 13, color: colors.muted, flexShrink: 1 }}>
          Blocul închis la culoare e timpul tare, „unu"-le pe care cade accentul.
        </Text>
      </View>
    </View>
  )
}
