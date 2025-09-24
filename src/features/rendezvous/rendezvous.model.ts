// ========================================
// MODÈLES RENDEZ-VOUS
// ========================================

export interface RendezVous {
  idrendezvous: string;
  patient_id: string;
  medecin_id: string;
  creneau_id?: string;
  dateheure: Date;
  duree: number; // en minutes
  motif: string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'EN_COURS' | 'EN_ATTENTE_CONSULTATION';
  type_rdv?: 'PRESENTIEL' | 'TELECONSULTATION';
  lien_video?: string;
  salle_virtuelle?: string;
  token_acces?: string;
  adresse_cabinet?: string;
}

export interface Creneau {
  idcreneau: string;
  agenda_id: string;
  debut: Date;
  fin: Date;
  disponible: boolean;
}

export interface OldAgenda {
  idagenda: string;
  medecin_id: string;
  libelle: string;
}

export interface Rappel {
  idrappel: string;
  rendezvous_id: string;
  dateenvoi: Date;
  canal: 'SMS' | 'EMAIL' | 'PUSH';
  envoye: boolean;
}

// ========================================
// REQUÊTES
// ========================================

export interface CreateRendezVousRequest {
  patient_id: string;
  medecin_id: string;
  dateheure: string; // ISO string
  duree: number;
  motif: string;
  creneau_id?: string;
  type_rdv?: 'PRESENTIEL' | 'TELECONSULTATION';
  adresse_cabinet?: string;
  // New agenda slot booking
  agenda_id?: string;
  slot_start_at?: string; // ISO string
  slot_end_at?: string;   // ISO string
}

export interface UpdateRendezVousRequest {
  dateheure?: string;
  duree?: number;
  motif?: string;
  statut?: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'EN_COURS' | 'EN_ATTENTE_CONSULTATION';
  type_rdv?: 'PRESENTIEL' | 'TELECONSULTATION';
  adresse_cabinet?: string;
}

export interface CreateCreneauRequest {
  agenda_id: string;
  debut: string; // ISO string
  fin: string; // ISO string
  disponible?: boolean;
}

export interface CreateAgendaRequest {
  medecin_id: string;
  libelle: string;
}

// ========================================
// TÉLÉCONSULTATION
// ========================================

export interface TeleconsultationInfo {
  salle_virtuelle: string;
  lien_video: string;
  token_acces: string;
  date_expiration: Date;
}

export interface CreateTeleconsultationRequest {
  rendezvous_id: string;
  duree_minutes?: number; // Durée de la salle (défaut: 60 min)
}

export interface JoinTeleconsultationRequest {
  rendezvous_id: string;
  token_acces: string;
}

// ========================================
// RÉPONSES
// ========================================

export interface RendezVousWithDetails extends RendezVous {
  patient: {
    idpatient: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
  medecin: {
    idmedecin: string;
    nom: string;
    prenom: string;
    specialites: string[];
  };
  creneau?: Creneau;
}

export interface CreneauWithDetails extends Creneau {
  agenda: {
    idagenda: string;
    libelle: string;
    medecin: {
      idmedecin: string;
      nom: string;
      prenom: string;
    };
  };
}

export interface AgendaWithDetails extends OldAgenda {
  medecin: {
    idmedecin: string;
    nom: string;
    prenom: string;
    specialites: string[];
  };
  creneaux: Creneau[];
}
