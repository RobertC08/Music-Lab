# Integrare în aplicația existentă

Notă pentru dezvoltatorul care preia modulul de ritm. Pe scurt: **tot ce
contează e în `src/`**, restul folderului e un Expo app gol în jurul lui, făcut
ca să poată fi rulat izolat.

Context și decizii de design: [STARE.md](STARE.md). Ce urmează:
[PLAN-RITM.md](PLAN-RITM.md).

---

## Ce se copiază

```
src/                                 tot modulul
assets/Geist-VariableFont_wght.ttf   fontul
assets/games/rhythm-echo-card.webp   cardul jocului Rhythm Echo
```

### Folderele din afara lui `src/` NU se copiază

`guest/`, `audio/`, `haptics/` și `src/i18n.ts` sunt **stand-in-uri** pentru cod
care în aplicație există deja: progresia adaptivă, sesiunea de joc, modul de
redare, hapticele și traducerile. Ele stau dinadins **în afara** lui `src/`, ca
să se vadă că nu fac parte din modul. La integrare se șterg, iar importurile
lor se rezolvă singure: căile sunt scrise exact ca în aplicație
(`../../guest/adaptive-levels`, `@/lib/rhythm/...`).

`src/components/theme.ts` e tot o punte de-astea: în aplicație tema stă lângă
componente, aici stă la rădăcina modulului.

Alias-urile din `tsconfig.json` și `vitest.config.mts` (`@/lib/rhythm/*` → `src/*`,
`@/components/rhythm/*` → `src/components/*`) există din același motiv: fișierele
mutate dintr-o parte în alta nu trebuie atinse. **Un fișier scris aici se mută în
aplicație cu un `cp`, fără traduceri de căi**: și invers.

**Atenție la calea relativă a imaginii.** `src/screens/Home.tsx` o cere cu
`require('../../assets/games/rhythm-echo-card.webp')`. Dacă în aplicația voastră
`src/` stă altundeva față de `assets/`, e singurul `require` de ajustat, nu mai
există altul în tot modulul.

`assets/sounds/` **nu se copiază**: fișierele de acolo au rămas din faza de
investigație și nu mai sunt referite de nicăieri. Tot sunetul se generează în
cod, în `src/audio/`.

## Ce NU se copiază

| | De ce |
|---|---|
| `node_modules/` | se reinstalează din `package.json` |
| `.expo/`, `.expo-dev.log` | stare locală de development |
| `App.tsx` | doar un router cu `useState`, scris pentru rulare izolată |
| `src/screens/TimingBench.tsx` | unealtă de diagnostic, nu funcționalitate, nu e în pachet. `Home` are un `onOpenBench?` opțional pentru el; dacă nu i-l dați, link-ul nu se desenează. |
| `app.json`, `index.ts` | scaffold Expo |
| `package.json`, `tsconfig.json` | sunt **doar pentru verificarea pachetului izolat** (vezi mai jos). Dependințele se adaugă în `package.json`-ul vostru, cu `npx expo install`. |

---

## Dependințe necesare

Astea sunt tot ce importă `src/`, în afară de `react` și `react-native`:

| Pachet | Versiune | Pentru ce |
|--------|----------|-----------|
| `expo-audio` | `~57.0.5` | redarea pistei WAV a fiecărei runde |
| `expo-file-system` | `~57.0.7` | scrierea WAV-ului temporar înainte de redare |
| `expo-haptics` | `~57.0.3` | feedback la atingerea padului |
| `expo-image` | `~57.0.5` | cardul jocului |
| `expo-linear-gradient` | `~57.0.2` | fundaluri de card |
| `react-native-svg` | `15.15.4` | toată notația muzicală |

Instalarea se face cu `npx expo install <pachet>`, nu cu npm/yarn direct:
rezolvă versiunea compatibilă cu SDK-ul vostru.

**Două lucruri care NU sunt dependințe ale modulului**, deși ar părea:

- `expo-font` (`~57.0.4`), `src/` nu îl importă deloc. Vă trebuie doar dacă
  încărcați chiar fontul Geist, și atunci în aplicația voastră, nu aici. Vezi
  secțiunea despre font mai jos.
- `expo-router`, orice bibliotecă de navigație, modulul nu are niciuna.

`vitest` (`^5.0.1`) e necesar doar ca să rulați testele; nu intră în bundle.

Stack-ul e **Expo SDK 57, React 19.2.3, React Native 0.86.3**: același ca
ToneTrack.

---

## Puncte de intrare

`App.tsx` nu se copiază, dar arată exact cum se montează. Ecranele sunt
componente independente, fiecare cu un `onExit`:

| Componentă | Props | Ce e |
|---|---|---|
| `Home` | `onOpenCategory` | listă de categorii |
| `CategoryScreen` | `category`, `onOpenLesson`, `onOpenGame`, `onOpenReading`, `onOpenCheatSheet`, `onExit` | lecțiile unei categorii |
| `LessonScreen` | `lesson`, `onExit` | o lecție completă |
| `RhythmEchoGame` | `onExit` | joc: auzi și repeți |
| `ReadRhythmGame` | `onExit` | joc: citești notația |
| `CheatSheet` | `onExit` | referința |
| `PolyrhythmGame` | `onExit` | joc: poliritm cu două mâini |

`PolyrhythmGame` e altfel decât celelalte: e doar o **configurație**
(`LaneGameConfig`) peste gazda comună a jocurilor pe voci. În aplicație gazda
aceea există deja, cu shell cu tot, `components/rhythm/screens/LaneEchoGame.tsx`.
Deci la integrare se copiază `src/polyrhythm/`, `src/components/polyrhythm-pads.tsx`
și `src/components/screens/PolyrhythmGame.tsx`, iar
`src/components/screens/LaneEchoGame.tsx` de aici **se aruncă**: e gazda de
sandbox, scrisă doar ca jocul să poată fi rulat fără shell.

De adăugat în aplicație, pe lângă fișiere: `'polyrhythm'` în `GameEngine`, o rută
`app/(public)/ritm/poliritm.tsx` de zece linii, un card în `CategoryScreen`, și
cheile `rhythm.polyrhythm*` din `src/i18n.ts` în celelalte cinci limbi. Atenție
la un singur loc: eticheta de măsură din `LaneEchoGame` citește `beatsPerBar === 2`
ca „6/8", la poliritm `beatsPerBar` e numărul de note al pulsului, deci un 3
contra 2 ar fi etichetat greșit.

Nu există router intern și nicio dependință de navigație, se montează în ce
sistem de navigare are deja aplicația.

Datele lecțiilor vin din `src/curriculum/rhythm.ts`, exportate ca
`rhythmCategory`. Sunt date pure, fără logică.

---

## Straturile din `src/`

```
curriculum/   datele lecțiilor (pure, fără logică)
game/         scoring și starea rundei, logică pură, testată
audio/        randarea pistei WAV
components/   notație, pad, UI
screens/      ecrane
```

`game/` și `audio/` nu importă nimic din `components/` sau `screens/`, logica
e separată de randare și poate fi testată fără a monta nimic.

**Fontul** e referit prin numele `Geist` în `src/theme.ts`, o singură
constantă, `export const font = 'Geist'`. Modulul nu îl încarcă el însuși:
presupune că numele e deja înregistrat. Două variante:

- îl încărcați voi, cu `useFonts({ Geist: require('.../Geist-VariableFont_wght.ttf') })`
  (asta face `App.tsx`-ul nostru, care nu se copiază);
- sau puneți în `src/theme.ts` numele fontului vostru și nu mai copiați `.ttf`-ul.

---

## De știut înainte de integrare

**Nimic nu persistă.** Nu există progres salvat, lecții deblocate sau cel mai
bun rezultat. Dacă aplicația are deja un strat de persistență, aici e locul
unde se leagă: după fiecare rundă, în `useRhythmRound.ts`.

**Nu există progresie.** Orice lecție e accesibilă direct.

**Curriculumul e complet**: 18 lecții din 18, plus cele două jocuri:
16 niveluri × 20 de exerciții la „Citește ritmul" și 14 × 20 de runde la
Rhythm Echo. Vezi [PLAN-RITM.md](PLAN-RITM.md) pentru ce a cerut motorul la
fiecare lecție.

**Conținutul jocurilor e generat, nu scris de mână**, dintr-un vocabular
declarat per nivel (`src/curriculum/reading.ts`, `src/curriculum/echo.ts`).
Dacă vreți alte niveluri, acolo se schimbă, sunt date, nu cod. Testele din
`src/game/reading.test.ts` validează automat orice nivel adăugat.

**Latența audio se estimează per rundă**, nu se calibrează o dată. Dacă
aplicația are deja o calibrare de latență, ea o poate înlocui, vezi secțiunea
despre latență din [STARE.md](STARE.md).

**Categoriile Auz și Armonie** sunt doar chenare „în lucru" pe ecranul
principal. Nu există conținut în spate.

---

## Verificare

Pachetul se poate verifica **înainte** să atingeți codul vostru. În folderul
dezarhivat:

```bash
npm install
```

```bash
npm run typecheck
```

```bash
npm run test
```

Dacă trec aici, modulul e întreg și greșeala de integrare, dacă apare, e la
legătură, nu în el. Apoi copiați `src/` și `assets/` la voi și rulați aceleași
două comenzi în aplicația voastră:

```bash
npx tsc --noEmit
```

```bash
npx vitest run
```

106 de teste, toate trebuie să treacă. Rulează fără să monteze nimic, deci
merg imediat după copiere, înainte de orice legare la navigație.

Testele din `audio/` randează WAV-ul și **măsoară energia semnalului**: dacă
pică după integrare, înseamnă că s-a schimbat ceva în redare, nu doar în cod.

Testele din `game/reading.test.ts` și `game/rhythm.test.ts` verifică **fiecare**
exercițiu din fiecare nivel: că umple măsuri întregi, că nu folosește simboluri
din afara nivelului lui și că nu cere două bătăi la mai puțin de 90 ms una de
alta. Dacă schimbați un vocabular sau un interval de tempo, ele vă spun dacă
ați trecut peste limita a ce se poate bate.
