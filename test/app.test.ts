import request from 'supertest';
import { loadEnv } from '../src/config/env';
import { createApp } from '../src/app';

const env = loadEnv();
const app = createApp(env);

describe('API', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('POST /auth/login validation', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('viewer cannot list records', async () => {
    const login = await request(app).post('/auth/login').send({
      email: 'viewer@example.com',
      password: 'Viewer123!',
    });
    expect(login.status).toBe(200);
    const res = await request(app)
      .get('/records')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });

  it('viewer dashboard', async () => {
    const login = await request(app).post('/auth/login').send({
      email: 'viewer@example.com',
      password: 'Viewer123!',
    });
    const res = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalIncome');
    expect(Array.isArray(res.body.recentActivity)).toBe(true);
  });
});
