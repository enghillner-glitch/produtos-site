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

## Resultado

Todos os testes automatizados executados passaram.

## Diagnostico operacional adicional

O verificador `scripts/check-deployment-config.mjs` foi criado para a etapa pos-migracao. Na execucao atual ele confirmou que o site publicado carrega `config.js` e que a configuracao publica do Supabase responde, mas tambem apontou que as tabelas avancadas `negotiation_leads`, `agreement_cancellations`, `final_agreement_terms`, `notifications`, `email_queue`, `consent_records` e `favorite_items` ainda nao estao disponiveis no Supabase de producao. Tambem indicou `missing_cron_secret` na Vercel.

Esse resultado e coerente com a pendencia externa de aplicar `supabase.sql` e configurar variaveis server-side antes da homologacao autenticada completa.

## Pendencias externas para homologacao autenticada completa

- Aplicar `supabase.sql` no projeto Supabase de producao.
- Executar `node scripts/check-deployment-config.mjs` depois da migracao para confirmar schema, RPCs e guardas server-side.
- Configurar variaveis server-side na Vercel:
  - `CRON_SECRET`;
  - `SUPABASE_URL`;
  - `SUPABASE_SERVICE_ROLE_KEY`;
  - `TURNSTILE_SECRET_KEY`, se Turnstile for ativado;
  - `RESEND_API_KEY` e `EMAIL_FROM`, se emails automaticos forem ativados.
- Preencher `turnstileSiteKey` em `config.js`, se Turnstile for ativado.
- Executar fluxo autenticado real com usuario, perfil, anuncio, proposta, acordo inicial, lead, acordo final e cancelamento.

## Observacao

Sem a migracao Supabase aplicada, a producao pode carregar a interface e testes publicos, mas os fluxos autenticados que dependem de tabelas/RPCs novas continuarao em modo de compatibilidade ou exibirao aviso de migracao pendente.
