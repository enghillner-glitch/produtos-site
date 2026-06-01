import { randomUUID } from "node:crypto";

export async function runAuthenticatedBackendE2E(options = {}) {
  const supabaseUrl = trimSlash(options.supabaseUrl);
  const anonKey = options.anonKey;
  const serviceRoleKey = options.serviceRoleKey;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error("Informe supabaseUrl, anonKey e serviceRoleKey.");
  }

  const suffix = randomUUID().slice(0, 8);
  const password = `Repasse!${suffix}2026`;
  const users = [];

  try {
    const requester = await createUser(supabaseUrl, serviceRoleKey, `repasse-requester-${suffix}@example.com`, password);
    const owner = await createUser(supabaseUrl, serviceRoleKey, `repasse-owner-${suffix}@example.com`, password);
    const admin = await createUser(supabaseUrl, serviceRoleKey, `repasse-admin-${suffix}@example.com`, password);
    users.push(requester.id, owner.id, admin.id);

    const requesterSession = await signIn(supabaseUrl, anonKey, requester.email, password);
    const ownerSession = await signIn(supabaseUrl, anonKey, owner.email, password);
    const adminSession = await signIn(supabaseUrl, anonKey, admin.email, password);

    await createProfile(supabaseUrl, anonKey, requesterSession.access_token, requester.id, "Interessado Homologacao", "user");
    await createProfile(supabaseUrl, anonKey, ownerSession.access_token, owner.id, "Anunciante Homologacao", "user");
    await createProfile(supabaseUrl, serviceRoleKey, serviceRoleKey, admin.id, "Admin Homologacao", "admin");

    await createPrivateData(supabaseUrl, anonKey, requesterSession.access_token, requester.id, "cpf", `hash-requester-${suffix}`);
    await createPrivateData(supabaseUrl, anonKey, ownerSession.access_token, owner.id, "cpf", `hash-owner-${suffix}`);
    await createContact(supabaseUrl, anonKey, requesterSession.access_token, requester.id, "+5583999000001");
    await createContact(supabaseUrl, anonKey, ownerSession.access_token, owner.id, "+5583999000002");

    const offeredItem = await createItem(supabaseUrl, anonKey, requesterSession.access_token, requester.id, `Imovel oferecido ${suffix}`);
    const requestedItem = await createItem(supabaseUrl, anonKey, ownerSession.access_token, owner.id, `Imovel desejado ${suffix}`);
    await approveItem(supabaseUrl, serviceRoleKey, offeredItem.id);
    await approveItem(supabaseUrl, serviceRoleKey, requestedItem.id);

    const proposal = await createProposal({
      supabaseUrl,
      anonKey,
      token: requesterSession.access_token,
      requestedItemId: requestedItem.id,
      offeredItemId: offeredItem.id,
      requesterId: requester.id,
      ownerId: owner.id
    });

    await callRpc(supabaseUrl, anonKey, ownerSession.access_token, "accept_exchange_proposal", {
      p_proposal_id: proposal.id
    });

    const acceptedProposal = await getSingle(supabaseUrl, serviceRoleKey, "exchange_proposals", `id=eq.${proposal.id}&select=id,status`);
    assertEqual(acceptedProposal.status, "accepted", "proposta deve ficar aceita");

    const tradedItems = await getRows(
      supabaseUrl,
      serviceRoleKey,
      "items",
      `id=in.(${requestedItem.id},${offeredItem.id})&select=id,status`
    );
    assertEqual(new Set(tradedItems.map((item) => item.status)).size, 1, "imoveis devem ter mesmo status");
    assertEqual(tradedItems[0].status, "traded", "imoveis devem ficar em acordo");

    const visibleContact = await getRows(
      supabaseUrl,
      anonKey,
      "profile_contacts",
      `user_id=eq.${owner.id}&select=user_id,whatsapp`,
      requesterSession.access_token
    );
    assertEqual(visibleContact.length, 1, "participante deve ver contato liberado");

    const hiddenContact = await getRows(
      supabaseUrl,
      anonKey,
      "profile_contacts",
      `user_id=eq.${owner.id}&select=user_id,whatsapp`,
      adminSession.access_token
    );
    assertEqual(hiddenContact.length, 0, "usuario fora da troca nao deve ver contato");

    const cancellationId = await callRpc(supabaseUrl, anonKey, requesterSession.access_token, "request_agreement_cancellation", {
      p_proposal_id: proposal.id,
      p_reason: "Homologacao automatizada de cancelamento"
    });

    await callRpc(supabaseUrl, anonKey, adminSession.access_token, "resolve_agreement_cancellation", {
      p_cancellation_id: cancellationId,
      p_approved: true,
      p_notes: "Homologacao automatizada aprovada"
    });

    const failedProposal = await getSingle(supabaseUrl, serviceRoleKey, "exchange_proposals", `id=eq.${proposal.id}&select=id,status`);
    assertEqual(failedProposal.status, "failed", "proposta deve ficar como nao concluida apos cancelamento aprovado");

    const reopenedItems = await getRows(
      supabaseUrl,
      serviceRoleKey,
      "items",
      `id=in.(${requestedItem.id},${offeredItem.id})&select=id,status`
    );
    assertEqual(new Set(reopenedItems.map((item) => item.status)).size, 1, "imoveis reabertos devem ter mesmo status");
    assertEqual(reopenedItems[0].status, "available", "imoveis devem voltar para disponiveis");

    return {
      ok: true,
      proposalStatus: failedProposal.status,
      itemStatus: reopenedItems[0].status,
      contactReleasedForParticipant: visibleContact.length === 1,
      contactHiddenForNonParticipant: hiddenContact.length === 0
    };
  } finally {
    await Promise.allSettled(users.map((id) => deleteUser(supabaseUrl, serviceRoleKey, id)));
  }
}

async function createUser(supabaseUrl, serviceRoleKey, email, password) {
  const data = await authFetch(supabaseUrl, serviceRoleKey, "/admin/users", {
    method: "POST",
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: { source: "repasse-e2e" }
    }
  });
  return { id: data.id, email };
}

async function deleteUser(supabaseUrl, serviceRoleKey, userId) {
  if (!userId) return null;
  return authFetch(supabaseUrl, serviceRoleKey, `/admin/users/${userId}`, { method: "DELETE" });
}

async function signIn(supabaseUrl, anonKey, email, password) {
  return authFetch(supabaseUrl, anonKey, "/token?grant_type=password", {
    method: "POST",
    body: { email, password }
  });
}

async function createProfile(supabaseUrl, apikey, token, id, fullName, role) {
  await restFetch(supabaseUrl, apikey, token, "profiles", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      id,
      full_name: fullName,
      user_type: role === "admin" ? "real_estate_admin" : "individual",
      role,
      account_status: "active",
      state: "PB",
      city: "Joao Pessoa"
    }
  });
}

async function createPrivateData(supabaseUrl, apikey, token, userId, documentType, documentHash) {
  await restFetch(supabaseUrl, apikey, token, "profile_private_data", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      user_id: userId,
      document_type: documentType,
      document_hash: documentHash,
      document_encrypted: null
    }
  });
}

async function createContact(supabaseUrl, apikey, token, userId, whatsapp) {
  await restFetch(supabaseUrl, apikey, token, "profile_contacts", {
    method: "POST",
    prefer: "return=minimal",
    body: { user_id: userId, whatsapp }
  });
}

async function createItem(supabaseUrl, anonKey, token, ownerId, title) {
  const rows = await restFetch(supabaseUrl, anonKey, token, "items", {
    method: "POST",
    prefer: "return=representation",
    body: {
      owner_id: ownerId,
      title,
      description: "Imovel temporario criado pela homologacao automatizada.",
      category: "Apartamento",
      condition: "Quitado",
      state: "PB",
      city: "Joao Pessoa",
      neighborhood: "Centro",
      trade_preferences: "Homologacao automatizada.",
      transfer_amount: 100000,
      outstanding_balance: 0,
      monthly_payment: 0,
      installments_remaining: 0,
      legitimacy_confirmed: true,
      status: "available"
    }
  });
  return rows[0];
}

async function approveItem(supabaseUrl, serviceRoleKey, itemId) {
  await restFetch(supabaseUrl, serviceRoleKey, serviceRoleKey, `items?id=eq.${itemId}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      moderation_status: "approved",
      moderation_note: null,
      moderation_updated_at: new Date().toISOString()
    }
  });
}

async function createProposal(options) {
  const rows = await restFetch(options.supabaseUrl, options.anonKey, options.token, "exchange_proposals", {
    method: "POST",
    prefer: "return=representation",
    body: {
      requested_item_id: options.requestedItemId,
      offered_item_id: options.offeredItemId,
      offered_item_2_id: null,
      proposal_type: "item",
      requester_id: options.requesterId,
      owner_id: options.ownerId,
      created_by: options.requesterId,
      responder_id: options.ownerId,
      cash_difference: 0,
      cash_direction: "none",
      message: "Homologacao automatizada.",
      status: "pending",
      version: 1,
      expires_at: futureIso(7),
      reserved_until: futureIso(2)
    }
  });
  return rows[0];
}

async function callRpc(supabaseUrl, apikey, token, name, body) {
  return restFetch(supabaseUrl, apikey, token, `rpc/${name}`, {
    method: "POST",
    body
  });
}

async function getSingle(supabaseUrl, serviceRoleKey, table, query) {
  const rows = await getRows(supabaseUrl, serviceRoleKey, table, query, serviceRoleKey);
  if (rows.length !== 1) {
    throw new Error(`Consulta ${table} esperava 1 linha e retornou ${rows.length}.`);
  }
  return rows[0];
}

async function getRows(supabaseUrl, apikey, table, query, token = apikey) {
  return restFetch(supabaseUrl, apikey, token, `${table}?${query}`, { method: "GET" });
}

async function authFetch(supabaseUrl, apikey, path, options) {
  return jsonFetch(`${supabaseUrl}/auth/v1${path}`, {
    method: options.method,
    headers: {
      apikey,
      authorization: `Bearer ${apikey}`,
      "content-type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
}

async function restFetch(supabaseUrl, apikey, token, path, options) {
  return jsonFetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: options.method,
    headers: {
      apikey,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(options.prefer ? { prefer: options.prefer } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
}

async function jsonFetch(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${init.method} ${url} falhou com ${response.status}: ${text}`);
  }

  return data;
}

function futureIso(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function trimSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado ${expected}, recebido ${actual}.`);
  }
}

if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("e2e-authenticated-backend.mjs")) {
  runAuthenticatedBackendE2E({
    supabaseUrl: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  })
    .then((result) => {
      console.log(`e2e-authenticated-backend ok: ${JSON.stringify(result)}`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
