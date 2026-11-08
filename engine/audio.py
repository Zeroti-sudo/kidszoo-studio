"""Kidszoo audio: original procedural music bed + synthesized cartoon SFX, mixed to a WAV.
Usage: python3 audio.py episode.json out.wav
Everything is generated from scratch (no samples), so there are no licensing issues.
"""
import json, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
rng = np.random.default_rng(1)


def tt(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, a=0.004, rel=None, decay=6.0):
    t = np.arange(n) / SR
    e = np.exp(-decay * t)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    if rel:
        nr = int(rel * SR)
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ------------------------------------------------------------------ instruments
def marimba(f, dur=0.5, amp=1.0):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-40 * t) + 0.15 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-90 * t)
    return amp * s * env(len(t), 0.002, 0.02, 7)


def bell(f, dur=0.6, amp=1.0):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.01 * f * t) + 0.2 * np.sin(2 * np.pi * 3.99 * f * t) * np.exp(-12 * t)
    return amp * s * env(len(t), 0.002, 0.03, 5)


def bass(f, dur=0.4, amp=1.0):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return amp * s * env(len(t), 0.004, 0.04, 3.5)


def kick():
    t = tt(0.25)
    f = 50 + 90 * np.exp(-30 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-12 * t)


def clap():
    n = rng.standard_normal(int(SR * 0.18))
    return bp(n, 900, 3000) * env(len(n), 0.001, 0.02, 22) * 1.6


def shaker():
    n = rng.standard_normal(int(SR * 0.06))
    return hp(n, 6000) * env(len(n), 0.002, 0.01, 50) * 0.5


# ------------------------------------------------------------------ SFX
def sfx(kind, dur=None):
    if kind == 'pop':
        n = rng.standard_normal(int(SR * 0.12))
        thump = np.sin(2 * np.pi * np.cumsum(180 + 400 * np.exp(-60 * tt(0.12))) / SR)
        return (bp(n, 600, 5000) * env(len(n), 0.0005, 0.01, 45) + thump * env(len(n), 0.001, 0.01, 35)) * 0.9
    if kind == 'pops':
        out = np.zeros(int(SR * 1.2))
        for i, d in enumerate([0, .13, .22, .38, .47, .61, .75]):
            p = sfx('pop') * (0.8 - i * 0.05); s = int(d * SR); out[s:s + len(p)] += p[:len(out) - s]
        return out
    if kind == 'boing':
        t = tt(0.7)
        f = 180 + 140 * np.sin(2 * np.pi * 11 * t) * np.exp(-5 * t) + 120 * t
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.05, 4) * 0.8
    if kind == 'whoosh':
        n = rng.standard_normal(int(SR * 0.45)); t = tt(0.45)
        sweep = bp(n, 300, 2500) * np.sin(np.pi * t / 0.45) ** 2
        return hp(sweep, 400) * 0.9
    if kind in ('ding', 'idea'):
        notes = [84, 88, 91] if kind == 'ding' else [79, 84, 88, 91, 96]
        out = np.zeros(int(SR * 1.2))
        for i, m in enumerate(notes):
            b = bell(mtof(m), 0.9, 0.5); s = int(i * 0.06 * SR); out[s:s + len(b)] += b[:len(out) - s]
        return out
    if kind == 'chime':
        out = np.zeros(int(SR * 1.6))
        for i, m in enumerate([88, 91, 95, 100, 103]):
            b = bell(mtof(m), 1.0, 0.35); s = int(i * 0.08 * SR); out[s:s + len(b)] += b[:len(out) - s]
        return out
    if kind == 'sparkle':
        out = np.zeros(int(SR * 1.0)); r = np.random.default_rng(4)
        for i in range(9):
            b = bell(mtof(96 + r.integers(0, 12)), 0.3, 0.22); s = int(r.random() * 0.6 * SR); out[s:s + len(b)] += b[:len(out) - s]
        return out
    if kind == 'tada':
        out = np.zeros(int(SR * 1.6)); t = tt(1.2)
        for i, m in enumerate([72, 76, 79, 84]):
            f = mtof(m); saw = 2 * ((f * t) % 1) - 1
            tone = lp(saw, 2200) * env(len(t), 0.01, 0.3, 1.6) * 0.32
            s = int((0.0 if i < 3 else 0.14) * SR + i * 0.02 * SR); out[s:s + len(tone)] += tone[:len(out) - s]
        return out + np.pad(sfx('sparkle'), (0, len(out) - len(sfx('sparkle'))))[:len(out)] * 0.6
    if kind == 'sad':  # "wah-wah-wah-waaah"
        out = np.zeros(int(SR * 2.2)); pos = 0
        for m, d in [(62, .32), (61, .32), (60, .32), (59, 1.0)]:
            t = tt(d); f = mtof(m) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * (t > .25))
            saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
            tone = lp(saw, 900) * env(len(t), 0.03, 0.08, 0.8) * 0.28
            out[pos:pos + len(tone)] += tone; pos += int(d * SR)
        return out
    if kind == 'nom':
        out = np.zeros(int(SR * 0.45))
        for s0 in (0.0, 0.17):
            t = tt(0.14); f = 160 + 40 * np.sin(2 * np.pi * 8 * t)
            v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.14) * 0.6
            n = bp(rng.standard_normal(len(t)), 1500, 5000) * env(len(t), 0.001, 0.01, 60) * 0.5
            s = int(s0 * SR); out[s:s + len(t)] += v + n
        return out
    if kind == 'crunch':
        out = np.zeros(int(SR * 0.5))
        for i in range(7):
            g = bp(rng.standard_normal(int(SR * 0.04)), 1200, 7000) * env(int(SR * 0.04), 0.0005, 0.005, 70)
            s = int(i * 0.06 * SR); out[s:s + len(g)] += g * 0.9
        return out
    if kind == 'clap':
        return clap() * 0.9 + np.pad(sfx('pop')[:int(SR * .1)] * .4, (0, int(SR * .08)))
    if kind == 'drumroll':
        d = dur or 1.5; out = np.zeros(int(SR * (d + 0.3)))
        hits = np.arange(0, d, 1 / 22)
        for i, h in enumerate(hits):
            g = bp(rng.standard_normal(int(SR * 0.05)), 300, 6000) * env(int(SR * 0.05), 0.001, 0.005, 40)
            s = int(h * SR); out[s:s + len(g)] += g * (0.25 + 0.5 * i / len(hits))
        c = clap() * 1.2; s = int(d * SR); out[s:s + len(c)] += c[:len(out) - s]
        return out
    if kind == 'scrub':  # brushing teeth: soft swishy noise, back and forth
        d = dur or 1.5; t = tt(d)
        n = bp(rng.standard_normal(len(t)), 2500, 9000)
        am = 0.35 + 0.65 * np.abs(np.sin(2 * np.pi * 3.5 * t))
        return n * am * np.minimum(1, np.minimum(t / 0.05, (d - t) / 0.1)) * 0.35
    if kind == 'hic':  # cartoon hiccup: quick upward chirp with a tiny pop
        t = tt(0.16); f = 260 + 900 * (t / 0.16) ** 1.5
        v = np.sin(2 * np.pi * np.cumsum(f) / SR); v = lp(np.sign(v) * np.abs(v) ** 0.6, 2500)
        return v * env(len(t), 0.002, 0.03, 18) * 0.55 + np.pad(sfx('pop')[:int(SR * .08)] * .35, (0, len(t) - int(SR * .08)))
    if kind == 'gulp':  # soft downward "gloop"
        t = tt(0.18); f = 520 * np.exp(-9 * t) + 140
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.18) * 0.5
    if kind == 'giggle':  # "hee-hee-hee" made of little triangle-wave chirps
        out = np.zeros(int(SR * 0.9))
        for i in range(6):
            t = tt(0.085); f = (720 + 60 * (i % 2)) * (1 + 0.25 * np.sin(np.pi * t / 0.085))
            ph = (np.cumsum(f) / SR) % 1; tri = 2 * np.abs(2 * ph - 1) - 1
            s = int(i * 0.13 * SR); out[s:s + len(t)] += lp(tri, 3000) * np.sin(np.pi * t / 0.085) * (0.42 - i * 0.03)
        return out
    if kind == 'stomp':  # big soft elephant stomp: low thump + a little floor rumble
        t = tt(0.35); f = 55 + 90 * np.exp(-25 * t)
        th = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.05, 9)
        rb = lp(rng.standard_normal(len(t)), 300) * env(len(t), 0.002, 0.05, 14) * 0.6
        return (th + rb) * 0.85
    if kind == 'roar':  # friendly cartoon "RAWR": a growly sawtooth that swells and falls (not scary)
        d = dur or 0.9; t = tt(d)
        f = (150 + 70 * np.sin(np.pi * t / d)) * (1 + 0.06 * np.sin(2 * np.pi * 28 * t))
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        g = lp(saw, 1400) + 0.25 * bp(rng.standard_normal(len(t)), 300, 1800)
        return g * np.sin(np.pi * np.minimum(1, t / d)) ** 0.7 * np.minimum(1, (d - t) / 0.08) * 0.42
    if kind == 'meow':  # tiny kitten "mew": a short rising then falling triangle chirp
        t = tt(0.42); f = 620 + 380 * np.sin(np.pi * np.minimum(1, t / 0.36))
        ph = (np.cumsum(f) / SR) % 1; tri = 2 * np.abs(2 * ph - 1) - 1
        return lp(tri, 3200) * np.sin(np.pi * t / 0.42) * 0.42
    if kind == 'tweet':  # two quick bird chirps
        out = np.zeros(int(SR * 0.45))
        for s0 in (0.0, 0.18):
            t = tt(0.11); f = 2200 + 1400 * (t / 0.11)
            v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.11) * 0.35
            s = int(s0 * SR); out[s:s + len(t)] += v
        return out
    raise ValueError('unknown sfx ' + kind)


# ------------------------------------------------------------------ music
def music(duration, bpm=116, seed=3):
    r = np.random.default_rng(seed)
    beat = 60 / bpm
    out = np.zeros(int(SR * (duration + 2)))
    def put(sig, t, g=1.0):
        s = int(t * SR); e = min(len(out), s + len(sig))
        if s < len(out): out[s:e] += sig[:e - s] * g
    prog = [(60, [0, 4, 7]), (67, [0, 4, 7]), (69, [0, 3, 7]), (65, [0, 4, 7])]  # C G Am F
    scale = [0, 2, 4, 7, 9]
    bars = int(duration / (4 * beat)) + 1
    motif = [r.choice(scale) + 12 * r.integers(0, 2) for _ in range(8)]
    for b in range(bars):
        root, tri = prog[b % 4]
        t0 = b * 4 * beat
        for k in range(8):  # marimba 8ths, chord tones
            note = root + tri[(k + (k // 3)) % 3] + (12 if k % 2 else 0)
            put(marimba(mtof(note), 0.35, 0.18), t0 + k * beat / 2)
        for k in (0, 2):
            put(bass(mtof(root - 24), 0.45, 0.55), t0 + k * beat)
            put(bass(mtof(root - 17), 0.3, 0.35), t0 + (k + 1.5) * beat)
        for k in range(4):
            put(kick(), t0 + k * beat, 0.55 if k % 2 == 0 else 0.25)
            if k % 2: put(clap(), t0 + k * beat, 0.28)
        for k in range(16): put(shaker(), t0 + k * beat / 4, 0.35 if k % 2 else 0.2)
        if b % 2 == 1 or b >= 2:  # melody answers
            for k, m in enumerate(motif if b % 4 < 2 else motif[::-1]):
                if (k + b) % 3 == 2: continue
                put(bell(mtof(72 + m + (root - 60) % 12 * 0), 0.35, 0.16), t0 + k * beat / 2)
    return out[:int(SR * duration)]


def main(ep_path, out_path):
    ep = json.load(open(ep_path))
    D = ep['duration']; M = ep.get('music', {})
    mus = music(D, M.get('bpm', 116), M.get('seed', 3)) * M.get('gain', 0.3)
    # ducking (e.g. sad moment)
    g = np.ones_like(mus); t = np.arange(len(mus)) / SR
    for d in M.get('duck', []):
        inside = (t >= d['t0']) & (t <= d['t1'])
        g[inside] = d['gain']
    g = lp(g, 3.0, 1)  # smooth gain changes
    fo = M.get('fadeOut', 1.0); g *= np.clip((D - t) / fo, 0, 1); g *= np.clip(t / 0.15, 0, 1)
    mus *= g
    fx = np.zeros(len(mus) + SR * 3)
    for s in ep.get('sfx', []):
        sig = sfx(s['type'], s.get('dur')) * s.get('gain', 1.0)
        i = int(s['t'] * SR); fx[i:i + len(sig)] += sig
    mix = mus + 0.6 * fx[:len(mus)]
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)  # soft limiter
    mix /= max(1e-6, np.abs(mix).max()) / 0.89
    st = np.stack([mix, mix], 1)
    wavfile.write(out_path, SR, (st * 32767).astype(np.int16))
    print('ok', out_path, f'{D:.1f}s')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
