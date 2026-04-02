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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            passwordHash,
            name: 'Admin',
            role: client_1.Role.ADMIN,
        },
    });
    await prisma.user.upsert({
        where: { email: 'analyst@example.com' },
        update: {},
        create: {
            email: 'analyst@example.com',
            passwordHash,
            name: 'Analyst',
            role: client_1.Role.ANALYST,
        },
    });
    await prisma.user.upsert({
        where: { email: 'viewer@example.com' },
        update: {},
        create: {
            email: 'viewer@example.com',
            passwordHash,
            name: 'Viewer',
            role: client_1.Role.VIEWER,
        },
    });
    await prisma.financialRecord.deleteMany();
    await prisma.financialRecord.createMany({
        data: [
            {
                amount: new client_1.Prisma.Decimal(5000),
                type: client_1.EntryType.INCOME,
                category: 'Salary',
                date: new Date('2025-03-01'),
                createdByUserId: admin.id,
            },
            {
                amount: new client_1.Prisma.Decimal(120),
                type: client_1.EntryType.EXPENSE,
                category: 'Food',
                date: new Date('2025-03-02'),
                createdByUserId: admin.id,
            },
            {
                amount: new client_1.Prisma.Decimal(800),
                type: client_1.EntryType.INCOME,
                category: 'Freelance',
                date: new Date('2025-03-10'),
                createdByUserId: admin.id,
            },
            {
                amount: new client_1.Prisma.Decimal(200),
                type: client_1.EntryType.EXPENSE,
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
//# sourceMappingURL=seed.js.map