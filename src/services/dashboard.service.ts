import { Prisma, RecordType, Role } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../lib/prisma';
import type { dashboardQuery } from '../schemas';

type Q = z.infer<typeof dashboardQuery>;

function dec(v: Prisma.Decimal | null | undefined) {
  return String(v ?? 0);
}

export async function dashboardSummary(role: Role, q: Q) {
  const to = q.to ?? new Date();
  const from = q.from ?? new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
  const { granularity, limit } = q;

  const where: Prisma.FinancialRecordWhereInput = {
    date: { gte: from, lte: to },
  };

  const [incomeAgg, expenseAgg, byCategory, recentRows, trendRows] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...where, type: RecordType.INCOME },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { ...where, type: RecordType.EXPENSE },
      _sum: { amount: true },
    }),
    prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
    }),
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    }),
    granularity === 'week'
      ? prisma.$queryRaw<{ bucket: Date; type: string; sum: unknown }[]>`
          SELECT date_trunc('week', f.date::timestamp) AS bucket,
                 f.type::text AS type,
                 SUM(f.amount) AS sum
          FROM "FinancialRecord" f
          WHERE f.date >= ${from} AND f.date <= ${to}
          GROUP BY 1, f.type
          ORDER BY 1`
      : prisma.$queryRaw<{ bucket: Date; type: string; sum: unknown }[]>`
          SELECT date_trunc('month', f.date::timestamp) AS bucket,
                 f.type::text AS type,
                 SUM(f.amount) AS sum
          FROM "FinancialRecord" f
          WHERE f.date >= ${from} AND f.date <= ${to}
          GROUP BY 1, f.type
          ORDER BY 1`,
  ]);

  const totalIncome = dec(incomeAgg._sum.amount);
  const totalExpenses = dec(expenseAgg._sum.amount);
  const net = new Prisma.Decimal(totalIncome).sub(new Prisma.Decimal(totalExpenses));

  const recentActivity =
    role === Role.VIEWER
      ? recentRows.map((r) => ({
          date: r.date,
          type: r.type,
          category: r.category,
          amount: String(r.amount),
        }))
      : recentRows.map((r) => ({
          id: r.id,
          date: r.date,
          type: r.type,
          category: r.category,
          amount: String(r.amount),
          notes: r.notes,
          ownerId: r.ownerId,
        }));

  return {
    totalIncome,
    totalExpenses,
    netBalance: String(net),
    byCategory: byCategory.map((b) => ({
      category: b.category,
      type: b.type,
      total: dec(b._sum.amount),
    })),
    recentActivity,
    trends: trendRows.map((t) => ({
      bucket: t.bucket,
      type: t.type,
      sum: String(t.sum),
    })),
  };
}
