const config = window.OPPORTUNITIES_CONFIG ?? {};
const ANDROID_AUTO_ENABLED = Boolean(config.androidAutoEnabled);
const EMAIL_CHANNEL_ENABLED = Boolean(config.emailChannelEnabled);
const STORAGE_KEY = "opportunities-next-mvp:v1";

const categories = [
  { id: "supermarkets", label: "Supermercados", description: "Compras do dia a dia, alimentos, bebidas e limpeza.", icon: "🛒" },
  { id: "offers", label: "Ofertas e Descontos", description: "Promoções, descontos e condições especiais.", icon: "🏷" },
  { id: "promotion", label: "Produtos em Promoção", description: "Destaques e promoções de produtos específicos.", icon: "%" },
  { id: "bakeries", label: "Padarias", description: "Pães, bolos, doces e produtos de padaria.", icon: "🥐" },
  { id: "fuel", label: "Postos de Combustível", description: "Combustível, loja de conveniência e serviços rápidos.", icon: "⛽" },
  { id: "parking", label: "Estacionamentos", description: "Vagas, diárias e condições especiais de estacionamento.", icon: "🚗" }
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
  consumerPreferences: {
    categoryIds: ["supermarkets", "offers", "promotion"],
    neighborhood: "Manaíra",
    maxDistanceKm: 5,
    savedIds: [],
    hiddenIds: [],
    reportedIds: []
  },
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
  moderation: $("#moderationView"),
  consumer: $("#consumerView"),
  settings: $("#settingsView")
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : structuredClone(initialState);
  } catch (_error) {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetWizard() {
  const place = currentPlace();
  state.wizardStep = 1;
  state.wizard = {
    placeId: place?.id ?? "",
    primaryCategoryId: place?.categoryId ?? "supermarkets",
    categoryIds: [place?.categoryId ?? "supermarkets", "offers"],
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

function benefit(id) {
  return benefits.find((item) => item.id === id) ?? benefits[0];
}

function placeById(id) {
  return state.places.find((item) => item.id === id);
}

function currentPlace() {
  return placeById(state.selectedPlaceId) ?? state.places[0];
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

function matchingConsumerAlerts() {
  const prefs = state.consumerPreferences;
  return state.alerts
    .filter((alert) => {
      const place = placeById(alert.placeId);
      if (prefs.hiddenIds.includes(alert.id)) return false;
      if (effectiveStatus(alert) !== "active") return false;
      if (alert.moderationStatus !== "approved") return false;
      if (!place?.isVerified || !place.isEligibleForPublishing) return false;
      if (!alert.webEnabled && !alert.mobileListEnabled) return false;
      if (alert.externalLinkEnabled && alert.externalLinkStatus !== "approved") return false;
      return alert.categoryIds.some((id) => prefs.categoryIds.includes(id));
    })
    .sort((a, b) => b.metrics.views - a.metrics.views);
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
  if (route === "wizard") resetWizard();
  state.route = route;
  saveState();
  render();
}

function render() {
  $("#landingView").hidden = state.isLoggedIn;
  $("#appView").hidden = !state.isLoggedIn;
  if (!state.isLoggedIn) return;

  $("#appView").classList.toggle("consumer-mode", state.route === "consumer");
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
    moderation: "Moderação",
    consumer: "Experiência do consumidor > Oportunidades Próximas",
    settings: "Integração Google"
  };
  $("#breadcrumb").textContent = labels[state.route] ?? "Dashboard";
  $("#moderationCount").textContent = state.alerts.filter((alert) => alert.mainStatus === "in_review").length;

  renderDashboard();
  renderAlerts();
  renderWizard();
  renderCreated();
  renderPlaces();
  renderModeration();
  renderConsumer();
  renderSettings();
}

function renderDashboard() {
  const counts = {
    active: state.alerts.filter((alert) => effectiveStatus(alert) === "active").length,
    in_review: state.alerts.filter((alert) => alert.mainStatus === "in_review").length,
    paused: state.alerts.filter((alert) => alert.mainStatus === "paused").length,
    expired: state.alerts.filter((alert) => effectiveStatus(alert) === "expired").length,
    reports: state.consumerPreferences.reportedIds.length
  };
  const totals = state.alerts.reduce((acc, alert) => {
    acc.views += alert.metrics.views;
    acc.routes += alert.metrics.routes;
    acc.clicks += alert.metrics.clicks;
    acc.saves += alert.metrics.saves;
    return acc;
  }, { views: 0, routes: 0, clicks: 0, saves: 0 });

  views.dashboard.innerHTML = `
    <div class="page-title">
      <div>
        <p class="eyebrow">Portal do lojista</p>
        <h2>Olá, João! 👋</h2>
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
        <div class="grid cols-4">
          ${miniMetric("Visualizações", totals.views)}
          ${miniMetric("Rotas iniciadas", totals.routes)}
          ${miniMetric("Cliques em link", totals.clicks)}
          ${miniMetric("Salvos", totals.saves)}
        </div>
      </section>
      <section class="card">
        <h3>Ações rápidas</h3>
        <div class="quick-actions">
          <button class="primary" data-route="wizard">Criar Alerta de Oportunidade</button>
          <button class="secondary" data-route="alerts">Ver meus Alertas</button>
          <button class="secondary" data-route="consumer">Abrir experiência do consumidor</button>
        </div>
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
  if (alert.mainStatus === "in_review") actions.push(`<button class="primary" data-action="approve-alert" data-id="${alert.id}">Aprovar</button>`);
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
        <button class="choice ${state.wizard.placeId === place.id ? "selected" : ""} ${!place.isEligibleForPublishing ? "disabled" : ""}" data-action="select-wizard-place" data-id="${place.id}" ${!place.isEligibleForPublishing ? "disabled" : ""}>
          <span><strong>${place.name}</strong><br><small>${place.address}</small><br>${place.isEligibleForPublishing ? '<span class="status approved">Verificado</span>' : '<span class="status rejected">Não elegível</span>'}</span>
          <span>${category(place.categoryId).icon}</span>
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
  views.places.innerHTML = `
    <div class="page-title"><div><h2>Estabelecimentos</h2><p>Modo manual/simulado do Google Business Profile para o MVP.</p></div></div>
    <div class="grid">${state.places.map((place) => `
      <section class="card">
        <h3>${place.name}</h3>
        <p>${place.address}</p>
        <p>${place.phone} • ${place.websiteUrl || "sem site"}</p>
        <span class="status ${place.isEligibleForPublishing ? "approved" : "rejected"}">${place.isEligibleForPublishing ? "Elegível para publicação" : "Não elegível"}</span>
        <p><small>Status de integração: ${place.bindingStatus}. Google Business Profile real será fase posterior.</small></p>
      </section>
    `).join("")}</div>
  `;
}

function renderModeration() {
  const pending = state.alerts.filter((alert) => alert.mainStatus === "in_review");
  views.moderation.innerHTML = `
    <div class="page-title"><div><h2>Moderação</h2><p>Revise Alertas antes de ficarem ativos na vitrine.</p></div></div>
    ${pending.length ? `<div class="grid">${pending.map((alert) => `
      <section class="card">
        <h3>${alert.titleInternal}</h3>
        <p>${alert.generatedMobileSummary}</p>
        <p>${placeById(alert.placeId)?.name} • ${formatDate(alert.validFrom)} até ${formatDate(alert.validUntil)}</p>
        <div class="quick-actions">
          <button class="primary" data-action="approve-alert" data-id="${alert.id}">Aprovar</button>
          <button class="secondary" data-action="reject-alert" data-id="${alert.id}">Recusar</button>
        </div>
      </section>
    `).join("")}</div>` : '<div class="empty">Nenhum Alerta aguardando análise.</div>'}
  `;
}

function renderConsumer() {
  const matches = matchingConsumerAlerts();
  views.consumer.innerHTML = `
    <div class="page-title">
      <div><h2>Oportunidades Próximas</h2><p>Experiência separada do consumidor, filtrada por interesses declarados.</p></div>
      <button class="secondary" data-route="dashboard">Voltar ao portal do lojista</button>
    </div>
    <div class="consumer-shell">
      <aside class="card">
        <h3>Preferências</h3>
        <p>Escolha interesses para validar o matching.</p>
        <div class="grid">${categories.map((item) => `
          <label class="choice">
            <span><strong>${item.label}</strong><br><small>${item.description}</small></span>
            <input type="checkbox" data-action="toggle-consumer-category" data-id="${item.id}" ${state.consumerPreferences.categoryIds.includes(item.id) ? "checked" : ""} />
          </label>`).join("")}</div>
      </aside>
      <section class="grid">
        ${matches.length ? matches.map(opportunityCard).join("") : '<div class="empty">Nenhuma oportunidade compatível com seus interesses agora.</div>'}
      </section>
    </div>
  `;
}

function opportunityCard(alert) {
  const place = placeById(alert.placeId);
  return `
    <article class="opportunity-card">
      <div class="opportunity-image">${category(alert.primaryCategoryId).label}</div>
      <div>
        <span class="pill">${benefit(alert.benefitType).label}</span>
        <h3>${alert.generatedMobileTitle}</h3>
        <p>${alert.generatedMobileSummary}</p>
        <p><strong>${place?.name}</strong> • ${place?.neighborhood} • válido até ${formatDate(alert.validUntil)}</p>
        <div class="pill-list">${alert.categoryIds.map((id) => `<span class="pill">${category(id).label}</span>`).join("")}</div>
      </div>
      <div class="quick-actions">
        <button class="primary" data-action="view-alert" data-id="${alert.id}">Ver detalhes</button>
        <button class="secondary" data-action="save-opportunity" data-id="${alert.id}">Salvar</button>
        <button class="secondary" data-action="hide-opportunity" data-id="${alert.id}">Ocultar</button>
        <button class="secondary" data-action="report-opportunity" data-id="${alert.id}">Denunciar</button>
      </div>
    </article>
  `;
}

function renderSettings() {
  views.settings.innerHTML = `
    <div class="page-title"><div><h2>Integração Google</h2><p>O MVP usa modo manual/simulado. OAuth real será fase posterior.</p></div></div>
    <section class="card">
      <h3>Conexão Google Business Profile</h3>
      <p>Para criar Alertas no MVP, use estabelecimentos verificados manualmente. A plataforma não é afiliada, associada ou endossada pelo Google.</p>
      <button class="secondary" disabled>Conectar Perfil da Empresa (fase posterior)</button>
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
    state.isLoggedIn = true;
    state.route = "dashboard";
    saveState();
    render();
    showToast("Entrada simulada realizada com sucesso.", "success");
  } else if (action === "logout") {
    state.isLoggedIn = false;
    saveState();
    render();
  } else if (action === "toggle-sidebar") {
    if (window.matchMedia("(max-width: 1100px)").matches) {
      $(".sidebar").classList.toggle("open");
    } else {
      $("#appView").classList.toggle("sidebar-collapsed");
    }
  } else if (action === "show-how") {
    showToast("A plataforma entrega oportunidades apenas quando há interesse declarado e regras de privacidade atendidas.");
  } else if (action === "select-wizard-place") {
    state.wizard.placeId = id;
    const place = placeById(id);
    state.wizard.primaryCategoryId = place.categoryId;
    state.wizard.categoryIds = unique([place.categoryId, ...state.wizard.categoryIds]);
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
  } else if (action === "approve-alert") {
    updateAlert(id, { mainStatus: "approved", moderationStatus: "approved" });
    showToast("Alerta aprovado. Ative para publicar na vitrine.", "success");
  } else if (action === "activate-alert") {
    updateAlert(id, { mainStatus: "active", moderationStatus: "approved" });
    showToast("Alerta ativo na vitrine para usuários compatíveis.", "success");
  } else if (action === "pause-alert") {
    updateAlert(id, { mainStatus: "paused" });
    showToast("Alerta pausado.");
  } else if (action === "reject-alert") {
    updateAlert(id, { mainStatus: "rejected", moderationStatus: "rejected" });
    showToast("Alerta recusado.", "error");
  } else if (action === "view-alert") {
    openAlertDetail(id);
  } else if (action === "save-opportunity") {
    state.consumerPreferences.savedIds = unique([...state.consumerPreferences.savedIds, id]);
    saveState();
    showToast("Oportunidade salva.", "success");
  } else if (action === "hide-opportunity") {
    state.consumerPreferences.hiddenIds = unique([...state.consumerPreferences.hiddenIds, id]);
    saveState();
    renderConsumer();
    showToast("Oportunidade ocultada.");
  } else if (action === "report-opportunity") {
    state.consumerPreferences.reportedIds = unique([...state.consumerPreferences.reportedIds, id]);
    const alert = state.alerts.find((item) => item.id === id);
    if (alert) alert.metrics.reports += 1;
    saveState();
    renderConsumer();
    showToast("Denúncia registrada para revisão manual.", "success");
  } else if (action === "close-dialog") {
    $("#detailDialog").close();
  }
}

function updateAlert(id, patch) {
  const alert = state.alerts.find((item) => item.id === id);
  if (!alert) return;
  Object.assign(alert, patch);
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
      ${reviewBlock("Status", statusLabel(effectiveStatus(alert)), `Moderação: ${alert.moderationStatus}`)}
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
  if (action === "toggle-consumer-category") {
    const id = event.target.dataset.id;
    state.consumerPreferences.categoryIds = event.target.checked
      ? unique([...state.consumerPreferences.categoryIds, id])
      : state.consumerPreferences.categoryIds.filter((item) => item !== id);
    saveState();
    renderConsumer();
  }
  if (action === "select-dashboard-place") {
    state.selectedPlaceId = event.target.value;
    saveState();
    render();
  }
}
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);

render();
