-- This is an empty migration.
ALTER TABLE "Love" ADD CONSTRAINT "love_target_check" CHECK (
  ("fileId" IS NOT NULL AND "folderId" IS NULL) OR
  ("fileId" IS NULL AND "folderId" IS NOT NULL)
);
