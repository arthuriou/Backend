import { User, Patient, Medecin } from "./auth.model";
import db from "../../utils/database";

export class AuthRepository {
  async createUser(
    email: string,
    motdepasse: string,
    nom: string,
    prenom?: string,
    telephone?: string
  ): Promise<User> {
    const query = `INSERT INTO utilisateur (email, motDePasse, nom, prenom, telephone, actif)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING *`;
    const values = [email, motdepasse, nom, prenom, telephone];
    const execute = await db.query<User>(query, values);
    return execute.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.query(
      "SELECT * FROM utilisateur WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  async createPatient(
    utilisateur_id: string,
    datenaissance?: Date,
    genre?: string,
    adresse?: string,
    groupesanguin?: string,
    poids?: number,
    taille?: number
  ): Promise<Patient> {
    const query = `INSERT INTO patient (utilisateur_id, dateNaissance, genre, adresse, groupeSanguin, poids, taille, statut)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED')
           RETURNING *`;
    const values = [utilisateur_id, datenaissance, genre, adresse, groupesanguin, poids, taille];
    const execute = await db.query<Patient>(query, values);
    return execute.rows[0];
  }

  async createMedecin(
    utilisateur_id: string,
    numordre: string,
    experience?: number,
    biographie?: string
  ): Promise<Medecin> {
    const query = `INSERT INTO medecin (utilisateur_id, numOrdre, experience, biographie, statut)
           VALUES ($1, $2, $3, $4, 'PENDING')
           RETURNING *`;
    const values = [utilisateur_id, numordre, experience, biographie];
    const execute = await db.query<Medecin>(query, values);
    return execute.rows[0];
  }
}