import type { AudioPlayer, AudioSource } from 'expo-audio'

/**
 * Încarcă o sursă nouă fără s-o pornească. Pe Android, un player care a cântat
 * până la capăt rămâne în modul „pornește când e gata”, deci un `replace()`
 * simplu îl pornește imediat: în testul de melodie din onboarding notele 1 și 2
 * sunau deodată, iar `play()`-ul programat pentru nota 2 nu mai avea efect
 * (raportat de Mihai pe telefon, 2026-09-25). Pe iOS `replace()` nu pornește nimic.
 */
export function loadPaused(player: AudioPlayer, source: AudioSource) {
  player.pause()
  player.replace(source)
}
