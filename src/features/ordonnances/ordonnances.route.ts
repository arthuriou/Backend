import { Router } from "express";
import controller from "./ordonnances.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();

// Créer une ordonnance
router.post("/", authenticateToken, (req, res) => controller.create(req, res));

// Récupérer les ordonnances d'une consultation
router.get("/consultation/:consultationId", authenticateToken, (req, res) => controller.listByConsultation(req, res));

// Récupérer une ordonnance par ID
router.get("/:id", authenticateToken, (req, res) => controller.get(req, res));

// Mettre à jour une ordonnance
router.patch("/:id", authenticateToken, (req, res) => controller.update(req, res));

// Supprimer une ordonnance
router.delete("/:id", authenticateToken, (req, res) => controller.remove(req, res));

// Récupérer les ordonnances d'un patient
router.get("/patient/:patientId", authenticateToken, (req, res) => controller.getByPatient(req, res));

// Récupérer les ordonnances d'un médecin
router.get("/medecin/:medecinId", authenticateToken, (req, res) => controller.getByMedecin(req, res));

// Valider une ordonnance
router.put("/:id/valider", authenticateToken, (req, res) => controller.valider(req, res));

export default router;


