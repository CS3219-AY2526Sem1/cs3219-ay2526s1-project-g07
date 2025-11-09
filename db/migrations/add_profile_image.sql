-- Migration: Add profileImage column to user table
-- Date: 2025-11-10

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "user"."profileImage" IS 'Compressed profile image stored as base64 string';
