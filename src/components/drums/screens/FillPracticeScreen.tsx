import { GrooveGrid } from '@/components/drums/groove-grid'
import {
  PracticeScreen,
  type PracticeCatalogue,
  type SoundMode,
} from '@/components/drums/screens/PracticeScreen'
import { fillText, fills } from '@/lib/drums/fills'
import { creativeFillsMode, steadyMode } from '@/lib/drums/modes'

/*
  Fill-uri: trei măsuri de groove, a patra e a ta.

  Modul implicit E golul, asta e tot jocul. „Cântă tot” rămâne pentru când vrei
  să auzi întâi cum sună fill-ul; „doar metronom” pentru când nu mai ai nevoie
  nici de groove.
*/
const soundModes: SoundMode[] = [
  { id: 'gap', labelKey: 'drums.leaveGap', gap: true },
  { id: 'full', labelKey: 'drums.playAll' },
  { id: 'bare', labelKey: 'drums.metronomeOnly', hits: false },
]

const catalogue: PracticeCatalogue = {
  id: 'fill',
  titleKey: 'drums.fillsTitle',
  introKey: 'drums.fillsIntro',
  pickKey: 'drums.pickFill',
  exercises: fills,
  textOf: fillText,
  modes: [steadyMode, creativeFillsMode],
  soundModes,
  /*
    Desenul setului, cerut și aici, dar arătat doar unde încape.

    Prima dată a fost oprit, cu cifra scrisă în cod: notația de fill umplea
    ecranul exact, iar cu desen se ajungea la 151 px sub linia de derulare.
    Cifra era adevărată ATUNCI. Între timp măsurile identice se strâng în „×2"
    (`lib/drums/notation-bars.ts`), deci se desenează trei blocuri în loc de
    patru, și exact blocul scos era ce lipsea.

    Remăsurat pe cel mai înalt fill (șapte rânduri pe trei măsuri), în timpul
    sesiunii, pe ScrollView-ul dinăuntru:

      375×812  fără desen 0 px  ·  cu desen 0 px   -> se arată
      375×667  fără desen 145 px depășire          -> nu încape oricum

    De aceea `showKit` nu mai înseamnă „desenează-l", ci „vrei-l dacă încape":
    `PracticeScreen` compară ce a măsurat ecranul cu ce a măsurat desenul și
    decide singur. Un prag fix ar fi greșit oricum, un fill de șapte rânduri și
    unul de patru cer lucruri diferite.

    De reținut, fiindcă o să se mai întâmple: o măsurătoare scrisă în cod ține
    cât ține layout-ul pe care a fost luată. Când se schimbă ce se desenează, se
    remăsoară, nu se citește comentariul.
  */
  showKit: true,
  renderNotation: (props) => <GrooveGrid {...props} />,
}

export function FillPracticeScreen({ onExit }: { onExit: () => void }) {
  return <PracticeScreen catalogue={catalogue} onExit={onExit} />
}
