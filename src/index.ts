import express from "express";
import { configureCloudinary } from "./shared/utils/cloudinary";
import { createServer } from "http";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pool from "./shared/database/client";
import authRoutes from "./features/auth/auth.route";
import cabinetRoutes from "./features/cabinets/cabinet.route";
import { createRendezVousRoutes } from "./features/rendezvous/rendezvous.route";
import { createMessagerieRoutes } from "./features/messagerie/messagerie.route";
import specialitesRoutes from "./features/specialites/specialites.route";
import notificationPreferencesRoutes from "./features/notifications/notification-preferences.route";
import devicesRoutes from "./features/notifications/devices.route";
import dossierMedicalRoutes from "./features/dossier-medical/dossier-medical.route";
import ordonnancesRoutes from "./features/ordonnances/ordonnances.route";
import agendaRoutes from "./features/agenda/agenda.route";
import { SocketService } from "./shared/services/socket.service";
import path from "path";
import { SchedulerService } from "./shared/services/scheduler.service";

dotenv.config();

const app = express();
// Configure cloudinary once at startup (no-op if env missing)
configureCloudinary();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialiser Socket.IO
const socketService = new SocketService(server);

// Middleware basique
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);
// Fichiers statiques /uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.use("/api/v1/auth", authRoutes);

// Routes des cabinets
app.use("/api/cabinets", cabinetRoutes);
app.use("/api/v1/cabinets", cabinetRoutes);

// Routes des rendez-vous avec Socket.IO
const rendezvousRoutes = createRendezVousRoutes(socketService);
app.use("/api/rendezvous", rendezvousRoutes);
app.use("/api/v1/rendezvous", rendezvousRoutes);

// Routes de messagerie avec Socket.IO
const messagerieRoutes = createMessagerieRoutes(socketService);
app.use("/api/messagerie", messagerieRoutes);
app.use("/api/v1/messagerie", messagerieRoutes);

// Routes des spécialités et maux
app.use("/api/specialites", specialitesRoutes);
app.use("/api/v1/specialites", specialitesRoutes);

// Routes des préférences de notification
app.use("/api/notifications/preferences", notificationPreferencesRoutes);
app.use("/api/notifications", devicesRoutes);
app.use("/api/v1/notifications/preferences", notificationPreferencesRoutes);
app.use("/api/v1/notifications", devicesRoutes);

// Routes Dossier Médical
app.use("/api/dossier-medical", dossierMedicalRoutes);
app.use("/api/v1/dossier-medical", dossierMedicalRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/v1/agenda", agendaRoutes);

// Aliases Mobile/Dashboard (pointent vers les mêmes routes pour l'instant)
app.use("/api/v1/mobile/auth", authRoutes);
app.use("/api/v1/mobile/cabinets", cabinetRoutes);
app.use("/api/v1/mobile/rendezvous", rendezvousRoutes);
app.use("/api/v1/mobile/messagerie", messagerieRoutes);
app.use("/api/v1/mobile/specialites", specialitesRoutes);
app.use("/api/v1/mobile/notifications/preferences", notificationPreferencesRoutes);
app.use("/api/v1/mobile/notifications", devicesRoutes);
app.use("/api/v1/mobile/dossier-medical", dossierMedicalRoutes);
app.use("/api/v1/mobile/ordonnances", ordonnancesRoutes);

app.use("/api/v1/dashboard/auth", authRoutes);
app.use("/api/v1/dashboard/cabinets", cabinetRoutes);
app.use("/api/v1/dashboard/rendezvous", rendezvousRoutes);
app.use("/api/v1/dashboard/messagerie", messagerieRoutes);
app.use("/api/v1/dashboard/specialites", specialitesRoutes);
app.use("/api/v1/dashboard/notifications/preferences", notificationPreferencesRoutes);
app.use("/api/v1/dashboard/notifications", devicesRoutes);
app.use("/api/v1/dashboard/dossier-medical", dossierMedicalRoutes);
app.use("/api/v1/dashboard/ordonnances", ordonnancesRoutes);
app.use("/api/v1/dashboard/agenda", agendaRoutes);

// Routes Ordonnances
app.use("/api/ordonnances", ordonnancesRoutes);
app.use("/api/v1/ordonnances", ordonnancesRoutes);

// Démarrage (pas d'écoute en mode test)
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🔌 Socket.IO activé pour le temps réel`);
    // Scheduler
    new SchedulerService().start();
  });
}

export default app;