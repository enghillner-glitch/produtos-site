# Cadastro de Produtos

Site simples para cadastrar, listar, editar, apagar produtos e inserir imagem.

## Teste local

Abra `index.html` no navegador. Sem Supabase configurado, os dados ficam salvos no próprio navegador.

## Conectar no Supabase

1. Abra o projeto no Supabase.
2. Vá em **SQL Editor**.
3. Cole e execute o conteúdo de `supabase.sql`.
4. Vá em **Project Settings > API**.
5. Copie:
   - Project URL
   - anon public key
6. Abra `config.js` e preencha:

```js
window.APP_CONFIG = {
  supabaseUrl: "SUA_PROJECT_URL",
  supabaseAnonKey: "SUA_ANON_PUBLIC_KEY",
  productsTable: "products",
  storageBucket: "product-images"
};
```

Depois disso, os produtos e imagens passam a ser salvos no Supabase.

## Publicar

Pode publicar a pasta inteira em Vercel, Cloudflare Pages, Netlify ou GitHub Pages.
