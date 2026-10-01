/*
  Punte către generatorul din `src/game/`.

  În aplicație, `lib/drums/` și `lib/rhythm/` sunt frați, deci fișierele portate
  scriu `../rhythm/game/random`. În sandbox, `src/` ține locul lui `lib/rhythm/`,
  așa că puntea asta face ca importul din fișierele portate să rămână IDENTIC și
  să se poată copia în ambele sensuri. Aceeași soluție ca la `src/audio/`.
*/
export * from '../../game/random'
