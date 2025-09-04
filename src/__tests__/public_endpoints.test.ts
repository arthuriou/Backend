import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';

describe('Public endpoints', () => {
  it('GET / returns API OK', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('GET /api/cabinets returns 200', async () => {
    const res = await request(app).get('/api/cabinets');
    expect([200, 204]).toContain(res.status);
  });
});



