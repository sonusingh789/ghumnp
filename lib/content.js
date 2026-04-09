import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { query } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { allDistricts as fallbackAllDistricts, contributionItems as fallbackContributionItems, districts as fallbackDistricts, places as fallbackPlaces, provinces as fallbackProvinces, userProfile as fallbackUserProfile } from "@/data/nepal";

function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return url;

  // Upgrade http → https
  if (url.startsWith("http://")) {
    url = `https://${url.slice("http://".length)}`;
  }

  // ImageKit: strip any stale transforms, apply a single optimised one
  if (url.includes("ik.imagekit.io")) {
    try {
      const u = new URL(url);
      u.searchParams.delete("tr");
      u.pathname = u.pathname.replace(/\/tr:[^/]+/, "");
      u.searchParams.set("tr", "w-900,q-82,f-auto");
      return u.toString();
    } catch {
      return url;
    }
  }

  // Unsplash: cap at 900 px, auto WebP, keep crop
  if (url.includes("images.unsplash.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("w", "900");
      u.searchParams.set("q", "82");
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim());
      }
    } catch {
      return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function mapDistrictSeo(row) {
  if (!row) return null;

  return {
    intro: row.intro_text || "",
    topThingsToDo: parseJsonArray(row.top_things_to_do),
    bestTimeToVisit: row.best_time_to_visit || "",
    howToReach: row.how_to_reach || "",
    localFoodsCulture: row.local_foods_culture || "",
    faqs: parseJsonArray(row.faqs),
  };
}

function mapPlaceSeo(row) {
  if (!row) return null;

  return {
    longDescription: row.long_description || "",
    highlights: parseJsonArray(row.highlights),
    practicalTips: row.practical_tips || "",
    bestSeason: row.best_season || "",
    entryAccessInfo: row.entry_access_info || "",
    nearbyAttractions: parseJsonArray(row.nearby_attractions),
    faqs: parseJsonArray(row.faqs),
  };
}

function mapDistrict(row) {
  return {
    id: row.slug,
    recordId: Number(row.id || 0),
    name: row.name,
    tagline: row.tagline || "A beautiful district waiting to be explored.",
    image: normalizeImageUrl(row.image_url) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop",
    province: row.province_name,
    rating: Number(row.rating || 0),
    visitorsCount: Number(row.visitors_count || 0),
    seoContent: row.seoContent || null,
  };
}

function mapPlace(row) {
  return {
    id: row.slug,
    recordId: Number(row.id || 0),
    name: row.name,
    districtId: row.district_slug,
    category: row.category,
    image: normalizeImageUrl(row.cover_image_url) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop",
    images: row.images?.length
      ? row.images.map((u) => normalizeImageUrl(u))
      : row.cover_image_url
        ? [normalizeImageUrl(row.cover_image_url, { width: 1920, quality: 100 })]
        : [],
    rating: Number(row.rating || 0),
    description: row.description,
    location: row.location_text,
    isFeatured: Boolean(row.is_featured),
    isHidden: Boolean(row.is_hidden_gem),
    is_verified: Boolean(row.is_verified),
    contributor: row.contributor_id
      ? {
          id: row.contributor_id,
          name: row.contributor_name,
          avatar: normalizeImageUrl(row.contributor_avatar) || null,
          badge: row.contributor_badge || "explorer",
        }
      : null,
    reviews: row.reviews || [],
    nearbySpots: row.nearbySpots || [],
    seoContent: row.seoContent || null,
  };
}

function mapPlaceSummary(row) {
  return {
    id: row.slug,
    recordId: Number(row.id || 0),
    name: row.name,
    districtId: row.district_slug,
    category: row.category,
    image:
      normalizeImageUrl(row.cover_image_url) ||
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop",
    images: row.cover_image_url ? [normalizeImageUrl(row.cover_image_url)] : [],
    rating: Number(row.rating || 0),
    description: row.description,
    location: row.location_text,
    isFeatured: Boolean(row.is_featured),
    isHidden: Boolean(row.is_hidden_gem),
    reviews: [],
    nearbySpots: [],
    seoContent: row.seoContent || null,
  };
}

function mapReview(row) {
  return {
    id: String(row.id),
    author: row.author_name,
    avatar: normalizeImageUrl(row.author_avatar_url) || "https://i.pravatar.cc/80?img=48",
    rating: Number(row.rating),
    comment: row.comment,
    date: row.created_at,
  };
}

function mapNearbySpot(row) {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    description: row.description,
    image: normalizeImageUrl(row.image_url) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop",
    images: row.images?.length
      ? row.images.map(normalizeImageUrl)
      : row.image_url
        ? [normalizeImageUrl(row.image_url)]
        : [],
  };
}

const getCachedProvinceNames = unstable_cache(
  async () => {
    const result = await query(
      `SELECT name
       FROM Provinces
       ORDER BY sort_order, name`
    );

    return result.recordset.map((row) => row.name);
  },
  ["province-names"],
  { revalidate: 300 }
);

const getCachedDistrictCards = unstable_cache(
  async () => {
    const result = await query(
      `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM Districts d
       INNER JOIN Provinces p ON p.id = d.province_id
       ORDER BY d.name`
    );

    return result.recordset.map(mapDistrict);
  },
  ["district-cards"],
  { revalidate: 300 }
);

const getCachedFeaturedDistricts = unstable_cache(
  async () => {
    const result = await query(
      `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM Districts d
       INNER JOIN Provinces p ON p.id = d.province_id
       WHERE d.is_featured = 1
       ORDER BY d.name`
    );

    return result.recordset.map(mapDistrict);
  },
  ["featured-districts"],
  { revalidate: 300 }
);

const getCachedAllDistrictNames = unstable_cache(
  async () => {
    const result = await query(
      `SELECT name
       FROM Districts
       ORDER BY name`
    );

    return result.recordset.map((row) => row.name);
  },
  ["district-names"],
  { revalidate: 300 }
);

const getCachedDistrictBySlug = unstable_cache(
  async (slug) => {
    const result = await query(
      `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM Districts d
       INNER JOIN Provinces p ON p.id = d.province_id
       WHERE d.slug = @slug`,
      { slug }
    );

    const district = result.recordset[0];
    if (!district) return null;

    const seoContent = await fetchDistrictSeoByDistrictId(district.id);
    return mapDistrict({
      ...district,
      seoContent,
    });
  },
  ["district-by-slug"],
  { revalidate: 300 }
);

async function fetchPlaceImages(placeIds) {
  if (!placeIds.length) return new Map();

  const result = await query(
    `SELECT place_id, image_url
     FROM PlaceImages
     WHERE place_id IN (${placeIds.map((_, index) => `@id${index}`).join(", ")})
     ORDER BY sort_order, id`,
    Object.fromEntries(placeIds.map((id, index) => [`id${index}`, id]))
  );

  const imagesByPlaceId = new Map();

  for (const row of result.recordset) {
    const current = imagesByPlaceId.get(row.place_id) || [];
    current.push(normalizeImageUrl(row.image_url));
    imagesByPlaceId.set(row.place_id, current);
  }

  return imagesByPlaceId;
}

async function fetchReviewsByPlaceIds(placeIds) {
  if (!placeIds.length) return new Map();

  const result = await query(
    `SELECT pr.id, pr.place_id, pr.rating, pr.comment, pr.created_at,
            u.name AS author_name, u.avatar_url AS author_avatar_url
     FROM PlaceReviews pr
     INNER JOIN Users u ON u.id = pr.user_id
     WHERE pr.place_id IN (${placeIds.map((_, index) => `@id${index}`).join(", ")})
     ORDER BY pr.created_at DESC`,
    Object.fromEntries(placeIds.map((id, index) => [`id${index}`, id]))
  );

  const reviewsByPlaceId = new Map();

  for (const row of result.recordset) {
    const current = reviewsByPlaceId.get(row.place_id) || [];
    current.push(mapReview(row));
    reviewsByPlaceId.set(row.place_id, current);
  }

  return reviewsByPlaceId;
}

async function fetchNearbySpotsByPlaceIds(placeIds) {
  if (!placeIds.length) return new Map();

  const params = Object.fromEntries(placeIds.map((id, index) => [`id${index}`, id]));
  const placeholders = placeIds.map((_, index) => `@id${index}`).join(", ");

  const [spotsResult, spotImagesResult] = await Promise.all([
    query(
      `SELECT ns.id, ns.place_id, ns.name, ns.category, ns.description, ns.image_url
       FROM NearbySpots ns
       WHERE ns.place_id IN (${placeholders})
         AND ns.status IN ('pending', 'approved')
       ORDER BY ns.created_at DESC, ns.id DESC`,
      params
    ).catch(() => ({ recordset: [] })),
    query(
      `SELECT nsi.nearby_spot_id, nsi.image_url
       FROM NearbySpotImages nsi
       INNER JOIN NearbySpots ns ON ns.id = nsi.nearby_spot_id
       WHERE ns.place_id IN (${placeholders})
       ORDER BY nsi.sort_order, nsi.id`,
      params
    ).catch(() => ({ recordset: [] })),
  ]);

  const imageMap = new Map();
  for (const row of spotImagesResult.recordset) {
    const current = imageMap.get(row.nearby_spot_id) || [];
    current.push(normalizeImageUrl(row.image_url));
    imageMap.set(row.nearby_spot_id, current);
  }

  const spotsByPlaceId = new Map();
  for (const row of spotsResult.recordset) {
    const current = spotsByPlaceId.get(row.place_id) || [];
    current.push(
      mapNearbySpot({
        ...row,
        images: imageMap.get(row.id) || [],
      })
    );
    spotsByPlaceId.set(row.place_id, current);
  }

  return spotsByPlaceId;
}

async function fetchPlaceSeoByPlaceIds(placeIds) {
  if (!placeIds.length) return new Map();

  try {
    const params = Object.fromEntries(placeIds.map((id, index) => [`id${index}`, id]));
    const placeholders = placeIds.map((_, index) => `@id${index}`).join(", ");
    const result = await query(
      `SELECT place_id, long_description, highlights, practical_tips, best_season,
              entry_access_info, nearby_attractions, faqs
       FROM PlaceSeoContent
       WHERE place_id IN (${placeholders})`,
      params
    );

    return new Map(result.recordset.map((row) => [row.place_id, mapPlaceSeo(row)]));
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("PlaceSeoContent") || message.includes("Invalid object name")) {
      return new Map();
    }
    throw error;
  }
}

async function fetchDistrictSeoByDistrictId(districtId) {
  if (!districtId) return null;

  try {
    const result = await query(
      `SELECT TOP 1 district_id, intro_text, top_things_to_do, best_time_to_visit,
              how_to_reach, local_foods_culture, faqs
       FROM DistrictSeoContent
       WHERE district_id = @districtId`,
      { districtId }
    );

    return mapDistrictSeo(result.recordset[0]);
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("DistrictSeoContent") || message.includes("Invalid object name")) {
      return null;
    }
    throw error;
  }
}

async function enrichPlaces(rows) {
  const placeIds = rows.map((row) => row.id);
  const [imagesByPlaceId, reviewsByPlaceId, nearbySpotsByPlaceId, seoByPlaceId] = await Promise.all([
    fetchPlaceImages(placeIds),
    fetchReviewsByPlaceIds(placeIds),
    fetchNearbySpotsByPlaceIds(placeIds),
    fetchPlaceSeoByPlaceIds(placeIds),
  ]);

  return rows.map((row) =>
    mapPlace({
      ...row,
      images: imagesByPlaceId.get(row.id) || [],
      reviews: reviewsByPlaceId.get(row.id) || [],
      nearbySpots: nearbySpotsByPlaceId.get(row.id) || [],
      seoContent: seoByPlaceId.get(row.id) || null,
    })
  );
}

const getCachedApprovedPlaces = unstable_cache(
  async () => {
    const result = await query(
      `SELECT pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved'
       ORDER BY pl.created_at DESC`
    );

    return enrichPlaces(result.recordset);
  },
  ["approved-places"],
  { revalidate: 300 }
);

const getCachedRecentPlaces = unstable_cache(
  async () => {
    const result = await query(
      `SELECT pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved'
       ORDER BY pl.created_at DESC, pl.id DESC`
    );

    return result.recordset.map(mapPlaceSummary);
  },
  ["recent-places"],
  { revalidate: 300 }
);

const getCachedHomePageCollections = unstable_cache(
  async () => {
    const popularDistrictsResult = await query(
      `SELECT TOP 10 d.id, d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM Districts d
       INNER JOIN Provinces p ON p.id = d.province_id
       ORDER BY d.visitors_count DESC, d.rating DESC, d.name`
    );

    const topRatedPlacesResult = await query(
      `SELECT TOP 20 pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved' AND pl.rating >= 4.5
       ORDER BY pl.rating DESC, pl.review_count DESC, pl.created_at DESC, pl.name`
    );

    const fallbackTopPlacesResult =
      topRatedPlacesResult.recordset.length > 0
        ? topRatedPlacesResult
        : await query(
            `SELECT TOP 20 pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
                    pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
             FROM Places pl
             INNER JOIN Districts d ON d.id = pl.district_id
             WHERE pl.status = 'approved'
             ORDER BY pl.rating DESC, pl.review_count DESC, pl.created_at DESC, pl.name`
          );

    return {
      popularDistricts: popularDistrictsResult.recordset.map(mapDistrict),
      topPlaces: fallbackTopPlacesResult.recordset.map(mapPlaceSummary),
    };
  },
  ["home-page-collections"],
  { revalidate: 300 }
);

export async function getHomePageCollections() {
  try {
    return await getCachedHomePageCollections();
  } catch {
    return {
      popularDistricts: [...fallbackDistricts]
        .sort((first, second) => {
          const visitorsDelta = Number(second.visitorsCount || 0) - Number(first.visitorsCount || 0);
          if (visitorsDelta !== 0) return visitorsDelta;
          return Number(second.rating || 0) - Number(first.rating || 0);
        })
        .slice(0, 10),
      topPlaces: fallbackPlaces
        .filter((place) => Number(place.rating || 0) >= 4.5)
        .sort((first, second) => Number(second.rating || 0) - Number(first.rating || 0))
        .slice(0, 20),
    };
  }
}

const getCachedApprovedPlacesByDistrictSlug = unstable_cache(
  async (districtSlug) => {
    const result = await query(
      `SELECT pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved' AND d.slug = @districtSlug
       ORDER BY pl.is_featured DESC, pl.rating DESC, pl.name`,
      { districtSlug }
    );

    return enrichPlaces(result.recordset);
  },
  ["approved-places-by-district"],
  { revalidate: 300 }
);

const getCachedDistrictListingPlacesByDistrictSlug = unstable_cache(
  async (districtSlug) => {
    const result = await query(
      `SELECT pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved' AND d.slug = @districtSlug
       ORDER BY pl.is_featured DESC, pl.rating DESC, pl.name`,
      { districtSlug }
    );

    return result.recordset.map((row) =>
      mapPlace({
        ...row,
        id: row.slug,
        images: row.cover_image_url ? [normalizeImageUrl(row.cover_image_url)] : [],
        reviews: [],
        nearbySpots: [],
      })
    );
  },
  ["district-listing-places-by-district"],
  { revalidate: 300 }
);

const getCachedApprovedPlaceBySlug = unstable_cache(
  async (placeSlug) => {
    const result = await query(
      `SELECT TOP 1 pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, pl.is_verified, d.slug AS district_slug,
              u.id AS contributor_id, u.name AS contributor_name, u.avatar_url AS contributor_avatar,
              cs.badge_level AS contributor_badge
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       LEFT JOIN Users u ON u.id = pl.created_by_user_id
       LEFT JOIN ContributorStats cs ON cs.user_id = pl.created_by_user_id
       WHERE pl.status = 'approved' AND pl.slug = @placeSlug`,
      { placeSlug }
    );

    const row = result.recordset[0];
    if (!row) return null;

    const [place] = await enrichPlaces([row]);
    return place || null;
  },
  ["approved-place-by-slug"],
  { revalidate: 300 }
);

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    return Number(payload.sub);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const result = await query(
      `SELECT id, name, email, avatar_url, bio
       FROM Users
       WHERE id = @id`,
      { id: userId }
    );

    const user = result.recordset[0];
    return user || null;
  } catch {
    return null;
  }
}

export async function getProvinceNames() {
  try {
    return await getCachedProvinceNames();
  } catch {
    return fallbackProvinces;
  }
}

export async function getDistrictCards() {
  try {
    return await getCachedDistrictCards();
  } catch {
    return fallbackDistricts;
  }
}

export async function getFeaturedDistricts() {
  try {
    const featured = await getCachedFeaturedDistricts();
    return featured.length ? featured : (await getCachedDistrictCards()).slice(0, 5);
  } catch {
    return fallbackDistricts.slice(0, 5);
  }
}

export async function getAllDistrictNames() {
  try {
    return await getCachedAllDistrictNames();
  } catch {
    return fallbackAllDistricts;
  }
}

export const getDistrictBySlug = cache(async function getDistrictBySlug(slug) {
  try {
    return await getCachedDistrictBySlug(slug);
  } catch {
    return fallbackDistricts.find((district) => district.id === slug) || null;
  }
});

export async function getApprovedPlaces() {
  try {
    return await getCachedApprovedPlaces();
  } catch {
    return fallbackPlaces;
  }
}

export async function getRecentPlaces() {
  try {
    return await getCachedRecentPlaces();
  } catch {
    return fallbackPlaces.slice(0, 100);
  }
}

export const getApprovedPlacesByDistrictSlug = cache(async function getApprovedPlacesByDistrictSlug(districtSlug) {
  try {
    return await getCachedApprovedPlacesByDistrictSlug(districtSlug);
  } catch {
    return fallbackPlaces.filter((place) => place.districtId === districtSlug);
  }
});

export const getDistrictListingPlacesByDistrictSlug = cache(async function getDistrictListingPlacesByDistrictSlug(districtSlug) {
  try {
    return await getCachedDistrictListingPlacesByDistrictSlug(districtSlug);
  } catch {
    return fallbackPlaces.filter((place) => place.districtId === districtSlug);
  }
});

export const getApprovedPlaceBySlug = cache(async function getApprovedPlaceBySlug(placeSlug) {
  try {
    return await getCachedApprovedPlaceBySlug(placeSlug);
  } catch {
    return fallbackPlaces.find((place) => place.id === placeSlug) || null;
  }
});

export async function getApprovedPlacesBySlugs(placeSlugs) {
  if (!placeSlugs.length) return [];

  try {
    const params = Object.fromEntries(placeSlugs.map((slug, index) => [`slug${index}`, slug]));
    const result = await query(
      `SELECT pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved' AND pl.slug IN (${placeSlugs.map((_, index) => `@slug${index}`).join(", ")})`,
      params
    );

    const places = await enrichPlaces(result.recordset);
    const bySlug = new Map(places.map((place) => [place.id, place]));
    return placeSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  } catch {
    return fallbackPlaces.filter((place) => placeSlugs.includes(place.id));
  }
}

export async function getProfileData() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      userProfile: fallbackUserProfile,
      contributionItems: fallbackContributionItems,
      recentReviews: fallbackPlaces.flatMap((place) =>
        (place.reviews || []).map((review) => ({ ...review, placeName: place.name }))
      ),
    };
  }

  try {
    const [statsResult, contributionsResult, reviewsResult] = await Promise.all([
      query(
        `SELECT
            (SELECT COUNT(*) FROM Places WHERE created_by_user_id = @userId) AS contributions_count,
            (SELECT COUNT(*) FROM PlaceReviews WHERE user_id = @userId) AS reviews_count`,
        { userId: user.id }
      ),
      query(
        `SELECT pl.slug, pl.name, pl.location_text, pl.description, pl.category, pl.status, pl.created_at,
                pl.cover_image_url, d.name AS district_name
         FROM Places pl
         LEFT JOIN Districts d ON d.id = pl.district_id
         WHERE pl.created_by_user_id = @userId
         ORDER BY pl.created_at DESC`,
        { userId: user.id }
      ),
      query(
        `SELECT TOP 10 pr.id, pr.rating, pr.comment, pr.created_at, pl.name AS place_name
         FROM PlaceReviews pr
         INNER JOIN Places pl ON pl.id = pr.place_id
         WHERE pr.user_id = @userId
         ORDER BY pr.created_at DESC`,
        { userId: user.id }
      ),
    ]);

    const stats = statsResult.recordset[0] || {};

    return {
      userProfile: {
        name: user.name,
        email: user.email,
        bio: user.bio || "Discovering Nepal, one memorable place at a time.",
        avatar: user.avatar_url || "https://i.pravatar.cc/160?img=14",
        stats: {
          contributions: Number(stats.contributions_count || 0),
          reviews: Number(stats.reviews_count || 0),
        },
      },
      contributionItems: contributionsResult.recordset.map((row) => ({
        id: row.slug,
        slug: row.slug,
        name: row.name,
        location: row.location_text,
        description: row.description,
        category: row.category,
        district: row.district_name || "",
        coverImage: row.cover_image_url || "",
        statusValue: row.status,
        dateLabel: new Date(row.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: row.status === "approved" ? "Published" : row.status === "pending" ? "Pending" : "Rejected",
      })),
      recentReviews: reviewsResult.recordset.map((row) => ({
        id: String(row.id),
        reviewId: String(row.id),
        author: user.name,
        avatar: user.avatar_url || "https://i.pravatar.cc/80?img=48",
        rating: Number(row.rating),
        comment: row.comment,
        date: row.created_at,
        placeName: row.place_name,
      })),
    };
  } catch {
    return {
      userProfile: fallbackUserProfile,
      contributionItems: fallbackContributionItems,
      recentReviews: fallbackPlaces.flatMap((place) =>
        (place.reviews || []).map((review) => ({ ...review, placeName: place.name }))
      ),
    };
  }
}

export async function getFavoriteCollections() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      authenticated: false,
      favorites: [],
      favoritePlaces: [],
      favoriteDistricts: [],
    };
  }

  try {
    const [placeSlugsResult, districtSlugsResult, districtCardsResult] = await Promise.all([
      query(
        `SELECT pl.slug
         FROM UserFavorites uf
         INNER JOIN Places pl ON pl.id = uf.place_id
         WHERE uf.user_id = @userId
         ORDER BY uf.created_at DESC`,
        { userId }
      ),
      query(
        `SELECT d.slug
         FROM UserDistrictFavorites udf
         INNER JOIN Districts d ON d.id = udf.district_id
         WHERE udf.user_id = @userId
         ORDER BY udf.created_at DESC`,
        { userId }
      ).catch((error) => {
        const message = String(error?.message || "");
        if (message.includes("UserDistrictFavorites") || message.includes("Invalid object name")) {
          return { recordset: [] };
        }
        throw error;
      }),
      query(
        `SELECT d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
                p.name AS province_name
         FROM UserDistrictFavorites udf
         INNER JOIN Districts d ON d.id = udf.district_id
         INNER JOIN Provinces p ON p.id = d.province_id
         WHERE udf.user_id = @userId
         ORDER BY udf.created_at DESC`,
        { userId }
      ).catch((error) => {
        const message = String(error?.message || "");
        if (message.includes("UserDistrictFavorites") || message.includes("Invalid object name")) {
          return { recordset: [] };
        }
        throw error;
      }),
    ]);

    const favoritePlaces = await getApprovedPlacesBySlugs(
      placeSlugsResult.recordset.map((row) => row.slug)
    );

    return {
      authenticated: true,
      favorites: [
        ...placeSlugsResult.recordset.map((row) => row.slug),
        ...districtSlugsResult.recordset.map((row) => `district:${row.slug}`),
      ],
      favoritePlaces,
      favoriteDistricts: districtCardsResult.recordset.map(mapDistrict),
    };
  } catch {
    return {
      authenticated: true,
      favorites: [],
      favoritePlaces: [],
      favoriteDistricts: [],
    };
  }
}
