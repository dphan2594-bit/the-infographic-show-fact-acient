#!/usr/bin/env python3
"""Synthesises the scene's sound effects.

Every sound-effect library reachable from here is blocked by the sandbox's
egress policy, and the sounds this style needs are ones a designer builds from
primitives anyway: a whoosh is filtered noise on a sweep, an impact is a sine
falling off a cliff under a noise transient. Making them here keeps them free
of licensing and lets each one be tuned to the frame it lands on.

  python3 scripts/make-sfx.py public/audio/sfx
"""
import math, struct, sys, os

RATE = 44100

def prng(seed):
    """Deterministic noise — a rebuild must produce identical files."""
    state = seed & 0xFFFFFFFF
    def rand():
        nonlocal state
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        return state / 0x80000000 - 1.0
    return rand

def write(path, samples, peak=0.82):
    high = max(abs(v) for v in samples) or 1.0
    scale = peak / high
    frames = b"".join(struct.pack("<h", int(max(-1.0, min(1.0, v * scale)) * 32767)) for v in samples)
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(frames)) + b"WAVEfmt ")
        f.write(struct.pack("<IHHIIHH", 16, 1, 1, RATE, RATE * 2, 2, 16))
        f.write(b"data" + struct.pack("<I", len(frames)) + frames)
    print(f"{os.path.basename(path):16} {len(samples)/RATE:.2f}s")

def bandpass(signal, centre_of, q=2.2):
    """State-variable filter whose centre frequency can move per sample, which
    is what turns flat noise into a sweep."""
    low = band = 0.0
    out = []
    for i, x in enumerate(signal):
        f = 2 * math.sin(math.pi * min(0.45, centre_of(i / len(signal)) / RATE))
        low += f * band
        high = x - low - (1.0 / q) * band
        band += f * high
        out.append(band)
    return out

def env(n, attack, decay, curve=2.4):
    a = max(1, int(attack * n))
    return [(i / a) if i < a else ((1 - (i - a) / max(1, n - a)) ** curve) for i in range(n)]

def sweep(n, f0, f1, shape=lambda t: t):
    """A sine whose frequency glides, integrated so the phase stays continuous."""
    out, phase = [], 0.0
    for i in range(n):
        f = f0 + (f1 - f0) * shape(i / n)
        phase += 2 * math.pi * f / RATE
        out.append(math.sin(phase))
    return out

def whoosh(seconds=0.46, seed=7):
    n = int(seconds * RATE); rand = prng(seed)
    noise = [rand() for _ in range(n)]
    voiced = bandpass(noise, lambda t: 420 + 2300 * math.sin(t * math.pi))
    e = [math.sin(t / n * math.pi) ** 1.7 for t in range(n)]
    return [v * a for v, a in zip(voiced, e)]

def impact(seconds=0.52, seed=11):
    n = int(seconds * RATE); rand = prng(seed)
    # the body: a sine falling off a cliff, which is what reads as mass
    body = sweep(n, 132, 42, shape=lambda t: 1 - (1 - t) ** 0.32)
    be = env(n, 0.002, 1.0, curve=3.2)
    # the transient: a few milliseconds of noise, so the hit has an edge
    t_n = int(0.014 * RATE)
    click = [rand() * (1 - i / t_n) ** 2.5 for i in range(t_n)]
    out = [b * e for b, e in zip(body, be)]
    for i, c in enumerate(click):
        out[i] += c * 0.55
    return out

def pop(seconds=0.19, seed=3):
    n = int(seconds * RATE)
    body = sweep(n, 780, 260, shape=lambda t: t ** 0.4)
    return [b * e for b, e in zip(body, env(n, 0.004, 1.0, curve=3.0))]

def sparkle(seconds=0.62, seed=23):
    n = int(seconds * RATE); rand = prng(seed)
    out = [0.0] * n
    for k in range(7):
        freq = 1850 + abs(rand()) * 3400
        start = int(abs(rand()) * 0.16 * RATE)
        length = int((0.16 + abs(rand()) * 0.24) * RATE)
        for i in range(min(length, n - start)):
            decay = (1 - i / length) ** 2.6
            out[start + i] += math.sin(2 * math.pi * freq * i / RATE) * decay * 0.4
    return out

def riser(seconds=0.55, seed=31):
    n = int(seconds * RATE); rand = prng(seed)
    noise = [rand() for _ in range(n)]
    voiced = bandpass(noise, lambda t: 220 + 2900 * t ** 1.9, q=3.4)
    return [v * (i / n) ** 1.5 for i, v in enumerate(voiced)]

def sub(seconds=0.75, seed=5):
    n = int(seconds * RATE)
    body = sweep(n, 62, 27, shape=lambda t: t ** 0.5)
    return [b * e for b, e in zip(body, env(n, 0.01, 1.0, curve=1.8))]

out_dir = sys.argv[1] if len(sys.argv) > 1 else "public/audio/sfx"
os.makedirs(out_dir, exist_ok=True)
for name, make in (("whoosh", whoosh), ("impact", impact), ("pop", pop),
                   ("sparkle", sparkle), ("riser", riser), ("sub", sub)):
    write(os.path.join(out_dir, name + ".wav"), make())
