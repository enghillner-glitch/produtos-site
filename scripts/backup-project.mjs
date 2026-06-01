import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const args = new Map(process.argv.slice(2).map((arg, index, list) => {
  if (!arg.startsWith("--")) {
    return [arg, true];
  }
  const next = list[index + 1];
  return [arg, next && !next.startsWith("--") ? next : true];
}));

const criticalFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "config.js",
  "location-data.js",
  "supabase.sql",
  "README.md",
  "PROGRESSO_IMPLEMENTACAO.md",
  "BACKUP_RESTAURACAO.md",
  "OPERACAO_JOBS.md",
  "SEGURANCA_CAPTCHA.md",
  "SEGURANCA_IMAGENS.md",
  "api/maintenance.js",
  "api/verify-turnstile.js",
  "scripts/backup-project.mjs",
  "scripts/restore-project.mjs",
  "tests/static-checks.mjs",
  "tests/unit-maintenance.mjs",
  "tests/unit-turnstile.mjs",
  "tests/e2e-public-flow.mjs",
  "tests/backup-restore-dry-run.mjs"
];

const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
const outputDir = String(args.get("--output") || join("backups", `repasse-${timestamp}`));
const skipDb = Boolean(args.get("--skip-db"));

await mkdir(outputDir, { recursive: true });

const manifest = {
  created_at: new Date().toISOString(),
  git_commit: readCommand("git", ["rev-parse", "HEAD"]),
  files: [],
  database: {
    attempted: false,
    created: false,
    reason: null,
    file: null
  }
};

for (const file of criticalFiles) {
  const target = join(outputDir, file);
  await mkdir(dirname(target), { recursive: true });
  await cp(file, target, { recursive: true });
  const content = await readFile(file);
  manifest.files.push({
    path: file,
    sha256: sha256(content),
    bytes: content.length
  });
}

if (skipDb) {
  manifest.database.reason = "skip_db_flag";
} else if (!process.env.SUPABASE_DB_URL) {
  manifest.database.reason = "missing_SUPABASE_DB_URL";
} else if (!commandExists("pg_dump")) {
  manifest.database.reason = "missing_pg_dump";
} else {
  const dumpFile = join(outputDir, "supabase-dump.sql");
  manifest.database.attempted = true;
  const result = spawnSync("pg_dump", [
    "--dbname", process.env.SUPABASE_DB_URL,
    "--file", dumpFile,
    "--format", "plain",
    "--no-owner",
    "--no-privileges"
  ], { encoding: "utf8" });

  if (result.status === 0) {
    manifest.database.created = true;
    manifest.database.file = basename(dumpFile);
  } else {
    manifest.database.reason = result.stderr || result.stdout || "pg_dump_failed";
  }
}

await writeFile(join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`backup-project ok: ${outputDir}`);

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function commandExists(command) {
  const probe = spawnSync(command, ["--version"], { encoding: "utf8" });
  return probe.status === 0;
}

function readCommand(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}
