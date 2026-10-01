import { Text, View } from 'react-native'
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated'
import { colors, font } from './theme'

/**
 * Plăcuțele de la finalul unei lecții sau al unei serii de citire, ca la
 * finalul sesiunilor de joc: eticheta pe o bandă colorată, cifra dedesubt.
 */
export function SummaryTiles({
  tiles,
  compact,
}: {
  tiles: { label: string; value: string; color: string }[]
  compact: boolean
}) {
  const reduceMotion = useReducedMotion()
  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(120).duration(280)}
      style={{ width: '100%', maxWidth: 430, flexDirection: 'row', gap: 8 }}
    >
      {tiles.map((tile) => (
        <View
          key={tile.label}
          accessible
          accessibilityLabel={`${tile.label}: ${tile.value}`}
          style={{
            flex: 1,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: tile.color,
            backgroundColor: tile.color,
            overflow: 'hidden',
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{
              textAlign: 'center',
              fontFamily: font,
              color: '#FFFFFF',
              fontSize: 11,
              lineHeight: 16,
              fontWeight: '900',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              paddingHorizontal: 4,
            }}
          >
            {tile.label}
          </Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingVertical: compact ? 6 : 9,
              alignItems: 'center',
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{
                fontFamily: font,
                color: colors.ink,
                fontSize: compact ? 19 : 22,
                fontWeight: '900',
                fontVariant: ['tabular-nums'],
              }}
            >
              {tile.value}
            </Text>
          </View>
        </View>
      ))}
    </Animated.View>
  )
}
