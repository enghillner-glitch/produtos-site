import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const args = new Map(process.argv.slice(2).map((arg, index, list) => {
  if (!arg.startsWith("--")) {
    return [arg, true];
  }
  const next = list[index + 1];
  return [arg, next && !next.startsWith("--") ? next : true];
}));

const backupDir = args.get("--backup");
const applyDb = Boolean(args.get("--apply-db"));

if (!backupDir || backupDir === true) {
  throw new Error("Informe --backup <pasta-do-backup>.");
}

const manifest = JSON.parse(await readFile(join(String(backupDir), "manifest.json"), "utf8"));

for (const file of manifest.files) {
  const content = await readFile(join(String(backupDir), file.path));
  assert.equal(sha256(content), file.sha256, `${file.path} restaurado com hash divergente`);
}

if (applyDb) {
  if (!manifest.database?.file) {
    throw new Error("Manifest nao possui dump de banco para restaurar.");
  }
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error("Defina SUPABASE_DB_URL para restaurar o banco.");
  }
  if (!commandExists("psql")) {
    throw new Error("psql nao encontrado no PATH.");
  }

  const result = spawnSync("psql", [
    process.env.SUPABASE_DB_URL,
    "--file", join(String(backupDir), manifest.database.file)
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "psql_failed");
  }
}

console.log(`restore-project ok: ${backupDir}`);

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function commandExists(command) {
  const probe = spawnSync(command, ["--version"], { encoding: "utf8" });
  return probe.status === 0;
}
