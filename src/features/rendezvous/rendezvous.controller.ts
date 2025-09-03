import { RendezVousService } from "./rendezvous.service";
import { SocketService } from "../../shared/services/socket.service";
import { Request, Response } from "express";
import { getMissingFields } from "../../shared/utils/validator";

export class RendezVousController {
  private service: RendezVousService;

  constructor(socketService?: SocketService) {
    this.service = new RendezVousService(socketService);
  }

  // ========================================
  // RENDEZ-VOUS
  // ========================================

  // Créer un rendez-vous
  async createRendezVous(req: Request, res: Response): Promise<void> {
    const requiredFields = ["patient_id", "medecin_id", "dateHeure", "duree", "motif"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const rendezVous = await this.service.createRendezVous(req.body);
      res.status(201).json({
        message: "Rendez-vous créé avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer un rendez-vous par ID
  async getRendezVousById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rendezVous = await this.service.getRendezVousById(id);
      
      if (!rendezVous) {
        res.status(404).json({
          message: "Rendez-vous non trouvé",
        });
        return;
      }

      res.status(200).json({
        message: "Rendez-vous récupéré avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les rendez-vous d'un patient
  async getRendezVousByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const rendezVous = await this.service.getRendezVousByPatient(patientId);
      
      res.status(200).json({
        message: "Rendez-vous du patient récupérés avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les rendez-vous d'un médecin
  async getRendezVousByMedecin(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.params;
      const rendezVous = await this.service.getRendezVousByMedecin(medecinId);
      
      res.status(200).json({
        message: "Rendez-vous du médecin récupérés avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Modifier un rendez-vous
  async updateRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedRDV = await this.service.updateRendezVous(id, updateData);
      
      res.status(200).json({
        message: "Rendez-vous modifié avec succès",
        data: updatedRDV,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Confirmer un rendez-vous
  async confirmerRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedRDV = await this.service.confirmerRendezVous(id);
      
      res.status(200).json({
        message: "Rendez-vous confirmé avec succès",
        data: updatedRDV,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Annuler un rendez-vous
  async annulerRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.service.annulerRendezVous(id);
      
      if (success) {
        res.status(200).json({
          message: "Rendez-vous annulé avec succès",
        });
      } else {
        res.status(404).json({
          message: "Rendez-vous non trouvé",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Terminer un rendez-vous
  async terminerRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedRDV = await this.service.terminerRendezVous(id);
      
      res.status(200).json({
        message: "Rendez-vous terminé avec succès",
        data: updatedRDV,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // CRÉNEAUX
  // ========================================

  // Créer un créneau
  async createCreneau(req: Request, res: Response): Promise<void> {
    const requiredFields = ["agenda_id", "debut", "fin"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const creneau = await this.service.createCreneau(req.body);
      res.status(201).json({
        message: "Créneau créé avec succès",
        data: creneau,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les créneaux disponibles d'un médecin
  async getCreneauxDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.params;
      const { dateDebut, dateFin } = req.query;
      
      if (!dateDebut || !dateFin) {
        res.status(400).json({
          message: "Les paramètres dateDebut et dateFin sont requis",
        });
        return;
      }

      const creneaux = await this.service.getCreneauxDisponibles(
        medecinId, 
        dateDebut as string, 
        dateFin as string
      );
      
      res.status(200).json({
        message: "Créneaux disponibles récupérés avec succès",
        data: creneaux,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // AGENDAS
  // ========================================

  // Créer un agenda
  async createAgenda(req: Request, res: Response): Promise<void> {
    const requiredFields = ["medecin_id", "libelle"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const agenda = await this.service.createAgenda(req.body);
      res.status(201).json({
        message: "Agenda créé avec succès",
        data: agenda,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les agendas d'un médecin
  async getAgendasByMedecin(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.params;
      const agendas = await this.service.getAgendasByMedecin(medecinId);
      
      res.status(200).json({
        message: "Agendas du médecin récupérés avec succès",
        data: agendas,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // RAPPELS
  // ========================================

  // Traiter les rappels à envoyer
  async traiterRappels(req: Request, res: Response): Promise<void> {
    try {
      const rappels = await this.service.traiterRappels();
      
      res.status(200).json({
        message: "Rappels traités avec succès",
        data: rappels,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Créer un rappel personnalisé
  async createRappel(req: Request, res: Response): Promise<void> {
    const requiredFields = ["rendezvousId", "dateEnvoi", "canal"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { rendezvousId, dateEnvoi, canal } = req.body;
      const rappel = await this.service.createRappel(rendezvousId, dateEnvoi, canal);
      
      res.status(201).json({
        message: "Rappel créé avec succès",
        data: rappel,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }
}
