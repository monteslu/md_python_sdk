# mdpy

Write **Sega Genesis / Mega Drive** games in a pygame-flavored **Python** that
compiles to native 68000 (via SGDK). Part of the pycretro console-Python family
(with gbapy for GBA and gtpy for GameTank).

```sh
mdpy build examples/hello/main.py -o hello.bin
```

`npm install` brings the m68k-gcc + SGDK WASM toolchain and the Genesis Plus GX
core. The compiler front-end is `pycretro`. Familiar, not compatible.

Status: early bring-up (0.0.x).
