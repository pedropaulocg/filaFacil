import { Router } from 'express';
import { TicketController } from '../controllers/TicketController.js';
import { TicketService } from '../services/TicketService.js';

export function createTicketRouter(service: TicketService = new TicketService()): Router {
  const router = Router();
  const controller = new TicketController(service);

  router.post('/', controller.create);
  router.get('/', controller.list);

  return router;
}
