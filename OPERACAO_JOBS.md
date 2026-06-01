# Operacao de jobs agendados

## Objetivo

O projeto possui uma rotina server-side em `api/maintenance.js` para executar `public.run_scheduled_maintenance()` no Supabase.

Essa rotina:

- expira propostas vencidas;
- expira anuncios vencidos;
- marca emails sem destino como ignorados na fila interna;
- envia emails pendentes da fila quando houver provedor configurado.

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

## Variaveis opcionais para envio de email

O envio automatico usa a API HTTP do Resend. Configure apenas na Vercel:

- `RESEND_API_KEY`: chave do Resend.
- `EMAIL_FROM`: remetente validado no Resend, por exemplo `repassecomrepasse <avisos@seudominio.com>`.
- `EMAIL_BATCH_LIMIT`: quantidade maxima por execucao, padrao `10`, maximo `50`.

Se essas variaveis nao existirem, a manutencao continua expirando propostas/anuncios e informa `email_delivery.enabled = false`.

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
  },
  "email_delivery": {
    "enabled": false,
    "reason": "missing_email_provider_env"
  }
}
```

## Cuidados

- Nao coloque `SUPABASE_SERVICE_ROLE_KEY` em `config.js`.
- Nao coloque `RESEND_API_KEY` em `config.js`.
- A rota deve retornar `401` sem `CRON_SECRET`.
- Se o Supabase ainda nao recebeu a versao nova de `supabase.sql`, a rotina pode falhar por ausencia da RPC.
