import { Request, Response } from "express";
import { SpecialitesService } from "./specialites.service";
import { getMissingFields } from "../../shared/utils/validator";

export class SpecialitesController {
  private service: SpecialitesService;

  constructor() {
    this.service = new SpecialitesService();
  }

  // ========================================
  // SPÉCIALITÉS
  // ========================================

  // Créer une spécialité
  async createSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["nom"];
      const missingFields = getMissingFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const specialite = await this.service.createSpecialite(req.body);
      
      res.status(201).json({
        message: "Spécialité créée avec succès",
        data: specialite
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer toutes les spécialités
  async getAllSpecialites(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const specialites = await this.service.getAllSpecialites(
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.status(200).json({
        message: "Spécialités récupérées avec succès",
        data: specialites
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer une spécialité par ID
  async getSpecialiteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const specialite = await this.service.getSpecialiteById(id);
      
      if (!specialite) {
        res.status(404).json({ message: "Spécialité non trouvée" });
        return;
      }

      res.status(200).json({
        message: "Spécialité récupérée avec succès",
        data: specialite
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer une spécialité avec détails
  async getSpecialiteWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const specialite = await this.service.getSpecialiteWithDetails(id);
      
      if (!specialite) {
        res.status(404).json({ message: "Spécialité non trouvée" });
        return;
      }

      res.status(200).json({
        message: "Spécialité récupérée avec succès",
        data: specialite
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Modifier une spécialité
  async updateSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const updatedSpecialite = await this.service.updateSpecialite(id, req.body);
      
      res.status(200).json({
        message: "Spécialité modifiée avec succès",
        data: updatedSpecialite
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Supprimer une spécialité
  async deleteSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const success = await this.service.deleteSpecialite(id);
      
      if (success) {
        res.status(200).json({
          message: "Spécialité supprimée avec succès"
        });
      } else {
        res.status(404).json({
          message: "Spécialité non trouvée"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Rechercher des spécialités
  async searchSpecialites(req: Request, res: Response): Promise<void> {
    try {
      const searchData = req.query;
      
      const specialites = await this.service.searchSpecialites(searchData);
      
      res.status(200).json({
        message: "Recherche de spécialités effectuée avec succès",
        data: specialites
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // ========================================
  // MAUX
  // ========================================

  // Créer un mal
  async createMaux(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["nom"];
      const missingFields = getMissingFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const maux = await this.service.createMaux(req.body);
      
      res.status(201).json({
        message: "Mal créé avec succès",
        data: maux
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer tous les maux
  async getAllMaux(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const maux = await this.service.getAllMaux(
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.status(200).json({
        message: "Maux récupérés avec succès",
        data: maux
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer un mal par ID
  async getMauxById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const maux = await this.service.getMauxById(id);
      
      if (!maux) {
        res.status(404).json({ message: "Mal non trouvé" });
        return;
      }

      res.status(200).json({
        message: "Mal récupéré avec succès",
        data: maux
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Récupérer un mal avec détails
  async getMauxWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const maux = await this.service.getMauxWithDetails(id);
      
      if (!maux) {
        res.status(404).json({ message: "Mal non trouvé" });
        return;
      }

      res.status(200).json({
        message: "Mal récupéré avec succès",
        data: maux
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Modifier un mal
  async updateMaux(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const updatedMaux = await this.service.updateMaux(id, req.body);
      
      res.status(200).json({
        message: "Mal modifié avec succès",
        data: updatedMaux
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Supprimer un mal
  async deleteMaux(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const success = await this.service.deleteMaux(id);
      
      if (success) {
        res.status(200).json({
          message: "Mal supprimé avec succès"
        });
      } else {
        res.status(404).json({
          message: "Mal non trouvé"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Rechercher des maux
  async searchMaux(req: Request, res: Response): Promise<void> {
    try {
      const searchData = req.query;
      
      const maux = await this.service.searchMaux(searchData);
      
      res.status(200).json({
        message: "Recherche de maux effectuée avec succès",
        data: maux
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // ========================================
  // ASSOCIATIONS
  // ========================================

  // Associer un médecin à une spécialité
  async associateMedecinSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["medecin_id", "specialite_id"];
      const missingFields = getMissingFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const association = await this.service.associateMedecinSpecialite(req.body);
      
      res.status(201).json({
        message: "Médecin associé à la spécialité avec succès",
        data: association
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Désassocier un médecin d'une spécialité
  async disassociateMedecinSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId, specialiteId } = req.params;
      
      const success = await this.service.disassociateMedecinSpecialite(medecinId, specialiteId);
      
      if (success) {
        res.status(200).json({
          message: "Médecin désassocié de la spécialité avec succès"
        });
      } else {
        res.status(404).json({
          message: "Association non trouvée"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Associer un cabinet à une spécialité
  async associateCabinetSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["cabinet_id", "specialite_id"];
      const missingFields = getMissingFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const association = await this.service.associateCabinetSpecialite(req.body);
      
      res.status(201).json({
        message: "Cabinet associé à la spécialité avec succès",
        data: association
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Désassocier un cabinet d'une spécialité
  async disassociateCabinetSpecialite(req: Request, res: Response): Promise<void> {
    try {
      const { cabinetId, specialiteId } = req.params;
      
      const success = await this.service.disassociateCabinetSpecialite(cabinetId, specialiteId);
      
      if (success) {
        res.status(200).json({
          message: "Cabinet désassocié de la spécialité avec succès"
        });
      } else {
        res.status(404).json({
          message: "Association non trouvée"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Associer une spécialité à un mal
  async associateSpecialiteMaux(req: Request, res: Response): Promise<void> {
    try {
      const requiredFields = ["specialite_id", "maux_id"];
      const missingFields = getMissingFields(req.body, requiredFields);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          error: "Champ(s) manquant(s)",
          missingFields,
        });
        return;
      }

      const association = await this.service.associateSpecialiteMaux(req.body);
      
      res.status(201).json({
        message: "Spécialité associée au mal avec succès",
        data: association
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Désassocier une spécialité d'un mal
  async disassociateSpecialiteMaux(req: Request, res: Response): Promise<void> {
    try {
      const { specialiteId, mauxId } = req.params;
      
      const success = await this.service.disassociateSpecialiteMaux(specialiteId, mauxId);
      
      if (success) {
        res.status(200).json({
          message: "Spécialité désassociée du mal avec succès"
        });
      } else {
        res.status(404).json({
          message: "Association non trouvée"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // ========================================
  // RECHERCHES AVANCÉES
  // ========================================

  // Rechercher des médecins par spécialité
  async searchMedecinsBySpecialite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { cabinet_id, limit = 50, offset = 0, q } = req.query;
      
      const searchData = {
        specialite_id: id,
        cabinet_id: cabinet_id as string,
        q: q as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      const medecins = await this.service.searchMedecinsBySpecialite(searchData);
      
      res.status(200).json({
        message: "Médecins trouvés avec succès",
        data: medecins
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Rechercher des cabinets par spécialité
  async searchCabinetsBySpecialite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const searchData = {
        specialite_id: id,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      const cabinets = await this.service.searchCabinetsBySpecialite(searchData);
      
      res.status(200).json({
        message: "Cabinets trouvés avec succès",
        data: cabinets
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  // Obtenir les statistiques générales
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.service.getStatistics();
      
      res.status(200).json({
        message: "Statistiques récupérées avec succès",
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }
}
