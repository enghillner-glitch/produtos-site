# DECISOES_ARQUITETURA

## 2026-05-31 - Preparacao do repassecomrepasse

| Decisao | Registro |

|---|---|

| CPF obrigatorio | Cadastro de pessoa fisica exigira CPF no MVP. |

| CNPJ obrigatorio | Cadastro de pessoa juridica exigira CNPJ no MVP. |

| Dados sensiveis restritos | CPF, CNPJ e dados privados nao devem ser publicos nem versionados. Devem ter acesso restrito e protecao reforcada. |

| Uma imobiliaria ativa | A primeira versao opera com uma imobiliaria ativa responsavel pela intermediacao. |

| Backup minimo | Antes da substituicao funcional, preservar codigo, schema, configuracoes, documentacao e commit base. |

| Transformacao rapida | Reaproveitar o projeto existente apenas como base de transicao, substituindo por fases. |

| DOCX vivo | O DOCX mestre e a linha mestra revisavel ao longo do processo. |

## Evidencias

- Commit base antes desta preparacao: `df5d4caaf9ad905b639d8eed2a50e47f2627f267`.

- Backup minimo: `C:\Users\jpsecundario\Documents\Codex\2026-05-29\qual-o-caminho-mais-f-cil\work\backups\backup-minimo-20260531-134628`.

- DOCX mestre: `C:\Users\jpsecundario\Desktop\Plano_Mestre_Repassecomrepasse_CODEX_REVISADO_CODEX.docx`.


## 2026-05-31 - Fundacao inicial do produto

| Decisao | Registro |
|---|---|
| Dados sensiveis fora de profiles | CPF/CNPJ ficam em `profile_private_data`, nao em `profiles`, porque `profiles` tem leitura publica para dados basicos. |
| Auditoria reutilizavel | Criada base `audit_events` para registrar acoes relevantes sem expor dados privados. |
| Nomes tecnicos legados | Tabelas `items` e `exchange_proposals` permanecem temporariamente para evitar quebra ampla antes da migracao funcional completa. A interface passa a usar linguagem de imoveis/repasses. |
| Aplicacao incremental | F010-F013 foram aplicadas como fundacao; F014 permanece em andamento ate formularios e regras obrigatorias de CPF/CNPJ serem implementados. |

## 2026-05-31 - Migra??o Supabase aplicada

| Decisao | Registro |
|---|---|
| Aplicacao em blocos | O SQL completo foi aplicado em blocos menores no Supabase para evitar falha operacional do editor com alerta de RLS. |
| Validacao remota | Consulta confirmou `profile_private_data`, `audit_events`, `real_estate_agencies`, coluna `profiles.user_type` e politica `profile private own read`. |
| Publicacao liberada | Com a base remota validada, o commit local da fundacao pode ser enviado para GitHub/Vercel. |

## 2026-05-31 - Endereco e localizacao

| Decisao | Registro |
|---|---|
| Estado inicial PB | A primeira versao fica restrita a Paraiba, com `items.state` limitado a `PB`. |
| Municipios oficiais | `location-data.js` foi gerado com 223 municipios da Paraiba a partir da API do IBGE. |
| Endereco publico | Vitrine e detalhe exibem municipio e bairro, sem logradouro ou numero. |
| Endereco restrito | Rua, numero e complemento ficam em `item_private_locations`, com leitura e escrita restritas ao dono. |

## 2026-05-31 - Imobiliaria inicial

| Decisao | Registro |
|---|---|
| Uma imobiliaria ativa | A interface passa a ler uma imobiliaria ativa em `real_estate_agencies`, com fallback institucional seguro. |
| Seed institucional | O SQL inclui um registro inicial sem dados sensiveis reais, para manter a pagina institucional consistente ate cadastro administrativo. |
| Pagina institucional | Criada a visao `#agency`, explicando papel da imobiliaria e limites da plataforma. |

