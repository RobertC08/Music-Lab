import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg'
import { publicColors } from '@/components/public-practice/ui'
import { basePieces, soundsOn, type BasePiece, type KitPiece } from '@/lib/drums/exercise'
import { kitIfLoaded } from '@/lib/drums/kit'
import { usePieceSound } from '@/lib/drums/theory/use-piece-sound'
import { haptic } from '@/lib/haptics/game-haptics'

/*
  Setul de tobe, desenat.

  Desenat, nu fotografiat, din trei motive care se adună: o poză de set e a
  cuiva, un SVG nu cântărește nimic în pachet și se scalează pe orice ecran, iar
  - partea care chiar contează, **desenul poate fi atins**. Lecția „Setul și
  piesele" cere ca elevul să recunoască fiecare piesă DUPĂ CUM SUNĂ; o
  ilustrație lângă text nu poate face asta, iar o listă de butoane ar pierde
  tocmai informația care lipsește unui începător: unde stă fiecare piesă față de
  celelalte.

  Deci diagrama nu e o ilustrație a lecției. E exercițiul ei.

  Ce NU e: o reprezentare fidelă a unui set anume. Proporțiile sunt alese ca să
  se distingă piesele la 320 px lățime, nu ca să semene cu un Pearl Export. Un
  începător trebuie să vadă că fusul e din două cinele mici suprapuse și că
  cazanul stă pe picioare, restul e decor.

  Așezarea e cea văzută DIN FAȚĂ, dinspre public, fiindcă asta e imaginea pe care
  o are oricine a văzut o trupă. Din spatele setului ar fi „corect" pentru cel
  care cântă, dar n-ar semăna cu nimic din ce a văzut elevul până acum.
*/

/** Culorile pe care le are și grila, ca să se lege desenul de notație. */
const pieceColors: Record<BasePiece, string> = {
  crash: '#7A5AF8',
  ride: '#6547E8',
  hhOpen: '#0E9F9A',
  hhClosed: '#008C88',
  snare: '#C8442E',
  tom: '#D97706',
  mid: '#C2620B',
  floor: '#B45309',
  kick: '#1F2937',
}

const BRASS = '#C9A227'
const BRASS_DARK = '#A8871C'

/*
  Pe desen apar opt piese, nu nouă: fusul închis și cel deschis sunt ACEEAȘI
  piesă, cântată în două feluri. Desenate separat ar sugera că setul are două
  hi-hat-uri, ceea ce e exact confuzia pe care lecția o repară. Loviturile din
  DRSKit (cross-stick, mătura, fusul cu piciorul, clopotul) nu sunt piese, deci
  nici ele nu se desenează: se aprind pe piesa pe care cad (`soundsOn`).
*/
const drawnPieces = basePieces.filter((piece) => piece !== 'hhOpen')

const VIEW_W = 340
const VIEW_H = 215

/*
  Geometria, scoasă din desen ca date.

  Proporțiile urmează diametrele reale ale unui set standard de 5 piese, toba
  mare 22", cazanul 16", toba mică 14", tomurile 12" și 13", fusul 14", crash-ul
  16", ride-ul 20", la aceeași scară. Prima variantă le alesese la ochi și se
  vedea: cazanul ieșea aproape cât toba mare, iar toba mică arăta ca o jucărie
  lângă el. Un începător care compară mărimile pe desen trebuie să compare ceva
  adevărat.

  `hitAreas` sunt zonele atingibile, ținute lângă geometrie ca să nu se despartă
  de ea: mutată o piesă, se vede imediat că trebuie mutată și ținta.

  **Orientarea e cea de pe scaun**, nu dinspre public: fusul și toba mică în
  stânga, cazanul și ride-ul în dreapta. Așa arată setul în orice fotografie de
  magazin, și, mai important, așa o să-l vadă elevul când se așază la el. Vederea
  dinspre public ar fi oglindită, iar elevul ar căuta cazanul în partea greșită.
*/
type Cylinder = { cx: number; top: number; rx: number; h: number; lid?: number }

/**
 * Tobele, ca cilindri.
 *
 * `lid` e cât de deschis se vede capacul: tomurile de pe toba mare sunt
 * înclinate spre toboșar, deci li se vede mai mult din față decât cazanului,
 * care stă drept. Fără diferența asta toate tobele par tăiate de același plan
 * și desenul se aplatizează.
 */
const shells: Record<'floor' | 'snare' | 'tom' | 'mid', Cylinder> = {
  snare: { cx: 86, top: 128, rx: 24, h: 24, lid: 0.34 },
  tom: { cx: 146, top: 84, rx: 20.5, h: 30, lid: 0.42 },
  mid: { cx: 196, top: 80, rx: 22, h: 33, lid: 0.42 },
  floor: { cx: 268, top: 116, rx: 27, h: 48, lid: 0.3 },
}

/** Toba mare: aproape un cerc, ușor întoarsă, deci o elipsă. */
const kick = { cx: 172, cy: 152, rx: 46, ry: 42 }

/** Cinelele: o elipsă turtită pe un stativ. */
const cymbals: Record<'crash' | 'ride' | 'hhClosed', { cx: number; cy: number; rx: number }> = {
  crash: { cx: 74, cy: 40, rx: 30 },
  ride: { cx: 266, cy: 44, rx: 37 },
  hhClosed: { cx: 44, cy: 86, rx: 26 },
}

const hitAreas: Record<(typeof drawnPieces)[number], { x: number; y: number; w: number; h: number }> = {
  crash: { x: 42, y: 24, w: 66, h: 30 },
  hhClosed: { x: 16, y: 70, w: 58, h: 34 },
  snare: { x: 58, y: 114, w: 56, h: 44 },
  tom: { x: 122, y: 70, w: 48, h: 48 },
  mid: { x: 172, y: 66, w: 50, h: 50 },
  kick: { x: 128, y: 114, w: 90, h: 80 },
  floor: { x: 238, y: 102, w: 62, h: 68 },
  ride: { x: 228, y: 28, w: 76, h: 32 },
}

/** Capacul implicit, pentru tobele care stau drept. */
const LID = 0.3

/*
  Corpurile sunt închise la culoare, cu cercurile colorate.

  Un set adevărat are corpuri lăcuite și hardware cromat, desenat în tente
  pastel, arăta ca o jucărie. Dar culorile pieselor nu se pot pierde: sunt
  aceleași cu ale grilei de notație, și ele sunt puntea dintre desen și rândul
  pe care elevul o să-l citească peste două lecții. Deci corpul e întunecat și
  **cercurile rămân colorate**: acolo se uită oricum ochiul, fiindcă acolo se
  lovește.
*/
const SHELL_DARK = '#23272B'
const SHELL_LIGHT = '#3C434A'
const HEAD = '#F2F0EA'
const CHROME = '#B6BEC6'
const CHROME_DARK = '#8B949C'

type Paint = {
  edge: (piece: BasePiece) => string
  edgeAlpha: (piece: BasePiece) => number
  width: (piece: BasePiece) => number
}

/**
 * O tobă văzută din lateral: capacul ca elipsă, corpul dedesubt, fundul curbat.
 *
 * Fundul curbat e singurul lucru care o face să arate ca un cilindru și nu ca un
 * dreptunghi cu o elipsă pe el, prima variantă tăia corpul drept jos și fiecare
 * tobă părea o cutie.
 */
function Shell({
  piece,
  shape,
  edge,
  edgeAlpha,
  tint,
  width,
}: Paint & {
  piece: BasePiece
  shape: Cylinder
  tint: (piece: BasePiece) => number
}) {
  const { cx, top, rx, h } = shape
  const ry = rx * (shape.lid ?? LID)
  const bottom = top + h
  const lit = edgeAlpha(piece) === 1
  return (
    <G>
      {/* Corpul lăcuit, cu o dungă mai deschisă pe stânga: de acolo vine lumina. */}
      <Path
        d={`M${cx - rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} V${top} Z`}
        fill={SHELL_DARK}
      />
      <Path
        d={`M${cx - rx * 0.78} ${top} V${bottom - ry * 0.35} A${rx * 0.5} ${ry * 0.7} 0 0 0 ${cx - rx * 0.26} ${bottom - ry * 0.1} V${top} Z`}
        fill={SHELL_LIGHT}
        opacity={0.75}
      />
      {/*
        Cercul de jos și lugurile, piesele de metal care strâng fața. Fără
        ele corpul rămâne un tub uniform și nu se citește ca o tobă.
      */}
      <Path
        d={`M${cx - rx} ${bottom - ry * 0.2} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom - ry * 0.2}`}
        fill="none"
        stroke={CHROME_DARK}
        strokeWidth={1.4}
      />
      <Path
        d={`M${cx - rx * 0.62} ${top + ry * 0.6} v${h * 0.34} M${cx} ${top + ry} v${h * 0.34} M${cx + rx * 0.62} ${top + ry * 0.6} v${h * 0.34}`}
        stroke={CHROME}
        strokeWidth={2.4}
        strokeLinecap="round"
        opacity={0.9}
      />
      {/* Cercul de sus, în culoarea piesei: acolo se lovește și acolo se uită ochiul. */}
      <Ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={HEAD} />
      <Ellipse
        cx={cx}
        cy={top}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={edge(piece)}
        strokeOpacity={edgeAlpha(piece)}
        strokeWidth={width(piece) + 1}
      />
      {lit ? (
        <Ellipse cx={cx} cy={top} rx={rx * 0.82} ry={ry * 0.82} fill={edge(piece)} fillOpacity={tint(piece)} />
      ) : null}
    </G>
  )
}

/** Un cinel: o elipsă turtită, cu clopotul la mijloc. */
function Cymbal({
  piece,
  shape,
  edge,
  edgeAlpha,
  width,
}: Paint & { piece: BasePiece; shape: { cx: number; cy: number; rx: number } }) {
  const { cx, cy, rx } = shape
  return (
    <G>
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={rx * 0.18}
        fill={BRASS}
        stroke={edge(piece)}
        strokeOpacity={edgeAlpha(piece)}
        strokeWidth={width(piece)}
      />
      <Ellipse cx={cx} cy={cy - 1.5} rx={rx * 0.2} ry={rx * 0.06} fill={BRASS_DARK} />
    </G>
  )
}

/**
 * Desenul singur, fără sunet și fără butoane.
 *
 * Despărțit de `KitDiagram` fiindcă exemplele au nevoie de desen, dar NU de
 * partea interactivă: `usePieceSound` ține nouă playere și le încălzește la
 * montare, iar pornit sub fiecare exemplu ar însemna nouă redări tăcute la
 * fiecare secțiune deschisă. Aici intră doar ce e aprins acum.
 *
 * @param lit Piesele care sună în clipa asta. În lecție vine de la atingere, la
 * exemplu de la ceasul pistei.
 */
export function KitDrawing({
  lit,
  onTapPiece,
  compact = false,
}: {
  lit: readonly KitPiece[]
  /** Fără el, desenul e doar de privit: nu se mai desenează zonele atingibile. */
  onTapPiece?: (piece: BasePiece) => void
  /**
   * Mai îngust, deci și mai scund.
   *
   * Pentru ecranul de practică, unde desenul e un martor, nu subiectul: acolo se
   * citește notația, iar tot ce e sub linia de derulare în timpul sesiunii e ca
   * și inexistent, telefonul stă sprijinit și ai bețele în mâini. La lecție
   * rămâne mare, fiindcă acolo desenul E exercițiul.
   */
  compact?: boolean
}) {
  const on = (piece: BasePiece) => lit.some((struck) => soundsOn[struck] === piece)

  /*
    Fiecare piesă e desenată în CULOAREA EI, nu în gri.

    Prima variantă avea conturul gri pentru tot și culoarea apărea doar la
    atingere. Pe ecran ieșea o pată albă în care nu se distingea nimic, dar
    problema adevărată era alta: culorile astea sunt exact cele din grila de
    notație (`groove-grid.tsx`). Ținute ascunse, se pierde singura legătură
    dintre desen și rândul pe care elevul o să-l citească peste două lecții,
    tomul 1 e portocaliu în amândouă, și de aia se recunoaște.

    Deci culoarea e mereu acolo, doar mai stinsă; lovitura o aprinde.
  */
  const edge = (piece: BasePiece) => pieceColors[piece]
  const edgeAlpha = (piece: BasePiece) => (on(piece) ? 1 : 0.5)
  const tint = (piece: BasePiece) => (on(piece) ? 0.2 : 0.09)
  const width = (piece: BasePiece) => (on(piece) ? 2.6 : 1.6)
  /*
    Cinelele primesc un contur mai subțire și mai stins decât tobele.

    Un cinel e o elipsă foarte turtită, la aceeași grosime de linie ca la tobe,
    conturul ajunge să acopere aproape toată suprafața, iar culoarea piesei
    înlocuiește alama: fusul ieșea verde-oliv lângă un crash auriu, deci nu mai
    citeai „aceeași familie de instrumente". Aprins, conturul revine la fel de
    apăsat ca la tobe, acolo chiar vrem să sară în ochi.
  */
  const cymbalAlpha = (piece: BasePiece) => (on(piece) ? 1 : 0.3)
  const cymbalWidth = (piece: BasePiece) => (on(piece) ? 2.4 : 1)

  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: publicColors.border,
        backgroundColor: '#FBFCFD',
        overflow: 'hidden',
        ...(compact ? { maxWidth: 230, alignSelf: 'center' as const } : {}),
      }}
    >
      <View style={{ width: '100%', aspectRatio: VIEW_W / VIEW_H }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
            {/*
              Hardware-ul, desenat întâi ca să treacă pe sub tobe.

              Tijele coboară până la podea și fiecare are trepiedul lui. Nu e
              decor: fără stative, cinelele plutesc, iar un începător nu are de
              unde ști că fusul se cântă și cu piciorul.
            */}
            <G stroke={CHROME} strokeWidth={2.4} strokeLinecap="round" fill="none">
              {/* Crash, stânga sus. */}
              <Path d="M74 42 V186 M60 196 L74 182 L88 196" />
              {/* Ride, dreapta sus, stativul lui trece prin spatele cazanului. */}
              <Path d="M266 46 V186 M252 196 L266 182 L280 196" />
              {/* Fusul: tija cu pedala la picior. */}
              <Path d="M44 86 V190 M30 196 L44 184 L58 196" />
              <Path d="M26 198 H62" strokeWidth={3.2} />
              {/* Toba mică, pe stativul ei. */}
              <Path d="M86 152 V182 M72 196 L86 180 L100 196" />
              {/* Cazanul, pe propriile picioare. */}
              <Path d="M244 156 L240 194 M292 156 L296 194" />
              {/* Tomurile, prinse de toba mare printr-un suport în T. */}
              <Path d="M146 112 V100 M196 112 V98 M146 100 H196 M172 98 V112" />
              {/* Picioarele tobei mari. */}
              <Path d="M132 182 L122 194 M212 182 L222 194" />
            </G>

            {/*
              Ordinea de desenare E adâncimea: ce se desenează mai târziu acoperă.

              Cazanul și tomurile stau în planul din spate, toba mare peste ele,
              toba mică în față. Fără suprapunere, piesele par așezate pe aceeași
              linie și setul se aplatizează, exact ce se vedea în prima variantă.
            */}
            <Shell piece="floor" shape={shells.floor} edge={edge} edgeAlpha={edgeAlpha} tint={tint} width={width} />
            <Shell piece="tom" shape={shells.tom} edge={edge} edgeAlpha={edgeAlpha} tint={tint} width={width} />
            <Shell piece="mid" shape={shells.mid} edge={edge} edgeAlpha={edgeAlpha} tint={tint} width={width} />

            {/*
              Toba mare, văzută aproape din față.

              Pielea din față e transparentă, cu gaura de microfon, așa arată pe
              orice set, și e singurul detaliu prin care se deosebește de un tom
              mare. Cercul e în culoarea piesei, ca la celelalte.
            */}
            <G>
              <Ellipse cx={kick.cx} cy={kick.cy} rx={kick.rx} ry={kick.ry} fill={SHELL_DARK} />
              <Ellipse cx={kick.cx} cy={kick.cy} rx={kick.rx - 5} ry={kick.ry - 5} fill={HEAD} opacity={0.94} />
              <Ellipse cx={kick.cx - 12} cy={kick.cy + 12} rx={7.5} ry={7} fill={SHELL_DARK} opacity={0.5} />
              <Ellipse
                cx={kick.cx}
                cy={kick.cy}
                rx={kick.rx}
                ry={kick.ry}
                fill="none"
                stroke={edge('kick')}
                strokeOpacity={edgeAlpha('kick')}
                strokeWidth={width('kick') + 1.4}
              />
              {edgeAlpha('kick') === 1 ? (
                <Ellipse cx={kick.cx} cy={kick.cy} rx={kick.rx - 5} ry={kick.ry - 5} fill={edge('kick')} fillOpacity={tint('kick')} />
              ) : null}
              {/* Pedala, în fața tobei mari. */}
              <Path d="M164 196 h22 M172 190 v8" stroke={CHROME} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            </G>

            {/* Toba mică, cea mai în față. */}
            <Shell piece="snare" shape={shells.snare} edge={edge} edgeAlpha={edgeAlpha} tint={tint} width={width} />

            {/*
              Cinelele, toate de alamă.

              Culoarea piesei le conturează, dar NU le umple: un fus verde lângă
              un crash auriu arăta ca alt material, nu ca aceeași familie. Iar
              „cinelele sunt de alamă" e chiar una din lucrurile pe care lecția
              le predă.
            */}
            <Cymbal piece="crash" shape={cymbals.crash} edge={edge} edgeAlpha={cymbalAlpha} width={cymbalWidth} />
            <Cymbal piece="ride" shape={cymbals.ride} edge={edge} edgeAlpha={cymbalAlpha} width={cymbalWidth} />
            {/* Fusul: două cinele suprapuse, cu un deget între ele. */}
            <G>
              <Ellipse cx={cymbals.hhClosed.cx} cy={cymbals.hhClosed.cy - 5} rx={cymbals.hhClosed.rx} ry={cymbals.hhClosed.rx * 0.17} fill={BRASS} stroke={edge('hhClosed')} strokeOpacity={cymbalAlpha('hhClosed')} strokeWidth={cymbalWidth('hhClosed')} />
              <Ellipse cx={cymbals.hhClosed.cx} cy={cymbals.hhClosed.cy + 5} rx={cymbals.hhClosed.rx} ry={cymbals.hhClosed.rx * 0.17} fill={BRASS_DARK} stroke={edge('hhClosed')} strokeOpacity={cymbalAlpha('hhClosed')} strokeWidth={cymbalWidth('hhClosed')} />
            </G>

          {/* Zonele atingibile, invizibile, deasupra a tot. */}
          {onTapPiece
            ? drawnPieces.map((piece) => {
                const area = hitAreas[piece]
                return (
                  <Rect
                    key={piece}
                    x={area.x}
                    y={area.y}
                    width={area.w}
                    height={area.h}
                    fill="transparent"
                    onPress={() => onTapPiece(piece)}
                  />
                )
              })
            : null}
        </Svg>
      </View>
    </View>
  )
}

/**
 * Diagrama de învățat: desenul plus butoanele, cu sunet la atingere.
 *
 * Ea e exercițiul lecției „Setul și piesele", de asta ține și socoteala
 * pieselor neîncercate. Exemplele folosesc `KitDrawing` direct: acolo desenul
 * arată ce cântă aplicația, nu ce atinge elevul.
 */
export function KitDiagram() {
  const { t } = useTranslation()
  /*
    Mostrele din încărcător, nu ca proprietate (vezi `kitReady` în
    `LessonScreen.tsx`). Diagrama se desenează doar după ce sunt gata.
  */
  const { play, playing } = usePieceSound(kitIfLoaded()!)
  const [sounded, setSounded] = useState<BasePiece[]>([])
  const remaining = useMemo(
    () => drawnPieces.filter((piece) => !sounded.includes(piece)).length,
    [sounded],
  )

  /*
    Redarea pornește AICI, în handler, nu într-un efect de după `setSounded`:
    pe web contextul audio rămâne pornit de utilizator doar cât ține sarcina
    curentă. Vezi `use-piece-sound.ts`.
  */
  const tap = (piece: BasePiece) => {
    haptic('light')
    play(piece)
    setSounded((current) => (current.includes(piece) ? current : [...current, piece]))
  }

  const lit = useMemo(() => (playing ? [playing] : []), [playing])

  return (
    <View style={{ gap: 10 }}>
      <KitDrawing lit={lit} onTapPiece={tap} />

      {/*
        Numele sub desen, nu pe el.

        Pe desen, opt etichete la lățimea unui telefon se suprapun sau se
        micșorează sub pragul de citit, iar la o diagramă atinsă cu degetul
        eticheta trebuie să fie și ea o țintă. Butoanele fac amândouă.
      */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {drawnPieces.map((piece) => {
          const active = playing === piece
          const heard = sounded.includes(piece)
          return (
            <Pressable
              key={piece}
              accessibilityRole="button"
              accessibilityLabel={t('drums.theoryHearPiece', { piece: t(`drums.piece_${piece}`) })}
              onPress={() => tap(piece)}
              style={{
                minHeight: 34,
                paddingHorizontal: 11,
                justifyContent: 'center',
                borderRadius: 999,
                borderWidth: active ? 2 : 1.5,
                borderColor: active || heard ? pieceColors[piece] : publicColors.border,
                backgroundColor: active ? `${pieceColors[piece]}1A` : publicColors.card,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: active || heard ? pieceColors[piece] : publicColors.muted,
                }}
              >
                {t(`drums.piece_${piece}`)}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={{ fontSize: 13, lineHeight: 19, color: publicColors.muted }}>
        {remaining > 0 ? t('drums.theoryKitHint', { count: remaining }) : t('drums.theoryKitDone')}
      </Text>
    </View>
  )
}
