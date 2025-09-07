import { OrdonnancesRepository } from "./ordonnances.repository";
import { CreateOrdonnanceRequest } from "./ordonnances.model";

export class OrdonnancesService {
  private repo: OrdonnancesRepository;
  constructor() {
    this.repo = new OrdonnancesRepository();
  }

  async create(payload: CreateOrdonnanceRequest) {
    const ord = await this.repo.createOrdonnance(payload);
    const lignes = await this.repo.addLignes(ord.idordonnance || ord.idordonnance || ord.idordonnance, payload.lignes || []);
    return { ordonnance: ord, lignes };
  }

  async listByConsultation(consultationId: string) {
    return this.repo.listByConsultation(consultationId);
  }

  async getWithLignes(id: string) {
    const ord = await this.repo.getById(id);
    if (!ord) return null;
    const lignes = await this.repo.listLignes(id);
    return { ordonnance: ord, lignes };
  }

  async update(id: string, update: any) {
    return this.repo.updateOrdonnance(id, update);
  }

  async remove(id: string) {
    return this.repo.deleteOrdonnance(id);
  }

  async getByPatient(patientId: string) {
    return this.repo.getByPatient(patientId);
  }

  async getByMedecin(medecinId: string) {
    return this.repo.getByMedecin(medecinId);
  }

  async valider(id: string) {
    return this.repo.validerOrdonnance(id);
  }
}


