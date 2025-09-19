// ========================================
// MODÈLES NOTIFICATION HISTORY
// ========================================

export interface NotificationHistory {
  idNotification?: string;
  utilisateur_id: string;
  titre: string;
  contenu: string;
  type_notification: 'RENDEZ_VOUS' | 'MESSAGE' | 'RAPPEL' | 'SYSTEME' | 'URGENCE' | 'CABINET';
  canal: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
  data?: Record<string, any>;
  lu: boolean;
  date_envoi?: Date;
  date_lecture?: Date;
  date_expiration?: Date;
  actif?: boolean;
}

export interface NotificationReadPreferences {
  idPreference?: string;
  utilisateur_id: string;
  auto_marquer_lu: boolean;
  delai_auto_lu: number; // en minutes
  conserver_notifications: boolean;
  duree_conservation: number; // en jours
  date_creation?: Date;
  date_modification?: Date;
}

// ========================================
// REQUÊTES
// ========================================

export interface CreateNotificationRequest {
  utilisateur_id: string;
  titre: string;
  contenu: string;
  type_notification: 'RENDEZ_VOUS' | 'MESSAGE' | 'RAPPEL' | 'SYSTEME' | 'URGENCE' | 'CABINET';
  canal: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
  data?: Record<string, any>;
  date_expiration?: Date;
}

export interface MarkNotificationReadRequest {
  notification_ids: string[];
}

export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  type_notification?: string;
  lu?: boolean;
  date_debut?: Date;
  date_fin?: Date;
}

export interface NotificationStats {
  total: number;
  non_lues: number;
  par_type: Record<string, number>;
  derniere_lecture?: Date;
}

// ========================================
// RÉPONSES
// ========================================

export interface NotificationListResponse {
  notifications: NotificationHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats: NotificationStats;
}

export interface MarkAsReadResponse {
  notifications_marked: number;
  notifications: NotificationHistory[];
}
