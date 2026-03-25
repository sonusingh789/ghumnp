import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { COOKIE_NAME, getCookieOptions } from "@/lib/auth";
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

export async function DELETE() {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(auth.id);

  try {
    const reviewsResult = await query(
      `SELECT DISTINCT place_id
       FROM PlaceReviews
       WHERE user_id = @userId`,
      { userId }
    );

    await query(
      `UPDATE Places
       SET approved_by_user_id = NULL
       WHERE approved_by_user_id = @userId`,
      { userId }
    );

    await query(
      `DELETE FROM NearbySpots WHERE created_by_user_id = @userId`,
      { userId }
    );

    await query(
      `DELETE FROM PlaceReviews WHERE user_id = @userId`,
      { userId }
    );

    for (const row of reviewsResult.recordset) {
      await refreshPlaceStats(row.place_id);
    }

    await query(
      `DELETE FROM Places WHERE created_by_user_id = @userId`,
      { userId }
    );

    await query(
      `DELETE FROM Users WHERE id = @userId`,
      { userId }
    );

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, "", {
      ...getCookieOptions(),
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to delete account." }, { status: 500 });
  }
}
