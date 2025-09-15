import { Router } from "express";
import { SpecialitesController } from "./specialites.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new SpecialitesController();

// ========================================
// SPÉCIALITÉS
// ========================================

// Créer une spécialité
router.post("/specialites", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.createSpecialite.bind(controller)
);

// Récupérer toutes les spécialités (PUBLIC pour l'inscription)
router.get("/specialites", 
  controller.getAllSpecialites.bind(controller)
);

// Récupérer toutes les spécialités (AUTHENTIFIÉ pour les autres usages)
router.get("/specialites/authenticated", 
  authenticateToken, 
  controller.getAllSpecialites.bind(controller)
);

// Récupérer une spécialité par ID
router.get("/specialites/:id", 
  authenticateToken, 
  controller.getSpecialiteById.bind(controller)
);

// Récupérer une spécialité avec détails
router.get("/specialites/:id/details", 
  authenticateToken, 
  controller.getSpecialiteWithDetails.bind(controller)
);

// Modifier une spécialité
router.put("/specialites/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.updateSpecialite.bind(controller)
);

// Supprimer une spécialité
router.delete("/specialites/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.deleteSpecialite.bind(controller)
);

// Rechercher des spécialités
router.get("/specialites/search", 
  authenticateToken, 
  controller.searchSpecialites.bind(controller)
);

// ========================================
// MAUX
// ========================================

// Créer un mal
router.post("/maux", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.createMaux.bind(controller)
);

// Récupérer tous les maux
router.get("/maux", 
  authenticateToken, 
  controller.getAllMaux.bind(controller)
);

// Récupérer un mal par ID
router.get("/maux/:id", 
  authenticateToken, 
  controller.getMauxById.bind(controller)
);

// Récupérer un mal avec détails
router.get("/maux/:id/details", 
  authenticateToken, 
  controller.getMauxWithDetails.bind(controller)
);

// Modifier un mal
router.put("/maux/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.updateMaux.bind(controller)
);

// Supprimer un mal
router.delete("/maux/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.deleteMaux.bind(controller)
);

// Rechercher des maux
router.get("/maux/search", 
  authenticateToken, 
  controller.searchMaux.bind(controller)
);

// ========================================
// ASSOCIATIONS
// ========================================

// Associer un médecin à une spécialité
router.post("/associations/medecin-specialite", 
  authenticateToken, 
  requireRole(['ADMINCABINET', 'SUPERADMIN']), 
  controller.associateMedecinSpecialite.bind(controller)
);

// Désassocier un médecin d'une spécialité
router.delete("/associations/medecin-specialite/:medecinId/:specialiteId", 
  authenticateToken, 
  requireRole(['ADMINCABINET', 'SUPERADMIN']), 
  controller.disassociateMedecinSpecialite.bind(controller)
);

// Associer un cabinet à une spécialité
router.post("/associations/cabinet-specialite", 
  authenticateToken, 
  requireRole(['ADMINCABINET', 'SUPERADMIN']), 
  controller.associateCabinetSpecialite.bind(controller)
);

// Désassocier un cabinet d'une spécialité
router.delete("/associations/cabinet-specialite/:cabinetId/:specialiteId", 
  authenticateToken, 
  requireRole(['ADMINCABINET', 'SUPERADMIN']), 
  controller.disassociateCabinetSpecialite.bind(controller)
);

// Associer une spécialité à un mal
router.post("/associations/specialite-maux", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.associateSpecialiteMaux.bind(controller)
);

// Désassocier une spécialité d'un mal
router.delete("/associations/specialite-maux/:specialiteId/:mauxId", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.disassociateSpecialiteMaux.bind(controller)
);

// ========================================
// RECHERCHES AVANCÉES
// ========================================

// Rechercher des médecins par spécialité
// Autoriser les patients à chercher des médecins par spécialité (résultats approuvés uniquement)
router.get("/specialites/:id/medecins", 
  authenticateToken,
  controller.searchMedecinsBySpecialite.bind(controller)
);

// Rechercher des cabinets par spécialité
router.get("/specialites/:id/cabinets", 
  authenticateToken, 
  controller.searchCabinetsBySpecialite.bind(controller)
);

// Rechercher des médecins par mal
router.get("/maux/:id/medecins", 
  authenticateToken,
  controller.searchMedecinsByMaux.bind(controller)
);

// ========================================
// STATISTIQUES
// ========================================

// Obtenir les statistiques générales
router.get("/statistics", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getStatistics.bind(controller)
);

export default router;
