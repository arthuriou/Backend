import db from "../../utils/database";
import { DossierMedical, DocumentMedical, CreateDocumentRequest } from "./dossier-medical.model";

export class DossierMedicalRepository {
  async getPatientByUserId(userId: string): Promise<any | null> {
    const r = await db.query(`SELECT * FROM patient WHERE utilisateur_id = $1`, [userId]);
    return r.rows[0] || null;
  }
  async getDossierByPatient(patientId: string): Promise<any | null> {
    const result = await db.query(
      `SELECT * FROM dossierMedical WHERE patient_id = $1` ,
      [patientId]
    );
    return result.rows[0] || null;
  }

  async createDossier(patientId: string): Promise<any> {
    // Vérifier existence du patient pour renvoyer une erreur claire au lieu d'une FK
    const pr = await db.query(`SELECT 1 FROM patient WHERE idPatient = $1`, [patientId]);
    if (pr.rowCount === 0) {
      const err: any = new Error("Patient introuvable");
      err.status = 404;
      throw err;
    }
    const result = await db.query(
      `INSERT INTO dossierMedical (patient_id, dateCreation) VALUES ($1, now()) RETURNING *`,
      [patientId]
    );
    return result.rows[0];
  }

  async getOrCreateDossier(patientId: string): Promise<{ dossier: any; created: boolean }> {
    const existing = await this.getDossierByPatient(patientId);
    if (existing) return { dossier: existing, created: false };
    const dossier = await this.createDossier(patientId);
    return { dossier, created: true };
  }

  async addDocument(payload: CreateDocumentRequest): Promise<any> {
    const {
      dossier_id,
      nom,
      type,
      url,
      mimetype,
      taillekb,
      ispublic,
    } = payload;

    // Vérifier l'existence du dossier
    const dr = await db.query(
      `SELECT 1 FROM dossierMedical WHERE idDossier = $1`,
      [dossier_id]
    );
    if (dr.rowCount === 0) {
      const err: any = new Error("Dossier introuvable");
      err.status = 404;
      throw err;
    }

    const result = await db.query(
      `INSERT INTO document (dossier_id, nom, type, url, mimeType, tailleKo, dateUpload, isPublic)
       VALUES ($1, $2, $3, $4, $5, $6, now(), COALESCE($7,false)) RETURNING *`,
      [dossier_id, nom, type, url, mimetype, taillekb, ispublic]
    );
    return result.rows[0];
  }

  async listDocuments(dossierId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT * FROM document WHERE dossier_id = $1 ORDER BY dateUpload DESC`,
      [dossierId]
    );
    return result.rows;
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const result = await db.query(
      `DELETE FROM document WHERE idDocument = $1`,
      [documentId]
    );
    return (result.rowCount || 0) > 0;
  }

  async getDocumentWithOwner(documentId: string): Promise<any | null> {
    const q = await db.query(
      `SELECT d.*, dm.patient_id, p.utilisateur_id
       FROM document d
       JOIN dossierMedical dm ON dm.idDossier = d.dossier_id
       JOIN patient p ON p.idPatient = dm.patient_id
       WHERE d.idDocument = $1`,
      [documentId]
    );
    return q.rows[0] || null;
  }

  async updateDocumentMeta(documentId: string, update: Partial<DocumentMedical>): Promise<any> {
    const allowed = ["nom", "type", "url", "mimeType", "tailleKo", "isPublic"] as const;
    const entries = Object.entries(update).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
    if (entries.length === 0) {
      throw new Error("Aucun champ valide à mettre à jour");
    }
    const setClause = entries
      .map(([k], idx) => `${k} = $${idx + 2}`)
      .join(", ");
    const values = [documentId, ...entries.map(([, v]) => v)];
    const result = await db.query(
      `UPDATE document SET ${setClause} WHERE idDocument = $1 RETURNING *`,
      values
    );
    if (result.rows.length === 0) throw new Error("Document non trouvé");
    return result.rows[0];
  }
}


