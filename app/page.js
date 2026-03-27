import HomePageClient from "@/components/pages/home-page-client";
import { getDistrictCards, getHomePageCollections } from "@/lib/content";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Explore All 77 Districts",
  description:
    "Discover Nepal's 77 districts, local places, food spots, and travel ideas. Plan your next trip with visitNepal77.",
  path: "/",
  keywords: [
    "Nepal travel",
    "Nepal districts",
    "visit Nepal",
    "Nepal places",
    "travel Nepal guide",
    "district travel Nepal",
  ],
});

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.trim() : "";
  const [districts, homeCollections] = await Promise.all([
    getDistrictCards(),
    getHomePageCollections(),
  ]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description:
      "Discover Nepal's 77 districts, local places, food spots, and travel ideas.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageClient
        featuredDistricts={districts.slice(0, 5)}
        popularDistricts={homeCollections.popularDistricts}
        topPlaces={homeCollections.topPlaces}
        initialQuery={initialQuery}
      />
    </>
  );
}
