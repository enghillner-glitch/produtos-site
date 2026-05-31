# AGENTS.md - repassecomrepasse

## Objetivo do produto

Transformar a base atual do trocacomtroca em **repassecomrepasse**, uma plataforma de aproximacao entre usuarios com interesses convergentes na negociacao de imoveis. O site nao realiza venda direta, analise documental, aprovacao de credito, transferencia de propriedade ou tratativas com agentes financiadores.

## Fonte principal

- O DOCX mestre em `C:\Users\jpsecundario\Desktop\Plano_Mestre_Repassecomrepasse_CODEX_REVISADO_CODEX.docx` prevalece sobre notas anteriores.

- Este repositorio contem arquivos permanentes de acompanhamento derivados desse plano.

- Em caso de conflito, registrar a decisao em `DECISOES_ARQUITETURA.md` antes de implementar.

## Regras permanentes

- Fazer backup minimo antes de mudancas funcionais relevantes.

- Nao gravar segredos, tokens, chaves privadas, CPF, CNPJ ou dados sensiveis em arquivos versionados.

- Validar regras criticas no backend e no Supabase, nao apenas na interface.

- Atualizar `PROGRESSO_IMPLEMENTACAO.md` ao concluir, bloquear ou revisar uma tarefa.

- Criar migrations quando houver alteracao de banco de dados.

- Manter linguagem institucional: repasse, imovel, proposta, acordo inicial, acordo final.

- Evitar termos de ecommerce: carrinho, checkout, comprar, produto a venda.

## Decisoes fechadas em 2026-05-31

- CPF/CNPJ obrigatorio no MVP conforme tipo de cadastro.

- CPF/CNPJ deve ter armazenamento restrito e protegido.

- Operacao inicial com uma imobiliaria ativa.

- Substituicao rapida do projeto existente, preservando backup minimo.

- Sequencia de implementacao segue o DOCX mestre.

