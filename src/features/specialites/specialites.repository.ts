import { 
  Specialite, 
  Maux, 
  MedecinSpecialite, 
  CabinetSpecialite, 
  SpecialiteMaux,
  SpecialiteWithDetails,
  MauxWithDetails,
  MedecinWithSpecialites,
  CabinetWithSpecialites,
  CreateSpecialiteRequest,
  UpdateSpecialiteRequest,
  CreateMauxRequest,
  UpdateMauxRequest,
  SearchSpecialiteRequest,
  SearchMauxRequest,
  SearchMedecinBySpecialiteRequest,
  SearchCabinetBySpecialiteRequest,
  SearchMedecinByMauxRequest
} from "./specialites.model";
import db from "../../utils/database";

export class SpecialitesRepository {

  // ========================================
  // SPÉCIALITÉS
  // ========================================

  // Créer une spécialité
  async createSpecialite(data: CreateSpecialiteRequest): Promise<Specialite> {
    const query = `
      INSERT INTO specialite (nom, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [data.nom, data.description];
    const result = await db.query<Specialite>(query, values);
    return result.rows[0];
  }

  // Récupérer toutes les spécialités
  async getAllSpecialites(limit: number = 50, offset: number = 0): Promise<Specialite[]> {
    const query = `
      SELECT * FROM specialite
      ORDER BY nom ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query<Specialite>(query, [limit, offset]);
    return result.rows;
  }

  // Récupérer une spécialité par ID
  async getSpecialiteById(id: string): Promise<Specialite | null> {
    const query = `SELECT * FROM specialite WHERE idSpecialite = $1`;
    const result = await db.query<Specialite>(query, [id]);
    return result.rows[0] || null;
  }

  // Récupérer une spécialité avec détails
  async getSpecialiteWithDetails(id: string): Promise<SpecialiteWithDetails | null> {
    const query = `
      SELECT 
        s.*,
        COUNT(DISTINCT ms.medecin_id) as nombre_medecins,
        COUNT(DISTINCT cs.cabinet_id) as nombre_cabinets,
        COUNT(DISTINCT sm.maux_id) as nombre_maux
      FROM specialite s
      LEFT JOIN medecin_specialite ms ON s.idSpecialite = ms.specialite_id
      LEFT JOIN cabinet_specialite cs ON s.idSpecialite = cs.specialite_id
      LEFT JOIN specialite_maux sm ON s.idSpecialite = sm.specialite_id
      WHERE s.idSpecialite = $1
      GROUP BY s.idSpecialite
    `;
    
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const specialite = result.rows[0];
    
    // Récupérer les médecins
    const medecinsQuery = `
      SELECT m.idMedecin, m.nom, m.prenom, m.email
      FROM medecin m
      JOIN medecin_specialite ms ON m.idMedecin = ms.medecin_id
      WHERE ms.specialite_id = $1
    `;
    const medecinsResult = await db.query(medecinsQuery, [id]);
    
    // Récupérer les cabinets
    const cabinetsQuery = `
      SELECT c.idCabinet, c.nom, c.adresse
      FROM cabinet c
      JOIN cabinet_specialite cs ON c.idCabinet = cs.cabinet_id
      WHERE cs.specialite_id = $1 AND c.actif = true
    `;
    const cabinetsResult = await db.query(cabinetsQuery, [id]);
    
    // Récupérer les maux
    const mauxQuery = `
      SELECT m.idMaux, m.nom, m.categorie
      FROM maux m
      JOIN specialite_maux sm ON m.idMaux = sm.maux_id
      WHERE sm.specialite_id = $1
    `;
    const mauxResult = await db.query(mauxQuery, [id]);
    
    return {
      idspecialite: specialite.idspecialite,
      nom: specialite.nom,
      description: specialite.description,
      nombre_medecins: parseInt(specialite.nombre_medecins) || 0,
      nombre_cabinets: parseInt(specialite.nombre_cabinets) || 0,
      nombre_maux: parseInt(specialite.nombre_maux) || 0,
      medecins: medecinsResult.rows.map(m => ({
        idmedecin: m.idmedecin,
        nom: m.nom,
        prenom: m.prenom,
        email: m.email
      })),
      cabinets: cabinetsResult.rows.map(c => ({
        idcabinet: c.idcabinet,
        nom: c.nom,
        adresse: c.adresse
      })),
      maux: mauxResult.rows.map(m => ({
        idmaux: m.idmaux,
        nom: m.nom,
        categorie: m.categorie
      }))
    };
  }

  // Modifier une spécialité
  async updateSpecialite(id: string, updateData: UpdateSpecialiteRequest): Promise<Specialite> {
    const allowedFields = ['nom', 'description'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof UpdateSpecialiteRequest] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fieldsToUpdate.map(field => updateData[field as keyof UpdateSpecialiteRequest])];

    const query = `
      UPDATE specialite 
      SET ${setClause}
      WHERE idSpecialite = $1
      RETURNING *
    `;
    
    const result = await db.query<Specialite>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Spécialité non trouvée');
    }

    return result.rows[0];
  }

  // Supprimer une spécialité
  async deleteSpecialite(id: string): Promise<boolean> {
    const query = `DELETE FROM specialite WHERE idSpecialite = $1`;
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Rechercher des spécialités
  async searchSpecialites(searchData: SearchSpecialiteRequest): Promise<SpecialiteWithDetails[]> {
    let query = `
      SELECT DISTINCT s.*,
        COUNT(DISTINCT ms.medecin_id) as nombre_medecins,
        COUNT(DISTINCT cs.cabinet_id) as nombre_cabinets,
        COUNT(DISTINCT sm.maux_id) as nombre_maux
      FROM specialite s
      LEFT JOIN medecin_specialite ms ON s.idSpecialite = ms.specialite_id
      LEFT JOIN cabinet_specialite cs ON s.idSpecialite = cs.specialite_id
      LEFT JOIN specialite_maux sm ON s.idSpecialite = sm.specialite_id
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (searchData.nom) {
      conditions.push(`s.nom ILIKE $${paramIndex}`);
      values.push(`%${searchData.nom}%`);
      paramIndex++;
    }

    if (searchData.description) {
      conditions.push(`s.description ILIKE $${paramIndex}`);
      values.push(`%${searchData.description}%`);
      paramIndex++;
    }

    if (searchData.medecin_id) {
      conditions.push(`ms.medecin_id = $${paramIndex}`);
      values.push(searchData.medecin_id);
      paramIndex++;
    }

    if (searchData.cabinet_id) {
      conditions.push(`cs.cabinet_id = $${paramIndex}`);
      values.push(searchData.cabinet_id);
      paramIndex++;
    }

    if (searchData.maux_id) {
      conditions.push(`sm.maux_id = $${paramIndex}`);
      values.push(searchData.maux_id);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY s.idSpecialite
      ORDER BY s.nom ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    values.push(searchData.limit || 50);
    values.push(searchData.offset || 0);

    const result = await db.query(query, values);
    return result.rows.map(row => ({
      idSpecialite: row.idspecialite,
      nom: row.nom,
      description: row.description,
      nombre_medecins: parseInt(row.nombre_medecins) || 0,
      nombre_cabinets: parseInt(row.nombre_cabinets) || 0,
      nombre_maux: parseInt(row.nombre_maux) || 0
    }));
  }

  // ========================================
  // MAUX
  // ========================================

  // Créer un mal
  async createMaux(data: CreateMauxRequest): Promise<Maux> {
    const query = `
      INSERT INTO maux (nom, description, categorie)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.nom, data.description, data.categorie];
    const result = await db.query<Maux>(query, values);
    return result.rows[0];
  }

  // Récupérer tous les maux
  async getAllMaux(limit: number = 50, offset: number = 0): Promise<Maux[]> {
    const query = `
      SELECT * FROM maux
      ORDER BY nom ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query<Maux>(query, [limit, offset]);
    return result.rows;
  }

  // Récupérer un mal par ID
  async getMauxById(id: string): Promise<Maux | null> {
    const query = `SELECT * FROM maux WHERE idMaux = $1`;
    const result = await db.query<Maux>(query, [id]);
    return result.rows[0] || null;
  }

  // Récupérer un mal avec détails
  async getMauxWithDetails(id: string): Promise<MauxWithDetails | null> {
    const query = `
      SELECT 
        m.*,
        COUNT(DISTINCT sm.specialite_id) as nombre_specialites
      FROM maux m
      LEFT JOIN specialite_maux sm ON m.idMaux = sm.maux_id
      WHERE m.idMaux = $1
      GROUP BY m.idMaux
    `;
    
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const maux = result.rows[0];
    
    // Récupérer les spécialités
    const specialitesQuery = `
      SELECT s.idSpecialite, s.nom, s.description
      FROM specialite s
      JOIN specialite_maux sm ON s.idSpecialite = sm.specialite_id
      WHERE sm.maux_id = $1
    `;
    const specialitesResult = await db.query(specialitesQuery, [id]);
    
    return {
      idmaux: maux.idmaux,
      nom: maux.nom,
      description: maux.description,
      categorie: maux.categorie,
      nombre_specialites: parseInt(maux.nombre_specialites) || 0,
      specialites: specialitesResult.rows.map(s => ({
        idspecialite: s.idspecialite,
        nom: s.nom,
        description: s.description
      }))
    };
  }

  // Modifier un mal
  async updateMaux(id: string, updateData: UpdateMauxRequest): Promise<Maux> {
    const allowedFields = ['nom', 'description', 'categorie'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof UpdateMauxRequest] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fieldsToUpdate.map(field => updateData[field as keyof UpdateMauxRequest])];

    const query = `
      UPDATE maux 
      SET ${setClause}
      WHERE idMaux = $1
      RETURNING *
    `;
    
    const result = await db.query<Maux>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Mal non trouvé');
    }

    return result.rows[0];
  }

  // Supprimer un mal
  async deleteMaux(id: string): Promise<boolean> {
    const query = `DELETE FROM maux WHERE idMaux = $1`;
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Rechercher des maux
  async searchMaux(searchData: SearchMauxRequest): Promise<MauxWithDetails[]> {
    let query = `
      SELECT DISTINCT m.*,
        COUNT(DISTINCT sm.specialite_id) as nombre_specialites
      FROM maux m
      LEFT JOIN specialite_maux sm ON m.idMaux = sm.maux_id
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (searchData.nom) {
      conditions.push(`m.nom ILIKE $${paramIndex}`);
      values.push(`%${searchData.nom}%`);
      paramIndex++;
    }

    if (searchData.categorie) {
      conditions.push(`m.categorie ILIKE $${paramIndex}`);
      values.push(`%${searchData.categorie}%`);
      paramIndex++;
    }

    if (searchData.specialite_id) {
      conditions.push(`sm.specialite_id = $${paramIndex}`);
      values.push(searchData.specialite_id);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY m.idMaux
      ORDER BY m.nom ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    values.push(searchData.limit || 50);
    values.push(searchData.offset || 0);

    const result = await db.query(query, values);
    return result.rows.map(row => ({
      idMaux: row.idmaux,
      nom: row.nom,
      description: row.description,
      categorie: row.categorie,
      nombre_specialites: parseInt(row.nombre_specialites) || 0
    }));
  }

  // ========================================
  // ASSOCIATIONS
  // ========================================

  // Associer un médecin à une spécialité
  async associateMedecinSpecialite(data: MedecinSpecialite): Promise<MedecinSpecialite> {
    const query = `
      INSERT INTO medecin_specialite (medecin_id, specialite_id)
      VALUES ($1, $2)
      ON CONFLICT (medecin_id, specialite_id) DO NOTHING
      RETURNING *
    `;
    const result = await db.query<MedecinSpecialite>(query, [data.medecin_id, data.specialite_id]);
    return result.rows[0];
  }

  // Désassocier un médecin d'une spécialité
  async disassociateMedecinSpecialite(medecinId: string, specialiteId: string): Promise<boolean> {
    const query = `
      DELETE FROM medecin_specialite 
      WHERE medecin_id = $1 AND specialite_id = $2
    `;
    const result = await db.query(query, [medecinId, specialiteId]);
    return (result.rowCount || 0) > 0;
  }

  // Associer un cabinet à une spécialité
  async associateCabinetSpecialite(data: CabinetSpecialite): Promise<CabinetSpecialite> {
    const query = `
      INSERT INTO cabinet_specialite (cabinet_id, specialite_id)
      VALUES ($1, $2)
      ON CONFLICT (cabinet_id, specialite_id) DO NOTHING
      RETURNING *
    `;
    const result = await db.query<CabinetSpecialite>(query, [data.cabinet_id, data.specialite_id]);
    return result.rows[0];
  }

  // Désassocier un cabinet d'une spécialité
  async disassociateCabinetSpecialite(cabinetId: string, specialiteId: string): Promise<boolean> {
    const query = `
      DELETE FROM cabinet_specialite 
      WHERE cabinet_id = $1 AND specialite_id = $2
    `;
    const result = await db.query(query, [cabinetId, specialiteId]);
    return (result.rowCount || 0) > 0;
  }

  // Associer une spécialité à un mal
  async associateSpecialiteMaux(data: SpecialiteMaux): Promise<SpecialiteMaux> {
    const query = `
      INSERT INTO specialite_maux (specialite_id, maux_id)
      VALUES ($1, $2)
      ON CONFLICT (specialite_id, maux_id) DO NOTHING
      RETURNING *
    `;
    const result = await db.query<SpecialiteMaux>(query, [data.specialite_id, data.maux_id]);
    return result.rows[0];
  }

  // Désassocier une spécialité d'un mal
  async disassociateSpecialiteMaux(specialiteId: string, mauxId: string): Promise<boolean> {
    const query = `
      DELETE FROM specialite_maux 
      WHERE specialite_id = $1 AND maux_id = $2
    `;
    const result = await db.query(query, [specialiteId, mauxId]);
    return (result.rowCount || 0) > 0;
  }

  // ========================================
  // RECHERCHES AVANCÉES
  // ========================================

  // Rechercher des médecins par spécialité
  async searchMedecinsBySpecialite(searchData: SearchMedecinBySpecialiteRequest): Promise<MedecinWithSpecialites[]> {
    let query = `
      SELECT DISTINCT m.idmedecin, u.nom, u.prenom, u.email, u.photoprofil, m.experience, m.biographie
      FROM medecin m
      JOIN utilisateur u ON m.utilisateur_id = u.idutilisateur
      JOIN medecin_specialite ms ON m.idmedecin = ms.medecin_id
    `;
    
    const conditions: string[] = [`ms.specialite_id = $1`, `m.statut = 'APPROVED'`];
    const values: any[] = [searchData.specialite_id];
    let paramIndex = 2;

    if (searchData.cabinet_id) {
      query += ` JOIN medecin_cabinet mc ON m.idmedecin = mc.medecin_id`;
      conditions.push(`mc.cabinet_id = $${paramIndex} AND mc.actif = true`);
      values.push(searchData.cabinet_id);
      paramIndex++;
    }

    if ((searchData as any).q) {
      conditions.push(`(u.nom ILIKE $${paramIndex} OR u.prenom ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      values.push(`%${(searchData as any).q}%`);
      paramIndex++;
    }

    query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY u.nom ASC, u.prenom ASC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    values.push(searchData.limit || 50);
    values.push(searchData.offset || 0);

    const result = await db.query(query, values);
    
    // Pour chaque médecin, récupérer ses spécialités
    const medecinsWithSpecialites: MedecinWithSpecialites[] = [];
    
    for (const medecin of result.rows) {
      const specialitesQuery = `
        SELECT s.idspecialite, s.nom, s.description
        FROM specialite s
        JOIN medecin_specialite ms ON s.idspecialite = ms.specialite_id
        WHERE ms.medecin_id = $1
      `;
      const specialitesResult = await db.query(specialitesQuery, [medecin.idmedecin]);
      
      medecinsWithSpecialites.push({
        idmedecin: medecin.idmedecin,
        nom: medecin.nom,
        prenom: medecin.prenom,
        email: medecin.email,
        specialites: specialitesResult.rows.map(s => ({
          idspecialite: s.idspecialite,
          nom: s.nom,
          description: s.description
        }))
      });
    }
    
    return medecinsWithSpecialites;
  }

  // Rechercher des cabinets par spécialité
  async searchCabinetsBySpecialite(searchData: SearchCabinetBySpecialiteRequest): Promise<CabinetWithSpecialites[]> {
    const query = `
      SELECT DISTINCT c.idCabinet, c.nom, c.adresse
      FROM cabinet c
      JOIN cabinet_specialite cs ON c.idCabinet = cs.cabinet_id
      WHERE cs.specialite_id = $1 AND c.actif = true
      ORDER BY c.nom ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [searchData.specialite_id, searchData.limit || 50, searchData.offset || 0]);
    
    // Pour chaque cabinet, récupérer ses spécialités
    const cabinetsWithSpecialites: CabinetWithSpecialites[] = [];
    
    for (const cabinet of result.rows) {
      const specialitesQuery = `
        SELECT s.idSpecialite, s.nom, s.description
        FROM specialite s
        JOIN cabinet_specialite cs ON s.idSpecialite = cs.specialite_id
        WHERE cs.cabinet_id = $1
      `;
      const specialitesResult = await db.query(specialitesQuery, [cabinet.idcabinet]);
      
      cabinetsWithSpecialites.push({
        idcabinet: cabinet.idcabinet,
        nom: cabinet.nom,
        adresse: cabinet.adresse,
        specialites: specialitesResult.rows.map(s => ({
          idspecialite: s.idspecialite,
          nom: s.nom,
          description: s.description
        }))
      });
    }
    
    return cabinetsWithSpecialites;
  }

  // Rechercher des médecins par mal
  async searchMedecinsByMaux(searchData: SearchMedecinByMauxRequest): Promise<MedecinWithSpecialites[]> {
    let query = `
      SELECT DISTINCT m.idmedecin, u.nom, u.prenom, u.email, u.photoProfil, m.experience, m.biographie
      FROM medecin m
      JOIN utilisateur u ON m.utilisateur_id = u.idutilisateur
      JOIN medecin_specialite ms ON m.idmedecin = ms.medecin_id
      JOIN specialite_maux sm ON ms.specialite_id = sm.specialite_id
      WHERE sm.maux_id = $1 AND m.statut = 'APPROVED'
    `;
    
    const params: any[] = [searchData.maux_id];
    let paramCount = 1;

    if (searchData.q) {
      paramCount++;
      query += ` AND (u.nom ILIKE $${paramCount} OR u.prenom ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${searchData.q}%`);
    }

    query += ` ORDER BY u.nom, u.prenom`;
    
    if (searchData.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(searchData.limit);
    }
    
    if (searchData.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(searchData.offset);
    }

    const result = await db.query(query, params);
    const medecinsWithSpecialites: MedecinWithSpecialites[] = [];

    for (const medecin of result.rows) {
      // Récupérer les spécialités de ce médecin
      const specialitesQuery = `
        SELECT s.idspecialite, s.nom, s.description
        FROM specialite s
        JOIN medecin_specialite ms ON s.idspecialite = ms.specialite_id
        WHERE ms.medecin_id = $1
      `;
      const specialitesResult = await db.query(specialitesQuery, [medecin.idmedecin]);

      medecinsWithSpecialites.push({
        idmedecin: medecin.idmedecin,
        nom: medecin.nom,
        prenom: medecin.prenom,
        email: medecin.email,
        photoprofil: medecin.photoprofil,
        experience: medecin.experience,
        biographie: medecin.biographie,
        specialites: specialitesResult.rows.map(s => ({
          idspecialite: s.idspecialite,
          nom: s.nom,
          description: s.description
        }))
      });
    }

    return medecinsWithSpecialites;
  }

  // ========================================
  // RECHERCHE GLOBALE OPTIMISÉE
  // ========================================

  // Recherche globale optimisée de médecins
  async searchMedecinsGlobal(searchData: {
    q?: string;
    specialite_id?: string;
    cabinet_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<MedecinWithSpecialites[]> {
    let query = `
      SELECT DISTINCT m.idmedecin, u.nom, u.prenom, u.email, u.photoprofil, m.experience, m.biographie
      FROM medecin m
      JOIN utilisateur u ON m.utilisateur_id = u.idutilisateur
    `;
    
    const conditions: string[] = [`m.statut = 'APPROVED'`];
    const values: any[] = [];
    let paramIndex = 1;

    // Filtre par spécialité
    if (searchData.specialite_id) {
      query += ` JOIN medecin_specialite ms ON m.idmedecin = ms.medecin_id`;
      conditions.push(`ms.specialite_id = $${paramIndex}`);
      values.push(searchData.specialite_id);
      paramIndex++;
    }

    // Filtre par cabinet
    if (searchData.cabinet_id) {
      query += ` JOIN medecin_cabinet mc ON m.idmedecin = mc.medecin_id`;
      conditions.push(`mc.cabinet_id = $${paramIndex} AND mc.actif = true`);
      values.push(searchData.cabinet_id);
      paramIndex++;
    }

    // Recherche textuelle
    if (searchData.q) {
      conditions.push(`(
        u.nom ILIKE $${paramIndex} OR 
        u.prenom ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex} OR
        m.biographie ILIKE $${paramIndex}
      )`);
      values.push(`%${searchData.q}%`);
      paramIndex++;
    }

    query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY u.nom ASC, u.prenom ASC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    values.push(searchData.limit || 20);
    values.push(searchData.offset || 0);

    const result = await db.query(query, values);
    
    // Pour chaque médecin, récupérer ses spécialités
    const medecinsWithSpecialites: MedecinWithSpecialites[] = [];
    
    for (const medecin of result.rows) {
      const specialites = await this.getSpecialitesByMedecin(medecin.idmedecin);
      medecinsWithSpecialites.push({
        idmedecin: medecin.idmedecin,
        nom: medecin.nom,
        prenom: medecin.prenom,
        email: medecin.email,
        photoprofil: medecin.photoprofil,
        experience: medecin.experience,
        biographie: medecin.biographie,
        specialites
      });
    }

    return medecinsWithSpecialites;
  }

  // Récupérer les spécialités d'un médecin
  private async getSpecialitesByMedecin(medecinId: string): Promise<{ idspecialite: string; nom: string; description: string; }[]> {
    const query = `
      SELECT s.idSpecialite as idspecialite, s.nom, s.description
      FROM specialite s
      JOIN medecin_specialite ms ON s.idSpecialite = ms.specialite_id
      WHERE ms.medecin_id = $1
      ORDER BY s.nom ASC
    `;
    const result = await db.query(query, [medecinId]);
    return result.rows;
  }
}
