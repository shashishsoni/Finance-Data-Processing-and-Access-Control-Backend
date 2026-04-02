import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

class RecentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.VIEWER, Role.ANALYST, Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  summary(@Query() q: DashboardQueryDto) {
    return this.dashboard.summary(q);
  }

  @Get('category-totals')
  categoryTotals(@Query() q: DashboardQueryDto) {
    return this.dashboard.categoryTotals(q);
  }

  @Get('trends')
  trends(@Query() q: DashboardQueryDto) {
    return this.dashboard.trends(q);
  }

  @Get('recent-activity')
  recentActivity(@Query() query: RecentQueryDto) {
    return this.dashboard.recentActivity(query.limit);
  }
}
