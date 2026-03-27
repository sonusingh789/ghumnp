import DistrictsPageClient from "@/components/pages/districts-page-client";
import { getAllDistrictNames, getDistrictCards } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "All Districts",
  description:
    "Explore all 77 districts of Nepal with quick access to places, ratings, and travel highlights.",
  path: "/districts",
  keywords: ["Nepal districts", "all districts of Nepal", "Nepal travel districts"],
});

export default async function DistrictsPage() {
  const [allDistricts, districts] = await Promise.all([
    getAllDistrictNames(),
    getDistrictCards(),
  ]);

  return <DistrictsPageClient allDistricts={allDistricts} districts={districts} />;
}
