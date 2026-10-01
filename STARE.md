# MusicLab, stadiul proiectului

Aplicație de învățat ritm: lecții scurte care explică o noțiune, apoi exerciții
în care o aplici. Construită ca sandbox separat, **fără legătură cu repo-ul
MusicPal**: nimic de acolo nu a fost modificat.

Stack identic cu ToneTrack (Expo SDK 57, React 19.2.3, React Native 0.86.3),
deci codul se mută dintr-o parte în alta fără traduceri. Design-ul și fontul
Geist sunt preluate din ToneTrack.

---

## Cum se rulează

**Web** (cel mai rapid loop):

```bash
cd D:\MusicLab; npx expo start --web --port 8085
```

**Pe telefon**: instalezi Expo Go, telefonul pe același Wi-Fi:

```bash
cd D:\MusicLab; npx expo start
```

**Teste și verificare de tipuri:**

```bash
cd D:\MusicLab; npx vitest run
```

```bash
cd D:\MusicLab; npx tsc --noEmit
```

---

## Ce există acum

### Categoria Ritm, 18 lecții din 18, completă

| # | Lecție | Ce învață |
|---|--------|-----------|
| 1 | Pulsul | bătaia constantă, tempo, BPM |
| 2 | Măsura | gruparea timpilor, timpul tare, 4/4 |
| 3 | Pătrimea | un sunet pe puls, pauza de pătrime |
| 4 | Optimea | două sunete pe puls, „unu-și" |
| 5 | Șaisprezecimea | patru subdiviziuni, „unu-e-și-a" |
| 6 | Combinații de subdiviziuni | valori amestecate peste același puls |
| 7 | Contratimpul | sunet între pulsuri |
| 8 | Sincopa | accent deplasat peste puls |
| 9 | Legarea ritmurilor | o notă ține peste timp |
| 10 | Punctul | pătrime și optime punctată |
| 11 | Trioletul | trei subdiviziuni egale |
| 12 | Sextoletul | șase subdiviziuni egale, numărate ca două triolete |
| 13 | Măsura de 2/4 | pulsul grupat câte doi, accentul de două ori mai des |
| 14 | Măsura de 3/4 | pulsul grupat câte trei, valsul |
| 15 | Măsura de 6/8 | măsură compusă: doi timpi, fiecare împărțit în trei |
| 16 | Ritmuri mixte | trecerea între toate valorile, fără să se clatine pulsul |
| 17 | Ritmuri complexe | pauze pe timpul tare, legături peste timp |
| 18 | Poliritm | ții un flux în timp ce altul, incompatibil, merge alături |

Fiecare lecție: explicație → simboluri și grilă → exemplu ascultat → **5 runde
la 5 tempouri diferite**. Tempourile sunt amestecate deliberat, nu crescătoare:
un elev care bate corect doar la 80 BPM a memorat o viteză, nu a înțeles noțiunea.

### Trei jocuri

**Citește ritmul**: vezi notația și un tempo, nu auzi nimic în afară de
metronom. Traduci singur simbolurile în bătaie. **16 niveluri × 20 de
exerciții**, de la pătrimi până la sextolete, 2/4, 3/4 și 6/8. La intrarea în
serie, o demonstrație arată și lasă să se audă un ritm care nu e niciunul
dintre exerciții. La final: rezolvarea colorată pe simboluri, plus redarea ei.

**Rhythm Echo**: auzi pattern-ul, apoi îl repeți. **14 niveluri × 20 de
runde**, pattern-uri generate cu seed nou la fiecare sesiune, în aceleași
măsuri și subdiviziuni ca lecțiile.

La amândouă, **tempoul variază de la un exercițiu la altul** în intervalul
nivelului, nu e fixat pe nivel.

**Poliritm**: ții un flux cu o mână și pe celălalt, care nu se potrivește cu
el, cu cealaltă. **11 niveluri**, primul cu o singură mână, de la 3 contra 2 până la 5 contra 3, fiecare
mână punctată separat. Scris peste **motorul de voci al aplicației**
(`src/lanes/`), nu peste cel de o singură linie, vezi mai jos.

Toate, plus rundele din lecții, au **skip** peste numărătoare și peste
exemplul ascultat. Măsura de pregătire nu se sare niciodată: fără ea prima
notă ar ieși greșit din cauza pornirii, nu a ritmului. Unde durata chiar se
judecă, la citire și la lecțiile cu durate scrise, o atenționare spune
înainte de start că se măsoară și cât ții nota.

### Cheat sheet

Stiva de durate comparabile, tabele de note / pauze / valori punctate /
grupuri și legături, și un dicționar de 16 termeni. Dicționarul se generează
**din lecții**, nu dintr-o listă separată, vezi mai jos de ce.

### Banc de timing

Măsoară jitter-ul de scheduling JS. Rămas din faza de investigație.

---

## Deciziile care contează

### Audio-ul e ceasul, nu invers

Toată runda (numărătoare, pattern, bare de răspuns) se randează într-un
**singur fișier WAV**, redat cu un singur `play()`. Nu există timere JS între
bătăi, deci nu există drift acumulat.

Imaginea urmărește poziția din fișier (`player.currentTime`), nu ceasul de
sistem: `play()` nu produce sunet instantaneu, iar dacă vizualul ar porni la
apelul lui, ar fugi înaintea sunetului. Bătăile utilizatorului se raportează la
același ceas, prin decalajul median al ultimelor 12 cadre.

*Măsurat:* tranzițiile de fază cad la ±19 ms față de poziția audio.

### Potrivirea bătăilor păstrează ordinea

Alinierea dintre ce a bătut utilizatorul și ce scria se face prin **programare
dinamică**, cu cost minim total. Varianta naivă, „pentru fiecare țintă ia cea
mai apropiată bătaie liberă", se rupe când o țintă înhață bătaia vecinei:
restul rundei se decalează și latența iese prost estimată.

### Latența se estimează înainte de a judeca

Două treceri: întâi se află decalajul constant cu fereastră largă, apoi se
judecă pe timpii corectați. Fără asta, un telefon cu 200 ms latență ar avea
toate bătăile în afara ferestrei și ar primi zero, deși ritmul a fost corect.

### Pragurile urmăresc densitatea, nu grila

Cât de strâns trebuie să fii depinde de distanța reală dintre note, nu de
rezoluția grilei pe care e scris ritmul. Același ritm notat pe șaisprezecimi
sau pe patruzecișiopti primește același scor.

### Durata contează, dar numai unde e scrisă

Padul înregistrează apăsarea **și** ridicarea. O doime ținută cât o pătrime e
semnalată. Dar durata se judecă doar unde notația o specifică, în „Citește
ritmul" și în lecțiile despre durată. La pattern-urile generate, redate ca
lovituri de percuție, „cât ține nota" nu există: ar fi o cerință inventată.

Sub 400 ms, ținutul nu se mai judecă: pe ecran, o șaisprezecime rapidă nu poate
fi ținută cu precizie, e dexteritate, nu ritm.

### Grila internă are 48 de pași pe măsură de 4/4

12 pe timp: cel mai mic număr divizibil și cu 4 (șaisprezecimi) și cu 3
(triolete). Binarul și ternarul stau pe aceeași grilă, fără fracții. Un triolet
și un grup de șaisprezecimi pot coexista în aceeași măsură. Sextoletul iese tot
exact: șase note pe timp, câte doi pași fiecare, iar notele lui impare cad
peste trioletul din care vine, de aceea lecția îl numără ca două triolete.

### Jocurile se generează dintr-un vocabular, nu din nimic

Exercițiile de citire erau scrise de mână, câte cinci pe nivel. La douăzeci pe
nivel, pe toate noțiunile, scrisul de mână ar fi însemnat câteva sute de șiruri
verificate cu ochiul, adică exact genul de date în care se strecoară o măsură
incompletă fără ca nimic să pice.

Acum fiecare nivel **își declară vocabularul**: exact ce simboluri au voie să
apară. Vocabularul e dificultatea, iar un nivel nu poate produce ceva mai greu
decât ce i s-a dat. Un simbol scris de mai multe ori în listă apare mai des,
așa un nivel despre șaisprezecimi poate conține și pătrimi fără să devină un
nivel de pătrimi.

La Rhythm Echo regula echivalentă e **`subdivisions`**: schemele de împărțire a
unui timp care au voie să apară. Fără ele, un generator pe grila de 48 ar pune
note pe pasul 5 sau 7, poziții care nu sunt nici binare, nici ternare, deci nu
se pot nici scrie, nici bate.

Două plafoane completează regulile, fiindcă generatorul nu are gust:

- **Distanța minimă între două atacuri e 90 ms.** Sub atât nu mai e ritm, e
  dexteritate. Un test o verifică pentru fiecare exercițiu, la tempoul lui,
  asta e ce ține în frâu intervalele de tempo, nu judecata mea.
- **Numărul maxim de note per pattern la Echo** e ~2,5 pe timp. Patru timpi
  plini de sextolete sunt douăzeci și patru de note: nu un ritm de reprodus din
  auz, ci o pată.

### La lecție al doilea flux se aude; în joc se bate

Poliritmul e și lecție (#18), și joc, iar deosebirea dintre ele e chiar
deosebirea dintre a înțelege și a executa.

**Lecția** predă noțiunea: ții un flux și îl auzi pe celălalt. Motorul a primit
pentru asta `backingPattern`, note randate în WAV, cu voce proprie, care **nu
intră în ținte**.

**Jocul** pune amândouă fluxurile în mâinile tale, câte unul pe fiecare pad, și
punctează fiecare mână separat. De aceea nu folosește deloc `backingPattern`:
n-are ce să nu se puncteze. Vezi „Jocul de poliritm" mai jos.

Partea care contează: acompaniamentul continuă **și în fereastra de răspuns**.
Fără asta nu ar exista poliritm, ci un ritm ciudat bătut singur.

Vocea lui e cu o cvintă sub a ta. Dacă ar avea aceeași frecvență, cele două
fluxuri s-ar topi într-unul exact unde se suprapun, adică fix acolo unde e
toată lecția.

**Lecția predă poliritmul prin grila comună**, nu prin „simte-l": pentru 3
contra 2 numeri șesimi și cazi pe 1-3-5 în timp ce celălalt cade pe 1-4; pentru
3 contra 4, douăsprezecimi. `BeatGrid` desenează acum două rânduri peste aceeași
unitate, ca raportul să se vadă, nu doar să se citească. Un test cere ca desenul
și exemplul ascultat să spună același lucru, altfel lecția s-ar contrazice
singură fără ca nimic să pice.

**Fiecare rundă își scrie raportul** („3 contra 2 · tu ții trei"). Fără asta
rundele arată identic și nu se vede care contra care tocmai s-a bătut. Un test
verifică eticheta față de numărul real de note din fiecare flux.

### Jocul de poliritm

Scris peste **motorul de voci** (`src/lanes/`), cel adus din aplicație pentru
jocurile de tobe: el randează o rundă pe mai multe voci într-un singur WAV,
punctează fiecare voce separat și numără ca greșeală o bătaie pe padul care nu
avea nimic de bătut. Un poliritm cu două mâini e exact asta, cu două voci, deci
jocul e o configurație, nu un motor nou.

**Măsura e ciclul.** Cele două fluxuri se ating numai pe „unu" și se regăsesc
abia la bara următoare, deci o măsură = o repetare completă a raportului. Nimic
din joc nu are înțeles peste graniță.

**Grila e cea comună**: `lcm(a, b)`, exact cea pe care o predă lecția: la 3
contra 2 sunt șase pași, fluxul de trei pe 1·3·5 și cel de doi pe 1·4. Pe orice
altă grilă un flux ar cădea între pași și n-ar putea fi nici scris, nici bătut.
Testele cer pozițiile astea pe litere, ca desenul din joc și textul lecției să
nu se despartă în tăcere.

**Pulsul e unul dintre fluxuri**, nu un al treilea reper: `beatsPerBar` e
numărul de note al fluxului de sprijin, deci metronomul cade fix pe el. Dacă ar
bate altceva, ai avea trei ritmuri de urmărit în loc de două.

**Aceleași sunete ca lecția, nu tobe.** Fluxul care trece peste e la 440 Hz,
pulsul la 294, o cvintă mai jos, perechea lecției 18. Nu e o alegere de
culoare: cu două tobe diferite se aud două instrumente, cu două înălțimi se aud
două voci, și poți urmări una fără să o pierzi pe cealaltă exact acolo unde se
suprapun. Trecerea de la lecție la joc nu mai schimbă, deci, ce auzi, se
schimbă doar cine bate a doua voce, aplicația sau mâna ta. Un test randează
fiecare voce și numără trecerile prin zero: dacă cineva strică raportul de 3:2,
pică testul, nu urechea unui elev.

**Sunetul urmează fluxul, nu mâna.** Când mâinile se schimbă între runde, se
schimbă și padul de pe care vine fiecare voce.

**Demonstrația de la început predă numărătoarea, nu doar regula.** Înainte de
prima rundă, patru ascultări, în ordinea în care se învață: grila singură (auzi
în câte părți egale se taie măsura), fluxul tău peste ea, celălalt separat, apoi
amândouă. Deasupra lor, numerele grilei, colorate pe fluxuri, se vede că „1” e
al amândurora și că restul se împart. Fără partea asta, jocul spune CE să faci
(„trei peste două”) și nu spune CUM, iar „cum” e singurul lucru care contează la
un poliritm: nu îl simți, îl numeri. Tempoul demonstrației e plafonat la 52 BPM:
la 5 contra 4 grila are douăzeci de părți și în tempoul rundei nu se pot număra.

**Primul nivel are o singură mână.** Pulsul îl ține aplicația, ca la lecție:
intră în acompaniament, se aude și sub model, și sub răspuns, și nu se
punctează. Se desenează un singur pad, al doilea ar fi o cursă, fiindcă mâna
lui n-are nimic de bătut și orice atingere acolo ar fi numărată în plus. Fără
nivelul ăsta, primul contact cu poliritmul ar fi direct cu două mâini, ceea ce
nu se poate: un începător nu bate două fluxuri deodată, ține unul și îl aude pe
celălalt.

**Mâna care ține fluxul greu se schimbă** de la o rundă la alta. Altfel mâna
dominantă ar face mereu fluxul greu, iar cealaltă doar pulsul: jumătate din
exercițiu, făcut mereu cu aceeași mână.

**Tempoul coboară la rapoartele mari.** Dificultatea aici e independența
mâinilor, nu viteza. Pragul de 90 ms e verificat între mâini, nu doar în
interiorul uneia, acolo se apropie fluxurile cel mai mult. Loviturile
**simultane** nu intră la socoteală: pe „unu" cele două cad împreună prin
definiție, iar două mâini care lovesc odată nu cer dexteritate.

### Numărul de timpi pe măsură e un parametru, lungimea pasului nu

`beatsPerBar` schimbă unde cade bara și, cu ea, accentul și numărătoarea de
intrare. Nu schimbă cât ține un pas: o pătrime sună identic în 2/4 și în 4/4,
altfel lecția ar preda ceva fals. Un test compară direct cele două măsuri și
cere ca distanțele dintre ținte să rămână aceleași.

Parametrul a trebuit dus în cinci locuri, nu în trei cum estimase planul. Cel
mai ușor de ratat: **cheia de cache a pistei audio**. Fără `beatsPerBar` în ea,
o măsură de 2/4 și una de 4/4 cu același pattern și tempo primeau același WAV.

Al doilea cel mai ușor de ratat, și prins abia la a doua trecere: **metronomul
număra fix până la 4.** Într-o măsură de 2/4 ultimele două click-uri cădeau după
bară, adică peste pattern. Nu se vedea pe ecran deloc, doar se auzea. Acum există
un test care cere ca niciun click să nu iasă din măsura lui, în 2/4, 3/4 și 4/4.

**Măsura compusă intră tot aici.** 6/8 nu a cerut un mecanism nou: e
`stepsPerBar: 36` cu `beatsPerBar: 2`, adică 18 pași pe timp, exact o pătrime
punctată. Singurul loc unde nu mai merge deducția e notația: `RhythmLine` primește
lungimea măsurii direct, fiindcă în 6/8 ea nu mai e `beatsPerBar × 12`.

### Mixajul audio e parametrizabil

`pattern`, notele conduc, pentru învățat după ureche.
`grid`, metronomul e în față, pentru când contează *unde* cade nota:
rezolvarea din jocul de citire, exemplele de contratimp și sincopă.

### Cheat sheet-ul se generează din lecții

Fiecare lecție își declară noțiunile într-un câmp obligatoriu. O lecție nouă
fără noțiuni declarate nu compilează. Înainte, lista era scrisă separat și a
rămas în urmă de fiecare dată când am adăugat lecții.

---

## Teste, 161, în șase fișiere

| Fișier | Ce acoperă |
|--------|------------|
| `src/game/rhythm.test.ts` | scoring: aliniere, latență, durate, praguri |
| `src/game/notation-tokens.test.ts` | modelul de notație, durate, grupare |
| `src/audio/round-plan.test.ts` | conținutul audio randat: durate, mixaj, atac, triolete |
| `src/curriculum/rhythm.test.ts` | validarea lecțiilor scrise de mână |
| `src/polyrhythm/polyrhythm.test.ts` | grila comună, rapoartele, scorul pe fiecare mână |
| `src/game/reading.test.ts` | validarea exercițiilor generate pentru citire |

Testele audio nu verifică parametri, ci **randează WAV-ul și măsoară energia
semnalului**: că o doime chiar se aude pe toată durata ei, că nota nu începe cu
un pocnet, că pe mixajul `grid` metronomul chiar e mai tare.

**Atenție la măsurătorile audio:** pista conține și click-urile de metronom.
Ferestrele de măsurare se aleg **între** bătăi. Am căzut în capcana asta de
două ori.

Testele de curriculum validează date scrise de mână, o greșeală de tipar acolo
nu dă eroare de compilare, dar strică lecția. Au prins deja două măsuri
incomplete.

---

## Ce urmează

Planul complet: [PLAN-RITM.md](PLAN-RITM.md).

**Categoria Ritm e completă**: 18 lecții din 18, plus cele trei jocuri.

Ce ar putea urma, în ordinea în care ar aduce cel mai mult:

1. **Persistența.** E cea mai mare lipsă acum, mai mare decât orice lecție nouă:
   18 lecții fără progres salvat înseamnă că aplicația uită tot la închidere.
2. **Progresia.** Cu 18 lecții și 30 de niveluri de joc, saltul direct în
   lecția 18 sau în nivelul 14 nu mai e o libertate, e o capcană. Deblocarea pe
   măsură devine utilă abia acum.
3. **Auz și Armonie**: categorii noi, deocamdată doar chenare „în lucru".

## Probleme cunoscute

**Nimic nu se salvează.** Închizi aplicația, pierzi progresul. Nu există
„lecție terminată", nu există deblocare, nu există cel mai bun rezultat.

**Nu există progresie.** Poți intra direct în lecția 11.

**Cache-ul Metro servește bundle vechi.** După o modificare, pagina rulează
uneori codul de dinainte. Singura soluție găsită: repornirea serverului cu
`--clear`. S-a întâmplat de cel puțin patru ori.

**Discul C: se umple.** Metro își reconstruiește cache-ul în `Temp` la fiecare
repornire. Cei 6.45 GB din `C:\Windows\SoftwareDistribution\Download` sunt încă
acolo și cer drepturi de administrator: Start → `cleanmgr` → Run as
administrator → „Clean up system files" → Windows Update Cleanup.

**Avertisment `transform-origin` în consolă.** Vine din `react-native-svg`, la
prima randare a notației. Simbolurile se desenează corect; e zgomot de
development. Se poate elimina desenând capul de notă ca `Path` în loc de
`Ellipse` rotită.

**Categoria „devreme / târziu"** apare în legenda jocului de citire, dar la
ritmuri dense nu poate fi atinsă: fereastra de potrivire și pragul „aproape"
coincid acolo. Se poate separa fereastra de prag, dar atinge scoringul.
