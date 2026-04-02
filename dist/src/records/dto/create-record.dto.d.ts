import { EntryType } from '@prisma/client';
export declare class CreateRecordDto {
    amount: number;
    type: EntryType;
    category: string;
    date: Date;
    notes?: string;
}
