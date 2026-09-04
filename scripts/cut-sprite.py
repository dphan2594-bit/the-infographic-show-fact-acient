#!/usr/bin/env python3
"""Cut a character out of flat-vector artwork, and patch the hole behind it.

The `cutout` overlay can only lift a *rectangle* of the picture and nudge it a
couple of pixels — push it further and the copy slides off its own outline.
A character with a real alpha channel has no such limit: it can bob, lean,
step and swing as far as the shot wants.

The art is flat colour, so no ML is needed. Everything reachable from the
crop's border by a colour-tolerant flood fill is background; whatever is left
is the character. The hole is patched along each row from the nearest surviving
pixel, which keeps the horizontal colour bands of the artwork intact.

  python3 scripts/cut-sprite.py <image> <x0> <y0> <x1> <y1> <out-prefix>
                                [--arm x0 y0 x1 y1] [--drop x y]... [--keep x y]... [--tolerance N]
"""
import subprocess, sys, os
from collections import deque

def decode(path):
    out = subprocess.run(["ffmpeg","-v","error","-i",path,"-f","rawvideo",
                          "-pix_fmt","rgb24","-"],capture_output=True,check=True).stdout
    probe = subprocess.run(["ffprobe","-v","error","-select_streams","v:0",
                            "-show_entries","stream=width,height","-of","csv=p=0:s=x",path],
                           capture_output=True,text=True,check=True).stdout.strip()
    w,h = (int(v) for v in probe.split("x"))
    return bytearray(out), w, h

def encode(raw, w, h, fmt, path):
    subprocess.run(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt",fmt,
                    "-s",f"{w}x{h}","-i","-",path],input=bytes(raw),check=True)

def main():
    a = sys.argv[1:]
    arm = None; tol = 16
    if "--arm" in a:
        i = a.index("--arm"); arm = [int(v) for v in a[i+1:i+5]]; del a[i:i+5]
    keeps = []
    while "--keep" in a:
        i = a.index("--keep"); keeps.append((int(a[i+1]), int(a[i+2]))); del a[i:i+3]
    drops = []
    while "--drop" in a:
        i = a.index("--drop"); drops.append((int(a[i+1]), int(a[i+2]))); del a[i:i+3]
    if "--tolerance" in a:
        i = a.index("--tolerance"); tol = int(a[i+1]); del a[i:i+2]
    src, x0, y0, x1, y1, prefix = a[0], *[int(v) for v in a[1:5]], a[5]

    px, W, H = decode(src)
    bw, bh = x1-x0, y1-y0
    at = lambda x,y: ((y*W)+x)*3

    # Flood the crop from every border pixel. Background is whatever the fill
    # reaches; the character is the island it cannot get into.
    bg = bytearray(bw*bh)
    q = deque()
    for x in range(bw):
        for y in (0, bh-1):
            if not bg[y*bw+x]: bg[y*bw+x] = 1; q.append((x,y))
    for y in range(bh):
        for x in (0, bw-1):
            if not bg[y*bw+x]: bg[y*bw+x] = 1; q.append((x,y))
    while q:
        x,y = q.popleft()
        i = at(x0+x, y0+y); r,g,b = px[i],px[i+1],px[i+2]
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny = x+dx, y+dy
            if not (0 <= nx < bw and 0 <= ny < bh) or bg[ny*bw+nx]: continue
            j = at(x0+nx, y0+ny)
            if max(abs(px[j]-r), abs(px[j+1]-g), abs(px[j+2]-b)) <= tol:
                bg[ny*bw+nx] = 1; q.append((nx,ny))

    # A pocket walled off by the character — the wedge of tier between his head
    # and the raised hammer — is unreachable by the border flood, so it survives
    # as part of him. Classifying it by colour is not safe on a JPEG: the noise
    # along a hard colour edge smears into tones the character also uses, and
    # a tolerance loose enough to catch the pocket eats his face. Name the
    # pocket instead, with --drop, and flood it like any other background.
    for dx, dy in drops:
        sx, sy = dx-x0, dy-y0
        if not (0 <= sx < bw and 0 <= sy < bh) or bg[sy*bw+sx]: continue
        st = [(sx,sy)]; bg[sy*bw+sx] = 1
        i = at(dx,dy); r,g,b = px[i],px[i+1],px[i+2]
        while st:
            x,y = st.pop()
            for ddx,ddy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx,ny = x+ddx, y+ddy
                if not (0 <= nx < bw and 0 <= ny < bh) or bg[ny*bw+nx]: continue
                j = at(x0+nx, y0+ny)
                if max(abs(px[j]-r), abs(px[j+1]-g), abs(px[j+2]-b)) <= tol:
                    bg[ny*bw+nx] = 1; st.append((nx,ny))

    # Decoration that never touched the border — the neon squiggles behind him,
    # a slice of tier walled off between an arm and the body — survives the
    # flood as its own island. Keep only the biggest one: the character.
    seen = bytearray(bw*bh); best = []
    for sy in range(bh):
        for sx in range(bw):
            if bg[sy*bw+sx] or seen[sy*bw+sx]: continue
            comp = []; st = [(sx,sy)]; seen[sy*bw+sx] = 1
            while st:
                x,y = st.pop(); comp.append((x,y))
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx,ny = x+dx, y+dy
                    if 0 <= nx < bw and 0 <= ny < bh and not bg[ny*bw+nx] and not seen[ny*bw+nx]:
                        seen[ny*bw+nx] = 1; st.append((nx,ny))
            if len(comp) > len(best): best = comp
    keep = set(best)
    for y in range(bh):
        for x in range(bw):
            if not bg[y*bw+x] and (x,y) not in keep:
                bg[y*bw+x] = 1

    # The mirror of --drop. A prop held clear of the body — a scroll past the
    # scholar's hand — is its own island and the largest-island pass throws it
    # away, so name it and flood it back in. This has to run after that pass,
    # or it would just be discarded again.
    for kx, ky in keeps:
        sx, sy = kx-x0, ky-y0
        if not (0 <= sx < bw and 0 <= sy < bh) or not bg[sy*bw+sx]: continue
        st = [(sx,sy)]; bg[sy*bw+sx] = 0
        i = at(kx,ky); r,g,b = px[i],px[i+1],px[i+2]
        while st:
            x,y = st.pop()
            for ddx,ddy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx,ny = x+ddx, y+ddy
                if not (0 <= nx < bw and 0 <= ny < bh) or not bg[ny*bw+nx]: continue
                j = at(x0+nx, y0+ny)
                if max(abs(px[j]-r), abs(px[j+1]-g), abs(px[j+2]-b)) <= tol:
                    bg[ny*bw+nx] = 0; st.append((nx,ny))

    # sprite: the character on transparent
    sprite = bytearray(bw*bh*4)
    for y in range(bh):
        for x in range(bw):
            o = (y*bw+x)*4; i = at(x0+x, y0+y)
            sprite[o:o+3] = px[i:i+3]
            sprite[o+3] = 0 if bg[y*bw+x] else 255
    encode(sprite, bw, bh, "rgba", f"{prefix}.png")

    # The flood stops just short of the anti-aliased rim, which would be left
    # behind as a faint outline of the character. Widen the mask before
    # patching — the sprite covers the extra margin anyway.
    grown = bytearray(bg)
    for _ in range(2):
        prev = bytearray(grown)
        for y in range(bh):
            for x in range(bw):
                if prev[y*bw+x] and any(
                    0 <= x+dx < bw and 0 <= y+dy < bh and not prev[(y+dy)*bw+(x+dx)]
                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                    grown[y*bw+x] = 0
    bg = grown

    # plate: the artwork with the character gone. Fill each hole pixel with the
    # colour of the nearest pixel that survived, found by one breadth-first
    # sweep out from the hole's rim.
    #
    # The earlier fill worked a row at a time, taking the colour just left or
    # right of the character and running it across. That holds up over
    # horizontal bands — a sky, a floor — and falls apart over painted scenery:
    # a temple in diagonal colour blocks or a glowing path becomes a smear
    # streaked out sideways, and the moment the sprite moves off it the smear
    # shows. Nearest-neighbour keeps a flat region flat and a colour boundary
    # roughly where it was, which is what flat-vector art is made of.
    INF = 1 << 30
    dist = [0 if bg[i] else INF for i in range(bw * bh)]
    src = [0] * (bw * bh)
    q = deque()
    for y in range(bh):
        for x in range(bw):
            i = y * bw + x
            if bg[i]:                           # background survived: it is its own source
                src[i] = i
                q.append((x, y))
    while q:
        x, y = q.popleft()
        i = y * bw + x
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < bw and 0 <= ny < bh):
                continue
            j = ny * bw + nx
            if dist[j] > dist[i] + 1:
                dist[j] = dist[i] + 1
                src[j] = src[i]
                q.append((nx, ny))

    for y in range(bh):
        for x in range(bw):
            i = y * bw + x
            if bg[i] or dist[i] == INF:         # only the character's pixels are a hole
                continue
            sy, sx = divmod(src[i], bw)
            a = at(x0 + sx, y0 + sy)
            d = at(x0 + x, y0 + y)
            px[d], px[d + 1], px[d + 2] = px[a], px[a + 1], px[a + 2]

    encode(px, W, H, "rgb24", f"{prefix}-plate.png")

    covered = sum(1 for v in bg if not v)
    print(f"sprite {bw}x{bh}, {covered} px kept ({covered/(bw*bh)*100:.1f}% of the box)")

    # optionally split a limb off, so it can rotate on its own joint
    if arm:
        ax0,ay0,ax1,ay1 = arm; aw,ah = ax1-ax0, ay1-ay0
        limb = bytearray(aw*ah*4)
        for y in range(ah):
            for x in range(aw):
                s = ((y+ay0-y0)*bw + (x+ax0-x0))*4
                o = (y*aw+x)*4
                limb[o:o+4] = sprite[s:s+4]
                sprite[s+3] = 0          # clear it out of the body
        encode(limb, aw, ah, "rgba", f"{prefix}-arm.png")
        encode(sprite, bw, bh, "rgba", f"{prefix}-body.png")
        print(f"arm {aw}x{ah} split off at ({ax0},{ay0})")

main()
