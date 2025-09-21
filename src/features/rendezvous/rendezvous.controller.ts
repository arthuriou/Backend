import { RendezVousService } from "./rendezvous.service";
import { SocketService } from "../../shared/services/socket.service";
import { Request, Response } from "express";
import { getMissingFields } from "../../shared/utils/validator";
import { RendezVousRepository } from "./rendezvous.repository";

export class RendezVousController {
  private service: RendezVousService;
  private repository: RendezVousRepository;

  constructor(socketService?: SocketService) {
    this.service = new RendezVousService(socketService);
    this.repository = new RendezVousRepository();
  }

  // ========================================
  // RENDEZ-VOUS
  // ========================================

  // Créer un rendez-vous
  async createRendezVous(req: Request, res: Response): Promise<void> {
    const requiredFields = ["patient_id", "medecin_id", "dateheure", "duree", "motif"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const rendezVous = await this.service.createRendezVous(req.body);
      res.status(201).json({
        message: "Rendez-vous créé avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer un rendez-vous par ID
  async getRendezVousById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rdv = await this.service.getRendezVousById(id);
      
      if (!rdv) {
        res.status(404).json({
          message: "Rendez-vous non trouvé",
        });
        return;
      }

      // Garde d'accès: seul le patient, le médecin du RDV, ou un admin cabinet peut consulter
      const role = req.user?.role;
      const userId = req.user?.userId;
      if (!role || !userId) {
        res.status(401).json({ message: "Authentification requise" });
        return;
      }

      if (role === 'PATIENT') {
        const patientId = await this.repository.getPatientIdByUserId(userId);
        if (!patientId || patientId !== rdv.patient_id) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      } else if (role === 'MEDECIN') {
        const medecinId = await this.repository.getMedecinIdByUserId(userId);
        if (!medecinId || medecinId !== rdv.medecin_id) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      } // ADMINCABINET et SUPERADMIN autorisés par défaut

      res.status(200).json({
        message: "Rendez-vous récupéré avec succès",
        data: rdv,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les rendez-vous d'un patient
  async getRendezVousByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;

      // Garde d'accès
      const role = req.user?.role;
      const userId = req.user?.userId;
      if (!role || !userId) {
        res.status(401).json({ message: "Authentification requise" });
        return;
      }

      if (role === 'PATIENT') {
        const selfPatientId = await this.repository.getPatientIdByUserId(userId);
        if (!selfPatientId || selfPatientId !== patientId) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      } else if (role === 'MEDECIN') {
        const medecinId = await this.repository.getMedecinIdByUserId(userId);
        const isRelated = medecinId ? await this.repository.isPatientOfMedecinByEntities(patientId, medecinId) : false;
        if (!isRelated) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      }

      const rendezVous = await this.service.getRendezVousByPatient(patientId);
      
      res.status(200).json({
        message: "Rendez-vous du patient récupérés avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les rendez-vous d'un médecin
  async getRendezVousByMedecin(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.params;

      // Garde d'accès: le médecin ne voit que ses propres RDV (ou admin)
      const role = req.user?.role;
      const userId = req.user?.userId;
      if (!role || !userId) {
        res.status(401).json({ message: "Authentification requise" });
        return;
      }

      if (role === 'MEDECIN') {
        const selfMedecinId = await this.repository.getMedecinIdByUserId(userId);
        if (!selfMedecinId || selfMedecinId !== medecinId) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      }

      const rendezVous = await this.service.getRendezVousByMedecin(medecinId);
      
      res.status(200).json({
        message: "Rendez-vous du médecin récupérés avec succès",
        data: rendezVous,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Modifier un rendez-vous
  async updateRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Garde d'accès: seuls patient ou médecin du RDV peuvent modifier (selon politique). Ici médecin et patient autorisés tant que non terminé/annulé.
      const rdv = await this.service.getRendezVousById(id);
      if (!rdv) {
        res.status(404).json({ message: "Rendez-vous non trouvé" });
        return;
      }

      const role = req.user?.role;
      const userId = req.user?.userId;
      if (!role || !userId) {
        res.status(401).json({ message: "Authentification requise" });
        return;
      }

      if (role === 'PATIENT') {
        const patientId = await this.repository.getPatientIdByUserId(userId);
        if (!patientId || patientId !== rdv.patient_id) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      } else if (role === 'MEDECIN') {
        const medecinId = await this.repository.getMedecinIdByUserId(userId);
        if (!medecinId || medecinId !== rdv.medecin_id) {
          res.status(403).json({ message: "Accès refusé" });
          return;
        }
      }
      
      const updateData = req.body;
      const updatedRDV = await this.service.updateRendezVous(id, updateData);
      
      res.status(200).json({
        message: "Rendez-vous modifié avec succès",
        data: updatedRDV,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Confirmer un rendez-vous
  async confirmerRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Garde d'accès: seul le médecin propriétaire peut confirmer
      const rdv = await this.service.getRendezVousById(id);
      if (!rdv) {
        res.status(404).json({ message: "Rendez-vous non trouvé" });
        return;
      }
      const role = req.user?.role;
      const userId = req.user?.userId;
      if (role !== 'MEDECIN' || !userId) {
        res.status(403).json({ message: "Accès refusé" });
        return;
      }
      const medecinId = await this.repository.getMedecinIdByUserId(userId);
      if (!medecinId || medecinId !== rdv.medecin_id) {
        res.status(403).json({ message: "Accès refusé" });
        return;
      }

      const updatedRDV = await this.service.confirmerRendezVous(id);
      
      res.status(200).json({
        message: "Rendez-vous confirmé avec succès",
        data: updatedRDV,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Annuler un rendez-vous
  async annulerRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Garde d'accès: médecin propriétaire ou patient propriétaire peuvent annuler
      const rdv = await this.service.getRendezVousById(id);
      if (!rdv) {
        res.status(404).json({ message: "Rendez-vous non trouvé" });
        return;
      }
      const role = req.user?.role;
      const userId = req.user?.userId;
      if (!role || !userId) {
        res.status(401).json({ message: "Authentification requise" });
        return;
      }

      let allowed = false;
      if (role === 'MEDECIN') {
        const medecinId = await this.repository.getMedecinIdByUserId(userId);
        allowed = !!medecinId && medecinId === rdv.medecin_id;
      } else if (role === 'PATIENT') {
        const patientId = await this.repository.getPatientIdByUserId(userId);
        allowed = !!patientId && patientId === rdv.patient_id;
      }

      if (!allowed) {
        res.status(403).json({ message: "Accès refusé" });
        return;
      }

      const success = await this.service.annulerRendezVous(id);
      
      if (success) {
        res.status(200).json({ message: "Rendez-vous annulé avec succès" });
      } else {
        res.status(404).json({ message: "Rendez-vous non trouvé" });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Terminer un rendez-vous
  async terminerRendezVous(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Garde d'accès: seul le médecin propriétaire peut terminer
      const rdv = await this.service.getRendezVousById(id);
      if (!rdv) {
        res.status(404).json({ message: "Rendez-vous non trouvé" });
        return;
      }
      const role = req.user?.role;
      const userId = req.user?.userId;
      if (role !== 'MEDECIN' || !userId) {
        res.status(403).json({ message: "Accès refusé" });
        return;
      }
      const medecinId = await this.repository.getMedecinIdByUserId(userId);
      if (!medecinId || medecinId !== rdv.medecin_id) {
        res.status(403).json({ message: "Accès refusé" });
        return;
      }

      const updatedRDV = await this.service.terminerRendezVous(id);
      
      res.status(200).json({
        message: "Rendez-vous terminé avec succès",
        data: updatedRDV,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // CRÉNEAUX
  // ========================================

  // Créer un créneau
  async createCreneau(req: Request, res: Response): Promise<void> {
    const requiredFields = ["agenda_id", "debut", "fin"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const creneau = await this.service.createCreneau(req.body);
      res.status(201).json({
        message: "Créneau créé avec succès",
        data: creneau,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les créneaux disponibles d'un médecin
  async getCreneauxDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.params;
      const { dateDebut, dateFin } = req.query;
      
      if (!dateDebut || !dateFin) {
        res.status(400).json({
          message: "Les paramètres dateDebut et dateFin sont requis",
        });
        return;
      }

      const creneaux = await this.service.getCreneauxDisponibles(
        medecinId, 
        dateDebut as string, 
        dateFin as string
      );
      
      res.status(200).json({
        message: "Créneaux disponibles récupérés avec succès",
        data: creneaux,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // AGENDAS
  // ========================================

  // Créer un agenda
  async createAgenda(req: Request, res: Response): Promise<void> {
    const requiredFields = ["medecin_id", "libelle"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const agenda = await this.service.createAgenda(req.body);
      res.status(201).json({
        message: "Agenda créé avec succès",
        data: agenda,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les agendas d'un médecin
  async getAgendasByMedecin(req: Request, res: Response): Promise<void> {
    try {
      const { medecinId } = req.params;
      const agendas = await this.service.getAgendasByMedecin(medecinId);
      
      res.status(200).json({
        message: "Agendas du médecin récupérés avec succès",
        data: agendas,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // RAPPELS
  // ========================================

  // Traiter les rappels à envoyer
  async traiterRappels(req: Request, res: Response): Promise<void> {
    try {
      const rappels = await this.service.traiterRappels();
      
      res.status(200).json({
        message: "Rappels traités avec succès",
        data: rappels,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Créer un rappel personnalisé
  async createRappel(req: Request, res: Response): Promise<void> {
    const requiredFields = ["rendezvousId", "dateEnvoi", "canal"];
    const missingFields = getMissingFields(req.body, requiredFields);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Champ(s) manquant(s)",
        missingFields,
      });
      return;
    }

    try {
      const { rendezvousId, dateEnvoi, canal } = req.body;
      const rappel = await this.service.createRappel(rendezvousId, dateEnvoi, canal);
      
      res.status(201).json({
        message: "Rappel créé avec succès",
        data: rappel,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // TÉLÉCONSULTATION
  // ========================================

  // Récupérer les informations de téléconsultation
  async getTeleconsultationInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const teleconsultationInfo = await this.service.getTeleconsultationInfo(id);
      
      if (!teleconsultationInfo) {
        res.status(404).json({ message: "Informations de téléconsultation non trouvées" });
        return;
      }

      res.json({
        message: "Informations de téléconsultation récupérées",
        data: teleconsultationInfo
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Commencer une consultation
  async commencerConsultation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const success = await this.service.commencerConsultation(id, userId);
      
      if (success) {
        res.json({
          message: "Consultation démarrée avec succès",
          data: { rendezvous_id: id, statut: 'EN_COURS' }
        });
      } else {
        res.status(400).json({ message: "Impossible de démarrer la consultation" });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Clôturer une consultation
  async cloturerConsultation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const success = await this.service.cloturerConsultation(id, userId);
      
      if (success) {
        res.json({
          message: "Consultation clôturée avec succès",
          data: { rendezvous_id: id, statut: 'TERMINE' }
        });
      } else {
        res.status(400).json({ message: "Impossible de clôturer la consultation" });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Marquer un patient comme arrivé (présentiel)
  async marquerPatientArrive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const success = await this.service.marquerPatientArrive(id, userId);
      
      if (success) {
        res.json({
          message: "Patient marqué comme arrivé",
          data: { rendezvous_id: id, statut: 'EN_ATTENTE_CONSULTATION' }
        });
      } else {
        res.status(400).json({ message: "Impossible de marquer le patient comme arrivé" });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // ========================================
  // WORKFLOW PRÉSENTIEL - NOUVEAUX ENDPOINTS
  // ========================================

  // Récupérer les RDV en attente de consultation (médecin)
  async getRendezVousEnAttenteConsultation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Non authentifié" });
        return;
      }

      const medecinId = await this.repository.getMedecinIdByUserId(userId);
      if (!medecinId) {
        res.status(403).json({ message: "Accès refusé - Médecin requis" });
        return;
      }

      const rdvs = await this.service.getRendezVousEnAttenteConsultation(medecinId);
      
      res.status(200).json({
        message: "RDV en attente de consultation récupérés avec succès",
        data: rdvs
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les RDV en cours (médecin)
  async getRendezVousEnCours(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Non authentifié" });
        return;
      }

      const medecinId = await this.repository.getMedecinIdByUserId(userId);
      if (!medecinId) {
        res.status(403).json({ message: "Accès refusé - Médecin requis" });
        return;
      }

      const rdvs = await this.service.getRendezVousEnCours(medecinId);
      
      res.status(200).json({
        message: "RDV en cours récupérés avec succès",
        data: rdvs
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les RDV d'aujourd'hui (médecin)
  async getRendezVousAujourdhui(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Non authentifié" });
        return;
      }

      const medecinId = await this.repository.getMedecinIdByUserId(userId);
      if (!medecinId) {
        res.status(403).json({ message: "Accès refusé - Médecin requis" });
        return;
      }

      const rdvs = await this.service.getRendezVousAujourdhui(medecinId);
      
      res.status(200).json({
        message: "RDV d'aujourd'hui récupérés avec succès",
        data: rdvs
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }

  // Récupérer les RDV de la semaine (médecin)
  async getRendezVousCetteSemaine(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Non authentifié" });
        return;
      }

      const medecinId = await this.repository.getMedecinIdByUserId(userId);
      if (!medecinId) {
        res.status(403).json({ message: "Accès refusé - Médecin requis" });
        return;
      }

      const rdvs = await this.service.getRendezVousCetteSemaine(medecinId);
      
      res.status(200).json({
        message: "RDV de la semaine récupérés avec succès",
        data: rdvs
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erreur Serveur",
      });
    }
  }
}
