import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const auth = await getAuthFromRequest();
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const result = await query(
    `SELECT es.id, es.suggested_changes, es.status, es.created_at,
            p.slug AS place_slug, p.name AS place_name,
            u.name AS suggester_name, u.email AS suggester_email
     FROM EditSuggestions es
     INNER JOIN Places p ON p.id = es.place_id
     LEFT JOIN Users u ON u.id = es.suggester_id
     WHERE es.status = @status
     ORDER BY es.created_at DESC`,
    { status }
  );

  return NextResponse.json({ suggestions: result.recordset });
}

export async function PATCH(request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const suggestionId = Number(body?.suggestionId);
  const action = body?.action; // "apply" or "reject"

  if (!suggestionId || !["apply", "reject"].includes(action)) {
    return NextResponse.json({ error: "suggestionId and action (apply/reject) required." }, { status: 400 });
  }

  if (action === "reject") {
    await query(
      `UPDATE EditSuggestions SET status = 'rejected' WHERE id = @suggestionId`,
      { suggestionId }
    );
    return NextResponse.json({ ok: true });
  }

  // Apply: fetch suggestion and update the place
  const esResult = await query(
    `SELECT es.suggested_changes, p.id AS place_id, p.slug
     FROM EditSuggestions es
     INNER JOIN Places p ON p.id = es.place_id
     WHERE es.id = @suggestionId`,
    { suggestionId }
  );
  const es = esResult.recordset[0];
  if (!es) return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });

  let changes;
  try { changes = JSON.parse(es.suggested_changes); } catch { changes = {}; }

  const allowed = ["name", "description", "location"];
  const sets = [];
  const params = { placeId: es.place_id };

  for (const key of allowed) {
    if (changes[key] !== undefined) {
      sets.push(`${key === "location" ? "location_text" : key} = @${key}`);
      params[key] = String(changes[key]).trim();
    }
  }

  if (sets.length) {
    await query(
      `UPDATE Places SET ${sets.join(", ")}, updated_at = SYSDATETIME() WHERE id = @placeId`,
      params
    );
  }

  // Insert suggested images into PlaceImages
  if (Array.isArray(changes.suggested_images) && changes.suggested_images.length) {
    const maxSortResult = await query(
      `SELECT ISNULL(MAX(sort_order), 0) AS maxSort FROM PlaceImages WHERE place_id = @placeId`,
      { placeId: es.place_id }
    );
    let nextSort = (maxSortResult.recordset[0]?.maxSort ?? 0) + 1;
    for (const imageUrl of changes.suggested_images) {
      if (typeof imageUrl !== "string" || !imageUrl.startsWith("http")) continue;
      try {
        await query(
          `INSERT INTO PlaceImages (place_id, image_url, sort_order) VALUES (@placeId, @imageUrl, @sortOrder)`,
          { placeId: es.place_id, imageUrl, sortOrder: nextSort++ }
        );
      } catch { /* skip invalid */ }
    }
  }

  await query(
    `UPDATE EditSuggestions SET status = 'applied' WHERE id = @suggestionId`,
    { suggestionId }
  );

  revalidatePath(`/place/${es.slug}`);

  return NextResponse.json({ ok: true });
}
