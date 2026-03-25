import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/pages/profile-page-client";
import { getFavoriteCollections, getProfileData, getCurrentUser } from "@/lib/content";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginHref("/profile"));
  }

  const [profile, favoriteCollections] = await Promise.all([
    getProfileData(),
    getFavoriteCollections(),
  ]);

  return (
    <ProfilePageClient
      initialProfile={{
        ...profile,
        favoritePlaces: favoriteCollections.favoritePlaces,
        authenticated: true,
      }}
    />
  );
}
