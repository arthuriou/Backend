/**
 * Modèle d'authentification
 */

export interface User {
  idutilisateur?: string;
  email: string;
  motdepasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  photoprofil?: string;
  datecreation?: Date;
  derniereconnexion?: Date;
  actif: boolean;
  role?: string;
}

export interface Patient {
  idpatient?: string;
  utilisateur_id: string;
  datenaissance?: Date;
  genre?: string;
  adresse?: string;
  groupesanguin?: string;
  poids?: number;
  taille?: number;
  statut: string;
}

export interface Medecin {
  idmedecin?: string;
  utilisateur_id: string;
  numordre: string;
  experience?: number;
  biographie?: string;
  statut: string;
}
export interface AdminCabinet {
  idadmincabinet?: string;
  utilisateur_id: string;
  roleadmin: string;
}

export interface SuperAdmin {
  idsuperadmin?: string;
  utilisateur_id: string;
  niveauacces: string;
}

export interface LoginRequest {
  email: string;
  motdepasse: string;
}

export interface RegisterPatientRequest {
  email: string;
  motdepasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  datenaissance?: string;
  genre?: string;
  adresse?: string;
  groupesanguin?: string;
  poids?: number;
  taille?: number;
}

export interface RegisterMedecinRequest {
  email: string;
  motdepasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  numordre: string;
  experience?: number;
  biographie?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

