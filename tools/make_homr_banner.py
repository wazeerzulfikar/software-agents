"""Makes assets/homr/banner.png: the masthead from the 1997 figure with its
wordmark changed from "firefly" to "HOMR", so that the demo says HOMR
throughout. The original, assets/firefly/banner.png, is left as it was.

Run from the repository root (needs opencv-python-headless, numpy, Pillow,
and macOS's Avenir Next Condensed):
    python3 tools/make_homr_banner.py [weight-index]

The yellow letters of "firefly" are found by colour, removed by inpainting
and given back the background's dithered grain; "HOMR" is then set in the
same yellow with a dark outline and a soft shadow, where "firefly" stood.
"music", "people", "buzz" and the rest of the artwork are untouched.
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'assets', 'firefly', 'banner.png')
OUT = os.path.join(ROOT, 'assets', 'homr', 'banner.png')
FONT = '/System/Library/Fonts/Avenir Next Condensed.ttc'
WEIGHT = int(sys.argv[1]) if len(sys.argv) > 1 else 7        # 7 Regular, 5 Medium

YELLOW = (209, 194, 68)                 # the median colour of the original letters
X0, X1 = 538, 752                       # where "firefly" stands, short of "music"
BOX = (546, 16, 746, 168)               # where "HOMR" goes: firefly's cap height and baseline


def main():
    src = Image.open(SRC).convert('RGB')
    a = np.array(src).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    yellow = (r > 120) & (g > 110) & (b < 0.75 * np.minimum(r, g)) & (np.abs(r - g) < 70)

    # take the letters (and their dark outline) out, and fill from around them
    mask = np.zeros(yellow.shape, np.uint8)
    mask[:, X0:X1] = yellow[:, X0:X1] * 255
    mask = cv2.dilate(mask, np.ones((11, 11), np.uint8))           # wide enough for their pale highlights
    mask[:, :X0] = 0
    mask[:, X1:] = 0
    fill = cv2.inpaint(cv2.cvtColor(np.array(src), cv2.COLOR_RGB2BGR), mask, 5, cv2.INPAINT_NS)
    fill = cv2.cvtColor(fill, cv2.COLOR_BGR2RGB).astype(float)
    grain = np.random.default_rng(1).normal(0, a[20:200, 470:535].reshape(-1, 3).std(axis=0).mean() * 0.8, fill.shape[:2])[..., None]
    out = np.where((mask > 0)[..., None], np.clip(fill + grain, 0, 255), a).astype(np.uint8)

    # stray bright specks in the background where the letters were: pixels
    # much brighter than their neighbourhood
    med = cv2.medianBlur(out, 9)
    lift = out.mean(axis=2) - med.mean(axis=2)
    specks = np.zeros(lift.shape, bool)
    specks[:, X0:X1] = cv2.dilate((lift[:, X0:X1] > 30).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    out[specks] = med[specks]
    clean = Image.fromarray(out)

    font = ImageFont.truetype(FONT, 400, index=WEIGHT)
    word = Image.new('RGBA', (1400, 600), (0, 0, 0, 0))
    ImageDraw.Draw(word).text((40, 40), 'HOMR', font=font, fill=YELLOW + (255,), stroke_width=8, stroke_fill=(34, 30, 16, 255))
    word = word.crop(word.getbbox()).resize((BOX[2] - BOX[0], BOX[3] - BOX[1]), Image.LANCZOS)
    shadow = word.getchannel('A').point(lambda v: int(v * 0.5)).filter(ImageFilter.GaussianBlur(2))
    clean.paste((0, 0, 0), (BOX[0] + 3, BOX[1] + 3), shadow)
    clean.paste(word, (BOX[0], BOX[1]), word)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    clean.save(OUT)
    print(os.path.relpath(OUT, ROOT), clean.size, ImageFont.truetype(FONT, 20, index=WEIGHT).getname())


if __name__ == '__main__':
    main()
