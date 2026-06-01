import assert from "node:assert/strict";

const baseUrl = (process.env.APP_URL || "https://produtos-site.vercel.app/").replace(/\/$/, "");

const checks = [];

await checkPage("/");
await checkAsset("/app.js", [
  "repassecomrepasse",
  "scanImagesForContact",
  "verifyTurnstileIfConfigured",
  "renderInitialAgreementBox"
]);
await checkAsset("/styles.css", [
  "@media (max-width: 900px)",
  ".turnstile-box",
  ".agreement-box"
]);
await checkApiGuards();

for (const check of checks) {
  console.log(`${check.ok ? "ok" : "warn"} ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.ok && check.required)) {
  process.exitCode = 1;
} else {
  console.log(`production-readiness ok: ${baseUrl}`);
}

async function checkPage(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  assert.equal(response.ok, true, `${path} deve responder`);
  checks.push({
    name: "home",
    ok: body.includes("repassecomrepasse") && body.includes("proposalForm"),
    required: true,
    detail: `${response.status} com identidade e formulario`
  });
}

async function checkAsset(path, markers) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  checks.push({
    name: path,
    ok: response.ok && markers.every((marker) => body.includes(marker)),
    required: true,
    detail: response.ok ? `marcadores ${markers.length}/${markers.length}` : `status ${response.status}`
  });
}

async function checkApiGuards() {
  const maintenance = await fetch(`${baseUrl}/api/maintenance`);
  checks.push({
    name: "/api/maintenance",
    ok: [401, 500].includes(maintenance.status),
    required: false,
    detail: `status ${maintenance.status}; 401 indica CRON_SECRET configurado, 500 pode indicar env pendente`
  });

  const turnstile = await fetch(`${baseUrl}/api/verify-turnstile`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  checks.push({
    name: "/api/verify-turnstile",
    ok: [400, 500].includes(turnstile.status),
    required: false,
    detail: `status ${turnstile.status}; 400 indica secret configurado, 500 pode indicar env pendente`
  });
}
