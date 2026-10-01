import { hitLevels, kitPieces, type Hit, type KitPiece } from './exercise'
import type { SampleKey } from './render'

/*
  Numele mostrelor, separat de `kit.ts`.

  Separat fiindcă `kit.ts` importă React Native, iar un test care ar avea nevoie
  doar de numele mostrelor ar trage după el tot RN, adică sintaxă Flow, pe care
  vitest nu o poate citi. Aceeași despărțire e făcută și în modulul Ritm, din
  același motiv.
*/

export const sampleKeyOf = (piece: KitPiece, hit: Hit): SampleKey => `${piece}-${hit}`

/** Toate cheile așteptate: 8 piese × 3 intensități. */
export const allSampleKeys: SampleKey[] = kitPieces.flatMap((piece) =>
  hitLevels.map((hit) => sampleKeyOf(piece, hit)),
)
