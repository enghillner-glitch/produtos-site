import assert from "node:assert/strict";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4177/";
const response = await fetch(baseUrl);
assert.equal(response.status, 200, `GET ${baseUrl} deve retornar 200`);

const html = await response.text();
for (const marker of ["repassecomrepasse", "itemGrid", "dashboardView", "profileConsent"]) {
  assert(html.includes(marker), `HTML deve conter ${marker}`);
}

console.log(`smoke-http ok: ${baseUrl}`);
