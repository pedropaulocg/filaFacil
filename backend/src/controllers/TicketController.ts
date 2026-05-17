import type { Request, Response } from 'express';
import type { TicketService } from '../services/TicketService.js';

export class TicketController {
  constructor(private readonly service: TicketService) {}

  create = async (_req: Request, res: Response): Promise<void> => {
    const ticket = await this.service.generate();
    res.status(201).json(ticket);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const tickets = await this.service.list();
    res.status(200).json(tickets);
  };
}
