#!/usr/bin/env node
// mdpython CLI - build and run pygame-flavored Python for the Sega Genesis.
import path from "node:path";
import { statSync } from "node:fs";
import { buildMd } from "../compiler/build-md.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const fail = (m) => { console.error(m); process.exit(1); };

if (cmd === "build") {
  const entry = rest.find((a) => !a.startsWith("-"));
  if (!entry) fail("usage: mdpython build <main.py> [-o game.bin]");
  const oi = rest.indexOf("-o");
  const out = oi >= 0 ? rest[oi + 1] : path.join(path.dirname(entry), "game.bin");
  try {
    const r = await buildMd(entry, out, {});
    console.log(`${r.outPath} (${statSync(r.outPath).size} bytes)`);
  } catch (e) { fail(String(e.message ?? e)); }
} else if (cmd === "run") {
  const target = rest.find((a) => !a.startsWith("-"));
  if (!target) fail("usage: mdpython run <main.py|game.bin>");
  let rom = target;
  if (target.endsWith(".py")) {
    const out = path.join(path.dirname(target), "game.bin");
    await buildMd(target, out, {});
    rom = out;
  }
  try {
    const { runRom } = await import("./mdpython-run.mjs");
    await runRom(rom);
  } catch (e) {
    if (e.code === "SDL_UNAVAILABLE") fail("@kmamal/sdl not available - install it or run the .bin in any Genesis emulator");
    fail(String(e.message ?? e));
  }
} else {
  fail("usage: mdpython build <main.py> [-o game.bin]\n       mdpython run   <main.py|game.bin>");
}
