import { Router } from "express";
import controller from "./dossier-medical.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";
import { upload, uploadMemory, setUploadSegment } from "../../shared/utils/upload";

const router = Router();

// Dossier du patient connecté (création si inexistant)
router.get("/dossier/me", authenticateToken, (req, res) => controller.getOrCreateMe(req, res));

// Documents du dossier
router.get("/:dossierId/documents", authenticateToken, (req, res) => controller.listDocuments(req, res));
router.post(
  "/documents",
  authenticateToken,
  setUploadSegment('documents'),
  uploadMemory.single('file'),
  (req, res) => controller.addDocument(req, res)
);
router.delete("/documents/:id", authenticateToken, (req, res) => controller.deleteDocument(req, res));
router.patch("/documents/:id", authenticateToken, (req, res) => controller.updateDocument(req, res));

export default router;


