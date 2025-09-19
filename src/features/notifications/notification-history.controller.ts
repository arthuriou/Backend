import { Request, Response } from "express";
import { NotificationHistoryService } from "./notification-history.service";
import { GetNotificationsRequest } from "./notification-history.model";

export class NotificationHistoryController {
  private service: NotificationHistoryService;

  constructor() {
    this.service = new NotificationHistoryService();
  }

  // ========================================
  // RÉCUPÉRATION DE NOTIFICATIONS
  // ========================================

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const filters: GetNotificationsRequest = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        type_notification: req.query.type_notification as string,
        lu: req.query.lu !== undefined ? req.query.lu === 'true' : undefined,
        date_debut: req.query.date_debut ? new Date(req.query.date_debut as string) : undefined,
        date_fin: req.query.date_fin ? new Date(req.query.date_fin as string) : undefined
      };

      const result = await this.service.getNotificationsByUser(userId, filters);
      
      res.status(200).json({
        message: 'Notifications récupérées avec succès',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la récupération des notifications' 
      });
    }
  }

  async getNotificationById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: 'ID de notification requis' });
        return;
      }

      const notification = await this.service.getNotificationById(id, userId);
      
      if (!notification) {
        res.status(404).json({ message: 'Notification non trouvée' });
        return;
      }

      res.status(200).json({
        message: 'Notification récupérée avec succès',
        data: notification
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la récupération de la notification' 
      });
    }
  }

  // ========================================
  // MARQUAGE COMME LU
  // ========================================

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { notification_ids } = req.body;
      if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        res.status(400).json({ message: 'Liste des IDs de notifications requise' });
        return;
      }

      const result = await this.service.markAsRead(notification_ids, userId);
      
      res.status(200).json({
        message: `${result.notifications_marked} notification(s) marquée(s) comme lue(s)`,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors du marquage des notifications' 
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { type_notification } = req.query;
      const count = await this.service.markAllAsRead(userId, type_notification as string);
      
      res.status(200).json({
        message: `${count} notification(s) marquée(s) comme lue(s)`,
        data: { count }
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors du marquage des notifications' 
      });
    }
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const stats = await this.service.getNotificationStats(userId);
      
      res.status(200).json({
        message: 'Statistiques récupérées avec succès',
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la récupération des statistiques' 
      });
    }
  }

  // ========================================
  // SUPPRESSION
  // ========================================

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: 'ID de notification requis' });
        return;
      }

      const deleted = await this.service.deleteNotification(id, userId);
      
      if (!deleted) {
        res.status(404).json({ message: 'Notification non trouvée' });
        return;
      }

      res.status(200).json({
        message: 'Notification supprimée avec succès'
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la suppression de la notification' 
      });
    }
  }

  async deleteOldNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { days_old } = req.body;
      const daysOld = days_old || 30;

      const count = await this.service.deleteOldNotifications(userId, daysOld);
      
      res.status(200).json({
        message: `${count} notification(s) ancienne(s) supprimée(s)`,
        data: { count }
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la suppression des notifications anciennes' 
      });
    }
  }

  // Vider toutes les notifications de l'utilisateur (option: par type)
  async deleteAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { type_notification } = req.query;
      const count = await this.service.deleteAllNotifications(userId, type_notification as string);

      res.status(200).json({
        message: `${count} notification(s) supprimée(s)`,
        data: { count }
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la suppression des notifications' 
      });
    }
  }

  // ========================================
  // MÉTHODES DE CONVENANCE
  // ========================================

  async createRendezVousNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { titre, contenu, rendezvous_id, canal = 'PUSH' } = req.body;
      
      if (!titre || !contenu || !rendezvous_id) {
        res.status(400).json({ message: 'Titre, contenu et ID rendez-vous requis' });
        return;
      }

      const notification = await this.service.createRendezVousNotification(
        userId, 
        titre, 
        contenu, 
        rendezvous_id,
        canal
      );
      
      res.status(201).json({
        message: 'Notification de rendez-vous créée avec succès',
        data: notification
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la création de la notification' 
      });
    }
  }

  async createMessageNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }

      const { titre, contenu, conversation_id, message_id, canal = 'PUSH' } = req.body;
      
      if (!titre || !contenu || !conversation_id || !message_id) {
        res.status(400).json({ message: 'Titre, contenu, ID conversation et ID message requis' });
        return;
      }

      const notification = await this.service.createMessageNotification(
        userId, 
        titre, 
        contenu, 
        conversation_id,
        message_id,
        canal
      );
      
      res.status(201).json({
        message: 'Notification de message créée avec succès',
        data: notification
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la création de la notification' 
      });
    }
  }
}

export default new NotificationHistoryController();
