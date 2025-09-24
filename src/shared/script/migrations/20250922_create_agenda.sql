-- Migration: Agenda (agendas, rules, blocks, extra availabilities)
-- Date: 2025-09-22

-- Extensions nécessaires pour UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: agendas
CREATE TABLE IF NOT EXISTS agendas (
    idagenda UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medecin_id UUID NOT NULL REFERENCES medecin(idMedecin) ON DELETE CASCADE,
    cabinet_id UUID NULL REFERENCES cabinet(idCabinet) ON DELETE SET NULL,
    nom TEXT NOT NULL,
    visible_en_ligne BOOLEAN NOT NULL DEFAULT true,
    default_duration_min INTEGER NOT NULL DEFAULT 30,
    buffer_before_min INTEGER NOT NULL DEFAULT 0,
    buffer_after_min INTEGER NOT NULL DEFAULT 0,
    timezone TEXT NOT NULL DEFAULT 'Africa/Abidjan',
    confirmation_mode TEXT NOT NULL CHECK (confirmation_mode IN ('AUTO','MANUELLE')) DEFAULT 'MANUELLE',
    allow_double_booking BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendas_medecin_id ON agendas(medecin_id);
CREATE INDEX IF NOT EXISTS idx_agendas_cabinet_id ON agendas(cabinet_id);

-- Table: availability_rules
CREATE TABLE IF NOT EXISTS availability_rules (
    idrule UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID NOT NULL REFERENCES agendas(idagenda) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_min INTEGER NOT NULL,
    allowed_types TEXT NOT NULL CHECK (allowed_types IN ('PRESENTIEL','TELECONSULTATION','TOUS')) DEFAULT 'TOUS',
    start_date DATE NULL,
    end_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_rules_agenda_id ON availability_rules(agenda_id);
CREATE INDEX IF NOT EXISTS idx_rules_agenda_weekday ON availability_rules(agenda_id, weekday);

-- Table: agenda_blocks (indisponibilités)
CREATE TABLE IF NOT EXISTS agenda_blocks (
    idblock UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID NOT NULL REFERENCES agendas(idagenda) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    reason TEXT NULL,
    created_by UUID NOT NULL REFERENCES utilisateur(idUtilisateur) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_blocks_agenda_id ON agenda_blocks(agenda_id);
CREATE INDEX IF NOT EXISTS idx_blocks_timerange ON agenda_blocks(agenda_id, start_at, end_at);

-- Table: extra_availability (disponibilités ponctuelles)
CREATE TABLE IF NOT EXISTS extra_availability (
    idextra UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID NOT NULL REFERENCES agendas(idagenda) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PRESENTIEL','TELECONSULTATION')),
    visible_en_ligne BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_extra_agenda_id ON extra_availability(agenda_id);
CREATE INDEX IF NOT EXISTS idx_extra_timerange ON extra_availability(agenda_id, start_at, end_at);

-- Commentaires
COMMENT ON TABLE agendas IS 'Agendas des médecins (planning)';
COMMENT ON TABLE availability_rules IS 'Règles récurrentes de disponibilités par jour de semaine';
COMMENT ON TABLE agenda_blocks IS 'Indisponibilités (bloquages) sur des plages';
COMMENT ON TABLE extra_availability IS 'Disponibilités ponctuelles (ouvertures exceptionnelles)';


