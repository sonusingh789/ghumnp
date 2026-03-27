import ExplorePageClient from "@/components/pages/explore-page-client";
import { getDistrictCards } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Explore Nepal",
  description:
    "Browse Nepal by province and district to find destinations, travel ideas, and local highlights.",
  path: "/explore",
  keywords: [
    "explore Nepal",
    "Nepal provinces",
    "Nepal districts",
    "Nepal travel destinations",
    "visit Nepal districts",
  ],
});

export default async function ExplorePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const districts = await getDistrictCards();
  const provinces = Array.from(new Set(districts.map((district) => district.province).filter(Boolean)));
  const districtsByProvince = Object.fromEntries(
    provinces.map((province) => [
      province,
      districts.filter((district) => district.province === province),
    ])
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Explore Nepal",
    url: `${SITE_URL}/explore`,
    description:
      "Browse Nepal by province and district to find destinations, travel ideas, and local highlights.",
    hasPart: provinces.map((province) => ({
      "@type": "ItemList",
      name: province,
      numberOfItems: districtsByProvince[province]?.length || 0,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ExplorePageClient
        districts={districts}
        provinces={provinces}
        districtsByProvince={districtsByProvince}
        initialQuery={String(resolvedSearchParams?.q || "")}
      />
    </>
  );
}
