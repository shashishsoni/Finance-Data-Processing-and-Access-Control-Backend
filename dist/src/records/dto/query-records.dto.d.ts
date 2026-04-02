import { EntryType } from '@prisma/client';
export declare class QueryRecordsDto {
    fromDate?: string;
    toDate?: string;
    category?: string;
    type?: EntryType;
    page?: number;
    limit?: number;
}
