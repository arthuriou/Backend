import { ConsultationsRepository } from "./consultations.repository";
import { Consultation, CreateConsultationRequest, UpdateConsultationRequest, ConsultationTemplate } from "./consultations.model";

export class ConsultationsService {
  private repository: ConsultationsRepository;

  constructor(repository = new ConsultationsRepository()) {
    this.repository = repository;
  }

  // Créer une consultation depuis les données d'un rendez-vous
  async createConsultationFromRendezVous(rendezvousId: string, medecinId: string): Promise<Consultation> {
    // Récupérer les informations du rendez-vous
    const pool = require("../../shared/database/client");
    const rdvResult = await pool.query(`
      SELECT r.idrendezvous, r.patient_id, r.medecin_id,
             p.nom as patient_nom, p.prenom as patient_prenom,
             m.nom as medecin_nom, m.prenom as medecin_prenom
      FROM rendezvous r
      JOIN patient p ON r.patient_id = p.idPatient
      JOIN medecin m ON r.medecin_id = m.idmedecin
      WHERE r.idrendezvous = $1 AND r.medecin_id = $2
    `, [rendezvousId, medecinId]);

    if (rdvResult.rows.length === 0) {
      throw new Error("Rendez-vous non trouvé ou accès non autorisé");
    }

    const rdv = rdvResult.rows[0];

    // Vérifier qu'une consultation n'existe pas déjà pour ce RDV
    const existing = await this.repository.getConsultationByRendezVous(rendezvousId);
    if (existing) {
      throw new Error("Une consultation existe déjà pour ce rendez-vous");
    }

    // Créer la consultation
    const consultationData: CreateConsultationRequest = {
      rendezvous_id: rendezvousId,
      diagnostique: '',
      date_consultation: new Date().toISOString().split('T')[0]
    };

    return await this.repository.createConsultation(rdv.medecin_id, rdv.patient_id, consultationData);
  }

  // Récupérer une consultation complète avec toutes les données liées
  async getConsultationWithDetails(idconsultation: string, userId: string, userRole: string): Promise<Consultation | null> {
    const consultation = await this.repository.getConsultationById(idconsultation);
    if (!consultation) return null;

    // Vérifier les permissions d'accès
    const canAccess = await this.checkConsultationAccess(consultation, userId, userRole);
    if (!canAccess) {
      throw new Error("Accès non autorisé à cette consultation");
    }

    return consultation;
  }

  // Récupérer le template et créer une consultation pré-remplie
  async createFromTemplate(rendezvousId: string, templateId: string, medecinId: string): Promise<Consultation> {
    // Récupérer le template
    const pool = require("../../shared/database/client");
    const templateResult = await pool.query('SELECT * FROM consultation_templates WHERE idtemplate = $1', [templateId]);

    if (templateResult.rows.length === 0) {
      throw new Error("Template non trouvé");
    }

    const template = templateResult.rows[0];

    // Récupérer les infos du RDV
    const rdvResult = await pool.query(`
      SELECT r.patient_id FROM rendezvous r WHERE r.idrendezvous = $1 AND r.medecin_id = $2
    `, [rendezvousId, medecinId]);

    if (rdvResult.rows.length === 0) {
      throw new Error("Rendez-vous non trouvé ou accès non autorisé");
    }

    // Créer la consultation avec le template
    const consultationData: CreateConsultationRequest = {
      rendezvous_id: rendezvousId,
      diagnostique: template.diagnostique_template || '',
      antecedents: template.antecedents_template || '',
      traitement_propose: template.traitement_template || '',
      prescriptions: template.prescriptions_template || '',
      observations: template.observations_template || '',
      recommandations: template.recommandations_template || '',
      examens_complementaires: template.examens_template || '',
      template_utilise: templateId,
      date_consultation: new Date().toISOString().split('T')[0]
    };

    return await this.repository.createConsultation(medecinId, rdvResult.rows[0].patient_id, consultationData);
  }

  // Finaliser une consultation (la rendre non modifiable)
  async finalizeConsultation(idconsultation: string, medecinId: string): Promise<Consultation> {
    const consultation = await this.repository.getConsultationById(idconsultation);
    if (!consultation) {
      throw new Error("Consultation non trouvée");
    }

    if (consultation.medecin_id !== medecinId) {
      throw new Error("Accès non autorisé");
    }

    if (consultation.statut !== 'BROUILLON') {
      throw new Error("Cette consultation ne peut plus être modifiée");
    }

    // Validation des champs requis pour finalisation
    if (!consultation.diagnostique || consultation.diagnostique.trim().length === 0) {
      throw new Error("Le diagnostique est requis pour finaliser la consultation");
    }

    const finalized = await this.repository.finalizeConsultation(idconsultation);
    if (!finalized) {
      throw new Error("Erreur lors de la finalisation");
    }

    return finalized;
  }

  // Récupérer l'historique des consultations d'un patient
  async getPatientHistory(patientId: string, medecinId: string): Promise<Consultation[]> {
    return await this.repository.getConsultationsByPatient(patientId);
  }

  // Templates de consultation

  // Créer un nouveau template
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
    return await this.repository.createTemplate(data);
  }

  // Récupérer les templates disponibles pour une spécialité
  async getTemplatesBySpecialite(specialite: string): Promise<ConsultationTemplate[]> {
    return await this.repository.getTemplatesBySpecialite(specialite);
  }

  // Vérification des permissions d'accès à une consultation
  private async checkConsultationAccess(consultation: Consultation, userId: string, userRole: string): Promise<boolean> {
    // SuperAdmin et Admin ont accès à tout
    if (['SUPERADMIN', 'ADMINCABINET'].includes(userRole)) {
      return true;
    }

    // Le médecin propriétaire a accès
    if (consultation.medecin_id === userId) {
      return true;
    }

    // Le patient a accès à ses propres consultations (sauf si BROUILLON)
    if (consultation.patient_id === userId && consultation.statut !== 'BROUILLON') {
      return true;
    }

    return false;
  }

  // Méthodes publiques pour accéder au repository depuis le controller
  getRepository() {
    return this.repository;
  }
}
