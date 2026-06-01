# Backup e restauração

## Escopo

Este projeto mantém o código no GitHub/Vercel e o banco no Supabase. O backup mínimo antes de mudanças funcionais deve preservar:

- commit atual do Git;
- `supabase.sql`;
- `config.js` local;
- documentos de plano e progresso;
- exportações manuais do Supabase quando houver dados reais.

## Restauração rápida do código

1. Identificar o commit estável em `git log --oneline`.
2. Criar uma nova branch de recuperação.
3. Reverter somente os commits problemáticos.
4. Fazer push para o GitHub e aguardar novo deploy da Vercel.

## Teste local de restauração

O repositório possui um dry-run automatizado para os arquivos críticos:

```powershell
node tests/backup-restore-dry-run.mjs
```

O teste copia os arquivos para uma pasta temporária, confere hash SHA-256 e valida a presença de objetos essenciais do schema.

## Restauração do banco

1. Abrir o SQL Editor do Supabase.
2. Validar se há backup/exportação recente dos dados.
3. Reaplicar o schema versionado em `supabase.sql`.
4. Conferir políticas RLS, funções RPC, storage bucket `item-images` e usuários administrativos.

## Observação

Restauração completa com dados reais ainda depende de rotina externa de exportação do Supabase.
