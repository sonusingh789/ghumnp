-- Migration: Add Google OAuth support
-- Run once against the production database.

-- 1. Add google_id column (stores the Google sub/id for each user)
ALTER TABLE dbo.Users
  ADD google_id NVARCHAR(100) NULL;
GO

-- 2. Unique index so no two accounts share the same Google ID
--    Filtered index ignores NULLs (email/password users have no google_id)
CREATE UNIQUE INDEX UQ_Users_GoogleId
  ON dbo.Users(google_id)
  WHERE google_id IS NOT NULL;
GO

-- 3. Allow password_hash to be NULL so Google-only users don't need a password
ALTER TABLE dbo.Users
  ALTER COLUMN password_hash NVARCHAR(255) NULL;
GO
