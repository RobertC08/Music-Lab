# Formatul de date

Unde stă conținutul, cum se scrie și ce respinge validarea.

## Unde stă ce

```
src/drums/theory/
  types.ts            tipurile + validateDrumTheory()
  stages.ts           cele opt etape
  bars.ts             theoryBar(), demoExercise(), theoryVocabulary
  lessons/*.ts        conținutul, o etapă pe fișier
  resolve.ts          LocalizedText -> string
  index.ts            getDrumTheory(language)
  theory.test.ts      validarea conținutului

src/drums/            practica: rudiments.ts, grooves.ts, fills.ts, catalogue.ts
src/components/drums/theory/    ecranele
```

În aplicație aceleași fișiere stau la `mobile/lib/drums/theory/` și
`mobile/components/drums/theory/`. Alias-urile (`@/lib/drums/*`,
`@/components/drums/*`) rezolvă în amândouă, deci **fișierele se mută cu un
`cp`**. După ce scrii într-un repo, sincronizează și verifică cu `diff`.

## Localizarea

Conținutul se scrie o dată, **în ro și en deodată**, cu `LocalizedText`:

```ts
title: { ro: 'Setul și piesele', en: 'The kit and its pieces' }
```

Engleza e **a doua sursă, nu o traducere**. „Toba mică pocnește" devine „the
snare cracks" fiindcă asta spune un toboșar englez, nu fiindcă așa zice
dicționarul. O traducere mot-à-mot se simte, și se simte mai ales la termeni.

Un câmp de text nou în `types.ts` care nu trece prin `resolve.ts` rămâne
`LocalizedText` și nu mai compilează, e intenționat, ca să nu scape texte
netraduse pe ecran.

## O lecție

```ts
{
  id: 'setul-si-piesele',          // kebab-case, românesc, stabil: intră în progres
  stage: 'instrument',             // una din cele opt din stages.ts
  title: { ro: '…', en: '…' },
  goal: { ro: '…', en: '…' },      // o propoziție, către elev
  requiresRhythmLesson: 'triolete',// opțional; id din curriculumul de Ritm
  sections: [ … ],                 // 5-8
}
```

**Id-ul nu se schimbă niciodată** după ce lecția a fost livrată: progresul
salvat îl poartă, iar o redenumire face lecția „necitită" pentru toți.

## O secțiune

```ts
{
  id: 'toba-mare',
  heading: { ro: 'Toba mare', en: 'The bass drum' },
  body: { ro: '…', en: '…' },      // 1-3 paragrafe, despărțite cu \n\n
  example: { … },                  // opțional
  terms: [ { term: {…}, meaning: {…} } ],  // opțional
}
```

În `body` se poate îngroșa cu `**…**`. Atât, nu e Markdown complet: se
îngroașă termenul introdus, nimic altceva. Asteriscurile nepereche rămân pe
ecran; un test le prinde.

## Un exemplu

```ts
example: {
  caption: { ro: '…', en: '…' },   // ce se aude, într-o propoziție
  bpm: 72,                         // trebuie să cadă în exercise.tempo
  showGrid: false,                 // opțional; implicit se desenează
  exercise: demoExercise({
    id: 'demo-kick',               // prefix demo-, unic
    stepsPerBar: 4,
    rows: { kick: 'xxxx' },
    tempo: { min: 50, max: 120, suggested: 72 },
  }),
}
```

### Cum se scriu rândurile

Un caracter pe pas, un rând pe piesă. Rândurile stau unul sub altul exact ca pe
portativ: **ce e aliniat pe verticală se lovește deodată.**

```
'x' = lovitură normală    'X' = accent    'o' = ghost note    '.' = pauză
```

**Numără pașii de fiecare dată.** E greșeala care a scăpat deja o dată:

```
8 pași pe măsură, 4 timpi  ->  2 pași pe timp
pas:    0  1  2  3  4  5  6  7
timp:   1  &  2  &  3  &  4  &

'..X...X.'  =  pașii 2 și 6  =  timpii 2 și 4   ✓ backbeat
'....X...'  =  pasul 4       =  timpul 3        ✗
```

Cu `stepsPerBar: 4` fiecare pas e un timp; cu `16`, patru pași pe timp; cu `12`,
triolete.

## Ce respinge validarea

`validateExercise()` din `exercise.ts`, chemat de `validateDrumTheory()`:

- un rând cu alt număr de pași decât `stepsPerBar`;
- `stepsPerBar` care nu se împarte la `beatsPerBar`;
- o piesă sau o intensitate din afara vocabularului (`theoryVocabulary` lasă tot
  kitul, la manual nu vocabularul e dificultatea);
- `bpm` în afara intervalului `tempo.min`-`tempo.max`;
- un ornament fără lovitură principală pe acel pas, sau cu aceeași mână ca ea;
- **lovituri mai dese de 90 ms pe aceeași mână, la `tempo.max`.**

Ultima e cea care surprinde. `MIN_HAND_GAP_MS = 90` e limita brațului, nu a
aplicației: dacă sticking-ul e declarat se măsoară pe mână, altfel pe piesă.
Verificarea se face la **tempoul maxim** și pe **două treceri**, ca să prindă și
trecerea peste bară.

Dacă pică, exercițiul nu e greșit, **`tempo.max` e greșit.** Coboară-l.

Socoteala, dacă vrei s-o faci înainte:

```
stepMs = 60000 / tempo.max / (stepsPerBar / beatsPerBar)
```

Optimi (2 pași/timp) la `max: 120` dau 250 ms, larg. Șaisprezecimi (4 pași/timp)
la `max: 180` dau 83 ms, respins.

## Ce verifică testele

`theory.test.ts` prinde ce TypeScript nu poate: id-uri repetate, lecții în etape
inexistente, texte lipsă într-o limbă, `**` nepereche, exemple nerandabile,
trimiteri către lecții de Ritm care nu există.

**Ce nu prinde niciun test:** dacă textul descrie același lucru ca exemplul de
sub el. Aia rămâne în sarcina ta. Vezi socoteala de mai sus, și deschide lecția
în browser.

## Verificarea vizuală

```bash
cd D:\MusicLab
npx expo start --web --port 8085
```

Sandbox-ul are target web, aplicația nu. E singurul loc unde poți **vedea**
lecția fără telefon, și de asta conținutul se scrie aici întâi.

De verificat pe ecran: grila arată ce spune textul · lecția încape la 375×812 ·
exemplul chiar se aude · butonul se întoarce singur din „Oprește" în „Ascultă"
la final.
