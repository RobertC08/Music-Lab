import { useState } from 'react'
import { Modal, Platform, Pressable, ScrollView, Switch, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Play, X } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'
import { curriculumLanguage, pick } from '@/lib/rhythm/curriculum/localized'
import { chordLevels } from '@/lib/guitar/chord-library'
import { analyzeChord, chordName, displaySymbol, type ChordLevel, type ChordShape } from '@/lib/guitar/chords'
import { useGuitarSamples } from '@/lib/guitar/guitar-samples'
import { useChordSound } from '@/lib/guitar/use-chord-sound'
import { ChordDiagram } from '../ChordDiagram'

/*
  Biblioteca de acorduri: nivelurile, în ordine, cu diagrama fiecărui acord.

  Ca la manualul de tobe, nimic nu e blocat: nivelurile spun ordinea
  recomandată, nu ce ai voie să deschizi. Un card deschide acordul mare, cu
  notele pe fiecare coardă și cu demonstrația audio (arpegiat, apoi lovit).

  Comutatorul de stângaci e aici, deasupra listei, fiindcă schimbă toate
  diagramele deodată. În aplicație va sta în setări și va veni ca parametru; în
  sandbox ține starea local.

  Ecranul nu punctează nimic și nu promite nimic despre cum sună acordul
  elevului: aplicația nu aude chitara (skill-ul `predare-chitara`).
*/

interface Selected {
  chord: ChordShape
  level: ChordLevel
}

export function ChordLibraryScreen({
  levels = chordLevels,
  mirrored: controlledMirrored,
  onMirroredChange,
  onExit,
}: {
  levels?: ChordLevel[]
  /** Comutatorul de stângaci. Dat din afară, e comun cu generatorul; altfel e local. */
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
  const [selected, setSelected] = useState<Selected | null>(null)
  const sound = useChordSound()
  // Mostrele de chitară (nylon): se încarcă la intrare; demonstrațiile le folosesc când sunt gata.
  useGuitarSamples()

  const contentWidth = Math.min(width, 720) - 40
  const columns = contentWidth >= 520 ? 4 : 3
  const gap = 10
  const cardWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns)

  const open = (chord: ChordShape, level: ChordLevel) => {
    setSelected({ chord, level })
    /*
      Încărcarea și încălzirea, ca la „Ascultă" playerul să fie cald. Pe web
      trebuie să se întâmple chiar în atingere (altfel browserul nu lasă
      redarea); acolo randarea e oricum rapidă. Pe telefon nu există regula
      asta, deci se lasă după ce fișa s-a deschis: altfel sinteza ținea
      atingerea pe loc și fișa apărea cu întârziere.
    */
    if (Platform.OS === 'web') sound.prepare(chord)
    else setTimeout(() => sound.prepare(chord), 0)
  }
  const close = () => {
    sound.silence()
    setSelected(null)
  }

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
          <Text style={{ fontSize: 26, fontWeight: '800', color: publicColors.ink }}>{t('guitar.chordsTitle')}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.muted }}>{t('guitar.chordsIntro')}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: publicColors.border,
          }}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{t('guitar.mirror')}</Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: publicColors.muted }}>{t('guitar.mirrorHint')}</Text>
          </View>
          <Switch
            value={mirrored}
            onValueChange={setMirrored}
            accessibilityLabel={t('guitar.mirror')}
            trackColor={{ true: publicColors.teal, false: publicColors.border }}
          />
        </View>

        {levels.map((level, index) => (
          <View key={level.id} style={{ gap: 10 }}>
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  letterSpacing: 1.1,
                  textTransform: 'uppercase',
                  color: level.accent,
                }}
              >
                {t('guitar.level', { number: index + 1 })} · {t('guitar.chordCount', { count: level.chords.length })}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: publicColors.ink }}>{pick(level.title, language)}</Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: publicColors.muted }}>
                {pick(level.summary, language)}
              </Text>
            </View>

            {level.instrumentNote ? (
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: level.soft }}>
                <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.ink }}>
                  {pick(level.instrumentNote, language)}
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
              {level.chords.map((chord) => (
                <Pressable
                  key={chord.id}
                  accessibilityRole="button"
                  accessibilityLabel={chordName(chord.symbol, language)}
                  onPress={() => open(chord, level)}
                  style={({ pressed }) => ({
                    width: cardWidth,
                    alignItems: 'center',
                    paddingTop: 10,
                    paddingBottom: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: publicColors.border,
                    backgroundColor: pressed ? level.soft : publicColors.card,
                  })}
                >
                  <Text style={{ fontSize: 18, fontWeight: '800', color: publicColors.ink }}>
                    {displaySymbol(chord.symbol)}
                  </Text>
                  <ChordDiagram shape={chord} width={cardWidth - 8} mirrored={mirrored} accent={level.accent} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={close}>
        {selected ? (
          <ChordDetail
            selected={selected}
            mirrored={mirrored}
            language={language}
            playing={sound.playing}
            onPlay={() => sound.play(selected.chord)}
            onClose={close}
          />
        ) : null}
      </Modal>
    </SafeAreaView>
  )
}

function ChordDetail({
  selected,
  mirrored,
  language,
  playing,
  onPlay,
  onClose,
}: {
  selected: Selected
  mirrored: boolean
  language: 'ro' | 'en'
  playing: boolean
  onPlay: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const { chord, level } = selected
  const { strings } = analyzeChord(chord)
  const root = strings.find((entry) => entry.isRoot)?.note
  const notes = [...new Set(strings.map((entry) => entry.note).filter((note): note is string => note !== null))]
  const diagramWidth = Math.min(width - 120, 240)

  return (
    <Pressable
      onPress={onClose}
      style={{ flex: 1, backgroundColor: 'rgba(18,20,23,0.45)', justifyContent: 'center', padding: 20 }}
    >
      {/* Atingerea pe card nu închide; doar fundalul și butonul. */}
      <Pressable
        onPress={() => {}}
        style={{
          alignSelf: 'center',
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          backgroundColor: publicColors.background,
          padding: 20,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 34, fontWeight: '900', color: publicColors.ink }}>{displaySymbol(chord.symbol)}</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: publicColors.muted }}>
              {chordName(chord.symbol, language)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('guitar.close')}
            onPress={onClose}
            hitSlop={10}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={22} color={publicColors.ink} />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center' }}>
          <ChordDiagram shape={chord} width={diagramWidth} mirrored={mirrored} accent={level.accent} showNotes />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {root ? <Tag label={t('guitar.root', { note: root })} color={level.accent} background={level.soft} /> : null}
          <Tag label={`${t('guitar.notes')}: ${notes.join(' ')}`} color={publicColors.ink} background="#F1F3F4" />
          {chord.instrument === 'electric' ? (
            <Tag label={t('guitar.mostlyElectric')} color={publicColors.purple} background={publicColors.purpleSoft} />
          ) : chord.instrument === 'acoustic' ? (
            <Tag label={t('guitar.mostlyAcoustic')} color={publicColors.teal} background={publicColors.tealSoft} />
          ) : null}
        </View>

        {chord.tip ? (
          <Text style={{ fontSize: 15, lineHeight: 22, color: publicColors.ink }}>{pick(chord.tip, language)}</Text>
        ) : null}

        <View style={{ gap: 6 }}>
          <Pressable
            accessibilityRole="button"
            onPress={onPlay}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 52,
              borderRadius: 26,
              backgroundColor: pressed ? publicColors.studioSoft : publicColors.studio,
            })}
          >
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
              {playing ? t('guitar.listening') : t('guitar.listen')}
            </Text>
          </Pressable>
          <Text style={{ fontSize: 13, color: publicColors.muted, textAlign: 'center' }}>{t('guitar.listenHint')}</Text>
        </View>
      </Pressable>
    </Pressable>
  )
}

function Tag({ label, color, background }: { label: string; color: string; background: string }) {
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: background }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color }}>{label}</Text>
    </View>
  )
}
