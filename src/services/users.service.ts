import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { z } from 'zod';
import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/httpError';
import type { createUserBody, listQuery, updateUserBody } from '../schemas';

type CreateIn = z.infer<typeof createUserBody>;
type UpdateIn = z.infer<typeof updateUserBody>;
type ListIn = z.infer<typeof listQuery>;

function strip(u: { passwordHash: string; [k: string]: unknown }) {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

async function adminCount() {
  return prisma.user.count({ where: { role: Role.ADMIN, status: 'ACTIVE' } });
}

export async function listUsers(q: ListIn) {
  const { page, limit } = q;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  return { items: items.map(strip), total, page, limit };
}

export async function createUser(data: CreateIn) {
  try {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        status: data.status ?? 'ACTIVE',
      },
    });
    return strip(user);
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      throw new HttpError(409, 'Email already in use');
    }
    throw e;
  }
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'User not found');
  return strip(user);
}

export async function updateUser(id: string, actorId: string, data: UpdateIn) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'User not found');

  if (data.role && data.role !== Role.ADMIN && user.role === Role.ADMIN) {
    const n = await adminCount();
    if (n <= 1) throw new HttpError(400, 'Cannot remove the last admin');
  }
  if (data.status === 'INACTIVE' && user.role === Role.ADMIN) {
    const n = await adminCount();
    if (n <= 1 && user.status === 'ACTIVE') throw new HttpError(400, 'Cannot deactivate the last admin');
  }
  if (id === actorId && data.role && data.role !== Role.ADMIN) {
    const n = await prisma.user.count({ where: { role: Role.ADMIN, status: 'ACTIVE', id: { not: actorId } } });
    if (n === 0) throw new HttpError(400, 'Cannot demote the only admin');
  }

  const { password, ...fields } = data;
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { ...fields, ...(passwordHash ? { passwordHash } : {}) },
    });
    return strip(updated);
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      throw new HttpError(409, 'Email already in use');
    }
    throw e;
  }
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw new HttpError(400, 'Cannot delete yourself');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'User not found');
  if (user.role === Role.ADMIN) {
    const n = await adminCount();
    if (n <= 1) throw new HttpError(400, 'Cannot delete the last admin');
  }
  await prisma.user.delete({ where: { id } });
}
