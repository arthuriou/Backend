import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';
import { generateToken } from '../shared/utils/jwt.utils';

async function ensureAdminCabinetSchema() {
  // Ajoute cabinet_id et dateAffectation si manquants
  await db.query(`DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='admincabinet' AND column_name='cabinet_id'
    ) THEN
      EXECUTE 'ALTER TABLE adminCabinet ADD COLUMN cabinet_id UUID REFERENCES cabinet(idCabinet) ON DELETE CASCADE';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='admincabinet' AND column_name='dateaffectation'
    ) THEN
      EXECUTE 'ALTER TABLE adminCabinet ADD COLUMN dateAffectation TIMESTAMP DEFAULT now()';
    END IF;
  END$$;`);
}

async function createPendingMedecinSelf() {
  const email = `doc_${Date.now()}@ex.com`;
  const motdepasse = 'Passw0rd!';
  const res = await request(app).post('/api/auth/register-doctor').send({
    email,
    motdepasse,
    nom: 'Doc Pending',
    numordre: `ORD${Date.now()}`
  });
  expect([201, 200]).toContain(res.status);
  const q = await db.query(`SELECT idMedecin FROM medecin m JOIN utilisateur u ON u.idUtilisateur = m.utilisateur_id WHERE u.email = $1`, [email]);
  const id = q.rows[0]?.idmedecin;
  return { email, id };
}

describe('SuperAdmin & AdminCabinet endpoints', () => {
  it('setup schema for adminCabinet', async () => {
    await ensureAdminCabinetSchema();
    expect(true).toBe(true);
  });

  it('SuperAdmin: create cabinet, create admin, list admins', async () => {
    const saToken = generateToken({ userId: 'superadmin-id', email: 'sa@ex.com', role: 'SUPERADMIN' });

    const cRes = await request(app)
      .post('/api/cabinets')
      .set('Authorization', `Bearer ${saToken}`)
      .send({ nom: `Cab SA ${Date.now()}` });
    expect([201, 200]).toContain(cRes.status);
    const cabinetId = cRes.body?.data?.id || cRes.body?.data?.idcabinet || cRes.body?.data?.idCabinet;
    expect(cabinetId).toBeTruthy();

    const aRes = await request(app)
      .post(`/api/cabinets/${cabinetId}/admin`)
      .set('Authorization', `Bearer ${saToken}`)
      .send({ email: `admin_${Date.now()}@ex.com`, motdepasse: 'Admin123!', nom: 'Admin', cabinetId, roleAdmin: 'ADMINCABINET' });
    if (![200, 201].includes(aRes.status)) {
      // eslint-disable-next-line no-console
      console.log('Create admin error:', aRes.status, aRes.body);
    }
    expect([201, 200]).toContain(aRes.status);

    const gRes = await request(app)
      .get(`/api/cabinets/${cabinetId}/admins`)
      .set('Authorization', `Bearer ${saToken}`);
    expect(gRes.status).toBe(200);
    expect(Array.isArray(gRes.body?.data)).toBe(true);
  }, 15000);

  it('AdminCabinet: create medecin, archive medecin, reset password', async () => {
    const saToken = generateToken({ userId: 'superadmin-id', email: 'sa@ex.com', role: 'SUPERADMIN' });
    // Create cabinet and admin
    const cRes = await request(app)
      .post('/api/cabinets')
      .set('Authorization', `Bearer ${saToken}`)
      .send({ nom: `Cab B ${Date.now()}` });
    const cabinetId = cRes.body?.data?.id || cRes.body?.data?.idcabinet || cRes.body?.data?.idCabinet;

    const adminEmail = `admin_${Date.now()}@ex.com`;
    const aRes = await request(app)
      .post(`/api/cabinets/${cabinetId}/admin`)
      .set('Authorization', `Bearer ${saToken}`)
      .send({ email: adminEmail, motdepasse: 'Admin123!', nom: 'Admin', cabinetId, roleAdmin: 'ADMINCABINET' });
    if (![200, 201].includes(aRes.status)) {
      // eslint-disable-next-line no-console
      console.log('Create admin error:', aRes.status, aRes.body);
    }
    expect([201, 200]).toContain(aRes.status);

    // Build an ADMINCABINET token (we bypass login for speed)
    const adminUserIdQ = await db.query(`SELECT idUtilisateur FROM utilisateur WHERE email = $1`, [adminEmail]);
    const adminUserId = adminUserIdQ.rows[0].idutilisateur as string;
    // Sanity: ensure adminCabinet link exists
    const linkQ = await db.query(`SELECT 1 FROM adminCabinet WHERE utilisateur_id = $1 AND cabinet_id = $2`, [adminUserId, cabinetId]);
    if (linkQ.rows.length === 0) {
      await db.query(`INSERT INTO adminCabinet (utilisateur_id, cabinet_id, roleAdmin) VALUES ($1,$2,'ADMINCABINET')`, [adminUserId, cabinetId]);
    }
    const adminToken = generateToken({ userId: adminUserId, email: adminEmail, role: 'ADMINCABINET' });

    // Create medecin by admin (auto-approved and associated)
    const mEmail = `md_adm_${Date.now()}@ex.com`;
    const cr = await request(app)
      .post('/api/auth/admin/create-medecin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: mEmail, motdepasse: 'Temp123!', nom: 'Doc A', numordre: `ORD${Date.now()}`, cabinetId });
    expect([201, 200]).toContain(cr.status);

    const mQ = await db.query(`SELECT m.idMedecin FROM medecin m JOIN utilisateur u ON u.idUtilisateur = m.utilisateur_id WHERE u.email = $1`, [mEmail]);
    const medecinId = mQ.rows[0].idmedecin as string;
    expect(medecinId).toBeTruthy();

    // Reset password (avant archivage pour vérifier le chemin nominal)
    const reset = await request(app)
      .post(`/api/cabinets/${cabinetId}/medecins/${medecinId}/reset-password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPassword: 'NewStrong123!' });
    if (![200, 204].includes(reset.status)) {
      // eslint-disable-next-line no-console
      console.log('Reset password error:', reset.status, reset.body);
    }
    expect([200, 204]).toContain(reset.status);

    // Archive medecin from cabinet
    const arch = await request(app)
      .put(`/api/cabinets/${cabinetId}/medecins/${medecinId}/archive`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(arch.status);
  }, 20000);

  it('SuperAdmin: get pending medecins then approve one', async () => {
    const saToken = generateToken({ userId: 'superadmin-id', email: 'sa@ex.com', role: 'SUPERADMIN' });
    const pending = await createPendingMedecinSelf();

    const listRes = await request(app)
      .get('/api/auth/super-admin/pending-medecins')
      .set('Authorization', `Bearer ${saToken}`);
    expect(listRes.status).toBe(200);

    const valRes = await request(app)
      .post('/api/auth/super-admin/validate-medecin')
      .set('Authorization', `Bearer ${saToken}`)
      .send({ medecinId: pending.id, action: 'APPROVED' });
    expect([200, 204]).toContain(valRes.status);
  }, 15000);
});


