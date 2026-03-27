import { redirect } from "next/navigation";
import FavoritesPageClient from "@/components/pages/favorites-page-client";
import { getApprovedPlacesBySlugs, getCurrentUser, getFavoriteCollections } from "@/lib/content";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Favorites - visitNepal77",
  description:
    "View your favorite places and districts on visitNepal77. Save and organize your travel wishlist.",
  alternates: {
    canonical: "https://visitnepal77.com/favorites",
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
    title: "My Favorites - visitNepal77",
    description:
      "View your favorite places and districts on visitNepal77. Save and organize your travel wishlist.",
    url: "https://visitnepal77.com/favorites",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Favorites - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Favorites - visitNepal77",
    description:
      "View your favorite places and districts on visitNepal77. Save and organize your travel wishlist.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginHref("/favorites"));
  }

  const [favoriteCollections, suggestions] = await Promise.all([
    getFavoriteCollections(),
    getApprovedPlacesBySlugs(["pashupatinath", "boudhanath", "phewa-lake"]),
  ]);

  return (
    <FavoritesPageClient
      initialFavoritePlaces={favoriteCollections.favoritePlaces}
      initialFavoriteDistricts={favoriteCollections.favoriteDistricts}
      initialSuggestions={suggestions}
    />
  );
}
