import pool from "../../shared/database/client";

// Types pour les comptes-rendus de consultation
export interface Consultation {
  idconsultation: string;
  rendezvous_id: string;
  medecin_id: string;
  patient_id: string;
  diagnostique: string;
  antecedents?: string;
  traitement_propose?: string;
  prescriptions?: string;
  observations?: string;
  recommandations?: string;
  examens_complementaires?: string;
  date_consultation: string;
  suite_rendezvous_id?: string;
  statut: 'BROUILLON' | 'FINALISE' | 'ARCHIVE';
  template_utilise?: string;
  created_at: string;
  updated_at: string;
  finalise_le?: string;
}

export interface CreateConsultationRequest {
  rendezvous_id: string;
  diagnostique: string;
  antecedents?: string;
  traitement_propose?: string;
  prescriptions?: string;
  observations?: string;
  recommandations?: string;
  examens_complementaires?: string;
  date_consultation?: string;
  template_utilise?: string;
}

export interface UpdateConsultationRequest {
  diagnostique?: string;
  antecedents?: string;
  traitement_propose?: string;
  prescriptions?: string;
  observations?: string;
  recommandations?: string;
  examens_complementaires?: string;
  statut?: 'BROUILLON' | 'FINALISE' | 'ARCHIVE';
}

export interface ConsultationTemplate {
  idtemplate: string;
  nom: string;
  specialite: string;
  description: string;
  diagnostique_template?: string;
  antecedents_template?: string;
  traitement_template?: string;
  prescriptions_template?: string;
  observations_template?: string;
  recommandations_template?: string;
  examens_template?: string;
}

export const StatutsConsultation = {
  BROUILLON: 'BROUILLON',
  FINALISE: 'FINALISE',
  ARCHIVE: 'ARCHIVE'
} as const;

export type StatutConsultation = typeof StatutsConsultation[keyof typeof StatutsConsultation];
