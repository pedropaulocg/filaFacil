import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { createTicketRouter } from './routes/ticket.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { AuthService } from './services/AuthService.js';
import { requireAuth } from './middleware/requireAuth.js';
import { HttpError } from './errors/HttpError.js';

export function createApp(): Express {
  const app = express();
  const authService = new AuthService();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/auth', createAuthRouter(authService));
  app.use('/tickets', requireAuth(authService), createTicketRouter());

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
