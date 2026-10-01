---
name: predare-tobe
description: >-
  Expert în predarea tobelor pentru MusicLab și ToneTrack, scrie lecții de
  teorie la tobe, exerciții de practică (rudimente, groove-uri, fill-uri) și
  răspunde la întrebări despre pedagogia instrumentului. Folosește-l ori de câte
  ori apar tobele, bateria sau percuția în orice formă: o lecție nouă de scris,
  un groove sau un rudiment de adăugat în date, o grilă de notație de citit sau
  de desenat, o întrebare de tipul „cum explic backbeat-ul / shuffle-ul /
  independența", un text din aplicație despre tobe de corectat, sau promptul de
  generare de exerciții. Folosește-l și când cererea nu spune „tobe" explicit,
  dar atinge hi-hat, snare, kick, ride, crash, tom, sticking, R/L, paradiddle,
  flam, drag, roll, ghost note, ostinato, fill sau groove.
---

# Predarea tobelor

Skill pentru scrierea conținutului de tobe din MusicLab (`D:\MusicLab`, sandbox)
și ToneTrack (`MusicPal-main/MusicPal/mobile`, aplicația). Cele două țin același
modul, sincronizat fișier cu fișier, vezi `INTEGRARE.md` din sandbox.

Rostul lui nu e să știi tobe. E să **predai** tobe într-o aplicație care nu aude
elevul, în două limbi, într-un format de date care se validează, trei
constrângeri care schimbă ce poți spune și cum.

## Regula de sub tot restul: măsori doar ce poți măsura

Aplicația **nu aude** padul sau setul. Nu are microfon în fluxul de practică și
nu se preface că are.

De aici ies două zone, cu reguli opuse, și cea mai frecventă greșeală e să le
amesteci:

| | Practică (Rudimente, Groove-uri, Fill-uri) | Manual (teoria) |
|---|---|---|
| Ce face elevul | bate pe padul sau setul lui | citește, ascultă, răspunde |
| Se punctează? | **niciodată** | da, dar doar înțelegerea |
| Ce se salvează | că ai dus sesiunea până la capăt, și la ce tempo | lecția citită, quiz-ul trecut |

Un quiz **are** voie să dea scor: aplicația chiar poate judeca dacă ai recunoscut
un shuffle, dacă ai citit corect o notație sau dacă ai bătut pattern-ul **pe
ecran**: atingerea pe ecran e verificabilă. Ce rămâne nemăsurat e execuția pe
instrument, iar pentru ea există practica, unde nimeni nu pretinde nimic.

Când scrii text, asta se vede în formulări. Nu scrie „vei stăpâni", „te corectăm
dacă greșești" sau „aplicația verifică dacă ai bătut corect" în zona de practică.
Scrie ce e adevărat: aplicația ține timpul, arată notația, dă demonstrația și
numără.

## Granița cu modulul Ritm

**Ritmul predă timpul. Tobele predau instrumentul și limbajul lui.**

Ritmul are 18 lecții și acoperă tot ce ține de timp: puls, măsură, pătrime,
optime, șaisprezecime, contratimp, sincopă, legato, punct, triolete, sextolet,
2/4, 3/4, 6/8, ritmuri mixte, poliritm. Sunt noțiuni de care are nevoie și un
chitarist.

Când o lecție de tobe are nevoie de o noțiune de timp, o **trimite** acolo prin
`requiresRhythmLesson`, nu o repetă. Fără regula asta, manualul rescrie
șaisprezecimile a treia oară și cele două module se contrazic în tăcere după
primul an.

Testul practic, înainte să scrii o secțiune: *„ar avea nevoie de asta și un
pianist?"* Dacă da, e lecție de Ritm.

## Cum se construiește o lecție

Ordinea contează, scrisă invers, o lecție iese cu exemple lipite peste text.

1. **Alege ce predă lecția, într-o propoziție.** Dacă nu încape într-una, sunt
   două lecții. `goal` e chiar propoziția asta, scrisă către elev.
2. **Verifică ce presupune.** Lecția se sprijină pe ceva din Ritm? Pune
   `requiresRhythmLesson`. Pe o lecție de tobe anterioară? Atunci stă după ea în
   `lessons/`, fiindcă ordinea din fișier e ordinea de pe hartă.
3. **Scrie secțiunile ca un drum, nu ca o listă de fapte.** 5-8 secțiuni. Fiecare
   introduce **un** lucru și, unde are sens, îl face auzibil.
4. **Scrie exemplul ÎNAINTE de textul care îl descrie**, sau cel puțin
   verifică-le unul pe altul. Motivul e în „Greșeli" mai jos, și e cea mai
   scumpă greșeală din tot skill-ul ăsta.
5. **Adaugă termenii** în `terms`, pe secțiunea care îi introduce. Nu ținem un
   dicționar separat: ar rămâne în urmă la prima lecție adăugată.
6. **Treci prin porți** (vezi mai jos).

### Reperul vizual

O lecție care numește părți ale instrumentului are nevoie de un desen. „Tomul 2"
e un cuvânt gol pentru cineva care nu știe la ce se uită, iar o descriere în
cuvinte a unde stă fiecare piesă e chiar felul prost de a preda asta.

Regulile, câștigate la prima diagramă (`components/drums/theory/KitDiagram.tsx`):

- **Desenat, nu fotografiat.** O poză de set e a cuiva; un SVG nu cântărește
  nimic în pachet, se scalează și, partea care contează, **poate fi atins**.
- **Desenul e exercițiul, nu ilustrația.** Lecția cere „recunoști fiecare piesă
  după cum sună": atunci atingerea piesei trebuie să o facă să sune. O imagine
  lângă text n-ar preda nimic din ce cere lecția.
- **Culorile sunt cele din grila de notație** (`groove-grid.tsx`). Tomul 1 e
  portocaliu în desen fiindcă e portocaliu și în rândul pe care elevul îl va citi
  peste două lecții. Un desen în gri pierde singura punte dintre ele.
- **Numele sub desen, ca butoane**, nu etichete pe desen: la lățimea unui telefon,
  opt etichete se suprapun, iar la o diagramă atinsă cu degetul eticheta trebuie
  să fie și ea o țintă.
- **Orientarea e cea de pe scaun**, nu dinspre public: fusul și toba mică în
  stânga, cazanul și ride-ul în dreapta. Așa arată setul în orice fotografie de
  magazin și, mai important, așa o să-l vadă elevul când se așază la el.
- **Desenul trebuie să semene cu instrumentul, nu cu o schemă.** Corpuri
  închise la culoare, hardware cromat, cinele de alamă, suprapuneri care dau
  adâncime, ordinea de desenare E adâncimea. Tente pastel pe contururi subțiri
  arată a jucărie, iar un începător care se uită la desen și apoi la un set
  adevărat trebuie să recunoască același obiect. Culorile pieselor rămân, dar pe
  **cercurile de sus**, unde se uită oricum ochiul fiindcă acolo se lovește.
- **Proporțiile ies din diametrele reale** (22" toba mare, 16" cazanul, 14" toba
  mică, 12"-13" tomurile, 14" fusul, 16" crash, 20" ride), la aceeași scară.
  Ghicite, cazanul iese aproape cât toba mare și toba mică arată ca o jucărie.
- **Cinelele primesc contur mai subțire decât tobele.** Sunt elipse foarte
  turtite: la aceeași grosime de linie, conturul acoperă suprafața și culoarea
  piesei înlocuiește alama, fusul ieșea verde-oliv lângă un crash auriu.
- **Redarea pornește în handler-ul de atingere**, sincron. Dintr-un `useEffect`
  de după o schimbare de stare, pe web contextul audio rămâne suspendat și nu se
  aude nimic, fără nicio eroare. Pe telefon n-ar fi vizibil. Vezi
  `lib/drums/theory/use-piece-sound.ts`.
- **Un player pe piesă, încărcat și încălzit la montare**: nu unul singur căruia
  i se schimbă sursa. Cu sursă schimbată, `replace()` face un element media nou
  la fiecare atingere, iar `play()` pică pe `readyState=0`: măsurat, **437 ms**
  la prima atingere a tobei mici, **1075 ms** în altă rulare. Cu playere
  separate, încălzite o clipă fără volum, toate cele opt piese pornesc **sub
  11 ms**. Sub ~30 ms sunetul se simte ca o lovitură; peste ~100 ms se simte ca
  un formular.
- **Desenul se desparte de interacțiune.** `KitDrawing` e desenul curat, cu
  `lit` ca parametru; `KitDiagram` îl înfășoară cu sunet și butoane. Exemplele
  folosesc `KitDrawing`, varianta interactivă ar porni nouă playere sub fiecare
  exemplu deschis.
- **În exemple, aprinderea vine din ceasul pistei** (`plan.hits`), nu din pasul
  grilei: un ornament cade cu 32 ms ÎNAINTEA pasului lui și n-ar aprinde nimic.
  Fereastra e scurtă și fixă (~130 ms), nu legată de tempo, o lovitură de tobă e
  un eveniment, nu un interval. Ținută până la lovitura următoare, la 60 BPM ar
  arăta ca un sunet care se ține, adică exact opusul a ce predă lecția despre
  durată la tobe.
- **Desenul și grila răspund la întrebări diferite** și de asta stau amândouă:
  desenul spune CE piesă sună, grila spune CÂND. Se pune `showKit` doar unde
  prima întrebare chiar e „de unde vine sunetul ăsta?", la o lecție despre
  subdiviziuni, setul nu adaugă nimic și mai ia un ecran de derulat.
- **Socoteala e una singură**, în `lib/drums/sounding.ts`, folosită și de
  manual, și de practică. Pură, deci testată în Node.

### Desenul în ecranul de practică

E pornit la **groove-uri** și la **fill-uri**, oprit la **rudimente**: dar
„pornit" nu mai înseamnă „desenat". `showKit: true` spune *vreau-l dacă încape*,
iar `PracticeScreen` compară înălțimea măsurată a ecranului cu înălțimea
măsurată a desenului și decide singur. Pe un telefon scurt, unde notația abia
intră, desenul cade, notația nu are voie să cadă niciodată.

La rudimente rămâne oprit din alt motiv, care n-are legătură cu spațiul: se bate
oricum totul pe toba mică, deci un desen cu o singură piesă aprinsă tot timpul
n-ar spune nimic.

**De ce e o socoteală, nu un număr scris în cod.** Prima variantă avea cifra în
comentariu: „fill-ul depășește cu 151 px, deci desenul e oprit". Era adevărat
când a fost măsurat. Apoi măsurile identice au început să se strângă în „×2"
(`lib/drums/notation-bars.ts`), s-a desenat un bloc mai puțin, iar cifra a rămas
în cod ca o regulă, deși ecranul avea loc. Remăsurat, pe cel mai înalt fill
(șapte rânduri pe trei măsuri), în timpul sesiunii:

| ecran | fără desen | cu desen |
|---|---|---|
| 375×812 | 0 px | **0 px** |
| 375×667 | **145 px sub ecran** | nu se mai desenează |

La 375×667 fill-ul nu încape nici fără desen, asta e o problemă separată, mai
veche, și n-o rezolvă ascunderea desenului.

**Regula generală:** înainte să adaugi orice deasupra notației într-un ecran de
practică, măsoară depășirea **în timpul sesiunii**, nu în repaus, pe
ScrollView-ul dinăuntru (nu pe `documentElement`; greșeala aia s-a plătit deja o
dată), și pune socoteala în cod, nu cifra. O cifră scrisă în comentariu ține
cât ține layout-ul pe care a fost luată, iar următorul care o citește n-are cum
să știe că a expirat.

Desenul se stinge singur în „Doar metronom" și în numărătoare: planul conține în
continuare loviturile, fiindcă el descrie ce SE CÂNTĂ, nu ce se aude, dar un
desen care arată lovituri pe care urechea nu le primește ar fi tocmai sprijinul
pe care modul ăla îl ia înadins.
- **În date stă numele desenului, nu componentul** (`visual: 'kit'`). Un
  `ReactNode` în curriculum ar trage interfața în date și le-ar face
  imposibil de validat într-un test care rulează în Node.

### Ce face un exemplu bun

Motorul randează orice pattern valid pe kitul real, în orice tempo. Asta e
avantajul pe care o carte nu-l are, **folosește-l la fiecare noțiune care are
un sunet.**

- **Un exemplu demonstrează un singur lucru.** Vrei să arăți cum sună toba mare?
  Doar tobă mare. Un groove întreg mută atenția pe altceva.
- **Tempo mic la lecțiile despre timbru** (60-80 BPM). La 140 asculți ritmul, nu
  piesa.
- **`showGrid: false` când lecția e despre sunet, nu despre scris.** O grilă cu
  un singur rând nu explică nimic și cere o notație pe care elevul încă n-a
  învățat-o.
- **Exemplul final al unei lecții recapitulează**, nu introduce. Dacă adaugi ceva
  nou în ultimul exemplu, e o secțiune care lipsește.

## Terminologia

Aplicația își citează propriile etichete, manualul de la `/suport` le indexează
cu pondere mare, iar un termen inventat într-o lecție strică și căutarea. Deci
**folosește exact etichetele livrate**, nu sinonime mai frumoase.

Cele care se greșesc cel mai des:

| Corect (ro) | NU scrie |
|---|---|
| Tobă mare | bas, bass drum, kick (în text; „kick" doar în paranteză, ca termenul internațional) |
| Tobă mică | snare (idem), caisă |
| Tom de mijloc | tom mediu, tom 2 |
| Tom podea | podea, floor tom |
| **R** și **L** pentru mâini | D și S |

Glosarul complet ro/en, cu ce înseamnă fiecare și cum se introduce prima oară:
**`references/terminologie.md`**. Citește-l înainte să scrii orice text care
numește piese sau tehnici.

## Formatul de date

Lecțiile sunt date pure, în `src/drums/theory/`, scrise o dată în ro **și** en.
Exemplele sunt exerciții adevărate, validate.

Formatul întreg, cu regulile de validare și un exemplu lucrat:
**`references/format-date.md`**. Citește-l înainte să scrii primul fișier de
lecție, mai ales secțiunea despre regula de 90 ms între două lovituri ale
aceleiași mâini, care respinge exerciții care par bune.

Conținutul de practică (rudimente, groove-uri, fill-uri) stă în `src/drums/` și
are același format; ce diferă e ce se citește, la rudimente contează **mâna**,
la groove-uri contează **ce piesă** se lovește și cum se așază piesele una peste
alta.

## Curriculumul

Cele opt etape, ce presupune fiecare și de ce sunt în ordinea asta:
**`references/curriculum.md`**. Consultă-l când adaugi o lecție, ca să nu cadă în
etapa greșită sau să presupună ceva ce nu s-a predat încă.

Pe scurt: *Instrumentul · Notația · Mâinile · Groove-ul · Forma · Stiluri ·
Avansat · Muzician.*

## Ce greșește un începător

Un manual care doar descrie corect e un manual mediocru. Ce transformă o lecție
e să numești greșeala pe care elevul chiar o face, pentru că atunci se
recunoaște în ea.

Greșelile tipice, pe noțiune, și cum se formulează fără să descurajeze:
**`references/greseli-de-incepator.md`**.

## Greșeli de evitat când scrii

**Textul și exemplul care se contrazic.** Asta s-a întâmplat deja, în chiar prima
lecție scrisă: textul spunea „toba mică pocnește pe 2 și 4", iar grila o arăta pe
timpul 3, fiindcă exemplul fusese copiat dintr-un groove unde așa era. Niciun
test nu prinde asta, `validateExercise` verifică structura, nu dacă proza de
deasupra descrie aceeași măsură.

Deci, pentru **fiecare** exemplu, numără pașii cu mâna:

```
8 pași pe măsură, 4 timpi  ->  2 pași pe timp
pas:    0  1  2  3  4  5  6  7
timp:   1  &  2  &  3  &  4  &
'..X...X.'  =  pașii 2 și 6  =  timpii 2 și 4   ✓ backbeat
'....X...'  =  pasul 4       =  timpul 3        ✗ nu e backbeat
```

Și, dacă se poate, **deschide lecția în browser** (`cd D:\MusicLab; npx expo
start --web --port 8085`) și uită-te la grilă. Sandbox-ul există exact pentru
asta.

**Alte capcane:**

- **Copiat dintr-un exercițiu de practică fără să verifici ce predă.** Fișierele
  din `src/drums/` sunt scrise pentru altceva; un `id` reutilizat sau un pattern
  care ilustrează altă noțiune trece de compilator.
- **Text englezesc care e traducere, nu original.** Engleza e a doua sursă, nu o
  traducere mot-à-mot. „Toba mică pocnește" nu devine „the snare cracks" pentru
  că așa zice dicționarul, ci pentru că un toboșar englez chiar spune așa.
- **Promisiuni pe care aplicația nu le ține.** Vezi prima secțiune.
- **Lecții blocate.** Nimic nu se blochează (`LOCK_EXERCISES = false`). Harta
  recomandă un drum, nu-l impune, cine știe deja notația sare peste Etapa 1.

## Porțile, înainte să spui că ai terminat

```bash
cd D:\MusicLab
npx tsc --noEmit
npx vitest run
npx expo lint
```

În aplicație (`MusicPal-main/MusicPal/mobile`) sunt `npx tsc --noEmit` și
`npx vitest run`, plus regula din `CLAUDE.md`: **orice schimbare observabilă de
utilizator cere o trecere prin `lib/support/manual-content.ts`** și, dacă apar
formulări noi după care ar căuta cineva, prin `docs/help/query-aliases.json`.

Fișierele se mută între cele două repo-uri **cu un `cp`, fără traduceri de căi**
- importurile sunt pe alias (`@/lib/drums/*`, `@/components/drums/*`), care
rezolvă în amândouă. Dacă ai scris ceva într-unul, sincronizează-l în celălalt și
verifică cu `diff` că au rămas identice.

## Surse

De unde vine ce, și ce se poate cita: **`references/surse.md`**.

Regula: din materiale protejate prin drept de autor se preiau **structura
pedagogică, ordinea noțiunilor și terminologia standard**: niciodată text,
exerciții sau notație reprodusă. Tot ce ajunge în lecții e scris de la zero.
