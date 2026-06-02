#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate an original synthwave / Vice City fan-poster for GTA VI.
Outputs a vector SVG and a high-res PNG. Fan concept art (not affiliated
with Rockstar Games / Take-Two)."""
import base64, math, random, pathlib

W, H = 1200, 1800
HZ = 1085                      # horizon line
VX = 600                       # vanishing point x
OUT = pathlib.Path(__file__).parent
random.seed(626)               # deterministic

# ---------- embed fonts (portable SVG) ----------
FONTS = {
    "Russo One": "RussoOne-Regular.ttf",
    "Orbitron":  "Orbitron",
    "Chakra Petch": "ChakraPetch-Bold.ttf",
}
fontdir = pathlib.Path.home() / ".local/share/fonts"
faces = []
for fam, fn in FONTS.items():
    data = (fontdir / fn).read_bytes()
    b64 = base64.b64encode(data).decode()
    faces.append(
        f"@font-face{{font-family:'{fam}';src:url(data:font/ttf;base64,{b64}) format('truetype');font-weight:400 900;}}"
    )
fontcss = "\n".join(faces)

# ---------- helpers ----------
def stars(n):
    out = []
    for _ in range(n):
        x = random.uniform(0, W)
        y = random.uniform(20, HZ - 360)
        r = random.uniform(0.6, 2.2)
        o = random.uniform(0.25, 0.95)
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="#fff" opacity="{o:.2f}"/>')
    return "\n".join(out)

def skyline():
    """dark city silhouette sitting on the horizon."""
    out = ['<g fill="#160a26">']
    x = -20
    while x < W + 20:
        bw = random.uniform(34, 88)
        bh = random.uniform(60, 240)
        top = HZ - bh
        out.append(f'<rect x="{x:.1f}" y="{top:.1f}" width="{bw:.1f}" height="{bh+4:.1f}"/>')
        # a couple of lit windows
        wy = top + 12
        while wy < HZ - 10:
            if random.random() < 0.5:
                wx = x + random.uniform(6, max(8, bw - 12))
                out.append(f'<rect x="{wx:.1f}" y="{wy:.1f}" width="4" height="6" fill="#ffd76b" opacity="{random.uniform(.4,.9):.2f}"/>')
            wy += 18
        x += bw + random.uniform(2, 10)
    out.append('</g>')
    return "\n".join(out)

def grid():
    out = ['<g stroke="#1ef0ff" stroke-width="2.2" filter="url(#gridglow)" opacity="0.9">']
    # vertical converging lines
    bx = -1400
    while bx < W + 1400:
        out.append(f'<line x1="{bx}" y1="{H}" x2="{VX}" y2="{HZ}"/>')
        bx += 150
    # horizontal lines with perspective spacing
    n = 16
    for i in range(1, n + 1):
        t = i / n
        y = HZ + (H - HZ) * (t ** 1.9)
        out.append(f'<line x1="0" y1="{y:.1f}" x2="{W}" y2="{y:.1f}"/>')
    out.append('</g>')
    return "\n".join(out)

def palm(cx, base_y, scale, flip=False):
    s = -scale if flip else scale
    g = [f'<g fill="#0c0518" transform="translate({cx},{base_y})">']
    # trunk
    g.append(f'<path d="M {-6*scale:.1f} 0 '
             f'Q {2*s:.1f} {-160*scale:.1f} {-8*s:.1f} {-300*scale:.1f} '
             f'L {6*s:.1f} {-300*scale:.1f} '
             f'Q {14*s:.1f} {-160*scale:.1f} {6*scale:.1f} 0 Z"/>')
    top_x, top_y = -1 * s, -300 * scale
    # fronds (drooping leaves)
    for ang in (-150, -120, -85, -55, -25, 5, 25):
        a = math.radians(ang)
        L = 150 * scale
        ex = top_x + math.cos(a) * L * (1 if not flip else 1)
        ey = top_y + math.sin(a) * L
        droop = 40 * scale
        cx1 = top_x + (ex - top_x) * 0.5
        cy1 = top_y + (ey - top_y) * 0.5 - 30 * scale
        wx, wy = -math.sin(a) * 14 * scale, math.cos(a) * 14 * scale
        g.append(f'<path d="M {top_x:.1f} {top_y:.1f} '
                 f'Q {cx1:.1f} {cy1:.1f} {ex:.1f} {ey+droop:.1f} '
                 f'Q {cx1+wx:.1f} {cy1+wy:.1f} {top_x:.1f} {top_y:.1f} Z"/>')
    g.append(f'<circle cx="{top_x:.1f}" cy="{top_y:.1f}" r="{10*scale:.1f}"/>')
    g.append('</g>')
    return "\n".join(g)

def sun_stripe_mask():
    rects = ['<rect x="0" y="0" width="1200" height="1800" fill="white"/>']
    # black stripes over lower portion of sun, thicker downward
    y = 760
    th = 4
    while y < 1120:
        rects.append(f'<rect x="0" y="{y:.1f}" width="1200" height="{th:.1f}" fill="black"/>')
        y += th + 10
        th += 3.2
    return "\n".join(rects)

SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<style>{fontcss}</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#150a2b"/>
  <stop offset="22%" stop-color="#3a1259"/>
  <stop offset="42%" stop-color="#742073"/>
  <stop offset="60%" stop-color="#c41f6b"/>
  <stop offset="78%" stop-color="#ff5d63"/>
  <stop offset="92%" stop-color="#ff9a4d"/>
  <stop offset="100%" stop-color="#ffd06b"/>
</linearGradient>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#fff27a"/>
  <stop offset="45%" stop-color="#ff974d"/>
  <stop offset="100%" stop-color="#ff2d77"/>
</linearGradient>
<linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#ffe7ff"/>
  <stop offset="42%" stop-color="#ff5ed1"/>
  <stop offset="100%" stop-color="#21d4ff"/>
</linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#1a0530"/>
  <stop offset="100%" stop-color="#05010d"/>
</linearGradient>
<radialGradient id="halo" cx="50%" cy="46%" r="38%">
  <stop offset="0%" stop-color="#ff6ea8" stop-opacity="0.55"/>
  <stop offset="100%" stop-color="#ff6ea8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vig" cx="50%" cy="42%" r="75%">
  <stop offset="60%" stop-color="#000" stop-opacity="0"/>
  <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
</radialGradient>
<filter id="gridglow" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur stdDeviation="3" result="b"/>
  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="neon" x="-60%" y="-60%" width="220%" height="220%">
  <feGaussianBlur stdDeviation="11" result="b1"/>
  <feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="softneon" x="-60%" y="-60%" width="220%" height="220%">
  <feGaussianBlur stdDeviation="6" result="b1"/>
  <feMerge><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<mask id="sunmask">{sun_stripe_mask()}</mask>
</defs>

<!-- sky + ground -->
<rect x="0" y="0" width="{W}" height="{HZ}" fill="url(#sky)"/>
<rect x="0" y="{HZ}" width="{W}" height="{H-HZ}" fill="url(#ground)"/>
{stars(170)}
<rect x="0" y="0" width="{W}" height="{HZ}" fill="url(#halo)"/>

<!-- retro sun -->
<g mask="url(#sunmask)">
  <circle cx="{VX}" cy="900" r="335" fill="url(#sun)" filter="url(#softneon)"/>
</g>

<!-- skyline + horizon glow -->
{skyline()}
<rect x="0" y="{HZ-3}" width="{W}" height="6" fill="#2ef6ff" filter="url(#neon)" opacity="0.9"/>

<!-- perspective grid -->
{grid()}

<!-- palms -->
{palm(120, HZ+6, 1.15)}
{palm(1085, HZ+6, 1.25, flip=True)}
{palm(250, HZ+2, 0.62)}

<!-- wordmark -->
<text x="{VX}" y="250" text-anchor="middle" font-family="Orbitron" font-weight="700"
      font-size="46" letter-spacing="16" fill="#ffffff" opacity="0.95"
      filter="url(#softneon)">GRAND THEFT AUTO</text>

<!-- mega VI -->
<text x="{VX}" y="780" text-anchor="middle" font-family="Russo One"
      font-size="430" fill="url(#title)" stroke="#0a0118" stroke-width="6"
      filter="url(#neon)" paint-order="stroke">VI</text>

<!-- VICE CITY -->
<text x="{VX}" y="1340" text-anchor="middle" font-family="Russo One"
      font-size="150" letter-spacing="6" fill="#ff2e9a" stroke="#06121c"
      stroke-width="4" paint-order="stroke" filter="url(#neon)">VICE CITY</text>

<!-- tagline -->
<text x="{VX}" y="1470" text-anchor="middle" font-family="Chakra Petch" font-weight="700"
      font-size="40" letter-spacing="10" fill="#7ef9ff" filter="url(#softneon)">
      &#9733; WELCOME TO LEONIDA &#9733;</text>
<text x="{VX}" y="1545" text-anchor="middle" font-family="Orbitron" font-weight="700"
      font-size="48" letter-spacing="14" fill="#ffd76b">COMING 2026</text>

<!-- overlays -->
<rect x="0" y="0" width="{W}" height="{H}" fill="url(#vig)"/>
<g opacity="0.10">
{''.join(f'<rect x="0" y="{y}" width="{W}" height="2" fill="#000"/>' for y in range(0, H, 4))}
</g>

<!-- disclaimer -->
<text x="{VX}" y="1770" text-anchor="middle" font-family="Chakra Petch"
      font-size="20" letter-spacing="3" fill="#9aa" opacity="0.6">
      ORIGINAL FAN CONCEPT ART &#183; NOT AFFILIATED WITH ROCKSTAR GAMES</text>
</svg>'''

svg_path = OUT / "gta6_poster.svg"
png_path = OUT / "gta6_poster.png"
svg_path.write_text(SVG, encoding="utf-8")

import cairosvg
cairosvg.svg2png(bytestring=SVG.encode("utf-8"), write_to=str(png_path),
                 output_width=W, output_height=H)
print("SVG:", svg_path, svg_path.stat().st_size, "bytes")
print("PNG:", png_path, png_path.stat().st_size, "bytes")
