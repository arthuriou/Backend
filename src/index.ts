import express from "express";
import dotenv from "dotenv";
import pool from "./utils/database";
import authRoutes from "./features/auth/auth.route";
import cabinetRoutes from "./features/cabinets/cabinet.route";
import rendezvousRoutes from "./features/rendezvous/rendezvous.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes des rendez-vous
app.use("/api/rendezvous", rendezvousRoutes);

// Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

export default app;