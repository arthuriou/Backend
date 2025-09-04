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

  async listDocuments(dossierId: string) {
    return this.repository.listDocuments(dossierId);
  }

  async addDocument(payload: CreateDocumentRequest) {
    return this.repository.addDocument(payload);
  }

  async deleteDocument(documentId: string) {
    return this.repository.deleteDocument(documentId);
  }

  async updateDocumentMeta(documentId: string, update: any) {
    return this.repository.updateDocumentMeta(documentId, update);
  }
}


