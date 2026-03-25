import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

async function refreshPlaceStats(placeId) {
  const statsResult = await query(
    `SELECT
        CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(3,2)) AS avg_rating,
        COUNT(*) AS review_count
     FROM PlaceReviews
     WHERE place_id = @placeId`,
    { placeId }
  );

  const stats = statsResult.recordset[0] || {};

  await query(
    `UPDATE Places
     SET rating = @rating,
         review_count = @reviewCount,
         updated_at = SYSDATETIME()
     WHERE id = @placeId`,
    {
      placeId,
      rating: Number(stats.avg_rating || 0),
      reviewCount: Number(stats.review_count || 0),
    }
  );
}

export async function PATCH(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await params;
  const body = await request.json().catch(() => ({}));
  const rating = Number(body?.rating);
  const comment = String(body?.comment || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  if (!comment) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const reviewResult = await query(
    `SELECT place_id
     FROM PlaceReviews
     WHERE id = @reviewId AND user_id = @userId`,
    { reviewId: Number(reviewId), userId: Number(auth.id) }
  );
  const review = reviewResult.recordset[0];

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  await query(
    `UPDATE PlaceReviews
     SET rating = @rating,
         comment = @comment,
         updated_at = SYSDATETIME()
     WHERE id = @reviewId AND user_id = @userId`,
    {
      reviewId: Number(reviewId),
      userId: Number(auth.id),
      rating,
      comment,
    }
  );

  await refreshPlaceStats(review.place_id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await params;
  const reviewResult = await query(
    `SELECT place_id
     FROM PlaceReviews
     WHERE id = @reviewId AND user_id = @userId`,
    { reviewId: Number(reviewId), userId: Number(auth.id) }
  );
  const review = reviewResult.recordset[0];

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  await query(
    `DELETE FROM PlaceReviews
     WHERE id = @reviewId AND user_id = @userId`,
    {
      reviewId: Number(reviewId),
      userId: Number(auth.id),
    }
  );

  await refreshPlaceStats(review.place_id);

  return NextResponse.json({ ok: true });
}
