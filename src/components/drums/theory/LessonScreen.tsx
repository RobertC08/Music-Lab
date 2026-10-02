import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react-native'
import { PrimaryButton, publicColors } from '@/components/public-practice/ui'
import { kitIfLoaded, loadKit } from '@/lib/drums/kit'
import type { DrumStage, DrumTheoryLesson, DrumTheorySection } from '@/lib/drums/theory'
import { splitBold } from '@/lib/drums/theory/rich-text'
import { haptic } from '@/lib/haptics/game-haptics'
import { DrumHeadsKey, DrumStaffKey } from './DrumStaff'
import { ExamplePlayer } from './ExamplePlayer'
import { KitDiagram } from './KitDiagram'

/*
  O lecție din manualul de tobe, citită secțiune cu secțiune.

  Aceeași formă ca la ritm (`components/rhythm/screens/LessonScreen.tsx`): o
  secțiune pe ecran, o bară de progres deasupra, „Continuă" dedesubt. Diferența e
  că aici lecția se TERMINĂ la ultima secțiune, nu urmează un exercițiu cu scor,
  fiindcă manualul verifică înțelegerea, nu execuția, iar verificarea are ecranul
  ei (quiz-ul, Etapa B din PLAN-TEORIE-TOBE.md).

  Mostrele kitului se încarcă o dată, aici, nu în fiecare exemplu: sunt ~2 MB și
  aceleași pentru toată lecția.
*/
export function DrumTheoryLessonScreen({
  lesson,
  stage,
  onExit,
  onOpenQuiz,
}: {
  lesson: DrumTheoryLesson
  stage: DrumStage
  onExit: () => void
  /** Quiz-ul lecției. Dacă există, ultimul pas duce acolo, nu înapoi la listă. */
  onOpenQuiz?: () => void
}) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  /*
    Doar dacă mostrele sunt gata, nu mostrele însele.

    Mostrele sunt ~6 MB de eșantioane (`Float32Array`), iar pasate ca proprietate
    blocau iPhone-ul: React, în modul de dezvoltare, compară și serializează
    proprietățile componentelor pentru instrumentele de performanță, iar un obiect
    de mărimea asta costa secunde pe Hermes la fiecare montare. Măsurat în Expo
    Go: 5-8 s cu ecranul înghețat la intrarea în fiecare lecție, 1-2 s la fiecare
    secțiune nouă. Cine are nevoie de ele le ia din încărcător (`kitIfLoaded`),
    exact în momentul în care le folosește.
  */
  const [kitReady, setKitReady] = useState(() => kitIfLoaded() !== null)
  const [kitError, setKitError] = useState(false)
  // Metronomul exemplelor, comun pentru toată lecția (`ExamplePlayer`).
  const [metronome, setMetronome] = useState(false)

  useEffect(() => {
    let alive = true
    loadKit()
      .then(() => {
        if (alive) setKitReady(true)
      })
      .catch(() => {
        if (alive) setKitError(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const section = lesson.sections[index]!
  const isLast = index + 1 >= lesson.sections.length

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: publicColors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        // Cheia forțează derularea înapoi sus la schimbarea secțiunii: altfel
        // secțiunea următoare se deschide la mijlocul ei.
        key={index}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={onExit}
            style={({ pressed }) => ({
              width: 46,
              height: 46,
              borderRadius: 23,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? '#F1F3F4' : 'transparent',
            })}
          >
            <ArrowLeft size={22} color={publicColors.ink} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: publicColors.muted,
              fontVariant: ['tabular-nums'],
            }}
          >
            {index + 1}/{lesson.sections.length}
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 1.1,
              textTransform: 'uppercase',
              color: stage.accent,
            }}
          >
            {stage.title}
          </Text>
          <Text
            accessibilityRole="header"
            style={{ fontSize: 26, lineHeight: 31, fontWeight: '800', color: publicColors.ink }}
          >
            {lesson.title}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>
            {lesson.goal}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 5 }}>
          {lesson.sections.map((_, position) => (
            <View
              key={position}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: position <= index ? stage.accent : publicColors.border,
              }}
            />
          ))}
        </View>

        <SectionCard
          section={section}
          stage={stage}
          kitReady={kitReady}
          kitError={kitError}
          metronome={metronome}
          onToggleMetronome={() => setMetronome((value) => !value)}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {index > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={() => {
                haptic('light')
                setIndex((value) => Math.max(0, value - 1))
              }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 52,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: publicColors.border,
                backgroundColor: pressed ? '#F7F8F9' : publicColors.card,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>
                {t('common.back')}
              </Text>
            </Pressable>
          ) : null}
          <View style={{ flex: 2 }}>
            <PrimaryButton
              label={
                isLast
                  ? onOpenQuiz
                    ? t('drums.quizStart')
                    : t('drums.theoryLessonDone')
                  : t('common.continue')
              }
              onPress={() => {
                haptic('light')
                if (!isLast) setIndex(index + 1)
                else if (onOpenQuiz) onOpenQuiz()
                else onExit()
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SectionCard({
  section,
  stage,
  kitReady,
  kitError,
  metronome,
  onToggleMetronome,
}: {
  section: DrumTheorySection
  stage: DrumStage
  kitReady: boolean
  kitError: boolean
  metronome: boolean
  onToggleMetronome: () => void
}) {
  const { t } = useTranslation()
  /*
    Textul e scris cu **bold** pe bucăți, ca în manual. Se taie o singură dată,
    aici, nu la fiecare redesenare, `body` e lung și nu se schimbă.
  */
  const parts = useMemo(() => splitBold(section.body), [section.body])

  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: stage.soft,
        borderWidth: 1,
        borderColor: stage.border,
        padding: 18,
        gap: 14,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: '800', color: publicColors.ink }}>
        {section.heading}
      </Text>

      {/*
        Desenul stă deasupra textului, nu sub el: e un reper, iar un reper care
        vine după explicație nu mai are ce ancora. Mostrele sunt aceleași cu ale
        exemplelor, încărcate o dată de ecran.
      */}
      {section.visual === 'kit' && kitReady ? <KitDiagram /> : null}
      {section.visual === 'staff' ? (
        <View style={{ gap: 8 }}>
          <View
            style={{
              borderRadius: 14,
              backgroundColor: publicColors.card,
              borderWidth: 1,
              borderColor: stage.border,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <DrumStaffKey />
          </View>
          <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted }}>
            {t('drums.staffKeyHint')}
          </Text>
        </View>
      ) : null}
      {section.visual === 'heads' ? (
        <View style={{ gap: 8 }}>
          <View
            style={{
              borderRadius: 14,
              backgroundColor: publicColors.card,
              borderWidth: 1,
              borderColor: stage.border,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <DrumHeadsKey />
          </View>
          <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted }}>
            {t('drums.headsKeyHint')}
          </Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 15, lineHeight: 24, color: '#333A42' }}>
        {parts.map((part, position) => (
          <Text key={position} style={part.bold ? { fontWeight: '800' } : undefined}>
            {part.text}
          </Text>
        ))}
      </Text>

      {section.example ? (
        kitReady ? (
          <ExamplePlayer
            example={section.example}
            accent={stage.accent}
            metronome={metronome}
            onToggleMetronome={onToggleMetronome}
          />
        ) : (
          <Text style={{ fontSize: 13, color: publicColors.muted }}>
            {kitError ? t('common.errorGeneric') : t('common.loading')}
          </Text>
        )
      ) : null}

      {section.terms?.length ? (
        <View style={{ gap: 8 }}>
          {section.terms.map((entry) => (
            <View
              key={entry.term}
              style={{
                borderRadius: 14,
                backgroundColor: publicColors.card,
                borderWidth: 1,
                borderColor: stage.border,
                padding: 12,
                gap: 3,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: publicColors.ink }}>
                {entry.term}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
                {entry.meaning}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}
