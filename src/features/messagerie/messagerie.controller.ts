import { Request, Response } from "express";
import { MessagerieService } from "./messagerie.service";
import { SocketService } from "../../shared/services/socket.service";
import { AuthRepository } from "../auth/auth.repository";
import { getMissingFields } from "../../shared/utils/validator";

export class MessagerieController {
  private service: MessagerieService;
  private authRepository: AuthRepository;

  constructor(socketService?: SocketService) {
    this.service = new MessagerieService(socketService);
    this.authRepository = new AuthRepository();
  }

  // ========================================
  // CONVERSATIONS
  // ========================================

  // Créer ou récupérer une conversation privée
  async createOrGetPrivateConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const { participantId } = req.body;
      
      if (!participantId) {
        res.status(400).json({ message: "ID du participant requis" });
        return;
      }

      // Récupérer le rôle réel du participant cible
      const participantRole = await this.authRepository.getUserRole(participantId);

      const conversation = await this.service.createOrGetPrivateConversation(
        userId,
        participantId,
        userRole,
        participantRole
      );
      
      res.status(200).json({
        message: "Conversation récupérée avec succès",
        data: conversation
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer les conversations de l'utilisateur
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const conversations = await this.service.getConversationsByUser(userId);
      
      res.status(200).json({
        message: "Conversations récupérées avec succès",
        data: conversations
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer une conversation par ID
  async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const conversation = await this.service.getConversationById(id, userId);
      
      if (!conversation) {
        res.status(404).json({ message: "Conversation non trouvée" });
        return;
      }

      res.status(200).json({
        message: "Conversation récupérée avec succès",
        data: conversation
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Ajouter un participant à une conversation
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const { id } = req.params;
      const { participantId } = req.body;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      if (!participantId) {
        res.status(400).json({ message: "ID du participant requis" });
        return;
      }

      const participant = await this.service.addParticipantToConversation(
        id, 
        participantId, 
        userId, 
        userRole
      );
      
      res.status(200).json({
        message: "Participant ajouté avec succès",
        data: participant
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Retirer un participant d'une conversation
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const { id, participantId } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const success = await this.service.removeParticipantFromConversation(
        id, 
        participantId, 
        userId, 
        userRole
      );
      
      if (success) {
        res.status(200).json({
          message: "Participant retiré avec succès"
        });
      } else {
        res.status(404).json({
          message: "Participant non trouvé"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // ========================================
  // MESSAGES
  // ========================================

  // Envoyer un message
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const file = (req as any).file as any;
      const body = req.body || {};
      if (!body.conversation_id && !body.conversationId) {
        res.status(400).json({ message: 'conversation_id requis' });
        return;
      }
      if (!body.contenu && !file) {
        res.status(400).json({ message: 'contenu ou fichier requis' });
        return;
      }

      const payload = {
        conversation_id: body.conversation_id || body.conversationId,
        contenu: body.contenu || (file ? '' : undefined),
        type_message: file ? 'FICHIER' : 'TEXTE',
        fichier_url: file ? `/uploads/messages/${file.filename}` : undefined,
        fichier_nom: file ? file.originalname : undefined,
        fichier_taille: file ? file.size : undefined
      };

      const message = await this.service.sendMessage(payload as any, userId, userRole);
      
      res.status(201).json({
        message: "Message envoyé avec succès",
        data: message
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer les messages d'une conversation
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const messages = await this.service.getMessagesByConversation(
        id, 
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.status(200).json({
        message: "Messages récupérés avec succès",
        data: messages
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Modifier un message
  async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const updatedMessage = await this.service.updateMessage(
        id, 
        req.body, 
        userId, 
        userRole
      );
      
      res.status(200).json({
        message: "Message modifié avec succès",
        data: updatedMessage
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Supprimer un message
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const success = await this.service.deleteMessage(id, userId, userRole);
      
      if (success) {
        res.status(200).json({
          message: "Message supprimé avec succès"
        });
      } else {
        res.status(404).json({
          message: "Message non trouvé"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Marquer une conversation comme lue
  async markConversationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const messagesRead = await this.service.markConversationAsRead(id, userId);
      
      res.status(200).json({
        message: "Conversation marquée comme lue",
        data: { messagesRead }
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const messageRead = await this.service.markMessageAsRead(id, userId);
      
      res.status(200).json({
        message: "Message marqué comme lu",
        data: messageRead
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }
}
