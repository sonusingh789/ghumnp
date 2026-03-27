import DistrictsPageClient from "@/components/pages/districts-page-client";
import { getDistrictCards } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "All Districts | visitNepal77",
  description:
    "Explore all 77 districts of Nepal with quick access to places, ratings, and travel highlights.",
  path: "/districts",
  keywords: ["Nepal districts", "all districts of Nepal", "Nepal travel districts"],
});

export default async function DistrictsPage() {
  const districts = await getDistrictCards();
  const allDistricts = districts.map((district) => district.name);

  return <DistrictsPageClient allDistricts={allDistricts} districts={districts} />;
}
