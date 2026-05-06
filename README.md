# Tião Fonseca | Portfólio Artístico

Site de página estática inspirado em uma experiência editorial de galeria artística.

Não usa Node.js, backend, build, npm, framework frontend ou framework backend. É apenas HTML, CSS, JavaScript e imagens.

## Estrutura

```text
index.html
assets/
  app.js
  styles.css
  images/
```

## Rodar localmente

Basta abrir o arquivo `index.html` no navegador.

Também é possível testar com qualquer servidor estático simples, mas isso não é obrigatório para publicar.

## Publicar no GitHub

```bash
git add .
git commit -m "Converter site para pagina estatica"
git push
```

## Hospedar na Hostinger

Use hospedagem estática, não use o instalador de Node.js.

Opção mais simples:

1. Abra o Gerenciador de Arquivos da Hostinger.
2. Entre na pasta `public_html`.
3. Envie `index.html` e a pasta `assets`.
4. Acesse seu domínio.

Se for publicar pelo GitHub, configure a Hostinger para servir o repositório como site estático, com a raiz do projeto apontando para `/`.

Antes de publicar, atualize telefone, e-mail, redes sociais, textos e imagens em `index.html` e `assets/app.js`.
