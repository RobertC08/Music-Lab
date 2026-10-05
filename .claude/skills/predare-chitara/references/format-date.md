# Formatul de date

## Ce există (2026-10-05): biblioteca de acorduri

```
src/guitar/tuning.ts            acordajul standard, pitchAt(coardă, tastă), numele notelor
src/guitar/chords.ts            ChordShape, ChordLevel, parseSymbol, analyzeChord,
                                validateChordShape, chordName, displaySymbol
src/guitar/chord-library.ts     cele 7 niveluri, 65 de acorduri
src/guitar/chord-library.test.ts
src/guitar/pluck.ts             Karplus-Strong + renderChordDemo (arpegiat, apoi lovit)
src/guitar/pluck.test.ts        acordajul sintezei, sub 5 cenți
src/guitar/chord-track.ts       WAV -> fișier / blob, cu cache
src/guitar/use-chord-sound.ts   un singur player, încărcat și încălzit la alegerea acordului
src/guitar/chord-builder.ts     generatorul: tonică + tip + extensii -> simbol, nume,
                                formulă, `ChordSpec`; ce extensii se exclud
src/guitar/voicings.ts          formele din dicționar pentru generator + ce combinații există
                                (digitația din bibliotecă, unde forma e aceeași)
src/guitar/chord-builder.test.ts
src/guitar/chord-reference.ts   dicționarul (chords-db, MIT): pozițiile reale pe tonică și tip,
                                maparea tip+extensii -> tipul din dicționar
src/guitar/data/chords-db.json  generat de scripts/build-chords-db.py; licența alături
src/guitar/chord-reference.test.ts
src/components/guitar/ChordDiagram.tsx              diagrama, cu `mirrored` și `spec`
src/components/guitar/screens/ChordLibraryScreen.tsx
src/components/guitar/screens/ChordGeneratorScreen.tsx
src/guitar/changes.ts           însoțitorul „Schimbări de acorduri": 6 niveluri, 26 de exerciții
                                (id-uri din bibliotecă), seria aleatorie cu sămânță,
                                planul de timp (numărătoare de o măsură, 1/2/4 timpi pe acord)
src/guitar/changes-track.ts     pista sesiunii: un singur WAV, metronom + acordul lovit la schimbare
src/guitar/use-practice-track.ts   redarea comună a însoțitorilor: ceasul = poziția din fișier,
                                citită pe unitatea exercițiului (timp sau pas de grilă)
src/guitar/changes.test.ts
src/components/guitar/screens/ChordChangesScreen.tsx
src/guitar/strums.ts            însoțitorul „Strumming": 7 niveluri, 21 de modele, progresiile
                                (inclusiv „Fără acorduri"), validarea direcției, planul pe pași
src/guitar/strum-track.ts       pista: ↓ toate coardele, ↑ doar 1-4 și mai încet, accent, chuck,
                                ratat („.") lasă acordul să sune, pauză („-") îl oprește
src/guitar/metronome.ts         click-urile, comune
src/guitar/slices.ts            munca lungă pe felii (`runInSlices`), pentru pregătirea în fundal
src/guitar/strums.test.ts, slices.test.ts
src/components/guitar/practice-controls.tsx   înapoi, tempo (pas 1, repetare), comutatoare
src/components/guitar/screens/StrumPracticeScreen.tsx
src/guitar/finger-exercises.ts  însoțitorul „Exerciții pentru degete": 8 niveluri, 22 de exerciții,
                                GENERATE din reguli (mutabile pe orice poziție), validarea,
                                planul pe note; `TabNote` = coardă, tastă, deget, p-i-m-a, pană, h/p
src/guitar/finger-track.ts      pista: o notă ține până la următoarea pe aceeași coardă (max 2 pași;
                                la fingerpicking, mai mult), legato mai încet, accent pe timp
src/guitar/finger-exercises.test.ts
src/components/guitar/TabStaff.tsx                  un rând de tabulatură (coarda 1 sus, nu se oglindește)
src/components/guitar/screens/FingerPracticeScreen.tsx
```

**Exercițiile pentru degete** nu se scriu notă cu notă: fiecare are o funcție
`build(poziție)` care generează ciclul, ca același exercițiu să se poată muta pe
gât. `validateFingerCycle` rulează pe TOATE pozițiile permise și cere: coarde și
taste existente; un deget pe tastă (pe aceeași coardă, diferența de taste =
diferența de degete); legato pe aceeași coardă, `h` în sus, `p` în jos; pana
strict alternată, cu ciclul reluat tot pe „jos"; la game, exact notele gamei;
lungimea ciclului divizibilă cu fiecare subdiviziune permisă (altfel
numărătoarea s-ar decala la reluare). Testul a prins deja un sfat greșit: gama
majoră are tonica sub degetul 2, deci poziția 7 dă Do major, nu Sol.

Tabulatura de pe ecran completează ce tab-ul simplu nu are: degetul deasupra
(1-4, sau p-i-m-a la fingerpicking), pana (⊓ V) și numărătoarea dedesubt, deci
și ritmul; legato-ul ca arc cu h/p.

**Modelele de strumming** se scriu ca grila de la tobe, un caracter pe pas:
`D` `U` (jos, sus), `A` `B` (accent jos, sus), `x` (chuck), `.` (ratat: mâna
trece pe lângă corzi, acordul sună mai departe), `-` (pauză: coardele se
amortizează). `validateStrumPattern` cere ca `D`/`A` să cadă pe pași „de jos"
și `U`/`B` pe pași „de sus" (`handDirection`): la optimi și șaisprezecimi pașii
pari sunt în jos; la triolete, primul din grup e în jos, al treilea în sus, cel
din mijloc nu se lovește. Pe ecran, loviturile ratate rămân desenate, gri: mâna
trece și pe acolo, și e tot rostul modelului.

**Sunetul vine din mostre de chitară nylon** (FluidR3_GM, Frank Wen, licență
MIT; `assets/guitar/nylon/40.wav` … `79.wav`, 1,5 s, 5,2 MB, pregătite de
`scripts/build-guitar-samples.mjs`; decizia lui Robert, 2026-10-05: nylon
„sună mai bine"). Le încarcă `src/guitar/guitar-samples.ts` (singurul fișier
care atinge React Native; `useGuitarSamples()` la intrarea în fiecare ecran de
chitară, ~1 s); până atunci se cântă cu sinteza din `pluck.ts`, iar cheile
pistelor din cache poartă sursa (`nylon` / `synth`). Atribuirea MIT trebuie să
apară pe pagina de credite din ToneTrack: `guitarCredit`, ca `kitCredits` la
tobe.

**Articulațiile din mostre** (`src/guitar/sampled.ts`, `planPhrase` +
`mixVoices`): nota legată continuă coarda (mostra citită de la „vârsta"
lanțului, nu de la început); hammer-on cu atac moale și zgomot de deget,
pull-off cu o urmă de ciupire și ceva mai slab; trilul recunoscut automat, cu
variații mici de timp și volum, fără derivă și fără să se stingă pe drum;
crossfade în loc de tăiere; umanizare mică, cu sămânță (reproductibilă).
Toți parametrii sunt în `ARTICULATION`, `HUMANIZE`, `TRILL`, la începutul
fișierului. Restul pistelor (demonstrația acordurilor, schimbări, strumming)
trec prin `sampled-render.ts`, cu aceleași reguli.

**Sunetul chitarei e la 44 100 Hz** (`GUITAR_RATE` în `pluck.ts`, codat de
`src/guitar/wav.ts`). A fost o vreme la 22 050 Hz, pentru viteză; Robert a cerut
revenirea la 44,1 kHz (2026-10-05), deci rata nu se mai scade fără să întrebi.
Pe telefon (Hermes, fără JIT) costul se simte la „Ascultă", de aceea notele ciupite se țin minte
(`pluckSamples`), ce combinații există în dicționar se ține minte (`hasVoicings`), sunetul
formelor de pe ecran se pregătește în fundal (`useChordSound().preload`), iar
pista unei sesiuni de schimbări se randează după ce te oprești din reglat, nu
la „Pornește". Regula de lucru: **nimic scump în atingere**, pe web doar ce
trebuie să pornească sunetul chiar în gest.

**Însoțitorul de schimbări** respectă regula de practică: nu punctează, numără
doar schimbările trecute și spune la final „N schimbări la X BPM". Numărătoarea
are metronom și cu metronomul oprit. Setările (tempo, metronom, acordul cântat,
altă serie) se schimbă doar cu sesiunea oprită, fiindcă pista e randată la
pornire. O serie fixă nu are voie să repete un acord la rând, nici peste
reluare (testul a prins deja `Am – Dm – E – Am`). Pistele de sesiune (~5 MB)
stau într-un singur „slot" (`wavUri(..., slot)`), ca schimbările de tempo să nu
adune fișiere în memorie.

Biblioteca și generatorul sunt **funcții separate**: biblioteca e drumul
recomandat, cu forme scrise de mână; generatorul răspunde la orice combinație.
Amândouă trec prin același `validateChordShape`, care primește un `ChordSpec`
(din simbol, la bibliotecă; construit, la generator). Comutatorul de stângaci e
comun, ținut în `App.tsx` (în aplicație: din setări).

Alias-uri: `@/lib/guitar/*` → `src/guitar/*`, `@/components/guitar/*` →
`src/components/guitar/*` (în `tsconfig.json` și `vitest.config.mts`).

**Generatorul arată DOAR formele din dicționar** (`chordVoicings`), verificate
cu inversiunile permise (`validateChordShape(..., { inversions: true })`: un Do
major cu Sol în bas e o formă obișnuită acolo). Nu se mai generează nimic
automat (decizia lui Robert, 2026-10-05): pe slidere apar doar combinațiile cu
cel puțin o formă validă în dicționar pe tonica aleasă (`availableBases`,
`availableExtensions`, `availableAlterations`), 466 în total. Dominantul (C7) e
tip de bază separat, „Dominant (7)"; pe Major nu mai sunt variantele cu septimă
mică. Tabelul `SUFFIXES` din `chord-reference.ts` leagă tip + extensii de tipul
din dicționar; cheile trebuie să fie în ordinea sortată (un test o cere, după ce
`7,11` în loc de `11,7` a ascuns C11). Tastele 10-15 se scriu `a`-`f`
(`encodeFret`). O coardă amortizată sub barré e permisă; una goală, nu.

**Un acord nou** se adaugă în `chord-library.ts`, în nivelul lui, cu `frets`
și `fingers` de la coarda 6 la coarda 1. `npx vitest run src/guitar` îl
verifică: notele din taste trebuie să fie exact ale simbolului (cu cvinta
perfectă opțională), basul tonica sau nota de după `/`, maxim 4 degete,
deschidere de maxim 4 taste (5 cu `stretch`), degetele în ordinea tastelor,
barré-ul doar peste coarde apăsate și doar cu degetul 1. Garda asta a prins
deja o greșeală la prima scriere (Do mărit scris `x3221x` în loc de `x3211x`).

**O calitate nouă de acord** (de ex. `maj9`) se adaugă în `QUALITIES` din
`chords.ts`, cu treptele și numele în ambele limbi; altfel simbolul e respins.

Notele de pe diagramă se scriu după acord (La♭ în Fa minor, nu Sol♯), cu
litere. Decizia litere/solfegiu pe desene e încă deschisă (vezi
`terminologie.md`).

## Restul: PROPUNERE

Ce urmează e încă propunerea de format, derivată
din cel de tobe (`src/drums/theory/types.ts`, `src/drums/exercise.ts`), ca
modulul nou să semene cu cel vechi acolo unde n-are motiv să difere. Când se
scrie codul, fișierul ăsta se **rescrie** după ce s-a construit, cu căile și
numele reale; până atunci nu se citează ca regulă, ci ca punct de pornire.

## Unde ar sta

```
src/guitar/                  date și logică (alias @/lib/guitar/*)
  tuning.ts                  acordajul standard, nota unei poziții
  chords.ts                  biblioteca de forme de acord
  exercise.ts                tipurile + validateGuitarExercise()
  strums.ts, techniques.ts, changes.ts, progressions.ts, fingerpicking.ts
  theory/                    manualul: types, stages, lessons/, quizzes/, progress
src/components/guitar/       ecrane și desene (alias @/components/guitar/*)
```

Ca la tobe: alias-uri care rezolvă la fel în MusicLab și ToneTrack, deci
fișierele se mută cu `cp`. Funcțiile pure (`progress.ts`, validarea, sinteza)
se testează în Node cu `vitest`.

## Ce se ia neschimbat de la tobe

- **`LocalizedText`** (`{ ro, en }`), rezolvat printr-un `resolve.ts`, ca un
  text netradus să nu compileze.
- **Lecția**: `id` (kebab-case românesc, stabil, intră în progres), `stage`,
  `title`, `goal`, `requiresRhythmLesson?`, `sections` (5-8).
- **Secțiunea**: `id`, `heading`, `body` (cu `**…**` pentru termenul
  introdus, nimic altceva), `example?`, `visual?`, `terms?`.
- **Quiz-ul**: cinci întrebări pe lecție, recapitulare de 11-15 pe etapă, 80%
  ca prag. Regula „verde = quiz trecut" și funcțiile `lessonPassed` /
  `stageProgress` se refolosesc, nu se rescriu.
- **Ceasul redării** și o singură pistă audio per exemplu: un al doilea player
  aduce desincronizare (lecția de la tobe, `mobile/CLAUDE.md §4`).

## Ce e nou: câmpuri pe lecție și pe exercițiu

```ts
/** Pentru ce chitară contează. Etichetă și notiță, NU filtru. */
instrument?: 'both' | 'electric' | 'acoustic'   // implicit 'both'
instrumentNote?: LocalizedText                  // obligatoriu dacă nu e 'both'
```

Un test verifică: `instrument` diferit de `'both'` fără `instrumentNote` e
respins. Notița e tot rostul etichetei.

## Coordonatele

Totul în **coordonate de instrument**: coarda `1-6` (1 = Mi subțire) și tasta
`0-24` (0 = coardă goală). **Înălțimea nu se scrie niciodată în date**; se
calculează din acordaj:

```ts
const OPEN_STRINGS = [64, 59, 55, 50, 45, 40]   // coarda 1..6, MIDI
pitch(string, fret) = OPEN_STRINGS[string - 1] + fret
```

Motivul: o notă scrisă de două ori (ca poziție și ca înălțime) ajunge să
spună două lucruri diferite. Și oglindirea (comutatorul „Diagrame oglindite",
oprit implicit) se face la desenare, pe aceleași coordonate.

## Forma de acord

Șirul standard din bibliotecile de acorduri, **de la coarda 6 la coarda 1**:

```ts
{
  id: 'C',
  symbol: 'C',
  frets:   'x32010',        // x = nu se cântă, 0 = goală, cifră = tasta
  fingers: 'x32-1-',        // degetul pe fiecare coardă; - = goală sau nu se cântă
  barre?: { fret: 1, from: 6, to: 1 },   // pentru F, Bm etc.
}
```

Peste tasta 9, cifrele nu mai încap într-un caracter: atunci `frets` devine
listă (`['x', 10, 12, 12, 11, 10]`). Recomandarea: listă de la început, cu
șirul doar ca formă de scriere în fișierele de date, convertit la încărcare.

### Verificarea unui acord

Ce poate verifica un test, și trebuie să verifice, fiindcă o formă citită
invers trece de compilator:

1. **Notele sunt ale acordului.** Din `frets` se calculează înălțimile; clasa
   fiecărei note trebuie să fie în acordul numit de `symbol`. `x32010`:
   Do Mi Sol Do Mi, deci Do major. ✓ Citit invers (`01023x`): Mi Si♭ Re La Re,
   nu e Do major. ✗
2. **Basul.** Cea mai gravă notă cântată e tonica, sau nota de după `/` la un
   slash chord (`C/G`).
3. **Mâna poate.** Cel mult 4 degete (un barré = un deget); deschiderea
   dintre cea mai mică și cea mai mare tastă apăsată, cel mult 4 taste (5 doar
   cu o excepție declarată, pentru întinderi cunoscute); degetele numerotate
   cresc odată cu tasta (degetul 1 nu stă după degetul 3).

Punctul 3 e corespondentul regulii de 90 ms de la tobe: respinge forme care
par bune pe hârtie și nu se pot cânta.

## Grila de strumming

Ca rândurile de la tobe: **un caracter pe pas, același număr de pași ca
măsura.**

```
'D' = în jos    'U' = în sus    '.' = ratat (mâna trece fără să atingă)
'x' = chuck (lovitură amortizată)    'A' / 'B' = accent în jos / în sus
```

```ts
{
  id: 'folk-clasic',
  stepsPerBar: 8,
  pattern: 'D.DU.UDU',
  chords: ['G', 'C'],          // un acord pe măsură, sau pe jumătate de măsură
  tempo: { min: 60, max: 120, suggested: 80 },
}
```

**Regula care se validează, specifică chitarei:** mâna se mișcă continuu, deci
direcția e dată de poziția pe grilă. La optimi (2 pași pe timp), pașii pari sunt
în jos și cei impari în sus; la șaisprezecimi (4 pe timp), la fel, pe
șaisprezecimi. Un `U` pe un pas „de jos" e respins, cu o excepție declarată
explicit (`freeDirection: true`) pentru stilurile care chiar o cer.

Pentru shuffle și 12/8: `stepsPerBar: 12` (triolete), mâna face jos pe primul
din fiecare grup de trei și sus pe al treilea; validarea folosește tabelul
corespunzător. **De verificat cu Robert** dacă vrem regula și la ternar sau
doar la binar.

## Tabulatura

```ts
{
  id: 'riff-pentatonica',
  stepsPerBar: 8,
  bars: [
    [
      { step: 0, string: 5, fret: 0, length: 1 },
      { step: 1, string: 5, fret: 3, length: 1 },
      { step: 2, string: 4, fret: 0, length: 1, technique: 'h', to: 2 },
      // …
    ],
  ],
  tempo: { min: 60, max: 140, suggested: 90 },
}
```

`technique`: `'h' | 'p' | 'slide' | 'bend' | 'release' | 'vibrato' | 'pm' |
'mute' | 'harmonic'`. Fiecare tehnică are câmpurile ei (`to` pentru legato și
slide, `amount: 0.5 | 1` pentru bend).

Validarea: coarda 1-6, tasta 0-24, pașii în măsură, notele de pe **aceeași
coardă** nu se suprapun (o coardă cântă o singură notă), o tehnică pe două
note are a doua notă pe aceeași coardă.

## Fingerpicking

Un model e o listă de pași, fiecare cu degetul mâinii care ciupește și coarda:

```ts
{
  id: 'pima-arpegiu',
  stepsPerBar: 8,
  pattern: [
    { step: 0, finger: 'p', string: 5 },   // basul, pe coarda tonicii
    { step: 1, finger: 'i', string: 3 },
    // …
  ],
  bass: 'root',                 // 'root' = coarda tonicii acordului curent
}
```

`string: 'root'` lasă modelul să se aplice pe orice acord: degetul mare merge
pe coarda unde e tonica (5 pentru Do și La, 6 pentru Sol și Mi, 4 pentru Re).
Așa un model se scrie o dată și se cântă pe toată progresia.

## Sunetul

Sinteză, nu mostre:

- **Karplus-Strong** pentru coarda ciupită, cu doi parametri de timbru
  („acustic", „electric curat"). Ca la bas (`src/drums/bass.ts`), armonicele se
  țin destul de sus încât Mi-ul gros (82 Hz) să se audă pe difuzorul unui
  telefon.
- **Strumming-ul e coardă cu coardă**, cu o distanță fixă în milisecunde
  (propunere: 8-15 ms între corzi), de la 6 la 1 la `D` și invers la `U`. Fixă
  în ms, ca `GRACE_SPACING_MS` la flam: e un gest, nu o subdiviziune.
- **Chuck-ul** (`x`) e un zgomot scurt filtrat, fără înălțime.
- **O singură pistă**: chitara, basul și tobele de acompaniament se randează în
  același plan.

## Lecția și exemplul

Ca la tobe, plus câmpurile vizuale ale chitarei:

```ts
example: {
  caption: { ro: '…', en: '…' },
  bpm: 72,
  chord?: 'Em',               // diagrama + sunetul acordului
  arpeggiate?: true,          // întâi coardă cu coardă, apoi lovit
  strum?: StrumPattern,
  tab?: TabExercise,
  showNeck?: boolean,         // gâtul desenat, cu notele aprinzându-se
  showTab?: boolean,
  showStaff?: boolean,
  drums?: string,             // id de groove din src/drums/grooves.ts
  bass?: BassLine,
}
```

`visual` (numele desenului, nu componentul, ca la tobe): `'guitar-acoustic'`,
`'guitar-electric'`, `'neck'`, `'chord-chart'`, `'tab-legend'`.

## Quiz-urile

Felurile de la tobe (`choice`, `pickPattern`, `markGrid`) se păstrează, cu
media de chitară, plus unul nou:

- `markNeck`: elevul atinge pe gâtul desenat pozițiile cerute („unde e Do pe
  coarda 5?", „atinge notele pentatonicii minore în poziția 1"). Atingerea e
  verificabilă, deci se punctează.

Și o întrebare pe care tobele n-o au: **„major sau minor?" după ureche**, cu
acordul cântat. E cea mai importantă întrebare de auz din tot manualul.

## Ce verifică testele (ținta)

Id-uri unice, lecții în etape existente, texte în ambele limbi, `**`
nepereche, acorduri ale căror note nu sunt ale simbolului, forme imposibile
pentru o mână, grile de strumming cu direcția greșită, tab cu două note
simultane pe aceeași coardă, `instrument` fără notiță, trimiteri spre lecții de
Ritm inexistente.

**Ce nu prinde niciun test:** dacă textul descrie aceeași formă, aceeași coardă
și același model ca exemplul de sub el. Rămâne în sarcina celui care scrie;
deschide lecția în browser și uită-te.
