import { RecordType, Role, UserStatus } from '@prisma/client';
import { z } from 'zod';

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus).optional(),
});

export const updateUserBody = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createRecordBody = z.object({
  amount: z.coerce.number().positive(),
  type: z.nativeEnum(RecordType),
  category: z.string().min(1).max(128),
  date: z.coerce.date(),
  notes: z.string().max(2000).optional(),
  ownerId: z.string().min(1).optional(),
});

export const updateRecordBody = createRecordBody.partial();

export const listRecordsQuery = listQuery.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(RecordType).optional(),
  q: z.string().optional(),
  sort: z.string().default('date:desc'),
});

export const dashboardQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  granularity: z.enum(['week', 'month']).default('month'),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
