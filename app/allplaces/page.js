import AllPlacesPageClient from "@/components/pages/all-places-page-client";
import { getRecentPlaces } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "All Places",
  description:
    "Browse recent approved places across Nepal and search attractions, local food spots, stays, and hidden corners.",
  path: "/allplaces",
});

export default async function AllPlacesPage() {
  const places = await getRecentPlaces();

  return <AllPlacesPageClient places={places} />;
}
