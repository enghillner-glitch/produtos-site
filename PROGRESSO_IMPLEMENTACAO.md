# PROGRESSO_IMPLEMENTACAO

Atualizado em: 2026-05-31

| ID | Funcionalidade | Fase | Situacao | Data | Testes | Observacoes |
|---|---|---|---|---|---|---|
| F000 | Criar copia temporaria de seguranca | FASE 0 - Protecao e auditoria | concluida | 2026-05-31 |  | Backup minimo criado fora do repositorio. |
| F001 | Executar projeto atual sem alteracoes | FASE 0 - Protecao e auditoria | concluida | 2026-05-31 |  | Projeto atual preservado e publicado durante a transicao. |
| F002 | Auditar arquitetura atual | FASE 0 - Protecao e auditoria | concluida | 2026-05-31 |  | Auditoria inicial registrada em RELATORIO_AUDITORIA_INICIAL.md. |
| F003 | Criar AGENTS.md | FASE 0 - Protecao e auditoria | concluida | 2026-05-31 |  | AGENTS.md criado. |
| F004 | Criar PROGRESSO_IMPLEMENTACAO.md | FASE 0 - Protecao e auditoria | concluida | 2026-05-31 |  | PROGRESSO_IMPLEMENTACAO.md criado com F000-F176. |
| F010 | Aplicar identidade repassecomrepasse | FASE 1 - Fundacao | concluida | 2026-05-31 |  | Identidade textual inicial aplicada em HTML e JS. |
| F011 | Inserir aviso institucional no rodape | FASE 1 - Fundacao | concluida | 2026-05-31 |  | Aviso institucional inserido na experiencia do painel e configurado no JS. |
| F012 | Centralizar configuracoes | FASE 1 - Fundacao | concluida | 2026-05-31 |  | Constantes centrais do produto adicionadas ao app.js. |
| F013 | Criar auditoria reutilizavel | FASE 1 - Fundacao | concluida | 2026-05-31 |  | Tabela audit_events adicionada ao supabase.sql. |
| F014 | Criar perfis e permissoes | FASE 1 - Fundacao | concluida | 2026-05-31 |  | Schema remoto recebeu papeis, dados privados e politicas base; UI de CPF/CNPJ segue em etapa propria. |
| F020 | Criar catalogo de estados | FASE 2 - Endereco e localizacao | concluida | 2026-05-31 |  | Catalogo de estados iniciado com PB na interface e no schema. |
| F021 | Criar catalogo dos municipios da Paraiba | FASE 2 - Endereco e localizacao | concluida | 2026-05-31 |  | Catalogo de 223 municipios da Paraiba gerado a partir da API do IBGE em location-data.js. |
| F022 | Criar combos Estado e Municipio | FASE 2 - Endereco e localizacao | concluida | 2026-05-31 |  | Combos Estado/Municipio aplicados na vitrine e cadastro de imovel. |
| F023 | Separar endereco publico e restrito | FASE 2 - Endereco e localizacao | concluida | 2026-05-31 |  | Endereco publico permanece cidade/bairro; endereco completo vai para item_private_locations com RLS de dono. |
| F030 | Criar entidade da imobiliaria | FASE 3 - Imobiliaria | concluida | 2026-05-31 |  | Entidade real_estate_agencies ja existe no schema; seed inicial ativo adicionado. |
| F031 | Criar pagina institucional da imobiliaria | FASE 3 - Imobiliaria | concluida | 2026-05-31 |  | Pagina/visao institucional da imobiliaria criada no SPA com leitura da imobiliaria ativa. |
| F040 | Cadastrar pessoa fisica | FASE 4 - Usuarios e autenticacao | concluida | 2026-05-31 | node --check app.js | Perfil exige tipo Pessoa fisica e CPF restrito antes de cadastrar imoveis ou propor repasse. |
| F041 | Cadastrar pessoa juridica | FASE 4 - Usuarios e autenticacao | concluida | 2026-05-31 | node --check app.js | Perfil aceita Pessoa juridica com CNPJ restrito. |
| F042 | Confirmar e-mail | FASE 4 - Usuarios e autenticacao | parcial | 2026-05-31 | node --check app.js | Fluxo usa Supabase Auth e avisa o usuario para confirmar e-mail quando configurado no projeto. |
| F043 | Implementar login e logout | FASE 4 - Usuarios e autenticacao | concluida | 2026-05-31 | node --check app.js | Login, criacao de conta e logout ja integrados ao Supabase Auth no SPA. |
| F044 | Recuperar senha | FASE 4 - Usuarios e autenticacao | concluida | 2026-05-31 | node --check app.js; validacao Supabase | Botao Esqueci minha senha envia email de recuperacao via Supabase Auth. |
| F045 | Criar perfil do usuario | FASE 4 - Usuarios e autenticacao | concluida | 2026-05-31 | node --check app.js | Perfil inclui nome/razao social, tipo, CPF/CNPJ restrito, WhatsApp, estado e cidade. |
| F046 | Desativar conta com exclusao logica | FASE 4 - Usuarios e autenticacao | concluida | 2026-05-31 | node --check app.js; validacao Supabase | Perfil recebe account_status; desativacao inativa a conta e os imoveis nao trocados. |
| F050 | Criar catalogos de imoveis | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | node --check app.js | Catalogos iniciais de tipo e situacao de imovel centralizados no app e refletidos no schema. |
| F051 | Criar entidade imovel | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | node --check app.js; Supabase SQL | Entidade items ampliada com endereco publico, endereco restrito, dados financeiros e declaracao. |
| F052 | Criar formulario dinamico de imovel | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | Browser local; node --check app.js | Formulario recebeu combos, endereco restrito, dados financeiros e validacoes. |
| F053 | Cadastrar dados financeiros de repasse | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | Supabase SQL; node --check app.js | Campos de repasse pretendido, saldo devedor, parcela e parcelas restantes adicionados. |
| F054 | Cadastrar imovel quitado | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | node --check app.js | Situacao Quitado esta disponivel no catalogo e no schema. |
| F055 | Registrar declaracao de legitimidade | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | node --check app.js; Supabase SQL | Cadastro exige confirmacao de legitimidade e grava legitimacy_confirmed. |
| F056 | Enviar e tratar fotos | FASE 5 - Cadastro de imoveis | parcial | 2026-05-31 | Browser local; node --check app.js | Upload existente preservado; limite de 5 imagens e tipos JPG/PNG/WebP validados. Falta compressao/redimensionamento. |
| F057 | Controlar estados do anuncio | FASE 5 - Cadastro de imoveis | concluida | 2026-05-31 | node --check app.js | Estados available, traded e inactive ja controlam vitrine, painel e propostas aceitas. |
| F058 | Enviar anuncio para moderacao | FASE 5 - Cadastro de imoveis | nao iniciada |  |  |  |
| F059 | Criar fila de moderacao | FASE 5 - Cadastro de imoveis | nao iniciada |  |  |  |
| F060 | Bloquear contatos em textos e imagens | FASE 5 - Cadastro de imoveis | nao iniciada |  |  |  |
| F061 | Editar anuncio com nova moderacao | FASE 5 - Cadastro de imoveis | nao iniciada |  |  |  |
| F062 | Pausar, expirar e renovar anuncio | FASE 5 - Cadastro de imoveis | nao iniciada |  |  |  |
| F070 | Criar cartao da vitrine | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F071 | Criar pagina detalhada | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F072 | Criar filtros e busca | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F073 | Ordenar e carregar mais | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F074 | Favoritar imovel | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F075 | Compartilhar anuncio | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F076 | Denunciar anuncio | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F077 | Criar SEO seguro | FASE 6 - Vitrine | nao iniciada |  |  |  |
| F080 | Criar entidade proposta | FASE 7 - Propostas | nao iniciada |  |  |  |
| F081 | Proposta somente em dinheiro | FASE 7 - Propostas | nao iniciada |  |  |  |
| F082 | Proposta com um imovel | FASE 7 - Propostas | nao iniciada |  |  |  |
| F083 | Proposta com ate dois imoveis | FASE 7 - Propostas | nao iniciada |  |  |  |
| F084 | Registrar diferenca financeira | FASE 7 - Propostas | nao iniciada |  |  |  |
| F085 | Reservar contrapartida | FASE 7 - Propostas | nao iniciada |  |  |  |
| F086 | Criar caixa de propostas recebidas | FASE 7 - Propostas | nao iniciada |  |  |  |
| F087 | Recusar proposta | FASE 7 - Propostas | nao iniciada |  |  |  |
| F088 | Retirar proposta | FASE 7 - Propostas | nao iniciada |  |  |  |
| F089 | Contrapropor com versionamento | FASE 7 - Propostas | nao iniciada |  |  |  |
| F090 | Expirar proposta automaticamente | FASE 7 - Propostas | nao iniciada |  |  |  |
| F091 | Aplicar limites antispam | FASE 7 - Propostas | nao iniciada |  |  |  |
| F100 | Aceitar proposta atomicamente | FASE 8 - Acordo Inicial | nao iniciada |  |  |  |
| F101 | Confirmar Acordo Inicial | FASE 8 - Acordo Inicial | nao iniciada |  |  |  |
| F102 | Encerrar propostas concorrentes | FASE 8 - Acordo Inicial | nao iniciada |  |  |  |
| F103 | Criar snapshot imutavel do Acordo Inicial | FASE 8 - Acordo Inicial | nao iniciada |  |  |  |
| F110 | Criar lead automaticamente | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F111 | Listar leads no painel | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F112 | Exibir detalhe seguro do lead | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F113 | Enviar e-mail resumido de lead | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F114 | Atribuir responsavel | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F115 | Adicionar observacoes internas | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F116 | Controlar etapas da negociacao | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F117 | Mostrar acompanhamento resumido ao usuario | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F118 | Exportar leads para CSV | FASE 9 - Lead e painel interno | nao iniciada |  |  |  |
| F120 | Solicitar cancelamento apos Acordo Inicial | FASE 10 - Cancelamento e retorno | nao iniciada |  |  |  |
| F121 | Encerrar cancelamento e liberar imoveis | FASE 10 - Cancelamento e retorno | nao iniciada |  |  |  |
| F122 | Retornar para ajustes | FASE 10 - Cancelamento e retorno | nao iniciada |  |  |  |
| F130 | Criar termos finais versionados | FASE 11 - Acordo Final | nao iniciada |  |  |  |
| F131 | Solicitar Acordo Final | FASE 11 - Acordo Final | nao iniciada |  |  |  |
| F132 | Controlar aceite parcial e completo | FASE 11 - Acordo Final | nao iniciada |  |  |  |
| F133 | Formalizar conclusao administrativa | FASE 11 - Acordo Final | nao iniciada |  |  |  |
| F140 | Criar notificacoes internas | FASE 12 - Notificacoes e jobs | nao iniciada |  |  |  |
| F141 | Criar e-mails automaticos | FASE 12 - Notificacoes e jobs | nao iniciada |  |  |  |
| F142 | Criar jobs agendados | FASE 12 - Notificacoes e jobs | nao iniciada |  |  |  |
| F150 | Registrar consentimentos versionados | FASE 13 - Seguranca e privacidade | nao iniciada |  |  |  |
| F151 | Proteger dados privados | FASE 13 - Seguranca e privacidade | nao iniciada |  |  |  |
| F152 | Aplicar rate limit e CAPTCHA adaptativo | FASE 13 - Seguranca e privacidade | nao iniciada |  |  |  |
| F153 | Criar logs seguros | FASE 13 - Seguranca e privacidade | nao iniciada |  |  |  |
| F154 | Criar backup e testar restauracao | FASE 13 - Seguranca e privacidade | nao iniciada |  |  |  |
| F160 | Criar painel de configuracoes | FASE 14 - Administracao | nao iniciada |  |  |  |
| F161 | Criar painel de auditoria | FASE 14 - Administracao | nao iniciada |  |  |  |
| F162 | Criar painel de denuncias | FASE 14 - Administracao | nao iniciada |  |  |  |
| F170 | Criar testes unitarios | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
| F171 | Criar testes de integracao | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
| F172 | Criar testes ponta a ponta | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
| F173 | Auditar privacidade | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
| F174 | Criar homologacao | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
| F175 | Executar homologacao funcional | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
| F176 | Descontinuar projeto anterior | FASE 15 - Testes e descontinuacao | nao iniciada |  |  |  |
