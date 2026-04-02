"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    baseWhere(q) {
        const date = {};
        if (q.fromDate)
            date.gte = new Date(q.fromDate);
        if (q.toDate)
            date.lte = new Date(q.toDate);
        return {
            deletedAt: null,
            ...(Object.keys(date).length && { date }),
        };
    }
    async summary(q) {
        const where = this.baseWhere(q);
        const [inc, exp] = await Promise.all([
            this.prisma.financialRecord.aggregate({
                where: { ...where, type: client_1.EntryType.INCOME },
                _sum: { amount: true },
            }),
            this.prisma.financialRecord.aggregate({
                where: { ...where, type: client_1.EntryType.EXPENSE },
                _sum: { amount: true },
            }),
        ]);
        const totalIncome = Number(inc._sum.amount ?? 0);
        const totalExpense = Number(exp._sum.amount ?? 0);
        return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense };
    }
    async categoryTotals(q) {
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
    async trends(q) {
        const period = q.period ?? 'monthly';
        const rows = await this.prisma.financialRecord.findMany({
            where: this.baseWhere(q),
            select: { date: true, type: true, amount: true },
        });
        const key = (d) => period === 'monthly'
            ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
            : isoWeekKey(d);
        const map = new Map();
        for (const r of rows) {
            const p = key(r.date);
            let e = map.get(p);
            if (!e) {
                e = { period: p, income: 0, expense: 0 };
                map.set(p, e);
            }
            const n = Number(r.amount);
            if (r.type === client_1.EntryType.INCOME)
                e.income += n;
            else
                e.expense += n;
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
function isoWeekKey(d) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = x.getUTCDay() || 7;
    if (day !== 1)
        x.setUTCDate(x.getUTCDate() - (day - 1));
    const y = x.getUTCFullYear();
    const m = String(x.getUTCMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(x.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${dayOfMonth}`;
}
//# sourceMappingURL=dashboard.service.js.map