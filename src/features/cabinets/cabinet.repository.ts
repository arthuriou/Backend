import { Cabinet, AdminCabinet } from "./cabinet.model";
import db from "../../utils/database";

export class CabinetRepository {
  // Créer un cabinet
  async createCabinet(
    nom: string,
    adresse?: string,
    telephone?: string,
    email?: string,
    logo?: string,
    horairesOuverture?: any
  ): Promise<Cabinet> {
    const query = `INSERT INTO cabinet (nom, adresse, telephone, email, logo, horairesouverture, actif)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           RETURNING *`;
    const values = [nom, adresse, telephone, email, logo, horairesOuverture];
    const result = await db.query<Cabinet>(query, values);
    return result.rows[0];
  }

  // Créer un utilisateur AdminCabinet
  async createAdminCabinetUser(
    email: string,
    motdepasse: string,
    nom: string,
    prenom?: string,
    telephone?: string
  ): Promise<any> {
    const query = `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, mustChangePassword)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING idUtilisateur, email, nom, prenom, telephone, dateCreation, actif, mustChangePassword`;
    const values = [email, motdepasse, nom, prenom, telephone];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Créer un AdminCabinet
  async createAdminCabinet(
    utilisateur_id: string,
    cabinet_id: string,
    roleAdmin: string
  ): Promise<AdminCabinet> {
    const query = `INSERT INTO adminCabinet (utilisateur_id, cabinet_id, roleAdmin)
           VALUES ($1, $2, $3)
           RETURNING *`;
    const values = [utilisateur_id, cabinet_id, roleAdmin];
    const result = await db.query<AdminCabinet>(query, values);
    return result.rows[0];
  }

  // Récupérer tous les cabinets (actifs seulement)
  async getAllCabinets(): Promise<Cabinet[]> {
    const query = `SELECT * FROM cabinet WHERE actif = true ORDER BY nom ASC`;
    const result = await db.query<Cabinet>(query);
    return result.rows;
  }

  // Récupérer un cabinet par ID (actif seulement)
  async getCabinetById(cabinetId: string): Promise<Cabinet | null> {
    const query = `SELECT * FROM cabinet WHERE idcabinet = $1 AND actif = true`;
    const result = await db.query<Cabinet>(query, [cabinetId]);
    return result.rows[0] || null;
  }

  // Récupérer les AdminCabinet d'un cabinet
  async getCabinetAdmins(cabinetId: string): Promise<any[]> {
    const query = `
      SELECT ac.*, u.email, u.nom, u.prenom, u.telephone, u.dateCreation
      FROM adminCabinet ac
      JOIN utilisateur u ON ac.utilisateur_id = u.idUtilisateur
      WHERE ac.cabinet_id = $1
      ORDER BY ac.dateAffectation ASC
    `;
    const result = await db.query(query, [cabinetId]);
    return result.rows;
  }

  // Vérifier si un utilisateur est AdminCabinet d'un cabinet
  async isAdminCabinet(userId: string, cabinetId: string): Promise<boolean> {
    const query = `SELECT * FROM adminCabinet WHERE utilisateur_id = $1 AND cabinet_id = $2`;
    const result = await db.query(query, [userId, cabinetId]);
    return result.rows.length > 0;
  }

  async medecinBelongsToCabinet(medecinId: string, cabinetId: string): Promise<boolean> {
    const r = await db.query(`SELECT 1 FROM medecin_cabinet WHERE medecin_id = $1 AND cabinet_id = $2 AND actif = true`, [medecinId, cabinetId]);
    return r.rows.length > 0;
  }

  // Modifier un cabinet
  async updateCabinet(cabinetId: string, updateData: Partial<Cabinet>): Promise<Cabinet> {
    const allowedFields = ['nom', 'adresse', 'telephone', 'email', 'logo', 'horairesOuverture'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof Cabinet] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [cabinetId, ...fieldsToUpdate.map(field => updateData[field as keyof Cabinet])];

    const query = `UPDATE cabinet SET ${setClause} WHERE idcabinet = $1 RETURNING *`;
    const result = await db.query<Cabinet>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Cabinet non trouvé');
    }

    return result.rows[0];
  }

  // Archiver un cabinet
  async archiveCabinet(cabinetId: string): Promise<boolean> {
    const query = `UPDATE cabinet SET actif = false WHERE idcabinet = $1`;
    const result = await db.query(query, [cabinetId]);
    return (result.rowCount || 0) > 0;
  }

  // Gestion des spécialités du cabinet
  async addSpecialiteToCabinet(cabinetId: string, specialiteId: string): Promise<void> {
    const query = `INSERT INTO cabinet_specialite (cabinet_id, specialite_id) VALUES ($1, $2)`;
    await db.query(query, [cabinetId, specialiteId]);
  }

  async removeSpecialiteFromCabinet(cabinetId: string, specialiteId: string): Promise<void> {
    const query = `DELETE FROM cabinet_specialite WHERE cabinet_id = $1 AND specialite_id = $2`;
    await db.query(query, [cabinetId, specialiteId]);
  }

  async getCabinetSpecialites(cabinetId: string): Promise<any[]> {
    const query = `
      SELECT s.*, cs.cabinet_id
      FROM specialite s
      JOIN cabinet_specialite cs ON s.idSpecialite = cs.specialite_id
      WHERE cs.cabinet_id = $1
      ORDER BY s.nom ASC
    `;
    const result = await db.query(query, [cabinetId]);
    return result.rows;
  }

  // Gestion des médecins du cabinet
  async getCabinetMedecins(cabinetId: string): Promise<any[]> {
    const query = `
      SELECT m.*, u.email, u.nom, u.prenom, u.telephone, u.dateCreation, mc.roleCabinet, mc.dateAffectation
      FROM medecin m
      JOIN utilisateur u ON m.utilisateur_id = u.idUtilisateur
      JOIN medecin_cabinet mc ON m.idMedecin = mc.medecin_id
      WHERE mc.cabinet_id = $1 AND mc.actif = true
      ORDER BY mc.dateAffectation ASC
    `;
    const result = await db.query(query, [cabinetId]);
    return result.rows;
  }

  async archiveMedecinFromCabinet(medecinId: string, cabinetId: string): Promise<void> {
    const query = `UPDATE medecin_cabinet SET actif = false WHERE medecin_id = $1 AND cabinet_id = $2`;
    await db.query(query, [medecinId, cabinetId]);
  }

  // Statistiques du cabinet
  async getCabinetStats(cabinetId: string): Promise<any> {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM medecin_cabinet WHERE cabinet_id = $1) as total_medecins,
        (SELECT COUNT(*) FROM adminCabinet WHERE cabinet_id = $1) as total_admins,
        (SELECT COUNT(*) FROM cabinet_specialite WHERE cabinet_id = $1) as total_specialites
    `;
    const statsResult = await db.query(statsQuery, [cabinetId]);
    
    return statsResult.rows[0];
  }
}
