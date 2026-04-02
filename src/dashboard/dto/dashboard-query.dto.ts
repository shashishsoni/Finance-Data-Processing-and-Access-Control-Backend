import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsIn(['weekly', 'monthly'])
  period?: 'weekly' | 'monthly';
}
