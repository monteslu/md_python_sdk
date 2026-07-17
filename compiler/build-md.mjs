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
    // empty song/sfx banks (md_api.c references these; real audio lands in M2
    // via romdev-xgm2, matching the mdlua audio-assets pipeline).
    "md_songs.c": "const unsigned char *const md_song_bank[1] = {0};\nconst int md_song_count = 0;\n",
    "md_sfx_data.c": "const unsigned char *const md_sfx_bank[1] = {0};\nconst unsigned long md_sfx_len[1] = {0};\nconst int md_sfx_count = 0;\n",
  };
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
