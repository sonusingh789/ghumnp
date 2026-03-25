import DistrictsPageClient from "@/components/pages/districts-page-client";
import { getAllDistrictNames, getDistrictCards } from "@/lib/content";

export default async function DistrictsPage() {
  const [allDistricts, districts] = await Promise.all([
    getAllDistrictNames(),
    getDistrictCards(),
  ]);

  return <DistrictsPageClient allDistricts={allDistricts} districts={districts} />;
}
