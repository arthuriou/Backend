import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
const controller = new AuthController();

router.post("/register-patient", controller.createPatient.bind(controller));
router.post("/register-doctor", controller.createMedecin.bind(controller));
router.post("/login", controller.login.bind(controller));

export default router;
