import assert from "node:assert/strict";

const baseUrl = (process.env.APP_URL || "http://127.0.0.1:4177/").replace(/\/$/, "");

async function read(path) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.ok, true, `${path} deve responder com sucesso`);
  return response.text();
}

const html = await read("/");
assert(html.includes("repassecomrepasse"), "home deve exibir identidade do repassecomrepasse");
assert(html.includes("id=\"itemForm\""), "home deve conter formulario de imovel");
assert(html.includes("id=\"proposalForm\""), "home deve conter formulario de proposta");
assert(html.includes("id=\"agencyView\""), "home deve conter view da imobiliaria");
assert(!/checkout|carrinho|comprar/i.test(html), "home nao deve usar linguagem de venda direta");

const js = await read("/app.js");
assert(js.includes("openItemDetail"), "app deve possuir fluxo de detalhe");
assert(js.includes("sendProposal"), "app deve possuir fluxo de proposta");
assert(js.includes("renderInitialAgreementBox"), "app deve renderizar acordo inicial");

const css = await read("/styles.css");
assert(css.includes("@media (max-width: 900px)"), "CSS deve conter responsividade principal");
assert(css.includes(".item-card"), "CSS deve estilizar cards da vitrine");

console.log(`e2e-public-flow ok: ${baseUrl}`);
