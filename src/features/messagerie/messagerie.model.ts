// ========================================
// MODÈLES MESSAGERIE
// ========================================

export interface Conversation {
  idConversation?: string;
  type_conversation: 'PRIVEE' | 'GROUPE_CABINET' | 'SUPPORT';
  titre?: string;
  cabinet_id?: string;
  dateCreation?: Date;
  dateModification?: Date;
  actif?: boolean;
}

export interface ConversationParticipant {
  idParticipant?: string;
  conversation_id: string;
  utilisateur_id: string;
  role_participant: 'MEMBRE' | 'ADMIN' | 'MODERATEUR';
  dateRejointe?: Date;
  dateQuittee?: Date;
  actif?: boolean;
}

export interface Message {
  idMessage?: string;
  conversation_id: string;
  expediteur_id: string;
  contenu: string;
  type_message: 'TEXTE' | 'IMAGE' | 'FICHIER' | 'SYSTEME';
  fichier_url?: string;
  fichier_nom?: string;
  fichier_taille?: number;
  reponse_a?: string;
  dateEnvoi?: Date;
  dateModification?: Date;
  supprime?: boolean;
  actif?: boolean;
}

export interface MessageLu {
  idMessageLu?: string;
  message_id: string;
  utilisateur_id: string;
  dateLecture?: Date;
}

// ========================================
// REQUÊTES
// ========================================

export interface CreateConversationRequest {
  type_conversation: 'PRIVEE' | 'GROUPE_CABINET' | 'SUPPORT';
  titre?: string;
  cabinet_id?: string;
  participants: string[]; // IDs des utilisateurs
}

export interface CreateMessageRequest {
  conversation_id: string;
  contenu: string;
  type_message?: 'TEXTE' | 'IMAGE' | 'FICHIER' | 'SYSTEME';
  fichier_url?: string;
  fichier_nom?: string;
  fichier_taille?: number;
  reponse_a?: string;
}

export interface UpdateMessageRequest {
  contenu?: string;
  fichier_url?: string;
  fichier_nom?: string;
  fichier_taille?: number;
}

export interface AddParticipantRequest {
  conversation_id: string;
  utilisateur_id: string;
  role_participant?: 'MEMBRE' | 'ADMIN' | 'MODERATEUR';
}

// ========================================
// RÉPONSES
// ========================================

export interface ConversationWithDetails extends Conversation {
  participants: {
    idParticipant: string;
    utilisateur_id: string;
    role_participant: string;
    dateRejointe: Date;
    actif: boolean;
    utilisateur: {
      idUtilisateur: string;
      nom: string;
      prenom: string;
      email: string;
      role: string;
    };
  }[];
  dernier_message?: MessageWithDetails;
  nombre_messages_non_lus?: number;
}

export interface MessageWithDetails extends Message {
  expediteur: {
    idUtilisateur: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
  reponse_a_message?: {
    idMessage: string;
    contenu: string;
    expediteur: {
      nom: string;
      prenom: string;
    };
  };
  lu_par: {
    idMessageLu: string;
    utilisateur_id: string;
    dateLecture: Date;
    utilisateur: {
      nom: string;
      prenom: string;
    };
  }[];
}

export interface ConversationListResponse {
  conversations: ConversationWithDetails[];
  total: number;
}

export interface MessageListResponse {
  messages: MessageWithDetails[];
  total: number;
  conversation: ConversationWithDetails;
}

// ========================================
// TYPES POUR LES RÈGLES DE COMMUNICATION
// ========================================

export interface CommunicationRules {
  canPatientMessageMedecin: boolean;
  canPatientMessageAdminCabinet: boolean;
  canMedecinMessagePatient: boolean;
  canMedecinMessageAdminCabinet: boolean;
  canAdminCabinetMessagePatient: boolean;
  canAdminCabinetMessageMedecin: boolean;
  canSuperAdminMessageAnyone: boolean;
}

export interface ConversationPermissions {
  canSendMessage: boolean;
  canAddParticipants: boolean;
  canRemoveParticipants: boolean;
  canDeleteConversation: boolean;
  canModifyMessage: boolean;
  canDeleteMessage: boolean;
}
