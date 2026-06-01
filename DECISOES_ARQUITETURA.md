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

## 2026-05-31 - Migracao Supabase de fundacao

| Decisao | Registro |
|---|---|
| Aplicacao em blocos | A fundacao inicial do SQL foi aplicada em blocos menores no Supabase para evitar falha operacional do editor com alerta de RLS. |
| Validacao remota inicial | Consulta confirmou objetos de fundacao, como `profile_private_data`, `audit_events`, `real_estate_agencies`, coluna `profiles.user_type` e politica `profile private own read`. |
| Migracao avancada pendente | O diagnostico de 2026-06-01 apontou que tabelas avancadas de leads, cancelamentos, acordo final, notificacoes, fila de email, consentimentos e favoritos ainda precisam receber o `supabase.sql` completo em producao. |

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

## 2026-05-31 - Usuarios e dados restritos

| Decisao | Registro |
|---|---|
| CPF/CNPJ obrigatorio no perfil | O perfil completo passa a exigir tipo de pessoa, CPF ou CNPJ, WhatsApp, estado e cidade antes de cadastrar imoveis ou propor repasses. |
| Documento fora da vitrine | CPF/CNPJ nao entra em `profiles` nem aparece publicamente; a interface so mostra aviso de documento ja cadastrado para o proprio usuario. |
| Protecao inicial do documento | O MVP grava hash SHA-256 tipado (`cpf:`/`cnpj:`) e versao mascarada em `profile_private_data`, protegida por RLS. Criptografia forte com segredo de servidor fica reservada para a etapa backend/edge function. |
| Unicidade operacional | O schema passa a incluir indice unico por `document_type` e `document_hash` para reduzir cadastros duplicados sem expor o numero completo. |
| Recuperacao de senha | A recuperacao usa o fluxo nativo do Supabase Auth por email, sem senha temporaria no app. |
| Desativacao logica | Conta desativada recebe `profiles.account_status = inactive`; imoveis nao trocados do usuario ficam inativos para sair da vitrine. |

## 2026-05-31 - Revisao de fluxo e cadastro de imoveis

| Decisao | Registro |
|---|---|
| Recuperacao completa | O link de recuperacao agora abre modo de nova senha dentro do app, concluindo o fluxo com `auth.updateUser`. |
| Conta ativa no banco | Politicas de `items` e `exchange_proposals` passam a exigir `account_status = active`, reduzindo bypass direto via API. |
| Edicao sem perda de endereco | Endereco restrito do proprio usuario e carregado no formulario de edicao para evitar obrigar redigitacao. |
| Dados financeiros sem venda direta | O cadastro registra repasse pretendido, saldo devedor, parcela e parcelas restantes como informacoes de analise, nao como checkout ou venda direta. |
| Legitimidade obrigatoria | O anunciante precisa confirmar legitimidade para iniciar tratativas antes de salvar o imovel. |

## 2026-06-01 - Moderacao de anuncios

| Decisao | Registro |
|---|---|
| Vitrine so com aprovados | Quando a migracao de moderacao estiver aplicada, a vitrine publica lista apenas `items.status = available` e `items.moderation_status = approved`. |
| Compatibilidade de schema | O front detecta ausencia temporaria da coluna `moderation_status` e usa fallback para nao quebrar a vitrine antes da migracao remota. |
| Fila interna simples | Perfis `real_estate_admin` e `admin` veem uma fila de anuncios pendentes para aprovar ou pedir ajustes. |
| Anti-escalacao de papel | Trigger em `profiles` impede usuario comum de elevar o proprio `role` ou virar `real_estate_admin` por chamada direta a API. |
| Edicao volta para revisao | Trigger em `items` preserva moderacao em pausas simples, mas devolve alteracoes de conteudo para `pending`. |

## 2026-06-01 - Vitrine publica

| Decisao | Registro |
|---|---|
| Favorito local no MVP | Favoritos ficam em `localStorage` para entregar utilidade imediata sem criar tabela antes da fase de contas/alertas. |
| Link compartilhavel | Anuncios usam hash `#item-<id>` para abrir detalhe quando o imovel estiver aprovado e carregado na vitrine. |
| SEO sem dados privados | Metatags sao institucionais e nao incluem endereco completo, contato, documento ou dados privados. |
| Carregamento incremental | A vitrine mostra 12 anuncios por vez para preservar desempenho conforme a base crescer. |

## 2026-06-01 - Propostas e Acordo Inicial

| Decisao | Registro |
|---|---|
| Proposta flexivel | Propostas podem ser somente em dinheiro, com um imovel ou com ate dois imoveis, sem transformar a plataforma em venda direta. |
| Respondente explicito | Cada proposta grava `created_by` e `responder_id`, permitindo contrapropostas sem inverter a propriedade do anuncio. |
| Contraproposta versionada | Contraproposta marca a versao anterior como `countered` e cria nova linha pendente com `version + 1`. |
| Reserva leve | Contrapartidas ficam reservadas por `reserved_until` para evitar uso simultaneo em propostas pendentes do mesmo usuario. |
| Expiracao incremental | Propostas vencidas sao expiradas por RPC chamada em carregamentos e acoes; job agendado fica para a fase de notificacoes/jobs. |
| Snapshot de aceite | O aceite grava `accepted_snapshot` com os termos essenciais para auditoria e encaminhamento. |

## 2026-06-01 - Leads administrativos

| Decisao | Registro |
|---|---|
| Lead nasce do aceite | Um lead interno e criado automaticamente quando uma proposta vira acordo inicial. |
| Painel restrito | Leads completos, observacoes e atribuicao ficam visiveis apenas para `real_estate_admin` e `admin`. |
| Acompanhamento publico minimo | Participantes veem somente etapa e datas resumidas por RPC, sem observacoes internas. |
| Email adiado | O MVP copia um resumo seguro do lead; envio automatico fica para a fase de notificacoes. |

## 2026-06-01 - Cancelamento de acordo

| Decisao | Registro |
|---|---|
| Cancelamento rastreavel | Depois do acordo inicial, o participante solicita cancelamento com motivo em vez de reabrir imoveis diretamente. |
| Resolucao administrativa | A administracao aprova para liberar os imoveis ou rejeita para devolver o lead a negociacao. |
| Compatibilidade temporaria | O RPC antigo `mark_exchange_failed` permanece como fallback enquanto ambientes sem a nova migracao existirem. |

## 2026-06-01 - Acordo final

| Decisao | Registro |
|---|---|
| Termos versionados | Cada pedido de acordo final cria nova versao em `final_agreement_terms`, cancelando versoes pendentes anteriores. |
| Aceite bilateral | Interessado e anunciante aceitam separadamente; o status passa a `accepted` somente com os dois aceites. |
| Fechamento administrativo | Somente administracao formaliza a conclusao e fecha o lead. |

## 2026-06-01 - Notificacoes e jobs

| Decisao | Registro |
|---|---|
| Notificacao interna primeiro | O MVP usa notificacoes internas no painel como canal confiavel antes de automacao externa de email. |
| Fila de email preparada | Eventos importantes enfileiram mensagens em `email_queue`, mas envio real depende de integracao futura. |
| Job como RPC | Manutencao agendada fica encapsulada em `run_scheduled_maintenance` para acionar por cron externo depois. |

## 2026-06-01 - Seguranca e privacidade

| Decisao | Registro |
|---|---|
| Consentimento versionado | Perfil passa a registrar aceite em `consent_records` com versao fixa do MVP. |
| Dados sensiveis separados | CPF/CNPJ, contatos e endereco completo seguem fora dos dados publicos dos anuncios. |
| Backup incremental | Procedimento de restauracao fica documentado, com teste real de dump reservado para ambiente com dados reais. |

## 2026-06-01 - Administracao

| Decisao | Registro |
|---|---|
| Painel unico | Configuracoes, auditoria e denuncias aparecem no painel do usuario apenas para perfis administrativos. |
| Denuncias revisaveis | Admin pode marcar denuncia como revisada sem remocao automatica de conteudo no MVP. |
| Auditoria visivel | Eventos de auditoria recentes ficam consultaveis por administradores. |

## 2026-06-01 - Testes e descontinuacao

| Decisao | Registro |
|---|---|
| Testes sem bundler | Como o MVP e estatico, testes iniciais rodam por Node direto em `tests/`. |
| E2E incremental | Smoke HTTP cobre disponibilidade; E2E autenticado fica condicionado a migracao Supabase e massa de usuarios. |
| Projeto anterior encerrado | README e interface principal passam a tratar o produto como repassecomrepasse. |

## 2026-06-01 - Endurecimento Supabase

| Decisao | Registro |
|---|---|
| RPCs sem acesso anonimo | `supabase.sql` revoga `execute` das funcoes do projeto para o papel publico e concede apenas as RPCs necessarias para `authenticated` ou `service_role`, sem afetar funcoes de extensoes. |
| Manutencao somente server-side | `run_scheduled_maintenance` fica executavel apenas por `service_role`, chamada pela rota protegida `/api/maintenance`. |
