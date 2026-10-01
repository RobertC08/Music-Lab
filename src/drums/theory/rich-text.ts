/*
  Îngroșarea din textul unei lecții.

  Stă aici, nu în ecran, din același motiv pentru care `kit-keys.ts` stă separat
  de `kit.ts`: un test care are nevoie de funcția asta ar trage după el tot React
  Native, adică sintaxă Flow, pe care vitest nu o poate citi.
*/

/**
 * Textul unei secțiuni, tăiat pe `**bold**`.
 *
 * Atât, nu un parser de Markdown: în manual se îngroașă doar termenul introdus,
 * iar un parser întreg ar aduce cu el liste, linkuri și titluri, adică exact
 * lucrurile pe care formatul de date le ține deja separat, în câmpurile lor.
 */
export function splitBold(body: string): { text: string; bold: boolean }[] {
  return body
    .split(/\*\*(.+?)\*\*/g)
    .map((text, position) => ({ text, bold: position % 2 === 1 }))
    .filter((part) => part.text.length > 0)
}
