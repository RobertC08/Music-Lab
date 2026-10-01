import type { Bar, GraceNote, Hit, Stick } from './exercise'

/*
  O măsură de tobă mică scrisă ca șiruri paralele, un caracter pe pas.

  Scrisă așa tocmai ca să se poată citi ca o partitură: mâinile deasupra,
  accentele dedesubt, ornamentele la fel. Greșelile de tipar se văd cu ochiul
  (șirurile nu se mai aliniază), iar cele care nu se văd le prinde validarea.

  Stă într-un fișier al ei fiindcă o folosesc și rudimentele (`rudiments.ts`),
  și manualul (`theory/bars.ts`): la etapa „Mâinile" fiecare exemplu E un
  sticking, iar o a doua copie a funcției ar fi însemnat două convenții de
  scriere a aceluiași lucru, care se depărtează una de alta la prima adăugire.

  Convenția, pentru `theoryBar` din manual, e alta și rămâne alta: acolo se
  scrie CE piesă se lovește, aici CU CE mână. Sunt întrebări diferite, nu două
  forme ale aceleiași.
*/

/**
 *   sticking: 'RLRRLRLL'   R / L = lovitură, '.' = pauză
 *   accents:  'x...x...'   x = accent
 *   ghosts:   '.oo.'       o = ghost note
 *   grace:    'f...d...'   f = flam (o grație), d = drag (două)
 *
 * Accentul și ghost note-ul se exclud: sunt două trepte ale aceleiași lovituri,
 * nu două marcaje care se adună. Când un pas e marcat în ambele șiruri, câștigă
 * accentul, dar nu e o regulă de care să te sprijini, e o greșeală de scris.
 */
export function snareBar(
  sticking: string,
  options: { accents?: string; ghosts?: string; grace?: string } = {},
): Bar {
  const steps = sticking.length
  const slots: (Hit | null)[] = []
  const sticks: (Stick | null)[] = []
  const graces: (GraceNote | null)[] = []
  let hasGrace = false

  for (let step = 0; step < steps; step += 1) {
    const character = sticking[step]
    const stick: Stick | null = character === 'R' ? 'R' : character === 'L' ? 'L' : null
    sticks.push(stick)
    const level: Hit =
      options.accents?.[step] === 'x' ? 'accent' : options.ghosts?.[step] === 'o' ? 'ghost' : 'normal'
    slots.push(stick ? level : null)

    const mark = options.grace?.[step]
    if (stick && (mark === 'f' || mark === 'd')) {
      hasGrace = true
      // Grația se face mereu cu cealaltă mână, altfel n-ar fi ornament.
      graces.push({ strokes: mark === 'f' ? 1 : 2, stick: stick === 'R' ? 'L' : 'R' })
    } else {
      graces.push(null)
    }
  }

  return {
    lanes: { snare: slots },
    sticking: sticks,
    ...(hasGrace ? { grace: graces } : {}),
  }
}
