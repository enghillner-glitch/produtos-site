# Oportunidades Próximas

Plataforma web-first para conectar estabelecimentos verificados a pessoas com interesses declarados, exibindo Oportunidades Próximas sem propaganda indiscriminada.

## Estado atual

- MVP estático/SPA em `index.html`, `styles.css`, `app.js`.
- Persistência local via `localStorage` para validação rápida do fluxo.
- Supabase preparado em `supabase.sql`.
- Google Business Profile em modo manual/simulado.
- Android Auto desabilitado no MVP.

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
- Wizard completo: Local, Categorias, Benefício, Validade, Canais, Link opcional, Preview, Revisão.
- Tela de Alerta criado/enviado para análise.
- Moderação manual.
- Vitrine web do consumidor com matching por categorias.
- Salvar, ocultar e denunciar oportunidade.

## Regras importantes

- Android Auto fica desabilitado e não conta como canal ativo.
- Alertas enviados ficam `in_review`.
- Alertas só aparecem na vitrine se estiverem ativos, aprovados, vigentes, com local elegível e categoria compatível.
- Links exigem HTTPS e não podem usar encurtadores conhecidos.
- Textos publicados são gerados por template a partir de dados estruturados.
