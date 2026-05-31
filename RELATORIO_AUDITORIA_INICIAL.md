# RELATORIO_AUDITORIA_INICIAL

## Escopo

Auditoria inicial da base atual antes da transformacao em repassecomrepasse.

## Stack atual

- Frontend estatico: HTML, CSS e JavaScript.

- Backend/Banco: Supabase.

- Deploy: Vercel.

- Repositorio: Git/GitHub.

## Arquivos existentes na raiz

- AGENTS.md

- CHECKLIST_HOMOLOGACAO.md

- DECISOES_ARQUITETURA.md

- PLANO_IMPLEMENTACAO_REPASSECOMREPASSE.md

- PROGRESSO_IMPLEMENTACAO.md

- README.md

- RELATORIO_AUDITORIA_INICIAL.md

- app.js

- cadastro.html

- config.js

- index.html

- styles.css

- supabase.sql

## Schema Supabase atual

- Arquivo local identificado: `supabase.sql`.

- O schema atual pertence ao MVP anterior de cadastro/troca de objetos e deve ser substituido por migrations especificas do repassecomrepasse.

- Nao houve alteracao funcional no banco nesta etapa.

## Deploy atual

- O projeto atual pode permanecer publicado enquanto a transformacao funcional nao comeca.

- Nenhuma alteracao de Vercel foi feita nesta preparacao documental.

## Riscos de reaproveitamento

- Nomes, textos e entidades ainda ligados ao produto anterior.

- Modelo de dados anterior nao atende negociacao imobiliaria, imobiliaria ativa, acordos e dados sensiveis.

- Regras criticas precisam migrar para backend/RLS/RPC, nao apenas interface.

- Configuracoes locais podem conter chaves publicas e nao devem ser copiadas para documentacao.

## Recomendacao

Substituir por fases, com backup minimo preservado e controle de progresso por F000-F176. Comecar pela fundacao, identidade, auditoria, perfis, permissoes e schema seguro antes de telas transacionais.

