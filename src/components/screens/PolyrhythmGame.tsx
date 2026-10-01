import { View } from 'react-native'
import { Split } from 'lucide-react-native'
import {
  CommonGrid,
  CountingDemo,
  MeetingPoints,
  PolyrhythmPads,
  PolyrhythmStrip,
  RatioLabel,
  polyrhythmHandColors,
} from '../polyrhythm-pads'
import { LaneEchoGame, type LaneGameConfig, type LaneRound } from './LaneEchoGame'
import {
  polyrhythmHands,
  polyrhythmLevelsSource,
  polyrhythmRoundForLevel,
  type PolyrhythmHand,
  type PolyrhythmRound,
} from '@/lib/rhythm/polyrhythm/patterns'
import { polyrhythmSounds } from '@/lib/rhythm/polyrhythm/track'
import { buildLaneTrack } from '@/lib/rhythm/lanes/build-track'

type Round = PolyrhythmRound & LaneRound<PolyrhythmHand>

const config: LaneGameConfig<PolyrhythmHand, Round> = {
  engine: 'polyrhythm',
  voices: polyrhythmHands,
  titleKey: 'play.polyrhythm',
  howToKey: 'rhythm.polyrhythmHowTo',
  icon: Split,
  roundForLevel: (level, attempt) => {
    const round = polyrhythmRoundForLevel(level, attempt)
    return { ...round, subLevel: round.polyrhythmLevel }
  },
  levelInfo: (round) => polyrhythmLevelsSource[round.polyrhythmLevel - 1]!,
  // Sunetul urmează fluxul, nu mâna, deci harta se face pe runda asta.
  buildTrack: (round) => buildLaneTrack('poly', round, polyrhythmHands, polyrhythmSounds(round)),
  voiceNames: (t) => ({
    left: t('rhythm.rudimentLeft'),
    right: t('rhythm.rudimentRight'),
  }),
  palettes: polyrhythmHandColors,
  weakVoiceKey: 'rhythm.polyrhythmWeakHand',
  renderPads: (props) => <PolyrhythmPads {...props} />,
  renderStrip: ({ round, layout, elapsed, phase, laneHits, compact, result }) => (
    <PolyrhythmStrip
      pattern={round}
      layout={layout}
      elapsed={elapsed}
      phase={phase}
      laneHits={laneHits}
      height={compact ? (result ? 60 : 66) : 82}
    />
  ),
  /*
    Ghidul e grila comună, nu o legendă: e chiar metoda prin care se învață un
    poliritm. Stă înainte de rundă și în timpul ei, dacă te pierzi, singurul
    loc de unde poți reintra e „unu”, și de acolo se citește.
  */
  renderGuide: ({ round, phase, laneHits }) => (
    <View style={{ gap: 10 }}>
      <RatioLabel pattern={round} />
      {phase === 'result' ? (
        // La rezultat, grila își pierde rostul: ce contează e dacă barele au fost prinse.
        <MeetingPoints pattern={round} laneHits={laneHits} />
      ) : (
        <CommonGrid pattern={round} />
      )}
      {/*
        Demonstrația stă doar înainte de rundă. În timpul ei ar fi un buton care
        pornește un al doilea sunet peste pista care merge, și, oricum, acolo
        deja e prea târziu să înveți cum se numără.
      */}
      {phase === 'ready' ? <CountingDemo pattern={round} /> : null}
    </View>
  ),
  padHeight: (available, tapTarget, kid) =>
    Math.max(tapTarget.min * 1.4, Math.min(available, tapTarget.max * 1.6 + (kid ? 36 : 20))),
}

/** Poliritm: ții un flux cu o mână și pe celălalt, care nu se potrivește, cu cealaltă. */
export function PolyrhythmGame({ onExit }: { onExit: () => void }) {
  return <LaneEchoGame config={config} onExit={onExit} />
}
