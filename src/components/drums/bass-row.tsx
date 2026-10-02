import { memo } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LABEL_WIDTH } from '@/components/drums/groove-grid'
import { publicColors } from '@/components/public-practice/ui'
import { noteName, type BassLine } from '@/lib/drums/bass'

/*
  Linia de bas scrisă pe pași, deasupra grilei de tobe: numele notei pe pasul
  unde intră, o bară pe pașii în care e ținută.

  Aceleași coloane ca grila de dedesubt, deci o notă de bas și o lovitură de
  tobă mare pe același pas stau una sub alta. Asta e toată lecția: se vede unde
  se întâlnesc, nu doar se aude.
*/

const BASS_COLOR = { fill: '#6B4BB8', soft: '#F1ECFB' }

function BassRowView({
  line,
  stepsPerBar,
  beatsPerBar,
  activeBar = -1,
  activeStep = -1,
}: {
  line: BassLine
  stepsPerBar: number
  beatsPerBar: number
  /** Măsura din exercițiu care se aude acum; `-1` cât timp nu se aude nimic. */
  activeBar?: number
  activeStep?: number
}) {
  const { t } = useTranslation()
  const stepsPerBeat = stepsPerBar / beatsPerBar

  return (
    <View style={{ gap: 4 }}>
      {line.bars.map((notes, barIndex) => {
        const active = activeBar >= 0 && activeBar % line.bars.length === barIndex
        const startsAt = new Map(notes.map((note) => [note.step, note]))
        const held = new Set(
          notes.flatMap((note) =>
            Array.from(
              { length: Math.max(0, Math.ceil(note.length) - 1) },
              (_, i) => note.step + i + 1,
            ),
          ),
        )
        return (
          <View key={barIndex} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {/* Aceeași coloană de etichete ca grila, ca pașii să cadă unul sub altul. */}
            <Text
              numberOfLines={1}
              style={{
                width: LABEL_WIDTH,
                fontSize: 8,
                fontWeight: '800',
                letterSpacing: 0.3,
                color: BASS_COLOR.fill,
                textTransform: 'uppercase',
              }}
            >
              {t('drums.theoryBass')}
            </Text>
            <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
              {Array.from({ length: stepsPerBar }, (_, step) => {
                const note = startsAt.get(step)
                const sounding = note !== undefined || held.has(step)
                const here = active && step === activeStep
                const onBeat = step % stepsPerBeat === 0
                return (
                  <View
                    key={step}
                    style={{
                      flex: 1,
                      minHeight: 30,
                      borderRadius: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: onBeat ? 2 : 1,
                      borderColor: here
                        ? publicColors.ink
                        : onBeat
                          ? publicColors.border
                          : '#EDEFF1',
                      backgroundColor:
                        here && sounding ? BASS_COLOR.fill : sounding ? BASS_COLOR.soft : '#FFFFFF',
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: here && sounding ? '#FFFFFF' : BASS_COLOR.fill,
                      }}
                    >
                      {note ? noteName(note.pitch) : held.has(step) ? '—' : ''}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

/*
  Memoizat: în timpul redării, ecranul care îl conține se redesenează la fiecare
  cadru (poziția din pistă), dar acesta se schimbă doar când trece un pas. Fără
  memo, toate celulele se refăceau de ~60 de ori pe secundă, iar în modul de
  dezvoltare asta se simțea ca lag pe telefon.
*/
export const BassRow = memo(BassRowView)
