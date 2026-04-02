import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordsDto } from './dto/query-records.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
export declare class RecordsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private out;
    create(userId: string, dto: CreateRecordDto): Promise<{
        amount: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.EntryType;
        category: string;
        date: Date;
        notes: string | null;
        createdByUserId: string;
        deletedAt: Date | null;
    }>;
    findAll(q: QueryRecordsDto): Promise<{
        data: {
            createdBy: {
                id: string;
                email: string;
                name: string;
            };
            amount: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.EntryType;
            category: string;
            date: Date;
            notes: string | null;
            createdByUserId: string;
            deletedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
        amount: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.EntryType;
        category: string;
        date: Date;
        notes: string | null;
        createdByUserId: string;
        deletedAt: Date | null;
    }>;
    update(id: string, dto: UpdateRecordDto): Promise<{
        amount: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.EntryType;
        category: string;
        date: Date;
        notes: string | null;
        createdByUserId: string;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
