const config = window.OPPORTUNITIES_CONFIG ?? {};
const ANDROID_AUTO_ENABLED = Boolean(config.androidAutoEnabled);
const EMAIL_CHANNEL_ENABLED = Boolean(config.emailChannelEnabled);
const STORAGE_KEY = "opportunities-next-mvp:v1";
const GOOGLE_BUSINESS_SCOPE = "https://www.googleapis.com/auth/business.manage";
const GOOGLE_BASIC_SCOPES = ["openid", "email", "profile"];
const LEGACY_DEFAULT_EMAIL = "hillner.ferreira@ifpb.edu.br";
const LEGACY_DEFAULT_NAME = "Hillner Ferreira";

const categories = [
  { id: "supermarkets", label: "Supermercados", description: "Compras do dia a dia, alimentos, bebidas e limpeza.", icon: "🛒" },
  { id: "offers", label: "Ofertas e Descontos", description: "Promoções, descontos e condições especiais.", icon: "🏷" },
  { id: "promotion", label: "Produtos em Promoção", description: "Destaques e promoções de produtos específicos.", icon: "%" },
  { id: "bakeries", label: "Padarias", description: "Pães, bolos, doces e produtos de padaria.", icon: "🥐" },
  { id: "fuel", label: "Postos de Combustível", description: "Combustível, loja de conveniência e serviços rápidos.", icon: "⛽" },
  { id: "parking", label: "Estacionamentos", description: "Vagas, diárias e condições especiais de estacionamento.", icon: "🚗" }
];

const establishmentCategories = [
  { id: "bakery", label: "Padaria" },
  { id: "convenience", label: "Conveniência" },
  { id: "supermarkets", label: "Supermercado" },
  { id: "pharmacy", label: "Farmácia" },
  { id: "petshop", label: "PetShop" },
  { id: "restaurant", label: "Restaurante" },
  { id: "snack_bar", label: "Lanchonete" },
  { id: "fuel", label: "Posto de combustível" },
  { id: "parking", label: "Estacionamento" },
  { id: "clothing", label: "Roupas e acessórios" },
  { id: "electronics", label: "Eletrônicos" },
  { id: "beauty", label: "Beleza e estética" },
  { id: "gym", label: "Academia" },
  { id: "services", label: "Serviços" },
  { id: "other", label: "Outros" }
];

const benefits = [
  { id: "discount", label: "Oferta / Desconto", description: "Descontos em produtos ou serviços.", icon: "🏷" },
  { id: "combo", label: "Combo", description: "Combos e pacotes promocionais.", icon: "%" },
  { id: "promotion", label: "Promoção", description: "Promoções especiais por tempo limitado.", icon: "🎁" },
  { id: "launch", label: "Lançamento", description: "Novos produtos ou serviços.", icon: "🛒" },
  { id: "fast_service", label: "Atendimento rápido", description: "Serviço rápido e conveniente.", icon: "⚡" },
  { id: "other", label: "Outro", description: "Outros tipos de oportunidade.", icon: "…" }
];

const seedPlaces = [
  {
    id: "place-market",
    name: "Mercado BomPreço",
    address: "Av. Exemplo, 123 - João Pessoa, PB",
    neighborhood: "Manaíra",
    categoryId: "supermarkets",
    phone: "(83) 99999-0000",
    websiteUrl: "https://www.mercadobompreco.com.br",
    latitude: -7.096,
    longitude: -34.833,
    isVerified: true,
    isEligibleForPublishing: true,
    bindingStatus: "manual_verified",
    lastSyncedAt: "2026-06-28T11:30:00.000Z"
  },
  {
    id: "place-bakery",
    name: "Padaria Pão & Sabor",
    address: "Rua das Flores, 45 - João Pessoa, PB",
    neighborhood: "Torre",
    categoryId: "bakeries",
    phone: "(83) 98888-1111",
    websiteUrl: "https://www.padariapaosabor.com.br",
    latitude: -7.117,
    longitude: -34.857,
    isVerified: true,
    isEligibleForPublishing: true,
    bindingStatus: "manual_verified",
    lastSyncedAt: "2026-06-27T14:10:00.000Z"
  },
  {
    id: "place-fuel",
    name: "Posto São José",
    address: "Av. Principal, 678 - João Pessoa, PB",
    neighborhood: "Geisel",
    categoryId: "fuel",
    phone: "(83) 98765-4321",
    websiteUrl: "https://www.postosaojose.com.br",
    latitude: -7.165,
    longitude: -34.872,
    isVerified: true,
    isEligibleForPublishing: true,
    bindingStatus: "manual_verified",
    lastSyncedAt: "2026-06-26T12:40:00.000Z"
  },
  {
    id: "place-parking",
    name: "Estacionamento Central",
    address: "Rua do Sol, 10 - João Pessoa, PB",
    neighborhood: "Centro",
    categoryId: "parking",
    phone: "(83) 99364-4310",
    websiteUrl: "",
    latitude: -7.119,
    longitude: -34.884,
    isVerified: false,
    isEligibleForPublishing: false,
    bindingStatus: "category_not_allowed",
    lastSyncedAt: "2026-06-24T16:20:00.000Z"
  }
];

const initialState = {
  isLoggedIn: false,
  route: "dashboard",
  selectedPlaceId: "place-market",
  googleBusinessProfile: {
    status: "not_connected",
    connectedEmail: "",
    detectedAt: null,
    selectedLocationId: ""
  },
  userProfile: {
    displayName: "",
    email: "",
    photoUrl: ""
  },
  editingPlaceId: "",
  historyEntries: [
    {
      id: "history-seed-1",
      type: "system",
      title: "Projeto iniciado",
      description: "Ambiente web-first preparado para validar o Portal do Lojista.",
      createdAt: "2026-06-29T09:00:00.000Z"
    }
  ],
  places: seedPlaces,
  alerts: [
    {
      id: "alert-1001",
      placeId: "place-market",
      titleInternal: "Alimentos e limpeza em oferta",
      benefitType: "discount",
      primaryCategoryId: "supermarkets",
      categoryIds: ["supermarkets", "offers", "promotion"],
      validFrom: "2026-06-25",
      validUntil: "2026-07-07",
      allDay: true,
      activeStartTime: "06:00",
      activeEndTime: "22:00",
      mobileListEnabled: true,
      mobileAlertEnabled: true,
      webEnabled: true,
      androidAutoPoiRequested: false,
      androidAutoPoiEligible: false,
      androidAutoPoiPublished: false,
      emailEnabled: false,
      externalLinkEnabled: true,
      externalLinkUrl: "https://www.mercadobompreco.com.br/promocoes/super-final-de-semana",
      externalLinkStatus: "approved",
      buttonText: "Ver oferta completa",
      generatedMobileTitle: "Super final de semana!",
      generatedMobileSummary: "Descontos imperdíveis em diversos produtos do supermercado.",
      carSafeTitle: "Mercado BomPreço - supermercado em oferta",
      carSafeSummary: "Oferta disponível no local.",
      moderationStatus: "approved",
      mainStatus: "active",
      metrics: { views: 2560, routes: 248, clicks: 180, saves: 96, reports: 0 },
      createdAt: "2026-06-20T10:00:00.000Z"
    },
    {
      id: "alert-1002",
      placeId: "place-bakery",
      titleInternal: "Combo família especial",
      benefitType: "combo",
      primaryCategoryId: "bakeries",
      categoryIds: ["bakeries", "offers"],
      validFrom: "2026-06-28",
      validUntil: "2026-07-06",
      allDay: false,
      activeStartTime: "07:00",
      activeEndTime: "18:00",
      mobileListEnabled: true,
      mobileAlertEnabled: false,
      webEnabled: true,
      androidAutoPoiRequested: false,
      androidAutoPoiEligible: false,
      androidAutoPoiPublished: false,
      emailEnabled: false,
      externalLinkEnabled: false,
      externalLinkUrl: "",
      externalLinkStatus: "not_applicable",
      buttonText: "",
      generatedMobileTitle: "Combo família especial",
      generatedMobileSummary: "Combo de padaria com condição especial por tempo limitado.",
      carSafeTitle: "Padaria Pão & Sabor - combo disponível",
      carSafeSummary: "Oportunidade no local.",
      moderationStatus: "pending",
      mainStatus: "in_review",
      metrics: { views: 1248, routes: 96, clicks: 72, saves: 31, reports: 0 },
      createdAt: "2026-06-24T09:00:00.000Z"
    },
    {
      id: "alert-1003",
      placeId: "place-fuel",
      titleInternal: "Combustível com desconto",
      benefitType: "discount",
      primaryCategoryId: "fuel",
      categoryIds: ["fuel", "offers"],
      validFrom: "2026-06-12",
      validUntil: "2026-06-23",
      allDay: true,
      activeStartTime: "00:00",
      activeEndTime: "23:59",
      mobileListEnabled: true,
      mobileAlertEnabled: true,
      webEnabled: true,
      androidAutoPoiRequested: false,
      androidAutoPoiEligible: false,
      androidAutoPoiPublished: false,
      emailEnabled: false,
      externalLinkEnabled: false,
      externalLinkUrl: "",
      externalLinkStatus: "not_applicable",
      buttonText: "",
      generatedMobileTitle: "Combustível com desconto",
      generatedMobileSummary: "Condição especial para abastecimento no local.",
      carSafeTitle: "Posto São José - combustível em oferta",
      carSafeSummary: "Oportunidade no local.",
      moderationStatus: "approved",
      mainStatus: "expired",
      metrics: { views: 842, routes: 64, clicks: 35, saves: 16, reports: 0 },
      createdAt: "2026-06-10T08:00:00.000Z"
    }
  ],
  wizardStep: 1,
  lastCreatedAlertId: null,
  wizard: null
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const views = {
  dashboard: $("#dashboardView"),
  alerts: $("#alertsView"),
  wizard: $("#wizardView"),
  created: $("#createdView"),
  places: $("#placesView"),
  history: $("#historyView"),
  settings: $("#settingsView")
};

function businessProfileStatus() {
  return state.googleBusinessProfile?.status ?? "not_connected";
}

function googleRedirectUri() {
  if (location.origin.includes("127.0.0.1") || location.origin.includes("localhost")) {
    return `${location.origin}/auth/callback`;
  }
  return config.googleOAuthRedirectUri || `${location.origin}/auth/callback`;
}

function randomOAuthState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function startGoogleOAuth() {
  if (!config.googleOAuthClientId) return false;
  const oauthState = randomOAuthState();
  sessionStorage.setItem("googleOAuthState", oauthState);
  const params = new URLSearchParams({
    client_id: config.googleOAuthClientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: [...GOOGLE_BASIC_SCOPES, GOOGLE_BUSINESS_SCOPE].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: oauthState
  });
  location.href = `${config.googleOAuthAuthUri || "https://accounts.google.com/o/oauth2/v2/auth"}?${params.toString()}`;
  return true;
}

function handleGoogleOAuthCallback() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const error = params.get("error");
  if (!code && !error) return;

  const expectedState = sessionStorage.getItem("googleOAuthState");
  const receivedState = params.get("state");
  history.replaceState({}, document.title, `${location.origin}/`);

  if (error) {
    showToast(`OAuth Google cancelado ou recusado: ${error}`, "error");
    return;
  }
  if (!expectedState || expectedState !== receivedState) {
    showToast("Retorno OAuth invalido. Tente entrar novamente.", "error");
    return;
  }

  sessionStorage.removeItem("googleOAuthState");
  state.isLoggedIn = true;
  state.route = "dashboard";
  state.googleBusinessProfile = {
    ...state.googleBusinessProfile,
    status: "oauth_code_received",
    connectedEmail: knownUserEmail(),
    detectedAt: new Date().toISOString(),
    selectedLocationId: state.googleBusinessProfile?.selectedLocationId || ""
  };
  saveState();
  showToast("Autorizacao Google recebida. A troca por tokens sera feita em backend seguro.", "success");
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeLoadedState({ ...structuredClone(initialState), ...JSON.parse(raw) }) : structuredClone(initialState);
  } catch (_error) {
    return structuredClone(initialState);
  }
}

function normalizeLoadedState(loadedState) {
  const validRoutes = new Set(["dashboard", "alerts", "wizard", "created", "places", "history", "settings"]);
  if (!validRoutes.has(loadedState.route)) loadedState.route = "dashboard";
  loadedState.userProfile = { ...initialState.userProfile, ...(loadedState.userProfile ?? {}) };
  if (loadedState.userProfile.email === LEGACY_DEFAULT_EMAIL) loadedState.userProfile.email = "";
  if (loadedState.userProfile.displayName === LEGACY_DEFAULT_NAME && !loadedState.userProfile.email) loadedState.userProfile.displayName = "";
  if (loadedState.googleBusinessProfile?.connectedEmail === LEGACY_DEFAULT_EMAIL) {
    loadedState.googleBusinessProfile.connectedEmail = "";
  }
  loadedState.historyEntries = loadedState.historyEntries ?? [];
  loadedState.places = loadedState.places ?? structuredClone(seedPlaces);
  loadedState.editingPlaceId = "";
  return loadedState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetWizard() {
  const place = currentPlace();
  const placeCategoryId = place?.businessCategoryId || place?.categoryId || "";
  state.wizardStep = 1;
  state.wizard = {
    placeId: place?.id ?? "",
    primaryCategoryId: placeCategoryId || "supermarkets",
    categoryIds: unique([placeCategoryId || "supermarkets", "offers"]),
    benefitType: "discount",
    validFrom: todayIso(),
    validUntil: addDaysIso(7),
    allDay: true,
    activeStartTime: "06:00",
    activeEndTime: "22:00",
    autoExpire: true,
    notifyBeforeExpire: true,
    recurring: false,
    mobileListEnabled: true,
    mobileAlertEnabled: true,
    webEnabled: true,
    androidAutoPoiRequested: false,
    emailEnabled: false,
    externalLinkEnabled: false,
    externalLinkUrl: "",
    buttonText: "Ver oferta completa",
    generatedMobileTitle: "",
    generatedMobileSummary: ""
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function category(id) {
  return categories.find((item) => item.id === id) ?? categories[0];
}

function establishmentCategory(id) {
  return establishmentCategories.find((item) => item.id === id) ?? establishmentCategories.at(-1);
}

function benefit(id) {
  return benefits.find((item) => item.id === id) ?? benefits[0];
}

function placeById(id) {
  return state.places.find((item) => item.id === id);
}

function currentPlace() {
  return placeById(state.selectedPlaceId) ?? state.places[0];
}

function currentUserName() {
  return state.userProfile?.displayName || "lojista";
}

function currentUserEmail() {
  return knownUserEmail() || "Conta Google autenticada";
}

function knownUserEmail() {
  const email = state.googleBusinessProfile?.connectedEmail || state.userProfile?.email || "";
  return email === LEGACY_DEFAULT_EMAIL ? "" : email;
}

function currentUserAvatarUrl() {
  const fallback = "https://www.gravatar.com/avatar/?d=mp&s=96";
  return state.userProfile?.photoUrl || fallback;
}

function hasDefinedEstablishmentCategory(place) {
  return Boolean(place?.businessCategoryId || place?.categoryId);
}

function placeCategoryLabel(place) {
  if (!hasDefinedEstablishmentCategory(place)) return "Categoria não definida";
  return establishmentCategory(place.businessCategoryId || place.categoryId).label;
}

function addHistory(type, title, description) {
  state.historyEntries = [
    {
      id: `history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title,
      description,
      createdAt: new Date().toISOString()
    },
    ...(state.historyEntries ?? [])
  ].slice(0, 80);
}

function isAlertCurrentlyValid(alert) {
  const today = todayIso();
  return alert.validFrom <= today && alert.validUntil >= today;
}

function effectiveStatus(alert) {
  if (alert.mainStatus !== "active") return alert.mainStatus;
  return isAlertCurrentlyValid(alert) ? "active" : "expired";
}

function statusLabel(status) {
  const labels = {
    draft: "Rascunho",
    in_review: "Em análise",
    approved: "Aprovado",
    active: "Ativo",
    paused: "Pausado",
    expired: "Expirado",
    rejected: "Recusado",
    archived: "Arquivado"
  };
  return labels[status] ?? status;
}

function channelSummary(alert) {
  const channels = [];
  if (alert.mobileListEnabled || alert.mobileAlertEnabled) channels.push("App Mobile");
  if (alert.webEnabled) channels.push("Site Web");
  if (ANDROID_AUTO_ENABLED && alert.androidAutoPoiPublished) channels.push("Android Auto");
  return channels;
}

function generateAlertText(draft) {
  const place = placeById(draft.placeId);
  const primary = category(draft.primaryCategoryId);
  const selectedBenefit = benefit(draft.benefitType);
  const title = draft.generatedMobileTitle?.trim() || `${selectedBenefit.label} em ${primary.label}`;
  const summary = draft.generatedMobileSummary?.trim() || `${place?.name ?? "Este estabelecimento"} tem ${primary.label.toLowerCase()} com ${selectedBenefit.label.toLowerCase()} até ${formatDate(draft.validUntil)}.`;
  return { title, summary };
}

function validateLink(url) {
  if (!url) return { ok: true, status: "not_applicable", message: "" };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return { ok: false, status: "rejected", message: "Use um link HTTPS." };
    const blocked = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly"];
    if (blocked.some((domain) => parsed.hostname.includes(domain))) {
      return { ok: false, status: "rejected", message: "Encurtadores de URL não são permitidos." };
    }
    return { ok: true, status: "approved", message: "Link aprovado para uso no detalhe da oportunidade." };
  } catch (_error) {
    return { ok: false, status: "rejected", message: "Informe uma URL completa e válida." };
  }
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function showToast(message, type = "info") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 4200);
}

function routeTo(route) {
  if (route === "wizard") {
    const place = currentPlace();
    if (!hasDefinedEstablishmentCategory(place)) {
      showToast("Defina a categoria do estabelecimento antes de criar alertas.", "error");
      state.route = "places";
      saveState();
      render();
      return;
    }
    resetWizard();
  }
  state.route = route;
  saveState();
  render();
}

function render() {
  $("#landingView").hidden = state.isLoggedIn;
  $("#appView").hidden = !state.isLoggedIn;
  if (!state.isLoggedIn) return;

  $$(".sidebar nav button").forEach((button) => button.classList.toggle("active", button.dataset.route === state.route || (state.route === "created" && button.dataset.route === "wizard")));
  Object.entries(views).forEach(([name, view]) => {
    view.hidden = name !== state.route;
  });

  const labels = {
    dashboard: "Dashboard",
    alerts: "Alertas de Oportunidade > Meus Alertas",
    wizard: "Alertas de Oportunidade > Novo Alerta",
    created: "Alertas de Oportunidade > Novo Alerta > Alerta Criado",
    places: "Estabelecimentos",
    history: "Histórico",
    settings: "Conexão Google Business Profile"
  };
  $("#breadcrumb").textContent = labels[state.route] ?? "Dashboard";
  const emailBadge = $("#loggedEmailBadge");
  if (emailBadge) emailBadge.textContent = currentUserEmail();
  const userAvatar = $("#userAvatar");
  if (userAvatar) {
    userAvatar.src = currentUserAvatarUrl();
    userAvatar.title = currentUserEmail();
    userAvatar.setAttribute("aria-label", `Usuário logado: ${currentUserEmail()}`);
  }

  renderDashboard();
  renderAlerts();
  renderWizard();
  renderCreated();
  renderPlaces();
  renderHistory();
  renderSettings();
}

function renderDashboard() {
  const counts = {
    active: state.alerts.filter((alert) => effectiveStatus(alert) === "active").length,
    in_review: state.alerts.filter((alert) => alert.mainStatus === "in_review").length,
    paused: state.alerts.filter((alert) => alert.mainStatus === "paused").length,
    expired: state.alerts.filter((alert) => effectiveStatus(alert) === "expired").length
  };
  const totals = state.alerts.reduce((acc, alert) => {
    acc.views += alert.metrics.views;
    acc.routes += alert.metrics.routes;
    acc.clicks += alert.metrics.clicks;
    return acc;
  }, { views: 0, routes: 0, clicks: 0 });
  const categorizedPlaces = state.places.filter(hasDefinedEstablishmentCategory).length;

  views.dashboard.innerHTML = `
    <div class="page-title">
      <div>
        <p class="eyebrow">Portal do lojista</p>
        <h2>Olá, ${currentUserName()}! 👋</h2>
        <p>Resumo agregado dos seus Alertas de Oportunidade.</p>
      </div>
      <button class="primary" data-route="wizard">Criar Alerta de Oportunidade</button>
    </div>
    <section class="card" style="margin-bottom:18px">
      <div class="form-grid">
        <label>
          Estabelecimento em foco
          <select id="dashboardPlaceSelect" data-action="select-dashboard-place">
            ${state.places.map((place) => `<option value="${place.id}" ${place.id === state.selectedPlaceId ? "selected" : ""}>${place.name}</option>`).join("")}
          </select>
        </label>
        <div>
          <strong>${currentPlace()?.name ?? "-"}</strong>
          <p>${currentPlace()?.address ?? ""}</p>
          <span class="status ${currentPlace()?.isEligibleForPublishing ? "approved" : "rejected"}">${currentPlace()?.isEligibleForPublishing ? "Elegível para publicação" : "Não elegível"}</span>
        </div>
      </div>
    </section>
    <div class="grid cols-4">
      ${metric("Alertas ativos", counts.active, "active")}
      ${metric("Em análise", counts.in_review, "in_review")}
      ${metric("Pausados", counts.paused, "paused")}
      ${metric("Expirados", counts.expired, "expired")}
    </div>
    <div class="grid cols-2" style="margin-top:18px">
      <section class="card">
        <h3>Desempenho agregado</h3>
        <div class="grid cols-3">
          ${miniMetric("Visualizações", totals.views)}
          ${miniMetric("Rotas iniciadas", totals.routes)}
          ${miniMetric("Cliques em link", totals.clicks)}
        </div>
      </section>
      <section class="card">
        <h3>Resumo operacional</h3>
        <p><strong>${categorizedPlaces}</strong> de <strong>${state.places.length}</strong> estabelecimentos com categoria definida.</p>
        <p><strong>${counts.in_review}</strong> alertas aguardando análise administrativa.</p>
        <p><strong>${state.historyEntries?.length ?? 0}</strong> registros no histórico operacional.</p>
      </section>
    </div>
    <section class="card table-card" style="margin-top:18px">
      <table>
        <thead><tr><th>Alerta</th><th>Estabelecimento</th><th>Status</th><th>Canais</th><th>Validade</th><th>Ações</th></tr></thead>
        <tbody>${state.alerts.slice(0, 5).map(alertRow).join("")}</tbody>
      </table>
    </section>
  `;
}

function metric(label, value, status) {
  return `<section class="card metric-card"><span class="status ${status}">${label}</span><strong>${value}</strong><a href="#" data-route="alerts">Ver detalhes ›</a></section>`;
}

function miniMetric(label, value) {
  return `<div><span>${label}</span><strong style="display:block;font-size:1.45rem">${value.toLocaleString("pt-BR")}</strong></div>`;
}

function alertRow(alert) {
  const place = placeById(alert.placeId);
  const status = effectiveStatus(alert);
  return `
    <tr>
      <td><strong>${alert.titleInternal}</strong><br><small>ID: ${alert.id}</small></td>
      <td>${place?.name ?? "-"}<br><small>${place?.address ?? ""}</small></td>
      <td><span class="status ${status}">${statusLabel(status)}</span></td>
      <td>${channelSummary(alert).join(", ") || "Nenhum"}${!ANDROID_AUTO_ENABLED ? "<br><small>Android Auto desabilitado</small>" : ""}</td>
      <td>${formatDate(alert.validFrom)}<br>até ${formatDate(alert.validUntil)}</td>
      <td>
        <button class="secondary" data-action="view-alert" data-id="${alert.id}">Detalhes</button>
      </td>
    </tr>
  `;
}

function renderAlerts() {
  views.alerts.innerHTML = `
    <div class="page-title">
      <div>
        <h2>Meus Alertas de Oportunidade</h2>
        <p>Gerencie, edite e acompanhe o desempenho dos seus alertas.</p>
      </div>
      <button class="primary" data-route="wizard">Novo Alerta</button>
    </div>
    <section class="card table-card">
      <table>
        <thead><tr><th>Alerta</th><th>Estabelecimento</th><th>Status</th><th>Canais</th><th>Desempenho</th><th>Ações</th></tr></thead>
        <tbody>${state.alerts.map(alertListRow).join("")}</tbody>
      </table>
    </section>
  `;
}

function alertListRow(alert) {
  return `
    <tr>
      <td><strong>${alert.titleInternal}</strong><br><small>${category(alert.primaryCategoryId).label}</small></td>
      <td>${placeById(alert.placeId)?.name ?? "-"}</td>
      <td><span class="status ${effectiveStatus(alert)}">${statusLabel(effectiveStatus(alert))}</span></td>
      <td>${channelSummary(alert).join(", ") || "Nenhum"}<br><small>${ANDROID_AUTO_ENABLED ? "" : "Android Auto desabilitado"}</small></td>
      <td>${alert.metrics.views} visualizações<br>${alert.metrics.routes} rotas<br>${alert.metrics.clicks} cliques</td>
      <td>${alertActions(alert)}</td>
    </tr>
  `;
}

function alertActions(alert) {
  const actions = [`<button class="secondary" data-action="view-alert" data-id="${alert.id}">Ver</button>`];
  if (alert.mainStatus === "approved") actions.push(`<button class="primary" data-action="activate-alert" data-id="${alert.id}">Ativar</button>`);
  if (alert.mainStatus === "active") actions.push(`<button class="secondary" data-action="pause-alert" data-id="${alert.id}">Pausar</button>`);
  if (alert.mainStatus === "paused") actions.push(`<button class="secondary" data-action="activate-alert" data-id="${alert.id}">Retomar</button>`);
  return `<div class="quick-actions">${actions.join("")}</div>`;
}

function renderWizard() {
  if (!state.wizard) resetWizard();
  views.wizard.innerHTML = `
    <div class="page-title"><div><h2>Novo Alerta de Oportunidade</h2><p>Siga os passos para criar e enviar seu Alerta para análise.</p></div></div>
    <div class="wizard-shell">
      <div>
        ${renderSteps()}
        <section class="card wizard-panel">${renderWizardStep()}</section>
      </div>
      ${renderWizardSummary()}
    </div>
  `;
}

function renderSteps() {
  const labels = ["Local", "Categorias", "Benefício", "Validade", "Canais", "Link opcional", "Preview", "Revisão"];
  return `<div class="steps">${labels.map((label, index) => {
    const step = index + 1;
    const cls = step === state.wizardStep ? "active" : step < state.wizardStep ? "done" : "";
    return `<div class="step ${cls}"><span>${step < state.wizardStep ? "✓" : step}</span>${label}</div>`;
  }).join("")}</div>`;
}

function renderWizardStep() {
  const stepRenderers = [stepLocal, stepCategories, stepBenefit, stepValidity, stepChannels, stepLink, stepPreview, stepReview];
  return stepRenderers[state.wizardStep - 1]();
}

function stepLocal() {
  return `
    <h3>1. Selecione o estabelecimento</h3>
    <p>Escolha o local conectado que será associado a este Alerta de Oportunidade.</p>
    <div class="grid">
      ${state.places.map((place) => `
        <button class="choice ${state.wizard.placeId === place.id ? "selected" : ""} ${(!place.isEligibleForPublishing || !hasDefinedEstablishmentCategory(place)) ? "disabled" : ""}" data-action="select-wizard-place" data-id="${place.id}" ${(!place.isEligibleForPublishing || !hasDefinedEstablishmentCategory(place)) ? "disabled" : ""}>
          <span><strong>${place.name}</strong><br><small>${place.address}</small><br>${place.isEligibleForPublishing ? '<span class="status approved">Verificado</span>' : '<span class="status rejected">Não elegível</span>'} <span class="pill">${placeCategoryLabel(place)}</span></span>
          <span>🏪</span>
        </button>
      `).join("")}
    </div>
    ${wizardActions(false)}
  `;
}

function stepCategories() {
  return `
    <h3>2. Escolha as categorias do seu Alerta</h3>
    <p>Selecione uma categoria principal e categorias relacionadas. O matching depende dessa escolha.</p>
    <div class="grid cols-2">
      <section>
        <h4>Categoria principal</h4>
        <div class="grid">${categories.map((item) => `
          <button class="choice ${state.wizard.primaryCategoryId === item.id ? "selected" : ""}" data-action="select-primary-category" data-id="${item.id}">
            <span><strong>${item.label}</strong><br><small>${item.description}</small></span><span>${item.icon}</span>
          </button>`).join("")}</div>
      </section>
      <section>
        <h4>Categorias selecionadas</h4>
        <div class="grid">${categories.map((item) => `
          <label class="choice">
            <span><strong>${item.label}</strong><br><small>${item.description}</small></span>
            <input type="checkbox" data-action="toggle-category" data-id="${item.id}" ${state.wizard.categoryIds.includes(item.id) ? "checked" : ""} />
          </label>`).join("")}</div>
      </section>
    </div>
    ${wizardActions(true)}
  `;
}

function stepBenefit() {
  return `
    <h3>3. Defina o benefício ou tipo de oportunidade</h3>
    <p>O sistema usará essa escolha para gerar uma mensagem segura por template.</p>
    <div class="grid cols-2">${benefits.map((item) => `
      <button class="choice ${state.wizard.benefitType === item.id ? "selected" : ""}" data-action="select-benefit" data-id="${item.id}">
        <span><strong>${item.label}</strong><br><small>${item.description}</small></span><span>${item.icon}</span>
      </button>`).join("")}</div>
    ${wizardActions(true)}
  `;
}

function stepValidity() {
  return `
    <h3>4. Defina o período de validade e horários</h3>
    <p>Todo Alerta precisa de início e fim. Alertas indeterminados ficam fora do MVP.</p>
    <div class="form-grid">
      <label>Início<input type="date" data-field="validFrom" value="${state.wizard.validFrom}" /></label>
      <label>Fim<input type="date" data-field="validUntil" value="${state.wizard.validUntil}" /></label>
      <label class="choice wide"><span><strong>Exibir o dia todo</strong><br><small>Ignora horários específicos.</small></span><input type="checkbox" data-field="allDay" ${state.wizard.allDay ? "checked" : ""} /></label>
      <label>Horário inicial<input type="time" data-field="activeStartTime" value="${state.wizard.activeStartTime}" ${state.wizard.allDay ? "disabled" : ""} /></label>
      <label>Horário final<input type="time" data-field="activeEndTime" value="${state.wizard.activeEndTime}" ${state.wizard.allDay ? "disabled" : ""} /></label>
      <label class="choice wide disabled"><span><strong>Indeterminado</strong><br><small>Desabilitado no MVP: validade final é obrigatória.</small></span><input type="checkbox" disabled /></label>
    </div>
    ${wizardActions(true)}
  `;
}

function stepChannels() {
  return `
    <h3>5. Escolha onde seu Alerta será exibido</h3>
    <p>Android Auto e e-mail ficam desabilitados neste momento.</p>
    <div class="grid">
      ${channelChoice("mobileListEnabled", "App Mobile / Web", "Seu Alerta aparece na vitrine de Oportunidades Próximas.", "📱", false)}
      ${channelChoice("webEnabled", "Site Web", "Seu Alerta aparece na versão web responsiva.", "🌐", false)}
      ${channelChoice("androidAutoPoiRequested", "Android Auto", "Desabilitado no MVP. Apenas preparação futura car-safe.", "🚘", true)}
      ${channelChoice("emailEnabled", "E-mail", "Canal futuro, ainda não implementado.", "✉", true)}
    </div>
    ${wizardActions(true)}
  `;
}

function channelChoice(field, title, description, icon, disabled) {
  const checked = Boolean(state.wizard[field]);
  return `
    <label class="choice ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}">
      <span><strong>${title}</strong>${disabled ? ' <span class="badge">desabilitado</span>' : ""}<br><small>${description}</small></span>
      <span>${icon}</span>
      <input type="checkbox" data-field="${field}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
    </label>
  `;
}

function stepLink() {
  const validation = validateLink(state.wizard.externalLinkUrl);
  return `
    <h3>6. Adicione um link opcional</h3>
    <p>O link só abre no detalhe da oportunidade. HTTPS é obrigatório.</p>
    <div class="form-grid">
      <label class="choice wide"><span><strong>Adicionar link à oportunidade</strong><br><small>Quando ativado, exibe um botão no detalhe.</small></span><input type="checkbox" data-field="externalLinkEnabled" ${state.wizard.externalLinkEnabled ? "checked" : ""} /></label>
      <label class="wide">URL do link<input type="url" data-field="externalLinkUrl" value="${state.wizard.externalLinkUrl}" placeholder="https://..." ${!state.wizard.externalLinkEnabled ? "disabled" : ""} /></label>
      <label>Texto do botão<input maxlength="25" data-field="buttonText" value="${state.wizard.buttonText}" ${!state.wizard.externalLinkEnabled ? "disabled" : ""} /></label>
      <label class="choice disabled"><span><strong>Abrir direto pela notificação</strong><br><small>Bloqueado por regra de segurança.</small></span><input type="checkbox" disabled /></label>
    </div>
    <p class="${validation.ok ? "status approved" : "status rejected"}" style="margin-top:16px">${validation.ok ? validation.message || "Sem link externo." : validation.message}</p>
    ${wizardActions(true)}
  `;
}

function stepPreview() {
  const text = generateAlertText(state.wizard);
  return `
    <h3>7. Preview do seu Alerta</h3>
    <p>Confira como a oportunidade aparecerá para usuários compatíveis.</p>
    <div class="grid cols-2">
      <div class="phone-preview">
        <div class="phone-screen">
          <div class="preview-hero">OFERTA</div>
          <div class="preview-body">
            <span class="pill">${benefit(state.wizard.benefitType).label}</span>
            <h3>${text.title}</h3>
            <p>${text.summary}</p>
            <p><strong>${placeById(state.wizard.placeId)?.name ?? ""}</strong><br>${placeById(state.wizard.placeId)?.address ?? ""}</p>
            <p>Válido até ${formatDate(state.wizard.validUntil)}</p>
            ${state.wizard.externalLinkEnabled ? `<button class="secondary">${state.wizard.buttonText}</button>` : ""}
          </div>
        </div>
      </div>
      <div class="card">
        <h4>Texto gerado por template</h4>
        <p>Não há texto livre publicado diretamente. O sistema gera a mensagem a partir dos campos estruturados.</p>
        <label>Título gerado<input data-field="generatedMobileTitle" value="${text.title}" /></label>
        <label style="display:grid;gap:8px;margin-top:12px">Resumo gerado<textarea data-field="generatedMobileSummary" rows="4">${text.summary}</textarea></label>
        <div class="choice disabled" style="margin-top:16px"><span><strong>Preview Android Auto futuro</strong><br><small>Desabilitado no MVP.</small></span><span>🚘</span></div>
      </div>
    </div>
    ${wizardActions(true)}
  `;
}

function stepReview() {
  const text = generateAlertText(state.wizard);
  return `
    <h3>8. Revise e finalize seu Alerta</h3>
    <p>O Alerta será enviado para análise e só ficará visível após aprovação.</p>
    <div class="grid cols-2">
      ${reviewBlock("Estabelecimento", placeById(state.wizard.placeId)?.name, placeById(state.wizard.placeId)?.address)}
      ${reviewBlock("Categorias", category(state.wizard.primaryCategoryId).label, `+${Math.max(state.wizard.categoryIds.length - 1, 0)} categorias`)}
      ${reviewBlock("Benefício", benefit(state.wizard.benefitType).label, benefit(state.wizard.benefitType).description)}
      ${reviewBlock("Validade", `${formatDate(state.wizard.validFrom)} até ${formatDate(state.wizard.validUntil)}`, state.wizard.allDay ? "Exibição o dia todo" : `${state.wizard.activeStartTime} às ${state.wizard.activeEndTime}`)}
      ${reviewBlock("Canais", channelSummary({ ...state.wizard, androidAutoPoiPublished: false }).join(", "), "Android Auto desabilitado")}
      ${reviewBlock("Mensagem", text.title, text.summary)}
    </div>
    <div class="card" style="margin-top:16px"><strong>Quase pronto!</strong><br>Após enviar, seu Alerta será analisado. Prazo médio estimado: até 24 horas úteis.</div>
    <div class="wizard-actions">
      <button class="secondary" data-action="prev-step">Voltar</button>
      <button class="primary" data-action="publish-alert">Enviar para análise</button>
    </div>
  `;
}

function reviewBlock(title, main, sub) {
  return `<div class="card review-block"><strong>${title}</strong><p>${main ?? "-"}</p><small>${sub ?? ""}</small></div>`;
}

function wizardActions(hasBack) {
  return `
    <div class="wizard-actions">
      ${hasBack ? '<button class="secondary" data-action="prev-step">Voltar</button>' : '<button class="secondary" data-route="alerts">Cancelar</button>'}
      <button class="primary" data-action="next-step">Próximo passo →</button>
    </div>
  `;
}

function renderWizardSummary() {
  const draft = state.wizard ?? {};
  const place = placeById(draft.placeId);
  return `
    <aside class="card side-summary">
      <h3>Resumo do seu Alerta</h3>
      <div class="summary-list">
        <div class="summary-item"><strong>Estabelecimento</strong><br>${place?.name ?? "-"}<br><small>${place?.address ?? ""}</small></div>
        <div class="summary-item"><strong>Categorias</strong><br><span class="pill">${category(draft.primaryCategoryId).label}</span> +${Math.max((draft.categoryIds?.length ?? 1) - 1, 0)}</div>
        <div class="summary-item"><strong>Benefício</strong><br>${benefit(draft.benefitType).label}</div>
        <div class="summary-item"><strong>Validade</strong><br>${formatDate(draft.validFrom)} até ${formatDate(draft.validUntil)}</div>
        <div class="summary-item"><strong>Canais</strong><br>${draft.mobileListEnabled ? "📱" : ""} ${draft.webEnabled ? "🌐" : ""}<br><small>Android Auto desabilitado</small></div>
      </div>
    </aside>
  `;
}

function renderCreated() {
  const alert = state.alerts.find((item) => item.id === state.lastCreatedAlertId) ?? state.alerts[0];
  views.created.innerHTML = `
    <div class="success-hero">
      <div class="success-check">✓</div>
      <h2>Seu Alerta de Oportunidade foi criado com sucesso!</h2>
      <p>Seu Alerta foi enviado para análise. Ele ficará visível após aprovação.</p>
    </div>
    <div class="grid cols-2">
      <section class="card">
        <h3>Resumo do seu Alerta <span class="status in_review">Em análise</span></h3>
        ${reviewBlock("Estabelecimento", placeById(alert.placeId)?.name, placeById(alert.placeId)?.address)}
        ${reviewBlock("Categorias", category(alert.primaryCategoryId).label, `+${Math.max(alert.categoryIds.length - 1, 0)} categorias`)}
        ${reviewBlock("Benefício", benefit(alert.benefitType).label, alert.generatedMobileSummary)}
      </section>
      <section class="card">
        <h3>Próximos passos</h3>
        <p><span class="status in_review">Em análise</span> Prazo médio estimado: até 24 horas úteis.</p>
        <p>Você pode acompanhar o status na seção Meus Alertas.</p>
        <div class="quick-actions">
          <button class="secondary" data-route="alerts">Ver meus Alertas</button>
          <button class="primary" data-route="wizard">Criar outro Alerta</button>
        </div>
      </section>
    </div>
  `;
}

function renderPlaces() {
  const editingPlace = state.editingPlaceId ? placeById(state.editingPlaceId) : null;
  if (editingPlace) {
    views.places.innerHTML = `
      <div class="page-title">
        <div><h2>Editar estabelecimento</h2><p>Defina a categoria usada para liberar a criação de Alertas.</p></div>
      </div>
      <section class="card place-card">
        <h3>${editingPlace.name}</h3>
        <p>${editingPlace.address}</p>
        <p>${editingPlace.phone} • ${editingPlace.websiteUrl || "sem site"}</p>
        <label class="form-control">
          Categoria
          <select id="editingPlaceCategory">
            <option value="">Selecione uma categoria</option>
            ${establishmentCategories.map((item) => `<option value="${item.id}" ${(editingPlace.businessCategoryId || editingPlace.categoryId) === item.id ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </label>
        <span class="status ${editingPlace.isEligibleForPublishing ? "approved" : "rejected"}">${editingPlace.isEligibleForPublishing ? "Elegível para publicação" : "Não elegível"}</span>
        <p><small>Status de integração: ${editingPlace.bindingStatus}. Google Business Profile real será fase posterior.</small></p>
        <div class="quick-actions">
          <button class="primary" data-action="save-place-category" data-id="${editingPlace.id}">Salvar</button>
          <button class="secondary" data-action="cancel-place-edit">Cancelar</button>
        </div>
      </section>
    `;
    return;
  }

  views.places.innerHTML = `
    <div class="page-title"><div><h2>Estabelecimentos</h2><p>Modo manual/simulado do Google Business Profile para o MVP.</p></div></div>
    <div class="grid">${state.places.map((place) => `
      <section class="card place-card">
        <h3>${place.name}</h3>
        <p>${place.address}</p>
        <p>${place.phone} • ${place.websiteUrl || "sem site"}</p>
        <p><strong>Categoria:</strong> <span class="pill">${placeCategoryLabel(place)}</span></p>
        <span class="status ${place.isEligibleForPublishing ? "approved" : "rejected"}">${place.isEligibleForPublishing ? "Elegível para publicação" : "Não elegível"}</span>
        <p><small>Status de integração: ${place.bindingStatus}. Google Business Profile real será fase posterior.</small></p>
        <div class="place-card-actions">
          <button class="secondary" data-action="edit-place" data-id="${place.id}">Editar</button>
        </div>
      </section>
    `).join("")}</div>
  `;
}

function renderHistory() {
  const expiredAlerts = state.alerts
    .filter((alert) => effectiveStatus(alert) === "expired")
    .map((alert) => ({
      id: `expired-${alert.id}`,
      type: "expired",
      title: "Card expirado",
      description: `${alert.titleInternal} expirou em ${formatDate(alert.validUntil)}.`,
      createdAt: `${alert.validUntil}T23:59:00.000Z`
    }));
  const entries = [...(state.historyEntries ?? []), ...expiredAlerts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  views.history.innerHTML = `
    <div class="page-title"><div><h2>Histórico</h2><p>Registro de modificações, exclusões, expirações e eventos relevantes.</p></div></div>
    ${entries.length ? `<section class="card table-card">
      <table>
        <thead><tr><th>Data</th><th>Evento</th><th>Detalhe</th><th>Tipo</th></tr></thead>
        <tbody>${entries.map((entry) => `
          <tr>
            <td>${new Date(entry.createdAt).toLocaleString("pt-BR")}</td>
            <td><strong>${entry.title}</strong></td>
            <td>${entry.description}</td>
            <td><span class="status ${entry.type === "expired" ? "expired" : "approved"}">${entry.type}</span></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </section>` : '<div class="empty">Nenhum evento registrado ainda.</div>'}
  `;
}

function renderSettings() {
  const status = businessProfileStatus();
  const connected = status === "locations_found" || status === "location_selected";
  const authorized = status === "oauth_code_received";
  const eligiblePlaces = state.places.filter((place) => place.isVerified);
  views.settings.innerHTML = `
    <div class="page-title">
      <div>
        <h2>Conexão Google Business Profile</h2>
        <p>Identifique os Perfis da Empresa relacionados à conta Google do lojista.</p>
      </div>
      ${connected ? '<button class="primary" data-route="dashboard">Ir para o Dashboard</button>' : ""}
    </div>
    <section class="card">
      <h3>1. Conta Google autenticada</h3>
      <p><strong>${currentUserName()}</strong><br><small>${currentUserEmail()}</small></p>
      <span class="status approved">Login Google simulado concluído</span>
    </section>
    <section class="card" style="margin-top:18px">
      <h3>2. Buscar Perfis da Empresa relacionados</h3>
      <p>No ambiente real, esta etapa solicita OAuth com permissao do Google Business Profile e chama a API para listar contas e locais. Neste MVP, a identificacao dos locais ainda pode ser simulada com os estabelecimentos verificados manualmente.</p>
      <div class="quick-actions">
        <button class="primary" data-action="connect-google-business">${connected ? "Sincronizar novamente" : "Conectar Perfil da Empresa"}</button>
        <button class="secondary" data-action="simulate-no-business-profile">Simular conta sem Perfil da Empresa</button>
      </div>
      <p class="status ${connected || authorized ? "approved" : status === "no_locations" ? "rejected" : "in_review"}" style="margin-top:16px">
        ${status === "no_locations" ? "Nenhum Perfil da Empresa encontrado para esta conta." : connected ? `${eligiblePlaces.length} perfis encontrados para esta conta.` : authorized ? "Autorizacao OAuth recebida. Falta backend seguro para trocar o codigo por tokens e listar locais reais." : "Aguardando autorizacao para consultar perfis."}
      </p>
    </section>
    ${connected ? `
      <section class="card" style="margin-top:18px">
        <h3>3. Selecione o estabelecimento</h3>
        <p>Somente locais verificados/elegíveis podem publicar Alertas de Oportunidade.</p>
        <div class="grid">
          ${state.places.map((place) => `
            <button class="choice ${state.selectedPlaceId === place.id ? "selected" : ""} ${!place.isEligibleForPublishing ? "disabled" : ""}" data-action="select-google-location" data-id="${place.id}" ${!place.isEligibleForPublishing ? "disabled" : ""}>
              <span>
                <strong>${place.name}</strong><br>
                <small>${place.address}</small><br>
                ${place.isEligibleForPublishing ? '<span class="status approved">Verificado e elegível</span>' : '<span class="status rejected">Não elegível para publicação</span>'}
              </span>
              <span>🏪</span>
            </button>
          `).join("")}
        </div>
      </section>
    ` : ""}
    <section class="card" style="margin-top:18px">
      <h3>Condições para integração real</h3>
      <div class="summary-list">
        ${reviewBlock("OAuth Client", "Configurado", "Domínios e callback precisam estar iguais no Google Cloud e no Vercel.")}
        ${reviewBlock("Escopo Google Business Profile", GOOGLE_BUSINESS_SCOPE, "Solicita acesso para listar contas e locais gerenciados.")}
        ${reviewBlock("Backend seguro", "Pendente", "Necessário para trocar o code por tokens sem expor client secret no navegador.")}
        ${reviewBlock("API Google Business Profile", "Pendente", "Projeto precisa ter APIs corretas habilitadas e conta com permissão sobre os locais.")}
        ${reviewBlock("Verificação e consentimento", "Pendente", "Usuários de teste funcionam antes da publicação; produção exige tela de consentimento revisada quando aplicável.")}
      </div>
    </section>
    <section class="card" style="margin-top:18px">
      <h3>Canais futuros</h3>
      <p><strong>Android Auto:</strong> desabilitado neste momento. Sem publicação, sem push, sem link no carro.</p>
      <p><strong>E-mail:</strong> canal futuro, sem envio no MVP.</p>
    </section>
  `;
}

function validateWizardStep() {
  const draft = state.wizard;
  if (state.wizardStep === 1) {
    const place = placeById(draft.placeId);
    if (!place?.isEligibleForPublishing) return "Selecione um estabelecimento elegível.";
    if (!hasDefinedEstablishmentCategory(place)) return "Defina a categoria do estabelecimento antes de criar alertas.";
  }
  if (state.wizardStep === 2 && (!draft.primaryCategoryId || !draft.categoryIds.length)) return "Selecione a categoria principal.";
  if (state.wizardStep === 4) {
    if (!draft.validFrom || !draft.validUntil) return "Informe início e fim da validade.";
    if (draft.validUntil < draft.validFrom) return "A data final não pode ser anterior à inicial.";
  }
  if (state.wizardStep === 5 && !draft.mobileListEnabled && !draft.webEnabled) return "Selecione ao menos um canal permitido.";
  if (state.wizardStep === 6 && draft.externalLinkEnabled) {
    const validation = validateLink(draft.externalLinkUrl);
    if (!validation.ok) return validation.message;
  }
  return "";
}

function publishAlert() {
  const draft = state.wizard;
  const validation = validateWizardStep();
  if (validation) {
    showToast(validation, "error");
    return;
  }
  const text = generateAlertText(draft);
  const linkValidation = validateLink(draft.externalLinkUrl);
  const id = `alert-${Math.floor(1000 + Math.random() * 9000)}`;
  const alert = {
    id,
    placeId: draft.placeId,
    titleInternal: text.title,
    benefitType: draft.benefitType,
    primaryCategoryId: draft.primaryCategoryId,
    categoryIds: unique([draft.primaryCategoryId, ...draft.categoryIds]),
    validFrom: draft.validFrom,
    validUntil: draft.validUntil,
    allDay: draft.allDay,
    activeStartTime: draft.activeStartTime,
    activeEndTime: draft.activeEndTime,
    mobileListEnabled: Boolean(draft.mobileListEnabled),
    mobileAlertEnabled: Boolean(draft.mobileAlertEnabled),
    webEnabled: Boolean(draft.webEnabled),
    androidAutoPoiRequested: false,
    androidAutoPoiEligible: false,
    androidAutoPoiPublished: false,
    emailEnabled: false,
    externalLinkEnabled: Boolean(draft.externalLinkEnabled),
    externalLinkUrl: draft.externalLinkEnabled ? draft.externalLinkUrl : "",
    externalLinkStatus: draft.externalLinkEnabled ? linkValidation.status : "not_applicable",
    buttonText: draft.externalLinkEnabled ? draft.buttonText : "",
    generatedMobileTitle: text.title,
    generatedMobileSummary: text.summary,
    carSafeTitle: `${placeById(draft.placeId)?.name ?? "Local"} - ${category(draft.primaryCategoryId).label}`,
    carSafeSummary: "Preparação futura. Android Auto desabilitado no MVP.",
    moderationStatus: "pending",
    mainStatus: "in_review",
    metrics: { views: 0, routes: 0, clicks: 0, saves: 0, reports: 0 },
    createdAt: new Date().toISOString()
  };
  state.alerts.unshift(alert);
  state.lastCreatedAlertId = id;
  state.route = "created";
  addHistory("created", "Alerta criado", `${alert.titleInternal} foi enviado para análise.`);
  saveState();
  render();
  showToast("Alerta criado e enviado para análise.", "success");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function handleClick(event) {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    routeTo(routeButton.dataset.route);
    return;
  }
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const { action, id } = actionTarget.dataset;

  if (action === "login") {
    if (startGoogleOAuth()) return;
    state.isLoggedIn = true;
    state.googleBusinessProfile = {
      ...state.googleBusinessProfile,
      connectedEmail: state.googleBusinessProfile?.connectedEmail || currentUserEmail()
    };
    state.route = "dashboard";
    saveState();
    render();
    showToast("Login Google simulado concluido. Conecte o Perfil da Empresa para identificar estabelecimentos.", "success");
  } else if (action === "logout") {
    state = structuredClone(initialState);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("googleOAuthState");
    render();
    showToast("Sessao encerrada no app.", "success");
  } else if (action === "connect-google-business") {
    state.googleBusinessProfile = {
      status: "locations_found",
      connectedEmail: state.googleBusinessProfile?.connectedEmail || currentUserEmail(),
      detectedAt: new Date().toISOString(),
      selectedLocationId: state.googleBusinessProfile?.selectedLocationId || state.selectedPlaceId || ""
    };
    saveState();
    renderSettings();
    showToast("Perfis do Google Business Profile identificados em modo simulado.", "success");
  } else if (action === "simulate-no-business-profile") {
    state.googleBusinessProfile = {
      status: "no_locations",
      connectedEmail: state.googleBusinessProfile?.connectedEmail || currentUserEmail(),
      detectedAt: new Date().toISOString(),
      selectedLocationId: ""
    };
    saveState();
    renderSettings();
    showToast("Nenhum Perfil da Empresa foi encontrado para esta conta simulada.", "error");
  } else if (action === "select-google-location") {
    const place = placeById(id);
    if (!place?.isEligibleForPublishing) return showToast("Este estabelecimento nao esta elegivel para publicacao.", "error");
    state.selectedPlaceId = id;
    state.googleBusinessProfile = {
      ...state.googleBusinessProfile,
      status: "location_selected",
      selectedLocationId: id
    };
    saveState();
    renderSettings();
    showToast(`${place.name} conectado ao portal.`, "success");
  } else if (action === "toggle-sidebar") {
    if (window.matchMedia("(max-width: 1100px)").matches) {
      $(".sidebar").classList.toggle("open");
    } else {
      $("#appView").classList.toggle("sidebar-collapsed");
    }
  } else if (action === "show-how") {
    showToast("A plataforma entrega oportunidades apenas quando há interesse declarado e regras de privacidade atendidas.");
  } else if (action === "select-wizard-place") {
    const place = placeById(id);
    if (!place?.isEligibleForPublishing) return showToast("Selecione um estabelecimento elegível.", "error");
    if (!hasDefinedEstablishmentCategory(place)) return showToast("Defina a categoria do estabelecimento antes de criar alertas.", "error");
    const categoryId = place.businessCategoryId || place.categoryId;
    state.wizard.placeId = id;
    state.wizard.primaryCategoryId = categoryId;
    state.wizard.categoryIds = unique([categoryId, ...state.wizard.categoryIds]);
    saveState();
    renderWizard();
  } else if (action === "select-primary-category") {
    state.wizard.primaryCategoryId = id;
    state.wizard.categoryIds = unique([id, ...state.wizard.categoryIds]);
    saveState();
    renderWizard();
  } else if (action === "select-benefit") {
    state.wizard.benefitType = id;
    saveState();
    renderWizard();
  } else if (action === "next-step") {
    const validation = validateWizardStep();
    if (validation) return showToast(validation, "error");
    state.wizardStep = Math.min(8, state.wizardStep + 1);
    saveState();
    renderWizard();
  } else if (action === "prev-step") {
    state.wizardStep = Math.max(1, state.wizardStep - 1);
    saveState();
    renderWizard();
  } else if (action === "publish-alert") {
    publishAlert();
  } else if (action === "activate-alert") {
    updateAlert(id, { mainStatus: "active", moderationStatus: "approved" });
    showToast("Alerta ativo na vitrine para usuários compatíveis.", "success");
  } else if (action === "pause-alert") {
    updateAlert(id, { mainStatus: "paused" });
    showToast("Alerta pausado.");
  } else if (action === "edit-place") {
    state.editingPlaceId = id;
    saveState();
    renderPlaces();
  } else if (action === "cancel-place-edit") {
    state.editingPlaceId = "";
    saveState();
    renderPlaces();
  } else if (action === "save-place-category") {
    const place = placeById(id);
    const select = $("#editingPlaceCategory");
    if (!place || !select) return;
    if (!select.value) return showToast("Selecione uma categoria para o estabelecimento.", "error");
    const previous = establishmentCategory(place.businessCategoryId || place.categoryId).label;
    place.businessCategoryId = select.value;
    const next = establishmentCategory(select.value).label;
    addHistory("updated", "Categoria do estabelecimento alterada", `${place.name}: ${previous} → ${next}.`);
    state.editingPlaceId = "";
    saveState();
    renderPlaces();
    showToast("Categoria do estabelecimento salva.", "success");
  } else if (action === "view-alert") {
    openAlertDetail(id);
  } else if (action === "close-dialog") {
    $("#detailDialog").close();
  }
}

function updateAlert(id, patch) {
  const alert = state.alerts.find((item) => item.id === id);
  if (!alert) return;
  const previousStatus = alert.mainStatus;
  Object.assign(alert, patch);
  if (patch.mainStatus && patch.mainStatus !== previousStatus) {
    addHistory("updated", "Status do alerta alterado", `${alert.titleInternal}: ${statusLabel(previousStatus)} → ${statusLabel(patch.mainStatus)}.`);
  }
  saveState();
  render();
}

function openAlertDetail(id) {
  const alert = state.alerts.find((item) => item.id === id);
  if (!alert) return;
  const place = placeById(alert.placeId);
  $("#detailContent").innerHTML = `
    <h2>${alert.generatedMobileTitle}</h2>
    <p>${alert.generatedMobileSummary}</p>
    <div class="grid cols-2">
      ${reviewBlock("Estabelecimento", place?.name, place?.address)}
      ${reviewBlock("Status", statusLabel(effectiveStatus(alert)), `Situação administrativa: ${alert.moderationStatus}`)}
      ${reviewBlock("Categorias", category(alert.primaryCategoryId).label, alert.categoryIds.map((item) => category(item).label).join(", "))}
      ${reviewBlock("Validade", `${formatDate(alert.validFrom)} até ${formatDate(alert.validUntil)}`, alert.allDay ? "O dia todo" : `${alert.activeStartTime} às ${alert.activeEndTime}`)}
      ${reviewBlock("Canais", channelSummary(alert).join(", "), "Android Auto desabilitado")}
      ${reviewBlock("Link", alert.externalLinkEnabled ? alert.externalLinkUrl : "Sem link", alert.externalLinkStatus)}
    </div>
  `;
  $("#detailDialog").showModal();
}

function handleChange(event) {
  const field = event.target.dataset.field;
  const action = event.target.dataset.action;
  if (field && state.wizard) {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    if (field === "androidAutoPoiRequested" || field === "emailEnabled") return;
    state.wizard[field] = value;
    if (field === "allDay") {
      state.wizard.activeStartTime = value ? "06:00" : state.wizard.activeStartTime;
      state.wizard.activeEndTime = value ? "22:00" : state.wizard.activeEndTime;
    }
    saveState();
    renderWizard();
  }
  if (action === "toggle-category") {
    const id = event.target.dataset.id;
    state.wizard.categoryIds = event.target.checked
      ? unique([...state.wizard.categoryIds, id])
      : state.wizard.categoryIds.filter((item) => item !== id);
    if (!state.wizard.categoryIds.includes(state.wizard.primaryCategoryId)) {
      state.wizard.categoryIds.unshift(state.wizard.primaryCategoryId);
    }
    saveState();
    renderWizard();
  }
  if (action === "select-dashboard-place") {
    state.selectedPlaceId = event.target.value;
    saveState();
    render();
  }
}
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);

handleGoogleOAuthCallback();
render();
