# Migracao Supabase

## Objetivo

Aplicar o `supabase.sql` completo no projeto Supabase de producao para liberar os fluxos autenticados avancados: leads, cancelamentos, acordo final, notificacoes, fila de email, consentimentos e favoritos.

## Gerar blocos para o SQL Editor

O arquivo `supabase.sql` pode ser grande para colar de uma vez no painel. Gere blocos menores:

```powershell
node scripts/split-supabase-sql.mjs
```

O comando cria a pasta `work-supabase-sql-chunks/` com:

- arquivos `01-supabase.sql`, `02-supabase.sql`, etc.;
- `manifest.json` com quantidade de comandos por bloco.

Execute os arquivos em ordem no SQL Editor do Supabase. O script preserva blocos `$$...$$`, portanto funcoes PL/pgSQL nao sao cortadas no meio.

## Conferir depois da aplicacao

Depois de executar todos os blocos:

```powershell
node scripts/check-deployment-config.mjs
```

Resultado esperado:

- tabelas avancadas com status `200`, `401` ou `403`, nunca `404`;
- `RPC anonima bloqueada` como `ok`;
- `CRON_SECRET Vercel` como `ok` depois de configurar a variavel na Vercel;
- `deployment-config ok` ao final.

Para transformar avisos opcionais em falha:

```powershell
$env:STRICT_CONFIG='1'; node scripts/check-deployment-config.mjs
```

## Cuidados

- Nao cole chaves secretas no SQL Editor.
- Nao use `SUPABASE_SERVICE_ROLE_KEY` no browser.
- Se um bloco falhar, pare e revise a mensagem antes de executar o seguinte.
- Rode `scripts/check-deployment-config.mjs` antes da homologacao autenticada.
