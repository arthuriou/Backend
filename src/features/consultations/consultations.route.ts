import { Router } from "express";
import { ConsultationsController } from "./consultations.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new ConsultationsController();

// Créer une consultation depuis un rendez-vous
router.post("/", authenticateToken, requireRole(['MEDECIN']), controller.createFromRendezVous);

// Créer une consultation depuis un template
router.post("/from-template", authenticateToken, requireRole(['MEDECIN']), controller.createFromTemplate);

// Récupérer une consultation par ID
router.get("/:id", authenticateToken, controller.getConsultation);

// Récupérer les consultations d'un médecin
router.get("/medecin/:medecinId", authenticateToken, controller.getConsultationsByMedecin);

// Récupérer les consultations d'un patient
router.get("/patient/:patientId", authenticateToken, controller.getConsultationsByPatient);

// Récupérer la consultation d'un rendez-vous spécifique
router.get("/rendezvous/:rendezvousId", authenticateToken, controller.getConsultationByRendezVous);

// Modifier une consultation
router.patch("/:id", authenticateToken, requireRole(['MEDECIN']), controller.updateConsultation);

// Finaliser une consultation
router.put("/:id/finalize", authenticateToken, requireRole(['MEDECIN']), controller.finalizeConsultation);

// Archiver une consultation
router.delete("/:id", authenticateToken, requireRole(['MEDECIN']), controller.deleteConsultation);

// TEMPLATES

// Créer un template de consultation
router.post("/templates", authenticateToken, requireRole(['SUPERADMIN', 'ADMINCABINET']), controller.createTemplate);

// Récupérer les templates par spécialité
router.get("/templates/specialite/:specialite", authenticateToken, controller.getTemplatesBySpecialite);

// Récupérer tous les templates
router.get("/templates", authenticateToken, controller.getAllTemplates);

// Supprimer un template
router.delete("/templates/:id", authenticateToken, requireRole(['SUPERADMIN', 'ADMINCABINET']), controller.deleteTemplate);

export default router;
