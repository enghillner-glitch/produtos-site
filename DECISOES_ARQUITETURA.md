# Decisões de Arquitetura

Data: 2026-06-29

## Decisões fechadas

- MVP web-first.
- SPA estática evolutiva para publicação simples em Vercel.
- Supabase será usado como banco e camada operacional na próxima etapa.
- Persistência local foi usada apenas para validar UX e regras antes da migração.
- Android Auto fica desabilitado.
- Google Business Profile real fica para fase posterior; MVP usa verificação manual/simulada.
- Alertas enviados vão para análise, não para publicação direta.
- Links externos exigem HTTPS e validação.

## Bloqueios intencionais

- Sem background location.
- Sem geofencing persistente.
- Sem Android Auto real.
- Sem e-mail automático.
- Sem ranking pago.
- Sem checkout, carrinho ou compra.
- Sem texto livre do lojista como mensagem final publicada.
