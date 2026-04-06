-- ============================================================
-- Add imagekit_file_id to PlaceImages (idempotent — safe to re-run)
-- Stores the ImageKit file ID so images can be deleted from
-- ImageKit when removed from the database.
-- ============================================================

IF COL_LENGTH('dbo.PlaceImages', 'imagekit_file_id') IS NULL
BEGIN
    ALTER TABLE dbo.PlaceImages
        ADD imagekit_file_id NVARCHAR(100) NULL;
END
GO
