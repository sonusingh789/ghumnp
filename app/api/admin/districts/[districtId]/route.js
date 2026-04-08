import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

async function requireAdmin() {
  const auth = await getAuthFromRequest();
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { districtId } = await params;

  const districtResult = await query(
    `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.is_featured,
            p.name AS province_name
     FROM Districts d
     INNER JOIN Provinces p ON p.id = d.province_id
     WHERE d.slug = @slug OR TRY_CAST(d.id AS NVARCHAR) = @slug`,
    { slug: districtId }
  );

  const district = districtResult.recordset[0];
  if (!district) return NextResponse.json({ error: "District not found." }, { status: 404 });

  const seoResult = await query(
    `SELECT intro_text, top_things_to_do, best_time_to_visit,
            how_to_reach, local_foods_culture, faqs
     FROM DistrictSeoContent
     WHERE district_id = @districtId`,
    { districtId: district.id }
  );

  const seo = seoResult.recordset[0] || {};

  return NextResponse.json({
    district: {
      ...district,
      seo: {
        intro: seo.intro_text || "",
        topThingsToDo: seo.top_things_to_do ? JSON.parse(seo.top_things_to_do) : [],
        bestTimeToVisit: seo.best_time_to_visit || "",
        howToReach: seo.how_to_reach || "",
        localFoodsCulture: seo.local_foods_culture || "",
        faqs: seo.faqs ? JSON.parse(seo.faqs) : [],
      },
    },
  });
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { districtId } = await params;
  const body = await request.json().catch(() => ({}));

  // Resolve district id from slug or numeric id
  const districtResult = await query(
    `SELECT id, slug FROM Districts WHERE slug = @slug OR TRY_CAST(id AS NVARCHAR) = @slug`,
    { slug: districtId }
  );
  const district = districtResult.recordset[0];
  if (!district) return NextResponse.json({ error: "District not found." }, { status: 404 });

  const id = district.id;

  // Update basic info
  if ("name" in body || "tagline" in body) {
    const name = body.name ? String(body.name).trim() : null;
    const tagline = "tagline" in body ? (body.tagline ? String(body.tagline).trim() : null) : undefined;

    if (name) {
      await query(
        `UPDATE Districts SET name = @name${tagline !== undefined ? ", tagline = @tagline" : ""} WHERE id = @id`,
        { id, name, ...(tagline !== undefined ? { tagline } : {}) }
      );
    } else if (tagline !== undefined) {
      await query(`UPDATE Districts SET tagline = @tagline WHERE id = @id`, { id, tagline });
    }
  }

  // Upsert SEO content
  if ("seo" in body) {
    const seo = body.seo || {};
    const introText = seo.intro ? String(seo.intro).trim() : null;
    const topThingsToDo = Array.isArray(seo.topThingsToDo) ? JSON.stringify(seo.topThingsToDo) : null;
    const bestTimeToVisit = seo.bestTimeToVisit ? String(seo.bestTimeToVisit).trim() : null;
    const howToReach = seo.howToReach ? String(seo.howToReach).trim() : null;
    const localFoodsCulture = seo.localFoodsCulture ? String(seo.localFoodsCulture).trim() : null;
    const faqs = Array.isArray(seo.faqs) ? JSON.stringify(seo.faqs) : null;

    await query(
      `MERGE DistrictSeoContent AS target
       USING (SELECT @districtId AS district_id) AS source ON target.district_id = source.district_id
       WHEN MATCHED THEN
         UPDATE SET
           intro_text          = @introText,
           top_things_to_do    = @topThingsToDo,
           best_time_to_visit  = @bestTimeToVisit,
           how_to_reach        = @howToReach,
           local_foods_culture = @localFoodsCulture,
           faqs                = @faqs,
           updated_at          = SYSDATETIME()
       WHEN NOT MATCHED THEN
         INSERT (district_id, intro_text, top_things_to_do, best_time_to_visit, how_to_reach, local_foods_culture, faqs)
         VALUES (@districtId, @introText, @topThingsToDo, @bestTimeToVisit, @howToReach, @localFoodsCulture, @faqs);`,
      { districtId: id, introText, topThingsToDo, bestTimeToVisit, howToReach, localFoodsCulture, faqs }
    );
  }

  revalidatePath("/");
  revalidatePath("/districts");
  revalidatePath(`/districts/${district.slug}`);

  return NextResponse.json({ ok: true });
}
