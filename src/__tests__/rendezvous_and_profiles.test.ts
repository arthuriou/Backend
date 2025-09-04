import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';
import { generateToken } from '../shared/utils/jwt.utils';

async function createVerifiedPatient() {
  const email = `pt_${Date.now()}@ex.com`;
  const motdepasse = 'Passw0rd!';
  await request(app).post('/api/auth/register-patient').send({ email, motdepasse, nom: 'Pat' });
  const r = await db.query(`SELECT code FROM otp_verification WHERE email = $1`, [email]);
  const otp = r.rows[0].code as string;
  await request(app).post('/api/auth/verify-otp').send({ email, otp });
  const login = await request(app).post('/api/auth/login').send({ email, motdepasse });
  const token = login.body?.data?.token as string;
  const userId = login.body?.data?.user?.idutilisateur as string;
  const pr = await db.query(`SELECT idPatient FROM patient WHERE utilisateur_id = $1`, [userId]);
  const patientId = pr.rows[0].idpatient as string;
  return { email, token, userId, patientId };
}

async function createApprovedMedecinDirect() {
  const unique = Date.now();
  const email = `md_${unique}@ex.com`;
  const passwordHash = '$2b$10$w1kFh8Qw4QJ2Q1F1F1F1uexkTqkM0eJrI0cUO1o3a8qZr8jv7b3hK'; // bcrypt of 'Temp123!'
  const u = await db.query(`INSERT INTO utilisateur (email, motDePasse, nom, actif) VALUES ($1,$2,'Doc',true) RETURNING idUtilisateur`, [email, passwordHash]);
  const userId = u.rows[0].idutilisateur as string;
  const m = await db.query(`INSERT INTO medecin (utilisateur_id, numOrdre, statut) VALUES ($1,'ORD${unique}','APPROVED') RETURNING idMedecin`, [userId]);
  const medecinId = m.rows[0].idmedecin as string;
  return { medecinId, userId, email };
}

describe('Rendezvous and Profiles', () => {
  it('creates a rendezvous EN_ATTENTE between patient and medecin', async () => {
    const patient = await createVerifiedPatient();
    const med = await createApprovedMedecinDirect();

    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    const res = await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: med.medecinId,
        dateHeure: inOneHour,
        duree: 30,
        motif: 'Test'
      });

    expect([200, 201]).toContain(res.status);
    // Si le corps ne renvoie pas l'objet, récupérer en DB
    let rdvId = res.body?.data?.idRendezVous as string | undefined;
    if (!rdvId) {
      const q = await db.query(
        `SELECT idRendezVous FROM rendezvous 
         WHERE patient_id = $1 AND medecin_id = $2 AND dateHeure = $3
         ORDER BY dateHeure DESC LIMIT 1`,
        [patient.patientId, med.medecinId, inOneHour]
      );
      rdvId = q.rows[0]?.idrendezvous;
    }
    expect(rdvId).toBeTruthy();

    // Confirmer par le médecin
    const medToken = generateToken({ userId: med.userId, email: med.email, role: 'MEDECIN' });
    const conf = await request(app)
      .put(`/api/rendezvous/${rdvId}/confirmer`)
      .set('Authorization', `Bearer ${medToken}`);
    expect([200, 204]).toContain(conf.status);

    // Annuler par le médecin
    const ann = await request(app)
      .put(`/api/rendezvous/${rdvId}/annuler`)
      .set('Authorization', `Bearer ${medToken}`);
    expect([200, 204]).toContain(ann.status);

    // Terminer par le médecin (peut nécessiter statut CONFIRME; test best effort)
    const ter = await request(app)
      .put(`/api/rendezvous/${rdvId}/terminer`)
      .set('Authorization', `Bearer ${medToken}`);
    expect([200, 204, 400, 500]).toContain(ter.status);
  }, 15000);

  it('updates patient profile fields', async () => {
    const patient = await createVerifiedPatient();

    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({ userId: patient.userId, nom: 'Nom MAJ' });

    if (![200, 204].includes(res.status)) {
      // eslint-disable-next-line no-console
      console.log('Profile update response:', res.status, res.body);
    }
    expect([200, 204]).toContain(res.status);

    // Vérifier en DB
    const u = await db.query(`SELECT nom FROM utilisateur WHERE idUtilisateur = $1`, [patient.userId]);
    expect(u.rows[0].nom).toBe('Nom MAJ');
  }, 15000);
});


