import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 300);
}

/* ── GET /api/blogs — list published blogs ─────────────────── */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);

  try {
    const result = await query(
      `SELECT TOP (@limit)
         b.id, b.title, b.slug, b.category, b.created_at,
         LEFT(b.content, 220) AS excerpt,
         u.id AS author_id,
         u.name AS author_name,
         u.avatar_url AS author_avatar
       FROM dbo.Blogs b
       JOIN dbo.Users u ON u.id = b.user_id
       WHERE b.status = 'published'
         AND (
           @q = ''
           OR b.title   LIKE '%' + @q + '%'
           OR b.content LIKE '%' + @q + '%'
         )
       ORDER BY b.created_at DESC`,
      { limit, q }
    );
    return NextResponse.json({ blogs: result.recordset });
  } catch (err) {
    console.error("Blogs GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ── POST /api/blogs — create a blog (auth required) ──────── */
export async function POST(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Please log in to write a blog." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, category = "general" } = body;

  if (!title?.trim())   return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!content?.trim()) return NextResponse.json({ error: "Content is required." }, { status: 400 });
  if (title.trim().length > 300)    return NextResponse.json({ error: "Title must be under 300 characters." }, { status: 400 });
  if (content.trim().length > 50000) return NextResponse.json({ error: "Content is too long (max 50,000 chars)." }, { status: 400 });

  const VALID_CATS = ["trekking", "food", "culture", "hidden-gems", "heritage", "photography", "general"];
  if (!VALID_CATS.includes(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  try {
    const baseSlug = slugify(title.trim());
    // Make slug unique by appending timestamp if collision
    const existing = await query(
      `SELECT COUNT(*) AS cnt FROM dbo.Blogs WHERE slug LIKE @base + '%'`,
      { base: baseSlug }
    );
    const slug =
      existing.recordset[0].cnt > 0
        ? `${baseSlug}-${Date.now()}`
        : baseSlug;

    const result = await query(
      `INSERT INTO dbo.Blogs (user_id, title, slug, content, category, status)
       OUTPUT INSERTED.id, INSERTED.slug, INSERTED.title, INSERTED.created_at
       VALUES (@userId, @title, @slug, @content, @category, 'published')`,
      {
        userId: auth.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        category,
      }
    );

    return NextResponse.json({ blog: result.recordset[0] }, { status: 201 });
  } catch (err) {
    console.error("Blogs POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
