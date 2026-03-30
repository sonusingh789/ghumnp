import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  const { userId } = await params;
  const numericId = parseInt(userId.split('-').pop(), 10);

  try {
    const userResult = await query(
      `SELECT id, name, avatar_url, bio, created_at FROM Users WHERE id = @userId AND is_active = 1`,
      { userId: numericId }
    );
    const user = userResult.recordset[0];
    if (!user) return NextResponse.json({ error: "Contributor not found." }, { status: 404 });

    const [placesResult, districtsResult] = await Promise.all([
      query(
        `SELECT p.slug, p.name, p.category, p.cover_image_url, p.rating,
                p.review_count, p.location_text, d.name AS district_name
         FROM Places p
         LEFT JOIN Districts d ON d.id = p.district_id
         WHERE p.created_by_user_id = @userId AND p.status = 'approved'
         ORDER BY p.created_at DESC`,
        { userId: numericId }
      ),
      query(
        `SELECT COUNT(DISTINCT p.district_id) AS districts_covered
         FROM Places p
         WHERE p.created_by_user_id = @userId AND p.status = 'approved'`,
        { userId: numericId }
      ),
    ]);

    const placesApproved = placesResult.recordset.length;
    const badgeLevel = placesApproved >= 30 ? "pioneer" : placesApproved >= 15 ? "champion" : placesApproved >= 5 ? "local_guide" : placesApproved >= 1 ? "contributor" : "explorer";

    return NextResponse.json({
      contributor: {
        id: user.id,
        name: user.name,
        avatar: user.avatar_url,
        bio: user.bio,
        joined: user.created_at,
        badge: badgeLevel,
        stats: {
          places_submitted: placesApproved,
          places_approved: placesApproved,
          total_reviews: 0,
          districts_covered: districtsResult.recordset[0]?.districts_covered || 0,
        },
        places: placesResult.recordset,
      },
    });
  } catch (err) {
    console.error("[GET /api/contributors/[userId]]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
