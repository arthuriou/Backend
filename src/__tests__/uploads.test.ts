import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';
import fs from 'fs';
import path from 'path';
import { generateToken } from '../shared/utils/jwt.utils';

async function createAndLoginPatient() {
  const email = `up_${Date.now()}@ex.com`;
  const motdepasse = 'Passw0rd!';
  await request(app).post('/api/auth/register-patient').send({ email, motdepasse, nom: 'Up' });
  const r = await db.query(`SELECT code FROM otp_verification WHERE email = $1`, [email]);
  const otp = r.rows[0].code as string;
  await request(app).post('/api/auth/verify-otp').send({ email, otp });
  const login = await request(app).post('/api/auth/login').send({ email, motdepasse });
  const token = login.body?.data?.token as string;
  const userId = login.body?.data?.user?.idutilisateur as string;
  const pr = await db.query(`SELECT idPatient FROM patient WHERE utilisateur_id = $1`, [userId]);
  const patientId = pr.rows[0].idpatient as string;
  return { token, userId, patientId };
}

function tempFile(ext = '.txt') {
  const p = path.join(process.cwd(), `tmp_${Date.now()}${ext}`);
  fs.writeFileSync(p, 'hello');
  return p;
}

async function createApprovedMedecin() {
  const unique = Date.now();
  const email = `md_up_${unique}@ex.com`;
  const passwordHash = '$2b$10$w1kFh8Qw4QJ2Q1F1F1F1uexkTqkM0eJrI0cUO1o3a8qZr8jv7b3hK';
  const u = await db.query(`INSERT INTO utilisateur (email, motDePasse, nom, actif) VALUES ($1,$2,'Doc Up',true) RETURNING idUtilisateur`, [email, passwordHash]);
  const userId = u.rows[0].idutilisateur as string;
  const m = await db.query(`INSERT INTO medecin (utilisateur_id, numOrdre, statut) VALUES ($1,'ORD${unique}','APPROVED') RETURNING idMedecin`, [userId]);
  const medecinId = m.rows[0].idmedecin as string;
  return { email, userId, medecinId };
}

describe('Uploads', () => {
  it('upload profile photo', async () => {
    const { token, userId } = await createAndLoginPatient();
    const filePath = tempFile('.png');
    const res = await request(app)
      .post('/api/auth/profile/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', filePath);
    expect([200, 201]).toContain(res.status);
    expect(res.body?.data?.url).toMatch(/^\/uploads\/profile\//);
  }, 15000);

  it('upload dossier document', async () => {
    const { token, patientId } = await createAndLoginPatient();
    // get or create dossier
    const d = await request(app)
      .get(`/api/dossier-medical/dossier/${patientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(d.status).toBe(200);
    const dossier = d.body?.dossier || d.body;
    const dossierId = dossier?.idDossier || dossier?.iddossier || dossier?.id || dossier?.data?.id;
    expect(dossierId).toBeTruthy();

    const filePath = tempFile('.pdf');
    const up = await request(app)
      .post('/api/dossier-medical/documents')
      .set('Authorization', `Bearer ${token}`)
      .field('dossier_id', dossierId)
      .field('nom', 'Doc Test')
      .attach('file', filePath);
    expect([200, 201]).toContain(up.status);
  }, 15000);

  it('send message with file', async () => {
    const a = await createAndLoginPatient();
    const b = await createApprovedMedecin();
    // créer ou récupérer conversation privée
    const conv = await request(app)
      .post('/api/messagerie/conversations/private')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ participantId: b.userId });
    expect([200, 201]).toContain(conv.status);
    const conversation = conv.body?.data || conv.body;
    const conversationId = conversation?.idConversation || conversation?.idconversation || conversation?.id;
    expect(conversationId).toBeTruthy();

    const filePath = tempFile('.png');
    const msg = await request(app)
      .post('/api/messagerie/messages')
      .set('Authorization', `Bearer ${a.token}`)
      .field('conversation_id', conversationId)
      .field('contenu', 'Voici une image')
      .attach('file', filePath);
    
    expect([200, 201]).toContain(msg.status);
  }, 20000);
});


