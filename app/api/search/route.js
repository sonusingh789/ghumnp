import { NextResponse } from "next/server";
import { query as runQuery } from "@/lib/db";
import { districts as fallbackDistricts, places as fallbackPlaces } from "@/data/nepal";

function toDistrictResult(row) {
  return {
    id: row.slug,
    name: row.name,
    province: row.province_name,
    tagline: row.tagline || "A beautiful district waiting to be explored.",
  };
}

function toPlaceResult(row) {
  return {
    id: row.slug,
    name: row.name,
    districtName: row.district_name,
    category: row.category,
    location: row.location_text,
    description: row.description,
  };
}

function searchFallbackDistricts(search) {
  return fallbackDistricts
    .filter((district) => {
      const haystacks = [district.name, district.province, district.tagline];
      return haystacks.some((value) => String(value || "").toLowerCase().includes(search));
    })
    .slice(0, 8)
    .map((district) => ({
      id: district.id,
      name: district.name,
      province: district.province,
      tagline: district.tagline,
    }));
}

function searchFallbackPlaces(search) {
  return fallbackPlaces
    .filter((place) => {
      const haystacks = [place.name, place.category, place.location, place.description, place.districtId];
      return haystacks.some((value) => String(value || "").toLowerCase().includes(search));
    })
    .slice(0, 12)
    .map((place) => ({
      id: place.id,
      name: place.name,
      districtName: place.districtId,
      category: place.category,
      location: place.location,
      description: place.description,
    }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";
  const normalizedQuery = rawQuery.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return NextResponse.json({ query: rawQuery.trim(), districts: [], places: [] });
  }

  try {
    const likeSearch = `%${normalizedQuery}%`;
    const startsWithSearch = `${normalizedQuery}%`;

    const [districtsResult, placesResult] = await Promise.all([
      runQuery(
        `SELECT TOP 8 d.slug, d.name, d.tagline, p.name AS province_name
         FROM Districts d
         INNER JOIN Provinces p ON p.id = d.province_id
         WHERE
           LOWER(d.name) LIKE @likeSearch
           OR LOWER(ISNULL(d.tagline, '')) LIKE @likeSearch
           OR LOWER(p.name) LIKE @likeSearch
         ORDER BY
           CASE
             WHEN LOWER(d.name) LIKE @startsWithSearch THEN 0
             WHEN LOWER(p.name) LIKE @startsWithSearch THEN 1
             ELSE 2
           END,
           d.name`,
        { likeSearch, startsWithSearch }
      ),
      runQuery(
        `SELECT TOP 12 pl.slug, pl.name, pl.category, pl.location_text, pl.description, d.name AS district_name
         FROM Places pl
         INNER JOIN Districts d ON d.id = pl.district_id
         WHERE pl.status = 'approved'
           AND (
             LOWER(pl.name) LIKE @likeSearch
             OR LOWER(ISNULL(pl.category, '')) LIKE @likeSearch
             OR LOWER(ISNULL(pl.location_text, '')) LIKE @likeSearch
             OR LOWER(ISNULL(pl.description, '')) LIKE @likeSearch
             OR LOWER(d.name) LIKE @likeSearch
           )
         ORDER BY
           CASE
             WHEN LOWER(pl.name) LIKE @startsWithSearch THEN 0
             WHEN LOWER(d.name) LIKE @startsWithSearch THEN 1
             ELSE 2
           END,
           pl.rating DESC,
           pl.name`,
        { likeSearch, startsWithSearch }
      ),
    ]);

    return NextResponse.json({
      query: rawQuery.trim(),
      districts: districtsResult.recordset.map(toDistrictResult),
      places: placesResult.recordset.map(toPlaceResult),
    });
  } catch {
    return NextResponse.json({
      query: rawQuery.trim(),
      districts: searchFallbackDistricts(normalizedQuery),
      places: searchFallbackPlaces(normalizedQuery),
    });
  }
}
