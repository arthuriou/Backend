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
          token: result.token,
          refreshToken: result.refreshToken,
          mustChangePassword: (result.user as any).mustchangepassword === true
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: 'refreshToken requis' });
        return;
      }
      const data = await this.service.refresh(refreshToken);
      res.status(200).json({ message: 'Token rafraîchi', data });
    } catch (error: any) {
      res.status(error.statusCode || 401).json({ message: error.message || 'Token invalide' });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId;
      const { oldPassword, newPassword } = req.body;
      if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({ message: 'userId, oldPassword, newPassword requis' });
        return;
      }
      await this.service.changePassword(userId, oldPassword, newPassword);
      res.status(200).json({ message: 'Mot de passe changé avec succès' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message || 'Erreur Serveur' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) { res.status(400).json({ message: 'email requis' }); return; }
      await this.service.forgotPassword(email);
      res.status(200).json({ message: 'Code de réinitialisation envoyé' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message || 'Erreur Serveur' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) { res.status(400).json({ message: 'email, code, newPassword requis' }); return; }
      await this.service.resetPassword(email, code, newPassword);
      res.status(200).json({ message: 'Mot de passe réinitialisé' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message || 'Erreur Serveur' });
    }
  }

  // Mise à jour profil Médecin (expérience, biographie)
  async updateMedecinProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId;
      if (!userId) { res.status(400).json({ message: 'userId requis' }); return; }
      const { experience, biographie } = req.body;
      await this.service.updateMedecinProfile(userId, { experience, biographie });
      res.status(200).json({ message: 'Profil médecin mis à jour' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message || 'Erreur Serveur' });
    }
  }

  // Mise à jour profil Patient (dateNaissance, genre, adresse, groupeSanguin, poids, taille)
  async updatePatientProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId;
      if (!userId) { res.status(400).json({ message: 'userId requis' }); return; }
      const { datenaissance, genre, adresse, groupesanguin, poids, taille } = req.body;
      await this.service.updatePatientProfile(userId, {
        datenaissance: datenaissance ? new Date(datenaissance) : undefined,
        genre,
        adresse,
        groupesanguin,
        poids,
        taille
      });
      res.status(200).json({ message: 'Profil patient mis à jour' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message || 'Erreur Serveur' });
    }
  }

  // Upload photo de profil
  async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId;
      if (!userId) { res.status(400).json({ message: 'userId requis' }); return; }
      const file = (req as any).file as any;
      if (!file) { res.status(400).json({ message: 'Fichier requis (champ "file")' }); return; }
      const url = `/uploads/profile/${file.filename}`;
      const updated = await this.service.updateProfile(userId, { photoProfil: url } as any);
      res.status(201).json({ message: 'Photo de profil mise à jour', data: { url, user: updated } });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message || 'Erreur Serveur' });
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

  // ========================================
  // ENDPOINTS DE RÉCUPÉRATION D'INFORMATIONS
  // ========================================

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Token invalide" });
        return;
      }

      const profile = await this.service.getProfile(userId);
      res.status(200).json({
        message: "Profil récupéré avec succès",
        data: profile
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération du profil:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.service.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: "Utilisateur non trouvé" });
        return;
      }

      res.status(200).json({
        message: "Utilisateur récupéré avec succès",
        data: user
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const patients = await this.service.getAllPatients(
        Number(page),
        Number(limit),
        search as string
      );

      res.status(200).json({
        message: "Patients récupérés avec succès",
        data: patients
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des patients:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getAllMedecins(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, specialite, cabinetId } = req.query;
      const medecins = await this.service.getAllMedecins(
        Number(page),
        Number(limit),
        search as string,
        specialite as string,
        cabinetId as string
      );

      res.status(200).json({
        message: "Médecins récupérés avec succès",
        data: medecins
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des médecins:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, cabinetId } = req.query;
      const admins = await this.service.getAllAdmins(
        Number(page),
        Number(limit),
        search as string,
        cabinetId as string
      );

      res.status(200).json({
        message: "Administrateurs récupérés avec succès",
        data: admins
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des administrateurs:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10, search } = req.query;
      
      const users = await this.service.getUsersByRole(
        role.toUpperCase(),
        Number(page),
        Number(limit),
        search as string
      );

      res.status(200).json({
        message: `Utilisateurs ${role} récupérés avec succès`,
        data: users
      });
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des utilisateurs ${req.params.role}:`, error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  // ========================================
  // GESTION SUPERADMIN
  // ========================================

  async getSuperAdminProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Token invalide" });
        return;
      }

      const profile = await this.service.getSuperAdminProfile(userId);
      res.status(200).json({
        message: "Profil SuperAdmin récupéré avec succès",
        data: profile
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération du profil SuperAdmin:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async updateSuperAdminProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Token invalide" });
        return;
      }

      const { nom, prenom, telephone, email } = req.body;
      const updatedProfile = await this.service.updateSuperAdminProfile(
        userId,
        nom,
        prenom,
        telephone,
        email
      );

      res.status(200).json({
        message: "Profil SuperAdmin mis à jour avec succès",
        data: updatedProfile
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil SuperAdmin:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async changeSuperAdminPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Token invalide" });
        return;
      }

      const { ancienMotdepasse, nouveauMotdepasse } = req.body;
      
      if (!ancienMotdepasse || !nouveauMotdepasse) {
        res.status(400).json({ error: "Ancien et nouveau mot de passe requis" });
        return;
      }

      await this.service.changeSuperAdminPassword(userId, ancienMotdepasse, nouveauMotdepasse);

      res.status(200).json({
        message: "Mot de passe SuperAdmin changé avec succès"
      });
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe SuperAdmin:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async createAdminCabinet(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["email", "motdepasse", "nom", "prenom", "telephone", "cabinetId"];
      const missingFields = getMissingFields(req.body, requiredFields);
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const {
        email,
        motdepasse,
        nom,
        prenom,
        telephone,
        cabinetId,
        roleAdmin = "ADMIN_PRINCIPAL"
      } = req.body;

      const result = await this.service.createAdminCabinet(
        email,
        motdepasse,
        nom,
        prenom,
        telephone,
        cabinetId,
        roleAdmin
      );

      res.status(201).json({
        message: "AdminCabinet créé avec succès",
        data: result
      });
    } catch (error: any) {
      console.error("Erreur lors de la création de l'AdminCabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  // ========================================
  // GESTION DES CABINETS (SUPERADMIN)
  // ========================================

  async createCabinet(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["nom", "adresse", "telephone"];
      const missingFields = getMissingFields(req.body, requiredFields);
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const {
        nom,
        adresse,
        telephone,
        email,
        siteWeb,
        description,
        specialites
      } = req.body;

      const cabinet = await this.service.createCabinet(
        nom,
        adresse,
        telephone,
        email,
        siteWeb,
        description,
        specialites
      );

      res.status(201).json({
        message: "Cabinet créé avec succès",
        data: cabinet
      });
    } catch (error: any) {
      console.error("Erreur lors de la création du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getAllCabinets(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const cabinets = await this.service.getAllCabinets(
        Number(page),
        Number(limit),
        search as string
      );

      res.status(200).json({
        message: "Cabinets récupérés avec succès",
        data: cabinets
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des cabinets:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getCabinetById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cabinet = await this.service.getCabinetById(id);
      
      if (!cabinet) {
        res.status(404).json({ error: "Cabinet non trouvé" });
        return;
      }

      res.status(200).json({
        message: "Cabinet récupéré avec succès",
        data: cabinet
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async updateCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        nom,
        adresse,
        telephone,
        email,
        siteWeb,
        description,
        specialites
      } = req.body;

      const cabinet = await this.service.updateCabinet(
        id,
        nom,
        adresse,
        telephone,
        email,
        siteWeb,
        description,
        specialites
      );

      res.status(200).json({
        message: "Cabinet mis à jour avec succès",
        data: cabinet
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async deleteCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.deleteCabinet(id);

      res.status(200).json({
        message: "Cabinet supprimé avec succès"
      });
    } catch (error: any) {
      console.error("Erreur lors de la suppression du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  // ========================================
  // GESTION DES ATTRIBUTIONS CABINET (SUPERADMIN)
  // ========================================

  async assignCabinetToAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { adminId, cabinetId } = req.body;
      
      if (!adminId || !cabinetId) {
        res.status(400).json({ 
          error: "adminId et cabinetId sont requis" 
        });
        return;
      }

      const assignment = await this.service.assignCabinetToAdmin(adminId, cabinetId);

      res.status(200).json({
        message: "Cabinet attribué avec succès à l'AdminCabinet",
        data: assignment
      });
    } catch (error: any) {
      console.error("Erreur lors de l'attribution du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async unassignCabinetFromAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { adminId } = req.params;
      const { cabinetId } = req.body;
      
      if (!cabinetId) {
        res.status(400).json({ 
          error: "cabinetId est requis dans le body" 
        });
        return;
      }

      await this.service.unassignCabinetFromAdmin(adminId, cabinetId);

      res.status(200).json({
        message: "Cabinet retiré avec succès de l'AdminCabinet"
      });
    } catch (error: any) {
      console.error("Erreur lors du retrait du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getAdminCabinets(req: Request, res: Response): Promise<void> {
    try {
      const { adminId } = req.params;
      const cabinets = await this.service.getAdminCabinets(adminId);

      res.status(200).json({
        message: "Cabinets de l'AdminCabinet récupérés avec succès",
        data: cabinets
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des cabinets de l'admin:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }

  async getCabinetAdmins(req: Request, res: Response): Promise<void> {
    try {
      const { cabinetId } = req.params;
      const admins = await this.service.getCabinetAdmins(cabinetId);

      res.status(200).json({
        message: "AdminCabinet du cabinet récupérés avec succès",
        data: admins
      });
    } catch (error: any) {
      console.error("Erreur lors de la récupération des admins du cabinet:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message
      });
    }
  }
}