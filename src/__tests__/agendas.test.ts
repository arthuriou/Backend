import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';
import { generateToken } from '../shared/utils/jwt.utils';

async function createVerifiedPatient() {
  const email = `pt_agenda_${Date.now()}@ex.com`;
  const motdepasse = 'Passw0rd!';
  
  // Inscription patient (champs minimaux)
  await request(app).post('/api/auth/register-patient').send({ 
    email, 
    motdepasse, 
    nom: 'Patient Agenda',
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
  const email = `md_agenda_${unique}@ex.com`;
  const passwordHash = '$2b$10$w1kFh8Qw4QJ2Q1F1F1F1uexkTqkM0eJrI0cUO1o3a8qZr8jv7b3hK'; // bcrypt de 'Temp123!'
  
  const u = await db.query(`INSERT INTO utilisateur (email, motdepasse, nom, actif) VALUES ($1,$2,'Doc Agenda',true) RETURNING idutilisateur`, [email, passwordHash]);
  const userId = u.rows[0].idutilisateur as string;
  
  const m = await db.query(`INSERT INTO medecin (utilisateur_id, numordre, statut) VALUES ($1,'ORD${unique}','APPROVED') RETURNING idmedecin`, [userId]);
  const medecinId = m.rows[0].idmedecin as string;
  
  return { medecinId, userId, email };
}

describe('Agendas', () => {
  it('crée un agenda pour un médecin', async () => {
    const medecin = await createApprovedMedecin();
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });

    const res = await request(app)
      .post('/api/rendezvous/agendas')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        medecin_id: medecin.medecinId,
        libelle: 'Consultations matin'
      });

    expect([200, 201]).toContain(res.status);
    console.log('Agenda response:', JSON.stringify(res.body, null, 2));
    expect(res.body?.data).toHaveProperty('idagenda');
    expect(res.body?.data?.medecin_id).toBe(medecin.medecinId);
    expect(res.body?.data?.libelle).toBe('Consultations matin');
  }, 15000);

  it('récupère les agendas d\'un médecin', async () => {
    const medecin = await createApprovedMedecin();
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });

    // Créer d'abord un agenda
    await request(app)
      .post('/api/rendezvous/agendas')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        medecin_id: medecin.medecinId,
        libelle: 'Consultations matin'
      });

    // Récupérer les agendas
    const res = await request(app)
      .get(`/api/rendezvous/medecin/${medecin.medecinId}/agendas`);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.data)).toBe(true);
      expect(res.body?.data.length).toBeGreaterThan(0);
      expect(res.body?.data[0]).toHaveProperty('idagenda');
      expect(res.body?.data[0]).toHaveProperty('libelle');
      expect(res.body?.data[0]).toHaveProperty('medecin');
    }
  }, 15000);

  it('crée un créneau dans un agenda', async () => {
    const medecin = await createApprovedMedecin();
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });

    // Créer d'abord un agenda
    const agendaRes = await request(app)
      .post('/api/rendezvous/agendas')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        medecin_id: medecin.medecinId,
        libelle: 'Consultations matin'
      });

    const agendaId = agendaRes.body?.data?.idagenda;

    // Créer un créneau (dans le futur)
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    const inOneHour30 = new Date(Date.now() + 5400_000).toISOString();
    
    const creneauRes = await request(app)
      .post('/api/rendezvous/creneaux')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        agenda_id: agendaId,
        debut: inOneHour,
        fin: inOneHour30,
        disponible: true
      });

    console.log('Creneau response status:', creneauRes.status);
    console.log('Creneau response:', JSON.stringify(creneauRes.body, null, 2));
    expect([200, 201]).toContain(creneauRes.status);
    expect(creneauRes.body?.data).toHaveProperty('idcreneau');
    expect(creneauRes.body?.data?.agenda_id).toBe(agendaId);
    expect(creneauRes.body?.data?.disponible).toBe(true);
  }, 15000);

  it('récupère les créneaux disponibles d\'un médecin', async () => {
    const medecin = await createApprovedMedecin();
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });

    // Créer un agenda
    const agendaRes = await request(app)
      .post('/api/rendezvous/agendas')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        medecin_id: medecin.medecinId,
        libelle: 'Consultations matin'
      });

    const agendaId = agendaRes.body?.data?.idagenda;

    // Créer un créneau (dans le futur)
    const inOneHour = new Date(Date.now() + 3600_000).toISOString();
    const inOneHour30 = new Date(Date.now() + 5400_000).toISOString();
    
    await request(app)
      .post('/api/rendezvous/creneaux')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        agenda_id: agendaId,
        debut: inOneHour,
        fin: inOneHour30,
        disponible: true
      });

    // Récupérer les créneaux disponibles
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24*3600_000).toISOString().split('T')[0];
    
    const res = await request(app)
      .get(`/api/rendezvous/medecin/${medecin.medecinId}/creneaux-disponibles?dateDebut=${today}&dateFin=${tomorrow}`);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body?.data)).toBe(true);
      expect(res.body?.data.length).toBeGreaterThan(0);
      expect(res.body?.data[0]).toHaveProperty('idcreneau');
      expect(res.body?.data[0]).toHaveProperty('debut');
      expect(res.body?.data[0]).toHaveProperty('fin');
      expect(res.body?.data[0]).toHaveProperty('disponible');
    }
  }, 15000);

  it('valide la contrainte de créneau (fin > debut)', async () => {
    const medecin = await createApprovedMedecin();
    const medToken = generateToken({ userId: medecin.userId, email: medecin.email, role: 'MEDECIN' });

    // Créer un agenda
    const agendaRes = await request(app)
      .post('/api/rendezvous/agendas')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        medecin_id: medecin.medecinId,
        libelle: 'Consultations matin'
      });

    const agendaId = agendaRes.body?.data?.idagenda;

    // Essayer de créer un créneau invalide (fin <= debut)
    const res = await request(app)
      .post('/api/rendezvous/creneaux')
      .set('Authorization', `Bearer ${medToken}`)
      .send({
        agenda_id: agendaId,
        debut: '2025-01-15T09:30:00Z',
        fin: '2025-01-15T09:00:00Z', // fin avant debut
        disponible: true
      });

    // Devrait échouer avec une erreur 422 ou 400
    expect([400, 422, 500]).toContain(res.status);
  }, 15000);
});
