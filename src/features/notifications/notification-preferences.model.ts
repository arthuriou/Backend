// ========================================
// MODÈLES PRÉFÉRENCES NOTIFICATION
// ========================================

export interface NotificationPreferences {
  idpreference?: string;
  utilisateur_id: string;
  soundenabled: boolean;
  soundfile: string;
  volume: number; // 0.0 à 1.0
  vibration: boolean;
  pushenabled: boolean;
  emailenabled: boolean;
  smsenabled: boolean;
}

// ========================================
// REQUÊTES
// ========================================

export interface UpdateNotificationPreferencesRequest {
  soundenabled?: boolean;
  soundfile?: string;
  volume?: number;
  vibration?: boolean;
  pushenabled?: boolean;
  emailenabled?: boolean;
  smsenabled?: boolean;
}

// ========================================
// RÉPONSES
// ========================================

export interface NotificationPreferencesResponse {
  message: string;
  data: NotificationPreferences;
}
