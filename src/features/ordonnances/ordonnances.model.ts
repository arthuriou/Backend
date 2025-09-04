export interface Ordonnance {
  idordonnance?: string;
  consultation_id: string;
  date?: string | Date;
  dureetraitement?: number;
  renouvellements?: number;
  notes?: string;
}

export interface LigneOrdonnance {
  idligneordonnance?: string;
  ordonnance_id: string;
  medicament: string;
  dosage?: string;
  posologie?: string;
  dureejour?: number;
}

export interface CreateOrdonnanceRequest {
  consultation_id: string;
  date?: string | Date;
  dureetraitement?: number;
  renouvellements?: number;
  notes?: string;
  lignes?: Array<Pick<LigneOrdonnance, "medicament" | "dosage" | "posologie" | "dureejour">>;
}


