"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    omitPassword(u) {
        const { passwordHash: _, ...rest } = u;
        return rest;
    }
    async create(dto) {
        try {
            const passwordHash = await bcrypt.hash(dto.password, 10);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    name: dto.name,
                    role: dto.role,
                },
            });
            return this.omitPassword(user);
        }
        catch (e) {
            if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                throw new common_1.ConflictException('Email already in use');
            }
            throw e;
        }
    }
    findAll() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.omitPassword(user);
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = {};
        if (dto.email !== undefined)
            data.email = dto.email;
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.role !== undefined)
            data.role = dto.role;
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.password !== undefined)
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        try {
            const user = await this.prisma.user.update({ where: { id }, data });
            return this.omitPassword(user);
        }
        catch (e) {
            if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                throw new common_1.ConflictException('Email already in use');
            }
            throw e;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map