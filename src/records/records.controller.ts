import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordsDto } from './dto/query-records.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsService } from './records.service';

@Controller('records')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser('id') userId: string, @Body() dto: CreateRecordDto) {
    return this.records.create(userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ANALYST)
  findAll(@Query() q: QueryRecordsDto) {
    return this.records.findAll(q);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ANALYST)
  findOne(@Param('id') id: string) {
    return this.records.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRecordDto) {
    return this.records.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.records.remove(id);
  }
}
