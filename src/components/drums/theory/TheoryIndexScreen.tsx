import { useEffect } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { loadKit } from '@/lib/drums/kit'
import type { DrumTheory, DrumTheoryLesson } from '@/lib/drums/theory'

/*
  Intrarea în manual, deocamdată o listă, nu harta.

  Harta (roadmap-ul cu etape strânse/desfășurate și stările nodurilor) e Etapa C
  din PLAN-TEORIE-TOBE.md și înlocuiește ecranul ăsta. Până atunci lista arată
  ONEST cât conținut există: etapele scrise apar cu lecțiile lor, cele goale apar
  ca ce sunt, o linie cu numele etapei și nimic sub ea. E diferența dintre un
  drum care se vede scurt și unul care se lungește sub picioarele cuiva care
  tocmai l-a terminat.

  Conținutul intră ca parametru, nu se citește din store: așa ecranul e același
  în aplicație (unde limba vine din profilul local) și în sandbox (unde vine din
  i18n), și se mută dintr-o parte în alta cu un `cp`.
*/
export function TheoryIndexScreen({
  theory,
  onOpenLesson,
  onExit,
}: {
  theory: DrumTheory
  onOpenLesson: (lesson: DrumTheoryLesson) => void
  onExit: () => void
}) {
  const { t } = useTranslation()

  /*
    Mostrele kitului se încarcă de aici, de pe listă, nu abia din lecție. Cât
    citești lista și alegi, se încarcă în fundal, iar lecția le găsește gata.
    Încărcarea e una singură (`loadKit` o ține minte), deci lecția care o cere
    din nou nu mai face nimic. O eroare aici nu contează: lecția reîncearcă și
    o arată ea.
  */
  useEffect(() => {
    loadKit().catch(() => {})
  }, [])

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: publicColors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center' }}>
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
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>
            {t('drums.theoryTitle')}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>
            {t('drums.theoryIntro')}
          </Text>
        </View>

        {theory.stages.map((stage) => {
          const lessons = theory.lessons.filter((lesson) => lesson.stage === stage.id)
          return (
            <View key={stage.id} style={{ gap: 8 }}>
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
              <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
                {stage.subtitle}
              </Text>
              {lessons.length === 0 ? (
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: publicColors.muted,
                    fontStyle: 'italic',
                  }}
                >
                  {t('drums.theorySoon')}
                </Text>
              ) : (
                lessons.map((lesson) => (
                  <Pressable
                    key={lesson.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${lesson.title}. ${lesson.goal}`}
                    onPress={() => onOpenLesson(lesson)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 18,
                      borderWidth: 2,
                      borderColor: stage.border,
                      backgroundColor: pressed ? stage.soft : publicColors.card,
                      padding: 16,
                    })}
                  >
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: publicColors.ink }}>
                        {lesson.title}
                      </Text>
                      <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
                        {lesson.goal}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={publicColors.muted} />
                  </Pressable>
                ))
              )}
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}
