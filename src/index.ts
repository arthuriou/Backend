import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import pool from "./utils/database";
import authRoutes from "./features/auth/auth.route";
import cabinetRoutes from "./features/cabinets/cabinet.route";
import { createRendezVousRoutes } from "./features/rendezvous/rendezvous.route";
import { createMessagerieRoutes } from "./features/messagerie/messagerie.route";
import specialitesRoutes from "./features/specialites/specialites.route";
import notificationPreferencesRoutes from "./features/notifications/notification-preferences.route";
import dossierMedicalRoutes from "./features/dossier-medical/dossier-medical.route";
import ordonnancesRoutes from "./features/ordonnances/ordonnances.route";
import { SocketService } from "./shared/services/socket.service";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialiser Socket.IO
const socketService = new SocketService(server);

// Middleware basique
app.use(express.json());

// Routes simples
app.get("/", (req, res) => {
  res.json({ message: "API SantéAfrik - OK" });
});


app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Base de données connectée", data: result.rows[0] });
    console.log(result.rows[0]);
  } catch (error) {
    res.json({ message: "Base de données non connectée", error: error });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes d'authentification
app.use("/api/auth", authRoutes);

// Routes des cabinets
app.use("/api/cabinets", cabinetRoutes);

// Routes des rendez-vous avec Socket.IO
const rendezvousRoutes = createRendezVousRoutes(socketService);
app.use("/api/rendezvous", rendezvousRoutes);

// Routes de messagerie avec Socket.IO
const messagerieRoutes = createMessagerieRoutes(socketService);
app.use("/api/messagerie", messagerieRoutes);

// Routes des spécialités et maux
app.use("/api/specialites", specialitesRoutes);

// Routes des préférences de notification
app.use("/api/notifications/preferences", notificationPreferencesRoutes);

// Routes Dossier Médical
app.use("/api/dossier-medical", dossierMedicalRoutes);

// Routes Ordonnances
app.use("/api/ordonnances", ordonnancesRoutes);

// Démarrage
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🔌 Socket.IO activé pour le temps réel`);
});

export default app;