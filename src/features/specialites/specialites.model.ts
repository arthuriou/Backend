// ========================================
// MODÈLES SPÉCIALITÉS & MAUX
// ========================================

export interface Specialite {
  idSpecialite?: string;
  nom: string;
  description?: string;
}

export interface Maux {
  idMaux?: string;
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
    idMedecin: string;
    nom: string;
    prenom: string;
    email: string;
  }[];
  cabinets?: {
    idCabinet: string;
    nom: string;
    adresse: string;
  }[];
  maux?: {
    idMaux: string;
    nom: string;
    categorie: string;
  }[];
}

export interface MauxWithDetails extends Maux {
  nombre_specialites?: number;
  specialites?: {
    idSpecialite: string;
    nom: string;
    description: string;
  }[];
}

export interface MedecinWithSpecialites {
  idMedecin: string;
  nom: string;
  prenom: string;
  email: string;
  specialites: {
    idSpecialite: string;
    nom: string;
    description: string;
  }[];
}

export interface CabinetWithSpecialites {
  idCabinet: string;
  nom: string;
  adresse: string;
  specialites: {
    idSpecialite: string;
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
  limit?: number;
  offset?: number;
}

export interface SearchCabinetBySpecialiteRequest {
  specialite_id: string;
  limit?: number;
  offset?: number;
}
