import type { LocalizedText } from '@/lib/rhythm/curriculum/localized'
import type { DrumStage } from './types'

/*
  Cele opt etape ale manualului, în ordine (PLAN-TEORIE-TOBE.md §4, §6).

  Sunt aici toate opt, deși deocamdată există conținut doar în prima. Nu e
  optimism: harta trebuie să poată arăta onest cât e drumul, iar o etapă fără
  lecții se vede goală, ceea ce e adevărul. Alternativa, să apară etapele una
  câte una, pe măsură ce se scriu, ar face ca drumul să pară scurt și l-ar
  lungi sub picioarele cuiva care tocmai l-a terminat.

  Culorile merg de la cald la rece pe măsură ce se urcă: instrumentul e portocaliu
  ca restul aplicației, avansatul e violet. Nu e decor, pe o hartă derulată
  repede, culoarea e singurul lucru care spune unde ești fără să citești.
*/
export const drumStages: DrumStage<LocalizedText>[] = [
  {
    id: 'instrument',
    title: { ro: 'Instrumentul', en: 'The instrument' },
    subtitle: {
      ro: 'Setul, bețele, poziția și cum sună fiecare piesă.',
      en: 'The kit, the sticks, your posture and how each piece sounds.',
    },
    accent: '#FF7A00',
    soft: '#FFF3E6',
    border: '#FFE0BF',
  },
  {
    id: 'notation',
    title: { ro: 'Notația', en: 'Notation' },
    subtitle: {
      ro: 'Portativul de tobe, de la × pentru cinele până la ghost notes.',
      en: 'The drum staff, from × noteheads for cymbals to ghost notes.',
    },
    accent: '#C2620B',
    soft: '#FDF1E3',
    border: '#F2DCC2',
  },
  {
    id: 'hands',
    title: { ro: 'Mâinile', en: 'The hands' },
    subtitle: {
      ro: 'Rudimentele ca sistem: sticking, înălțimi, rolls.',
      en: 'Rudiments as a system: sticking, stick heights, rolls.',
    },
    accent: '#C8442E',
    soft: '#FDECE9',
    border: '#F5D2CB',
  },
  {
    id: 'groove',
    title: { ro: 'Groove-ul', en: 'The groove' },
    subtitle: {
      ro: 'Cele trei roluri, ostinato-ul, feel-ul și orchestrarea.',
      en: 'The three roles, the ostinato, the feel and orchestration.',
    },
    accent: '#158A52',
    soft: '#E6F4EC',
    border: '#C7E6D5',
  },
  {
    id: 'form',
    title: { ro: 'Forma', en: 'Song form' },
    subtitle: {
      ro: 'Fraza, fill-ul ca punctuație, intro, strofă, refren.',
      en: 'The phrase, the fill as punctuation, intro, verse, chorus.',
    },
    accent: '#008C88',
    soft: '#E3F3F2',
    border: '#C4E4E2',
  },
  {
    id: 'styles',
    title: { ro: 'Stiluri', en: 'Styles' },
    subtitle: {
      ro: 'Rock, shuffle, funk, jazz, latin, metal, pop.',
      en: 'Rock, shuffle, funk, jazz, latin, metal, pop.',
    },
    accent: '#0E7490',
    soft: '#E4F1F5',
    border: '#C3E0E9',
  },
  {
    id: 'advanced',
    title: { ro: 'Avansat', en: 'Advanced' },
    subtitle: {
      ro: 'Independență, linear playing, măsuri impare, poliritm.',
      en: 'Independence, linear playing, odd meters, polyrhythm.',
    },
    accent: '#6547E8',
    soft: '#EEEBFC',
    border: '#D9D2F7',
  },
  {
    id: 'musician',
    title: { ro: 'Muzician', en: 'Musician' },
    subtitle: {
      ro: 'Tu și trupa: dinamică, clic, chart-uri, transcriere.',
      en: 'You and the band: dynamics, the click, charts, transcription.',
    },
    accent: '#7A5AF8',
    soft: '#F0EDFD',
    border: '#DED7F9',
  },
]
