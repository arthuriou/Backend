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
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'EN_COURS';
}

export interface Creneau {
  idcreneau: string;
  agenda_id: string;
  debut: Date;
  fin: Date;
  disponible: boolean;
}

export interface Agenda {
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
}

export interface UpdateRendezVousRequest {
  dateheure?: string;
  duree?: number;
  motif?: string;
  statut?: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'EN_COURS';
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

export interface AgendaWithDetails extends Agenda {
  medecin: {
    idmedecin: string;
    nom: string;
    prenom: string;
    specialites: string[];
  };
  creneaux: Creneau[];
}
