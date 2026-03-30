import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import AdminPendingClient from "@/components/pages/admin-pending-client";
import { query } from "@/lib/db";

export const metadata = { title: "Pending Reviews — Admin | visitNepal77" };

export default async function AdminPendingPage() {
  const auth = await getAuthFromRequest();
  if (!auth) redirect("/login?from=/admin/pending");
  if (auth.role !== "admin") redirect("/");

  const result = await query(
    `SELECT
       p.id, p.slug, p.name, p.category, p.location_text, p.description,
       p.cover_image_url, p.created_at,
       d.name AS district_name,
       u.id AS contributor_id, u.name AS contributor_name, u.email AS contributor_email,
       ISNULL(cs.places_approved, 0) AS places_approved,
       ISNULL(cs.badge_level, 'explorer') AS badge_level
     FROM Places p
     LEFT JOIN Districts d ON d.id = p.district_id
     LEFT JOIN Users u ON u.id = p.created_by_user_id
     LEFT JOIN ContributorStats cs ON cs.user_id = p.created_by_user_id
     WHERE p.status = 'pending'
     ORDER BY p.created_at ASC`
  );

  return <AdminPendingClient initialPlaces={result.recordset} />;
}
