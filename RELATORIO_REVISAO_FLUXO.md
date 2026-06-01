# Relatorio de revisao geral do fluxo

Data: 2026-06-01

## Escopo

Revisao do fluxo implementado contra o Plano Mestre do repassecomrepasse, com foco nas transicoes reais de proposta, acordo inicial, cancelamento, acordo final e protecao de imoveis em negociacao.

## Correcoes aplicadas

- Imoveis com status `traded` nao podem mais ser editados, inativados, renovados ou reabertos manualmente pelo dono.
- A politica RLS `items own update` passou a bloquear alteracao direta de imoveis em acordo.
- O RPC legado `mark_exchange_failed` deixou de ser executavel por usuarios `authenticated`; participantes devem usar o fluxo rastreavel de cancelamento.
- Propostas do tipo `item` agora exigem diferenca em dinheiro igual a zero; propostas com diferenca passam a ser `mixed`.
- Contrapropostas recalculam o tipo da proposta quando a diferenca em dinheiro muda.
- Pedido de acordo final fica bloqueado quando existe cancelamento pendente.
- Aceite de acordo final fica bloqueado se existir cancelamento pendente.
- Cancelamento simples fica bloqueado depois que o acordo final foi aceito ou formalizado.
- Cancelamento aprovado cancela termos finais pendentes antes de reabrir os imoveis.

## Banco de producao

O patch SQL foi aplicado no Supabase pelo SQL Editor e retornou `Success. No rows returned`.

Diagnostico de producao confirmado:

- `mark_exchange_failed` para `authenticated`: `false`.
- `mark_exchange_failed` para `service_role`: `true`.
- RLS de update de imoveis em acordo: ativa.
- Constraint `exchange_offer_type_check`: contem `cash_difference = (0)::numeric` para proposta `item`.
- Funcao `counter_exchange_proposal`: contem `v_next_proposal_type`.
- Funcao `request_agreement_cancellation`: contem bloqueio depois do acordo final aceito/formalizado.

## Validacoes executadas

- `node --check app.js`
- `node --check tests/e2e-authenticated-backend.mjs`
- `node tests/static-checks.mjs`
- `node tests/unit-maintenance.mjs`
- `node tests/unit-turnstile.mjs`
- `node tests/backup-restore-dry-run.mjs`
- `node tests/e2e-public-flow.mjs` em `http://127.0.0.1:4177`
- `node scripts/check-deployment-config.mjs` em producao
- Verificacao visual basica no navegador local, sem overflow horizontal e com home/forms presentes.

## Ponto pendente

O E2E autenticado atualizado nao foi executado nesta revisao porque as variaveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nao estavam carregadas no terminal atual. O teste foi atualizado para validar os novos bloqueios assim que essas variaveis estiverem disponiveis.
