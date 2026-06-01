import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const criticalFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "config.js",
  "supabase.sql",
  "README.md",
  "PROGRESSO_IMPLEMENTACAO.md",
  "OPERACAO_JOBS.md",
  "api/maintenance.js",
  "tests/static-checks.mjs",
  "tests/unit-maintenance.mjs",
  "tests/e2e-public-flow.mjs"
];

const backupRoot = join(tmpdir(), `repasse-backup-dry-run-${randomUUID()}`);
let scriptedBackupRoot;

try {
  await mkdir(backupRoot, { recursive: true });

  const originalHashes = new Map();
  for (const file of criticalFiles) {
    const content = await readFile(file);
    originalHashes.set(file, sha256(content));
    await cp(file, join(backupRoot, file), { recursive: true });
  }

  for (const file of criticalFiles) {
    const restored = await readFile(join(backupRoot, file));
    assert.equal(sha256(restored), originalHashes.get(file), `${file} deve restaurar com o mesmo hash`);
  }

  const restoredSchema = await readFile(join(backupRoot, "supabase.sql"), "utf8");
  assert(restoredSchema.includes("create table if not exists public.items"), "schema restaurado deve conter items");
  assert(restoredSchema.includes("run_scheduled_maintenance"), "schema restaurado deve conter manutencao");

  scriptedBackupRoot = join(tmpdir(), `repasse-scripted-backup-${randomUUID()}`);
  const backupResult = spawnSync(process.execPath, [
    "scripts/backup-project.mjs",
    "--output",
    scriptedBackupRoot,
    "--skip-db"
  ], { encoding: "utf8" });
  assert.equal(backupResult.status, 0, backupResult.stderr || backupResult.stdout);

  const restoreResult = spawnSync(process.execPath, [
    "scripts/restore-project.mjs",
    "--backup",
    scriptedBackupRoot
  ], { encoding: "utf8" });
  assert.equal(restoreResult.status, 0, restoreResult.stderr || restoreResult.stdout);

  console.log(`backup-restore-dry-run ok: ${backupRoot}`);
} finally {
  await rm(backupRoot, { recursive: true, force: true });
  if (scriptedBackupRoot) {
    await rm(scriptedBackupRoot, { recursive: true, force: true });
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
