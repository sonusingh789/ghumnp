import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/pages/profile-page-client";
import { getFavoriteCollections, getProfileData, getCurrentUser } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "My Profile",
  description:
    "View and manage your visitNepal77 profile, contributions, reviews, and favorite places.",
  path: "/profile",
  type: "profile",
  noIndex: true,
});

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
