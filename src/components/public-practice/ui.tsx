import { Pressable, Text, View } from 'react-native'

/*
  Doar culorile și butonul de care au nevoie ecranele de tobe, copiate din aplicație
  (`mobile/components/public-practice/ui.tsx`). Restul fișierului de acolo aduce
  gradiente, mascota și bara de tab-uri, nimic din ce arată sandbox-ul.
*/
export const publicColors = {
  background: '#FFFFFF',
  ink: '#121417',
  muted: '#5E656D',
  orange: '#FF7A00',
  orangeSoft: '#FFE0BF',
  teal: '#008C88',
  tealSoft: '#D4ECEB',
  purple: '#6547E8',
  purpleSoft: '#E5E0FA',
  green: '#158A52',
  border: '#D6DCE0',
  card: '#FFFFFF',
  studio: '#17191D',
  studioSoft: '#24272D',
}

/**
 * Butonul principal, copiat **verbatim** din aplicație.
 *
 * Copiat, nu rescris: ecranele care îl folosesc se mută dintr-o parte în alta cu
 * un `cp`, iar un buton care arată altfel aici ar face ca ce verifici în sandbox
 * să nu mai fie ce livrezi.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'orange',
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  tone?: 'orange' | 'dark'
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        height: 56,
        borderRadius: 16,
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tone === 'dark' ? publicColors.ink : publicColors.orange,
            opacity: disabled ? 0.35 : pressed ? 0.78 : 1,
            shadowColor: tone === 'dark' ? '#000000' : '#D66B00',
            shadowOpacity: disabled ? 0 : 0.22,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text
            style={{
              fontFamily: 'Geist',
              fontSize: 16,
              fontWeight: '800',
              color: tone === 'dark' ? '#FFFFFF' : '#111111',
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
