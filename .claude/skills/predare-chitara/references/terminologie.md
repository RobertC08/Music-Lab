# Terminologie

Termenii standard ai chitarei, convențiile de notație și cum se introduce un
termen prima oară.

Regula de sub tot, ca la tobe: **aplicația își citează propriile etichete**,
iar manualul de la `/suport` le indexează. Un sinonim inventat într-o lecție
strică și căutarea.

**Stadiul:** singurele etichete livrate pentru chitară sunt cele ale bibliotecii
de acorduri (`i18n.ts`, cheile `guitar.*`). Tabelele de mai jos sunt **propunerea** de etichete. Când se
scriu cheile în `i18n.ts`, ele devin sursa de adevăr și fișierul ăsta se aduce
la zi după ele. Termenii marcați cu **(de confirmat)** sunt cei unde uzul
românesc variază și decizia e a lui Robert, cum a fost „Fus" la tobe.

## Cum se introduce un termen prima oară

Numele românesc, apoi cel internațional în paranteză, o singură dată, în
lecția care îl predă:

> Pana (pick, plectrum) e bucata mică de plastic cu care lovești corzile.

După aceea, doar numele românesc. Termenul internațional apare totuși o dată,
fiindcă orice tabulatură, tutorial sau discuție cu alt chitarist îl folosește.
Unde chitariștii români spun chiar termenul englezesc (bend, slide, riff,
palm mute), acela e eticheta, cu o explicație în română la prima apariție.

## Părțile chitarei

| Română (propus) | Engleză | Note |
|---|---|---|
| Corp | Body | la acustică: **cutia de rezonanță** |
| Gât | Neck | |
| Cap | Headstock | |
| Chei (de acordaj) | Tuners, tuning pegs | |
| Prag **(de confirmat)** | Nut | piesa de la capătul gâtului peste care trec corzile; alternativă întâlnită: „căluș superior" |
| Grif **(de confirmat)** | Fretboard, fingerboard | alternativă: „tastieră" |
| Tastă | Fret (locul) | „tasta 3" = locul unde apeși, între două prăguțe |
| Prăguț **(de confirmat)** | Fret (bara de metal) | apare doar când trebuie spus unde exact apeși: „chiar în spatele prăguțului" |
| Căluș **(de confirmat)** | Bridge / saddle | la acustică, strict: cordarul (bridge) și călușul (saddle); în text de începător, „căluș" ajunge |
| Rozetă, gura cutiei | Soundhole | doar acustică |
| Doze | Pickups | doar electrică |
| Selectorul de doze | Pickup selector | doar electrică |
| Butoanele de volum și ton | Volume / tone knobs | doar electrică; „potențiometre" e prea tehnic pentru lecție |
| Mufa | Output jack | doar electrică |
| Pârghia de tremolo | Whammy bar, tremolo arm | doar electrică; atenție, pe chitară „tremolo" numește greșit, istoric, un vibrato |
| Pană | Pick, plectrum | |
| Capodastru | Capo | |
| Curea | Strap | |

## Coardele

| Coarda | Nota goală | Solfegiu | MIDI | Cum i se spune |
|---|---|---|---|---|
| 1 | E4 | Mi | 64 | **Mi subțire** |
| 2 | B3 | Si | 59 | |
| 3 | G3 | Sol | 55 | |
| 4 | D3 | Re | 50 | |
| 5 | A2 | La | 45 | |
| 6 | E2 | Mi | 40 | **Mi gros** |

Acordajul standard. Nota unei poziții = nota corzii goale + numărul tastei, în
semitonuri (MIDI). **Se calculează, nu se scrie în date.**

Reguli de scris:

- **Coardele se numesc după număr** („coarda 3") sau după notă („coarda Sol"),
  niciodată „de sus" / „de jos". Coarda 1 e **jos fizic** (cea mai aproape de
  podea, cum ții chitara) dar **sus pe tabulatură**; „sus" și „jos" înseamnă
  lucruri opuse după ce te uiți, deci nu se folosesc.
- **„Subțire" și „gros"** sunt sigure: nu depind de unde privești.
- **„Înalt" și „grav"** se referă la sunet, nu la poziție: coarda 1 e cea mai
  înaltă ca sunet.

## Degetele

| Mâna | Notație | Degete |
|---|---|---|
| Mâna care apasă | **1 2 3 4** | 1 arătătorul, 2 mijlociul, 3 inelarul, 4 degetul mic. Degetul mare: T, rar |
| Mâna care ciupește | **p i m a** | p degetul mare (pulgar), i arătătorul (índice), m mijlociul (medio), a inelarul (anular); c degetul mic, foarte rar |

**p-i-m-a nu se traduc.** Sunt literele din spaniolă folosite de toate metodele
de chitară clasică și fingerstyle; un elev care învață altele nu poate citi
nimic din afara aplicației. Se explică o dată de unde vin.

**„Mâna care apasă" și „mâna care ciupește"**, niciodată „stânga" și
„dreapta": textul trebuie să fie corect și pentru stângaci (vezi SKILL.md).
Când e nevoie de un nume scurt într-o etichetă de interfață: „Apasă" /
„Ciupește". **(de confirmat)**: „mâna care ciupește" sună bine la fingerpicking;
la strumming cu pana s-ar putea prefera „mâna care lovește". Ce se alege se
folosește peste tot.

## Notele și acordurile

**Simbolurile de acorduri sunt internaționale** și nu se traduc: `Am`, `C`,
`G7`, `F#m`, `Bb`. Sunt ce scrie pe orice caiet de cântece, în orice
tabulatură, inclusiv în cele românești.

**Notele, în proza românească, se numesc în solfegiu**: Do, Re, Mi, Fa, Sol,
La, Si; cu diez (♯) și bemol (♭). E convenția deja folosită în manualul de tobe
(„Basul cântă Re pe «unu»…"). La prima apariție într-o lecție, cu litera:

> Coarda 5 e La (A).

| Literă | C | D | E | F | G | A | B |
|---|---|---|---|---|---|---|---|
| Solfegiu | Do | Re | Mi | Fa | Sol | La | Si |

**Etichetele pe desene** (gâtul, diagrama) **(de confirmat)**: litere, ca pe
rândul de bas din tobe (`bass.ts` scrie `C`, `C♯`) și ca simbolurile de
acorduri lângă care stau. Lecția de notație (Etapa 1) trebuie să predea
corespondența explicit, fiindcă elevul român le întâlnește pe amândouă.

Cum se citesc simbolurile, în text:

| Simbol | Se citește | Ce e |
|---|---|---|
| `C` | Do major | trison major |
| `Cm` | Do minor | trison minor |
| `C7` | Do șapte | major cu septimă mică (septimă de dominantă) |
| `Cmaj7` | Do major șapte | major cu septimă mare |
| `Cm7` | Do minor șapte | minor cu septimă mică |
| `C5` | Do cinci, power chord | doar tonica și cvinta, fără terță: nici major, nici minor |
| `Csus2` / `Csus4` | Do sus doi / sus patru | terța înlocuită cu secunda / cvarta |
| `Cadd9` | Do add nouă | major cu nona adăugată |
| `C6` | Do șase | major cu sexta adăugată |
| `C/G` | Do cu Sol în bas | acord cu altă notă decât tonica în bas (slash chord) |

În programele LCM, `Maj7` apare cu M mare (`AMaj7`); în aplicație folosim
`maj7`, forma cea mai răspândită. Una singură, peste tot.

**Atenție la `B` și `H`.** În notația germană (și în unele cărți vechi din
Europa Centrală) `H` e Si și `B` e Si bemol. În aplicație, `B` = Si, ca în
engleză și în toate sursele citite.

## Diagrama de acord (fretbox)

Convenția din toate sursele citite (LCM, Werner, Wikibooks):

- **Liniile verticale sunt coardele**, coarda 6 **în stânga**, coarda 1 în
  dreapta.
- **Liniile orizontale sunt prăguțele.** Linia groasă de sus e pragul, când
  acordul e lângă capul chitarei; altfel, numărul tastei de start („5fr").
- **Punctele** arată unde apeși; **numărul din punct** sau de sub diagramă e
  degetul.
- **`o`** deasupra unei corzi = coardă goală, se cântă. **`x`** = coardă care
  nu se cântă.
- **Barré-ul** e un arc sau o bară peste mai multe coarde, cu un singur deget.

Cu comutatorul „Diagrame oglindite (pentru stângaci)" pornit, se oglindește:
coarda 6 în dreapta. Implicit e oprit; vezi SKILL.md, „Stângacii".

## Tabulatura

- **Șase linii, coarda 1 (Mi subțire) e linia de sus**, coarda 6 linia de jos.
  E opusul diagramei de acord ca orientare și e normal: tab-ul e gâtul văzut de
  chitaristul care se uită în jos peste el.
- **Numerele sunt taste**, nu degete. `0` = coardă goală.
- **Tabulatura simplă nu are ritm.** Toate sursele o spun; în aplicație, tab-ul
  stă mereu lângă grila de ritm sau portativ și lângă un exemplu de ascultat.
- **Nu se oglindește niciodată**, nici cu comutatorul pentru stângaci pornit.

Semnele tehnice, fiecare introdus în lecția tehnicii lui:

| Semn | Ce înseamnă |
|---|---|
| `x` | notă amortizată, fără înălțime (percuție) |
| `h` | hammer-on: `5h7` |
| `p` | pull-off: `7p5` |
| `/` `\` | slide în sus / în jos: `5/7` |
| `b` | bend: `7b9` (bend până la sunetul tastei 9), sau `7b` cu „full" / „½" |
| `r` | release, eliberarea bend-ului |
| `~` | vibrato |
| `PM ----` | palm mute pe durata liniei |
| `<12>` | armonică naturală la tasta 12 |

## Ritmul mâinii care ciupește

| Semn | Română | Ce e |
|---|---|---|
| ↓ (`D` în date) | în jos | spre podea, de la coarda 6 spre coarda 1 |
| ↑ (`U` în date) | în sus | de la coarda 1 spre coarda 6 |
| · (`.` în date) | ratat | mâna face mișcarea, dar nu atinge corzile |
| ✕ (`x` în date) | „chuck", lovitură amortizată | corzile lovite dar amortizate; sunet percutant, fără notă |

„În jos" e definit după mișcare, nu după cum arată pe ecran. **Strumming**
rămâne strumming, cu explicația „loviturile peste corzi cu pana sau cu
degetele" **(de confirmat)**: alternativă românească întâlnită, „ritm" sau
„acompaniament", dar ambele au alt sens în aplicație (Ritm e un modul).

## Tehnici

| Termen (etichetă) | Ce înseamnă, pe scurt | Instrument |
|---|---|---|
| Barré | un deget apasă mai multe corzi deodată, de obicei toate șase | ambele; mai greu pe acustică |
| Semi-barré | barré pe 2-4 corzi | ambele |
| Power chord | tonica + cvinta (± octava), fără terță | ambele; centrul rock-ului pe electrică |
| Riff | o frază scurtă care se repetă și ține piesa | ambele |
| Arpegiu | notele unui acord cântate pe rând | ambele |
| Fingerpicking | mâna care ciupește cu degetele, după un model (p-i-m-a) | mai ales acustică |
| Fingerstyle | stilul în care chitara cântă singură bas, acorduri și melodie | mai ales acustică |
| Pana alternativă (alternate picking) | jos-sus-jos-sus, strict, pe note | ambele |
| Hammer-on | nota se face lovind coarda cu degetul mâinii care apasă, fără să o ciupești din nou | ambele |
| Pull-off | nota se face trăgând degetul de pe coardă, ca să ciupească nota de dedesubt | ambele |
| **Legato** | hammer-on și pull-off, ca familie | ambele |
| Slide | degetul alunecă pe coardă de la o tastă la alta, cu nota sunând | ambele |
| Bend | împingi coarda lateral, ca să urce sunetul până la o notă-țintă | **mai ales electrică** |
| Vibrato | ondulația înălțimii unei note ținute | ambele; larg, mai ales pe electrică |
| Palm mute | podul palmei mâinii care ciupește atinge corzile lângă căluș; sunet scurt, înfundat | ambele; sunet foarte diferit |
| Armonice | sunete de clopoțel, coarda atinsă (nu apăsată) în anumite puncte | ambele |
| Tapping | note făcute cu mâna care ciupește, pe grif | mai ales electrică |

**Coliziune cu modulul Ritm: „legato".** Lecția de Ritm `legato` e despre
**legătura de prelungire** (două note legate devin una). La chitară, legato
înseamnă hammer-on/pull-off. În textele de chitară, „legato" apare **doar** cu
explicația „(hammer-on și pull-off)", iar legătura de prelungire se numește
„legătură de prelungire" și trimite la Ritm.

## Modurile

**Dorian, mixolidian, frigian, lidian, ionian, eolian, locrian** (decizie a lui
Robert, 2026-10-05), nu formele academice „doric", „mixolidic", „frigic",
„lidic". „Modul dorian", „La dorian".

## Intervalele ca forme pe gât

În acordajul standard, intervalele au forme fixe, **cu o singură excepție:
perechea de coarde 3-2** (Sol-Si), acordată la terță mare în loc de cvartă.
Orice formă care trece peste perechea asta se lungește cu o tastă.

| Interval | Forma | Peste perechea 3-2 |
|---|---|---|
| Cvarta | coarda următoare, aceeași tastă | o tastă mai sus |
| Cvinta (power chord) | coarda următoare, două taste mai sus | trei taste mai sus |
| Terța mare | coarda următoare, o tastă înapoi | aceeași tastă |
| Octava | două coarde mai sus, două taste mai sus | trei taste mai sus |

„Coarda următoare" = spre coarda 1. Exemplu verificat: coarda 6 tasta 5 (La),
coarda 4 tasta 7 (La), octavă.

Excepția e motivul pentru care formele de acord și de gamă „se strâmbă" pe
corzile 2 și 1. Merită spusă în lecția despre intervale: altfel elevul crede
că a memorat greșit.

## Ce se spune despre acordaj

> Fiecare coardă goală e cu cinci semitonuri peste cea de dedesubt, adică
> tasta 5 de pe o coardă sună ca următoarea coardă goală. Cu o excepție: Sol
> și Si sunt la patru semitonuri, deci acolo e tasta 4.

E baza acordajului relativ și a tabelului de mai sus, deci se spune o dată, în
Etapa 0, și se trimite la ea.
