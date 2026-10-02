#!/usr/bin/env python3
"""
Piesele din VCSL: cowbell, rimshot, lovitura pe ramă (rim click).

VCSL (Versilian Community Sample Library) e CC0 1.0: domeniu public, fără
atribuire, fără condiții. https://github.com/sgossner/VCSL

Ce face scriptul, pentru fiecare mostră:
  1. descarcă fișierul original din VCSL (dacă nu e deja în --cache);
  2. îl strânge pe mono (media canalelor);
  3. îl taie cu 0,5 ms înaintea atacului (primul eșantion peste 2% din vârf,
     același prag ca testul care cere atacul în primele 2 ms);
  4. îl scurtează la lungimea piesei, cu o coadă de 30 ms ca să nu pocnească;
  5. îl scalează cu un câștig pe PIESĂ (nu pe strat), ca diferența dintre
     ghost, normal și accent să rămână cea înregistrată;
  6. îl scrie WAV mono, 16 bit, 44,1 kHz, formatul kitului.

Lovitura pe ramă are în VCSL un singur strat pe aceeași tobă. Celelalte
înregistrări „rim” sunt de pe alte tobe și ar suna ca piese diferite, deci
ghost și normal sunt același fișier, mai încet. Manifestul o spune.

Rulare: python3 scripts/build-vcsl-pieces.py [--cache DIR]
"""
import argparse
import hashlib
import json
import math
import struct
import urllib.parse
import urllib.request
import wave
from pathlib import Path

BASE = 'https://raw.githubusercontent.com/sgossner/VCSL/master/'
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'drums' / 'vcsl'
RATE = 44100

COWBELL = 'Idiophones/Struck Idiophones/Cowbells/'
SNARE1 = 'Membranophones/Struck Membranophones/Legacy Snares/drum1/'

# piesa: (lungime în s, câștig, [(strat, fișier sursă, câștig în plus pe strat)])
PIECES = {
    'cowbell': (0.5, 1.9, [
        ('ghost', COWBELL + 'Cowbell1_Hit_v2_rr1_Mid.wav', 1.0),
        ('normal', COWBELL + 'Cowbell1_Hit_v3_rr1_Mid.wav', 1.0),
        ('accent', COWBELL + 'Cowbell1_Hit_v4_rr1_Mid.wav', 1.0),
    ]),
    # Câștigul ține vârful stratului fff sub 0,95: rimshot-ul e cel mai tare sunet al tobei mici.
    'rimshot': (0.45, 2.19, [
        ('ghost', SNARE1 + 'snare1_rimshot_mf.wav', 1.0),
        ('normal', SNARE1 + 'snare1_rimshot_f.wav', 1.0),
        ('accent', SNARE1 + 'snare1_rimshot_fff_rr1.wav', 1.0),
    ]),
    # Un singur strat înregistrat; raporturile sunt cele ale cross-stick-ului din DRSKit.
    'rimClick': (0.35, 0.6, [
        ('ghost', SNARE1 + 'snare1_rim_fff_rr1.wav', 0.22),
        ('normal', SNARE1 + 'snare1_rim_fff_rr1.wav', 0.5),
        ('accent', SNARE1 + 'snare1_rim_fff_rr1.wav', 1.0),
    ]),
}


def read_mono(path: Path) -> list[float]:
    with wave.open(str(path)) as w:
        channels, width, rate, frames = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(frames)
    assert rate == RATE, f'{path}: {rate} Hz'
    if width == 2:
        values = [v / 32768 for v in struct.unpack(f'<{len(raw) // 2}h', raw)]
    elif width == 3:
        values = [int.from_bytes(raw[i:i + 3], 'little', signed=True) / 8388608 for i in range(0, len(raw), 3)]
    else:
        raise ValueError(f'{path}: {width * 8} bit')
    return [sum(values[i:i + channels]) / channels for i in range(0, len(values), channels)]


def shape(samples: list[float], seconds: float, gain: float) -> list[float]:
    peak = max(abs(v) for v in samples)
    onset = next(i for i, v in enumerate(samples) if abs(v) > peak * 0.02)
    start = max(0, onset - int(0.0005 * RATE))
    length = int(seconds * RATE)
    fade = int(0.03 * RATE)
    out = samples[start:start + length]
    for i in range(max(0, len(out) - fade), len(out)):
        out[i] *= (len(out) - i) / fade
    return [max(-1.0, min(1.0, v * gain)) for v in out]


def write(path: Path, samples: list[float]) -> bytes:
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(struct.pack(f'<{len(samples)}h', *(int(round(v * 32767)) for v in samples)))
    return path.read_bytes()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', default=str(Path('/tmp') / 'vcsl-cache'))
    cache = Path(parser.parse_args().cache)
    cache.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    files = []
    for piece, (seconds, gain, layers) in PIECES.items():
        for layer, source, layer_gain in layers:
            local = cache / Path(source).name
            if not local.exists():
                urllib.request.urlretrieve(BASE + urllib.parse.quote(source), local)
            shaped = shape(read_mono(local), seconds, gain * layer_gain)
            name = f'{piece}-{layer}.wav'
            data = write(OUT / name, shaped)
            peak = max(abs(v) for v in shaped)
            rms = math.sqrt(sum(v * v for v in shaped[:2205]) / 2205)
            files.append({
                'piece': piece,
                'layer': layer,
                'file': name,
                'bytes': len(data),
                'sha256': hashlib.sha256(data).hexdigest(),
                'peak': round(peak, 3),
                'rms50ms': round(rms, 4),
                'sourceFiles': [source],
                **({'derived': f'×{layer_gain} din stratul fff'} if layer_gain != 1.0 else {}),
            })
            print(f'{name:22s} peak {peak:.3f} rms {rms:.4f}')

    manifest = {
        'id': 'vcsl',
        'title': 'Versilian Community Sample Library (cowbell, rimshot, rim click)',
        'license': 'CC0 1.0',
        'licenseUrl': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'credit': 'Versilian Studios LLC, VCSL (public domain, no attribution required)',
        'source': 'https://github.com/sgossner/VCSL',
        'sampleRate': RATE,
        'channels': 1,
        'bitDepth': 16,
        'files': files,
    }
    (OUT / 'kit.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    main()
