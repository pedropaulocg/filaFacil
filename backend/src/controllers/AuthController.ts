import type { Request, Response } from 'express';
import type { AuthService } from '../services/AuthService.js';
import { HttpError } from '../errors/HttpError.js';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body as Record<string, unknown>;
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      throw new HttpError(400, 'name, email e password são obrigatórios');
    }
    const result = await this.service.register(name, email, password);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as Record<string, unknown>;
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email e password são obrigatórios');
    }
    const result = await this.service.login(email, password);
    res.status(200).json(result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new HttpError(401, 'Não autenticado');
    }
    const user = await this.service.getUser(req.userId);
    res.status(200).json(user);
  };
}
