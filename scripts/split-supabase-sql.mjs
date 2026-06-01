import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { readFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));
const input = args.input || "supabase.sql";
const outputDir = args.output || "work-supabase-sql-chunks";
const maxChars = Number(args.maxChars || 45000);

if (!Number.isFinite(maxChars) || maxChars < 5000) {
  throw new Error("--max-chars deve ser um numero maior ou igual a 5000");
}

const source = readFileSync(input, "utf8");
const statements = splitSqlStatements(source).filter((statement) => statement.trim());
const chunks = packStatements(statements, maxChars);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const manifest = [];
for (let index = 0; index < chunks.length; index += 1) {
  const name = `${String(index + 1).padStart(2, "0")}-${basename(input, ".sql")}.sql`;
  const content = [
    `-- repassecomrepasse migration chunk ${index + 1}/${chunks.length}`,
    "-- Execute os blocos em ordem no SQL Editor do Supabase.",
    chunks[index].trim(),
    ""
  ].join("\n");
  await writeFile(join(outputDir, name), content, "utf8");
  manifest.push({ file: name, statements: countStatements(chunks[index]), chars: content.length });
}

await writeFile(join(outputDir, "manifest.json"), JSON.stringify({ input, maxChars, chunks: manifest }, null, 2), "utf8");
console.log(`split-supabase-sql ok: ${chunks.length} blocos em ${outputDir}`);

function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let singleQuote = false;
  let doubleQuote = false;
  let lineComment = false;
  let blockComment = false;
  let dollarTag = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1] || "";
    current += char;

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
      }
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        current += next;
        index += 1;
        blockComment = false;
      }
      continue;
    }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, index)) {
        current += sql.slice(index + 1, index + dollarTag.length);
        index += dollarTag.length - 1;
        dollarTag = null;
      }
      continue;
    }

    if (singleQuote) {
      if (char === "'" && next === "'") {
        current += next;
        index += 1;
      } else if (char === "'") {
        singleQuote = false;
      }
      continue;
    }

    if (doubleQuote) {
      if (char === '"') {
        doubleQuote = false;
      }
      continue;
    }

    if (char === "-" && next === "-") {
      current += next;
      index += 1;
      lineComment = true;
      continue;
    }

    if (char === "/" && next === "*") {
      current += next;
      index += 1;
      blockComment = true;
      continue;
    }

    if (char === "'") {
      singleQuote = true;
      continue;
    }

    if (char === '"') {
      doubleQuote = true;
      continue;
    }

    if (char === "$") {
      const tag = readDollarTag(sql, index);
      if (tag) {
        dollarTag = tag;
        current += sql.slice(index + 1, index + tag.length);
        index += tag.length - 1;
        continue;
      }
    }

    if (char === ";") {
      statements.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

function readDollarTag(sql, start) {
  const match = sql.slice(start).match(/^\$[A-Za-z0-9_]*\$/);
  return match ? match[0] : null;
}

function packStatements(statements, limit) {
  const chunks = [];
  let current = "";

  for (const statement of statements) {
    const next = current ? `${current}\n\n${statement}` : statement;
    if (next.length > limit && current) {
      chunks.push(current);
      current = statement;
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}

function countStatements(chunk) {
  return splitSqlStatements(chunk).length;
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--input") parsed.input = rawArgs[++index];
    else if (arg === "--output") parsed.output = rawArgs[++index];
    else if (arg === "--max-chars") parsed.maxChars = rawArgs[++index];
  }
  return parsed;
}
