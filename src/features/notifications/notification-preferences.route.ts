import { Router } from "express";
import { NotificationPreferencesController } from "./notification-preferences.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new NotificationPreferencesController();

// ========================================
// PRÉFÉRENCES DE NOTIFICATION
// ========================================

// Récupérer les préférences de l'utilisateur connecté
router.get("/", 
  authenticateToken, 
  controller.getPreferences.bind(controller)
);

// Mettre à jour les préférences
router.put("/", 
  authenticateToken, 
  controller.updatePreferences.bind(controller)
);

// Réinitialiser aux préférences par défaut
router.post("/reset", 
  authenticateToken, 
  controller.resetToDefault.bind(controller)
);

// Supprimer les préférences
router.delete("/", 
  authenticateToken, 
  controller.deletePreferences.bind(controller)
);

export default router;
