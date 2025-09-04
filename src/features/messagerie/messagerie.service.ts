import { MessagerieRepository } from "./messagerie.repository";
import { SocketService } from "../../shared/services/socket.service";
import { PushService } from "../../shared/services/push.service";
import { 
  Conversation, 
  Message, 
  MessageLu,
  ConversationParticipant,
  ConversationWithDetails,
  MessageWithDetails,
  CreateConversationRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  AddParticipantRequest,
  CommunicationRules,
  ConversationPermissions
} from "./messagerie.model";

export class MessagerieService {
  private repository: MessagerieRepository;
  private socketService: SocketService;
  private pushService: PushService = new PushService();

  constructor(socketService?: SocketService) {
    this.repository = new MessagerieRepository();
    this.socketService = socketService!;
  }

  // ========================================
  // RÈGLES DE COMMUNICATION
  // ========================================

  // Vérifier les règles de communication entre utilisateurs
  private async checkCommunicationRules(
    senderId: string, 
    receiverId: string, 
    senderRole: string, 
    receiverRole: string
  ): Promise<boolean> {
    // SuperAdmin peut communiquer avec tout le monde
    if (senderRole === 'SUPERADMIN') {
      return true;
    }

    // Patient ↔ Médecin
    if ((senderRole === 'PATIENT' && receiverRole === 'MEDECIN') ||
        (senderRole === 'MEDECIN' && receiverRole === 'PATIENT')) {
      return true;
    }

    // Patient ↔ AdminCabinet
    if ((senderRole === 'PATIENT' && receiverRole === 'ADMINCABINET') ||
        (senderRole === 'ADMINCABINET' && receiverRole === 'PATIENT')) {
      return true;
    }

    // Médecin ↔ AdminCabinet (même cabinet)
    if ((senderRole === 'MEDECIN' && receiverRole === 'ADMINCABINET') ||
        (senderRole === 'ADMINCABINET' && receiverRole === 'MEDECIN')) {
      // TODO: Vérifier qu'ils sont dans le même cabinet
      return true;
    }

    return false;
  }

  // ========================================
  // CONVERSATIONS
  // ========================================

  // Créer ou récupérer une conversation privée
  async createOrGetPrivateConversation(
    userId1: string, 
    userId2: string, 
    userRole1: string, 
    userRole2: string
  ): Promise<ConversationWithDetails> {
    // Vérifier les règles de communication
    const canCommunicate = await this.checkCommunicationRules(userId1, userId2, userRole1, userRole2);
    if (!canCommunicate) {
      throw new Error("Communication non autorisée entre ces utilisateurs");
    }

    // Vérifier si une conversation privée existe déjà
    let conversation = await this.repository.getPrivateConversationBetweenUsers(userId1, userId2);
    
    if (!conversation) {
      // Créer une nouvelle conversation privée
      const conversationData: CreateConversationRequest = {
        type_conversation: 'PRIVEE',
        participants: [userId1, userId2]
      };
      
      const created = await this.repository.createConversation(conversationData);
      const conversationId = (created as any).idConversation || (created as any).idconversation;
      await this.repository.addParticipants(conversationId, [userId1, userId2]);
      conversation = created as any;
    }

    // Récupérer la conversation avec détails
    const convId = (conversation as any).idConversation || (conversation as any).idconversation;
    const conversationWithDetails = await this.repository.getConversationById(convId);
    if (!conversationWithDetails) {
      throw new Error("Erreur lors de la récupération de la conversation");
    }

    return conversationWithDetails;
  }

  // Créer une conversation de groupe pour un cabinet
  async createCabinetGroupConversation(
    cabinetId: string, 
    creatorId: string, 
    creatorRole: string
  ): Promise<ConversationWithDetails> {
    if (creatorRole !== 'ADMINCABINET' && creatorRole !== 'SUPERADMIN') {
      throw new Error("Seuls les admins de cabinet peuvent créer des groupes");
    }

    const conversationData: CreateConversationRequest = {
      type_conversation: 'GROUPE_CABINET',
      titre: `Groupe Cabinet`,
      cabinet_id: cabinetId,
      participants: [creatorId] // L'admin sera ajouté automatiquement
    };

    const conversation = await this.repository.createConversation(conversationData);
    await this.repository.addParticipants(conversation.idConversation!, [creatorId]);

    const conversationWithDetails = await this.repository.getConversationById(conversation.idConversation!);
    if (!conversationWithDetails) {
      throw new Error("Erreur lors de la récupération de la conversation");
    }

    return conversationWithDetails;
  }

  // Récupérer les conversations d'un utilisateur
  async getConversationsByUser(userId: string): Promise<ConversationWithDetails[]> {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }

    return await this.repository.getConversationsByUser(userId);
  }

  // Récupérer une conversation par ID
  async getConversationById(conversationId: string, userId: string): Promise<ConversationWithDetails | null> {
    if (!conversationId || !userId) {
      throw new Error("ID conversation et utilisateur requis");
    }

    const conversation = await this.repository.getConversationById(conversationId);
    
    if (!conversation) {
      return null;
    }

    // Vérifier que l'utilisateur est participant
    const isParticipant = conversation.participants.some(p => p.utilisateur_id === userId);
    if (!isParticipant) {
      throw new Error("Accès non autorisé à cette conversation");
    }

    return conversation;
  }

  // Ajouter un participant à une conversation
  async addParticipantToConversation(
    conversationId: string, 
    participantId: string, 
    requesterId: string, 
    requesterRole: string
  ): Promise<ConversationParticipant> {
    const conversation = await this.repository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversation non trouvée");
    }

    // Vérifier les permissions
    const canAdd = await this.checkAddParticipantPermissions(conversation, requesterId, requesterRole);
    if (!canAdd) {
      throw new Error("Permissions insuffisantes pour ajouter un participant");
    }

    const participantData: AddParticipantRequest = {
      conversation_id: conversationId,
      utilisateur_id: participantId,
      role_participant: 'MEMBRE'
    };

    return await this.repository.addParticipant(participantData);
  }

  // Retirer un participant d'une conversation
  async removeParticipantFromConversation(
    conversationId: string, 
    participantId: string, 
    requesterId: string, 
    requesterRole: string
  ): Promise<boolean> {
    const conversation = await this.repository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversation non trouvée");
    }

    // Vérifier les permissions
    const canRemove = await this.checkRemoveParticipantPermissions(
      conversation, 
      participantId, 
      requesterId, 
      requesterRole
    );
    if (!canRemove) {
      throw new Error("Permissions insuffisantes pour retirer ce participant");
    }

    return await this.repository.removeParticipant(conversationId, participantId);
  }

  // ========================================
  // MESSAGES
  // ========================================

  // Envoyer un message
  async sendMessage(
    data: CreateMessageRequest, 
    senderId: string, 
    senderRole: string
  ): Promise<MessageWithDetails> {
    // Autoriser les messages fichier sans contenu texte
    if ((!data.contenu || data.contenu.trim().length === 0) && !data.fichier_url) {
      throw new Error("Le contenu du message ne peut pas être vide");
    }

    // Vérifier que l'expéditeur est participant de la conversation
    const conversation = await this.repository.getConversationById(data.conversation_id);
    if (!conversation) {
      throw new Error("Conversation non trouvée");
    }

    const isParticipant = conversation.participants.some(p => p.utilisateur_id === senderId);
    if (!isParticipant) {
      throw new Error("Vous n'êtes pas participant de cette conversation");
    }

    // Créer le message
    const message = await this.repository.createMessage({
      ...data,
      expediteur_id: senderId
    });

    // Récupérer le message avec détails
    const messageId = (message as any).idMessage || (message as any).idmessage;
    const messageWithDetails = await this.repository.getMessageById(messageId);
    if (!messageWithDetails) {
      throw new Error("Erreur lors de la récupération du message");
    }

    // Notifications temps réel
    if (this.socketService) {
      // Notifier tous les participants de la conversation
      conversation.participants.forEach(participant => {
        if (participant.utilisateur_id !== senderId) {
          this.socketService.notifyNewMessage(data.conversation_id, messageWithDetails);
          // Push notification (si activée)
          this.pushService.sendToUser(participant.utilisateur_id, {
            title: "Nouveau message",
            body: messageWithDetails.contenu || "Pièce jointe",
            data: { conversation_id: data.conversation_id, message_id: messageWithDetails.idMessage }
          });
        }
      });
    }

    return messageWithDetails;
  }

  // Récupérer les messages d'une conversation
  async getMessagesByConversation(
    conversationId: string, 
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<MessageWithDetails[]> {
    // Vérifier que l'utilisateur est participant
    const conversation = await this.repository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversation non trouvée");
    }

    const isParticipant = conversation.participants.some(p => p.utilisateur_id === userId);
    if (!isParticipant) {
      throw new Error("Accès non autorisé à cette conversation");
    }

    return await this.repository.getMessagesByConversation(conversationId, limit, offset);
  }

  // Modifier un message
  async updateMessage(
    messageId: string, 
    updateData: UpdateMessageRequest, 
    requesterId: string, 
    requesterRole: string
  ): Promise<Message> {
    const message = await this.repository.getMessageById(messageId);
    if (!message) {
      throw new Error("Message non trouvé");
    }

    // Vérifier les permissions
    const canModify = await this.checkModifyMessagePermissions(message, requesterId, requesterRole);
    if (!canModify) {
      throw new Error("Permissions insuffisantes pour modifier ce message");
    }

    return await this.repository.updateMessage(messageId, updateData);
  }

  // Supprimer un message
  async deleteMessage(
    messageId: string, 
    requesterId: string, 
    requesterRole: string
  ): Promise<boolean> {
    const message = await this.repository.getMessageById(messageId);
    if (!message) {
      throw new Error("Message non trouvé");
    }

    // Vérifier les permissions
    const canDelete = await this.checkDeleteMessagePermissions(message, requesterId, requesterRole);
    if (!canDelete) {
      throw new Error("Permissions insuffisantes pour supprimer ce message");
    }

    return await this.repository.deleteMessage(messageId);
  }

  // Marquer une conversation comme lue
  async markConversationAsRead(conversationId: string, userId: string): Promise<number> {
    return await this.repository.markConversationAsRead(conversationId, userId);
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: string, userId: string): Promise<MessageLu> {
    return await this.repository.markMessageAsRead(messageId, userId);
  }

  // ========================================
  // VÉRIFICATIONS DE PERMISSIONS
  // ========================================

  private async checkAddParticipantPermissions(
    conversation: ConversationWithDetails, 
    requesterId: string, 
    requesterRole: string
  ): Promise<boolean> {
    // SuperAdmin peut ajouter n'importe qui
    if (requesterRole === 'SUPERADMIN') {
      return true;
    }

    // Admin de conversation peut ajouter des participants
    const requesterParticipant = conversation.participants.find(p => p.utilisateur_id === requesterId);
    if (requesterParticipant && requesterParticipant.role_participant === 'ADMIN') {
      return true;
    }

    // AdminCabinet peut ajouter des participants dans les groupes de son cabinet
    if (requesterRole === 'ADMINCABINET' && conversation.type_conversation === 'GROUPE_CABINET') {
      return true;
    }

    return false;
  }

  private async checkRemoveParticipantPermissions(
    conversation: ConversationWithDetails, 
    participantId: string, 
    requesterId: string, 
    requesterRole: string
  ): Promise<boolean> {
    // SuperAdmin peut retirer n'importe qui
    if (requesterRole === 'SUPERADMIN') {
      return true;
    }

    // On peut se retirer soi-même
    if (participantId === requesterId) {
      return true;
    }

    // Admin de conversation peut retirer des participants
    const requesterParticipant = conversation.participants.find(p => p.utilisateur_id === requesterId);
    if (requesterParticipant && requesterParticipant.role_participant === 'ADMIN') {
      return true;
    }

    return false;
  }

  private async checkModifyMessagePermissions(
    message: MessageWithDetails, 
    requesterId: string, 
    requesterRole: string
  ): Promise<boolean> {
    // SuperAdmin peut modifier n'importe quel message
    if (requesterRole === 'SUPERADMIN') {
      return true;
    }

    // On peut modifier ses propres messages
    if (message.expediteur_id === requesterId) {
      return true;
    }

    return false;
  }

  private async checkDeleteMessagePermissions(
    message: MessageWithDetails, 
    requesterId: string, 
    requesterRole: string
  ): Promise<boolean> {
    // SuperAdmin peut supprimer n'importe quel message
    if (requesterRole === 'SUPERADMIN') {
      return true;
    }

    // On peut supprimer ses propres messages
    if (message.expediteur_id === requesterId) {
      return true;
    }

    return false;
  }
}
