import { StickingRow } from '@/components/drums/sticking-row'
import { PracticeScreen, type PracticeCatalogue } from '@/components/drums/screens/PracticeScreen'
import { ladderMode, rouletteMode, steadyMode } from '@/lib/drums/modes'
import { rudimentText, rudiments } from '@/lib/drums/rudiments'

/** Rudimente: ce contează e MÂNA fiecărei lovituri, deci notația e rândul de mâini. */
const catalogue: PracticeCatalogue = {
  id: 'rudimente',
  titleKey: 'drums.rudimentsTitle',
  introKey: 'drums.rudimentsIntro',
  pickKey: 'drums.pickRudiment',
  exercises: rudiments,
  textOf: rudimentText,
  modes: [steadyMode, ladderMode, rouletteMode],
  renderNotation: (props) => <StickingRow {...props} />,
}

export function RudimentPracticeScreen({ onExit }: { onExit: () => void }) {
  return <PracticeScreen catalogue={catalogue} onExit={onExit} />
}
