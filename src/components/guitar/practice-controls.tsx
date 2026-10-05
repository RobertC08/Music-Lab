import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Platform, Pressable, Switch, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Minus, Play, Plus, Square } from 'lucide-react-native'
import { publicColors } from '@/components/public-practice/ui'

/*
  Controalele comune însoțitorilor de practică de chitară (schimbări de
  acorduri, strumming): înapoi, tempo cu pas de 1 BPM și repetare la apăsare
  lungă, comutatoare.
*/

const TEMPO_STEP = 1

export function BackButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation()
  return (
    <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={onPress}
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
  )
}

/** Cât ții apăsat până pornește repetarea, și cât de des repetă. */
const HOLD_DELAY_MS = 380
const HOLD_EVERY_MS = 70
/** Cât așteaptă tempoul după ultima atingere până ajunge în ecran. */
const COMMIT_AFTER_MS = 280

/**
 * Tempoul, cu starea lui proprie.
 *
 * Numărul de pe ecran se schimbă la fiecare atingere, dar restul ecranului
 * (planul, diagramele, seria) primește tempoul abia după o scurtă pauză. Altfel
 * fiecare pas de 1 BPM redesena tot ecranul de practică, iar pe telefon asta se
 * simțea ca lag la − / + (React Compiler nu e pornit la rulare în sandbox).
 */
export function TempoControl({
  label,
  value,
  min,
  max,
  disabled,
  onCommit,
  unit = 'BPM',
  step: stepSize = TEMPO_STEP,
}: {
  label: string
  /** Ce scrie după număr: „BPM", sau nimic pentru poziție. */
  unit?: string
  step?: number
  value: number
  min: number
  max: number
  disabled: boolean
  onCommit: (value: number) => void
}) {
  const [shown, setShown] = useState(value)
  const latest = useRef(value)
  const commit = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (commit.current) clearTimeout(commit.current)
    },
    [],
  )

  /*
    Pornită sesiunea, un pas încă neajuns în ecran se anulează și numărul revine
    la tempoul care chiar se aude: pista e deja randată cu el.
  */
  useEffect(() => {
    if (!disabled || !commit.current) return
    clearTimeout(commit.current)
    commit.current = null
    latest.current = value
    setShown(value)
  }, [disabled, value])

  /** Un pas. Întoarce `false` la capăt (min sau max), ca repetarea să se oprească acolo. */
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, latest.current + delta))
    if (next === latest.current) return false
    latest.current = next
    setShown(next)
    if (commit.current) clearTimeout(commit.current)
    commit.current = setTimeout(() => onCommit(latest.current), COMMIT_AFTER_MS)
    return true
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{label}</Text>
      <RoundButton label="−" disabled={disabled || shown <= min} onStep={() => step(-stepSize)}>
        <Minus size={18} color={publicColors.ink} />
      </RoundButton>
      <Text style={{ width: 84, textAlign: 'center', fontSize: 18, fontWeight: '800', color: publicColors.ink }}>
        {unit ? `${shown} ${unit}` : shown}
      </Text>
      <RoundButton label="+" disabled={disabled || shown >= max} onStep={() => step(stepSize)}>
        <Plus size={18} color={publicColors.ink} />
      </RoundButton>
    </View>
  )
}

/**
 * Un buton −/+ care, ținut apăsat, repetă: cu pas de 1 BPM, de la 60 la 200
 * ar fi 140 de atingeri. O atingere scurtă face un pas; ținut, merge singur.
 */
/** Cel mult atâția pași dintr-o singură apăsare lungă: plasa de siguranță. */
const MAX_REPEATS = 60

function RoundButton({
  label,
  disabled,
  onStep,
  children,
}: {
  label: string
  disabled: boolean
  /** Un pas; `false` înseamnă că s-a ajuns la capăt. */
  onStep: () => boolean
  children: ReactNode
}) {
  /*
    Repetarea la apăsare lungă, cu trei frâne.

    Prima variantă repeta până venea `onPressOut`. Pe telefon, `onPressOut` se
    poate pierde: degetul alunecă și pagina ia gestul ca derulare, sau atingerea
    vine de două ori (atingere + mouse emulat pe web) și al doilea temporizator
    îl suprascrie pe primul. Atunci repetarea nu se mai oprea și tempoul fugea
    singur până la 200.

    Acum: (1) orice apăsare nouă oprește întâi ce era pornit; (2) repetarea
    continuă doar cât `pressed` e adevărat, iar pe web orice ridicare a degetului
    oriunde în pagină îl face fals; (3) se oprește la capătul intervalului și,
    oricum, după `MAX_REPEATS` pași.
  */
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null)
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null)
  const pressed = useRef(false)
  const repeated = useRef(false)
  const detach = useRef<(() => void) | null>(null)

  const release = () => {
    pressed.current = false
    if (hold.current) clearTimeout(hold.current)
    if (repeat.current) clearInterval(repeat.current)
    hold.current = null
    repeat.current = null
    detach.current?.()
    detach.current = null
  }
  useEffect(() => release, [])
  useEffect(() => {
    if (disabled) release()
  }, [disabled])

  const pressIn = () => {
    release()
    pressed.current = true
    repeated.current = false
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const up = () => release()
      for (const type of ['pointerup', 'pointercancel', 'touchend', 'touchcancel', 'mouseup']) {
        document.addEventListener(type, up, true)
      }
      detach.current = () => {
        for (const type of ['pointerup', 'pointercancel', 'touchend', 'touchcancel', 'mouseup']) {
          document.removeEventListener(type, up, true)
        }
      }
    }
    hold.current = setTimeout(() => {
      if (!pressed.current) return
      repeated.current = true
      let count = 0
      if (!onStep()) {
        release()
        return
      }
      repeat.current = setInterval(() => {
        count += 1
        if (!pressed.current || count > MAX_REPEATS || !onStep()) release()
      }, HOLD_EVERY_MS)
    }, HOLD_DELAY_MS)
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      // Atingerea scurtă face un pas (`onPress`); ținut, repetă.
      onPressIn={pressIn}
      onPressOut={release}
      onPress={() => {
        if (!repeated.current) onStep()
      }}
      style={({ pressed: down }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: publicColors.border,
        backgroundColor: down ? '#F1F3F4' : 'transparent',
        opacity: disabled ? 0.35 : 1,
      })}
    >
      {children}
    </Pressable>
  )
}

export function ToggleRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: publicColors.ink }}>{label}</Text>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: publicColors.teal, false: publicColors.border }}
      />
    </View>
  )
}

/*
  Cele două ecrane ale unui însoțitor de practică, ca la tobe:

  1. Setările: titlul, sfatul, o previzualizare și setările, cu „Pornește"
     fixat jos (`StartBar`), mereu la vedere, oricât de lungă ar fi pagina.
  2. Exercițiul: se deschide la „Pornește" și începe direct. Sus are „Oprește"
     și drumul înapoi la setări (`SessionBar`); restul ecranului e exercițiul.
     La final, aceeași bară oferă „Încă o dată".
*/

export function StartBar({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: publicColors.border,
        backgroundColor: publicColors.background,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          height: 56,
          borderRadius: 28,
          backgroundColor: pressed ? publicColors.studioSoft : publicColors.studio,
        })}
      >
        <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF' }}>{label}</Text>
      </Pressable>
    </View>
  )
}

export function SessionBar({
  playing,
  title,
  subtitle,
  onStop,
  onAgain,
  onSettings,
}: {
  playing: boolean
  title: string
  subtitle: string
  onStop: () => void
  onAgain: () => void
  onSettings: () => void
}) {
  const { t } = useTranslation()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: publicColors.border,
        backgroundColor: publicColors.background,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('guitar.settings')}
        onPress={onSettings}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: 44,
          paddingHorizontal: 8,
          borderRadius: 22,
          backgroundColor: pressed ? '#F1F3F4' : 'transparent',
        })}
      >
        <ArrowLeft size={20} color={publicColors.ink} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: publicColors.ink }}>{t('guitar.settings')}</Text>
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '800', color: publicColors.ink }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 12, color: publicColors.muted }}>
          {subtitle}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={playing ? onStop : onAgain}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 22,
          backgroundColor: pressed ? publicColors.studioSoft : publicColors.studio,
        })}
      >
        {playing ? <Square size={14} color="#FFFFFF" fill="#FFFFFF" /> : <Play size={14} color="#FFFFFF" fill="#FFFFFF" />}
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
          {playing ? t('guitar.stop') : t('guitar.again')}
        </Text>
      </Pressable>
    </View>
  )
}
