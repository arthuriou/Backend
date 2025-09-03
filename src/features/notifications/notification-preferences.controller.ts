import { Request, Response } from "express";
import { NotificationPreferencesService } from "./notification-preferences.service";
import { getMissingFields } from "../../shared/utils/validator";

export class NotificationPreferencesController {
  private service: NotificationPreferencesService;

  constructor() {
    this.service = new NotificationPreferencesService();
  }

  // Récupérer les préférences de l'utilisateur connecté
  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const preferences = await this.service.getPreferences(userId);
      
      res.status(200).json({
        message: "Préférences récupérées avec succès",
        data: preferences
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Mettre à jour les préférences
  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const updateData = req.body;
      
      // Validation des champs optionnels
      if (updateData.volume !== undefined && (updateData.volume < 0 || updateData.volume > 1)) {
        res.status(400).json({ message: "Le volume doit être entre 0 et 1" });
        return;
      }

      const updatedPreferences = await this.service.updatePreferences(userId, updateData);
      
      res.status(200).json({
        message: "Préférences mises à jour avec succès",
        data: updatedPreferences
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Réinitialiser aux préférences par défaut
  async resetToDefault(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const defaultPreferences = await this.service.resetToDefault(userId);
      
      res.status(200).json({
        message: "Préférences réinitialisées aux valeurs par défaut",
        data: defaultPreferences
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }

  // Supprimer les préférences
  async deletePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const success = await this.service.deletePreferences(userId);
      
      if (success) {
        res.status(200).json({
          message: "Préférences supprimées avec succès"
        });
      } else {
        res.status(404).json({
          message: "Préférences non trouvées"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur"
      });
    }
  }
}
