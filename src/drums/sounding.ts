import type { KitPiece } from './exercise'
import type { DrumPlan } from './plan'

/*
  Ce piese sună într-o clipă anume dintr-o sesiune.

  Pur: intră un plan și un moment, iese o listă. Nicio dependență de React, de
  audio sau de ecran, deci se poate testa în Node, și se poate folosi și de
  exemplele din manual, și de ecranul de practică, fără să se copieze.

  Se citește din `plan.hits`, nu din pasul grilei, și diferența chiar contează:
  o notă de grație cade cu ~32 ms ÎNAINTEA pasului ei (`GRACE_SPACING_MS`), deci
  socotită pe grilă n-ar aprinde nimic exact la flam-uri și drag-uri, adică
  fix acolo unde e ceva de văzut.
*/

/**
 * Cât rămâne aprinsă o piesă după ce a fost lovită, în ms.
 *
 * Scurtă și FIXĂ, nu legată de tempo. O lovitură de tobă e un eveniment, nu un
 * interval: o tobă nu poate ține sunetul. Aprinderea ținută până la lovitura
 * următoare ar arăta, la 60 BPM, ca un sunet care se ține o secundă, adică
 * exact opusul a ce predă manualul despre durată la tobe.
 *
 * 130 ms e sub cea mai scurtă distanță dintre două lovituri pe care o produce
 * catalogul (șaisprezecimi la tempoul maxim dau ~90 ms doar pe mâini diferite,
 * iar acolo sunt oricum două piese diferite), deci două lovituri consecutive pe
 * ACEEAȘI piesă nu se contopesc într-o aprindere continuă.
 */
export const LIT_WINDOW_MS = 130

/**
 * Piesele lovite în ultimele `windowMs` dinaintea lui `atMs`, fără duplicate.
 *
 * Notele de grație intră și ele: un flam se vede ca o singură aprindere, ceea ce
 * e corect, se aude ca o singură lovitură lată.
 *
 * `plan.hits` e ordonat crescător după `atMs`, deci se iese la prima lovitură de
 * după moment. Pe o sesiune de 90 de secunde sunt câteva sute de lovituri și
 * funcția se cheamă la fiecare cadru; o parcurgere completă ar fi degeaba.
 */
export function piecesSoundingAt(
  plan: DrumPlan,
  atMs: number,
  windowMs: number = LIT_WINDOW_MS,
): KitPiece[] {
  const from = atMs - windowMs
  const pieces: KitPiece[] = []
  for (const hit of plan.hits) {
    if (hit.atMs > atMs) break
    if (hit.atMs >= from && !pieces.includes(hit.piece)) pieces.push(hit.piece)
  }
  return pieces
}
