import { Platform } from 'react-native'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import type { KitSamples, SampleKey } from './render'
import { decodeWav } from './wav'

export { allSampleKeys, sampleKeyOf } from './kit-keys'

/*
  Mostrele kitului, încărcate o dată și ținute în memorie.

  Singurul fișier din `lib/drums/` care atinge React Native. Totul de deasupra
  (`exercise`, `plan`, `render`) primește mostrele ca argument și rămâne pur,
  de aceea testele pot randa pe mostrele adevărate fără să monteze nimic.

  Decodarea e în JS, nu prin expo-av: un decodor nativ ar da un obiect de redare,
  iar noi avem nevoie de EȘANTIOANE, ca să le adunăm într-un singur WAV. E ieftin
  - 24 de fișiere PCM, ~2 MB, o singură trecere.
*/

/** Kitul care se livrează. Manifestul (`kit.json`) stă lângă mostre. */
export const KIT_ID = 'muldjord'

export interface KitCredit {
  id: string
  title: string
  license: string
  licenseUrl: string
  credit: string
  source: string
}

/*
  Fiecare mostră cerută pe nume, explicit.

  Metro nu poate rezolva un `require` construit dintr-un șir la rulare, deci o
  hartă scrisă de mână nu e redundanță: e singura formă în care mostrele intră în
  pachet. Un `require` lipsă se vede la build, nu la prima lovitură.
*/
const sampleModules: Record<SampleKey, number> = {
  'kick-ghost': require('../../assets/drums/muldjord/kick-ghost.wav'),
  'kick-normal': require('../../assets/drums/muldjord/kick-normal.wav'),
  'kick-accent': require('../../assets/drums/muldjord/kick-accent.wav'),
  'snare-ghost': require('../../assets/drums/muldjord/snare-ghost.wav'),
  'snare-normal': require('../../assets/drums/muldjord/snare-normal.wav'),
  'snare-accent': require('../../assets/drums/muldjord/snare-accent.wav'),
  'hhClosed-ghost': require('../../assets/drums/muldjord/hhClosed-ghost.wav'),
  'hhClosed-normal': require('../../assets/drums/muldjord/hhClosed-normal.wav'),
  'hhClosed-accent': require('../../assets/drums/muldjord/hhClosed-accent.wav'),
  'hhOpen-ghost': require('../../assets/drums/muldjord/hhOpen-ghost.wav'),
  'hhOpen-normal': require('../../assets/drums/muldjord/hhOpen-normal.wav'),
  'hhOpen-accent': require('../../assets/drums/muldjord/hhOpen-accent.wav'),
  'tom-ghost': require('../../assets/drums/muldjord/tom-ghost.wav'),
  'tom-normal': require('../../assets/drums/muldjord/tom-normal.wav'),
  'tom-accent': require('../../assets/drums/muldjord/tom-accent.wav'),
  'mid-ghost': require('../../assets/drums/muldjord/mid-ghost.wav'),
  'mid-normal': require('../../assets/drums/muldjord/mid-normal.wav'),
  'mid-accent': require('../../assets/drums/muldjord/mid-accent.wav'),
  'floor-ghost': require('../../assets/drums/muldjord/floor-ghost.wav'),
  'floor-normal': require('../../assets/drums/muldjord/floor-normal.wav'),
  'floor-accent': require('../../assets/drums/muldjord/floor-accent.wav'),
  'crash-ghost': require('../../assets/drums/muldjord/crash-ghost.wav'),
  'crash-normal': require('../../assets/drums/muldjord/crash-normal.wav'),
  'crash-accent': require('../../assets/drums/muldjord/crash-accent.wav'),
  'ride-ghost': require('../../assets/drums/muldjord/ride-ghost.wav'),
  'ride-normal': require('../../assets/drums/muldjord/ride-normal.wav'),
  'ride-accent': require('../../assets/drums/muldjord/ride-accent.wav'),
  /*
    Loviturile pe care MuldjordKit nu le are, din DRSKit (`drsx`, vezi
    `scripts/build-drum-kit.mjs`). Alt set, altă sală, dar fiecare e o lovitură
    scurtă, deci diferența nu se aude ca un al doilea set de tobe. Nivelul lor
    față de restul îl potrivește `DEFAULT_MIX`, nu extragerea.
  */
  'crossStick-ghost': require('../../assets/drums/drsx/crossStick-ghost.wav'),
  'crossStick-normal': require('../../assets/drums/drsx/crossStick-normal.wav'),
  'crossStick-accent': require('../../assets/drums/drsx/crossStick-accent.wav'),
  'hhFoot-ghost': require('../../assets/drums/drsx/hhFoot-ghost.wav'),
  'hhFoot-normal': require('../../assets/drums/drsx/hhFoot-normal.wav'),
  'hhFoot-accent': require('../../assets/drums/drsx/hhFoot-accent.wav'),
  'rideBell-ghost': require('../../assets/drums/drsx/rideBell-ghost.wav'),
  'rideBell-normal': require('../../assets/drums/drsx/rideBell-normal.wav'),
  'rideBell-accent': require('../../assets/drums/drsx/rideBell-accent.wav'),
  'brush-ghost': require('../../assets/drums/drsx/brush-ghost.wav'),
  'brush-normal': require('../../assets/drums/drsx/brush-normal.wav'),
  'brush-accent': require('../../assets/drums/drsx/brush-accent.wav'),
}

/**
 * Atribuirile, câte una pe set. CC BY o cere vizibil în aplicație, nu doar în
 * repo, deci pagina de credite le arată pe toate.
 */
export const kitCredits: KitCredit[] = [
  require('../../assets/drums/muldjord/kit.json'),
  require('../../assets/drums/drsx/kit.json'),
]

/** Lasă firul JS liber o clipă, ca atingerile în așteptare să fie procesate. */
const yieldToUi = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

let loaded: KitSamples | null = null
let loading: Promise<KitSamples> | null = null

async function bytesOf(module: number): Promise<Uint8Array> {
  const asset = Asset.fromModule(module)
  /*
    `downloadAsync` se cheamă mereu, nu doar când lipsește `localUri`: în dezvoltare
    un asset din pachet vine de la Metro, pe http, iar pe Android în release stă în
    APK, la `asset:///…`, niciunul nu se poate citi ca fișier. Apelul copiază
    asset-ul în cache și ne dă o cale adevărată; dacă e deja local, nu face nimic.
  */
  await asset.downloadAsync()
  const uri = asset.localUri ?? asset.uri
  if (Platform.OS !== 'web') {
    try {
      // Pe nativ, `fetch` pe un `file://` nu e de încredere; `File.bytes()` e.
      return await new File(uri).bytes()
    } catch {
      // Rămâne varianta cu fetch: mai bine un kit încărcat mai încet decât
      // jocurile de tobe blocate pe o platformă pe care nu am măsurat încă.
    }
  }
  const response = await fetch(uri)
  return new Uint8Array(await response.arrayBuffer())
}

/**
 * Încarcă mostrele. Apelurile paralele împart aceeași încărcare, iar a doua
 * deschidere a unui joc de tobe nu mai decodează nimic.
 */
export function loadKit(): Promise<KitSamples> {
  if (loaded) return Promise.resolve(loaded)
  loading ??= (async () => {
    const modules = Object.entries(sampleModules) as [SampleKey, number][]
    // Citirile merg în paralel: așteaptă discul sau rețeaua, nu firul JS.
    const bytes = await Promise.all(modules.map(([, module]) => bytesOf(module)))
    /*
      Decodarea, în schimb, e muncă de JS, și se face PE RÂND, cu o pauză după
      fiecare fișier. Toate deodată, cele 39 de decodări cădeau într-un singur
      bloc, iar cât ținea blocul ecranul nu răspundea la nicio atingere: pe
      telefon, la intrarea în prima lecție, butoanele stăteau moarte câteva
      secunde. Cu pauza, o atingere așteaptă cel mult un fișier.
    */
    const entries: (readonly [SampleKey, Float32Array])[] = []
    for (let index = 0; index < modules.length; index += 1) {
      entries.push([modules[index]![0], decodeWav(bytes[index]!)] as const)
      await yieldToUi()
    }
    loaded = Object.fromEntries(entries) as unknown as KitSamples
    return loaded
  })().catch((error) => {
    // Fără resetare, o eroare de rețea la prima deschidere ar bloca definitiv
    // jocurile de tobe pe o promisiune respinsă, ținută în cache.
    loading = null
    throw error
  })
  return loading
}

/** Mostrele, dacă sunt deja în memorie. Pentru randare sincronă, fără await. */
export const kitIfLoaded = () => loaded
