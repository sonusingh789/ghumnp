import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { getApprovedPlacesByDistrictSlug, getDistrictBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DistrictDetailPage({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);

  if (!district) {
    notFound();
  }

  const districtPlaces = await getApprovedPlacesByDistrictSlug(districtId);

  return <DistrictDetailScreen district={district} districtPlaces={districtPlaces} />;
}
