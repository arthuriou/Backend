import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken, JWTPayload } from '../utils/jwt.utils';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", // À configurer selon ton frontend
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentification Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token d\'authentification requis'));
        }

        const payload = verifyToken(token);
        socket.data.user = payload;
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user as JWTPayload;
      console.log(`🔌 Utilisateur connecté: ${user.email} (${user.role})`);
      
      // Stocker la connexion utilisateur
      this.connectedUsers.set(user.userId, socket.id);

      // Rejoindre les rooms selon le rôle
      socket.join(`user:${user.userId}`);
      socket.join(`role:${user.role}`);

      // Si c'est un médecin, rejoindre sa room
      if (user.role === 'MEDECIN') {
        socket.join(`medecin:${user.userId}`);
      }

      // Si c'est un patient, rejoindre sa room
      if (user.role === 'PATIENT') {
        socket.join(`patient:${user.userId}`);
      }

      // Si c'est un admin de cabinet, rejoindre la room du cabinet
      if (user.role === 'ADMINCABINET') {
        // TODO: Récupérer l'ID du cabinet depuis la base
        socket.join(`admincabinet:${user.userId}`);
      }

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        console.log(`🔌 Utilisateur déconnecté: ${user.email}`);
        this.connectedUsers.delete(user.userId);
      });

      // Événements personnalisés
      socket.on('join-room', (room: string) => {
        socket.join(room);
        console.log(`📱 ${user.email} a rejoint la room: ${room}`);
      });

      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        console.log(`📱 ${user.email} a quitté la room: ${room}`);
      });
    });
  }

  // ========================================
  // MÉTHODES PUBLIQUES
  // ========================================

  // Notifier un utilisateur spécifique
  notifyUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Notifier tous les utilisateurs d'un rôle
  notifyRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  // Notifier une room spécifique
  notifyRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  // ========================================
  // ÉVÉNEMENTS RENDEZ-VOUS
  // ========================================

  // Nouveau rendez-vous créé
  notifyNewRendezVous(patientId: string, medecinId: string, rendezVous: any) {
    // Notifier le patient
    this.notifyUser(patientId, 'rendezvous:created', {
      type: 'success',
      message: 'Votre rendez-vous a été créé avec succès',
      data: rendezVous
    });

    // Notifier le médecin
    this.notifyUser(medecinId, 'rendezvous:new', {
      type: 'info',
      message: 'Nouveau rendez-vous en attente',
      data: rendezVous
    });
  }

  // Rendez-vous confirmé
  notifyRendezVousConfirmed(patientId: string, medecinId: string, rendezVous: any) {
    // Notifier le patient
    this.notifyUser(patientId, 'rendezvous:confirmed', {
      type: 'success',
      message: 'Votre rendez-vous a été confirmé',
      data: rendezVous
    });

    // Notifier le médecin
    this.notifyUser(medecinId, 'rendezvous:confirmed', {
      type: 'info',
      message: 'Rendez-vous confirmé',
      data: rendezVous
    });
  }

  // Rendez-vous annulé
  notifyRendezVousCancelled(patientId: string, medecinId: string, rendezVous: any) {
    // Notifier le patient
    this.notifyUser(patientId, 'rendezvous:cancelled', {
      type: 'warning',
      message: 'Votre rendez-vous a été annulé',
      data: rendezVous
    });

    // Notifier le médecin
    this.notifyUser(medecinId, 'rendezvous:cancelled', {
      type: 'warning',
      message: 'Rendez-vous annulé',
      data: rendezVous
    });
  }

  // Conflit de créneau
  notifyCreneauConflict(userId: string, creneau: any) {
    this.notifyUser(userId, 'creneau:conflict', {
      type: 'error',
      message: 'Ce créneau n\'est plus disponible',
      data: creneau
    });
  }

  // Nouveau créneau disponible
  notifyNewCreneauAvailable(medecinId: string, creneau: any) {
    this.notifyUser(medecinId, 'creneau:available', {
      type: 'info',
      message: 'Nouveau créneau disponible',
      data: creneau
    });
  }

  // ========================================
  // ÉVÉNEMENTS MESSAGERIE
  // ========================================

  // Nouveau message
  notifyNewMessage(conversationId: string, message: any) {
    this.notifyRoom(`conversation:${conversationId}`, 'new_message', message);
  }

  // Message lu
  notifyMessageRead(conversationId: string, messageId: string, userId: string) {
    this.notifyRoom(`conversation:${conversationId}`, 'message:read', {
      type: 'info',
      message: 'Message lu',
      data: { messageId, userId }
    });
  }

  // Conversation lue (pour le statut "Lu")
  notifyConversationRead(conversationId: string, readerId: string, otherParticipantId: string) {
    this.notifyUser(otherParticipantId, 'conversation_read', {
      conversation_id: conversationId,
      reader_id: readerId
    });
  }

  // ========================================
  // ÉVÉNEMENTS SYSTÈME
  // ========================================

  // Notification générale
  notifyGeneral(userId: string, notification: any) {
    this.notifyUser(userId, 'notification:general', notification);
  }

  // Rappel de rendez-vous
  notifyRappel(userId: string, rappel: any) {
    this.notifyUser(userId, 'rappel:reminder', {
      type: 'info',
      message: 'Rappel de rendez-vous',
      data: rappel
    });
  }

  // ========================================
  // UTILITAIRES
  // ========================================

  // Vérifier si un utilisateur est connecté
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Obtenir la liste des utilisateurs connectés
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Obtenir l'instance Socket.IO
  getIO(): SocketIOServer {
    return this.io;
  }
}
