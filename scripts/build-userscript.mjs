import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, "steam-infinite-wishlister.js");
const outputPath = path.join(rootDir, "SteamInfiniteWishlister.user.js");
const checkOnly = process.argv.includes("--check");

const source = await fs.readFile(sourcePath, "utf8");

if (!source.includes("// ==UserScript==") || !source.includes("// ==/UserScript==")) {
  throw new Error("Userscript metadata block not found in source file.");
}

const normalized = source.replace(/\r\n/g, "\n");

if (checkOnly) {
  const currentOutput = await fs.readFile(outputPath, "utf8").catch(() => null);
  if (currentOutput !== normalized) {
    throw new Error(
      "Generated userscript is out of date. Run `npm run build` before publishing."
    );
  }

  console.log("Userscript output is up to date.");
} else {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, normalized);
  console.log(`Generated ${path.relative(rootDir, outputPath)} from steam-infinite-wishlister.js`);
}
