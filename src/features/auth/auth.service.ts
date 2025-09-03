import { AuthRepository } from "./auth.repository";
import { User, Patient, Medecin } from "./auth.model";
import bcrypt from 'bcrypt';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async createPatient(
    email: string,
    motdepasse: string,
    nom: string,
    prenom?: string,
    telephone?: string,
    datenaissance?: Date,
    genre?: string,
    adresse?: string,
    groupesanguin?: string,
    poids?: number,
    taille?: number
  ): Promise<User> {
    const userExistingMail = await this.repository.getUserByEmail(email);
    if (userExistingMail) {
      throw new Error(`Utilisateur avec l'email ${email} existe déjà`);
    }
    
    if (!email || !motdepasse || !nom) {
      throw new Error("Email, mot de passe et nom sont requis");
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
      nom,
      prenom,
      telephone
    );

    await this.repository.createPatient(
      newUser.idutilisateur!,
      datenaissance,
      genre,
      adresse,
      groupesanguin,
      poids,
      taille
    );

    return newUser;
  }

  async createMedecin(
    email: string,
    motdepasse: string,
    nom: string,
    numordre: string,
    prenom?: string,
    telephone?: string,
    experience?: number,
    biographie?: string
  ): Promise<User> {
    const userExistingMail = await this.repository.getUserByEmail(email);
    if (userExistingMail) {
      throw new Error(`Utilisateur avec l'email ${email} existe déjà`);
    }
    
    if (!email || !motdepasse || !nom || !numordre) {
      throw new Error("Email, mot de passe, nom et numéro d'ordre sont requis");
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    const newUser = await this.repository.createUser(
      email,
      hashedPassword,
      nom,
      prenom,
      telephone
    );

    await this.repository.createMedecin(
      newUser.idutilisateur!,
      numordre,
      experience,
      biographie
    );

    return newUser;
  }

  async login(email: string, motdepasse: string): Promise<User> {
    const user = await this.repository.getUserByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: "Email ou mot de passe incorrect" };
    }

    const isPasswordValid = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: "Email ou mot de passe incorrect" };
    }

    if (!user.actif) {
      throw { statusCode: 403, message: "Compte désactivé" };
    }

    return user;
  }
}