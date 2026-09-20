#!/usr/bin/env python3
"""Regenerate PWA icon PNGs from the brand spec (rich black + neon GO)."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter

BG = '#0a0a0e'
GREEN = (46, 229, 157)
WHITE = (248, 250, 252)
OUT_DIR = __file__.rsplit('/', 1)[0]


def load_font(size):
    for path in (
        '/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
        '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf',
        '/Library/Fonts/Georgia Bold.ttf',
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def render_icon(size, filename):
    base = Image.new('RGBA', (size, size), BG)
    font = load_font(int(size * 0.42))
    text = 'GO'
    probe = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    bbox = probe.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1] - int(size * 0.02)

    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for _, alpha in ((0, 170), (2, 120), (4, 70)):
        gd.text((x, y), text, font=font, fill=(*GREEN, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(2, size // 45)))

    composed = Image.alpha_composite(base, glow)
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(fg).text((x, y), text, font=font, fill=(*WHITE, 255))
    composed = Image.alpha_composite(composed, fg)
    composed.convert('RGB').save(f'{OUT_DIR}/{filename}', format='PNG', optimize=True)


if __name__ == '__main__':
    render_icon(180, 'apple-touch-icon.png')
    render_icon(192, 'icon-192.png')
    render_icon(512, 'icon-512.png')
    print('Icons written to', OUT_DIR)
