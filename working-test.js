/**
 * Test serveur ultra-simple qui FONCTIONNE
 */

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🎉 ÇA MARCHE !',
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /',
      'GET /health',
      'GET /api/auth/test',
      'POST /api/auth/register'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy ✅',
    uptime: process.uptime() + ' secondes'
  });
});

app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Route auth test OK ✅',
    status: 'working'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { nom, email } = req.body;
  
  if (!nom || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nom et email requis ❌'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Inscription simulée ✅',
    user: { nom, email, id: Date.now() }
  });
});

// Gestion 404 simple
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée ❌',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log('🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS !');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('✅ Prêt pour les tests !');
});