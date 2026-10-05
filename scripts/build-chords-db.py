#!/usr/bin/env python3
"""
Convertește chords-db (github.com/tombatossals/chords-db, licență MIT) în
formatul acordurilor din aplicație: `src/guitar/data/chords-db.json`.

Folosire:
    curl -sSL -o guitar.json https://raw.githubusercontent.com/tombatossals/chords-db/master/lib/guitar.json
    python3 scripts/build-chords-db.py guitar.json

Formatul de ieșire, compact (se încarcă în aplicație):
    { "chords": { "C": { "major": [ ["x32010", "x32-1-", 0], ... ] } } }
    - tastele, absolute, de la coarda 6 la 1: `x` = nu se cântă, 0-9, apoi
      a-f pentru 10-15 (ca forma să rămână un șir de șase caractere);
    - degetele, în formatul aplicației: 1-4, `-` coardă goală, `x` nu se cântă;
    - tasta barré-ului făcut cu degetul 1 (0 = fără).

Poziții sărite: cele cu un deget invalid (în sursă există două, cu -1) și cele
cu o coardă apăsată fără deget. Restul se verifică în aplicație
(`chord-reference.test.ts`), cu aceleași reguli ca biblioteca.
"""
import json
import sys

KEYS = {"Csharp": "C#", "Fsharp": "F#"}


def fret_char(value: int) -> str:
    if value < 0:
        return "x"
    return str(value) if value < 10 else chr(ord("a") + value - 10)


def convert(position):
    base = position["baseFret"]
    absolute = [f + base - 1 if f > 0 else f for f in position["frets"]]
    fingers = position["fingers"]
    if any(g < 0 or g > 4 for g in fingers):
        return None
    finger_chars = []
    for fret, finger in zip(absolute, fingers):
        if fret < 0:
            finger_chars.append("x")
        elif fret == 0:
            finger_chars.append("-")
        elif finger == 0:
            return None
        else:
            finger_chars.append(str(finger))
    barre = 0
    for relative in position.get("barres", []):
        fret = relative + base - 1
        strings = [i for i, (f, g) in enumerate(zip(absolute, fingers)) if f == fret and g == 1]
        if len(strings) >= 2:
            barre = fret
            break
    return ["".join(fret_char(f) for f in absolute), "".join(finger_chars), barre]


def main(path: str) -> None:
    source = json.load(open(path))
    out = {}
    skipped = 0
    total = 0
    for key, chords in source["chords"].items():
        name = KEYS.get(key, key)
        out[name] = {}
        for chord in chords:
            positions = []
            for position in chord["positions"]:
                total += 1
                converted = convert(position)
                if converted is None:
                    skipped += 1
                    continue
                positions.append(converted)
            out[name][chord["suffix"]] = positions
    data = {
        "source": "chords-db by David Rubert, MIT License, github.com/tombatossals/chords-db",
        "chords": out,
    }
    target = "src/guitar/data/chords-db.json"
    with open(target, "w") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))
    print(f"{total - skipped} poziții scrise, {skipped} sărite -> {target}")


if __name__ == "__main__":
    main(sys.argv[1])
