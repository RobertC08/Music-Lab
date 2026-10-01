import { useRef, useState } from 'react'
import { Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { colors, font } from '../theme'
import { Card, PageTitle, PrimaryButton, StatRow } from '../components/ui'

const BEATS = 16
const BPM = 120
const INTERVAL_MS = 60_000 / BPM

const now = () => globalThis.performance?.now?.() ?? Date.now()

type Strategy = 'naive' | 'selfCorrecting'

interface Measurement {
  strategy: Strategy
  meanAbs: number
  worst: number
  drift: number
}

function summarize(strategy: Strategy, offsets: number[]): Measurement {
  return {
    strategy,
    meanAbs: offsets.reduce((sum, value) => sum + Math.abs(value), 0) / offsets.length,
    worst: offsets.reduce((max, value) => Math.max(max, Math.abs(value)), 0),
    drift: offsets[offsets.length - 1] ?? 0,
  }
}

/** Varianta din MusicPal: un setTimeout per beat, programate toate la start. */
function runNaive(onDone: (offsets: number[]) => void) {
  const start = now()
  const offsets: number[] = []
  const timers: ReturnType<typeof setTimeout>[] = []
  for (let index = 0; index < BEATS; index += 1) {
    timers.push(
      setTimeout(() => {
        offsets.push(now() - start - index * INTERVAL_MS)
        if (offsets.length === BEATS) onDone(offsets)
      }, index * INTERVAL_MS),
    )
  }
  return () => timers.forEach(clearTimeout)
}

/** Reprogramare dupa fiecare beat, tintind momentul absolut urmator. */
function runSelfCorrecting(onDone: (offsets: number[]) => void) {
  const start = now()
  const offsets: number[] = []
  let timer: ReturnType<typeof setTimeout>
  const tick = (index: number) => {
    offsets.push(now() - start - index * INTERVAL_MS)
    if (offsets.length === BEATS) return onDone(offsets)
    timer = setTimeout(() => tick(index + 1), Math.max(0, start + (index + 1) * INTERVAL_MS - now()))
  }
  tick(0)
  return () => clearTimeout(timer)
}

export function TimingBench({ onExit }: { onExit: () => void }) {
  const [running, setRunning] = useState<Strategy | null>(null)
  const [results, setResults] = useState<Measurement[]>([])
  const cancel = useRef<(() => void) | null>(null)

  const run = (strategy: Strategy) => {
    if (running) return
    setRunning(strategy)
    const runner = strategy === 'naive' ? runNaive : runSelfCorrecting
    cancel.current = runner((offsets) => {
      setResults((current) => [summarize(strategy, offsets), ...current].slice(0, 6))
      setRunning(null)
      cancel.current = null
    })
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 60,
        gap: 14,
        width: '100%',
        maxWidth: 620,
        alignSelf: 'center',
      }}
    >
      <Pressable accessibilityRole="button" onPress={onExit} hitSlop={12}>
        <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.muted }}>
          ‹ Înapoi
        </Text>
      </Pressable>

      <PageTitle
        eyebrow={Platform.OS}
        title="Banc de timing"
        subtitle={`${BEATS} beat-uri la ${BPM} BPM, interval teoretic ${INTERVAL_MS} ms. Măsoară doar scheduling-ul JS, nu și latența de ieșire audio.`}
      />

      <PrimaryButton
        label={running === 'naive' ? 'Rulează...' : 'setTimeout naiv'}
        disabled={running !== null}
        onPress={() => run('naive')}
      />
      <PrimaryButton
        label={running === 'selfCorrecting' ? 'Rulează...' : 'setTimeout auto-corectiv'}
        tone="dark"
        disabled={running !== null}
        onPress={() => run('selfCorrecting')}
      />

      {results.map((result, index) => (
        <Card key={`${result.strategy}-${index}`} style={{ gap: 8 }}>
          <Text style={{ fontFamily: font, fontSize: 16, fontWeight: '800', color: colors.ink }}>
            {result.strategy === 'naive' ? 'setTimeout naiv' : 'setTimeout auto-corectiv'}
          </Text>
          <StatRow label="Eroare medie" value={`${result.meanAbs.toFixed(1)} ms`} />
          <StatRow label="Cea mai mare abatere" value={`${result.worst.toFixed(1)} ms`} />
          <StatRow label="Drift cumulat" value={`${result.drift.toFixed(1)} ms`} />
          <StatRow
            label="Eroare medie ca % din beat"
            value={`${((result.meanAbs / INTERVAL_MS) * 100).toFixed(2)} %`}
          />
        </Card>
      ))}
    </ScrollView>
  )
}
