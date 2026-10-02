import { memo } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { publicColors } from '@/components/public-practice/ui'
import type { ChartBar } from '@/lib/drums/theory'

/*
  Chart-ul unui exemplu, desenat cum îl scrie un aranjor: patru măsuri pe rând,
  bare oblice unde se cântă groove-ul, „Fill” unde vine fill-ul și loviturile
  trupei scrise pe optimi. Numele părții stă deasupra primei ei măsuri.

  Nu e grila: lecția spune tocmai că un chart NU scrie fiecare notă. Măsura care
  se aude se aprinde, ca elevul să-și urmărească locul în formă, adică exact ce
  face un toboșar cu un chart pe stativ.
*/

const BARS_PER_LINE = 4

function ChartViewView({
  chart,
  activeBar = -1,
  accent,
}: {
  chart: ChartBar[]
  activeBar?: number
  accent: string
}) {
  const lines: { bar: ChartBar; index: number }[][] = []
  chart.forEach((bar, index) => {
    if (index % BARS_PER_LINE === 0) lines.push([])
    lines[lines.length - 1]!.push({ bar, index })
  })

  return (
    <View style={{ gap: 8 }}>
      {lines.map((line, lineIndex) => (
        <View key={lineIndex} style={{ flexDirection: 'row' }}>
          {line.map(({ bar, index }) => (
            <ChartMeasure key={index} bar={bar} active={index === activeBar} accent={accent} />
          ))}
          {/* Rândul incomplet păstrează lățimea măsurilor, ca barele să cadă una sub alta. */}
          {Array.from({ length: BARS_PER_LINE - line.length }, (_, pad) => (
            <View key={`pad-${pad}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  )
}

function ChartMeasure({ bar, active, accent }: { bar: ChartBar; active: boolean; accent: string }) {
  const { t } = useTranslation()
  const ink = active ? '#FFFFFF' : publicColors.ink

  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text
        numberOfLines={1}
        style={{ minHeight: 14, fontSize: 10, fontWeight: '800', color: accent }}
      >
        {bar.label ?? ''}
      </Text>
      <View
        style={{
          minHeight: 40,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          // Bara de măsură: linia verticală din stânga, ca pe partitură.
          borderLeftWidth: 2,
          borderColor: publicColors.ink,
          backgroundColor: active ? accent : 'transparent',
          borderRadius: active ? 4 : 0,
          paddingHorizontal: 2,
        }}
      >
        {bar.kind === 'groove'
          ? Array.from({ length: 4 }, (_, beat) => (
              <Text key={beat} style={{ fontSize: 18, fontWeight: '900', color: ink }}>
                /
              </Text>
            ))
          : null}
        {bar.kind === 'fill' ? (
          <Text style={{ fontSize: 12, fontWeight: '900', letterSpacing: 1, color: ink }}>
            {t('drums.theoryChartFill').toUpperCase()}
          </Text>
        ) : null}
        {bar.kind === 'hits'
          ? [...(bar.hits ?? '')].map((slot, eighth) => (
              <Text
                key={eighth}
                style={{
                  fontSize: slot === 'x' ? 14 : 10,
                  fontWeight: '900',
                  color: ink,
                  opacity: slot === 'x' ? 1 : eighth % 2 === 0 ? 0.35 : 0.15,
                }}
              >
                {/* Lovitura trupei; în rest, punctele pulsului. */}
                {slot === 'x' ? '◆' : '·'}
              </Text>
            ))
          : null}
      </View>
    </View>
  )
}

/*
  Memoizat: în timpul redării, ecranul care îl conține se redesenează la fiecare
  cadru (poziția din pistă), dar acesta se schimbă doar când trece un pas. Fără
  memo, toate celulele se refăceau de ~60 de ori pe secundă, iar în modul de
  dezvoltare asta se simțea ca lag pe telefon.
*/
export const ChartView = memo(ChartViewView)
