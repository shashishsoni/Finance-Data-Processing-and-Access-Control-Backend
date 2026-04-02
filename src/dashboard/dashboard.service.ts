import { Injectable } from '@nestjs/common';
import { EntryType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private baseWhere(q: DashboardQueryDto): Prisma.FinancialRecordWhereInput {
    const date: { gte?: Date; lte?: Date } = {};
    if (q.fromDate) date.gte = new Date(q.fromDate);
    if (q.toDate) date.lte = new Date(q.toDate);
    return {
      deletedAt: null,
      ...(Object.keys(date).length && { date }),
    };
  }

  async summary(q: DashboardQueryDto) {
    const where = this.baseWhere(q);
    const [inc, exp] = await Promise.all([
      this.prisma.financialRecord.aggregate({
        where: { ...where, type: EntryType.INCOME },
        _sum: { amount: true },
      }),
      this.prisma.financialRecord.aggregate({
        where: { ...where, type: EntryType.EXPENSE },
        _sum: { amount: true },
      }),
    ]);
    const totalIncome = Number(inc._sum.amount ?? 0);
    const totalExpense = Number(exp._sum.amount ?? 0);
    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense };
  }

  async categoryTotals(q: DashboardQueryDto) {
    const rows = await this.prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: this.baseWhere(q),
      _sum: { amount: true },
    });
    return rows.map((r) => ({
      category: r.category,
      type: r.type,
      total: Number(r._sum.amount ?? 0),
    }));
  }

  async trends(q: DashboardQueryDto & { period?: 'weekly' | 'monthly' }) {
    const period = q.period ?? 'monthly';
    const rows = await this.prisma.financialRecord.findMany({
      where: this.baseWhere(q),
      select: { date: true, type: true, amount: true },
    });
    const key = (d: Date) =>
      period === 'monthly'
        ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
        : isoWeekKey(d);
    const map = new Map<string, { period: string; income: number; expense: number }>();
    for (const r of rows) {
      const p = key(r.date);
      let e = map.get(p);
      if (!e) {
        e = { period: p, income: 0, expense: 0 };
        map.set(p, e);
      }
      const n = Number(r.amount);
      if (r.type === EntryType.INCOME) e.income += n;
      else e.expense += n;
    }
    return [...map.values()].sort((a, b) => a.period.localeCompare(b.period));
  }

  async recentActivity(limit = 10) {
    const rows = await this.prisma.financialRecord.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      take: Math.min(50, Math.max(1, limit)),
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        notes: true,
      },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
  }
}

function isoWeekKey(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay() || 7;
  if (day !== 1) x.setUTCDate(x.getUTCDate() - (day - 1));
  const y = x.getUTCFullYear();
  const m = String(x.getUTCMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(x.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dayOfMonth}`;
}
