import { notFound } from "next/navigation";
import PlaceDetailScreen from "@/components/screens/place-detail-screen";
import { places } from "@/data/nepal";
import { getPlaceById } from "@/lib/utils";

export default async function PlaceDetailPage({ params }) {
  const { placeId } = await params;
  const place = getPlaceById(places, placeId);

  if (!place) {
    notFound();
  }

  return <PlaceDetailScreen place={place} />;
}
