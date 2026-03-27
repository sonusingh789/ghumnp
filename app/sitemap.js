import { getDistrictCards, getRecentPlaces } from "@/lib/content";
import { SITE_URL, toAbsoluteUrl } from "@/lib/seo";

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
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    images: place.image ? [toAbsoluteUrl(place.image)] : undefined,
  }));

  return [...staticRoutes, ...districtRoutes, ...placeRoutes];
}
