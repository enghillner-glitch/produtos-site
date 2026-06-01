import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const files = {
  html: await readFile("index.html", "utf8"),
  js: await readFile("app.js", "utf8"),
  sql: await readFile("supabase.sql", "utf8")
};

const requiredDomIds = [
  "profileConsent",
  "proposalType",
  "offeredItem2Select",
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

const forbiddenPublicTerms = [
  "checkout",
  "carrinho"
];

for (const term of forbiddenPublicTerms) {
  assert(!files.html.toLowerCase().includes(term), `HTML publico nao deve conter ${term}`);
}

console.log("static-checks ok");
