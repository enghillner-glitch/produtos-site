# Relatorio de privacidade

## Resultado

A implementacao atual separa dados publicos e restritos. A vitrine publica exibe apenas informacoes necessarias para descoberta do imovel, como cidade, bairro, categoria, condicao e dados financeiros do repasse.

## Dados protegidos

- CPF/CNPJ ficam em `profile_private_data`.
- WhatsApp fica em `profile_contacts`.
- Endereco completo do imovel fica em `item_private_locations`.
- Observacoes internas ficam em `negotiation_leads`.
- Consentimentos ficam versionados em `consent_records`.

## Controles aplicados

- RLS habilitado nas tabelas sensiveis.
- Execucao de RPCs sensiveis explicitamente revogada do papel anonimo.
- Contato liberado somente em propostas aceitas.
- Moderacao bloqueia textos publicos com telefone, email ou link.
- OCR no navegador bloqueia imagens que exponham telefone, email ou link.
- CAPTCHA adaptativo pode ser ativado com Cloudflare Turnstile.
- Paineis de lead, auditoria e denuncias sao restritos a perfis administrativos.
- Teste estatico verifica ausencia de termos de venda direta no HTML principal.

## Pendencias externas

- Ativar `turnstileSiteKey` e `TURNSTILE_SECRET_KEY` em producao, se CAPTCHA for usado.
- Executar backup/restauracao real com `SUPABASE_DB_URL` em ambiente com dados reais.
- Reexecutar homologacao autenticada apos aplicar `supabase.sql` no Supabase.
