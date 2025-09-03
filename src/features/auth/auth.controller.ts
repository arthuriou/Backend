import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { User } from "./auth.model";
import { getMissingFields } from "../../shared/utils/validator";

export class AuthController {
  private service: AuthService;
  
  constructor() {
    this.service = new AuthService();
  }

  async createPatient(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email", "motdepasse", "nom"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const {
        email,
        motdepasse,
        nom,
        prenom,
        telephone,
        datenaissance,
        genre,
        adresse,
        groupesanguin,
        poids,
        taille
      } = req.body;

      const user = await this.service.createPatient(
        email,
        motdepasse,
        nom,
        prenom,
        telephone,
        datenaissance ? new Date(datenaissance) : undefined,
        genre,
        adresse,
        groupesanguin,
        poids,
        taille
      );

      res.status(201).json({
        message: "Patient créé avec succès",
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  async createMedecin(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email", "motdepasse", "nom", "numordre"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const {
        email,
        motdepasse,
        nom,
        prenom,
        telephone,
        numordre,
        experience,
        biographie
      } = req.body;

      const user = await this.service.createMedecin(
        email,
        motdepasse,
        nom,
        numordre,
        prenom,
        telephone,
        experience,
        biographie
      );

      res.status(201).json({
        message: "Médecin créé avec succès. En attente de validation.",
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email", "motdepasse"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { email, motdepasse } = req.body;
      const result = await this.service.login(email, motdepasse);
      
      res.status(200).json({
        message: "Connexion réussie",
        data: {
          user: result.user,
          token: result.token
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Envoyer OTP
  async sendOTP(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { email } = req.body;
      const success = await this.service.sendOTP(email);
      
      if (success) {
        res.status(200).json({
          message: "OTP envoyé avec succès",
        });
      } else {
        res.status(400).json({
          message: "Erreur lors de l'envoi de l'OTP",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur interne du serveur",
      });
    }
  }

  // Vérifier OTP
  async verifyOTP(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email", "otp"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { email, otp } = req.body;
      const isValid = await this.service.verifyOTP(email, otp);
      
      if (isValid) {
        res.status(200).json({
          message: "Compte vérifié avec succès",
        });
      } else {
        res.status(400).json({
          message: "Code OTP invalide ou expiré",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur interne du serveur",
      });
    }
  }

  // Renvoyer OTP
  async resendOTP(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { email } = req.body;
      const success = await this.service.resendOTP(email);
      
      if (success) {
        res.status(200).json({
          message: "OTP renvoyé avec succès",
        });
      } else {
        res.status(400).json({
          message: "Erreur lors du renvoi de l'OTP",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur interne du serveur",
      });
    }
  }

  // Mettre à jour le profil
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.body.userId;
      if (!userId) {
        res.status(400).json({
          message: "ID utilisateur requis",
        });
        return;
      }

      const { nom, prenom, telephone } = req.body;
      const updateData: any = {};
      
      if (nom) updateData.nom = nom;
      if (prenom) updateData.prenom = prenom;
      if (telephone) updateData.telephone = telephone;

      const updatedUser = await this.service.updateProfile(userId, updateData);
      
      res.status(200).json({
        message: "Profil mis à jour avec succès",
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur interne du serveur",
      });
    }
  }

  // Validation médecin par SuperAdmin
  async validateMedecin(req: Request, res: Response): Promise<void> {
    const requiredFields = ["medecinId", "action"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { medecinId, action } = req.body;
      
      if (!['APPROVED', 'REJECTED'].includes(action)) {
        res.status(400).json({
          message: "Action doit être 'APPROVED' ou 'REJECTED'",
        });
        return;
      }

      const success = await this.service.validateMedecin(medecinId, action);
      
      if (success) {
        res.status(200).json({
          message: `Médecin ${action === 'APPROVED' ? 'approuvé' : 'rejeté'} avec succès`,
        });
      } else {
        res.status(400).json({
          message: "Erreur lors de la validation du médecin",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur interne du serveur",
      });
    }
  }

  // Récupérer médecins en attente
  async getPendingMedecins(req: Request, res: Response): Promise<void> {
    try {
      const pendingMedecins = await this.service.getPendingMedecins();
      
      res.status(200).json({
        message: "Médecins en attente récupérés",
        data: pendingMedecins,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur interne du serveur",
      });
    }
  }

  // Créer médecin par AdminCabinet
  async createMedecinByAdmin(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email", "motdepasse", "nom", "numordre", "cabinetId"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const {
        email,
        motdepasse,
        nom,
        numordre,
        cabinetId,
        prenom,
        telephone,
        experience,
        biographie,
      } = req.body;

      const user = await this.service.createMedecinByAdmin(
        email,
        motdepasse,
        nom,
        numordre,
        cabinetId,
        prenom,
        telephone,
        experience,
        biographie
      );

      res.status(201).json({
        message: "Médecin créé avec succès et approuvé automatiquement",
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }
}