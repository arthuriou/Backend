import db from "../../shared/database/client";
import { 
  NotificationHistory, 
  CreateNotificationRequest, 
  GetNotificationsRequest,
  NotificationListResponse,
  NotificationStats,
  MarkAsReadResponse
} from "./notification-history.model";

export class NotificationHistoryRepository {

  // ========================================
  // CRÉATION DE NOTIFICATIONS
  // ========================================

  async createNotification(data: CreateNotificationRequest): Promise<NotificationHistory> {
    const query = `
      INSERT INTO notification_history (
        utilisateur_id, titre, contenu, type_notification, 
        canal, data, date_expiration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      data.utilisateur_id,
      data.titre,
      data.contenu,
      data.type_notification,
      data.canal,
      data.data ? JSON.stringify(data.data) : null,
      data.date_expiration || null
    ];

    const result = await db.query<NotificationHistory>(query, values);
    return result.rows[0];
  }

  // ========================================
  // RÉCUPÉRATION DE NOTIFICATIONS
  // ========================================

  async getNotificationsByUser(
    userId: string, 
    filters: GetNotificationsRequest = {}
  ): Promise<NotificationListResponse> {
    const {
      page = 1,
      limit = 20,
      type_notification,
      lu,
      date_debut,
      date_fin
    } = filters;

    const offset = (page - 1) * limit;
    
    // Construction de la clause WHERE
    const whereConditions = ['utilisateur_id = $1', 'actif = true'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (type_notification) {
      whereConditions.push(`type_notification = $${paramIndex}`);
      values.push(type_notification);
      paramIndex++;
    }

    if (lu !== undefined) {
      whereConditions.push(`lu = $${paramIndex}`);
      values.push(lu);
      paramIndex++;
    }

    if (date_debut) {
      whereConditions.push(`date_envoi >= $${paramIndex}`);
      values.push(date_debut);
      paramIndex++;
    }

    if (date_fin) {
      whereConditions.push(`date_envoi <= $${paramIndex}`);
      values.push(date_fin);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Requête pour les notifications
    const notificationsQuery = `
      SELECT * FROM notification_history 
      WHERE ${whereClause}
      ORDER BY date_envoi DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const notificationsResult = await db.query<NotificationHistory>(notificationsQuery, values);

    // Requête pour le total
    const countQuery = `
      SELECT COUNT(*) as total FROM notification_history 
      WHERE ${whereClause}
    `;
    const countResult = await db.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Statistiques
    const stats = await this.getNotificationStats(userId);

    return {
      notifications: notificationsResult.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      },
      stats
    };
  }

  async getNotificationById(notificationId: string, userId: string): Promise<NotificationHistory | null> {
    const query = `
      SELECT * FROM notification_history 
      WHERE idNotification = $1 AND utilisateur_id = $2 AND actif = true
    `;
    const result = await db.query<NotificationHistory>(query, [notificationId, userId]);
    return result.rows[0] || null;
  }

  // ========================================
  // MARQUAGE COMME LU
  // ========================================

  async markAsRead(notificationIds: string[], userId: string): Promise<MarkAsReadResponse> {
    const query = `
      UPDATE notification_history 
      SET lu = true, date_lecture = now()
      WHERE idNotification = ANY($1) AND utilisateur_id = $2 AND actif = true
      RETURNING *
    `;
    
    const result = await db.query<NotificationHistory>(query, [notificationIds, userId]);
    
    return {
      notifications_marked: result.rows.length,
      notifications: result.rows
    };
  }

  async markAllAsRead(userId: string, type_notification?: string): Promise<number> {
    let query = `
      UPDATE notification_history 
      SET lu = true, date_lecture = now()
      WHERE utilisateur_id = $1 AND lu = false AND actif = true
    `;
    const values: any[] = [userId];

    if (type_notification) {
      query += ` AND type_notification = $2`;
      values.push(type_notification);
    }

    query += ` RETURNING idNotification`;
    
    const result = await db.query(query, values);
    return result.rows.length;
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lu = false THEN 1 END) as non_lues,
        type_notification,
        COUNT(*) as count_by_type
      FROM notification_history 
      WHERE utilisateur_id = $1 AND actif = true
      GROUP BY type_notification
    `;

    const result = await db.query(statsQuery, [userId]);
    
    const stats: NotificationStats = {
      total: 0,
      non_lues: 0,
      par_type: {}
    };

    result.rows.forEach(row => {
      stats.total += parseInt(row.count_by_type);
      if (row.non_lues) {
        stats.non_lues += parseInt(row.non_lues);
      }
      stats.par_type[row.type_notification] = parseInt(row.count_by_type);
    });

    // Dernière lecture
    const lastReadQuery = `
      SELECT MAX(date_lecture) as derniere_lecture
      FROM notification_history 
      WHERE utilisateur_id = $1 AND lu = true AND actif = true
    `;
    const lastReadResult = await db.query(lastReadQuery, [userId]);
    stats.derniere_lecture = lastReadResult.rows[0]?.derniere_lecture;

    return stats;
  }

  // ========================================
  // SUPPRESSION
  // ========================================

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE notification_history 
      SET actif = false 
      WHERE idNotification = $1 AND utilisateur_id = $2
    `;
    const result = await db.query(query, [notificationId, userId]);
    return (result.rowCount || 0) > 0;
  }

  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
    const query = `
      UPDATE notification_history 
      SET actif = false 
      WHERE utilisateur_id = $1 
        AND date_envoi < now() - INTERVAL '${daysOld} days'
        AND actif = true
    `;
    const result = await db.query(query, [userId]);
    return result.rowCount || 0;
  }

  // Supprimer (désactiver) toutes les notifications de l'utilisateur
  async deleteAllNotifications(userId: string, type_notification?: string): Promise<number> {
    let query = `
      UPDATE notification_history
      SET actif = false
      WHERE utilisateur_id = $1 AND actif = true
    `;
    const values: any[] = [userId];

    if (type_notification) {
      query += ` AND type_notification = $2`;
      values.push(type_notification);
    }

    const result = await db.query(query, values);
    return result.rowCount || 0;
  }

  // ========================================
  // NETTOYAGE AUTOMATIQUE
  // ========================================

  async cleanupExpiredNotifications(): Promise<number> {
    const query = `
      UPDATE notification_history 
      SET actif = false 
      WHERE date_expiration IS NOT NULL 
        AND date_expiration < now() 
        AND actif = true
    `;
    const result = await db.query(query);
    return result.rowCount || 0;
  }
}
