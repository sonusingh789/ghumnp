import ExplorePageClient from "@/components/pages/explore-page-client";
import { getDistrictCards } from "@/lib/content";

export const revalidate = 300;

export const metadata = {
  title: "Explore Nepal - visitNepal77",
  description:
    "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
  keywords: [
    "explore Nepal",
    "Nepal provinces",
    "Nepal districts",
    "Nepal travel destinations",
    "visit Nepal districts",
  ],
  alternates: {
    canonical: "https://visitnepal77.com/explore",
  },
  openGraph: {
    title: "Explore Nepal - visitNepal77",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
    url: "https://visitnepal77.com/explore",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Explore Nepal - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Nepal - visitNepal77",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

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
    url: "https://visitnepal77.com/explore",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
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
