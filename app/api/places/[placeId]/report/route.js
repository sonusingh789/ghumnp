import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function POST(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Please log in to report a place." }, { status: 401 });

  const { placeId } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = body?.reason?.trim();

  if (!reason || reason.length < 5) {
    return NextResponse.json({ error: "Please provide a reason (at least 5 characters)." }, { status: 400 });
  }
  if (reason.length > 500) {
    return NextResponse.json({ error: "Reason must be under 500 characters." }, { status: 400 });
  }

  try {
    const placeResult = await query(
      `SELECT id FROM Places WHERE slug = @slug AND status = 'approved'`,
      { slug: placeId }
    );
    const place = placeResult.recordset[0];
    if (!place) return NextResponse.json({ error: "Place not found." }, { status: 404 });

    await query(
      `INSERT INTO Reports (place_id, reporter_id, reason) VALUES (@placeId, @userId, @reason)`,
      { placeId: place.id, userId: Number(auth.id), reason }
    );

    return NextResponse.json({ ok: true, message: "Report submitted. Thank you." });
  } catch (err) {
    console.error("[POST /api/places/[placeId]/report]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
