import { EntryType, Prisma, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });
  await prisma.user.upsert({
    where: { email: 'analyst@example.com' },
    update: {},
    create: {
      email: 'analyst@example.com',
      passwordHash,
      name: 'Analyst',
      role: Role.ANALYST,
    },
  });
  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      passwordHash,
      name: 'Viewer',
      role: Role.VIEWER,
    },
  });

  await prisma.financialRecord.deleteMany();
  await prisma.financialRecord.createMany({
    data: [
      {
        amount: new Prisma.Decimal(5000),
        type: EntryType.INCOME,
        category: 'Salary',
        date: new Date('2025-03-01'),
        createdByUserId: admin.id,
      },
      {
        amount: new Prisma.Decimal(120),
        type: EntryType.EXPENSE,
        category: 'Food',
        date: new Date('2025-03-02'),
        createdByUserId: admin.id,
      },
      {
        amount: new Prisma.Decimal(800),
        type: EntryType.INCOME,
        category: 'Freelance',
        date: new Date('2025-03-10'),
        createdByUserId: admin.id,
      },
      {
        amount: new Prisma.Decimal(200),
        type: EntryType.EXPENSE,
        category: 'Transport',
        date: new Date('2025-03-12'),
        createdByUserId: admin.id,
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
