const express = require('express');
const path = require('path');
const app = express();

// Hostinger define a porta automaticamente
const PORT = process.env.PORT || 3000;

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback para SPA - todas as outras rotas vão para index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📁 Servindo arquivos da pasta: ${path.join(__dirname, 'public')}`);
});