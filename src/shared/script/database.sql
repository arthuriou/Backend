-- ========================================
-- SCRIPT D'INITIALISATION BASE DE DONNÉES
-- SANTÉAFRIK - PLATEFORME MÉDICALE
-- ========================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- TABLE UTILISATEUR + HERITAGE
-- ================================

CREATE TABLE IF NOT EXISTS utilisateur (
    idUtilisateur UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    motDePasse TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT,
    telephone TEXT UNIQUE,
    dateCreation TIMESTAMP DEFAULT now(),
    derniereConnexion TIMESTAMP,
    actif BOOLEAN DEFAULT true,
    mustChangePassword BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS patient (
    idPatient UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID UNIQUE REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    dateNaissance DATE,
    genre TEXT,
    adresse TEXT,
    groupeSanguin TEXT,
    poids NUMERIC,
    taille NUMERIC,
    statut TEXT DEFAULT 'APPROVED'   -- validé direct après OTP
);

CREATE TABLE IF NOT EXISTS medecin (
    idMedecin UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID UNIQUE REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    numOrdre TEXT UNIQUE NOT NULL,
    experience INT,
    biographie TEXT,
    statut TEXT DEFAULT 'PENDING'   -- validé par SuperAdmin ou direct APPROVED si créé par AdminCabinet
);

CREATE TABLE IF NOT EXISTS adminCabinet (
    idAdminCabinet UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID UNIQUE REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    roleAdmin TEXT
);

CREATE TABLE IF NOT EXISTS superAdmin (
    idSuperAdmin UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID UNIQUE REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    niveauAcces TEXT
);

-- Diplômes médecin
CREATE TABLE IF NOT EXISTS medecinDiplome (
    idDiplome UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medecin_id UUID REFERENCES medecin(idMedecin) ON DELETE CASCADE,
    intitule TEXT,
    etablissement TEXT,
    pays TEXT,
    annee INT
);

-- ================================
-- ROLES & PERMISSIONS (RBAC)
-- ================================

CREATE TABLE IF NOT EXISTS role (
    idRole UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    libelle TEXT NOT NULL,
    systeme BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS permission (
    idPermission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    libelle TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS utilisateurRole (
    idUtilisateurRole UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    role_id UUID REFERENCES role(idRole) ON DELETE CASCADE,
    attribueLe TIMESTAMP DEFAULT now(),
    actif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS rolePermission (
    idRolePermission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES role(idRole) ON DELETE CASCADE,
    permission_id UUID REFERENCES permission(idPermission) ON DELETE CASCADE
);

-- ================================
-- CABINETS & SPECIALITES
-- ================================

CREATE TABLE IF NOT EXISTS cabinet (
    idCabinet UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    logo TEXT,
    horairesOuverture JSONB,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS specialite (
    idSpecialite UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS maux (
    idMaux UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT,
    description TEXT,
    categorie TEXT
);

-- Relations N..N
CREATE TABLE IF NOT EXISTS medecin_cabinet (
    medecin_id UUID REFERENCES medecin(idMedecin) ON DELETE CASCADE,
    cabinet_id UUID REFERENCES cabinet(idCabinet) ON DELETE CASCADE,
    dateAffectation TIMESTAMP DEFAULT now(),
    roleCabinet TEXT DEFAULT 'MEDECIN',
    actif BOOLEAN DEFAULT true,
    PRIMARY KEY (medecin_id, cabinet_id)
);

CREATE TABLE IF NOT EXISTS medecin_specialite (
    medecin_id UUID REFERENCES medecin(idMedecin) ON DELETE CASCADE,
    specialite_id UUID REFERENCES specialite(idSpecialite) ON DELETE CASCADE,
    PRIMARY KEY (medecin_id, specialite_id)
);

CREATE TABLE IF NOT EXISTS cabinet_specialite (
    cabinet_id UUID REFERENCES cabinet(idCabinet) ON DELETE CASCADE,
    specialite_id UUID REFERENCES specialite(idSpecialite) ON DELETE CASCADE,
    PRIMARY KEY (cabinet_id, specialite_id)
);

CREATE TABLE IF NOT EXISTS specialite_maux (
    specialite_id UUID REFERENCES specialite(idSpecialite) ON DELETE CASCADE,
    maux_id UUID REFERENCES maux(idMaux) ON DELETE CASCADE,
    PRIMARY KEY (specialite_id, maux_id)
);

-- ================================
-- AGENDA / CRENEAU
-- ================================

CREATE TABLE IF NOT EXISTS agenda (
    idAgenda UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medecin_id UUID REFERENCES medecin(idMedecin) ON DELETE CASCADE,
    libelle TEXT
);

CREATE TABLE IF NOT EXISTS creneau (
    idCreneau UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID REFERENCES agenda(idAgenda) ON DELETE CASCADE,
    debut TIMESTAMP NOT NULL,
    fin TIMESTAMP NOT NULL,
    disponible BOOLEAN DEFAULT true
);

-- ================================
-- RDV / CONSULTATIONS / ORDONNANCES
-- ================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canal_enum') THEN
        CREATE TYPE canal_enum AS ENUM ('SMS','EMAIL','PUSH');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS rendezvous (
    idRendezVous UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patient(idPatient) ON DELETE CASCADE,
    medecin_id UUID REFERENCES medecin(idMedecin) ON DELETE CASCADE,
    creneau_id UUID REFERENCES creneau(idCreneau),
    dateHeure TIMESTAMP,
    duree INT,
    motif TEXT,
    statut TEXT
);

CREATE TABLE IF NOT EXISTS rappel (
    idRappel UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rendezvous_id UUID REFERENCES rendezvous(idRendezVous) ON DELETE CASCADE,
    dateEnvoi TIMESTAMP,
    canal canal_enum NOT NULL,
    envoye BOOLEAN DEFAULT false
);

-- Table pour les préférences de notification des utilisateurs
CREATE TABLE IF NOT EXISTS preferences_notification (
    idPreference UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    soundEnabled BOOLEAN DEFAULT true,
    soundFile TEXT DEFAULT '/sounds/notification.mp3',
    volume DECIMAL(3,2) DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
    vibration BOOLEAN DEFAULT true,
    pushEnabled BOOLEAN DEFAULT false,
    emailEnabled BOOLEAN DEFAULT true,
    smsEnabled BOOLEAN DEFAULT false,
    dateCreation TIMESTAMP DEFAULT now(),
    dateModification TIMESTAMP DEFAULT now(),
    UNIQUE(utilisateur_id)
);

-- Table pour les conversations
CREATE TABLE IF NOT EXISTS conversation (
    idConversation UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_conversation TEXT NOT NULL CHECK (type_conversation IN ('PRIVEE', 'GROUPE_CABINET', 'SUPPORT')),
    titre TEXT,
    cabinet_id UUID REFERENCES cabinet(idCabinet) ON DELETE CASCADE,
    dateCreation TIMESTAMP DEFAULT now(),
    dateModification TIMESTAMP DEFAULT now(),
    actif BOOLEAN DEFAULT true
);

-- Table pour les participants aux conversations
CREATE TABLE IF NOT EXISTS conversation_participant (
    idParticipant UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversation(idConversation) ON DELETE CASCADE,
    utilisateur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    role_participant TEXT DEFAULT 'MEMBRE' CHECK (role_participant IN ('MEMBRE', 'ADMIN', 'MODERATEUR')),
    dateRejointe TIMESTAMP DEFAULT now(),
    dateQuittee TIMESTAMP,
    actif BOOLEAN DEFAULT true,
    UNIQUE(conversation_id, utilisateur_id)
);

-- Table pour les messages
CREATE TABLE IF NOT EXISTS message (
    idMessage UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversation(idConversation) ON DELETE CASCADE,
    expediteur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    type_message TEXT DEFAULT 'TEXTE' CHECK (type_message IN ('TEXTE', 'IMAGE', 'FICHIER', 'SYSTEME')),
    fichier_url TEXT,
    fichier_nom TEXT,
    fichier_taille INTEGER,
    reponse_a UUID REFERENCES message(idMessage) ON DELETE SET NULL,
    dateEnvoi TIMESTAMP DEFAULT now(),
    dateModification TIMESTAMP,
    supprime BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true
);

-- Table pour le statut de lecture des messages
CREATE TABLE IF NOT EXISTS message_lu (
    idMessageLu UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES message(idMessage) ON DELETE CASCADE,
    utilisateur_id UUID REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE,
    dateLecture TIMESTAMP DEFAULT now(),
    UNIQUE(message_id, utilisateur_id)
);

CREATE TABLE IF NOT EXISTS consultation (
    idConsultation UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rendezvous_id UUID UNIQUE REFERENCES rendezvous(idRendezVous) ON DELETE CASCADE,
    date TIMESTAMP,
    diagnostic TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS ordonnance (
    idOrdonnance UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultation(idConsultation) ON DELETE CASCADE,
    date DATE,
    dureeTraitement INT,
    renouvellements INT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS ligne_ordonnance (
    idLigneOrdonnance UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordonnance_id UUID REFERENCES ordonnance(idOrdonnance) ON DELETE CASCADE,
    medicament TEXT,
    dosage TEXT,
    posologie TEXT,
    dureeJour INT
);

-- ================================
-- DOSSIER MEDICAL
-- ================================

CREATE TABLE IF NOT EXISTS dossierMedical (
    idDossier UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID UNIQUE REFERENCES patient(idPatient) ON DELETE CASCADE,
    dateCreation DATE DEFAULT now(),
    dateMaj DATE
);

CREATE TABLE IF NOT EXISTS document (
    idDocument UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID REFERENCES dossierMedical(idDossier) ON DELETE CASCADE,
    nom TEXT,
    type TEXT,
    url TEXT,
    mimeType TEXT,
    tailleKo INT,
    dateUpload TIMESTAMP,
    isPublic BOOLEAN DEFAULT false
);

-- ================================
-- MESSAGERIE
-- ================================

-- ================================
-- INDEX POUR PERFORMANCE
-- ================================

-- Index sur les emails et téléphones
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_utilisateur_telephone ON utilisateur(telephone);

-- Index sur les statuts
CREATE INDEX IF NOT EXISTS idx_patient_statut ON patient(statut);
CREATE INDEX IF NOT EXISTS idx_medecin_statut ON medecin(statut);

-- Index sur les rendez-vous
CREATE INDEX IF NOT EXISTS idx_rendezvous_date ON rendezvous(dateHeure);
CREATE INDEX IF NOT EXISTS idx_rendezvous_statut ON rendezvous(statut);
CREATE INDEX IF NOT EXISTS idx_rendezvous_patient ON rendezvous(patient_id);
CREATE INDEX IF NOT EXISTS idx_rendezvous_medecin ON rendezvous(medecin_id);

-- Index sur les messages
CREATE INDEX IF NOT EXISTS idx_message_conversation ON message(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_auteur ON message(auteur_id);
CREATE INDEX IF NOT EXISTS idx_message_date ON message(dateEnvoi);

-- Index sur les créneaux
CREATE INDEX IF NOT EXISTS idx_creneau_debut ON creneau(debut);
CREATE INDEX IF NOT EXISTS idx_creneau_disponible ON creneau(disponible);

-- ================================
-- DONNÉES INITIALES
-- ================================

-- Insertion des rôles de base
INSERT INTO role (code, libelle, systeme) VALUES
('PATIENT', 'Patient', true),
('MEDECIN', 'Médecin', true),
('ADMIN_CABINET', 'Administrateur de Cabinet', true),
('SUPER_ADMIN', 'Super Administrateur', true)
ON CONFLICT (code) DO NOTHING;

-- Insertion des permissions de base
INSERT INTO permission (code, libelle, description) VALUES
-- Permissions Patient
('PATIENT_READ_PROFILE', 'Lire son profil', 'Permet au patient de lire son profil'),
('PATIENT_UPDATE_PROFILE', 'Modifier son profil', 'Permet au patient de modifier son profil'),
('PATIENT_CREATE_RDV', 'Créer un rendez-vous', 'Permet au patient de créer un rendez-vous'),
('PATIENT_READ_RDV', 'Lire ses rendez-vous', 'Permet au patient de lire ses rendez-vous'),
('PATIENT_CANCEL_RDV', 'Annuler un rendez-vous', 'Permet au patient d''annuler un rendez-vous'),
('PATIENT_READ_DOSSIER', 'Lire son dossier médical', 'Permet au patient de lire son dossier médical'),
('PATIENT_SEND_MESSAGE', 'Envoyer un message', 'Permet au patient d''envoyer un message'),

-- Permissions Médecin
('MEDECIN_READ_PROFILE', 'Lire son profil', 'Permet au médecin de lire son profil'),
('MEDECIN_UPDATE_PROFILE', 'Modifier son profil', 'Permet au médecin de modifier son profil'),
('MEDECIN_READ_RDV', 'Lire ses rendez-vous', 'Permet au médecin de lire ses rendez-vous'),
('MEDECIN_UPDATE_RDV', 'Modifier un rendez-vous', 'Permet au médecin de modifier un rendez-vous'),
('MEDECIN_CREATE_CONSULTATION', 'Créer une consultation', 'Permet au médecin de créer une consultation'),
('MEDECIN_READ_DOSSIER', 'Lire un dossier médical', 'Permet au médecin de lire un dossier médical'),
('MEDECIN_SEND_MESSAGE', 'Envoyer un message', 'Permet au médecin d''envoyer un message'),

-- Permissions Admin Cabinet
('ADMIN_CABINET_READ_CABINET', 'Lire le cabinet', 'Permet de lire les informations du cabinet'),
('ADMIN_CABINET_UPDATE_CABINET', 'Modifier le cabinet', 'Permet de modifier les informations du cabinet'),
('ADMIN_CABINET_CREATE_MEDECIN', 'Créer un médecin', 'Permet de créer un médecin dans le cabinet'),
('ADMIN_CABINET_READ_STATS', 'Lire les statistiques', 'Permet de lire les statistiques du cabinet'),
('ADMIN_CABINET_MANAGE_RDV', 'Gérer les rendez-vous', 'Permet de gérer tous les rendez-vous du cabinet'),

-- Permissions Super Admin
('SUPER_ADMIN_READ_ALL', 'Tout lire', 'Permet de tout lire dans le système'),
('SUPER_ADMIN_CREATE_CABINET', 'Créer un cabinet', 'Permet de créer un cabinet'),
('SUPER_ADMIN_APPROVE_MEDECIN', 'Approuver un médecin', 'Permet d''approuver un médecin'),
('SUPER_ADMIN_MANAGE_USERS', 'Gérer les utilisateurs', 'Permet de gérer tous les utilisateurs'),
('SUPER_ADMIN_MANAGE_ROLES', 'Gérer les rôles', 'Permet de gérer les rôles et permissions')
ON CONFLICT (code) DO NOTHING;

-- Attribution des permissions aux rôles
-- Patient
INSERT INTO rolePermission (role_id, permission_id)
SELECT r.idRole, p.idPermission
FROM role r, permission p
WHERE r.code = 'PATIENT' 
AND p.code IN ('PATIENT_READ_PROFILE', 'PATIENT_UPDATE_PROFILE', 'PATIENT_CREATE_RDV', 'PATIENT_READ_RDV', 'PATIENT_CANCEL_RDV', 'PATIENT_READ_DOSSIER', 'PATIENT_SEND_MESSAGE')
ON CONFLICT DO NOTHING;

-- Médecin
INSERT INTO rolePermission (role_id, permission_id)
SELECT r.idRole, p.idPermission
FROM role r, permission p
WHERE r.code = 'MEDECIN' 
AND p.code IN ('MEDECIN_READ_PROFILE', 'MEDECIN_UPDATE_PROFILE', 'MEDECIN_READ_RDV', 'MEDECIN_UPDATE_RDV', 'MEDECIN_CREATE_CONSULTATION', 'MEDECIN_READ_DOSSIER', 'MEDECIN_SEND_MESSAGE')
ON CONFLICT DO NOTHING;

-- Admin Cabinet
INSERT INTO rolePermission (role_id, permission_id)
SELECT r.idRole, p.idPermission
FROM role r, permission p
WHERE r.code = 'ADMIN_CABINET' 
AND p.code IN ('ADMIN_CABINET_READ_CABINET', 'ADMIN_CABINET_UPDATE_CABINET', 'ADMIN_CABINET_CREATE_MEDECIN', 'ADMIN_CABINET_READ_STATS', 'ADMIN_CABINET_MANAGE_RDV')
ON CONFLICT DO NOTHING;

-- Super Admin
INSERT INTO rolePermission (role_id, permission_id)
SELECT r.idRole, p.idPermission
FROM role r, permission p
WHERE r.code = 'SUPER_ADMIN' 
AND p.code IN ('SUPER_ADMIN_READ_ALL', 'SUPER_ADMIN_CREATE_CABINET', 'SUPER_ADMIN_APPROVE_MEDECIN', 'SUPER_ADMIN_MANAGE_USERS', 'SUPER_ADMIN_MANAGE_ROLES')
ON CONFLICT DO NOTHING;

-- Insertion des spécialités de base
INSERT INTO specialite (nom, description) VALUES
('Cardiologie', 'Spécialité médicale du cœur et des vaisseaux sanguins'),
('Dermatologie', 'Spécialité médicale de la peau'),
('Gynécologie', 'Spécialité médicale de la femme'),
('Pédiatrie', 'Spécialité médicale de l''enfant'),
('Psychiatrie', 'Spécialité médicale de la santé mentale'),
('Radiologie', 'Spécialité médicale de l''imagerie médicale'),
('Chirurgie générale', 'Spécialité chirurgicale générale'),
('Médecine générale', 'Médecine de famille et générale')
ON CONFLICT DO NOTHING;

-- ================================
-- MESSAGE DE SUCCÈS
-- ================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de données SantéAfrik initialisée avec succès !';
    RAISE NOTICE '📊 Tables créées : %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE '🔐 Rôles créés : %', (SELECT count(*) FROM role);
    RAISE NOTICE '🔑 Permissions créées : %', (SELECT count(*) FROM permission);
    RAISE NOTICE '🏥 Spécialités créées : %', (SELECT count(*) FROM specialite);
END $$;
