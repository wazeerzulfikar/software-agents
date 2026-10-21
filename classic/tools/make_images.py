"""Makes the images in classic/img/ for the 1990s-browser version.

Run from the repository root:  python3 classic/tools/make_images.py
Needs Pillow, and Google Chrome for the Kasbah menu bar. The output is
committed, so this only needs running again when the artwork changes.

Period browsers are safest with GIF and baseline JPEG at the size they are
shown, so the artwork in assets/ is converted and scaled here. The few
pieces the modern version draws with canvas or CSS (the Emacs window's title
and menu bars, Firefly's tiny icons, Kasbah's menu bar) are drawn here as
images, the way pages of the time did it.
"""
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'classic', 'img')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'


def src(*p):
    return os.path.join(ROOT, *p)


def gif(im, name, transparent=None):
    """Save as a GIF with an adaptive, dithered palette. `transparent` is an
    RGB colour that becomes the transparent index."""
    im = im.convert('RGB')
    q = im.quantize(colors=255 if transparent else 256, method=Image.Quantize.MEDIANCUT,
                    dither=Image.Dither.FLOYDSTEINBERG)
    if transparent:
        pal = q.getpalette()[:255 * 3]
        idx = None
        for i in range(len(pal) // 3):
            if tuple(pal[i * 3:i * 3 + 3]) == transparent:
                idx = i
                break
        if idx is None:
            sys.exit('transparent colour not in palette for ' + name)
        q.save(os.path.join(OUT, name), transparency=idx)
    else:
        q.save(os.path.join(OUT, name))


def jpg(im, name, quality=86):
    im.convert('RGB').save(os.path.join(OUT, name), quality=quality, progressive=False, optimize=True)


def flat_gif(pixels, w, h, colours, name, transparent=None):
    """A small hand-drawn GIF from a 2-D list of palette indices."""
    im = Image.new('P', (w, h))
    pal = []
    for c in colours:
        pal += list(c)
    im.putpalette(pal + [0] * (768 - len(pal)))
    im.putdata([pixels[y][x] for y in range(h) for x in range(w)])
    if transparent is not None:
        im.save(os.path.join(OUT, name), transparency=transparent)
    else:
        im.save(os.path.join(OUT, name))


# ---- X11 bitmap fonts, from js/xfonts.js ----------------------------------
def x11_fonts():
    text = open(src('js', 'xfonts.js')).read()
    fonts = {}
    for m in re.finditer(r"window\.(\w+)=\{w:(\d+),h:(\d+),first:(\d+),data:'([0-9a-f]+)'\}", text):
        fonts[m.group(1)] = {'w': int(m.group(2)), 'h': int(m.group(3)), 'data': m.group(5)}
    return fonts


def draw_text(px, font, x, y, s, colour):
    w, h, data = font['w'], font['h'], font['data']
    for i, ch in enumerate(s):
        k = ord(ch) - 32
        if k < 0 or k > 94:
            k = 31
        for r in range(h):
            v = int(data[(k * h + r) * 3:(k * h + r) * 3 + 3], 16)
            for b in range(w):
                if v & (1 << (w - 1 - b)):
                    px[y + r][x + i * w + b] = colour


def grid(w, h, fill):
    return [[fill] * w for _ in range(h)]


def emacs(fonts):
    """The twm title bar and Emacs menu bar of the 1997 screenshot."""
    BLACK, WHITE, CLEAR = 0, 1, 2
    colours = [(0, 0, 0), (255, 255, 255), (255, 0, 255)]

    # the dithered title-bar grey: one white pixel in four
    flat_gif([[WHITE, BLACK], [BLACK, BLACK]], 2, 2, colours[:2], 'ra-stipple.gif')

    title = 'emacs@hattrick.media.mit.edu'
    f = fonts['FIXED_7x13B']
    w, h = len(title) * f['w'] + 2, f['h'] + 2
    px = grid(w, h, CLEAR)
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        draw_text(px, f, 1 + dx, 1 + dy, title, BLACK)
    draw_text(px, f, 1, 1, title, WHITE)
    flat_gif(px, w, h, colours, 'ra-title.gif', transparent=CLEAR)

    def button(kind):
        b = grid(15, 15, WHITE)
        for y in range(1, 14):
            for x in range(1, 14):
                b[y][x] = WHITE if (x % 2 == 0 and y % 2 == 0) else BLACK

        def rect(x0, y0, rw, rh, c):
            for y in range(y0, y0 + rh):
                for x in range(x0, x0 + rw):
                    b[y][x] = c
        if kind == 'icon':
            rect(5, 5, 5, 5, WHITE); rect(6, 6, 3, 3, BLACK)
        if kind == 'size':
            rect(3, 3, 9, 9, WHITE); rect(4, 4, 7, 7, BLACK); rect(4, 4, 4, 4, WHITE)
        if kind == 'full':
            rect(3, 3, 9, 9, WHITE); rect(4, 5, 7, 6, BLACK)
        flat_gif(b, 15, 15, colours[:2], 'ra-btn-' + kind + '.gif')
    for k in ('icon', 'full', 'size'):
        button(k)

    menu = 'Buffers File Edit Help'
    f = fonts['FIXED_9x15B']
    w = 5 + len(menu) * f['w'] + 5
    px = grid(w, 20, BLACK)
    draw_text(px, f, 5, 2, menu, WHITE)
    flat_gif(px, w, 20, colours[:2], 'ra-menu.gif')

    # the cursor, a solid block one character cell in size
    flat_gif(grid(7, 15, BLACK), 7, 15, colours[:1], 'ra-cursor.gif')


def firefly():
    GREY = (0xc7, 0xc3, 0xcf)
    jpg(Image.open(src('assets', 'homr', 'banner.png')).resize((557, 77), Image.LANCZOS), 'ff-banner.jpg', 88)
    sp = Image.open(src('assets', 'firefly', 'spiral.png'))
    gif(sp.resize((102, round(102 * sp.height / sp.width)), Image.LANCZOS), 'ff-spiral.gif')

    # the dotted rule under the form
    flat_gif([[i % 2 for i in range(503)]], 503, 1, [(0x4a, 0x4a, 0x52), GREY], 'ff-dots.gif')

    # reviews, sound clip, discography: the tiny icons beside each artist
    rects = {
        'a': [(2, 2, 12, 2), (2, 5, 12, 1), (2, 7, 12, 2)],
        'b': [(1, 4, 2, 3), (3, 3, 1, 5), (4, 2, 1, 7), (5, 1, 1, 9), (8, 3, 1, 5), (10, 2, 1, 1), (11, 3, 1, 5),
              (10, 8, 1, 1), (13, 1, 1, 1), (14, 2, 1, 7), (13, 9, 1, 1)],
        'c': [(2, 7, 3, 2), (4, 2, 1, 6), (9, 6, 3, 2), (11, 1, 1, 6), (4, 2, 4, 1), (8, 1, 4, 1), (13, 4, 2, 5)]
    }
    for k, rs in rects.items():
        px = grid(16, 11, 0)
        for x0, y0, rw, rh in rs:
            for y in range(y0, y0 + rh):
                for x in range(x0, x0 + rw):
                    px[y][x] = 1
        flat_gif(px, 16, 11, [(0, 0, 0), GREY], 'ff-ico-' + k + '.gif')


def yenta():
    for f in sorted(os.listdir(src('assets', 'yenta'))):
        if f.endswith('.png'):
            gif(Image.open(src('assets', 'yenta', f)), 'yn-' + f.replace('_', '-')[:-4] + '.gif')


def kasbah():
    w = Image.open(src('assets', 'kasbah', 'welcome.png'))
    jpg(w.resize((170, round(170 * w.height / w.width)), Image.LANCZOS), 'kb-welcome.jpg', 90)

    # The menu bar is drawn by css/kasbah.css; render it once in each state.
    here = ['home', 'messages', 'agents', 'logout', 'none']
    css = 'file://' + src('css', 'kasbah.css')
    slots = ''
    for i, h in enumerate(here):
        def item(k, t):
            return '<a class="n-%s%s">%s</a>' % (k, ' here' if h == k else '', t)
        slots += ('<div class="slot" style="top:%dpx"><div class="kb-nav" style="margin:0"><div class="rod"></div>%s%s'
                  '<a class="ball"><span>Kasbah</span></a>%s%s</div></div>') % (
            24 + i * 110, item('home', 'home'), item('messages', 'messages'), item('agents', 'agents'), item('logout', 'logout'))
    page = ('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="%s"><style>'
            'html,body{margin:0;background:#fff}.slot{position:absolute;left:24px;width:528px;height:66px}'
            '</style></head><body>%s</body></html>') % (css, slots)
    with tempfile.TemporaryDirectory() as tmp:
        html, png = os.path.join(tmp, 'nav.html'), os.path.join(tmp, 'nav.png')
        open(html, 'w').write(page)
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--window-size=600,600', '--screenshot=' + png, 'file://' + html],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        sheet = Image.open(png).convert('RGB')
        for i, h in enumerate(here):
            # 4px of margin to the left and above, for the shadows and the tall letters
            gif(sheet.crop((20, 18 + i * 110, 20 + 540, 18 + i * 110 + 80)), 'kb-nav-' + h + '.gif')


def thumbs():
    """The live previews on the modern start page, as still pictures."""
    sheet = Image.open(src('screenshots', 'index.png')).convert('RGB')
    for i, name in enumerate(['homr', 'ra', 'yenta', 'kasbah']):
        x = 68 + i * (422 + 32)
        # full size: the start page scales them to the width of its columns
        jpg(sheet.crop((x + 1, 573, x + 421, 573 + 236)), 'thumb-' + name + '.jpg', 85)


def music_icons():
    """The start page's music switch: beamed eighth notes, yellow while the
    music plays, a dimmed lilac with a slash through it when it is off. Drawn
    large and scaled down onto the page's indigo: a GIF at its size on the
    page for browsers of the time, and a PNG four times the size that modern
    browsers pick through srcset when they enlarge the page."""
    from PIL import ImageDraw
    INDIGO, YELLOW, LILAC = (0x41, 0x3f, 0x92), (0xe8, 0xe7, 0x2e), (0xb9, 0xb7, 0xea)
    W, H, K = 20, 18, 16                      # size on the page, and the drawing scale

    def notes(d, colour):
        def head(cx, cy):
            # an oval tilted up to the right, drawn as a polygon
            import math
            pts = []
            for i in range(48):
                t = 2 * math.pi * i / 48
                x, y = 3.0 * math.cos(t), 2.1 * math.sin(t)
                a = -0.38
                pts.append(((cx + x * math.cos(a) - y * math.sin(a)) * K, (cy + x * math.sin(a) + y * math.cos(a)) * K))
            d.polygon(pts, fill=colour)
        head(5.2, 14.6)
        head(14.7, 12.6)
        d.rectangle((7.55 * K, 3.6 * K, 8.55 * K, 14.2 * K), fill=colour)        # stems
        d.rectangle((17.05 * K, 1.6 * K, 18.05 * K, 12.2 * K), fill=colour)
        d.polygon([(7.55 * K, 3.4 * K), (18.05 * K, 1.2 * K), (18.05 * K, 4.0 * K), (7.55 * K, 6.2 * K)], fill=colour)   # beam

    def draw(on):
        big = Image.new('RGB', (W * K, H * K), INDIGO)
        d = ImageDraw.Draw(big)
        if on:
            notes(d, YELLOW)
        else:
            dim = tuple(int(i * 0.55 + c * 0.45) for i, c in zip(INDIGO, LILAC))
            notes(d, dim)
            d.line((1.0 * K, 1.0 * K, 19.0 * K, 17.0 * K), fill=INDIGO, width=int(3.4 * K))   # a gap either side of the slash
            d.line((1.0 * K, 1.0 * K, 19.0 * K, 17.0 * K), fill=LILAC, width=int(1.3 * K))
        return big

    for on in (True, False):
        big, name = draw(on), 'music-' + ('on' if on else 'off')
        gif(big.resize((W, H), Image.LANCZOS), name + '.gif')
        big.resize((W * 4, H * 4), Image.LANCZOS).save(os.path.join(OUT, name + '@4x.png'))


def saver_icon():
    """The start page's way into the screensaver, beside the music note and
    drawn the same way: a small screen with a play sign on it, in yellow."""
    from PIL import ImageDraw
    INDIGO, YELLOW = (0x41, 0x3f, 0x92), (0xe8, 0xe7, 0x2e)
    W, H, K = 20, 18, 16
    big = Image.new('RGB', (W * K, H * K), INDIGO)
    d = ImageDraw.Draw(big)
    d.rounded_rectangle((1.4 * K, 1.2 * K, 18.6 * K, 13.0 * K), radius=int(2.2 * K), outline=YELLOW, width=int(1.5 * K))   # the screen
    d.rectangle((8.6 * K, 13.0 * K, 11.4 * K, 15.2 * K), fill=YELLOW)                                                      # its neck
    d.rounded_rectangle((5.0 * K, 15.0 * K, 15.0 * K, 16.8 * K), radius=int(0.8 * K), fill=YELLOW)                          # and foot
    d.polygon([(7.9 * K, 3.9 * K), (13.6 * K, 7.1 * K), (7.9 * K, 10.3 * K)], fill=YELLOW)                                # play
    gif(big.resize((W, H), Image.LANCZOS), 'saver.gif')
    big.resize((W * 4, H * 4), Image.LANCZOS).save(os.path.join(OUT, 'saver@4x.png'))


def spacer():
    # The canonical 43-byte transparent spacer of the 1990s. Netscape 4 draws
    # stray marks when it stretches a 1x1 GIF encoded any other way.
    open(os.path.join(OUT, 'dot.gif'), 'wb').write(bytes.fromhex(
        '47494638396101000100800000ffffff00000021f90401000000002c00000000010001000002024401003b'))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    spacer()
    music_icons()
    saver_icon()
    emacs(x11_fonts())
    firefly()
    yenta()
    kasbah()
    thumbs()
    print('\n'.join(sorted(os.listdir(OUT))))
