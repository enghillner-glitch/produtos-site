# Relatorio de homologacao executada

Data: 2026-06-01

## Escopo testado

- Sintaxe JavaScript do app principal.
- Sintaxe das funcoes server-side da Vercel.
- Testes estaticos de integracao HTML/JS/SQL.
- Testes unitarios das rotas de manutencao e Turnstile.
- Dry-run de backup e restauracao com manifest/hash.
- Smoke HTTP local e em producao.
- E2E publico local e em producao.
- Renderizacao visual do DOCX mestre revisado.

## Comandos

```powershell
node --check app.js
node --check api/maintenance.js
node --check api/verify-turnstile.js
node --check scripts/backup-project.mjs
node --check scripts/restore-project.mjs
node tests/static-checks.mjs
node tests/unit-maintenance.mjs
node tests/unit-turnstile.mjs
node tests/backup-restore-dry-run.mjs
$env:APP_URL='http://127.0.0.1:4177/'; node tests/smoke-http.mjs
$env:APP_URL='http://127.0.0.1:4177/'; node tests/e2e-public-flow.mjs
$env:APP_URL='https://produtos-site.vercel.app/'; node tests/smoke-http.mjs
$env:APP_URL='https://produtos-site.vercel.app/'; node tests/e2e-public-flow.mjs
node scripts/check-production-readiness.mjs
```

Renderizacao DOCX:

```powershell
python render_docx.py C:\Users\jpsecundario\Desktop\Plano_Mestre_Repassecomrepasse_CODEX_REVISADO_CODEX.docx --output_dir work-docx-render --renderer artifact-tool
```

## Resultado

Todos os testes automatizados executados passaram.

O DOCX mestre revisado foi renderizado em 40 paginas PNG e inspecionado visualmente em pranchas de conferencia, sem cortes, sobreposicoes ou tabelas quebradas aparentes.

## Diagnostico operacional adicional

O verificador `scripts/check-deployment-config.mjs` foi criado para a etapa pos-migracao. Apos aplicar o `supabase.sql` em dois blocos no SQL Editor do Supabase, a execucao confirmou que as tabelas avancadas `negotiation_leads`, `agreement_cancellations`, `final_agreement_terms`, `notifications`, `email_queue`, `consent_records` e `favorite_items` estao disponiveis em producao. Tambem confirmou que a RPC anonima foi bloqueada com status `401`.

As variaveis obrigatorias `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` foram cadastradas na Vercel em 2026-06-01. A chave server-side foi revisada para usar a API key legacy `service_role`, nao o segredo JWT bruto. O proximo deploy deve carregar essas variaveis nas funcoes server-side.

## Pendencias externas para homologacao autenticada completa

- `supabase.sql` aplicado no projeto Supabase de producao em 2026-06-01.
- Executar `node scripts/check-deployment-config.mjs` depois da migracao para confirmar schema, RPCs e guardas server-side.
- Variaveis server-side obrigatorias cadastradas na Vercel:
  - `CRON_SECRET`;
  - `SUPABASE_URL`;
  - `SUPABASE_SERVICE_ROLE_KEY`;
- Aguardar novo deploy e confirmar `/api/maintenance` retornando `401` sem token.
- Variaveis opcionais ainda dependem de decisao operacional:
  - `TURNSTILE_SECRET_KEY`, se Turnstile for ativado;
  - `RESEND_API_KEY` e `EMAIL_FROM`, se emails automaticos forem ativados.
- Preencher `turnstileSiteKey` em `config.js`, se Turnstile for ativado.
- Executar fluxo autenticado real com usuario, perfil, anuncio, proposta, acordo inicial, lead, acordo final e cancelamento.

## Observacao

Com a migracao Supabase aplicada e as variaveis obrigatorias cadastradas na Vercel, a producao ja possui o schema avancado e a configuracao server-side necessaria. A confirmacao final depende do novo deploy refletir as variaveis.
