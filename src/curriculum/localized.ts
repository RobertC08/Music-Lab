/**
 * Limbile in care e scris continutul curriculumului de ritm. Romana e sursa;
 * engleza e traducerea completa. Celelalte limbi ale aplicatiei (fr, it, es,
 * de, hu) primesc engleza - la fel ca fallback-ul din lib/i18n.
 *
 * Doar textul citit de om e localizat. Datele muzicale (pattern-uri, durate,
 * tempo-uri, id-uri) sunt scrise o singura data, langa textul care le explica.
 */
export const curriculumLanguages = ['ro', 'en'] as const
export type CurriculumLanguage = (typeof curriculumLanguages)[number]

/**
 * Un text in toate limbile curriculumului. Obligatoriu in ambele: o traducere
 * lipsa e eroare de compilare, nu un text romanesc scapat in interfata engleza.
 */
export type LocalizedText = Readonly<Record<CurriculumLanguage, string>>

/**
 * Limba de continut pentru limba interfetei. Accepta si coduri regionale
 * ("ro-RO", "en_US"); orice nu e romana cade pe engleza.
 */
export function curriculumLanguage(language: string | null | undefined): CurriculumLanguage {
  const primary = (language ?? '').trim().toLowerCase().split(/[-_]/)[0]
  return primary === 'ro' ? 'ro' : 'en'
}

/** Textul unui camp localizat, in limba ceruta. */
export function pick(text: LocalizedText, language: CurriculumLanguage): string {
  return text[language]
}

/** Pentru texte identice in toate limbile: cifre, "4/4", "BPM". */
export function same(value: string): LocalizedText {
  return { ro: value, en: value }
}
