import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const r = schema.safeParse(process.env);
  if (!r.success) {
    console.error(r.error.flatten().fieldErrors);
    process.exit(1);
  }
  return r.data;
}
