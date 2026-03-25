import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/pages/profile-page-client";
import { getFavoriteCollections, getProfileData, getCurrentUser } from "@/lib/content";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile - Ghum Nepal",
  description:
    "View and manage your Ghum Nepal profile, contributions, reviews, and favorite places.",
  openGraph: {
    title: "My Profile - Ghum Nepal",
    description:
      "View and manage your Ghum Nepal profile, contributions, reviews, and favorite places.",
    url: "https://ghumnepal.com/profile",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Profile - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Profile - Ghum Nepal",
    description:
      "View and manage your Ghum Nepal profile, contributions, reviews, and favorite places.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

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
