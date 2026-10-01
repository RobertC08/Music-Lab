import type { PropsWithChildren, ReactNode } from 'react'
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors, font } from '../theme'

export function BrandWordmark() {
  return (
    <View style={{ minHeight: 32, justifyContent: 'center' }}>
      <Text
        style={{
          fontFamily: font,
          fontSize: 20,
          lineHeight: 28,
          fontWeight: '800',
          letterSpacing: -0.6,
          color: colors.ink,
        }}
      >
        MusicLab
      </Text>
    </View>
  )
}

export function PageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <View style={{ gap: 5 }}>
      {eyebrow ? (
        <Text
          style={{
            fontFamily: font,
            fontSize: 14,
            lineHeight: 19,
            fontWeight: '800',
            letterSpacing: 1.2,
            color: colors.muted,
          }}
        >
          {eyebrow.toUpperCase()}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: font,
          fontSize: 32,
          lineHeight: 35,
          fontWeight: '900',
          letterSpacing: -1.25,
          color: colors.ink,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontFamily: font, fontSize: 16, lineHeight: 22, color: colors.muted }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'orange',
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  tone?: 'orange' | 'dark' | 'ghost'
}) {
  const background =
    tone === 'orange' ? colors.orange : tone === 'dark' ? colors.studio : 'transparent'
  const textColor = tone === 'ghost' ? colors.ink : tone === 'orange' ? colors.ink : '#FFFFFF'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: background,
        borderWidth: tone === 'ghost' ? 1.5 : 0,
        borderColor: colors.border,
        opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
      })}
    >
      <Text style={{ fontFamily: font, fontSize: 17, fontWeight: '800', color: textColor }}>
        {label}
      </Text>
    </Pressable>
  )
}

export function Pill({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        minWidth: 52,
        paddingHorizontal: 14,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? colors.orange : colors.card,
        borderWidth: 1.5,
        borderColor: selected ? colors.orange : colors.border,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
        {label}
      </Text>
    </Pressable>
  )
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ fontFamily: font, fontSize: 15, color: colors.muted, flexShrink: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: font,
          fontSize: 15,
          fontWeight: '800',
          color: accent ?? colors.ink,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export function Badge({ label, color, background }: { label: string; color: string; background: string }) {
  return (
    <View
      style={{
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: background,
      }}
    >
      <Text
        style={{
          fontFamily: font,
          fontSize: 12,
          fontWeight: '900',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color,
        }}
      >
        {label}
      </Text>
    </View>
  )
}

export function Row({ children, gap = 10 }: PropsWithChildren<{ gap?: number }>) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>{children}</View>
}

export function IconCircle({ children, background }: { children: ReactNode; background: string }) {
  return (
    <View
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background,
      }}
    >
      {children}
    </View>
  )
}
