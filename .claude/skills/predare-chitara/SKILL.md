---
name: predare-chitara
description: >-
  Expert în predarea chitarei (acustică și electrică) pentru MusicLab și
  ToneTrack: scrie lecții de manual, exerciții pentru însoțitorul de practică
  (acorduri, strumming, tehnică, fingerpicking, riff-uri, progresii), quiz-uri,
  și răspunde la întrebări despre pedagogia instrumentului. Folosește-l ori de
  câte ori apare chitara în orice formă: o lecție nouă, un acord sau un model de
  strumming de adăugat în date, o tabulatură sau o diagramă de acord de citit ori
  de desenat, o întrebare de tipul „cum explic barré-ul / palm mute-ul /
  pentatonica", armonia pentru chitariști (intervale, acorduri dintr-o
  tonalitate, progresii), varianta pentru stângaci, un text din aplicație despre
  chitară de corectat. Folosește-l și când cererea nu spune „chitară" explicit,
  dar atinge acorduri (Am, C, G7, power chord, barré), tab, fretbox, pană,
  capodastru, strumming, fingerpicking, p-i-m-a, riff, bend, hammer-on,
  pull-off, slide, vibrato, palm mute, pentatonică, blues de 12 măsuri sau CAGED.
---

# Predarea chitarei

Skill pentru conținutul de chitară din MusicLab (sandbox-ul, repo-ul ăsta) și
ToneTrack (aplicația mare). E construit pe tiparul `predare-tobe` și pornește
de la aceleași decizii de produs: manual pe etape cu quiz-uri, însoțitor de
practică, harta pe niveluri cu totul deschis, verde doar cu quiz-ul trecut.

**Stadiul (2026-10-05):** există **biblioteca de acorduri** (`src/guitar/`,
`src/components/guitar/`), cu date, validare, diagramă și sunet; e descrisă în
`references/format-date.md`, secțiunea „Ce există". Restul formatului (lecții,
strumming, tabulatură, fingerpicking) e încă o **propunere**, derivată din
formatul de tobe; se rescrie după ce se construiește, iar propunerea nu se
citează ca regulă.

Rostul skill-ului nu e să știi chitară. E să **predai** chitară într-o
aplicație care nu aude elevul, în două limbi, pentru două instrumente
(acustică și electrică) și pentru ambele mâini (dreptaci și stângaci).

## Regula de sub tot restul: măsori doar ce poți măsura

Aplicația **nu aude** chitara în fluxul de practică. ToneTrack are un acordor
cu microfon, dar el ascultă o singură notă ca să te ajute să acordezi; nu
judecă acorduri, ritm sau execuție, și nu se preface că o face.

| | Practică (Acorduri, Strumming, Tehnică, Fingerpicking, Progresii) | Manual |
|---|---|---|
| Ce face elevul | cântă pe chitara lui, cu aplicația ținând timpul | citește, ascultă, răspunde |
| Se punctează? | **niciodată** | da, dar doar înțelegerea |
| Ce se salvează | că ai dus sesiunea până la capăt, și la ce tempo | lecția citită, quiz-ul trecut |

Un quiz **are** voie să dea scor: aplicația chiar poate judeca dacă ai
recunoscut un acord minor după ureche, dacă ai citit corect o tabulatură, dacă
ai atins pe gâtul desenat notele unei pentatonice sau dacă ai completat grila
de strumming a ce ai auzit. Atingerea pe ecran e verificabilă. Execuția pe
instrument nu.

În text, asta se vede în formulări. **Nu scrie** „aplicația verifică dacă
acordul sună curat", „te corectăm", „vei stăpâni barré-ul". **Scrie** ce e
adevărat: aplicația ține timpul, arată diagrama și tabulatura, cântă
demonstrația, numără schimbările.

Și o consecință specifică chitarei: elevul e singurul care poate auzi dacă o
coardă e înfundată sau zbârnâie. Deci lecțiile **îi dau criteriul de
ascultare** („ciupește fiecare coardă a acordului pe rând; fiecare trebuie să
sune, nu să bufnească"), pentru că nimeni altcineva nu-l va verifica.

## Granițele cu alte module

**Ritmul predă timpul. Chitara predă instrumentul, limbajul lui și cât îi
trebuie din armonie.**

- **Ritm** (18 lecții): puls, măsură, valori, contratimp, sincopă, triolete,
  2/4, 3/4, 6/8, poliritm. Când o lecție de chitară are nevoie de una, o
  **trimite** acolo (`requiresRhythmLesson`), nu o repetă. Id-urile sunt în
  `src/curriculum/rhythm.ts`. Testul: *„ar avea nevoie de asta și un pianist?"*
  Dacă da, e lecție de Ritm.
- **Tobe**: nu se suprapune, dar se **folosește**. Groove-urile și liniile de
  bas din `src/drums/` sunt acompaniamentul natural pentru progresii și
  strumming. O progresie cântată peste un groove adevărat predă mai mult decât
  peste un metronom.
- **Armonia** stă **în manualul de chitară**, nu într-un modul separat
  (decizie de produs, 2026-10-02), și e „un pic": doar cât îi trebuie unui
  chitarist, mereu arătată pe gâtul chitarei. Testul pentru o lecție de
  armonie: *se termină cu ceva ce elevul poate cânta sau recunoaște pe
  chitară?* Dacă nu, e teorie de manual de conservator și nu intră. Detalii în
  `references/curriculum.md`, Etapa „Armonia".
- **Acordorul** există deja în ToneTrack; nu se construiește. Lecția despre
  acordaj trimite la el, în text.

## Două instrumente, un singur conținut

Conținutul e **comun** pentru acustică și electrică. Nu există două manuale și
nu se ascunde nimic după tipul de chitară. Ce diferă se spune printr-o
**notiță de adaptare**, pe lecția sau secțiunea unde contează:

- **bend-urile și vibrato-ul larg**: firești pe electrică (corzi subțiri), grele
  pe acustică; pe acustică se încearcă bend-uri de un semiton, pe corzile 1-3;
- **palm mute**: pe amândouă, dar sună foarte diferit; pe electrică cu
  distorsiune e sunetul de bază al rock-ului;
- **fingerstyle și fingerpicking**: mai firești pe acustică, posibile pe
  electrică;
- **barré-ul**: mai greu pe acustică (corzi mai groase, acțiune mai mare).
  Programele LCM îl cer la Grade 3 la electrică și abia la Grade 5 la acustică,
  vezi `references/curriculum.md`.

Datele poartă instrumentul: `ambele` (implicit), `mai ales electrică`, `mai
ales acustică`, plus textul notiței. E o etichetă și o explicație, **nu un
filtru**.

## Stângacii

Nu există un „mod pentru stângaci". Există **un singur comutator**, **„Diagrame
oglindite (pentru stângaci)", oprit implicit** (decizie de produs, 2026-10-05).

De ce opțional și nu automat pentru orice stângaci: ambele convenții sunt
folosite. Diagrama oglindită arată gâtul cum îl vede stângaciul (coarda 6 în
dreapta); dicționarele de acorduri pentru stângaci o folosesc. Dar aproape tot
materialul din afara aplicației (caiete, site-uri de tabulaturi, tutoriale) e
în diagrama standard, iar mulți stângaci preferă să citească la fel ca toată
lumea. Alegerea e a elevului.

Comutatorul schimbă **doar desenele**, toate deodată (o diagramă oglindită lângă
un gât neoglindit ar fi mai rău decât oricare variantă). Datele se scriu mereu
în coordonate de instrument: coarda (1-6) și tasta (0-24).

| Comutatorul oglindește | Nu se oglindește niciodată |
|---|---|
| diagramele de acorduri, gâtul desenat, desenul chitarei | **tabulatura** (coarda 1, Mi subțire, e mereu linia de sus) |
| | numerotarea coardelor și a degetelor |
| | simbolurile de acorduri, portativul |

În afara aplicației rămâne stângaciul care cântă pe o chitară de dreptaci
întoarsă, fără să schimbe corzile (coarda 1 sus): la el formele de acord sunt
altele, nu oglindite. Nu-l acoperim.

În text: **„mâna care apasă"** și **„mâna care ciupește"**, nu „stânga" și
„dreapta". Așa fiecare propoziție e corectă pentru oricine. Excepție: în
terminologia internațională (p-i-m-a, „fretting hand", „picking hand") nu se
schimbă nimic, fiindcă deja nu depinde de mână.

## Cum se construiește o lecție

Ca la tobe. Ordinea contează:

1. **Ce predă lecția, într-o propoziție.** Dacă nu încape, sunt două lecții.
   Propoziția e `goal`.
2. **Ce presupune.** Lecție de Ritm → `requiresRhythmLesson`. Lecție de chitară
   anterioară → stă după ea în fișier; ordinea din fișier e ordinea de pe hartă.
3. **Secțiunile ca un drum, nu ca o listă.** 5-8 secțiuni, fiecare introduce
   **un** lucru și, unde se poate, îl face auzibil și vizibil.
4. **Exemplul înaintea textului** care îl descrie, sau verificați unul pe
   altul. Vezi „Greșeli de evitat".
5. **Termenii** pe secțiunea care îi introduce (`terms`).
6. **Notița de instrument**, dacă lecția atinge ceva din lista de mai sus.
7. **Porțile.**

### Ce face un exemplu bun la chitară

- **Un exemplu, un lucru.** Lecția despre acordul de Mi minor nu are nevoie de
  un model de strumming sincopat: un singur acord, ciupit coardă cu coardă,
  apoi lovit o dată.
- **Arată unde, apoi când.** Diagrama sau gâtul răspund *unde pui degetele*;
  tabulatura și grila de strumming răspund *ce și când cânți*. Ca desenul
  setului și grila la tobe: răspund la întrebări diferite, deci stau împreună
  doar unde amândouă întrebările chiar se pun.
- **Acordul se aude întâi arpegiat, apoi lovit.** Arpegiat, elevul aude fiecare
  coardă și are criteriul pentru propriul acord; lovit, aude cum trebuie să
  sune întreg.
- **Tempo mic** (60-80 BPM) la lecțiile despre sunet și la primele schimbări de
  acord. La tempo mare, elevul ascultă ritmul, nu acordul.
- **Exemplul final recapitulează**, nu introduce nimic nou.
- **Acompaniamentul vine din modulul de tobe** când ajută: o progresie peste un
  groove și un bas sună a muzică; peste un metronom, a exercițiu.

### Reperul vizual

O lecție care numește părți ale chitarei sau locuri pe gât are nevoie de un
desen atingibil, nu de o descriere în cuvinte. Regulile câștigate la tobe
(`predare-tobe`, secțiunea „Reperul vizual") se aplică la fel: desenat, nu
fotografiat; desenul e exercițiul; seamănă cu instrumentul, nu cu o schemă;
proporțiile din dimensiunile reale; numele sub desen, ca butoane; redarea
pornește sincron în handler-ul de atingere; un player per sunet, încălzit la
montare. Specific chitarei:

- **Orientarea gâtului** e cea din ochii chitaristului care se uită în jos la
  instrument: coarda 6 (Mi gros) **jos pe diagrama orizontală a gâtului** e
  convenția tabulaturii; pe **diagrama de acord (verticală)**, coarda 6 e **în
  stânga**. Ambele sunt convenții universale (vezi `references/terminologie.md`)
  și nu se „corectează" una după alta.
- **Comutatorul „Diagrame oglindite"** oglindește diagramele, gâtul și desenul
  chitarei, nu tabulatura. Implicit e oprit.
- **Desenul are două variante, acustică și electrică.** Lecția despre părțile
  chitarei le arată pe amândouă; restul manualului nu depinde de ele.

## Sunetul

Chitara nu cere mostre: coarda ciupită se sintetizează bine cu **Karplus-Strong**
(un zgomot scurt trecut printr-o linie de întârziere cu filtru), în stilul
basului din `src/drums/bass.ts`. Două timbruri: „acustic" și „electric curat".
Distorsiunea nu e necesară pentru predare.

Un acord lovit nu e șase note simultane: **pana trece peste corzi**, de la 6 la 1
în jos și de la 1 la 6 în sus, cu câteva milisecunde între ele. Distanța asta e
un **gest, nu o subdiviziune**, exact ca flam-ul la tobe: rămâne aceeași în
milisecunde la orice tempo. Fără ea, strumming-ul sună a orgă.

## Terminologia

Aplicația își citează propriile etichete, iar manualul de la `/suport` le
indexează; un sinonim inventat strică și căutarea. **Folosește exact termenii
din `references/terminologie.md`** și citește-l înainte să scrii orice text
care numește părți ale chitarei, coarde, degete, acorduri sau tehnici.

Cele care se greșesc cel mai des:

| Corect | NU scrie |
|---|---|
| **coarda 1** = Mi subțire (cea mai apropiată de podea) | „prima coardă" fără număr; „coarda de sus" (sus pe tab, jos fizic) |
| **tasta 3** (locul dintre prăguțe) | „fretul 3", „prăguțul 3" |
| **simboluri internaționale** pentru acorduri: `Am`, `C`, `G7`, `F#m` | „La m", „Do maj" ca simbol |
| **solfegiu** pentru note în proza românească: Do, Re, Mi, cu litera la prima apariție | litere în proza românească, „nota E" |
| **legato** = hammer-on / pull-off (tehnică) | „legato" pentru legătura de prelungire (aia e lecția de Ritm) |

## Formatul de date

**Propunere**, până există cod: `references/format-date.md`. Ideea de bază,
luată de la tobe: conținutul e date pure, scrise o dată în ro și en,
exemplele sunt exerciții adevărate, validate într-un test care rulează în Node.
Specific chitarei: coordonate de instrument (coardă, tastă), formele de acord
ca șiruri de la coarda 6 la 1 (`x32010`), grila de strumming cu ↓/↑ și lovituri
ratate, și validarea a ce poate face o mână (câte degete, câte taste
deschidere).

## Curriculumul

Etapele, ce presupune fiecare, de ce sunt în ordinea asta și cum se leagă de
nivelurile din programele LCM și Trinity: **`references/curriculum.md`**. E și
planul conținutului, cât timp nu există un `PLAN-TEORIE-CHITARA.md`.

Pe scurt: *Instrumentul · Notația · Primele acorduri · Ritmul · Gâtul chitarei ·
Armonia · Tehnici · Stiluri · Muzician.*

## Ce greșește un începător

Greșelile tipice, pe noțiune, și cum se formulează fără să descurajeze:
**`references/greseli-de-incepator.md`**. Două pe lecție, în secțiunea care
predă noțiunea, nu o listă la final.

Regula de formulare, ca la tobe: **descrie greșeala, nu pe cel care o face.**
La chitară contează dublu, fiindcă primele săptămâni dor la propriu (vârfurile
degetelor) și cel mai des renunță oamenii la acordul de Fa. Textul trebuie să
spună ce e normal, ce nu e normal (durerea de încheietură) și ce se face în
schimb.

## Greșeli de evitat când scrii

**Textul și exemplul care se contrazic.** La tobe s-a întâmplat în prima
lecție. La chitară, capcanele sunt:

- **Direcția coardelor.** Coarda 6 e cea **groasă**, jos în tabulatură, în
  stânga pe diagrama de acord. Un text care spune „coarda de sus" și un
  exemplu care arată linia de sus a tab-ului vorbesc de coarde diferite.
- **Forma de acord citită invers.** `x32010` se citește de la coarda 6 la
  coarda 1. Do major e `x32010`; citit invers, iese un acord care nu există.
  Verifică fiecare formă cu notele ei (vezi `format-date.md`, „Verificarea
  unui acord").
- **Grila de strumming numărată greșit.** Ca la tobe: numără pașii cu mâna.

```
8 pași pe măsură, 4 timpi -> 2 pași pe timp
pas:    0  1  2  3  4  5  6  7
timp:   1  &  2  &  3  &  4  &
mâna:   ↓  ↑  ↓  ↑  ↓  ↑  ↓  ↑    mișcarea, mereu aceeași
model: 'D.DU.UDU'                 ↓ · ↓↑ · ↑↓↑   (modelul folk clasic)
```

Pe pașii pari mâna coboară, pe cei impari urcă, **și când nu atinge corzile**.
Un `U` pe pas par sau un `D` pe pas impar e aproape sigur o greșeală de scris.

**Alte capcane:**

- **Promisiuni pe care aplicația nu le ține.** Vezi prima secțiune.
- **Un singur instrument în minte.** Citește textul o dată ca acustician și o
  dată ca electric: are sens pentru amândoi? Dacă nu, e nevoie de notiță.
- **Un singur fel de mână în minte.** „Stânga" și „dreapta" nu apar în text.
- **Teorie fără gât.** O lecție de armonie care nu arată nimic pe chitară e
  scrisă pentru alt modul.
- **Text englezesc care e traducere.** Engleza e a doua sursă: „ciupește" nu
  devine „pinch", ci „pick" sau „pluck", după context.
- **Lecții blocate.** Nimic nu se blochează; harta recomandă un drum.

## Porțile, înainte să spui că ai terminat

```bash
npx tsc --noEmit
npx vitest run
npx expo lint
```

Plus verificarea vizuală în sandbox (`npx expo start --web`): diagrama arată ce
spune textul, tabulatura are coardele în ordinea bună, exemplul chiar se aude,
lecția încape la 375×812, iar cu comutatorul „Diagrame oglindite" pornit, diagramele și gâtul se oglindesc și
tabulatura nu.

În ToneTrack se aplică aceleași reguli ca la tobe: trecere prin
`lib/support/manual-content.ts` la orice schimbare vizibilă, alias-uri de
căutare noi în `docs/help/query-aliases.json`, fișiere mutate cu `cp` pe alias
(`@/lib/guitar/*`, `@/components/guitar/*`) și verificate cu `diff`.

## Surse

De unde vine ce, ce licență are și ce se poate prelua:
**`references/surse.md`**. Fișierele sunt în `~/music-lab/surse-chitara/`, în
afara repo-ului.

Regula: din materialele protejate se preiau **fapte, ordinea noțiunilor și
terminologia standard**, niciodată text, exerciții sau notație. Atenție și la
cele libere: CC BY-SA (Wikibooks, Open Music Theory) cere ca un text adaptat să
fie publicat sub aceeași licență, deci în practică și din ele se iau doar
fapte. Singura sursă de exerciții care se poate prelua direct e Giuliani Op. 1
(domeniu public, ediția în tabulatură de pe IMSLP e CC0).
