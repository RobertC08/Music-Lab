import { GrooveGrid } from '@/components/drums/groove-grid'
import { PracticeScreen, type PracticeCatalogue } from '@/components/drums/screens/PracticeScreen'
import { grooveText, grooves } from '@/lib/drums/grooves'
import { genreSwitchMode, ladderMode, steadyMode, survivalMode } from '@/lib/drums/modes'

/**
 * Groove-uri: contează CE PIESĂ se lovește și cum se așază piesele una peste
 * alta, deci notația e o grilă cu un rând pe piesă, nu un rând de mâini.
 */
const catalogue: PracticeCatalogue = {
  id: 'groove',
  titleKey: 'drums.groovesTitle',
  introKey: 'drums.groovesIntro',
  pickKey: 'drums.pickGroove',
  exercises: grooves,
  textOf: grooveText,
  // Titlu pe stil: cu niveluri pe fiecare stil, lista a devenit prea lungă ca să fie plată.
  groupOf: (exercise) => (exercise.style ? `drums.grooveStyle_${exercise.style}` : null),
  modes: [steadyMode, ladderMode, genreSwitchMode, survivalMode],
  showKit: true,
  // Și pe portativ, cu comutatorul „Grilă / Portativ”.
  staffNotation: true,
  renderNotation: (props) => <GrooveGrid {...props} />,
}

export function GroovePracticeScreen({ onExit }: { onExit: () => void }) {
  return <PracticeScreen catalogue={catalogue} onExit={onExit} />
}
