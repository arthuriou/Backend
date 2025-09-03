/**
 * Modèle des cabinets
 */

export interface Cabinet {
  idCabinet?: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo?: string;
  horairesOuverture?: any; // JSONB
  dateCreation?: Date;
}

export interface AdminCabinet {
  idAdminCabinet?: string;
  utilisateur_id: string;
  cabinet_id: string;
  roleAdmin: string;
  dateAffectation?: Date;
}

export interface CreateCabinetRequest {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo?: string;
  horairesOuverture?: any;
}

export interface CreateAdminCabinetRequest {
  email: string;
  motdepasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  cabinetId: string;
  roleAdmin: string;
}

export interface CabinetResponse {
  success: boolean;
  message: string;
  data?: Cabinet | AdminCabinet;
}
