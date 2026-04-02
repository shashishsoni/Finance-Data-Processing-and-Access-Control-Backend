import type { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import type { Env } from '../config/env';
import { HttpError } from '../middleware/httpError';

export async function login(env: Env, email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status === 'INACTIVE') throw new HttpError(401, 'Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  const token = jwt.sign(
    { sub: user.id, role: user.role, status: user.status as UserStatus },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, status: user.status },
  };
}
