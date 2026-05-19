import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import type { AuthService } from '../services/AuthService.js';
import { requireAuth } from '../middleware/requireAuth.js';

export function createAuthRouter(service: AuthService): Router {
  const router = Router();
  const controller = new AuthController(service);

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', requireAuth(service), controller.me);

  return router;
}
