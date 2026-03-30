import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function GET() {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const result = await query(
      `SELECT
         p.id, p.slug, p.name, p.category, p.location_text, p.description,
         p.cover_image_url, p.created_at, p.status,
         d.name AS district_name, d.slug AS district_slug,
         u.id AS contributor_id, u.name AS contributor_name, u.email AS contributor_email,
         cs.places_approved, cs.badge_level
       FROM Places p
       LEFT JOIN Districts d ON d.id = p.district_id
       LEFT JOIN Users u ON u.id = p.created_by_user_id
       LEFT JOIN ContributorStats cs ON cs.user_id = p.created_by_user_id
       WHERE p.status = 'pending'
       ORDER BY p.created_at ASC`
    );

    return NextResponse.json({ places: result.recordset });
  } catch (err) {
    console.error("[GET /api/admin/pending]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
