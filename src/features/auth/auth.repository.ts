import { User, Patient, Medecin } from "./auth.model";
import db from "../../utils/database";

export class AuthRepository {
  async createUser(
    email: string,
    motdepasse: string,
    nom: string,
    prenom?: string,
    telephone?: string
  ): Promise<User> {
    const query = `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, actif)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING *`;
    const values = [email, motdepasse, nom, prenom, telephone];
    const execute = await db.query<User>(query, values);
    return execute.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.query(
      "SELECT * FROM utilisateur WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  async createPatient(
    utilisateur_id: string,
    datenaissance?: Date,
    genre?: string,
    adresse?: string,
    groupesanguin?: string,
    poids?: number,
    taille?: number
  ): Promise<Patient> {
    const query = `INSERT INTO patient (utilisateur_id, dateNaissance, genre, adresse, groupeSanguin, poids, taille, statut)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED')
           RETURNING *`;
    const values = [utilisateur_id, datenaissance, genre, adresse, groupesanguin, poids, taille];
    const execute = await db.query<Patient>(query, values);
    return execute.rows[0];
  }

  async createMedecin(
    utilisateur_id: string,
    numordre: string,
    experience?: number,
    biographie?: string
  ): Promise<Medecin> {
    const query = `INSERT INTO medecin (utilisateur_id, numOrdre, experience, biographie, statut)
           VALUES ($1, $2, $3, $4, 'PENDING')
           RETURNING *`;
    const values = [utilisateur_id, numordre, experience, biographie];
    const execute = await db.query<Medecin>(query, values);
    return execute.rows[0];
  }

  // Gestion OTP
  async saveOTP(email: string, otp: string): Promise<void> {
    const query = `INSERT INTO otp_verification (email, code, expires_at) 
           VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
           ON CONFLICT (email) 
           DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '10 minutes'`;
    await db.query(query, [email, otp]);
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const query = `SELECT * FROM otp_verification 
           WHERE email = $1 AND code = $2 AND expires_at > NOW()`;
    const result = await db.query(query, [email, otp]);
    return result.rows.length > 0;
  }

  async deleteOTP(email: string): Promise<void> {
    await db.query('DELETE FROM otp_verification WHERE email = $1', [email]);
  }

  async updateUserStatus(email: string, actif: boolean): Promise<void> {
    await db.query('UPDATE utilisateur SET actif = $1 WHERE email = $2', [actif, email]);
  }

  // Déterminer le rôle d'un utilisateur
  async getUserRole(userId: string): Promise<string> {
    // Vérifier si c'est un SuperAdmin
    const superAdminQuery = 'SELECT * FROM superAdmin WHERE utilisateur_id = $1';
    const superAdminResult = await db.query(superAdminQuery, [userId]);
    if (superAdminResult.rows.length > 0) {
      return 'SUPERADMIN';
    }

    // Vérifier si c'est un AdminCabinet
    const adminCabinetQuery = 'SELECT * FROM adminCabinet WHERE utilisateur_id = $1';
    const adminCabinetResult = await db.query(adminCabinetQuery, [userId]);
    if (adminCabinetResult.rows.length > 0) {
      return 'ADMINCABINET';
    }

    // Vérifier si c'est un Médecin
    const medecinQuery = 'SELECT * FROM medecin WHERE utilisateur_id = $1';
    const medecinResult = await db.query(medecinQuery, [userId]);
    if (medecinResult.rows.length > 0) {
      return 'MEDECIN';
    }

    // Vérifier si c'est un Patient
    const patientQuery = 'SELECT * FROM patient WHERE utilisateur_id = $1';
    const patientResult = await db.query(patientQuery, [userId]);
    if (patientResult.rows.length > 0) {
      return 'PATIENT';
    }

    return 'UNKNOWN';
  }

  // Validation médecin par SuperAdmin
  async validateMedecin(medecinId: string, action: 'APPROVED' | 'REJECTED'): Promise<void> {
    const query = 'UPDATE medecin SET statut = $1 WHERE idMedecin = $2';
    await db.query(query, [action, medecinId]);
  }

  // Récupérer tous les médecins en attente
  async getPendingMedecins(): Promise<any[]> {
    const query = `
      SELECT m.*, u.email, u.nom, u.prenom, u.telephone, u.dateCreation
      FROM medecin m
      JOIN utilisateur u ON m.utilisateur_id = u.idUtilisateur
      WHERE m.statut = 'PENDING'
      ORDER BY u.dateCreation ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Créer médecin avec statut APPROVED (par AdminCabinet)
  async createMedecinApproved(
    utilisateur_id: string,
    numordre: string,
    experience?: number,
    biographie?: string
  ): Promise<Medecin> {
    const query = `INSERT INTO medecin (utilisateur_id, numOrdre, experience, biographie, statut)
           VALUES ($1, $2, $3, $4, 'APPROVED')
           RETURNING *`;
    const values = [utilisateur_id, numordre, experience, biographie];
    const execute = await db.query<Medecin>(query, values);
    return execute.rows[0];
  }

  // Associer médecin à un cabinet
  async associateMedecinToCabinet(medecinId: string, cabinetId: string): Promise<void> {
    const query = `INSERT INTO medecin_cabinet (medecin_id, cabinet_id, roleCabinet)
           VALUES ($1, $2, 'MEDECIN')`;
    await db.query(query, [medecinId, cabinetId]);
  }
}