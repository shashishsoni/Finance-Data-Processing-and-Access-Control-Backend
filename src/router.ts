import { Role } from '@prisma/client';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { Env } from './config/env';
import { authenticate } from './middleware/authenticate';
import { authorize } from './middleware/authorize';
import { asyncHandler } from './middleware/asyncHandler';
import {
  createRecordBody,
  createUserBody,
  dashboardQuery,
  listQuery,
  listRecordsQuery,
  loginBody,
  updateRecordBody,
  updateUserBody,
} from './schemas';
import * as auth from './services/auth.service';
import * as dash from './services/dashboard.service';
import * as records from './services/records.service';
import * as users from './services/users.service';

function pid(req: { params: Record<string, string | string[] | undefined> }, k: string) {
  const v = req.params[k];
  return (Array.isArray(v) ? v[0] : v) ?? '';
}

export function buildRouter(env: Env) {
  const r = Router();
  const authed = authenticate(env);
  const admin = [authed, authorize(Role.ADMIN)];
  const recordRead = [authed, authorize(Role.ADMIN, Role.ANALYST)];
  const recordWrite = [authed, authorize(Role.ADMIN)];

  r.get('/health', (_req, res) => res.json({ ok: true }));

  r.post(
    '/auth/login',
    rateLimit({ windowMs: 60_000, max: 30 }),
    asyncHandler(async (req, res) => {
      const body = loginBody.parse(req.body);
      res.json(await auth.login(env, body.email, body.password));
    })
  );

  r.get(
    '/dashboard/summary',
    authed,
    asyncHandler(async (req, res) => {
      const q = dashboardQuery.parse(req.query);
      res.json(await dash.dashboardSummary(req.user!.role, q));
    })
  );

  r.get('/users', ...admin, asyncHandler(async (req, res) => {
    res.json(await users.listUsers(listQuery.parse(req.query)));
  }));
  r.post('/users', ...admin, asyncHandler(async (req, res) => {
    res.status(201).json(await users.createUser(createUserBody.parse(req.body)));
  }));
  r.get('/users/:id', ...admin, asyncHandler(async (req, res) => {
    res.json(await users.getUser(pid(req, 'id')));
  }));
  r.patch('/users/:id', ...admin, asyncHandler(async (req, res) => {
    res.json(await users.updateUser(pid(req, 'id'), req.user!.id, updateUserBody.parse(req.body)));
  }));
  r.delete('/users/:id', ...admin, asyncHandler(async (req, res) => {
    await users.deleteUser(pid(req, 'id'), req.user!.id);
    res.status(204).send();
  }));

  r.get('/records', ...recordRead, asyncHandler(async (req, res) => {
    res.json(await records.listRecords(listRecordsQuery.parse(req.query)));
  }));
  r.get('/records/:id', ...recordRead, asyncHandler(async (req, res) => {
    res.json(await records.getRecord(pid(req, 'id')));
  }));
  r.post('/records', ...recordWrite, asyncHandler(async (req, res) => {
    res.status(201).json(await records.createRecord(req.user!.id, createRecordBody.parse(req.body)));
  }));
  r.patch('/records/:id', ...recordWrite, asyncHandler(async (req, res) => {
    res.json(await records.updateRecord(pid(req, 'id'), updateRecordBody.parse(req.body)));
  }));
  r.delete('/records/:id', ...recordWrite, asyncHandler(async (req, res) => {
    await records.deleteRecord(pid(req, 'id'));
    res.status(204).send();
  }));

  return r;
}
