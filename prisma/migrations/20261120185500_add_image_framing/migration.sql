-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageFraming" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "media_items" ADD COLUMN IF NOT EXISTS "framing" JSONB;
