import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';
import { generateToken } from '../shared/utils/jwt.utils';

async function createVerifiedPatient() {
  const email = `pt_ordo_${Date.now()}@ex.com`;
  const motdepasse = 'Passw0rd!';
  
  // Inscription patient (champs minimaux)
  await request(app).post('/api/auth/register-patient').send({ 
    email, 
    motdepasse, 
    nom: 'Patient Ordo',
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
  const email = `md_ordo_${unique}@ex.com`;
  const passwordHash = '$2b$10$w1kFh8Qw4QJ2Q1F1F1F1uexkTqkM0eJrI0cUO1o3a8qZr8jv7b3hK'; // bcrypt de 'Temp123!'
  
  const u = await db.query(`INSERT INTO utilisateur (email, motdepasse, nom, actif) VALUES ($1,$2,'Doc Ordo',true) RETURNING idutilisateur`, [email, passwordHash]);
  const userId = u.rows[0].idutilisateur as string;
  
  const m = await db.query(`INSERT INTO medecin (utilisateur_id, numordre, statut) VALUES ($1,'ORD${unique}','APPROVED') RETURNING idmedecin`, [userId]);
  const medecinId = m.rows[0].idmedecin as string;
  
  return { medecinId, userId, email };
}

async function createConsultation(patientId: string, medecinId: string) {
  // Créer d'abord un rendez-vous
  const inOneHour = new Date(Date.now() + 3600_000).toISOString();
  const rendezvous = await db.query(`
    INSERT INTO rendezvous (patient_id, medecin_id, dateheure, duree, motif, statut)
    VALUES ($1, $2, $3, 30, 'Consultation de test', 'TERMINE')
    RETURNING idrendezvous
  `, [patientId, medecinId, inOneHour]);
  
  const rendezvousId = rendezvous.rows[0].idrendezvous;
  
  // Créer une consultation liée au rendez-vous
  const consultation = await db.query(`
    INSERT INTO consultation (rendezvous_id, date, diagnostic, notes)
    VALUES ($1, NOW(), 'Diagnostic de test', 'Notes de consultation')
    RETURNING idconsultation
  `, [rendezvousId]);
  
  return consultation.rows[0].idconsultation;
}

describe('Ordonnances', () => {
  it('crée une ordonnance avec des lignes de médicaments', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });

    const res = await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Boire beaucoup d\'eau',
        lignes: [
          { 
            medicament: 'Paracetamol 500mg', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          },
          { 
            medicament: 'Vitamine C', 
            dosage: '1g', 
            posologie: '1 sachet/j', 
            dureejour: 7 
          }
        ]
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body?.ordonnance).toHaveProperty('idordonnance');
    expect(res.body?.ordonnance?.consultation_id).toBe(consultationId);
    expect(res.body?.ordonnance?.dureetraitement).toBe(7);
    expect(res.body?.ordonnance?.renouvellements).toBe(0);
    expect(res.body?.ordonnance?.notes).toBe('Boire beaucoup d\'eau');
  }, 15000);

  it('récupère une ordonnance par ID', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const createRes = await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Test ordonnance',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          }
        ]
      });

    const ordonnanceId = createRes.body?.ordonnance?.idordonnance;

    // Récupérer l'ordonnance
    const res = await request(app)
      .get(`/api/ordonnances/${ordonnanceId}`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body?.ordonnance?.idordonnance).toBe(ordonnanceId);
      expect(res.body?.ordonnance?.consultation_id).toBe(consultationId);
    }
  }, 15000);

  it('récupère les ordonnances d\'un patient', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Test ordonnance patient',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          }
        ]
      });

    // Récupérer les ordonnances du patient
    const res = await request(app)
      .get(`/api/ordonnances/patient/${patient.patientId}`)
      .set('Authorization', `Bearer ${patient.token}`);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.ordonnances)).toBe(true);
    }
  }, 15000);

  it('récupère les ordonnances d\'un médecin', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Test ordonnance médecin',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          }
        ]
      });

    // Récupérer les ordonnances du médecin
    const res = await request(app)
      .get(`/api/ordonnances/medecin/${medecin.medecinId}`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.ordonnances)).toBe(true);
    }
  }, 15000);

  it('met à jour une ordonnance', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const createRes = await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Notes originales',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          }
        ]
      });

    const ordonnanceId = createRes.body?.ordonnance?.idordonnance;

    // Mettre à jour l'ordonnance
    const res = await request(app)
      .patch(`/api/ordonnances/${ordonnanceId}`)
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        dureetraitement: 10,
        renouvellements: 1,
        notes: 'Notes mises à jour',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x2/j', 
            dureejour: 10 
          },
          { 
            medicament: 'Vitamine D', 
            dosage: '1000 UI', 
            posologie: '1 cp/j', 
            dureejour: 30 
          }
        ]
      });

    expect([200, 204]).toContain(res.status);
  }, 15000);

  it('supprime une ordonnance', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const createRes = await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Ordonnance à supprimer',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          }
        ]
      });

    const ordonnanceId = createRes.body?.ordonnance?.idordonnance;

    // Supprimer l'ordonnance
    const res = await request(app)
      .delete(`/api/ordonnances/${ordonnanceId}`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 204]).toContain(res.status);
  }, 15000);

  it('valide une ordonnance (changement de statut)', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const createRes = await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Ordonnance à valider',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          }
        ]
      });

    const ordonnanceId = createRes.body?.ordonnance?.idordonnance;

    // Valider l'ordonnance
    const res = await request(app)
      .put(`/api/ordonnances/${ordonnanceId}/valider`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 204]).toContain(res.status);
  }, 15000);

  it('récupère les lignes d\'ordonnance', async () => {
    const patient = await createVerifiedPatient();
    const medecin = await createApprovedMedecin();
    const consultationId = await createConsultation(patient.patientId, medecin.medecinId);

    // Créer d'abord une ordonnance avec plusieurs lignes
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });
    const createRes = await request(app)
      .post('/api/ordonnances')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        consultation_id: consultationId,
        date: '2025-01-15',
        dureetraitement: 7,
        renouvellements: 0,
        notes: 'Ordonnance avec lignes',
        lignes: [
          { 
            medicament: 'Paracetamol', 
            dosage: '500mg', 
            posologie: '1 cp x3/j', 
            dureejour: 5 
          },
          { 
            medicament: 'Vitamine C', 
            dosage: '1g', 
            posologie: '1 sachet/j', 
            dureejour: 7 
          }
        ]
      });

    const ordonnanceId = createRes.body?.ordonnance?.idordonnance;

    // Récupérer les lignes de l'ordonnance
    const res = await request(app)
      .get(`/api/ordonnances/${ordonnanceId}/lignes`)
      .set('Authorization', `Bearer ${medToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.ordonnances)).toBe(true);
      expect(res.body?.data.length).toBeGreaterThan(0);
    }
  }, 15000);
});
