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
const CONSENT_VERSION = "2026-06-01-mvp";

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
  inactive: "Inativo",
  expired: "Expirado"
};

const moderationStatusLabels = {
  pending: "Em revisão",
  approved: "Aprovado",
  rejected: "Ajustar anúncio"
};

const proposalStatusLabels = {
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Recusada",
  cancelled: "Cancelada",
  failed: "Não concluída",
  expired: "Expirada",
  countered: "Contraproposta enviada"
};

const leadStatusLabels = {
  new: "Novo",
  contacted: "Contato iniciado",
  document_review: "Análise documental",
  negotiation: "Em negociação",
  final_agreement: "Acordo final",
  closed: "Concluído",
  cancelled: "Cancelado"
};

const cancellationStatusLabels = {
  requested: "Solicitado",
  approved: "Aprovado",
  rejected: "Retornado para ajustes"
};

const finalAgreementStatusLabels = {
  requested: "Aguardando aceites",
  accepted: "Aceito pelas partes",
  finalized: "Formalizado",
  cancelled: "Cancelado"
};

const cashDirectionLabels = {
  none: "Sem diferença em dinheiro",
  requester_pays: "Interessado pagaria a diferença",
  owner_pays: "Anunciante pagaria a diferença"
};

function loadFavoriteItemIds() {
  try {
    const saved = JSON.parse(localStorage.getItem("repasse:favorites") || "[]");
    return new Set(Array.isArray(saved) ? saved : []);
  } catch (_error) {
    localStorage.removeItem("repasse:favorites");
    return new Set();
  }
}

const state = {
  user: null,
  profile: null,
  contact: null,
  privateData: null,
  consent: null,
  agency: null,
  publicItems: [],
  myItems: [],
  moderationItems: [],
  leads: [],
  cancellations: [],
  cancellationsByProposalId: new Map(),
  finalAgreements: [],
  finalAgreementsByProposalId: new Map(),
  notifications: [],
  adminReports: [],
  auditEvents: [],
  leadUpdatesByProposalId: new Map(),
  proposals: [],
  imagesByItem: new Map(),
  proposalsItemsById: new Map(),
  profilesById: new Map(),
  contactsByUserId: new Map(),
  privateLocationsByItem: new Map(),
  favoriteItemIds: loadFavoriteItemIds(),
  visibleItemCount: 12,
  formOpenedAt: {
    item: 0,
    proposal: 0
  },
  turnstile: {
    scriptPromise: null,
    widgets: {},
    tokens: {}
  },
  imageOcrPromise: null,
  schemaFeatures: {
    moderation: true,
    advancedProposals: true,
    leads: true,
    cancellations: true,
    finalAgreements: true,
    notifications: true,
    favorites: true,
    audit: true
  },
  selectedDetailItem: null
};

const $ = (id) => document.getElementById(id);
const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short"
});

const elements = {
  notice: $("notice"),
  homeView: $("homeView"),
  dashboardView: $("dashboardView"),
  agencyView: $("agencyView"),
  agencyCard: $("agencyCard"),
  authControls: $("authControls"),
  pendingBadge: $("pendingBadge"),
  notificationsList: $("notificationsList"),
  notificationsEmpty: $("notificationsEmpty"),
  adminSection: $("adminSection"),
  adminSettings: $("adminSettings"),
  adminReportsList: $("adminReportsList"),
  adminReportsEmpty: $("adminReportsEmpty"),
  adminAuditList: $("adminAuditList"),
  adminAuditEmpty: $("adminAuditEmpty"),
  searchInput: $("searchInput"),
  stateFilter: $("stateFilter"),
  cityFilter: $("cityFilter"),
  neighborhoodFilter: $("neighborhoodFilter"),
  categoryFilter: $("categoryFilter"),
  conditionFilter: $("conditionFilter"),
  sortFilter: $("sortFilter"),
  itemGrid: $("itemGrid"),
  loadMoreItems: $("loadMoreItems"),
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
  profileConsent: $("profileConsent"),
  profileStatus: $("profileStatus"),
  myItemsGrid: $("myItemsGrid"),
  myItemsEmpty: $("myItemsEmpty"),
  receivedProposals: $("receivedProposals"),
  sentProposals: $("sentProposals"),
  receivedEmpty: $("receivedEmpty"),
  sentEmpty: $("sentEmpty"),
  moderationSection: $("moderationSection"),
  moderationList: $("moderationList"),
  moderationEmpty: $("moderationEmpty"),
  leadsSection: $("leadsSection"),
  leadsList: $("leadsList"),
  leadsEmpty: $("leadsEmpty"),
  cancellationsSection: $("cancellationsSection"),
  cancellationsList: $("cancellationsList"),
  cancellationsEmpty: $("cancellationsEmpty"),
  authModal: $("authModal"),
  loginFields: $("loginFields"),
  authEmail: $("authEmail"),
  authPassword: $("authPassword"),
  authPasswordLabel: $("authPasswordLabel"),
  itemModal: $("itemModal"),
  itemModalTitle: $("itemModalTitle"),
  itemForm: $("itemForm"),
  itemId: $("itemId"),
  itemHoneypot: $("itemHoneypot"),
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
  itemTurnstile: $("itemTurnstile"),
  detailModal: $("detailModal"),
  itemDetail: $("itemDetail"),
  proposalModal: $("proposalModal"),
  proposalIntro: $("proposalIntro"),
  proposalForm: $("proposalForm"),
  proposalRequestedItemId: $("proposalRequestedItemId"),
  proposalHoneypot: $("proposalHoneypot"),
  proposalType: $("proposalType"),
  offeredItemSelect: $("offeredItemSelect"),
  offeredItem2Select: $("offeredItem2Select"),
  offeredItem2Label: $("offeredItem2Label"),
  noOfferItems: $("noOfferItems"),
  advancedProposalHint: $("advancedProposalHint"),
  cashDifference: $("cashDifference"),
  cashDirection: $("cashDirection"),
  proposalMessage: $("proposalMessage"),
  proposalTurnstile: $("proposalTurnstile")
};

init();

async function init() {
  populateSelects();
  bindEvents();
  loadTurnstileIfConfigured();

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
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("submit", handleDocumentSubmit);

  for (const input of [
    elements.searchInput,
    elements.stateFilter,
    elements.cityFilter,
    elements.neighborhoodFilter,
    elements.categoryFilter,
    elements.conditionFilter,
    elements.sortFilter
  ]) {
    input.addEventListener("input", () => {
      state.visibleItemCount = 12;
      renderHome();
    });
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
  elements.proposalType.addEventListener("change", syncProposalOfferFields);
  elements.cashDifference.addEventListener("input", syncProposalOfferFields);
  elements.loadMoreItems.addEventListener("click", () => {
    state.visibleItemCount += 12;
    renderHome();
  });

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
  let query = supabaseClient
    .from("items")
    .select("*")
    .eq("status", "available");

  if (state.schemaFeatures.moderation) {
    query = query.eq("moderation_status", "approved");
  }

  let { data, error } = await query.order("created_at", { ascending: false });

  if (isMissingColumnError(error, "moderation_status")) {
    state.schemaFeatures.moderation = false;
    const fallback = await supabaseClient
      .from("items")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });
    data = fallback.data;
    error = fallback.error;
  }

  if (handleDbError(error, "carregar imóveis disponíveis")) {
    state.publicItems = [];
    return;
  }

  state.publicItems = (data ?? []).filter((item) => !isItemExpired(item));
  await loadImagesForItems(state.publicItems.map((item) => item.id));
}
async function loadUserData() {
  state.profile = null;
  state.contact = null;
  state.privateData = null;
  state.consent = null;
  state.myItems = [];
  state.moderationItems = [];
  state.leads = [];
  state.cancellations = [];
  state.cancellationsByProposalId = new Map();
  state.finalAgreements = [];
  state.finalAgreementsByProposalId = new Map();
  state.notifications = [];
  state.adminReports = [];
  state.auditEvents = [];
  state.leadUpdatesByProposalId = new Map();
  state.proposals = [];
  state.proposalsItemsById = new Map();
  state.profilesById = new Map();
  state.contactsByUserId = new Map();
  state.privateLocationsByItem = new Map();

  if (!state.user) {
    return;
  }

  await loadProfile();
  await Promise.all([
    loadMyItems(),
    loadProposals(),
    loadModerationItems(),
    loadLeads(),
    loadLeadUpdates(),
    loadCancellations(),
    loadFinalAgreements(),
    loadNotifications(),
    loadFavoriteItems(),
    loadAdminData()
  ]);
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

  const consentResponse = await supabaseClient
    .from("consent_records")
    .select("*")
    .eq("user_id", state.user.id)
    .eq("consent_type", "terms_privacy")
    .eq("version", CONSENT_VERSION)
    .maybeSingle();

  if (!isMissingRelationError(consentResponse.error, "consent_records")) {
    handleDbError(consentResponse.error, "carregar consentimento");
    state.consent = consentResponse.data ?? null;
  }
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

async function loadModerationItems() {
  state.moderationItems = [];

  if (!isModerator() || !state.schemaFeatures.moderation) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .eq("moderation_status", "pending")
    .order("updated_at", { ascending: true });

  if (handleDbError(error, "carregar fila de moderação")) {
    return;
  }

  state.moderationItems = data ?? [];
  await Promise.all([
    loadImagesForItems(state.moderationItems.map((item) => item.id)),
    loadProfiles(unique(state.moderationItems.map((item) => item.owner_id)))
  ]);
}

async function ensureAdvancedProposalsFeature() {
  if (!state.schemaFeatures.advancedProposals) {
    return;
  }

  const { error } = await supabaseClient
    .from("exchange_proposals")
    .select("offered_item_2_id,proposal_type,created_by,responder_id,expires_at")
    .limit(1);

  if (
    isMissingColumnError(error, "offered_item_2_id") ||
    isMissingColumnError(error, "proposal_type") ||
    isMissingColumnError(error, "created_by") ||
    isMissingColumnError(error, "responder_id") ||
    isMissingColumnError(error, "expires_at")
  ) {
    state.schemaFeatures.advancedProposals = false;
  }
}

async function loadProposals() {
  await ensureAdvancedProposalsFeature();

  if (state.schemaFeatures.advancedProposals) {
    const { error } = await supabaseClient.rpc("expire_exchange_proposals");
    if (error && !isMissingFunctionError(error, "expire_exchange_proposals")) {
      handleDbError(error, "expirar propostas antigas");
    }
  }

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
    state.proposals.flatMap((proposal) => [
      proposal.requested_item_id,
      proposal.offered_item_id,
      proposal.offered_item_2_id
    ])
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
    return;
  }

  const { data, error } = await supabaseClient.from("items").select("*").in("id", itemIds);

  if (handleDbError(error, "carregar imóveis das propostas")) {
    state.proposalsItemsById = new Map();
    return;
  }

  for (const item of data ?? []) {
    state.proposalsItemsById.set(item.id, item);
  }
}

async function loadLeads() {
  state.leads = [];

  if (!isModerator() || !state.schemaFeatures.leads) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("negotiation_leads")
    .select("*")
    .order("updated_at", { ascending: false });

  if (isMissingRelationError(error, "negotiation_leads")) {
    state.schemaFeatures.leads = false;
    return;
  }

  if (handleDbError(error, "carregar leads")) {
    return;
  }

  state.leads = data ?? [];
  const itemIds = unique(state.leads.map((lead) => lead.requested_item_id));
  const userIds = unique(state.leads.flatMap((lead) => [lead.requester_id, lead.owner_id, lead.assigned_to]));

  await Promise.all([
    loadProposalItems(itemIds),
    loadProfiles(userIds)
  ]);
}

async function loadLeadUpdates() {
  state.leadUpdatesByProposalId = new Map();

  if (!state.schemaFeatures.leads) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("get_my_lead_updates");

  if (isMissingFunctionError(error, "get_my_lead_updates")) {
    state.schemaFeatures.leads = false;
    return;
  }

  if (error) {
    return;
  }

  state.leadUpdatesByProposalId = new Map((data ?? []).map((lead) => [lead.proposal_id, lead]));
}

async function loadCancellations() {
  state.cancellations = [];
  state.cancellationsByProposalId = new Map();

  if (!state.schemaFeatures.cancellations) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("agreement_cancellations")
    .select("*")
    .order("created_at", { ascending: false });

  if (isMissingRelationError(error, "agreement_cancellations")) {
    state.schemaFeatures.cancellations = false;
    return;
  }

  if (handleDbError(error, "carregar cancelamentos")) {
    return;
  }

  state.cancellations = data ?? [];
  for (const cancellation of state.cancellations) {
    if (!state.cancellationsByProposalId.has(cancellation.proposal_id)) {
      state.cancellationsByProposalId.set(cancellation.proposal_id, cancellation);
    }
  }

  await loadProfiles(unique(state.cancellations.map((cancellation) => cancellation.requested_by)));
}

async function loadFinalAgreements() {
  state.finalAgreements = [];
  state.finalAgreementsByProposalId = new Map();

  if (!state.schemaFeatures.finalAgreements) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("final_agreement_terms")
    .select("*")
    .order("version", { ascending: false });

  if (isMissingRelationError(error, "final_agreement_terms")) {
    state.schemaFeatures.finalAgreements = false;
    return;
  }

  if (handleDbError(error, "carregar acordos finais")) {
    return;
  }

  state.finalAgreements = data ?? [];
  for (const agreement of state.finalAgreements) {
    if (!state.finalAgreementsByProposalId.has(agreement.proposal_id)) {
      state.finalAgreementsByProposalId.set(agreement.proposal_id, agreement);
    }
  }
}

async function loadNotifications() {
  state.notifications = [];

  if (!state.schemaFeatures.notifications) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (isMissingRelationError(error, "notifications")) {
    state.schemaFeatures.notifications = false;
    return;
  }

  if (handleDbError(error, "carregar notificações")) {
    return;
  }

  state.notifications = data ?? [];
}

async function loadFavoriteItems() {
  if (!state.schemaFeatures.favorites) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("favorite_items")
    .select("item_id")
    .eq("user_id", state.user.id);

  if (isMissingRelationError(error, "favorite_items")) {
    state.schemaFeatures.favorites = false;
    return;
  }

  if (handleDbError(error, "carregar favoritos")) {
    return;
  }

  state.favoriteItemIds = new Set((data ?? []).map((favorite) => favorite.item_id));
  localStorage.setItem("repasse:favorites", JSON.stringify([...state.favoriteItemIds]));
}

async function loadAdminData() {
  state.adminReports = [];
  state.auditEvents = [];

  if (!isModerator()) {
    return;
  }

  const [reportsResponse, auditResponse] = await Promise.all([
    supabaseClient.from("reports").select("*").order("created_at", { ascending: false }).limit(20),
    supabaseClient.from("audit_events").select("*").order("created_at", { ascending: false }).limit(20)
  ]);

  if (!handleDbError(reportsResponse.error, "carregar denúncias")) {
    state.adminReports = reportsResponse.data ?? [];
  }
  if (!handleDbError(auditResponse.error, "carregar auditoria")) {
    state.auditEvents = auditResponse.data ?? [];
  }
}

async function loadProfiles(userIds) {
  if (!userIds.length) {
    return;
  }

  const { data, error } = await supabaseClient.from("profiles").select("*").in("id", userIds);

  if (!handleDbError(error, "carregar nomes de usuários")) {
    for (const profile of data ?? []) {
      state.profilesById.set(profile.id, profile);
    }
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
  const hash = window.location.hash;
  if (hash.startsWith("#item-")) {
    setView("home", false);
    openItemDetail(hash.replace("#item-", ""));
    return;
  }

  const view = hash === "#dashboard" ? "dashboard" : hash === "#agency" ? "agency" : "home";
  setView(view);
}

function setView(view, updateHash = true) {
  elements.homeView.hidden = view !== "home";
  elements.dashboardView.hidden = view !== "dashboard";
  elements.agencyView.hidden = view !== "agency";
  if (updateHash) {
    window.location.hash = view === "dashboard" ? "dashboard" : view === "agency" ? "agency" : "home";
  }
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
  } else if (action === "favorite-item") {
    toggleFavorite(actionTarget.dataset.itemId);
  } else if (action === "share-item") {
    shareItem(actionTarget.dataset.itemId);
  } else if (action === "edit-item") {
    openItemForm(actionTarget.dataset.itemId);
  } else if (action === "toggle-item") {
    toggleItemStatus(actionTarget.dataset.itemId);
  } else if (action === "renew-item") {
    renewItem(actionTarget.dataset.itemId);
  } else if (action === "open-proposal") {
    openProposalModal(actionTarget.dataset.itemId);
  } else if (action === "accept-proposal") {
    runProposalRpc("accept_exchange_proposal", actionTarget.dataset.proposalId);
  } else if (action === "reject-proposal") {
    runProposalRpc("reject_exchange_proposal", actionTarget.dataset.proposalId);
  } else if (action === "cancel-proposal") {
    runProposalRpc("cancel_exchange_proposal", actionTarget.dataset.proposalId);
  } else if (action === "counter-proposal") {
    counterProposal(actionTarget.dataset.proposalId);
  } else if (action === "fail-proposal") {
    runProposalRpc("mark_exchange_failed", actionTarget.dataset.proposalId);
  } else if (action === "request-cancellation") {
    requestAgreementCancellation(actionTarget.dataset.proposalId);
  } else if (action === "approve-cancellation") {
    resolveAgreementCancellation(actionTarget.dataset.cancellationId, true);
  } else if (action === "reject-cancellation") {
    resolveAgreementCancellation(actionTarget.dataset.cancellationId, false);
  } else if (action === "report-item") {
    reportTarget("item", actionTarget.dataset.itemId, actionTarget.dataset.userId);
  } else if (action === "report-user") {
    reportTarget("user", null, actionTarget.dataset.userId);
  } else if (action === "approve-item") {
    moderateItem(actionTarget.dataset.itemId, "approved");
  } else if (action === "reject-item") {
    moderateItem(actionTarget.dataset.itemId, "rejected");
  } else if (action === "assign-lead") {
    assignLeadToMe(actionTarget.dataset.leadId);
  } else if (action === "note-lead") {
    editLeadNote(actionTarget.dataset.leadId);
  } else if (action === "copy-lead-summary") {
    copyLeadSummary(actionTarget.dataset.leadId);
  } else if (action === "export-leads") {
    exportLeadsCsv();
  } else if (action === "request-final-agreement") {
    requestFinalAgreement(actionTarget.dataset.proposalId);
  } else if (action === "accept-final-agreement") {
    acceptFinalAgreement(actionTarget.dataset.finalId);
  } else if (action === "finalize-final-agreement") {
    finalizeFinalAgreement(actionTarget.dataset.finalId);
  } else if (action === "mark-notification-read") {
    markNotificationRead(actionTarget.dataset.notificationId);
  } else if (action === "review-report") {
    reviewReport(actionTarget.dataset.reportId);
  }
}

function handleDocumentChange(event) {
  const statusSelect = event.target.closest("[data-lead-status]");
  if (statusSelect) {
    updateLeadStatus(statusSelect.dataset.leadStatus, statusSelect.value);
  }
}

function handleDocumentSubmit(event) {
  if (event.target.id === "agencySettingsForm") {
    saveAgencySettings(event);
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
  const filtered = sortPublicItems(filterPublicItems());
  const visible = filtered.slice(0, state.visibleItemCount);
  elements.itemGrid.innerHTML = "";
  elements.homeEmpty.hidden = filtered.length > 0;
  elements.loadMoreItems.hidden = state.visibleItemCount >= filtered.length;
  elements.resultsCount.textContent = `${visible.length} de ${filtered.length} imóvel${filtered.length === 1 ? "" : "s"}`;

  for (const item of visible) {
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

function sortPublicItems(items) {
  const sorted = [...items];
  const sort = elements.sortFilter.value;

  if (sort === "transfer_asc") {
    return sorted.sort((a, b) => Number(a.transfer_amount ?? 0) - Number(b.transfer_amount ?? 0));
  }

  if (sort === "transfer_desc") {
    return sorted.sort((a, b) => Number(b.transfer_amount ?? 0) - Number(a.transfer_amount ?? 0));
  }

  return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
  elements.profileConsent.checked = Boolean(state.consent);
  const profileComplete = isProfileComplete();
  const accountInactive = state.profile?.account_status === "inactive";
  elements.profileStatus.textContent = accountInactive ? "Inativo" : profileComplete ? "Completo" : "Pendente";
  elements.profileStatus.classList.toggle("complete", profileComplete);
  elements.profileStatus.classList.toggle("inactive", accountInactive);

  renderMyItems();
  renderNotifications();
  renderProposals();
  renderModerationQueue();
  renderLeads();
  renderCancellationQueue();
  renderAdminPanel();
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

function renderNotifications() {
  elements.notificationsList.innerHTML = "";
  elements.notificationsEmpty.hidden = state.notifications.length > 0;

  for (const notification of state.notifications) {
    const card = document.createElement("article");
    card.className = "proposal-card";
    card.innerHTML = `
      <div class="item-title-row">
        <h3>${escapeHtml(notification.title)}</h3>
        <span class="pill status">${notification.read_at ? "Lida" : "Nova"}</span>
      </div>
      <p>${escapeHtml(notification.body)}</p>
      <p class="muted">${formatDateTime(notification.created_at)}</p>
      ${notification.read_at ? "" : `<div class="proposal-actions"><button class="secondary" type="button" data-action="mark-notification-read" data-notification-id="${notification.id}">Marcar como lida</button></div>`}
    `;
    elements.notificationsList.appendChild(card);
  }
}

function renderProposals() {
  const received = state.proposals.filter((proposal) => (proposal.responder_id ?? proposal.owner_id) === state.user.id);
  const sent = state.proposals.filter((proposal) => (proposal.created_by ?? proposal.requester_id) === state.user.id);
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

function renderModerationQueue() {
  const visible = isModerator() && state.schemaFeatures.moderation;
  elements.moderationSection.hidden = !visible;

  if (!visible) {
    return;
  }

  elements.moderationList.innerHTML = "";
  elements.moderationEmpty.hidden = state.moderationItems.length > 0;

  for (const item of state.moderationItems) {
    const owner = state.profilesById.get(item.owner_id);
    const card = document.createElement("article");
    card.className = "moderation-card";
    card.innerHTML = `
      <div>
        <div class="item-title-row">
          <h3>${escapeHtml(item.title)}</h3>
          <span class="pill status pending">${moderationStatusLabels[item.moderation_status] ?? item.moderation_status}</span>
        </div>
        <p class="muted">Anunciante: ${escapeHtml(owner?.full_name ?? "Usuário")}</p>
        <p class="location">${escapeHtml(item.city)} - ${escapeHtml(item.neighborhood)}</p>
        <p>${escapeHtml(truncate(item.description, 180))}</p>
        <p><strong>Repasse pretendido:</strong> ${formatter.format(Number(item.transfer_amount ?? 0))}</p>
      </div>
      <div class="proposal-actions">
        <button type="button" data-action="approve-item" data-item-id="${item.id}">Aprovar</button>
        <button class="secondary" type="button" data-action="reject-item" data-item-id="${item.id}">Solicitar ajuste</button>
      </div>
    `;
    elements.moderationList.appendChild(card);
  }
}

function renderLeads() {
  const visible = isModerator() && state.schemaFeatures.leads;
  elements.leadsSection.hidden = !visible;

  if (!visible) {
    return;
  }

  elements.leadsList.innerHTML = "";
  elements.leadsEmpty.hidden = state.leads.length > 0;

  for (const lead of state.leads) {
    elements.leadsList.appendChild(renderLeadCard(lead));
  }
}

function renderLeadCard(lead) {
  const requested = state.proposalsItemsById.get(lead.requested_item_id);
  const requester = state.profilesById.get(lead.requester_id);
  const owner = state.profilesById.get(lead.owner_id);
  const assigned = state.profilesById.get(lead.assigned_to);
  const card = document.createElement("article");
  card.className = "moderation-card";

  card.innerHTML = `
    <div>
      <div class="item-title-row">
        <h3>${escapeHtml(requested?.title ?? "Imóvel do acordo inicial")}</h3>
        <span class="pill status">${leadStatusLabels[lead.status] ?? lead.status}</span>
      </div>
      <p class="muted">Lead: ${escapeHtml(lead.id)}</p>
      <p><strong>Interessado:</strong> ${escapeHtml(requester?.full_name ?? "Usuário")}</p>
      <p><strong>Anunciante:</strong> ${escapeHtml(owner?.full_name ?? "Usuário")}</p>
      <p><strong>Responsável:</strong> ${escapeHtml(assigned?.full_name ?? "Sem responsável")}</p>
      <p><strong>Atualizado:</strong> ${formatDateTime(lead.updated_at)}</p>
      ${lead.internal_notes ? `<p><strong>Observações internas:</strong> ${escapeHtml(truncate(lead.internal_notes, 220))}</p>` : ""}
      <label class="inline-control">
        Etapa
        <select data-lead-status="${lead.id}">
          ${Object.entries(leadStatusLabels)
            .map(([value, label]) => `<option value="${value}" ${lead.status === value ? "selected" : ""}>${label}</option>`)
            .join("")}
        </select>
      </label>
    </div>
    <div class="proposal-actions">
      <button type="button" data-action="assign-lead" data-lead-id="${lead.id}">Assumir</button>
      <button class="secondary" type="button" data-action="note-lead" data-lead-id="${lead.id}">Observação</button>
      <button class="secondary" type="button" data-action="copy-lead-summary" data-lead-id="${lead.id}">Copiar resumo</button>
      <button class="secondary" type="button" data-action="request-final-agreement" data-proposal-id="${lead.proposal_id}">Acordo final</button>
    </div>
  `;

  return card;
}

function renderCancellationQueue() {
  const visible = isModerator() && state.schemaFeatures.cancellations;
  elements.cancellationsSection.hidden = !visible;

  if (!visible) {
    return;
  }

  const pending = state.cancellations.filter((cancellation) => cancellation.status === "requested");
  elements.cancellationsList.innerHTML = "";
  elements.cancellationsEmpty.hidden = pending.length > 0;

  for (const cancellation of pending) {
    const requester = state.profilesById.get(cancellation.requested_by);
    const card = document.createElement("article");
    card.className = "moderation-card";
    card.innerHTML = `
      <div>
        <div class="item-title-row">
          <h3>Cancelamento de acordo inicial</h3>
          <span class="pill status">${cancellationStatusLabels[cancellation.status] ?? cancellation.status}</span>
        </div>
        <p class="muted">Proposta: ${escapeHtml(cancellation.proposal_id)}</p>
        <p><strong>Solicitante:</strong> ${escapeHtml(requester?.full_name ?? "Participante")}</p>
        <p><strong>Motivo:</strong> ${escapeHtml(cancellation.reason)}</p>
        <p><strong>Solicitado em:</strong> ${formatDateTime(cancellation.created_at)}</p>
      </div>
      <div class="proposal-actions">
        <button type="button" data-action="approve-cancellation" data-cancellation-id="${cancellation.id}">Liberar imóveis</button>
        <button class="secondary" type="button" data-action="reject-cancellation" data-cancellation-id="${cancellation.id}">Retornar para ajustes</button>
      </div>
    `;
    elements.cancellationsList.appendChild(card);
  }
}

function renderAdminPanel() {
  const visible = isModerator();
  elements.adminSection.hidden = !visible;

  if (!visible) {
    return;
  }

  const agency = state.agency ?? {};
  elements.adminSettings.innerHTML = `
    <form class="settings-form" id="agencySettingsForm">
      <h3>Configuração</h3>
      <label>
        Nome público da imobiliária
        <input name="trade_name" required value="${escapeAttr(agency.trade_name ?? "")}" placeholder="Imobiliária parceira">
      </label>
      <label>
        Razão social
        <input name="legal_name" required value="${escapeAttr(agency.legal_name ?? "")}" placeholder="Razão social">
      </label>
      <div class="settings-grid">
        <label>
          Responsável
          <input name="responsible_name" value="${escapeAttr(agency.responsible_name ?? "")}" placeholder="Nome do responsável">
        </label>
        <label>
          CRECI
          <input name="creci" value="${escapeAttr(agency.creci ?? "")}" placeholder="CRECI">
        </label>
      </div>
      <div class="settings-grid">
        <label>
          WhatsApp institucional
          <input name="whatsapp" value="${escapeAttr(agency.whatsapp ?? "")}" placeholder="(00) 00000-0000">
        </label>
        <label>
          Telefone
          <input name="phone" value="${escapeAttr(agency.phone ?? "")}" placeholder="(00) 0000-0000">
        </label>
      </div>
      <label>
        Email público
        <input name="email" type="email" value="${escapeAttr(agency.email ?? "")}" placeholder="contato@imobiliaria.com">
      </label>
      <label>
        Email interno para leads
        <input name="leads_email" type="email" value="${escapeAttr(agency.leads_email ?? "")}" placeholder="leads@imobiliaria.com">
      </label>
      <button type="submit">Salvar configurações</button>
      <p class="muted">Perfil atual: ${escapeHtml(state.profile?.role ?? "user")} · Supabase ${hasSupabaseConfig ? "configurado" : "pendente"} · Moderação ${state.schemaFeatures.moderation ? "ativa" : "compatibilidade"}</p>
    </form>
  `;

  elements.adminReportsList.innerHTML = "";
  elements.adminReportsEmpty.hidden = state.adminReports.length > 0;
  for (const report of state.adminReports) {
    const item = document.createElement("div");
    item.className = "proposal-card";
    item.innerHTML = `
      <div class="item-title-row">
        <h3>${escapeHtml(report.target_type)}</h3>
        <span class="pill status">${escapeHtml(report.status)}</span>
      </div>
      <p>${escapeHtml(report.reason)}</p>
      <p class="muted">${formatDateTime(report.created_at)}</p>
      <div class="proposal-actions">
        <button class="secondary" type="button" data-action="review-report" data-report-id="${report.id}">Marcar revisada</button>
      </div>
    `;
    elements.adminReportsList.appendChild(item);
  }

  elements.adminAuditList.innerHTML = "";
  elements.adminAuditEmpty.hidden = state.auditEvents.length > 0;
  for (const event of state.auditEvents) {
    const item = document.createElement("div");
    item.className = "proposal-card";
    item.innerHTML = `
      <div class="item-title-row">
        <h3>${escapeHtml(event.action)}</h3>
        <span class="pill status">${escapeHtml(event.entity_type)}</span>
      </div>
      <p class="muted">${formatDateTime(event.created_at)}</p>
    `;
    elements.adminAuditList.appendChild(item);
  }
}

function renderItemCard(item, options) {
  const images = state.imagesByItem.get(item.id) ?? [];
  const firstImage = images[0]?.public_url;
  const article = document.createElement("article");
  article.className = "item-card";
  const displayStatus = getItemDisplayStatus(item);

  const ownerActions = item.status === "traded"
    ? '<span class="pill status traded">Em acompanhamento interno</span>'
    : `
      <button class="secondary" type="button" data-action="edit-item" data-item-id="${item.id}">Editar</button>
      <button class="secondary" type="button" data-action="toggle-item" data-item-id="${item.id}">
        ${item.status === "inactive" ? "Reativar" : "Inativar"}
      </button>
      <button class="secondary" type="button" data-action="renew-item" data-item-id="${item.id}">Renovar</button>
    `;
  const actionButtons =
    options.context === "mine"
      ? ownerActions
      : `
        <button type="button" data-action="view-item" data-item-id="${item.id}">Ver detalhes</button>
        <button class="secondary" type="button" data-action="favorite-item" data-item-id="${item.id}">
          ${state.favoriteItemIds.has(item.id) ? "Favorito" : "Favoritar"}
        </button>
        <button class="secondary" type="button" data-action="share-item" data-item-id="${item.id}">Compartilhar</button>
      `;

  article.innerHTML = `
    <div class="item-cover">
      ${firstImage ? `<img src="${escapeAttr(firstImage)}" alt="${escapeAttr(item.title)}">` : "Sem imagem"}
    </div>
    <div class="item-body">
      <div class="item-title-row">
        <h3>${escapeHtml(item.title)}</h3>
        <span class="pill status ${displayStatus}">${statusLabels[displayStatus] ?? displayStatus}</span>
      </div>
      ${options.context === "mine" && state.schemaFeatures.moderation ? `<span class="pill moderation ${item.moderation_status}">${moderationStatusLabels[item.moderation_status] ?? item.moderation_status ?? "Em revisão"}</span>` : ""}
      ${item.moderation_note ? `<p><strong>Moderação:</strong> ${escapeHtml(item.moderation_note)}</p>` : ""}
      <div class="pill-row">
        <span class="pill">${escapeHtml(item.category)}</span>
        <span class="pill">${escapeHtml(item.condition)}</span>
      </div>
        <p class="location">${escapeHtml(item.city)} - ${escapeHtml(item.neighborhood)}</p>
        <p><strong>Repasse pretendido:</strong> ${formatter.format(Number(item.transfer_amount ?? 0))}</p>
        ${item.expires_at ? `<p class="muted">Validade: ${formatDateTime(item.expires_at)}</p>` : ""}
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
  const offered2 = state.proposalsItemsById.get(proposal.offered_item_2_id);
  const responderId = proposal.responder_id ?? proposal.owner_id;
  const createdBy = proposal.created_by ?? proposal.requester_id;
  const counterpartId = mode === "received" ? createdBy : responderId;
  const profile = state.profilesById.get(counterpartId);
  const contact = state.contactsByUserId.get(counterpartId);
  const card = document.createElement("article");
  card.className = "proposal-card";
  const canRespond = proposal.status === "pending" && responderId === state.user.id;
  const canCancel = proposal.status === "pending" && createdBy === state.user.id;
  const leadUpdate = state.leadUpdatesByProposalId.get(proposal.id);
  const cancellation = state.cancellationsByProposalId.get(proposal.id);
  const finalAgreement = state.finalAgreementsByProposalId.get(proposal.id);

  const cashText = proposal.cash_difference > 0
    ? `${formatter.format(Number(proposal.cash_difference))} - ${cashDirectionLabels[proposal.cash_direction]}`
    : "Sem diferença em dinheiro";

  const actions = [];
  if (canRespond) {
    actions.push(`<button type="button" data-action="accept-proposal" data-proposal-id="${proposal.id}">Aceitar</button>`);
    actions.push(`<button class="secondary" type="button" data-action="reject-proposal" data-proposal-id="${proposal.id}">Recusar</button>`);
    if (state.schemaFeatures.advancedProposals) {
      actions.push(`<button class="secondary" type="button" data-action="counter-proposal" data-proposal-id="${proposal.id}">Contrapropor</button>`);
    }
  }
  if (canCancel) {
    actions.push(`<button class="secondary" type="button" data-action="cancel-proposal" data-proposal-id="${proposal.id}">Cancelar</button>`);
  }
  const finalAgreementLocked = ["accepted", "finalized"].includes(finalAgreement?.status);
  if (proposal.status === "accepted" && !finalAgreementLocked) {
    if (cancellation?.status === "requested") {
      actions.push(`<span class="pill status">Cancelamento solicitado</span>`);
    } else if (state.schemaFeatures.cancellations) {
      actions.push(`<button class="secondary" type="button" data-action="request-cancellation" data-proposal-id="${proposal.id}">Solicitar cancelamento</button>`);
    } else {
      actions.push(`<button class="secondary" type="button" data-action="fail-proposal" data-proposal-id="${proposal.id}">Proposta não aconteceu</button>`);
    }
  }
  if (finalAgreement?.status === "requested" && [proposal.requester_id, proposal.owner_id].includes(state.user.id)) {
    const alreadyAccepted =
      (state.user.id === proposal.requester_id && finalAgreement.requester_accepted_at) ||
      (state.user.id === proposal.owner_id && finalAgreement.owner_accepted_at);
    if (!alreadyAccepted) {
      actions.push(`<button type="button" data-action="accept-final-agreement" data-final-id="${finalAgreement.id}">Aceitar acordo final</button>`);
    }
  }
  if (isModerator() && finalAgreement?.status === "accepted") {
    actions.push(`<button type="button" data-action="finalize-final-agreement" data-final-id="${finalAgreement.id}">Formalizar conclusão</button>`);
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
        <strong>Contrapartida</strong>
        <p>${escapeHtml(formatProposalOffer(proposal, offered, offered2))}</p>
      </div>
    </div>
    <p><strong>Diferença:</strong> ${escapeHtml(cashText)}</p>
    ${proposal.version ? `<p class="muted">Versão ${Number(proposal.version)}${proposal.expires_at ? ` - expira em ${formatDateTime(proposal.expires_at)}` : ""}</p>` : ""}
    ${proposal.accepted_at ? `<p class="muted">Acordo inicial aceito em ${formatDateTime(proposal.accepted_at)}.</p>` : ""}
    ${proposal.status === "accepted" || proposal.accepted_snapshot ? renderInitialAgreementBox(proposal, requested, offered, offered2, cashText) : ""}
    ${leadUpdate ? `<div class="contact-box"><strong>Acompanhamento da imobiliária</strong><span>${escapeHtml(leadStatusLabels[leadUpdate.status] ?? leadUpdate.status)} desde ${formatDateTime(leadUpdate.updated_at)}.</span></div>` : ""}
    ${cancellation ? `<p class="muted">Cancelamento: ${escapeHtml(cancellationStatusLabels[cancellation.status] ?? cancellation.status)}.</p>` : ""}
    ${finalAgreement ? renderFinalAgreementBox(finalAgreement) : ""}
    ${proposal.status === "pending" ? `<p class="muted">${canRespond ? "Aguardando sua resposta." : "Aguardando resposta da outra pessoa."}</p>` : ""}
    ${proposal.message ? `<p><strong>Mensagem:</strong> ${escapeHtml(proposal.message)}</p>` : ""}
    ${proposal.status === "accepted" ? renderContactBox(contact) : ""}
    <div class="proposal-actions">${actions.join("")}</div>
  `;

  return card;
}

function formatProposalOffer(proposal, offered, offered2) {
  const titles = [offered?.title, offered2?.title].filter(Boolean);
  if (titles.length) {
    return titles.join(" + ");
  }
  if (proposal.proposal_type === "cash") {
    return "Somente diferença em dinheiro";
  }
  return "Imóvel indisponível";
}

function renderInitialAgreementBox(proposal, requested, offered, offered2, cashText) {
  const snapshot = proposal.accepted_snapshot ?? {};
  const acceptedAt = snapshot.accepted_at ?? proposal.accepted_at;
  const version = snapshot.version ?? proposal.version;
  const proposalType = snapshot.proposal_type ?? proposal.proposal_type ?? "item";

  return `
    <div class="agreement-box">
      <div class="item-title-row">
        <strong>Acordo inicial</strong>
        <span class="pill status accepted">Registrado</span>
      </div>
      <div class="agreement-grid">
        <span><strong>Imóvel desejado</strong>${escapeHtml(requested?.title ?? "Registro preservado")}</span>
        <span><strong>Contrapartida</strong>${escapeHtml(formatProposalOffer(proposal, offered, offered2))}</span>
        <span><strong>Diferença financeira</strong>${escapeHtml(cashText)}</span>
        <span><strong>Tipo de proposta</strong>${escapeHtml(proposalType)}</span>
      </div>
      <p class="muted">Registro imutável v${Number(version ?? 1)}${acceptedAt ? ` aceito em ${formatDateTime(acceptedAt)}` : ""}. A imobiliária conduz a conferência documental antes do acordo final.</p>
    </div>
  `;
}

function renderFinalAgreementBox(agreement) {
  return `
    <div class="contact-box">
      <strong>Acordo final v${Number(agreement.version)}</strong>
      <span>${escapeHtml(finalAgreementStatusLabels[agreement.status] ?? agreement.status)}</span>
      <span>${escapeHtml(truncate(agreement.terms_text, 220))}</span>
      <span>Interessado: ${agreement.requester_accepted_at ? "aceito" : "pendente"} | Anunciante: ${agreement.owner_accepted_at ? "aceito" : "pendente"}</span>
    </div>
  `;
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

  if (action === "resend-confirmation") {
    if (!email) {
      showNotice("Informe seu email para reenviar a confirmação.", "error");
      return;
    }

    if (typeof supabaseClient.auth.resend !== "function") {
      showNotice("Reenvio de confirmação não está disponível nesta versão do Supabase Auth.", "error");
      return;
    }

    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}#dashboard`
      }
    });

    if (error) {
      showNotice(error.message, "error");
      return;
    }

    closeModals();
    showNotice("Se a confirmação de email estiver ativa no Supabase, enviamos um novo link.");
    return;
  }

  if (!email || !password) {
    showNotice("Informe email e senha.", "error");
    return;
  }

  const response = action === "signup"
    ? await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}#dashboard`
      }
    })
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

  document.querySelectorAll("[data-auth-action='login'], [data-auth-action='signup'], [data-auth-action='reset-password'], [data-auth-action='resend-confirmation']")
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

  if (!elements.profileConsent.checked) {
    showNotice("Confirme a ciência sobre intermediação, privacidade e tratamento de dados.", "error");
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

  if (await saveConsentRecord()) {
    return;
  }
  showNotice("Perfil salvo.");
  await refreshAll();
}

async function saveConsentRecord() {
  const { error } = await supabaseClient
    .from("consent_records")
    .upsert({
      user_id: state.user.id,
      consent_type: "terms_privacy",
      version: CONSENT_VERSION,
      text_hash: await sha256Hex(CONSENT_VERSION)
    }, { onConflict: "user_id,consent_type,version" });

  if (isMissingRelationError(error, "consent_records")) {
    return false;
  }

  return handleDbError(error, "salvar consentimento");
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

async function openItemForm(itemId) {
  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  const item = itemId ? state.myItems.find((candidate) => candidate.id === itemId) : null;
  if (item?.status === "traded") {
    showNotice("Imovel em acordo nao pode ser editado fora do fluxo da negociacao.", "error");
    return;
  }

  elements.itemForm.reset();
  state.formOpenedAt.item = Date.now();
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
  await renderTurnstile("item", elements.itemTurnstile);
}

async function saveItem(event) {
  event.preventDefault();

  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  if (!passesAntiSpamCheck("item", elements.itemHoneypot, "item-submit", 1500, 8000)) {
    return;
  }

  if (!(await verifyTurnstileIfConfigured("item"))) {
    return;
  }

  const itemId = elements.itemId.value;
  const currentItem = itemId ? state.myItems.find((candidate) => candidate.id === itemId) : null;
  if (currentItem?.status === "traded") {
    showNotice("Imovel em acordo nao pode ser alterado fora do fluxo da negociacao.", "error");
    return;
  }

  const files = Array.from(elements.itemImages.files ?? []);
  const existingImages = itemId ? (state.imagesByItem.get(itemId) ?? []) : [];
  const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
  const suspiciousImageName = files.find((file) => hasContactLikeContent(file.name));

  if (invalidFile) {
    showNotice("Envie imagens somente em JPG, PNG ou WebP.", "error");
    return;
  }

  if (suspiciousImageName) {
    showNotice("Renomeie imagens que contenham telefone, email ou link no nome do arquivo.", "error");
    return;
  }

  if (!(await scanImagesForContact(files))) {
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

  if (state.schemaFeatures.moderation) {
    payload.moderation_status = "pending";
    payload.moderation_note = null;
    payload.moderation_updated_at = new Date().toISOString();
  }

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

  const publicText = [payload.title, payload.description, payload.neighborhood, payload.trade_preferences].join(" ");
  if (hasContactLikeContent(publicText)) {
    showNotice("Remova telefone, email ou link dos campos públicos do anúncio.", "error");
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
  markAntiSpamSubmission("item-submit");
  resetTurnstile("item");
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
    const prepared = await prepareImageForUpload(file);
    const extension = prepared.extension;
    const path = `${state.user.id}/${itemId}/${crypto.randomUUID()}.${extension}`;
    const uploadResponse = await supabaseClient.storage
      .from(config.storageBucket)
      .upload(path, prepared.blob, { contentType: prepared.blob.type || file.type, upsert: false });

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

async function prepareImageForUpload(file) {
  if (!file.type.startsWith("image/")) {
    return {
      blob: file,
      extension: file.name.split(".").pop() || "jpg"
    };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxSize = 1600;
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    return blob
      ? { blob, extension: "webp" }
      : { blob: file, extension: file.name.split(".").pop() || "jpg" };
  } catch (_error) {
    return {
      blob: file,
      extension: file.name.split(".").pop() || "jpg"
    };
  }
}

async function scanImagesForContact(files) {
  if (!files.length || !config.imageOcrEnabled) {
    return true;
  }

  try {
    await loadImageOcrIfConfigured();
    if (!window.Tesseract?.recognize) {
      showNotice("OCR de imagem não está disponível neste navegador.", "error");
      return false;
    }

    for (const file of files) {
      const result = await window.Tesseract.recognize(file, "por+eng");
      const text = result?.data?.text ?? "";
      if (hasContactLikeContent(text)) {
        showNotice("Remova telefone, email ou link visível nas imagens antes de enviar.", "error");
        return false;
      }
    }

    return true;
  } catch (_error) {
    showNotice("Não foi possível concluir a leitura OCR das imagens. Tente novamente.", "error");
    return false;
  }
}

function loadImageOcrIfConfigured() {
  if (!config.imageOcrEnabled || window.Tesseract) {
    return state.imageOcrPromise;
  }

  if (state.imageOcrPromise) {
    return state.imageOcrPromise;
  }

  state.imageOcrPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = config.tesseractScriptUrl || "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return state.imageOcrPromise;
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

  if (item.status === "traded") {
    showNotice("Imovel em acordo nao pode ser inativado ou reativado manualmente.", "error");
    return;
  }

  const nextStatus = item.status === "inactive" ? "available" : "inactive";
  const updatePayload = { status: nextStatus };
  if (nextStatus === "available" && item.expires_at !== undefined) {
    updatePayload.expires_at = daysFromNowIso(30);
    updatePayload.renewed_at = new Date().toISOString();
  }
  if (state.schemaFeatures.moderation && nextStatus === "available" && item.moderation_status !== "approved") {
    updatePayload.moderation_status = "pending";
    updatePayload.moderation_updated_at = new Date().toISOString();
  }

  const { error } = await supabaseClient.from("items").update(updatePayload).eq("id", itemId);

  if (handleDbError(error, "alterar status do imóvel")) {
    return;
  }

  await recordAuditEvent("item_status_changed", "item", itemId, {
    from_status: item.status,
    to_status: nextStatus
  });
  showNotice(nextStatus === "available" ? "Imóvel reativado." : "Imóvel inativado.");
  await refreshAll();
}

async function renewItem(itemId) {
  const item = state.myItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    return;
  }

  if (item.status === "traded") {
    showNotice("Imovel em acordo nao pode ser renovado manualmente.", "error");
    return;
  }

  const payload = {
    status: "available",
    expires_at: daysFromNowIso(30),
    renewed_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (isMissingColumnError(error, "expires_at")) {
    showNotice("Renovação com validade depende da nova migração Supabase.", "error");
    return;
  }

  if (handleDbError(error, "renovar anúncio")) {
    return;
  }

  await recordAuditEvent("item_renewed", "item", itemId, {
    expires_at: payload.expires_at
  });
  showNotice("Anúncio renovado por mais 30 dias.");
  await refreshAll();
}

async function moderateItem(itemId, moderationStatus) {
  if (!isModerator()) {
    showNotice("Apenas perfis de moderação podem revisar anúncios.", "error");
    return;
  }

  const payload = {
    moderation_status: moderationStatus,
    moderation_note: null,
    moderation_updated_at: new Date().toISOString()
  };

  if (moderationStatus === "rejected") {
    const note = prompt("Informe o ajuste solicitado ao anunciante:");
    if (!note?.trim()) {
      return;
    }
    payload.moderation_note = note.trim();
  }

  const { error } = await supabaseClient
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (handleDbError(error, "moderar anúncio")) {
    return;
  }

  await recordAuditEvent("item_moderated", "item", itemId, {
    moderation_status: moderationStatus
  });
  showNotice(moderationStatus === "approved" ? "Anúncio aprovado." : "Ajuste solicitado ao anunciante.");
  await refreshAll();
}

async function updateLeadStatus(leadId, status) {
  if (!isModerator() || !state.schemaFeatures.leads) {
    return;
  }

  const { error } = await supabaseClient
    .from("negotiation_leads")
    .update({ status })
    .eq("id", leadId);

  if (handleDbError(error, "atualizar etapa do lead")) {
    return;
  }

  await recordAuditEvent("lead_status_changed", "negotiation_lead", leadId, { status });
  showNotice("Etapa do lead atualizada.");
  await refreshAll();
}

async function markNotificationRead(notificationId) {
  if (!state.schemaFeatures.notifications) {
    return;
  }

  const { error } = await supabaseClient
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (handleDbError(error, "marcar notificação como lida")) {
    return;
  }

  await recordAuditEvent("notification_read", "notification", notificationId);
  await refreshAll();
}

async function reviewReport(reportId) {
  if (!isModerator()) {
    return;
  }

  const { error } = await supabaseClient
    .from("reports")
    .update({ status: "reviewed" })
    .eq("id", reportId);

  if (handleDbError(error, "revisar denúncia")) {
    return;
  }

  await recordAuditEvent("report_reviewed", "report", reportId);
  showNotice("Denúncia marcada como revisada.");
  await refreshAll();
}

async function saveAgencySettings(event) {
  event.preventDefault();

  if (!isModerator()) {
    showNotice("Apenas administradores podem alterar configurações.", "error");
    return;
  }

  const formData = new FormData(event.target);
  const fields = ["trade_name", "legal_name", "responsible_name", "creci", "whatsapp", "phone", "email", "leads_email"];
  const payload = Object.fromEntries(
    fields.map((field) => {
      const value = String(formData.get(field) ?? "").trim();
      return [field, value || null];
    })
  );
  payload.status = "active";

  if (!payload.trade_name || !payload.legal_name) {
    showNotice("Informe nome público e razão social da imobiliária.", "error");
    return;
  }

  const changedFields = fields.filter((field) => String(state.agency?.[field] ?? "") !== String(payload[field] ?? ""));
  const query = state.agency?.id
    ? supabaseClient.from("real_estate_agencies").update(payload).eq("id", state.agency.id)
    : supabaseClient.from("real_estate_agencies").insert(payload);

  const { error } = await query;

  if (isMissingRelationError(error, "real_estate_agencies")) {
    showNotice("Configurações da imobiliária dependem da nova migração Supabase.", "error");
    return;
  }

  if (handleDbError(error, "salvar configurações da imobiliária")) {
    return;
  }

  await recordAuditEvent("agency_settings_updated", "real_estate_agency", state.agency?.id ?? null, {
    changed_fields: changedFields
  });
  showNotice("Configurações da imobiliária salvas.");
  await refreshAll();
}

async function assignLeadToMe(leadId) {
  if (!isModerator() || !state.schemaFeatures.leads) {
    return;
  }

  const { error } = await supabaseClient
    .from("negotiation_leads")
    .update({ assigned_to: state.user.id })
    .eq("id", leadId);

  if (handleDbError(error, "atribuir lead")) {
    return;
  }

  await recordAuditEvent("lead_assigned", "negotiation_lead", leadId, {
    assigned_to_self: true
  });
  showNotice("Lead atribuído a você.");
  await refreshAll();
}

async function editLeadNote(leadId) {
  const lead = state.leads.find((candidate) => candidate.id === leadId);
  if (!lead) {
    return;
  }

  const note = prompt("Observação interna do lead:", lead.internal_notes ?? "");
  if (note === null) {
    return;
  }

  const { error } = await supabaseClient
    .from("negotiation_leads")
    .update({ internal_notes: note.trim() || null })
    .eq("id", leadId);

  if (handleDbError(error, "salvar observação do lead")) {
    return;
  }

  await recordAuditEvent("lead_internal_note_updated", "negotiation_lead", leadId, {
    has_internal_note: Boolean(note.trim())
  });
  showNotice("Observação interna salva.");
  await refreshAll();
}

async function copyLeadSummary(leadId) {
  const lead = state.leads.find((candidate) => candidate.id === leadId);
  if (!lead) {
    return;
  }

  const summary = buildLeadSummary(lead);
  try {
    await navigator.clipboard.writeText(summary);
    showNotice("Resumo do lead copiado.");
  } catch (_error) {
    prompt("Resumo do lead:", summary);
  }
}

function exportLeadsCsv() {
  if (!state.leads.length) {
    showNotice("Não há leads para exportar.", "error");
    return;
  }

  const rows = [
    ["id", "status", "imovel", "interessado", "anunciante", "responsavel", "criado_em", "atualizado_em"],
    ...state.leads.map((lead) => {
      const requested = state.proposalsItemsById.get(lead.requested_item_id);
      return [
        lead.id,
        leadStatusLabels[lead.status] ?? lead.status,
        requested?.title ?? "",
        state.profilesById.get(lead.requester_id)?.full_name ?? "",
        state.profilesById.get(lead.owner_id)?.full_name ?? "",
        state.profilesById.get(lead.assigned_to)?.full_name ?? "",
        lead.created_at ?? "",
        lead.updated_at ?? ""
      ];
    })
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-repassecomrepasse-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildLeadSummary(lead) {
  const requested = state.proposalsItemsById.get(lead.requested_item_id);
  const requester = state.profilesById.get(lead.requester_id);
  const owner = state.profilesById.get(lead.owner_id);
  return [
    `Lead: ${lead.id}`,
    `Etapa: ${leadStatusLabels[lead.status] ?? lead.status}`,
    `Imóvel: ${requested?.title ?? "Imóvel do acordo inicial"}`,
    `Interessado: ${requester?.full_name ?? "Usuário"}`,
    `Anunciante: ${owner?.full_name ?? "Usuário"}`,
    `Criado em: ${formatDateTime(lead.created_at)}`,
    `Atualizado em: ${formatDateTime(lead.updated_at)}`
  ].join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function toggleFavorite(itemId) {
  if (state.favoriteItemIds.has(itemId)) {
    state.favoriteItemIds.delete(itemId);
    if (state.user && state.schemaFeatures.favorites) {
      const { error } = await supabaseClient
        .from("favorite_items")
        .delete()
        .eq("user_id", state.user.id)
        .eq("item_id", itemId);
      if (isMissingRelationError(error, "favorite_items")) {
        state.schemaFeatures.favorites = false;
      } else if (handleDbError(error, "remover favorito")) {
        return;
      }
    }
    showNotice("Imóvel removido dos favoritos.");
  } else {
    state.favoriteItemIds.add(itemId);
    if (state.user && state.schemaFeatures.favorites) {
      const { error } = await supabaseClient
        .from("favorite_items")
        .upsert({ user_id: state.user.id, item_id: itemId }, { onConflict: "user_id,item_id" });
      if (isMissingRelationError(error, "favorite_items")) {
        state.schemaFeatures.favorites = false;
      } else if (handleDbError(error, "salvar favorito")) {
        return;
      }
    }
    showNotice(state.user && state.schemaFeatures.favorites ? "Imóvel salvo nos seus favoritos." : "Imóvel salvo nos favoritos deste navegador.");
  }

  localStorage.setItem("repasse:favorites", JSON.stringify([...state.favoriteItemIds]));
  renderHome();
  if (!elements.detailModal.hidden && state.selectedDetailItem?.id === itemId) {
    openItemDetail(itemId);
  }
}

async function shareItem(itemId) {
  const item = state.publicItems.find((candidate) => candidate.id === itemId) ?? state.myItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    return;
  }

  const url = `${window.location.origin}${window.location.pathname}#item-${item.id}`;
  const text = `${item.title} - ${item.city}/${item.neighborhood}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: item.title, text, url });
      return;
    } catch (_error) {
      // User cancelled native share; fall back silently to clipboard.
    }
  }

  await navigator.clipboard.writeText(`${text}\n${url}`);
  showNotice("Link do anúncio copiado.");
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
        ${item.expires_at ? `<p class="muted">Anúncio válido até ${formatDateTime(item.expires_at)}.</p>` : ""}
        <p><strong>Preferências de proposta:</strong> ${escapeHtml(item.trade_preferences)}</p>
        <p class="muted">O contato só é liberado quando a proposta é aceita. Combine local e horário diretamente com a outra pessoa.</p>
        <div class="detail-actions">
          <button type="button" data-action="open-proposal" data-item-id="${item.id}" ${isOwner ? "disabled" : ""}>
            ${isOwner ? "Este imóvel é seu" : "Enviar proposta"}
          </button>
          <button class="secondary" type="button" data-action="favorite-item" data-item-id="${item.id}">
            ${state.favoriteItemIds.has(item.id) ? "Favorito" : "Favoritar"}
          </button>
          <button class="secondary" type="button" data-action="share-item" data-item-id="${item.id}">Compartilhar</button>
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

  const availableMyItems = state.myItems.filter(
    (item) => item.status === "available" && !isItemExpired(item) && (!state.schemaFeatures.moderation || item.moderation_status === "approved")
  );
  elements.proposalForm.reset();
  state.formOpenedAt.proposal = Date.now();
  elements.proposalType.value = state.schemaFeatures.advancedProposals && !availableMyItems.length ? "cash" : "item";
  elements.proposalRequestedItemId.value = itemId;
  elements.proposalIntro.textContent = `Você está enviando uma proposta pelo imóvel "${requested.title}".`;
  elements.offeredItemSelect.innerHTML = "";
  elements.offeredItem2Select.innerHTML = '<option value="">Sem segundo imóvel</option>';

  for (const item of availableMyItems) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.title} - ${item.city}/${item.neighborhood}`;
    elements.offeredItemSelect.appendChild(option.cloneNode(true));
    elements.offeredItem2Select.appendChild(option);
  }

  if (!availableMyItems.length) {
    elements.offeredItemSelect.innerHTML = '<option value="">Nenhum imóvel disponível</option>';
  }

  elements.noOfferItems.hidden = availableMyItems.length > 0;
  elements.proposalForm.querySelector("button[type='submit']").disabled = false;
  syncProposalOfferFields();
  closeModals();
  openModal(elements.proposalModal);
  await renderTurnstile("proposal", elements.proposalTurnstile);
}

function syncProposalOfferFields() {
  const advanced = state.schemaFeatures.advancedProposals;
  const type = elements.proposalType.value;
  const cashOnly = type === "cash";
  const hasCash = Number(elements.cashDifference.value || 0) > 0;

  elements.proposalType.disabled = !advanced;
  elements.advancedProposalHint.hidden = advanced;
  elements.offeredItemSelect.disabled = cashOnly;
  elements.offeredItemSelect.required = !cashOnly;
  elements.offeredItem2Label.hidden = !advanced || cashOnly;
  elements.offeredItem2Select.disabled = !advanced || cashOnly;
  elements.cashDirection.disabled = !hasCash && !cashOnly;
  elements.cashDirection.required = hasCash || cashOnly;

  if (!advanced) {
    elements.proposalType.value = "item";
    elements.offeredItem2Select.value = "";
  }
  if (cashOnly) {
    elements.offeredItemSelect.required = false;
    elements.offeredItemSelect.value = "";
    elements.offeredItem2Select.value = "";
    elements.cashDirection.disabled = false;
  }
}

async function sendProposal(event) {
  event.preventDefault();

  if (!requireLogin()) {
    return;
  }

  if (!requireCompleteProfile()) {
    return;
  }

  if (!passesAntiSpamCheck("proposal", elements.proposalHoneypot, "proposal-submit", 1500, 10000)) {
    return;
  }

  if (!(await verifyTurnstileIfConfigured("proposal"))) {
    return;
  }

  const requested = state.publicItems.find((item) => item.id === elements.proposalRequestedItemId.value);
  let proposalType = state.schemaFeatures.advancedProposals ? elements.proposalType.value : "item";
  const offered = state.myItems.find((item) => item.id === elements.offeredItemSelect.value);
  const offered2 = state.myItems.find((item) => item.id === elements.offeredItem2Select.value);

  if (!requested) {
    showNotice("Selecione um imóvel válido para enviar a proposta.", "error");
    return;
  }

  const cashDifference = Number(elements.cashDifference.value || 0);
  const cashDirection = elements.cashDirection.value;
  if (proposalType === "item" && cashDifference > 0) {
    proposalType = "mixed";
  }
  const needsOfferedItem = proposalType !== "cash";

  if (cashDifference < 0) {
    showNotice("A diferença em dinheiro não pode ser negativa.", "error");
    return;
  }

  if (proposalType === "cash" && cashDifference <= 0) {
    showNotice("Informe o valor da proposta em dinheiro.", "error");
    return;
  }

  if (proposalType === "mixed" && cashDifference <= 0) {
    showNotice("Informe a diferença em dinheiro ou escolha proposta somente com imóvel.", "error");
    return;
  }

  if (needsOfferedItem && !offered) {
    showNotice("Selecione um imóvel seu para oferecer como contrapartida.", "error");
    return;
  }

  if (offered && offered2 && offered.id === offered2.id) {
    showNotice("Escolha imóveis diferentes na contrapartida.", "error");
    return;
  }

  if ((cashDifference > 0 || proposalType === "cash") && cashDirection === "none") {
    showNotice("Informe quem pagaria a diferença em dinheiro.", "error");
    return;
  }

  const payload = {
    requested_item_id: requested.id,
    offered_item_id: offered?.id ?? null,
    requester_id: state.user.id,
    owner_id: requested.owner_id,
    cash_difference: cashDifference,
    cash_direction: cashDifference > 0 ? cashDirection : "none",
    message: elements.proposalMessage.value.trim()
  };

  if (state.schemaFeatures.advancedProposals) {
    payload.offered_item_2_id = offered2?.id ?? null;
    payload.proposal_type = proposalType;
    payload.created_by = state.user.id;
    payload.responder_id = requested.owner_id;
    payload.expires_at = daysFromNowIso(7);
    payload.reserved_until = daysFromNowIso(2);
  }

  let { error } = await supabaseClient.from("exchange_proposals").insert(payload);

  if (state.schemaFeatures.advancedProposals && isAdvancedProposalSchemaError(error)) {
    state.schemaFeatures.advancedProposals = false;
    if (!offered) {
      showNotice("Proposta somente em dinheiro depende da nova migração Supabase.", "error");
      return;
    }
    delete payload.offered_item_2_id;
    delete payload.proposal_type;
    delete payload.created_by;
    delete payload.responder_id;
    delete payload.expires_at;
    delete payload.reserved_until;
    payload.offered_item_id = offered.id;
    const fallback = await supabaseClient.from("exchange_proposals").insert(payload);
    error = fallback.error;
  }

  if (handleDbError(error, "enviar proposta")) {
    return;
  }

  await recordAuditEvent("proposal_created", "exchange_proposal", null, {
    requested_item_id: requested.id,
    offered_item_id: offered?.id ?? null,
    offered_item_2_id: offered2?.id ?? null,
    proposal_type: payload.proposal_type ?? "item",
    cash_direction: payload.cash_direction,
    has_cash_difference: Number(payload.cash_difference ?? 0) > 0
  });
  closeModals();
  markAntiSpamSubmission("proposal-submit");
  resetTurnstile("proposal");
  showNotice("Proposta enviada.");
  await refreshAll();
  setView("dashboard");
}

async function counterProposal(proposalId) {
  if (!state.schemaFeatures.advancedProposals) {
    showNotice("Contraproposta depende da nova migração Supabase.", "error");
    return;
  }

  const proposal = state.proposals.find((candidate) => candidate.id === proposalId);
  if (!proposal || proposal.status !== "pending") {
    return;
  }

  const cashInput = prompt("Informe a nova diferença em dinheiro. Use 0 se não houver diferença.", String(proposal.cash_difference ?? 0));
  if (cashInput === null) {
    return;
  }

  const cashDifference = Number(cashInput.replace(",", ".") || 0);
  if (Number.isNaN(cashDifference) || cashDifference < 0) {
    showNotice("Valor de diferença inválido.", "error");
    return;
  }

  if (proposal.proposal_type === "cash" && cashDifference <= 0) {
    showNotice("Contraproposta somente em dinheiro precisa ter valor maior que zero.", "error");
    return;
  }

  let cashDirection = "none";
  if (cashDifference > 0) {
    cashDirection = prompt("Quem pagaria a diferença? Digite requester_pays para interessado ou owner_pays para anunciante.", proposal.cash_direction || "requester_pays");
    if (!["requester_pays", "owner_pays"].includes(cashDirection)) {
      showNotice("Direção da diferença inválida.", "error");
      return;
    }
  }

  const message = prompt("Mensagem da contraproposta:", proposal.message || "");
  if (message === null) {
    return;
  }

  const { error } = await supabaseClient.rpc("counter_exchange_proposal", {
    p_proposal_id: proposalId,
    p_cash_difference: cashDifference,
    p_cash_direction: cashDifference > 0 ? cashDirection : "none",
    p_message: message.trim()
  });

  if (isMissingFunctionError(error, "counter_exchange_proposal")) {
    state.schemaFeatures.advancedProposals = false;
    showNotice("Contraproposta depende da nova migração Supabase.", "error");
    return;
  }

  if (handleDbError(error, "enviar contraproposta")) {
    return;
  }

  showNotice("Contraproposta enviada.");
  await refreshAll();
}

async function requestAgreementCancellation(proposalId) {
  const finalAgreement = state.finalAgreementsByProposalId.get(proposalId);
  if (["accepted", "finalized"].includes(finalAgreement?.status)) {
    showNotice("Acordo final aceito ou formalizado nao pode voltar para cancelamento simples.", "error");
    return;
  }

  if (!state.schemaFeatures.cancellations) {
    runProposalRpc("mark_exchange_failed", proposalId);
    return;
  }

  const reason = prompt("Explique por que o acordo inicial precisa ser cancelado:");
  if (!reason?.trim()) {
    return;
  }

  const { error } = await supabaseClient.rpc("request_agreement_cancellation", {
    p_proposal_id: proposalId,
    p_reason: reason.trim()
  });

  if (isMissingFunctionError(error, "request_agreement_cancellation")) {
    state.schemaFeatures.cancellations = false;
    showNotice("Cancelamento rastreável depende da nova migração Supabase.", "error");
    return;
  }

  if (handleDbError(error, "solicitar cancelamento")) {
    return;
  }

  showNotice("Pedido de cancelamento enviado para análise.");
  await refreshAll();
}

async function resolveAgreementCancellation(cancellationId, approved) {
  const note = prompt(approved ? "Observação da liberação dos imóveis:" : "Explique o ajuste necessário:", "");
  if (note === null) {
    return;
  }

  const { error } = await supabaseClient.rpc("resolve_agreement_cancellation", {
    p_cancellation_id: cancellationId,
    p_approved: approved,
    p_notes: note.trim()
  });

  if (handleDbError(error, "resolver cancelamento")) {
    return;
  }

  showNotice(approved ? "Cancelamento aprovado e imóveis liberados." : "Pedido retornado para ajustes.");
  await refreshAll();
}

async function requestFinalAgreement(proposalId) {
  if (!state.schemaFeatures.finalAgreements) {
    showNotice("Acordo final depende da nova migração Supabase.", "error");
    return;
  }

  const terms = prompt("Descreva os termos finais para aceite das partes:");
  if (!terms?.trim()) {
    return;
  }

  const { error } = await supabaseClient.rpc("request_final_agreement", {
    p_proposal_id: proposalId,
    p_terms_text: terms.trim()
  });

  if (isMissingFunctionError(error, "request_final_agreement")) {
    state.schemaFeatures.finalAgreements = false;
    showNotice("Acordo final depende da nova migração Supabase.", "error");
    return;
  }

  if (handleDbError(error, "solicitar acordo final")) {
    return;
  }

  showNotice("Acordo final enviado para aceite das partes.");
  await refreshAll();
}

async function acceptFinalAgreement(finalId) {
  if (!confirm("Confirmar aceite dos termos finais?")) {
    return;
  }

  const { error } = await supabaseClient.rpc("accept_final_agreement", { p_terms_id: finalId });

  if (handleDbError(error, "aceitar acordo final")) {
    return;
  }

  showNotice("Aceite do acordo final registrado.");
  await refreshAll();
}

async function finalizeFinalAgreement(finalId) {
  if (!confirm("Formalizar conclusão administrativa deste acordo?")) {
    return;
  }

  const { error } = await supabaseClient.rpc("finalize_final_agreement", { p_terms_id: finalId });

  if (handleDbError(error, "formalizar acordo final")) {
    return;
  }

  showNotice("Acordo final formalizado.");
  await refreshAll();
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

  await recordAuditEvent("report_created", "report", null, {
    target_type: targetType,
    target_item_id: itemId || null,
    target_user_id: userId || null
  });
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

function isModerator() {
  return Boolean(
    state.profile?.account_status === "active" &&
    ["real_estate_admin", "admin"].includes(state.profile?.role)
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

function hasContactLikeContent(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/i;
  const urlPattern = /\b(https?:\/\/|www\.|\.com\b|\.br\b)/i;
  return emailPattern.test(value) || urlPattern.test(value) || digits.length >= 10;
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

function isMissingColumnError(error, columnName) {
  const message = error?.message || "";
  return message.includes(columnName) && (message.includes("column") || message.includes("schema cache"));
}

function isMissingFunctionError(error, functionName) {
  const message = error?.message || "";
  return message.includes(functionName) && (message.includes("function") || message.includes("schema cache"));
}

function isMissingRelationError(error, relationName) {
  const message = error?.message || "";
  return message.includes(relationName) && (message.includes("relation") || message.includes("schema cache"));
}

async function recordAuditEvent(action, entityType, entityId = null, metadata = {}) {
  if (!state.user || !state.schemaFeatures.audit) {
    return;
  }

  const { error } = await supabaseClient.from("audit_events").insert({
    actor_id: state.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: sanitizeAuditMetadata(metadata)
  });

  if (isMissingRelationError(error, "audit_events")) {
    state.schemaFeatures.audit = false;
    return;
  }

  if (error) {
    console.warn("Falha ao registrar auditoria:", error.message || error);
  }
}

function sanitizeAuditMetadata(metadata) {
  const blocked = ["cpf", "cnpj", "document", "phone", "whatsapp", "address", "reason", "note", "terms", "message"];
  return Object.fromEntries(
    Object.entries(metadata ?? {}).filter(([key, value]) => {
      const normalizedKey = normalize(key).toLowerCase();
      return value !== undefined && !blocked.some((blockedKey) => normalizedKey.includes(blockedKey));
    })
  );
}

function isAdvancedProposalSchemaError(error) {
  return [
    "offered_item_2_id",
    "proposal_type",
    "created_by",
    "responder_id",
    "expires_at",
    "reserved_until"
  ].some((columnName) => isMissingColumnError(error, columnName));
}

function passesAntiSpamCheck(formKey, honeypotInput, cooldownKey, minOpenMs, cooldownMs) {
  if (honeypotInput?.value.trim()) {
    showNotice("Não foi possível processar o envio. Revise os campos e tente novamente.", "error");
    return false;
  }

  if (Date.now() - (state.formOpenedAt[formKey] || 0) < minOpenMs) {
    showNotice("Aguarde um instante antes de enviar.", "error");
    return false;
  }

  const lastSubmission = Number(localStorage.getItem(`repasse:${cooldownKey}`) || 0);
  if (lastSubmission && Date.now() - lastSubmission < cooldownMs) {
    showNotice("Aguarde alguns segundos antes de enviar novamente.", "error");
    return false;
  }

  return true;
}

function markAntiSpamSubmission(cooldownKey) {
  localStorage.setItem(`repasse:${cooldownKey}`, String(Date.now()));
}

function loadTurnstileIfConfigured() {
  if (!config.turnstileSiteKey || state.turnstile.scriptPromise || window.turnstile) {
    return state.turnstile.scriptPromise;
  }

  state.turnstile.scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return state.turnstile.scriptPromise;
}

async function renderTurnstile(formKey, container) {
  if (!config.turnstileSiteKey || !container) {
    return;
  }

  container.hidden = false;
  state.turnstile.tokens[formKey] = "";

  try {
    await loadTurnstileIfConfigured();
    if (!window.turnstile) {
      return;
    }

    if (state.turnstile.widgets[formKey]) {
      window.turnstile.reset(state.turnstile.widgets[formKey]);
      return;
    }

    state.turnstile.widgets[formKey] = window.turnstile.render(container, {
      sitekey: config.turnstileSiteKey,
      callback: (token) => {
        state.turnstile.tokens[formKey] = token;
      },
      "expired-callback": () => {
        state.turnstile.tokens[formKey] = "";
      },
      "error-callback": () => {
        state.turnstile.tokens[formKey] = "";
      }
    });
  } catch (_error) {
    showNotice("Não foi possível carregar a verificação humana. Tente novamente em instantes.", "error");
  }
}

async function verifyTurnstileIfConfigured(formKey) {
  if (!config.turnstileSiteKey) {
    return true;
  }

  const token = state.turnstile.tokens[formKey];
  if (!token) {
    showNotice("Conclua a verificação humana antes de enviar.", "error");
    return false;
  }

  try {
    const response = await fetch("/api/verify-turnstile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      resetTurnstile(formKey);
      showNotice("Verificação humana não confirmada. Tente novamente.", "error");
      return false;
    }

    return true;
  } catch (_error) {
    showNotice("Falha ao verificar CAPTCHA. Tente novamente.", "error");
    return false;
  }
}

function resetTurnstile(formKey) {
  state.turnstile.tokens[formKey] = "";
  if (window.turnstile && state.turnstile.widgets[formKey]) {
    window.turnstile.reset(state.turnstile.widgets[formKey]);
  }
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

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return dateFormatter.format(date);
}

function isItemExpired(item) {
  if (!item?.expires_at || item.status !== "available") {
    return false;
  }

  return new Date(item.expires_at).getTime() <= Date.now();
}

function getItemDisplayStatus(item) {
  return isItemExpired(item) ? "expired" : item.status;
}

function daysFromNowIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
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
