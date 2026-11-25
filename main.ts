// main.ts — build entry for Kuali Emas (best-cooking-game-20261125-0137).
// Node 22+, standard library only. Copies game/ and screenshots/ into the
// output directory (MAKEFUN_OUTPUT_DIR when set, otherwise ./output) and
// writes dossier.json by calling buildDossier from the kit's vendor library.
// Deterministic: files copied in sorted order, no timestamps or random values.
import { mkdirSync, readdirSync, rmSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR || join(ROOT, 'output');

function copySorted(srcDir: string, dstDir: string): void {
  mkdirSync(dstDir, { recursive: true });
  const entries = readdirSync(srcDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const src = join(srcDir, e.name);
    const dst = join(dstDir, e.name);
    if (e.isDirectory()) copySorted(src, dst);
    else if (e.isFile()) copyFileSync(src, dst);
  }
}

function main(): void {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  copySorted(join(ROOT, 'game'), join(OUT, 'game'));
  copySorted(join(ROOT, 'screenshots'), join(OUT, 'screenshots'));
  const dossier = buildDossier(OUT, {
    text_max_bytes: 1572864, // dossier at most 1.5 MiB
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 48 * 1024 * 1024,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(OUT, 'dossier.json'), dossier);
}

main();
