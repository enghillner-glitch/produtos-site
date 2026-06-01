# Operacao de jobs agendados

## Objetivo

O projeto possui uma rotina server-side em `api/maintenance.js` para executar `public.run_scheduled_maintenance()` no Supabase.

Essa rotina:

- expira propostas vencidas;
- expira anuncios vencidos;
- marca emails sem destino como ignorados na fila interna.

## Vercel Cron

O arquivo `vercel.json` agenda a chamada diaria:

```json
{
  "crons": [
    {
      "path": "/api/maintenance",
      "schedule": "0 8 * * *"
    }
  ]
}
```

A agenda usa UTC. Em geral, `0 8 * * *` executa uma vez por dia pela manha no Brasil.

## Variaveis de ambiente obrigatorias na Vercel

Configure no projeto da Vercel, sem gravar valores no repositorio:

- `CRON_SECRET`: texto aleatorio com pelo menos 16 caracteres.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave server-side do Supabase, nunca usada no browser.

Quando `CRON_SECRET` existe, a Vercel envia esse valor no header `Authorization: Bearer ...` para proteger a rota do cron.

## Teste manual

Depois de configurar as variaveis, teste pelo terminal ou por um cliente HTTP:

```powershell
$headers = @{ Authorization = "Bearer <CRON_SECRET>" }
Invoke-RestMethod -Method Get -Uri "https://produtos-site.vercel.app/api/maintenance" -Headers $headers
```

Resposta esperada:

```json
{
  "ok": true,
  "result": {
    "expired_proposals": 0,
    "expired_items": 0,
    "emails_without_destination_marked": 0
  }
}
```

## Cuidados

- Nao coloque `SUPABASE_SERVICE_ROLE_KEY` em `config.js`.
- A rota deve retornar `401` sem `CRON_SECRET`.
- Se o Supabase ainda nao recebeu a versao nova de `supabase.sql`, a rotina pode falhar por ausencia da RPC.
