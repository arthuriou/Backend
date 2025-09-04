import { Router } from "express";
import controller from "./ordonnances.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateToken, (req, res) => controller.create(req, res));
router.get("/consultation/:consultationId", authenticateToken, (req, res) => controller.listByConsultation(req, res));
router.get("/:id", authenticateToken, (req, res) => controller.get(req, res));
router.patch("/:id", authenticateToken, (req, res) => controller.update(req, res));
router.delete("/:id", authenticateToken, (req, res) => controller.remove(req, res));

export default router;


