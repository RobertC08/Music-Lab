import { memo } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { publicColors } from '@/components/public-practice/ui'
import { kitPieces, type DrumExercise, type Hit, type KitPiece } from '@/lib/drums/exercise'
import { beatDivisions, MIXED_STEPS_PER_BEAT } from '@/lib/drums/mixed-grid'
import { displayBarsOf } from '@/lib/drums/notation-bars'
import type { StepCursor } from '@/lib/drums/playhead'
import { useCellActive } from '@/lib/drums/use-playhead'

/*
  Groove-ul scris ca grilă: un rând pe piesă, un pătrat pe pas.

  Ce e aliniat pe verticală se lovește deodată, la fel ca pe portativ, și la fel
  ca în fișierul de date, unde rândurile stau unul sub altul. Cine citește grila
  pe ecran și apoi deschide `lib/drums/grooves.ts` vede același lucru, ceea ce e
  jumătate din motivul pentru care datele sunt scrise ca șiruri.

  Ordinea rândurilor e cea de pe partitură: cinelele sus, toba mare jos. Nu e
  gust, un toboșar caută hi-hat-ul în rândul de sus, și dacă nu e acolo,
  citește mai încet.

  Măsurile identice una după alta se desenează o singură dată, cu „×2” (vezi
  `lib/drums/notation-bars.ts`): tot ce se economisește aici e ecran pe care nu
  trebuie să derulezi în timp ce cânți.
*/

/*
  Loviturile din DRSKit stau lângă piesa pe care cad: clopotul lângă ride,
  cross-stick-ul și mătura lângă toba mică, iar fusul cu piciorul sub toba
  mare, unde îl scrie și portativul.
*/
export const ROW_ORDER: KitPiece[] = [
  'crash',
  'cowbell',
  'rideBell',
  'ride',
  'hhOpen',
  'hhClosed',
  'crossStick',
  'rimClick',
  'brush',
  'rimshot',
  'snare',
  'tom',
  'mid',
  'floor',
  'kick',
  'hhFoot',
]

/** Culoarea fiecărei piese. Cinelele reci, tobele calde, toba mare închisă. */
export const pieceColors: Record<KitPiece, string> = {
  crash: '#7A5AF8',
  ride: '#6547E8',
  hhOpen: '#0E9F9A',
  hhClosed: '#008C88',
  snare: '#C8442E',
  tom: '#D97706',
  mid: '#C2620B',
  floor: '#B45309',
  kick: '#1F2937',
  // Nuanțe din familia piesei pe care cad, ca să se citească împreună.
  rideBell: '#8B6CF6',
  crossStick: '#8F2F1E',
  brush: '#E07A5F',
  hhFoot: '#05605C',
  cowbell: '#9A7B12',
  rimshot: '#A3200B',
  rimClick: '#6E3B2E',
}

/*
  Etichetele sunt scurte dinadins.

  Cu numele întregi, „Tobă mică" și „Tobă mare" se tăiau amândouă la „TOBĂ M…",
  adică exact cele două piese pe care un începător trebuie să le deosebească
  arătau identic. Scurtate, se citesc dintr-o privire, iar ordinea rândurilor
  (cinelele sus, toba mare jos) spune restul.
*/
export const LABEL_WIDTH = 44

/*
  Două densități, alese după cât are de desenat exercițiul.

  Un groove de rock are 3 rânduri și o măsură desenată; un fill are 7 rânduri și
  trei măsuri, de patru ori mai mult, pe același ecran. Cu o singură mărime, ori
  groove-ul arată pierdut, ori fill-ul nu încape. Pragul e pe produsul rânduri ×
  măsuri, fiindcă asta e chiar suprafața.
*/
const TIGHT_FROM = 15
const LOOSE = { cell: 18, rowGap: 2, barGap: 8 }
const TIGHT = { cell: 14, rowGap: 1, barGap: 6 }

export interface GrooveGridProps {
  exercise: DrumExercise
  /** Măsura din exercițiu care se aude acum; `-1` cât timp nu se aude nimic. */
  activeBar?: number
  /** Pasul care se aude acum; `-1` la fel. */
  activeStep?: number
  /** Explicația de sub grilă. Se ascunde în timpul sesiunii: nu mai e de citit. */
  showHint?: boolean
  /**
   * Cursorul redării (`playhead.ts`). Dacă e dat, fiecare celulă se abonează la
   * el și se redesenează singură când se aprinde sau se stinge, iar
   * `activeBar`/`activeStep` nu mai contează. E varianta pentru redare: grila
   * întreagă nu se mai reface la fiecare pas.
   */
  cursor?: StepCursor
}

function GrooveGridView({
  exercise,
  activeBar = -1,
  activeStep = -1,
  showHint = true,
  cursor,
}: GrooveGridProps) {
  const { t } = useTranslation()
  const stepsPerBeat = exercise.stepsPerBar / exercise.beatsPerBar
  const displayBars = displayBarsOf(exercise)
  // Doar piesele chiar folosite: un rând gol pentru fiecare piesă din kit ar
  // face groove-ul de două ori mai înalt și cu nimic mai clar.
  const used = ROW_ORDER.filter((piece) =>
    exercise.bars.some((bar) => bar.lanes[piece]?.some(Boolean)),
  )
  const unknown = kitPieces.filter(
    (piece) => !ROW_ORDER.includes(piece) && exercise.bars.some((bar) => bar.lanes[piece]),
  )
  const rows = [...used, ...unknown]
  /*
    Grila amestecată (`mixed-grid.ts`): 12 pași pe timp, dar fiecare timp se
    desenează cu subdiviziunea pe care o folosește cu adevărat. Celula ține
    `span` pași, deci se aprinde cât durează nota ei, nu doar pe primul pas.
  */
  const mixed = stepsPerBeat === MIXED_STEPS_PER_BEAT
  const beatsOf = (bar: (typeof displayBars)[number]['bar']) => {
    const divisions = mixed
      ? beatDivisions(bar, exercise.stepsPerBar, exercise.beatsPerBar)
      : Array<number>(exercise.beatsPerBar).fill(stepsPerBeat)
    return divisions.map((division, beat) => {
      const span = stepsPerBeat / division
      return Array.from({ length: division }, (_, index) => ({
        step: beat * stepsPerBeat + index * span,
        span,
      }))
    })
  }
  const dense = rows.length * displayBars.length >= TIGHT_FROM
  const size = dense ? TIGHT : LOOSE

  return (
    <View style={{ gap: size.barGap }}>
      {displayBars.map(({ bar, sourceBars }, index) => {
        const active = sourceBars.includes(activeBar)
        // Numerele timpilor se scriu o dată, sub ultima măsură, când e înghesuit:
        // grila e aceeași la toate măsurile, deci repetate n-ar spune nimic nou.
        const withNumbers = !dense || index === displayBars.length - 1
        const beats = beatsOf(bar)
        const isActive = (step: number, span: number) =>
          active && activeStep >= step && activeStep < step + span
        return (
          <View
            key={index}
            style={{
              gap: size.rowGap,
              // Măsura de fill se desparte vizual de groove: acolo tace aplicația
              // și intri tu, iar dacă nu se vede unde începe, nu se poate nimeri.
              ...(bar.fill
                ? {
                    borderWidth: 2,
                    borderColor: publicColors.green,
                    borderRadius: 10,
                    padding: dense ? 4 : 6,
                  }
                : null),
            }}
          >
            {bar.fill || sourceBars.length > 1 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {bar.fill ? (
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: '800',
                      letterSpacing: 0.8,
                      color: publicColors.green,
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('drums.yourBar')}
                  </Text>
                ) : null}
                {sourceBars.length > 1 ? (
                  <Text style={{ fontSize: 9, fontWeight: '800', color: publicColors.muted }}>
                    ×{sourceBars.length}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/*
              Pe grila amestecată, deasupra măsurii, o paranteză cu cifra peste
              fiecare timp de triolet (3) sau sextolet (6), ca pe portativ. Sus,
              nu jos: lângă numerele timpilor, „6 3” se citea ca o numărătoare.
            */}
            {mixed && beats.some((cells) => cells.length === 3 || cells.length === 6) ? (
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <View style={{ width: LABEL_WIDTH }} />
                <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
                  {beats.map((cells, beat) => {
                    const tuplet = cells.length === 3 || cells.length === 6
                    return (
                      <View key={beat} style={{ flex: 1, height: 12, justifyContent: 'flex-end' }}>
                        {tuplet ? (
                          <View
                            style={{
                              height: 6,
                              marginHorizontal: 2,
                              borderTopWidth: 1.2,
                              borderLeftWidth: 1.2,
                              borderRightWidth: 1.2,
                              borderColor: publicColors.muted,
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              style={{
                                position: 'absolute',
                                top: -7,
                                paddingHorizontal: 3,
                                fontSize: 9,
                                lineHeight: 11,
                                fontWeight: '900',
                                color: publicColors.ink,
                                backgroundColor: publicColors.card,
                              }}
                            >
                              {cells.length}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    )
                  })}
                </View>
              </View>
            ) : null}

            {rows.map((piece) => {
              const slots = bar.lanes[piece] ?? []
              return (
                <View key={piece} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text
                    style={{
                      width: LABEL_WIDTH,
                      fontSize: 8,
                      fontWeight: '800',
                      letterSpacing: 0.3,
                      color: publicColors.muted,
                      textTransform: 'uppercase',
                    }}
                    numberOfLines={1}
                  >
                    {t(`drums.pieceShort_${piece}`)}
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
                    {beats.map((cells, beat) => (
                      <View key={beat} style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
                        {cells.map(({ step, span }) =>
                          cursor ? (
                            <LiveCell
                              key={step}
                              cursor={cursor}
                              bars={sourceBars}
                              step={step}
                              span={span}
                              hit={slots[step] ?? null}
                              color={pieceColors[piece]}
                              onBeat={step % stepsPerBeat === 0}
                              height={size.cell}
                            />
                          ) : (
                            <Cell
                              key={step}
                              hit={slots[step] ?? null}
                              color={pieceColors[piece]}
                              onBeat={step % stepsPerBeat === 0}
                              active={isActive(step, span)}
                              height={size.cell}
                            />
                          ),
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}

            <View style={{ flexDirection: 'row', gap: 5, display: withNumbers ? 'flex' : 'none' }}>
              <View style={{ width: LABEL_WIDTH }} />
              <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
                {beats.map((cells, beat) => (
                  <View key={beat} style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
                    {cells.map(({ step }) => (
                      <View key={step} style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 8, lineHeight: 10, color: publicColors.muted }}>
                          {/* Numerele timpilor, restul gol: altfel numărătoarea dispare între cifre. */}
                          {step % stepsPerBeat === 0 ? String(step / stepsPerBeat + 1) : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )
      })}
      {/*
        Legenda se scrie doar unde încape. Într-un exercițiu înghesuit, ea e
        primul lucru care ar împinge notația sub linia de derulare, iar notația
        se citește în timp ce cânți, legenda nu.
      */}
      {showHint && !dense ? (
        <Text style={{ fontSize: 11, lineHeight: 15, color: publicColors.muted }}>
          {t('drums.gridHint')}
        </Text>
      ) : null}
    </View>
  )
}

/** O celulă care își află singură dacă e aprinsă, din cursor. */
function LiveCell({
  cursor,
  bars,
  step,
  span,
  ...rest
}: {
  cursor: StepCursor
  bars: readonly number[]
  step: number
  span: number
  hit: Hit | null
  color: string
  onBeat: boolean
  height: number
}) {
  const active = useCellActive(cursor, bars, step, span)
  return <Cell {...rest} active={active} />
}

const Cell = memo(CellView)

function CellView({
  hit,
  color,
  onBeat,
  active,
  height: cellHeight,
}: {
  hit: Hit | null
  color: string
  onBeat: boolean
  active: boolean
  height: number
}) {
  /*
    Intensitatea se vede fără legendă: accentul e plin, lovitura normală e pe
    jumătate, ghost note-ul e o urmă. Cine nu citește nicio explicație vede
    oricum că a treia e mai puțin decât a doua.
  */
  // Proporțiile rămân aceleași la orice densitate: plin, pe jumătate, o urmă.
  const height =
    hit === 'accent'
      ? cellHeight - 4
      : hit === 'normal'
        ? Math.round(cellHeight * 0.5)
        : hit === 'ghost'
          ? Math.round(cellHeight * 0.28)
          : 0
  const opacity = hit === 'ghost' ? 0.45 : 1

  return (
    <View
      style={{
        flex: 1,
        height: cellHeight,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'stretch',
        padding: 1.5,
        // Timpii au chenar mai gros: fără el, o măsură de șaisprezecimi e un șir
        // de 16 pătrate în care nu se vede unde cade pulsul.
        borderWidth: onBeat ? 2 : 1,
        borderColor: active ? publicColors.ink : onBeat ? publicColors.border : '#EDEFF1',
        backgroundColor: active ? '#F1F3F4' : 'transparent',
      }}
    >
      {hit ? (
        <View
          style={{
            height,
            alignSelf: 'stretch',
            marginTop: 'auto',
            borderRadius: 2,
            backgroundColor: color,
            opacity,
          }}
        />
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
export const GrooveGrid = memo(GrooveGridView)
