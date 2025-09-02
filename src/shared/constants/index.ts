/**
 * Constantes centralisées pour SantéAfrik
 */

// ================================
// RÔLES ET PERMISSIONS
// ================================

export const ROLES = {
  PATIENT: 'PATIENT',
  MEDECIN: 'MEDECIN',
  ADMIN_CABINET: 'ADMIN_CABINET',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

export const PERMISSIONS = {
  // Patients
  PATIENT_READ_PROFILE: 'PATIENT_READ_PROFILE',
  PATIENT_UPDATE_PROFILE: 'PATIENT_UPDATE_PROFILE',
  PATIENT_CREATE_RDV: 'PATIENT_CREATE_RDV',
  PATIENT_READ_RDV: 'PATIENT_READ_RDV',
  PATIENT_CANCEL_RDV: 'PATIENT_CANCEL_RDV',
  PATIENT_READ_DOSSIER: 'PATIENT_READ_DOSSIER',
  PATIENT_SEND_MESSAGE: 'PATIENT_SEND_MESSAGE',
  
  // Médecins
  MEDECIN_READ_PROFILE: 'MEDECIN_READ_PROFILE',
  MEDECIN_UPDATE_PROFILE: 'MEDECIN_UPDATE_PROFILE',
  MEDECIN_READ_RDV: 'MEDECIN_READ_RDV',
  MEDECIN_UPDATE_RDV: 'MEDECIN_UPDATE_RDV',
  MEDECIN_CREATE_CONSULTATION: 'MEDECIN_CREATE_CONSULTATION',
  MEDECIN_READ_DOSSIER: 'MEDECIN_READ_DOSSIER',
  MEDECIN_SEND_MESSAGE: 'MEDECIN_SEND_MESSAGE',
  
  // Admin Cabinet
  ADMIN_CABINET_READ_CABINET: 'ADMIN_CABINET_READ_CABINET',
  ADMIN_CABINET_UPDATE_CABINET: 'ADMIN_CABINET_UPDATE_CABINET',
  ADMIN_CABINET_CREATE_MEDECIN: 'ADMIN_CABINET_CREATE_MEDECIN',
  ADMIN_CABINET_READ_STATS: 'ADMIN_CABINET_READ_STATS',
  ADMIN_CABINET_MANAGE_RDV: 'ADMIN_CABINET_MANAGE_RDV',
  
  // Super Admin
  SUPER_ADMIN_READ_ALL: 'SUPER_ADMIN_READ_ALL',
  SUPER_ADMIN_CREATE_CABINET: 'SUPER_ADMIN_CREATE_CABINET',
  SUPER_ADMIN_APPROVE_MEDECIN: 'SUPER_ADMIN_APPROVE_MEDECIN',
  SUPER_ADMIN_MANAGE_USERS: 'SUPER_ADMIN_MANAGE_USERS',
  SUPER_ADMIN_MANAGE_ROLES: 'SUPER_ADMIN_MANAGE_ROLES'
} as const;

// ================================
// STATUTS
// ================================

export const STATUTS = {
  // Utilisateurs
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  
  // Rendez-vous
  CONFIRME: 'CONFIRME',
  EN_ATTENTE: 'EN_ATTENTE',
  ANNULE: 'ANNULE',
  TERMINE: 'TERMINE',
  
  // Conversations
  OUVERTE: 'OUVERTE',
  FERMEE: 'FERMEE'
} as const;

// ================================
// TYPES DE MESSAGES
// ================================

export const MESSAGE_TYPES = {
  TEXTE: 'TEXTE',
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  FICHIER: 'FICHIER'
} as const;

// ================================
// CANAUX DE NOTIFICATION
// ================================

export const CANAUX = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH'
} as const;

// ================================
// LIMITES ET CONFIGURATIONS
// ================================

export const LIMITS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Fichiers
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_AUDIO_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Messages
  MAX_MESSAGE_LENGTH: 1000,
  MAX_MEDIA_PER_MESSAGE: 5,
  
  // Rendez-vous
  MIN_RDV_ADVANCE: 24 * 60 * 60 * 1000, // 24h
  MAX_RDV_ADVANCE: 30 * 24 * 60 * 60 * 1000, // 30 jours
  
  // OTP
  OTP_LENGTH: 6,
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  OTP_MAX_ATTEMPTS: 3
} as const;

// ================================
// MESSAGES D'ERREUR
// ================================

export const ERROR_MESSAGES = {
  // Authentification
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  USER_INACTIVE: 'Compte utilisateur inactif',
  INVALID_TOKEN: 'Token invalide ou expiré',
  INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  
  // Validation
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Format d\'email invalide',
  INVALID_PHONE: 'Format de téléphone invalide',
  INVALID_DATE: 'Date invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  
  // Rendez-vous
  RDV_NOT_FOUND: 'Rendez-vous non trouvé',
  RDV_ALREADY_EXISTS: 'Un rendez-vous existe déjà à cette date',
  RDV_CANNOT_CANCEL: 'Impossible d\'annuler ce rendez-vous',
  CRENEAU_NOT_AVAILABLE: 'Ce créneau n\'est pas disponible',
  
  // Base de données
  DB_CONNECTION_ERROR: 'Erreur de connexion à la base de données',
  DB_QUERY_ERROR: 'Erreur lors de l\'exécution de la requête',
  DB_TRANSACTION_ERROR: 'Erreur lors de la transaction'
} as const;

// ================================
// MESSAGES DE SUCCÈS
// ================================

export const SUCCESS_MESSAGES = {
  // Authentification
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  REGISTRATION_SUCCESS: 'Inscription réussie',
  PASSWORD_RESET_SUCCESS: 'Mot de passe réinitialisé',
  
  // Rendez-vous
  RDV_CREATED: 'Rendez-vous créé avec succès',
  RDV_UPDATED: 'Rendez-vous mis à jour',
  RDV_CANCELLED: 'Rendez-vous annulé',
  
  // Messages
  MESSAGE_SENT: 'Message envoyé',
  MESSAGE_READ: 'Message marqué comme lu'
} as const;

// ================================
// CODES DE STATUT HTTP
// ================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// ================================
// ENVIRONNEMENTS
// ================================

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;
