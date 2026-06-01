# CHECKLIST_HOMOLOGACAO

## Preparacao

- [x] Backup minimo criado e restauracao documentada.

- [x] DOCX mestre revisado e renderizado sem quebra visual.

- [x] Arquivos permanentes criados na raiz do repositorio.

- [x] Nenhum segredo escrito em Markdown.

## Seguranca e dados sensiveis

- [x] CPF obrigatorio para pessoa fisica.

- [x] CNPJ obrigatorio para pessoa juridica.

- [x] CPF/CNPJ nao aparecem em telas publicas.

- [x] Contatos e dados privados ficam restritos.

- [x] Logs nao expoem senha, token, CPF, CNPJ ou dados privados.

## Produto

- [x] Home usa identidade repassecomrepasse.

- [x] Aviso institucional aparece no rodape.

- [x] Fluxo de imovel respeita endereco publico e restrito.

- [x] Propostas seguem Acordo Inicial e Acordo Final.

- [x] Imobiliaria ativa aparece como intermediadora.

## Tecnico

- [x] Supabase RLS revisado.

- [x] RPCs ou transacoes para operacoes criticas.

- [x] Build/lint/testes executados quando aplicavel.

- [x] Responsividade validada por CSS responsivo, smoke HTTP e E2E publico local/producao.

## Execucao

- [x] Relatorio de homologacao executada criado em `RELATORIO_HOMOLOGACAO_EXECUTADA.md`.

- [x] Smoke publico em producao executado.

- [x] E2E publico em producao executado.

- [ ] Homologacao autenticada em producao com dados reais apos aplicar `supabase.sql`.
