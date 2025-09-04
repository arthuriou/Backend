import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";
import { upload, setUploadSegment } from "../../shared/utils/upload";

const router = Router();
const controller = new AuthController();

// Auth de base
router.post("/register-patient", controller.createPatient.bind(controller));
router.post("/register-doctor", controller.createMedecin.bind(controller));
router.post("/login", controller.login.bind(controller));
router.post("/refresh", controller.refresh.bind(controller));

// Routes OTP
router.post("/send-otp", controller.sendOTP.bind(controller));
router.post("/verify-otp", controller.verifyOTP.bind(controller));
router.post("/resend-otp", controller.resendOTP.bind(controller));

// Profil (mises à jour partielles → PATCH)
router.patch("/profile/:userId", authenticateToken, controller.updateProfile.bind(controller));
router.patch("/profile", authenticateToken, controller.updateProfile.bind(controller));
router.patch("/profile/medecin", authenticateToken, controller.updateMedecinProfile.bind(controller));
router.patch("/profile/patient", authenticateToken, controller.updatePatientProfile.bind(controller));

// Upload photo de profil
router.post(
  "/profile/photo",
  authenticateToken,
  setUploadSegment('profile'),
  upload.single('file'),
  (req, res) => controller.uploadProfilePhoto(req, res)
);

// Sécurité mot de passe
router.post("/change-password", authenticateToken, controller.changePassword.bind(controller));
router.post("/forgot-password", controller.forgotPassword.bind(controller));
router.post("/reset-password", controller.resetPassword.bind(controller));

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
