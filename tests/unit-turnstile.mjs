import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/verify-turnstile.js");

function makeResponse() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

async function invoke({ env = {}, request = {}, fetchImpl } = {}) {
  const previousEnv = { ...process.env };
  process.env = { ...previousEnv, ...env };
  global.fetch = fetchImpl ?? global.fetch;

  const response = makeResponse();
  await handler({
    method: "POST",
    headers: {},
    body: {},
    ...request
  }, response);

  process.env = previousEnv;
  return response;
}

{
  const response = await invoke({ env: { TURNSTILE_SECRET_KEY: "" } });
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error, "missing_turnstile_secret");
}

{
  const response = await invoke({
    env: { TURNSTILE_SECRET_KEY: "secret" },
    request: { body: {} }
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "missing_turnstile_token");
}

{
  let calledSiteverify = false;
  const response = await invoke({
    env: { TURNSTILE_SECRET_KEY: "secret" },
    request: { body: { token: "token-ok" } },
    fetchImpl: async (url) => {
      calledSiteverify = String(url).includes("/turnstile/v0/siteverify");
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      };
    }
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(calledSiteverify, true);
}

{
  const response = await invoke({
    env: { TURNSTILE_SECRET_KEY: "secret" },
    request: { body: { token: "token-fail" } },
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: false, "error-codes": ["invalid-input-response"] })
    })
  });
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "turnstile_verification_failed");
}

console.log("unit-turnstile ok");
