/**
 * Middleware d'authentification et d'autorisation pour SantéAfrik
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthUser } from '../types';
import { query } from '../config/database';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

/**
 * Récupère les permissions d'un utilisateur depuis ses rôles
 */
async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const result = await query(`
      SELECT DISTINCT p.code 
      FROM permission p
      INNER JOIN rolePermission rp ON p.idPermission = rp.permission_id
      INNER JOIN utilisateurRole ur ON rp.role_id = ur.role_id
      WHERE ur.utilisateur_id = $1 AND ur.actif = true
    `, [userId]);
    
    return result.rows.map(row => row.code);
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    return [];
  }
}

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware d'authentification JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: ['Token d\'authentification manquant']
      });
      return;
    }

    try {
      const decoded = verifyToken(token);
      
      // Créer l'objet utilisateur authentifié
      const user: AuthUser = {
        id: decoded.userId,
        email: decoded.email,
        roles: decoded.roles,
        nom: '', // Valeur par défaut
        actif: true, // Valeur par défaut
      };

      // Attacher l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: [error instanceof Error ? error.message : 'Token invalide']
      });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erreur lors de l\'authentification',
      errors: [error instanceof Error ? error.message : 'Erreur inconnue']
    });
  }
};

/**
 * Middleware de vérification des rôles
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: ['Utilisateur non authentifié']
      });
      return;
    }

    const userRoles = req.user.roles;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!userRoles.some(role => requiredRoles.includes(role))) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        errors: [`Rôle requis: ${requiredRoles.join(' ou ')}`]
      });
      return;
    }

    next();
  };
};

/**
 * Middleware de vérification des permissions
 */
export const requirePermission = (permissions: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: ['Utilisateur non authentifié']
      });
      return;
    }

    try {
      // Récupérer les permissions depuis les rôles de l'utilisateur
      const userPermissions = await getUserPermissions(req.user.id);
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
          errors: [`Permissions requises: ${requiredPermissions.join(', ')}`]
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions',
        errors: ['Erreur interne du serveur']
      });
    }
  };
};

/**
 * Middleware de vérification que l'utilisateur est actif
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
      errors: ['Utilisateur non authentifié']
    });
    return;
  }

  // Ici on pourrait vérifier si l'utilisateur est actif dans la base de données
  // Pour l'instant, on considère que si le token est valide, l'utilisateur est actif
  next();
};

/**
 * Middleware de vérification que l'utilisateur accède à ses propres ressources
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: ['Utilisateur non authentifié']
      });
      return;
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    if (resourceId !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        errors: ['Accès non autorisé à cette ressource']
      });
      return;
    }

    next();
  };
};

/**
 * Middleware de vérification des permissions avec logique personnalisée
 */
export const requireCustomPermission = (
  permissionChecker: (user: AuthUser, req: Request) => boolean
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: ['Utilisateur non authentifié']
      });
      return;
    }

    if (!permissionChecker(req.user, req)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        errors: ['Permissions insuffisantes pour cette action']
      });
      return;
    }

    next();
  };
};

export default {
  authenticateToken,
  requireRole,
  requirePermission,
  requireActiveUser,
  requireOwnership,
  requireCustomPermission,
};
