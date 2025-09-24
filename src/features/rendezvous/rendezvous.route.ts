import { Router } from "express";
import { RendezVousController } from "./rendezvous.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";
import { SocketService } from "../../shared/services/socket.service";

// Fonction pour créer les routes avec un contrôleur spécifique
export const createRendezVousRoutes = (socketService?: SocketService) => {
  const router = Router();
  const controller = new RendezVousController(socketService);

// ========================================
// RENDEZ-VOUS
// ========================================

// Créer un rendez-vous (Patient)
router.post("/", 
  authenticateToken, 
  requireRole(['PATIENT']), 
  controller.createRendezVous.bind(controller)
);

// Récupérer un rendez-vous par ID (Patient, Médecin, AdminCabinet)
router.get("/:id", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  controller.getRendezVousById.bind(controller)
);

// Récupérer les rendez-vous d'un patient (Patient, Médecin, AdminCabinet)
router.get("/patient/:patientId", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  controller.getRendezVousByPatient.bind(controller)
);

// Récupérer les rendez-vous d'un médecin (Médecin, AdminCabinet)
router.get("/medecin/:medecinId", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.getRendezVousByMedecin.bind(controller)
);

// Modifier un rendez-vous (Patient, Médecin, AdminCabinet)
router.put("/:id", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  controller.updateRendezVous.bind(controller)
);

// Confirmer un rendez-vous (Médecin, AdminCabinet)
router.put("/:id/confirmer", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.confirmerRendezVous.bind(controller)
);

// Annuler un rendez-vous (Patient, Médecin, AdminCabinet)
router.put("/:id/annuler", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  controller.annulerRendezVous.bind(controller)
);

// Terminer un rendez-vous (Médecin, AdminCabinet)
router.put("/:id/terminer", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.terminerRendezVous.bind(controller)
);

// Routes d'agenda et de créneaux ont été déplacées sous /api/agenda (module Agenda)

// ========================================
// RAPPELS
// ========================================

// Traiter les rappels à envoyer (Système/Admin)
router.post("/rappels/traiter", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.traiterRappels.bind(controller)
);

// Créer un rappel personnalisé (Médecin, AdminCabinet)
router.post("/rappels", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.createRappel.bind(controller)
);

// ========================================
// TÉLÉCONSULTATION
// ========================================

// Récupérer les informations de téléconsultation (Patient, Médecin, AdminCabinet)
router.get("/:id/teleconsultation", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  controller.getTeleconsultationInfo.bind(controller)
);

// Commencer une consultation (Patient, Médecin)
router.put("/:id/commencer-consultation", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN']), 
  controller.commencerConsultation.bind(controller)
);

// Clôturer une consultation (Médecin seulement)
router.put("/:id/cloturer-consultation", 
  authenticateToken, 
  requireRole(['MEDECIN']), 
  controller.cloturerConsultation.bind(controller)
);

// Marquer un patient comme arrivé (Médecin, AdminCabinet - présentiel seulement)
router.put("/:id/patient-arrive", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.marquerPatientArrive.bind(controller)
);

// ========================================
// WORKFLOW PRÉSENTIEL - NOUVELLES ROUTES
// ========================================

// Récupérer les RDV en attente de consultation (médecin)
router.get("/en-attente-consultation", 
  authenticateToken, 
  requireRole(['MEDECIN']), 
  controller.getRendezVousEnAttenteConsultation.bind(controller)
);

// Récupérer les RDV en cours (médecin)
router.get("/en-cours", 
  authenticateToken, 
  requireRole(['MEDECIN']), 
  controller.getRendezVousEnCours.bind(controller)
);

// Récupérer les RDV d'aujourd'hui (médecin)
router.get("/aujourd-hui", 
  authenticateToken, 
  requireRole(['MEDECIN']), 
  controller.getRendezVousAujourdhui.bind(controller)
);

// Récupérer les RDV de la semaine (médecin)
router.get("/cette-semaine", 
  authenticateToken, 
  requireRole(['MEDECIN']), 
  controller.getRendezVousCetteSemaine.bind(controller)
);

  return router;
};

// Export par défaut pour compatibilité (sans Socket.IO)
const router = Router();
const defaultController = new RendezVousController();

// ========================================
// RENDEZ-VOUS
// ========================================

// Créer un rendez-vous (Patient)
router.post("/", 
  authenticateToken, 
  requireRole(['PATIENT']), 
  defaultController.createRendezVous.bind(defaultController)
);

// Récupérer un rendez-vous par ID (Patient, Médecin, AdminCabinet)
router.get("/:id", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  defaultController.getRendezVousById.bind(defaultController)
);

// Récupérer les rendez-vous d'un patient (Patient, Médecin, AdminCabinet)
router.get("/patient/:patientId", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  defaultController.getRendezVousByPatient.bind(defaultController)
);

// Récupérer les rendez-vous d'un médecin (Médecin, AdminCabinet)
router.get("/medecin/:medecinId", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  defaultController.getRendezVousByMedecin.bind(defaultController)
);

// Modifier un rendez-vous (Patient, Médecin, AdminCabinet)
router.put("/:id", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  defaultController.updateRendezVous.bind(defaultController)
);

// Confirmer un rendez-vous (Médecin, AdminCabinet)
router.put("/:id/confirmer", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  defaultController.confirmerRendezVous.bind(defaultController)
);

// Annuler un rendez-vous (Patient, Médecin, AdminCabinet)
router.put("/:id/annuler", 
  authenticateToken, 
  requireRole(['PATIENT', 'MEDECIN', 'ADMINCABINET']), 
  defaultController.annulerRendezVous.bind(defaultController)
);

// Terminer un rendez-vous (Médecin, AdminCabinet)
router.put("/:id/terminer", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  defaultController.terminerRendezVous.bind(defaultController)
);

// ========================================
// CRÉNEAUX
// ========================================

// Créer un créneau (Médecin, AdminCabinet)
router.post("/creneaux", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  defaultController.createCreneau.bind(defaultController)
);

// Récupérer les créneaux disponibles d'un médecin (Public)
router.get("/medecin/:medecinId/creneaux-disponibles", 
  defaultController.getCreneauxDisponibles.bind(defaultController)
);

// ========================================
// AGENDAS
// ========================================

// Créer un agenda (Médecin, AdminCabinet)
router.post("/agendas", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  defaultController.createAgenda.bind(defaultController)
);

// Récupérer les agendas d'un médecin (Public)
router.get("/medecin/:medecinId/agendas", 
  defaultController.getAgendasByMedecin.bind(defaultController)
);

// ========================================
// RAPPELS
// ========================================

// Traiter les rappels à envoyer (Système/Admin)
router.post("/rappels/traiter", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  defaultController.traiterRappels.bind(defaultController)
);

// Créer un rappel personnalisé (Médecin, AdminCabinet)
router.post("/rappels", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  defaultController.createRappel.bind(defaultController)
);

export default router;
