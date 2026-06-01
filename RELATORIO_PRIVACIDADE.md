# Relatório de privacidade

## Resultado

A implementação atual separa dados públicos e restritos. A vitrine pública exibe apenas informações necessárias para descoberta do imóvel, como cidade, bairro, categoria, condição e dados financeiros do repasse.

## Dados protegidos

- CPF/CNPJ ficam em `profile_private_data`.
- WhatsApp fica em `profile_contacts`.
- Endereço completo do imóvel fica em `item_private_locations`.
- Observações internas ficam em `negotiation_leads`.
- Consentimentos ficam versionados em `consent_records`.

## Controles aplicados

- RLS habilitado nas tabelas sensíveis.
- Contato liberado somente em propostas aceitas.
- Moderação bloqueia textos públicos com telefone, email ou link.
- Painéis de lead, auditoria e denúncias são restritos a perfis administrativos.
- Teste estático verifica ausência de termos de venda direta no HTML principal.

## Pendências

- CAPTCHA adaptativo externo.
- Rotina real de exportação/restauração com dados Supabase.
- Auditoria de imagens para detectar contato embutido em foto.
