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
    dateheure: Date;
    duree: number;
    motif: string;
    statut: string;
    type_rdv?: string;
    adresse_cabinet?: string;
  }): Promise<RendezVous> {
    const query = `
      INSERT INTO rendezvous (patient_id, medecin_id, creneau_id, dateheure, duree, motif, statut, type_rdv, adresse_cabinet)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.patient_id, 
      data.medecin_id, 
      data.creneau_id, 
      data.dateheure, 
      data.duree, 
      data.motif, 
      data.statut,
      data.type_rdv || 'PRESENTIEL',
      data.adresse_cabinet || null
    ];
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
      idrendezvous: row.idrendezvous,
      patient_id: row.patient_id,
      medecin_id: row.medecin_id,
      creneau_id: row.creneau_id,
      dateheure: row.dateheure,
      duree: row.duree,
      motif: row.motif,
      statut: row.statut,
      patient: {
        idpatient: row.idpatient,
        nom: row.patient_nom,
        prenom: row.patient_prenom,
        telephone: row.patient_telephone,
        email: row.patient_email
      },
      medecin: {
        idmedecin: row.idmedecin,
        nom: row.medecin_nom,
        prenom: row.medecin_prenom,
        specialites: [] // TODO: Ajouter les spécialités
      },
      creneau: row.idcreneau ? {
        idcreneau: row.idcreneau,
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
    return this.mapRendezVousWithDetails(result.rows) as RendezVousWithDetails[];
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
    return this.mapRendezVousWithDetails(result.rows) as RendezVousWithDetails[];
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
    const result = await db.query(query, values);
    const row = result.rows[0];
    return {
      idcreneau: row.idcreneau,
      agenda_id: row.agenda_id,
      debut: row.debut,
      fin: row.fin,
      disponible: row.disponible
    };
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
    const result = await db.query(query, values);
    const row = result.rows[0];
    console.log('Agenda row from DB:', row);
    return {
      idagenda: row.idagenda,
      medecin_id: row.medecin_id,
      libelle: row.libelle
    };
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

  // Vérifier la disponibilité d'un créneau
  async verifierDisponibiliteCreneau(creneauId: string): Promise<boolean> {
    const query = `
      SELECT c.*, 
             COUNT(rv.idRendezVous) as reservations_count
      FROM creneau c
      LEFT JOIN rendezvous rv ON c.idCreneau = rv.creneau_id 
        AND rv.statut NOT IN ('ANNULE', 'TERMINE')
      WHERE c.idCreneau = $1 
        AND c.disponible = true
      GROUP BY c.idCreneau
    `;
    
    const result = await db.query(query, [creneauId]);
    
    if (result.rows.length === 0) {
      return false; // Créneau n'existe pas ou n'est pas disponible
    }

    const creneau = result.rows[0];
    return creneau.reservations_count === 0; // Disponible si aucune réservation
  }

  // ========================================
  // RELATIONS & MAPPINGS
  // ========================================

  async getMedecinIdByUserId(userId: string): Promise<string | null> {
    const r = await db.query(`SELECT idMedecin FROM medecin WHERE utilisateur_id = $1`, [userId]);
    return r.rows[0]?.idmedecin || null;
  }

  async getPatientIdByUserId(userId: string): Promise<string | null> {
    const r = await db.query(`SELECT idPatient FROM patient WHERE utilisateur_id = $1`, [userId]);
    return r.rows[0]?.idpatient || null;
  }

  async isPatientOfMedecinByEntities(patientId: string, medecinId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM rendezvous r
        WHERE r.patient_id = $1
          AND r.medecin_id = $2
          AND r.statut IN ('CONFIRME','EN_COURS','TERMINE')
      )
      OR EXISTS (
        SELECT 1
        FROM consultation c
        WHERE c.patient_id = $1
          AND c.medecin_id = $2
      ) AS related;
    `;
    const result = await db.query<{ related: boolean }>(query, [patientId, medecinId]);
    return Boolean(result.rows[0]?.related);
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================


  private mapCreneauxWithDetails(rows: any[]): CreneauWithDetails[] {
    return rows.map(row => ({
      idcreneau: row.idcreneau,
      agenda_id: row.agenda_id,
      debut: row.debut,
      fin: row.fin,
      disponible: row.disponible,
      agenda: {
        idagenda: row.idagenda,
        libelle: row.libelle,
        medecin: {
          idmedecin: row.idmedecin,
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
          idagenda: row.idagenda,
          medecin_id: row.medecin_id,
          libelle: row.libelle,
          medecin: {
            idmedecin: row.idmedecin,
            nom: row.medecin_nom,
            prenom: row.medecin_prenom,
            specialites: []
          },
          creneaux: []
        });
      }
      
      if (row.idcreneau) {
        agendaMap.get(row.idagenda)!.creneaux.push({
          idcreneau: row.idcreneau,
          agenda_id: row.agenda_id,
          debut: row.debut,
          fin: row.fin,
          disponible: row.disponible
        });
      }
    });
    
    return Array.from(agendaMap.values());
  }

  // ========================================
  // TÉLÉCONSULTATION
  // ========================================

  // Mettre à jour les informations de téléconsultation
  async updateTeleconsultationInfo(
    rendezvous_id: string, 
    salle_virtuelle: string, 
    lien_video: string, 
    token_acces: string
  ): Promise<boolean> {
    const query = `
      UPDATE rendezvous 
      SET salle_virtuelle = $2, lien_video = $3, token_acces = $4
      WHERE idRendezVous = $1
    `;
    const result = await db.query(query, [rendezvous_id, salle_virtuelle, lien_video, token_acces]);
    return (result.rowCount || 0) > 0;
  }

  // Récupérer les informations de téléconsultation
  async getTeleconsultationInfo(rendezvous_id: string): Promise<{
    salle_virtuelle: string;
    lien_video: string;
    token_acces: string;
    type_rdv: string;
  } | null> {
    const query = `
      SELECT salle_virtuelle, lien_video, token_acces, type_rdv
      FROM rendezvous 
      WHERE idRendezVous = $1 AND type_rdv = 'TELECONSULTATION'
    `;
    const result = await db.query(query, [rendezvous_id]);
    return result.rows[0] || null;
  }

  // Mettre à jour le statut d'un rendez-vous
  async updateRendezVousStatut(rendezvous_id: string, statut: string): Promise<boolean> {
    const query = `
      UPDATE rendezvous 
      SET statut = $2
      WHERE idRendezVous = $1
    `;
    const result = await db.query(query, [rendezvous_id, statut]);
    return (result.rowCount || 0) > 0;
  }

  // Utilitaire pour requêtes brutes (scheduler)
  async queryRaw<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await db.query(sql, params);
    return res.rows as T[];
  }

  // Récupérer les RDV d'un médecin par statut
  async getRendezVousByMedecinAndStatut(medecin_id: string, statut: string): Promise<RendezVous[]> {
    const query = `
      SELECT 
        rv.*,
        p.idPatient, p.dateNaissance, p.genre, p.adresse, p.groupeSanguin, p.poids, p.taille,
        u_p.nom as patient_nom, u_p.prenom as patient_prenom, u_p.email as patient_email, u_p.telephone as patient_telephone,
        m.idMedecin, m.numeroOrdre, m.experience, m.biographie,
        u_m.nom as medecin_nom, u_m.prenom as medecin_prenom, u_m.email as medecin_email, u_m.telephone as medecin_telephone,
        a.idAgenda, a.libelle as agenda_libelle,
        c.idCreneau, c.debut as creneau_debut, c.fin as creneau_fin
      FROM rendezvous rv
      LEFT JOIN patient p ON rv.patient_id = p.idPatient
      LEFT JOIN utilisateur u_p ON p.utilisateur_id = u_p.idUtilisateur
      LEFT JOIN medecin m ON rv.medecin_id = m.idMedecin
      LEFT JOIN utilisateur u_m ON m.utilisateur_id = u_m.idUtilisateur
      LEFT JOIN agenda a ON rv.agenda_id = a.idAgenda
      LEFT JOIN creneau c ON rv.creneau_id = c.idCreneau
      WHERE m.idMedecin = $1 AND rv.statut = $2
      ORDER BY rv.dateheure ASC
    `;
    const result = await db.query(query, [medecin_id, statut]);
    return this.mapRendezVousWithDetails(result.rows) as RendezVousWithDetails[];
  }

  // Récupérer les RDV d'un médecin par plage de dates
  async getRendezVousByMedecinAndDateRange(medecin_id: string, dateDebut: Date, dateFin: Date): Promise<RendezVous[]> {
    const query = `
      SELECT 
        rv.*,
        p.idPatient, p.dateNaissance, p.genre, p.adresse, p.groupeSanguin, p.poids, p.taille,
        u_p.nom as patient_nom, u_p.prenom as patient_prenom, u_p.email as patient_email, u_p.telephone as patient_telephone,
        m.idMedecin, m.numeroOrdre, m.experience, m.biographie,
        u_m.nom as medecin_nom, u_m.prenom as medecin_prenom, u_m.email as medecin_email, u_m.telephone as medecin_telephone,
        a.idAgenda, a.libelle as agenda_libelle,
        c.idCreneau, c.debut as creneau_debut, c.fin as creneau_fin
      FROM rendezvous rv
      LEFT JOIN patient p ON rv.patient_id = p.idPatient
      LEFT JOIN utilisateur u_p ON p.utilisateur_id = u_p.idUtilisateur
      LEFT JOIN medecin m ON rv.medecin_id = m.idMedecin
      LEFT JOIN utilisateur u_m ON m.utilisateur_id = u_m.idUtilisateur
      LEFT JOIN agenda a ON rv.agenda_id = a.idAgenda
      LEFT JOIN creneau c ON rv.creneau_id = c.idCreneau
      WHERE m.idMedecin = $1 
        AND rv.dateheure >= $2 
        AND rv.dateheure < $3
      ORDER BY rv.dateheure ASC
    `;
    const result = await db.query(query, [medecin_id, dateDebut, dateFin]);
    return this.mapRendezVousWithDetails(result.rows) as RendezVousWithDetails[];
  }

  private mapRendezVousWithDetails(rows: any[]): RendezVous[] {
    return rows.map(row => ({
      idrendezvous: row.idrendezvous,
      patient_id: row.patient_id,
      medecin_id: row.medecin_id,
      agenda_id: row.agenda_id,
      creneau_id: row.creneau_id,
      dateheure: row.dateheure,
      duree: row.duree,
      motif: row.motif,
      statut: row.statut,
      type_rdv: row.type_rdv,
      lien_video: row.lien_video,
      salle_virtuelle: row.salle_virtuelle,
      token_acces: row.token_acces,
      adresse_cabinet: row.adresse_cabinet,
      patient: {
        idpatient: row.idpatient,
        nom: row.patient_nom,
        prenom: row.patient_prenom,
        email: row.patient_email,
        telephone: row.patient_telephone,
        dateNaissance: row.datenaisance,
        genre: row.genre,
        adresse: row.adresse,
        groupeSanguin: row.groupesanguin,
        poids: row.poids,
        taille: row.taille
      },
      medecin: {
        idmedecin: row.idmedecin,
        nom: row.medecin_nom,
        prenom: row.medecin_prenom,
        email: row.medecin_email,
        telephone: row.medecin_telephone,
        numeroOrdre: row.numeroordre,
        experience: row.experience,
        biographie: row.biographie
      },
      agenda: row.idagenda ? {
        idagenda: row.idagenda,
        medecin_id: row.medecin_id,
        libelle: row.agenda_libelle
      } : undefined,
      creneau: row.idcreneau ? {
        idcreneau: row.idcreneau,
        agenda_id: row.agenda_id,
        debut: row.creneau_debut,
        fin: row.creneau_fin,
        disponible: true
      } : undefined
    }));
  }
}
