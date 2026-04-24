import type { Request, Response } from 'express';
import type { TicketService } from '../services/TicketService.js';

export class TicketController {
  constructor(private readonly service: TicketService) {}

  create = (_req: Request, res: Response): void => {
    const ticket = this.service.generate();
    res.status(201).json(ticket);
  };
}
