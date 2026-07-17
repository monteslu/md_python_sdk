#!/usr/bin/env node
import path from "node:path";
import { statSync } from "node:fs";
import { buildMd } from "../compiler/build-md.mjs";
const [cmd, ...rest] = process.argv.slice(2);
const fail = (m) => { console.error(m); process.exit(1); };
if (cmd === "build") {
  const entry = rest.find((a) => !a.startsWith("-"));
  if (!entry) fail("usage: mdpy build <main.py> [-o game.bin]");
  const oi = rest.indexOf("-o");
  const out = oi >= 0 ? rest[oi + 1] : path.join(path.dirname(entry), "game.bin");
  try { const r = await buildMd(entry, out, {}); console.log(`${r.outPath} (${statSync(r.outPath).size} bytes)`); }
  catch (e) { fail(String(e.message ?? e)); }
} else fail("usage: mdpy build <main.py> [-o game.bin]");
