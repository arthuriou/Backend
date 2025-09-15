import { DossierMedicalRepository } from "./dossier-medical.repository";
import { CreateDocumentRequest } from "./dossier-medical.model";

export class DossierMedicalService {
  private repository: DossierMedicalRepository;

  constructor() {
    this.repository = new DossierMedicalRepository();
  }

  async getOrCreateDossier(patientId: string) {
    return this.repository.getOrCreateDossier(patientId);
  }

  async getOrCreateForUser(userId: string) {
    // Résoudre idPatient depuis utilisateur_id
    const patient = await this.repository.getPatientByUserId(userId);
    if (!patient) {
      const err: any = new Error("Patient introuvable");
      err.status = 404;
      throw err;
    }
    return this.repository.getOrCreateDossier(patient.idpatient);
  }

  async listDocuments(dossierId: string) {
    return this.repository.listDocuments(dossierId);
  }

  async addDocument(payload: CreateDocumentRequest) {
    return this.repository.addDocument(payload);
  }

  async deleteDocument(documentId: string) {
    return this.repository.deleteDocument(documentId);
  }

  async authorizeAndDeleteDocument(documentId: string, requesterUserId: string, requesterRole: string) {
    const doc = await this.repository.getDocumentWithOwner(documentId);
    if (!doc) {
      const err: any = new Error("Document non trouvé");
      err.status = 404;
      throw err;
    }
    const isOwner = doc.utilisateur_id === requesterUserId;
    if (!isOwner) {
      const err: any = new Error("Accès interdit");
      err.status = 403;
      throw err;
    }
    await this.repository.deleteDocument(documentId);
    return true;
  }

  async updateDocumentMeta(documentId: string, update: any) {
    return this.repository.updateDocumentMeta(documentId, update);
  }

  // Méthodes pour l'endpoint viewDocument
  async getDocumentById(documentId: string) {
    return this.repository.getDocumentById(documentId);
  }

  async getDossierById(dossierId: string) {
    return this.repository.getDossierById(dossierId);
  }

  async getPatientIdFromUserId(userId: string) {
    return this.repository.getPatientIdFromUserId(userId);
  }
}


