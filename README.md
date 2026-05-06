# Tião Fonseca | Portfólio Artístico

Site em Node.js sem dependências, inspirado em uma experiência editorial de galeria artística.

## Rodar localmente

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

## Publicar no GitHub

```bash
git init
git add .
git commit -m "Criar portfolio artistico"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

## Hospedar na Hostinger

Você tem duas opções:

1. Hospedagem estática: envie o conteúdo da pasta `public` para `public_html`.
2. Hospedagem Node.js: envie o projeto inteiro, configure o comando `npm start` e aponte o app para `server.js`.

Antes de publicar, atualize telefone, e-mail, redes sociais, textos e imagens em `public/index.html` e `public/assets/app.js`.
