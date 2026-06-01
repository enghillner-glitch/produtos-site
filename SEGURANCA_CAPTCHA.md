# CAPTCHA adaptativo

## Estado implementado

O app possui tres camadas antispam:

- politicas RLS no Supabase para limitar propostas duplicadas e volume em 24 horas;
- campo-armadilha, tempo minimo de formulario e cooldown local nos formularios de imovel e proposta;
- integracao opcional com Cloudflare Turnstile, com token validado no servidor em `/api/verify-turnstile`.

## Como ativar Cloudflare Turnstile

1. Criar um widget no painel do Cloudflare Turnstile.
2. Copiar a site key publica para `config.js`:

```js
window.APP_CONFIG = {
  // ...
  turnstileSiteKey: "0x4..."
};
```

3. Configurar na Vercel a variavel server-side:

- `TURNSTILE_SECRET_KEY`

4. Fazer novo deploy.

## Importante

- A secret key nunca deve ir para `config.js`.
- A validacao usa o endpoint oficial `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- Mesmo com Turnstile ativo, as politicas RLS continuam sendo a protecao principal contra escrita indevida no banco.
