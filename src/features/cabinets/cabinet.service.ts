import { CabinetRepository } from "./cabinet.repository";
import { AuthRepository } from "../auth/auth.repository";
import { Cabinet, AdminCabinet, CreateCabinetRequest, CreateAdminCabinetRequest } from "./cabinet.model";
import bcrypt from 'bcrypt';

export class CabinetService {
  private repository: CabinetRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.repository = new CabinetRepository();
    this.authRepository = new AuthRepository();
  }

  // Créer un cabinet
  async createCabinet(data: CreateCabinetRequest): Promise<Cabinet> {
    const { nom, adresse, telephone, email, logo, horairesOuverture } = data;

    if (!nom) {
      throw new Error("Le nom du cabinet est requis");
    }

    const cabinet = await this.repository.createCabinet(
      nom,
      adresse,
      telephone,
      email,
      logo,
      horairesOuverture
    );

    return cabinet;
  }

  // Créer un AdminCabinet
  async createAdminCabinet(data: CreateAdminCabinetRequest): Promise<{ user: any; adminCabinet: AdminCabinet }> {
    const { email, motdepasse, nom, prenom, telephone, cabinetId, roleAdmin } = data;

    // Vérifier que le cabinet existe
    const cabinet = await this.repository.getCabinetById(cabinetId);
    if (!cabinet) {
      throw new Error("Cabinet non trouvé");
    }

    // Vérifier que l'email n'est pas déjà utilisé
    // TODO: Ajouter une méthode pour vérifier l'existence d'un email
    // Pour l'instant, on continue avec la création

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Créer l'utilisateur AdminCabinet
    const user = await this.repository.createAdminCabinetUser(
      email,
      hashedPassword,
      nom,
      prenom,
      telephone
    );

    // Créer l'AdminCabinet
    const adminCabinet = await this.repository.createAdminCabinet(
      user.idUtilisateur,
      cabinetId,
      roleAdmin
    );

    return { user, adminCabinet };
  }

  // Récupérer tous les cabinets
  async getAllCabinets(): Promise<Cabinet[]> {
    return await this.repository.getAllCabinets();
  }

  // Récupérer un cabinet par ID
  async getCabinetById(cabinetId: string): Promise<Cabinet | null> {
    return await this.repository.getCabinetById(cabinetId);
  }

  // Récupérer les AdminCabinet d'un cabinet
  async getCabinetAdmins(cabinetId: string): Promise<any[]> {
    return await this.repository.getCabinetAdmins(cabinetId);
  }

  // Vérifier si un utilisateur est AdminCabinet d'un cabinet
  async isAdminCabinet(userId: string, cabinetId: string): Promise<boolean> {
    return await this.repository.isAdminCabinet(userId, cabinetId);
  }

  // Modifier un cabinet
  async updateCabinet(cabinetId: string, updateData: Partial<Cabinet>): Promise<Cabinet> {
    return await this.repository.updateCabinet(cabinetId, updateData);
  }

  // Archiver un cabinet
  async archiveCabinet(cabinetId: string): Promise<boolean> {
    return await this.repository.archiveCabinet(cabinetId);
  }

  // Gestion des spécialités du cabinet
  async addSpecialiteToCabinet(cabinetId: string, specialiteId: string): Promise<void> {
    await this.repository.addSpecialiteToCabinet(cabinetId, specialiteId);
  }

  async removeSpecialiteFromCabinet(cabinetId: string, specialiteId: string): Promise<void> {
    await this.repository.removeSpecialiteFromCabinet(cabinetId, specialiteId);
  }

  async getCabinetSpecialites(cabinetId: string): Promise<any[]> {
    return await this.repository.getCabinetSpecialites(cabinetId);
  }

  // Gestion des médecins du cabinet
  async getCabinetMedecins(cabinetId: string): Promise<any[]> {
    return await this.repository.getCabinetMedecins(cabinetId);
  }

  async archiveMedecinFromCabinet(medecinId: string, cabinetId: string): Promise<void> {
    await this.repository.archiveMedecinFromCabinet(medecinId, cabinetId);
  }

  async resetMedecinPassword(adminUserId: string, cabinetId: string, medecinId: string, newPassword: string): Promise<void> {
    const isAdmin = await this.repository.isAdminCabinet(adminUserId, cabinetId);
    if (!isAdmin) throw new Error('Accès refusé');
    const belongs = await this.repository.medecinBelongsToCabinet(medecinId, cabinetId);
    if (!belongs) throw new Error('Médecin non rattaché à ce cabinet');
    const userId = await this.authRepository.getUserIdByMedecinId(medecinId);
    if (!userId) throw new Error('Utilisateur médecin introuvable');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(userId, hashed);
    await this.authRepository.setMustChangePassword(userId, true);
  }

  // Statistiques du cabinet
  async getCabinetStats(cabinetId: string): Promise<any> {
    return await this.repository.getCabinetStats(cabinetId);
  }
}
