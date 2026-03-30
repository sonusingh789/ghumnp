import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth-request";

export async function POST(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Please log in to suggest an edit." }, { status: 401 });

  const { placeId } = await params;
  const body = await request.json().catch(() => ({}));
  const suggestedChanges = body?.suggested_changes;

  if (!suggestedChanges || typeof suggestedChanges !== "object" || Object.keys(suggestedChanges).length === 0) {
    return NextResponse.json({ error: "Please provide at least one field to suggest." }, { status: 400 });
  }

  try {
    const placeResult = await query(
      `SELECT id FROM Places WHERE slug = @slug AND status = 'approved'`,
      { slug: placeId }
    );
    const place = placeResult.recordset[0];
    if (!place) return NextResponse.json({ error: "Place not found." }, { status: 404 });

    await query(
      `INSERT INTO EditSuggestions (place_id, suggester_id, suggested_changes)
       VALUES (@placeId, @userId, @changes)`,
      {
        placeId: place.id,
        userId: Number(auth.id),
        changes: JSON.stringify(suggestedChanges),
      }
    );

    return NextResponse.json({ ok: true, message: "Edit suggestion submitted for review." });
  } catch (err) {
    console.error("[POST /api/places/[placeId]/suggest-edit]", err.message);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
