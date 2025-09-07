import { NotificationPreferencesRepository } from "./notification-preferences.repository";
import { NotificationPreferences, UpdateNotificationPreferencesRequest } from "./notification-preferences.model";

export class NotificationPreferencesService {
  private repository: NotificationPreferencesRepository;

  constructor() {
    this.repository = new NotificationPreferencesRepository();
  }

  // Récupérer les préférences d'un utilisateur (créer par défaut si inexistantes)
  async getPreferences(utilisateurId: string): Promise<NotificationPreferences> {
    if (!utilisateurId) {
      throw new Error("ID utilisateur requis");
    }

    let preferences = await this.repository.getPreferencesByUser(utilisateurId);
    
    // Si pas de préférences, créer les préférences par défaut
    if (!preferences) {
      preferences = await this.repository.createDefaultPreferences(utilisateurId);
    }

    return preferences;
  }

  // Créer les préférences d'un utilisateur
  async createPreferences(utilisateurId: string, data: any): Promise<NotificationPreferences> {
    if (!utilisateurId) {
      throw new Error("ID utilisateur requis");
    }

    // Vérifier que les préférences n'existent pas déjà
    const existingPreferences = await this.repository.getPreferencesByUser(utilisateurId);
    if (existingPreferences) {
      throw new Error("Les préférences existent déjà pour cet utilisateur");
    }

    // Créer les préférences avec les données fournies
    const preferences = await this.repository.createPreferences(utilisateurId, data);
    return preferences;
  }

  // Mettre à jour les préférences
  async updatePreferences(
    utilisateurId: string, 
    updateData: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> {
    if (!utilisateurId) {
      throw new Error("ID utilisateur requis");
    }

    // Validation des champs
    if (updateData.volume !== undefined) {
      if (updateData.volume < 0 || updateData.volume > 1) {
        throw new Error("Le volume doit être entre 0 et 1");
      }
    }

    if (updateData.soundfile !== undefined) {
      if (!updateData.soundfile.startsWith('/sounds/')) {
        throw new Error("Le fichier son doit être dans le dossier /sounds/");
      }
    }

    // Vérifier que les préférences existent
    const existingPreferences = await this.repository.getPreferencesByUser(utilisateurId);
    if (!existingPreferences) {
      // Créer les préférences par défaut d'abord
      await this.repository.createDefaultPreferences(utilisateurId);
    }

    return await this.repository.updatePreferences(utilisateurId, updateData);
  }

  // Réinitialiser aux préférences par défaut
  async resetToDefault(utilisateurId: string): Promise<NotificationPreferences> {
    if (!utilisateurId) {
      throw new Error("ID utilisateur requis");
    }

    const defaultPreferences: UpdateNotificationPreferencesRequest = {
      soundenabled: true,
      soundfile: '/sounds/notification.mp3',
      volume: 0.7,
      vibration: true,
      pushenabled: false,
      emailenabled: true,
      smsenabled: false
    };

    return await this.updatePreferences(utilisateurId, defaultPreferences);
  }

  // Supprimer les préférences
  async deletePreferences(utilisateurId: string): Promise<boolean> {
    if (!utilisateurId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.deletePreferences(utilisateurId);
  }
}
