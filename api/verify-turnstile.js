module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    response.status(500).json({ ok: false, error: "missing_turnstile_secret" });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const token = String(body?.token || "");

    if (!token) {
      response.status(400).json({ ok: false, error: "missing_turnstile_token" });
      return;
    }

    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);

    const remoteIp = getClientIp(request);
    if (remoteIp) {
      form.set("remoteip", remoteIp);
    }

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "repassecomrepasse-turnstile/1.0"
      },
      body: form
    });
    const result = await verifyResponse.json();

    if (!verifyResponse.ok || !result.success) {
      response.status(403).json({
        ok: false,
        error: "turnstile_verification_failed",
        details: result["error-codes"] || []
      });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "turnstile_server_error",
      details: error.message || String(error)
    });
  }
};

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers["x-real-ip"] || "";
}
