import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function GET(request) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all"; // pending | approved | rejected | all
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const statusFilter = status !== "all" ? `AND p.status = @status` : "";

  try {
    const result = await query(
      `SELECT
         p.id, p.slug, p.name, p.category, p.status, p.cover_image_url,
         p.created_at, p.rating, p.review_count, p.is_verified,
         d.name AS district_name,
         u.id AS contributor_id, u.name AS contributor_name,
         ISNULL(cs.badge_level, 'explorer') AS badge_level
       FROM Places p
       LEFT JOIN Districts d ON d.id = p.district_id
       LEFT JOIN Users u ON u.id = p.created_by_user_id
       LEFT JOIN ContributorStats cs ON cs.user_id = p.created_by_user_id
       WHERE (@search = '' OR p.name LIKE '%' + @search + '%' OR d.name LIKE '%' + @search + '%')
       ${statusFilter}
       ORDER BY p.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { search, status, offset, limit }
    );

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM Places p
       LEFT JOIN Districts d ON d.id = p.district_id
       WHERE (@search = '' OR p.name LIKE '%' + @search + '%' OR d.name LIKE '%' + @search + '%')
       ${statusFilter}`,
      { search, status }
    );

    return NextResponse.json({
      places: result.recordset,
      total: countResult.recordset[0].total,
      page,
      pages: Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (err) {
    console.error("[GET /api/admin/places]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
