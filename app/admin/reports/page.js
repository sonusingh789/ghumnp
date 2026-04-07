import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import AdminReportsClient from "@/components/pages/admin-reports-client";

export const metadata = { title: "Reports & Suggestions — Admin | visitNepal77" };

export default async function AdminReportsPage() {
  const auth = await getAuthFromRequest();
  if (!auth) redirect("/login?from=/admin/reports");
  if (auth.role !== "admin") redirect("/");

  const [reportsResult, suggestionsResult] = await Promise.all([
    query(
      `SELECT r.id, r.reason, r.status, r.created_at,
              p.slug AS place_slug, p.name AS place_name,
              u.name AS reporter_name, u.email AS reporter_email
       FROM Reports r
       INNER JOIN Places p ON p.id = r.place_id
       LEFT JOIN Users u ON u.id = r.reporter_id
       WHERE r.status = 'open'
       ORDER BY r.created_at DESC`
    ),
    query(
      `SELECT es.id, es.suggested_changes, es.status, es.created_at,
              p.slug AS place_slug, p.name AS place_name,
              u.name AS suggester_name, u.email AS suggester_email
       FROM EditSuggestions es
       INNER JOIN Places p ON p.id = es.place_id
       LEFT JOIN Users u ON u.id = es.suggester_id
       WHERE es.status = 'pending'
       ORDER BY es.created_at DESC`
    ),
  ]);

  return (
    <AdminReportsClient
      initialReports={reportsResult.recordset}
      initialSuggestions={suggestionsResult.recordset}
    />
  );
}
