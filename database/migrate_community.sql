-- ============================================================
-- Community Platform Migration (idempotent — safe to re-run)
-- Run this in SQL Server Management Studio or sqlcmd
-- ============================================================

-- 1. Add is_verified to Places (if missing)
IF COL_LENGTH('dbo.Places', 'is_verified') IS NULL
BEGIN
    ALTER TABLE dbo.Places
        ADD is_verified BIT NOT NULL CONSTRAINT DF_Places_IsVerified DEFAULT 0;
    PRINT 'Added Places.is_verified';
END
GO

-- 2. ContributorStats table
IF OBJECT_ID('dbo.ContributorStats', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContributorStats (
        id                INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id           INT NOT NULL,
        places_submitted  INT NOT NULL CONSTRAINT DF_CS_Submitted  DEFAULT 0,
        places_approved   INT NOT NULL CONSTRAINT DF_CS_Approved   DEFAULT 0,
        total_reviews     INT NOT NULL CONSTRAINT DF_CS_Reviews     DEFAULT 0,
        badge_level       NVARCHAR(20) NOT NULL CONSTRAINT DF_CS_Badge DEFAULT 'explorer',
        updated_at        DATETIME2(0) NOT NULL CONSTRAINT DF_CS_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT UQ_ContributorStats_UserId UNIQUE (user_id),
        CONSTRAINT FK_ContributorStats_User   FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
        CONSTRAINT CK_CS_Badge CHECK (badge_level IN ('explorer','contributor','local_guide','champion','pioneer'))
    );
    PRINT 'Created ContributorStats table';
END
GO

-- 3. Reports table
IF OBJECT_ID('dbo.Reports', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reports (
        id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        place_id    INT NOT NULL,
        reporter_id INT NULL,
        reason      NVARCHAR(500) NOT NULL,
        status      NVARCHAR(20) NOT NULL CONSTRAINT DF_Reports_Status DEFAULT 'open',
        created_at  DATETIME2(0) NOT NULL CONSTRAINT DF_Reports_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Reports_Place    FOREIGN KEY (place_id)    REFERENCES dbo.Places(id) ON DELETE CASCADE,
        CONSTRAINT FK_Reports_Reporter FOREIGN KEY (reporter_id) REFERENCES dbo.Users(id),
        CONSTRAINT CK_Reports_Status   CHECK (status IN ('open','resolved','dismissed'))
    );
    PRINT 'Created Reports table';
END
ELSE
BEGIN
    -- Add status column if Reports already existed without it
    IF COL_LENGTH('dbo.Reports', 'status') IS NULL
    BEGIN
        ALTER TABLE dbo.Reports
            ADD status NVARCHAR(20) NOT NULL CONSTRAINT DF_Reports_Status DEFAULT 'open';
        PRINT 'Added Reports.status column';
    END
END
GO

-- 4. EditSuggestions table
IF OBJECT_ID('dbo.EditSuggestions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EditSuggestions (
        id                 INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        place_id           INT NOT NULL,
        suggester_id       INT NULL,
        suggested_changes  NVARCHAR(MAX) NOT NULL,  -- JSON blob
        status             NVARCHAR(20) NOT NULL CONSTRAINT DF_ES_Status DEFAULT 'pending',
        reviewed_by        INT NULL,
        created_at         DATETIME2(0) NOT NULL CONSTRAINT DF_ES_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ES_Place        FOREIGN KEY (place_id)     REFERENCES dbo.Places(id) ON DELETE CASCADE,
        CONSTRAINT FK_ES_Suggester    FOREIGN KEY (suggester_id) REFERENCES dbo.Users(id),
        CONSTRAINT FK_ES_ReviewedBy   FOREIGN KEY (reviewed_by)  REFERENCES dbo.Users(id),
        CONSTRAINT CK_ES_Status       CHECK (status IN ('pending','applied','rejected'))
    );
    PRINT 'Created EditSuggestions table';
END
GO

-- 5. Indexes for performance
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reports_PlaceId')
    CREATE INDEX IX_Reports_PlaceId ON dbo.Reports(place_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reports_Status')
    CREATE INDEX IX_Reports_Status ON dbo.Reports(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EditSuggestions_PlaceId')
    CREATE INDEX IX_EditSuggestions_PlaceId ON dbo.EditSuggestions(place_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ContributorStats_UserId')
    CREATE INDEX IX_ContributorStats_UserId ON dbo.ContributorStats(user_id);
GO

PRINT 'Migration complete.';
