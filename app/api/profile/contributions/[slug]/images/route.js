import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import { deleteFromImageKit } from "@/lib/imagekit";

async function getOwnedPlace(slug, userId) {
  const result = await query(
    `SELECT id, cover_image_url FROM Places WHERE slug = @slug AND created_by_user_id = @userId`,
    { slug, userId: Number(userId) }
  );
  return result.recordset[0] || null;
}

export async function GET(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const place = await getOwnedPlace(slug, auth.id);
  if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let images;
  try {
    const result = await query(
      `SELECT id, image_url, imagekit_file_id, sort_order FROM PlaceImages WHERE place_id = @placeId ORDER BY sort_order`,
      { placeId: place.id }
    );
    images = result.recordset;
  } catch {
    // imagekit_file_id column not yet added — query without it
    const result = await query(
      `SELECT id, image_url, sort_order FROM PlaceImages WHERE place_id = @placeId ORDER BY sort_order`,
      { placeId: place.id }
    );
    images = result.recordset;
  }

  // Include cover_image_url as a synthetic entry if it's not already in PlaceImages
  if (place.cover_image_url) {
    const alreadyIn = images.some((img) => img.image_url === place.cover_image_url);
    if (!alreadyIn) {
      images = [{ id: "cover", image_url: place.cover_image_url, imagekit_file_id: null, sort_order: -1 }, ...images];
    }
  }

  return NextResponse.json({ images });
}

export async function POST(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const place = await getOwnedPlace(slug, auth.id);
  if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const imageUrl = String(body?.imageUrl || "").trim();
  const imagekitFileId = String(body?.fileId || "").trim() || null;
  if (!imageUrl) return NextResponse.json({ error: "imageUrl is required." }, { status: 400 });

  const maxSortResult = await query(
    `SELECT ISNULL(MAX(sort_order), 0) AS maxSort FROM PlaceImages WHERE place_id = @placeId`,
    { placeId: place.id }
  );
  const nextSort = (maxSortResult.recordset[0]?.maxSort ?? 0) + 1;

  let insertedId;
  try {
    const insertResult = await query(
      `INSERT INTO PlaceImages (place_id, image_url, imagekit_file_id, sort_order)
       OUTPUT INSERTED.id
       VALUES (@placeId, @imageUrl, @imagekitFileId, @sortOrder)`,
      { placeId: place.id, imageUrl, imagekitFileId, sortOrder: nextSort }
    );
    insertedId = insertResult.recordset[0].id;
  } catch {
    // imagekit_file_id column not yet added — fall back until migration is run
    const insertResult = await query(
      `INSERT INTO PlaceImages (place_id, image_url, sort_order)
       OUTPUT INSERTED.id
       VALUES (@placeId, @imageUrl, @sortOrder)`,
      { placeId: place.id, imageUrl, sortOrder: nextSort }
    );
    insertedId = insertResult.recordset[0].id;
  }

  // If no cover image set yet, use this as cover
  if (!place.cover_image_url) {
    await query(
      `UPDATE Places SET cover_image_url = @imageUrl, updated_at = SYSDATETIME() WHERE id = @placeId`,
      { placeId: place.id, imageUrl }
    );
  }

  return NextResponse.json({ ok: true, id: insertedId });
}

export async function DELETE(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const place = await getOwnedPlace(slug, auth.id);
  if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const rawImageId = body?.imageId;
  if (!rawImageId) return NextResponse.json({ error: "imageId is required." }, { status: 400 });

  // Handle synthetic "cover" entry (cover_image_url not yet in PlaceImages)
  if (rawImageId === "cover") {
    if (!place.cover_image_url) return NextResponse.json({ error: "No cover image to remove." }, { status: 404 });
    await query(
      `UPDATE Places SET cover_image_url = NULL, updated_at = SYSDATETIME() WHERE id = @placeId`,
      { placeId: place.id }
    );
    return NextResponse.json({ ok: true });
  }

  const imageId = Number(rawImageId);
  if (!imageId) return NextResponse.json({ error: "imageId is required." }, { status: 400 });

  let img;
  try {
    const imgResult = await query(
      `SELECT image_url, imagekit_file_id FROM PlaceImages WHERE id = @imageId AND place_id = @placeId`,
      { imageId, placeId: place.id }
    );
    img = imgResult.recordset[0];
  } catch {
    // imagekit_file_id column not yet added
    const imgResult = await query(
      `SELECT image_url FROM PlaceImages WHERE id = @imageId AND place_id = @placeId`,
      { imageId, placeId: place.id }
    );
    img = imgResult.recordset[0];
  }

  if (!img) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  // Delete from DB first
  await query(
    `DELETE FROM PlaceImages WHERE id = @imageId AND place_id = @placeId`,
    { imageId, placeId: place.id }
  );

  // Delete from ImageKit (best-effort)
  if (img.imagekit_file_id) {
    try {
      await deleteFromImageKit(img.imagekit_file_id);
    } catch (err) {
      console.error("[images] ImageKit delete failed for fileId", img.imagekit_file_id, err.message);
    }
  }

  // Reassign cover if the deleted image was it
  if (place.cover_image_url === img.image_url) {
    const nextResult = await query(
      `SELECT TOP 1 image_url FROM PlaceImages WHERE place_id = @placeId ORDER BY sort_order`,
      { placeId: place.id }
    );
    const nextCover = nextResult.recordset[0]?.image_url || null;
    await query(
      `UPDATE Places SET cover_image_url = @coverUrl, updated_at = SYSDATETIME() WHERE id = @placeId`,
      { placeId: place.id, coverUrl: nextCover }
    );
  }

  return NextResponse.json({ ok: true });
}
