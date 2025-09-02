/**
 * Contrôleur d'authentification SantéAfrik
 * Gère les endpoints REST pour l'authentification
 */

import { Request, Response } from 'express';
import AuthService, { 
  InscriptionPatientData, 
  InscriptionMedecinData, 
  ConnexionData, 
  OTPVerificationData,
  ChangePasswordData
} from './auth.service';
import { validateInscriptionPatient, validateInscriptionMedecin, validateConnexion, validateOTP, validateChangePassword } from './auth.validator';

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        nom: string;
        prenom?: string;
        actif: boolean;
      };
    }
  }
}

export class AuthController {
  
  /**
   * Inscription d'un patient
   * POST /api/auth/inscription/patient
   */
  async inscrirePatient(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validation = validateInscriptionPatient(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.errors
        });
        return;
      }
      
      const data: InscriptionPatientData = validation.data;
      
      // Appel au service
      const result = await AuthService.inscrirePatient(data);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            utilisateurId: result.utilisateurId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur inscription patient:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Inscription d'un médecin (auto-inscription)
   * POST /api/auth/inscription/medecin
   */
  async inscrireMedecin(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validation = validateInscriptionMedecin(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.errors
        });
        return;
      }
      
      const data: InscriptionMedecinData = validation.data;
      
      // Appel au service
      const result = await AuthService.inscrireMedecin(data);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            utilisateurId: result.utilisateurId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur inscription médecin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Connexion utilisateur
   * POST /api/auth/connexion
   */
  async connecter(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validation = validateConnexion(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.errors
        });
        return;
      }
      
      const data: ConnexionData = validation.data;
      
      // Appel au service
      const result = await AuthService.connecter(data);
      
      if (result.success && result.tokens && result.user) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            tokens: result.tokens
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Vérification OTP
   * POST /api/auth/verifier-otp
   */
  async verifierOTP(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validation = validateOTP(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.errors
        });
        return;
      }
      
      const data: OTPVerificationData = validation.data;
      
      // Appel au service
      const result = await AuthService.verifierOTP(data);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur vérification OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Changement de mot de passe
   * POST /api/auth/changer-mot-de-passe
   */
  async changerMotDePasse(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validation = validateChangePassword(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.errors
        });
        return;
      }
      
      const data: ChangePasswordData = validation.data;
      
      // Appel au service
      const result = await AuthService.changerMotDePasse(data);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur changement mot de passe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Création d'un médecin par AdminCabinet
   * POST /api/auth/admin/creer-medecin
   */
  async creerMedecinParAdmin(req: Request, res: Response): Promise<void> {
    try {
      // Validation des données
      const validation = validateInscriptionMedecin(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validation.errors
        });
        return;
      }
      
      const data: InscriptionMedecinData = validation.data;
      const adminCabinetId = req.user?.id; // Récupéré du middleware d'auth
      
      if (!adminCabinetId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
        return;
      }
      
      // Appel au service
      const result = await AuthService.creerMedecinParAdmin(data, adminCabinetId);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            utilisateurId: result.utilisateurId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur création médecin par admin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Validation d'un médecin par SuperAdmin
   * POST /api/auth/super-admin/valider-medecin
   */
  async validerMedecin(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.body;
      
      if (!medecinId) {
        res.status(400).json({
          success: false,
          message: 'ID du médecin requis'
        });
        return;
      }
      
      const superAdminId = req.user?.id; // Récupéré du middleware d'auth
      
      if (!superAdminId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
        return;
      }
      
      // Appel au service
      const result = await AuthService.validerMedecin(medecinId, superAdminId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
    } catch (error) {
      console.error('Erreur contrôleur validation médecin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Rafraîchir le token d'accès
   * POST /api/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Token de rafraîchissement requis'
        });
        return;
      }
      
      // TODO: Implémenter la logique de rafraîchissement
      // Pour l'instant, on retourne une erreur
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
      
    } catch (error) {
      console.error('Erreur contrôleur refresh token:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Déconnexion
   * POST /api/auth/deconnexion
   */
  async deconnexion(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la logique de déconnexion (blacklist token)
      // Pour l'instant, on retourne un succès
      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
      
    } catch (error) {
      console.error('Erreur contrôleur déconnexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  
  /**
   * Vérifier le statut de l'authentification
   * GET /api/auth/status
   */
  async verifierStatut(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la vérification du statut
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur vérifier statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Renvoi OTP
   * POST /api/auth/renvoyer-otp
   */
  async renvoyerOTP(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter le renvoi OTP
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur renvoi OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Rafraîchir le token d'accès
   * POST /api/auth/rafraichir-token
   */
  async rafraichirToken(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter le rafraîchissement de token
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur rafraîchir token:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Lister les médecins du cabinet
   * GET /api/auth/admin/medecins-cabinet
   */
  async listerMedecinsCabinet(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la liste des médecins du cabinet
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur lister médecins cabinet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Lister les médecins en attente
   * GET /api/auth/super-admin/medecins-en-attente
   */
  async listerMedecinsEnAttente(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la liste des médecins en attente
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur lister médecins en attente:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Créer un cabinet
   * POST /api/auth/super-admin/creer-cabinet
   */
  async creerCabinet(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la création de cabinet
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur créer cabinet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Créer un Admin Cabinet
   * POST /api/auth/super-admin/creer-admin-cabinet
   */
  async creerAdminCabinet(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la création d'admin cabinet
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur créer admin cabinet:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Créer un Super Admin (développement uniquement)
   * POST /api/auth/dev/creer-super-admin
   */
  async creerSuperAdminDev(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la création de super admin pour les tests
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur créer super admin dev:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Créer un Admin Cabinet (développement uniquement)
   * POST /api/auth/dev/creer-admin-cabinet
   */
  async creerAdminCabinetDev(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la création d'admin cabinet pour les tests
      res.status(501).json({
        success: false,
        message: 'Fonctionnalité non implémentée'
      });
    } catch (error) {
      console.error('Erreur contrôleur créer admin cabinet dev:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export default new AuthController();
