import { Router } from "express";
import { RendezVousController } from "./rendezvous.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new RendezVousController();

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

// ========================================
// CRÉNEAUX
// ========================================

// Créer un créneau (Médecin, AdminCabinet)
router.post("/creneaux", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.createCreneau.bind(controller)
);

// Récupérer les créneaux disponibles d'un médecin (Public)
router.get("/medecin/:medecinId/creneaux-disponibles", 
  controller.getCreneauxDisponibles.bind(controller)
);

// ========================================
// AGENDAS
// ========================================

// Créer un agenda (Médecin, AdminCabinet)
router.post("/agendas", 
  authenticateToken, 
  requireRole(['MEDECIN', 'ADMINCABINET']), 
  controller.createAgenda.bind(controller)
);

// Récupérer les agendas d'un médecin (Public)
router.get("/medecin/:medecinId/agendas", 
  controller.getAgendasByMedecin.bind(controller)
);

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

export default router;
