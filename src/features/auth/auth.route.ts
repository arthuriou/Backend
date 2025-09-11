import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticateToken, requireRole } from "../../shared/middlewares/auth.middleware";
import { uploadMemory, setUploadSegment } from "../../shared/utils/upload";

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
router.patch("/profile/medecin", authenticateToken, controller.updateMedecinProfile.bind(controller));
router.patch("/profile/patient", authenticateToken, controller.updatePatientProfile.bind(controller));
router.patch("/profile/:userId", authenticateToken, controller.updateProfile.bind(controller));
router.patch("/profile", authenticateToken, controller.updateProfile.bind(controller));

// Upload photo de profil
router.post(
  "/profile/photo",
  authenticateToken,
  setUploadSegment('profile'),
  // Accepte plusieurs noms de champs possibles
  uploadMemory.fields([
    { name: 'file', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
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

// ========================================
// ENDPOINTS DE RÉCUPÉRATION D'INFORMATIONS
// ========================================

// Récupérer le profil de l'utilisateur connecté
router.get("/profile", 
  authenticateToken, 
  controller.getProfile.bind(controller)
);

// Récupérer un utilisateur par ID (pour les admins)
router.get("/user/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET', 'MEDECIN']), 
  controller.getUserById.bind(controller)
);

// Récupérer tous les patients (avec pagination et recherche)
router.get("/patients", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET', 'MEDECIN']), 
  controller.getAllPatients.bind(controller)
);

// Récupérer tous les médecins (avec pagination, recherche et filtres)
router.get("/medecins", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.getAllMedecins.bind(controller)
);

// Recherche publique (PATIENT non authentifié autorisé) des médecins APPROVED
router.get(
  "/medecins/search",
  controller.searchApprovedMedecins.bind(controller)
);

// Récupérer tous les administrateurs (avec pagination et recherche)
router.get("/admins", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getAllAdmins.bind(controller)
);

// Récupérer les utilisateurs par rôle (générique)
router.get("/users/role/:role", 
  authenticateToken, 
  requireRole(['SUPERADMIN', 'ADMINCABINET']), 
  controller.getUsersByRole.bind(controller)
);

// ========================================
// GESTION SUPERADMIN
// ========================================

// Récupérer le profil SuperAdmin
router.get("/super-admin/profile", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getSuperAdminProfile.bind(controller)
);

// Mettre à jour le profil SuperAdmin
router.patch("/super-admin/profile", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.updateSuperAdminProfile.bind(controller)
);

// Changer le mot de passe SuperAdmin
router.post("/super-admin/change-password", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.changeSuperAdminPassword.bind(controller)
);

// Créer un AdminCabinet
router.post("/super-admin/create-admin", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.createAdminCabinet.bind(controller)
);

// ========================================
// GESTION DES CABINETS (SUPERADMIN)
// ========================================

// Créer un cabinet
router.post("/super-admin/cabinets", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.createCabinet.bind(controller)
);

// Récupérer tous les cabinets
router.get("/super-admin/cabinets", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getAllCabinets.bind(controller)
);

// Récupérer un cabinet par ID
router.get("/super-admin/cabinets/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getCabinetById.bind(controller)
);

// Mettre à jour un cabinet
router.put("/super-admin/cabinets/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.updateCabinet.bind(controller)
);

// Supprimer un cabinet
router.delete("/super-admin/cabinets/:id", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.deleteCabinet.bind(controller)
);

// ========================================
// GESTION DES ATTRIBUTIONS CABINET (SUPERADMIN)
// ========================================

// Attribuer un cabinet à un AdminCabinet
router.post("/super-admin/assign-cabinet", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.assignCabinetToAdmin.bind(controller)
);

// Retirer un cabinet d'un AdminCabinet
router.delete("/super-admin/assign-cabinet/:adminId", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.unassignCabinetFromAdmin.bind(controller)
);

// Récupérer les cabinets d'un AdminCabinet
router.get("/super-admin/admin-cabinets/:adminId", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getAdminCabinets.bind(controller)
);

// Récupérer les AdminCabinet d'un cabinet
router.get("/super-admin/cabinets/:cabinetId/admins", 
  authenticateToken, 
  requireRole(['SUPERADMIN']), 
  controller.getCabinetAdmins.bind(controller)
);

export default router;
