/**
 * Types et interfaces centralisés pour SantéAfrik
 * Basé sur le schéma SQL fourni
 */

// ================================
// TYPES DE BASE
// ================================

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// UTILISATEURS ET RÔLES
// ================================

export interface Utilisateur extends BaseEntity {
  email: string;
  motDePasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  dateCreation: Date;
  derniereConnexion?: Date;
  actif: boolean;
}

export interface Patient extends BaseEntity {
  utilisateurId: string;
  dateNaissance?: Date;
  genre?: string;
  adresse?: string;
  groupeSanguin?: string;
  poids?: number;
  taille?: number;
  statut: 'APPROVED' | 'PENDING' | 'SUSPENDED';
}

export interface Medecin extends BaseEntity {
  utilisateurId: string;
  numOrdre: string;
  experience?: number;
  biographie?: string;
  statut: 'PENDING' | 'APPROVED' | 'SUSPENDED';
}

export interface AdminCabinet extends BaseEntity {
  utilisateurId: string;
  roleAdmin: string;
}

export interface SuperAdmin extends BaseEntity {
  utilisateurId: string;
  niveauAcces: string;
}

export interface MedecinDiplome extends BaseEntity {
  medecinId: string;
  intitule: string;
  etablissement: string;
  pays: string;
  annee: number;
}

// ================================
// RBAC (ROLES ET PERMISSIONS)
// ================================

export interface Role extends BaseEntity {
  code: string;
  libelle: string;
  systeme: boolean;
}

export interface Permission extends BaseEntity {
  code: string;
  libelle: string;
  description?: string;
}

export interface UtilisateurRole extends BaseEntity {
  utilisateurId: string;
  roleId: string;
  attribueLe: Date;
  actif: boolean;
}

export interface RolePermission extends BaseEntity {
  roleId: string;
  permissionId: string;
}

// ================================
// CABINETS ET SPÉCIALITÉS
// ================================

export interface Cabinet extends BaseEntity {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logo?: string;
  horairesOuverture: HorairesOuverture;
}

export interface HorairesOuverture {
  lundi: JourOuverture;
  mardi: JourOuverture;
  mercredi: JourOuverture;
  jeudi: JourOuverture;
  vendredi: JourOuverture;
  samedi: JourOuverture;
  dimanche: JourOuverture;
}

export interface JourOuverture {
  ouvert: boolean;
  debut: string;
  fin: string;
}

export interface Specialite extends BaseEntity {
  nom: string;
  description?: string;
}

export interface Maux extends BaseEntity {
  nom: string;
  description?: string;
  categorie?: string;
}

// Relations N..N
export interface MedecinCabinet extends BaseEntity {
  medecinId: string;
  cabinetId: string;
  dateAffectation: Date;
  roleCabinet: string;
}

export interface MedecinSpecialite extends BaseEntity {
  medecinId: string;
  specialiteId: string;
}

export interface CabinetSpecialite extends BaseEntity {
  cabinetId: string;
  specialiteId: string;
}

export interface SpecialiteMaux extends BaseEntity {
  specialiteId: string;
  mauxId: string;
}

// ================================
// AGENDA ET CRÉNEAUX
// ================================

export interface Agenda extends BaseEntity {
  medecinId: string;
  libelle: string;
}

export interface Creneau extends BaseEntity {
  agendaId: string;
  debut: Date;
  fin: Date;
  disponible: boolean;
}

// ================================
// RENDEZ-VOUS ET CONSULTATIONS
// ================================

export type CanalEnum = 'SMS' | 'EMAIL' | 'PUSH';

export interface RendezVous extends BaseEntity {
  patientId: string;
  medecinId: string;
  creneauId?: string;
  dateHeure: Date;
  duree: number;
  motif: string;
  statut: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'TERMINE';
}

export interface Rappel extends BaseEntity {
  rendezVousId: string;
  dateEnvoi: Date;
  canal: CanalEnum;
  envoye: boolean;
}

export interface Consultation extends BaseEntity {
  rendezVousId: string;
  date: Date;
  diagnostic?: string;
  notes?: string;
}

export interface Ordonnance extends BaseEntity {
  consultationId: string;
  date: Date;
  dureeTraitement: number;
  renouvellements: number;
  notes?: string;
}

export interface LigneOrdonnance extends BaseEntity {
  ordonnanceId: string;
  medicament: string;
  dosage: string;
  posologie: string;
  dureeJour: number;
}

// ================================
// DOSSIER MÉDICAL
// ================================

export interface DossierMedical extends BaseEntity {
  patientId: string;
  dateCreation: Date;
  dateMaj?: Date;
}

export interface Document extends BaseEntity {
  dossierId: string;
  nom: string;
  type: string;
  url: string;
  mimeType: string;
  tailleKo: number;
  dateUpload: Date;
  isPublic: boolean;
}

// ================================
// MESSAGERIE
// ================================

export interface Conversation extends BaseEntity {
  dateDebut: Date;
  sujet?: string;
  active: boolean;
}

export interface Message extends BaseEntity {
  conversationId: string;
  auteurId: string;
  contenu: string;
  dateEnvoi: Date;
  lu: boolean;
}

export interface MessageMedia extends BaseEntity {
  messageId: string;
  type: 'IMAGE' | 'AUDIO';
  url: string;
  mimeType?: string;
  tailleKo?: number;
  dateUpload: Date;
}

// ================================
// TYPES UTILITAIRES
// ================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ================================
// CONFIGURATION
// ================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  checkPeriod: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}
