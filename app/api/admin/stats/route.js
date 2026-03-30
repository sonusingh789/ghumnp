import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function GET() {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
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

    return NextResponse.json({
      places: placesStats.recordset[0],
      users: usersStats.recordset[0].total,
      reviews: reviewsStats.recordset[0].total,
      open_reports: reportsStats.recordset[0].total,
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
