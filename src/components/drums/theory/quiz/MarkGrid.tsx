import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LABEL_WIDTH, pieceColors } from '@/components/drums/groove-grid'
import { publicColors } from '@/components/public-practice/ui'
import type { KitPiece } from '@/lib/drums/exercise'
import type { StepCursor } from '@/lib/drums/playhead'
import { useCellActive } from '@/lib/drums/use-playhead'
import {
  answerRow,
  type CellResult,
  type GridGrade,
  type GridMarks,
  type MarkGridQuestion,
} from '@/lib/drums/theory'

/*
  Grila de completat: același aspect ca `GrooveGrid` (etichete scurte la stânga,
  culorile pieselor, timpii cu chenar gros), dar fiecare pătrat se atinge.

  Rândurile date (`given`) vin pline și nu se ating: sunt reperul, nu întrebarea.
  După verificare, fiecare pătrat spune ce s-a întâmplat cu el, iar diferența se
  vede fără să citești legenda: plin cu bifă e corect, roșu e în plus, conturul
  roșu e lovitura pe care n-ai marcat-o.
*/

const WRONG = '#C8442E'
/*
  Chenarele se văd pe orice fundal, și pe cardul colorat al quiz-ului: un pătrat
  gol e o țintă de atins, iar o țintă fără margini nu se vede. Timpii au chenarul
  mai gros și mai închis, ca pulsul să se citească dintr-o privire.
*/
const CELL_EDGE = '#C9CFD6'
const BEAT_EDGE = '#8A949E'

export function MarkGrid({
  question,
  marks,
  onToggle,
  grade,
  cursor,
}: {
  question: MarkGridQuestion
  marks: GridMarks
  onToggle: (piece: KitPiece, step: number) => void
  /** După verificare. Cât e `null`, grila se poate completa. */
  grade: GridGrade | null
  /** Pasul care se aude (`playhead.ts`); fiecare celulă se abonează singură. */
  cursor?: StepCursor
}) {
  const { t } = useTranslation()
  const { stepsPerBar, beatsPerBar } = question.answer
  const stepsPerBeat = stepsPerBar / beatsPerBar
  const steps = Array.from({ length: stepsPerBar }, (_, step) => step)

  return (
    <View style={{ gap: 4 }}>
      {question.rows.map((piece) => {
        const given = question.given?.includes(piece) ?? false
        const answer = answerRow(question, piece)
        const results = grade?.cells[piece]
        return (
          <View key={piece} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text
              numberOfLines={1}
              style={{
                width: LABEL_WIDTH,
                fontSize: 8,
                fontWeight: '800',
                letterSpacing: 0.3,
                color: given ? publicColors.muted : publicColors.ink,
                textTransform: 'uppercase',
              }}
            >
              {t(`drums.pieceShort_${piece}`)}
            </Text>
            <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
              {steps.map((step) => (
                <GridCell
                  key={step}
                  cursor={cursor}
                  step={step}
                  color={pieceColors[piece]}
                  onBeat={step % stepsPerBeat === 0}
                  filled={given ? answer[step]! : Boolean(marks[piece]?.[step])}
                  result={given ? null : (results?.[step] ?? null)}
                  locked={given || grade !== null}
                  label={`${t(`drums.pieceShort_${piece}`)} ${step + 1}`}
                  onPress={() => onToggle(piece, step)}
                />
              ))}
            </View>
          </View>
        )
      })}
      {/* Numerele timpilor, sub ultimul rând, ca la grila obișnuită. */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <View style={{ width: LABEL_WIDTH }} />
        <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
          {steps.map((step) => (
            <View key={step} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: publicColors.muted }}>
                {step % stepsPerBeat === 0 ? step / stepsPerBeat + 1 : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

/** Grila de quiz are o singură măsură: cursorul o aprinde pe măsura 0. */
const ONLY_BAR = [0] as const

function GridCell({
  cursor,
  step,
  color,
  onBeat,
  filled,
  result,
  locked,
  label,
  onPress,
}: {
  cursor?: StepCursor
  step: number
  color: string
  onBeat: boolean
  filled: boolean
  result: CellResult | null
  locked: boolean
  label: string
  onPress: () => void
}) {
  const active = useCellActive(cursor, ONLY_BAR, step, 1)
  const fill =
    result === 'extra'
      ? WRONG
      : result === 'missed'
        ? '#FFFFFF'
        : filled
          ? color
          : '#FFFFFF'
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: filled, disabled: locked }}
      accessibilityLabel={label}
      disabled={locked}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => ({
        flex: 1,
        height: 34,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: result === 'missed' ? 2 : onBeat ? 2 : 1,
        borderStyle: result === 'missed' ? 'dashed' : 'solid',
        borderColor:
          result === 'missed'
            ? WRONG
            : active
              ? publicColors.ink
              : onBeat
                ? BEAT_EDGE
                : CELL_EDGE,
        backgroundColor: pressed ? '#F1F3F4' : fill,
      })}
    >
      {result === 'hit' ? (
        <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>✓</Text>
      ) : result === 'extra' ? (
        <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>×</Text>
      ) : null}
    </Pressable>
  )
}
