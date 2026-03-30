import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";
import { buildMetadata } from "@/lib/seo";
import LeaderboardClient from "@/components/pages/leaderboard-client";

export const metadata = buildMetadata({
  title: "Leaderboard — Top Nepal Travel Contributors | visitNepal77",
  description: "See the top contributors helping document Nepal's 77 districts. Earn badges and climb the leaderboard by adding and verifying places.",
  path: "/leaderboard",
});

export default async function LeaderboardPage() {
  const auth = await getAuthFromRequest().catch(() => null);

  // Default: this month
  const [leadersResult, districtsResult] = await Promise.all([
    query(
      `SELECT TOP 20
         u.id, u.name, u.avatar_url,
         COUNT(p.id) AS contributions,
         SUM(CASE WHEN p.is_verified = 1 THEN 1 ELSE 0 END) AS verified_count,
         ISNULL(cs.badge_level, 'explorer') AS badge_level,
         ISNULL(cs.total_reviews, 0) AS total_reviews
       FROM Users u
       INNER JOIN Places p ON p.created_by_user_id = u.id AND p.status = 'approved'
         AND p.created_at >= DATEADD(month, -1, GETDATE())
       LEFT JOIN ContributorStats cs ON cs.user_id = u.id
       WHERE u.is_active = 1
       GROUP BY u.id, u.name, u.avatar_url, cs.badge_level, cs.total_reviews
       ORDER BY contributions DESC`
    ),
    query(
      `SELECT DISTINCT d.id, d.name FROM Districts d
       INNER JOIN Places p ON p.district_id = d.id AND p.status = 'approved'
       ORDER BY d.name`
    ),
  ]);

  let myRank = null;
  if (auth?.id) {
    const rankResult = await query(
      `SELECT ranked.rank, ranked.contributions
       FROM (
         SELECT u.id,
                COUNT(p.id) AS contributions,
                RANK() OVER (ORDER BY COUNT(p.id) DESC) AS rank
         FROM Users u
         INNER JOIN Places p ON p.created_by_user_id = u.id AND p.status = 'approved'
           AND p.created_at >= DATEADD(month, -1, GETDATE())
         WHERE u.is_active = 1
         GROUP BY u.id
       ) ranked
       WHERE ranked.id = @userId`,
      { userId: Number(auth.id) }
    );
    myRank = rankResult.recordset[0] || null;
  }

  return (
    <LeaderboardClient
      initialData={{
        leaders: leadersResult.recordset,
        myRank,
        districts: districtsResult.recordset,
      }}
      initialPeriod="month"
    />
  );
}
