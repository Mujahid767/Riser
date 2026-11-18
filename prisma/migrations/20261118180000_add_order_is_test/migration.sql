-- AlterTable
ALTER TABLE "orders" ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "orders_isTest_idx" ON "orders"("isTest");
