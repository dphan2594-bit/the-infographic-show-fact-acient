#!/usr/bin/env python3
"""Second-pass cleanup for a sprite cut by cut-sprite.py.

cut-sprite's flood is colour-blind by design: it keeps whatever island the
border flood could not reach, so a chunk of multi-toned scenery touching the
character (a temple roof behind a shoulder, a stone door behind a head) rides
along with him. --drop cannot clear those: it floods within one tolerance of a
single seed colour, and painted scenery spans far more than that.

Two passes fix it where the character and the intruder differ in hue, which in
flat art they almost always do:

  1. colour rule - drop pixels whose hue belongs to the scenery, never the
     character. "cool" drops blue-leaning pixels (grey-blue stonework behind a
     warm figure); "green" drops green and sky-blue (a temple roof behind a
     red robe).
  2. largest alpha island - anything left detached from the body, such as a
     scrap of gold trim, is discarded.

  python3 scripts/clean-sprite.py <sprite.png> <out.png> <w> <h> <cool|green|none> \
      [--plate <plate.png> <original> <x0> <y0> <out-plate.png>]

cut-sprite patched the plate wherever its cut kept a pixel, so every pixel this
pass drops leaves a patch smear on the plate with nothing drawn over it any
more. --plate repairs exactly those pixels back from the original picture.
"""
import subprocess, sys
from collections import deque

a = sys.argv[1:]
plate_args = None
if "--plate" in a:
    i = a.index("--plate")
    plate_args = a[i + 1:i + 6]
    del a[i:i + 6]
src, dst, w, h, rule = a[0], a[1], int(a[2]), int(a[3]), a[4]


def decode(path, fmt="rgba"):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo",
                          "-pix_fmt", fmt, "-"], capture_output=True, check=True).stdout
    return bytearray(out)


def size(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height", "-of", "csv=p=0", path],
                         capture_output=True, check=True).stdout.decode()
    return [int(v) for v in out.strip().split(",")[:2]]
p = decode(src)
before = bytes(p)

def scenery(r, g, b):
    if rule == "cool":  return b > r
    if rule == "green": return g > r + 12 or b > r + 25
    return False

cleared = 0
for i in range(0, len(p), 4):
    if p[i + 3] and scenery(p[i], p[i + 1], p[i + 2]):
        p[i + 3] = 0
        cleared += 1

seen = bytearray(w * h)
best = []
for sy in range(h):
    for sx in range(w):
        if seen[sy * w + sx] or not p[((sy * w) + sx) * 4 + 3]:
            continue
        comp, q = [], deque([(sx, sy)])
        seen[sy * w + sx] = 1
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and p[((ny * w) + nx) * 4 + 3]:
                    seen[ny * w + nx] = 1
                    q.append((nx, ny))
        if len(comp) > len(best):
            best = comp

keep = set(best)
orphans = 0
for y in range(h):
    for x in range(w):
        i = ((y * w) + x) * 4
        if p[i + 3] and (x, y) not in keep:
            p[i + 3] = 0
            orphans += 1

print(f"cleared {cleared} scenery px, {orphans} orphan px, kept {len(best)}")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
                "-s", f"{w}x{h}", "-i", "-", dst], input=bytes(p), check=True)

if plate_args:
    plate_path, orig_path, x0, y0, out_plate = plate_args
    x0, y0 = int(x0), int(y0)
    pw, ph = size(plate_path)
    plate, orig = decode(plate_path, "rgb24"), decode(orig_path, "rgb24")
    repaired = 0
    for y in range(h):
        for x in range(w):
            i = ((y * w) + x) * 4
            if before[i + 3] and not p[i + 3]:
                j = (((y0 + y) * pw) + (x0 + x)) * 3
                plate[j:j + 3] = orig[j:j + 3]
                repaired += 1
    print(f"repaired {repaired} plate px from the original")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                    "-s", f"{pw}x{ph}", "-i", "-", out_plate], input=bytes(plate), check=True)
