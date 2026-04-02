import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { Role, UserStatus } from '@prisma/client';
import type { Env } from '../config/env';
import { HttpError } from './httpError';

type Payload = { sub: string; role: Role; status: UserStatus };

export function authenticate(env: Env): RequestHandler {
  return (req, _res, next) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return next(new HttpError(401, 'Missing or invalid authorization'));
    try {
      const p = jwt.verify(h.slice(7), env.JWT_SECRET) as Payload;
      if (p.status === 'INACTIVE') return next(new HttpError(401, 'Account inactive'));
      req.user = { id: p.sub, role: p.role, status: p.status };
      next();
    } catch {
      return next(new HttpError(401, 'Invalid or expired token'));
    }
  };
}
