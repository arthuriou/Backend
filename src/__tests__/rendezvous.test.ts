import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';
import { generateToken } from '../shared/utils/jwt.utils';

async function createVerifiedPatient() {
  const email = `pt_rdv_${Date.now()}@ex.com`;
  const motdepasse = 'Passw0rd!';
  
  // Inscription patient (champs minimaux)
  await request(app).post('/api/auth/register-patient').send({ 
    email, 
    motdepasse, 
    nom: 'Patient RDV',
    prenom: 'Test'
  });
  
  // Vérifier que l'OTP existe
  const r = await db.query(`SELECT code FROM otp_verification WHERE email = $1`, [email]);
  expect(r.rows.length).toBe(1);
  const otp = r.rows[0].code as string;
  
  // Vérifier l'OTP
  await request(app).post('/api/auth/verify-otp').send({ email, otp });
  
  // Connexion
  const login = await request(app).post('/api/auth/login').send({ email, motdepasse });
  const token = login.body?.data?.token as string;
  const userId = login.body?.data?.user?.idutilisateur as string;
  const pr = await db.query(`SELECT idpatient FROM patient WHERE utilisateur_id = $1`, [userId]);
  const patientId = pr.rows[0].idpatient as string;
  return { email, token, userId, patientId };
}

async function createApprovedMedecin() {
  const unique = Date.now();
  const email = `md_rdv_${unique}@ex.com`;
  const passwordHash = '$2b$10$w1kFh8Qw4QJ2Q1F1F1F1uexkTqkM0eJrI0cUO1o3a8qZr8jv7b3hK'; // bcrypt de 'Temp123!'
  
  const u = await db.query(`INSERT INTO utilisateur (email, motdepasse, nom, actif) VALUES ($1,$2,'Doc RDV',true) RETURNING idutilisateur`, [email, passwordHash]);
  const userId = u.rows[0].idutilisateur as string;
  
  const m = await db.query(`INSERT INTO medecin (utilisateur_id, numordre, statut) VALUES ($1,'ORD${unique}','APPROVED') RETURNING idmedecin`, [userId]);
  const medecinId = m.rows[0].idmedecin as string;
  
  return { medecinId, userId, email };
}

describe('Rendez-vous', () => {
  it('crée un rendez-vous EN_ATTENTE entre patient et médecin', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();

    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    const res = await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: medecin.medecinId,
        dateheure: inOneHour,
        duree: 30,
        motif: 'Consultation de test'
      });

    expect([200, 201]).toContain(res.status);
    
    // Vérifier que le rendez-vous a été créé
    let rdvId = res.body?.data?.idrendezvous as string | undefined;
    if (!rdvId) {
      const q = await db.query(
        `SELECT idrendezvous FROM rendezvous 
         WHERE patient_id = $1 AND medecin_id = $2 AND dateheure = $3
         ORDER BY dateheure DESC LIMIT 1`,
        [patient.patientId, medecin.medecinId, inOneHour]
      );
      rdvId = q.rows[0]?.idrendezvous;
    }
    expect(rdvId).toBeTruthy();
  }, 15000);

  it('confirme un rendez-vous par le médecin', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();

    // Créer un rendez-vous
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    const createRes = await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: medecin.medecinId,
        dateheure: inOneHour,
        duree: 30,
        motif: 'Consultation de test'
      });

    expect([200, 201]).toContain(createRes.status);

    // Récupérer l'ID du rendez-vous
    const q = await db.query(
      `SELECT idrendezvous FROM rendezvous 
       WHERE patient_id = $1 AND medecin_id = $2 AND dateheure = $3
       ORDER BY dateheure DESC LIMIT 1`,
      [patient.patientId, medecin.medecinId, inOneHour]
    );
    const rdvId = q.rows[0]?.idrendezvous;

    // Confirmer par le médecin
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const confRes = await request(app)
      .put(`/api/rendezvous/${rdvId}/confirmer`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 204]).toContain(confRes.status);
  }, 15000);

  it('annule un rendez-vous par le médecin', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();

    // Créer un rendez-vous
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    const createRes = await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: medecin.medecinId,
        dateheure: inOneHour,
        duree: 30,
        motif: 'Consultation de test'
      });

    expect([200, 201]).toContain(createRes.status);

    // Récupérer l'ID du rendez-vous
    const q = await db.query(
      `SELECT idrendezvous FROM rendezvous 
       WHERE patient_id = $1 AND medecin_id = $2 AND dateheure = $3
       ORDER BY dateheure DESC LIMIT 1`,
      [patient.patientId, medecin.medecinId, inOneHour]
    );
    const rdvId = q.rows[0]?.idrendezvous;

    // Annuler par le médecin
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const annRes = await request(app)
      .put(`/api/rendezvous/${rdvId}/annuler`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 204]).toContain(annRes.status);
  }, 15000);

  it('récupère les rendez-vous d\'un patient', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();

    // Créer un rendez-vous
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: medecin.medecinId,
        dateheure: inOneHour,
        duree: 30,
        motif: 'Consultation de test'
      });

    // Récupérer les rendez-vous du patient
    const res = await request(app)
      .get(`/api/rendezvous/patient/${patient.patientId}`)
      .set('Authorization', `Bearer ${patient.token}`);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.data)).toBe(true);
    }
  }, 15000);

  it('récupère les rendez-vous d\'un médecin', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();

    // Créer un rendez-vous
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: medecin.medecinId,
        dateheure: inOneHour,
        duree: 30,
        motif: 'Consultation de test'
      });

    // Récupérer les rendez-vous du médecin
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const res = await request(app)
      .get(`/api/rendezvous/medecin/${medecin.medecinId}`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.data)).toBe(true);
    }
  }, 15000);

  it('met à jour un rendez-vous', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();

    // Créer un rendez-vous
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    await request(app)
      .post('/api/rendezvous')
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        patient_id: patient.patientId,
        medecin_id: medecin.medecinId,
        dateheure: inOneHour,
        duree: 30,
        motif: 'Consultation de test'
      });

    // Récupérer l'ID du rendez-vous
    const q = await db.query(
      `SELECT idrendezvous FROM rendezvous 
       WHERE patient_id = $1 AND medecin_id = $2 AND dateheure = $3
       ORDER BY dateheure DESC LIMIT 1`,
      [patient.patientId, medecin.medecinId, inOneHour]
    );
    const rdvId = q.rows[0]?.idrendezvous;

    // Mettre à jour le rendez-vous
    const newDate = new Date(Date.now() + 7200_000).toISOString();
    const updateRes = await request(app)
      .put(`/api/rendezvous/${rdvId}`)
      .set('Authorization', `Bearer ${patient.token}`)
      .send({
        dateheure: newDate,
        duree: 45,
        motif: 'Consultation mise à jour'
      });

    expect([200, 204]).toContain(updateRes.status);
  }, 15000);
});
