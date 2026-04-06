import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import { deleteFromImageKit } from "@/lib/imagekit";

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
  const districtInput = String(body?.district || "").trim();

  if (!name || !location || !description || !category) {
    return NextResponse.json({ error: "All contribution fields are required." }, { status: 400 });
  }

  let districtId = null;
  if (districtInput) {
    const districtResult = await query(
      `SELECT id FROM Districts WHERE name = @name`,
      { name: districtInput }
    );
    districtId = districtResult.recordset[0]?.id ?? null;
  }

  const updateResult = await query(
    `UPDATE Places
     SET name = @name,
         location_text = @location,
         description = @description,
         category = @category,
         ${districtId !== null ? "district_id = @districtId," : ""}
         updated_at = SYSDATETIME()
     WHERE slug = @slug AND created_by_user_id = @userId`,
    {
      slug,
      userId: Number(auth.id),
      name,
      location,
      description,
      category,
      ...(districtId !== null ? { districtId } : {}),
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

  // Collect ImageKit file IDs before cascade-deleting PlaceImages
  let placeImagesResult = { recordset: [] };
  try {
    placeImagesResult = await query(
      `SELECT imagekit_file_id FROM PlaceImages WHERE place_id = @placeId AND imagekit_file_id IS NOT NULL`,
      { placeId: place.id }
    );
  } catch {
    // imagekit_file_id column not yet added — skip ImageKit cleanup until migration runs
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

  // Delete images from ImageKit after DB rows are gone (best-effort)
  for (const row of placeImagesResult.recordset) {
    try {
      await deleteFromImageKit(row.imagekit_file_id);
    } catch (err) {
      console.error("[contributions] ImageKit delete failed for fileId", row.imagekit_file_id, err.message);
    }
  }

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
