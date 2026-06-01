import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const files = {
  html: await readFile("index.html", "utf8"),
  js: await readFile("app.js", "utf8"),
  sql: await readFile("supabase.sql", "utf8"),
  vercel: await readFile("vercel.json", "utf8"),
  maintenance: await readFile("api/maintenance.js", "utf8"),
  turnstile: await readFile("api/verify-turnstile.js", "utf8"),
  imageSecurity: await readFile("SEGURANCA_IMAGENS.md", "utf8"),
  unitMaintenance: await readFile("tests/unit-maintenance.mjs", "utf8"),
  unitTurnstile: await readFile("tests/unit-turnstile.mjs", "utf8"),
  e2ePublic: await readFile("tests/e2e-public-flow.mjs", "utf8"),
  e2eAuthenticated: await readFile("tests/e2e-authenticated-backend.mjs", "utf8"),
  backupDryRun: await readFile("tests/backup-restore-dry-run.mjs", "utf8"),
  backupScript: await readFile("scripts/backup-project.mjs", "utf8"),
  restoreScript: await readFile("scripts/restore-project.mjs", "utf8"),
  readinessScript: await readFile("scripts/check-production-readiness.mjs", "utf8"),
  deploymentConfigScript: await readFile("scripts/check-deployment-config.mjs", "utf8"),
  splitSupabaseScript: await readFile("scripts/split-supabase-sql.mjs", "utf8"),
  supabaseMigrationDoc: await readFile("SUPABASE_MIGRACAO.md", "utf8"),
  homologationReport: await readFile("RELATORIO_HOMOLOGACAO_EXECUTADA.md", "utf8"),
  homologationChecklist: await readFile("CHECKLIST_HOMOLOGACAO.md", "utf8")
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
assert(files.sql.includes("revoke execute on function public.run_scheduled_maintenance() from public, anon, authenticated"), "supabase.sql deve revogar RPCs sensiveis dos papeis publicos");
assert(files.sql.includes("revoke execute on function public.log_audit_event(text, text, uuid, jsonb) from public, anon, authenticated"), "log_audit_event deve ser bloqueada para anon antes do grant authenticated");
assert(files.sql.includes("grant execute on function public.run_scheduled_maintenance() to service_role"), "manutencao deve ficar restrita ao service_role");
assert(files.sql.includes("grant execute on function public.accept_exchange_proposal(uuid) to authenticated"), "RPCs de usuario devem ser liberadas apenas para authenticated");
assert(files.sql.includes("using (owner_id = auth.uid() and status <> 'traded')"), "dono nao deve editar imovel em acordo por RLS");
assert(files.sql.includes("grant execute on function public.mark_exchange_failed(uuid) to service_role"), "RPC legado de falha deve ficar restrito ao service_role");
assert(!files.sql.includes("grant execute on function public.mark_exchange_failed(uuid) to authenticated"), "RPC legado de falha nao deve ficar liberado para participantes");
assert(/proposal_type = 'item'\s+and offered_item_id is not null\s+and cash_difference = 0/.test(files.sql), "proposta somente por imovel nao deve carregar diferenca em dinheiro");
assert(files.sql.includes("v_next_proposal_type"), "contraproposta deve recalcular tipo quando diferenca em dinheiro muda");
assert(files.sql.includes("Acordo final aceito ou formalizado nao pode voltar para cancelamento simples"), "cancelamento simples deve ser bloqueado depois do acordo final aceito");
assert(files.js.includes("renderInitialAgreementBox"), "app.js deve renderizar acordo inicial formal");
assert(files.html.includes('data-auth-action="resend-confirmation"'), "index.html deve permitir reenviar confirmacao de email");
assert(files.js.includes("supabaseClient.auth.resend"), "app.js deve usar reenvio de confirmacao do Supabase Auth");
assert(files.js.includes("passesAntiSpamCheck"), "app.js deve aplicar protecao antispam local");
assert(files.js.includes("markAntiSpamSubmission"), "app.js deve registrar cooldown local");
assert(files.js.includes("verifyTurnstileIfConfigured"), "app.js deve verificar Turnstile quando configurado");
assert(files.js.includes("scanImagesForContact"), "app.js deve analisar imagens por OCR");
assert(files.js.includes("Tesseract.recognize"), "app.js deve usar OCR para imagens");
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
assert(files.e2eAuthenticated.includes("runAuthenticatedBackendE2E"), "tests/e2e-authenticated-backend.mjs deve existir");
assert(files.e2eAuthenticated.includes("contactHiddenForNonParticipant"), "E2E autenticado deve validar contato restrito");
assert(files.e2eAuthenticated.includes("request_agreement_cancellation"), "E2E autenticado deve validar cancelamento");
assert(files.e2eAuthenticated.includes("legacyFailureRpcBlocked"), "E2E autenticado deve validar bloqueio do RPC legado de falha");
assert(files.e2eAuthenticated.includes("directTradedItemUpdateBlocked"), "E2E autenticado deve validar bloqueio de update direto de imovel em acordo");
assert(files.backupDryRun.includes("backup-restore-dry-run ok"), "tests/backup-restore-dry-run.mjs deve existir");
assert(files.imageSecurity.includes("OCR no navegador"), "SEGURANCA_IMAGENS.md deve documentar OCR");
assert(files.backupScript.includes("SUPABASE_DB_URL"), "backup-project.mjs deve suportar dump real do Supabase");
assert(files.restoreScript.includes("--apply-db"), "restore-project.mjs deve suportar restauracao controlada do banco");
assert(files.readinessScript.includes("production-readiness ok"), "check-production-readiness.mjs deve existir");
assert(files.deploymentConfigScript.includes("deployment-config ok"), "check-deployment-config.mjs deve existir");
assert(files.deploymentConfigScript.includes("RPC anonima bloqueada"), "check-deployment-config.mjs deve auditar grants RPC");
assert(files.splitSupabaseScript.includes("split-supabase-sql ok"), "split-supabase-sql.mjs deve existir");
assert(files.splitSupabaseScript.includes("readDollarTag"), "split-supabase-sql.mjs deve preservar blocos dollar-quoted");
assert(files.supabaseMigrationDoc.includes("work-supabase-sql-chunks"), "SUPABASE_MIGRACAO.md deve orientar aplicacao em blocos");
assert(files.homologationReport.includes("Todos os testes automatizados executados passaram"), "relatorio de homologacao deve registrar resultado");
assert(files.homologationReport.includes("renderizado em 40 paginas PNG"), "relatorio de homologacao deve registrar QA visual do DOCX");
assert(files.homologationChecklist.includes("[x] DOCX mestre revisado"), "checklist deve marcar QA visual do DOCX");

const forbiddenPublicTerms = [
  "checkout",
  "carrinho"
];

for (const term of forbiddenPublicTerms) {
  assert(!files.html.toLowerCase().includes(term), `HTML publico nao deve conter ${term}`);
}

console.log("static-checks ok");
