import { notFound } from "next/navigation";
import PlaceDetailScreen from "@/components/screens/place-detail-screen";
import { getApprovedPlaceBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PlaceDetailPage({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);

  if (!place) {
    notFound();
  }

  return <PlaceDetailScreen place={place} />;
}
