import ExplorePageClient from "@/components/pages/explore-page-client";
import { getDistrictCards } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

const BASE_METADATA = {
  title: "Explore Nepal — Browse All 77 Districts by Province | visitNepal77",
  description:
    "Explore all 77 districts of Nepal organised by province. Find the best travel destinations, local attractions, hidden gems, and travel guides across Nepal's mountains, hills, and Terai plains — on visitNepal77.",
  path: "/explore",
  keywords: [
    "explore Nepal districts",
    "Nepal provinces and districts",
    "best districts to visit in Nepal",
    "visit Nepal",
    "Nepal travel destinations",
    "Nepal tourism guide",
    "77 districts of Nepal",
    "Nepal hill districts",
    "Nepal Himalayan districts",
    "Nepal Terai travel",
    "visitNepal77 explore",
  ],
};

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const hasQuery = Boolean(resolved?.q?.trim());
  return buildMetadata({ ...BASE_METADATA, noIndex: hasQuery });
}

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
