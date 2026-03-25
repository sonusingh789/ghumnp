import ExplorePageClient from "@/components/pages/explore-page-client";
import { getDistrictCards, getProvinceNames } from "@/lib/content";

export default async function ExplorePage() {
  const [districts, provinces] = await Promise.all([
    getDistrictCards(),
    getProvinceNames(),
  ]);

  return <ExplorePageClient districts={districts} provinces={provinces} />;
}
