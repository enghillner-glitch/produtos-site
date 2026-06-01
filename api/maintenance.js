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

    response.status(200).json({ ok: true, result });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "maintenance_failed",
      details: error.message || String(error)
    });
  }
};

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}
