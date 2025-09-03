import { Router } from "express";
import { CabinetController } from "./cabinet.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new CabinetController();

// Routes publiques
router.get("/", controller.getAllCabinets.bind(controller));
router.get("/:id", controller.getCabinetById.bind(controller));

// Routes SuperAdmin
router.post("/", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.createCabinet.bind(controller)
);

router.post("/:id/admin", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.createAdminCabinet.bind(controller)
);

router.get("/:id/admins", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getCabinetAdmins.bind(controller)
);

// Routes modification cabinet
router.put("/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.updateCabinet.bind(controller)
);

router.put("/:id/archive", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.archiveCabinet.bind(controller)
);

// Routes spécialités du cabinet
router.get("/:id/specialites", controller.getCabinetSpecialites.bind(controller));
router.post("/:id/specialites", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.addSpecialiteToCabinet.bind(controller)
);
router.delete("/:id/specialites/:specialiteId", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.removeSpecialiteFromCabinet.bind(controller)
);

// Routes médecins du cabinet
router.get("/:id/medecins", controller.getCabinetMedecins.bind(controller));
router.put("/:id/medecins/:medecinId/archive", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.archiveMedecinFromCabinet.bind(controller)
);

// Routes statistiques
router.get("/:id/stats", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.getCabinetStats.bind(controller)
);

export default router;
