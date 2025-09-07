import { Router } from "express";
import controller from "./devices.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();

// Enregistrer un device pour les notifications push
router.post("/devices", authenticateToken, (req, res) => controller.register(req, res));

// Récupérer les devices enregistrés d'un utilisateur
router.get("/devices", authenticateToken, (req, res) => controller.list(req, res));

// Supprimer un device enregistré
router.delete("/devices/:token", authenticateToken, (req, res) => controller.remove(req, res));

export default router;


