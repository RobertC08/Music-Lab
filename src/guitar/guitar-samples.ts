import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import { decodeWav } from '@/lib/drums/wav'
import type { SampleBank } from './sampled'

/*
  Mostrele de chitară (nylon, FluidR3_GM, licență MIT; vezi
  `assets/guitar/nylon/CREDITS.md`), încărcate o dată și ținute în memorie.

  Același aranjament ca la tobe (`src/drums/kit.ts`): singurul fișier de aici
  care atinge React Native; restul (`sampled.ts`, pistele) primește mostrele ca
  argument și rămâne pur, testabil în Node. Decodarea e în JS, pe rând, cu o
  pauză după fiecare fișier, ca ecranul să răspundă cât se încarcă.

  Până se încarcă, aplicația cântă cu sinteza (`pluck.ts`): nimic nu așteaptă
  după mostre.
*/

/** Volumul mostrelor în mix: fișierele sunt normalizate la 0,9, notele sintetizate la ~0,3. */
export const GUITAR_SAMPLE_GAIN = 0.55

/** Instrumentul, pentru cheile pistelor din cache: o pistă din mostre nu e aceeași cu una sintetizată. */
export const GUITAR_VOICE = 'nylon'

/*
  Fiecare mostră cerută pe nume: Metro nu poate rezolva un `require` construit la
  rulare, deci lista scrisă e singura formă în care fișierele intră în pachet.
*/
const sampleModules: Record<number, number> = {
  40: require('../../assets/guitar/nylon/40.wav'),
  41: require('../../assets/guitar/nylon/41.wav'),
  42: require('../../assets/guitar/nylon/42.wav'),
  43: require('../../assets/guitar/nylon/43.wav'),
  44: require('../../assets/guitar/nylon/44.wav'),
  45: require('../../assets/guitar/nylon/45.wav'),
  46: require('../../assets/guitar/nylon/46.wav'),
  47: require('../../assets/guitar/nylon/47.wav'),
  48: require('../../assets/guitar/nylon/48.wav'),
  49: require('../../assets/guitar/nylon/49.wav'),
  50: require('../../assets/guitar/nylon/50.wav'),
  51: require('../../assets/guitar/nylon/51.wav'),
  52: require('../../assets/guitar/nylon/52.wav'),
  53: require('../../assets/guitar/nylon/53.wav'),
  54: require('../../assets/guitar/nylon/54.wav'),
  55: require('../../assets/guitar/nylon/55.wav'),
  56: require('../../assets/guitar/nylon/56.wav'),
  57: require('../../assets/guitar/nylon/57.wav'),
  58: require('../../assets/guitar/nylon/58.wav'),
  59: require('../../assets/guitar/nylon/59.wav'),
  60: require('../../assets/guitar/nylon/60.wav'),
  61: require('../../assets/guitar/nylon/61.wav'),
  62: require('../../assets/guitar/nylon/62.wav'),
  63: require('../../assets/guitar/nylon/63.wav'),
  64: require('../../assets/guitar/nylon/64.wav'),
  65: require('../../assets/guitar/nylon/65.wav'),
  66: require('../../assets/guitar/nylon/66.wav'),
  67: require('../../assets/guitar/nylon/67.wav'),
  68: require('../../assets/guitar/nylon/68.wav'),
  69: require('../../assets/guitar/nylon/69.wav'),
  70: require('../../assets/guitar/nylon/70.wav'),
  71: require('../../assets/guitar/nylon/71.wav'),
  72: require('../../assets/guitar/nylon/72.wav'),
  73: require('../../assets/guitar/nylon/73.wav'),
  74: require('../../assets/guitar/nylon/74.wav'),
  75: require('../../assets/guitar/nylon/75.wav'),
  76: require('../../assets/guitar/nylon/76.wav'),
  77: require('../../assets/guitar/nylon/77.wav'),
  78: require('../../assets/guitar/nylon/78.wav'),
  79: require('../../assets/guitar/nylon/79.wav'),
}

export const guitarCredit = require('../../assets/guitar/nylon/kit.json') as {
  id: string
  title: string
  license: string
  licenseUrl: string
  credit: string
  source: string
}

const yieldToUi = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

async function bytesOf(module: number): Promise<Uint8Array> {
  const asset = Asset.fromModule(module)
  // Ca la tobe: `downloadAsync` mereu, ca asset-ul să fie un fișier local care se poate citi.
  await asset.downloadAsync()
  const uri = asset.localUri ?? asset.uri
  if (Platform.OS !== 'web') {
    try {
      return await new File(uri).bytes()
    } catch {
      // Cade pe fetch, mai jos.
    }
  }
  const response = await fetch(uri)
  return new Uint8Array(await response.arrayBuffer())
}

let loaded: SampleBank | null = null
let loading: Promise<SampleBank> | null = null

/** Încarcă mostrele. Apelurile paralele împart aceeași încărcare. */
export function loadGuitarSamples(): Promise<SampleBank> {
  if (loaded) return Promise.resolve(loaded)
  loading ??= (async () => {
    const bank = new Map<number, Float32Array[]>()
    for (const [pitch, module] of Object.entries(sampleModules)) {
      const samples = decodeWav(await bytesOf(module))
      for (let index = 0; index < samples.length; index += 1) samples[index]! *= GUITAR_SAMPLE_GAIN
      bank.set(Number(pitch), [samples])
      await yieldToUi()
    }
    loaded = bank
    return bank
  })().catch((error: unknown) => {
    loading = null
    throw error
  })
  return loading
}

/** Mostrele, dacă s-au încărcat deja; altfel `null` (și se cântă cu sinteza). */
export const guitarSamplesIfLoaded = () => loaded

/** Pornește încărcarea la montare; întoarce mostrele când sunt gata. */
export function useGuitarSamples(): SampleBank | null {
  const [bank, setBank] = useState<SampleBank | null>(loaded)
  useEffect(() => {
    if (loaded) return
    let alive = true
    loadGuitarSamples()
      .then((value) => {
        if (alive) setBank(value)
      })
      .catch(() => {
        // Fără mostre, rămâne sinteza.
      })
    return () => {
      alive = false
    }
  }, [])
  return bank
}
