import { Router } from "express";
import controller from "./devices.controller";
import { authenticateToken } from "../../shared/middlewares/auth.middleware";

const router = Router();

router.post("/devices", authenticateToken, (req, res) => controller.register(req, res));
router.get("/devices", authenticateToken, (req, res) => controller.list(req, res));
router.delete("/devices/:token", authenticateToken, (req, res) => controller.remove(req, res));

export default router;


