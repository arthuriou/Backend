import { Router } from "express";
import controller from "./dossier-medical.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";
import { upload, uploadMemory, setUploadSegment } from "../../shared/utils/upload";

const router = Router();

// Dossier du patient connecté (création si inexistant)
router.get("/dossier/me", authenticateToken, (req, res) => controller.getOrCreateMe(req, res));

// Routes spécifiques pour documents (AVANT les routes génériques)
router.post(
  "/documents",
  authenticateToken,
  setUploadSegment('documents'),
  uploadMemory.single('file'),
  (req, res) => controller.addDocument(req, res)
);
router.get("/documents/:id/view", authenticateToken, (req, res) => controller.viewDocument(req, res));
router.delete("/documents/:id", authenticateToken, (req, res) => controller.deleteDocument(req, res));
router.patch("/documents/:id", authenticateToken, (req, res) => controller.updateDocument(req, res));

// Documents du dossier (route générique APRÈS les routes spécifiques)
router.get("/:dossierId/documents", authenticateToken, (req, res) => controller.listDocuments(req, res));

export default router;


