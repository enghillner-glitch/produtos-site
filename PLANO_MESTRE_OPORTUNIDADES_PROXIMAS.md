# Plano Mestre Revisado - Oportunidades Próximas

## Resumo

Construir a plataforma Oportunidades Próximas em modo web-first, reaproveitando a estrutura de Vercel, GitHub e Supabase quando a publicação for conectada. O MVP valida o fluxo de Portal do Lojista, criação de Alertas de Oportunidade, moderação e vitrine web do consumidor.

## Decisões

- Android Auto permanece desabilitado no MVP.
- Google Business Profile começa em modo manual/simulado.
- App Android nativo fica para fase posterior.
- O primeiro fluxo do consumidor será uma vitrine web responsiva.
- Todo Alerta precisa de validade inicial e final.
- Alerta enviado pelo lojista entra como `in_review`.
- Publicação real depende de moderação/aprovação.
- Lojista vê métricas agregadas, nunca histórico individual do consumidor.

## Fluxos MVP

### Lojista

1. Acessa landing.
2. Entra em modo simulado com Google.
3. Seleciona estabelecimento elegível.
4. Cria Alerta estruturado em 8 passos.
5. Envia para análise.
6. Acompanha em Meus Alertas.
7. Moderador aprova.
8. Alerta pode ser ativado.

### Consumidor

1. Escolhe interesses básicos.
2. Visualiza apenas oportunidades compatíveis.
3. Abre detalhes.
4. Salva, oculta ou denuncia.

## Canais

- App Mobile/Web: habilitado como experiência web inicial.
- Site Web: habilitado na vitrine.
- Android Auto: desabilitado.
- E-mail: desabilitado/futuro.

## Ordem sugerida

1. Consolidar SPA e documentação.
2. Aplicar schema Supabase.
3. Migrar persistência de localStorage para Supabase.
4. Conectar autenticação real.
5. Conectar Vercel/GitHub.
6. Evoluir Google Business Profile real.
7. Iniciar app Android nativo.
