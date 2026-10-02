import { memo } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { publicColors } from '@/components/public-practice/ui'
import type { DrumExercise, Stick } from '@/lib/drums/exercise'
import { displayBarsOf } from '@/lib/drums/notation-bars'

/*
  Rudimentul scris pe pași: o celulă pe pas, mâna în ea, accentele marcate,
  ornamentele ca note mici înaintea loviturii.

  Culorile mâinilor sunt cele pe care le folosea jocul de rudimente pe ecran,
  retras între timp: stânga albastru, dreapta roșu. Cine l-a jucat recunoaște
  mâna fără să citească litera.
*/
export const handColors: Record<Stick, { fill: string; soft: string }> = {
  L: { fill: '#3E66B3', soft: '#EDF3FF' },
  R: { fill: '#C8442E', soft: '#FDEEEA' },
}

export interface StickingRowProps {
  exercise: DrumExercise
  /** Măsura din exercițiu care se aude acum; `-1` cât timp nu se aude nimic. */
  activeBar?: number
  /** Pasul care se aude acum; `-1` la fel. */
  activeStep?: number
  /** Explicația ornamentelor. Se ascunde în timpul sesiunii. */
  showHint?: boolean
}

function StickingRowView({
  exercise,
  activeBar = -1,
  activeStep = -1,
  showHint = true,
}: StickingRowProps) {
  const { t } = useTranslation()
  const stepsPerBeat = exercise.stepsPerBar / exercise.beatsPerBar
  const hasGrace = exercise.bars.some((bar) => bar.grace?.some(Boolean))
  // Măsurile identice una după alta se desenează o dată, cu „×2”.
  const displayBars = displayBarsOf(exercise)

  return (
    <View style={{ gap: 6 }}>
      {displayBars.map(({ bar, sourceBars }, index) => {
        const active = sourceBars.includes(activeBar)
        return (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
              {Array.from({ length: exercise.stepsPerBar }, (_, step) => {
                const stick = bar.sticking?.[step] ?? null
                const hit = bar.lanes.snare?.[step] ?? null
                const grace = bar.grace?.[step] ?? null
                const here = active && step === activeStep
                const onBeat = step % stepsPerBeat === 0
                const palette = stick ? handColors[stick] : null

                return (
                  <View
                    key={step}
                    style={{
                      flex: 1,
                      minHeight: 38,
                      borderRadius: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 2,
                      // Timpii au un chenar mai gros: fără el, o măsură de
                      // șaisprezecimi e un șir de 16 celule în care nu se vede
                      // unde cade pulsul, adică exact ce trebuie urmărit.
                      borderWidth: onBeat ? 2 : 1,
                      borderColor: here
                        ? publicColors.ink
                        : onBeat
                          ? publicColors.border
                          : '#EDEFF1',
                      backgroundColor: here
                        ? (palette?.fill ?? publicColors.ink)
                        : (palette?.soft ?? '#FFFFFF'),
                    }}
                  >
                    {grace ? (
                      <Text
                        style={{
                          fontSize: 8,
                          lineHeight: 9,
                          fontWeight: '700',
                          color: here ? '#FFFFFF' : handColors[grace.stick].fill,
                          opacity: here ? 0.85 : 0.75,
                        }}
                      >
                        {/* Două grații la drag, una la flam, scrise ca atâtea litere. */}
                        {t(`drums.${grace.stick === 'L' ? 'left' : 'right'}`).repeat(grace.strokes)}
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        fontSize: hit === 'accent' ? 15 : hit === 'ghost' ? 11 : 13,
                        lineHeight: 17,
                        fontWeight: hit === 'accent' ? '900' : hit === 'ghost' ? '500' : '600',
                        color: here ? '#FFFFFF' : (palette?.fill ?? publicColors.border),
                        // Ghost note-ul e o treaptă proprie, nu o lovitură mai
                        // slabă, deci trebuie să se vadă că e alta. Litera
                        // singură, doar mai mică, s-ar citi ca aceeași lovitură
                        // desenată neglijent.
                        opacity: hit === 'ghost' ? 0.55 : 1,
                      }}
                    >
                      {stick
                        ? // Parantezele sunt semnul de pe partituri pentru ghost
                          // note, deci rândul de mâini nu inventează altul.
                          hit === 'ghost'
                          ? `(${t(`drums.${stick === 'L' ? 'left' : 'right'}`)})`
                          : t(`drums.${stick === 'L' ? 'left' : 'right'}`)
                        : '·'}
                    </Text>
                    {hit === 'accent' ? (
                      <Text
                        style={{
                          fontSize: 9,
                          lineHeight: 9,
                          color: here ? '#FFFFFF' : (palette?.fill ?? publicColors.border),
                        }}
                      >
                        {'>'}
                      </Text>
                    ) : null}
                  </View>
                )
              })}
            </View>
            {sourceBars.length > 1 ? (
              <Text style={{ fontSize: 9, fontWeight: '800', color: publicColors.muted }}>
                ×{sourceBars.length}
              </Text>
            ) : null}
          </View>
        )
      })}
      {showHint && hasGrace ? (
        <Text style={{ fontSize: 11, lineHeight: 15, color: publicColors.muted }}>
          {t('drums.graceHint')}
        </Text>
      ) : null}
    </View>
  )
}

/*
  Memoizat: în timpul redării, ecranul care îl conține se redesenează la fiecare
  cadru (poziția din pistă), dar acesta se schimbă doar când trece un pas. Fără
  memo, toate celulele se refăceau de ~60 de ori pe secundă, iar în modul de
  dezvoltare asta se simțea ca lag pe telefon.
*/
export const StickingRow = memo(StickingRowView)
