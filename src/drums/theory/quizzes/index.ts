import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumQuiz } from '../quiz'
import { instrumentQuizzes } from './instrument'
import { notationQuizzes } from './notation'
import { handsQuizzes } from './hands'
import { grooveQuizzes } from './groove'
import { formQuizzes } from './form'
import { stylesQuizzes } from './styles'
import { advancedQuizzes } from './advanced'
import { musicianQuizzes } from './musician'

/*
  Toate quiz-urile manualului, câte un fișier pe etapă, în ordinea etapelor.
  Într-un fișier: întâi quiz-urile lecțiilor, în ordinea lecțiilor, apoi
  recapitularea etapei.
*/
export const drumQuizzes: DrumQuiz<LocalizedText>[] = [
  ...instrumentQuizzes,
  ...notationQuizzes,
  ...handsQuizzes,
  ...grooveQuizzes,
  ...formQuizzes,
  ...stylesQuizzes,
  ...advancedQuizzes,
  ...musicianQuizzes,
]
