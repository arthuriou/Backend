import { Router } from "express";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";
import { AgendaController } from "./agenda.controller";

const router = Router();
const controller = new AgendaController();

// Agendas - created automatically on doctor approval
router.get("/mine", authenticateToken, requireRole(['MEDECIN']), controller.getMyAgendas);
router.get("/:id", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.getAgendaById);
router.patch("/:id", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.updateAgenda);
router.delete("/:id", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.deleteAgenda);

// Rules
router.post("/:id/rules", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.createRule);
router.get("/:id/rules", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.getRules);
router.patch("/:id/rules/:ruleId", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.updateRule);
router.delete("/:id/rules/:ruleId", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.deleteRule);

// Blocks
router.post("/:id/blocks", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.createBlock);
router.get("/:id/blocks", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.getBlocks);
router.delete("/:id/blocks/:blockId", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.deleteBlock);

// Extra availability
router.post("/:id/extra", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.createExtra);
router.get("/:id/extra", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.getExtras);
router.delete("/:id/extra/:extraId", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.deleteExtra);

// Slots calculés
router.get("/:id/slots", authenticateToken, requireRole(['MEDECIN','ADMINCABINET']), controller.getSlots);

// Slots publics pour les patients (sans auth)
router.get("/:id/slots/public", controller.getSlots);

export default router;
