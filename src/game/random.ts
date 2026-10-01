/**
 * Generator pseudo-aleator determinist. Acelasi seed da mereu acelasi sir,
 * deci un exercitiu generat poate fi testat si poate fi reprodus - fara asta,
 * un bug de continut ar aparea o data si nu s-ar mai putea reproduce.
 */
export function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** Amestecare Fisher-Yates cu acelasi generator determinist. */
export function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other]!, result[index]!]
  }
  return result
}
