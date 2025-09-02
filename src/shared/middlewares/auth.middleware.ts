/**
 * Middleware d'authentification et d'autorisation pour SantéAfrik
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthUser } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

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
        role: decoded.role,
        permissions: decoded.permissions,
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

    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
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
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        errors: ['Utilisateur non authentifié']
      });
      return;
    }

    const userPermissions = req.user.permissions;
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
