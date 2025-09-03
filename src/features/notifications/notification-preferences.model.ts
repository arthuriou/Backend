// ========================================
// MODÈLES PRÉFÉRENCES NOTIFICATION
// ========================================

export interface NotificationPreferences {
  idPreference?: string;
  utilisateur_id: string;
  soundEnabled: boolean;
  soundFile: string;
  volume: number; // 0.0 à 1.0
  vibration: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  dateCreation?: Date;
  dateModification?: Date;
}

// ========================================
// REQUÊTES
// ========================================

export interface UpdateNotificationPreferencesRequest {
  soundEnabled?: boolean;
  soundFile?: string;
  volume?: number;
  vibration?: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
}

// ========================================
// RÉPONSES
// ========================================

export interface NotificationPreferencesResponse {
  message: string;
  data: NotificationPreferences;
}
