import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import AdminPlacesClient from "@/components/pages/admin-places-client";

export const metadata = { title: "Places — Admin | visitNepal77" };

export default async function AdminPlacesPage({ searchParams }) {
  const auth = await getAuthFromRequest();
  if (!auth) redirect("/login?from=/admin/places");
  if (auth.role !== "admin") redirect("/");

  const rawStatus = (await searchParams).status || "all";
  const ALLOWED = ["all", "pending", "approved", "rejected"];
  const status = ALLOWED.includes(rawStatus) ? rawStatus : "all";
  const statusFilter = status !== "all" ? `AND p.status = '${status}'` : "";

  const [result, countResult] = await Promise.all([
    query(
      `SELECT TOP 20
         p.id, p.slug, p.name, p.category, p.status, p.cover_image_url,
         p.created_at, p.rating, p.review_count, p.is_verified,
         d.name AS district_name,
         u.id AS contributor_id, u.name AS contributor_name,
         ISNULL(cs.badge_level, 'explorer') AS badge_level
       FROM Places p
       LEFT JOIN Districts d ON d.id = p.district_id
       LEFT JOIN Users u ON u.id = p.created_by_user_id
       LEFT JOIN ContributorStats cs ON cs.user_id = p.created_by_user_id
       WHERE 1=1 ${statusFilter}
       ORDER BY p.created_at DESC`
    ),
    query(
      `SELECT COUNT(*) AS total FROM Places p WHERE 1=1 ${statusFilter}`
    ),
  ]);

  const total = countResult.recordset[0].total;

  return (
    <AdminPlacesClient
      initialPlaces={result.recordset}
      initialTotal={total}
      initialPages={Math.ceil(total / 20)}
      initialStatus={status}
    />
  );
}
