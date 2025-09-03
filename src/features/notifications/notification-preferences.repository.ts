import { NotificationPreferences, UpdateNotificationPreferencesRequest } from "./notification-preferences.model";
import db from "../../utils/database";

export class NotificationPreferencesRepository {
  
  // Récupérer les préférences d'un utilisateur
  async getPreferencesByUser(utilisateurId: string): Promise<NotificationPreferences | null> {
    const query = `
      SELECT * FROM preferences_notification 
      WHERE utilisateur_id = $1
    `;
    const result = await db.query<NotificationPreferences>(query, [utilisateurId]);
    return result.rows[0] || null;
  }

  // Créer les préférences par défaut pour un utilisateur
  async createDefaultPreferences(utilisateurId: string): Promise<NotificationPreferences> {
    const query = `
      INSERT INTO preferences_notification (utilisateur_id)
      VALUES ($1)
      RETURNING *
    `;
    const result = await db.query<NotificationPreferences>(query, [utilisateurId]);
    return result.rows[0];
  }

  // Mettre à jour les préférences
  async updatePreferences(
    utilisateurId: string, 
    updateData: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> {
    const allowedFields = [
      'soundEnabled', 'soundFile', 'volume', 'vibration', 
      'pushEnabled', 'emailEnabled', 'smsEnabled'
    ];
    
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof UpdateNotificationPreferencesRequest] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [utilisateurId, ...fieldsToUpdate.map(field => updateData[field as keyof UpdateNotificationPreferencesRequest])];

    const query = `
      UPDATE preferences_notification 
      SET ${setClause}, dateModification = now() 
      WHERE utilisateur_id = $1 
      RETURNING *
    `;
    
    const result = await db.query<NotificationPreferences>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Préférences non trouvées');
    }

    return result.rows[0];
  }

  // Supprimer les préférences (si nécessaire)
  async deletePreferences(utilisateurId: string): Promise<boolean> {
    const query = `DELETE FROM preferences_notification WHERE utilisateur_id = $1`;
    const result = await db.query(query, [utilisateurId]);
    return (result.rowCount || 0) > 0;
  }
}
