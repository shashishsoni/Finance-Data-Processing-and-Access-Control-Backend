import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { EntryType } from '@prisma/client';

export class CreateRecordDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(EntryType)
  type!: EntryType;

  @IsString()
  @MinLength(1)
  category!: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
