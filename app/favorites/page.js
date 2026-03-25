import FavoritesPageClient from "@/components/pages/favorites-page-client";
import { getFavoriteCollections } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Favorites - Ghum Nepal",
  description:
    "View your favorite places and districts on Ghum Nepal. Save and organize your travel wishlist.",
  openGraph: {
    title: "My Favorites - Ghum Nepal",
    description:
      "View your favorite places and districts on Ghum Nepal. Save and organize your travel wishlist.",
    url: "https://ghumnepal.com/favorites",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Favorites - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Favorites - Ghum Nepal",
    description:
      "View your favorite places and districts on Ghum Nepal. Save and organize your travel wishlist.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
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
