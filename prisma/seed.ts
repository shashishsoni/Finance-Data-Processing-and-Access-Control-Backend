import { PrismaClient, RecordType, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: await hash('Admin123!'),
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'analyst@example.com' },
    update: {},
    create: {
      email: 'analyst@example.com',
      passwordHash: await hash('Analyst123!'),
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      passwordHash: await hash('Viewer123!'),
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  const count = await prisma.financialRecord.count();
  if (count === 0) {
    const base = new Date();
    await prisma.financialRecord.createMany({
      data: [
        {
          amount: 5000,
          type: RecordType.INCOME,
          category: 'Salary',
          date: new Date(base.getFullYear(), base.getMonth(), 1),
          notes: 'Monthly pay',
          ownerId: admin.id,
        },
        {
          amount: 120,
          type: RecordType.EXPENSE,
          category: 'Utilities',
          date: new Date(base.getFullYear(), base.getMonth(), 5),
          notes: 'Electric',
          ownerId: admin.id,
        },
        {
          amount: 45.5,
          type: RecordType.EXPENSE,
          category: 'Food',
          date: new Date(base.getFullYear(), base.getMonth(), 8),
          ownerId: admin.id,
        },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
