import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { KitSamples } from './render'
import { decodeWav } from './wav'

/*
  Mostrele adevărate, citite de pe disc, pentru testele care randează sunet.

  Doar pentru teste: citește cu `node:fs`, deci nu intră niciodată în pachetul
  aplicației (acolo încarcă `kit.ts`, prin expo-asset). Era copiat în patru
  fișiere de test, câte unul pe modul, fiecare cu un singur set; cu al doilea
  set (`drsx`) ar fi trebuit schimbat în patru locuri, iar un loc uitat ar fi
  dat un test care pică pe o mostră „lipsă" care de fapt există.
*/

export interface ManifestEntry {
  piece: string
  layer: string
  file: string
  sha256: string
  /** Folderul setului din care vine mostra. */
  dir: string
}

/** Seturile pe care le încarcă `kit.ts`, în aceeași ordine. */
const kitDirs = ['muldjord', 'drsx'].map((name) => join(__dirname, '../../assets/drums', name))

/** Toate mostrele, din toate seturile. */
export const testManifest: { files: ManifestEntry[] } = {
  files: kitDirs.flatMap((dir) =>
    (
      JSON.parse(readFileSync(join(dir, 'kit.json'), 'utf8')) as {
        files: Omit<ManifestEntry, 'dir'>[]
      }
    ).files.map((entry) => ({ ...entry, dir })),
  ),
}

export const testKit = Object.fromEntries(
  testManifest.files.map((entry) => [
    `${entry.piece}-${entry.layer}`,
    decodeWav(readFileSync(join(entry.dir, entry.file))),
  ]),
) as unknown as KitSamples
