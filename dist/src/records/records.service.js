"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let RecordsService = class RecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    out(r) {
        return { ...r, amount: Number(r.amount) };
    }
    async create(userId, dto) {
        const row = await this.prisma.financialRecord.create({
            data: {
                amount: new client_1.Prisma.Decimal(dto.amount),
                type: dto.type,
                category: dto.category,
                date: dto.date,
                notes: dto.notes,
                createdByUserId: userId,
            },
        });
        return this.out(row);
    }
    async findAll(q) {
        const page = q.page ?? 1;
        const limit = q.limit ?? 20;
        const date = {};
        if (q.fromDate)
            date.gte = new Date(q.fromDate);
        if (q.toDate)
            date.lte = new Date(q.toDate);
        const where = {
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
    async findOne(id) {
        const r = await this.prisma.financialRecord.findFirst({
            where: { id, deletedAt: null },
            include: { createdBy: { select: { id: true, name: true, email: true } } },
        });
        if (!r)
            throw new common_1.NotFoundException('Record not found');
        return { ...this.out(r), createdBy: r.createdBy };
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = {};
        if (dto.amount !== undefined)
            data.amount = new client_1.Prisma.Decimal(dto.amount);
        if (dto.type !== undefined)
            data.type = dto.type;
        if (dto.category !== undefined)
            data.category = dto.category;
        if (dto.date !== undefined)
            data.date = dto.date;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        const row = await this.prisma.financialRecord.update({ where: { id }, data });
        return this.out(row);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.financialRecord.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { deleted: true };
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordsService);
//# sourceMappingURL=records.service.js.map