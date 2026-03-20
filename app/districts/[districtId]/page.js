import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { districts, places } from "@/data/nepal";
import { getDistrictById } from "@/lib/utils";

export default async function DistrictDetailPage({ params }) {
  const { districtId } = await params;
  const district = getDistrictById(districts, districtId);

  if (!district) {
    notFound();
  }

  const districtPlaces = places.filter((place) => place.districtId === districtId);

  return <DistrictDetailScreen district={district} districtPlaces={districtPlaces} />;
}
