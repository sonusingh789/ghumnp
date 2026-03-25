import HomePageClient from "@/components/pages/home-page-client";
import { getApprovedPlaces, getCurrentUser, getDistrictCards, getProfileData } from "@/lib/content";

export default async function HomePage() {
  const [districts, places, profile, currentUser] = await Promise.all([
    getDistrictCards(),
    getApprovedPlaces(),
    getProfileData(),
    getCurrentUser(),
  ]);

  return (
    <HomePageClient
      featuredDistricts={districts.slice(0, 5)}
      allPlaces={places}
      userProfile={profile.userProfile}
      initialAuthUser={currentUser}
    />
  );
}
