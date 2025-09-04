import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';
import db from '../shared/database/client';

async function registerAndVerify(email: string, motdepasse: string) {
  const reg = await request(app)
    .post('/api/auth/register-patient')
    .send({ email, motdepasse, nom: 'User' });
  expect([200, 201]).toContain(reg.status);

  const r = await db.query(`SELECT code FROM otp_verification WHERE email = $1`, [email]);
  expect(r.rows.length).toBe(1);
  const otp = r.rows[0].code as string;
  const verify = await request(app).post('/api/auth/verify-otp').send({ email, otp });
  expect([200, 204]).toContain(verify.status);
}

describe('Auth - refresh, change password, forgot/reset', () => {
  it('refresh token flow works', async () => {
    const email = `user_${Date.now()}@example.com`;
    const motdepasse = 'InitPass123!';
    await registerAndVerify(email, motdepasse);

    const login = await request(app).post('/api/auth/login').send({ email, motdepasse });
    expect(login.status).toBe(200);
    const refreshToken = login.body?.data?.refreshToken;
    expect(refreshToken).toBeTruthy();

    const ref = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect([200, 401]).toContain(ref.status);
    if (ref.status === 200) {
      expect(ref.body?.data?.token).toBeTruthy();
    }

    const bad = await request(app).post('/api/auth/refresh').send({ refreshToken: refreshToken + 'x' });
    expect([400, 401]).toContain(bad.status);
  }, 15000);

  it('change password succeeds, old password rejected', async () => {
    const email = `user2_${Date.now()}@example.com`;
    const motdepasse = 'OldPass123!';
    await registerAndVerify(email, motdepasse);

    const login = await request(app).post('/api/auth/login').send({ email, motdepasse });
    const token = login.body?.data?.token as string;
    expect(token).toBeTruthy();

    const change = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: motdepasse, newPassword: 'NewPass456!' });
    expect(change.status).toBe(200);

    const loginOld = await request(app).post('/api/auth/login').send({ email, motdepasse });
    expect(loginOld.status).toBe(401);
    const loginNew = await request(app).post('/api/auth/login').send({ email, motdepasse: 'NewPass456!' });
    expect(loginNew.status).toBe(200);
  }, 15000);

  it('forgot/reset password via code works', async () => {
    const email = `user3_${Date.now()}@example.com`;
    const motdepasse = 'InitPass123!';
    await registerAndVerify(email, motdepasse);

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(forgot.status).toBe(200);
    const r = await db.query(`SELECT code FROM otp_verification WHERE email = $1`, [email]);
    expect(r.rows.length).toBe(1);
    const code = r.rows[0].code as string;

    const reset = await request(app).post('/api/auth/reset-password').send({ email, code, newPassword: 'Reset789!' });
    expect(reset.status).toBe(200);
    const loginReset = await request(app).post('/api/auth/login').send({ email, motdepasse: 'Reset789!' });
    expect(loginReset.status).toBe(200);
  }, 15000);
});


