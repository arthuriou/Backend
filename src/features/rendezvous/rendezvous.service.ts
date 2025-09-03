import { RendezVousRepository } from "./rendezvous.repository";
import { SocketService } from "../../shared/services/socket.service";
import { 
  RendezVous, 
  Creneau, 
  Agenda, 
  Rappel,
  CreateRendezVousRequest, 
  UpdateRendezVousRequest,
  CreateCreneauRequest,
  CreateAgendaRequest,
  RendezVousWithDetails,
  CreneauWithDetails,
  AgendaWithDetails
} from "./rendezvous.model";

export class RendezVousService {
  private repository: RendezVousRepository;
  private socketService: SocketService;

  constructor(socketService?: SocketService) {
    this.repository = new RendezVousRepository();
    this.socketService = socketService!;
  }

  // ========================================
  // RENDEZ-VOUS
  // ========================================

  // Créer un rendez-vous
  async createRendezVous(data: CreateRendezVousRequest): Promise<RendezVous> {
    const { patient_id, medecin_id, dateHeure, duree, motif, creneau_id } = data;

    // Validation des champs requis
    if (!patient_id || !medecin_id || !dateHeure || !duree || !motif) {
      throw new Error("Tous les champs requis doivent être fournis");
    }

    // Vérifier que la date est dans le futur
    const dateRDV = new Date(dateHeure);
    if (dateRDV <= new Date()) {
      throw new Error("La date du rendez-vous doit être dans le futur");
    }

    // Vérifier que la durée est positive
    if (duree <= 0) {
      throw new Error("La durée doit être positive");
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
      dateHeure: dateRDV,
      duree,
      motif,
      statut: 'EN_ATTENTE'
    });

    // Créer un rappel automatique (24h avant)
    const dateRappel = new Date(dateRDV);
    dateRappel.setHours(dateRappel.getHours() - 24);
    
    if (dateRappel > new Date()) {
      await this.repository.createRappel({
        rendezvous_id: rendezVous.idRendezVous,
        dateEnvoi: dateRappel,
        canal: 'EMAIL'
      });
    }

    // Notifications temps réel
    if (this.socketService) {
      this.socketService.notifyNewRendezVous(patient_id, medecin_id, rendezVous);
    }

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

    if (updateData.dateHeure) {
      const newDate = new Date(updateData.dateHeure);
      if (newDate <= new Date()) {
        throw new Error("La nouvelle date doit être dans le futur");
      }
      updateDataFormatted.dateHeure = newDate;
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
  async createAgenda(data: CreateAgendaRequest): Promise<Agenda> {
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
      await this.repository.marquerRappelEnvoye(rappel.idRappel);
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
}
