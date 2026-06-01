import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const files = {
  html: await readFile("index.html", "utf8"),
  js: await readFile("app.js", "utf8"),
  sql: await readFile("supabase.sql", "utf8"),
  vercel: await readFile("vercel.json", "utf8"),
  maintenance: await readFile("api/maintenance.js", "utf8"),
  turnstile: await readFile("api/verify-turnstile.js", "utf8"),
  unitMaintenance: await readFile("tests/unit-maintenance.mjs", "utf8"),
  unitTurnstile: await readFile("tests/unit-turnstile.mjs", "utf8"),
  e2ePublic: await readFile("tests/e2e-public-flow.mjs", "utf8"),
  backupDryRun: await readFile("tests/backup-restore-dry-run.mjs", "utf8")
};

const requiredDomIds = [
  "profileConsent",
  "proposalType",
  "offeredItem2Select",
  "itemHoneypot",
  "proposalHoneypot",
  "itemTurnstile",
  "proposalTurnstile",
  "notificationsList",
  "leadsSection",
  "cancellationsSection",
  "adminSection"
];

for (const id of requiredDomIds) {
  assert(files.html.includes(`id="${id}"`), `index.html deve conter #${id}`);
  assert(files.js.includes(`${id}: $("${id}")`) || files.js.includes(`${id}: $("`), `app.js deve mapear #${id}`);
}

const requiredSqlObjects = [
  "exchange_proposals",
  "negotiation_leads",
  "agreement_cancellations",
  "final_agreement_terms",
  "notifications",
  "consent_records",
  "log_audit_event",
  "accept_exchange_proposal",
  "request_final_agreement",
  "run_scheduled_maintenance"
];

for (const objectName of requiredSqlObjects) {
  assert(files.sql.includes(objectName), `supabase.sql deve conter ${objectName}`);
}

assert(files.js.includes("sanitizeAuditMetadata"), "app.js deve sanitizar metadados de auditoria");
assert(files.js.includes("recordAuditEvent"), "app.js deve registrar eventos de auditoria");
assert(files.js.includes("saveAgencySettings"), "app.js deve permitir editar configuracoes da imobiliaria");
assert(files.sql.includes("real estate agencies admin update"), "supabase.sql deve permitir atualizacao administrativa da imobiliaria");
assert(files.js.includes("renderInitialAgreementBox"), "app.js deve renderizar acordo inicial formal");
assert(files.html.includes('data-auth-action="resend-confirmation"'), "index.html deve permitir reenviar confirmacao de email");
assert(files.js.includes("supabaseClient.auth.resend"), "app.js deve usar reenvio de confirmacao do Supabase Auth");
assert(files.js.includes("passesAntiSpamCheck"), "app.js deve aplicar protecao antispam local");
assert(files.js.includes("markAntiSpamSubmission"), "app.js deve registrar cooldown local");
assert(files.js.includes("verifyTurnstileIfConfigured"), "app.js deve verificar Turnstile quando configurado");
assert(files.vercel.includes("/api/maintenance"), "vercel.json deve agendar a manutencao");
assert(files.maintenance.includes("run_scheduled_maintenance"), "api/maintenance.js deve chamar a RPC de manutencao");
assert(files.maintenance.includes("CRON_SECRET"), "api/maintenance.js deve exigir CRON_SECRET");
assert(files.maintenance.includes("RESEND_API_KEY"), "api/maintenance.js deve suportar envio automatico de emails");
assert(files.turnstile.includes("TURNSTILE_SECRET_KEY"), "api/verify-turnstile.js deve exigir segredo server-side");
assert(files.turnstile.includes("siteverify"), "api/verify-turnstile.js deve chamar siteverify");
assert(files.sql.includes("from auth.users"), "supabase.sql deve preencher destino da fila de emails");
assert(files.unitMaintenance.includes("unit-maintenance ok"), "tests/unit-maintenance.mjs deve existir");
assert(files.unitTurnstile.includes("unit-turnstile ok"), "tests/unit-turnstile.mjs deve existir");
assert(files.e2ePublic.includes("e2e-public-flow ok"), "tests/e2e-public-flow.mjs deve existir");
assert(files.backupDryRun.includes("backup-restore-dry-run ok"), "tests/backup-restore-dry-run.mjs deve existir");

const forbiddenPublicTerms = [
  "checkout",
  "carrinho"
];

for (const term of forbiddenPublicTerms) {
  assert(!files.html.toLowerCase().includes(term), `HTML publico nao deve conter ${term}`);
}

console.log("static-checks ok");
