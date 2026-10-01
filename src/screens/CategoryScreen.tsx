import { Pressable, ScrollView, Text, View } from 'react-native'
import { colors, font } from '../theme'
import { PageTitle } from '../components/ui'
import { NoteSymbol } from '../components/notation'
import type { Category, Lesson } from '../curriculum/types'

/** Indigo închis, aceeași temă ca în aplicație (`lib/guest/game-theme.ts`). */
const POLYRHYTHM = { accent: '#3D3A99', soft: '#ECEBFA', border: '#C8C5EE' } as const

export function CategoryScreen({
  category,
  onOpenLesson,
  onOpenGame,
  onOpenReading,
  onOpenCheatSheet,
  onOpenPolyrhythm,
  onExit,
}: {
  category: Category
  onOpenLesson: (lesson: Lesson) => void
  onOpenGame: () => void
  onOpenReading: () => void
  onOpenCheatSheet: () => void
  /** Poliritmul, la capătul lecțiilor; lipsește la categoriile care nu îl au. */
  onOpenPolyrhythm?: () => void
  onExit: () => void
}) {
  // Numărul lecției care predă poliritmul, din curriculum, nu scris de mână.
  const polyrhythmIndex = category.lessons.findIndex((lesson) => lesson.id === 'poliritm')
  const polyrhythmLessonNumber = polyrhythmIndex >= 0 ? polyrhythmIndex + 1 : category.lessons.length
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        gap: 18,
        width: '100%',
        maxWidth: 620,
        alignSelf: 'center',
      }}
    >
      <Pressable accessibilityRole="button" onPress={onExit} hitSlop={12}>
        <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.muted }}>
          ‹ Categorii
        </Text>
      </Pressable>

      <PageTitle eyebrow="Categorie" title={category.title} subtitle={category.subtitle} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cheat sheet cu notațiile"
        onPress={onOpenCheatSheet}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: category.border,
          backgroundColor: category.soft,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <View style={{ width: 34, alignItems: 'center' }}>
          <NoteSymbol kind="quarter" height={36} color={category.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font, fontSize: 17, fontWeight: '800', color: colors.ink }}>
            Cheat sheet
          </Text>
          <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: colors.muted }}>
            Toate notațiile și termenii, într-un singur loc.
          </Text>
        </View>
        <Text style={{ fontFamily: font, fontSize: 20, color: colors.muted }}>›</Text>
      </Pressable>

      <View style={{ gap: 10 }}>
        {category.lessons.map((lesson, index) => (
          <Pressable
            key={lesson.id}
            accessibilityRole="button"
            accessibilityLabel={`Lecția ${index + 1}: ${lesson.title}. ${lesson.goal}`}
            onPress={() => onOpenLesson(lesson)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: '#FFFFFF',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: category.soft,
              }}
            >
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: '900',
                  color: category.accent,
                }}
              >
                {index + 1}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: font, fontSize: 17, fontWeight: '800', color: colors.ink }}>
                {lesson.title}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontFamily: font,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.muted,
                }}
              >
                {lesson.goal}
              </Text>
            </View>
            <Text style={{ fontFamily: font, fontSize: 20, color: colors.muted }}>›</Text>
          </Pressable>
        ))}

        {/*
          Poliritmul stă la capătul lecțiilor, ca în aplicație: lecția 18 predă
          noțiunea, jocul o cere cu amândouă mâinile. Nu se poate lua drept
          lecție, n-are număr, are eticheta lui și chenar gros, colorat.
        */}
        {onOpenPolyrhythm ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Joc: Poliritm. După lecția ${polyrhythmLessonNumber}. Ține un flux cu fiecare mână.`}
            onPress={onOpenPolyrhythm}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: POLYRHYTHM.accent,
              backgroundColor: POLYRHYTHM.soft,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: POLYRHYTHM.accent,
              }}
            >
              <Text style={{ fontFamily: font, fontSize: 18, fontWeight: '900', color: '#FFFFFF' }}>
                ⇄
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: '900',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: POLYRHYTHM.accent,
                }}
              >
                Joc · după lecția {polyrhythmLessonNumber}
              </Text>
              <Text style={{ fontFamily: font, fontSize: 17, fontWeight: '800', color: colors.ink }}>
                Poliritm
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontFamily: font,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.muted,
                }}
              >
                Ține un flux cu fiecare mână. Se întâlnesc pe „unu” și nicăieri altundeva.
              </Text>
            </View>
            <Text style={{ fontFamily: font, fontSize: 20, color: POLYRHYTHM.accent }}>›</Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        style={{
          marginTop: 4,
          fontFamily: font,
          fontSize: 13,
          fontWeight: '800',
          letterSpacing: 0.8,
          color: colors.muted,
        }}
      >
        JOCURI
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Joc: Citește ritmul"
        onPress={onOpenReading}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 18,
          borderRadius: 20,
          backgroundColor: colors.studio,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ width: 34, alignItems: 'center' }}>
          <NoteSymbol kind="sixteenthGroup" height={34} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font, fontSize: 12, fontWeight: '800', color: '#FFB66F' }}>
            CITIRE
          </Text>
          <Text style={{ fontFamily: font, fontSize: 19, fontWeight: '800', color: '#FFFFFF' }}>
            Citește ritmul
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: font,
              fontSize: 14,
              lineHeight: 20,
              color: '#C9CFD5',
            }}
          >
            Vezi notația și un tempo. Nu auzi nimic, citești și baţi.
          </Text>
        </View>
        <Text style={{ fontFamily: font, fontSize: 20, color: '#FFFFFF' }}>›</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Joc: Rhythm Echo"
        onPress={onOpenGame}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 18,
          borderRadius: 20,
          backgroundColor: colors.studio,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ width: 34, alignItems: 'center' }}>
          <NoteSymbol kind="eighthPair" height={40} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font, fontSize: 12, fontWeight: '800', color: '#FFB66F' }}>
            DUPĂ AUZ
          </Text>
          <Text style={{ fontFamily: font, fontSize: 19, fontWeight: '800', color: '#FFFFFF' }}>
            Rhythm Echo
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: font,
              fontSize: 14,
              lineHeight: 20,
              color: '#C9CFD5',
            }}
          >
            Auzi pattern-ul, apoi îl repeți. Pattern-uri generate.
          </Text>
        </View>
        <Text style={{ fontFamily: font, fontSize: 20, color: '#FFFFFF' }}>›</Text>
      </Pressable>
    </ScrollView>
  )
}
