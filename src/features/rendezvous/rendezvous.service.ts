import { RendezVousRepository } from "./rendezvous.repository";
import { SocketService } from "../../shared/services/socket.service";
import { PushService } from "../../shared/services/push.service";
import { TeleconsultationService } from "../../shared/services/teleconsultation.service";
import { AgendaService } from "../agenda/agenda.service";
import {
  RendezVous,
  Creneau,
  OldAgenda,
  Rappel,
  CreateRendezVousRequest,
  UpdateRendezVousRequest,
  CreateCreneauRequest,
  CreateAgendaRequest,
  RendezVousWithDetails,
  CreneauWithDetails,
  AgendaWithDetails,
  CreateTeleconsultationRequest,
  TeleconsultationInfo
} from "./rendezvous.model";

export class RendezVousService {
  private repository: RendezVousRepository;
  private socketService: SocketService;
  private pushService: PushService = new PushService();
  private teleconsultationService: TeleconsultationService = new TeleconsultationService();

  constructor(socketService?: SocketService) {
    this.repository = new RendezVousRepository();
    this.socketService = socketService!;
  }

  // ========================================
  // RENDEZ-VOUS
  // ========================================

  // Créer un rendez-vous
  async createRendezVous(data: CreateRendezVousRequest): Promise<RendezVous> {
    const { patient_id, medecin_id, dateheure, duree, motif, creneau_id, type_rdv, adresse_cabinet, agenda_id, slot_start_at, slot_end_at } = data;

    let finalDateheure = dateheure;
    let finalDuree = duree;
    let dateRDV: Date;

    // Validation pour le nouveau système d'agenda
    if (agenda_id && slot_start_at && slot_end_at) {
      // Vérifier que la slot est disponible
      await this.validateSlotBooking(agenda_id, slot_start_at, slot_end_at, type_rdv);

      // Utiliser les horaires du slot
      const startDate = new Date(slot_start_at);
      const endDate = new Date(slot_end_at);
      finalDuree = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // durée en minutes
      finalDateheure = slot_start_at;
      dateRDV = startDate;
    } else {
      // Ancien système ou manuel
      // Validation des champs requis
      if (!patient_id || !medecin_id || !dateheure || !duree || !motif) {
        throw new Error("Tous les champs requis doivent être fournis");
      }

      // Vérifier que la date est dans le futur
      dateRDV = new Date(dateheure);
      if (dateRDV <= new Date()) {
        throw new Error("La date du rendez-vous doit être dans le futur");
      }

      // Vérifier que la durée est positive
      if (duree <= 0) {
        throw new Error("La durée doit être positive");
      }
    }

    // Validation spécifique selon le type
    if (type_rdv === 'PRESENTIEL' && !adresse_cabinet) {
      throw new Error("L'adresse du cabinet est requise pour un RDV présentiel");
    }

    // Si un créneau est spécifié, vérifier qu'il est disponible
    if (creneau_id) {
      const isCreneauAvailable = await this.verifierDisponibiliteCreneau(creneau_id);
      if (!isCreneauAvailable) {
        throw new Error("Ce créneau n'est plus disponible");
      }
    }

    const rendezVous = await this.repository.createRendezVous({
      patient_id,
      medecin_id,
      creneau_id,
      dateheure: dateRDV || new Date(finalDateheure),
      duree: finalDuree,
      motif,
      statut: 'EN_ATTENTE',
      type_rdv: type_rdv || 'PRESENTIEL',
      adresse_cabinet
    });

    // Si c'est une téléconsultation, créer la salle virtuelle
    if (type_rdv === 'TELECONSULTATION') {
      await this.createTeleconsultationRoom(rendezVous.idrendezvous);
    }

    // Créer un rappel automatique (24h avant)
    const dateRappel = new Date(dateRDV);
    dateRappel.setHours(dateRappel.getHours() - 24);
    
    if (dateRappel > new Date()) {
      await this.repository.createRappel({
        rendezvous_id: rendezVous.idrendezvous,
        dateEnvoi: dateRappel,
        canal: 'EMAIL'
      });
    }

    // Rappel spécifique pour téléconsultation (10 min avant)
    if (type_rdv === 'TELECONSULTATION') {
      const dateRappel10min = new Date(dateRDV);
      dateRappel10min.setMinutes(dateRappel10min.getMinutes() - 10);
      
      if (dateRappel10min > new Date()) {
        await this.repository.createRappel({
          rendezvous_id: rendezVous.idrendezvous,
          dateEnvoi: dateRappel10min,
          canal: 'PUSH'
        });
      }
    }

    // Notifications temps réel
    if (this.socketService) {
      this.socketService.notifyNewRendezVous(patient_id, medecin_id, rendezVous);
    }

    // Push: notifier patient et médecin s'ils l'ont activé
    const notificationTitle = type_rdv === 'TELECONSULTATION' ? 'Nouvelle téléconsultation' : 'Nouveau rendez-vous';
    this.pushService.sendToUser(patient_id, {
      title: notificationTitle,
      body: motif || 'Vous avez un nouveau rendez-vous',
      data: { 
        rendezvous_id: rendezVous.idrendezvous,
        type_rdv: type_rdv || 'PRESENTIEL'
      }
    });
    this.pushService.sendToUser(medecin_id, {
      title: notificationTitle,
      body: motif || 'Vous avez un nouveau rendez-vous',
      data: { 
        rendezvous_id: rendezVous.idrendezvous,
        type_rdv: type_rdv || 'PRESENTIEL'
      }
    });

    return rendezVous;
  }

  // Récupérer un rendez-vous par ID
  async getRendezVousById(id: string): Promise<RendezVousWithDetails | null> {
    if (!id) {
      throw new Error("ID du rendez-vous requis");
    }
    return await this.repository.getRendezVousById(id);
  }

  // Récupérer les rendez-vous d'un patient
  async getRendezVousByPatient(patientId: string): Promise<RendezVousWithDetails[]> {
    if (!patientId) {
      throw new Error("ID du patient requis");
    }
    return await this.repository.getRendezVousByPatient(patientId);
  }

  // Récupérer les rendez-vous d'un médecin
  async getRendezVousByMedecin(medecinId: string): Promise<RendezVousWithDetails[]> {
    if (!medecinId) {
      throw new Error("ID du médecin requis");
    }
    return await this.repository.getRendezVousByMedecin(medecinId);
  }

  // Modifier un rendez-vous
  async updateRendezVous(id: string, updateData: UpdateRendezVousRequest): Promise<RendezVous> {
    if (!id) {
      throw new Error("ID du rendez-vous requis");
    }

    // Vérifier que le rendez-vous existe
    const existingRDV = await this.repository.getRendezVousById(id);
    if (!existingRDV) {
      throw new Error("Rendez-vous non trouvé");
    }

    // Vérifier que le rendez-vous n'est pas terminé ou annulé
    if (existingRDV.statut === 'TERMINE' || existingRDV.statut === 'ANNULE') {
      throw new Error("Impossible de modifier un rendez-vous terminé ou annulé");
    }

    // Préparer les données de mise à jour
    const updateDataFormatted: Partial<RendezVous> = {};

    if (updateData.dateheure) {
      const newDate = new Date(updateData.dateheure);
      if (newDate <= new Date()) {
        throw new Error("La nouvelle date doit être dans le futur");
      }
      updateDataFormatted.dateheure = newDate;
    }

    if (updateData.duree !== undefined) {
      updateDataFormatted.duree = updateData.duree;
    }

    if (updateData.motif) {
      updateDataFormatted.motif = updateData.motif;
    }

    if (updateData.statut) {
      updateDataFormatted.statut = updateData.statut;
    }

    return await this.repository.updateRendezVous(id, updateDataFormatted);
  }

  // Confirmer un rendez-vous
  async confirmerRendezVous(id: string): Promise<RendezVous> {
    if (!id) {
      throw new Error("ID du rendez-vous requis");
    }

    const existingRDV = await this.repository.getRendezVousById(id);
    if (!existingRDV) {
      throw new Error("Rendez-vous non trouvé");
    }

    if (existingRDV.statut !== 'EN_ATTENTE') {
      throw new Error("Seuls les rendez-vous en attente peuvent être confirmés");
    }

    const updatedRDV = await this.repository.updateRendezVous(id, { statut: 'CONFIRME' });

    // Notifications temps réel
    if (this.socketService) {
      this.socketService.notifyRendezVousConfirmed(
        existingRDV.patient_id, 
        existingRDV.medecin_id, 
        updatedRDV
      );
    }

    this.pushService.sendToUser(existingRDV.patient_id, {
      title: 'Rendez-vous confirmé',
      body: existingRDV.motif || 'Votre rendez-vous a été confirmé',
      data: { rendezvous_id: updatedRDV.idrendezvous }
    });
    this.pushService.sendToUser(existingRDV.medecin_id, {
      title: 'Rendez-vous confirmé',
      body: existingRDV.motif || 'Un rendez-vous a été confirmé',
      data: { rendezvous_id: updatedRDV.idrendezvous }
    });

    return updatedRDV;
  }

  // Annuler un rendez-vous
  async annulerRendezVous(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("ID du rendez-vous requis");
    }

    const existingRDV = await this.repository.getRendezVousById(id);
    if (!existingRDV) {
      throw new Error("Rendez-vous non trouvé");
    }

    if (existingRDV.statut === 'TERMINE') {
      throw new Error("Impossible d'annuler un rendez-vous terminé");
    }

    const success = await this.repository.annulerRendezVous(id);

    // Notifications temps réel
    if (this.socketService && success) {
      this.socketService.notifyRendezVousCancelled(
        existingRDV.patient_id, 
        existingRDV.medecin_id, 
        existingRDV
      );
    }

    if (success) {
      this.pushService.sendToUser(existingRDV.patient_id, {
        title: 'Rendez-vous annulé',
        body: existingRDV.motif || 'Votre rendez-vous a été annulé',
        data: { rendezvous_id: existingRDV.idrendezvous }
      });
      this.pushService.sendToUser(existingRDV.medecin_id, {
        title: 'Rendez-vous annulé',
        body: existingRDV.motif || 'Un rendez-vous a été annulé',
        data: { rendezvous_id: existingRDV.idrendezvous }
      });
    }

    return success;
  }

  // Marquer un rendez-vous comme terminé
  async terminerRendezVous(id: string): Promise<RendezVous> {
    if (!id) {
      throw new Error("ID du rendez-vous requis");
    }

    const existingRDV = await this.repository.getRendezVousById(id);
    if (!existingRDV) {
      throw new Error("Rendez-vous non trouvé");
    }

    if (existingRDV.statut !== 'CONFIRME' && existingRDV.statut !== 'EN_COURS') {
      throw new Error("Seuls les rendez-vous confirmés ou en cours peuvent être terminés");
    }

    return await this.repository.updateRendezVous(id, { statut: 'TERMINE' });
  }

  // ========================================
  // CRÉNEAUX
  // ========================================

  // Créer un créneau
  async createCreneau(data: CreateCreneauRequest): Promise<Creneau> {
    const { agenda_id, debut, fin, disponible } = data;

    if (!agenda_id || !debut || !fin) {
      throw new Error("Tous les champs requis doivent être fournis");
    }

    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    if (dateDebut >= dateFin) {
      throw new Error("La date de début doit être antérieure à la date de fin");
    }

    if (dateDebut <= new Date()) {
      throw new Error("Le créneau doit être dans le futur");
    }

    return await this.repository.createCreneau({
      agenda_id,
      debut: dateDebut,
      fin: dateFin,
      disponible: disponible ?? true
    });
  }

  // Récupérer les créneaux disponibles d'un médecin
  async getCreneauxDisponibles(
    medecinId: string, 
    dateDebut: string, 
    dateFin: string
  ): Promise<CreneauWithDetails[]> {
    if (!medecinId || !dateDebut || !dateFin) {
      throw new Error("Tous les paramètres sont requis");
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (debut >= fin) {
      throw new Error("La date de début doit être antérieure à la date de fin");
    }

    return await this.repository.getCreneauxDisponibles(medecinId, debut, fin);
  }

  // ========================================
  // AGENDAS
  // ========================================

  // Créer un agenda
  async createAgenda(data: CreateAgendaRequest): Promise<OldAgenda> {
    const { medecin_id, libelle } = data;

    if (!medecin_id || !libelle) {
      throw new Error("Tous les champs requis doivent être fournis");
    }

    return await this.repository.createAgenda({ medecin_id, libelle });
  }

  // Récupérer les agendas d'un médecin
  async getAgendasByMedecin(medecinId: string): Promise<AgendaWithDetails[]> {
    if (!medecinId) {
      throw new Error("ID du médecin requis");
    }
    return await this.repository.getAgendasByMedecin(medecinId);
  }

  // ========================================
  // RAPPELS
  // ========================================

  // Traiter les rappels à envoyer
  async traiterRappels(): Promise<Rappel[]> {
    const rappels = await this.repository.getRappelsAEnvoyer();
    
    // TODO: Intégrer avec le service d'envoi d'emails/SMS
    // Pour l'instant, on marque juste comme envoyés
    for (const rappel of rappels) {
      await this.repository.marquerRappelEnvoye(rappel.idrappel);
    }

    return rappels;
  }

  // Créer un rappel personnalisé
  async createRappel(
    rendezvousId: string, 
    dateEnvoi: string, 
    canal: 'SMS' | 'EMAIL' | 'PUSH'
  ): Promise<Rappel> {
    if (!rendezvousId || !dateEnvoi || !canal) {
      throw new Error("Tous les paramètres sont requis");
    }

    const date = new Date(dateEnvoi);
    if (date <= new Date()) {
      throw new Error("La date d'envoi doit être dans le futur");
    }

    return await this.repository.createRappel({
      rendezvous_id: rendezvousId,
      dateEnvoi: date,
      canal
    });
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  // Vérifier la disponibilité d'un créneau
  async verifierDisponibiliteCreneau(creneauId: string): Promise<boolean> {
    return await this.repository.verifierDisponibiliteCreneau(creneauId);
  }

  // Vérifier les conflits de créneaux en temps réel
  async verifierConflitsCreneaux(creneauId: string, userId: string): Promise<void> {
    const isAvailable = await this.verifierDisponibiliteCreneau(creneauId);
    
    if (!isAvailable && this.socketService) {
      // Notifier l'utilisateur du conflit
      this.socketService.notifyCreneauConflict(userId, { creneauId });
    }
  }

  // ========================================
  // TÉLÉCONSULTATION
  // ========================================

  // Créer une salle de téléconsultation
  async createTeleconsultationRoom(rendezvous_id: string): Promise<TeleconsultationInfo> {
    const teleconsultationInfo = await this.teleconsultationService.createTeleconsultationRoom({
      rendezvous_id,
      duree_minutes: 60 // Durée par défaut
    });

    // Sauvegarder les informations en base
    await this.repository.updateTeleconsultationInfo(
      rendezvous_id,
      teleconsultationInfo.salle_virtuelle,
      teleconsultationInfo.lien_video,
      teleconsultationInfo.token_acces
    );

    return teleconsultationInfo;
  }

  // Récupérer les informations de téléconsultation
  async getTeleconsultationInfo(rendezvous_id: string): Promise<TeleconsultationInfo | null> {
    const info = await this.repository.getTeleconsultationInfo(rendezvous_id);
    if (!info) return null;

    return {
      salle_virtuelle: info.salle_virtuelle,
      lien_video: info.lien_video,
      token_acces: info.token_acces,
      date_expiration: new Date(Date.now() + 60 * 60 * 1000) // 1 heure par défaut
    };
  }

  // Commencer une consultation (présentiel ou téléconsultation)
  async commencerConsultation(rendezvous_id: string, user_id: string): Promise<boolean> {
    const rdv = await this.repository.getRendezVousById(rendezvous_id);
    if (!rdv) {
      throw new Error("Rendez-vous non trouvé");
    }

    // Vérifier que l'utilisateur a le droit de commencer cette consultation
    if (rdv.medecin.idmedecin !== user_id && rdv.patient.idpatient !== user_id) {
      throw new Error("Vous n'avez pas le droit de commencer cette consultation");
    }

    // Vérifier que le RDV est confirmé
    if (rdv.statut !== 'CONFIRME') {
      throw new Error("Le rendez-vous doit être confirmé pour commencer la consultation");
    }

    // Mettre à jour le statut
    const success = await this.repository.updateRendezVousStatut(rendezvous_id, 'EN_COURS');
    
    if (success && this.socketService) {
      // Notifier les participants
      this.socketService.notifyUser(rdv.patient.idpatient, 'consultation:started', {
        rendezvous_id,
        type: rdv.type_rdv || 'PRESENTIEL'
      });
      this.socketService.notifyUser(rdv.medecin.idmedecin, 'consultation:started', {
        rendezvous_id,
        type: rdv.type_rdv || 'PRESENTIEL'
      });
    }

    return success;
  }

  // Clôturer une consultation
  async cloturerConsultation(rendezvous_id: string, user_id: string): Promise<boolean> {
    const rdv = await this.repository.getRendezVousById(rendezvous_id);
    if (!rdv) {
      throw new Error("Rendez-vous non trouvé");
    }

    // Vérifier que l'utilisateur a le droit de clôturer cette consultation
    if (rdv.medecin.idmedecin !== user_id) {
      throw new Error("Seul le médecin peut clôturer la consultation");
    }

    // Vérifier que la consultation est en cours
    if (rdv.statut !== 'EN_COURS') {
      throw new Error("La consultation doit être en cours pour être clôturée");
    }

    // Mettre à jour le statut
    const success = await this.repository.updateRendezVousStatut(rendezvous_id, 'TERMINE');
    
    if (success && this.socketService) {
      // Notifier les participants
      this.socketService.notifyUser(rdv.patient.idpatient, 'consultation:ended', {
        rendezvous_id,
        type: rdv.type_rdv || 'PRESENTIEL'
      });
      this.socketService.notifyUser(rdv.medecin.idmedecin, 'consultation:ended', {
        rendezvous_id,
        type: rdv.type_rdv || 'PRESENTIEL'
      });
    }

    return success;
  }

  // Marquer un patient comme arrivé (pour présentiel)
  async marquerPatientArrive(rendezvous_id: string, user_id: string): Promise<boolean> {
    const rdv = await this.repository.getRendezVousById(rendezvous_id);
    if (!rdv) {
      throw new Error("Rendez-vous non trouvé");
    }

    // Vérifier que l'utilisateur a le droit (médecin ou admin)
    if (rdv.medecin.idmedecin !== user_id) {
      throw new Error("Seul le médecin peut marquer le patient comme arrivé");
    }

    // Vérifier que c'est un RDV présentiel
    if (rdv.type_rdv !== 'PRESENTIEL') {
      throw new Error("Cette fonction est uniquement pour les RDV présentiels");
    }

    // Vérifier que le RDV est confirmé
    if (rdv.statut !== 'CONFIRME') {
      throw new Error("Le rendez-vous doit être confirmé");
    }

    // Mettre à jour le statut
    const success = await this.repository.updateRendezVousStatut(rendezvous_id, 'EN_ATTENTE_CONSULTATION');
    
    if (success && this.socketService) {
      // Notifier le patient
      this.socketService.notifyUser(rdv.patient.idpatient, 'patient:arrived', {
        rendezvous_id
      });
    }

    return success;
  }

  // Récupérer les RDV en attente de consultation (pour le médecin)
  async getRendezVousEnAttenteConsultation(medecin_id: string): Promise<RendezVous[]> {
    return await this.repository.getRendezVousByMedecinAndStatut(medecin_id, 'EN_ATTENTE_CONSULTATION');
  }

  // Récupérer les RDV en cours (pour le médecin)
  async getRendezVousEnCours(medecin_id: string): Promise<RendezVous[]> {
    return await this.repository.getRendezVousByMedecinAndStatut(medecin_id, 'EN_COURS');
  }

  // Récupérer les RDV d'aujourd'hui pour un médecin
  async getRendezVousAujourdhui(medecin_id: string): Promise<RendezVous[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.repository.getRendezVousByMedecinAndDateRange(
      medecin_id, 
      today, 
      tomorrow
    );
  }

  // Récupérer les RDV de la semaine pour un médecin
  async getRendezVousCetteSemaine(medecin_id: string): Promise<RendezVous[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return await this.repository.getRendezVousByMedecinAndDateRange(
      medecin_id,
      startOfWeek,
      endOfWeek
    );
  }

  // Valider la réservation d'une slot d'agenda
  async validateSlotBooking(agendaId: string, slotStartAt: string, slotEndAt: string, type?: string): Promise<void> {
    const agendaService = new AgendaService();

    // Récupérer la période (par exemple 1 jour autour de la date)
    const slotDate = new Date(slotStartAt);
    const periodStart = new Date(slotDate);
    periodStart.setDate(slotDate.getDate() - 1); // 1 jour avant

    const periodEnd = new Date(slotDate);
    periodEnd.setDate(slotDate.getDate() + 2); // 1 jour après pour couvrir

    // Obtenir les slots disponibles
    const availableSlots = await agendaService.getComputedSlots(agendaId, periodStart.toISOString(), periodEnd.toISOString(), type as any);

    // Vérifier si la slot demandée est dans les disponibles
    const requestedSlot = {
      start_at: slotStartAt,
      end_at: slotEndAt,
      type: type || 'PRESENTIEL'
    };

    const isAvailable = availableSlots.some(slot =>
      slot.start_at === slotStartAt &&
      slot.end_at === slotEndAt &&
      slot.type === requestedSlot.type
    );

    if (!isAvailable) {
      throw new Error("Ce créneau n'est plus disponible");
    }
  }
}
