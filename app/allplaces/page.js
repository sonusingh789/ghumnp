import AllPlacesPageClient from "@/components/pages/all-places-page-client";
import { getRecentPlaces } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

const BASE_METADATA = {
  title: "Best Places to Visit in Nepal — Tourist Spots, Food & Hidden Gems | visitNepal77",
  description:
    "Discover the best tourist attractions, local food spots, hotels, cultural sites, and hidden gems across all 77 districts of Nepal. Search and browse thousands of places on visitNepal77.",
  path: "/allplaces",
  keywords: [
    "best places to visit in Nepal",
    "Nepal tourist attractions",
    "places to visit in Nepal",
    "Nepal tourism spots",
    "Nepal local food",
    "Nepal hidden gems",
    "Nepal travel destinations",
    "best tourist places Nepal",
    "Nepal restaurants and hotels",
    "Nepal cultural sites",
    "Nepal adventure spots",
    "visitNepal77 places",
  ],
};

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const hasQuery = Boolean(resolved?.q?.trim());
  return buildMetadata({ ...BASE_METADATA, noIndex: hasQuery });
}

export default async function AllPlacesPage() {
  const places = await getRecentPlaces();

  const schemaItems = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Best Places to Visit in Nepal",
      description:
        "Browse tourist attractions, local food, hotels, and hidden gems across all 77 districts of Nepal.",
      url: `${SITE_URL}/allplaces`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Best Places to Visit in Nepal",
      description:
        "Top-rated tourist attractions, local food spots, hotels, and hidden gems across all 77 districts of Nepal.",
      url: `${SITE_URL}/allplaces`,
      numberOfItems: places.length,
      itemListElement: places.slice(0, 10).map((place, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: place.name,
        url: `${SITE_URL}/place/${place.id}`,
        image: place.image || undefined,
        description: place.description?.slice(0, 120) || undefined,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "All Places", item: `${SITE_URL}/allplaces` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItems) }}
      />
      <AllPlacesPageClient places={places} />
    </>
  );
}
