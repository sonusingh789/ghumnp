import FavoritesPageClient from "@/components/pages/favorites-page-client";
import { getFavoriteCollections } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Favorites - visitNepal77",
  description:
    "View your favorite places and districts on visitNepal77. Save and organize your travel wishlist.",
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
  const favoriteCollections = await getFavoriteCollections();

  return (
    <FavoritesPageClient
      initialFavoritePlaces={favoriteCollections.favoritePlaces}
      initialFavoriteDistricts={favoriteCollections.favoriteDistricts}
    />
  );
}
