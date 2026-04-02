DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('VIEWER', 'ANALYST', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RecordType" AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DROP TABLE IF EXISTS "FinancialRecord" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "FinancialRecord" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "RecordType" NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FinancialRecord_date_idx" ON "FinancialRecord"("date");
CREATE INDEX "FinancialRecord_category_idx" ON "FinancialRecord"("category");
CREATE INDEX "FinancialRecord_type_idx" ON "FinancialRecord"("type");
CREATE INDEX "FinancialRecord_ownerId_idx" ON "FinancialRecord"("ownerId");

ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
