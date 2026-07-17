// build-md.mjs - build an mdpy (Python) game to a Sega Genesis .bin ROM.
//
// Pipeline: Python --(pycretro)--> Genesis C (SGDK), bundled with the md_api.c
// runtime, -> buildGenesisC (romdev-toolchain-m68k-gcc: cc1-m68k -> as -> ld ->
// objcopy, all WASM) -> finalizeGenesisRom (pad + $18E checksum). Byte-identical
// to the mdlua path (same toolchain driver).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildGenesisC, finalizeGenesisRom, parseBuildLog } from "romdev-toolchain-m68k-gcc";
import { compile, formatDiagnostics } from "pycretro";
import { sheetAssetsHeader } from "./asset-headers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SDK_DIR = path.resolve(__dirname, "..", "md-sdk");
const rd = (f) => readFile(path.join(SDK_DIR, f), "utf8");

// XGM2 song bank -> md_songs.c (256-byte aligned; music(n) plays bank order n).
function songsBankC(blobs) {
  if (!blobs.length) return "const unsigned char *const md_song_bank[1] = {0};\nconst int md_song_count = 0;\n";
  const names = blobs.map((_, i) => `md_song_${i}`);
  let c = "";
  blobs.forEach((b, i) => { c += `__attribute__((aligned(256))) static const unsigned char ${names[i]}[${b.length}] = {${Array.from(b).join(",")}};\n`; });
  c += `const unsigned char *const md_song_bank[${names.length}] = {${names.join(",")}};\nconst int md_song_count = ${names.length};\n`;
  return c;
}

export async function buildMd(entryPy, outPath, opts = {}) {
  const src = await readFile(entryPy, "utf8");
  const res = compile(src, path.basename(entryPy), { target: "md" });
  if (!res.ok) throw new Error(formatDiagnostics(res.diagnostics.filter((d) => d.severity === "error")));

  const sources = {
    "main.c": res.c,
    "md_api.c": await rd("md_api.c"),
    "md_math.c": await rd("md_math.c"),
    "md_anim.c": await rd("md_anim.c"),
    "md_pycretro.c": await rd("md_pycretro.c"),
  };

  // Audio: bake mixer.music songs into the XGM2 song bank. mixer.music.load
  // takes a .vgm (converted via romdev-xgm2) or precompiled .xgc; no file but
  // the program uses music -> the SGDK demo tune so music(0) Just Works.
  const usesMusic = /\bmd_music\b/.test(res.c);
  const songBlobs = [];
  if (usesMusic) {
    if (res.music && res.music.length) {
      const { vgmToXgm2 } = await import("romdev-xgm2");
      for (const m of res.music) {
        let bytes = new Uint8Array(await readFile(path.join(entryDir, m.path)));
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) { const { gunzipSync } = await import("node:zlib"); bytes = new Uint8Array(gunzipSync(bytes)); }
        songBlobs.push(m.path.endsWith(".xgc") ? bytes : vgmToXgm2(bytes, { packed: true }));
      }
    } else {
      const { shareDir } = await import("romdev-toolchain-m68k-gcc");
      songBlobs.push(new Uint8Array(await readFile(path.join(shareDir, "lib", "sgdk", "music", "demo.xgc"))));
    }
  }
  sources["md_songs.c"] = songsBankC(songBlobs);
  sources["md_sfx_data.c"] = "const unsigned char *const md_sfx_bank[1] = {0};\nconst unsigned long md_sfx_len[1] = {0};\nconst int md_sfx_count = 0;\n";
  const headers = {
    "md_api.h": await rd("md_api.h"),
    "md_math.h": await rd("md_math.h"),
    "md_sintab.h": await rd("md_sintab.h"),
    "md_pycretro.h": await rd("md_pycretro.h"),
  };

  // Sheet asset: bake the pygame.image.load PNGs (cell order = load order).
  const entryDir = path.dirname(path.resolve(entryPy));
  if (res.images && res.images.length) {
    const first = res.images[0];
    const bytes = new Uint8Array(await readFile(path.join(entryDir, first.path)));
    headers["md_assets.h"] = "#define MD_HAVE_SHEET 1\n" + sheetAssetsHeader(bytes, first.path, "sheet");
  } else {
    headers["md_assets.h"] = "// no assets in this build\n";
  }

  const r = await buildGenesisC({ sources, headers, sgdk: true });
  if (!r.ok) {
    const parsed = parseBuildLog ? parseBuildLog(r.log) : null;
    const detail = parsed?.errors?.map((e) => `${e.file}:${e.line}: ${e.message}`).join("\n") || (r.log || "").slice(-2000);
    throw new Error(`mdpy: ${r.stage} failed\n${detail}`);
  }
  const rom = finalizeGenesisRom(r.binary);
  await mkdir(path.dirname(path.resolve(outPath)), { recursive: true });
  await writeFile(outPath, rom);
  return { ok: true, outPath: path.resolve(outPath), c: res.c, log: r.log };
}
