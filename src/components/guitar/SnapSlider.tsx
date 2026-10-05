import { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

/*
  Un selector orizontal cu alegerea pe mijloc.

  Variantele stau pe o bandă care se derulează; cea ajunsă în dreptul
  marcajului din centru e cea aleasă. Se derulează cu degetul sau se atinge
  direct o variantă, iar banda o aduce la mijloc.

  Alegerea se trimite abia când banda s-a oprit (după o scurtă pauză în
  evenimentele de derulare), nu la fiecare pixel: altfel, la o derulare rapidă
  peste toate cele 12 tonici, ecranul ar căuta formele pe gât de 12 ori.
  `onMomentumScrollEnd` nu există pe web, de aceea pauza e măsurată de mână.
  Tot de mână se face și oprirea exact pe o variantă: pe telefon o face
  `snapToInterval`, pe web nu, iar alinierea finală e aceeași pe amândouă.
*/

const SETTLE_MS = 140
const HEIGHT = 46

export interface SliderOption<T extends string> {
  value: T
  label: string
}

export function SnapSlider<T extends string>({
  options,
  value,
  onChange,
  itemWidth,
  accent,
  label,
}: {
  options: readonly SliderOption<T>[]
  value: T
  onChange: (value: T) => void
  itemWidth: number
  accent: string
  /** Pentru cititorul de ecran. */
  label: string
}) {
  const scroll = useRef<ScrollView>(null)
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [width, setWidth] = useState(0)
  /** Varianta din dreptul marcajului cât timp banda se mișcă; `null` în repaus. */
  const [moving, setMoving] = useState<number | null>(null)

  const selected = Math.max(0, options.findIndex((option) => option.value === value))
  const centered = moving ?? selected
  const side = Math.max(0, (width - itemWidth) / 2)

  // Banda urmează alegerea: la o schimbare din afară (alt tip -> altă listă de
  // extensii), varianta aleasă e adusă la mijloc fără animație.
  useEffect(() => {
    if (!width) return
    scroll.current?.scrollTo({ x: selected * itemWidth, animated: false })
  }, [selected, width, itemWidth, options.length])

  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current)
    },
    [],
  )

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.min(
      options.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.x / itemWidth)),
    )
    setMoving(index)
    if (settle.current) clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      scroll.current?.scrollTo({ x: index * itemWidth, animated: true })
      setMoving(null)
      const option = options[index]
      if (option && option.value !== value) onChange(option.value)
    }, SETTLE_MS)
  }

  const choose = (index: number) => {
    scroll.current?.scrollTo({ x: index * itemWidth, animated: true })
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
  }

  return (
    <View onLayout={onLayout} style={{ height: HEIGHT }} accessibilityLabel={label}>
      {/* Marcajul din mijloc, sub bandă. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: side,
          width: itemWidth,
          borderRadius: HEIGHT / 2,
          backgroundColor: accent,
        }}
      />
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={{ paddingHorizontal: side }}
        style={{ backgroundColor: 'transparent' }}
      >
        {options.map((option, index) => {
          const isCentered = index === centered
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: index === selected }}
              accessibilityLabel={`${label}: ${option.label}`}
              onPress={() => choose(index)}
              style={{ width: itemWidth, height: HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: isCentered ? 18 : 16,
                  fontWeight: isCentered ? '800' : '600',
                  color: isCentered ? '#FFFFFF' : '#5E656D',
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
      {/* Marginile se estompează: se vede că banda continuă. */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36 }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 36 }}
      />
    </View>
  )
}
