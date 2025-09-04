import { Router } from "express";
import { MessagerieController } from "./messagerie.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";
import { SocketService } from "../../shared/services/socket.service";
import { upload, setUploadSegment } from "../../shared/utils/upload";

// Fonction pour créer les routes avec un contrôleur spécifique
export const createMessagerieRoutes = (socketService?: SocketService) => {
  const router = Router();
  const controller = new MessagerieController(socketService);

  // ========================================
  // CONVERSATIONS
  // ========================================

  // Créer ou récupérer une conversation privée
  router.post("/conversations/private", 
    authenticateToken, 
    controller.createOrGetPrivateConversation.bind(controller)
  );

  // Récupérer les conversations de l'utilisateur
  router.get("/conversations", 
    authenticateToken, 
    controller.getConversations.bind(controller)
  );

  // Récupérer une conversation par ID
  router.get("/conversations/:id", 
    authenticateToken, 
    controller.getConversationById.bind(controller)
  );

  // Ajouter un participant à une conversation
  router.post("/conversations/:id/participants", 
    authenticateToken, 
    requireRole(['ADMINCABINET', 'SUPERADMIN']), 
    controller.addParticipant.bind(controller)
  );

  // Retirer un participant d'une conversation
  router.delete("/conversations/:id/participants/:participantId", 
    authenticateToken, 
    controller.removeParticipant.bind(controller)
  );

  // Marquer une conversation comme lue
  router.post("/conversations/:id/read", 
    authenticateToken, 
    controller.markConversationAsRead.bind(controller)
  );

  // ========================================
  // MESSAGES
  // ========================================

  // Envoyer un message (texte ou fichier)
  router.post("/messages", 
    authenticateToken,
    setUploadSegment('messages'),
    upload.single('file'),
    controller.sendMessage.bind(controller)
  );

  // Récupérer les messages d'une conversation
  router.get("/conversations/:id/messages", 
    authenticateToken, 
    controller.getMessages.bind(controller)
  );

  // Modifier un message
  router.put("/messages/:id", 
    authenticateToken, 
    controller.updateMessage.bind(controller)
  );

  // Supprimer un message
  router.delete("/messages/:id", 
    authenticateToken, 
    controller.deleteMessage.bind(controller)
  );

  // Marquer un message comme lu
  router.post("/messages/:id/read", 
    authenticateToken, 
    controller.markMessageAsRead.bind(controller)
  );

  return router;
};

// Export par défaut pour compatibilité (sans Socket.IO)
export default createMessagerieRoutes();
