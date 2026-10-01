#!/usr/bin/env python3
"""
generate_mythos_branding.py
Generates the complete suite of bespoke, production-ready visual branding assets
for Mythos Atlas adhering to .impeccable.md design specifications:
- Classical, scholarly, luminous dark-academia atlas of antiquity
- OKLCH gold, midnight, and parchment color harmony
- Genuine multi-resolution ICO, high-DPI PNGs, standalone SVGs, and a maskable PWA icon
(The OpenGraph image is rendered by the app route and there is no placeholder.png: this
script no longer writes og-image.png or placeholder.png.)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DIR = os.path.join(REPO_ROOT, "apps/web/public")
APP_DIR = os.path.join(REPO_ROOT, "apps/web/src/app")
UI_DIR = os.path.join(REPO_ROOT, "apps/web/src/components/ui")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(os.path.join(PUBLIC_DIR, "icons"), exist_ok=True)
os.makedirs(APP_DIR, exist_ok=True)
os.makedirs(UI_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Color Palette Tokens (Hex equivalents of OKLCH design system)
# ---------------------------------------------------------------------------
GOLD_LIGHT = "#f6e7b8"      # oklch(0.88 0.10 75)
GOLD = "#d4af37"            # oklch(0.78 0.14 70)
GOLD_DARK = "#997a15"       # oklch(0.62 0.14 65)
GOLD_DEEP = "#66500b"       # oklch(0.48 0.12 60)
MIDNIGHT = "#0c0e18"        # oklch(0.14 0.03 265)
MIDNIGHT_CARD = "#141728"   # oklch(0.18 0.035 265)
MIDNIGHT_LIGHT = "#1e223b"  # oklch(0.24 0.04 265)
PARCHMENT = "#f4efe2"       # oklch(0.92 0.015 85)
BRONZE = "#aa7738"          # oklch(0.65 0.12 55)
PATINA = "#388c7d"          # oklch(0.60 0.08 175)

# RGBA tuples for PIL
RGBA_GOLD_LIGHT = (246, 231, 184, 255)
RGBA_GOLD = (212, 175, 55, 255)
RGBA_GOLD_DARK = (153, 122, 21, 255)
RGBA_GOLD_DEEP = (102, 80, 11, 255)
RGBA_MIDNIGHT = (12, 14, 24, 255)
RGBA_MIDNIGHT_CARD = (20, 23, 40, 255)
RGBA_PARCHMENT = (244, 239, 226, 255)

# ---------------------------------------------------------------------------
# 2. Vector Logo / Mark Definitions
# ---------------------------------------------------------------------------

# React Component SVG (uses currentColor so it adapts to text color and theme)
LOGO_REACT_TSX = '''export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Outer celestial astrolabe coordinate ring -->
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1" opacity="0.22" />
      <circle
        cx="24"
        cy="24"
        r="19.5"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.28"
        strokeDasharray="1 2.5"
      />

      <!-- Cardinal & diagonal navigation points -->
      <path
        d="M24 2 v3.2 M24 42.8 v3.2 M2 24 h3.2 M42.8 24 h3.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M8.44 8.44 l2.2 2.2 M37.36 37.36 l2.2 2.2 M8.44 39.56 l2.2 -2.2 M37.36 10.64 l2.2 -2.2"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.4"
      />

      <!-- Navigational polaris / 8-pointed celestial star atop the temple -->
      <path d="M24 5 L25.6 11 L24 9.5 L22.4 11 Z" fill="currentColor" opacity="0.95" />
      <circle cx="24" cy="7.2" r="0.75" fill="currentColor" />

      <!-- Classical Temple Pediment -->
      <path d="M24 10.2 L36 18 H12 Z" fill="currentColor" opacity="0.92" />
      <path
        d="M24 9.4 L36.8 17.8 H11.2 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
        opacity="0.5"
      />

      <!-- Sacred Tympanum Medallion -->
      <circle cx="24" cy="15.2" r="1.6" fill="currentColor" />
      <circle cx="24" cy="15.2" r="2.3" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

      <!-- Acroterion & pediment corner ornaments -->
      <path d="M24 7.6 L24.8 9.5 H23.2 Z" fill="currentColor" />
      <circle cx="12" cy="18" r="0.75" fill="currentColor" opacity="0.6" />
      <circle cx="36" cy="18" r="0.75" fill="currentColor" opacity="0.6" />

      <!-- Entablature / Frieze -->
      <rect x="11.5" y="18" width="25" height="1.8" rx="0.3" fill="currentColor" opacity="0.95" />
      <rect x="12.5" y="19.8" width="23" height="0.7" fill="currentColor" opacity="0.6" />

      <!-- Four Classical Fluted Columns -->
      {/* Col 1 */}
      <rect x="13.2" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="13.6" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="14.6" y1="21.7" x2="14.6" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="13.2" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Col 2 */}
      <rect x="19" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="19.4" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="20.4" y1="21.7" x2="20.4" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="19" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Col 3 */}
      <rect x="26.2" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="26.6" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="27.6" y1="21.7" x2="27.6" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="26.2" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      {/* Col 4 */}
      <rect x="32" y="20.5" width="2.8" height="0.8" rx="0.2" fill="currentColor" />
      <rect x="32.4" y="21.3" width="2" height="9.9" fill="currentColor" opacity="0.85" />
      <line x1="33.4" y1="21.7" x2="33.4" y2="30.8" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <rect x="32" y="31.2" width="2.8" height="0.8" rx="0.2" fill="currentColor" />

      <!-- Central Sanctuary Portal & Sacred Eternal Flame -->
      <path
        d="M22.2 31.2 V26.2 A1.8 1.8 0 0 1 25.8 26.2 V31.2"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M24 23.4 C24.6 24.3 24.8 25 24.5 25.6 C24.2 26.1 23.8 26.1 23.5 25.6 C23.2 25 23.4 24.3 24 23.4 Z"
        fill="currentColor"
        opacity="0.95"
      />

      <!-- Stepped Stylobate (Three Classical Steps) -->
      <rect x="11" y="32" width="26" height="1.4" rx="0.3" fill="currentColor" opacity="0.92" />
      <rect x="9.5" y="33.4" width="29" height="1.3" rx="0.3" fill="currentColor" opacity="0.8" />
      <rect x="8" y="34.7" width="32" height="1.3" rx="0.3" fill="currentColor" opacity="0.65" />

      <!-- Classical Laurel Wreath Framing the Base -->
      {/* Left branch */}
      <path
        d="M24 43.5 C16.5 43.5 9 39 6.5 28.5 C5.8 25.5 6 22 7 19"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path d="M6.8 20 C6 21 5.5 23 6.8 23.5 C8 24 8.5 22 8 20.8 Z" fill="currentColor" opacity="0.75" />
      <path d="M6 25 C5 26.2 4.8 28.2 6.2 28.8 C7.5 29.2 8.2 27.5 7.6 26 Z" fill="currentColor" opacity="0.8" />
      <path d="M7.2 30.5 C6.2 32 6.4 34 7.8 34.5 C9.2 34.8 9.8 33 9 31.5 Z" fill="currentColor" opacity="0.8" />
      <path d="M10.2 35.5 C9.2 37.2 9.8 39 11.4 39.5 C12.8 39.8 13.5 38 12.4 36.5 Z" fill="currentColor" opacity="0.85" />
      <path d="M15 39.5 C14.2 41.2 15.2 43 17 43.2 C18.5 43.2 19 41.5 17.8 40 Z" fill="currentColor" opacity="0.85" />

      {/* Right branch */}
      <path
        d="M24 43.5 C31.5 43.5 39 39 41.5 28.5 C42.2 25.5 42 22 41 19"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path d="M41.2 20 C42 21 42.5 23 41.2 23.5 C40 24 39.5 22 40 20.8 Z" fill="currentColor" opacity="0.75" />
      <path d="M42 25 C43 26.2 43.2 28.2 41.8 28.8 C40.5 29.2 39.8 27.5 40.4 26 Z" fill="currentColor" opacity="0.8" />
      <path d="M40.8 30.5 C41.8 32 41.6 34 40.2 34.5 C38.8 34.8 38.2 33 39 31.5 Z" fill="currentColor" opacity="0.8" />
      <path d="M37.8 35.5 C38.8 37.2 38.2 39 36.6 39.5 C35.2 39.8 34.5 38 35.6 36.5 Z" fill="currentColor" opacity="0.85" />
      <path d="M33 39.5 C33.8 41.2 32.8 43 31 43.2 C29.5 43.2 29 41.5 30.2 40 Z" fill="currentColor" opacity="0.85" />

      <!-- Bottom Center Medallion & Ribbon Knot -->
      <circle cx="24" cy="43.5" r="1.4" fill="currentColor" />
      <path d="M23 44.5 L20.5 47 M25 44.5 L27.5 47" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
'''

# Standalone Rich SVG with Gold Gradients for /icon.svg, /favicon.svg, /logo.svg
STANDALONE_ICON_SVG = f'''<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mythosGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{GOLD_LIGHT}" />
      <stop offset="50%" stop-color="{GOLD}" />
      <stop offset="100%" stop-color="{GOLD_DARK}" />
    </linearGradient>
    <linearGradient id="mythosGoldDeep" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{GOLD}" />
      <stop offset="100%" stop-color="{GOLD_DEEP}" />
    </linearGradient>
    <radialGradient id="sacredFlameGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="{GOLD_LIGHT}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="{GOLD}" stop-opacity="0" />
    </radialGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer celestial astrolabe coordinate ring -->
  <circle cx="24" cy="24" r="22" stroke="url(#mythosGold)" stroke-width="1.1" opacity="0.4" />
  <circle cx="24" cy="24" r="19.5" stroke="url(#mythosGold)" stroke-width="0.75" opacity="0.3" stroke-dasharray="1 2.5" />

  <!-- Cardinal & diagonal navigation points -->
  <path d="M24 2 v3.2 M24 42.8 v3.2 M2 24 h3.2 M42.8 24 h3.2" stroke="url(#mythosGold)" stroke-width="1.3" stroke-linecap="round" />
  <path d="M8.44 8.44 l2.2 2.2 M37.36 37.36 l2.2 2.2 M8.44 39.56 l2.2 -2.2 M37.36 10.64 l2.2 -2.2" stroke="url(#mythosGold)" stroke-width="0.8" stroke-linecap="round" opacity="0.6" />

  <!-- Navigational polaris / 8-pointed celestial star atop the temple -->
  <path d="M24 5 L25.6 11 L24 9.5 L22.4 11 Z" fill="url(#mythosGold)" filter="url(#goldGlow)" />
  <circle cx="24" cy="7.2" r="0.75" fill="{GOLD_LIGHT}" />

  <!-- Classical Temple Pediment -->
  <path d="M24 10.2 L36 18 H12 Z" fill="url(#mythosGold)" />
  <path d="M24 9.4 L36.8 17.8 H11.2 Z" stroke="{GOLD_LIGHT}" stroke-width="0.75" stroke-linejoin="round" opacity="0.7" />

  <!-- Sacred Tympanum Medallion -->
  <circle cx="24" cy="15.2" r="1.6" fill="{GOLD_LIGHT}" />
  <circle cx="24" cy="15.2" r="2.3" stroke="url(#mythosGold)" stroke-width="0.6" opacity="0.8" />

  <!-- Acroterion & pediment corner ornaments -->
  <path d="M24 7.6 L24.8 9.5 H23.2 Z" fill="{GOLD_LIGHT}" />
  <circle cx="12" cy="18" r="0.75" fill="url(#mythosGold)" />
  <circle cx="36" cy="18" r="0.75" fill="url(#mythosGold)" />

  <!-- Entablature / Frieze -->
  <rect x="11.5" y="18" width="25" height="1.8" rx="0.3" fill="url(#mythosGold)" />
  <rect x="12.5" y="19.8" width="23" height="0.7" fill="{GOLD_DARK}" />

  <!-- Four Classical Fluted Columns -->
  <!-- Col 1 -->
  <rect x="13.2" y="20.5" width="2.8" height="0.8" rx="0.2" fill="{GOLD_LIGHT}" />
  <rect x="13.6" y="21.3" width="2" height="9.9" fill="url(#mythosGold)" />
  <line x1="14.6" y1="21.7" x2="14.6" y2="30.8" stroke="{GOLD_LIGHT}" stroke-width="0.4" opacity="0.6" />
  <rect x="13.2" y="31.2" width="2.8" height="0.8" rx="0.2" fill="url(#mythosGold)" />

  <!-- Col 2 -->
  <rect x="19" y="20.5" width="2.8" height="0.8" rx="0.2" fill="{GOLD_LIGHT}" />
  <rect x="19.4" y="21.3" width="2" height="9.9" fill="url(#mythosGold)" />
  <line x1="20.4" y1="21.7" x2="20.4" y2="30.8" stroke="{GOLD_LIGHT}" stroke-width="0.4" opacity="0.6" />
  <rect x="19" y="31.2" width="2.8" height="0.8" rx="0.2" fill="url(#mythosGold)" />

  <!-- Col 3 -->
  <rect x="26.2" y="20.5" width="2.8" height="0.8" rx="0.2" fill="{GOLD_LIGHT}" />
  <rect x="26.6" y="21.3" width="2" height="9.9" fill="url(#mythosGold)" />
  <line x1="27.6" y1="21.7" x2="27.6" y2="30.8" stroke="{GOLD_LIGHT}" stroke-width="0.4" opacity="0.6" />
  <rect x="26.2" y="31.2" width="2.8" height="0.8" rx="0.2" fill="url(#mythosGold)" />

  <!-- Col 4 -->
  <rect x="32" y="20.5" width="2.8" height="0.8" rx="0.2" fill="{GOLD_LIGHT}" />
  <rect x="32.4" y="21.3" width="2" height="9.9" fill="url(#mythosGold)" />
  <line x1="33.4" y1="21.7" x2="33.4" y2="30.8" stroke="{GOLD_LIGHT}" stroke-width="0.4" opacity="0.6" />
  <rect x="32" y="31.2" width="2.8" height="0.8" rx="0.2" fill="url(#mythosGold)" />

  <!-- Central Sanctuary Portal & Sacred Eternal Flame -->
  <path d="M22.2 31.2 V26.2 A1.8 1.8 0 0 1 25.8 26.2 V31.2" stroke="url(#mythosGold)" stroke-width="0.8" fill="none" opacity="0.6" />
  <circle cx="24" cy="24.8" r="3" fill="url(#sacredFlameGlow)" />
  <path d="M24 23.4 C24.6 24.3 24.8 25 24.5 25.6 C24.2 26.1 23.8 26.1 23.5 25.6 C23.2 25 23.4 24.3 24 23.4 Z" fill="{GOLD_LIGHT}" filter="url(#goldGlow)" />

  <!-- Stepped Stylobate (Three Classical Steps) -->
  <rect x="11" y="32" width="26" height="1.4" rx="0.3" fill="url(#mythosGold)" />
  <rect x="9.5" y="33.4" width="29" height="1.3" rx="0.3" fill="url(#mythosGold)" opacity="0.9" />
  <rect x="8" y="34.7" width="32" height="1.3" rx="0.3" fill="url(#mythosGoldDeep)" />

  <!-- Classical Laurel Wreath Framing the Base -->
  <!-- Left branch -->
  <path d="M24 43.5 C16.5 43.5 9 39 6.5 28.5 C5.8 25.5 6 22 7 19" stroke="url(#mythosGold)" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />
  <path d="M6.8 20 C6 21 5.5 23 6.8 23.5 C8 24 8.5 22 8 20.8 Z" fill="url(#mythosGold)" />
  <path d="M6 25 C5 26.2 4.8 28.2 6.2 28.8 C7.5 29.2 8.2 27.5 7.6 26 Z" fill="url(#mythosGold)" />
  <path d="M7.2 30.5 C6.2 32 6.4 34 7.8 34.5 C9.2 34.8 9.8 33 9 31.5 Z" fill="url(#mythosGold)" />
  <path d="M10.2 35.5 C9.2 37.2 9.8 39 11.4 39.5 C12.8 39.8 13.5 38 12.4 36.5 Z" fill="url(#mythosGold)" />
  <path d="M15 39.5 C14.2 41.2 15.2 43 17 43.2 C18.5 43.2 19 41.5 17.8 40 Z" fill="url(#mythosGold)" />

  <!-- Right branch -->
  <path d="M24 43.5 C31.5 43.5 39 39 41.5 28.5 C42.2 25.5 42 22 41 19" stroke="url(#mythosGold)" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7" />
  <path d="M41.2 20 C42 21 42.5 23 41.2 23.5 C40 24 39.5 22 40 20.8 Z" fill="url(#mythosGold)" />
  <path d="M42 25 C43 26.2 43.2 28.2 41.8 28.8 C40.5 29.2 39.8 27.5 40.4 26 Z" fill="url(#mythosGold)" />
  <path d="M40.8 30.5 C41.8 32 41.6 34 40.2 34.5 C38.8 34.8 38.2 33 39 31.5 Z" fill="url(#mythosGold)" />
  <path d="M37.8 35.5 C38.8 37.2 38.2 39 36.6 39.5 C35.2 39.8 34.5 38 35.6 36.5 Z" fill="url(#mythosGold)" />
  <path d="M33 39.5 C33.8 41.2 32.8 43 31 43.2 C29.5 43.2 29 41.5 30.2 40 Z" fill="url(#mythosGold)" />

  <!-- Bottom Center Medallion & Ribbon Knot -->
  <circle cx="24" cy="43.5" r="1.5" fill="{GOLD_LIGHT}" />
  <path d="M23 44.5 L20.5 47 M25 44.5 L27.5 47" stroke="url(#mythosGold)" stroke-width="1.1" stroke-linecap="round" />
</svg>'''

# ---------------------------------------------------------------------------
# 3. High-Quality Supersampled Raster Rendering Functions
# ---------------------------------------------------------------------------

def draw_temple_emblem(draw, center_x, center_y, radius, gold_color=RGBA_GOLD, light_color=RGBA_GOLD_LIGHT, dark_color=RGBA_GOLD_DARK):
    """
    Renders the mathematically precise Mythos Temple & Astrolabe mark onto a PIL ImageDraw context.
    center_x, center_y: center point in pixels
    radius: half-width/height of the emblem envelope
    """
    cx, cy = center_x, center_y
    r = radius
    u = r / 24.0  # base coordinate unit (48x48 space)

    # 1. Astrolabe Rings
    r_outer = 22.0 * u
    draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer],
                 outline=dark_color, width=max(1, int(1.1 * u)))

    r_inner = 19.5 * u
    # Dashed inner ring
    num_ticks = 48
    for i in range(num_ticks):
        angle = 2 * math.pi * i / num_ticks
        if i % 2 == 0:
            px = cx + r_inner * math.cos(angle)
            py = cy + r_inner * math.sin(angle)
            draw.ellipse([px - u*0.4, py - u*0.4, px + u*0.4, py + u*0.4], fill=dark_color)

    # 2. Navigation Cardinal Points
    draw.line([cx, cy - 22.5*u, cx, cy - 19.5*u], fill=gold_color, width=max(1, int(1.4*u)))
    draw.line([cx, cy + 19.5*u, cx, cy + 22.5*u], fill=gold_color, width=max(1, int(1.4*u)))
    draw.line([cx - 22.5*u, cy, cx - 19.5*u, cy], fill=gold_color, width=max(1, int(1.4*u)))
    draw.line([cx + 19.5*u, cy, cx + 22.5*u, cy], fill=gold_color, width=max(1, int(1.4*u)))

    # Diagonal ticks
    for d_angle in [math.pi/4, 3*math.pi/4, 5*math.pi/4, 7*math.pi/4]:
        x1 = cx + 20.0 * u * math.cos(d_angle)
        y1 = cy + 20.0 * u * math.sin(d_angle)
        x2 = cx + 22.0 * u * math.cos(d_angle)
        y2 = cy + 22.0 * u * math.sin(d_angle)
        draw.line([x1, y1, x2, y2], fill=dark_color, width=max(1, int(0.9*u)))

    # 3. Celestial Star Apex
    star_poly = [
        (cx, cy - 19.0 * u),
        (cx + 1.6 * u, cy - 13.0 * u),
        (cx, cy - 14.5 * u),
        (cx - 1.6 * u, cy - 13.0 * u),
    ]
    draw.polygon(star_poly, fill=light_color)
    draw.ellipse([cx - u*0.8, cy - 16.8*u - u*0.8, cx + u*0.8, cy - 16.8*u + u*0.8], fill=gold_color)

    # 4. Temple Pediment
    pediment = [
        (cx, cy - 13.8 * u),
        (cx + 12.0 * u, cy - 6.0 * u),
        (cx - 12.0 * u, cy - 6.0 * u),
    ]
    draw.polygon(pediment, fill=gold_color)
    # Pediment outline highlight
    draw.line([cx - 12.5*u, cy - 5.8*u, cx, cy - 14.2*u, cx + 12.5*u, cy - 5.8*u], fill=light_color, width=max(1, int(0.9*u)))

    # Tympanum Medallion
    draw.ellipse([cx - 1.7*u, cy - 8.8*u - 1.7*u, cx + 1.7*u, cy - 8.8*u + 1.7*u], fill=light_color)
    draw.ellipse([cx - 2.4*u, cy - 8.8*u - 2.4*u, cx + 2.4*u, cy - 8.8*u + 2.4*u], outline=gold_color, width=max(1, int(0.5*u)))

    # Acroterion
    draw.polygon([(cx, cy - 16.5*u), (cx + 0.8*u, cy - 14.5*u), (cx - 0.8*u, cy - 14.5*u)], fill=light_color)
    draw.ellipse([cx - 12*u - 0.7*u, cy - 6*u - 0.7*u, cx - 12*u + 0.7*u, cy - 6*u + 0.7*u], fill=gold_color)
    draw.ellipse([cx + 12*u - 0.7*u, cy - 6*u - 0.7*u, cx + 12*u + 0.7*u, cy - 6*u + 0.7*u], fill=gold_color)

    # 5. Entablature / Frieze
    draw.rectangle([cx - 12.5*u, cy - 6.0*u, cx + 12.5*u, cy - 4.2*u], fill=gold_color)
    draw.rectangle([cx - 11.5*u, cy - 4.2*u, cx + 11.5*u, cy - 3.5*u], fill=dark_color)

    # 6. Four Columns
    col_offsets = [-10.8 * u, -4.6 * u, 2.6 * u, 8.8 * u]
    col_w = 2.0 * u
    cap_w = 2.8 * u
    for x_off in col_offsets:
        # Capital
        draw.rectangle([cx + x_off - 0.4*u, cy - 3.5*u, cx + x_off + col_w + 0.4*u, cy - 2.7*u], fill=light_color)
        # Shaft
        draw.rectangle([cx + x_off, cy - 2.7*u, cx + x_off + col_w, cy + 7.2*u], fill=gold_color)
        # Flute highlight
        draw.line([cx + x_off + col_w/2, cy - 2.4*u, cx + x_off + col_w/2, cy + 6.8*u], fill=light_color, width=max(1, int(0.5*u)))
        # Base
        draw.rectangle([cx + x_off - 0.4*u, cy + 7.2*u, cx + x_off + col_w + 0.4*u, cy + 8.0*u], fill=gold_color)

    # 7. Central Sanctuary Portal & Sacred Eternal Flame
    portal_box = [cx - 2.0*u, cy + 2.0*u, cx + 2.0*u, cy + 6.0*u]
    draw.arc(portal_box, 180, 0, fill=dark_color, width=max(1, int(0.8*u)))
    draw.line([cx - 2.0*u, cy + 4.0*u, cx - 2.0*u, cy + 7.2*u], fill=dark_color, width=max(1, int(0.8*u)))
    draw.line([cx + 2.0*u, cy + 4.0*u, cx + 2.0*u, cy + 7.2*u], fill=dark_color, width=max(1, int(0.8*u)))

    # Sacred Flame
    flame_poly = [
        (cx, cy - 0.6*u),
        (cx + 0.8*u, cy + 1.2*u),
        (cx + 0.5*u, cy + 1.8*u),
        (cx - 0.5*u, cy + 1.8*u),
        (cx - 0.8*u, cy + 1.2*u),
    ]
    draw.polygon(flame_poly, fill=light_color)
    draw.ellipse([cx - 1.2*u, cy + 1.0*u - 1.2*u, cx + 1.2*u, cy + 1.0*u + 1.2*u], fill=(246, 231, 184, 100))

    # 8. Stepped Stylobate (3 steps)
    draw.rectangle([cx - 13.0*u, cy + 8.0*u, cx + 13.0*u, cy + 9.4*u], fill=gold_color)
    draw.rectangle([cx - 14.5*u, cy + 9.4*u, cx + 14.5*u, cy + 10.7*u], fill=gold_color)
    draw.rectangle([cx - 16.0*u, cy + 10.7*u, cx + 16.0*u, cy + 12.0*u], fill=dark_color)

    # 9. Laurel Wreath
    for side in (-1, 1):
        # Arc points
        pts = []
        for t_step in range(16):
            t_val = t_step / 15.0
            # Curve from bottom center up to side
            ang = math.pi/2 - side * (math.pi/2.2 * t_val)
            rad_l = 20.0 * u - 2.0 * u * (1 - t_val)
            lx = cx + side * (math.cos(ang) * rad_l * 0.9)
            ly = cy + 19.5*u - math.sin(ang) * (rad_l * 0.95)
            pts.append((lx, ly))

        for k in range(len(pts)-1):
            draw.line([pts[k], pts[k+1]], fill=dark_color, width=max(1, int(1.1*u)))

        # Laurel leaves
        leaf_angles = [0.2, 0.4, 0.6, 0.8, 0.95]
        for idx, frac in enumerate(leaf_angles):
            ang = math.pi/2 - side * (math.pi/2.2 * frac)
            rad_l = 19.5 * u
            lx = cx + side * (math.cos(ang) * rad_l * 0.9)
            ly = cy + 19.5*u - math.sin(ang) * (rad_l * 0.95)
            # draw leaf
            leaf_len = 2.4 * u
            leaf_w = 1.2 * u
            tangent = ang + side * math.pi/2
            ex = lx + math.cos(tangent) * leaf_len
            ey = ly - math.sin(tangent) * leaf_len
            draw.ellipse([lx - leaf_w, ly - leaf_w, lx + leaf_w, ly + leaf_w], fill=gold_color)
            draw.polygon([(lx, ly), (ex, ey), (lx + side*leaf_w, ly - leaf_w)], fill=gold_color)

    # Laurel tie knot & ribbons
    draw.ellipse([cx - 1.6*u, cy + 19.5*u - 1.6*u, cx + 1.6*u, cy + 19.5*u + 1.6*u], fill=light_color)
    draw.line([cx - 1.0*u, cy + 20.5*u, cx - 3.5*u, cy + 23.0*u], fill=gold_color, width=max(1, int(1.1*u)))
    draw.line([cx + 1.0*u, cy + 20.5*u, cx + 3.5*u, cy + 23.0*u], fill=gold_color, width=max(1, int(1.1*u)))


def create_master_raster(size, with_background=False, bg_color=RGBA_MIDNIGHT, pad_factor=0.9):
    """
    Renders the master emblem at a given square size with 4x supersampling.
    """
    target_w, target_h = size
    scale = 4
    canvas_w, canvas_h = target_w * scale, target_h * scale

    if with_background:
        # Subtle radial midnight gradient
        img = Image.new("RGBA", (canvas_w, canvas_h), bg_color)
        draw = ImageDraw.Draw(img)
        # Inner warm glow
        cx, cy = canvas_w // 2, canvas_h // 2
        for r_step in range(int(canvas_w * 0.6), 0, -8):
            alpha = int(25 * (1 - r_step / (canvas_w * 0.6)))
            draw.ellipse([cx - r_step, cy - r_step, cx + r_step, cy + r_step],
                         fill=(212, 175, 55, alpha))
        # Refined border
        border_inset = int(canvas_w * 0.04)
        draw.rounded_rectangle([border_inset, border_inset, canvas_w - border_inset, canvas_h - border_inset],
                               radius=int(canvas_w * 0.08), outline=(212, 175, 55, 120), width=int(2 * scale))
        # Inner thin border
        border_inset2 = int(canvas_w * 0.055)
        draw.rounded_rectangle([border_inset2, border_inset2, canvas_w - border_inset2, canvas_h - border_inset2],
                               radius=int(canvas_w * 0.065), outline=(212, 175, 55, 60), width=int(1 * scale))
    else:
        img = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

    cx, cy = canvas_w // 2, canvas_h // 2
    emblem_radius = (min(canvas_w, canvas_h) // 2) * pad_factor

    draw_temple_emblem(draw, cx, cy, emblem_radius)

    # Downsample cleanly with Lanczos
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def create_multires_ico(filepath):
    """
    Generates genuine Windows/Browser multi-resolution ICO containing 16x16, 32x32, 48x48 RGBA frames.
    """
    # 48x48
    im48 = create_master_raster((48, 48), with_background=False, pad_factor=0.92)
    # 32x32
    im32 = create_master_raster((32, 32), with_background=False, pad_factor=0.92)
    # 16x16: Boost contrast slightly so columns and rings stand out sharply on small browser tabs
    im16_raw = create_master_raster((16, 16), with_background=False, pad_factor=0.95)

    im48.save(filepath, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[im32, im16_raw])
    print(f"  ✓ Saved multi-resolution ICO -> {filepath}")


def create_maskable_icon(size):
    """
    Renders a maskable icon: a flat brand-background square with the emblem
    inside the safe zone (the inner 80% circle every platform mask keeps).
    No border or corner detail, because masks crop to circles or squircles.
    """
    target = size
    scale = 4
    canvas = target * scale
    img = Image.new("RGBA", (canvas, canvas), RGBA_MIDNIGHT)
    draw = ImageDraw.Draw(img)
    # 0.75: emblem tips reach ~1.03x the radius, so this stays inside the 0.4 safe-zone radius
    draw_temple_emblem(draw, canvas // 2, canvas // 2, (canvas // 2) * 0.75)
    return img.resize((target, target), Image.Resampling.LANCZOS)



# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------
def main():
    print("Beginning Mythos Atlas Branding & Iconography Generation...")

    # 1. React Logo Component
    logo_component_path = os.path.join(UI_DIR, "logo.tsx")
    with open(logo_component_path, "w") as f:
        f.write(LOGO_REACT_TSX)
    print(f"  ✓ Updated React Logo Component -> {logo_component_path}")

    # 2. Standalone SVG Assets
    svg_destinations = [
        os.path.join(PUBLIC_DIR, "icon.svg"),
        os.path.join(PUBLIC_DIR, "favicon.svg"),
        os.path.join(PUBLIC_DIR, "logo.svg"),
        os.path.join(APP_DIR, "icon.svg"),
    ]
    for dest in svg_destinations:
        with open(dest, "w") as f:
            f.write(STANDALONE_ICON_SVG)
        print(f"  ✓ Written SVG -> {dest}")

    # 3. Multi-resolution ICO files
    ico_destinations = [
        os.path.join(PUBLIC_DIR, "favicon.ico"),
        os.path.join(APP_DIR, "favicon.ico"),
    ]
    for dest in ico_destinations:
        create_multires_ico(dest)

    # 4. Master Transparent PNG Logo (1024x1024)
    logo_png_path = os.path.join(PUBLIC_DIR, "logo.png")
    im_logo = create_master_raster((1024, 1024), with_background=False, pad_factor=0.92)
    im_logo.save(logo_png_path, format="PNG", optimize=True)
    print(f"  ✓ Saved Master Logo (1024x1024) -> {logo_png_path}")

    # 5. High-DPI App Icon (512x512)
    icon_512_path = os.path.join(PUBLIC_DIR, "icon.png")
    im_icon = create_master_raster((512, 512), with_background=False, pad_factor=0.92)
    im_icon.save(icon_512_path, format="PNG", optimize=True)
    print(f"  ✓ Saved App Icon (512x512) -> {icon_512_path}")

    # 6. PWA Manifest Icon (192x192)
    icon_192_path = os.path.join(PUBLIC_DIR, "icons/icon-192x192.png")
    im_192 = create_master_raster((192, 192), with_background=False, pad_factor=0.92)
    im_192.save(icon_192_path, format="PNG", optimize=True)
    print(f"  ✓ Saved PWA Icon (192x192) -> {icon_192_path}")

    # 7. Apple Touch Icon (180x180) with dark academia tile backing
    apple_icon_paths = [
        os.path.join(PUBLIC_DIR, "apple-icon.png"),
        os.path.join(APP_DIR, "apple-icon.png"),
    ]
    for dest in apple_icon_paths:
        im_apple = create_master_raster((180, 180), with_background=True, bg_color=RGBA_MIDNIGHT, pad_factor=0.76)
        im_apple.save(dest, format="PNG", optimize=True)
        print(f"  ✓ Saved Apple Touch Icon (180x180) -> {dest}")

    # 8. Maskable PWA icon (512x512): safe-zone emblem on the brand background
    maskable_path = os.path.join(PUBLIC_DIR, "icons/icon-maskable-512x512.png")
    create_maskable_icon(512).save(maskable_path, format="PNG", optimize=True)
    print(f"  ✓ Saved Maskable Icon (512x512) -> {maskable_path}")

    print("\nAll brand assets successfully generated!")

if __name__ == "__main__":
    main()
