# Tiao Fonseca | Portfolio Artistico

Site artistico em Node.js com Express e interface admin para cadastrar obras.

## Tecnologias

- Node.js
- Express
- Multer para upload de imagens
- HTML, CSS e JavaScript no frontend

## Estrutura

```text
index.html
admin.html
server.js
package.json
data/
  artworks.json
assets/
  app.js
  admin.js
  styles.css
  admin.css
  images/
```

## Rodar localmente

```bash
npm install
npm start
```

Depois acesse:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin.html
```

## Hospedar na Hostinger

Use o instalador de Node.js e selecione Express.

Configuracao recomendada:

- Framework: Express
- Package manager: npm
- Install command: `npm install`
- Start command: `npm start`
- Entry file: `server.js`
- Node.js: 18.x, 20.x, 22.x ou 24.x

## Administrar obras

No admin voce pode:

- cadastrar obras
- editar obras
- excluir obras
- fazer upload de imagens
- salvar automaticamente em `data/artworks.json`

As imagens enviadas pelo admin sao gravadas em `assets/images`.

## Publicar no GitHub

```bash
git add -A
git commit -m "Criar site Node com admin de obras"
git push
```
