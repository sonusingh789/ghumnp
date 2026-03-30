import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

export async function POST(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Please log in to add a review." }, { status: 401 });
  }

  const { placeId } = await params;
  const body = await request.json();
  const rating = Number(body?.rating);
  const comment = body?.comment?.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  if (!comment) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const placeResult = await query(
    `SELECT id FROM Places WHERE slug = @slug AND status = 'approved'`,
    { slug: placeId }
  );
  const place = placeResult.recordset[0];

  if (!place) {
    return NextResponse.json({ error: "Place not found." }, { status: 404 });
  }

  await query(
    `INSERT INTO PlaceReviews (place_id, user_id, rating, comment)
     VALUES (@placeId, @userId, @rating, @comment)`,
    {
      placeId: place.id,
      userId: auth.id,
      rating,
      comment,
    }
  );

  const statsResult = await query(
    `SELECT
        CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(3,2)) AS avg_rating,
        COUNT(*) AS review_count
     FROM PlaceReviews
     WHERE place_id = @placeId`,
    { placeId: place.id }
  );

  const stats = statsResult.recordset[0];

  await query(
    `UPDATE Places
     SET rating = @rating, review_count = @reviewCount, updated_at = SYSDATETIME()
     WHERE id = @placeId`,
    {
      placeId: place.id,
      rating: Number(stats?.avg_rating || rating),
      reviewCount: Number(stats?.review_count || 1),
    }
  );

  // Increment reviewer's total_reviews in ContributorStats
  await query(
    `IF NOT EXISTS (SELECT 1 FROM ContributorStats WHERE user_id = @uid)
       INSERT INTO ContributorStats (user_id) VALUES (@uid);
     UPDATE ContributorStats SET total_reviews = total_reviews + 1 WHERE user_id = @uid`,
    { uid: Number(auth.id) }
  );

  const userResult = await query(
    `SELECT name, avatar_url FROM Users WHERE id = @id`,
    { id: auth.id }
  );
  const user = userResult.recordset[0];

  return NextResponse.json({
    review: {
      id: `review-${Date.now()}`,
      author: user?.name || "Traveler",
      avatar: user?.avatar_url || "https://i.pravatar.cc/80?img=48",
      rating,
      comment,
      date: new Date().toISOString(),
    },
  });
}
