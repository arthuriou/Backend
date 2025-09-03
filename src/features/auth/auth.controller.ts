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
      const user = await this.service.login(email, motdepasse);
      
      res.status(200).json({
        message: "Connexion réussie",
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }
}