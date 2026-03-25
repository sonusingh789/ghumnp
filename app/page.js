import HomePageClient from "@/components/pages/home-page-client";
import { getApprovedPlaces, getDistrictCards } from "@/lib/content";

export default async function HomePage() {
  const [districts, places] = await Promise.all([
    getDistrictCards(),
    getApprovedPlaces(),
  ]);

  const userProfile = {
    name: "Traveler",
    avatar: "https://i.pravatar.cc/160?img=14",
  };

  return (
    <HomePageClient
      featuredDistricts={districts.slice(0, 5)}
      allPlaces={places}
      userProfile={userProfile}
      initialAuthUser={null}
    />
  );
}
