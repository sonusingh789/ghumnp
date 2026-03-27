import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/pages/profile-page-client";
import { getFavoriteCollections, getProfileData, getCurrentUser } from "@/lib/content";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile - visitNepal77",
  description:
    "View and manage your visitNepal77 profile, contributions, reviews, and favorite places.",
  alternates: {
    canonical: "https://visitnepal77.com/profile",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "My Profile - visitNepal77",
    description:
      "View and manage your visitNepal77 profile, contributions, reviews, and favorite places.",
    url: "https://visitnepal77.com/profile",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Profile - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Profile - visitNepal77",
    description:
      "View and manage your visitNepal77 profile, contributions, reviews, and favorite places.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
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
