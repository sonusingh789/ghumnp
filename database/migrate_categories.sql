-- ============================================================
-- migrate_categories.sql
-- Run this once against your database.
-- Safe to run on a live DB — all statements are idempotent.
-- ============================================================

-- 1. Performance index on Places.category (already have one on status)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.Places') AND name = 'IX_Places_Category'
)
BEGIN
    CREATE INDEX IX_Places_Category ON dbo.Places(category);
END
GO

-- 2. Composite index for district + category listing queries
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.Places') AND name = 'IX_Places_DistrictCategory'
)
BEGIN
    CREATE INDEX IX_Places_DistrictCategory ON dbo.Places(district_id, category, status);
END
GO

-- 3. PlaceNearby junction table — replaces the free-text NearbySpots
--    for cross-category Place linking.
--    Existing NearbySpots data is NOT removed (backward compat).
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'PlaceNearby' AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE dbo.PlaceNearby (
        id                  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        place_id            INT NOT NULL,
        nearby_place_id     INT NOT NULL,
        created_by_user_id  INT NULL,
        created_at          DATETIME2(0) NOT NULL CONSTRAINT DF_PlaceNearby_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_PlaceNearby_Place       FOREIGN KEY (place_id)        REFERENCES dbo.Places(id) ON DELETE CASCADE,
        CONSTRAINT FK_PlaceNearby_NearbyPlace FOREIGN KEY (nearby_place_id) REFERENCES dbo.Places(id),
        CONSTRAINT FK_PlaceNearby_CreatedBy   FOREIGN KEY (created_by_user_id) REFERENCES dbo.Users(id),
        CONSTRAINT UQ_PlaceNearby             UNIQUE (place_id, nearby_place_id),
        CONSTRAINT CK_PlaceNearby_NoSelf      CHECK (place_id <> nearby_place_id)
    );

    CREATE INDEX IX_PlaceNearby_PlaceId      ON dbo.PlaceNearby(place_id);
    CREATE INDEX IX_PlaceNearby_NearbyPlaceId ON dbo.PlaceNearby(nearby_place_id);
END
GO

-- 4. Normalise the free-text categories stored in NearbySpots
--    so they match the Places CHECK constraint values.
UPDATE dbo.NearbySpots
SET category = CASE LOWER(LTRIM(RTRIM(category)))
    WHEN 'tourist attraction' THEN 'attraction'
    WHEN 'local food'         THEN 'food'
    WHEN 'restaurant'         THEN 'restaurant'
    WHEN 'hotel'              THEN 'hotel'
    WHEN 'local stay'         THEN 'stay'
    ELSE LOWER(LTRIM(RTRIM(category)))   -- leave already-normalised values untouched
END
WHERE category IN (
    'Tourist Attraction', 'tourist attraction',
    'Local Food',         'local food',
    'Restaurant',
    'Hotel',
    'Local Stay',         'local stay'
);
GO

-- 5. Back-fill: existing Places that were inserted without a category
--    (safety net — the CHECK constraint already enforces valid values)
UPDATE dbo.Places
SET category = 'attraction'
WHERE category IS NULL OR category = '';
GO
