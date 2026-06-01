import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/maintenance.js");

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

async function invoke({ method = "GET", authorization = "Bearer cron-secret", env = {}, fetchImpl } = {}) {
  const previousEnv = { ...process.env };
  process.env = { ...previousEnv, ...env };
  global.fetch = fetchImpl ?? global.fetch;

  const response = makeResponse();
  await handler({ method, headers: { authorization } }, response);

  process.env = previousEnv;
  return response;
}

function mockMaintenanceFetch({ queuedEmails = [], resendOk = true } = {}) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });

    if (String(url).includes("/rpc/run_scheduled_maintenance")) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          expired_proposals: 0,
          expired_items: 0,
          emails_without_destination_marked: 0
        })
      };
    }

    if (String(url).includes("/email_queue") && options.method !== "PATCH") {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(queuedEmails)
      };
    }

    if (String(url).includes("/email_queue") && options.method === "PATCH") {
      return { ok: true, status: 204, text: async () => "" };
    }

    if (String(url) === "https://api.resend.com/emails") {
      return {
        ok: resendOk,
        status: resendOk ? 200 : 400,
        text: async () => JSON.stringify({ id: "email_mock" })
      };
    }

    throw new Error(`unexpected fetch: ${url}`);
  };

  return { calls, fetchImpl };
}

{
  const response = await invoke({ env: { CRON_SECRET: "" } });
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error, "missing_cron_secret");
}

{
  const response = await invoke({
    authorization: "Bearer wrong",
    env: {
      CRON_SECRET: "cron-secret",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role"
    }
  });
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "unauthorized");
}

{
  const { fetchImpl } = mockMaintenanceFetch();
  const response = await invoke({
    env: {
      CRON_SECRET: "cron-secret",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      RESEND_API_KEY: "",
      EMAIL_FROM: ""
    },
    fetchImpl
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.email_delivery.enabled, false);
}

{
  const queuedEmails = [{
    id: "11111111-1111-1111-1111-111111111111",
    to_email: "destino@example.com",
    subject: "Aviso",
    body: "Mensagem de teste"
  }];
  const { calls, fetchImpl } = mockMaintenanceFetch({ queuedEmails });
  const response = await invoke({
    env: {
      CRON_SECRET: "cron-secret",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      RESEND_API_KEY: "resend-test-key",
      EMAIL_FROM: "repassecomrepasse <avisos@example.com>"
    },
    fetchImpl
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.email_delivery.sent, 1);
  assert.equal(calls.some((call) => call.url === "https://api.resend.com/emails"), true);
  assert.equal(calls.some((call) => call.options.method === "PATCH"), true);
}

console.log("unit-maintenance ok");
