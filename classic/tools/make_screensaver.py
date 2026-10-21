"""Makes classic/img/screensaver.gif, the start page's screensaver: a visit
to all four prototypes, recorded in Netscape Navigator 4 on an emulated Mac
and played back as one animated GIF, which every browser of the time can
show without any script.

    python3 classic/tools/make_screensaver.py RECORDING_DIR

RECORDING_DIR holds what the recording made (it is not kept in the
repository): one folder of PNG screenshots per take (homr, ra, yenta,
kasbah, loop), each the whole 1024 x 720 emulated screen, and log.json, a
list of [take, frame, label, time] in the order the frames were taken. The
recording drove oldweb.today's Netscape 4 (Mac OS 8) against this server,
with its window sized to a content area of 781 x 524, much as the Mac OS 9
machine's: the pointer moved in small steps with a screenshot at each, the
pop-up menus were held open while the pointer moved down them, and pages
that reload themselves (Yenta's, Kasbah's) were watched as they changed.

Labels: start, m (the pointer moved), down (the button went down), menu,
chosen, k (a key was typed), load (a page was arriving), done (it had
arrived), auto (the page changed on its own), read, hold, typed, ticked,
and cut (frames back to the last click are dropped: there the page was
reloaded because an image had failed to arrive over the emulated network).

The frames are cut to the content area, the page loads are reduced to a
blink of the cleared window and the finished page, each burst of a
self-reloading page to its final state, and the pauses are set by label.
A running commentary, CAPTIONS, is set along the foot of the picture, over
the window's mostly empty bottom edge, each line from the frame it names
until the next; a line that would pass too quickly to read holds the
picture a little longer.
The GIF has one palette: the exact colours of the interface, and the rest
for the photographs. Each new page is dithered once; the frames after it
change only the pixels that differ from it, so the pointer and the menus
cost little.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'classic', 'img', 'screensaver.gif')
CROP = (5, 95, 771, 615)                 # 766 x 520 of Netscape's content area, short of its scroll bar
TAKES = ['homr', 'ra', 'yenta', 'kasbah', 'loop']
SKIP = {('yenta', 85), ('yenta', 86), ('yenta', 87)}   # a click on Yenta's door labels, which are not links
MS = {'start': 1600, 'm': 50, 'down': 130, 'menu': 380, 'chosen': 500, 'k': 70, 'done': 1000,
      'read': 1800, 'hold': 1500, 'typed': 900, 'ticked': 500, 'blank': 120}
AUTO_MS = {'yenta': 1500, 'kasbah': 600}  # each state of a page that reloads itself

# the commentary: from which frame of which take each line is shown
CAPTIONS = [
    ('homr', 0, 'HOMR learns your taste in music from people whose taste is like yours.'),
    ('homr', 12, 'A visitor rates three artists: Roger Waters 7, Mark Knopfler 6, the Sugarcubes 2.'),
    ('homr', 54, 'HOMR finds members who rate as they do, and suggests five artists those members love.'),
    ('homr', 68, 'Why The Rolling Stones? HOMR predicts a 6.2, and shows what members like them said.'),
    ('ra', 0, 'The Remembrance Agent reads over your shoulder and suggests notes and e-mail you once kept.'),
    ('ra', 24, 'Writing a paper in Emacs, the visitor types a line about the chili recipe for the potluck.'),
    ('ra', 90, 'On Return the agent looks again. Its third suggestion is now the e-mail with that recipe.'),
    ('ra', 106, 'A click on the suggestion opens the e-mail it remembered.'),
    ('yenta', 0, 'Yenta is a matchmaker: it introduces you to strangers who share your interests.'),
    ('yenta', 11, 'The visitor asks Yenta to find a new interest among the documents it has read.'),
    ('yenta', 53, 'It finds one, scuba diving in Florida, and joins a cluster of others who share it.'),
    ('yenta', 75, 'An introduction arrives in the visitor\u2019s messages, from a stranger called nitrox.'),
    ('yenta', 105, 'nitrox writes: their Yentas noticed an interest the two share that hardly anyone else has.'),
    ('kasbah', 0, 'Kasbah is a marketplace where software agents buy and sell on your behalf.'),
    ('kasbah', 29, 'The visitor creates an agent to sell a CD: ask $15, and take no less than $9.'),
    ('kasbah', 55, 'They pick how it bargains. Cool-headed drops the price slowly at first, then faster.'),
    ('kasbah', 73, 'The agent goes to market alone, turning down low offers as it lowers its price.'),
    ('kasbah', 116, 'A buyer agrees to $11.45. The agent was told to check first, so it asks.'),
    ('kasbah', 134, 'Accepted. Sold, and its owner never haggled once.'),
]
MIN_CAPTION_MS = 3200
STRIP_H = 28                              # the commentary's strip, over the foot of the picture
STRIP_BG, STRIP_LINE, STRIP_TEXT = (36, 35, 88), (125, 123, 191), (255, 255, 255)
FONT = ('/System/Library/Fonts/Supplemental/Georgia Italic.ttf', 16)


def frames(rec):
    """The recording, edited: a list of [take, frame, label, RGB array, milliseconds]."""
    log = json.load(open(os.path.join(rec, 'log.json')))
    out, i = [], 0

    def load(take, n):
        im = Image.open(os.path.join(rec, take, '%04d.png' % n)).convert('RGB').crop(CROP)
        return np.asarray(im)

    def cleared(a):
        flat = a.reshape(-1, 3)
        _, counts = np.unique(flat[::7], axis=0, return_counts=True)
        return counts.max() > 0.92 * len(flat[::7])

    last_down = 0
    while i < len(log):
        take, n, label, ts = log[i]
        if (take, n) in SKIP:
            i += 1
            continue
        if label == 'cut':
            del out[last_down + 1:]
            i += 1
            continue
        if label == 'load':
            # a page arriving: keep the window as it was cleared for it, then the page
            j = i
            while j < len(log) and log[j][2] == 'load':
                j += 1
            blank = [(log[k][1], load(take, log[k][1])) for k in range(i, j)]
            blank = [b for b in blank if cleared(b[1])]
            if blank:
                out.append([take, blank[-1][0], 'blank', blank[-1][1], MS['blank']])
            if take == 'loop':
                break                     # the page arriving is HOMR's: the GIF starts again
            i = j
            continue
        if label == 'auto':
            # a page reloading itself: keep where each burst of drawing ended
            j = i
            while j < len(log) and log[j][2] == 'auto':
                j += 1
            group = [log[i]]
            for k in range(i + 1, j):
                if log[k][3] - log[k - 1][3] > 1500:
                    out.append([take, group[-1][1], 'auto', load(take, group[-1][1]), AUTO_MS[take]])
                    group = []
                group.append(log[k])
            out.append([take, group[-1][1], 'auto', load(take, group[-1][1]), AUTO_MS[take] + 600])
            i = j
            continue
        if label == 'down':
            last_down = len(out)
        out.append([take, n, label, load(take, n), MS[label]])
        i += 1
    return out


def commentary(seq):
    """Lays the commentary over the foot of every frame."""
    font = ImageFont.truetype(*FONT)
    W = seq[0][3].shape[1]
    ramp = [tuple(int(b + (t - b) * k / 7) for b, t in zip(STRIP_BG, STRIP_TEXT)) for k in range(8)]
    cues = sorted(CAPTIONS, key=lambda c: (TAKES.index(c[0]), c[1]))
    strips = {}

    def strip(text):
        # set in grey, then each grey turned into one of eight steps from the strip to white,
        # so that the text's edges are colours the palette has exactly
        if text not in strips:
            g = Image.new('L', (W, STRIP_H), 0)
            d = ImageDraw.Draw(g)
            box = d.textbbox((0, 0), text, font=font)
            d.text(((W - (box[2] - box[0])) // 2 - box[0], (STRIP_H - (box[3] - box[1])) // 2 - box[1] + 1), text, font=font, fill=255)
            level = (np.asarray(g).astype(int) * 7 + 127) // 255
            rgb = np.array(ramp, np.uint8)[level]
            rgb[0] = STRIP_LINE
            strips[text] = rgb
        return strips[text]

    runs = []
    for f in seq:
        key = (TAKES.index(f[0]) if f[0] != 'loop' else len(TAKES), f[1])
        text = [c[2] for c in cues if (TAKES.index(c[0]), c[1]) <= key][-1]
        a = f[3].copy()
        a[-STRIP_H:] = strip(text)
        f[3] = a
        if not runs or runs[-1][0] != text:
            runs.append((text, []))
        runs[-1][1].append(f)
    # a line shown too briefly to read holds its longest frame a little longer
    for text, fs in runs:
        short = MIN_CAPTION_MS - sum(f[4] for f in fs)
        if short > 0:
            max(fs, key=lambda f: f[4])[4] += short
    print('\n'.join('%5.1f s  %s' % (sum(f[4] for f in fs) / 1000, text) for text, fs in runs))
    return ramp + [STRIP_LINE]


def palette(seq, own):
    """256 colours: the interface's own, exactly, then the photographs'."""
    pages = [a for t, n, l, a, ms in seq if l in ('start', 'done', 'auto', 'blank')]
    flat = np.concatenate([a.reshape(-1, 3) for a in pages])
    key = (flat[:, 0].astype(np.int64) << 16) | (flat[:, 1].astype(np.int64) << 8) | flat[:, 2]
    colours, counts = np.unique(key, return_counts=True)
    order = np.argsort(-counts)
    exact = [(r << 16) | (g << 8) | b for r, g, b in own]
    exact += [int(c) for c in colours[order][:150] if counts[colours.searchsorted(c)] >= 1500 and int(c) not in exact]
    rest = flat[~np.isin(key, exact)]
    rest = rest[np.random.default_rng(1).permutation(len(rest))[:400000]]
    side = int(np.ceil(np.sqrt(len(rest))))
    pad = np.zeros((side * side, 3), np.uint8)
    pad[:len(rest)] = rest
    pad[len(rest):] = rest[0]
    q = Image.fromarray(pad.reshape(side, side, 3)).quantize(256 - len(exact), method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    photo = np.array(q.getpalette()[:3 * (256 - len(exact))], np.uint8).reshape(-1, 3)
    exact = np.array([[(c >> 16) & 255, (c >> 8) & 255, c & 255] for c in exact], np.uint8)
    return np.concatenate([exact, photo])


def main():
    rec = sys.argv[1]
    seq = frames(rec)
    pal = palette(seq, commentary(seq))
    pimg = Image.new('P', (1, 1))
    pimg.putpalette(pal.reshape(-1).tolist())
    p32 = pal.astype(np.int32)
    pkey = (p32[:, 0] << 16) | (p32[:, 1] << 8) | p32[:, 2]
    korder = np.argsort(pkey)

    def exactly(a, idx):
        # Pillow's palette lookup is approximate, which turns white into 252, 252, 253;
        # every pixel of one of the palette's own colours gets that colour
        key = (a[..., 0].astype(np.int32) << 16) | (a[..., 1].astype(np.int32) << 8) | a[..., 2]
        pos = np.clip(np.searchsorted(pkey[korder], key), 0, 255)
        hit = pkey[korder][pos] == key
        idx = idx.copy()
        idx[hit] = korder[pos[hit]]
        return idx

    def nearest(px):
        d = ((px[:, None, :].astype(np.int32) - p32[None, :, :]) ** 2).sum(axis=2)
        return d.argmin(axis=1).astype(np.uint8)

    images, durations, base_rgb, base_idx = [], [], None, None
    for take, n, label, a, ms in seq:
        if base_rgb is None or (a != base_rgb).any(axis=2).mean() > 0.12:
            # a new page: dither it once against the palette
            base_idx = exactly(a, np.asarray(Image.fromarray(a).quantize(palette=pimg, dither=Image.Dither.FLOYDSTEINBERG)))
            base_rgb = a
            idx = base_idx
        else:
            # the same page with the pointer, a menu or a few words changed
            idx = base_idx.copy()
            mask = (a != base_rgb).any(axis=2)
            if mask.any():
                idx[mask] = nearest(a[mask])
        im = Image.fromarray(idx, 'P')
        im.putpalette(pal.reshape(-1).tolist())
        images.append(im)
        durations.append(ms)

    # given the palette, Pillow writes it once rather than again with every frame
    images[0].save(OUT, save_all=True, append_images=images[1:], duration=durations, loop=0, optimize=False, disposal=1,
                   palette=pal.tobytes())
    print(os.path.relpath(OUT, ROOT), '%d frames, %.1f s, %d KB' % (len(images), sum(durations) / 1000, os.path.getsize(OUT) // 1024))


if __name__ == '__main__':
    main()
