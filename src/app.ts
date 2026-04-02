import { readFileSync } from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import type { Env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { buildRouter } from './router';

export function createApp(env: Env) {
  const app = express();
  app.use(express.json());
  app.use(helmet());
  app.use(cors());

  try {
    const doc = YAML.parse(readFileSync(path.join(process.cwd(), 'openapi.yaml'), 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(doc));
  } catch {
    /* optional in dev */
  }

  app.use(buildRouter(env));
  app.use(errorHandler(env));
  return app;
}
