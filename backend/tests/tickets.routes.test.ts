import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

describe('tickets API', () => {
  let app: Express;
  let token: string;

  beforeEach(async () => {
    app = createApp();
    const registered = await request(app)
      .post('/auth/register')
      .send({ name: 'Operador', email: 'op@example.com', password: 'senha123' });
    token = registered.body.token as string;
  });

  function authed(method: 'get' | 'post', path: string) {
    return request(app)[method](path).set('Authorization', `Bearer ${token}`);
  }

  it('rejects requests without a token', async () => {
    const response = await request(app).get('/tickets');
    expect(response.status).toBe(401);
  });

  it('creates a normal ticket with a NOR_ code', async () => {
    const response = await authed('post', '/tickets').send({ kind: 'normal' });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('NOR_0001');
    expect(response.body.position).toBe(1);
  });

  it('creates a priority ticket with a PRE_ code', async () => {
    const response = await authed('post', '/tickets').send({ kind: 'priority' });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('PRE_001');
  });

  it('rejects an invalid kind with 400', async () => {
    const response = await authed('post', '/tickets').send({ kind: 'vip' });
    expect(response.status).toBe(400);
  });

  it('lists generated tickets', async () => {
    await authed('post', '/tickets').send({ kind: 'normal' });
    await authed('post', '/tickets').send({ kind: 'priority' });

    const response = await authed('get', '/tickets');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('calls the next ticket', async () => {
    await authed('post', '/tickets').send({ kind: 'normal' });

    const response = await authed('post', '/tickets/call');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('called');
  });

  it('returns 404 when calling with an empty queue', async () => {
    const response = await authed('post', '/tickets/call');
    expect(response.status).toBe(404);
  });

  it('finishes a called ticket', async () => {
    await authed('post', '/tickets').send({ kind: 'normal' });
    const called = await authed('post', '/tickets/call');

    const response = await authed('post', `/tickets/${called.body.id}/finish`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.finishedAt).not.toBeNull();
  });

  it('returns 409 when finishing a waiting ticket', async () => {
    const created = await authed('post', '/tickets').send({ kind: 'normal' });

    const response = await authed('post', `/tickets/${created.body.id}/finish`);
    expect(response.status).toBe(409);
  });

  it('returns 404 when finishing an unknown ticket', async () => {
    const response = await authed('post', '/tickets/nao-existe/finish');
    expect(response.status).toBe(404);
  });

  it('marks a called ticket as absent and recalls it', async () => {
    await authed('post', '/tickets').send({ kind: 'normal' });
    const called = await authed('post', '/tickets/call');

    const absent = await authed('post', `/tickets/${called.body.id}/absent`);
    expect(absent.status).toBe(200);
    expect(absent.body.status).toBe('absent');

    const recalled = await authed('post', `/tickets/${called.body.id}/recall`);
    expect(recalled.status).toBe(200);
    expect(recalled.body.status).toBe('called');
  });

  it('returns 409 when marking a waiting ticket as absent', async () => {
    const created = await authed('post', '/tickets').send({ kind: 'normal' });

    const response = await authed('post', `/tickets/${created.body.id}/absent`);
    expect(response.status).toBe(409);
  });
});
