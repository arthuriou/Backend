/**
 * Routes d'authentification SantéAfrik
 * Version simplifiée pour identifier le problème path-to-regexp
 */

import { Router } from 'express';
import AuthController from './auth.controller';

const router = Router();

// ================================
// ROUTES PUBLIQUES (pas d'authentification)
// ================================

// Test simple
router.get('/test', (req, res) => {
  res.json({ message: 'Route de test OK' });
});

// Inscription patient
router.post('/register/patient', AuthController.inscrirePatient);

// Inscription médecin
router.post('/register/doctor', AuthController.inscrireMedecin);

// Connexion
router.post('/login', AuthController.connecter);

// Vérification OTP
router.post('/verify-otp', AuthController.verifierOTP);

// Renvoi OTP
router.post('/resend-otp', AuthController.renvoyerOTP);

// ================================
// ROUTES PROTÉGÉES
// ================================

// Changer mot de passe
router.post('/change-password', AuthController.changerMotDePasse);

// Rafraîchir token
router.post('/refresh-token', AuthController.rafraichirToken);

// Déconnexion
router.post('/logout', AuthController.deconnexion);

// ================================
// ROUTES ADMIN
// ================================

// Créer médecin (Admin Cabinet)
router.post('/admin/create-doctor', AuthController.creerMedecinParAdmin);

// Lister médecins cabinet
router.get('/admin/doctors-list', AuthController.listerMedecinsCabinet);

// ================================
// ROUTES SUPER ADMIN
// ================================

// Valider médecin
router.post('/super-admin/validate-doctor', AuthController.validerMedecin);

// Lister médecins en attente
router.get('/super-admin/pending-doctors', AuthController.listerMedecinsEnAttente);

// Créer cabinet
router.post('/super-admin/create-cabinet', AuthController.creerCabinet);

// Créer admin cabinet
router.post('/super-admin/create-admin', AuthController.creerAdminCabinet);

// ================================
// ROUTES DEV
// ================================

if (process.env.NODE_ENV === 'development') {
  // Créer super admin
  router.post('/dev/create-super-admin', AuthController.creerSuperAdminDev);
  
  // Créer admin cabinet
  router.post('/dev/create-cabinet-admin', AuthController.creerAdminCabinetDev);
}

export { router as authRoutes };
export default router;
