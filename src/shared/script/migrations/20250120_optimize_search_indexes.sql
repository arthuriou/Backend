-- ========================================
-- MIGRATION: Optimisation des index de recherche
-- Date: 2025-01-20
-- Description: Ajout d'index pour optimiser les recherches de médecins
-- ========================================

-- Index pour la recherche de médecins par spécialité
CREATE INDEX IF NOT EXISTS idx_medecin_specialite_specialite_id 
ON medecin_specialite(specialite_id);

CREATE INDEX IF NOT EXISTS idx_medecin_specialite_medecin_id 
ON medecin_specialite(medecin_id);

-- Index pour la recherche de médecins par statut
CREATE INDEX IF NOT EXISTS idx_medecin_statut 
ON medecin(statut);

-- Index pour la recherche de médecins par cabinet
CREATE INDEX IF NOT EXISTS idx_medecin_cabinet_medecin_id 
ON medecin_cabinet(medecin_id);

CREATE INDEX IF NOT EXISTS idx_medecin_cabinet_cabinet_id 
ON medecin_cabinet(cabinet_id);

CREATE INDEX IF NOT EXISTS idx_medecin_cabinet_actif 
ON medecin_cabinet(actif);

-- Index pour la recherche de médecins par maux
CREATE INDEX IF NOT EXISTS idx_specialite_maux_specialite_id 
ON specialite_maux(specialite_id);

CREATE INDEX IF NOT EXISTS idx_specialite_maux_maux_id 
ON specialite_maux(maux_id);

-- Index pour la recherche textuelle sur les utilisateurs
CREATE INDEX IF NOT EXISTS idx_utilisateur_nom 
ON utilisateur(nom);

CREATE INDEX IF NOT EXISTS idx_utilisateur_prenom 
ON utilisateur(prenom);

CREATE INDEX IF NOT EXISTS idx_utilisateur_email 
ON utilisateur(email);

-- Index composite pour la recherche de médecins par spécialité et statut
CREATE INDEX IF NOT EXISTS idx_medecin_specialite_statut 
ON medecin_specialite(specialite_id, medecin_id) 
INCLUDE (specialite_id);

-- Index pour les rendez-vous par médecin et statut
CREATE INDEX IF NOT EXISTS idx_rendezvous_medecin_statut 
ON rendezvous(medecin_id, statut);

-- Index pour les rendez-vous par date
CREATE INDEX IF NOT EXISTS idx_rendezvous_dateheure 
ON rendezvous(dateheure);

-- Index pour les créneaux par agenda et disponibilité
CREATE INDEX IF NOT EXISTS idx_creneau_agenda_disponible 
ON creneau(agenda_id, disponible);

-- Index pour les créneaux par date
CREATE INDEX IF NOT EXISTS idx_creneau_debut 
ON creneau(debut);

-- Commentaires sur les index
COMMENT ON INDEX idx_medecin_specialite_specialite_id IS 'Optimise la recherche de médecins par spécialité';
COMMENT ON INDEX idx_medecin_statut IS 'Optimise le filtrage des médecins approuvés';
COMMENT ON INDEX idx_medecin_cabinet_actif IS 'Optimise la recherche de médecins actifs dans un cabinet';
COMMENT ON INDEX idx_utilisateur_nom IS 'Optimise la recherche textuelle par nom';
COMMENT ON INDEX idx_rendezvous_medecin_statut IS 'Optimise la récupération des RDV par statut';
COMMENT ON INDEX idx_creneau_agenda_disponible IS 'Optimise la recherche de créneaux disponibles';
