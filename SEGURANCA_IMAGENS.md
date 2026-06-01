# Seguranca em imagens

## Estado implementado

O cadastro de imoveis aplica tres verificacoes antes do upload:

- tipo de arquivo permitido: JPG, PNG ou WebP;
- limite de ate 5 imagens por imovel;
- bloqueio de telefone, email ou link no nome do arquivo e no texto reconhecido por OCR.

## OCR no navegador

Quando `imageOcrEnabled` esta ativo em `config.js`, o app carrega Tesseract.js sob demanda apenas no momento do envio das fotos:

```js
window.APP_CONFIG = {
  // ...
  imageOcrEnabled: true,
  tesseractScriptUrl: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"
};
```

Se o OCR reconhecer telefone, email ou link em alguma imagem, o cadastro e bloqueado antes do upload.

## Limites conhecidos

- OCR pode falhar em imagens desfocadas, muito escuras ou com texto pequeno.
- A moderacao manual continua obrigatoria para revisar imagens visualmente.
- Para uma camada mais forte no futuro, pode-se substituir o OCR no navegador por OCR server-side ou servico especializado.
