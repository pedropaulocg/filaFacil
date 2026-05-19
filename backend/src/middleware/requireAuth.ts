import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../services/AuthService.js';
import { HttpError } from '../errors/HttpError.js';

export function requireAuth(service: AuthService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Token ausente');
    }
    req.userId = service.verifyToken(header.slice(7));
    next();
  };
}
