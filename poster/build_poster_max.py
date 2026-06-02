#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GTA VI fan poster — MAX edition.
Premium synthwave Vice City scene: retro sun, chrome 'VI', palm boulevard with
a car driving into the sunset, neon city, wet-road reflections, bloom + grain.
Original fan concept art (not affiliated with Rockstar Games / Take-Two)."""
import base64, math, random, pathlib
W, H = 1600, 2400
HZ = 1180            # horizon
VX = 800             # vanishing point x
OUT = pathlib.Path(__file__).parent
random.seed(626)

# ---- embed fonts ----
fontdir = pathlib.Path.home() / ".local/share/fonts"
FONTS = {"Russo One": "RussoOne-Regular.ttf", "Orbitron": "Orbitron",
         "Chakra Petch": "ChakraPetch-Bold.ttf"}
fontcss = "\n".join(
    f"@font-face{{font-family:'{fam}';src:url(data:font/ttf;base64,"
    f"{base64.b64encode((fontdir/fn).read_bytes()).decode()}) format('truetype');font-weight:400 900;}}"
    for fam, fn in FONTS.items())

def stars(n):
    o = []
    for _ in range(n):
        x, y = random.uniform(0, W), random.uniform(20, HZ-520)
        r = random.uniform(0.6, 2.4); op = random.uniform(.25, .95)
        o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="#fff" opacity="{op:.2f}"/>')
    # a couple of shooting-star streaks
    for _ in range(3):
        x, y = random.uniform(120, W-200), random.uniform(120, 520)
        o.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x+90:.0f}" y2="{y+26:.0f}" stroke="#cfe8ff" stroke-width="2" opacity="0.5"/>')
    return "\n".join(o)

def sun_mask():
    r = ['<rect width="1600" height="2400" fill="white"/>']
    y, th = 880, 5
    while y < 1210:
        r.append(f'<rect x="0" y="{y:.1f}" width="1600" height="{th:.1f}" fill="black"/>')
        y += th + 12; th += 3.6
    return "\n".join(r)

def skyline():
    o = ['<g fill="#170a28">']; x = -20
    while x < W+20:
        bw = random.uniform(40, 110); bh = random.uniform(80, 320)
        top = HZ-bh
        o.append(f'<rect x="{x:.1f}" y="{top:.1f}" width="{bw:.1f}" height="{bh+6:.1f}"/>')
        wy = top+14
        while wy < HZ-12:
            if random.random() < 0.45:
                o.append(f'<rect x="{x+random.uniform(7,max(9,bw-14)):.1f}" y="{wy:.1f}" width="5" height="7" fill="#ffd76b" opacity="{random.uniform(.4,.95):.2f}"/>')
            wy += 22
        x += bw + random.uniform(3, 14)
    o.append('</g>'); return "\n".join(o)

def road():
    # asphalt trapezoid + perspective lane lines + dashed center
    o = [f'<path d="M 720 {HZ} L 880 {HZ} L 1360 {H} L 240 {H} Z" fill="url(#asphalt)"/>']
    o.append('<g stroke="#1ef0ff" stroke-width="2" opacity="0.45" filter="url(#bloom)">')
    for bx in (240, 470, 700, 900, 1130, 1360):
        tx = VX + (bx-VX)*0.10
        o.append(f'<line x1="{bx}" y1="{H}" x2="{tx:.0f}" y2="{HZ}"/>')
    o.append('</g>')
    # perspective horizontal ticks
    o.append('<g stroke="#ff2d95" stroke-width="2" opacity="0.30">')
    n = 12
    for i in range(1, n+1):
        t = i/n; y = HZ + (H-HZ)*(t**1.9)
        o.append(f'<line x1="0" y1="{y:.1f}" x2="{W}" y2="{y:.1f}"/>')
    o.append('</g>')
    # dashed center line in perspective
    o.append('<g fill="#ffe27a" filter="url(#bloom)">')
    k = 0
    while k < 9:
        t0 = (k/9)**1.6; t1=((k+0.5)/9)**1.6
        y0 = HZ + (H-HZ)*t0; y1 = HZ + (H-HZ)*t1
        wtop = 3 + 30*t0; wbot = 3 + 30*t1
        o.append(f'<path d="M {VX-wtop/2:.1f} {y0:.1f} L {VX+wtop/2:.1f} {y0:.1f} L {VX+wbot/2:.1f} {y1:.1f} L {VX-wbot/2:.1f} {y1:.1f} Z"/>')
        k += 1
    o.append('</g>')
    return "\n".join(o)

def palm(cx, base_y, scale, fill="#0c0518"):
    g = [f'<g fill="{fill}" transform="translate({cx},{base_y})">']
    g.append(f'<path d="M {-6*scale:.1f} 0 Q {3*scale:.1f} {-150*scale:.1f} {-8*scale:.1f} {-290*scale:.1f} '
             f'L {7*scale:.1f} {-290*scale:.1f} Q {14*scale:.1f} {-150*scale:.1f} {6*scale:.1f} 0 Z"/>')
    tx, ty = -1*scale, -290*scale
    for ang in (-156,-124,-92,-60,-28,6,30):
        a = math.radians(ang); L = 145*scale
        ex, ey = tx+math.cos(a)*L, ty+math.sin(a)*L
        c1x, c1y = tx+(ex-tx)*0.5, ty+(ey-ty)*0.5 - 30*scale
        wx, wy = -math.sin(a)*13*scale, math.cos(a)*13*scale
        g.append(f'<path d="M {tx:.1f} {ty:.1f} Q {c1x:.1f} {c1y:.1f} {ex:.1f} {ey+38*scale:.1f} '
                 f'Q {c1x+wx:.1f} {c1y+wy:.1f} {tx:.1f} {ty:.1f} Z"/>')
    g.append(f'<circle cx="{tx:.1f}" cy="{ty:.1f}" r="{10*scale:.1f}"/>')
    g.append('</g>'); return "\n".join(g)

def car(cx, by, s):
    """low muscle-car rear view, backlit."""
    g = [f'<g transform="translate({cx},{by}) scale({s})">']
    # ground shadow
    g.append('<ellipse cx="0" cy="36" rx="250" ry="34" fill="#000" opacity="0.55" filter="url(#bloom)"/>')
    # wheels
    for wx in (-168, 168):
        g.append(f'<rect x="{wx-46}" y="-6" width="92" height="58" rx="20" fill="#07030f"/>')
    # body
    body = ("M -210 18 "
            "L -210 -22 Q -208 -64 -150 -76 "
            "L -120 -100 Q -60 -132 0 -132 Q 60 -132 120 -100 "
            "L 150 -76 Q 208 -64 210 -22 L 210 18 "
            "Q 210 40 188 40 L -188 40 Q -210 40 -210 18 Z")
    g.append(f'<path d="{body}" fill="#0a0612"/>')
    # rim light (sun behind)
    g.append(f'<path d="M -150 -76 L -120 -100 Q -60 -132 0 -132 Q 60 -132 120 -100 L 150 -76" '
             f'fill="none" stroke="#ff8fbf" stroke-width="5" opacity="0.9" filter="url(#bloom)"/>')
    g.append('<path d="M -210 -18 Q -208 -58 -152 -72 M 210 -18 Q 208 -58 152 -72" '
             'fill="none" stroke="#ffd36b" stroke-width="4" opacity="0.7" filter="url(#bloom)"/>')
    # rear light bar
    g.append('<rect x="-150" y="-26" width="300" height="16" rx="8" fill="#ff2b4d" filter="url(#bloom)"/>')
    g.append('<rect x="-150" y="-24" width="300" height="6" rx="3" fill="#ff8a8a"/>')
    g.append('</g>'); return "\n".join(g)

def palm_glow(cx, base_y, scale):
    """neon-backlit palm so it reads against the dark boulevard."""
    halo = palm(cx, base_y, scale, fill="#ff2d95")
    halo = halo.replace('<g fill="#ff2d95"', '<g fill="#ff2d95" filter="url(#neon)" opacity="0.55"', 1)
    return halo + "\n" + palm(cx, base_y, scale, fill="#0b0418")

scene_palms = "\n".join([
    # hero palms flanking the sun (dark silhouettes against the sky)
    palm(250, 1240, 1.95), palm(1355, 1240, 2.05),
    # neon-lit boulevard palms, receding
    palm_glow(440, 1425, 0.50), palm_glow(1175, 1432, 0.52),
    palm_glow(325, 1690, 0.82), palm_glow(1285, 1705, 0.86),
])

SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<style>{fontcss}</style>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#0c0726"/><stop offset="16%" stop-color="#241047"/>
  <stop offset="34%" stop-color="#5a1e72"/><stop offset="52%" stop-color="#a8266f"/>
  <stop offset="68%" stop-color="#e83b66"/><stop offset="82%" stop-color="#ff7a4d"/>
  <stop offset="93%" stop-color="#ffb44d"/><stop offset="100%" stop-color="#ffe07a"/>
</linearGradient>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#fff58a"/><stop offset="42%" stop-color="#ff9f3c"/>
  <stop offset="100%" stop-color="#ff2d77"/>
</linearGradient>
<linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#3a134a"/><stop offset="40%" stop-color="#1b0a30"/>
  <stop offset="100%" stop-color="#070213"/>
</linearGradient>
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#ffffff"/><stop offset="16%" stop-color="#9fe0ff"/>
  <stop offset="38%" stop-color="#2f74da"/><stop offset="49%" stop-color="#0a2350"/>
  <stop offset="51%" stop-color="#27407e"/><stop offset="60%" stop-color="#ff9ad6"/>
  <stop offset="76%" stop-color="#ff4fa3"/><stop offset="90%" stop-color="#ffd36b"/>
  <stop offset="100%" stop-color="#9c5a0e"/>
</linearGradient>
<radialGradient id="halo" cx="50%" cy="40%" r="42%">
  <stop offset="0%" stop-color="#ff77a8" stop-opacity="0.6"/><stop offset="100%" stop-color="#ff77a8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vig" cx="50%" cy="40%" r="78%">
  <stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.62"/>
</radialGradient>
<linearGradient id="reflfade" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<mask id="sunmask">{sun_mask()}</mask>
<mask id="reflmask"><rect x="0" y="{HZ}" width="{W}" height="900" fill="url(#reflfade)"/></mask>
<filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
  <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="neon" x="-70%" y="-70%" width="240%" height="240%">
  <feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
  <feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
  <feColorMatrix type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer></filter>
</defs>

<rect width="{W}" height="{HZ}" fill="url(#sky)"/>
<rect x="0" y="{HZ}" width="{W}" height="{H-HZ}" fill="#070213"/>
{stars(220)}
<rect width="{W}" height="{HZ}" fill="url(#halo)"/>

<!-- retro sun -->
<g mask="url(#sunmask)"><circle cx="{VX}" cy="980" r="420" fill="url(#sun)" filter="url(#soft)"/></g>

{skyline()}
<rect x="0" y="{HZ-4}" width="{W}" height="8" fill="#2ef6ff" filter="url(#neon)" opacity="0.9"/>

{road()}
{scene_palms}
{car(VX, 1690, 1.18)}

<!-- wordmark -->
<text x="{VX}" y="330" text-anchor="middle" font-family="Orbitron" font-weight="800"
      font-size="60" letter-spacing="22" fill="#fff" filter="url(#soft)">GRAND THEFT AUTO</text>

<!-- chrome VI -->
<text x="{VX}" y="1010" text-anchor="middle" font-family="Russo One" font-size="600"
      fill="none" stroke="#ffd36b" stroke-width="22" filter="url(#neon)" opacity="0.85">VI</text>
<text x="{VX}" y="1010" text-anchor="middle" font-family="Russo One" font-size="600"
      fill="url(#chrome)" stroke="#06122a" stroke-width="9" paint-order="stroke">VI</text>

<!-- VICE CITY neon + wet reflection -->
<g mask="url(#reflmask)" transform="translate(0,{2*2110}) scale(1,-1)" opacity="0.55">
  <text x="{VX}" y="2110" text-anchor="middle" font-family="Russo One" font-size="190"
        letter-spacing="6" fill="#ff2e9a" filter="url(#neon)">VICE CITY</text>
</g>
<text x="{VX}" y="2110" text-anchor="middle" font-family="Russo One" font-size="190"
      letter-spacing="6" fill="#ff2e9a" stroke="#06121c" stroke-width="5" paint-order="stroke" filter="url(#neon)">VICE CITY</text>

<text x="{VX}" y="2230" text-anchor="middle" font-family="Orbitron" font-weight="800"
      font-size="58" letter-spacing="20" fill="#ffd76b" filter="url(#soft)">COMING 2026</text>

<!-- post fx -->
<rect width="{W}" height="{H}" fill="url(#vig)"/>
<g opacity="0.08">{''.join(f'<rect x="0" y="{y}" width="{W}" height="2" fill="#000"/>' for y in range(0,H,5))}</g>
<rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.5"/>

<text x="{VX}" y="2360" text-anchor="middle" font-family="Chakra Petch" font-size="22"
      letter-spacing="3" fill="#9aa" opacity="0.55">ORIGINAL FAN CONCEPT ART &#183; NOT AFFILIATED WITH ROCKSTAR GAMES</text>
</svg>'''

svg_path = OUT / "gta6_poster_max.svg"; png_path = OUT / "gta6_poster_max.png"
svg_path.write_text(SVG, encoding="utf-8")
import cairosvg
cairosvg.svg2png(bytestring=SVG.encode("utf-8"), write_to=str(png_path),
                 output_width=W, output_height=H)
print("SVG:", svg_path.stat().st_size, "PNG:", png_path.stat().st_size)
