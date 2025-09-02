/**
 * Service d'authentification SantéAfrik
 * Gère l'inscription, connexion, OTP et validation des comptes
 */

import { query, transaction } from '../../shared/config/database';
import { generateTokens, verifyToken, generateOTP, hashPassword, verifyPassword } from '../../shared/utils';
import { sendOTPEmail } from '../../shared/utils/mail.utils';
import { 
  Utilisateur, 
  Patient, 
  Medecin, 
  AdminCabinet, 
  SuperAdmin,
  Role,
  UtilisateurRole,
  AuthUser,
  AuthTokens
} from '../../shared/types';

// ================================
// TYPES D'AUTHENTIFICATION
// ================================

export interface InscriptionPatientData {
  email: string;
  motDePasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  dateNaissance?: Date;
  genre?: string;
  adresse?: string;
  groupeSanguin?: string;
  poids?: number;
  taille?: number;
}

export interface InscriptionMedecinData {
  email: string;
  motDePasse: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  numOrdre: string;
  experience?: number;
  biographie?: string;
}

export interface ConnexionData {
  email: string;
  motDePasse: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

export interface ChangePasswordData {
  utilisateurId: string;
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

// ================================
// SERVICE D'AUTHENTIFICATION
// ================================

export class AuthService {
  
  /**
   * Inscription d'un patient
   * Workflow : Inscription → OTP → Validation automatique
   */
  async inscrirePatient(data: InscriptionPatientData): Promise<{ success: boolean; message: string; utilisateurId?: string }> {
    try {
      // Vérifier que l'email n'existe pas déjà
      const existingUser = await query<Utilisateur>(
        'SELECT idUtilisateur FROM utilisateur WHERE email = $1',
        [data.email]
      );
      
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'Un utilisateur avec cet email existe déjà' };
      }
      
      // Générer l'OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Hasher le mot de passe
      const hashedPassword = await hashPassword(data.motDePasse);
      
      // Créer l'utilisateur et le patient dans une transaction
      const result = await transaction(async (client) => {
        // 1. Créer l'utilisateur
        const utilisateurResult = await client.query<Utilisateur>(
          `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, dateCreation, actif) 
           VALUES ($1, $2, $3, $4, $5, NOW(), true) 
           RETURNING idUtilisateur`,
          [data.email, hashedPassword, data.nom, data.prenom, data.telephone]
        );
        
        const utilisateurId = utilisateurResult.rows[0].idUtilisateur;
        
        // 2. Créer le patient (statut APPROVED direct)
        await client.query(
          `INSERT INTO patient (utilisateur_id, dateNaissance, genre, adresse, groupeSanguin, poids, taille, statut) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED')`,
          [utilisateurId, data.dateNaissance, data.genre, data.adresse, data.groupeSanguin, data.poids, data.taille]
        );
        
        // 3. Attribuer le rôle PATIENT
        const rolePatient = await client.query<Role>(
          'SELECT idRole FROM role WHERE code = $1',
          ['PATIENT']
        );
        
        await client.query(
          `INSERT INTO utilisateurRole (utilisateur_id, role_id, attribueLe, actif) 
           VALUES ($1, $2, NOW(), true)`,
          [utilisateurId, rolePatient.rows[0].idRole]
        );
        
        // 4. Stocker l'OTP (dans une table temporaire ou session)
        // Pour l'instant, on simule l'envoi
        console.log(`📧 OTP généré pour ${data.email}: ${otp}`);
        
        return utilisateurId;
      });
      
      // Envoyer l'OTP par email
      await sendOTPEmail(data.email, otp);
      
      return { 
        success: true, 
        message: 'Patient inscrit avec succès. Vérifiez votre email pour l\'OTP.',
        utilisateurId: result
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription du patient:', error);
      return { success: false, message: 'Erreur lors de l\'inscription' };
    }
  }
  
  /**
   * Inscription d'un médecin (auto-inscription)
   * Workflow : Inscription → OTP → Statut PENDING → SuperAdmin valide
   */
  async inscrireMedecin(data: InscriptionMedecinData): Promise<{ success: boolean; message: string; utilisateurId?: string }> {
    try {
      // Vérifier que l'email et le numéro d'ordre n'existent pas déjà
      const existingUser = await query<Utilisateur>(
        'SELECT idUtilisateur FROM utilisateur WHERE email = $1',
        [data.email]
      );
      
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'Un utilisateur avec cet email existe déjà' };
      }
      
      const existingMedecin = await query<Medecin>(
        'SELECT idMedecin FROM medecin WHERE numOrdre = $1',
        [data.numOrdre]
      );
      
      if (existingMedecin.rows.length > 0) {
        return { success: false, message: 'Un médecin avec ce numéro d\'ordre existe déjà' };
      }
      
      // Générer l'OTP
      const otp = generateOTP();
      
      // Hasher le mot de passe
      const hashedPassword = await hashPassword(data.motDePasse);
      
      // Créer l'utilisateur et le médecin dans une transaction
      const result = await transaction(async (client) => {
        // 1. Créer l'utilisateur
        const utilisateurResult = await client.query<Utilisateur>(
          `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, dateCreation, actif) 
           VALUES ($1, $2, $3, $4, $5, NOW(), true) 
           RETURNING idUtilisateur`,
          [data.email, hashedPassword, data.nom, data.prenom, data.telephone]
        );
        
        const utilisateurId = utilisateurResult.rows[0].idUtilisateur;
        
        // 2. Créer le médecin (statut PENDING)
        await client.query(
          `INSERT INTO medecin (utilisateur_id, numOrdre, experience, biographie, statut) 
           VALUES ($1, $2, $3, $4, 'PENDING')`,
          [utilisateurId, data.numOrdre, data.experience, data.biographie]
        );
        
        // 3. Attribuer le rôle MEDECIN
        const roleMedecin = await client.query<Role>(
          'SELECT idRole FROM role WHERE code = $1',
          ['MEDECIN']
        );
        
        await client.query(
          `INSERT INTO utilisateurRole (utilisateur_id, role_id, attribueLe, actif) 
           VALUES ($1, $2, NOW(), true)`,
          [utilisateurId, roleMedecin.rows[0].idRole]
        );
        
        return utilisateurId;
      });
      
      // Envoyer l'OTP par email
      await sendOTPEmail(data.email, otp);
      
      return { 
        success: true, 
        message: 'Médecin inscrit avec succès. Votre compte sera validé par un administrateur après vérification de l\'OTP.',
        utilisateurId: result
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription du médecin:', error);
      return { success: false, message: 'Erreur lors de l\'inscription' };
    }
  }
  
  /**
   * Création d'un médecin par AdminCabinet
   * Workflow : Création directe → Statut APPROVED (pas d'OTP)
   */
  async creerMedecinParAdmin(data: InscriptionMedecinData, adminCabinetId: string): Promise<{ success: boolean; message: string; utilisateurId?: string }> {
    try {
      // Vérifier que l'admin a la permission
      const hasPermission = await this.verifierPermission(adminCabinetId, 'ADMIN_CABINET_CREATE_MEDECIN');
      if (!hasPermission) {
        return { success: false, message: 'Permission insuffisante pour créer un médecin' };
      }
      
      // Vérifier que l'email et le numéro d'ordre n'existent pas déjà
      const existingUser = await query<Utilisateur>(
        'SELECT idUtilisateur FROM utilisateur WHERE email = $1',
        [data.email]
      );
      
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'Un utilisateur avec cet email existe déjà' };
      }
      
      const existingMedecin = await query<Medecin>(
        'SELECT idMedecin FROM medecin WHERE numOrdre = $1',
        [data.numOrdre]
      );
      
      if (existingMedecin.rows.length > 0) {
        return { success: false, message: 'Un médecin avec ce numéro d\'ordre existe déjà' };
      }
      
      // Générer un mot de passe temporaire
      const motDePasseTemporaire = generateOTP() + 'Aa1!';
      
      // Hasher le mot de passe temporaire
      const hashedPassword = await hashPassword(motDePasseTemporaire);
      
      // Créer l'utilisateur et le médecin dans une transaction
      const result = await transaction(async (client) => {
        // 1. Créer l'utilisateur
        const utilisateurResult = await client.query<Utilisateur>(
          `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, dateCreation, actif) 
           VALUES ($1, $2, $3, $4, $5, NOW(), true) 
           RETURNING idUtilisateur`,
          [data.email, hashedPassword, data.nom, data.prenom, data.telephone]
        );
        
        const utilisateurId = utilisateurResult.rows[0].idUtilisateur;
        
        // 2. Créer le médecin (statut APPROVED direct)
        await client.query(
          `INSERT INTO medecin (utilisateur_id, numOrdre, experience, biographie, statut) 
           VALUES ($1, $2, $3, $4, 'APPROVED')`,
          [utilisateurId, data.numOrdre, data.experience, data.biographie]
        );
        
        // 3. Attribuer le rôle MEDECIN
        const roleMedecin = await client.query<Role>(
          'SELECT idRole FROM role WHERE code = $1',
          ['MEDECIN']
        );
        
        await client.query(
          `INSERT INTO utilisateurRole (utilisateur_id, role_id, attribueLe, actif) 
           VALUES ($1, $2, NOW(), true)`,
          [utilisateurId, roleMedecin.rows[0].idRole]
        );
        
        return utilisateurId;
      });
      
      // Envoyer les identifiants par email
      await sendOTPEmail(data.email, `Votre compte a été créé. Mot de passe temporaire: ${motDePasseTemporaire}`);
      
      return { 
        success: true, 
        message: 'Médecin créé avec succès. Les identifiants ont été envoyés par email.',
        utilisateurId: result
      };
      
    } catch (error) {
      console.error('Erreur lors de la création du médecin:', error);
      return { success: false, message: 'Erreur lors de la création' };
    }
  }
  
  /**
   * Connexion utilisateur
   */
  async connecter(data: ConnexionData): Promise<{ success: boolean; message: string; tokens?: AuthTokens; user?: AuthUser }> {
    try {
      // Récupérer l'utilisateur avec son mot de passe
      const utilisateurResult = await query<Utilisateur>(
        'SELECT * FROM utilisateur WHERE email = $1 AND actif = true',
        [data.email]
      );
      
      if (utilisateurResult.rows.length === 0) {
        return { success: false, message: 'Email ou mot de passe incorrect' };
      }
      
      const utilisateur = utilisateurResult.rows[0];
      
      // Vérifier le mot de passe
      const motDePasseValide = await verifyPassword(data.motDePasse, utilisateur.motDePasse);
      if (!motDePasseValide) {
        return { success: false, message: 'Email ou mot de passe incorrect' };
      }
      
      // Vérifier le statut du compte
      const statutCompte = await this.verifierStatutCompte(utilisateur.idUtilisateur);
      if (!statutCompte.actif) {
        return { success: false, message: statutCompte.message };
      }
      
      // Mettre à jour la dernière connexion
      await query(
        'UPDATE utilisateur SET derniereConnexion = NOW() WHERE idUtilisateur = $1',
        [utilisateur.idUtilisateur]
      );
      
      // Récupérer les rôles de l'utilisateur
      const roles = await this.recupererRolesUtilisateur(utilisateur.idUtilisateur);
      
      // Créer l'objet utilisateur pour l'auth
      const authUser: AuthUser = {
        id: utilisateur.idUtilisateur,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        roles: roles.map(r => r.code),
        actif: utilisateur.actif
      };
      
      // Générer les tokens JWT
      const tokens = generateTokens(authUser);
      
      return { 
        success: true, 
        message: 'Connexion réussie',
        tokens,
        user: authUser
      };
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, message: 'Erreur lors de la connexion' };
    }
  }
  
  /**
   * Vérification OTP
   */
  async verifierOTP(data: OTPVerificationData): Promise<{ success: boolean; message: string }> {
    try {
      // Pour l'instant, on simule la vérification
      // En production, on vérifierait l'OTP stocké en base
      
      // Récupérer l'utilisateur
      const utilisateurResult = await query<Utilisateur>(
        'SELECT * FROM utilisateur WHERE email = $1',
        [data.email]
      );
      
      if (utilisateurResult.rows.length === 0) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }
      
      // Simuler la vérification OTP (en production, vérifier en base)
      if (data.otp === '123456') { // OTP de test
        // Marquer l'utilisateur comme vérifié
        await query(
          'UPDATE utilisateur SET actif = true WHERE email = $1',
          [data.email]
        );
        
        return { success: true, message: 'OTP vérifié avec succès' };
      }
      
      return { success: false, message: 'OTP incorrect' };
      
    } catch (error) {
      console.error('Erreur lors de la vérification OTP:', error);
      return { success: false, message: 'Erreur lors de la vérification OTP' };
    }
  }
  
  /**
   * Changement de mot de passe (première connexion)
   */
  async changerMotDePasse(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier l'ancien mot de passe
      const utilisateurResult = await query<Utilisateur>(
        'SELECT motDePasse FROM utilisateur WHERE idUtilisateur = $1',
        [data.utilisateurId]
      );
      
      if (utilisateurResult.rows.length === 0) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }
      
      const utilisateur = utilisateurResult.rows[0];
      const ancienMotDePasseValide = await verifyPassword(data.ancienMotDePasse, utilisateur.motDePasse);
      
      if (!ancienMotDePasseValide) {
        return { success: false, message: 'Ancien mot de passe incorrect' };
      }
      
      // Hasher le nouveau mot de passe
      const nouveauMotDePasseHash = await hashPassword(data.nouveauMotDePasse);
      
      // Mettre à jour le mot de passe
      await query(
        'UPDATE utilisateur SET motDePasse = $1 WHERE idUtilisateur = $2',
        [nouveauMotDePasseHash, data.utilisateurId]
      );
      
      return { success: true, message: 'Mot de passe modifié avec succès' };
      
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return { success: false, message: 'Erreur lors du changement de mot de passe' };
    }
  }
  
  /**
   * Validation d'un médecin par SuperAdmin
   */
  async validerMedecin(medecinId: string, superAdminId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier que l'utilisateur est SuperAdmin
      const hasPermission = await this.verifierPermission(superAdminId, 'SUPER_ADMIN_APPROVE_MEDECIN');
      if (!hasPermission) {
        return { success: false, message: 'Permission insuffisante pour valider un médecin' };
      }
      
      // Mettre à jour le statut du médecin
      await query(
        'UPDATE medecin SET statut = $1 WHERE idMedecin = $2',
        ['APPROVED', medecinId]
      );
      
      return { success: true, message: 'Médecin validé avec succès' };
      
    } catch (error) {
      console.error('Erreur lors de la validation du médecin:', error);
      return { success: false, message: 'Erreur lors de la validation' };
    }
  }
  
  // ================================
  // MÉTHODES UTILITAIRES
  // ================================
  
  /**
   * Vérifier le statut du compte (Patient, Médecin, etc.)
   */
  private async verifierStatutCompte(utilisateurId: string): Promise<{ actif: boolean; message: string }> {
    try {
      // Vérifier si c'est un patient
      const patientResult = await query<Patient>(
        'SELECT statut FROM patient WHERE utilisateur_id = $1',
        [utilisateurId]
      );
      
      if (patientResult.rows.length > 0) {
        const patient = patientResult.rows[0];
        if (patient.statut === 'SUSPENDED') {
          return { actif: false, message: 'Votre compte patient a été suspendu' };
        }
        return { actif: true, message: 'Compte patient actif' };
      }
      
      // Vérifier si c'est un médecin
      const medecinResult = await query<Medecin>(
        'SELECT statut FROM medecin WHERE utilisateur_id = $1',
        [utilisateurId]
      );
      
      if (medecinResult.rows.length > 0) {
        const medecin = medecinResult.rows[0];
        if (medecin.statut === 'PENDING') {
          return { actif: false, message: 'Votre compte médecin est en attente de validation' };
        }
        if (medecin.statut === 'SUSPENDED') {
          return { actif: false, message: 'Votre compte médecin a été suspendu' };
        }
        return { actif: true, message: 'Compte médecin actif' };
      }
      
      // Vérifier si c'est un AdminCabinet ou SuperAdmin
      const adminResult = await query(
        'SELECT 1 FROM adminCabinet WHERE utilisateur_id = $1 UNION SELECT 1 FROM superAdmin WHERE utilisateur_id = $1',
        [utilisateurId]
      );
      
      if (adminResult.rows.length > 0) {
        return { actif: true, message: 'Compte administrateur actif' };
      }
      
      return { actif: false, message: 'Type de compte non reconnu' };
      
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return { actif: false, message: 'Erreur lors de la vérification du statut' };
    }
  }
  
  /**
   * Récupérer les rôles d'un utilisateur
   */
  private async recupererRolesUtilisateur(utilisateurId: string): Promise<Role[]> {
    try {
      const result = await query<Role>(
        `SELECT r.* FROM role r
         INNER JOIN utilisateurRole ur ON r.idRole = ur.role_id
         WHERE ur.utilisateur_id = $1 AND ur.actif = true`,
        [utilisateurId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      return [];
    }
  }
  
  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  private async verifierPermission(utilisateurId: string, permissionCode: string): Promise<boolean> {
    try {
      const result = await query(
        `SELECT 1 FROM utilisateurRole ur
         INNER JOIN rolePermission rp ON ur.role_id = rp.role_id
         INNER JOIN permission p ON rp.permission_id = p.idPermission
         WHERE ur.utilisateur_id = $1 AND p.code = $2 AND ur.actif = true`,
        [utilisateurId, permissionCode]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }
}

export default new AuthService();
