# mdpython asset formats

How images and audio get from files on disk into a Sega Genesis ROM. All
asset paths resolve **relative to your `main.py`**, and every filename must be
a **constant string** (assets are baked at build time; a cartridge has no
filesystem).

## Images (`pygame.image.load`)

```python
hero = pygame.image.load("hero.png")
screen.blit(hero, (x, y))          # composed from 8x8 hardware sprites
```

- **Format: PNG** (indexed or RGBA; decoded by the SDK's pure-JS reader).
- **Size: 16 x 16 pixels** per loaded image (a 2x2 block of 8px VDP cells —
  the Genesis composes bigger sprites out of 8x8 cells).
- **Colors: 15 + transparent.** The image converts to VDP 4bpp and its
  palette loads into **PAL1**, the sprite palette line (16 colors shared by
  all sprites). Draw your sprites from one shared color set.
- **Transparency:** palette index 0 / transparent alpha = transparent.
- The first loaded image currently defines the sheet; multi-image packing on
  Genesis follows the GBA model in a later pass.

## Music (`pygame.mixer.music`)

```python
pygame.mixer.music.load("song.vgm")  # bank slot n, in load order
pygame.mixer.music.play(-1)          # -1 = loop forever, 0 = once
pygame.mixer.music.stop()
```

- **Formats:**
  - **`.vgm`** — export from DefleMask or Furnace (the standard Mega Drive
    tracker flow). Converted at build time to XGM2 with a byte-identical
    pure-JS port of SGDK's xgm2tool.
  - **`.vgz`** — gzipped VGM, inflated automatically.
  - **`.xgc`** — an already-compiled XGM2 blob (SGDK/xgm2tool output) passes
    straight through.
- **No `music.load` at all?** `music.play(-1)` still works — the SGDK demo
  tune is baked as track 0 so sound Just Works.
- Playback is the Z80 XGM2 driver: YM2612 FM + PSG, off the main CPU.

## Sound effects (`pygame.mixer.Sound`)

```python
blip = pygame.mixer.Sound("blip.wav")
blip.play()
```

**Partially wired:** `.wav` samples are not yet baked into the XGM2 PCM bank,
so `.play()` falls back to the runtime's **PSG blip** — you hear a simple
beep regardless of which file you named. Real sampled effects (8-bit 13.3kHz
XGM2 PCM, like the Lua SDK's `--sfx`) are a planned addition.

## Colors (no image involved)

The Genesis hardware shows up to 64 on-screen colors (4 palette lines x 16,
from 512): this SDK uses PAL0 for the 16-color PICO-8 program palette and
PAL1 for the sprite sheet's palette. `(r, g, b)` tuples quantize at compile
time to the nearest of the 16 program-palette colors; integers 0-15 are
PICO-8 indices directly.
Shape drawing (`circfill`/`rectfill`/`line`) renders into the 256 x 160
canvas at the top-left of the 320 x 224 screen (see DIFFERENCES.md).

## Quick reference

| asset | formats | constraint |
|---|---|---|
| sprite image | PNG | 16x16, ≤16 colors, loads into PAL1 |
| music | .vgm .vgz .xgc | VGM converts via a byte-identical xgm2tool port; demo tune default |
| sound effect | .wav | **not baked yet** - plays a PSG blip fallback |
| colors | (r,g,b) or 0-15 | quantized to the PICO-8 16 at compile time |
