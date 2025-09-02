/**
 * Utilitaires JWT pour l'authentification SantéAfrik
 */

import jwt from 'jsonwebtoken';
import { AuthUser } from '../types';

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Interface pour le payload JWT
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * Interface pour les tokens
 */
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Génère un token d'accès JWT
 */
export const generateAccessToken = (user: AuthUser): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'santeafrik',
    audience: 'santeafrik-users',
  } as jwt.SignOptions);
};

/**
 * Génère un token de rafraîchissement JWT
 */
export const generateRefreshToken = (user: AuthUser): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'santeafrik',
    audience: 'santeafrik-users',
  } as jwt.SignOptions);
};

/**
 * Génère les tokens d'accès et de rafraîchissement
 */
export const generateTokens = (user: AuthUser): Tokens => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Calculer l'expiration en secondes
  const expiresIn = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24h en secondes
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'santeafrik',
      audience: 'santeafrik-users',
    } as jwt.VerifyOptions) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expiré');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token invalide');
    } else {
      throw new Error('Erreur de vérification du token');
    }
  }
};

/**
 * Décode un token JWT sans vérification (pour debug uniquement)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Vérifie si un token est expiré
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Extrait le token du header Authorization
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Rafraîchit un token d'accès avec un token de rafraîchissement
 */
export const refreshAccessToken = (refreshToken: string): string => {
  try {
    const decoded = verifyToken(refreshToken);
    
    // Créer un nouvel utilisateur à partir du token décodé
    const user: AuthUser = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    };
    
    return generateAccessToken(user);
  } catch (error) {
    throw new Error('Impossible de rafraîchir le token');
  }
};

/**
 * Obtient les informations de configuration JWT
 */
export const getJWTConfig = () => ({
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
  refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
  issuer: 'santeafrik',
  audience: 'santeafrik-users',
});

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
  refreshAccessToken,
  getJWTConfig,
};
