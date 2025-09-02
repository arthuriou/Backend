/**
 * Serveur de test minimal pour vérifier les endpoints
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Route de test de base
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API SantéAfrik - Test Mode',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth_test: '/api/auth/test',
      auth_register: '/api/auth/register'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes d'auth simplifiées
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Route de test OK',
    status: 'working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/register', (req, res) => {
  const { nom, email, motDePasse } = req.body;
  
  // Validation basique
  if (!nom || !email || !motDePasse) {
    return res.status(400).json({
      success: false,
      message: 'Données manquantes',
      required: ['nom', 'email', 'motDePasse']
    });
  }

  // Simulation d'une inscription réussie
  res.status(201).json({
    success: true,
    message: 'Inscription simulée avec succès',
    data: {
      id: `user_${Date.now()}`,
      nom,
      email,
      created_at: new Date().toISOString()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, motDePasse } = req.body;
  
  if (!email || !motDePasse) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  // Simulation d'une connexion
  res.json({
    success: true,
    message: 'Connexion simulée',
    data: {
      token: 'fake_jwt_token_' + Date.now(),
      user: {
        id: 'user_123',
        email,
        role: 'PATIENT'
      }
    }
  });
});

// Gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
    available_routes: [
      'GET /',
      'GET /health', 
      'GET /api/auth/test',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// Gestion globale des erreurs
app.use((error: any, req: any, res: any, next: any) => {
  console.error('❌ Erreur serveur:', error.message);
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('🚀 Serveur de test démarré !');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log('📡 Routes disponibles:');
  console.log('   GET  / - Page d\'accueil');
  console.log('   GET  /health - Health check');
  console.log('   GET  /api/auth/test - Test auth');
  console.log('   POST /api/auth/register - Inscription');
  console.log('   POST /api/auth/login - Connexion');
  console.log('='.repeat(50));
});

export default app;