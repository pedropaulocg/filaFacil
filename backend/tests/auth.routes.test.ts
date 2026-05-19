import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

const validUser = {
  name: 'Pedro',
  email: 'pedro@example.com',
  password: 'senha123',
};

describe('POST /auth/register', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  it('registers a user and returns 201 with a token', async () => {
    const response = await request(app).post('/auth/register').send(validUser);

    expect(response.status).toBe(201);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.user).toMatchObject({ name: 'Pedro', email: 'pedro@example.com' });
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/auth/register').send(validUser);
    const response = await request(app).post('/auth/register').send(validUser);

    expect(response.status).toBe(409);
  });

  it('rejects missing fields with 400', async () => {
    const response = await request(app).post('/auth/register').send({ email: 'x@x.com' });

    expect(response.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  let app: Express;

  beforeEach(async () => {
    app = createApp();
    await request(app).post('/auth/register').send(validUser);
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
  });

  it('rejects a wrong password with 401', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: validUser.email, password: 'errada' });

    expect(response.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  it('returns the current user with a valid token', async () => {
    const registered = await request(app).post('/auth/register').send(validUser);
    const token = registered.body.token as string;

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ email: validUser.email });
  });

  it('rejects a request without a token with 401', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
  });
});
