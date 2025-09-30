import { Request, Response } from "express";
import { ConsultationsService } from "./consultations.service";

export class ConsultationsController {
  private service: ConsultationsService;

  constructor(service = new ConsultationsService()) {
    this.service = service;
  }

  // Créer une consultation depuis un rendez-vous
  createFromRendezVous = async (req: Request, res: Response) => {
    try {
      const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
      const { rendezvous_id } = req.body;

      if (!rendezvous_id) {
        return res.status(400).json({ message: "rendezvous_id requis" });
      }

      const consultation = await this.service.createConsultationFromRendezVous(rendezvous_id, medecinId);

      res.status(201).json({
        message: "Consultation créée avec succès",
        data: consultation
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la création de la consultation"
      });
    }
  };

  // Créer une consultation depuis un template
  createFromTemplate = async (req: Request, res: Response) => {
    try {
      const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
      const { rendezvous_id, template_id } = req.body;

      if (!rendezvous_id || !template_id) {
        return res.status(400).json({ message: "rendezvous_id et template_id requis" });
      }

      const consultation = await this.service.createFromTemplate(rendezvous_id, template_id, medecinId);

      res.status(201).json({
        message: "Consultation créée depuis le template",
        data: consultation
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la création depuis le template"
      });
    }
  };

  // Récupérer une consultation par ID
  getConsultation = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const { id } = req.params;

      const consultation = await this.service.getConsultationWithDetails(id, userId, userRole);

      if (!consultation) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      res.json({
        message: "Consultation récupérée avec succès",
        data: consultation
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la récupération de la consultation"
      });
    }
  };

  // Récupérer les consultations d'un médecin
  getConsultationsByMedecin = async (req: Request, res: Response) => {
    try {
      const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const consultations = await this.service.getRepository().getConsultationsByMedecin(medecinId, limit, offset);

      res.json({
        message: "Consultations récupérées avec succès",
        data: consultations,
        pagination: {
          limit,
          offset,
          hasMore: consultations.length === limit
        }
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la récupération des consultations"
      });
    }
  };

  // Récupérer les consultations d'un patient
  getConsultationsByPatient = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const { patientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // Vérifier les permissions
      if (userRole !== 'SUPERADMIN' && userRole !== 'ADMINCABINET' && userId !== patientId) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      const consultations = await this.service.getRepository().getConsultationsByPatient(patientId, limit, offset);

      res.json({
        message: "Consultations du patient récupérées avec succès",
        data: consultations,
        pagination: {
          limit,
          offset,
          hasMore: consultations.length === limit
        }
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la récupération des consultations du patient"
      });
    }
  };

  // Récupérer la consultation d'un rendez-vous spécifique
  getConsultationByRendezVous = async (req: Request, res: Response) => {
    try {
      const { rendezvousId } = req.params;
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const consultation = await this.service.getRepository().getConsultationByRendezVous(rendezvousId);

      if (!consultation) {
        return res.status(404).json({ message: "Aucune consultation trouvée pour ce rendez-vous" });
      }

      // Vérifier les permissions
      const ownedByUser = consultation.medecin_id === userId || consultation.patient_id === userId;
      const isAdmin = ['SUPERADMIN', 'ADMINCABINET'].includes(userRole);

      if (!ownedByUser && !isAdmin) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      res.json({
        message: "Consultation récupérée avec succès",
        data: consultation
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la récupération de la consultation"
      });
    }
  };

  // Mettre à jour une consultation
  updateConsultation = async (req: Request, res: Response) => {
    try {
      const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
      const { id } = req.params;

      // Vérification que l'utilisateur est bien le médecin propriétaire
      const consultation = await this.service.getRepository().getConsultationById(id);
      if (!consultation) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      if (consultation.medecin_id !== medecinId && consultation.statut !== 'BROUILLON') {
        return res.status(403).json({ message: "Consultation finalisée, modification impossible" });
      }

      const updated = await this.service.getRepository().updateConsultation(id, req.body);

      if (!updated) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      res.json({
        message: "Consultation mise à jour avec succès",
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la mise à jour de la consultation"
      });
    }
  };

  // Finaliser une consultation
  finalizeConsultation = async (req: Request, res: Response) => {
    try {
      const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
      const { id } = req.params;

      const finalized = await this.service.finalizeConsultation(id, medecinId);

      res.json({
        message: "Consultation finalisée avec succès",
        data: finalized
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la finalisation de la consultation"
      });
    }
  };

  // Archiver une consultation
  deleteConsultation = async (req: Request, res: Response) => {
    try {
      const medecinId = (req as any).user?.idmedecin || (req as any).user?.medecin_id || (req as any).user?.id;
      const { id } = req.params;

      // Vérifier la propriété
      const consultation = await this.service.getRepository().getConsultationById(id);
      if (!consultation || consultation.medecin_id !== medecinId) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      const success = await this.service.getRepository().deleteConsultation(id);

      if (!success) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      res.json({
        message: "Consultation archivée avec succès"
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de l'archivage de la consultation"
      });
    }
  };

  // TEMPLATES

  // Créer un template
  createTemplate = async (req: Request, res: Response) => {
    try {
      const template = await this.service.createTemplate(req.body);

      res.status(201).json({
        message: "Template créé avec succès",
        data: template
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la création du template"
      });
    }
  };

  // Récupérer les templates par spécialité
  getTemplatesBySpecialite = async (req: Request, res: Response) => {
    try {
      const { specialite } = req.params;

      if (!specialite) {
        return res.status(400).json({ message: "spécialité requise" });
      }

      const templates = await this.service.getTemplatesBySpecialite(specialite);

      res.json({
        message: "Templates récupérés avec succès",
        data: templates
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la récupération des templates"
      });
    }
  };

  // Récupérer tous les templates
  getAllTemplates = async (req: Request, res: Response) => {
    try {
      const templates = await this.service.getRepository().getAllTemplates();

      res.json({
        message: "Tous les templates récupérés avec succès",
        data: templates
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la récupération des templates"
      });
    }
  };

  // Supprimer un template
  deleteTemplate = async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role;
      const { id } = req.params;

      if (!['SUPERADMIN', 'ADMINCABINET'].includes(userRole)) {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
      }

      const success = await this.service.getRepository().deleteTemplate(id);

      if (!success) {
        return res.status(404).json({ message: "Template non trouvé" });
      }

      res.json({
        message: "Template supprimé avec succès"
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur lors de la suppression du template"
      });
    }
  };
}
