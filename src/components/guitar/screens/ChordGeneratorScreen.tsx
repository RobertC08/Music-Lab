import { useEffect, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Switch, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Play } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { curriculumLanguage, pick } from '@/lib/rhythm/curriculum/localized'
import {
  BASE_NAMES,
  buildChord,
  ROOT_CHOICES,
  type ChordBase,
  type RootChoice,
} from '@/lib/guitar/chord-builder'
import { availableAlterations, availableBases, availableExtensions, chordVoicings } from '@/lib/guitar/voicings'
import { useGuitarSamples } from '@/lib/guitar/guitar-samples'
import { useChordSound } from '@/lib/guitar/use-chord-sound'
import { ChordDiagram } from '../ChordDiagram'
import { SnapSlider } from '../SnapSlider'

/*
  Generatorul de acorduri: tonica, tipul, extensiile -> acordul și formele lui.

  Separat de bibliotecă: biblioteca e drumul recomandat, cu forme scrise de
  mână; generatorul răspunde la „cum se cântă un Fa♯m11?". Formele de aici sunt
  căutate (`voicings.ts`) și trec prin aceleași reguli ca biblioteca; când una
  din ele e chiar forma din bibliotecă, apare marcată așa.

  Toată teoria (ce extensii se exclud, cum se scrie simbolul) e în
  `chord-builder.ts`; ecranul doar arată ce e permis.

  Selectorul: acordul ales stă pe mijloc, sus, iar sub el sunt patru slidere,
  tonica, tipul, extensiile și alterațiile, fiecare cu varianta aleasă centrată.
  Extensiile și alterațiile sunt variante gata combinate (`EXTENSION_PRESETS`,
  `ALTERATION_PRESETS`), iar fiecare slider arată doar ce are sens peste
  alegerile de deasupra. O variantă care nu mai are sens după o schimbare
  (o alterație care cerea septima) revine la „—".
*/

const ACCENT = '#6547E8'
const ACCENT_SOFT = '#EEEAFC'

const rootLabel = (root: RootChoice) => root.replace('#', '♯').replace('b', '♭')

export function ChordGeneratorScreen({
  mirrored: controlledMirrored,
  onMirroredChange,
  onExit,
}: {
  mirrored?: boolean
  onMirroredChange?: (value: boolean) => void
  onExit: () => void
}) {
  const { t, i18n } = useTranslation()
  const language = curriculumLanguage(i18n.language)
  const { width } = useWindowDimensions()
  const [localMirrored, setLocalMirrored] = useState(false)
  const mirrored = controlledMirrored ?? localMirrored
  const setMirrored = onMirroredChange ?? setLocalMirrored

  const [root, setRoot] = useState<RootChoice>('C')
  const [base, setBase] = useState<ChordBase>('major')
  const [extensionId, setExtensionId] = useState('none')
  const [alterationId, setAlterationId] = useState('none')
  const sound = useChordSound()
  // Mostrele de chitară (nylon): se încarcă la intrare; demonstrațiile le folosesc când sunt gata.
  const bank = useGuitarSamples()

  /*
    Ce se vede pe slidere: DOAR combinațiile care au forme în dicționarul de
    acorduri, pe tonica aleasă (`availableExtensions`, `availableAlterations`).
    Nimic nu se generează automat. O alegere care nu mai există după o
    schimbare (altă tonică, alt tip) cade pe prima variantă, de obicei „—".
  */
  const baseOptions = availableBases(root)
  const currentBase = baseOptions.includes(base) ? base : baseOptions[0]!
  const extensionOptions = availableExtensions(root, currentBase)
  const extension = extensionOptions.find((preset) => preset.id === extensionId) ?? extensionOptions[0]!
  const alterationOptions = availableAlterations(root, currentBase, extension.extensions)
  const alteration = alterationOptions.find((preset) => preset.id === alterationId) ?? alterationOptions[0]!

  /*
    O variantă rămasă fără sens se șterge de tot, nu doar se ascunde: altfel,
    o alterație care cerea septima ar reapărea singură când pui septima la loc.
  */
  const settle = (nextRoot: RootChoice, nextBase: ChordBase, nextExtensionId: string) => {
    const bases = availableBases(nextRoot)
    const resolvedBase = bases.includes(nextBase) ? nextBase : bases[0]!
    const extensionsHere = availableExtensions(nextRoot, resolvedBase)
    const nextExtension = extensionsHere.find((preset) => preset.id === nextExtensionId) ?? extensionsHere[0]!
    const alterationsHere = availableAlterations(nextRoot, resolvedBase, nextExtension.extensions)
    setBase(resolvedBase)
    setExtensionId(nextExtension.id)
    if (!alterationsHere.some((preset) => preset.id === alteration.id)) setAlterationId(alterationsHere[0]?.id ?? 'none')
  }
  const changeRoot = (next: RootChoice) => {
    setRoot(next)
    settle(next, currentBase, extension.id)
  }
  const changeBase = (next: ChordBase) => settle(root, next, extension.id)
  const changeExtension = (id: string) => settle(root, currentBase, id)

  const extensions = [...extension.extensions, ...alteration.extensions]
  const chord = buildChord({ root, base: currentBase, extensions })
  const voicings = chordVoicings({ root, base: currentBase, extensions }, chord.spec, chord.symbol)
  // Sunetul formelor se pregătește în fundal cât te uiți la ele (`preload`).
  const voicingsKey = voicings.map((voicing) => voicing.shape.frets).join(' ')
  const preload = sound.preload
  useEffect(() => {
    preload(voicings.map((voicing) => voicing.shape))
    // `bank`: când vin mostrele, sunetul formelor se pregătește din nou, din mostre.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formele se schimbă doar cu cheia lor
  }, [voicingsKey, preload, bank])

  const contentWidth = Math.min(width, 720) - 40
  const columns = contentWidth >= 520 ? 3 : 2
  const cardWidth = Math.floor((contentWidth - 10 * (columns - 1)) / columns)


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: publicColors.background }} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 48,
          gap: 18,
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
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>{t('guitar.generatorTitle')}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.generatorIntro')}</Text>
        </View>

        {/* Selectorul: acordul pe mijloc, sliderele dedesubt. */}
        <View
          style={{
            paddingVertical: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: publicColors.border,
            gap: 18,
          }}
        >
          <View style={{ alignItems: 'center', gap: 2, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 48, fontWeight: '900', color: publicColors.ink, textAlign: 'center' }}>
              {chord.symbol}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: publicColors.muted, textAlign: 'center' }}>
              {pick(chord.name, language)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 12 }}>
            {chord.tones.map((tone) => (
              <View
                key={tone.label}
                style={{
                  minWidth: 46,
                  alignItems: 'center',
                  paddingVertical: 5,
                  paddingHorizontal: 7,
                  borderRadius: 12,
                  backgroundColor: tone.label === '1' ? ACCENT_SOFT : '#F5F6F7',
                  borderWidth: 1,
                  borderStyle: tone.optional ? 'dashed' : 'solid',
                  borderColor: tone.label === '1' ? ACCENT : 'transparent',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: publicColors.muted }}>
                  {tone.optional ? `(${tone.label})` : tone.label}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: tone.label === '1' ? ACCENT : publicColors.ink }}>
                  {language === 'ro' ? tone.noteRo : tone.note}
                </Text>
              </View>
            ))}
          </View>
          {chord.tones.some((tone) => tone.optional) ? (
            <Text style={{ fontSize: 12, lineHeight: 17, color: publicColors.muted, textAlign: 'center', paddingHorizontal: 16 }}>
              {t('guitar.genOptionalHint')}
            </Text>
          ) : null}

          <SliderRow title={t('guitar.genRoot')}>
            <SnapSlider
              label={t('guitar.genRoot')}
              options={ROOT_CHOICES.map((choice) => ({ value: choice, label: rootLabel(choice) }))}
              value={root}
              onChange={changeRoot}
              itemWidth={58}
              accent={ACCENT}
            />
          </SliderRow>
          <SliderRow title={t('guitar.genType')}>
            <SnapSlider
              label={t('guitar.genType')}
              options={baseOptions.map((choice) => ({ value: choice, label: pick(BASE_NAMES[choice], language) }))}
              value={currentBase}
              onChange={changeBase}
              itemWidth={124}
              accent={ACCENT}
            />
          </SliderRow>
          <SliderRow title={t('guitar.genExtensions')}>
            <SnapSlider
              label={t('guitar.genExtensions')}
              options={extensionOptions.map((preset) => ({ value: preset.id, label: preset.label }))}
              value={extension.id}
              onChange={changeExtension}
              itemWidth={78}
              accent={ACCENT}
            />
          </SliderRow>
          <SliderRow title={t('guitar.genAlterations')}>
            <SnapSlider
              label={t('guitar.genAlterations')}
              options={alterationOptions.map((preset) => ({ value: preset.id, label: preset.label }))}
              value={alteration.id}
              onChange={setAlterationId}
              itemWidth={78}
              accent={ACCENT}
            />
          </SliderRow>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: publicColors.ink }}>{t('guitar.genShapes')}</Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: publicColors.muted }}>{t('guitar.genReferenceHint')}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 4,
          }}
        >
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: publicColors.ink }}>{t('guitar.mirror')}</Text>
          <Switch
            value={mirrored}
            onValueChange={setMirrored}
            accessibilityLabel={t('guitar.mirror')}
            trackColor={{ true: publicColors.teal, false: publicColors.border }}
          />
        </View>

        {voicings.length === 0 ? (
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.genNoShapes')}</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {voicings.map((voicing, index) => (
              <View
                key={voicing.shape.frets}
                style={{
                  width: cardWidth,
                  alignItems: 'center',
                  gap: 6,
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingHorizontal: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: publicColors.border,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: publicColors.ink }}>
                  {t('guitar.genShape', { number: index + 1 })}
                </Text>
                <Text style={{ fontSize: 12, color: publicColors.muted, textAlign: 'center' }}>
                  {voicing.position === 0 ? t('guitar.genOpen') : t('guitar.genFret', { fret: voicing.position })} ·{' '}
                  {voicing.bassNote
                    ? t('guitar.genInversion', { note: voicing.bassNote })
                    : t('guitar.genBass', { string: voicing.bassString })}
                </Text>
                <ChordDiagram
                  shape={voicing.shape}
                  spec={chord.spec}
                  width={Math.min(cardWidth - 16, 170)}
                  mirrored={mirrored}
                  accent={ACCENT}
                  showNotes
                />
                {voicing.fromLibrary ? (
                  <Text style={{ fontSize: 12, fontWeight: '700', color: publicColors.teal }}>{t('guitar.genFromLibrary')}</Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t('guitar.listen')}: ${t('guitar.genShape', { number: index + 1 })}`}
                  onPress={() => sound.play(voicing.shape)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    height: 38,
                    paddingHorizontal: 16,
                    borderRadius: 19,
                    backgroundColor: pressed ? publicColors.studioSoft : publicColors.studio,
                  })}
                >
                  <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>{t('guitar.listen')}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function SliderRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          color: publicColors.muted,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  )
}
