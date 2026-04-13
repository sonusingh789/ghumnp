import { getDistrictCards, getRecentPlaces } from "@/lib/content";
import { SITE_URL, toAbsoluteUrl } from "@/lib/seo";

const PLACE_TYPES = ["attraction", "food", "restaurant", "hotel", "stay"];

function provinceToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function sitemap() {
  const [districts, places] = await Promise.all([
    getDistrictCards().catch(() => []),
    getRecentPlaces().catch(() => []),
  ]);

  const now = new Date();
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/districts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/allplaces`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const districtRoutes = districts.map((district) => ({
    url: `${SITE_URL}/districts/${district.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
    images: district.image ? [toAbsoluteUrl(district.image)] : undefined,
  }));

  const placeRoutes = places.map((place) => ({
    url: `${SITE_URL}/place/${place.id}`,
    lastModified: place.updatedAt ? new Date(place.updatedAt) : now,
    changeFrequency: "weekly",
    priority: place.isFeatured ? 0.9 : 0.8,
    images: place.image ? [toAbsoluteUrl(place.image)] : undefined,
  }));

  // Typed category pages: /places/[district]/[type] — programmatic SEO surface
  const typedCategoryRoutes = districts.flatMap((district) =>
    PLACE_TYPES.map((type) => ({
      url: `${SITE_URL}/places/${district.id}/${type}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }))
  );

  // Province pillar pages: /explore/[province]
  const provinces = Array.from(new Set(districts.map((d) => d.province).filter(Boolean)));
  const provinceRoutes = provinces.map((province) => ({
    url: `${SITE_URL}/explore/${provinceToSlug(province)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...districtRoutes, ...placeRoutes, ...typedCategoryRoutes, ...provinceRoutes];
}
