import request from 'supertest';
import app from '../index';

import { describe, it, expect } from 'vitest';

describe('Health endpoint', () => {
  it('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});



