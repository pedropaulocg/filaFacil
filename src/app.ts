import express, { type Express } from 'express';
import { createTicketRouter } from './routes/ticket.routes.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use('/tickets', createTicketRouter());

  return app;
}
