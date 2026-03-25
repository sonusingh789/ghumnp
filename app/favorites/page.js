import FavoritesPageClient from "@/components/pages/favorites-page-client";
import { getFavoriteCollections } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const favoriteCollections = await getFavoriteCollections();

  return (
    <FavoritesPageClient
      initialFavoritePlaces={favoriteCollections.favoritePlaces}
      initialFavoriteDistricts={favoriteCollections.favoriteDistricts}
    />
  );
}
