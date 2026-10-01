/*
  Punte către shim-ul din rădăcină.

  În aplicație, `lib/drums/` și `lib/audio/` sunt frați, deci fișierele portate
  scriu `../audio/load-paused`. În sandbox, `src/` ține locul lui `lib/rhythm/`,
  iar shim-urile de audio stau în rădăcină, puntea asta face ca importul din
  fișierele portate să rămână IDENTIC, ca să se poată copia în ambele sensuri.
*/
export * from '../../audio/load-paused'
