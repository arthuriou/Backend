import request from 'supertest';
import app from '../index';
import { describe, it, expect } from 'vitest';

describe('Auth guards', () => {
  it('POST /api/messagerie/messages without token -> 401', async () => {
    const res = await request(app).post('/api/messagerie/messages').send({ conversation_id: 'x', contenu: 'hi' });
    expect([401, 403]).toContain(res.status);
  });

  it('GET /api/rendezvous with no token -> 401 (if protected)', async () => {
    const res = await request(app).get('/api/rendezvous');
    expect([401, 404]).toContain(res.status);
  });
});



