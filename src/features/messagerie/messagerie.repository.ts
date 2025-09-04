import { 
  Conversation, 
  ConversationParticipant, 
  Message, 
  MessageLu,
  ConversationWithDetails,
  MessageWithDetails,
  CreateConversationRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  AddParticipantRequest
} from "./messagerie.model";
import db from "../../utils/database";

export class MessagerieRepository {

  // ========================================
  // CONVERSATIONS
  // ========================================

  // Créer une conversation
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const query = `
      INSERT INTO conversation (type_conversation, titre, cabinet_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.type_conversation, data.titre, data.cabinet_id];
    const result = await db.query<Conversation>(query, values);
    return result.rows[0];
  }

  // Ajouter des participants à une conversation
  async addParticipants(conversationId: string, participants: string[]): Promise<void> {
    const query = `
      INSERT INTO conversation_participant (conversation_id, utilisateur_id)
      VALUES ($1, $2)
    `;
    
    for (const userId of participants) {
      await db.query(query, [conversationId, userId]);
    }
  }

  // Récupérer une conversation avec détails
  async getConversationById(conversationId: string): Promise<ConversationWithDetails | null> {
    const query = `
      SELECT 
        c.*,
        cp.idParticipant, cp.utilisateur_id, cp.role_participant, cp.dateRejointe, cp.actif as participant_actif,
        u.nom, u.prenom, u.email,
        dm.idMessage as dernier_message_id, dm.contenu as dernier_message_contenu, 
        dm.dateEnvoi as dernier_message_date, dm.type_message as dernier_message_type,
        eu.nom as dernier_message_expediteur_nom, eu.prenom as dernier_message_expediteur_prenom
      FROM conversation c
      LEFT JOIN conversation_participant cp ON c.idConversation = cp.conversation_id AND cp.actif = true
      LEFT JOIN utilisateur u ON cp.utilisateur_id = u.idUtilisateur
      LEFT JOIN LATERAL (
        SELECT m.idMessage, m.contenu, m.dateEnvoi, m.type_message, m.expediteur_id
        FROM message m
        WHERE m.conversation_id = c.idConversation AND m.actif = true
        ORDER BY m.dateEnvoi DESC
        LIMIT 1
      ) dm ON true
      LEFT JOIN utilisateur eu ON dm.expediteur_id = eu.idUtilisateur
      WHERE c.idConversation = $1 AND c.actif = true
    `;
    
    const result = await db.query(query, [conversationId]);
    
    if (result.rows.length === 0) return null;
    
    const conversation = result.rows[0];
    const participants = result.rows
      .filter(row => row.idparticipant)
      .map(row => ({
        idParticipant: row.idparticipant,
        utilisateur_id: row.utilisateur_id,
        role_participant: row.role_participant,
        dateRejointe: row.daterejointe,
        actif: row.participant_actif,
        utilisateur: {
          idUtilisateur: row.utilisateur_id,
          nom: row.nom,
          prenom: row.prenom,
          email: row.email,
          role: ''
        }
      }));

    return {
      idConversation: conversation.idconversation,
      type_conversation: conversation.type_conversation,
      titre: conversation.titre,
      cabinet_id: conversation.cabinet_id,
      dateCreation: conversation.datecreation,
      dateModification: conversation.datemodification,
      actif: conversation.actif,
      participants,
      dernier_message: conversation.dernier_message_id ? {
        idMessage: conversation.dernier_message_id,
        conversation_id: conversationId,
        expediteur_id: conversation.dernier_message_expediteur_id,
        contenu: conversation.dernier_message_contenu,
        type_message: conversation.dernier_message_type,
        dateEnvoi: conversation.dernier_message_date,
        expediteur: {
          idUtilisateur: conversation.dernier_message_expediteur_id,
          nom: conversation.dernier_message_expediteur_nom,
          prenom: conversation.dernier_message_expediteur_prenom,
          email: '',
          role: ''
        },
        lu_par: []
      } : undefined
    };
  }

  // Récupérer les conversations d'un utilisateur
  async getConversationsByUser(userId: string): Promise<ConversationWithDetails[]> {
    const query = `
      SELECT DISTINCT
        c.*,
        cp.idParticipant, cp.utilisateur_id, cp.role_participant, cp.dateRejointe, cp.actif as participant_actif,
        u.nom, u.prenom, u.email,
        dm.idMessage as dernier_message_id, dm.contenu as dernier_message_contenu, 
        dm.dateEnvoi as dernier_message_date, dm.type_message as dernier_message_type,
        eu.nom as dernier_message_expediteur_nom, eu.prenom as dernier_message_expediteur_prenom,
        COUNT(ml.idMessageLu) as messages_non_lus
      FROM conversation c
      JOIN conversation_participant cp ON c.idConversation = cp.conversation_id
      JOIN utilisateur u ON cp.utilisateur_id = u.idUtilisateur
      LEFT JOIN LATERAL (
        SELECT m.idMessage, m.contenu, m.dateEnvoi, m.type_message, m.expediteur_id
        FROM message m
        WHERE m.conversation_id = c.idConversation AND m.actif = true
        ORDER BY m.dateEnvoi DESC
        LIMIT 1
      ) dm ON true
      LEFT JOIN utilisateur eu ON dm.expediteur_id = eu.idUtilisateur
      LEFT JOIN message m2 ON c.idConversation = m2.conversation_id AND m2.actif = true
      LEFT JOIN message_lu ml ON m2.idMessage = ml.message_id AND ml.utilisateur_id = $1
      WHERE c.actif = true 
        AND EXISTS (
          SELECT 1 FROM conversation_participant cp2 
          WHERE cp2.conversation_id = c.idConversation 
            AND cp2.utilisateur_id = $1 
            AND cp2.actif = true
        )
      GROUP BY c.idConversation, cp.idParticipant, u.idUtilisateur, dm.idMessage, eu.idUtilisateur
      ORDER BY dm.dateEnvoi DESC NULLS LAST, c.dateModification DESC
    `;
    
    const result = await db.query(query, [userId]);
    return this.mapConversationsWithDetails(result.rows);
  }

  // Vérifier si une conversation privée existe entre deux utilisateurs
  async getPrivateConversationBetweenUsers(userId1: string, userId2: string): Promise<Conversation | null> {
    const query = `
      SELECT c.*
      FROM conversation c
      WHERE c.type_conversation = 'PRIVEE'
        AND c.actif = true
        AND EXISTS (
          SELECT 1 FROM conversation_participant cp1
          WHERE cp1.conversation_id = c.idConversation 
            AND cp1.utilisateur_id = $1 
            AND cp1.actif = true
        )
        AND EXISTS (
          SELECT 1 FROM conversation_participant cp2
          WHERE cp2.conversation_id = c.idConversation 
            AND cp2.utilisateur_id = $2 
            AND cp2.actif = true
        )
        AND (
          SELECT COUNT(*) FROM conversation_participant cp3
          WHERE cp3.conversation_id = c.idConversation 
            AND cp3.actif = true
        ) = 2
    `;
    
    const result = await db.query<Conversation>(query, [userId1, userId2]);
    return result.rows[0] || null;
  }

  // Ajouter un participant à une conversation
  async addParticipant(data: AddParticipantRequest): Promise<ConversationParticipant> {
    const query = `
      INSERT INTO conversation_participant (conversation_id, utilisateur_id, role_participant)
      VALUES ($1, $2, $3)
      ON CONFLICT (conversation_id, utilisateur_id) 
      DO UPDATE SET actif = true, dateRejointe = now()
      RETURNING *
    `;
    const values = [data.conversation_id, data.utilisateur_id, data.role_participant || 'MEMBRE'];
    const result = await db.query<ConversationParticipant>(query, values);
    return result.rows[0];
  }

  // Retirer un participant d'une conversation
  async removeParticipant(conversationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE conversation_participant 
      SET actif = false, dateQuittee = now()
      WHERE conversation_id = $1 AND utilisateur_id = $2
    `;
    const result = await db.query(query, [conversationId, userId]);
    return (result.rowCount || 0) > 0;
  }

  // ========================================
  // MESSAGES
  // ========================================

  // Créer un message
  async createMessage(data: CreateMessageRequest & { expediteur_id?: string }): Promise<Message> {
    const query = `
      INSERT INTO message (conversation_id, expediteur_id, contenu, type_message, fichier_url, fichier_nom, fichier_taille, reponse_a)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.conversation_id, 
      data.expediteur_id || '', 
      data.contenu, 
      data.type_message || 'TEXTE',
      data.fichier_url, 
      data.fichier_nom, 
      data.fichier_taille, 
      data.reponse_a
    ];
    const result = await db.query<Message>(query, values);
    return result.rows[0];
  }

  // Récupérer les messages d'une conversation
  async getMessagesByConversation(
    conversationId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<MessageWithDetails[]> {
    const query = `
      SELECT 
        m.*,
        u.nom, u.prenom, u.email,
        rm.idMessage as reponse_id, rm.contenu as reponse_contenu,
        ru.nom as reponse_expediteur_nom, ru.prenom as reponse_expediteur_prenom,
        ml.idMessageLu, ml.utilisateur_id as lu_par_user_id, ml.dateLecture,
        lu.nom as lu_par_nom, lu.prenom as lu_par_prenom
      FROM message m
      JOIN utilisateur u ON m.expediteur_id = u.idUtilisateur
      LEFT JOIN message rm ON m.reponse_a = rm.idMessage
      LEFT JOIN utilisateur ru ON rm.expediteur_id = ru.idUtilisateur
      LEFT JOIN message_lu ml ON m.idMessage = ml.message_id
      LEFT JOIN utilisateur lu ON ml.utilisateur_id = lu.idUtilisateur
      WHERE m.conversation_id = $1 AND m.actif = true
      ORDER BY m.dateEnvoi ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [conversationId, limit, offset]);
    return this.mapMessagesWithDetails(result.rows);
  }

  // Récupérer un message par ID
  async getMessageById(messageId: string): Promise<MessageWithDetails | null> {
    const query = `
      SELECT 
        m.*,
        u.nom, u.prenom, u.email,
        rm.idMessage as reponse_id, rm.contenu as reponse_contenu,
        ru.nom as reponse_expediteur_nom, ru.prenom as reponse_expediteur_prenom,
        ml.idMessageLu, ml.utilisateur_id as lu_par_user_id, ml.dateLecture,
        lu.nom as lu_par_nom, lu.prenom as lu_par_prenom
      FROM message m
      JOIN utilisateur u ON m.expediteur_id = u.idUtilisateur
      LEFT JOIN message rm ON m.reponse_a = rm.idMessage
      LEFT JOIN utilisateur ru ON rm.expediteur_id = ru.idUtilisateur
      LEFT JOIN message_lu ml ON m.idMessage = ml.message_id
      LEFT JOIN utilisateur lu ON ml.utilisateur_id = lu.idUtilisateur
      WHERE m.idMessage = $1 AND m.actif = true
    `;
    
    const result = await db.query(query, [messageId]);
    const messages = this.mapMessagesWithDetails(result.rows);
    return messages[0] || null;
  }

  // Modifier un message
  async updateMessage(messageId: string, updateData: UpdateMessageRequest): Promise<Message> {
    const allowedFields = ['contenu', 'fichier_url', 'fichier_nom', 'fichier_taille'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof UpdateMessageRequest] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [messageId, ...fieldsToUpdate.map(field => updateData[field as keyof UpdateMessageRequest])];

    const query = `
      UPDATE message 
      SET ${setClause}, dateModification = now() 
      WHERE idMessage = $1 AND actif = true
      RETURNING *
    `;
    
    const result = await db.query<Message>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Message non trouvé');
    }

    return result.rows[0];
  }

  // Supprimer un message (soft delete)
  async deleteMessage(messageId: string): Promise<boolean> {
    const query = `
      UPDATE message 
      SET supprime = true, actif = false, dateModification = now()
      WHERE idMessage = $1
    `;
    const result = await db.query(query, [messageId]);
    return (result.rowCount || 0) > 0;
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: string, userId: string): Promise<MessageLu> {
    const query = `
      INSERT INTO message_lu (message_id, utilisateur_id)
      VALUES ($1, $2)
      ON CONFLICT (message_id, utilisateur_id) 
      DO UPDATE SET dateLecture = now()
      RETURNING *
    `;
    const result = await db.query<MessageLu>(query, [messageId, userId]);
    return result.rows[0];
  }

  // Marquer tous les messages d'une conversation comme lus
  async markConversationAsRead(conversationId: string, userId: string): Promise<number> {
    const query = `
      INSERT INTO message_lu (message_id, utilisateur_id)
      SELECT m.idMessage, $2
      FROM message m
      WHERE m.conversation_id = $1 
        AND m.actif = true 
        AND m.expediteur_id != $2
        AND NOT EXISTS (
          SELECT 1 FROM message_lu ml 
          WHERE ml.message_id = m.idMessage 
            AND ml.utilisateur_id = $2
        )
      ON CONFLICT (message_id, utilisateur_id) 
      DO UPDATE SET dateLecture = now()
    `;
    const result = await db.query(query, [conversationId, userId]);
    return result.rowCount || 0;
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  private mapConversationsWithDetails(rows: any[]): ConversationWithDetails[] {
    const conversationMap = new Map<string, ConversationWithDetails>();
    
    rows.forEach(row => {
      if (!conversationMap.has(row.idconversation)) {
        conversationMap.set(row.idconversation, {
          idConversation: row.idconversation,
          type_conversation: row.type_conversation,
          titre: row.titre,
          cabinet_id: row.cabinet_id,
          dateCreation: row.datecreation,
          dateModification: row.datemodification,
          actif: row.actif,
          participants: [],
          nombre_messages_non_lus: parseInt(row.messages_non_lus) || 0
        });
      }
      
      const conversation = conversationMap.get(row.idconversation)!;
      
      if (row.idparticipant && !conversation.participants.find(p => p.idParticipant === row.idparticipant)) {
        conversation.participants.push({
          idParticipant: row.idparticipant,
          utilisateur_id: row.utilisateur_id,
          role_participant: row.role_participant,
          dateRejointe: row.daterejointe,
          actif: row.participant_actif,
          utilisateur: {
            idUtilisateur: row.utilisateur_id,
            nom: row.nom,
            prenom: row.prenom,
            email: row.email,
            role: ''
          }
        });
      }
      
      if (row.dernier_message_id && !conversation.dernier_message) {
        conversation.dernier_message = {
          idMessage: row.dernier_message_id,
          conversation_id: row.idconversation,
          expediteur_id: row.dernier_message_expediteur_id,
          contenu: row.dernier_message_contenu,
          type_message: row.dernier_message_type,
          dateEnvoi: row.dernier_message_date,
          expediteur: {
            idUtilisateur: row.dernier_message_expediteur_id,
            nom: row.dernier_message_expediteur_nom,
            prenom: row.dernier_message_expediteur_prenom,
            email: '',
            role: ''
          },
          lu_par: []
        };
      }
    });
    
    return Array.from(conversationMap.values());
  }

  private mapMessagesWithDetails(rows: any[]): MessageWithDetails[] {
    const messageMap = new Map<string, MessageWithDetails>();
    
    rows.forEach(row => {
      if (!messageMap.has(row.idmessage)) {
        messageMap.set(row.idmessage, {
          idMessage: row.idmessage,
          conversation_id: row.conversation_id,
          expediteur_id: row.expediteur_id,
          contenu: row.contenu,
          type_message: row.type_message,
          fichier_url: row.fichier_url,
          fichier_nom: row.fichier_nom,
          fichier_taille: row.fichier_taille,
          reponse_a: row.reponse_a,
          dateEnvoi: row.dateenvoi,
          dateModification: row.datemodification,
          supprime: row.supprime,
          actif: row.actif,
          expediteur: {
            idUtilisateur: row.expediteur_id,
            nom: row.nom,
            prenom: row.prenom,
            email: row.email,
            role: ''
          },
          lu_par: []
        });
      }
      
      const message = messageMap.get(row.idmessage)!;
      
      if (row.reponse_id && !message.reponse_a_message) {
        message.reponse_a_message = {
          idMessage: row.reponse_id,
          contenu: row.reponse_contenu,
          expediteur: {
            nom: row.reponse_expediteur_nom,
            prenom: row.reponse_expediteur_prenom
          }
        };
      }
      
      if (row.idmessagelu && !message.lu_par.find(l => l.idMessageLu === row.idmessagelu)) {
        message.lu_par.push({
          idMessageLu: row.idmessagelu,
          utilisateur_id: row.lu_par_user_id,
          dateLecture: row.datelcture,
          utilisateur: {
            nom: row.lu_par_nom,
            prenom: row.lu_par_prenom
          }
        });
      }
    });
    
    return Array.from(messageMap.values());
  }
}
