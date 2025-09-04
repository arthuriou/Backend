import db from "../../utils/database";
import { DossierMedical, DocumentMedical, CreateDocumentRequest } from "./dossier-medical.model";

export class DossierMedicalRepository {
  async getDossierByPatient(patientId: string): Promise<any | null> {
    const result = await db.query(
      `SELECT * FROM dossierMedical WHERE patient_id = $1` ,
      [patientId]
    );
    return result.rows[0] || null;
  }

  async createDossier(patientId: string): Promise<any> {
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


