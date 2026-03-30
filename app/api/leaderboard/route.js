import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "all"; // week | month | all
  const districtId = searchParams.get("district_id") || "";

  const auth = await getAuthFromRequest().catch(() => null);

  // Date filter for week/month
  let dateFilter = "";
  if (period === "week")  dateFilter = "AND p.created_at >= DATEADD(day, -7, GETDATE())";
  if (period === "month") dateFilter = "AND p.created_at >= DATEADD(month, -1, GETDATE())";

  const districtFilter = districtId ? "AND p.district_id = @districtId" : "";

  try {
    // Top 20 contributors ranked by approved places in period
    const result = await query(
      `SELECT TOP 20
         u.id, u.name, u.avatar_url,
         COUNT(p.id) AS contributions,
         SUM(CASE WHEN p.is_verified = 1 THEN 1 ELSE 0 END) AS verified_count,
         ISNULL(cs.badge_level, 'explorer') AS badge_level,
         ISNULL(cs.total_reviews, 0) AS total_reviews
       FROM Users u
       INNER JOIN Places p ON p.created_by_user_id = u.id AND p.status = 'approved'
       ${dateFilter} ${districtFilter}
       LEFT JOIN ContributorStats cs ON cs.user_id = u.id
       WHERE u.is_active = 1
       GROUP BY u.id, u.name, u.avatar_url, cs.badge_level, cs.total_reviews
       ORDER BY contributions DESC`,
      { districtId: districtId ? Number(districtId) : null }
    );

    // Current user's rank (if logged in)
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
           ${dateFilter} ${districtFilter}
           WHERE u.is_active = 1
           GROUP BY u.id
         ) ranked
         WHERE ranked.id = @userId`,
        { userId: Number(auth.id), districtId: districtId ? Number(districtId) : null }
      );
      myRank = rankResult.recordset[0] || null;
    }

    // Districts list for filter
    const districtResult = await query(
      `SELECT DISTINCT d.id, d.name FROM Districts d
       INNER JOIN Places p ON p.district_id = d.id AND p.status = 'approved'
       ORDER BY d.name`
    );

    return NextResponse.json({
      leaders: result.recordset,
      myRank,
      districts: districtResult.recordset,
    });
  } catch (err) {
    console.error("[GET /api/leaderboard]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
