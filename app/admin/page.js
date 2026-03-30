import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import AdminDashboardClient from "@/components/pages/admin-dashboard-client";

export const metadata = { title: "Admin Dashboard — visitNepal77" };

export default async function AdminPage() {
  const auth = await getAuthFromRequest();
  if (!auth) redirect("/login?from=/admin");
  if (auth.role !== "admin") redirect("/");

  const [placesStats, usersStats, reviewsStats, reportsStats] = await Promise.all([
    query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM Places
    `),
    query(`SELECT COUNT(*) AS total FROM Users WHERE is_active = 1`),
    query(`SELECT COUNT(*) AS total FROM PlaceReviews`),
    query(`SELECT COUNT(*) AS total FROM Reports WHERE status = 'open'`),
  ]);

  const stats = {
    places: placesStats.recordset[0],
    users: usersStats.recordset[0].total,
    reviews: reviewsStats.recordset[0].total,
    open_reports: reportsStats.recordset[0].total,
  };

  return <AdminDashboardClient stats={stats} />;
}
