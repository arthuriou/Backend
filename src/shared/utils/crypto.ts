/**
 * Utilitaires de cryptographie pour SantéAfrik
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Configuration bcrypt
const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe avec bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Erreur lors du hachage du mot de passe: ${error}`);
  }
};

/**
 * Vérifie un mot de passe contre son hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Erreur lors de la vérification du mot de passe: ${error}`);
  }
};

/**
 * Génère un OTP (One-Time Password) de 6 chiffres
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Génère un token aléatoire sécurisé
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Génère un UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Hache une chaîne avec SHA-256
 */
export const hashString = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Génère un salt aléatoire
 */
export const generateSalt = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Chiffre une chaîne avec AES-256-GCM
 */
export const encryptString = (text: string, key: string): { encrypted: string; iv: string; tag: string } => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key.slice(0, 32)), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
};

/**
 * Déchiffre une chaîne chiffrée avec AES-256-GCM
 */
export const decryptString = (encrypted: string, key: string, iv: string, tag: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key.slice(0, 32)), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export default {
  hashPassword,
  verifyPassword,
  generateOTP,
  generateSecureToken,
  generateUUID,
  hashString,
  generateSalt,
  encryptString,
  decryptString,
};
