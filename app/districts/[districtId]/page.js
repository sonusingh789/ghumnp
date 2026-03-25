import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { getDistrictBySlug, getDistrictListingPlacesByDistrictSlug } from "@/lib/content";

export default async function DistrictDetailPage({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);

  if (!district) {
    notFound();
  }

  const districtPlaces = await getDistrictListingPlacesByDistrictSlug(districtId);

  return <DistrictDetailScreen district={district} districtPlaces={districtPlaces} />;
}
