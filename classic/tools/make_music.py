"""Composes the start page's music: classic/sound/agents.mid.

Run from the repository root:  python3 classic/tools/make_music.py
No libraries needed. The output is committed.

An original loop of about a minute in the manner of early-1990s computer
music, written as General MIDI so that QuickTime's instruments play it on a
Macintosh of the time: a warm pad, a square-wave arpeggio, synth bass and a
drum machine, then a sawtooth tune, then a vibraphone descant. D minor,
108 beats a minute, 28 bars that loop seamlessly.
"""
import os
import struct

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sound', 'agents.mid')

TPQ = 480                 # ticks per quarter note
BAR = TPQ * 4
BPM = 108

PAD, ARP, BASS, LEAD, BELL, DRUMS = 0, 1, 2, 3, 4, 9

events = []               # (tick, order, bytes); note-offs sort before note-ons


def note(ch, tick, dur, key, vel):
    events.append((tick, 1, bytes([0x90 | ch, key, vel])))
    events.append((tick + dur, 0, bytes([0x80 | ch, key, 0])))


def control(ch, cc, value):
    events.append((0, 0, bytes([0xB0 | ch, cc, value])))


def program(ch, number):
    events.append((0, 0, bytes([0xC0 | ch, number])))


# ---- harmony -----------------------------------------------------------
CHORDS = {
    #          pad voicing           arpeggio tones            bass
    'Dm9':    ([50, 53, 57, 60, 64], [62, 65, 69, 72, 76], 38),
    'Bbmaj7': ([46, 53, 57, 62],     [58, 62, 65, 69, 74], 34),
    'Fmaj7':  ([53, 57, 60, 64],     [60, 65, 69, 72, 76], 41),
    'Cadd9':  ([48, 55, 62, 64],     [60, 64, 67, 72, 74], 36),
    'Gm7':    ([50, 53, 55, 58],     [55, 58, 62, 65, 70], 43),
    'A7':     ([52, 55, 57, 61],     [57, 61, 64, 67, 69], 33),
    'Bb':     ([46, 50, 53, 58],     [58, 62, 65, 70, 74], 34),
    'C':      ([48, 52, 55, 60],     [60, 64, 67, 72, 76], 36),
    'Dm7':    ([50, 53, 57, 60],     [62, 65, 69, 72, 77], 38),
    'Asus':   ([52, 57, 62],         [57, 62, 64, 69, 74], 33),
    'A':      ([52, 57, 61],         [57, 61, 64, 69, 73], 33),
}
INTRO = ['Dm9', 'Bbmaj7', 'Fmaj7', 'Cadd9']
VERSE = ['Dm9', 'Bbmaj7', 'Fmaj7', 'Cadd9', 'Dm9', 'Bbmaj7', 'Gm7', 'A7']
BRIDGE = ['Bb', 'C', 'Dm7', 'Dm7', 'Bb', 'C', 'Asus', 'A']
SONG = INTRO + VERSE + BRIDGE + VERSE                 # 28 bars
A, B, A2 = 4, 12, 20                                  # where each section starts

# ---- the tune (bridge) and the descant (last verse): (key, beats) ------
TUNE = [
    [(74, 2), (72, 1), (69, 1)], [(67, 3), (69, 1)], [(65, 1), (69, 1), (74, 1), (76, 1)], [(77, 3), (76, 0.5), (74, 0.5)],
    [(74, 2), (72, 1), (70, 1)], [(72, 2), (76, 1), (79, 1)], [(76, 3), (74, 1)], [(73, 3)],
]
DESCANT = [
    [(76, 2), (74, 2)], [(74, 2), (72, 2)], [(72, 2), (69, 2)], [(67, 4)],
    [(77, 2), (76, 2)], [(74, 2), (77, 2)], [(74, 2), (70, 2)], [(73, 4)],
]

# ---- instruments -----------------------------------------------------------
for ch, prog_no, volume, pan in [(PAD, 89, 82, 64), (ARP, 80, 62, 40), (BASS, 38, 100, 64),
                                 (LEAD, 81, 92, 64), (BELL, 11, 92, 90), (DRUMS, 0, 100, 64)]:
    program(ch, prog_no)
    control(ch, 7, volume)
    control(ch, 10, pan)
    control(ch, 91, 40)

for bar, name in enumerate(SONG):
    t0 = bar * BAR
    pad, arp, root = CHORDS[name]

    # the pad holds each chord for the bar, a little softer in the intro
    for k in pad:
        note(PAD, t0, BAR - 24, k, 44 if bar < A else 54)

    # the arpeggio runs throughout in sixteenths, up and down the chord
    for i, idx in enumerate([0, 1, 2, 3, 4, 3, 2, 1] * 2):
        vel = 62 if i % 4 == 0 else 46
        if B <= bar < A2:
            vel -= 12                                 # out of the tune's way
        note(ARP, t0 + i * TPQ // 4, 100, arp[idx], vel)

    if bar >= A:
        # synth bass: a pulse of eighths with octave leaps
        for i, (off, vel) in enumerate(zip([0, 0, 12, 0, 0, 0, 12, 0], [96, 68, 80, 70, 90, 68, 80, 72])):
            note(BASS, t0 + i * TPQ // 2, 200, root + off, vel)

        # the drum machine
        fill = bar in (A2 - 1, len(SONG) - 1)
        note(DRUMS, t0, 120, 36, 100)
        note(DRUMS, t0 + 2 * TPQ, 120, 36, 92)
        if bar % 2:
            note(DRUMS, t0 + 3 * TPQ + TPQ // 2, 120, 36, 70)
        note(DRUMS, t0 + TPQ, 120, 39, 72)
        if not fill:
            note(DRUMS, t0 + 3 * TPQ, 120, 39, 72)
        for i in range(8):
            if fill and i >= 6:
                continue
            if bar % 2 and i == 7:
                note(DRUMS, t0 + i * TPQ // 2, 200, 46, 48)        # open hat into the next bar
            else:
                note(DRUMS, t0 + i * TPQ // 2, 60, 42, 50 if i % 2 == 0 else 34)
        if fill:
            for i, vel in enumerate([48, 56, 64, 72]):
                note(DRUMS, t0 + 3 * TPQ + i * TPQ // 4, 90, 38, vel)
        if bar in (A, B, A2):
            note(DRUMS, t0, 400, 49, 70)
    elif bar >= 2:
        # the intro's second half: just a quiet hi-hat coming in
        for i in range(8):
            note(DRUMS, t0 + i * TPQ // 2, 60, 42, 30 if i % 2 else 40)

    def phrase(ch, notes, vel, gap):
        t = t0
        for key, beats in notes:
            dur = int(beats * TPQ)
            note(ch, t, dur - gap, key, vel)
            t += dur

    if B <= bar < A2:
        phrase(LEAD, TUNE[bar - B], 88, 30)
    if bar >= A2:
        phrase(BELL, DESCANT[bar - A2], 84, 10)

END = len(SONG) * BAR


# ---- a format 0 Standard MIDI File --------------------------------------------
def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.insert(0, 0x80 | (n & 0x7F))
        n >>= 7
    return bytes(out)


track = bytearray()
track += vlq(0) + b'\xFF\x51\x03' + struct.pack('>I', round(60000000 / BPM))[1:]
track += vlq(0) + b'\xFF\x58\x04\x04\x02\x18\x08'
track += vlq(0) + b'\xFF\x03' + vlq(len(b'The Original Agents')) + b'The Original Agents'
now = 0
for tick, _, data in sorted(events, key=lambda e: (e[0], e[1])):
    assert tick <= END
    track += vlq(tick - now) + data
    now = tick
track += vlq(END - now) + b'\xFF\x2F\x00'

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'wb') as f:
    f.write(b'MThd' + struct.pack('>IHHH', 6, 0, 1, TPQ))
    f.write(b'MTrk' + struct.pack('>I', len(track)) + track)
print('%s: %d bytes, %d bars, %.0f seconds' % (os.path.relpath(OUT), os.path.getsize(OUT), len(SONG), END / TPQ * 60 / BPM))
