import { Platform } from 'react-native'
import { setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio'

const playbackAudioMode = {
  allowsRecording: false,
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  shouldRouteThroughEarpiece: false,
  interruptionMode: 'mixWithOthers' as const,
  interruptionModeAndroid: 'duckOthers' as const,
}

export async function enablePlaybackAudioMode() {
  await setAudioModeAsync(playbackAudioMode)
  // Pe Android, `setIsAudioActiveAsync(false)` (metronom oprit, microfon pornit) blochează
  // orice `play()` din aplicație până la o reactivare explicită: jocurile rămâneau mute.
  // Pe iOS doar dezactivează sesiunea, iar redarea o reactivează singură.
  if (Platform.OS === 'android') await setIsAudioActiveAsync(true)
}

export async function enableRecordingAudioMode() {
  // Reset the playback session before switching AVAudioSession to playAndRecord.
  // This avoids a transient activation failure after the metronome/player was active.
  await setIsAudioActiveAsync(false).catch(() => {})
  return setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
    interruptionMode: 'doNotMix',
  })
}

export function isAudioSessionBusyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /session activation failed|failed to configure audio session|audio session/i.test(message)
}

/** La intrarea într-un joc: pe Android redeschide redarea, dacă un ecran anterior a închis-o. */
export function ensurePlaybackEnabled() {
  if (Platform.OS === 'android') void setIsAudioActiveAsync(true).catch(() => {})
}
