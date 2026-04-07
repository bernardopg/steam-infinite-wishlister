import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Ordem de inserção: dependências primeiro, main.js por último (contém metadata block)
const MODULE_ORDER = [
  "src/config.js",
  "src/utils.js",
  "src/state.js",
  "src/game.js",
  "src/wishlist.js",
  "src/queue.js",
  "src/ageSkip.js",
  "src/ui.js",
  "src/loop.js",
  "src/main.js", // deve ser o último — contém metadata block
];

/**
 * Remove linhas de `import ...` e `export ...` do código, já que tudo será concatenado.
 */
function stripImports(code) {
  return code
    .split("\n")
    .filter((line) => !/^import\s/.test(line))
    .filter((line) => !/^export\s/.test(line))
    .filter((line) => !/^export\s*\{/.test(line))
    .join("\n");
}

/**
 * Verifica se um arquivo contém o bloco de metadata de userscript.
 */
function hasMetadata(code) {
  return code.includes("// ==UserScript==") && code.includes("// ==/UserScript==");
}

/**
 * Extrai o bloco metadata de um arquivo.
 */
function extractMetadata(code) {
  const start = code.indexOf("// ==UserScript==");
  const end = code.indexOf("// ==/UserScript==");
  if (start === -1 || end === -1) return "";
  return code.slice(start, end + "// ==/UserScript==".length);
}

/**
 * Extrai o corpo do arquivo (tudo após o metadata block).
 */
function extractBody(code) {
  const marker = "// ==/UserScript==";
  const idx = code.indexOf(marker);
  if (idx === -1) return code.trim();
  return code.slice(idx + marker.length).trim();
}

async function readSource(modulePath) {
  const fullPath = path.join(rootDir, modulePath);
  return fs.readFile(fullPath, "utf8");
}

async function build() {
  console.log("[build] Lendo módulos...");

  const files = await Promise.all(
    MODULE_ORDER.map(async (m) => {
      const code = await readSource(m);
      return { module: m, code };
    })
  );

  const mainFile = files[files.length - 1];
  if (!hasMetadata(mainFile.code)) {
    throw new Error(
      `Metadata block not found in ${mainFile.module}. Expected // ==UserScript== ... // ==/UserScript==`
    );
  }

  const metadata = extractMetadata(mainFile.code);
  // Aplica stripImports no corpo do main.js também (imports após metadata block)
  const mainBody = stripImports(extractBody(mainFile.code));

  // Monta o corpo final: todos os módulos (sem imports/exports) + corpo do main
  const bodies = [
    ...files.slice(0, -1).map((f) => `// === Begin: ${f.module} ===\n${stripImports(f.code)}\n// === End: ${f.module} ===`),
    `// === Begin: ${mainFile.module} (body) ===\n${mainBody}\n// === End: ${mainFile.module} ===`,
  ];

  const output = metadata + "\n\n" + bodies.join("\n\n") + "\n";
  const normalized = output.replace(/\r\n/g, "\n");

  const outPath = path.join(rootDir, "SteamInfiniteWishlister.user.js");
  await fs.writeFile(outPath, normalized);
  console.log(`[build] Gerado ${path.relative(rootDir, outPath)}`);

  // Também copia para steam-infinite-wishlister.js para manter compatibilidade
  const compatPath = path.join(rootDir, "steam-infinite-wishlister.js");
  await fs.writeFile(compatPath, normalized);
  console.log(`[build] Copiado para ${path.relative(rootDir, compatPath)}`);
}

async function check() {
  const mainFile = await readSource("src/main.js");
  if (!hasMetadata(mainFile)) {
    throw new Error("src/main.js must contain // ==UserScript== metadata block.");
  }

  // Verifica que todos os módulos do MODULE_ORDER existem
  for (const m of MODULE_ORDER) {
    const fullPath = path.join(rootDir, m);
    const exists = await fs
      .stat(fullPath)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      throw new Error(`Module not found: ${m}`);
    }
  }

  const currentOutput = await fs
    .readFile(path.join(rootDir, "SteamInfiniteWishlister.user.js"), "utf8")
    .catch(() => null);
  if (currentOutput === null) {
    throw new Error(
      "SteamInfiniteWishlister.user.js does not exist. Run `npm run build` first."
    );
  }

  // Regenerate in memory and compare
  console.log("[check] Rebuilding in memory...");

  const files = await Promise.all(
    MODULE_ORDER.map(async (m) => {
      const code = await readSource(m);
      return { module: m, code };
    })
  );

  const metadata = extractMetadata(files[files.length - 1].code);
  const mainBody = stripImports(extractBody(files[files.length - 1].code));

  const bodies = [
    ...files.slice(0, -1).map((f) => `// === Begin: ${f.module} ===\n${stripImports(f.code)}\n// === End: ${f.module} ===`),
    `// === Begin: ${files[files.length - 1].module} (body) ===\n${mainBody}\n// === End: ${files[files.length - 1].module} ===`,
  ];

  const output = metadata + "\n\n" + bodies.join("\n\n") + "\n";
  const normalized = output.replace(/\r\n/g, "\n");

  if (currentOutput !== normalized) {
    throw new Error(
      "Generated userscript is out of date. Run `npm run build` before publishing.\n" +
      "Tip: run `diff <(cat SteamInfiniteWishlister.user.js) <(npm run build --silent && cat SteamInfiniteWishlister.user.js)` to see differences."
    );
  }

  console.log("[check] Userscript output is up to date.");
}

const checkOnly = process.argv.includes("--check");
try {
  if (checkOnly) {
    await check();
  } else {
    await build();
  }
} catch (err) {
  console.error("[build] Error:", err.message);
  process.exit(1);
}