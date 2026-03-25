import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import { getApprovedPlacesBySlugs } from "@/lib/content";

function isMissingDistrictFavoritesTable(error) {
  const message = String(error?.message || "");
  return message.includes("UserDistrictFavorites") || message.includes("Invalid object name");
}

export async function GET() {
  const auth = await getAuthFromRequest();

  if (!auth) {
    return NextResponse.json({
      favorites: [],
      favoritePlaces: [],
      favoriteDistricts: [],
      authenticated: false,
    });
  }

  const placeResult = await query(
    `SELECT pl.slug
     FROM UserFavorites uf
     INNER JOIN Places pl ON pl.id = uf.place_id
     WHERE uf.user_id = @userId
     ORDER BY uf.created_at DESC`,
    { userId: auth.id }
  );

  let districtResult = { recordset: [] };
  let favoriteDistrictsResult = { recordset: [] };

  try {
    districtResult = await query(
      `SELECT d.slug
       FROM UserDistrictFavorites udf
       INNER JOIN Districts d ON d.id = udf.district_id
       WHERE udf.user_id = @userId
       ORDER BY udf.created_at DESC`,
      { userId: auth.id }
    );

    favoriteDistrictsResult = await query(
      `SELECT d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM UserDistrictFavorites udf
       INNER JOIN Districts d ON d.id = udf.district_id
       INNER JOIN Provinces p ON p.id = d.province_id
       WHERE udf.user_id = @userId
       ORDER BY udf.created_at DESC`,
      { userId: auth.id }
    );
  } catch (error) {
    if (!isMissingDistrictFavoritesTable(error)) {
      throw error;
    }
  }

  const favoritePlaces = await getApprovedPlacesBySlugs(
    placeResult.recordset.map((row) => row.slug)
  );

  return NextResponse.json({
    authenticated: true,
    favorites: [
      ...placeResult.recordset.map((row) => row.slug),
      ...districtResult.recordset.map((row) => `district:${row.slug}`),
    ],
    favoritePlaces,
    favoriteDistricts: favoriteDistrictsResult.recordset.map((row) => ({
      id: row.slug,
      name: row.name,
      tagline: row.tagline || "A beautiful district waiting to be explored.",
      image: row.image_url || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
      province: row.province_name,
      rating: Number(row.rating || 0),
      visitorsCount: Number(row.visitors_count || 0),
    })),
  });
}

export async function POST(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const favoriteId = body?.placeId;

  if (!favoriteId) {
    return NextResponse.json({ error: "Place id is required" }, { status: 400 });
  }

  if (String(favoriteId).startsWith("district:")) {
    const districtSlug = String(favoriteId).replace(/^district:/, "");
    const districtResult = await query(
      `SELECT id FROM Districts WHERE slug = @slug`,
      { slug: districtSlug }
    );
    const district = districtResult.recordset[0];

    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 });
    }

    try {
      await query(
        `IF NOT EXISTS (
            SELECT 1 FROM UserDistrictFavorites WHERE user_id = @userId AND district_id = @districtId
         )
         INSERT INTO UserDistrictFavorites (user_id, district_id)
         VALUES (@userId, @districtId)`,
        { userId: auth.id, districtId: district.id }
      );
    } catch (error) {
      if (isMissingDistrictFavoritesTable(error)) {
        return NextResponse.json(
          { error: "District favorites table is missing. Run the latest schema update first." },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  }

  const placeResult = await query(
    `SELECT id FROM Places WHERE slug = @slug AND status = 'approved'`,
    { slug: favoriteId }
  );

  const place = placeResult.recordset[0];
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  await query(
    `IF NOT EXISTS (
        SELECT 1 FROM UserFavorites WHERE user_id = @userId AND place_id = @placeId
     )
     INSERT INTO UserFavorites (user_id, place_id)
     VALUES (@userId, @placeId)`,
    { userId: auth.id, placeId: place.id }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const favoriteId = searchParams.get("placeId");

  if (!favoriteId) {
    return NextResponse.json({ error: "Place id is required" }, { status: 400 });
  }

  if (favoriteId.startsWith("district:")) {
    const districtSlug = favoriteId.replace(/^district:/, "");

    try {
      await query(
        `DELETE udf
         FROM UserDistrictFavorites udf
         INNER JOIN Districts d ON d.id = udf.district_id
         WHERE udf.user_id = @userId AND d.slug = @slug`,
        { userId: auth.id, slug: districtSlug }
      );
    } catch (error) {
      if (isMissingDistrictFavoritesTable(error)) {
        return NextResponse.json({ ok: true });
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  }

  await query(
    `DELETE uf
     FROM UserFavorites uf
     INNER JOIN Places pl ON pl.id = uf.place_id
     WHERE uf.user_id = @userId AND pl.slug = @slug`,
    { userId: auth.id, slug: favoriteId }
  );

  return NextResponse.json({ ok: true });
}
