// ========================================
// MODÈLES RENDEZ-VOUS
// ========================================

export interface RendezVous {
  idRendezVous: string;
  patient_id: string;
  medecin_id: string;
  creneau_id?: string;
  dateHeure: Date;
  duree: number; // en minutes
  motif: string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'EN_COURS';
  dateCreation?: Date;
  dateModification?: Date;
}

export interface Creneau {
  idCreneau: string;
  agenda_id: string;
  debut: Date;
  fin: Date;
  disponible: boolean;
}

export interface Agenda {
  idAgenda: string;
  medecin_id: string;
  libelle: string;
}

export interface Rappel {
  idRappel: string;
  rendezvous_id: string;
  dateEnvoi: Date;
  canal: 'SMS' | 'EMAIL' | 'PUSH';
  envoye: boolean;
}

// ========================================
// REQUÊTES
// ========================================

export interface CreateRendezVousRequest {
  patient_id: string;
  medecin_id: string;
  dateHeure: string; // ISO string
  duree: number;
  motif: string;
  creneau_id?: string;
}

export interface UpdateRendezVousRequest {
  dateHeure?: string;
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
    idPatient: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
  medecin: {
    idMedecin: string;
    nom: string;
    prenom: string;
    specialites: string[];
  };
  creneau?: Creneau;
}

export interface CreneauWithDetails extends Creneau {
  agenda: {
    idAgenda: string;
    libelle: string;
    medecin: {
      idMedecin: string;
      nom: string;
      prenom: string;
    };
  };
}

export interface AgendaWithDetails extends Agenda {
  medecin: {
    idMedecin: string;
    nom: string;
    prenom: string;
    specialites: string[];
  };
  creneaux: Creneau[];
}
