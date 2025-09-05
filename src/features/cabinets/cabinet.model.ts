/**
 * Modèle des cabinets
 */

export interface Cabinet {
  idcabinet?: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo?: string;
  horairesouverture?: any; // JSONB
  actif?: boolean;
}

export interface AdminCabinet {
  idadmincabinet?: string;
  utilisateur_id: string;
  cabinet_id: string;
  roleadmin: string;
  dateaffectation?: Date;
}

export interface CreateCabinetRequest {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo?: string;
  horairesouverture?: any;
}

export interface CreateAdminCabinetRequest {
  email: string;
  motdepasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  cabinetId: string;
  roleadmin: string;
}

export interface CabinetResponse {
  success: boolean;
  message: string;
  data?: Cabinet | AdminCabinet;
}
