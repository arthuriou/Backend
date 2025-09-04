import { Router } from "express";
import controller from "./dossier-medical.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();

// Dossier du patient (création si inexistant)
router.get("/dossier/:patientId", authenticateToken, (req, res) => controller.getOrCreate(req, res));

// Documents du dossier
router.get("/:dossierId/documents", authenticateToken, (req, res) => controller.listDocuments(req, res));
router.post("/documents", authenticateToken, (req, res) => controller.addDocument(req, res));
router.delete("/documents/:id", authenticateToken, (req, res) => controller.deleteDocument(req, res));
router.patch("/documents/:id", authenticateToken, (req, res) => controller.updateDocument(req, res));

export default router;


