import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import { initializeDatabase } from "./shared/config/database";
import { authRoutes } from "./features/auth";

// Configuration des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:3000";

// ================================
// MIDDLEWARES GLOBAUX
// ================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3000'] 
    : true,
  credentials: true
}));

// ================================
// LOGGING DES REQUÊTES
// ================================
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ================================
// ROUTES DE BASE
// ================================
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🚀 API SantéAfrik - Backend",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ================================
// ROUTES DE L'API
// ================================
app.use("/api/auth", authRoutes);

// ================================
// GESTION DES ERREURS 404
// ================================
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
        success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ================================
// GESTION GLOBALE DES ERREURS
// ================================
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erreur serveur:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error
    }),
    timestamp: new Date().toISOString()
  });
});

// ================================
// DÉMARRAGE DU SERVEUR
// ================================
const startServer = async () => {
  try {
    // Initialiser la base de données
    console.log('🔌 Connexion à la base de données...');
    await initializeDatabase();
    console.log('✅ Base de données connectée avec succès');

    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log('🚀 Serveur démarré avec succès !');
      console.log(`📍 URL: ${API_URL}`);
      console.log(`🔌 Port: ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Démarré le: ${new Date().toLocaleString('fr-FR')}`);
      console.log('='.repeat(50));
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};
  
// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();

export default app;
