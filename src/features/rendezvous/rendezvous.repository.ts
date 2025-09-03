import { RendezVous, Creneau, Agenda, Rappel, RendezVousWithDetails, CreneauWithDetails, AgendaWithDetails } from "./rendezvous.model";
import db from "../../utils/database";

export class RendezVousRepository {
  
  // ========================================
  // RENDEZ-VOUS
  // ========================================

  // Créer un rendez-vous
  async createRendezVous(data: {
    patient_id: string;
    medecin_id: string;
    creneau_id?: string;
    dateHeure: Date;
    duree: number;
    motif: string;
    statut: string;
  }): Promise<RendezVous> {
    const query = `
      INSERT INTO rendezvous (patient_id, medecin_id, creneau_id, dateHeure, duree, motif, statut)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [data.patient_id, data.medecin_id, data.creneau_id, data.dateHeure, data.duree, data.motif, data.statut];
    const result = await db.query<RendezVous>(query, values);
    return result.rows[0];
  }

  // Récupérer un rendez-vous par ID
  async getRendezVousById(id: string): Promise<RendezVousWithDetails | null> {
    const query = `
      SELECT 
        rv.*,
        p.idPatient, u1.nom as patient_nom, u1.prenom as patient_prenom, u1.telephone as patient_telephone, u1.email as patient_email,
        m.idMedecin, u2.nom as medecin_nom, u2.prenom as medecin_prenom,
        c.idCreneau, c.debut, c.fin, c.disponible,
        a.idAgenda, a.libelle as agenda_libelle
      FROM rendezvous rv
      JOIN patient p ON rv.patient_id = p.idPatient
      JOIN utilisateur u1 ON p.utilisateur_id = u1.idUtilisateur
      JOIN medecin m ON rv.medecin_id = m.idMedecin
      JOIN utilisateur u2 ON m.utilisateur_id = u2.idUtilisateur
      LEFT JOIN creneau c ON rv.creneau_id = c.idCreneau
      LEFT JOIN agenda a ON c.agenda_id = a.idAgenda
      WHERE rv.idRendezVous = $1
    `;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      idRendezVous: row.idrendezvous,
      patient_id: row.patient_id,
      medecin_id: row.medecin_id,
      creneau_id: row.creneau_id,
      dateHeure: row.dateheure,
      duree: row.duree,
      motif: row.motif,
      statut: row.statut,
      dateCreation: row.datecreation,
      dateModification: row.datemodification,
      patient: {
        idPatient: row.idpatient,
        nom: row.patient_nom,
        prenom: row.patient_prenom,
        telephone: row.patient_telephone,
        email: row.patient_email
      },
      medecin: {
        idMedecin: row.idmedecin,
        nom: row.medecin_nom,
        prenom: row.medecin_prenom,
        specialites: [] // TODO: Ajouter les spécialités
      },
      creneau: row.idcreneau ? {
        idCreneau: row.idcreneau,
        agenda_id: row.idagenda,
        debut: row.debut,
        fin: row.fin,
        disponible: row.disponible
      } : undefined
    };
  }

  // Récupérer les rendez-vous d'un patient
  async getRendezVousByPatient(patientId: string): Promise<RendezVousWithDetails[]> {
    const query = `
      SELECT 
        rv.*,
        p.idPatient, u1.nom as patient_nom, u1.prenom as patient_prenom, u1.telephone as patient_telephone, u1.email as patient_email,
        m.idMedecin, u2.nom as medecin_nom, u2.prenom as medecin_prenom,
        c.idCreneau, c.debut, c.fin, c.disponible,
        a.idAgenda, a.libelle as agenda_libelle
      FROM rendezvous rv
      JOIN patient p ON rv.patient_id = p.idPatient
      JOIN utilisateur u1 ON p.utilisateur_id = u1.idUtilisateur
      JOIN medecin m ON rv.medecin_id = m.idMedecin
      JOIN utilisateur u2 ON m.utilisateur_id = u2.idUtilisateur
      LEFT JOIN creneau c ON rv.creneau_id = c.idCreneau
      LEFT JOIN agenda a ON c.agenda_id = a.idAgenda
      WHERE rv.patient_id = $1
      ORDER BY rv.dateHeure DESC
    `;
    const result = await db.query(query, [patientId]);
    return this.mapRendezVousWithDetails(result.rows);
  }

  // Récupérer les rendez-vous d'un médecin
  async getRendezVousByMedecin(medecinId: string): Promise<RendezVousWithDetails[]> {
    const query = `
      SELECT 
        rv.*,
        p.idPatient, u1.nom as patient_nom, u1.prenom as patient_prenom, u1.telephone as patient_telephone, u1.email as patient_email,
        m.idMedecin, u2.nom as medecin_nom, u2.prenom as medecin_prenom,
        c.idCreneau, c.debut, c.fin, c.disponible,
        a.idAgenda, a.libelle as agenda_libelle
      FROM rendezvous rv
      JOIN patient p ON rv.patient_id = p.idPatient
      JOIN utilisateur u1 ON p.utilisateur_id = u1.idUtilisateur
      JOIN medecin m ON rv.medecin_id = m.idMedecin
      JOIN utilisateur u2 ON m.utilisateur_id = u2.idUtilisateur
      LEFT JOIN creneau c ON rv.creneau_id = c.idCreneau
      LEFT JOIN agenda a ON c.agenda_id = a.idAgenda
      WHERE rv.medecin_id = $1
      ORDER BY rv.dateHeure ASC
    `;
    const result = await db.query(query, [medecinId]);
    return this.mapRendezVousWithDetails(result.rows);
  }

  // Modifier un rendez-vous
  async updateRendezVous(id: string, updateData: Partial<RendezVous>): Promise<RendezVous> {
    const allowedFields = ['dateHeure', 'duree', 'motif', 'statut', 'creneau_id'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => 
      allowedFields.includes(field) && updateData[field as keyof RendezVous] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fieldsToUpdate.map(field => updateData[field as keyof RendezVous])];

    const query = `UPDATE rendezvous SET ${setClause} WHERE idRendezVous = $1 RETURNING *`;
    const result = await db.query<RendezVous>(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Rendez-vous non trouvé');
    }

    return result.rows[0];
  }

  // Annuler un rendez-vous
  async annulerRendezVous(id: string): Promise<boolean> {
    const query = `UPDATE rendezvous SET statut = 'ANNULE' WHERE idRendezVous = $1`;
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // ========================================
  // CRÉNEAUX
  // ========================================

  // Créer un créneau
  async createCreneau(data: {
    agenda_id: string;
    debut: Date;
    fin: Date;
    disponible?: boolean;
  }): Promise<Creneau> {
    const query = `
      INSERT INTO creneau (agenda_id, debut, fin, disponible)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [data.agenda_id, data.debut, data.fin, data.disponible ?? true];
    const result = await db.query<Creneau>(query, values);
    return result.rows[0];
  }

  // Récupérer les créneaux disponibles d'un médecin
  async getCreneauxDisponibles(medecinId: string, dateDebut: Date, dateFin: Date): Promise<CreneauWithDetails[]> {
    const query = `
      SELECT 
        c.*,
        a.idAgenda, a.libelle,
        m.idMedecin, u.nom as medecin_nom, u.prenom as medecin_prenom
      FROM creneau c
      JOIN agenda a ON c.agenda_id = a.idAgenda
      JOIN medecin m ON a.medecin_id = m.idMedecin
      JOIN utilisateur u ON m.utilisateur_id = u.idUtilisateur
      WHERE m.idMedecin = $1 
        AND c.disponible = true
        AND c.debut >= $2 
        AND c.fin <= $3
        AND c.idCreneau NOT IN (
          SELECT rv.creneau_id 
          FROM rendezvous rv 
          WHERE rv.creneau_id IS NOT NULL 
            AND rv.statut NOT IN ('ANNULE', 'TERMINE')
        )
      ORDER BY c.debut ASC
    `;
    const result = await db.query(query, [medecinId, dateDebut, dateFin]);
    return this.mapCreneauxWithDetails(result.rows);
  }

  // ========================================
  // AGENDAS
  // ========================================

  // Créer un agenda
  async createAgenda(data: {
    medecin_id: string;
    libelle: string;
  }): Promise<Agenda> {
    const query = `
      INSERT INTO agenda (medecin_id, libelle)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [data.medecin_id, data.libelle];
    const result = await db.query<Agenda>(query, values);
    return result.rows[0];
  }

  // Récupérer les agendas d'un médecin
  async getAgendasByMedecin(medecinId: string): Promise<AgendaWithDetails[]> {
    const query = `
      SELECT 
        a.*,
        m.idMedecin, u.nom as medecin_nom, u.prenom as medecin_prenom,
        c.idCreneau, c.debut, c.fin, c.disponible
      FROM agenda a
      JOIN medecin m ON a.medecin_id = m.idMedecin
      JOIN utilisateur u ON m.utilisateur_id = u.idUtilisateur
      LEFT JOIN creneau c ON a.idAgenda = c.agenda_id
      WHERE a.medecin_id = $1
      ORDER BY a.libelle ASC, c.debut ASC
    `;
    const result = await db.query(query, [medecinId]);
    return this.mapAgendasWithDetails(result.rows);
  }

  // ========================================
  // RAPPELS
  // ========================================

  // Créer un rappel
  async createRappel(data: {
    rendezvous_id: string;
    dateEnvoi: Date;
    canal: 'SMS' | 'EMAIL' | 'PUSH';
  }): Promise<Rappel> {
    const query = `
      INSERT INTO rappel (rendezvous_id, dateEnvoi, canal)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.rendezvous_id, data.dateEnvoi, data.canal];
    const result = await db.query<Rappel>(query, values);
    return result.rows[0];
  }

  // Récupérer les rappels à envoyer
  async getRappelsAEnvoyer(): Promise<Rappel[]> {
    const query = `
      SELECT * FROM rappel 
      WHERE envoye = false 
        AND dateEnvoi <= NOW()
      ORDER BY dateEnvoi ASC
    `;
    const result = await db.query<Rappel>(query);
    return result.rows;
  }

  // Marquer un rappel comme envoyé
  async marquerRappelEnvoye(id: string): Promise<boolean> {
    const query = `UPDATE rappel SET envoye = true WHERE idRappel = $1`;
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  private mapRendezVousWithDetails(rows: any[]): RendezVousWithDetails[] {
    return rows.map(row => ({
      idRendezVous: row.idrendezvous,
      patient_id: row.patient_id,
      medecin_id: row.medecin_id,
      creneau_id: row.creneau_id,
      dateHeure: row.dateheure,
      duree: row.duree,
      motif: row.motif,
      statut: row.statut,
      dateCreation: row.datecreation,
      dateModification: row.datemodification,
      patient: {
        idPatient: row.idpatient,
        nom: row.patient_nom,
        prenom: row.patient_prenom,
        telephone: row.patient_telephone,
        email: row.patient_email
      },
      medecin: {
        idMedecin: row.idmedecin,
        nom: row.medecin_nom,
        prenom: row.medecin_prenom,
        specialites: []
      },
      creneau: row.idcreneau ? {
        idCreneau: row.idcreneau,
        agenda_id: row.idagenda,
        debut: row.debut,
        fin: row.fin,
        disponible: row.disponible
      } : undefined
    }));
  }

  private mapCreneauxWithDetails(rows: any[]): CreneauWithDetails[] {
    return rows.map(row => ({
      idCreneau: row.idcreneau,
      agenda_id: row.agenda_id,
      debut: row.debut,
      fin: row.fin,
      disponible: row.disponible,
      agenda: {
        idAgenda: row.idagenda,
        libelle: row.libelle,
        medecin: {
          idMedecin: row.idmedecin,
          nom: row.medecin_nom,
          prenom: row.medecin_prenom
        }
      }
    }));
  }

  private mapAgendasWithDetails(rows: any[]): AgendaWithDetails[] {
    const agendaMap = new Map<string, AgendaWithDetails>();
    
    rows.forEach(row => {
      if (!agendaMap.has(row.idagenda)) {
        agendaMap.set(row.idagenda, {
          idAgenda: row.idagenda,
          medecin_id: row.medecin_id,
          libelle: row.libelle,
          medecin: {
            idMedecin: row.idmedecin,
            nom: row.medecin_nom,
            prenom: row.medecin_prenom,
            specialites: []
          },
          creneaux: []
        });
      }
      
      if (row.idcreneau) {
        agendaMap.get(row.idagenda)!.creneaux.push({
          idCreneau: row.idcreneau,
          agenda_id: row.agenda_id,
          debut: row.debut,
          fin: row.fin,
          disponible: row.disponible
        });
      }
    });
    
    return Array.from(agendaMap.values());
  }
}
