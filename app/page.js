import HomePageClient from "@/components/pages/home-page-client";
import { getDistrictCards, getHomePageCollections } from "@/lib/content";

export const revalidate = 300;

export const metadata = {
  title: "visitNepal77 - Explore All 77 Districts",
  description:
    "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories. Plan your next adventure with Ghum Nepal.",
  keywords: [
    "Nepal travel",
    "Nepal districts",
    "visit Nepal",
    "hidden gems Nepal",
    "Nepal places",
    "travel Nepal guide",
  ],
  alternates: {
    canonical: "https://visitnepal77.com/",
  },
  openGraph: {
    title: "visitNepal77 - Explore All 77 Districts",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    url: "https://visitnepal77.com/",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "visitNepal77 - Explore All 77 Districts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "visitNepal77 - Explore All 77 Districts",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

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
    name: "visitNepal77",
    url: "https://visitnepal77.com/",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://visitnepal77.com/?q={search_term_string}",
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
        topPlaces={homeCollections.topPlaces}
        initialQuery={initialQuery}
      />
    </>
  );
}
