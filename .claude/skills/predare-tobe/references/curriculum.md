# Curriculumul

Cele opt etape ale manualului, ce presupune fiecare și de ce sunt în ordinea
asta. Sursa de adevăr pentru conținut e `PLAN-TEORIE-TOBE.md` §6; aici stă
raționamentul pedagogic, ca o lecție nouă să nu cadă în etapa greșită.

Ordinea etapelor e în `src/drums/theory/stages.ts`; **ordinea lecțiilor e
ordinea din fișier**, deci o lecție adăugată la mijloc mută harta.

## Etapa 0, Instrumentul *(5 lecții)*

Setul și piesele · Bețele și priza · Poziția, scaunul, înălțimile · Pedala și
piciorul · Cum sună fiecare piesă

**Presupune: nimic.** E singura etapă care poate presupune asta, și de aceea e
prima.

Rezolvă un gol real: un începător deschide „Groove-uri", vede o grilă cu șapte
rânduri și trebuie să ghicească ce e un hi-hat. **Modulele de practică presupun
deja etapa asta.**

Ce e specific aici: se predă prin **sunet**, nu prin scris. Elevul încă n-a
învățat notația, deci exemplele merg cu `showGrid: false` până când grila chiar
ajută. Tempo mic peste tot (60-80 BPM), la 140 asculți ritmul, nu timbrul.

## Etapa 1, Notația de tobe *(6)*

Portativul și pozițiile *(inclusiv × pentru cinele)* · Pătrimi, optimi,
șaisprezecimi · Accent, ghost note, cross-stick, rimshot · Triolete și shuffle ·
Toba mare dublă și crash-ul · Bare, reprize, semne de repetiție

**Presupune:** Etapa 0 (numele pieselor). Din Ritm: măsura, valorile de note și
trioletele, portativul le presupune, nu le predă; fiecare lecție care are
nevoie de una pune `requiresRhythmLesson`.

**Abaterile de la lista inițială**, luate pe rând, fiecare după ce lecția
dinainte a fost citită pe telefon:

- **× pentru cinele nu are lecție separată.** Fără ele, lecția despre portativ
  nu poate arăta niciun groove adevărat, iar exemplele ies exerciții care nu
  seamănă cu nimic. Rotund pentru tobe, × pentru cinele e o singură noțiune.
- **Valorile și trioletele au primit lecțiile lor.** Nu calcă peste Ritm: acolo
  se învață cât ține o optime, aici cum arată pe un portativ de tobe. Fără
  triolete nu se putea scrie shuffle-ul.
- **Fusul cu piciorul e amânat** (între timp are mostră, `hhFoot`), fiindcă n-avea: o lecție întreagă ar fi
  fost numai de citit. Se pomenește la ride-ul de jazz, unde chiar contează.
- **Puntea cu grila nu mai e o lecție**, ci ultima secțiune a primei lecții și a
  câtorva de după ea (`showStaff` + `showGrid` pe același exemplu). Comparația
  ține cât o măsură, nu cât un ecran întreg.

Ce NU se poate cânta și se predă citit: **rimshot-ul**. N-are mostră. Se învață
dintr-o legendă de capete de notă (`visual: 'heads'`), iar lecția spune pe față
că nu se aude, un exemplu care ar reda o tobă mică normală în locul lui ar preda
exact greșit. Cross-stick-ul, fusul cu piciorul, clopotul ride-ului și mătura
AU mostre, din DRSKit (`assets/drums/drsx`): piesele `crossStick`, `hhFoot`,
`rideBell`, `brush`. Folosește-le în exemple în loc de înlocuitori.

## Etapa 2, Mâinile, ca sistem *(6)*

Ce e un rudiment · Familiile: singles, doubles, diddles, flams, drags ·
Sticking-ul și de ce contează · Accent-tap-ghost, cele trei înălțimi ale bățului
· Open-close-open · Rolls: 5, 7, 9 stroke, buzz

**Presupune:** Etapa 0 (priza). Notația de sticking (R/L) se poate preda și fără
Etapa 1 întreagă, rândul de mâini se citește singur.

Ordinea rudimentelor, confirmată de ambele metode citite: **singles și doubles
întâi**, fiindcă tot restul e făcut din ele. Un `double stroke roll` curat
deschide mai multe decât zece rudimente învățate pe jumătate.

Flam-ul poate veni devreme (Pegada îl pune printre primele) fiindcă e un gest,
nu o subdiviziune, nu cere ca elevul să stăpânească ceva ritmic.

## Etapa 3, Anatomia groove-ului *(7)*

Cele trei roluri: timpul, backbeat-ul, basul · Ostinato-ul · Subdiviziunea ca
*feel* · Drept vs. shuffle · Orchestrarea: hat → ride → crash · Dinamica
înăuntrul groove-ului · Cum variezi fără să-l pierzi

**Presupune:** Etapele 0-2. Din Ritm: optimi, șaisprezecimi, triolete (pentru
shuffle).

Cârligul care funcționează, folosit de ambele metode: **„ai bătut vreodată din
palme la o piesă? Alea erau timpii 2 și 4."** Backbeat-ul nu e o noțiune nouă
pentru nimeni, e ceva ce elevul face deja fără să știe cum se cheamă. O lecție
care pornește de acolo e câștigată din prima propoziție.

**Coordonarea se predă pe perechi, apoi pe triplete**: progresia cea mai
concretă din tot materialul citit:

```
tobă mare + tobă mică  ->  hi-hat + tobă mică  ->  hi-hat + tobă mică + tobă mare
```

## Etapa 4, Forma piesei *(5)*

Fraza de 4 și de 8 măsuri · Fill-ul ca punctuație · Intro, strofă, refren ·
Stops, breaks, intrări · Cum numeri o piesă și unde e „unu"

**Presupune:** Etapa 3.

Definiția de fill care se reține, pentru că e negativă și scurtă: **fill-ul e tot
ce nu e groove-ul.** De obicei la capăt de frază, ca să împingă piesa mai
departe. Ambele metode citite o formulează așa.

## Etapa 5, Stiluri *(8)*

Rock · Blues shuffle · Funk · Jazz: ride-ul și comping-ul · Bossa, samba, clave ·
Metal: dublu bas, blast · Afro-cuban · Pop modern și half-time

**Presupune:** Etapele 3-4.

Ordinea nu e istorică și nu e după popularitate, ci **după cât de departe cade
lovitura de puls**: întâi tot ce stă pe optimi drepte (rock, pop), apoi
șaisprezecimile și sincopele (funk), apoi ternarul (shuffle, jazz), apoi ce cere
independență pe mai multe planuri (latin, afro-cuban). Aceeași ordine e deja în
`grooves.ts`.

## Etapa 6, Avansat *(8)*

Independența pe ostinato · Linear playing · Deplasarea *(displacement)* · Măsuri
impare: 5/4, 7/8 · Poliritm 3:2 și 4:3 · Metric modulation · Tehnica de dublu
bas · Mături

**Presupune:** tot ce e înainte. Din Ritm: măsuri compuse, poliritm, lecțiile
17 și 18. Poliritmul **se trimite** acolo, nu se rescrie.

## Etapa 7, Muzician, nu doar toboșar *(5)*

Tu și basistul · Dinamica în aranjament · Cântatul cu clic · Cum citești un
chart · Transcriere: cum asculți o piesă

**Presupune:** Etapa 4 (forma). Restul e ascultare, nu tehnică.

E etapa care justifică numele modulului. Un toboșar care cântă rudimente perfect
și nu aude basistul nu e încă muzician.

---

## Bloc sau spirală, decizia pe care o moștenim

Planul nostru e **pe blocuri**: toată notația, apoi toate mâinile, apoi
groove-ul. Metoda Pegada e **în spirală**: coordonare → un rudiment → un groove →
un fill → înapoi la coordonare, mai greu. Ambele funcționează, dar nu la fel.

Blocul e mai coerent de citit și mai ușor de scris. Spirala ține elevul mai mult,
fiindcă îi dă un groove cântabil în prima săptămână, nu în a șasea.

**Ce facem, practic:** structura pe etape rămâne, harta are nevoie de ea. Dar
**fiecare etapă trebuie să fie folositoare singură**, și fiecare lecție care
poate să ajungă la un sunet cântabil trebuie să ajungă. Etapa 1 nu e „șase lecții
de notație": e șase lecții după care poți citi un groove real. Dacă o lecție se
termină fără ca elevul să poată face ceva cu ea, e scrisă ca un capitol de
manual, nu ca o lecție.

## Ce ne lipsește: piesele reale

Pegada pune, după fiecare groove, o listă de melodii care îl folosesc, **cu
tempoul fiecăreia**: *Billie Jean [117]*, *Seven Nation Army [121]*, *Purple
Rain [58]*. E cel mai puternic element motivațional din toată metoda și noi nu-l
avem deloc: elevul învață un pattern abstract și nu află niciodată că tocmai a
învățat o piesă pe care o știe.

Ar fi ieftin de adăugat, un câmp în datele lecției sau ale exercițiului, cu
titlu, artist și BPM. **Lista lui Reis nu se copiază** (selecția e chiar partea
creativă); alegem noi melodiile și verificăm tempourile.

Nu e încă în plan. Dacă apare cererea, aici e argumentul.
