import { Router } from 'express';
import { TicketController } from '../controllers/TicketController.js';
import { TicketService } from '../services/TicketService.js';

export function createTicketRouter(service: TicketService = new TicketService()): Router {
  const router = Router();
  const controller = new TicketController(service);

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.post('/call', controller.call);
  router.post('/:id/finish', controller.finish);
  router.post('/:id/absent', controller.markAbsent);
  router.post('/:id/recall', controller.recall);

  return router;
}
