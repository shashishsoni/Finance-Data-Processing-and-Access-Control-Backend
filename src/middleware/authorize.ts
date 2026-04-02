import type { Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { HttpError } from './httpError';

export function authorize(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, 'Unauthorized'));
    if (!allowed.includes(req.user.role)) return next(new HttpError(403, 'Forbidden'));
    next();
  };
}
