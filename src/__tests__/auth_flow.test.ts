import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';

describe('Auth flow with OTP', () => {
  it('registers patient, blocks login until OTP verified, then allows login', async () => {
    const unique = Date.now();
    const email = `patient_${unique}@example.com`;
    const motdepasse = 'Password123!';

    // Register patient
    const reg = await request(app)
      .post('/api/auth/register-patient')
      .send({ email, motdepasse, nom: 'Test', prenom: 'User' });
    expect([200, 201]).toContain(reg.status);

    // Login should be blocked (403 non vérifié)
    const loginBlocked = await request(app)
      .post('/api/auth/login')
      .send({ email, motdepasse });
    expect(loginBlocked.status).toBe(403);

    // Ensure OTP exists and fetch it from DB
    const otpRes = await db.query(`SELECT code FROM otp_verification WHERE email = $1`, [email]);
    expect(otpRes.rows.length).toBe(1);
    const otp = otpRes.rows[0].code as string;

    // Verify OTP
    const verify = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email, otp });
    expect([200, 204]).toContain(verify.status);

    // Login should succeed now
    const loginOk = await request(app)
      .post('/api/auth/login')
      .send({ email, motdepasse });
    expect(loginOk.status).toBe(200);
    expect(loginOk.body?.data?.token).toBeTruthy();
  }, 15000);
});


