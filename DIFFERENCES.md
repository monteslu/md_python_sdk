# mdpython: differences from Python (and pygame)

mdpython compiles a **static subset** of Python to a real Sega Genesis / Mega Drive ROM (68000). Your
code runs as native machine code, not on a Python interpreter, so some Python
you know isn't available. Every unsupported feature is a compile error that
tells you what to write instead.

## Native resolution: 320 x 224

`pygame.display.set_mode((320, 224))` **must** use exactly this — console
screens are a fixed size. A wrong size is a compile error naming the right one.

Shape drawing (`circfill`/`rectfill`/`line`) uses a **256 x 160 software
canvas anchored at the top-left** of the screen — draw shape art within
x 0..255, y 0..159. Hardware sprites, `print` text, and `blit` use the full
320 x 224.

## Numbers are 16.16 fixed point

No big integers, no IEEE floats. A number is a machine `int` or a 16.16
fixed-point value. `x = 5` is an int; `x = 0.5` is fixed. Integer overflow
wraps at 16 bits.

## Conditions are booleans (no truthiness)

`while running:` works because `running` holds `True`/`False`. `while
count:` is an error — write `while count > 0:`.

## No dicts with runtime keys, no exceptions

Use a **class** with fields instead of a dict. There's no exception runtime —
use `assert cond, "message"` to check invariants (a debug-build trap with the
line number).

## The frame loop is yours, and it's real

Keep pygame's `while running:` loop. `clock.tick(60)` compiles to the
hardware vblank wait — it really paces your game to 60 fps. Do one frame of
work per iteration.

## What pygame surface exists

Honest on this hardware: `pygame.draw.*`, `image.load` + `blit` (hardware
sprites), `Rect` + `colliderect`, `key.get_pressed`, `mixer` (music/
Sound), `font.render`, `sprite.Group` (fixed-capacity pools). Refused: per-
pixel Surface access, runtime Surface construction, per-pixel alpha, TrueType
fonts (a fixed tile font is used). See the pycretro SPEC for the full list.
