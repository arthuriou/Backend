import { CabinetService } from "./cabinet.service";
import { Request, Response } from "express";
import { getMissingFields } from "../../shared/utils/validator";

export class CabinetController {
  private service: CabinetService;

  constructor() {
    this.service = new CabinetService();
  }

  // Créer un cabinet
  async createCabinet(req: Request, res: Response): Promise<void> {
    const requiredFields = ["nom"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const cabinet = await this.service.createCabinet(req.body);
      res.status(201).json({
        message: "Cabinet créé avec succès",
        data: cabinet,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Créer un AdminCabinet
  async createAdminCabinet(req: Request, res: Response): Promise<void> {
    const requiredFields = ["email", "motdepasse", "nom", "cabinetId", "roleAdmin"];
    const missingFields = getMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const result = await this.service.createAdminCabinet(req.body);
      res.status(201).json({
        message: "AdminCabinet créé avec succès",
        data: {
          user: result.user,
          adminCabinet: result.adminCabinet
        },
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer tous les cabinets
  async getAllCabinets(req: Request, res: Response): Promise<void> {
    try {
      const cabinets = await this.service.getAllCabinets();
      res.status(200).json({
        message: "Cabinets récupérés avec succès",
        data: cabinets,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer un cabinet par ID
  async getCabinetById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cabinet = await this.service.getCabinetById(id);
      
      if (!cabinet) {
        res.status(404).json({
          message: "Cabinet non trouvé",
        });
        return;
      }

      res.status(200).json({
        message: "Cabinet récupéré avec succès",
        data: cabinet,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les AdminCabinet d'un cabinet
  async getCabinetAdmins(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const admins = await this.service.getCabinetAdmins(id);
      
      res.status(200).json({
        message: "AdminCabinet récupérés avec succès",
        data: admins,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Modifier un cabinet
  async updateCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nom, adresse, telephone, email, logo, horairesOuverture } = req.body;
      
      const updateData: any = {};
      if (nom) updateData.nom = nom;
      if (adresse) updateData.adresse = adresse;
      if (telephone) updateData.telephone = telephone;
      if (email) updateData.email = email;
      if (logo) updateData.logo = logo;
      if (horairesOuverture) updateData.horairesOuverture = horairesOuverture;

      const updatedCabinet = await this.service.updateCabinet(id, updateData);
      
      res.status(200).json({
        message: "Cabinet modifié avec succès",
        data: updatedCabinet,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Archiver un cabinet
  async archiveCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.service.archiveCabinet(id);
      
      if (success) {
        res.status(200).json({
          message: "Cabinet archivé avec succès",
        });
      } else {
        res.status(404).json({
          message: "Cabinet non trouvé",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Gestion des spécialités du cabinet
  async getCabinetSpecialites(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const specialites = await this.service.getCabinetSpecialites(id);
      
      res.status(200).json({
        message: "Spécialités du cabinet récupérées avec succès",
        data: specialites,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  async addSpecialiteToCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { specialiteId } = req.body;
      
      if (!specialiteId) {
        res.status(400).json({
          message: "ID de spécialité requis",
        });
        return;
      }

      await this.service.addSpecialiteToCabinet(id, specialiteId);
      
      res.status(200).json({
        message: "Spécialité ajoutée au cabinet avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  async removeSpecialiteFromCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id, specialiteId } = req.params;
      
      await this.service.removeSpecialiteFromCabinet(id, specialiteId);
      
      res.status(200).json({
        message: "Spécialité retirée du cabinet avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Gestion des médecins du cabinet
  async getCabinetMedecins(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const medecins = await this.service.getCabinetMedecins(id);
      
      res.status(200).json({
        message: "Médecins du cabinet récupérés avec succès",
        data: medecins,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  async archiveMedecinFromCabinet(req: Request, res: Response): Promise<void> {
    try {
      const { id, medecinId } = req.params;
      
      await this.service.archiveMedecinFromCabinet(medecinId, id);
      
      res.status(200).json({
        message: "Médecin archivé du cabinet avec succès",
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Reset mot de passe d'un médecin par AdminCabinet (force mustChangePassword)
  async resetMedecinPassword(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = (req as any).user?.userId;
      const { id, medecinId } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) { res.status(400).json({ message: 'newPassword requis' }); return; }
      await this.service.resetMedecinPassword(adminUserId, id, medecinId, newPassword);
      res.status(200).json({ message: 'Mot de passe réinitialisé. Changement requis à la prochaine connexion.' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erreur Serveur' });
    }
  }

  // Statistiques du cabinet
  async getCabinetStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await this.service.getCabinetStats(id);
      
      res.status(200).json({
        message: "Statistiques du cabinet récupérées avec succès",
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }
}
