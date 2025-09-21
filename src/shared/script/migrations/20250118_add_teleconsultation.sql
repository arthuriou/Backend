-- ========================================
-- MIGRATION: AJOUT TÉLÉCONSULTATION
-- Date: 2025-01-18
-- Description: Ajout des champs pour gérer présentiel + téléconsultation
-- ========================================

-- 1. Ajouter le type de rendez-vous
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS type_rdv TEXT DEFAULT 'PRESENTIEL' 
CHECK (type_rdv IN ('PRESENTIEL', 'TELECONSULTATION'));

-- 2. Ajouter les champs pour téléconsultation
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS lien_video TEXT;
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS salle_virtuelle TEXT;
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS token_acces TEXT;
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS adresse_cabinet TEXT;

-- 3. Ajouter le statut EN_ATTENTE_CONSULTATION
DO $$
BEGIN
    -- Vérifier si la valeur existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'EN_ATTENTE_CONSULTATION' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'statut_rdv_enum')
    ) THEN
        ALTER TYPE statut_rdv_enum ADD VALUE 'EN_ATTENTE_CONSULTATION';
    END IF;
END$$;

-- 4. Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_rendezvous_type_rdv ON rendezvous(type_rdv);
CREATE INDEX IF NOT EXISTS idx_rendezvous_salle_virtuelle ON rendezvous(salle_virtuelle);

-- 5. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN rendezvous.type_rdv IS 'Type de rendez-vous: PRESENTIEL ou TELECONSULTATION';
COMMENT ON COLUMN rendezvous.lien_video IS 'URL du lien video pour la teleconsultation';
COMMENT ON COLUMN rendezvous.salle_virtuelle IS 'ID de la salle virtuelle (Jitsi, Zoom, etc.)';
COMMENT ON COLUMN rendezvous.token_acces IS 'Token d''acces securise pour la salle virtuelle';
COMMENT ON COLUMN rendezvous.adresse_cabinet IS 'Adresse du cabinet pour les RDV presentiels';

-- 6. Mettre à jour les RDV existants (optionnel)
-- UPDATE rendezvous SET type_rdv = 'PRESENTIEL' WHERE type_rdv IS NULL;
