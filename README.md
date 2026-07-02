# Oportunidades Próximas

Plataforma web-first para conectar estabelecimentos verificados a pessoas com interesses declarados, exibindo Oportunidades Próximas sem propaganda indiscriminada.

## Estado atual

- MVP estático/SPA em `index.html`, `styles.css`, `app.js`.
- Persistência local via `localStorage` para validação rápida do fluxo.
- Supabase preparado em `supabase.sql`.
- Google Business Profile em modo manual/simulado.
- Android Auto desabilitado no MVP.

## OAuth Google e Business Profile

- O login Google real ainda depende de credenciais criadas no Google Cloud Console.
- Campos preparados em `config.js`: `googleOAuthClientId` e `googleOAuthRedirectUri`.
- Redirect URI previsto para producao: `https://produtos-site.vercel.app/auth/callback`.
- Em desenvolvimento local, cadastrar tambem `http://127.0.0.1:4189/auth/callback`.
- Client ID configurado para o projeto Google Cloud `minhasmvs`.
- O botao "Entrar com Google" inicia OAuth real quando `googleOAuthClientId` estiver preenchido.
- O callback recebe o `code` OAuth e deixa o usuario no fluxo de Conexao Google Business Profile.
- O MVP atual simula a autenticacao e a deteccao de Perfis da Empresa para validar o fluxo antes da aprovacao/acesso real a Google Business Profile API.
- Para producao real, o Client Secret e os refresh tokens devem ficar em backend/serverless, nunca no JavaScript publico.

## Rodar localmente

```powershell
python -m http.server 4188 --bind 127.0.0.1
```

Abrir:

```text
http://127.0.0.1:4188/
```

## Fluxos implementados

- Login/Landing simulado.
- Dashboard do lojista.
- Estabelecimentos verificados manualmente.
- Lista de Alertas de Oportunidade.
- Wizard completo: Local, Benefício, Classificação, Validade, Canais, Link opcional e Revisão com preview e aprovação Gemini.
- Tela de Alerta criado/enviado para análise.
- Histórico administrativo de alterações, exclusões e alertas expirados.

## Regras importantes

- Android Auto fica desabilitado e não conta como canal ativo.
- Alertas salvos com texto aprovado pela revisão Gemini ficam `active`.
- Alertas só aparecem na vitrine se estiverem ativos, aprovados, vigentes, com local elegível e categoria compatível.
- Links exigem HTTPS e não podem usar encurtadores conhecidos.
- Textos publicados são gerados por template a partir de dados estruturados.
