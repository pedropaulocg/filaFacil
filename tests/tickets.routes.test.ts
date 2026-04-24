import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

describe('POST /tickets', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  it('creates a ticket and returns 201 with number and createdAt', async () => {
    const response = await request(app).post('/tickets');

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ number: 1 });
    expect(typeof response.body.createdAt).toBe('string');
  });

  it('assigns incrementing numbers to successive tickets', async () => {
    const first = await request(app).post('/tickets');
    const second = await request(app).post('/tickets');

    expect(first.body.number).toBe(1);
    expect(second.body.number).toBe(2);
  });
});
