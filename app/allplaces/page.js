import AllPlacesPageClient from "@/components/pages/all-places-page-client";
import { getRecentPlaces } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
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
});

export default async function AllPlacesPage() {
  const places = await getRecentPlaces();

  return <AllPlacesPageClient places={places} />;
}
