import { useState } from 'react'
import { ActivityIndicator, SafeAreaView, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import './src/i18n'
import { colors } from './src/theme'
import { Home } from './src/screens/Home'
import { PolyrhythmGame } from './src/components/screens/PolyrhythmGame'
import { RudimentPracticeScreen } from './src/components/drums/screens/RudimentPracticeScreen'
import { GroovePracticeScreen } from './src/components/drums/screens/GroovePracticeScreen'
import { FillPracticeScreen } from './src/components/drums/screens/FillPracticeScreen'
import { TheoryIndexScreen } from './src/components/drums/theory/TheoryIndexScreen'
import { DrumTheoryLessonScreen } from './src/components/drums/theory/LessonScreen'
import { getDrumTheory } from './src/drums/theory'
import { CategoryScreen } from './src/screens/CategoryScreen'
import { LessonScreen } from './src/screens/LessonScreen'
import { RhythmEchoGame } from './src/screens/RhythmEchoGame'
import { ReadRhythmGame } from './src/screens/ReadRhythmGame'
import { CheatSheet } from './src/screens/CheatSheet'
import { TimingBench } from './src/screens/TimingBench'
import type { Category, Lesson } from './src/curriculum/types'
import type { DrumTheoryLesson } from './src/drums/theory'

type Screen =
  | 'home'
  | 'category'
  | 'lesson'
  | 'game'
  | 'reading'
  | 'cheatsheet'
  | 'bench'
  | 'polyrhythm'
  | 'drums'
  | 'grooves'
  | 'fills'
  | 'theory'
  | 'theoryLesson'


export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [category, setCategory] = useState<Category | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [theoryLesson, setTheoryLesson] = useState<DrumTheoryLesson | null>(null)
  /*
    Sandbox-ul n-are profil, deci nici limbă aleasă de utilizator: manualul se
    cere în română, ca restul ecranelor de aici. În aplicație, limba vine din
    `useGuestStore((state) => state.profile.locale)` — de aia conținutul intră
    în ecrane ca parametru, nu citit din store.
  */
  const theory = getDrumTheory('ro')
  const [fontsLoaded] = useFonts({
    Geist: require('./assets/Geist-VariableFont_wght.ttf'),
  })

  const backToCategory = () => setScreen(category ? 'category' : 'home')

  /*
    `SafeAreaProvider` la rădăcină: ecranele portate din aplicație folosesc
    `SafeAreaView` din `react-native-safe-area-context`, care fără provider aruncă
    „No safe area value available”. În aplicație îl pune `app/_layout.tsx`.
  */
  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      {!fontsLoaded ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.orange} />
        </View>
      ) : screen === 'home' ? (
        <Home
          onOpenCategory={(value) => {
            setCategory(value)
            setScreen('category')
          }}
          onOpenBench={() => setScreen('bench')}
          onOpenTheory={() => setScreen('theory')}
          onOpenDrums={() => setScreen('drums')}
          onOpenGrooves={() => setScreen('grooves')}
          onOpenFills={() => setScreen('fills')}
        />
      ) : screen === 'drums' ? (
        <RudimentPracticeScreen onExit={() => setScreen('home')} />
      ) : screen === 'grooves' ? (
        <GroovePracticeScreen onExit={() => setScreen('home')} />
      ) : screen === 'fills' ? (
        <FillPracticeScreen onExit={() => setScreen('home')} />
      ) : screen === 'theory' ? (
        <TheoryIndexScreen
          theory={theory}
          onOpenLesson={(value) => {
            setTheoryLesson(value)
            setScreen('theoryLesson')
          }}
          onExit={() => setScreen('home')}
        />
      ) : screen === 'theoryLesson' && theoryLesson ? (
        <DrumTheoryLessonScreen
          lesson={theoryLesson}
          stage={theory.stages.find((item) => item.id === theoryLesson.stage)!}
          onExit={() => setScreen('theory')}
        />
      ) : screen === 'polyrhythm' ? (
        <PolyrhythmGame onExit={backToCategory} />
      ) : screen === 'category' && category ? (
        <CategoryScreen
          category={category}
          onOpenLesson={(value) => {
            setLesson(value)
            setScreen('lesson')
          }}
          onOpenGame={() => setScreen('game')}
          onOpenReading={() => setScreen('reading')}
          onOpenCheatSheet={() => setScreen('cheatsheet')}
          onOpenPolyrhythm={() => setScreen('polyrhythm')}
          onExit={() => setScreen('home')}
        />
      ) : screen === 'lesson' && lesson ? (
        <LessonScreen lesson={lesson} onExit={backToCategory} />
      ) : screen === 'game' ? (
        <RhythmEchoGame onExit={backToCategory} />
      ) : screen === 'reading' ? (
        <ReadRhythmGame onExit={backToCategory} />
      ) : screen === 'cheatsheet' ? (
        <CheatSheet onExit={backToCategory} />
      ) : (
        <TimingBench onExit={() => setScreen('home')} />
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  )
}
