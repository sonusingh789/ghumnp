import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import AdminDistrictsClient from "@/components/pages/admin-districts-client";

export const metadata = { title: "Featured Districts — Admin | visitNepal77" };

export default async function AdminDistrictsPage() {
  const auth = await getAuthFromRequest();
  if (!auth) redirect("/login?from=/admin/districts");
  if (auth.role !== "admin") redirect("/");

  const result = await query(
    `SELECT d.id, d.slug, d.name, d.image_url, d.is_featured,
            p.name AS province_name
     FROM Districts d
     INNER JOIN Provinces p ON p.id = d.province_id
     ORDER BY d.name`
  );

  return <AdminDistrictsClient initialDistricts={result.recordset} />;
}
