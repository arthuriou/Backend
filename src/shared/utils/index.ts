/**
 * Utilitaires partagés SantéAfrik
 * Exporte toutes les fonctions utilitaires
 */

// ================================
// CRYPTO & SÉCURITÉ
// ================================

export {
  hashPassword,
  verifyPassword,
  generateOTP,
  generateSecureToken,
  generateUUID,
  hashString,
  generateSalt,
  encryptString,
  decryptString
} from './crypto';

// ================================
// JWT & AUTHENTIFICATION
// ================================

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
  refreshAccessToken,
  getJWTConfig
} from './jwt';

// ================================
// EMAIL
// ================================

export {
  sendOTPEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
  sendAccountValidationEmail,
  sendPasswordResetEmail,
  isEmailConfigValid,
  getEmailConfig
} from './mail.utils';

// ================================
// BASE DE DONNÉES
// ================================

export {
  initializeDatabase,
  getConnection,
  query,
  transaction,
  closeDatabase,
  testConnection,
  getDatabaseInfo
} from '../config/database';

// ================================
// TYPES UTILITAIRES
// ================================

export type { DatabaseConfig } from '../types';
export type { AuthTokens, AuthUser } from '../types';
