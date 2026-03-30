import { redirect } from "next/navigation";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import AdminUsersClient from "@/components/pages/admin-users-client";

export const metadata = { title: "Users — Admin | visitNepal77" };

export default async function AdminUsersPage() {
  const auth = await getAuthFromRequest();
  if (!auth) redirect("/login?from=/admin/users");
  if (auth.role !== "admin") redirect("/");

  const result = await query(
    `SELECT TOP 20
       u.id, u.name, u.email, u.role, u.is_active, u.created_at,
       ISNULL(cs.places_submitted, 0) AS places_submitted,
       ISNULL(cs.places_approved, 0)  AS places_approved,
       ISNULL(cs.total_reviews, 0)    AS total_reviews,
       ISNULL(cs.badge_level, 'explorer') AS badge_level
     FROM Users u
     LEFT JOIN ContributorStats cs ON cs.user_id = u.id
     ORDER BY u.created_at DESC`
  );

  const countResult = await query(`SELECT COUNT(*) AS total FROM Users`);
  const total = countResult.recordset[0].total;

  return (
    <AdminUsersClient
      initialUsers={result.recordset}
      initialTotal={total}
      initialPages={Math.ceil(total / 20)}
    />
  );
}
