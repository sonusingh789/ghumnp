import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

function calcBadge(approved) {
  if (approved >= 30) return "pioneer";
  if (approved >= 15) return "champion";
  if (approved >= 5)  return "local_guide";
  if (approved >= 1)  return "contributor";
  return "explorer";
}

export async function PATCH(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { placeId } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body?.status;
  const adminNote = body?.admin_note?.trim() || null;

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'." }, { status: 400 });
  }

  try {
    const placeResult = await query(
      `SELECT id, created_by_user_id, status FROM Places WHERE slug = @slug`,
      { slug: placeId }
    );
    const place = placeResult.recordset[0];
    if (!place) return NextResponse.json({ error: "Place not found." }, { status: 404 });

    await query(
      `UPDATE Places
       SET status = @status,
           rejection_reason = @adminNote,
           approved_by_user_id = @adminId,
           is_verified = @isVerified,
           updated_at = SYSDATETIME()
       WHERE id = @id`,
      {
        id: place.id,
        status,
        adminNote: status === "rejected" ? adminNote : null,
        adminId: Number(auth.id),
        isVerified: status === "approved" ? 1 : 0,
      }
    );

    // Update contributor stats
    if (place.created_by_user_id) {
      const uid = place.created_by_user_id;

      // Ensure row exists
      await query(
        `IF NOT EXISTS (SELECT 1 FROM ContributorStats WHERE user_id = @uid)
           INSERT INTO ContributorStats (user_id) VALUES (@uid)`,
        { uid }
      );

      if (status === "approved") {
        await query(
          `UPDATE ContributorStats
           SET places_approved = places_approved + 1
           WHERE user_id = @uid`,
          { uid }
        );
      }

      // Recalculate badge
      const statsResult = await query(
        `SELECT places_approved FROM ContributorStats WHERE user_id = @uid`,
        { uid }
      );
      const approved = statsResult.recordset[0]?.places_approved || 0;
      const badge = calcBadge(approved);
      await query(
        `UPDATE ContributorStats SET badge_level = @badge WHERE user_id = @uid`,
        { uid, badge }
      );
    }

    return NextResponse.json({ ok: true, status, placeId });
  } catch (err) {
    console.error("[PATCH /api/places/[placeId]/status]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
