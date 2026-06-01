# repassecomrepasse

Base transformada a partir do antigo `trocacomtroca` para o produto **repassecomrepasse**.

O repassecomrepasse sera uma plataforma de aproximacao entre usuarios com interesses convergentes na negociacao de imoveis. A plataforma nao realiza venda direta, analise documental, aprovacao de credito, transferencia de propriedade ou tratativas com agentes financiadores.

## Estado atual

- MVP funcional de repasse imobiliario implementado em HTML/CSS/JS + Supabase.

- Fluxos principais: cadastro de perfil, imovel, imagem, propostas, acordo inicial, lead interno, cancelamento, acordo final, notificacoes e administracao.

- Backup minimo e restauracao documentados.

- O antigo cadastro simples de produtos foi descontinuado na interface principal.

## Arquivos de orientacao

- `AGENTS.md` - instrucoes permanentes para o Codex.

- `PLANO_IMPLEMENTACAO_REPASSECOMREPASSE.md` - plano operacional em Markdown.

- `PROGRESSO_IMPLEMENTACAO.md` - controle F000-F176.

- `DECISOES_ARQUITETURA.md` - decisoes fechadas.

- `RELATORIO_AUDITORIA_INICIAL.md` - inventario inicial.

- `CHECKLIST_HOMOLOGACAO.md` - validacao final.

- `RELATORIO_PRIVACIDADE.md` - auditoria de dados sensiveis.

- `RELATORIO_HOMOLOGACAO_EXECUTADA.md` - testes automatizados executados e pendencias externas.

- `BACKUP_RESTAURACAO.md` - procedimento de restauracao.

- `OPERACAO_JOBS.md` - configuracao do cron diario de manutencao na Vercel.

- `SEGURANCA_CAPTCHA.md` - ativacao opcional do Cloudflare Turnstile.

- `SEGURANCA_IMAGENS.md` - verificacao de contato em imagens com OCR no navegador.

## Backup minimo

Backup desta preparacao:

`C:\Users\jpsecundario\Documents\Codex\2026-05-29\qual-o-caminho-mais-f-cil\work\backups\backup-minimo-20260531-134628`

Commit base preservado:

`df5d4caaf9ad905b639d8eed2a50e47f2627f267`

## Execucao local atual

Como o projeto e estatico, pode ser servido por qualquer servidor local simples:

```powershell
python -m http.server 4177 --bind 127.0.0.1
```

Testes estaticos/smoke:

```powershell
node --check app.js
node --check api/maintenance.js
node --check api/verify-turnstile.js
node --check scripts/backup-project.mjs
node --check scripts/restore-project.mjs
node --check scripts/check-production-readiness.mjs
node tests/static-checks.mjs
node tests/unit-maintenance.mjs
node tests/unit-turnstile.mjs
node tests/backup-restore-dry-run.mjs
node tests/smoke-http.mjs
node tests/e2e-public-flow.mjs
node scripts/check-production-readiness.mjs
```

## Proximos passos

Aplicar `supabase.sql` no Supabase para liberar todos os recursos novos do banco em producao, principalmente moderacao, propostas avancadas, leads, cancelamentos, acordo final e notificacoes.

Configurar na Vercel as variaveis `CRON_SECRET`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` para ativar a rota protegida `/api/maintenance` e o cron diario definido em `vercel.json`.

Para envio automatico de emails da fila interna, configurar tambem `RESEND_API_KEY`, `EMAIL_FROM` e, opcionalmente, `EMAIL_BATCH_LIMIT`.

Para CAPTCHA adaptativo, configurar `turnstileSiteKey` em `config.js` e `TURNSTILE_SECRET_KEY` na Vercel.
