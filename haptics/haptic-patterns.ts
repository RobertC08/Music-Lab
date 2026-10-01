import { CELEBRATION_NOTE_ONSETS_MS } from '../audio/celebration-tone'

/**
 * Vocabularul haptic al jocurilor, de la cel mai fin la cel mai apăsat. Fiecare
 * fel are un sens fix, ca utilizatorul să învețe să-l recunoască:
 * - `tick` / `accent`: pulsul care se aude (primul timp e accentul măsurii);
 * - `tap`: bătaia lui pe butonul TAP;
 * - `soft`: o notă care sună (proba de înălțime, portativul);
 * - `select`: o alegere (o notă din acord, un răspuns);
 * - `light` / `medium` / `heavy` / `rigid`: trepte de intensitate pentru butoane,
 *   blocări și tiparele de final;
 * - `success` / `warning`: tiparele de sistem pentru „gata” și „mai încearcă”.
 */
export type HapticKind =
  | 'tick'
  | 'accent'
  | 'tap'
  | 'soft'
  | 'select'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'rigid'
  | 'success'
  | 'warning'

export interface HapticStep {
  /** Milisecunde de la pornirea tiparului. */
  at: number
  kind: HapticKind
}

/** Pulsul se simte, nu doar se aude: primul timp e mai apăsat, restul ușoare. */
export function beatHaptic(index: number): HapticKind {
  return index === 0 ? 'accent' : 'tick'
}

const ARPEGGIO: readonly HapticKind[] = ['light', 'light', 'medium', 'heavy']

/**
 * Reușita: un arpegiu haptic pe aceleași momente ca notele sunetului de bucurie
 * (Do, Mi, Sol, Do), din ce în ce mai apăsat. La un record, un combo sau un prag
 * de nivel urmează și un „artificiu”, încheiat cu tiparul de succes al sistemului.
 */
export function successHapticPattern(startAt: number, big: boolean): HapticStep[] {
  const arpeggio = CELEBRATION_NOTE_ONSETS_MS.map((onset, index) => ({
    at: startAt + onset,
    kind: ARPEGGIO[index] ?? 'medium',
  }))
  if (!big) return arpeggio
  return [
    ...arpeggio,
    { at: startAt + 480, kind: 'rigid' },
    { at: startAt + 560, kind: 'heavy' },
    { at: startAt + 720, kind: 'success' },
  ]
}

/**
 * O rundă de reluat: două bătăi care coboară, de la apăsat la moale. Spune „mai
 * încearcă” fără să sune a eroare, pentru că la învățat greșeala e un pas, nu o pedeapsă.
 */
export function retryHapticPattern(startAt: number): HapticStep[] {
  return [
    { at: startAt, kind: 'medium' },
    { at: startAt + 150, kind: 'soft' },
  ]
}
