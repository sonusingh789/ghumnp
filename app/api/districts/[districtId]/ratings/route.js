import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

function isMissingDistrictRatingsTable(error) {
  const message = String(error?.message || "");
  return message.includes("DistrictRatings") || message.includes("Invalid object name");
}

async function refreshDistrictRating(districtId) {
  const statsResult = await query(
    `SELECT
        CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(3,2)) AS avg_rating
     FROM DistrictRatings
     WHERE district_id = @districtId`,
    { districtId }
  );

  const stats = statsResult.recordset[0] || {};

  await query(
    `UPDATE Districts
     SET rating = @rating
     WHERE id = @districtId`,
    {
      districtId,
      rating: Number(stats.avg_rating || 0),
    }
  );

  return Number(stats.avg_rating || 0);
}

export async function POST(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Please log in to rate this district." }, { status: 401 });
  }

  const { districtId } = await params;
  const body = await request.json().catch(() => ({}));
  const rating = Number(body?.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const districtResult = await query(
    `SELECT id FROM Districts WHERE slug = @slug`,
    { slug: districtId }
  );
  const district = districtResult.recordset[0];

  if (!district) {
    return NextResponse.json({ error: "District not found." }, { status: 404 });
  }

  try {
    await query(
      `MERGE DistrictRatings AS target
       USING (SELECT @districtId AS district_id, @userId AS user_id) AS source
       ON target.district_id = source.district_id AND target.user_id = source.user_id
       WHEN MATCHED THEN
         UPDATE SET rating = @rating, updated_at = SYSDATETIME()
       WHEN NOT MATCHED THEN
         INSERT (district_id, user_id, rating)
         VALUES (@districtId, @userId, @rating);`,
      {
        districtId: district.id,
        userId: Number(auth.id),
        rating,
      }
    );

    const averageRating = await refreshDistrictRating(district.id);

    revalidatePath("/");
    revalidatePath("/districts");
    revalidatePath("/explore");
    revalidatePath(`/districts/${districtId}`);

    return NextResponse.json({
      ok: true,
      rating: averageRating,
      userRating: rating,
    });
  } catch (error) {
    if (isMissingDistrictRatingsTable(error)) {
      return NextResponse.json(
        { error: "District ratings table is missing. Run the latest district ratings schema first." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Unable to save district rating." }, { status: 500 });
  }
}
