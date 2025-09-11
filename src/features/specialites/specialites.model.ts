// ========================================
// MODÈLES SPÉCIALITÉS & MAUX
// ========================================

export interface Specialite {
  idspecialite?: string;
  nom: string;
  description?: string;
}

export interface Maux {
  idmaux?: string;
  nom: string;
  description?: string;
  categorie?: string;
}

export interface MedecinSpecialite {
  medecin_id: string;
  specialite_id: string;
}

export interface CabinetSpecialite {
  cabinet_id: string;
  specialite_id: string;
}

export interface SpecialiteMaux {
  specialite_id: string;
  maux_id: string;
}

// ========================================
// REQUÊTES
// ========================================

export interface CreateSpecialiteRequest {
  nom: string;
  description?: string;
}

export interface UpdateSpecialiteRequest {
  nom?: string;
  description?: string;
}

export interface CreateMauxRequest {
  nom: string;
  description?: string;
  categorie?: string;
}

export interface UpdateMauxRequest {
  nom?: string;
  description?: string;
  categorie?: string;
}

export interface AssociateMedecinSpecialiteRequest {
  medecin_id: string;
  specialite_id: string;
}

export interface AssociateCabinetSpecialiteRequest {
  cabinet_id: string;
  specialite_id: string;
}

export interface AssociateSpecialiteMauxRequest {
  specialite_id: string;
  maux_id: string;
}

// ========================================
// RÉPONSES
// ========================================

export interface SpecialiteWithDetails extends Specialite {
  nombre_medecins?: number;
  nombre_cabinets?: number;
  nombre_maux?: number;
  medecins?: {
    idmedecin: string;
    nom: string;
    prenom: string;
    email: string;
  }[];
  cabinets?: {
    idcabinet: string;
    nom: string;
    adresse: string;
  }[];
  maux?: {
    idmaux: string;
    nom: string;
    categorie: string;
  }[];
}

export interface MauxWithDetails extends Maux {
  nombre_specialites?: number;
  specialites?: {
    idspecialite: string;
    nom: string;
    description: string;
  }[];
}

export interface MedecinWithSpecialites {
  idmedecin: string;
  nom: string;
  prenom: string;
  email: string;
  photoprofil?: string | null;
  experience?: number | null;
  biographie?: string | null;
  specialites: {
    idspecialite: string;
    nom: string;
    description: string;
  }[];
}

export interface CabinetWithSpecialites {
  idcabinet: string;
  nom: string;
  adresse: string;
  specialites: {
    idspecialite: string;
    nom: string;
    description: string;
  }[];
}

export interface SpecialiteListResponse {
  specialites: SpecialiteWithDetails[];
  total: number;
}

export interface MauxListResponse {
  maux: MauxWithDetails[];
  total: number;
}

export interface MedecinSpecialiteListResponse {
  medecins: MedecinWithSpecialites[];
  total: number;
}

export interface CabinetSpecialiteListResponse {
  cabinets: CabinetWithSpecialites[];
  total: number;
}

// ========================================
// TYPES POUR LES RECHERCHES
// ========================================

export interface SearchSpecialiteRequest {
  nom?: string;
  description?: string;
  medecin_id?: string;
  cabinet_id?: string;
  maux_id?: string;
  limit?: number;
  offset?: number;
}

export interface SearchMauxRequest {
  nom?: string;
  categorie?: string;
  specialite_id?: string;
  limit?: number;
  offset?: number;
}

export interface SearchMedecinBySpecialiteRequest {
  specialite_id: string;
  cabinet_id?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface SearchCabinetBySpecialiteRequest {
  specialite_id: string;
  limit?: number;
  offset?: number;
}
