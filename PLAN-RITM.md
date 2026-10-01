# Categoria Ritm, 18 lecții din 18

Ordinea e pedagogică, nu alfabetică: fiecare lecție se sprijină doar pe ce s-a
predat înainte. Măsura vine devreme (#2) fiindcă tot restul numără „unu-doi-trei-patru"
și desenează bare, nu poate fi introdusă la final ca noțiune nouă.

Citirea și dictatul nu sunt lecții, sunt **moduri de exersare**. Există ca jocuri
(`Citește ritmul`, `Rhythm Echo`) și sunt disponibile din start.

„Ritm în muzică reală" a fost **scos din plan**: presupune înregistrări licențiate,
pe care nu le avem.

## Fundamente

| # | Lecție | Ce învață | Stare |
|---|--------|-----------|-------|
| 1 | Pulsul | bătaia constantă, tempoul, BPM | gata |
| 2 | Măsura | gruparea timpilor, timpul tare, 4/4 | gata |
| 3 | Pătrimea | un sunet pe puls, pauza de pătrime | gata |
| 4 | Optimea | două sunete pe puls, numărat „unu-și" | gata |
| 5 | Șaisprezecimea | patru subdiviziuni, numărat „unu-e-și-a" | gata |
| 6 | Combinații de subdiviziuni | pătrimi + optimi + șaisprezecimi în aceeași măsură | gata |

## Deplasarea accentului

| # | Lecție | Ce învață | Stare |
|---|--------|-----------|-------|
| 7 | Contratimpul | sunet între pulsuri | gata |
| 8 | Sincopa | accent deplasat peste puls | gata |
| 9 | Legarea ritmurilor | o notă ține peste timp; al doilea cap nu se atacă | gata |
| 10 | Punctul | pătrime punctată, optime punctată | gata |
| 11 | Trioletul | trei subdiviziuni egale pe un puls | gata |

## Metrică și subdiviziuni neobișnuite

| # | Lecție | Ce învață | Stare |
|---|--------|-----------|-------|
| 12 | Sextoletul | șase subdiviziuni pe puls | gata |
| 13 | Măsura 2/4 | puls în grupe de doi | gata |
| 14 | Măsura 3/4 | puls în grupe de trei | gata |
| 15 | Măsura 6/8 | puls compus | gata |

## Sinteză

| # | Lecție | Ce învață | Stare |
|---|--------|-----------|-------|
| 16 | Ritmuri mixte | toate valorile combinate | gata |
| 17 | Ritmuri complexe | sincopă + pauze + subdiviziuni | gata |
| 18 | Poliritm | 2 contra 3, 3 contra 4 | gata, ca lecție |

## Ce a cerut motorul, în final

Planul e acoperit: **18 lecții din 18.** Ce a fost nevoie, dincolo de conținut:

**Sextoletul (#12)**: doar conținut, cum era estimat. Grila de 48 de pași scoate
cele șase subdiviziuni exact. Simbolul nou are capetele de notă la 80% din mărime:
la șase note pe lățimea unui timp, capetele normale se ating și grupul devine o pată.

**Măsurile 2/4, 3/4 (#13, #14)**: parametrul `beatsPerBar`, cum era prevăzut, dar
în **cinci** locuri, nu în trei: pe lângă `round-plan.ts` și liniile de timp, l-au
mai cerut cheia de cache a pistei (altfel 2/4 și 4/4 primeau același WAV),
numărătoarea de intrare și lățimile din `RhythmLine`. Odată făcut pentru 2/4,
măsura de 3/4 a fost doar conținut.

**Măsura 6/8 (#15)**: s-a dovedit mai ieftină decât se temea planul. Pulsul e
într-adevăr pătrimea punctată, dar asta se exprimă complet prin cele două numere
deja existente: `stepsPerBar: 36`, `beatsPerBar: 2`, deci 18 pași pe timp. Formula
`stepsPerBeat = stepsPerBar / beatsPerBar` nu a trebuit atinsă. Singura schimbare:
`RhythmLine` primește acum lungimea măsurii direct (`ticksPerBar`), nu numărul de
timpi, în măsurile compuse una nu se mai deduce din cealaltă.

**Ritmurile mixte și complexe (#16, #17)**: doar conținut, cum era de așteptat.

**Poliritmul (#18)**: **făcut ca lecție, nu ca al treilea joc.** Vezi mai jos.

## Poliritmul: de ce lecție și nu joc

Planul îl prevedea ca joc separat, cu două fluxuri simultane, două zone de atingere
și scor pe fiecare mână. Nu a fost nevoie, și nici nu ar fi fost bine ca primă
formă: **nu așa se învață un poliritm.** Un începător nu bate două fluxuri deodată;
ține unul și îl aude pe celălalt.

Lecția predă metoda care chiar funcționează: **grila comună**. Pentru 3 contra 2
numeri șesimi și cazi pe 1-3-5 cât timp celălalt cade pe 1-4; pentru 3 contra 4,
douăsprezecimi. `BeatGrid` desenează cele două fluxuri unul sub altul, pe aceeași
unitate, iar fiecare rundă de exercițiu își scrie raportul.

Asta a cerut un singur lucru de la motor: `backingPattern`, un al doilea flux
randat în WAV, cu voce proprie, care **nu intră în ținte și nu se punctează**, și
care continuă și în fereastra de răspuns. Fără partea din urmă nu ar exista
poliritm, ci un ritm ciudat bătut singur.

## Jocul cu două mâini: făcut

Există acum și jocul, peste motorul de voci al aplicației (`src/lanes/`), nu peste
`backingPattern`. A cerut exact ce scria planul, a doua zonă de atingere și scor
separat pe fiecare flux, și nimic în plus: motorul punctează deja fiecare voce
separat și penalizează padul greșit.

Deosebirea față de lecție, în două cuvinte: **la lecție al doilea flux se aude
fiindcă nu e al tău; în joc sunt amândouă ale tale.** De aceea jocul nu folosește
deloc `backingPattern`: n-are ce să nu se puncteze.

Ce a trebuit ales, fiindcă planul nu spunea:

- **Măsura e ciclul.** Fluxurile se ating doar pe „unu”, deci o măsură = o
  repetare completă a raportului. Nimic nu are înțeles peste graniță.
- **Pulsul e unul dintre fluxuri**, nu un al treilea reper: `beatsPerBar` e
  numărul de note al fluxului de sprijin, deci metronomul cade fix pe el. Dacă ar
  bate altceva, ar fi trei ritmuri de urmărit, nu două.
- **Sunetul urmează fluxul, nu mâna**: toba mică e mereu fluxul care trece
  peste, toba de podea mereu pulsul. Cu același sunet, cele două s-ar topi exact
  pe „unu”, adică fix unde e toată lecția.
- **Mâna care ține fluxul greu se schimbă** de la o rundă la alta, altfel mâna
  slabă ar face mereu doar pulsul.
- **Tempoul coboară la rapoartele mari.** Dificultatea e independența mâinilor,
  nu viteza; un 5 contra 4 la 80 BPM nu e exercițiu, e o pată.

Zece niveluri: 3:2, 3:2 mai repede, 2:3, 3:4, 4:3, mixt pe două măsuri, 5:4, 4:5,
5:3 și tot ce s-a învățat, pe două măsuri.

## Ce a rămas în afara categoriei Ritm

**Auz și Armonie** sunt doar chenare „în lucru" pe ecranul principal. Nu există
plan pentru ele încă.

Starea detaliată a proiectului: [STARE.md](STARE.md).
