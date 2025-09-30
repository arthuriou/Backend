-- Migration: Consultations et Templates
-- Date: 2025-09-30

-- Extensions nécessaires pour UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: consultations
CREATE TABLE IF NOT EXISTS consultations (
    idconsultation UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rendezvous_id UUID NOT NULL REFERENCES rendezvous(idrendezvous) ON DELETE CASCADE,
    medecin_id UUID NOT NULL REFERENCES medecin(idmedecin) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient(idpatient) ON DELETE CASCADE,
    diagnostique TEXT NOT NULL,
    antecedents TEXT,
    traitement_propose TEXT,
    prescriptions TEXT,
    observations TEXT,
    recommandations TEXT,
    examens_complementaires TEXT,
    date_consultation DATE NOT NULL DEFAULT CURRENT_DATE,
    suite_rendezvous_id UUID REFERENCES rendezvous(idrendezvous) ON DELETE SET NULL,
    statut TEXT NOT NULL CHECK (statut IN ('BROUILLON', 'FINALISE', 'ARCHIVE')) DEFAULT 'BROUILLON',
    template_utilise TEXT, -- ID du template utilisé (facultatif)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalise_le TIMESTAMPTZ
);

-- Table: consultation_templates
CREATE TABLE IF NOT EXISTS consultation_templates (
    idtemplate UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    specialite TEXT NOT NULL,
    description TEXT,
    diagnostique_template TEXT,
    antecedents_template TEXT,
    traitement_template TEXT,
    prescriptions_template TEXT,
    observations_template TEXT,
    recommandations_template TEXT,
    examens_template TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_consultations_rendezvous_id ON consultations(rendezvous_id);
CREATE INDEX IF NOT EXISTS idx_consultations_medecin_id ON consultations(medecin_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_statut ON consultations(statut);
CREATE INDEX IF NOT EXISTS idx_templates_specialite ON consultation_templates(specialite);

-- Templates par défaut pour différents types de consultations
INSERT INTO consultation_templates (nom, specialite, description, diagnostique_template, antecedents_template, traitement_template, prescriptions_template, observations_template, recommandations_template, examens_template)
VALUES
  ('Consultation generale adulte', 'GENERAL',
   'Template pour une consultation de routine chez l adulte',
   'Patient en bon etat general. Pas de signe d urgence.',
   'Antecedents medicaux a preciser.',
   'Traitement symptomatique selon les symptomes presentes.',
   'Prescriptions selon les besoins identifies.',
   'Patient ecoute et informe.',
   'Rendez-vous de suivi dans 3 mois si necessaire.',
   'Aucun examen complementaire necessaire pour l instant.'),

  ('Consultation cardiologie', 'CARDIOLOGIE',
   'Template pour consultation cardiologique',
   'Rythme cardiaque regulier. Pas de douleur thoracique.',
   'Antecedents cardiaques familiaux a evaluer.',
   'Regime alimentaire adapte et exercice physique regulier.',
   'Medicaments cardiovasculaires si necessaire.',
   'Tension arterielle et rythme cardiaque normaux.',
   'Echocardiographie recommandee en fonction des antecedents.',
   'ECG, echocardiographie selon les symptomes.'),

  ('Consultation pediatrie', 'PEDIATRIE',
   'Template pour consultation pediatrique de routine',
   'Enfant en bon developpement psychomoteur.',
   'Vaccinations a jour. Croissance normale.',
   'Hygiene de vie adaptee a l age.',
   'Supplements vitaminiques si necessaire.',
   'Vaccinations et croissance satisfaisantes.',
   'Visite de controle dans 3 mois.',
   'Bilan sanguin si malnutrition suspectee.'),

  ('Consultation dermatologie', 'DERMATOLOGIE',
   'Template pour consultation dermatologique',
   'Lesions cutanees a caracteriser.',
   'Antecedents dermatologiques personnels et familiaux.',
   'Soins locaux adaptes au type de lesion.',
   'Cremes et topiques selon prescription.',
   'Examen clinique complet realise.',
   'Controle evolutif selon evolution.',
   'Biopsie cutanee si suspicion de lesion maligne.');

-- Commentaires
COMMENT ON TABLE consultations IS 'Comptes-rendus de consultations médicales';
COMMENT ON TABLE consultation_templates IS 'Templates prédéfinis pour accélérer la rédaction de comptes-rendus';
