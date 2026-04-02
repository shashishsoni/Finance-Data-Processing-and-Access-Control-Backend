import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/httpError';
import type { createRecordBody, listRecordsQuery, updateRecordBody } from '../schemas';

type CreateIn = z.infer<typeof createRecordBody>;
type UpdateIn = z.infer<typeof updateRecordBody>;
type ListIn = z.infer<typeof listRecordsQuery>;

function parseSort(sort: string): Prisma.FinancialRecordOrderByWithRelationInput {
  const [field, dir] = sort.split(':');
  const d = dir === 'asc' ? 'asc' : 'desc';
  if (field === 'amount') return { amount: d };
  if (field === 'category') return { category: d };
  return { date: d };
}

function serialize(r: {
  id: string;
  amount: unknown;
  type: string;
  category: string;
  date: Date;
  notes: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...r,
    amount: String(r.amount),
  };
}

export async function listRecords(q: ListIn) {
  const { page, limit, from, to, category, type, q: search } = q;
  const where: Prisma.FinancialRecordWhereInput = {
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(category ? { category } : {}),
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { category: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: parseSort(q.sort),
    }),
    prisma.financialRecord.count({ where }),
  ]);
  return { items: rows.map(serialize), total, page, limit };
}

export async function getRecord(id: string) {
  const r = await prisma.financialRecord.findUnique({ where: { id } });
  if (!r) throw new HttpError(404, 'Record not found');
  return serialize(r);
}

export async function createRecord(adminId: string, data: CreateIn) {
  const ownerId = data.ownerId ?? adminId;
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) throw new HttpError(400, 'Invalid ownerId');
  const r = await prisma.financialRecord.create({
    data: {
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      notes: data.notes,
      ownerId,
    },
  });
  return serialize(r);
}

export async function updateRecord(id: string, data: UpdateIn) {
  const existing = await prisma.financialRecord.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Record not found');
  if (data.ownerId) {
    const o = await prisma.user.findUnique({ where: { id: data.ownerId } });
    if (!o) throw new HttpError(400, 'Invalid ownerId');
  }
  const r = await prisma.financialRecord.update({
    where: { id },
    data: {
      ...data,
      amount: data.amount !== undefined ? data.amount : undefined,
    },
  });
  return serialize(r);
}

export async function deleteRecord(id: string) {
  try {
    await prisma.financialRecord.delete({ where: { id } });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      throw new HttpError(404, 'Record not found');
    }
    throw e;
  }
}
