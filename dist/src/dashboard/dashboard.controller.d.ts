import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
declare class RecentQueryDto {
    limit?: number;
}
export declare class DashboardController {
    private readonly dashboard;
    constructor(dashboard: DashboardService);
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
    trends(q: DashboardQueryDto): Promise<{
        period: string;
        income: number;
        expense: number;
    }[]>;
    recentActivity(query: RecentQueryDto): Promise<{
        amount: number;
        id: string;
        type: import("@prisma/client").$Enums.EntryType;
        category: string;
        date: Date;
        notes: string | null;
    }[]>;
}
export {};
