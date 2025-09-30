import pool from "../../shared/database/client";
import { Consultation, CreateConsultationRequest, UpdateConsultationRequest, ConsultationTemplate } from "./consultations.model";

export class ConsultationsRepository {

  // Créer une nouvelle consultation
  async createConsultation(medecinId: string, patientId: string, data: CreateConsultationRequest): Promise<Consultation> {
    const {
      rendezvous_id,
      diagnostique,
      antecedents = '',
      traitement_propose = '',
      prescriptions = '',
      observations = '',
      recommandations = '',
      examens_complementaires = '',
      date_consultation,
      template_utilise = null
    } = data;

    // Utiliser la date actuelle si non fournie
    const consultationDate = date_consultation || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      INSERT INTO consultations (
        rendezvous_id, medecin_id, patient_id, diagnostique, antecedents,
        traitement_propose, prescriptions, observations, recommandations,
        examens_complementaires, date_consultation, template_utilise, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      rendezvous_id, medecinId, patientId, diagnostique, antecedents,
      traitement_propose, prescriptions, observations, recommandations,
      examens_complementaires, consultationDate, template_utilise, 'BROUILLON'
    ]);

    return result.rows[0];
  }

  // Récupérer une consultation par ID
  async getConsultationById(idconsultation: string): Promise<Consultation | null> {
    const result = await pool.query('SELECT * FROM consultations WHERE idconsultation = $1', [idconsultation]);
    return result.rows[0] || null;
  }

  // Récupérer les consultations d'un médecin
  async getConsultationsByMedecin(medecinId: string, limit: number = 50, offset: number = 0): Promise<Consultation[]> {
    const result = await pool.query(`
      SELECT c.*, r.dateheure as rendezvous_date,
             p.idPatient, p.nom as patient_nom, p.prenom as patient_prenom
      FROM consultations c
      JOIN rendezvous r ON c.rendezvous_id = r.idrendezvous
      JOIN patient p ON c.patient_id = p.idPatient
      WHERE c.medecin_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [medecinId, limit, offset]);

    return result.rows;
  }

  // Récupérer les consultations d'un patient
  async getConsultationsByPatient(patientId: string, limit: number = 50, offset: number = 0): Promise<Consultation[]> {
    const result = await pool.query(`
      SELECT c.*, m.nom as medecin_nom, m.prenom as medecin_prenom
      FROM consultations c
      JOIN medecin m ON c.medecin_id = m.idmedecin
      WHERE c.patient_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [patientId, limit, offset]);

    return result.rows;
  }

  // Récupérer la consultation liée à un rendez-vous
  async getConsultationByRendezVous(rendezvousId: string): Promise<Consultation | null> {
    const result = await pool.query('SELECT * FROM consultations WHERE rendezvous_id = $1', [rendezvousId]);
    return result.rows[0] || null;
  }

  // Mettre à jour une consultation
  async updateConsultation(idconsultation: string, data: UpdateConsultationRequest): Promise<Consultation | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Construire la requête dynamiquement
    for (const [key, value] of Object.entries(data)) {
      if (key === 'statut' && value === 'FINALISE') {
        updateFields.push(`finalise_le = NOW()`);
      }
      updateFields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (updateFields.length === 0) return await this.getConsultationById(idconsultation);

    updateFields.push(`updated_at = NOW()`);
    values.push(idconsultation);

    const result = await pool.query(`
      UPDATE consultations
      SET ${updateFields.join(', ')}
      WHERE idconsultation = $${idx}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  // Supprimer une consultation (soft delete via statut ARCHIVE)
  async deleteConsultation(idconsultation: string): Promise<boolean> {
    const result = await pool.query(`
      UPDATE consultations
      SET statut = 'ARCHIVE', updated_at = NOW()
      WHERE idconsultation = $1
      RETURNING idconsultation
    `, [idconsultation]);

    return result.rowCount! > 0;
  }

  // Finaliser une consultation
  async finalizeConsultation(idconsultation: string): Promise<Consultation | null> {
    const result = await pool.query(`
      UPDATE consultations
      SET statut = 'FINALISE', finalise_le = NOW(), updated_at = NOW()
      WHERE idconsultation = $1
      RETURNING *
    `, [idconsultation]);

    return result.rows[0] || null;
  }

  // TEMPLATES DE CONSULTATION

  // Créer un template
  async createTemplate(data: {
    nom: string;
    specialite: string;
    description: string;
    diagnostique_template?: string;
    antecedents_template?: string;
    traitement_template?: string;
    prescriptions_template?: string;
    observations_template?: string;
    recommandations_template?: string;
    examens_template?: string;
  }): Promise<ConsultationTemplate> {
    const result = await pool.query(`
      INSERT INTO consultation_templates (
        nom, specialite, description, diagnostique_template, antecedents_template,
        traitement_template, prescriptions_template, observations_template,
        recommandations_template, examens_template
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.nom, data.specialite, data.description,
      data.diagnostique_template || '',
      data.antecedents_template || '',
      data.traitement_template || '',
      data.prescriptions_template || '',
      data.observations_template || '',
      data.recommandations_template || '',
      data.examens_template || ''
    ]);

    return result.rows[0];
  }

  // Récupérer les templates par spécialité
  async getTemplatesBySpecialite(specialite: string): Promise<ConsultationTemplate[]> {
    const result = await pool.query(`
      SELECT * FROM consultation_templates
      WHERE specialite = $1 OR specialite = 'GENERAL'
      ORDER BY nom ASC
    `, [specialite]);

    return result.rows;
  }

  // Récupérer tous les templates
  async getAllTemplates(): Promise<ConsultationTemplate[]> {
    const result = await pool.query(`
      SELECT * FROM consultation_templates
      ORDER BY specialite ASC, nom ASC
    `);

    return result.rows;
  }

  // Supprimer un template
  async deleteTemplate(idtemplate: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM consultation_templates WHERE idtemplate = $1', [idtemplate]);
    return result.rowCount! > 0;
  }
}
