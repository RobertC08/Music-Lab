# Integrare: modulul de tobe

Notă pentru Mihai, care preia codul de tobe în aplicația mare (ToneTrack).
Pentru modulul de ritm, regulile generale de copiere (stand-in-uri, alias-uri,
font) sunt în [INTEGRARE.md](INTEGRARE.md); aici e doar ce ține de tobe și ce
s-a schimbat.

Pe scurt: **tot codul de tobe e în `src/drums/` (date și logică) și
`src/components/drums/` (ecrane și desene)**, plus mostrele din
`assets/drums/`. Se mută cu un `cp`, fără traduceri de căi: importurile sunt pe
alias (`@/lib/drums/*`, `@/components/drums/*`), care rezolvă la fel în
amândouă proiectele.

---

## 1. Cum se organizează în aplicație

> **Propunere, de confirmat cu Robert.** Împărțirea de mai jos e făcută după ce
> există în cod. Dacă planul aplicației are alte nume sau altă grupare,
> ecranele nu depind de ea: fiecare e o componentă independentă, cu `onExit`.

| Secțiune | Ce intră | Componente |
|---|---|---|
| **Learn** | **Manualul de tobe**: 8 etape, 46 de lecții, 245 de pași, fiecare lecție cu quiz de 5 întrebări, fiecare etapă cu quiz recapitulativ de 11–15 | `TheoryIndexScreen`, `DrumTheoryLessonScreen`, `DrumQuizScreen` |
| **Practice** (însoțitorul de practică) | **Rudimente** (11), **Groove-uri** (24, pe 7 stiluri: rock, disco, metal, funk, shuffle, jazz, latin), **Fill-uri** (15), **Fill-uri avansate** (20) | `RudimentPracticeScreen`, `GroovePracticeScreen`, `FillPracticeScreen`, `AdvancedFillPracticeScreen` |
| **Jocuri** | jocurile de ritm (Rhythm Echo, Citește ritmul, Poliritm), vezi [INTEGRARE.md](INTEGRARE.md) | neschimbate în tura asta |
| **Unelte / referință** | foaia de referință a ritmului (`CheatSheet`); setul de tobe atingibil (`KitDiagram`) poate sta și ca unealtă de sine stătătoare, nu doar în prima lecție | `CheatSheet`, `KitDiagram` |

### Navigare: totul deschis, prezentat ca hartă pe niveluri

Două cerințe de produs, valabile pentru toate secțiunile de mai sus:

- **Utilizatorul poate deschide orice exercițiu și orice lecție, indiferent de
  nivel.** Nimic nu se blochează: `LOCK_EXERCISES = false` în
  `src/drums/catalogue.ts`, iar lecțiile și quiz-urile n-au nicio poartă.
  `requires` rămâne în date doar ca **ordine recomandată**: spune ce vine
  înainte, nu ce e interzis. Testele verifică în continuare că lanțul ăsta nu
  se rupe, ca harta să-l poată desena.
- **Totul trebuie prezentat sub forma unei hărți pe niveluri.** Manualul are
  deja etapele și ordinea lecțiilor (`stages.ts`, ordinea din fișiere); la
  practică, nivelurile sunt ordinea din cataloage plus `requires`, iar la
  groove-uri și grupele pe stil (`groupOf`). Ecranele din sandbox sunt liste
  (`TheoryIndexScreen`, lista din `PracticeScreen`); harta e de făcut în
  aplicație. Pe hartă, un nod se poate deschide oricând, iar starea lui vine
  din persistența de la §4.
- **Verde pe hartă = quiz trecut, nu lecție citită.** O lecție devine verde doar
  după ce i-ai trecut quiz-ul (80%); citită, dar fără quiz, rămâne neutră, deși
  se poate deschide oricând. O etapă e verde („Etapă terminată”) doar când
  toate quiz-urile lecțiilor ei ȘI recapitularea sunt trecute; până atunci
  arată „3/7 lecții”. Regula e scrisă o dată, ca funcție pură testată:
  `lessonPassed` și `stageProgress` din `src/drums/theory/progress.ts`
  (exportate și din `@/lib/drums/theory`). Lista din sandbox
  (`TheoryIndexScreen`) o folosește deja; harta din aplicație ar trebui să o
  folosească pe aceeași, nu să o rescrie.

Legături între secțiuni, deja în conținut:

- Lecțiile din Manual trimit la exercițiile de practică („le găsești în
  Groove-uri pe patru niveluri”, „toate cele 20 sunt în Fill-uri avansate”).
  Sunt doar text; dacă vreți butoane care deschid exercițiul, id-urile sunt în
  `grooves.ts` și `advanced-fills.ts`.
- Lecțiile de tobe trimit la lecții de **Ritm** prin `requiresRhythmLesson`
  (ritmul predă timpul, tobele instrumentul). Un test verifică garda; lista
  adevărată de id-uri de ritm i se dă din afară.

### Manualul, pe etape

| Etapă | Lecții | Ce conține |
|---|---|---|
| Instrumentul | 1 | setul și piesele, cu desenul atingibil |
| Notația | 5 | portativul, valorile, intensitățile (accent, ghost, rimshot, lovitură pe ramă), triolete și shuffle, dubla și crash-ul |
| Mâinile | 6 | rudimente, singles/doubles, paradiddle, flam și drag, înălțimile bățului, rolls |
| Groove-ul | 7 | rolurile, ostinato, feel, drept/shuffle, orchestrare, dinamică, variații |
| Forma | 5 | fraza (și blues-ul de 12), fill-ul, părțile piesei, stops și break-uri, „unu” |
| Stiluri | 8 | rock, blues, funk, jazz, latin, metal, afro-cuban, pop, fiecare pe niveluri |
| Avansat | 9 | independență, linear, deplasare, **fill-uri avansate**, măsuri impare, poliritm, modulație metrică, dublu bas, mături |
| Muzician | 5 | basistul (7 linii de bas), dinamica în aranjament, clicul, chart-ul, transcrierea |

---

## 2. Ce se copiază

```
src/drums/                     date, logică, teste (tot)
src/components/drums/          ecrane și desene (tot)
assets/drums/muldjord/         setul principal de mostre
assets/drums/drsx/             cross-stick, fus cu piciorul, clopot, mătură
assets/drums/vcsl/             NOU: cowbell (talangă), rimshot, lovitură pe ramă
```

Opțional, doar ca sursă:

```
assets/bass/                   MIDI-ul liniei de bas Selekt + certificatul de licență.
                               Aplicația NU îl citește: notele sunt copiate în cod.
scripts/build-vcsl-pieces.py   reface mostrele VCSL din sursă (descarcă, taie, scalează)
```

**Nu se copiază:** `App.tsx` și `src/screens/Home.tsx` (routerul și ecranul de
start ale sandbox-ului, arată doar cum se leagă), `guest/`, `audio/`,
`haptics/`, `src/i18n.ts` (stand-in-uri; din `i18n.ts` se copiază doar cheile,
vezi §5).

---

## 3. Puncte de intrare

`App.tsx` arată legarea completă. Pe scurt:

| Componentă | Props |
|---|---|
| `TheoryIndexScreen` | `theory`, `scores?`, `onOpenLesson(lesson)`, `onOpenQuiz?(quiz)`, `onExit` |
| `DrumTheoryLessonScreen` | `lesson`, `stage`, `onExit`, `onOpenQuiz?` (ultimul pas duce la quiz dacă e dat) |
| `DrumQuizScreen` | `quiz`, `title`, `stage`, `onExit`, `onFinish(score, total)` |
| `RudimentPracticeScreen` / `GroovePracticeScreen` / `FillPracticeScreen` / `AdvancedFillPracticeScreen` | `onExit` |

Datele manualului: `getDrumTheory(locale)` (rezolvat o dată pe limbă, același
obiect la fiecare cerere), `quizForLesson(theory, lessonId)`,
`reviewForStage(theory, stageId)`. Titlul quiz-ului se face din cheile
`drums.quizLessonTitle` / `drums.quizReviewTitle` (vezi `App.tsx`).

---

## 4. Persistență: de legat la store-ul vostru

Sandbox-ul n-are unde să salveze, deci trei lucruri trăiesc doar în memorie:

| Ce | Unde e acum | Unde ar trebui |
|---|---|---|
| Cel mai bun scor la fiecare quiz | `quizScores` în `App.tsx`, trimis la `TheoryIndexScreen` prin `scores` | progresul local, lângă recordurile de tempo; `onFinish(score, total)` e locul de scris |
| Alegerea „Grilă / Portativ” la practică | variabila `notationPreference` din `PracticeScreen.tsx` | preferințele din profil |
| Sesiunile de practică | deja prin `useGuestStore` (`completeDrumSession`, `addSession`), stand-in în `guest/store.ts` | store-ul vostru real, aceleași nume |

Limba manualului vine ca parametru (`getDrumTheory(locale)`), nu din store, ca
ecranele să fie identice în ambele proiecte.

---

## 5. Traduceri

Toate cheile noi sunt sub `drums.` și există doar în **română și engleză**
(`src/i18n.ts`). Trebuie copiate în celelalte cinci limbi ale aplicației.

| Grup | Chei |
|---|---|
| Quiz | `quizStart`, `quizLessonTitle`, `quizReviewTitle`, `quizReviewCta`, `quizReviewHint`, `quizNext`, `quizFinish`, `quizCorrect`, `quizWrong`, `quizNoAnswer`, `quizPassed`, `quizPerfect`, `quizFailed`, `quizRetry`, `quizBack`, `quizBackToResult`, `quizReviewAll`, `quizReviewWrong_one/_few/_other`, `quizMarkHint`, `quizGridLegend`, `quizBest` |
| Exemple din lecții | `theoryBass`, `theoryPlayAlong`, `theoryPlayAlongHint`, `theoryRevealNotation`, `theoryHideNotation`, `theoryRevealHint`, `theoryChartFill` |
| Piese noi | `piece_cowbell`, `piece_rimshot`, `piece_rimClick`, `pieceShort_cowbell`, `pieceShort_rimshot`, `pieceShort_rimClick` |
| Groove-uri | `grooveStyle_*` (titlurile de stil din listă), `grv_*` pentru cele 14 groove-uri noi (+ `_how`), plus textele schimbate la `grv_rock_basic_how`, `grv_rock_backbeat` |
| Fill-uri avansate | `advancedFillsTitle`, `advancedFillsIntro`, `afill_*` (20 × titlu + `_how`) |
| Practică | `notationGrid`, `notationStaff` |
| Harta manualului | `theoryStageProgress`, `theoryStageDone`, `theoryLessonPassed` |

Atenție la `quizReviewWrong_few`: româna are trei forme de plural
(„o greșeală / 3 greșeli / 20 de greșeli”), engleza două.

Textele lecțiilor și ale quiz-urilor **nu** sunt chei i18n: sunt în date, în
ro + en, câmp cu câmp (`LocalizedText`), ca la curriculumul de ritm. Un test
verifică că fiecare text există în ambele limbi. Pentru alte limbi se adaugă
un câmp în `LocalizedText`, nu chei noi.

---

## 6. Sunete și licențe

| Set | Ce | Licență | Atribuire |
|---|---|---|---|
| `muldjord` | setul principal | CC BY 4.0 | **obligatorie**, pe pagina de credite |
| `drsx` | cross-stick, fus cu piciorul, clopot, mătură | CC BY 4.0 | **obligatorie** |
| `vcsl` | cowbell, rimshot, lovitură pe ramă | **CC0 1.0** (domeniu public) | nu e cerută; e totuși în listă |
| linia de bas Selekt | notele din lecția „Tu și basistul” | CC0 (Freesound 614195) | nu e cerută; proveniența e în `assets/bass/README.md` |

`kitCredits` din `src/drums/kit.ts` are acum **trei** intrări; pagina de
credite a aplicației trebuie să le afișeze pe toate.

**Basul nu are mostre**: e sintetizat în `src/drums/bass.ts` și randat în
aceeași pistă WAV cu tobele.

---

## 7. Ce s-a schimbat în codul comun (de citit înainte de merge)

Dacă în aplicație ați modificat între timp fișierele de mai jos, aici sunt
punctele de conflict.

1. **`KitPiece` are trei piese noi**: `cowbell`, `rimshot`, `rimClick`
   (`exercise.ts`). Orice `Record<KitPiece, …>` din aplicație trebuie
   completat: `DEFAULT_MIX` (`render.ts`), `pieceColors` și `ROW_ORDER`
   (`groove-grid.tsx`), `STAFF_POSITION` (`staff.ts`), `soundsOn`
   (`exercise.ts`, acum de tip `DrawnPiece`, fiindcă talanga are loc pe desen).
2. **`usePracticeSession` și-a schimbat API-ul**: nu mai întoarce
   `positionMs`. Poziția stă într-un „ceas” la care te abonezi
   (`playhead.ts`, `use-playhead.ts`), iar sesiunea întoarce `playhead` și
   `elapsed()`. Motivul: ca stare, poziția redesena tot ecranul de ~60 de ori
   pe secundă. Acum se redesenează doar celulele care se aprind/sting, desenul
   setului la fiecare lovitură și contorul o dată pe timp. Orice cod care
   citea `session.positionMs` trebuie mutat pe `stepCursor` /
   `usePlayheadValue` (exemple în `PracticeScreen.tsx` și `ExamplePlayer.tsx`).
3. **Grila comună de 12 pași pe timp** (`mixed-grid.ts`), pentru fill-urile
   care amestecă șaisprezecimi, triolete și sextolete în aceeași măsură.
   `GrooveGrid` și `DrumStaff` o recunosc singure și desenează fiecare timp cu
   subdiviziunea lui, cu cifra 3 / 6 deasupra.
4. **`renderDrumTrack` primește `bass`** (opțional), iar `drumTrackKey` îl
   include în cheia de cache.
5. **Exemplele din lecții au opțiuni noi** (`types.ts`): `bass`, `click`
   (clicul pe anumiți timpi), `playAlong` („Cânți tu”: tobele tac),
   `reveal` (notația ascunsă până o ceri), `chart`.
6. **`GrooveGrid`, `DrumStaff`, `StickingRow`, `BassRow`, `ChartView`,
   `KitDrawing` sunt memoizate.** `GrooveGrid` primește opțional `cursor`.
7. **`PracticeCatalogue`** are `groupOf` (titluri de grup în listă, la
   groove-uri pe stil) și `staffNotation` (comutatorul „Grilă / Portativ”).
8. **Groove-ul `rock-basic` a fost corectat**: toba mică pe 2 și 4 (era pe 3,
   sub un text care îl numea primul groove al oricui). Recordurile salvate pe
   id-ul ăsta rămân valabile ca id, dar exercițiul sună altfel.
9. **Bump de patch Expo**: `expo` `~57.0.24` → `~57.0.26` (cerut de
   `expo install --check`).

---

## 8. Verificare

În sandbox, înainte de copiere:

```bash
npx tsc --noEmit
npx vitest run
npx expo lint
```

- **Typecheck**: curat.
- **Teste**: 351, toate trec. Printre ele: validarea fiecărui exercițiu și a
  fiecărui exemplu din manual (inclusiv regula de 90 ms pe aceeași mână la
  tempoul maxim), fiecare lecție are quiz de 5, fiecare etapă recapitulare de
  10–15, nicio mână pe două piese deodată în fill-urile avansate, mostrele
  atacă în primele 2 ms, mixul nu saturează, portativul scrie corect
  subdiviziunile amestecate.
- **Lint**: 12 probleme (8 erori, 4 avertismente), **toate existau înainte de
  tura asta**, în fișierele de ritm (`rhythm-line.tsx`, `theme.ts`,
  `TimingBench.tsx`, `i18n.ts`) și în `use-practice-session.ts` (reguli
  `react-hooks` pe ref-uri). Niciuna nouă.

---

## 9. De știut / ce nu e gata

- **Lecțiile nu se blochează** (`LOCK_EXERCISES = false`); `requires` rămâne
  ordinea recomandată.
- **Etapa „Instrumentul” are o singură lecție.** Restul (bețele și priza,
  poziția, pedala) sunt planificate, nescrise.
- **Grila de completat din quiz** nu e folosită la fill-urile avansate (ar avea
  48 de pătrate); acolo întrebările sunt de ascultat și de ales grila.
- **Câteva tipare de stil sunt adaptări pentru set** și merită verificate de un
  profesor: cha-cha-chá (figura pe ramă), toba mică pe 2 și 4 la afro-cuban
  6/8, tumbao-ul de salsa din lecția de bas. Songo și mambo au fost lăsate
  deoparte dinadins.
- **Referințele skill-ului `predare-tobe`** (`curriculum.md`) spun încă că
  rimshot-ul n-are mostră; între timp are. Doar documentație, nu cod.
- **Redarea WAV se face la apăsare, sincron** (regulă de web audio). Un fill
  avansat se randează în ~120 ms față de ~35 ms la un groove simplu; pe un
  telefon lent primul „Ascultă” poate avea o mică pauză.
