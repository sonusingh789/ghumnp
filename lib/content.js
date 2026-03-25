import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { allDistricts as fallbackAllDistricts, contributionItems as fallbackContributionItems, districts as fallbackDistricts, places as fallbackPlaces, provinces as fallbackProvinces, userProfile as fallbackUserProfile } from "@/data/nepal";

function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return url;

  // Mobile browsers/webviews are stricter with insecure image URLs.
  // Prefer https when we receive legacy http content links from the database.
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }

  return url;
}

function mapDistrict(row) {
  return {
    id: row.slug,
    name: row.name,
    tagline: row.tagline || "A beautiful district waiting to be explored.",
    image: normalizeImageUrl(row.image_url) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
    province: row.province_name,
    rating: Number(row.rating || 0),
    visitorsCount: Number(row.visitors_count || 0),
  };
}

function mapPlace(row) {
  return {
    id: row.slug,
    name: row.name,
    districtId: row.district_slug,
    category: row.category,
    image: normalizeImageUrl(row.cover_image_url) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
    images: row.images?.length
      ? row.images.map(normalizeImageUrl)
      : row.cover_image_url
        ? [normalizeImageUrl(row.cover_image_url)]
        : [],
    rating: Number(row.rating || 0),
    description: row.description,
    location: row.location_text,
    isFeatured: Boolean(row.is_featured),
    isHidden: Boolean(row.is_hidden_gem),
    reviews: row.reviews || [],
    nearbySpots: row.nearbySpots || [],
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
    image: normalizeImageUrl(row.image_url) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
    images: row.images?.length
      ? row.images.map(normalizeImageUrl)
      : row.image_url
        ? [normalizeImageUrl(row.image_url)]
        : [],
  };
}

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

async function enrichPlaces(rows) {
  const placeIds = rows.map((row) => row.id);
  const [imagesByPlaceId, reviewsByPlaceId, nearbySpotsByPlaceId] = await Promise.all([
    fetchPlaceImages(placeIds),
    fetchReviewsByPlaceIds(placeIds),
    fetchNearbySpotsByPlaceIds(placeIds),
  ]);

  return rows.map((row) =>
    mapPlace({
      ...row,
      images: imagesByPlaceId.get(row.id) || [],
      reviews: reviewsByPlaceId.get(row.id) || [],
      nearbySpots: nearbySpotsByPlaceId.get(row.id) || [],
    })
  );
}

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
    const result = await query(
      `SELECT name
       FROM Provinces
       ORDER BY sort_order, name`
    );

    return result.recordset.map((row) => row.name);
  } catch {
    return fallbackProvinces;
  }
}

export async function getDistrictCards() {
  try {
    const result = await query(
      `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM Districts d
       INNER JOIN Provinces p ON p.id = d.province_id
       ORDER BY d.name`
    );

    const rows = result.recordset.map(mapDistrict);
    return rows;
  } catch {
    return fallbackDistricts;
  }
}

export async function getAllDistrictNames() {
  try {
    const result = await query(
      `SELECT name
       FROM Districts
       ORDER BY name`
    );

    return result.recordset.map((row) => row.name);
  } catch {
    return fallbackAllDistricts;
  }
}

export async function getDistrictBySlug(slug) {
  try {
    const result = await query(
      `SELECT d.id, d.slug, d.name, d.tagline, d.image_url, d.rating, d.visitors_count,
              p.name AS province_name
       FROM Districts d
       INNER JOIN Provinces p ON p.id = d.province_id
       WHERE d.slug = @slug`,
      { slug }
    );

    const district = result.recordset[0];
    return district ? mapDistrict(district) : null;
  } catch {
    return fallbackDistricts.find((district) => district.id === slug) || null;
  }
}

export async function getApprovedPlaces() {
  try {
    const result = await query(
      `SELECT pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved'
       ORDER BY pl.created_at DESC`
    );

    return await enrichPlaces(result.recordset);
  } catch {
    return fallbackPlaces;
  }
}

export async function getApprovedPlacesByDistrictSlug(districtSlug) {
  try {
    const result = await query(
      `SELECT pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved' AND d.slug = @districtSlug
       ORDER BY pl.is_featured DESC, pl.rating DESC, pl.name`,
      { districtSlug }
    );

    return await enrichPlaces(result.recordset);
  } catch {
    return fallbackPlaces.filter((place) => place.districtId === districtSlug);
  }
}

export async function getApprovedPlaceBySlug(placeSlug) {
  try {
    const result = await query(
      `SELECT TOP 1 pl.id, pl.slug, pl.name, pl.category, pl.cover_image_url, pl.rating, pl.description,
              pl.location_text, pl.is_featured, pl.is_hidden_gem, d.slug AS district_slug
       FROM Places pl
       INNER JOIN Districts d ON d.id = pl.district_id
       WHERE pl.status = 'approved' AND pl.slug = @placeSlug`,
      { placeSlug }
    );

    const row = result.recordset[0];
    if (!row) return null;

    const [place] = await enrichPlaces([row]);
    return place || null;
  } catch {
    return fallbackPlaces.find((place) => place.id === placeSlug) || null;
  }
}

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
        `SELECT TOP 10 pl.slug, pl.name, pl.location_text, pl.description, pl.category, pl.status, pl.created_at
         FROM Places pl
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
    const [placeIdsResult, placeSlugsResult, districtSlugsResult, districtCardsResult] = await Promise.all([
      query(
        `SELECT pl.slug
         FROM UserFavorites uf
         INNER JOIN Places pl ON pl.id = uf.place_id
         WHERE uf.user_id = @userId
         ORDER BY uf.created_at DESC`,
        { userId }
      ),
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
        ...placeIdsResult.recordset.map((row) => row.slug),
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
