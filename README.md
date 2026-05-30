# trocacomtroca

Site estático para viabilizar trocas de objetos entre pessoas.

## Stack

- HTML, CSS e JavaScript puro
- Supabase Auth, Database e Storage
- GitHub
- Vercel

## Configuração do Supabase

1. Abra o projeto no Supabase.
2. Vá em **SQL Editor**.
3. Execute o conteúdo de `supabase.sql`.
4. Confira se `config.js` está com:

```js
window.APP_CONFIG = {
  supabaseUrl: "https://lzuaqhmjzwchkesxnocz.supabase.co",
  supabaseAnonKey: "SUA_PUBLISHABLE_KEY",
  storageBucket: "item-images"
};
```

## Fluxo principal

- Visitantes veem objetos disponíveis por cidade e bairro.
- Usuários criam conta com email e senha.
- Usuários completam perfil com nome e WhatsApp.
- Usuários cadastram objetos com categoria, condição, cidade, bairro, preferências e imagens.
- Uma proposta exige selecionar um objeto próprio disponível.
- Ao aceitar uma proposta, os dois objetos viram trocados e o WhatsApp é liberado entre os envolvidos.
- Se a troca não acontecer, os participantes podem reabrir os objetos.
