import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getApprovedPlacesBySlugs } from "@/lib/content";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";
import { uploadFileToImageKit } from "@/lib/imagekit";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  const search = searchParams.get("search")?.trim();

  if (search) {
    const result = await query(
      `SELECT TOP 10 p.slug, p.name, p.location_text, d.name AS district_name
       FROM Places p
       INNER JOIN Districts d ON d.id = p.district_id
       WHERE status = 'approved'
         AND p.category = 'attraction'
         AND (
           p.name LIKE @search
           OR p.location_text LIKE @search
           OR d.name LIKE @search
         )
       ORDER BY p.name`,
      { search: `%${search}%` }
    );

    return NextResponse.json({
      places: result.recordset.map((row) => ({
        id: row.slug,
        name: row.name,
        location: row.location_text,
        district: row.district_name,
      })),
    });
  }

  if (!ids) {
    return NextResponse.json({ places: [] });
  }

  const placeSlugs = ids.split(",").map((item) => item.trim()).filter(Boolean);
  const places = await getApprovedPlacesBySlugs(placeSlugs);
  return NextResponse.json({ places });
}

async function parseRequestData(request) {
  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  if (isMultipart) {
    const formData = await request.formData();
    const nearbySpotsRaw = String(formData.get("nearbySpots") || "[]");
    let nearbySpots = [];
    try {
      nearbySpots = JSON.parse(nearbySpotsRaw);
    } catch {
      nearbySpots = [];
    }
    return {
      mode: String(formData.get("mode") || "new"),
      selectedExistingPlace: String(formData.get("selectedExistingPlace") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      districtSlug: String(formData.get("district") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      files: formData.getAll("photos").filter(
        (entry) => entry && typeof entry === "object" && "arrayBuffer" in entry && entry.size > 0
      ),
      nearbySpots,
      uploadedImageUrls: [], 
    };
  }

  const body = await request.json();
  return {
    mode: String(body?.mode || "new"),
    selectedExistingPlace: String(body?.selectedExistingPlace || "").trim(),
    name: String(body?.name || "").trim(),
    districtSlug: String(body?.district || "").trim(),
    location: String(body?.location || "").trim(),
    description: String(body?.description || "").trim(),
    files: [],
    nearbySpots: Array.isArray(body?.nearbySpots) ? body.nearbySpots : [],
    uploadedImageUrls: Array.isArray(body?.uploadedImageUrls)
      ? body.uploadedImageUrls.filter((item) => typeof item === "string" && item.trim())
      : [],
  };
}

async function handleRequest(auth, data) {
  const {
    mode,
    selectedExistingPlace,
    name,
    districtSlug,
    location,
    description,
    files,
    nearbySpots,
  } = data;
  let { uploadedImageUrls } = data;

  if (mode === "existing") {
    if (!selectedExistingPlace) {
      return NextResponse.json({ error: "Select an existing place first." }, { status: 400 });
    }
    if (!files.length && !nearbySpots.length && !uploadedImageUrls.length) {
      return NextResponse.json(
        { error: "Add at least one photo or nearby spot for the existing place." },
        { status: 400 }
      );
    }
  } else if (!name || !districtSlug || !location || !description) {
    return NextResponse.json({ error: "All new-place fields are required." }, { status: 400 });
  }

  if (files.length > 0) {
    try {
      for (const file of files) {
        const uploaded = await uploadFileToImageKit(file, {
          folder: `/ghumnp/places/${slugify(mode === "existing" ? selectedExistingPlace : name)}`,
        });
        uploadedImageUrls.push(uploaded.url);
      }
    } catch (error) {
      return NextResponse.json(
        { error: error?.message || "Image upload failed. Please try again." },
        { status: 500 }
      );
    }
  }

  let placeId;
  let placeSlug;
  let placeDistrictSlug;

  if (mode === "existing") {
    const placeResult = await query(
      `SELECT p.id, p.slug, d.slug AS district_slug
       FROM Places p
       INNER JOIN Districts d ON d.id = p.district_id
       WHERE p.status = 'approved' AND p.slug = @slug`,
      { slug: selectedExistingPlace }
    );
    const place = placeResult.recordset[0];

    if (!place) {
      return NextResponse.json({ error: "Selected existing place was not found." }, { status: 404 });
    }

    placeId = place.id;
    placeSlug = place.slug;
    placeDistrictSlug = place.district_slug;
  } else {
    const districtResult = await query(
      `SELECT id, slug FROM Districts WHERE slug = @slug OR name = @name`,
      { slug: districtSlug.toLowerCase(), name: districtSlug }
    );
    const district = districtResult.recordset[0];

    if (!district) {
      return NextResponse.json({ error: "Selected district was not found." }, { status: 404 });
    }

    placeSlug = `${slugify(name)}-${Date.now()}`;

    const insertResult = await query(
      `INSERT INTO Places (
          district_id, created_by_user_id, slug, name, category, location_text,
          description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count
       )
       OUTPUT INSERTED.id, INSERTED.slug
       VALUES (
          @districtId, @userId, @slug, @name, @category, @location,
          @description, @coverImageUrl, 'approved', 0, 0, 0, 0
       )`,
      {
        districtId: district.id,
        userId: auth.id,
        slug: placeSlug,
        name,
        category: "attraction",
        location,
        description,
        coverImageUrl:
          uploadedImageUrls[0] ||
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
      }
    );

    placeId = insertResult.recordset[0]?.id;
    placeDistrictSlug = district.slug;
  }

  if (uploadedImageUrls.length) {
    for (let index = 0; index < uploadedImageUrls.length; index += 1) {
      await query(
        `INSERT INTO PlaceImages (place_id, image_url, sort_order)
         VALUES (@placeId, @imageUrl, @sortOrder)`,
        {
          placeId,
          imageUrl: uploadedImageUrls[index],
          sortOrder: index + 1,
        }
      );
    }

    if (mode === "existing") {
      await query(
        `UPDATE Places
         SET cover_image_url = @coverImageUrl,
             updated_at = SYSDATETIME()
         WHERE id = @placeId`,
        {
          placeId,
          coverImageUrl: uploadedImageUrls[0],
        }
      );
    }
  }

  for (const spot of nearbySpots) {
    if (!spot?.name || !spot?.category || !spot?.description) continue;

    const insertedSpot = await query(
      `INSERT INTO NearbySpots (
          place_id, created_by_user_id, name, category, description, image_url, status
       )
       VALUES (
          @placeId, @userId, @name, @category, @description, @imageUrl, 'pending'
       );
       SELECT SCOPE_IDENTITY() AS id;`,
      {
        placeId,
        userId: auth.id,
        name: String(spot.name).trim(),
        category: String(spot.category).trim(),
        description: String(spot.description).trim(),
        imageUrl: String(spot.imageUrl || "").trim() || null,
      }
    );

    const spotId = insertedSpot.recordset?.[0]?.id;
    const imageUrls = Array.isArray(spot.imageUrls)
      ? spot.imageUrls.filter((item) => typeof item === "string" && item.trim())
      : [];

    if (spotId && imageUrls.length) {
      for (let index = 0; index < imageUrls.length; index += 1) {
        await query(
          `INSERT INTO NearbySpotImages (nearby_spot_id, image_url, sort_order)
           VALUES (@spotId, @imageUrl, @sortOrder)`,
          {
            spotId,
            imageUrl: imageUrls[index],
            sortOrder: index + 1,
          }
        );
      }
    }
  }

  revalidatePath("/add");
  revalidatePath("/districts");
  if (placeDistrictSlug) {
    revalidatePath(`/districts/${placeDistrictSlug}`);
  }
  if (placeSlug) {
    revalidatePath(`/places/${placeSlug}`);
  }

  return NextResponse.json({
    ok: true,
    slug: placeSlug,
    districtSlug: placeDistrictSlug,
  });
}

export async function POST(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Please log in to submit a place." }, { status: 401 });
  }

  try {
    const data = await parseRequestData(request);
    return await handleRequest(auth, data);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Unable to submit contribution right now." },
      { status: 500 }
    );
  }
}
