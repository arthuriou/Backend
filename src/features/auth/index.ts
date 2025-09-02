/**
 * Module d'authentification SantéAfrik
 * Exporte tous les composants du module d'authentification
 */

// Services
export { default as AuthService } from './auth.service';
export type { 
  InscriptionPatientData, 
  InscriptionMedecinData, 
  ConnexionData, 
  OTPVerificationData,
  ChangePasswordData 
} from './auth.service';

// Contrôleurs
export { default as AuthController } from './auth.controller';

// Validateurs
export { 
  validateInscriptionPatient, 
  validateInscriptionMedecin, 
  validateConnexion, 
  validateOTP, 
  validateChangePassword 
} from './auth.validator';
export type { ValidationResult } from './auth.validator';

// Routes
export { default as authRoutes } from './auth.routes';

// ================================
// RÉSUMÉ DU MODULE
// ================================

/**
 * 🚀 MODULE D'AUTHENTIFICATION SANTÉAFRIK
 * 
 * Ce module implémente le système d'authentification complet avec :
 * 
 * ✅ INSCRIPTION
 * - Patient : Inscription libre → OTP → Validation automatique
 * - Médecin : Auto-inscription → OTP → Statut PENDING → SuperAdmin valide
 * - AdminCabinet : Créé uniquement par SuperAdmin
 * - SuperAdmin : Créé uniquement en base
 * 
 * ✅ CONNEXION
 * - JWT avec access token + refresh token
 * - Vérification des statuts de compte
 * - Gestion des rôles et permissions (RBAC)
 * 
 * ✅ SÉCURITÉ
 * - Hachage des mots de passe avec bcrypt
 * - Validation OTP par email
 * - Middleware d'authentification et d'autorisation
 * - Validation stricte des données d'entrée
 * 
 * ✅ WORKFLOWS SPÉCIAUX
 * - AdminCabinet peut créer des médecins (statut APPROVED direct)
 * - SuperAdmin valide les médecins auto-inscrits
 * - Changement de mot de passe obligatoire à la première connexion
 * 
 * 📍 ENDPOINTS PRINCIPAUX
 * - POST /api/auth/inscription/patient
 * - POST /api/auth/inscription/medecin
 * - POST /api/auth/connexion
 * - POST /api/auth/verifier-otp
 * - POST /api/auth/changer-mot-de-passe
 * - POST /api/auth/admin/creer-medecin
 * - POST /api/auth/super-admin/valider-medecin
 */
