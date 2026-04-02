import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type FinancialRecord } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordsDto } from './dto/query-records.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private out(r: FinancialRecord) {
    return { ...r, amount: Number(r.amount) };
  }

  async create(userId: string, dto: CreateRecordDto) {
    const row = await this.prisma.financialRecord.create({
      data: {
        amount: new Prisma.Decimal(dto.amount),
        type: dto.type,
        category: dto.category,
        date: dto.date,
        notes: dto.notes,
        createdByUserId: userId,
      },
    });
    return this.out(row);
  }

  async findAll(q: QueryRecordsDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const date: { gte?: Date; lte?: Date } = {};
    if (q.fromDate) date.gte = new Date(q.fromDate);
    if (q.toDate) date.lte = new Date(q.toDate);
    const where: Prisma.FinancialRecordWhereInput = {
      deletedAt: null,
      ...(Object.keys(date).length && { date }),
      ...(q.category && { category: q.category }),
      ...(q.type && { type: q.type }),
    };
    const [items, total] = await Promise.all([
      this.prisma.financialRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.financialRecord.count({ where }),
    ]);
    return {
      data: items.map((r) => ({
        ...this.out(r),
        createdBy: r.createdBy,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const r = await this.prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    if (!r) throw new NotFoundException('Record not found');
    return { ...this.out(r), createdBy: r.createdBy };
  }

  async update(id: string, dto: UpdateRecordDto) {
    await this.findOne(id);
    const data: Prisma.FinancialRecordUpdateInput = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.date !== undefined) data.date = dto.date;
    if (dto.notes !== undefined) data.notes = dto.notes;
    const row = await this.prisma.financialRecord.update({ where: { id }, data });
    return this.out(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { deleted: true };
  }
}
