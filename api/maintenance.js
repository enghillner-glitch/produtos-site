module.exports = async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    response.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.authorization || "";

  if (!cronSecret) {
    response.status(500).json({ ok: false, error: "missing_cron_secret" });
    return;
  }

  if (authorization !== `Bearer ${cronSecret}`) {
    response.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    response.status(500).json({ ok: false, error: "missing_supabase_server_env" });
    return;
  }

  try {
    const rpcResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/run_scheduled_maintenance`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json"
      },
      body: "{}"
    });
    const rawBody = await rpcResponse.text();
    const result = safeJsonParse(rawBody);

    if (!rpcResponse.ok) {
      response.status(rpcResponse.status).json({
        ok: false,
        error: "maintenance_rpc_failed",
        details: result ?? rawBody
      });
      return;
    }

    const emailDelivery = await sendQueuedEmails(supabaseUrl, serviceRoleKey);

    response.status(200).json({ ok: true, result, email_delivery: emailDelivery });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "maintenance_failed",
      details: error.message || String(error)
    });
  }
};

async function sendQueuedEmails(supabaseUrl, serviceRoleKey) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!resendApiKey || !emailFrom) {
    return { enabled: false, reason: "missing_email_provider_env" };
  }

  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const limit = Math.min(Math.max(Number(process.env.EMAIL_BATCH_LIMIT || 10), 1), 50);
  const queueResponse = await fetch(
    `${baseUrl}/rest/v1/email_queue?status=eq.queued&to_email=not.is.null&select=id,to_email,subject,body&order=created_at.asc&limit=${limit}`,
    { headers: supabaseHeaders(serviceRoleKey) }
  );
  const queuedEmails = safeJsonParse(await queueResponse.text()) ?? [];

  if (!queueResponse.ok) {
    return {
      enabled: true,
      error: "email_queue_fetch_failed",
      status: queueResponse.status,
      details: queuedEmails
    };
  }

  let sent = 0;
  let failed = 0;

  for (const email of queuedEmails) {
    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendApiKey}`,
        "content-type": "application/json",
        "user-agent": "repassecomrepasse-maintenance/1.0"
      },
      body: JSON.stringify({
        from: emailFrom,
        to: email.to_email,
        subject: email.subject,
        text: email.body
      })
    });

    if (sendResponse.ok) {
      sent += 1;
      await updateEmailStatus(baseUrl, serviceRoleKey, email.id, "sent");
    } else {
      failed += 1;
      await updateEmailStatus(baseUrl, serviceRoleKey, email.id, "failed");
    }
  }

  return {
    enabled: true,
    attempted: queuedEmails.length,
    sent,
    failed
  };
}

async function updateEmailStatus(baseUrl, serviceRoleKey, emailId, status) {
  await fetch(`${baseUrl}/rest/v1/email_queue?id=eq.${emailId}`, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders(serviceRoleKey),
      prefer: "return=minimal"
    },
    body: JSON.stringify({
      status,
      processed_at: new Date().toISOString()
    })
  });
}

function supabaseHeaders(serviceRoleKey) {
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json"
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}
