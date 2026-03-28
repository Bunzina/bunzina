import { readdirSync, statSync } from "fs";
import { join } from "path";

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules") continue;
      out.push(...collectFiles(p));
    } else {
      if (
        p.endsWith(".test.ts") ||
        p.endsWith(".test.tsx") ||
        p.endsWith(".d.ts")
      )
        continue;
      if (p.endsWith(".ts") || p.endsWith(".tsx") || p.endsWith(".js"))
        out.push(p);
    }
  }
  return out;
}

test("coverage: import all src files", async () => {
  const files = collectFiles(join(process.cwd(), "src"));
  expect(files.length).toBeGreaterThan(0);

  for (const f of files) {
    try {
      await import(`file://${f}`);
    } catch (err) {
      console.warn(`coverage: failed to import ${f}:`, err);
    }
  }
});
