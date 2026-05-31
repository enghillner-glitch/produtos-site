const config = window.APP_CONFIG;
const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

const PRODUCT = {
  name: "repassecomrepasse",
  subjectSingular: "imóvel",
  subjectPlural: "imóveis",
  institutionalNotice:
    "O repassecomrepasse é uma plataforma de aproximação entre interessados em negociações imobiliárias. A análise documental e os encaminhamentos junto a bancos, construtoras, credores e agentes financiadores são realizados por intermédio da imobiliária responsável."
};

const LOCATION = window.LOCATION_DATA ?? {
  states: [{ code: "PB", name: "Paraíba" }],
  municipalitiesByState: { PB: [] }
};

const categories = [
  "Apartamento",
  "Casa",
  "Terreno",
  "Sala comercial",
  "Ponto comercial",
  "Chácara",
  "Imóvel financiado",
  "Outro"
];

const conditions = ["Novo", "Pronto para morar", "Em construção", "Financiado", "Quitado", "Precisa reforma"];

const statusLabels = {
  available: "Disponível",
  traded: "Em acordo",
  inactive: "Inativo"
};

const proposalStatusLabels = {
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Recusada",
  cancelled: "Cancelada",
  failed: "Não concluída"
};

const cashDirectionLabels = {
  none: "Sem diferença em dinheiro",
  requester_pays: "Interessado pagaria a diferença",
  owner_pays: "Anunciante pagaria a diferença"
};

const state = {
  user: null,
  profile: null,
  contact: null,
  privateData: null,
  agency: null,
  publicItems: [],
  myItems: [],
  proposals: [],
  imagesByItem: new Map(),
  proposalsItemsById: new Map(),
  profilesById: new Map(),
  contactsByUserId: new Map(),
  privateLocationsByItem: new Map(),
  selectedDetailItem: null
};

const $ = (id) => document.getElementById(id);
const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const elements = {
  notice: $("notice"),
  homeView: $("homeView"),
  dashboardView: $("dashboardView"),
  agencyView: $("agencyView"),
  agencyCard: $("agencyCard"),
  authControls: $("authControls"),
  pendingBadge: $("pendingBadge"),
  searchInput: $("searchInput"),
  stateFilter: $("stateFilter"),
  cityFilter: $("cityFilter"),
  neighborhoodFilter: $("neighborhoodFilter"),
  categoryFilter: $("categoryFilter"),
  conditionFilter: $("conditionFilter"),
  itemGrid: $("itemGrid"),
  homeEmpty: $("homeEmpty"),
  resultsCount: $("resultsCount"),
  signedOutPanel: $("signedOutPanel"),
  signedInPanel: $("signedInPanel"),
  profileForm: $("profileForm"),
  profileName: $("profileName"),
  profileUserType: $("profileUserType"),
  profileDocument: $("profileDocument"),
  profileDocumentLabel: $("profileDocumentLabel"),
  profileDocumentHint: $("profileDocumentHint"),
  profileWhatsapp: $("profileWhatsapp"),
  profileState: $("profileState"),
  profileCity: $("profileCity"),
  profileStatus: $("profileStatus"),
  myItemsGrid: $("myItemsGrid"),
  myItemsEmpty: $("myItemsEmpty"),
  receivedProposals: $("receivedProposals"),
  sentProposals: $("sentProposals"),
  receivedEmpty: $("receivedEmpty"),
  sentEmpty: $("sentEmpty"),
  authModal: $("authModal"),
  loginFields: $("loginFields"),
  authEmail: $("authEmail"),
  authPassword: $("authPassword"),
  authPasswordLabel: $("authPasswordLabel"),
  itemModal: $("itemModal"),
  itemModalTitle: $("itemModalTitle"),
  itemForm: $("itemForm"),
  itemId: $("itemId"),
  itemTitle: $("itemTitle"),
  itemCategory: $("itemCategory"),
  itemCondition: $("itemCondition"),
  itemTransferAmount: $("itemTransferAmount"),
  itemOutstandingBalance: $("itemOutstandingBalance"),
  itemMonthlyPayment: $("itemMonthlyPayment"),
  itemInstallmentsRemaining: $("itemInstallmentsRemaining"),
  itemState: $("itemState"),
  itemCity: $("itemCity"),
  itemNeighborhood: $("itemNeighborhood"),
  itemStreet: $("itemStreet"),
  itemNumber: $("itemNumber"),
  itemAddressNotes: $("itemAddressNotes"),
  itemPreferences: $("itemPreferences"),
  itemDescription: $("itemDescription"),
  itemLegitimacy: $("itemLegitimacy"),
  itemImages: $("itemImages"),
  imageRequirement: $("imageRequirement"),
  itemImagePreview: $("itemImagePreview"),
  detailModal: $("detailModal"),
  itemDetail: $("itemDetail"),
  proposalModal: $("proposalModal"),
  proposalIntro: $("proposalIntro"),
  proposalForm: $("proposalForm"),
  proposalRequestedItemId: $("proposalRequestedItemId"),
  offeredItemSelect: $("offeredItemSelect"),
  noOfferItems: $("noOfferItems"),
  cashDifference: $("cashDifference"),
  cashDirection: $("cashDirection"),
  proposalMessage: $("proposalMessage")
};

init();

async function init() {
  populateSelects();
  bindEvents();

  if (!supabaseClient) {
    showNotice("Supabase não está configurado. Preencha config.js para ativar o banco.", "error");
    renderAuthControls();
    renderHome();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  state.user = data.session?.user ?? null;

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    state.user = session?.user ?? null;
    if (event === "PASSWORD_RECOVERY") {
      openPasswordRecoveryMode();
    }
    await refreshAll();
  });

  await refreshAll();
  routeFromHash();
}

function populateSelects() {
  addStateOptions(elements.stateFilter, true);
  addStateOptions(elements.itemState, false);
  addStateOptions(elements.profileState, false);
  populateMunicipalitySelect(elements.cityFilter, "PB", true);
  populateMunicipalitySelect(elements.itemCity, "PB", false);
  populateMunicipalitySelect(elements.profileCity, "PB", false);
  addOptions(elements.categoryFilter, categories);
  addOptions(elements.conditionFilter, conditions);
  addOptions(elements.itemCategory, categories);
  addOptions(elements.itemCondition, conditions);
}

function addStateOptions(select, includeAll) {
  select.innerHTML = includeAll ? '<option value="">Todos</option>' : "";
  for (const state of LOCATION.states) {
    const node = document.createElement("option");
    node.value = state.code;
    node.textContent = state.name;
    select.appendChild(node);
  }
  select.value = includeAll ? "" : "PB";
}

function populateMunicipalitySelect(select, stateCode, includeAll) {
  select.innerHTML = includeAll ? '<option value="">Todos</option>' : '<option value="">Selecione</option>';
  for (const city of LOCATION.municipalitiesByState[stateCode] ?? []) {
    const node = document.createElement("option");
    node.value = city;
    node.textContent = city;
    select.appendChild(node);
  }
}

function addOptions(select, options) {
  for (const option of options) {
    const node = document.createElement("option");
    node.value = option;
    node.textContent = option;
    select.appendChild(node);
  }
}

function bindEvents() {
  window.addEventListener("hashchange", routeFromHash);
  document.addEventListener("click", handleDocumentClick);

  for (const input of [
    elements.searchInput,
    elements.stateFilter,
    elements.cityFilter,
    elements.neighborhoodFilter,
    elements.categoryFilter,
    elements.conditionFilter
  ]) {
    input.addEventListener("input", renderHome);
  }

  elements.stateFilter.addEventListener("change", () => {
    populateMunicipalitySelect(elements.cityFilter, elements.stateFilter.value || "PB", true);
    renderHome();
  });

  elements.itemState.addEventListener("change", () => {
    populateMunicipalitySelect(elements.itemCity, elements.itemState.value || "PB", false);
  });

  elements.profileState.addEventListener("change", () => {
    populateMunicipalitySelect(elements.profileCity, elements.profileState.value || "PB", false);
  });
  elements.profileUserType.addEventListener("change", updateProfileDocumentUi);

  elements.profileForm.addEventListener("submit", saveProfile);
  elements.itemForm.addEventListener("submit", saveItem);
  elements.itemImages.addEventListener("change", previewSelectedImages);
  elements.proposalForm.addEventListener("submit", sendProposal);

  document.querySelectorAll("[data-auth-action]").forEach((button) => {
    button.addEventListener("click", () => handleAuth(button.dataset.authAction));
  });
}

async function refreshAll() {
  clearNotice();
  renderAuthControls();
  await Promise.all([loadPublicItems(), loadActiveAgency(), loadUserData()]);
  renderHome();
  renderDashboard();
  renderAgency();
}

async function loadActiveAgency() {
  state.agency = null;

  const { data, error } = await supabaseClient
    .from("real_estate_agencies")
    .select("*")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    state.agency = null;
    return;
  }

  state.agency = data ?? null;
}

async function loadPublicItems() {
  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (handleDbError(error, "carregar imóveis disponíveis")) {
    state.publicItems = [];
    return;
  }

  state.publicItems = data ?? [];
  await loadImagesForItems(state.publicItems.map((item) => item.id));
}

async function loadUserData() {
  state.profile = null;
  state.contact = null;
  state.privateData = null;
  state.myItems = [];
  state.proposals = [];
  state.proposalsItemsById = new Map();
  state.profilesById = new Map();
  state.contactsByUserId = new Map();
  state.privateLocationsByItem = new Map();

  if (!state.user) {
    return;
  }

  await Promise.all([loadProfile(), loadMyItems(), loadProposals()]);
}

async function loadProfile() {
  const profileResponse = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", state.user.id)
    .maybeSingle();

  handleDbError(profileResponse.error, "carregar perfil");
  state.profile = profileResponse.data ?? null;

  const contactResponse = await supabaseClient
    .from("profile_contacts")
    .select("*")
    .eq("user_id", state.user.id)
    .maybeSingle();

  handleDbError(contactResponse.error, "carregar contato");
  state.contact = contactResponse.data ?? null;

  const privateResponse = await supabaseClient
    .from("profile_private_data")
    .select("*")
    .eq("user_id", state.user.id)
    .maybeSingle();

  handleDbError(privateResponse.error, "carregar dados restritos do perfil");
  state.privateData = privateResponse.data ?? null;
}

async function loadMyItems() {
  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .eq("owner_id", state.user.id)
    .order("created_at", { ascending: false });

  if (handleDbError(error, "carregar seus imóveis")) {
    state.myItems = [];
    return;
  }

  state.myItems = data ?? [];
  const itemIds = state.myItems.map((item) => item.id);
  await Promise.all([loadImagesForItems(itemIds), loadPrivateLocations(itemIds)]);
}

async function loadPrivateLocations(itemIds) {
  state.privateLocationsByItem = new Map();

  if (!itemIds.length) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("item_private_locations")
    .select("*")
    .in("item_id", itemIds);

  if (handleDbError(error, "carregar endereços restritos")) {
    return;
  }

  state.privateLocationsByItem = new Map((data ?? []).map((location) => [location.item_id, location]));
}

async function loadProposals() {
  const { data, error } = await supabaseClient
    .from("exchange_proposals")
    .select("*")
    .or(`requester_id.eq.${state.user.id},owner_id.eq.${state.user.id}`)
    .order("created_at", { ascending: false });

  if (handleDbError(error, "carregar propostas")) {
    state.proposals = [];
    return;
  }

  state.proposals = data ?? [];
  const itemIds = unique(
    state.proposals.flatMap((proposal) => [proposal.requested_item_id, proposal.offered_item_id])
  );
  const userIds = unique(
    state.proposals.flatMap((proposal) => [proposal.requester_id, proposal.owner_id])
  );

  await Promise.all([
    loadProposalItems(itemIds),
    loadImagesForItems(itemIds),
    loadProfiles(userIds),
    loadContacts(userIds)
  ]);
}

async function loadProposalItems(itemIds) {
  if (!itemIds.length) {
    state.proposalsItemsById = new Map();
    return;
  }

  const { data, error } = await supabaseClient.from("items").select("*").in("id", itemIds);

  if (handleDbError(error, "carregar imóveis das propostas")) {
    state.proposalsItemsById = new Map();
    return;
  }

  state.proposalsItemsById = new Map((data ?? []).map((item) => [item.id, item]));
}

async function loadProfiles(userIds) {
  if (!userIds.length) {
    return;
  }

  const { data, error } = await supabaseClient.from("profiles").select("*").in("id", userIds);

  if (!handleDbError(error, "carregar nomes de usuários")) {
    state.profilesById = new Map((data ?? []).map((profile) => [profile.id, profile]));
  }
}

async function loadContacts(userIds) {
  if (!userIds.length) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("profile_contacts")
    .select("*")
    .in("user_id", userIds);

  if (!handleDbError(error, "carregar contatos liberados")) {
    state.contactsByUserId = new Map((data ?? []).map((contact) => [contact.user_id, contact]));
  }
}

async function loadImagesForItems(itemIds) {
  const ids = unique(itemIds.filter(Boolean));

  if (!ids.length) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("item_images")
    .select("*")
    .in("item_id", ids)
    .order("sort_order", { ascending: true });

  if (handleDbError(error, "carregar imagens")) {
    return;
  }

  for (const id of ids) {
    state.imagesByItem.set(id, []);
  }

  for (const image of data ?? []) {
    const images = state.imagesByItem.get(image.item_id) ?? [];
    images.push(image);
    state.imagesByItem.set(image.item_id, images);
  }
}

function routeFromHash() {
  const view = window.location.hash === "#dashboard" ? "dashboard" : window.location.hash === "#agency" ? "agency" : "home";
  setView(view);
}

function setView(view) {
  elements.homeView.hidden = view !== "home";
  elements.dashboardView.hidden = view !== "dashboard";
  elements.agencyView.hidden = view !== "agency";
  window.location.hash = view === "dashboard" ? "dashboard" : view === "agency" ? "agency" : "home";
}

function handleDocumentClick(event) {
  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) {
    setView(viewLink.dataset.viewLink);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  const { action } = actionTarget.dataset;

  if (action === "open-auth") {
    setAuthMode("login");
    openModal(elements.authModal);
  } else if (action === "logout") {
    logout();
  } else if (action === "deactivate-account") {
    deactivateAccount();
  } else if (action === "close-modal") {
    setAuthMode("login");
    closeModals();
  } else if (action === "open-item-form") {
    openItemForm();
  } else if (action === "view-item") {
    openItemDetail(actionTarget.dataset.itemId);
  } else if (action === "edit-item") {
    openItemForm(actionTarget.dataset.itemId);
  } else if (action === "toggle-item") {
    toggleItemStatus(actionTarget.dataset.itemId);
  } else if (action === "open-proposal") {
    openProposalModal(actionTarget.dataset.itemId);
  } else if (action === "accept-proposal") {
    runProposalRpc("accept_exchange_proposal", actionTarget.dataset.proposalId);
  } else if (action === "reject-proposal") {
    runProposalRpc("reject_exchange_proposal", actionTarget.dataset.proposalId);
  } else if (action === "cancel-proposal") {
    runProposalRpc("cancel_exchange_proposal", actionTarget.dataset.proposalId);
  } else if (action === "fail-proposal") {
    runProposalRpc("mark_exchange_failed", actionTarget.dataset.proposalId);
  } else if (action === "report-item") {
    reportTarget("item", actionTarget.dataset.itemId, actionTarget.dataset.userId);
  } else if (action === "report-user") {
    reportTarget("user", null, actionTarget.dataset.userId);
  }
}

function renderAuthControls() {
  elements.authControls.innerHTML = "";

  if (state.user) {
    const button = document.createElement("button");
    button.className = "secondary auth-button";
    button.type = "button";
    button.dataset.action = "logout";
    button.textContent = "Sair";
    elements.authControls.appendChild(button);
    return;
  }

  const button = document.createElement("button");
  button.className = "auth-button";
  button.type = "button";
  button.dataset.action = "open-auth";
  button.textContent = "Entrar";
  elements.authControls.appendChild(button);
}

function renderHome() {
  const filtered = filterPublicItems();
  elements.itemGrid.innerHTML = "";
  elements.homeEmpty.hidden = filtered.length > 0;
  elements.resultsCount.textContent = `${filtered.length} imóvel${filtered.length === 1 ? "" : "s"}`;

  for (const item of filtered) {
    elements.itemGrid.appendChild(renderItemCard(item, { context: "public" }));
  }
}

function filterPublicItems() {
  const search = normalize(elements.searchInput.value);
  const selectedState = elements.stateFilter.value;
  const city = normalize(elements.cityFilter.value);
  const neighborhood = normalize(elements.neighborhoodFilter.value);
  const category = elements.categoryFilter.value;
  const condition = elements.conditionFilter.value;

  return state.publicItems.filter((item) => {
    const searchable = normalize(
      `${item.title} ${item.description} ${item.trade_preferences} ${item.city} ${item.neighborhood}`
    );
    return (
      (!search || searchable.includes(search)) &&
      (!selectedState || (item.state ?? "PB") === selectedState) &&
      (!city || normalize(item.city) === city) &&
      (!neighborhood || normalize(item.neighborhood).includes(neighborhood)) &&
      (!category || item.category === category) &&
      (!condition || item.condition === condition)
    );
  });
}

function renderDashboard() {
  elements.signedOutPanel.hidden = Boolean(state.user);
  elements.signedInPanel.hidden = !state.user;

  if (!state.user) {
    elements.pendingBadge.hidden = true;
    return;
  }

  elements.profileName.value = state.profile?.full_name ?? "";
  elements.profileUserType.value = state.profile?.user_type ?? "individual";
  updateProfileDocumentUi();
  elements.profileDocument.value = "";
  elements.profileDocument.required = !state.privateData?.document_hash;
  elements.profileDocument.placeholder = state.privateData?.document_hash
    ? "Documento já cadastrado; preencha para atualizar"
    : "";
  elements.profileWhatsapp.value = state.contact?.whatsapp ?? "";
  elements.profileState.value = state.profile?.state ?? "PB";
  populateMunicipalitySelect(elements.profileCity, elements.profileState.value || "PB", false);
  elements.profileCity.value = state.profile?.city ?? "";
  const profileComplete = isProfileComplete();
  const accountInactive = state.profile?.account_status === "inactive";
  elements.profileStatus.textContent = accountInactive ? "Inativo" : profileComplete ? "Completo" : "Pendente";
  elements.profileStatus.classList.toggle("complete", profileComplete);
  elements.profileStatus.classList.toggle("inactive", accountInactive);

  renderMyItems();
  renderProposals();
}

function renderAgency() {
  const agency = state.agency ?? {
    trade_name: "Imobiliária parceira inicial",
    legal_name: "Cadastro institucional em preparação",
    creci: "CRECI a informar",
    whatsapp: "",
    email: "",
    responsible_name: "Responsável pela intermediação"
  };

  const contacts = [
    agency.responsible_name ? `<span>Responsável: ${escapeHtml(agency.responsible_name)}</span>` : "",
    agency.creci ? `<span>CRECI: ${escapeHtml(agency.creci)}</span>` : "",
    agency.whatsapp ? `<span>WhatsApp: ${escapeHtml(agency.whatsapp)}</span>` : "",
    agency.email ? `<span>Email: ${escapeHtml(agency.email)}</span>` : ""
  ].filter(Boolean);

  elements.agencyCard.innerHTML = `
    <p class="eyebrow">Imobiliária ativa</p>
    <h2>${escapeHtml(agency.trade_name)}</h2>
    <p>${escapeHtml(agency.legal_name)}</p>
    <div class="agency-contact-list">
      ${contacts.length ? contacts.join("") : "<span>Dados de contato institucional serão cadastrados na próxima etapa administrativa.</span>"}
    </div>
    <p class="muted">Os contatos pessoais dos usuários continuam protegidos. A imobiliária atua como canal de análise e encaminhamento.</p>
  `;
}

function renderMyItems() {
  elements.myItemsGrid.innerHTML = "";
  elements.myItemsEmpty.hidden = state.myItems.length > 0;

  for (const item of state.myItems) {
    elements.myItemsGrid.appendChild(renderItemCard(item, { context: "mine" }));
  }
}

function renderProposals() {
  const received = state.proposals.filter((proposal) => proposal.owner_id === state.user.id);
  const sent = state.proposals.filter((proposal) => proposal.requester_id === state.user.id);
  const pendingReceived = received.filter((proposal) => proposal.status === "pending").length;

  elements.pendingBadge.hidden = pendingReceived === 0;
  elements.pendingBadge.textContent = String(pendingReceived);

  renderProposalList(elements.receivedProposals, elements.receivedEmpty, received, "received");
  renderProposalList(elements.sentProposals, elements.sentEmpty, sent, "sent");
}

function renderProposalList(container, empty, proposals, mode) {
  container.innerHTML = "";
  empty.hidden = proposals.length > 0;

  for (const proposal of proposals) {
    container.appendChild(renderProposalCard(proposal, mode));
  }
}

function renderItemCard(item, options) {
  const images = state.imagesByItem.get(item.id) ?? [];
  const firstImage = images[0]?.public_url;
  const article = document.createElement("article");
  article.className = "item-card";

  const actionButtons =
    options.context === "mine"
      ? `
        <button class="secondary" type="button" data-action="edit-item" data-item-id="${item.id}">Editar</button>
        <button class="secondary" type="button" data-action="toggle-item" data-item-id="${item.id}">
          ${item.status === "inactive" ? "Reativar" : "Inativar"}
        </button>
      `
      : `
        <button type="button" data-action="view-item" data-item-id="${item.id}">Ver detalhes</button>
      `;

  article.innerHTML = `
    <div class="item-cover">
      ${firstImage ? `<img src="${escapeAttr(firstImage)}" alt="${escapeAttr(item.title)}">` : "Sem imagem"}
    </div>
    <div class="item-body">
      <div class="item-title-row">
        <h3>${escapeHtml(item.title)}</h3>
        <span class="pill status ${item.status}">${statusLabels[item.status] ?? item.status}</span>
      </div>
      <div class="pill-row">
        <span class="pill">${escapeHtml(item.category)}</span>
        <span class="pill">${escapeHtml(item.condition)}</span>
      </div>
        <p class="location">${escapeHtml(item.city)} - ${escapeHtml(item.neighborhood)}</p>
        <p><strong>Repasse pretendido:</strong> ${formatter.format(Number(item.transfer_amount ?? 0))}</p>
        <p>${escapeHtml(truncate(item.description, 110))}</p>
      <p><strong>Busca:</strong> ${escapeHtml(truncate(item.trade_preferences, 90))}</p>
    </div>
    <div class="card-actions">${actionButtons}</div>
  `;

  return article;
}

function renderProposalCard(proposal, mode) {
  const requested = state.proposalsItemsById.get(proposal.requested_item_id);
  const offered = state.proposalsItemsById.get(proposal.offered_item_id);
  const counterpartId = mode === "received" ? proposal.requester_id : proposal.owner_id;
  const profile = state.profilesById.get(counterpartId);
  const contact = state.contactsByUserId.get(counterpartId);
  const card = document.createElement("article");
  card.className = "proposal-card";

  const cashText = proposal.cash_difference > 0
    ? `${formatter.format(Number(proposal.cash_difference))} - ${cashDirectionLabels[proposal.cash_direction]}`
    : "Sem diferença em dinheiro";

  const actions = [];
  if (proposal.status === "pending" && mode === "received") {
    actions.push(`<button type="button" data-action="accept-proposal" data-proposal-id="${proposal.id}">Aceitar</button>`);
    actions.push(`<button class="secondary" type="button" data-action="reject-proposal" data-proposal-id="${proposal.id}">Recusar</button>`);
  }
  if (proposal.status === "pending" && mode === "sent") {
    actions.push(`<button class="secondary" type="button" data-action="cancel-proposal" data-proposal-id="${proposal.id}">Cancelar</button>`);
  }
  if (proposal.status === "accepted") {
    actions.push(`<button class="secondary" type="button" data-action="fail-proposal" data-proposal-id="${proposal.id}">Proposta não aconteceu</button>`);
  }
  actions.push(`<button class="secondary" type="button" data-action="report-user" data-user-id="${counterpartId}">Denunciar usuário</button>`);

  card.innerHTML = `
    <div class="item-title-row">
      <h3>${mode === "received" ? "Proposta recebida" : "Proposta enviada"}</h3>
      <span class="pill status">${proposalStatusLabels[proposal.status] ?? proposal.status}</span>
    </div>
    <p class="muted">Pessoa: ${escapeHtml(profile?.full_name ?? "Usuário do repassecomrepasse")}</p>
    <div class="proposal-summary">
      <div class="proposal-item">
        <strong>Imóvel desejado</strong>
        <p>${escapeHtml(requested?.title ?? "Imóvel indisponível")}</p>
      </div>
      <div class="proposal-arrow">por</div>
      <div class="proposal-item">
        <strong>Imóvel oferecido</strong>
        <p>${escapeHtml(offered?.title ?? "Imóvel indisponível")}</p>
      </div>
    </div>
    <p><strong>Diferença:</strong> ${escapeHtml(cashText)}</p>
    ${proposal.message ? `<p><strong>Mensagem:</strong> ${escapeHtml(proposal.message)}</p>` : ""}
    ${proposal.status === "accepted" ? renderContactBox(contact) : ""}
    <div class="proposal-actions">${actions.join("")}</div>
  `;

  return card;
}

function renderContactBox(contact) {
  if (!contact?.whatsapp) {
    return `
      <div class="contact-box">
        <strong>Contato liberado</strong>
        <span>O contato ainda não foi encontrado. Confira se a outra pessoa completou o perfil.</span>
      </div>
    `;
  }

  return `
    <div class="contact-box">
      <strong>Contato liberado</strong>
      <span>WhatsApp: ${escapeHtml(contact.whatsapp)}</span>
    </div>
  `;
}

async function handleAuth(action) {
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (action === "update-password") {
    if (!password || password.length < 6) {
      showNotice("Informe uma nova senha com pelo menos 6 caracteres.", "error");
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) {
      showNotice(error.message, "error");
      return;
    }

    setAuthMode("login");
    closeModals();
    showNotice("Senha atualizada com sucesso.");
    return;
  }

  if (action === "reset-password") {
    if (!email) {
      showNotice("Informe seu email para receber o link de recuperação.", "error");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}#dashboard`
    });

    if (error) {
      showNotice(error.message, "error");
      return;
    }

    closeModals();
    showNotice("Enviamos um link de recuperação para o email informado.");
    return;
  }

  if (!email || !password) {
    showNotice("Informe email e senha.", "error");
    return;
  }

  const response = action === "signup"
    ? await supabaseClient.auth.signUp({ email, password })
    : await supabaseClient.auth.signInWithPassword({ email, password });

  if (response.error) {
    showNotice(response.error.message, "error");
    return;
  }

  closeModals();
  showNotice(action === "signup"
    ? "Conta criada. Se o Supabase pedir confirmação, verifique seu email antes de entrar."
    : "Entrada realizada com sucesso.");
}

async function logout() {
  await supabaseClient.auth.signOut();
  setAuthMode("login");
  setView("home");
}

function openPasswordRecoveryMode() {
  setAuthMode("recovery");
  openModal(elements.authModal);
  showNotice("Informe sua nova senha para concluir a recuperação.");
}

function setAuthMode(mode) {
  const recovery = mode === "recovery";
  elements.loginFields.hidden = recovery;
  elements.authEmail.required = !recovery;
  elements.authPassword.value = "";
  elements.authPassword.autocomplete = recovery ? "new-password" : "current-password";
  elements.authPasswordLabel.textContent = recovery ? "Nova senha" : "Senha";

  document.querySelectorAll("[data-auth-action='login'], [data-auth-action='signup'], [data-auth-action='reset-password']")
    .forEach((button) => {
      button.hidden = recovery;
    });

  const updateButton = document.querySelector("[data-auth-action='update-password']");
  if (updateButton) {
    updateButton.hidden = !recovery;
  }
}

async function saveProfile(event) {
  event.preventDefault();

  if (!requireLogin()) {
    return;
  }

  const fullName = elements.profileName.value.trim();
  const userType = elements.profileUserType.value;
  const documentType = getDocumentTypeForUserType(userType);
  const documentDigits = digitsOnly(elements.profileDocument.value);
  const whatsapp = elements.profileWhatsapp.value.trim();
  const profileState = elements.profileState.value || "PB";
  const city = elements.profileCity.value;

  if (!fullName || !userType || !whatsapp || !profileState || !city) {
    showNotice("Nome, tipo de pessoa, WhatsApp, estado e cidade são obrigatórios.", "error");
    return;
  }

  if (!isValidDocument(documentType, documentDigits) && !state.privateData?.document_hash) {
    showNotice(`Informe um ${documentType === "cpf" ? "CPF" : "CNPJ"} válido para concluir o perfil.`, "error");
    return;
  }

  if (documentDigits && !isValidDocument(documentType, documentDigits)) {
    showNotice(`Confira o ${documentType === "cpf" ? "CPF" : "CNPJ"} informado.`, "error");
    return;
  }

  const profileResponse = await supabaseClient
    .from("profiles")
    .upsert({
      id: state.user.id,
      full_name: fullName,
      user_type: userType,
      role: state.profile?.role ?? "user",
      account_status: "active",
      state: profileState,
      city
    }, { onConflict: "id" });

  if (handleDbError(profileResponse.error, "salvar perfil")) {
    return;
  }

  const contactResponse = await supabaseClient
    .from("profile_contacts")
    .upsert({ user_id: state.user.id, whatsapp }, { onConflict: "user_id" });

  if (handleDbError(contactResponse.error, "salvar contato")) {
    return;
  }

  if (documentDigits) {
    const documentHash = await sha256Hex(`${documentType}:${documentDigits}`);
    const privateResponse = await supabaseClient
      .from("profile_private_data")
      .upsert({
        user_id: state.user.id,
        document_type: documentType,
        document_hash: documentHash,
        document_encrypted: maskDocument(documentType, documentDigits)
      }, { onConflict: "user_id" });

    if (handleDbError(privateResponse.error, "salvar CPF/CNPJ restrito")) {
      return;
    }
  }

  showNotice("Perfil salvo.");
  await refreshAll();
}

async function deactivateAccount() {
  if (!requireLogin()) {
    return;
  }

  const confirmed = confirm(
    "Desativar sua conta? Seus imóveis ficarão inativos e você precisará salvar o perfil novamente para reativar."
  );

  if (!confirmed) {
    return;
  }

  const itemsResponse = await supabaseClient
    .from("items")
    .update({ status: "inactive" })
    .eq("owner_id", state.user.id)
    .neq("status", "traded");

  if (handleDbError(itemsResponse.error, "inativar imóveis da conta")) {
    return;
  }

  const profileResponse = await supabaseClient
    .from("profiles")
    .update({ account_status: "inactive" })
    .eq("id", state.user.id);

  if (handleDbError(profileResponse.error, "desativar conta")) {
    return;
  }

  await logout();
  showNotice("Conta desativada. Para reativar, entre novamente e salve seu perfil.");
}

function openItemForm(itemId) {
  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  const item = itemId ? state.myItems.find((candidate) => candidate.id === itemId) : null;
  elements.itemForm.reset();
  elements.itemId.value = item?.id ?? "";
  elements.itemModalTitle.textContent = item ? "Editar imóvel" : "Cadastrar imóvel";
  elements.itemState.value = item?.state ?? "PB";
  populateMunicipalitySelect(elements.itemCity, elements.itemState.value, false);
  elements.imageRequirement.textContent = item
    ? "Inclua novas imagens somente se quiser adicionar mais fotos. Máximo de 5 por imóvel."
    : "Inclua de 1 a 5 imagens.";

  if (item) {
    const privateLocation = state.privateLocationsByItem.get(item.id);
    elements.itemTitle.value = item.title;
    elements.itemCategory.value = item.category;
    elements.itemCondition.value = item.condition;
    elements.itemTransferAmount.value = item.transfer_amount ?? 0;
    elements.itemOutstandingBalance.value = item.outstanding_balance ?? 0;
    elements.itemMonthlyPayment.value = item.monthly_payment ?? 0;
    elements.itemInstallmentsRemaining.value = item.installments_remaining ?? 0;
    elements.itemCity.value = item.city;
    elements.itemNeighborhood.value = item.neighborhood;
    elements.itemStreet.value = privateLocation?.street ?? "";
    elements.itemNumber.value = privateLocation?.number ?? "";
    elements.itemAddressNotes.value = privateLocation?.notes ?? "";
    elements.itemPreferences.value = item.trade_preferences;
    elements.itemDescription.value = item.description;
    elements.itemLegitimacy.checked = Boolean(item.legitimacy_confirmed);
  }

  renderExistingImagePreview(item?.id);
  openModal(elements.itemModal);
}

async function saveItem(event) {
  event.preventDefault();

  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  const itemId = elements.itemId.value;
  const files = Array.from(elements.itemImages.files ?? []);
  const existingImages = itemId ? (state.imagesByItem.get(itemId) ?? []) : [];
  const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));

  if (invalidFile) {
    showNotice("Envie imagens somente em JPG, PNG ou WebP.", "error");
    return;
  }

  if (!itemId && files.length === 0) {
    showNotice("Inclua ao menos uma imagem do imóvel.", "error");
    return;
  }

  if (existingImages.length + files.length > 5) {
    showNotice("Cada imóvel pode ter no máximo 5 imagens.", "error");
    return;
  }

  const payload = {
    owner_id: state.user.id,
    title: elements.itemTitle.value.trim(),
    description: elements.itemDescription.value.trim(),
    category: elements.itemCategory.value,
    condition: elements.itemCondition.value,
    transfer_amount: readMoneyInput(elements.itemTransferAmount),
    outstanding_balance: readMoneyInput(elements.itemOutstandingBalance),
    monthly_payment: readMoneyInput(elements.itemMonthlyPayment),
    installments_remaining: Number(elements.itemInstallmentsRemaining.value || 0),
    legitimacy_confirmed: elements.itemLegitimacy.checked,
    state: elements.itemState.value,
    city: elements.itemCity.value.trim(),
    neighborhood: elements.itemNeighborhood.value.trim(),
    trade_preferences: elements.itemPreferences.value.trim()
  };

  const privateLocation = {
    street: elements.itemStreet.value.trim(),
    number: elements.itemNumber.value.trim(),
    notes: elements.itemAddressNotes.value.trim()
  };

  if (Object.entries(payload).some(([key, value]) => key !== "legitimacy_confirmed" && value === "") || !privateLocation.street || !privateLocation.number) {
    showNotice("Preencha todos os campos obrigatórios do imóvel.", "error");
    return;
  }

  if (
    payload.transfer_amount < 0 ||
    payload.outstanding_balance < 0 ||
    payload.monthly_payment < 0 ||
    payload.installments_remaining < 0
  ) {
    showNotice("Os dados financeiros não podem ter valores negativos.", "error");
    return;
  }

  if (!payload.legitimacy_confirmed) {
    showNotice("Confirme sua legitimidade para cadastrar o imóvel.", "error");
    return;
  }

  const response = itemId
    ? await supabaseClient.from("items").update(payload).eq("id", itemId).select("*").single()
    : await supabaseClient.from("items").insert(payload).select("*").single();

  if (handleDbError(response.error, "salvar imóvel")) {
    return;
  }

  const privateLocationFailed = await savePrivateLocation(response.data.id, privateLocation);
  if (privateLocationFailed) {
    return;
  }

  if (files.length) {
    const uploadFailed = await uploadItemImages(response.data.id, files, existingImages.length);
    if (uploadFailed) {
      return;
    }
  }

  closeModals();
  showNotice("Imóvel salvo.");
  await refreshAll();
  setView("dashboard");
}

async function savePrivateLocation(itemId, privateLocation) {
  const { error } = await supabaseClient.from("item_private_locations").upsert(
    {
      item_id: itemId,
      owner_id: state.user.id,
      street: privateLocation.street,
      number: privateLocation.number,
      notes: privateLocation.notes || null
    },
    { onConflict: "item_id" }
  );

  return handleDbError(error, "salvar endereço restrito");
}

async function uploadItemImages(itemId, files, startIndex) {
  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${state.user.id}/${itemId}/${crypto.randomUUID()}.${extension}`;
    const uploadResponse = await supabaseClient.storage
      .from(config.storageBucket)
      .upload(path, file, { upsert: false });

    if (handleDbError(uploadResponse.error, "enviar imagem")) {
      return true;
    }

    const { data } = supabaseClient.storage.from(config.storageBucket).getPublicUrl(path);
    const imageResponse = await supabaseClient.from("item_images").insert({
      item_id: itemId,
      storage_path: path,
      public_url: data.publicUrl,
      sort_order: startIndex + index
    });

    if (handleDbError(imageResponse.error, "registrar imagem")) {
      return true;
    }
  }

  return false;
}

function previewSelectedImages() {
  const files = Array.from(elements.itemImages.files ?? []);
  elements.itemImagePreview.innerHTML = "";

  for (const file of files.slice(0, 5)) {
    const img = document.createElement("img");
    img.alt = file.name;
    img.src = URL.createObjectURL(file);
    elements.itemImagePreview.appendChild(img);
  }
}

function renderExistingImagePreview(itemId) {
  elements.itemImagePreview.innerHTML = "";

  if (!itemId) {
    return;
  }

  for (const image of state.imagesByItem.get(itemId) ?? []) {
    const img = document.createElement("img");
    img.alt = "Imagem cadastrada";
    img.src = image.public_url;
    elements.itemImagePreview.appendChild(img);
  }
}

async function toggleItemStatus(itemId) {
  const item = state.myItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    return;
  }

  const nextStatus = item.status === "inactive" ? "available" : "inactive";
  const { error } = await supabaseClient.from("items").update({ status: nextStatus }).eq("id", itemId);

  if (handleDbError(error, "alterar status do imóvel")) {
    return;
  }

  showNotice(nextStatus === "available" ? "Imóvel reativado." : "Imóvel inativado.");
  await refreshAll();
}

function openItemDetail(itemId) {
  const item = state.publicItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    return;
  }

  state.selectedDetailItem = item;
  const images = state.imagesByItem.get(item.id) ?? [];
  const gallery = images.length
    ? images.map((image) => `<img src="${escapeAttr(image.public_url)}" alt="${escapeAttr(item.title)}">`).join("")
    : `<div class="empty-state slim">Sem imagem</div>`;

  const isOwner = state.user?.id === item.owner_id;

  elements.itemDetail.innerHTML = `
    <div class="detail-layout">
      <div class="detail-gallery">${gallery}</div>
      <div class="detail-info">
        <p class="eyebrow">Imóvel em análise</p>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="pill-row">
          <span class="pill">${escapeHtml(item.category)}</span>
          <span class="pill">${escapeHtml(item.condition)}</span>
        </div>
        <p class="location">${escapeHtml(item.city)} - ${escapeHtml(item.neighborhood)}</p>
        <p>${escapeHtml(item.description)}</p>
        <div class="financial-summary">
          <span><strong>Repasse pretendido</strong>${formatter.format(Number(item.transfer_amount ?? 0))}</span>
          <span><strong>Saldo devedor aprox.</strong>${formatter.format(Number(item.outstanding_balance ?? 0))}</span>
          <span><strong>Parcela mensal aprox.</strong>${formatter.format(Number(item.monthly_payment ?? 0))}</span>
          <span><strong>Parcelas restantes</strong>${Number(item.installments_remaining ?? 0)}</span>
        </div>
        <p><strong>Preferências de proposta:</strong> ${escapeHtml(item.trade_preferences)}</p>
        <p class="muted">O contato só é liberado quando a proposta é aceita. Combine local e horário diretamente com a outra pessoa.</p>
        <div class="detail-actions">
          <button type="button" data-action="open-proposal" data-item-id="${item.id}" ${isOwner ? "disabled" : ""}>
            ${isOwner ? "Este imóvel é seu" : "Enviar proposta"}
          </button>
          <button class="secondary" type="button" data-action="report-item" data-item-id="${item.id}" data-user-id="${item.owner_id}">Denunciar anúncio</button>
        </div>
      </div>
    </div>
  `;

  openModal(elements.detailModal);
}

async function openProposalModal(itemId) {
  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  const requested = state.publicItems.find((item) => item.id === itemId);
  if (!requested || requested.owner_id === state.user.id) {
    return;
  }

  const availableMyItems = state.myItems.filter((item) => item.status === "available");
  elements.proposalForm.reset();
  elements.proposalRequestedItemId.value = itemId;
  elements.proposalIntro.textContent = `Você está enviando uma proposta pelo imóvel "${requested.title}".`;
  elements.offeredItemSelect.innerHTML = "";

  for (const item of availableMyItems) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.title} - ${item.city}/${item.neighborhood}`;
    elements.offeredItemSelect.appendChild(option);
  }

  elements.noOfferItems.hidden = availableMyItems.length > 0;
  elements.proposalForm.querySelector("button[type='submit']").disabled = availableMyItems.length === 0;
  closeModals();
  openModal(elements.proposalModal);
}

async function sendProposal(event) {
  event.preventDefault();

  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  const requested = state.publicItems.find((item) => item.id === elements.proposalRequestedItemId.value);
  const offered = state.myItems.find((item) => item.id === elements.offeredItemSelect.value);

  if (!requested || !offered) {
    showNotice("Selecione um imóvel válido para enviar a proposta.", "error");
    return;
  }

  const cashDifference = Number(elements.cashDifference.value || 0);
  const cashDirection = elements.cashDirection.value;

  if (cashDifference < 0) {
    showNotice("A diferença em dinheiro não pode ser negativa.", "error");
    return;
  }

  if (cashDifference > 0 && cashDirection === "none") {
    showNotice("Informe quem pagaria a diferença em dinheiro.", "error");
    return;
  }

  const { error } = await supabaseClient.from("exchange_proposals").insert({
    requested_item_id: requested.id,
    offered_item_id: offered.id,
    requester_id: state.user.id,
    owner_id: requested.owner_id,
    cash_difference: cashDifference,
    cash_direction: cashDifference > 0 ? cashDirection : "none",
    message: elements.proposalMessage.value.trim()
  });

  if (handleDbError(error, "enviar proposta")) {
    return;
  }

  closeModals();
  showNotice("Proposta enviada.");
  await refreshAll();
  setView("dashboard");
}

async function runProposalRpc(functionName, proposalId) {
  const confirmationMessages = {
    accept_exchange_proposal: "Aceitar esta proposta e marcar os dois imóveis como em acordo?",
    reject_exchange_proposal: "Recusar esta proposta?",
    cancel_exchange_proposal: "Cancelar esta proposta enviada?",
    mark_exchange_failed: "Marcar que esta proposta não aconteceu e reabrir os imóveis?"
  };

  if (!confirm(confirmationMessages[functionName])) {
    return;
  }

  const { error } = await supabaseClient.rpc(functionName, { p_proposal_id: proposalId });

  if (handleDbError(error, "atualizar proposta")) {
    return;
  }

  showNotice("Proposta atualizada.");
  await refreshAll();
}

async function reportTarget(targetType, itemId, userId) {
  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  const reason = prompt("Descreva rapidamente o motivo da denúncia:");
  if (!reason?.trim()) {
    return;
  }

  const { error } = await supabaseClient.from("reports").insert({
    reporter_id: state.user.id,
    target_type: targetType,
    target_item_id: itemId || null,
    target_user_id: userId || null,
    reason: reason.trim()
  });

  if (handleDbError(error, "registrar denúncia")) {
    return;
  }

  showNotice("Denúncia registrada para revisão.");
}

function isProfileComplete() {
  return Boolean(
    state.profile?.account_status !== "inactive" &&
    state.profile?.full_name &&
    state.profile?.user_type &&
    state.profile?.state &&
    state.profile?.city &&
    state.contact?.whatsapp &&
    state.privateData?.document_hash
  );
}

function updateProfileDocumentUi() {
  const documentType = getDocumentTypeForUserType(elements.profileUserType.value);
  const label = documentType === "cpf" ? "CPF" : "CNPJ";
  elements.profileDocumentLabel.textContent = label;
  elements.profileDocument.maxLength = documentType === "cpf" ? 14 : 18;
  elements.profileDocument.placeholder = documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00";
  elements.profileDocumentHint.textContent =
    `${label} obrigatório. O número completo não aparece publicamente e fica restrito ao próprio usuário.`;
}

function getDocumentTypeForUserType(userType) {
  return userType === "company" ? "cnpj" : "cpf";
}

function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function isValidDocument(documentType, digits) {
  const expectedLength = documentType === "cnpj" ? 14 : 11;
  return digits.length === expectedLength && !/^(\d)\1+$/.test(digits);
}

function maskDocument(documentType, digits) {
  if (documentType === "cnpj") {
    return `**.***.***/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }

  return `***.***.***-${digits.slice(9, 11)}`;
}

function readMoneyInput(input) {
  return Number(input.value || 0);
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function requireLogin() {
  if (state.user) {
    return true;
  }

  openModal(elements.authModal);
  showNotice("Entre ou crie uma conta para continuar.");
  return false;
}

function requireCompleteProfile() {
  const complete = isProfileComplete();

  if (complete) {
    return true;
  }

  closeModals();
  setView("dashboard");
  showNotice("Complete seu perfil com nome, WhatsApp, CPF/CNPJ, estado e cidade antes de continuar.", "error");
  return false;
}

function openModal(modal) {
  modal.hidden = false;
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.hidden = true;
  });
}

function showNotice(message, type = "info") {
  elements.notice.textContent = message;
  elements.notice.className = `notice${type === "error" ? " error" : ""}`;
  elements.notice.hidden = false;
}

function clearNotice() {
  elements.notice.hidden = true;
  elements.notice.textContent = "";
}

function handleDbError(error, action) {
  if (!error) {
    return false;
  }

  const message = error.message || String(error);
  const schemaMissing = message.includes("relation") || message.includes("schema cache");

  if (schemaMissing) {
    showNotice(
      `O banco do repassecomrepasse ainda precisa ser atualizado. Execute o novo supabase.sql no Supabase para ${action}.`,
      "error"
    );
  } else {
    showNotice(`Erro ao ${action}: ${message}`, "error");
  }

  return true;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function truncate(value, size) {
  const text = String(value ?? "");
  return text.length > size ? `${text.slice(0, size - 1)}...` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
