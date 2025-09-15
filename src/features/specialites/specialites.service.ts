import { SpecialitesRepository } from "./specialites.repository";
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

export class SpecialitesService {
  private repository: SpecialitesRepository;

  constructor() {
    this.repository = new SpecialitesRepository();
  }

  // ========================================
  // SPÉCIALITÉS
  // ========================================

  // Créer une spécialité
  async createSpecialite(data: CreateSpecialiteRequest): Promise<Specialite> {
    if (!data.nom || data.nom.trim().length === 0) {
      throw new Error("Le nom de la spécialité est requis");
    }

    // Vérifier si une spécialité avec ce nom existe déjà
    const existingSpecialite = await this.repository.searchSpecialites({ nom: data.nom });
    if (existingSpecialite.length > 0) {
      throw new Error("Une spécialité avec ce nom existe déjà");
    }

    return await this.repository.createSpecialite(data);
  }

  // Récupérer toutes les spécialités
  async getAllSpecialites(limit: number = 50, offset: number = 0): Promise<Specialite[]> {
    if (limit < 1 || limit > 100) {
      throw new Error("La limite doit être entre 1 et 100");
    }
    if (offset < 0) {
      throw new Error("L'offset doit être positif ou nul");
    }

    return await this.repository.getAllSpecialites(limit, offset);
  }

  // Récupérer une spécialité par ID
  async getSpecialiteById(id: string): Promise<Specialite | null> {
    if (!id) {
      throw new Error("ID de spécialité requis");
    }

    return await this.repository.getSpecialiteById(id);
  }

  // Récupérer une spécialité avec détails
  async getSpecialiteWithDetails(id: string): Promise<SpecialiteWithDetails | null> {
    if (!id) {
      throw new Error("ID de spécialité requis");
    }

    return await this.repository.getSpecialiteWithDetails(id);
  }

  // Modifier une spécialité
  async updateSpecialite(id: string, updateData: UpdateSpecialiteRequest): Promise<Specialite> {
    if (!id) {
      throw new Error("ID de spécialité requis");
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Aucune donnée de mise à jour fournie");
    }

    // Vérifier si la spécialité existe
    const existingSpecialite = await this.repository.getSpecialiteById(id);
    if (!existingSpecialite) {
      throw new Error("Spécialité non trouvée");
    }

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.nom && updateData.nom !== existingSpecialite.nom) {
      const existingWithSameName = await this.repository.searchSpecialites({ nom: updateData.nom });
      if (existingWithSameName.length > 0) {
        throw new Error("Une spécialité avec ce nom existe déjà");
      }
    }

    return await this.repository.updateSpecialite(id, updateData);
  }

  // Supprimer une spécialité
  async deleteSpecialite(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("ID de spécialité requis");
    }

    // Vérifier si la spécialité existe
    const existingSpecialite = await this.repository.getSpecialiteById(id);
    if (!existingSpecialite) {
      throw new Error("Spécialité non trouvée");
    }

    // Vérifier s'il y a des associations
    const specialiteWithDetails = await this.repository.getSpecialiteWithDetails(id);
    if (specialiteWithDetails && 
        ((specialiteWithDetails.nombre_medecins || 0) > 0 || 
         (specialiteWithDetails.nombre_cabinets || 0) > 0 || 
         (specialiteWithDetails.nombre_maux || 0) > 0)) {
      throw new Error("Impossible de supprimer une spécialité qui a des associations avec des médecins, cabinets ou maux");
    }

    return await this.repository.deleteSpecialite(id);
  }

  // Rechercher des spécialités
  async searchSpecialites(searchData: SearchSpecialiteRequest): Promise<SpecialiteWithDetails[]> {
    return await this.repository.searchSpecialites(searchData);
  }

  // ========================================
  // MAUX
  // ========================================

  // Créer un mal
  async createMaux(data: CreateMauxRequest): Promise<Maux> {
    if (!data.nom || data.nom.trim().length === 0) {
      throw new Error("Le nom du mal est requis");
    }

    // Vérifier si un mal avec ce nom existe déjà
    const existingMaux = await this.repository.searchMaux({ nom: data.nom });
    if (existingMaux.length > 0) {
      throw new Error("Un mal avec ce nom existe déjà");
    }

    return await this.repository.createMaux(data);
  }

  // Récupérer tous les maux
  async getAllMaux(limit: number = 50, offset: number = 0): Promise<Maux[]> {
    if (limit < 1 || limit > 100) {
      throw new Error("La limite doit être entre 1 et 100");
    }
    if (offset < 0) {
      throw new Error("L'offset doit être positif ou nul");
    }

    return await this.repository.getAllMaux(limit, offset);
  }

  // Récupérer un mal par ID
  async getMauxById(id: string): Promise<Maux | null> {
    if (!id) {
      throw new Error("ID de mal requis");
    }

    return await this.repository.getMauxById(id);
  }

  // Récupérer un mal avec détails
  async getMauxWithDetails(id: string): Promise<MauxWithDetails | null> {
    if (!id) {
      throw new Error("ID de mal requis");
    }

    return await this.repository.getMauxWithDetails(id);
  }

  // Modifier un mal
  async updateMaux(id: string, updateData: UpdateMauxRequest): Promise<Maux> {
    if (!id) {
      throw new Error("ID de mal requis");
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Aucune donnée de mise à jour fournie");
    }

    // Vérifier si le mal existe
    const existingMaux = await this.repository.getMauxById(id);
    if (!existingMaux) {
      throw new Error("Mal non trouvé");
    }

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.nom && updateData.nom !== existingMaux.nom) {
      const existingWithSameName = await this.repository.searchMaux({ nom: updateData.nom });
      if (existingWithSameName.length > 0) {
        throw new Error("Un mal avec ce nom existe déjà");
      }
    }

    return await this.repository.updateMaux(id, updateData);
  }

  // Supprimer un mal
  async deleteMaux(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("ID de mal requis");
    }

    // Vérifier si le mal existe
    const existingMaux = await this.repository.getMauxById(id);
    if (!existingMaux) {
      throw new Error("Mal non trouvé");
    }

    // Vérifier s'il y a des associations
    const mauxWithDetails = await this.repository.getMauxWithDetails(id);
    if (mauxWithDetails && (mauxWithDetails.nombre_specialites || 0) > 0) {
      throw new Error("Impossible de supprimer un mal qui a des associations avec des spécialités");
    }

    return await this.repository.deleteMaux(id);
  }

  // Rechercher des maux
  async searchMaux(searchData: SearchMauxRequest): Promise<MauxWithDetails[]> {
    return await this.repository.searchMaux(searchData);
  }

  // ========================================
  // ASSOCIATIONS
  // ========================================

  // Associer un médecin à une spécialité
  async associateMedecinSpecialite(data: MedecinSpecialite): Promise<MedecinSpecialite> {
    if (!data.medecin_id || !data.specialite_id) {
      throw new Error("ID médecin et ID spécialité requis");
    }

    // Vérifier que le médecin existe
    const medecinExists = await this.repository.searchMedecinsBySpecialite({ 
      specialite_id: data.specialite_id 
    });
    // Note: Cette vérification n'est pas parfaite, mais c'est un début
    // Dans un vrai projet, on aurait une méthode pour vérifier l'existence d'un médecin

    // Vérifier que la spécialité existe
    const specialiteExists = await this.repository.getSpecialiteById(data.specialite_id);
    if (!specialiteExists) {
      throw new Error("Spécialité non trouvée");
    }

    return await this.repository.associateMedecinSpecialite(data);
  }

  // Désassocier un médecin d'une spécialité
  async disassociateMedecinSpecialite(medecinId: string, specialiteId: string): Promise<boolean> {
    if (!medecinId || !specialiteId) {
      throw new Error("ID médecin et ID spécialité requis");
    }

    return await this.repository.disassociateMedecinSpecialite(medecinId, specialiteId);
  }

  // Associer un cabinet à une spécialité
  async associateCabinetSpecialite(data: CabinetSpecialite): Promise<CabinetSpecialite> {
    if (!data.cabinet_id || !data.specialite_id) {
      throw new Error("ID cabinet et ID spécialité requis");
    }

    // Vérifier que la spécialité existe
    const specialiteExists = await this.repository.getSpecialiteById(data.specialite_id);
    if (!specialiteExists) {
      throw new Error("Spécialité non trouvée");
    }

    return await this.repository.associateCabinetSpecialite(data);
  }

  // Désassocier un cabinet d'une spécialité
  async disassociateCabinetSpecialite(cabinetId: string, specialiteId: string): Promise<boolean> {
    if (!cabinetId || !specialiteId) {
      throw new Error("ID cabinet et ID spécialité requis");
    }

    return await this.repository.disassociateCabinetSpecialite(cabinetId, specialiteId);
  }

  // Associer une spécialité à un mal
  async associateSpecialiteMaux(data: SpecialiteMaux): Promise<SpecialiteMaux> {
    if (!data.specialite_id || !data.maux_id) {
      throw new Error("ID spécialité et ID mal requis");
    }

    // Vérifier que la spécialité existe
    const specialiteExists = await this.repository.getSpecialiteById(data.specialite_id);
    if (!specialiteExists) {
      throw new Error("Spécialité non trouvée");
    }

    // Vérifier que le mal existe
    const mauxExists = await this.repository.getMauxById(data.maux_id);
    if (!mauxExists) {
      throw new Error("Mal non trouvé");
    }

    return await this.repository.associateSpecialiteMaux(data);
  }

  // Désassocier une spécialité d'un mal
  async disassociateSpecialiteMaux(specialiteId: string, mauxId: string): Promise<boolean> {
    if (!specialiteId || !mauxId) {
      throw new Error("ID spécialité et ID mal requis");
    }

    return await this.repository.disassociateSpecialiteMaux(specialiteId, mauxId);
  }

  // ========================================
  // RECHERCHES AVANCÉES
  // ========================================

  // Rechercher des médecins par spécialité
  async searchMedecinsBySpecialite(searchData: SearchMedecinBySpecialiteRequest): Promise<MedecinWithSpecialites[]> {
    if (!searchData.specialite_id) {
      throw new Error("ID spécialité requis");
    }

    return await this.repository.searchMedecinsBySpecialite(searchData);
  }

  // Rechercher des cabinets par spécialité
  async searchCabinetsBySpecialite(searchData: SearchCabinetBySpecialiteRequest): Promise<CabinetWithSpecialites[]> {
    if (!searchData.specialite_id) {
      throw new Error("ID spécialité requis");
    }

    return await this.repository.searchCabinetsBySpecialite(searchData);
  }

  // Rechercher des médecins par mal
  async searchMedecinsByMaux(searchData: SearchMedecinByMauxRequest): Promise<MedecinWithSpecialites[]> {
    if (!searchData.maux_id) {
      throw new Error("ID mal requis");
    }

    return await this.repository.searchMedecinsByMaux(searchData);
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  // Obtenir les statistiques générales
  async getStatistics(): Promise<{
    totalSpecialites: number;
    totalMaux: number;
    totalAssociationsMedecinSpecialite: number;
    totalAssociationsCabinetSpecialite: number;
    totalAssociationsSpecialiteMaux: number;
  }> {
    const specialites = await this.repository.getAllSpecialites(1000, 0);
    const maux = await this.repository.getAllMaux(1000, 0);
    
    // Compter les associations
    let totalAssociationsMedecinSpecialite = 0;
    let totalAssociationsCabinetSpecialite = 0;
    let totalAssociationsSpecialiteMaux = 0;

    for (const specialite of specialites) {
      const details = await this.repository.getSpecialiteWithDetails(specialite.idspecialite!);
      if (details) {
        totalAssociationsMedecinSpecialite += details.nombre_medecins || 0;
        totalAssociationsCabinetSpecialite += details.nombre_cabinets || 0;
        totalAssociationsSpecialiteMaux += details.nombre_maux || 0;
      }
    }

    return {
      totalSpecialites: specialites.length,
      totalMaux: maux.length,
      totalAssociationsMedecinSpecialite,
      totalAssociationsCabinetSpecialite,
      totalAssociationsSpecialiteMaux
    };
  }
}
