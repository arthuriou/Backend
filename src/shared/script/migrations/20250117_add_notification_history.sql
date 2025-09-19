-- ========================================
-- MIGRATION: Ajout du système de notifications avec statut de lecture
-- Date: 2025-01-17
-- ========================================

-- Table pour l'historique des notifications
CREATE TABLE IF NOT EXISTS notification_history (
    idNotification UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    titre TEXT NOT NULL,
    contenu TEXT NOT NULL,
    type_notification TEXT NOT NULL CHECK (type_notification IN (
        'RENDEZ_VOUS', 'MESSAGE', 'RAPPEL', 'SYSTEME', 'URGENCE', 'CABINET'
    )),
    canal TEXT NOT NULL CHECK (canal IN ('PUSH', 'EMAIL', 'SMS', 'IN_APP')),
    data JSONB, -- Données supplémentaires (ID du rendez-vous, message, etc.)
    lu BOOLEAN DEFAULT false,
    date_envoi TIMESTAMP DEFAULT now(),
    date_lecture TIMESTAMP,
    date_expiration TIMESTAMP, -- Pour les notifications temporaires
    actif BOOLEAN DEFAULT true
);

-- Table pour les préférences de lecture des notifications
CREATE TABLE IF NOT EXISTS notification_read_preferences (
    idPreference UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    auto_marquer_lu BOOLEAN DEFAULT false, -- Marquer automatiquement comme lu après X temps
    delai_auto_lu INTEGER DEFAULT 0, -- Délai en minutes (0 = désactivé)
    conserver_notifications BOOLEAN DEFAULT true, -- Conserver l'historique
    duree_conservation INTEGER DEFAULT 30, -- Durée en jours
    date_creation TIMESTAMP DEFAULT now(),
    date_modification TIMESTAMP DEFAULT now(),
    UNIQUE(utilisateur_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_notification_user ON notification_history(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_notification_type ON notification_history(type_notification);
CREATE INDEX IF NOT EXISTS idx_notification_lu ON notification_history(lu);
CREATE INDEX IF NOT EXISTS idx_notification_date ON notification_history(date_envoi);
CREATE INDEX IF NOT EXISTS idx_notification_actif ON notification_history(actif);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notification_user_lu ON notification_history(utilisateur_id, lu);
CREATE INDEX IF NOT EXISTS idx_notification_user_type ON notification_history(utilisateur_id, type_notification);
