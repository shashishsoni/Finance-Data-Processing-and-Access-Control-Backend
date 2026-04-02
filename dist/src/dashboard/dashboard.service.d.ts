import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private baseWhere;
    summary(q: DashboardQueryDto): Promise<{
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
    }>;
    categoryTotals(q: DashboardQueryDto): Promise<{
        category: string;
        type: import("@prisma/client").$Enums.EntryType;
        total: number;
    }[]>;
    trends(q: DashboardQueryDto & {
        period?: 'weekly' | 'monthly';
    }): Promise<{
        period: string;
        income: number;
        expense: number;
    }[]>;
    recentActivity(limit?: number): Promise<{
        amount: number;
        id: string;
        type: import("@prisma/client").$Enums.EntryType;
        category: string;
        date: Date;
        notes: string | null;
    }[]>;
}
