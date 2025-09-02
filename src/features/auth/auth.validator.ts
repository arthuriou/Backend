/**
 * Validateur d'authentification SantéAfrik
 * Valide les données d'entrée pour l'authentification
 */

import { ValidationError } from '../../shared/types';

// ================================
// TYPES DE VALIDATION
// ================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// ================================
// VALIDATEURS
// ================================

/**
 * Valide l'inscription d'un patient
 */
export function validateInscriptionPatient(data: any): ValidationResult<any> {
  const errors: ValidationError[] = [];
  
  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email requis et doit être une chaîne' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }
  
  // Mot de passe
  if (!data.motDePasse || typeof data.motDePasse !== 'string') {
    errors.push({ field: 'motDePasse', message: 'Mot de passe requis et doit être une chaîne' });
  } else if (data.motDePasse.length < 8) {
    errors.push({ field: 'motDePasse', message: 'Le mot de passe doit contenir au moins 8 caractères' });
  } else if (!isValidPassword(data.motDePasse)) {
    errors.push({ field: 'motDePasse', message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' });
  }
  
  // Nom
  if (!data.nom || typeof data.nom !== 'string') {
    errors.push({ field: 'nom', message: 'Nom requis et doit être une chaîne' });
  } else if (data.nom.trim().length < 2) {
    errors.push({ field: 'nom', message: 'Le nom doit contenir au moins 2 caractères' });
  }
  
  // Prénom (optionnel)
  if (data.prenom && typeof data.prenom !== 'string') {
    errors.push({ field: 'prenom', message: 'Le prénom doit être une chaîne' });
  } else if (data.prenom && data.prenom.trim().length < 2) {
    errors.push({ field: 'prenom', message: 'Le prénom doit contenir au moins 2 caractères' });
  }
  
  // Téléphone (optionnel)
  if (data.telephone && typeof data.telephone !== 'string') {
    errors.push({ field: 'telephone', message: 'Le téléphone doit être une chaîne' });
  } else if (data.telephone && !isValidPhone(data.telephone)) {
    errors.push({ field: 'telephone', message: 'Format de téléphone invalide' });
  }
  
  // Date de naissance (optionnel)
  if (data.dateNaissance && !isValidDate(data.dateNaissance)) {
    errors.push({ field: 'dateNaissance', message: 'Format de date invalide' });
  }
  
  // Genre (optionnel)
  if (data.genre && !['M', 'F', 'Autre'].includes(data.genre)) {
    errors.push({ field: 'genre', message: 'Genre invalide (M, F, Autre)' });
  }
  
  // Adresse (optionnel)
  if (data.adresse && typeof data.adresse !== 'string') {
    errors.push({ field: 'adresse', message: 'L\'adresse doit être une chaîne' });
  }
  
  // Groupe sanguin (optionnel)
  if (data.groupeSanguin && !isValidBloodGroup(data.groupeSanguin)) {
    errors.push({ field: 'groupeSanguin', message: 'Groupe sanguin invalide' });
  }
  
  // Poids (optionnel)
  if (data.poids !== undefined && (typeof data.poids !== 'number' || data.poids <= 0 || data.poids > 500)) {
    errors.push({ field: 'poids', message: 'Le poids doit être un nombre positif entre 0 et 500 kg' });
  }
  
  // Taille (optionnel)
  if (data.taille !== undefined && (typeof data.taille !== 'number' || data.taille <= 0 || data.taille > 300)) {
    errors.push({ field: 'taille', message: 'La taille doit être un nombre positif entre 0 et 300 cm' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data };
}

/**
 * Valide l'inscription d'un médecin
 */
export function validateInscriptionMedecin(data: any): ValidationResult<any> {
  const errors: ValidationError[] = [];
  
  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email requis et doit être une chaîne' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }
  
  // Mot de passe
  if (!data.motDePasse || typeof data.motDePasse !== 'string') {
    errors.push({ field: 'motDePasse', message: 'Mot de passe requis et doit être une chaîne' });
  } else if (data.motDePasse.length < 8) {
    errors.push({ field: 'motDePasse', message: 'Le mot de passe doit contenir au moins 8 caractères' });
  } else if (!isValidPassword(data.motDePasse)) {
    errors.push({ field: 'motDePasse', message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' });
  }
  
  // Nom
  if (!data.nom || typeof data.nom !== 'string') {
    errors.push({ field: 'nom', message: 'Nom requis et doit être une chaîne' });
  } else if (data.nom.trim().length < 2) {
    errors.push({ field: 'nom', message: 'Le nom doit contenir au moins 2 caractères' });
  }
  
  // Prénom (optionnel)
  if (data.prenom && typeof data.prenom !== 'string') {
    errors.push({ field: 'prenom', message: 'Le prénom doit être une chaîne' });
  } else if (data.prenom && data.prenom.trim().length < 2) {
    errors.push({ field: 'prenom', message: 'Le prénom doit contenir au moins 2 caractères' });
  }
  
  // Téléphone (optionnel)
  if (data.telephone && typeof data.telephone !== 'string') {
    errors.push({ field: 'telephone', message: 'Le téléphone doit être une chaîne' });
  } else if (data.telephone && !isValidPhone(data.telephone)) {
    errors.push({ field: 'telephone', message: 'Format de téléphone invalide' });
  }
  
  // Numéro d'ordre (obligatoire pour les médecins)
  if (!data.numOrdre || typeof data.numOrdre !== 'string') {
    errors.push({ field: 'numOrdre', message: 'Numéro d\'ordre requis et doit être une chaîne' });
  } else if (data.numOrdre.trim().length < 3) {
    errors.push({ field: 'numOrdre', message: 'Le numéro d\'ordre doit contenir au moins 3 caractères' });
  }
  
  // Expérience (optionnel)
  if (data.experience !== undefined && (typeof data.experience !== 'number' || data.experience < 0 || data.experience > 50)) {
    errors.push({ field: 'experience', message: 'L\'expérience doit être un nombre entre 0 et 50 ans' });
  }
  
  // Biographie (optionnel)
  if (data.biographie && typeof data.biographie !== 'string') {
    errors.push({ field: 'biographie', message: 'La biographie doit être une chaîne' });
  } else if (data.biographie && data.biographie.length > 1000) {
    errors.push({ field: 'biographie', message: 'La biographie ne peut pas dépasser 1000 caractères' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data };
}

/**
 * Valide la connexion
 */
export function validateConnexion(data: any): ValidationResult<any> {
  const errors: ValidationError[] = [];
  
  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email requis et doit être une chaîne' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }
  
  // Mot de passe
  if (!data.motDePasse || typeof data.motDePasse !== 'string') {
    errors.push({ field: 'motDePasse', message: 'Mot de passe requis et doit être une chaîne' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data };
}

/**
 * Valide la vérification OTP
 */
export function validateOTP(data: any): ValidationResult<any> {
  const errors: ValidationError[] = [];
  
  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email requis et doit être une chaîne' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }
  
  // OTP
  if (!data.otp || typeof data.otp !== 'string') {
    errors.push({ field: 'otp', message: 'OTP requis et doit être une chaîne' });
  } else if (data.otp.length !== 6) {
    errors.push({ field: 'otp', message: 'L\'OTP doit contenir exactement 6 caractères' });
  } else if (!/^\d{6}$/.test(data.otp)) {
    errors.push({ field: 'otp', message: 'L\'OTP doit contenir uniquement des chiffres' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data };
}

/**
 * Valide le changement de mot de passe
 */
export function validateChangePassword(data: any): ValidationResult<any> {
  const errors: ValidationError[] = [];
  
  // ID utilisateur
  if (!data.utilisateurId || typeof data.utilisateurId !== 'string') {
    errors.push({ field: 'utilisateurId', message: 'ID utilisateur requis et doit être une chaîne' });
  }
  
  // Ancien mot de passe
  if (!data.ancienMotDePasse || typeof data.ancienMotDePasse !== 'string') {
    errors.push({ field: 'ancienMotDePasse', message: 'Ancien mot de passe requis et doit être une chaîne' });
  }
  
  // Nouveau mot de passe
  if (!data.nouveauMotDePasse || typeof data.nouveauMotDePasse !== 'string') {
    errors.push({ field: 'nouveauMotDePasse', message: 'Nouveau mot de passe requis et doit être une chaîne' });
  } else if (data.nouveauMotDePasse.length < 8) {
    errors.push({ field: 'nouveauMotDePasse', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
  } else if (!isValidPassword(data.nouveauMotDePasse)) {
    errors.push({ field: 'nouveauMotDePasse', message: 'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' });
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data };
}

// ================================
// FONCTIONS UTILITAIRES DE VALIDATION
// ================================

/**
 * Valide le format d'un email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide la complexité d'un mot de passe
 */
function isValidPassword(password: string): boolean {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Valide le format d'un numéro de téléphone
 */
function isValidPhone(phone: string): boolean {
  // Format international ou local (Togo)
  const phoneRegex = /^(\+228|228)?[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valide le format d'une date
 */
function isValidDate(date: any): boolean {
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * Valide un groupe sanguin
 */
function isValidBloodGroup(bloodGroup: string): boolean {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bloodGroup.toUpperCase());
}
