import { User, Patient, Medecin } from "./auth.model";
import db from "../../shared/database/client";
import bcrypt from "bcrypt";

export class AuthRepository {
  async createUser(
    email: string,
    motdepasse: string,
    nom: string,
    prenom?: string,
    telephone?: string
  ): Promise<User> {
    const query = `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, actif, mustChangePassword)
           VALUES ($1, $2, $3, $4, $5, false, false)
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
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
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
    if (actif) {
      // Passer patient.statut à APPROVED si l'utilisateur est un patient
      await db.query(
        `UPDATE patient SET statut = 'APPROVED'
         WHERE utilisateur_id = (SELECT idUtilisateur FROM utilisateur WHERE email = $1)`,
        [email]
      );
    }
  }

  async setMustChangePassword(userId: string, must: boolean): Promise<void> {
    await db.query('UPDATE utilisateur SET mustChangePassword = $2 WHERE idUtilisateur = $1', [userId, must]);
  }

  async updateMedecinProfile(userId: string, update: { experience?: number; biographie?: string }): Promise<void> {
    const med = await db.query(`SELECT idMedecin FROM medecin WHERE utilisateur_id = $1`, [userId]);
    if (med.rows.length === 0) throw new Error('Médecin introuvable');
    const idMedecin = med.rows[0].idmedecin;

    const fields: string[] = [];
    const values: any[] = [idMedecin];
    if (update.experience !== undefined) { fields.push(`experience = $${fields.length + 2}`); values.push(update.experience); }
    if (update.biographie !== undefined) { fields.push(`biographie = $${fields.length + 2}`); values.push(update.biographie); }
    if (fields.length === 0) return;
    const q = `UPDATE medecin SET ${fields.join(', ')} WHERE idMedecin = $1`;
    await db.query(q, values);
  }

  async updatePatientProfile(
    userId: string,
    update: { datenaissance?: Date; genre?: string; adresse?: string; groupesanguin?: string; poids?: number; taille?: number }
  ): Promise<void> {
    const p = await db.query(`SELECT idPatient FROM patient WHERE utilisateur_id = $1`, [userId]);
    if (p.rows.length === 0) throw new Error('Patient introuvable');
    const idPatient = p.rows[0].idpatient;

    const fields: string[] = [];
    const values: any[] = [idPatient];
    if (update.datenaissance !== undefined) { fields.push(`dateNaissance = $${fields.length + 2}`); values.push(update.datenaissance); }
    if (update.genre !== undefined) { fields.push(`genre = $${fields.length + 2}`); values.push(update.genre); }
    if (update.adresse !== undefined) { fields.push(`adresse = $${fields.length + 2}`); values.push(update.adresse); }
    if (update.groupesanguin !== undefined) { fields.push(`groupeSanguin = $${fields.length + 2}`); values.push(update.groupesanguin); }
    if (update.poids !== undefined) { fields.push(`poids = $${fields.length + 2}`); values.push(update.poids); }
    if (update.taille !== undefined) { fields.push(`taille = $${fields.length + 2}`); values.push(update.taille); }
    if (fields.length === 0) return;
    const q = `UPDATE patient SET ${fields.join(', ')} WHERE idPatient = $1`;
    await db.query(q, values);
  }

  async getPatientProfile(userId: string): Promise<Patient> {
    const query = `SELECT * FROM patient WHERE utilisateur_id = $1`;
    const result = await db.query<Patient>(query, [userId]);
    return result.rows[0];
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

  // Password & users
  async getUserById(userId: string): Promise<User | null> {
    const r = await db.query<User>(`SELECT * FROM utilisateur WHERE idUtilisateur = $1`, [userId]);
    const user = r.rows[0] || null;
    if (user) {
      // Déterminer le rôle de l'utilisateur
      const role = await this.getUserRole(userId);
      user.role = role;
    }
    return user;
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await db.query(`UPDATE utilisateur SET motDePasse = $2 WHERE idUtilisateur = $1`, [userId, hashedPassword]);
  }

  // Password reset via otp_verification (réutilisation du stockage OTP)
  async savePasswordResetCode(email: string, code: string): Promise<void> {
    const query = `INSERT INTO otp_verification (email, code, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
           ON CONFLICT (email)
           DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '15 minutes'`;
    await db.query(query, [email, code]);
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<boolean> {
    const r = await db.query(`SELECT 1 FROM otp_verification WHERE email = $1 AND code = $2 AND expires_at > NOW()`, [email, code]);
    return r.rows.length > 0;
  }

  async clearPasswordResetCode(email: string): Promise<void> {
    await db.query('DELETE FROM otp_verification WHERE email = $1', [email]);
  }

  async getUserIdByMedecinId(medecinId: string): Promise<string | null> {
    const r = await db.query(`SELECT utilisateur_id FROM medecin WHERE idMedecin = $1`, [medecinId]);
    if (r.rows.length === 0) return null;
    return r.rows[0].utilisateur_id as string;
  }

  // ========================================
  // MÉTHODES DE RÉCUPÉRATION D'INFORMATIONS
  // ========================================

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    const result = await db.query(
      "SELECT * FROM patient WHERE utilisateur_id = $1",
      [userId]
    );
    return result.rows[0] || null;
  }

  async getMedecinByUserId(userId: string): Promise<Medecin | null> {
    const result = await db.query(
      "SELECT * FROM medecin WHERE utilisateur_id = $1",
      [userId]
    );
    return result.rows[0] || null;
  }

  async getAdminByUserId(userId: string): Promise<any> {
    const result = await db.query(
      `SELECT a.*, c.nom as cabinet_nom, c.adresse as cabinet_adresse 
       FROM admincabinet a 
       LEFT JOIN cabinet c ON a.cabinet_id = c.idCabinet 
       WHERE a.utilisateur_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async getAllPatients(offset: number, limit: number, search?: string): Promise<any> {
    let query = `
      SELECT u.*, p.*, 'PATIENT' as role,
             CASE WHEN u.actif = true THEN 'ACTIF' ELSE 'INACTIF' END as statut_utilisateur
      FROM utilisateur u
      INNER JOIN patient p ON u.idUtilisateur = p.utilisateur_id
      WHERE EXISTS (SELECT 1 FROM patient p2 WHERE p2.utilisateur_id = u.idUtilisateur)
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.nom ILIKE $${paramCount} OR u.prenom ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.nom, u.prenom LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  async getAllMedecins(offset: number, limit: number, search?: string, specialite?: string, cabinetId?: string): Promise<any> {
    let query = `
      SELECT u.*, m.*, c.nom as cabinet_nom, c.adresse as cabinet_adresse, 'MEDECIN' as role,
             CASE WHEN u.actif = true THEN 'ACTIF' ELSE 'INACTIF' END as statut_utilisateur
      FROM utilisateur u
      INNER JOIN medecin m ON u.idUtilisateur = m.utilisateur_id
      LEFT JOIN medecin_cabinet mc ON m.idMedecin = mc.medecin_id
      LEFT JOIN cabinet c ON mc.cabinet_id = c.idCabinet
      WHERE EXISTS (SELECT 1 FROM medecin m2 WHERE m2.utilisateur_id = u.idUtilisateur)
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.nom ILIKE $${paramCount} OR u.prenom ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (specialite) {
      paramCount++;
      query += ` AND m.specialite = $${paramCount}`;
      params.push(specialite);
    }

    if (cabinetId) {
      paramCount++;
      query += ` AND mc.cabinet_id = $${paramCount}`;
      params.push(cabinetId);
    }

    query += ` ORDER BY u.nom, u.prenom LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  async getAllAdmins(offset: number, limit: number, search?: string, cabinetId?: string): Promise<any> {
    let query = `
      SELECT u.*, a.*, c.nom as cabinet_nom, c.adresse as cabinet_adresse, 'ADMINCABINET' as role,
             CASE WHEN u.actif = true THEN 'ACTIF' ELSE 'INACTIF' END as statut_utilisateur
      FROM utilisateur u
      INNER JOIN admincabinet a ON u.idUtilisateur = a.utilisateur_id
      LEFT JOIN cabinet c ON a.cabinet_id = c.idCabinet
      WHERE EXISTS (SELECT 1 FROM admincabinet a2 WHERE a2.utilisateur_id = u.idUtilisateur)
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.nom ILIKE $${paramCount} OR u.prenom ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (cabinetId) {
      paramCount++;
      query += ` AND a.cabinet_id = $${paramCount}`;
      params.push(cabinetId);
    }

    query += ` ORDER BY u.nom, u.prenom LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  async getUsersByRole(role: string, offset: number, limit: number, search?: string): Promise<any> {
    // Mapper les rôles aux noms de tables corrects
    const tableMap: { [key: string]: string } = {
      'PATIENT': 'patient',
      'MEDECIN': 'medecin',
      'ADMINCABINET': 'admincabinet',
      'SUPERADMIN': 'superadmin'
    };
    
    const tableName = tableMap[role.toUpperCase()] || role.toLowerCase();
    
    let query = `
      SELECT u.*, $1 as role,
             CASE WHEN u.actif = true THEN 'ACTIF' ELSE 'INACTIF' END as statut_utilisateur
      FROM utilisateur u
      WHERE EXISTS (
        SELECT 1 FROM ${tableName} r WHERE r.utilisateur_id = u.idUtilisateur
      )
    `;
    const params: any[] = [role];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (u.nom ILIKE $${paramCount} OR u.prenom ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.nom, u.prenom LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  // ========================================
  // GESTION SUPERADMIN
  // ========================================

  async getSuperAdminByUserId(userId: string): Promise<any> {
    const result = await db.query(
      `SELECT s.*, 'SUPERADMIN' as role
       FROM superAdmin s 
       WHERE s.utilisateur_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async updateSuperAdminProfile(
    userId: string,
    nom?: string,
    prenom?: string,
    telephone?: string,
    email?: string
  ): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (nom !== undefined) {
      paramCount++;
      updates.push(`nom = $${paramCount}`);
      values.push(nom);
    }

    if (prenom !== undefined) {
      paramCount++;
      updates.push(`prenom = $${paramCount}`);
      values.push(prenom);
    }

    if (telephone !== undefined) {
      paramCount++;
      updates.push(`telephone = $${paramCount}`);
      values.push(telephone);
    }

    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (updates.length === 0) {
      throw new Error("Aucune donnée à mettre à jour");
    }

    paramCount++;
    updates.push(`derniereconnexion = NOW()`);
    values.push(userId);

    const query = `UPDATE utilisateur SET ${updates.join(', ')} WHERE idUtilisateur = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async createAdminCabinet(
    email: string,
    motdepasse: string,
    nom: string,
    prenom: string,
    telephone: string,
    cabinetId: string,
    roleAdmin: string = "ADMIN_PRINCIPAL"
  ): Promise<any> {
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await db.query(
      'SELECT * FROM utilisateur WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email déjà utilisé");
    }

    // Vérifier que le cabinet existe
    const cabinetResult = await db.query(
      'SELECT * FROM cabinet WHERE idCabinet = $1',
      [cabinetId]
    );

    if (cabinetResult.rows.length === 0) {
      throw new Error("Cabinet non trouvé");
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Créer l'utilisateur
    const userResult = await db.query(
      `INSERT INTO utilisateur (email, motdepasse, nom, prenom, telephone, datecreation, actif)
       VALUES ($1, $2, $3, $4, $5, NOW(), true)
       RETURNING *`,
      [email, hashedPassword, nom, prenom, telephone]
    );

    const user = userResult.rows[0];

    // Créer l'AdminCabinet
    const adminResult = await db.query(
      `INSERT INTO admincabinet (utilisateur_id, cabinet_id, roleadmin, dateaffectation)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [user.idUtilisateur, cabinetId, roleAdmin]
    );

    const adminCabinet = adminResult.rows[0];

    return {
      user: {
        idUtilisateur: user.idUtilisateur,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        dateCreation: user.datecreation,
        statut: user.actif ? "ACTIF" : "INACTIF"
      },
      adminCabinet: {
        idAdminCabinet: adminCabinet.idAdminCabinet,
        utilisateur_id: adminCabinet.utilisateur_id,
        cabinet_id: adminCabinet.cabinet_id,
        roleAdmin: adminCabinet.roleadmin,
        dateAttribution: adminCabinet.dateaffectation
      }
    };
  }

  // ========================================
  // GESTION DES CABINETS (SUPERADMIN)
  // ========================================

  async createCabinet(
    nom: string,
    adresse: string,
    telephone: string,
    email?: string,
    siteWeb?: string,
    description?: string,
    specialites?: string[]
  ): Promise<any> {
    const query = `
      INSERT INTO cabinet (nom, adresse, telephone, email, logo, horairesouverture)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      nom, 
      adresse, 
      telephone, 
      email, 
      siteWeb || null, // Utiliser siteWeb comme logo si fourni
      description ? JSON.stringify({ description, specialites }) : null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllCabinets(offset: number, limit: number, search?: string): Promise<any> {
    let query = `
      SELECT c.*, 
             COUNT(DISTINCT mc.medecin_id) as nombre_medecins,
             COUNT(DISTINCT a.utilisateur_id) as nombre_admins
      FROM cabinet c
      LEFT JOIN medecin_cabinet mc ON c.idCabinet = mc.cabinet_id
      LEFT JOIN admincabinet a ON c.idCabinet = a.cabinet_id
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` WHERE (c.nom ILIKE $${paramCount} OR c.adresse ILIKE $${paramCount} OR c.telephone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY c.idCabinet ORDER BY c.nom LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  async getCabinetById(cabinetId: string): Promise<any> {
    const result = await db.query(
      `SELECT c.*, 
              COUNT(DISTINCT mc.medecin_id) as nombre_medecins,
              COUNT(DISTINCT a.utilisateur_id) as nombre_admins
       FROM cabinet c
       LEFT JOIN medecin_cabinet mc ON c.idCabinet = mc.cabinet_id
       LEFT JOIN admincabinet a ON c.idCabinet = a.cabinet_id
       WHERE c.idCabinet = $1
       GROUP BY c.idCabinet`,
      [cabinetId]
    );
    return result.rows[0] || null;
  }

  async updateCabinet(
    cabinetId: string,
    nom?: string,
    adresse?: string,
    telephone?: string,
    email?: string,
    siteWeb?: string,
    description?: string,
    specialites?: string[]
  ): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (nom !== undefined) {
      paramCount++;
      updates.push(`nom = $${paramCount}`);
      values.push(nom);
    }

    if (adresse !== undefined) {
      paramCount++;
      updates.push(`adresse = $${paramCount}`);
      values.push(adresse);
    }

    if (telephone !== undefined) {
      paramCount++;
      updates.push(`telephone = $${paramCount}`);
      values.push(telephone);
    }

    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (siteWeb !== undefined) {
      paramCount++;
      updates.push(`logo = $${paramCount}`);
      values.push(siteWeb);
    }

    if (description !== undefined || specialites !== undefined) {
      paramCount++;
      const horairesData = { description, specialites };
      updates.push(`horairesouverture = $${paramCount}`);
      values.push(JSON.stringify(horairesData));
    }

    if (updates.length === 0) {
      throw new Error("Aucune donnée à mettre à jour");
    }

    values.push(cabinetId);

    const query = `UPDATE cabinet SET ${updates.join(', ')} WHERE idCabinet = $${paramCount + 1} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async deleteCabinet(cabinetId: string): Promise<void> {
    // Vérifier s'il y a des médecins ou admins associés
    const medecinsResult = await db.query(
      'SELECT COUNT(*) as count FROM medecin_cabinet WHERE cabinet_id = $1',
      [cabinetId]
    );
    
    const adminsResult = await db.query(
      'SELECT COUNT(*) as count FROM admincabinet WHERE cabinet_id = $1',
      [cabinetId]
    );

    if (parseInt(medecinsResult.rows[0].count) > 0 || parseInt(adminsResult.rows[0].count) > 0) {
      throw new Error("Impossible de supprimer le cabinet : il contient encore des médecins ou administrateurs");
    }

    await db.query('DELETE FROM cabinet WHERE idCabinet = $1', [cabinetId]);
  }

  // ========================================
  // GESTION DES ATTRIBUTIONS CABINET (SUPERADMIN)
  // ========================================

  async assignCabinetToAdmin(adminId: string, cabinetId: string): Promise<any> {
    // Vérifier que l'admin existe et est bien un AdminCabinet
    const adminResult = await db.query(
      `SELECT u.*, ac.idAdminCabinet 
       FROM utilisateur u 
       JOIN admincabinet ac ON u.idUtilisateur = ac.utilisateur_id 
       WHERE u.idUtilisateur = $1`,
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      throw new Error("AdminCabinet non trouvé");
    }

    // Vérifier que le cabinet existe
    const cabinetResult = await db.query(
      'SELECT * FROM cabinet WHERE idCabinet = $1',
      [cabinetId]
    );

    if (cabinetResult.rows.length === 0) {
      throw new Error("Cabinet non trouvé");
    }

    // Vérifier si l'attribution existe déjà
    const existingResult = await db.query(
      'SELECT * FROM admincabinet WHERE utilisateur_id = $1 AND cabinet_id = $2',
      [adminId, cabinetId]
    );

    if (existingResult.rows.length > 0) {
      throw new Error("Ce cabinet est déjà attribué à cet AdminCabinet");
    }

    // Attribuer le cabinet à l'AdminCabinet
    const result = await db.query(
      'UPDATE admincabinet SET cabinet_id = $1 WHERE utilisateur_id = $2 RETURNING *',
      [cabinetId, adminId]
    );

    return result.rows[0];
  }

  async unassignCabinetFromAdmin(adminId: string, cabinetId: string): Promise<void> {
    // Vérifier que l'attribution existe
    const existingResult = await db.query(
      'SELECT * FROM admincabinet WHERE utilisateur_id = $1 AND cabinet_id = $2',
      [adminId, cabinetId]
    );

    if (existingResult.rows.length === 0) {
      throw new Error("Cette attribution n'existe pas");
    }

    // Retirer l'attribution (mettre cabinet_id à NULL)
    await db.query(
      'UPDATE admincabinet SET cabinet_id = NULL WHERE utilisateur_id = $1 AND cabinet_id = $2',
      [adminId, cabinetId]
    );
  }

  async getAdminCabinets(adminId: string): Promise<any> {
    const result = await db.query(
      `SELECT c.*, ac.dateaffectation as dateAttribution
       FROM cabinet c
       JOIN admincabinet ac ON c.idCabinet = ac.cabinet_id
       WHERE ac.utilisateur_id = $1`,
      [adminId]
    );

    return result.rows;
  }

  async getCabinetAdmins(cabinetId: string): Promise<any> {
    const result = await db.query(
      `SELECT u.*, ac.idAdminCabinet, ac.dateaffectation as dateAttribution
       FROM utilisateur u
       JOIN admincabinet ac ON u.idUtilisateur = ac.utilisateur_id
       WHERE ac.cabinet_id = $1`,
      [cabinetId]
    );

    return result.rows;
  }
}