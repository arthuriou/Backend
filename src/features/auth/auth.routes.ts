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
router.post('/inscription/patient', AuthController.inscrirePatient);

// Inscription médecin
router.post('/inscription/medecin', AuthController.inscrireMedecin);

// Connexion
router.post('/connexion', AuthController.connecter);

// Vérification OTP
router.post('/verifier-otp', AuthController.verifierOTP);

// Renvoi OTP
router.post('/renvoyer-otp', AuthController.renvoyerOTP);

// ================================
// ROUTES PROTÉGÉES
// ================================

// Changer mot de passe
router.post('/changer-mot-de-passe', AuthController.changerMotDePasse);

// Rafraîchir token
router.post('/rafraichir-token', AuthController.rafraichirToken);

// Déconnexion
router.post('/deconnexion', AuthController.deconnexion);

// ================================
// ROUTES ADMIN
// ================================

// Créer médecin (Admin Cabinet)
router.post('/admin/creer-medecin', AuthController.creerMedecinParAdmin);

// Lister médecins cabinet
router.get('/admin/medecins-cabinet', AuthController.listerMedecinsCabinet);

// ================================
// ROUTES SUPER ADMIN
// ================================

// Valider médecin
router.post('/super-admin/valider-medecin', AuthController.validerMedecin);

// Lister médecins en attente
router.get('/super-admin/medecins-en-attente', AuthController.listerMedecinsEnAttente);

// Créer cabinet
router.post('/super-admin/creer-cabinet', AuthController.creerCabinet);

// Créer admin cabinet
router.post('/super-admin/creer-admin-cabinet', AuthController.creerAdminCabinet);

// ================================
// ROUTES DEV
// ================================

if (process.env.NODE_ENV === 'development') {
  // Créer super admin
  router.post('/dev/creer-super-admin', AuthController.creerSuperAdminDev);
  
  // Créer admin cabinet
  router.post('/dev/creer-admin-cabinet', AuthController.creerAdminCabinetDev);
}

export { router as authRoutes };
export default router;
