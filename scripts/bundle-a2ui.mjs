#!/usr/bin/env node
/**
 * A2UI bundle script (Node.js). Same behavior as bundle-a2ui.sh for Windows and CI.
 * Run from repo root: node scripts/bundle-a2ui.mjs
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const HASH_FILE = join(ROOT_DIR, "src/canvas-host/a2ui/.bundle.hash");
const OUTPUT_FILE = join(ROOT_DIR, "src/canvas-host/a2ui/a2ui.bundle.js");
const A2UI_RENDERER_DIR = join(ROOT_DIR, "vendor/a2ui/renderers/lit");
const A2UI_APP_DIR = join(ROOT_DIR, "apps/shared/OpenClawKit/Tools/CanvasA2UI");

function fail(msg) {
  console.error("A2UI bundling failed. Re-run with: pnpm canvas:a2ui:bundle");
  console.error("If this persists, verify pnpm deps and try again.");
  if (msg) console.error(msg);
  process.exit(1);
}

function walk(entryPath, files = []) {
  const st = statSync(entryPath);
  if (st.isDirectory()) {
    for (const entry of readdirSync(entryPath)) {
      walk(join(entryPath, entry), files);
    }
    return files;
  }
  files.push(entryPath);
  return files;
}

function computeHashSync() {
  const inputPaths = [
    join(ROOT_DIR, "package.json"),
    join(ROOT_DIR, "pnpm-lock.yaml"),
    A2UI_RENDERER_DIR,
    A2UI_APP_DIR,
  ];
  const files = [];
  for (const p of inputPaths) {
    if (existsSync(p)) walk(p, files);
  }
  const norm = (p) => relative(ROOT_DIR, p).replace(/\\/g, "/");
  files.sort((a, b) => norm(a).localeCompare(norm(b)));
  const hash = createHash("sha256");
  for (const filePath of files) {
    hash.update(norm(filePath));
    hash.update("\0");
    hash.update(readFileSync(filePath));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function main() {
  if (!existsSync(A2UI_RENDERER_DIR) || !existsSync(A2UI_APP_DIR)) {
    if (existsSync(OUTPUT_FILE)) {
      console.log("A2UI sources missing; keeping prebuilt bundle.");
      process.exit(0);
    }
    fail(`A2UI sources missing and no prebuilt bundle found at: ${OUTPUT_FILE}`);
  }

  const currentHash = computeHashSync();

  if (existsSync(HASH_FILE) && existsSync(OUTPUT_FILE)) {
    const previousHash = readFileSync(HASH_FILE, "utf8").trim();
    if (previousHash === currentHash) {
      console.log("A2UI bundle up to date; skipping.");
      process.exit(0);
    }
  }

  const tscPath = join(A2UI_RENDERER_DIR, "tsconfig.json");
  const tsc = spawnSync("pnpm", ["-s", "exec", "tsc", "-p", tscPath], {
    cwd: ROOT_DIR,
    stdio: "inherit",
    shell: true,
  });
  if (tsc.status !== 0) fail("tsc failed");

  const rolldownConfig = join(A2UI_APP_DIR, "rolldown.config.mjs");
  let rolldown = spawnSync("rolldown", ["-c", rolldownConfig], {
    cwd: ROOT_DIR,
    stdio: "inherit",
    shell: true,
  });
  if (rolldown.status !== 0) {
    rolldown = spawnSync("pnpm", ["-s", "dlx", "rolldown", "-c", rolldownConfig], {
      cwd: ROOT_DIR,
      stdio: "inherit",
      shell: true,
    });
  }
  if (rolldown.status !== 0) fail("rolldown failed");

  const outDir = dirname(HASH_FILE);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(HASH_FILE, currentHash, "utf8");
}

main();
