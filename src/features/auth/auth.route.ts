import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";

const router = Router();
const controller = new AuthController();

router.post("/register-patient", controller.createPatient.bind(controller));
router.post("/register-doctor", controller.createMedecin.bind(controller));
router.post("/login", controller.login.bind(controller));

// Routes OTP
router.post("/send-otp", controller.sendOTP.bind(controller));
router.post("/verify-otp", controller.verifyOTP.bind(controller));
router.post("/resend-otp", controller.resendOTP.bind(controller));

// Routes profil
router.put("/profile/:userId", authenticateToken, controller.updateProfile.bind(controller));
router.put("/profile", authenticateToken, controller.updateProfile.bind(controller));

// Routes SuperAdmin
router.get("/super-admin/pending-medecins", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getPendingMedecins.bind(controller)
);
router.post("/super-admin/validate-medecin", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.validateMedecin.bind(controller)
);

// Routes AdminCabinet
router.post("/admin/create-medecin", 
  authenticateToken, 
  requireRole(['ADMINCABINET']), 
  controller.createMedecinByAdmin.bind(controller)
);

export default router;
