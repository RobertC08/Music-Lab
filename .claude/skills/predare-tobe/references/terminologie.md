# Terminologie

Etichetele livrate în aplicație, termenii standard și cum se introduc prima oară.

Regula de sub tot: **aplicația își citează propriile etichete.** Manualul de la
`/suport` le indexează cu pondere mare, iar asistentul de acolo își construiește
răspunsurile din el. Un sinonim mai frumos inventat într-o lecție nu dezinformează
doar cititorul, strică și căutarea.

## Piesele setului

Sursa de adevăr e `src/i18n.ts`, cheile `drums.piece_*`. Dacă se schimbă acolo,
se schimbă și aici.

| Cheie | Română (livrat) | Engleză (livrat) | Termen internațional |
|---|---|---|---|
| `kick` | Tobă mare | Bass drum | kick |
| `snare` | Tobă mică | Snare | snare |
| `hhClosed` | **Fus** | Hi-hat | hi-hat |
| `hhOpen` | **Fus deschis** | Open hat | open hi-hat |
| `tom` | **Tom 1** | Tom | high tom |
| `mid` | **Tom 2** | Mid tom | mid tom |
| `floor` | **Cazan** | Floor | floor tom |
| `crash` | Crash | Crash | crash |
| `ride` | Ride | Ride | ride |
| `crossStick` | Cross-stick (scurt: Cross) | Cross-stick (X-stick) | cross-stick, side stick |
| `hhFoot` | Fus cu piciorul (scurt: Fus pic.) | Foot hi-hat (Foot) | hi-hat pedal |
| `rideBell` | Clopotul ride-ului (scurt: Clopot) | Ride bell (Bell) | ride bell |
| `brush` | Mătură | Brush | brush |

Ultimele patru sunt **lovituri**, nu piese ale setului, și vin din DRSKit
(`assets/drums/drsx`), fiindcă MuldjordKit nu le are. Pe desen nu apar separat:
se aprind pe piesa pe care cad. Pe portativ: cross-stick × pe spațiul tobei
mici, fusul cu piciorul × sub portativ, clopotul romb pe linia ride-ului.

**De unde vin termenii îngroșați.** Sunt cei de pe o diagramă în română adusă de
utilizator, adoptați la cererea lui pe 2026-09-30, în locul variantelor de
dinainte (Hi-hat, Tom, Tom de mijloc, Tom podea).

„Cazan" e folosit curent de toboșarii români pentru toba de podea. **„Fus" nu l-am
putut confirma** ca termen curent pentru hi-hat, diagrama de unde vine pare
tradusă automat (conținea un marker de citare scăpat în text), iar în româna
vorbită hi-hat-ul e de obicei „hi-hat". E o alegere asumată a proiectului, nu o
constatare. Dacă apare dovada contrară, se schimbă în `drums.piece_*` și
`drums.pieceShort_*`, în manual și în alias-urile de căutare, dintr-o mișcare.

Consecința pentru scris: **fusul se introduce cu ambele nume**, o dată, în lecția
care îl predă, „în română i se spune fus; în engleză și pe aproape orice
partitură, hi-hat". Un elev care nu știe „hi-hat" nu poate citi nimic din afara
aplicației.

Alias-urile de căutare („hi-hat", „floor tom", „tom podea") sunt în
`docs/help/query-aliases.json`, ca asistentul de la `/suport` să răspundă și
cuiva care scrie termenul vechi.

**Cum se introduce un termen prima oară.** Numele românesc, apoi cel
internațional în paranteză, o singură dată, în lecția care îl predă:

> Toba mare (kick) e singura cântată cu piciorul.

După aceea, doar „toba mare". Motivul pentru care termenul internațional apare
totuși: pe orice partitură, în orice tutorial de pe internet și în orice
discuție cu alt toboșar, elevul o să întâlnească „kick" și „snare". Un manual
care îl lasă nepregătit pentru asta îl lasă mut în prima repetiție.

**Ce nu se scrie:** „bas" sau „bass drum" pentru toba mare în textul românesc;
„caisă"; „tom mediu"; „podea" sau „tom podea" ca etichetă (rămâne doar ca
explicație a cazanului); „floor tom" în română.

**Atenție la textele vechi.** Descrierile de groove-uri și de moduri din
`i18n.ts` încă spun „hi-hat" în proză, deși eticheta de pe grilă e „Fus". Când
atingi unul din textele alea, adu-l la zi.

## Mâinile

**R** și **L**, nu D și S. Sunt literele de pe partituri, aceleași în orice
metodă de tobe din lume; un elev care învață D/S nu poate citi nimic din afara
aplicației. Regula e deja aplicată în `rudiments.ts`, în grile și în promptul de
generare de exerciții din web.

Se scrie ca un șir, cu spații: `R L R R, apoi L R L L`.

## Intensități

| Cod | Română | Ce e |
|---|---|---|
| `accent` | accent | lovitura scoasă în față; pe partitură, un `>` deasupra notei |
| `normal` | lovitură normală | nivelul de bază |
| `ghost` | ghost note | lovitură foarte slabă, care se simte ca pulsație, nu se aude ca notă; scrisă în paranteze |

Un ghost note **nu** e „o lovitură mai slabă". E o treaptă proprie, cu alt rost:
umple spațiul dintre backbeat-uri fără să-l concureze. Formularea asta contează,
explicat ca „mai încet", elevul îl cântă ca pe o notă timidă, nu ca pe o umbră.

## Tehnici și noțiuni

| Termen | Română | Ce înseamnă, pe scurt |
|---|---|---|
| Backbeat | backbeat | toba mică pe timpii 2 și 4 |
| Groove | groove | pattern-ul care se repetă și ține piesa |
| Fill | fill | ce se cântă în locul groove-ului, de obicei la capăt de frază |
| Ostinato | ostinato | un flux care se repetă neschimbat sub restul |
| Sticking | sticking, „mâinile" | ce mână face fiecare lovitură |
| Rudiment | rudiment | pattern de mâini scurt, cărămida din care se fac restul |
| Flam | flam | o notă de grație imediat înaintea loviturii, cu cealaltă mână |
| Drag | drag | două note de grație înaintea loviturii |
| Roll | roll | lovituri foarte dese, care sună continuu |
| Buzz / multiple bounce | buzz roll | bățul e presat în fața tobei și sare de mai multe ori |
| Cross-stick | cross-stick | bățul culcat pe fața tobei, lovit de cerc; sunetul de „lemn" |
| Rimshot | rimshot | fața tobei și cercul lovite deodată; cel mai tare sunet al tobei mici |
| Four on the floor | „pe fiecare timp" | toba mare pe toți cei patru timpi |
| Shuffle | shuffle | subdiviziune ternară: „lung-scurt" în loc de egal |
| Independență | independență | fiecare membru face altceva, în același timp |

## Rudimentele

Numele **nu se traduc**: single stroke roll, double stroke roll, paradiddle,
flam tap, drag. Sunt nomenclatura PAS (Percussive Arts Society), standard
internațional, și orice altă metodă le numește la fel. Se explică în română ce
fac, dar se numesc în engleză.

> **Single stroke roll**: lovituri alternate, una cu fiecare mână: R L R L.

## Notația de tobe, convențiile

Notația de tobe **nu e standardizată**; ce urmează sunt convențiile larg
folosite, pe care le respectă și cele două metode citite.

- **Portativ de cinci linii**, cu **clef neutră** (două bare verticale scurte),
  pusă fiindcă tobele sunt percuție nedeterminată, fără înălțime.
- **Tobele se scriu cu cap de notă rotund; cinelele cu ×.**
- **Cu cât piesa sună mai înalt, cu atât stă mai sus** pe portativ: cinelele și
  tomul mic sus, toba mare și tomul podea jos.
- **Hi-hat-ul deschis** se marchează cu un cerculeț deasupra notei; închis,
  cu ×.
- **Hi-hat-ul cu piciorul** se scrie sub portativ, cu × .
- **Accentul** e `>` deasupra notei; **ghost note-ul**, note în paranteze.

Grila noastră (`components/drums/groove-grid.tsx`) urmează aceeași ordine,
cinelele sus, toba mare jos, exact ca să nu contrazică portativul. Nu e gust:
un toboșar caută hi-hat-ul în rândul de sus, și dacă nu e acolo, citește mai
încet.

## Ce se spune despre durată, la tobe

Merită scris explicit într-o lecție, fiindcă elevul se întreabă oricum:

> O tobă nu poate ține sunetul. Pe un pian, o notă întreagă sună de patru ori
> mai mult decât o pătrime; pe o tobă mică, amândouă sună la fel. De aceea la
> tobe contează **când** lovești, nu cât ții, iar când chiar e nevoie de un
> sunet lung, se face din lovituri dese, adică un roll.

E și motivul pentru care în aplicație durata se judecă doar unde notația o
specifică. Vezi `surse.md`.
