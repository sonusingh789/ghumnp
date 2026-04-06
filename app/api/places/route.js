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

function parseLineArray(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasSeoValue(seoContent) {
  return Boolean(
    seoContent &&
      Object.values(seoContent).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim())
      )
  );
}

async function upsertPlaceSeoContent(placeId, seoContent) {
  if (!placeId || !hasSeoValue(seoContent)) return;

  await query(
    `MERGE PlaceSeoContent AS target
     USING (SELECT @placeId AS place_id) AS source
     ON target.place_id = source.place_id
     WHEN MATCHED THEN
       UPDATE SET
         long_description = @longDescription,
         highlights = @highlights,
         practical_tips = @practicalTips,
         best_season = @bestSeason,
         entry_access_info = @entryAccessInfo,
         nearby_attractions = @nearbyAttractions,
         faqs = @faqs,
         updated_at = SYSUTCDATETIME()
     WHEN NOT MATCHED THEN
       INSERT (place_id, long_description, highlights, practical_tips, best_season, entry_access_info, nearby_attractions, faqs)
       VALUES (@placeId, @longDescription, @highlights, @practicalTips, @bestSeason, @entryAccessInfo, @nearbyAttractions, @faqs);`,
    {
      placeId,
      longDescription: seoContent.longDescription || null,
      highlights: seoContent.highlights?.length ? JSON.stringify(seoContent.highlights) : null,
      practicalTips: seoContent.practicalTips || null,
      bestSeason: seoContent.bestSeason || null,
      entryAccessInfo: seoContent.entryAccessInfo || null,
      nearbyAttractions: seoContent.nearbyAttractions?.length ? JSON.stringify(seoContent.nearbyAttractions) : null,
      faqs: seoContent.faqs?.length ? JSON.stringify(seoContent.faqs) : null,
    }
  );
}

async function upsertDistrictSeoContent(districtId, seoContent) {
  if (!districtId || !hasSeoValue(seoContent)) return;

  await query(
    `MERGE DistrictSeoContent AS target
     USING (SELECT @districtId AS district_id) AS source
     ON target.district_id = source.district_id
     WHEN MATCHED THEN
       UPDATE SET
         intro_text = @intro,
         top_things_to_do = @topThingsToDo,
         best_time_to_visit = @bestTimeToVisit,
         how_to_reach = @howToReach,
         local_foods_culture = @localFoodsCulture,
         faqs = @faqs,
         updated_at = SYSUTCDATETIME()
     WHEN NOT MATCHED THEN
       INSERT (district_id, intro_text, top_things_to_do, best_time_to_visit, how_to_reach, local_foods_culture, faqs)
       VALUES (@districtId, @intro, @topThingsToDo, @bestTimeToVisit, @howToReach, @localFoodsCulture, @faqs);`,
    {
      districtId,
      intro: seoContent.intro || null,
      topThingsToDo: seoContent.topThingsToDo?.length ? JSON.stringify(seoContent.topThingsToDo) : null,
      bestTimeToVisit: seoContent.bestTimeToVisit || null,
      howToReach: seoContent.howToReach || null,
      localFoodsCulture: seoContent.localFoodsCulture || null,
      faqs: seoContent.faqs?.length ? JSON.stringify(seoContent.faqs) : null,
    }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  const search = searchParams.get("search")?.trim();

  if (search) {
    const categoryFilter = searchParams.get("category")?.trim();
    const categoryClause = categoryFilter ? `AND p.category = @category` : "";
    const result = await query(
      `SELECT TOP 10 p.slug, p.name, p.category, p.location_text, d.name AS district_name
       FROM Places p
       INNER JOIN Districts d ON d.id = p.district_id
       WHERE p.status = 'approved'
         ${categoryClause}
         AND (
           p.name LIKE @search
           OR p.location_text LIKE @search
           OR d.name LIKE @search
         )
       ORDER BY p.name`,
      { search: `%${search}%`, ...(categoryFilter ? { category: categoryFilter } : {}) }
    );

    return NextResponse.json({
      places: result.recordset.map((row) => ({
        id: row.slug,
        name: row.name,
        category: row.category,
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
      category: String(formData.get("category") || "attraction").trim(),
      name: String(formData.get("name") || "").trim(),
      districtSlug: String(formData.get("district") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      placeSeoContent: {
        longDescription: String(formData.get("placeLongDescription") || "").trim(),
        highlights: parseLineArray(formData.get("placeHighlights")),
        practicalTips: String(formData.get("placePracticalTips") || "").trim(),
        bestSeason: String(formData.get("placeBestSeason") || "").trim(),
        entryAccessInfo: String(formData.get("placeEntryAccessInfo") || "").trim(),
        nearbyAttractions: parseLineArray(formData.get("placeNearbyAttractions")),
        faqs: parseLineArray(formData.get("placeFaqs")),
      },
      districtSeoContent: {
        intro: String(formData.get("districtIntro") || "").trim(),
        topThingsToDo: parseLineArray(formData.get("districtTopThingsToDo")),
        bestTimeToVisit: String(formData.get("districtBestTimeToVisit") || "").trim(),
        howToReach: String(formData.get("districtHowToReach") || "").trim(),
        localFoodsCulture: String(formData.get("districtLocalFoodsCulture") || "").trim(),
        faqs: parseLineArray(formData.get("districtFaqs")),
      },
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
    category: String(body?.category || "attraction").trim(),
    name: String(body?.name || "").trim(),
    districtSlug: String(body?.district || "").trim(),
    location: String(body?.location || "").trim(),
    description: String(body?.description || "").trim(),
    placeSeoContent: {
      longDescription: String(body?.placeLongDescription || "").trim(),
      highlights: parseLineArray(body?.placeHighlights),
      practicalTips: String(body?.placePracticalTips || "").trim(),
      bestSeason: String(body?.placeBestSeason || "").trim(),
      entryAccessInfo: String(body?.placeEntryAccessInfo || "").trim(),
      nearbyAttractions: parseLineArray(body?.placeNearbyAttractions),
      faqs: parseLineArray(body?.placeFaqs),
    },
    districtSeoContent: {
      intro: String(body?.districtIntro || "").trim(),
      topThingsToDo: parseLineArray(body?.districtTopThingsToDo),
      bestTimeToVisit: String(body?.districtBestTimeToVisit || "").trim(),
      howToReach: String(body?.districtHowToReach || "").trim(),
      localFoodsCulture: String(body?.districtLocalFoodsCulture || "").trim(),
      faqs: parseLineArray(body?.districtFaqs),
    },
    files: [],
    nearbySpots: Array.isArray(body?.nearbySpots) ? body.nearbySpots : [],
    uploadedImages: Array.isArray(body?.uploadedImages)
      ? body.uploadedImages.filter((item) => item?.url && typeof item.url === "string")
      : [],
    uploadedImageUrls: Array.isArray(body?.uploadedImageUrls)
      ? body.uploadedImageUrls.filter((item) => typeof item === "string" && item.trim())
      : [],
  };
}

const VALID_CATEGORIES = new Set(["attraction", "food", "restaurant", "hotel", "stay"]);

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
    placeSeoContent,
    districtSeoContent,
  } = data;
  const category = VALID_CATEGORIES.has(data.category) ? data.category : "attraction";
  // uploadedImages carries {url, fileId} for pre-uploaded images (JSON path)
  // uploadedImageUrls is the legacy plain-URL array (kept for compat)
  let uploadedImages = Array.isArray(data.uploadedImages) ? [...data.uploadedImages] : [];
  let { uploadedImageUrls } = data;
  // Merge so uploadedImageUrls stays consistent with uploadedImages
  if (uploadedImages.length && !uploadedImageUrls.length) {
    uploadedImageUrls = uploadedImages.map((img) => img.url);
  }
  const hasPlaceSeoContent = hasSeoValue(placeSeoContent);
  const hasDistrictSeoContent = hasSeoValue(districtSeoContent);

  if (mode === "existing") {
    if (!selectedExistingPlace) {
      return NextResponse.json({ error: "Select an existing place first." }, { status: 400 });
    }
    if (!files.length && !nearbySpots.length && !uploadedImageUrls.length && !hasPlaceSeoContent && !hasDistrictSeoContent) {
      return NextResponse.json(
        { error: "Add photos, nearby spots, or SEO details for the existing place." },
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
        uploadedImages.push({ url: uploaded.url, fileId: uploaded.fileId || null });
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
  let placeDistrictId;
  let placeDistrictSlug;

  if (mode === "existing") {
    const placeResult = await query(
      `SELECT p.id, p.slug, d.id AS district_id, d.slug AS district_slug
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
    placeDistrictId = place.district_id;
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
    placeDistrictId = district.id;

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
        category,
        location,
        description,
        coverImageUrl:
          uploadedImageUrls[0] ||
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
      }
    );

    placeId = insertResult.recordset[0]?.id;
    placeDistrictSlug = district.slug;

    // Increment contributor stats
    if (auth?.id) {
      await query(
        `IF NOT EXISTS (SELECT 1 FROM ContributorStats WHERE user_id = @uid)
           INSERT INTO ContributorStats (user_id) VALUES (@uid);
         UPDATE ContributorStats SET places_submitted = places_submitted + 1, places_approved = places_approved + 1 WHERE user_id = @uid`,
        { uid: Number(auth.id) }
      );
    }
  }

  if (uploadedImageUrls.length) {
    const maxSortResult = await query(
      `SELECT ISNULL(MAX(sort_order), 0) AS maxSort FROM PlaceImages WHERE place_id = @placeId`,
      { placeId }
    );
    const baseSort = maxSortResult.recordset[0]?.maxSort ?? 0;

    for (let index = 0; index < uploadedImageUrls.length; index += 1) {
      const imagekitFileId = uploadedImages[index]?.fileId || null;
      try {
        await query(
          `INSERT INTO PlaceImages (place_id, image_url, imagekit_file_id, sort_order)
           VALUES (@placeId, @imageUrl, @imagekitFileId, @sortOrder)`,
          { placeId, imageUrl: uploadedImageUrls[index], imagekitFileId, sortOrder: baseSort + index + 1 }
        );
      } catch {
        // imagekit_file_id column not yet added — fall back until migration is run
        await query(
          `INSERT INTO PlaceImages (place_id, image_url, sort_order)
           VALUES (@placeId, @imageUrl, @sortOrder)`,
          { placeId, imageUrl: uploadedImageUrls[index], sortOrder: baseSort + index + 1 }
        );
      }
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

  await upsertPlaceSeoContent(placeId, placeSeoContent);
  await upsertDistrictSeoContent(placeDistrictId, districtSeoContent);

  revalidatePath("/add");
  revalidatePath("/districts");
  if (placeDistrictSlug) {
    revalidatePath(`/districts/${placeDistrictSlug}`);
  }
  if (placeSlug) {
    revalidatePath(`/place/${placeSlug}`);
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
