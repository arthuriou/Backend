import { Router } from "express";
import { NotificationHistoryController } from "./notification-history.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new NotificationHistoryController();

// ========================================
// ROUTES NOTIFICATION HISTORY
// ========================================

// Récupérer les notifications de l'utilisateur connecté
router.get("/", 
  authenticateToken, 
  controller.getNotifications.bind(controller)
);

// Récupérer une notification spécifique
router.get("/:id", 
  authenticateToken, 
  controller.getNotificationById.bind(controller)
);

// Marquer des notifications comme lues
router.post("/mark-read", 
  authenticateToken, 
  controller.markAsRead.bind(controller)
);

// Marquer toutes les notifications comme lues
router.post("/mark-all-read", 
  authenticateToken, 
  controller.markAllAsRead.bind(controller)
);

// Récupérer les statistiques des notifications
router.get("/stats", 
  authenticateToken, 
  controller.getStats.bind(controller)
);

// Supprimer une notification
router.delete("/:id", 
  authenticateToken, 
  controller.deleteNotification.bind(controller)
);

// Supprimer les notifications anciennes
router.delete("/cleanup/old", 
  authenticateToken, 
  controller.deleteOldNotifications.bind(controller)
);

// Vider toutes les notifications (option: par type via ?type_notification=)
router.delete("/clear", 
  authenticateToken, 
  controller.deleteAll.bind(controller)
);

// ========================================
// ROUTES DE CONVENANCE POUR CRÉATION
// ========================================

// Créer une notification de rendez-vous
router.post("/rendez-vous", 
  authenticateToken, 
  controller.createRendezVousNotification.bind(controller)
);

// Créer une notification de message
router.post("/message", 
  authenticateToken, 
  controller.createMessageNotification.bind(controller)
);

export default router;
