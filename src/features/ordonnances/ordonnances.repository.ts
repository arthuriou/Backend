import db from "../../shared/database/client";
import { CreateOrdonnanceRequest } from "./ordonnances.model";

export class OrdonnancesRepository {
  async createOrdonnance(payload: CreateOrdonnanceRequest): Promise<any> {
    const { consultation_id, date, dureetraitement, renouvellements, notes } = payload;
    const result = await db.query(
      `INSERT INTO ordonnance (consultation_id, date, dureetraitement, renouvellements, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [consultation_id, date ?? new Date(), dureetraitement ?? null, renouvellements ?? 0, notes ?? null]
    );
    return result.rows[0];
  }

  async addLignes(ordonnanceId: string, lignes: any[]): Promise<any[]> {
    if (!lignes || lignes.length === 0) return [];
    const created: any[] = [];
    for (const l of lignes) {
      const r = await db.query(
        `INSERT INTO ligne_ordonnance (ordonnance_id, medicament, dosage, posologie, dureeJour)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [ordonnanceId, l.medicament, l.dosage ?? null, l.posologie ?? null, l.dureejour ?? null]
      );
      created.push(r.rows[0]);
    }
    return created;
  }

  async getById(id: string): Promise<any | null> {
    const r = await db.query(`SELECT * FROM ordonnance WHERE idordonnance = $1`, [id]);
    return r.rows[0] || null;
  }

  async listByConsultation(consultationId: string): Promise<any[]> {
    const r = await db.query(`SELECT * FROM ordonnance WHERE consultation_id = $1 ORDER BY date DESC`, [consultationId]);
    return r.rows;
  }

  async listLignes(ordonnanceId: string): Promise<any[]> {
    const r = await db.query(`SELECT * FROM ligne_ordonnance WHERE ordonnance_id = $1 ORDER BY idligneordonnance`, [ordonnanceId]);
    return r.rows;
  }

  async updateOrdonnance(id: string, update: any): Promise<any> {
    const allowed = ["date", "dureetraitement", "renouvellements", "notes"] as const;
    const entries = Object.entries(update).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
    if (entries.length === 0) throw new Error("Aucun champ valide à mettre à jour");
    const setClause = entries.map(([k], i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...entries.map(([, v]) => v)];
    const r = await db.query(`UPDATE ordonnance SET ${setClause} WHERE idordonnance = $1 RETURNING *`, values);
    if (r.rows.length === 0) throw new Error("Ordonnance non trouvée");
    return r.rows[0];
  }

  async deleteOrdonnance(id: string): Promise<boolean> {
    const r = await db.query(`DELETE FROM ordonnance WHERE idordonnance = $1`, [id]);
    return (r.rowCount || 0) > 0;
  }

  async getByPatient(patientId: string): Promise<any[]> {
    const r = await db.query(`
      SELECT o.* FROM ordonnance o
      JOIN consultation c ON o.consultation_id = c.idconsultation
      JOIN rendezvous r ON c.rendezvous_id = r.idrendezvous
      WHERE r.patient_id = $1
      ORDER BY o.date DESC
    `, [patientId]);
    return r.rows;
  }

  async getByMedecin(medecinId: string): Promise<any[]> {
    const r = await db.query(`
      SELECT o.* FROM ordonnance o
      JOIN consultation c ON o.consultation_id = c.idconsultation
      JOIN rendezvous r ON c.rendezvous_id = r.idrendezvous
      WHERE r.medecin_id = $1
      ORDER BY o.date DESC
    `, [medecinId]);
    return r.rows;
  }

  async validerOrdonnance(id: string): Promise<any> {
    const r = await db.query(`
      UPDATE ordonnance 
      SET notes = COALESCE(notes, '') || ' [VALIDÉE]'
      WHERE idordonnance = $1 
      RETURNING *
    `, [id]);
    if (r.rows.length === 0) throw new Error("Ordonnance non trouvée");
    return r.rows[0];
  }
}


