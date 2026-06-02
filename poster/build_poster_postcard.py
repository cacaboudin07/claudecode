#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GTA VI fan poster #2 — vintage 'GREETINGS FROM VICE CITY' postcard.
Big letters reveal a tropical sunset scene; retro sunburst + postage stamp.
Original fan concept art (not affiliated with Rockstar Games / Take-Two)."""
import base64, math, random, pathlib
W, H = 1200, 1800
OUT = pathlib.Path(__file__).parent
random.seed(626)

# ---- embed fonts ----
fontdir = pathlib.Path.home() / ".local/share/fonts"
FONTS = {"Russo One": "RussoOne-Regular.ttf", "Orbitron": "Orbitron",
         "Chakra Petch": "ChakraPetch-Bold.ttf"}
faces = []
for fam, fn in FONTS.items():
    b64 = base64.b64encode((fontdir / fn).read_bytes()).decode()
    faces.append(f"@font-face{{font-family:'{fam}';src:url(data:font/ttf;base64,{b64}) format('truetype');font-weight:400 900;}}")
fontcss = "\n".join(faces)

def sunburst(cx, cy, n=28, R=1500):
    out = ['<g opacity="0.5">']
    for i in range(n):
        a0 = (i / n) * 2 * math.pi
        a1 = ((i + 0.5) / n) * 2 * math.pi
        x0, y0 = cx + math.cos(a0) * R, cy + math.sin(a0) * R
        x1, y1 = cx + math.cos(a1) * R, cy + math.sin(a1) * R
        col = "#f6c66b" if i % 2 == 0 else "#f0b24d"
        out.append(f'<path d="M {cx} {cy} L {x0:.0f} {y0:.0f} L {x1:.0f} {y1:.0f} Z" fill="{col}"/>')
    out.append('</g>')
    return "\n".join(out)

def palm(cx, base_y, scale):
    g = [f'<g fill="#1a0a22" transform="translate({cx},{base_y})">']
    g.append(f'<path d="M {-5*scale:.1f} 0 Q {3*scale:.1f} {-130*scale:.1f} {-7*scale:.1f} {-250*scale:.1f} '
             f'L {6*scale:.1f} {-250*scale:.1f} Q {12*scale:.1f} {-130*scale:.1f} {5*scale:.1f} 0 Z"/>')
    tx, ty = -1*scale, -250*scale
    for ang in (-155, -120, -88, -55, -20, 15):
        a = math.radians(ang); L = 120*scale
        ex, ey = tx + math.cos(a)*L, ty + math.sin(a)*L
        c1x, c1y = tx+(ex-tx)*0.5, ty+(ey-ty)*0.5 - 26*scale
        wx, wy = -math.sin(a)*12*scale, math.cos(a)*12*scale
        g.append(f'<path d="M {tx:.1f} {ty:.1f} Q {c1x:.1f} {c1y:.1f} {ex:.1f} {ey+32*scale:.1f} '
                 f'Q {c1x+wx:.1f} {c1y+wy:.1f} {tx:.1f} {ty:.1f} Z"/>')
    g.append('</g>')
    return "\n".join(g)

# scene revealed inside the letters
def scene():
    s = ['<g>']
    s.append('<rect x="0" y="0" width="1200" height="1800" fill="url(#scenesky)"/>')
    s.append('<circle cx="600" cy="760" r="260" fill="url(#scenesun)"/>')
    # sea
    s.append('<rect x="0" y="980" width="1200" height="820" fill="url(#sea)"/>')
    s.append('<rect x="0" y="975" width="1200" height="10" fill="#ffe39a" opacity="0.8"/>')
    # sun reflection on sea
    s.append('<rect x="540" y="985" width="120" height="600" fill="#ffd16b" opacity="0.45"/>')
    # palms
    s.append(palm(150, 1080, 1.4))
    s.append(palm(1040, 1090, 1.5))
    s.append(palm(940, 1060, 0.9))
    s.append('</g>')
    return "\n".join(s)

# postage stamp (top-right): perforated GTA VI
def stamp(x, y, w=200, h=240):
    g = [f'<g transform="translate({x},{y}) rotate(-6)">']
    g.append(f'<rect x="-10" y="-10" width="{w+20}" height="{h+20}" rx="6" fill="#fff7e6"/>')
    # perforations
    step = 18
    for px in range(0, w+1, step):
        g.append(f'<circle cx="{px}" cy="-10" r="5" fill="#13202b"/>')
        g.append(f'<circle cx="{px}" cy="{h-10}" r="5" fill="#13202b"/>')
    for py in range(0, h+1, step):
        g.append(f'<circle cx="-10" cy="{py}" r="5" fill="#13202b"/>')
        g.append(f'<circle cx="{w-10}" cy="{py}" r="5" fill="#13202b"/>')
    g.append(f'<rect x="6" y="6" width="{w-12}" height="{h-12}" fill="#ff3d7f"/>')
    g.append(f'<circle cx="{w/2}" cy="{h*0.42}" r="46" fill="#ffd23f"/>')
    g.append(f'<text x="{w/2}" y="{h*0.5}" text-anchor="middle" font-family="Russo One" font-size="72" fill="#0a0118" stroke="#fff" stroke-width="2" paint-order="stroke">VI</text>')
    g.append(f'<text x="{w/2}" y="{h-26}" text-anchor="middle" font-family="Orbitron" font-weight="700" font-size="20" letter-spacing="2" fill="#fff">LEONIDA</text>')
    g.append('</g>')
    return "\n".join(g)

SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<style>{fontcss}</style>
<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#fbf0d3"/><stop offset="100%" stop-color="#f2dca8"/>
</linearGradient>
<linearGradient id="scenesky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#3a1team" stop-color="#5a2a86"/>
  <stop offset="30%" stop-color="#c23a86"/>
  <stop offset="58%" stop-color="#ff6a5e"/>
  <stop offset="78%" stop-color="#ffb24d"/>
  <stop offset="100%" stop-color="#ffe27a"/>
</linearGradient>
<linearGradient id="scenesun" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#fff27a"/><stop offset="100%" stop-color="#ff7e4d"/>
</linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#1fb6c9"/><stop offset="100%" stop-color="#0a5a82"/>
</linearGradient>
<radialGradient id="vig" cx="50%" cy="46%" r="72%">
  <stop offset="62%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#3a1d00" stop-opacity="0.45"/>
</radialGradient>
<filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
  <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#5a2a10" flood-opacity="0.45"/>
</filter>
<clipPath id="word">
  <text x="600" y="930"  text-anchor="middle" font-family="Russo One" font-size="300">VICE</text>
  <text x="600" y="1230" text-anchor="middle" font-family="Russo One" font-size="300">CITY</text>
</clipPath>
</defs>

<rect x="0" y="0" width="{W}" height="{H}" fill="url(#paper)"/>
{sunburst(600, 1080)}

<!-- postcard frame -->
<rect x="34" y="34" width="{W-68}" height="{H-68}" rx="14" fill="none" stroke="#fff7e6" stroke-width="10"/>
<rect x="34" y="34" width="{W-68}" height="{H-68}" rx="14" fill="none" stroke="#16242e" stroke-width="2"/>

<!-- GREETINGS FROM -->
<text x="600" y="300" text-anchor="middle" font-family="Chakra Petch" font-weight="700"
      font-size="64" letter-spacing="14" fill="#15323f">GREETINGS FROM</text>
<text x="600" y="356" text-anchor="middle" font-family="Orbitron" font-weight="700"
      font-size="26" letter-spacing="20" fill="#d2553a">THE STATE OF LEONIDA</text>

<!-- hero word: white outline behind, scene inside, dark shadow -->
<g filter="url(#ds)">
  <text x="600" y="930"  text-anchor="middle" font-family="Russo One" font-size="300"
        fill="none" stroke="#fff7e6" stroke-width="26" stroke-linejoin="round">VICE</text>
  <text x="600" y="1230" text-anchor="middle" font-family="Russo One" font-size="300"
        fill="none" stroke="#fff7e6" stroke-width="26" stroke-linejoin="round">CITY</text>
</g>
<g clip-path="url(#word)">{scene()}</g>
<g fill="none" stroke="#16242e" stroke-width="3">
  <text x="600" y="930"  text-anchor="middle" font-family="Russo One" font-size="300">VICE</text>
  <text x="600" y="1230" text-anchor="middle" font-family="Russo One" font-size="300">CITY</text>
</g>

{stamp(990, 1455, w=138, h=168)}

<!-- bottom band -->
<text x="600" y="1410" text-anchor="middle" font-family="Russo One" font-size="120"
      fill="#ff3d7f" stroke="#16242e" stroke-width="4" paint-order="stroke">GTA VI</text>
<text x="600" y="1490" text-anchor="middle" font-family="Orbitron" font-weight="700"
      font-size="40" letter-spacing="16" fill="#15323f">COMING 2026</text>
<line x1="360" y1="1530" x2="840" y2="1530" stroke="#15323f" stroke-width="3"/>
<text x="600" y="1585" text-anchor="middle" font-family="Chakra Petch" font-weight="700"
      font-size="30" letter-spacing="6" fill="#d2553a">SUN  &#183;  CRIME  &#183;  PALM TREES  &#183;  PARADISE</text>

<rect x="0" y="0" width="{W}" height="{H}" fill="url(#vig)"/>
<text x="600" y="1715" text-anchor="middle" font-family="Chakra Petch" font-size="20"
      letter-spacing="3" fill="#6b5a3a" opacity="0.7">ORIGINAL FAN CONCEPT ART &#183; NOT AFFILIATED WITH ROCKSTAR GAMES</text>
</svg>'''

# fix accidental bad stop color token
SVG = SVG.replace('stop-color="#3a1team" stop-color="#5a2a86"', 'stop-color="#5a2a86"')

svg_path = OUT / "gta6_poster_postcard.svg"
png_path = OUT / "gta6_poster_postcard.png"
svg_path.write_text(SVG, encoding="utf-8")
import cairosvg
cairosvg.svg2png(bytestring=SVG.encode("utf-8"), write_to=str(png_path), output_width=W, output_height=H)
print("SVG:", svg_path.stat().st_size, "PNG:", png_path.stat().st_size)
