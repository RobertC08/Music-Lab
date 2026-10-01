import { pick, type CurriculumLanguage, type LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumTheory, DrumTheoryLesson, DrumTheorySection } from './types'

/*
  Din forma sursă (fiecare text în ro + en) în forma pe care o primesc ecranele
  (un singur string).

  Maparea e scrisă explicit, câmp cu câmp, exact ca la ritm
  (`lib/rhythm/curriculum/resolve.ts`) și din același motiv: un câmp de text nou
  în `types.ts` care nu e tradus aici rămâne `LocalizedText` și nu mai trece de
  compilator. Un `...spread` peste tot ar fi mai scurt și ar lăsa textele
  netraduse să ajungă pe ecran fără să se plângă nimeni.

  Datele muzicale (`exercise`, `bpm`, `showGrid`) NU se rezolvă: nu depind de
  limbă și există o singură dată.
*/

function resolveSection(
  section: DrumTheorySection<LocalizedText>,
  language: CurriculumLanguage,
): DrumTheorySection {
  const { example, terms, ...rest } = section
  return {
    ...rest,
    heading: pick(section.heading, language),
    body: pick(section.body, language),
    ...(example ? { example: { ...example, caption: pick(example.caption, language) } } : {}),
    ...(terms
      ? {
          terms: terms.map((entry) => ({
            term: pick(entry.term, language),
            meaning: pick(entry.meaning, language),
          })),
        }
      : {}),
  }
}

function resolveLesson(
  lesson: DrumTheoryLesson<LocalizedText>,
  language: CurriculumLanguage,
): DrumTheoryLesson {
  return {
    ...lesson,
    title: pick(lesson.title, language),
    goal: pick(lesson.goal, language),
    sections: lesson.sections.map((section) => resolveSection(section, language)),
  }
}

export function resolveDrumTheory(
  theory: DrumTheory<LocalizedText>,
  language: CurriculumLanguage,
): DrumTheory {
  return {
    stages: theory.stages.map((stage) => ({
      ...stage,
      title: pick(stage.title, language),
      subtitle: pick(stage.subtitle, language),
    })),
    lessons: theory.lessons.map((lesson) => resolveLesson(lesson, language)),
  }
}
