import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

/* ── GET /api/blogs/[id] — full blog with author ──────────── */
export async function GET(_req, { params }) {
  const { id } = await params;
  try {
    const result = await query(
      `SELECT
         b.id, b.title, b.slug, b.content, b.category,
         b.cover_image_url, b.created_at, b.updated_at,
         u.id   AS author_id,
         u.name AS author_name,
         u.avatar_url AS author_avatar
       FROM dbo.Blogs b
       JOIN dbo.Users u ON u.id = b.user_id
       WHERE b.id = @id AND b.status = 'published'`,
      { id: parseInt(id, 10) }
    );
    const blog = result.recordset[0];
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (err) {
    console.error("Blog GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ── PUT /api/blogs/[id] — edit (author or admin) ─────────── */
export async function PUT(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const blogId = parseInt(id, 10);

  // ownership check
  const check = await query(
    `SELECT user_id FROM dbo.Blogs WHERE id = @id`,
    { id: blogId }
  );
  const existing = check.recordset[0];
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.user_id !== parseInt(auth.id, 10) && auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, category = "general", cover_image_url = null, cover_image_file_id = null } = body;

  if (!title?.trim())   return NextResponse.json({ error: "Title is required." },   { status: 400 });
  if (!content?.trim()) return NextResponse.json({ error: "Content is required." }, { status: 400 });
  if (title.trim().length > 300)    return NextResponse.json({ error: "Title too long." }, { status: 400 });
  if (content.trim().length > 50000) return NextResponse.json({ error: "Content too long." }, { status: 400 });

  const VALID_CATS = ["trekking", "food", "culture", "hidden-gems", "heritage", "photography", "general"];
  if (!VALID_CATS.includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });

  try {
    await query(
      `UPDATE dbo.Blogs
       SET title               = @title,
           content             = @content,
           category            = @category,
           cover_image_url     = @coverUrl,
           cover_image_file_id = @coverId,
           updated_at          = SYSDATETIME()
       WHERE id = @id`,
      {
        id: blogId,
        title: title.trim(),
        content: content.trim(),
        category,
        coverUrl: cover_image_url || null,
        coverId:  cover_image_file_id || null,
      }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Blog PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ── DELETE /api/blogs/[id] — delete (author or admin) ───── */
export async function DELETE(_req, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const blogId = parseInt(id, 10);

  const check = await query(
    `SELECT user_id FROM dbo.Blogs WHERE id = @id`,
    { id: blogId }
  );
  const existing = check.recordset[0];
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.user_id !== parseInt(auth.id, 10) && auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await query(`DELETE FROM dbo.Blogs WHERE id = @id`, { id: blogId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Blog DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
