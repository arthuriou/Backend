import { AuthRepository } from "./auth.repository";
import { User, Patient, Medecin } from "./auth.model";
import bcrypt from 'bcrypt';
import { generateOTP, sendOTPEmail } from '../../shared/utils/mail';
import { generateToken, JWTPayload, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.utils';
import db from '../../shared/database/client';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async createPatient(
    email: string,
    motdepasse: string,
    nom: string,
    prenom?: string,
    telephone?: string,
    datenaissance?: Date,
    genre?: string,
    adresse?: string,
    groupesanguin?: string,
    poids?: number,
    taille?: number
  ): Promise<User> {
    const userExistingMail = await this.repository.getUserByEmail(email);
    if (userExistingMail) {
      throw new Error(`Utilisateur avec l'email ${email} existe déjà`);
    }
    
    if (!email || !motdepasse || !nom) {
      throw new Error("Email, mot de passe et nom sont requis");
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
      nom,
      prenom,
      telephone
    );

    await this.repository.createPatient(
      newUser.idutilisateur!,
      datenaissance,
      genre,
      adresse,
      groupesanguin,
      poids,
      taille
    );

    // Envoyer OTP automatiquement après création
    await this.sendOTP(email);

    return newUser;
  }

  async createMedecin(
    email: string,
    motdepasse: string,
    nom: string,
    numordre: string,
    prenom?: string,
    telephone?: string,
    experience?: number,
    biographie?: string
  ): Promise<User> {
    const userExistingMail = await this.repository.getUserByEmail(email);
    if (userExistingMail) {
      throw new Error(`Utilisateur avec l'email ${email} existe déjà`);
    }
    
    if (!email || !motdepasse || !nom || !numordre) {
      throw new Error("Email, mot de passe, nom et numéro d'ordre sont requis");
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
      nom,
      prenom,
      telephone
    );

    await this.repository.createMedecin(
      newUser.idutilisateur!,
      numordre,
      experience,
      biographie
    );

    return newUser;
  }

  async login(email: string, motdepasse: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const user = await this.repository.getUserByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: "Email ou mot de passe incorrect" };
    }

    const isPasswordValid = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: "Email ou mot de passe incorrect" };
    }

    if (!user.actif) {
      throw { statusCode: 403, message: "Compte désactivé" };
    }

    // Déterminer le rôle de l'utilisateur
    const userRole = await this.repository.getUserRole(user.idutilisateur!);

    // Générer le token JWT
    const payload: JWTPayload = {
      userId: user.idutilisateur!,
      email: user.email,
      role: userRole
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { user, token, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const fresh = generateToken(payload);
    return { token: fresh };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.repository.getUserById(userId);
    if (!user) throw { statusCode: 404, message: 'Utilisateur non trouvé' };
    const ok = await bcrypt.compare(oldPassword, user.motdepasse);
    if (!ok) throw { statusCode: 400, message: 'Ancien mot de passe incorrect' };
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(userId, hashed);
    await this.repository.setMustChangePassword(userId, false);
    return true;
  }

  async forgotPassword(email: string) {
    const user = await this.repository.getUserByEmail(email);
    if (!user) throw { statusCode: 404, message: 'Utilisateur non trouvé' };
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    await this.repository.savePasswordResetCode(email, code);
    await sendOTPEmail(email, code, user.nom);
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const valid = await this.repository.verifyPasswordResetCode(email, code);
    if (!valid) throw { statusCode: 400, message: 'Code invalide ou expiré' };
    const user = await this.repository.getUserByEmail(email);
    if (!user) throw { statusCode: 404, message: 'Utilisateur non trouvé' };
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(user.idutilisateur!, hashed);
    await this.repository.clearPasswordResetCode(email);
    await this.repository.setMustChangePassword(user.idutilisateur!, false);
    return true;
  }

  async updateMedecinProfile(userId: string, update: { experience?: number; biographie?: string }) {
    await this.repository.updateMedecinProfile(userId, update);
    return true;
  }

  async updatePatientProfile(userId: string, update: { datenaissance?: Date; genre?: string; adresse?: string; groupesanguin?: string; poids?: number; taille?: number }) {
    await this.repository.updatePatientProfile(userId, update);
    return true;
  }

  // Envoyer OTP
  async sendOTP(email: string): Promise<boolean> {
    try {
      const user = await this.repository.getUserByEmail(email);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const otp = generateOTP();
      await this.repository.saveOTP(email, otp);
      
      const emailSent = await sendOTPEmail(email, otp, user.nom);
      if (!emailSent) {
        throw new Error('Erreur envoi email');
      }

      return true;
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
      return false;
    }
  }

  // Vérifier OTP
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    try {
      const isValid = await this.repository.verifyOTP(email, otp);
      if (isValid) {
        await this.repository.updateUserStatus(email, true);
        await this.repository.deleteOTP(email);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      return false;
    }
  }

  // Renvoyer OTP
  async resendOTP(email: string): Promise<boolean> {
    return await this.sendOTP(email);
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const allowedFields = ['nom', 'prenom', 'telephone', 'photoProfil'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof User] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [userId, ...fieldsToUpdate.map(field => updateData[field as keyof User])];

    const query = `UPDATE utilisateur SET ${setClause} WHERE idUtilisateur = $1 RETURNING *`;
    const result = await db.query<User>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }

    return result.rows[0];
  }

  // Validation médecin par SuperAdmin
  async validateMedecin(medecinId: string, action: 'APPROVED' | 'REJECTED'): Promise<boolean> {
    try {
      await this.repository.validateMedecin(medecinId, action);
      return true;
    } catch (error) {
      console.error('Erreur validation médecin:', error);
      return false;
    }
  }

  // Récupérer médecins en attente
  async getPendingMedecins(): Promise<any[]> {
    return await this.repository.getPendingMedecins();
  }

  // Créer médecin par AdminCabinet (statut APPROVED direct)
  async createMedecinByAdmin(
    email: string,
    motdepasse: string,
    nom: string,
    numordre: string,
    cabinetId: string,
    prenom?: string,
    telephone?: string,
    experience?: number,
    biographie?: string
  ): Promise<User> {
    const userExistingMail = await this.repository.getUserByEmail(email);
    if (userExistingMail) {
      throw new Error(`Utilisateur avec l'email ${email} existe déjà`);
    }
    
    if (!email || !motdepasse || !nom || !numordre || !cabinetId) {
      throw new Error("Email, mot de passe, nom, numéro d'ordre et cabinet sont requis");
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
      nom,
      prenom,
      telephone
    );

    // Forcer changement de mot de passe à la première connexion
    await this.repository.setMustChangePassword(newUser.idutilisateur!, true);

    // Créer le médecin avec statut APPROVED
    await this.repository.createMedecinApproved(
      newUser.idutilisateur!,
      numordre,
      experience,
      biographie
    );

    // Associer le médecin au cabinet
    await this.repository.associateMedecinToCabinet(newUser.idutilisateur!, cabinetId);

    return newUser;
  }
}