import { test } from "node:test";
import assert from "node:assert";
import { compile } from "pycretro";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));

test("hello compiles to Genesis C with md harness + frame sync", () => {
  const src = readFileSync(path.join(dir, "..", "examples", "hello", "main.py"), "utf8");
  const r = compile(src, "main.py", { target: "md" });
  assert.ok(r.ok, r.diagnostics.map(d=>d.message).join("\n"));
  assert.match(r.c, /int main\(bool hard\)/);
  assert.match(r.c, /md_init\(\)/);
  assert.match(r.c, /md_vsync\(\)/);      // clock.tick lowering
  assert.match(r.c, /md_cls/);
});

test("image.load + blit emits md_spr", () => {
  const c = compile(`img = pygame.image.load("h.png")\nrunning = True\nwhile running:\n    screen.blit(img, (10, 20))\n    clock.tick(60)\n`, "m.py", { target: "md" });
  assert.ok(c.ok);
  assert.match(c.c, /md_spr\(0, 10, 20, 2, 2, 0\)/);
});
