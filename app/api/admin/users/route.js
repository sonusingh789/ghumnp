import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function GET(request) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const result = await query(
      `SELECT
         u.id, u.name, u.email, u.role, u.is_active, u.created_at,
         ISNULL(cs.places_submitted, 0) AS places_submitted,
         ISNULL(cs.places_approved, 0) AS places_approved,
         ISNULL(cs.total_reviews, 0)   AS total_reviews,
         ISNULL(cs.badge_level, 'explorer') AS badge_level
       FROM Users u
       LEFT JOIN ContributorStats cs ON cs.user_id = u.id
       WHERE (@search = '' OR u.name LIKE '%' + @search + '%' OR u.email LIKE '%' + @search + '%')
       ORDER BY u.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { search, offset, limit }
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM Users u
       WHERE (@search = '' OR u.name LIKE '%' + @search + '%' OR u.email LIKE '%' + @search + '%')`,
      { search }
    );

    return NextResponse.json({
      users: result.recordset,
      total: countResult.recordset[0].total,
      page,
      pages: Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (err) {
    console.error("[GET /api/admin/users]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const { userId, action } = await request.json();
    if (!userId || !action) return NextResponse.json({ error: "Missing fields." }, { status: 400 });

    if (action === "toggle_active") {
      await query(
        `UPDATE Users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = @userId`,
        { userId }
      );
    } else if (action === "make_admin") {
      await query(`UPDATE Users SET role = 'admin' WHERE id = @userId`, { userId });
    } else if (action === "remove_admin") {
      // Prevent removing own admin
      if (userId === auth.sub) return NextResponse.json({ error: "Cannot remove your own admin role." }, { status: 400 });
      await query(`UPDATE Users SET role = 'user' WHERE id = @userId`, { userId });
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const updated = await query(
      `SELECT id, name, email, role, is_active FROM Users WHERE id = @userId`,
      { userId }
    );
    return NextResponse.json({ user: updated.recordset[0] });
  } catch (err) {
    console.error("[PATCH /api/admin/users]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
