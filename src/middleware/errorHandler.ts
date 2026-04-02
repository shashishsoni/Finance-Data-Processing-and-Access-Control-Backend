import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './httpError';
import type { Env } from '../config/env';

export function errorHandler(env: Env): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({ message: 'Validation failed', details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ message: err.message, details: err.details });
      return;
    }
    console.error(err);
    const body =
      env.NODE_ENV === 'production'
        ? { message: 'Internal server error' }
        : { message: err instanceof Error ? err.message : 'Error' };
    res.status(500).json(body);
  };
}
