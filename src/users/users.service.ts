import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private omitPassword<T extends { passwordHash: string }>(u: T) {
    const { passwordHash: _, ...rest } = u;
    return rest;
  }

  async create(dto: CreateUserDto) {
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
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Email already in use');
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.omitPassword(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: {
      email?: string;
      name?: string;
      role?: Role;
      status?: UserStatus;
      passwordHash?: string;
    } = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.password !== undefined) data.passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return this.omitPassword(user);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw e;
    }
  }
}
