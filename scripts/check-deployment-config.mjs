import { readFile } from "node:fs/promises";
import vm from "node:vm";

const appUrl = (process.env.APP_URL || "https://produtos-site.vercel.app/").replace(/\/$/, "");
const strict = process.env.STRICT_CONFIG === "1";
const checks = [];

const localConfig = parseConfig(await readFile("config.js", "utf8"));
record("config local", Boolean(localConfig.supabaseUrl && localConfig.supabaseAnonKey), true, "Supabase publico configurado sem exibir chaves");

const remoteConfig = await loadRemoteConfig();
if (remoteConfig) {
  record(
    "config remoto",
    Boolean(remoteConfig.supabaseUrl && remoteConfig.supabaseAnonKey),
    true,
    "config.js publicado contem Supabase publico"
  );
}

const config = remoteConfig || localConfig;
await checkSupabaseSchema(config);
await checkAnonymousRpc(config);
await checkServerlessGuards(config);

for (const check of checks) {
  const level = check.ok ? "ok" : check.required || strict ? "fail" : "warn";
  console.log(`${level} ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.ok && (check.required || strict))) {
  process.exitCode = 1;
} else {
  console.log(`deployment-config ok: ${appUrl}`);
}

async function loadRemoteConfig() {
  try {
    const response = await fetch(`${appUrl}/config.js`, { cache: "no-store" });
    const body = await response.text();
    record("config.js publicado", response.ok, true, `status ${response.status}`);
    return response.ok ? parseConfig(body) : null;
  } catch (error) {
    record("config.js publicado", false, true, error.message || String(error));
    return null;
  }
}

function parseConfig(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  return sandbox.window.APP_CONFIG || {};
}

async function checkSupabaseSchema(config) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    record("schema Supabase", false, true, "Supabase URL ou publishable key ausente");
    return;
  }

  const tables = [
    { name: "profiles", select: "id" },
    { name: "profile_private_data", select: "user_id" },
    { name: "profile_contacts", select: "user_id" },
    { name: "items", select: "id" },
    { name: "item_images", select: "id" },
    { name: "item_private_locations", select: "item_id" },
    { name: "exchange_proposals", select: "id" },
    { name: "reports", select: "id" },
    { name: "audit_events", select: "id" },
    { name: "real_estate_agencies", select: "id" },
    { name: "negotiation_leads", select: "id" },
    { name: "agreement_cancellations", select: "id" },
    { name: "final_agreement_terms", select: "id" },
    { name: "notifications", select: "id" },
    { name: "email_queue", select: "id" },
    { name: "consent_records", select: "id" },
    { name: "favorite_items", select: "user_id,item_id" }
  ];

  for (const table of tables) {
    const response = await fetch(`${trimSlash(config.supabaseUrl)}/rest/v1/${table.name}?select=${table.select}&limit=1`, {
      headers: supabasePublicHeaders(config.supabaseAnonKey)
    });
    const body = await response.text();
    const missing = [400, 404].includes(response.status) && /42P01|PGRST205|does not exist|Could not find/i.test(body);
    const guardedOrReadable = [200, 401, 403].includes(response.status);
    record(`tabela ${table.name}`, !missing && guardedOrReadable, true, `status ${response.status}`);
  }

  const agencyResponse = await fetch(
    `${trimSlash(config.supabaseUrl)}/rest/v1/real_estate_agencies?select=id&status=eq.active&limit=1`,
    { headers: supabasePublicHeaders(config.supabaseAnonKey) }
  );
  const agencyBody = safeJsonParse(await agencyResponse.text());
  const hasActiveAgency = agencyResponse.ok && Array.isArray(agencyBody) && agencyBody.length > 0;
  record("imobiliaria ativa", hasActiveAgency, false, hasActiveAgency ? "seed ativo encontrado" : `status ${agencyResponse.status}`);
}

async function checkAnonymousRpc(config) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return;
  }

  const response = await fetch(`${trimSlash(config.supabaseUrl)}/rest/v1/rpc/log_audit_event`, {
    method: "POST",
    headers: supabasePublicHeaders(config.supabaseAnonKey),
    body: JSON.stringify({
      p_action: "deployment_config_probe",
      p_entity_type: "deployment_config",
      p_entity_id: null,
      p_metadata: {}
    })
  });

  record(
    "RPC anonima bloqueada",
    !response.ok,
    false,
    response.ok ? "anon executou log_audit_event; aplicar grants restritos do supabase.sql" : `status ${response.status}`
  );
}

async function checkServerlessGuards(config) {
  const maintenance = await fetch(`${appUrl}/api/maintenance`);
  const maintenanceBody = safeJsonParse(await maintenance.text());
  record(
    "CRON_SECRET Vercel",
    maintenance.status === 401,
    false,
    maintenance.status === 401 ? "rota protegida" : `status ${maintenance.status}${maintenanceBody?.error ? ` ${maintenanceBody.error}` : ""}`
  );

  const turnstile = await fetch(`${appUrl}/api/verify-turnstile`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  const turnstileBody = safeJsonParse(await turnstile.text());
  const turnstileEnabled = Boolean(config.turnstileSiteKey);
  record(
    "Turnstile server-side",
    turnstileEnabled ? turnstile.status === 400 : [400, 500].includes(turnstile.status),
    turnstileEnabled,
    turnstileEnabled
      ? `site key ativa; status ${turnstile.status}${turnstileBody?.error ? ` ${turnstileBody.error}` : ""}`
      : "opcional desativado no config.js"
  );
}

function supabasePublicHeaders(anonKey) {
  return {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    "content-type": "application/json"
  };
}

function record(name, ok, required, detail) {
  checks.push({ name, ok, required, detail });
}

function trimSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}
