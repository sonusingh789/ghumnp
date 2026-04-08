import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import AdminDistrictEditClient from "@/components/pages/admin-district-edit-client";

export const metadata = { title: "Edit District — Admin | visitNepal77" };

export default async function AdminDistrictEditPage({ params }) {
  const { districtId } = await params;

  const auth = await getAuthFromRequest();
  if (!auth) redirect(`/login?from=/admin/districts/${districtId}`);
  if (auth.role !== "admin") redirect("/");

  const districtResult = await query(
    `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.is_featured,
            p.name AS province_name
     FROM Districts d
     INNER JOIN Provinces p ON p.id = d.province_id
     WHERE d.slug = @slug OR TRY_CAST(d.id AS NVARCHAR) = @slug`,
    { slug: districtId }
  );

  const row = districtResult.recordset[0];
  if (!row) redirect("/admin/districts");

  const seoResult = await query(
    `SELECT intro_text, top_things_to_do, best_time_to_visit,
            how_to_reach, local_foods_culture, faqs
     FROM DistrictSeoContent WHERE district_id = @id`,
    { id: row.id }
  );

  const seo = seoResult.recordset[0] || {};
  const district = {
    ...row,
    seo: {
      intro: seo.intro_text || "",
      topThingsToDo: seo.top_things_to_do ? JSON.parse(seo.top_things_to_do) : [],
      bestTimeToVisit: seo.best_time_to_visit || "",
      howToReach: seo.how_to_reach || "",
      localFoodsCulture: seo.local_foods_culture || "",
      faqs: seo.faqs ? JSON.parse(seo.faqs) : [],
    },
  };

  return <AdminDistrictEditClient district={district} />;
}
