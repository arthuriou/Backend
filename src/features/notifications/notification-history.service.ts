import { NotificationHistoryRepository } from "./notification-history.repository";
import { 
  NotificationHistory, 
  CreateNotificationRequest, 
  GetNotificationsRequest,
  NotificationListResponse,
  MarkAsReadResponse
} from "./notification-history.model";

export class NotificationHistoryService {
  private repository: NotificationHistoryRepository;

  constructor() {
    this.repository = new NotificationHistoryRepository();
  }

  // ========================================
  // CRÉATION DE NOTIFICATIONS
  // ========================================

  async createNotification(data: CreateNotificationRequest): Promise<NotificationHistory> {
    if (!data.utilisateur_id || !data.titre || !data.contenu) {
      throw new Error("Données de notification incomplètes");
    }

    // Créer la notification dans l'historique
    const notification = await this.repository.createNotification(data);

    // Envoyer la notification push si c'est le canal PUSH
    if (data.canal === 'PUSH') {
      try {
        // Import dynamique pour éviter la dépendance circulaire
        const { PushService } = await import('../../shared/services/push.service');
        const pushService = new PushService();
        
        await pushService.sendToUser(data.utilisateur_id, {
          title: data.titre,
          body: data.contenu,
          data: data.data || {},
          type_notification: data.type_notification,
          save_to_history: false // Éviter la double sauvegarde
        });
      } catch (error) {
        console.error('Erreur envoi push notification:', error);
        // Ne pas faire échouer la création de la notification
      }
    }

    return notification;
  }

  // ========================================
  // RÉCUPÉRATION DE NOTIFICATIONS
  // ========================================

  async getNotificationsByUser(
    userId: string, 
    filters: GetNotificationsRequest = {}
  ): Promise<NotificationListResponse> {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.getNotificationsByUser(userId, filters);
  }

  async getNotificationById(notificationId: string, userId: string): Promise<NotificationHistory | null> {
    if (!notificationId || !userId) {
      throw new Error("ID notification et utilisateur requis");
    }

    return await this.repository.getNotificationById(notificationId, userId);
  }

  // ========================================
  // MARQUAGE COMME LU
  // ========================================

  async markAsRead(notificationIds: string[], userId: string): Promise<MarkAsReadResponse> {
    if (!notificationIds || notificationIds.length === 0) {
      throw new Error("Aucune notification à marquer comme lue");
    }

    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.markAsRead(notificationIds, userId);
  }

  async markAllAsRead(userId: string, type_notification?: string): Promise<number> {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.markAllAsRead(userId, type_notification);
  }

  // ========================================
  // GESTION DES NOTIFICATIONS
  // ========================================

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    if (!notificationId || !userId) {
      throw new Error("ID notification et utilisateur requis");
    }

    return await this.repository.deleteNotification(notificationId, userId);
  }

  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    if (daysOld < 1) {
      throw new Error("La durée de conservation doit être d'au moins 1 jour");
    }

    return await this.repository.deleteOldNotifications(userId, daysOld);
  }

  async deleteAllNotifications(userId: string, type_notification?: string): Promise<number> {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.deleteAllNotifications(userId, type_notification);
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  async getNotificationStats(userId: string) {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.getNotificationStats(userId);
  }

  // Nettoyage automatique des notifications expirées
  async cleanupExpiredNotifications(): Promise<number> {
    return await this.repository.cleanupExpiredNotifications();
  }

  // ========================================
  // MÉTHODES DE CONVENANCE POUR LES TYPES DE NOTIFICATIONS
  // ========================================

  async createRendezVousNotification(
    userId: string, 
    titre: string, 
    contenu: string, 
    rendezVousId: string,
    canal: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP' = 'PUSH'
  ): Promise<NotificationHistory> {
    return this.createNotification({
      utilisateur_id: userId,
      titre,
      contenu,
      type_notification: 'RENDEZ_VOUS',
      canal,
      data: { rendezvous_id: rendezVousId }
    });
  }

  async createMessageNotification(
    userId: string, 
    titre: string, 
    contenu: string, 
    conversationId: string,
    messageId: string,
    canal: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP' = 'PUSH'
  ): Promise<NotificationHistory> {
    return this.createNotification({
      utilisateur_id: userId,
      titre,
      contenu,
      type_notification: 'MESSAGE',
      canal,
      data: { conversation_id: conversationId, message_id: messageId }
    });
  }

  async createRappelNotification(
    userId: string, 
    titre: string, 
    contenu: string, 
    rendezVousId: string,
    canal: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP' = 'PUSH'
  ): Promise<NotificationHistory> {
    return this.createNotification({
      utilisateur_id: userId,
      titre,
      contenu,
      type_notification: 'RAPPEL',
      canal,
      data: { rendezvous_id: rendezVousId }
    });
  }

  async createSystemNotification(
    userId: string, 
    titre: string, 
    contenu: string, 
    data?: Record<string, any>,
    canal: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP' = 'IN_APP'
  ): Promise<NotificationHistory> {
    return this.createNotification({
      utilisateur_id: userId,
      titre,
      contenu,
      type_notification: 'SYSTEME',
      canal,
      data
    });
  }
}
