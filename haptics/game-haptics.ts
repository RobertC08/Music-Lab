import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { HapticKind, HapticStep } from './haptic-patterns'

export { beatHaptic, retryHapticPattern, successHapticPattern } from './haptic-patterns'
export type { HapticKind, HapticStep } from './haptic-patterns'

const { ImpactFeedbackStyle: Impact, NotificationFeedbackType: Notification, AndroidHaptics } = Haptics

type IosFeedback =
  | { impact: Haptics.ImpactFeedbackStyle }
  | { notification: Haptics.NotificationFeedbackType }
  | { selection: true }

const IOS: Record<HapticKind, IosFeedback> = {
  tick: { impact: Impact.Light },
  accent: { impact: Impact.Medium },
  tap: { impact: Impact.Rigid },
  soft: { impact: Impact.Soft },
  select: { selection: true },
  light: { impact: Impact.Light },
  medium: { impact: Impact.Medium },
  heavy: { impact: Impact.Heavy },
  rigid: { impact: Impact.Rigid },
  success: { notification: Notification.Success },
  warning: { notification: Notification.Warning },
}

/*
  Pe Android, `impactAsync` e o vibrație de 50 ms, prea grosieră pentru un puls
  rapid. Haptica de sistem (`performHapticFeedback`) e fină și respectă setarea
  „vibrații la atingere” a telefonului. `Confirm` și `Reject` există de la
  Android 11; pe telefoanele mai vechi apelul pică și trecem pe vibrația
  obișnuită, cu aceeași intensitate ca pe iOS.
*/
const ANDROID: Record<HapticKind, Haptics.AndroidHaptics> = {
  tick: AndroidHaptics.Clock_Tick,
  accent: AndroidHaptics.Context_Click,
  tap: AndroidHaptics.Keyboard_Tap,
  soft: AndroidHaptics.Clock_Tick,
  select: AndroidHaptics.Clock_Tick,
  light: AndroidHaptics.Keyboard_Tap,
  medium: AndroidHaptics.Context_Click,
  heavy: AndroidHaptics.Long_Press,
  rigid: AndroidHaptics.Virtual_Key,
  success: AndroidHaptics.Confirm,
  warning: AndroidHaptics.Reject,
}

function vibrate(kind: HapticKind) {
  const feedback = IOS[kind]
  if ('impact' in feedback) return Haptics.impactAsync(feedback.impact)
  if ('notification' in feedback) return Haptics.notificationAsync(feedback.notification)
  return Haptics.selectionAsync()
}

/** O singură atingere haptică. Nu aruncă niciodată: fără haptică, jocul merge la fel. */
export function haptic(kind: HapticKind) {
  try {
    if (Platform.OS === 'android') {
      void Haptics.performAndroidHapticsAsync(ANDROID[kind]).catch(() =>
        vibrate(kind).catch(() => {}),
      )
      return
    }
    if (Platform.OS === 'ios') void vibrate(kind).catch(() => {})
  } catch {
    // Modulul nativ poate lipsi (de pildă în teste); haptica e doar un bonus.
  }
}

/**
 * Pornește un tipar. Fiecare timer ajunge la `track`, ca ecranul să-l poată opri
 * odată cu restul timerelor când runda se schimbă sau ecranul se închide.
 */
export function playHapticPattern(
  steps: readonly HapticStep[],
  track?: (timer: ReturnType<typeof setTimeout>) => void,
) {
  for (const step of steps) {
    if (step.at <= 0) {
      haptic(step.kind)
      continue
    }
    const timer = setTimeout(() => haptic(step.kind), step.at)
    track?.(timer)
  }
}
