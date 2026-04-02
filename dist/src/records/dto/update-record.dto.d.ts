import { EntryType } from '@prisma/client';
export declare class UpdateRecordDto {
    amount?: number;
    type?: EntryType;
    category?: string;
    date?: Date;
    notes?: string;
}
