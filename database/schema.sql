CREATE TABLE dbo.Provinces (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    slug NVARCHAR(50) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    sort_order INT NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Provinces_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Provinces_Slug UNIQUE (slug),
    CONSTRAINT UQ_Provinces_Name UNIQUE (name)
);
GO

CREATE TABLE dbo.Districts (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    province_id INT NOT NULL,
    slug NVARCHAR(80) NOT NULL,
    name NVARCHAR(120) NOT NULL,
    tagline NVARCHAR(300) NULL,
    image_url NVARCHAR(1000) NULL,
    rating DECIMAL(3,2) NULL,
    visitors_count INT NOT NULL CONSTRAINT DF_Districts_Visitors DEFAULT 0,
    is_featured BIT NOT NULL CONSTRAINT DF_Districts_IsFeatured DEFAULT 0,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Districts_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Districts_Slug UNIQUE (slug),
    CONSTRAINT FK_Districts_Province FOREIGN KEY (province_id) REFERENCES dbo.Provinces(id)
);
GO

CREATE TABLE dbo.Users (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(1000) NULL,
    bio NVARCHAR(1000) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Users_Email UNIQUE (email)
);
GO

CREATE TABLE dbo.Places (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    district_id INT NOT NULL,
    created_by_user_id INT NULL,
    approved_by_user_id INT NULL,
    slug NVARCHAR(120) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    category NVARCHAR(30) NOT NULL,
    location_text NVARCHAR(250) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    cover_image_url NVARCHAR(1000) NULL,
    rating DECIMAL(3,2) NOT NULL CONSTRAINT DF_Places_Rating DEFAULT 0,
    review_count INT NOT NULL CONSTRAINT DF_Places_ReviewCount DEFAULT 0,
    is_featured BIT NOT NULL CONSTRAINT DF_Places_IsFeatured DEFAULT 0,
    is_hidden_gem BIT NOT NULL CONSTRAINT DF_Places_IsHiddenGem DEFAULT 0,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_Places_Status DEFAULT 'approved',
    rejection_reason NVARCHAR(500) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Places_CreatedAt DEFAULT SYSDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_Places_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Places_Slug UNIQUE (slug),
    CONSTRAINT FK_Places_District FOREIGN KEY (district_id) REFERENCES dbo.Districts(id),
    CONSTRAINT FK_Places_CreatedBy FOREIGN KEY (created_by_user_id) REFERENCES dbo.Users(id),
    CONSTRAINT FK_Places_ApprovedBy FOREIGN KEY (approved_by_user_id) REFERENCES dbo.Users(id),
    CONSTRAINT CK_Places_Category CHECK (category IN ('attraction', 'food', 'restaurant', 'hotel', 'stay')),
    CONSTRAINT CK_Places_Status CHECK (status IN ('pending', 'approved', 'rejected'))
);
GO

CREATE TABLE dbo.PlaceImages (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    place_id INT NOT NULL,
    image_url NVARCHAR(1000) NOT NULL,
    sort_order INT NOT NULL CONSTRAINT DF_PlaceImages_SortOrder DEFAULT 1,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_PlaceImages_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PlaceImages_Place FOREIGN KEY (place_id) REFERENCES dbo.Places(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.PlaceReviews (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    place_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment NVARCHAR(2000) NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_PlaceReviews_CreatedAt DEFAULT SYSDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_PlaceReviews_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PlaceReviews_Place FOREIGN KEY (place_id) REFERENCES dbo.Places(id) ON DELETE CASCADE,
    CONSTRAINT FK_PlaceReviews_User FOREIGN KEY (user_id) REFERENCES dbo.Users(id),
    CONSTRAINT CK_PlaceReviews_Rating CHECK (rating BETWEEN 1 AND 5)
);
GO

CREATE TABLE dbo.UserFavorites (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    place_id INT NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_UserFavorites_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_UserFavorites_User FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_UserFavorites_Place FOREIGN KEY (place_id) REFERENCES dbo.Places(id) ON DELETE CASCADE,
    CONSTRAINT UQ_UserFavorites_UserPlace UNIQUE (user_id, place_id)
);
GO

CREATE INDEX IX_Districts_ProvinceId ON dbo.Districts(province_id);
CREATE INDEX IX_Places_DistrictId ON dbo.Places(district_id);
CREATE INDEX IX_Places_Status ON dbo.Places(status);
CREATE INDEX IX_PlaceImages_PlaceId ON dbo.PlaceImages(place_id);
CREATE INDEX IX_PlaceReviews_PlaceId ON dbo.PlaceReviews(place_id);
CREATE INDEX IX_UserFavorites_UserId ON dbo.UserFavorites(user_id);
GO

CREATE TABLE dbo.UserDistrictFavorites (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    district_id INT NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_UserDistrictFavorites_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_UserDistrictFavorites_User FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_UserDistrictFavorites_District FOREIGN KEY (district_id) REFERENCES dbo.Districts(id) ON DELETE CASCADE,
    CONSTRAINT UQ_UserDistrictFavorites_UserDistrict UNIQUE (user_id, district_id)
);
GO

CREATE INDEX IX_UserDistrictFavorites_UserId ON dbo.UserDistrictFavorites(user_id);
GO

CREATE TABLE dbo.NearbySpots (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    place_id INT NOT NULL,
    created_by_user_id INT NULL,
    name NVARCHAR(200) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    description NVARCHAR(2000) NOT NULL,
    image_url NVARCHAR(1000) NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_NearbySpots_Status DEFAULT 'pending',
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_NearbySpots_CreatedAt DEFAULT SYSDATETIME(),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_NearbySpots_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_NearbySpots_Place FOREIGN KEY (place_id) REFERENCES dbo.Places(id) ON DELETE CASCADE,
    CONSTRAINT FK_NearbySpots_CreatedBy FOREIGN KEY (created_by_user_id) REFERENCES dbo.Users(id),
    CONSTRAINT CK_NearbySpots_Status CHECK (status IN ('pending', 'approved', 'rejected'))
);
GO

CREATE INDEX IX_NearbySpots_PlaceId ON dbo.NearbySpots(place_id);
GO

CREATE TABLE dbo.NearbySpotImages (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nearby_spot_id INT NOT NULL,
    image_url NVARCHAR(1000) NOT NULL,
    sort_order INT NOT NULL CONSTRAINT DF_NearbySpotImages_SortOrder DEFAULT 1,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_NearbySpotImages_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_NearbySpotImages_NearbySpot FOREIGN KEY (nearby_spot_id) REFERENCES dbo.NearbySpots(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_NearbySpotImages_NearbySpotId ON dbo.NearbySpotImages(nearby_spot_id);
GO
