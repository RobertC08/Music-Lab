import { GrooveGrid } from '@/components/drums/groove-grid'
import {
  PracticeScreen,
  type PracticeCatalogue,
  type SoundMode,
} from '@/components/drums/screens/PracticeScreen'
import { advancedFillText, advancedFills } from '@/lib/drums/advanced-fills'
import { creativeFillsMode, steadyMode } from '@/lib/drums/modes'

/*
  Fill-urile avansate: aceeași mecanică ca la fill-urile de bază (aplicația tace
  pe măsura ta), alt catalog. Separat, nu la capătul listei de bază: cine le
  caută știe deja ce caută, iar cine abia a terminat „Fill în triolete” nu
  trebuie să dea peste sextolete pe tomuri ca pas următor.

  Notația e aceeași grilă, care știe singură să deseneze fiecare timp cu
  subdiviziunea lui (`mixed-grid.ts`).
*/
const soundModes: SoundMode[] = [
  { id: 'gap', labelKey: 'drums.leaveGap', gap: true },
  { id: 'full', labelKey: 'drums.playAll' },
  { id: 'bare', labelKey: 'drums.metronomeOnly', hits: false },
]

const catalogue: PracticeCatalogue = {
  id: 'fill-advanced',
  titleKey: 'drums.advancedFillsTitle',
  introKey: 'drums.advancedFillsIntro',
  pickKey: 'drums.pickFill',
  exercises: advancedFills,
  textOf: advancedFillText,
  modes: [steadyMode, creativeFillsMode],
  soundModes,
  showKit: true,
  // Și pe portativ: el știe subdiviziunile amestecate (`staff.ts`, `divisions`).
  staffNotation: true,
  renderNotation: (props) => <GrooveGrid {...props} />,
}

export function AdvancedFillPracticeScreen({ onExit }: { onExit: () => void }) {
  return <PracticeScreen catalogue={catalogue} onExit={onExit} />
}
