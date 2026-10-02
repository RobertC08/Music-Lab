import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, font } from '../theme'
import { BrandWordmark, PageTitle } from '../components/ui'
import { categories } from '../curriculum/rhythm'
import type { Category } from '../curriculum/types'

const covers = {
  rhythm: require('../../assets/games/rhythm-echo-card.webp'),
} as const

export function Home({
  onOpenCategory,
  onOpenBench,
  onOpenTheory,
  onOpenDrums,
  onOpenGrooves,
  onOpenFills,
  onOpenAdvancedFills,
}: {
  onOpenCategory: (category: Category) => void
  /** Tobe: insotitor de practica. Fara scor, deci nu e o categorie de jocuri. */
  onOpenTheory?: () => void
  onOpenDrums?: () => void
  onOpenGrooves?: () => void
  onOpenFills?: () => void
  onOpenAdvancedFills?: () => void
  /**
   * Bancul de timing e unealta de diagnostic, nu functionalitate: nu se
   * livreaza la integrare. Fara el link-ul nu se deseneaza deloc, ca sa nu
   * ramana un buton care nu duce nicaieri.
   */
  onOpenBench?: () => void
}) {
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(Math.max(width - 40, 0), 580)
  const cardHeight = Math.min(460, Math.max(300, Math.round(contentWidth * 0.95)))

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        gap: 20,
        width: '100%',
        maxWidth: 620,
        alignSelf: 'center',
      }}
    >
      <BrandWordmark />
      <PageTitle
        title="Învață muzică"
        subtitle="Fiecare categorie are lecții scurte și exerciții în care aplici ce tocmai ai învățat."
      />

      {categories.map((category) => (
        <Pressable
          key={category.id}
          accessibilityRole="button"
          accessibilityLabel={`${category.title}. ${category.subtitle}`}
          onPress={() => onOpenCategory(category)}
          style={({ pressed }) => ({
            height: cardHeight,
            borderRadius: 28,
            overflow: 'hidden',
            backgroundColor: colors.studio,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Image
            source={covers[category.cover]}
            contentFit="cover"
            transition={240}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          <LinearGradient
            colors={[
              'rgba(10,12,15,0)',
              'rgba(10,12,15,0.05)',
              'rgba(10,12,15,0.42)',
              'rgba(10,12,15,0.84)',
              'rgba(10,12,15,0.98)',
            ]}
            locations={[0, 0.3, 0.55, 0.76, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 14,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  marginBottom: 5,
                  fontFamily: font,
                  fontSize: 12,
                  fontWeight: '800',
                  letterSpacing: 0.4,
                  color: '#FFB66F',
                }}
              >
                {category.lessons.length} LECȚII
              </Text>
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 28,
                  lineHeight: 31,
                  fontWeight: '800',
                  letterSpacing: -1,
                  color: '#FFFFFF',
                }}
              >
                {category.title}
              </Text>
              <Text
                style={{
                  marginTop: 5,
                  fontFamily: font,
                  fontSize: 16,
                  lineHeight: 23,
                  color: '#D9DDE1',
                }}
              >
                {category.subtitle}
              </Text>
            </View>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: category.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: font, fontSize: 22, fontWeight: '900', color: colors.ink }}>
                →
              </Text>
            </View>
          </View>
        </Pressable>
      ))}

      {/*
        Manualul stă deasupra celor trei module de practică: ele presupun deja
        că știi ce e un hi-hat, iar până acum nu exista unde să afli.
      */}
      {onOpenTheory ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenTheory}
          style={({ pressed }) => ({
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            padding: 18,
            gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
            Tobe · Manualul
          </Text>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            De la piesele setului pana la citirea unui chart. Opt etape.
          </Text>
        </Pressable>
      ) : null}

      {onOpenDrums ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenDrums}
          style={({ pressed }) => ({
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            padding: 18,
            gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
            Tobe · Rudimente
          </Text>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            Insotitor de practica. Tu bati, aplicatia tine timpul. Fara scor.
          </Text>
        </Pressable>
      ) : null}

      {onOpenGrooves ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenGrooves}
          style={({ pressed }) => ({
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            padding: 18,
            gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
            Tobe · Groove-uri
          </Text>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            Il auzi, apoi il tii singur doar cu metronomul.
          </Text>
        </Pressable>
      ) : null}

      {onOpenFills ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenFills}
          style={({ pressed }) => ({
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            padding: 18,
            gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
            Tobe · Fill-uri
          </Text>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            Trei masuri de groove, a patra e a ta.
          </Text>
        </Pressable>
      ) : null}

      {onOpenAdvancedFills ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenAdvancedFills}
          style={({ pressed }) => ({
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            padding: 18,
            gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
            Tobe · Fill-uri avansate
          </Text>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            Saisprezecimi, triolete si sextolete in aceeasi masura.
          </Text>
        </Pressable>
      ) : null}

      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.border,
          padding: 18,
          gap: 4,
        }}
      >
        <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.muted }}>
          Auz · Armonie
        </Text>
        <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
          În lucru.
        </Text>
      </View>

      {onOpenBench ? (
        <Pressable accessibilityRole="button" onPress={onOpenBench} hitSlop={10}>
          <Text
            style={{
              fontFamily: font,
              fontSize: 14,
              fontWeight: '700',
              color: colors.muted,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}
          >
            Banc de test pentru timing
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}
