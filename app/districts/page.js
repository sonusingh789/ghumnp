import DistrictsPageClient from "@/components/pages/districts-page-client";
import { getDistrictCards } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "All 77 Districts of Nepal — Complete Travel Directory | visitNepal77",
  description:
    "Browse all 77 districts of Nepal with places to visit, travel guides, ratings, and local highlights. From Himalayan peaks to the Terai plains — discover the best destinations in every district on visitNepal77.",
  path: "/districts",
  keywords: [
    "all 77 districts of Nepal",
    "Nepal districts list",
    "best districts to visit in Nepal",
    "Nepal travel guide by district",
    "visit Nepal districts",
    "Nepal tourism",
    "Nepal district travel directory",
    "places to visit in Nepal districts",
    "Nepal province districts",
    "visitNepal77 districts",
  ],
});

export default async function DistrictsPage() {
  const districts = await getDistrictCards();
  const allDistricts = districts.map((district) => district.name);

  return <DistrictsPageClient allDistricts={allDistricts} districts={districts} />;
}
