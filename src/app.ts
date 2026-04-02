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
  app.use(
    env.NODE_ENV === 'production'
      ? helmet()
      : helmet({ contentSecurityPolicy: false })
  );
  app.use(cors());

  const openApiPath = path.join(__dirname, '..', 'openapi.yaml');
  app.get('/', (_req, res) => res.redirect(302, '/api-docs'));

  try {
    const doc = YAML.parse(readFileSync(openApiPath, 'utf8'));
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(doc, {
        customSiteTitle: 'Finance Dashboard API',
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'list',
          filter: true,
          tryItOutEnabled: true,
        },
      })
    );
  } catch (err) {
    console.error('Failed to load OpenAPI spec from', openApiPath, err);
    app.get('/api-docs', (_req, res) => {
      res
        .status(503)
        .type('text')
        .send(
          `OpenAPI file missing or invalid YAML. Expected: ${openApiPath}`
        );
    });
  }

  app.use(buildRouter(env));
  app.use(errorHandler(env));
  return app;
}
