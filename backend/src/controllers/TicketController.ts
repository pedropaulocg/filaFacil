import type { Request, Response } from 'express';
import type { TicketService } from '../services/TicketService.js';
import { HttpError } from '../errors/HttpError.js';

export class TicketController {
  constructor(private readonly service: TicketService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { kind } = req.body as Record<string, unknown>;
    if (kind !== 'normal' && kind !== 'priority') {
      throw new HttpError(400, "kind deve ser 'normal' ou 'priority'");
    }
    const ticket = await this.service.generate(kind);
    res.status(201).json(ticket);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const tickets = await this.service.list();
    res.status(200).json(tickets);
  };

  call = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new HttpError(401, 'Não autenticado');
    }
    const ticket = await this.service.callNext(req.userId);
    res.status(200).json(ticket);
  };

  finish = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const ticket = await this.service.finish(req.params.id);
    res.status(200).json(ticket);
  };
}
