import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  const { placeId } = await params;

  try {
    const placeResult = await query(
      `SELECT
         p.id, p.slug, p.name, p.category, p.location_text, p.description,
         p.cover_image_url, p.rating, p.review_count, p.is_featured,
         p.is_hidden_gem, p.status, p.latitude, p.longitude,
         p.place_metadata, p.is_verified, p.created_at,
         u.id AS contributor_id, u.name AS contributor_name,
         u.avatar_url AS contributor_avatar,
         cs.badge_level AS contributor_badge,
         d.name AS district_name, d.slug AS district_slug
       FROM Places p
       LEFT JOIN Users u ON u.id = p.created_by_user_id
       LEFT JOIN ContributorStats cs ON cs.user_id = p.created_by_user_id
       LEFT JOIN Districts d ON d.id = p.district_id
       WHERE p.slug = @slug AND p.status = 'approved'`,
      { slug: placeId }
    );

    const place = placeResult.recordset[0];
    if (!place) {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    const [imagesResult, reviewsResult, nearbySpotsResult] = await Promise.all([
      query(
        `SELECT image_url FROM PlaceImages WHERE place_id = @placeId ORDER BY sort_order ASC`,
        { placeId: place.id }
      ),
      query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
                u.name AS author, u.avatar_url AS avatar
         FROM PlaceReviews r
         JOIN Users u ON u.id = r.user_id
         WHERE r.place_id = @placeId
         ORDER BY r.created_at DESC
         OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY`,
        { placeId: place.id }
      ),
      query(
        `SELECT ns.id, ns.name, ns.category, ns.description, ns.image_url
         FROM NearbySpots ns
         WHERE ns.place_id = @placeId AND ns.status = 'approved'
         ORDER BY ns.created_at ASC`,
        { placeId: place.id }
      ),
    ]);

    let metadata = null;
    try {
      metadata = place.place_metadata ? JSON.parse(place.place_metadata) : null;
    } catch {
      metadata = null;
    }

    return NextResponse.json({
      place: {
        ...place,
        place_metadata: metadata,
        images: imagesResult.recordset.map((r) => r.image_url),
        reviews: reviewsResult.recordset,
        nearbySpots: nearbySpotsResult.recordset,
        contributor: place.contributor_id
          ? {
              id: place.contributor_id,
              name: place.contributor_name,
              avatar: place.contributor_avatar,
              badge: place.contributor_badge || "explorer",
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[GET /api/places/[placeId]]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
