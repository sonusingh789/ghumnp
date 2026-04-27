-- ─────────────────────────────────────────────────────────────
-- Blog posts written by logged-in users
-- Run once against the visitNepal77 database
-- ─────────────────────────────────────────────────────────────

CREATE TABLE dbo.Blogs (
    id                   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id              INT NOT NULL,
    title                NVARCHAR(300)  NOT NULL,
    slug                 NVARCHAR(350)  NOT NULL,
    content              NVARCHAR(MAX)  NOT NULL,        -- markdown
    cover_image_url      NVARCHAR(1000) NULL,
    cover_image_file_id  NVARCHAR(200)  NULL,
    category             NVARCHAR(50)   NOT NULL CONSTRAINT DF_Blogs_Category DEFAULT 'general',
    status               NVARCHAR(20)   NOT NULL CONSTRAINT DF_Blogs_Status   DEFAULT 'published',
    created_at           DATETIME2(0)   NOT NULL CONSTRAINT DF_Blogs_CreatedAt DEFAULT SYSDATETIME(),
    updated_at           DATETIME2(0)   NOT NULL CONSTRAINT DF_Blogs_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Blogs_Slug     UNIQUE (slug),
    CONSTRAINT FK_Blogs_User     FOREIGN KEY (user_id) REFERENCES dbo.Users(id),
    CONSTRAINT CK_Blogs_Status   CHECK (status IN ('draft', 'published')),
    CONSTRAINT CK_Blogs_Category CHECK (category IN (
        'trekking', 'food', 'culture', 'hidden-gems',
        'heritage', 'photography', 'general'
    ))
);
GO

CREATE INDEX IX_Blogs_UserId    ON dbo.Blogs(user_id);
CREATE INDEX IX_Blogs_Status    ON dbo.Blogs(status);
CREATE INDEX IX_Blogs_CreatedAt ON dbo.Blogs(created_at DESC);
GO
