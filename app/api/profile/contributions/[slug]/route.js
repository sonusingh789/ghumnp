import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

const categoryMap = {
  "Tourist Attraction": "attraction",
  "Local Food": "food",
  Restaurant: "restaurant",
  Hotel: "hotel",
  "Local Stay": "stay",
};

export async function PATCH(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const location = String(body?.location || "").trim();
  const description = String(body?.description || "").trim();
  const categoryInput = String(body?.category || "").trim();
  const category = categoryMap[categoryInput] || categoryInput.toLowerCase();

  if (!name || !location || !description || !category) {
    return NextResponse.json({ error: "All contribution fields are required." }, { status: 400 });
  }

  const updateResult = await query(
    `UPDATE Places
     SET name = @name,
         location_text = @location,
         description = @description,
         category = @category,
         updated_at = SYSDATETIME()
     WHERE slug = @slug AND created_by_user_id = @userId`,
    {
      slug,
      userId: Number(auth.id),
      name,
      location,
      description,
      category,
    }
  );

  if (!updateResult.rowsAffected?.[0]) {
    return NextResponse.json({ error: "Contribution not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const placeResult = await query(
    `SELECT TOP 1 p.id, p.slug, d.slug AS district_slug
     FROM Places p
     INNER JOIN Districts d ON d.id = p.district_id
     WHERE p.slug = @slug AND p.created_by_user_id = @userId`,
    {
      slug,
      userId: Number(auth.id),
    }
  );
  const place = placeResult.recordset[0];

  if (!place) {
    return NextResponse.json({ error: "Contribution not found." }, { status: 404 });
  }

  await query(`DELETE FROM Reports WHERE place_id = @placeId`, { placeId: place.id });
  await query(`DELETE FROM EditSuggestions WHERE place_id = @placeId`, { placeId: place.id });

  const deleteResult = await query(
    `DELETE FROM Places
     WHERE slug = @slug AND created_by_user_id = @userId`,
    {
      slug,
      userId: Number(auth.id),
    }
  );

  if (!deleteResult.rowsAffected?.[0]) {
    return NextResponse.json({ error: "Contribution not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/allplaces");
  revalidatePath("/districts");
  revalidatePath("/favorites");
  revalidatePath("/profile");
  revalidatePath(`/place/${place.slug}`);
  if (place.district_slug) {
    revalidatePath(`/districts/${place.district_slug}`);
  }

  return NextResponse.json({ ok: true });
}
